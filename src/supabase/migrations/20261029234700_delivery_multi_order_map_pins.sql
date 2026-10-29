-- Allow delivery agents to carry multiple assignments and retain confirmed map pins.
alter table public.addresses
  add column if not exists latitude numeric(9,6),
  add column if not exists longitude numeric(9,6);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'addresses_delivery_coordinates_check'
      and conrelid = 'public.addresses'::regclass
  ) then
    alter table public.addresses
      add constraint addresses_delivery_coordinates_check check (
        (latitude is null and longitude is null)
        or (
          latitude between -90 and 90
          and longitude between -180 and 180
        )
      );
  end if;
end;
$$;

-- Repair agents left busy after a previous delivery was completed.
update public.delivery_agents da
set availability_status = 'available', updated_at = now()
where da.availability_status = 'busy'
  and not exists (
    select 1
    from public.delivery_assignments assignment
    join public.orders o on o.id = assignment.order_id
    where assignment.delivery_agent_id = da.user_id
      and o.order_status in ('assigned', 'picked_up', 'out_for_delivery')
  );

create or replace function public.claim_delivery(p_order_id uuid, p_note text default null)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_agent uuid := auth.uid();
  v_assignment uuid;
  v_availability public.delivery_availability_status;
begin
  if v_agent is null or not public.has_role('delivery_agent') then
    raise exception 'Delivery agent authorization is required';
  end if;

  select availability_status into v_availability
  from public.delivery_agents
  where user_id = v_agent
  for update;
  if not found then
    raise exception 'Delivery-agent profile was not found';
  end if;
  if v_availability not in ('available', 'busy') then
    raise exception 'Delivery agent must be online to claim orders';
  end if;

  perform 1
  from public.orders
  where id = p_order_id and order_status = 'ready_for_pickup'
  for update;
  if not found then
    raise exception 'Order is not available for delivery';
  end if;

  insert into public.delivery_assignments(order_id, delivery_agent_id, status, accepted_at)
  values (p_order_id, v_agent, 'assigned', now())
  returning id into v_assignment;

  update public.orders set order_status = 'assigned' where id = p_order_id;
  update public.delivery_agents
  set availability_status = 'busy', updated_at = now()
  where user_id = v_agent;
  insert into public.order_status_history(order_id, status, changed_by, note)
  values (p_order_id, 'assigned', v_agent, p_note);
  insert into public.audit_logs(actor_id, action, entity_type, entity_id, metadata)
  values (v_agent, 'delivery.claimed', 'delivery_assignment', v_assignment, jsonb_build_object('order_id', p_order_id));
  return v_assignment;
exception
  when unique_violation then
    raise exception 'Another delivery agent has already claimed this order';
end;
$$;

revoke all on function public.claim_delivery(uuid, text) from public;
grant execute on function public.claim_delivery(uuid, text) to authenticated;

