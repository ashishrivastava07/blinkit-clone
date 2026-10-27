-- Phase 2: Supabase is the authoritative application database.
create extension if not exists pgcrypto;

create type public.app_role as enum ('customer', 'shopkeeper', 'delivery_agent', 'admin');
create type public.shop_member_role as enum ('owner', 'manager', 'catalog_manager', 'fulfillment_staff');
create type public.account_status as enum ('active', 'suspended', 'inactive');
create type public.shop_status as enum ('active', 'inactive', 'suspended');
create type public.approval_status as enum ('pending', 'approved', 'rejected');
create type public.order_status as enum (
  'pending_payment', 'placed', 'accepted', 'preparing', 'ready_for_pickup',
  'assigned', 'picked_up', 'out_for_delivery', 'delivered', 'cancelled', 'rejected', 'failed'
);
create type public.payment_status as enum ('pending', 'authorized', 'paid', 'failed', 'refunded', 'cancelled');
create type public.delivery_availability_status as enum ('offline', 'available', 'busy', 'suspended');
create type public.delivery_assignment_status as enum ('assigned', 'accepted', 'picked_up', 'out_for_delivery', 'delivered', 'cancelled');
create type public.coupon_discount_type as enum ('percentage', 'fixed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  phone text,
  status public.account_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table public.shops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  address text not null,
  phone text,
  status public.shop_status not null default 'inactive',
  approval_status public.approval_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.shop_members (
  shop_id uuid not null references public.shops(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.shop_member_role not null default 'owner',
  created_at timestamptz not null default now(),
  primary key (shop_id, user_id)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_slug_format check (slug = lower(slug) and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete restrict,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text,
  brand text,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  sku text not null unique,
  price numeric(12,2) not null check (price >= 0),
  discount_price numeric(12,2) check (discount_price >= 0 and discount_price <= price),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inventory (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  reserved_quantity integer not null default 0 check (reserved_quantity >= 0 and reserved_quantity <= stock_quantity),
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),
  updated_at timestamptz not null default now(),
  unique (shop_id, variant_id)
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text not null,
  address_line text not null,
  city text not null,
  state text,
  postal_code text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint addresses_latitude check (latitude is null or latitude between -90 and 90),
  constraint addresses_longitude check (longitude is null or longitude between -180 and 180)
);
create unique index addresses_one_default_per_user on public.addresses (user_id) where is_default;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete restrict,
  shop_id uuid not null references public.shops(id) on delete restrict,
  address_id uuid not null references public.addresses(id) on delete restrict,
  subtotal numeric(12,2) not null check (subtotal >= 0),
  delivery_fee numeric(12,2) not null check (delivery_fee >= 0),
  discount numeric(12,2) not null default 0 check (discount >= 0),
  total_amount numeric(12,2) not null check (total_amount >= 0),
  payment_status public.payment_status not null default 'pending',
  order_status public.order_status not null default 'placed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_total_matches_components check (total_amount = subtotal + delivery_fee - discount)
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name_snapshot text not null,
  variant_name_snapshot text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  total_price numeric(12,2) not null check (total_price >= 0),
  created_at timestamptz not null default now(),
  constraint order_items_total_matches check (total_price = unit_price * quantity)
);

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status public.order_status not null,
  changed_by uuid references public.profiles(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  payment_provider text not null default 'placeholder',
  provider_payment_id text unique,
  amount numeric(12,2) not null check (amount >= 0),
  status public.payment_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.delivery_agents (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  availability_status public.delivery_availability_status not null default 'offline',
  current_latitude numeric(9,6),
  current_longitude numeric(9,6),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint delivery_agents_latitude check (current_latitude is null or current_latitude between -90 and 90),
  constraint delivery_agents_longitude check (current_longitude is null or current_longitude between -180 and 180)
);

create table public.delivery_assignments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  delivery_agent_id uuid not null references public.delivery_agents(user_id) on delete restrict,
  status public.delivery_assignment_status not null default 'assigned',
  assigned_at timestamptz not null default now(),
  accepted_at timestamptz,
  picked_up_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.delivery_location_events (
  id uuid primary key default gen_random_uuid(),
  delivery_assignment_id uuid not null references public.delivery_assignments(id) on delete cascade,
  latitude numeric(9,6) not null check (latitude between -90 and 90),
  longitude numeric(9,6) not null check (longitude between -180 and 180),
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type public.coupon_discount_type not null,
  discount_value numeric(12,2) not null check (discount_value > 0),
  minimum_order_value numeric(12,2) not null default 0 check (minimum_order_value >= 0),
  max_discount numeric(12,2) check (max_discount is null or max_discount >= 0),
  starts_at timestamptz,
  expires_at timestamptz,
  usage_limit integer check (usage_limit is null or usage_limit > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint coupons_percentage_range check (discount_type <> 'percentage' or discount_value <= 100),
  constraint coupons_date_range check (expires_at is null or starts_at is null or expires_at > starts_at)
);

create table public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete restrict,
  order_id uuid not null unique references public.orders(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (coupon_id, user_id)
);

create index products_shop_id_idx on public.products(shop_id);
create index product_variants_product_id_idx on public.product_variants(product_id);
create index inventory_shop_id_idx on public.inventory(shop_id);
create index orders_customer_id_idx on public.orders(customer_id, created_at desc);
create index orders_shop_id_idx on public.orders(shop_id, created_at desc);
create index order_items_order_id_idx on public.order_items(order_id);
create index order_status_history_order_id_idx on public.order_status_history(order_id, created_at);
create index delivery_assignments_agent_idx on public.delivery_assignments(delivery_agent_id, created_at desc);
create index delivery_location_events_assignment_idx on public.delivery_location_events(delivery_assignment_id, created_at desc);

create function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

create function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, phone)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', new.email), new.phone)
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'customer') on conflict do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create trigger profiles_set_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
create trigger shops_set_updated_at before update on public.shops for each row execute procedure public.set_updated_at();
create trigger categories_set_updated_at before update on public.categories for each row execute procedure public.set_updated_at();
create trigger products_set_updated_at before update on public.products for each row execute procedure public.set_updated_at();
create trigger variants_set_updated_at before update on public.product_variants for each row execute procedure public.set_updated_at();
create trigger inventory_set_updated_at before update on public.inventory for each row execute procedure public.set_updated_at();
create trigger addresses_set_updated_at before update on public.addresses for each row execute procedure public.set_updated_at();
create trigger orders_set_updated_at before update on public.orders for each row execute procedure public.set_updated_at();
create trigger payments_set_updated_at before update on public.payments for each row execute procedure public.set_updated_at();
create trigger delivery_agents_set_updated_at before update on public.delivery_agents for each row execute procedure public.set_updated_at();
create trigger delivery_assignments_set_updated_at before update on public.delivery_assignments for each row execute procedure public.set_updated_at();

-- SECURITY DEFINER helpers are intentionally narrow and are used by RLS policies to avoid recursion.
create function public.has_role(p_role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = (select auth.uid()) and role = p_role);
$$;

create function public.is_shop_member(p_shop_id uuid, p_roles public.shop_member_role[] default null)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.shop_members
    where shop_id = p_shop_id and user_id = (select auth.uid())
      and (p_roles is null or role = any(p_roles))
  );
$$;

create function public.is_assigned_delivery_agent(p_order_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.delivery_assignments
    where order_id = p_order_id and delivery_agent_id = (select auth.uid())
  );
$$;

create function public.place_order(p_shop_id uuid, p_address_id uuid, p_items jsonb, p_coupon_code text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_customer_id uuid := auth.uid();
  v_order_id uuid := gen_random_uuid();
  v_item record;
  v_inventory record;
  v_subtotal numeric(12,2) := 0;
  v_product_discount numeric(12,2) := 0;
  v_coupon_discount numeric(12,2) := 0;
  v_delivery_fee numeric(12,2);
  v_coupon public.coupons%rowtype;
  v_unit_price numeric(12,2);
  v_item_count integer;
begin
  if v_customer_id is null or not public.has_role('customer') then raise exception 'Customer authentication is required'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception 'Order items are required'; end if;
  select count(*) into v_item_count from jsonb_to_recordset(p_items) as x(variant_id uuid, quantity integer);
  if v_item_count <> jsonb_array_length(p_items) then raise exception 'Each order item must include a variant_id and quantity'; end if;
  if exists (select 1 from jsonb_to_recordset(p_items) as x(variant_id uuid, quantity integer) where variant_id is null or quantity is null or quantity <= 0) then
    raise exception 'Each order item must have a positive quantity';
  end if;
  if not exists (select 1 from public.addresses where id = p_address_id and user_id = v_customer_id) then raise exception 'The selected address does not belong to the customer'; end if;
  if not exists (select 1 from public.shops where id = p_shop_id and status = 'active' and approval_status = 'approved') then raise exception 'The selected shop is unavailable'; end if;
  if (select count(distinct variant_id) from jsonb_to_recordset(p_items) as x(variant_id uuid, quantity integer)) <> v_item_count then
    raise exception 'Each variant may appear only once in an order';
  end if;

  -- The parent is created inside this transaction before its items. It is updated
  -- with server-calculated totals only after every inventory row is locked.
  insert into public.orders (id, customer_id, shop_id, address_id, subtotal, delivery_fee, discount, total_amount, payment_status, order_status)
  values (v_order_id, v_customer_id, p_shop_id, p_address_id, 0, 0, 0, 0, 'pending', 'placed');

  for v_item in select * from jsonb_to_recordset(p_items) as x(variant_id uuid, quantity integer) loop
    select i.id, i.stock_quantity, i.reserved_quantity, pv.id as variant_id, pv.name as variant_name, pv.price,
           pv.discount_price, p.name as product_name
      into v_inventory
      from public.inventory i
      join public.product_variants pv on pv.id = i.variant_id and pv.is_active
      join public.products p on p.id = pv.product_id and p.is_active
     where i.shop_id = p_shop_id and i.variant_id = v_item.variant_id
     for update of i;
    if not found then raise exception 'Variant % is unavailable from this shop', v_item.variant_id; end if;
    if v_inventory.stock_quantity - v_inventory.reserved_quantity < v_item.quantity then raise exception 'Insufficient stock for variant %', v_item.variant_id; end if;
    v_unit_price := coalesce(v_inventory.discount_price, v_inventory.price);
    v_subtotal := v_subtotal + (v_inventory.price * v_item.quantity);
    v_product_discount := v_product_discount + ((v_inventory.price - v_unit_price) * v_item.quantity);
    update public.inventory set reserved_quantity = reserved_quantity + v_item.quantity where id = v_inventory.id;
    insert into public.order_items (order_id, variant_id, product_name_snapshot, variant_name_snapshot, quantity, unit_price, total_price)
    values (v_order_id, v_inventory.variant_id, v_inventory.product_name, v_inventory.variant_name, v_item.quantity, v_unit_price, v_unit_price * v_item.quantity);
  end loop;

  if p_coupon_code is not null and btrim(p_coupon_code) <> '' then
    select * into v_coupon from public.coupons
     where code = upper(btrim(p_coupon_code)) and is_active
       and (starts_at is null or starts_at <= now()) and (expires_at is null or expires_at > now())
     for update;
    if not found or (v_subtotal - v_product_discount) < v_coupon.minimum_order_value then raise exception 'Coupon is invalid or does not meet its minimum order value'; end if;
    if exists (select 1 from public.coupon_redemptions where coupon_id = v_coupon.id and user_id = v_customer_id) then raise exception 'Coupon has already been redeemed'; end if;
    if v_coupon.usage_limit is not null and (select count(*) from public.coupon_redemptions where coupon_id = v_coupon.id) >= v_coupon.usage_limit then raise exception 'Coupon usage limit reached'; end if;
    v_coupon_discount := case when v_coupon.discount_type = 'percentage' then round((v_subtotal - v_product_discount) * v_coupon.discount_value / 100, 2) else v_coupon.discount_value end;
    v_coupon_discount := least(v_coupon_discount, coalesce(v_coupon.max_discount, v_coupon_discount), v_subtotal - v_product_discount);
  end if;
  v_delivery_fee := case when (v_subtotal - v_product_discount) >= 199 then 0 else 25 end;

  update public.orders set subtotal = v_subtotal, delivery_fee = v_delivery_fee, discount = v_product_discount + v_coupon_discount, total_amount = v_subtotal + v_delivery_fee - v_product_discount - v_coupon_discount where id = v_order_id;
  if v_coupon.id is not null then insert into public.coupon_redemptions (coupon_id, user_id, order_id) values (v_coupon.id, v_customer_id, v_order_id); end if;
  insert into public.payments (order_id, amount, status) values (v_order_id, v_subtotal + v_delivery_fee - v_product_discount - v_coupon_discount, 'pending');
  insert into public.order_status_history (order_id, status, changed_by, note) values (v_order_id, 'placed', v_customer_id, 'Order placed');
  insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata) values (v_customer_id, 'order.placed', 'order', v_order_id, jsonb_build_object('shop_id', p_shop_id));
  return v_order_id;
end;
$$;

create function public.transition_order_status(p_order_id uuid, p_next_status public.order_status, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
declare v_actor uuid := auth.uid(); v_order public.orders%rowtype; v_is_admin boolean; v_is_shopkeeper boolean; v_is_agent boolean; begin
  if v_actor is null then raise exception 'Authentication is required'; end if;
  select * into v_order from public.orders where id = p_order_id for update; if not found then raise exception 'Order not found'; end if;
  v_is_admin := public.has_role('admin');
  v_is_shopkeeper := public.is_shop_member(v_order.shop_id, array['owner','manager','fulfillment_staff']::public.shop_member_role[]);
  v_is_agent := public.is_assigned_delivery_agent(p_order_id);
  if not (
    (v_order.customer_id = v_actor and v_order.order_status = 'placed' and p_next_status = 'cancelled') or
    (v_is_shopkeeper and ((v_order.order_status = 'placed' and p_next_status in ('accepted','rejected')) or (v_order.order_status = 'accepted' and p_next_status = 'preparing') or (v_order.order_status = 'preparing' and p_next_status = 'ready_for_pickup'))) or
    (v_is_agent and ((v_order.order_status = 'assigned' and p_next_status = 'picked_up') or (v_order.order_status = 'picked_up' and p_next_status = 'out_for_delivery') or (v_order.order_status = 'out_for_delivery' and p_next_status = 'delivered'))) or
    (v_is_admin and v_order.order_status not in ('delivered','cancelled','rejected','failed') and p_next_status in ('cancelled','failed'))
  ) then raise exception 'Invalid order transition'; end if;
  update public.orders set order_status = p_next_status where id = p_order_id;
  if v_is_agent then update public.delivery_assignments set status = case p_next_status when 'picked_up' then 'picked_up' when 'out_for_delivery' then 'out_for_delivery' when 'delivered' then 'delivered' else status end, picked_up_at = case when p_next_status = 'picked_up' then now() else picked_up_at end, delivered_at = case when p_next_status = 'delivered' then now() else delivered_at end where order_id = p_order_id; end if;
  insert into public.order_status_history (order_id, status, changed_by, note) values (p_order_id, p_next_status, v_actor, p_note);
  insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata) values (v_actor, 'order.status_changed', 'order', p_order_id, jsonb_build_object('status', p_next_status));
end;
$$;

create function public.assign_delivery_agent(p_order_id uuid, p_delivery_agent_id uuid, p_note text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_actor uuid := auth.uid(); v_assignment_id uuid; begin
  if v_actor is null or not public.has_role('admin') then raise exception 'Admin authorization is required'; end if;
  if not exists (select 1 from public.orders where id = p_order_id and order_status in ('ready_for_pickup','assigned')) then raise exception 'Order cannot be assigned'; end if;
  if not exists (select 1 from public.delivery_agents da join public.user_roles ur on ur.user_id = da.user_id and ur.role = 'delivery_agent' where da.user_id = p_delivery_agent_id and da.availability_status in ('available','busy')) then raise exception 'Delivery agent is unavailable'; end if;
  insert into public.delivery_assignments (order_id, delivery_agent_id, status) values (p_order_id, p_delivery_agent_id, 'assigned') on conflict (order_id) do update set delivery_agent_id = excluded.delivery_agent_id, status = 'assigned', assigned_at = now(), accepted_at = null, picked_up_at = null, delivered_at = null returning id into v_assignment_id;
  update public.orders set order_status = 'assigned' where id = p_order_id;
  insert into public.order_status_history (order_id, status, changed_by, note) values (p_order_id, 'assigned', v_actor, p_note);
  insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata) values (v_actor, 'delivery.assigned', 'delivery_assignment', v_assignment_id, jsonb_build_object('order_id', p_order_id, 'delivery_agent_id', p_delivery_agent_id));
  return v_assignment_id;
end;
$$;

create function public.update_shop_details(p_shop_id uuid, p_name text, p_description text, p_address text, p_phone text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or not public.is_shop_member(p_shop_id, array['owner','manager']::public.shop_member_role[]) then
    raise exception 'Shop manager authorization is required';
  end if;
  if nullif(btrim(p_name), '') is null or nullif(btrim(p_address), '') is null then
    raise exception 'Shop name and address are required';
  end if;
  update public.shops
     set name = btrim(p_name), description = nullif(btrim(p_description), ''), address = btrim(p_address), phone = nullif(btrim(p_phone), '')
   where id = p_shop_id;
  insert into public.audit_logs (actor_id, action, entity_type, entity_id)
  values (auth.uid(), 'shop.details_updated', 'shop', p_shop_id);
end;
$$;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.shops enable row level security;
alter table public.shop_members enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.inventory enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.payments enable row level security;
alter table public.delivery_agents enable row level security;
alter table public.delivery_assignments enable row level security;
alter table public.delivery_location_events enable row level security;
alter table public.audit_logs enable row level security;
alter table public.coupons enable row level security;
alter table public.coupon_redemptions enable row level security;

create policy profiles_select on public.profiles for select to authenticated using (id = (select auth.uid()) or public.has_role('admin'));
create policy profiles_update on public.profiles for update to authenticated using (id = (select auth.uid()) or public.has_role('admin')) with check (id = (select auth.uid()) or public.has_role('admin'));
create policy roles_select on public.user_roles for select to authenticated using (user_id = (select auth.uid()) or public.has_role('admin'));
create policy roles_admin_manage on public.user_roles for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));
create policy shops_catalog_select on public.shops for select to authenticated using ((status = 'active' and approval_status = 'approved') or public.is_shop_member(id) or public.has_role('admin'));
create policy shops_admin_manage on public.shops for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));
create policy members_select on public.shop_members for select to authenticated using (public.is_shop_member(shop_id) or public.has_role('admin'));
create policy members_admin_manage on public.shop_members for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));
create policy categories_select on public.categories for select to authenticated using (is_active or public.has_role('admin'));
create policy categories_admin_manage on public.categories for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));
create policy products_select on public.products for select to authenticated using ((is_active and exists (select 1 from public.shops s where s.id = shop_id and s.status = 'active' and s.approval_status = 'approved')) or public.is_shop_member(shop_id) or public.has_role('admin'));
create policy products_member_manage on public.products for all to authenticated using (public.is_shop_member(shop_id, array['owner','manager','catalog_manager']::public.shop_member_role[]) or public.has_role('admin')) with check (public.is_shop_member(shop_id, array['owner','manager','catalog_manager']::public.shop_member_role[]) or public.has_role('admin'));
create policy variants_select on public.product_variants for select to authenticated using (exists (select 1 from public.products p where p.id = product_id and ((p.is_active and exists (select 1 from public.shops s where s.id = p.shop_id and s.status = 'active' and s.approval_status = 'approved')) or public.is_shop_member(p.shop_id) or public.has_role('admin'))));
create policy variants_member_manage on public.product_variants for all to authenticated using (exists (select 1 from public.products p where p.id = product_id and (public.is_shop_member(p.shop_id, array['owner','manager','catalog_manager']::public.shop_member_role[]) or public.has_role('admin')))) with check (exists (select 1 from public.products p where p.id = product_id and (public.is_shop_member(p.shop_id, array['owner','manager','catalog_manager']::public.shop_member_role[]) or public.has_role('admin'))));
create policy inventory_member_select on public.inventory for select to authenticated using (public.is_shop_member(shop_id) or public.has_role('admin'));
create policy inventory_member_manage on public.inventory for all to authenticated using (public.is_shop_member(shop_id, array['owner','manager','catalog_manager']::public.shop_member_role[]) or public.has_role('admin')) with check (public.is_shop_member(shop_id, array['owner','manager','catalog_manager']::public.shop_member_role[]) or public.has_role('admin'));
create policy addresses_select on public.addresses for select to authenticated using (user_id = (select auth.uid()) or public.is_assigned_delivery_agent((select o.id from public.orders o where o.address_id = addresses.id limit 1)) or public.has_role('admin'));
create policy addresses_customer_manage on public.addresses for all to authenticated using (user_id = (select auth.uid()) or public.has_role('admin')) with check (user_id = (select auth.uid()) or public.has_role('admin'));
create policy orders_select on public.orders for select to authenticated using (customer_id = (select auth.uid()) or public.is_shop_member(shop_id) or public.is_assigned_delivery_agent(id) or public.has_role('admin'));
create policy order_items_select on public.order_items for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and (o.customer_id = (select auth.uid()) or public.is_shop_member(o.shop_id) or public.is_assigned_delivery_agent(o.id) or public.has_role('admin'))));
create policy order_history_select on public.order_status_history for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and (o.customer_id = (select auth.uid()) or public.is_shop_member(o.shop_id) or public.is_assigned_delivery_agent(o.id) or public.has_role('admin'))));
create policy payments_select on public.payments for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and (o.customer_id = (select auth.uid()) or public.has_role('admin'))));
create policy agents_select_self_or_admin on public.delivery_agents for select to authenticated using (user_id = (select auth.uid()) or public.has_role('admin'));
create policy agents_update_self_or_admin on public.delivery_agents for update to authenticated using (user_id = (select auth.uid()) or public.has_role('admin')) with check (user_id = (select auth.uid()) or public.has_role('admin'));
create policy assignments_select on public.delivery_assignments for select to authenticated using (delivery_agent_id = (select auth.uid()) or public.has_role('admin'));
create policy locations_select on public.delivery_location_events for select to authenticated using (exists (select 1 from public.delivery_assignments da where da.id = delivery_assignment_id and (da.delivery_agent_id = (select auth.uid()) or public.has_role('admin'))));
create policy locations_agent_insert on public.delivery_location_events for insert to authenticated with check (exists (select 1 from public.delivery_assignments da where da.id = delivery_assignment_id and da.delivery_agent_id = (select auth.uid())));
create policy audit_admin_select on public.audit_logs for select to authenticated using (public.has_role('admin'));
create policy coupons_select on public.coupons for select to authenticated using (is_active or public.has_role('admin'));
create policy coupons_admin_manage on public.coupons for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));
create policy coupon_redemptions_select on public.coupon_redemptions for select to authenticated using (user_id = (select auth.uid()) or public.has_role('admin'));

revoke all on function public.has_role(public.app_role), public.is_shop_member(uuid, public.shop_member_role[]), public.is_assigned_delivery_agent(uuid), public.place_order(uuid, uuid, jsonb, text), public.transition_order_status(uuid, public.order_status, text), public.assign_delivery_agent(uuid, uuid, text), public.update_shop_details(uuid, text, text, text, text) from public;
grant execute on function public.has_role(public.app_role), public.is_shop_member(uuid, public.shop_member_role[]), public.is_assigned_delivery_agent(uuid), public.place_order(uuid, uuid, jsonb, text), public.transition_order_status(uuid, public.order_status, text), public.assign_delivery_agent(uuid, uuid, text), public.update_shop_details(uuid, text, text, text, text) to authenticated;

do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.orders, public.order_status_history, public.delivery_assignments, public.inventory;
  end if;
end $$;
