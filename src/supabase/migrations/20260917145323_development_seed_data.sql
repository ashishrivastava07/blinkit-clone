-- Development catalogue only. It creates no users, roles, admins, or credentials.
insert into public.categories (name, slug, is_active) values
  ('Fruits & Vegetables', 'fruits-vegetables', true), ('Dairy & Breakfast', 'dairy-breakfast', true),
  ('Atta, Rice & Dal', 'atta-rice-dal', true), ('Oil & Masala', 'oil-masala', true),
  ('Snacks', 'snacks', true), ('Beverages', 'beverages', true), ('Bakery', 'bakery', true),
  ('Personal Care', 'personal-care', true), ('Cleaning', 'cleaning', true), ('Baby Care', 'baby-care', true),
  ('Pet Supplies', 'pet-supplies', true)
on conflict (slug) do update set name = excluded.name, is_active = excluded.is_active;

insert into public.shops (id, name, description, address, phone, status, approval_status) values
  ('00000000-0000-4000-8000-000000000001', 'Blinkit Demo Market', 'Development catalogue store', 'Green Park, New Delhi - 110016', '+911100000001', 'active', 'approved')
on conflict (id) do update set name = excluded.name, status = excluded.status, approval_status = excluded.approval_status;

insert into public.products (id, shop_id, category_id, name, description, brand, is_active) values
  ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'dairy-breakfast'), 'Taaza Toned Milk', 'Fresh toned milk', 'Amul', true),
  ('10000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'fruits-vegetables'), 'Farm Fresh Bananas', 'Naturally sweet bananas', 'Fresh Farms', true),
  ('10000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'bakery'), 'Whole Wheat Bread', 'Soft sliced bread', 'Modern', true),
  ('10000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'atta-rice-dal'), 'Basmati Rice', 'Aromatic long grain rice', 'India Gate', true),
  ('10000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'oil-masala'), 'Sunflower Oil', 'Refined sunflower cooking oil', 'Fortune', true),
  ('10000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'snacks'), 'Classic Salted Chips', 'Crispy potato chips', 'Lay''s', true),
  ('10000000-0000-4000-8000-000000000007', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'beverages'), 'Cola Soft Drink', 'Sparkling cola beverage', 'Coca-Cola', true),
  ('10000000-0000-4000-8000-000000000008', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'personal-care'), 'Herbal Soap', 'Gentle bathing bar', 'Pears', true),
  ('10000000-0000-4000-8000-000000000009', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'cleaning'), 'Laundry Detergent', 'Front-load laundry detergent', 'Surf Excel', true),
  ('10000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'baby-care'), 'Baby Diapers', 'Comfortable medium diapers', 'Pampers', true),
  ('10000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'pet-supplies'), 'Adult Dog Food', 'Chicken and vegetable dry food', 'Pedigree', true)
on conflict (id) do update set name = excluded.name, is_active = excluded.is_active;

insert into public.product_variants (id, product_id, name, sku, price, discount_price, is_active) values
  ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','500 ml','AMUL-TAZ-500',32,29,true), ('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','1 litre','AMUL-TAZ-1L',64,56,true),
  ('20000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000002','500 g','BANANA-500G',45,38,true), ('20000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000002','1 kg','BANANA-1KG',90,72,true),
  ('20000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000003','400 g','BREAD-WW-400',50,45,true), ('20000000-0000-4000-8000-000000000006','10000000-0000-4000-8000-000000000004','1 kg','RICE-BAS-1KG',145,132,true),
  ('20000000-0000-4000-8000-000000000007','10000000-0000-4000-8000-000000000005','1 litre','OIL-SUN-1L',158,149,true), ('20000000-0000-4000-8000-000000000008','10000000-0000-4000-8000-000000000006','52 g','CHIPS-CLS-52',20,null,true),
  ('20000000-0000-4000-8000-000000000009','10000000-0000-4000-8000-000000000007','750 ml','COLA-750',45,40,true), ('20000000-0000-4000-8000-000000000010','10000000-0000-4000-8000-000000000008','125 g','SOAP-HERB-125',65,59,true),
  ('20000000-0000-4000-8000-000000000011','10000000-0000-4000-8000-000000000009','1 kg','DETERGENT-1KG',210,195,true), ('20000000-0000-4000-8000-000000000012','10000000-0000-4000-8000-000000000010','Medium, 22 pieces','DIAPER-M-22',399,369,true),
  ('20000000-0000-4000-8000-000000000013','10000000-0000-4000-8000-000000000011','1.2 kg','DOGFOOD-12KG',420,389,true)
on conflict (id) do update set price = excluded.price, discount_price = excluded.discount_price, is_active = excluded.is_active;

insert into public.inventory (shop_id, variant_id, stock_quantity, reserved_quantity, low_stock_threshold) select '00000000-0000-4000-8000-000000000001', id, 40, 0, 5 from public.product_variants on conflict (shop_id, variant_id) do update set stock_quantity = excluded.stock_quantity, reserved_quantity = 0, low_stock_threshold = excluded.low_stock_threshold;

insert into public.coupons (code, discount_type, discount_value, minimum_order_value, max_discount, is_active) values ('SAVE10', 'percentage', 10, 100, 50, true) on conflict (code) do update set is_active = true;
