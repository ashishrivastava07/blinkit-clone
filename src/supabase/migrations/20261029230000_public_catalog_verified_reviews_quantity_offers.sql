-- Allow public storefront browsing, require a delivered purchase for reviews,
-- and support shopkeeper-configured quantity price tiers.

create or replace function public.is_public_product(p_product_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.products p
    join public.shops s on s.id = p.shop_id
    where p.id = p_product_id
      and p.is_active
      and s.status = 'active'
      and s.approval_status = 'approved'
  );
$$;

grant execute on function public.is_public_product(uuid) to anon, authenticated;

grant select on public.products, public.product_variants, public.categories,
  public.product_images, public.storefront_promotions to anon;

drop policy if exists products_public_catalog_select on public.products;
create policy products_public_catalog_select
  on public.products for select to anon
  using (public.is_public_product(id));

drop policy if exists variants_public_catalog_select on public.product_variants;
create policy variants_public_catalog_select
  on public.product_variants for select to anon
  using (is_active and public.is_public_product(product_id));

drop policy if exists categories_public_catalog_select on public.categories;
create policy categories_public_catalog_select
  on public.categories for select to anon
  using (is_active);

drop policy if exists product_images_public_catalog_select on public.product_images;
create policy product_images_public_catalog_select
  on public.product_images for select to anon
  using (public.is_public_product(product_id));

drop policy if exists storefront_promotions_public_select on public.storefront_promotions;
create policy storefront_promotions_public_select
  on public.storefront_promotions for select to anon
  using (is_active);

alter table public.product_variants
  add column if not exists quantity_discount_2 numeric(5,2),
  add column if not exists quantity_discount_4 numeric(5,2);

alter table public.products
  add column if not exists size_chart jsonb not null default '[]'::jsonb;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'products_size_chart_is_array'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_size_chart_is_array
      check (jsonb_typeof(size_chart) = 'array');
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'product_variants_quantity_discount_2_range'
      and conrelid = 'public.product_variants'::regclass
  ) then
    alter table public.product_variants
      add constraint product_variants_quantity_discount_2_range
      check (quantity_discount_2 is null or quantity_discount_2 between 0 and 100);
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'product_variants_quantity_discount_4_range'
      and conrelid = 'public.product_variants'::regclass
  ) then
    alter table public.product_variants
      add constraint product_variants_quantity_discount_4_range
      check (quantity_discount_4 is null or quantity_discount_4 between 0 and 100);
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'product_variants_quantity_discount_4_higher'
      and conrelid = 'public.product_variants'::regclass
  ) then
    alter table public.product_variants
      add constraint product_variants_quantity_discount_4_higher
      check (
        quantity_discount_4 is null
        or quantity_discount_2 is null
        or quantity_discount_4 > quantity_discount_2
      );
  end if;
end;
$$;

create or replace function public.customer_can_review_product(p_product_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select auth.uid() is not null and exists (
    select 1
    from public.orders o
    join public.order_items oi on oi.order_id = o.id
    join public.product_variants pv on pv.id = oi.variant_id
    where o.customer_id = auth.uid()
      and o.order_status = 'delivered'
      and pv.product_id = p_product_id
  );
$$;

revoke all on function public.customer_can_review_product(uuid) from public;
grant execute on function public.customer_can_review_product(uuid) to authenticated;

alter table public.product_reviews
  add column if not exists verified_purchase boolean not null default false;

drop trigger if exists product_reviews_verify_purchase on public.product_reviews;

update public.product_reviews r
   set verified_purchase = true
 where not r.verified_purchase
   and exists (
     select 1
       from public.orders o
       join public.order_items oi on oi.order_id = o.id
       join public.product_variants pv on pv.id = oi.variant_id
      where o.customer_id = r.user_id
        and o.order_status = 'delivered'
        and pv.product_id = r.product_id
   );

create or replace function public.verify_product_review_purchase()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null or new.user_id <> auth.uid() then
    raise exception 'You can only review products from your own account';
  end if;
  if not public.customer_can_review_product(new.product_id) then
    raise exception 'A delivered order containing this product is required to leave a review';
  end if;
  new.verified_purchase := true;
  return new;
end;
$$;

drop trigger if exists product_reviews_verify_purchase on public.product_reviews;
create trigger product_reviews_verify_purchase
  before insert or update on public.product_reviews
  for each row execute function public.verify_product_review_purchase();

drop policy if exists product_reviews_select on public.product_reviews;
drop policy if exists product_reviews_public_verified_select on public.product_reviews;
create policy product_reviews_public_verified_select
  on public.product_reviews for select to anon, authenticated
  using (verified_purchase);

drop policy if exists product_reviews_insert_own on public.product_reviews;
create policy product_reviews_insert_own
  on public.product_reviews for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and public.customer_can_review_product(product_id)
  );

