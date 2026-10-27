grant select, insert, update on table public.products to authenticated;
grant select, insert, update on table public.product_variants to authenticated;
grant select, insert, update on table public.inventory to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy product_images_public_read
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy product_images_shopkeeper_upload
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and case
      when (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then public.is_shop_member(
        ((storage.foldername(name))[1])::uuid,
        array['owner', 'manager', 'catalog_manager']::public.shop_member_role[]
      )
      else false
    end
  );

create policy product_images_shopkeeper_update
  on storage.objects for update to authenticated
  using (
    bucket_id = 'product-images'
    and case
      when (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then public.is_shop_member(
        ((storage.foldername(name))[1])::uuid,
        array['owner', 'manager', 'catalog_manager']::public.shop_member_role[]
      )
      else false
    end
  )
  with check (
    bucket_id = 'product-images'
    and case
      when (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then public.is_shop_member(
        ((storage.foldername(name))[1])::uuid,
        array['owner', 'manager', 'catalog_manager']::public.shop_member_role[]
      )
      else false
    end
  );

create policy product_images_shopkeeper_delete
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'product-images'
    and case
      when (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then public.is_shop_member(
        ((storage.foldername(name))[1])::uuid,
        array['owner', 'manager', 'catalog_manager']::public.shop_member_role[]
      )
      else false
    end
  );
