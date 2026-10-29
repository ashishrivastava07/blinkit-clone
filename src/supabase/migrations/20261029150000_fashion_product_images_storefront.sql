-- Add category hierarchy, sellable size/colour attributes, product galleries,
-- and database-configured homepage promotions without changing existing products.

alter table public.categories
  add column if not exists parent_id uuid references public.categories(id) on delete set null;

create index if not exists categories_parent_id_idx on public.categories(parent_id);

alter table public.product_variants
  add column if not exists attributes jsonb not null default '{}'::jsonb;

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  storage_path text,
  position smallint not null default 0 check (position between 0 and 6),
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists product_images_product_position_idx
  on public.product_images(product_id, position);

create unique index if not exists product_images_one_primary_per_product_idx
  on public.product_images(product_id) where is_primary;

create or replace function public.enforce_product_image_limit()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_shop_id uuid;
  v_image_count integer;
begin
  select shop_id into v_shop_id
  from public.products
  where id = new.product_id
  for update;

  if not found then
    raise exception 'Product not found for image';
  end if;

  if new.storage_path is not null
     and split_part(new.storage_path, '/', 1) <> v_shop_id::text then
    raise exception 'Product image storage path must belong to the product shop';
  end if;

  select count(*) into v_image_count
  from public.product_images
  where product_id = new.product_id
    and (tg_op <> 'UPDATE' or id <> new.id);

  if v_image_count >= 7 then
    raise exception 'A product can have up to seven images';
  end if;

  return new;
end;
$$;

drop trigger if exists product_images_enforce_limit on public.product_images;
create trigger product_images_enforce_limit
  before insert or update on public.product_images
  for each row execute function public.enforce_product_image_limit();

alter table public.product_images enable row level security;

drop policy if exists product_images_catalog_read on public.product_images;
create policy product_images_catalog_read
  on public.product_images for select to authenticated
  using (
    exists (
      select 1
      from public.products p
      where p.id = product_id
        and (
          (p.is_active and exists (
            select 1 from public.shops s
            where s.id = p.shop_id and s.status = 'active' and s.approval_status = 'approved'
          ))
          or public.is_shop_member(p.shop_id)
          or public.has_role('admin')
        )
    )
  );

drop policy if exists product_images_shopkeeper_insert on public.product_images;
create policy product_images_shopkeeper_insert
  on public.product_images for insert to authenticated
  with check (
    exists (
      select 1 from public.products p
      where p.id = product_id
        and (public.is_shop_member(p.shop_id, array['owner', 'manager', 'catalog_manager']::public.shop_member_role[])
          or public.has_role('admin'))
    )
  );

drop policy if exists product_images_shopkeeper_update on public.product_images;
create policy product_images_shopkeeper_update
  on public.product_images for update to authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id
        and (public.is_shop_member(p.shop_id, array['owner', 'manager', 'catalog_manager']::public.shop_member_role[])
          or public.has_role('admin'))
    )
  )
  with check (
    exists (
      select 1 from public.products p
      where p.id = product_id
        and (public.is_shop_member(p.shop_id, array['owner', 'manager', 'catalog_manager']::public.shop_member_role[])
          or public.has_role('admin'))
    )
  );

drop policy if exists product_images_shopkeeper_delete on public.product_images;
create policy product_images_shopkeeper_delete
  on public.product_images for delete to authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id
        and (public.is_shop_member(p.shop_id, array['owner', 'manager', 'catalog_manager']::public.shop_member_role[])
          or public.has_role('admin'))
    )
  );

grant select, insert, update, delete on public.product_images to authenticated;
grant select, insert, update on public.product_variants to authenticated;
grant select, insert, update on public.categories to authenticated;