drop policy if exists product_reviews_update_own on public.product_reviews;
create policy product_reviews_update_own
  on public.product_reviews for update to authenticated
  using (user_id = (select auth.uid()) and verified_purchase)
  with check (
    user_id = (select auth.uid())
    and public.customer_can_review_product(product_id)
  );

revoke select on public.product_reviews from anon;
grant select (product_id, rating, review_text, created_at)
  on public.product_reviews to anon;

drop policy if exists orders_select on public.orders;
create policy orders_select
  on public.orders for select to authenticated
  using (
    customer_id = (select auth.uid())
    or public.is_shop_member(shop_id)
    or public.has_role('admin')
  );

drop policy if exists order_items_select on public.order_items;
create policy order_items_select
  on public.order_items for select to authenticated
  using (
    exists (
      select 1
      from public.orders o
      where o.id = order_id
        and (
          o.customer_id = (select auth.uid())
          or public.is_shop_member(o.shop_id)
          or public.has_role('admin')
        )
    )
  );

drop policy if exists order_history_select on public.order_status_history;
create policy order_history_select
  on public.order_status_history for select to authenticated
  using (
    exists (
      select 1
      from public.orders o
      where o.id = order_id
        and (
          o.customer_id = (select auth.uid())
          or public.is_shop_member(o.shop_id)
          or public.has_role('admin')
        )
    )
  );

drop policy if exists addresses_select on public.addresses;
create policy addresses_select
  on public.addresses for select to authenticated
  using (
    user_id = (select auth.uid())
    or public.has_role('admin')
    or exists (
      select 1
      from public.orders o
      where o.address_id = addresses.id
        and public.is_assigned_delivery_agent(o.id)
    )
  );

drop policy if exists agents_update_self_or_admin on public.delivery_agents;
create policy agents_update_admin
  on public.delivery_agents for update to authenticated
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

create function public.set_delivery_agent_availability(p_status public.delivery_availability_status)
returns public.delivery_availability_status
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null or not public.has_role('delivery_agent') then
    raise exception 'Delivery agent authorization is required';
  end if;
  if p_status not in ('available', 'offline') then
    raise exception 'Agents can only choose available or offline status';
  end if;
  if exists (
    select 1
    from public.delivery_assignments da
    join public.orders o on o.id = da.order_id
    where da.delivery_agent_id = auth.uid()
      and o.order_status in ('assigned', 'picked_up', 'out_for_delivery')
  ) then
    raise exception 'Complete the active delivery before changing availability';
  end if;
  update public.delivery_agents
     set availability_status = p_status, updated_at = now()
   where user_id = auth.uid();
  if not found then
    raise exception 'Delivery-agent profile was not found';
  end if;
  return p_status;
end;
$$;

revoke all on function public.set_delivery_agent_availability(public.delivery_availability_status) from public;
grant execute on function public.set_delivery_agent_availability(public.delivery_availability_status) to authenticated;