drop function if exists public.available_delivery_orders();
create function public.available_delivery_orders()
returns table(
  order_id uuid,
  order_status public.order_status,
  address_label text,
  address_line text,
  city text,
  state text,
  postal_code text,
  latitude numeric,
  longitude numeric,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null or not public.has_role('delivery_agent') then
    raise exception 'Delivery agent authorization is required';
  end if;
  if not exists (
    select 1 from public.delivery_agents
    where user_id = auth.uid() and availability_status in ('available', 'busy')
  ) then
    raise exception 'Delivery agent is unavailable';
  end if;
  return query
  select o.id, o.order_status, a.label, a.address_line, a.city, a.state, a.postal_code,
         a.latitude, a.longitude, o.created_at
  from public.orders o
  join public.addresses a on a.id = o.address_id
  where o.order_status = 'ready_for_pickup'
    and not exists (
      select 1 from public.delivery_assignments assignment where assignment.order_id = o.id
    )
  order by o.created_at asc;
end;
$$;

drop function if exists public.my_delivery_orders();
create function public.my_delivery_orders()
returns table(
  order_id uuid,
  order_status public.order_status,
  address_label text,
  address_line text,
  city text,
  state text,
  postal_code text,
  latitude numeric,
  longitude numeric,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null or not public.has_role('delivery_agent') then
    raise exception 'Delivery agent authorization is required';
  end if;
  return query
  select o.id, o.order_status, a.label, a.address_line, a.city, a.state, a.postal_code,
         a.latitude, a.longitude, o.created_at
  from public.orders o
  join public.addresses a on a.id = o.address_id
  join public.delivery_assignments assignment
    on assignment.order_id = o.id and assignment.delivery_agent_id = auth.uid()
  order by o.created_at desc;
end;
$$;

revoke all on function public.available_delivery_orders(), public.my_delivery_orders() from public;
grant execute on function public.available_delivery_orders(), public.my_delivery_orders() to authenticated;

create or replace function public.transition_order_status(
  p_order_id uuid,
  p_next_status public.order_status,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor uuid := auth.uid();
  v_order public.orders%rowtype;
  v_is_admin boolean;
  v_is_shopkeeper boolean;
  v_is_agent boolean;
begin
  if v_actor is null then
    raise exception 'Authentication is required';
  end if;
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'Order not found';
  end if;
  v_is_admin := public.has_role('admin');
  v_is_shopkeeper := public.is_shop_member(
    v_order.shop_id,
    array['owner','manager','fulfillment_staff']::public.shop_member_role[]
  );
  v_is_agent := public.is_assigned_delivery_agent(p_order_id);
  if not (
    (v_order.customer_id = v_actor and v_order.order_status = 'placed' and p_next_status = 'cancelled')
    or (v_is_shopkeeper and (
      (v_order.order_status = 'placed' and p_next_status in ('accepted','rejected'))
      or (v_order.order_status = 'accepted' and p_next_status = 'preparing')
      or (v_order.order_status = 'preparing' and p_next_status = 'ready_for_pickup')
    ))
    or (v_is_agent and (
      (v_order.order_status = 'assigned' and p_next_status = 'picked_up')
      or (v_order.order_status = 'picked_up' and p_next_status = 'out_for_delivery')
      or (v_order.order_status = 'out_for_delivery' and p_next_status = 'delivered')
    ))
    or (v_is_admin and v_order.order_status not in ('delivered','cancelled','rejected','failed')
      and p_next_status in ('cancelled','failed'))
  ) then
    raise exception 'Invalid order transition';
  end if;

  update public.orders set order_status = p_next_status where id = p_order_id;
  if v_is_agent then
    update public.delivery_assignments
    set status = case p_next_status
        when 'picked_up' then 'picked_up'
        when 'out_for_delivery' then 'out_for_delivery'
        when 'delivered' then 'delivered'
        else status
      end,
      picked_up_at = case when p_next_status = 'picked_up' then now() else picked_up_at end,
      delivered_at = case when p_next_status = 'delivered' then now() else delivered_at end
    where order_id = p_order_id;

    if p_next_status = 'delivered' then
      update public.delivery_agents
      set availability_status = case
          when exists (
            select 1
            from public.delivery_assignments assignment
            join public.orders o on o.id = assignment.order_id
            where assignment.delivery_agent_id = v_actor
              and o.order_status in ('assigned', 'picked_up', 'out_for_delivery')
          ) then 'busy'::public.delivery_availability_status
          else 'available'::public.delivery_availability_status
        end,
        updated_at = now()
      where user_id = v_actor;
    end if;
  end if;

  insert into public.order_status_history(order_id, status, changed_by, note)
  values (p_order_id, p_next_status, v_actor, p_note);
  insert into public.audit_logs(actor_id, action, entity_type, entity_id, metadata)
  values (v_actor, 'order.status_changed', 'order', p_order_id, jsonb_build_object('status', p_next_status));
end;
$$;

revoke all on function public.transition_order_status(uuid, public.order_status, text) from public;
grant execute on function public.transition_order_status(uuid, public.order_status, text) to authenticated;
