-- Persistent authenticated carts, atomic delivery claiming, and hardening.
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  shop_id uuid references public.shops(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(cart_id, variant_id)
);
create index if not exists cart_items_variant_id_idx on public.cart_items(variant_id);
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
create policy carts_owner_manage on public.carts for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy cart_items_owner_manage on public.cart_items for all to authenticated using (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = (select auth.uid()))) with check (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = (select auth.uid())));

create or replace function public.claim_delivery(p_order_id uuid, p_note text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_agent uuid := auth.uid(); v_assignment uuid;
begin
  if v_agent is null or not public.has_role('delivery_agent') then raise exception 'Delivery agent authorization is required'; end if;
  if not exists (select 1 from public.delivery_agents where user_id = v_agent and availability_status = 'available') then raise exception 'Delivery agent is unavailable'; end if;
  perform 1 from public.orders where id = p_order_id and order_status = 'ready_for_pickup' for update;
  if not found then raise exception 'Order is not available for delivery'; end if;
  insert into public.delivery_assignments(order_id, delivery_agent_id, status, accepted_at) values (p_order_id, v_agent, 'assigned', now()) returning id into v_assignment;
  update public.orders set order_status = 'assigned' where id = p_order_id;
  update public.delivery_agents set availability_status = 'busy' where user_id = v_agent;
  insert into public.order_status_history(order_id, status, changed_by, note) values (p_order_id, 'assigned', v_agent, p_note);
  insert into public.audit_logs(actor_id, action, entity_type, entity_id, metadata) values (v_agent, 'delivery.claimed', 'delivery_assignment', v_assignment, jsonb_build_object('order_id', p_order_id));
  return v_assignment;
exception when unique_violation then raise exception 'Another delivery agent has already claimed this order';
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.claim_delivery(uuid, text) from public;
grant execute on function public.claim_delivery(uuid, text) to authenticated;
create index if not exists audit_logs_actor_id_idx on public.audit_logs(actor_id);
create index if not exists coupon_redemptions_user_id_idx on public.coupon_redemptions(user_id);
create index if not exists inventory_variant_id_idx on public.inventory(variant_id);
create index if not exists order_items_variant_id_idx on public.order_items(variant_id);
create index if not exists order_status_history_changed_by_idx on public.order_status_history(changed_by);
create index if not exists orders_address_id_idx on public.orders(address_id);
create index if not exists payments_order_id_idx on public.payments(order_id);
create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists shop_members_user_id_idx on public.shop_members(user_id);