drop function public.available_delivery_orders();
create function public.available_delivery_orders()
returns table(
  order_id uuid,
  order_status public.order_status,
  address_label text,
  address_line text,
  city text,
  state text,
  postal_code text,
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
    where user_id = auth.uid() and availability_status = 'available'
  ) then
    raise exception 'Delivery agent is unavailable';
  end if;
  return query
  select o.id, o.order_status, a.label, a.address_line, a.city, a.state, a.postal_code, o.created_at
  from public.orders o
  join public.addresses a on a.id = o.address_id
  where o.order_status = 'ready_for_pickup'
    and not exists (
      select 1 from public.delivery_assignments da where da.order_id = o.id
    )
  order by o.created_at asc;
end;
$$;

create function public.my_delivery_orders()
returns table(
  order_id uuid,
  order_status public.order_status,
  address_label text,
  address_line text,
  city text,
  state text,
  postal_code text,
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
  select o.id, o.order_status, a.label, a.address_line, a.city, a.state, a.postal_code, o.created_at
  from public.orders o
  join public.addresses a on a.id = o.address_id
  join public.delivery_assignments da
    on da.order_id = o.id and da.delivery_agent_id = auth.uid()
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
         set availability_status = 'available', updated_at = now()
       where user_id = v_actor;
    end if;
  end if;
  insert into public.order_status_history (order_id, status, changed_by, note)
  values (p_order_id, p_next_status, v_actor, p_note);
  insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  values (v_actor, 'order.status_changed', 'order', p_order_id, jsonb_build_object('status', p_next_status));
end;
$$;

revoke all on function public.transition_order_status(uuid, public.order_status, text) from public;
grant execute on function public.transition_order_status(uuid, public.order_status, text) to authenticated;

create or replace function public.place_order(
  p_shop_id uuid,
  p_address_id uuid,
  p_items jsonb,
  p_coupon_code text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
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
  if v_customer_id is null or not public.has_role('customer') then
    raise exception 'Customer authentication is required';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Order items are required';
  end if;
  select count(*) into v_item_count
  from jsonb_to_recordset(p_items) as x(variant_id uuid, quantity integer);
  if v_item_count <> jsonb_array_length(p_items) then
    raise exception 'Each order item must include a variant_id and quantity';
  end if;
  if exists (
    select 1 from jsonb_to_recordset(p_items) as x(variant_id uuid, quantity integer)
    where variant_id is null or quantity is null or quantity <= 0
  ) then
    raise exception 'Each order item must have a positive quantity';
  end if;
  if not exists (
    select 1 from public.addresses where id = p_address_id and user_id = v_customer_id
  ) then
    raise exception 'The selected address does not belong to the customer';
  end if;
  if not exists (
    select 1 from public.shops
    where id = p_shop_id and status = 'active' and approval_status = 'approved'
  ) then
    raise exception 'The selected shop is unavailable';
  end if;
  if (
    select count(distinct variant_id)
    from jsonb_to_recordset(p_items) as x(variant_id uuid, quantity integer)
  ) <> v_item_count then
    raise exception 'Each variant may appear only once in an order';
  end if;

  insert into public.orders (
    id, customer_id, shop_id, address_id, subtotal, delivery_fee,
    discount, total_amount, payment_status, order_status
  )
  values (v_order_id, v_customer_id, p_shop_id, p_address_id, 0, 0, 0, 0, 'pending', 'placed');

  for v_item in
    select * from jsonb_to_recordset(p_items) as x(variant_id uuid, quantity integer)
  loop
    select i.id, i.stock_quantity, i.reserved_quantity, pv.id as variant_id,
           pv.name as variant_name, pv.price, pv.discount_price,
           pv.quantity_discount_2, pv.quantity_discount_4, p.name as product_name
      into v_inventory
      from public.inventory i
      join public.product_variants pv on pv.id = i.variant_id and pv.is_active
      join public.products p on p.id = pv.product_id and p.is_active
     where i.shop_id = p_shop_id and i.variant_id = v_item.variant_id
     for update of i;
    if not found then
      raise exception 'Variant % is unavailable from this shop', v_item.variant_id;
    end if;
    if v_inventory.stock_quantity - v_inventory.reserved_quantity < v_item.quantity then
      raise exception 'Insufficient stock for variant %', v_item.variant_id;
    end if;

    v_unit_price := coalesce(v_inventory.discount_price, v_inventory.price);
    if v_item.quantity >= 4 and v_inventory.quantity_discount_4 is not null then
      v_unit_price := round(v_unit_price * (1 - v_inventory.quantity_discount_4 / 100), 2);
    elsif v_item.quantity >= 2 and v_inventory.quantity_discount_2 is not null then
      v_unit_price := round(v_unit_price * (1 - v_inventory.quantity_discount_2 / 100), 2);
    end if;

    v_subtotal := v_subtotal + (v_inventory.price * v_item.quantity);
    v_product_discount := v_product_discount
      + ((v_inventory.price - v_unit_price) * v_item.quantity);
    update public.inventory
       set reserved_quantity = reserved_quantity + v_item.quantity
     where id = v_inventory.id;
    insert into public.order_items (
      order_id, variant_id, product_name_snapshot, variant_name_snapshot,
      quantity, unit_price, total_price
    )
    values (
      v_order_id, v_inventory.variant_id, v_inventory.product_name,
      v_inventory.variant_name, v_item.quantity, v_unit_price,
      v_unit_price * v_item.quantity
    );
  end loop;

  if p_coupon_code is not null and btrim(p_coupon_code) <> '' then
    select * into v_coupon
      from public.coupons
     where code = upper(btrim(p_coupon_code))
       and is_active
       and (starts_at is null or starts_at <= now())
       and (expires_at is null or expires_at > now())
     for update;
    if not found or (v_subtotal - v_product_discount) < v_coupon.minimum_order_value then
      raise exception 'Coupon is invalid or does not meet its minimum order value';
    end if;
    if exists (
      select 1 from public.coupon_redemptions
      where coupon_id = v_coupon.id and user_id = v_customer_id
    ) then
      raise exception 'Coupon has already been redeemed';
    end if;
    if v_coupon.usage_limit is not null
       and (select count(*) from public.coupon_redemptions where coupon_id = v_coupon.id) >= v_coupon.usage_limit then
      raise exception 'Coupon usage limit reached';
    end if;
    v_coupon_discount := case
      when v_coupon.discount_type = 'percentage'
        then round((v_subtotal - v_product_discount) * v_coupon.discount_value / 100, 2)
      else v_coupon.discount_value
    end;
    v_coupon_discount := least(
      v_coupon_discount,
      coalesce(v_coupon.max_discount, v_coupon_discount),
      v_subtotal - v_product_discount
    );
  end if;
  v_delivery_fee := case when (v_subtotal - v_product_discount) >= 199 then 0 else 25 end;

  update public.orders
     set subtotal = v_subtotal,
         delivery_fee = v_delivery_fee,
         discount = v_product_discount + v_coupon_discount,
         total_amount = v_subtotal + v_delivery_fee - v_product_discount - v_coupon_discount
   where id = v_order_id;
  if v_coupon.id is not null then
    insert into public.coupon_redemptions (coupon_id, user_id, order_id)
    values (v_coupon.id, v_customer_id, v_order_id);
  end if;
  insert into public.payments (order_id, amount, status)
  values (v_order_id, v_subtotal + v_delivery_fee - v_product_discount - v_coupon_discount, 'pending');
  insert into public.order_status_history (order_id, status, changed_by, note)
  values (v_order_id, 'placed', v_customer_id, 'Order placed');
  insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  values (v_customer_id, 'order.placed', 'order', v_order_id, jsonb_build_object('shop_id', p_shop_id));
  return v_order_id;
end;
$$;

revoke all on function public.place_order(uuid, uuid, jsonb, text) from public;
grant execute on function public.place_order(uuid, uuid, jsonb, text) to authenticated;
