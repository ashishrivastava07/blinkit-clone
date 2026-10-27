-- Trusted provisioning only: the account must already exist in auth.users.
insert into public.user_roles(user_id, role)
select id, 'delivery_agent'::public.app_role from auth.users
where lower(email) = 'itzmedamon@gmail.com'
on conflict do nothing;

insert into public.delivery_agents(user_id, availability_status)
select id, 'available'::public.delivery_availability_status from auth.users
where lower(email) = 'itzmedamon@gmail.com'
on conflict (user_id) do update set availability_status = 'available';

-- An available agent sees only minimal pickup task data before claiming it.
create or replace function public.available_delivery_orders()
returns table(order_id uuid, shop_name text, shop_address text, total_amount numeric, created_at timestamptz)
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or not public.has_role('delivery_agent') then
    raise exception 'Delivery agent authorization is required';
  end if;
  if not exists (select 1 from public.delivery_agents where user_id = auth.uid() and availability_status = 'available') then
    raise exception 'Delivery agent is unavailable';
  end if;
  return query
  select o.id, s.name, s.address, o.total_amount, o.created_at
  from public.orders o join public.shops s on s.id = o.shop_id
  where o.order_status = 'ready_for_pickup'
    and not exists (select 1 from public.delivery_assignments da where da.order_id = o.id)
  order by o.created_at asc;
end;
$$;

revoke all on function public.available_delivery_orders() from public;
grant execute on function public.available_delivery_orders() to authenticated;