create table if not exists public.storefront_promotions (
  id text primary key,
  placement text not null check (placement in ('hero', 'card')),
  heading text not null,
  description text not null,
  image_url text not null,
  cta_label text not null,
  target_path text not null check (target_path like '/%' and target_path not like '//%'),
  position smallint not null default 0 check (position >= 0),
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create unique index if not exists storefront_promotions_one_hero_idx
  on public.storefront_promotions(placement) where placement = 'hero' and is_active;

create unique index if not exists storefront_promotions_position_idx
  on public.storefront_promotions(placement, position) where is_active;

alter table public.storefront_promotions enable row level security;

drop policy if exists storefront_promotions_read on public.storefront_promotions;
create policy storefront_promotions_read
  on public.storefront_promotions for select to authenticated
  using (is_active or public.has_role('admin'));

drop policy if exists storefront_promotions_admin_manage on public.storefront_promotions;
create policy storefront_promotions_admin_manage
  on public.storefront_promotions for all to authenticated
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

grant select, insert, update, delete on public.storefront_promotions to authenticated;

insert into public.categories as existing_category (name, slug, image_url, is_active)
values ('Fashion', 'fashion', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=640&q=82', true)
on conflict (slug) do update
set image_url = coalesce(existing_category.image_url, excluded.image_url), is_active = true;

insert into public.categories as existing_category (name, slug, image_url, parent_id, is_active)
values
  ('Men''s Clothing', 'fashion-mens-clothing', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=640&q=82', (select id from public.categories where slug = 'fashion'), true),
  ('Women''s Clothing', 'fashion-womens-clothing', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=640&q=82', (select id from public.categories where slug = 'fashion'), true),
  ('Kids'' Clothing', 'fashion-kids-clothing', 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=640&q=82', (select id from public.categories where slug = 'fashion'), true),
  ('Footwear', 'fashion-footwear', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=640&q=82', (select id from public.categories where slug = 'fashion'), true),
  ('Accessories', 'fashion-accessories', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=640&q=82', (select id from public.categories where slug = 'fashion'), true)
on conflict (slug) do update
set image_url = coalesce(existing_category.image_url, excluded.image_url),
    parent_id = excluded.parent_id,
    is_active = true;

update public.categories
set image_url = case slug
  when 'fruits-vegetables' then 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=640&q=82'
  when 'dairy-breakfast' then 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=640&q=82'
  when 'atta-rice-dal' then 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=640&q=82'
  when 'oil-masala' then 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=640&q=82'
  when 'snacks' then 'https://images.unsplash.com/photo-1621939514649-280e2aa2f234?auto=format&fit=crop&w=640&q=82'
  when 'beverages' then 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=640&q=82'
  when 'bakery' then 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=640&q=82'
  when 'personal-care' then 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=640&q=82'
  when 'cleaning' then 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=640&q=82'
  when 'baby-care' then 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=640&q=82'
  when 'pet-supplies' then 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=640&q=82'
  else image_url
end
where slug in (
  'fruits-vegetables', 'dairy-breakfast', 'atta-rice-dal', 'oil-masala',
  'snacks', 'beverages', 'bakery', 'personal-care', 'cleaning', 'baby-care', 'pet-supplies'
) and image_url is null;

insert into public.storefront_promotions
  (id, placement, heading, description, image_url, cta_label, target_path, position, is_active)
values
  ('hero-daily-essentials', 'hero', 'Stock up on daily essentials', 'Farm-fresh groceries and everyday favourites, delivered to your neighbourhood.', 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1800&q=88', 'Shop now', '/search', 0, true),
  ('promo-pharmacy', 'card', 'Pharmacy at your doorstep', 'Everyday wellness essentials, right when you need them.', 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=900&q=82', 'Explore', '/search', 0, true),
  ('promo-pet-care', 'card', 'Pet care supplies at your door', 'Food, treats and daily care for your companions.', 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=900&q=82', 'Shop pet care', '/search', 1, true),
  ('promo-baby-care', 'card', 'Baby care, made simple', 'Find the essentials for little ones, delivered fast.', 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=900&q=82', 'Explore', '/search', 2, true)
on conflict (id) do nothing;
