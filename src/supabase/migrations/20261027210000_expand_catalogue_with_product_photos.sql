-- Expand the development catalogue and add real product photography.
update public.products
set image_url = case id
  when '10000000-0000-4000-8000-000000000001' then 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=720&q=82'
  when '10000000-0000-4000-8000-000000000002' then 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=720&q=82'
  when '10000000-0000-4000-8000-000000000003' then 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=720&q=82'
  when '10000000-0000-4000-8000-000000000004' then 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=720&q=82'
  when '10000000-0000-4000-8000-000000000005' then 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=720&q=82'
  when '10000000-0000-4000-8000-000000000006' then 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=720&q=82'
  when '10000000-0000-4000-8000-000000000007' then 'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=720&q=82'
  when '10000000-0000-4000-8000-000000000008' then 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=720&q=82'
  when '10000000-0000-4000-8000-000000000009' then 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=720&q=82'
  when '10000000-0000-4000-8000-000000000010' then 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=720&q=82'
  when '10000000-0000-4000-8000-000000000011' then 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=720&q=82'
  else image_url
end
where id between '10000000-0000-4000-8000-000000000001' and '10000000-0000-4000-8000-000000000011'
  and image_url is null;

insert into public.products (id, shop_id, category_id, name, description, brand, image_url, is_active) values
  ('10000000-0000-4000-8000-000000000012', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'fruits-vegetables'), 'Royal Gala Apples', 'Crisp, naturally sweet apples', 'Fresh Farms', 'https://images.pexels.com/photos/1359326/pexels-photo-1359326.jpeg?auto=compress&cs=tinysrgb&w=720', true),
  ('10000000-0000-4000-8000-000000000013', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'fruits-vegetables'), 'Nagpur Oranges', 'Juicy oranges, rich in vitamin C', 'Fresh Farms', 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=720&q=82', true),
  ('10000000-0000-4000-8000-000000000014', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'fruits-vegetables'), 'Red Onions', 'Everyday fresh red onions', 'Fresh Farms', 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=720&q=82', true),
  ('10000000-0000-4000-8000-000000000015', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'fruits-vegetables'), 'Fresh Tomatoes', 'Juicy, ripe tomatoes for everyday cooking', 'Fresh Farms', 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=720&q=82', true),
  ('10000000-0000-4000-8000-000000000016', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'fruits-vegetables'), 'Baby Spinach', 'Tender, washed spinach leaves', 'Fresh Farms', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=720&q=82', true),
  ('10000000-0000-4000-8000-000000000017', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'dairy-breakfast'), 'Farm Fresh Eggs', 'Protein-rich farm eggs', 'Fresh Farms', 'https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?auto=format&fit=crop&w=720&q=82', true),
  ('10000000-0000-4000-8000-000000000018', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'dairy-breakfast'), 'Greek Yogurt', 'Creamy, thick plain yogurt', 'Milky Mist', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=720&q=82', true),
  ('10000000-0000-4000-8000-000000000019', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'dairy-breakfast'), 'Salted Butter', 'Smooth table butter for breakfast and baking', 'Amul', 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=720&q=82', true),
  ('10000000-0000-4000-8000-000000000020', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'dairy-breakfast'), 'Cheddar Cheese Slices', 'Mild, creamy cheese slices', 'Amul', 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=720&q=82', true),
  ('10000000-0000-4000-8000-000000000021', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'atta-rice-dal'), 'Rolled Oats', 'Wholegrain oats for a hearty breakfast', 'Saffola', 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=720&q=82', true),
  ('10000000-0000-4000-8000-000000000022', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'atta-rice-dal'), 'Whole Wheat Atta', 'Stone-ground whole wheat flour', 'Aashirvaad', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=720&q=82', true),
  ('10000000-0000-4000-8000-000000000023', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'atta-rice-dal'), 'Toor Dal', 'High-quality split pigeon peas', 'Tata Sampann', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=720&q=82', true),
  ('10000000-0000-4000-8000-000000000024', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'beverages'), 'Ground Coffee', 'Richly roasted ground coffee', 'Continental', 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=720&q=82', true),
  ('10000000-0000-4000-8000-000000000025', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'beverages'), 'Masala Chai', 'Aromatic Indian tea with warming spices', 'Tata Tea', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=720&q=82', true),
  ('10000000-0000-4000-8000-000000000026', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'beverages'), 'Orange Juice', 'Refreshing orange juice', 'Real', 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=720&q=82', true),
  ('10000000-0000-4000-8000-000000000027', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'snacks'), 'Chocolate Chip Cookies', 'Crunchy cookies with chocolate chips', 'Sunfeast', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=720&q=82', true),
  ('10000000-0000-4000-8000-000000000028', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'atta-rice-dal'), 'Instant Noodles', 'Quick-cooking masala noodles', 'Maggi', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=720&q=82', true),
  ('10000000-0000-4000-8000-000000000029', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'beverages'), 'Mineral Water', 'Packaged drinking water', 'Bisleri', 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=720&q=82', true),
  ('10000000-0000-4000-8000-000000000030', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'cleaning'), 'Dishwashing Liquid', 'Grease-cutting dishwash liquid', 'Vim', 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=720&q=82', true),
  ('10000000-0000-4000-8000-000000000031', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'fruits-vegetables'), 'Fresh Potatoes', 'Kitchen-ready fresh potatoes', 'Fresh Farms', 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=720&q=82', true)
on conflict (id) do nothing;

insert into public.product_variants (id, product_id, name, sku, price, discount_price, is_active) values
  ('20000000-0000-4000-8000-000000000014', '10000000-0000-4000-8000-000000000012', '4 pieces', 'APPLE-GALA-4', 120, 99, true),
  ('20000000-0000-4000-8000-000000000015', '10000000-0000-4000-8000-000000000013', '6 pieces', 'ORANGE-NAG-6', 90, 75, true),
  ('20000000-0000-4000-8000-000000000016', '10000000-0000-4000-8000-000000000014', '500 g', 'ONION-RED-500', 35, 29, true),
  ('20000000-0000-4000-8000-000000000017', '10000000-0000-4000-8000-000000000015', '500 g', 'TOMATO-500', 38, 29, true),
  ('20000000-0000-4000-8000-000000000018', '10000000-0000-4000-8000-000000000016', '100 g', 'SPINACH-100', 30, null, true),
  ('20000000-0000-4000-8000-000000000019', '10000000-0000-4000-8000-000000000017', '6 pieces', 'EGGS-FARM-6', 65, 55, true),
  ('20000000-0000-4000-8000-000000000020', '10000000-0000-4000-8000-000000000018', '400 g', 'YOGURT-GREEK-400', 110, 95, true),
  ('20000000-0000-4000-8000-000000000021', '10000000-0000-4000-8000-000000000019', '100 g', 'BUTTER-SALT-100', 62, 58, true),
  ('20000000-0000-4000-8000-000000000022', '10000000-0000-4000-8000-000000000020', '200 g', 'CHEESE-CHED-200', 145, 129, true),
  ('20000000-0000-4000-8000-000000000023', '10000000-0000-4000-8000-000000000021', '500 g', 'OATS-ROLLED-500', 120, 99, true),
  ('20000000-0000-4000-8000-000000000024', '10000000-0000-4000-8000-000000000022', '5 kg', 'ATTA-WHEAT-5KG', 299, 269, true),
  ('20000000-0000-4000-8000-000000000025', '10000000-0000-4000-8000-000000000023', '1 kg', 'DAL-TOOR-1KG', 190, 169, true),
  ('20000000-0000-4000-8000-000000000026', '10000000-0000-4000-8000-000000000024', '200 g', 'COFFEE-GROUND-200', 220, 199, true),
  ('20000000-0000-4000-8000-000000000027', '10000000-0000-4000-8000-000000000025', '250 g', 'TEA-MASALA-250', 145, 129, true),
  ('20000000-0000-4000-8000-000000000028', '10000000-0000-4000-8000-000000000026', '1 litre', 'JUICE-ORANGE-1L', 120, 105, true),
  ('20000000-0000-4000-8000-000000000029', '10000000-0000-4000-8000-000000000027', '250 g', 'COOKIE-CHOC-250', 100, 85, true),
  ('20000000-0000-4000-8000-000000000030', '10000000-0000-4000-8000-000000000028', 'Pack of 4', 'NOODLES-MASALA-4', 56, 48, true),
  ('20000000-0000-4000-8000-000000000031', '10000000-0000-4000-8000-000000000029', '1 litre', 'WATER-MINERAL-1L', 20, null, true),
  ('20000000-0000-4000-8000-000000000032', '10000000-0000-4000-8000-000000000030', '500 ml', 'DISHWASH-VIM-500', 110, 99, true),
  ('20000000-0000-4000-8000-000000000033', '10000000-0000-4000-8000-000000000031', '1 kg', 'POTATO-FRESH-1KG', 42, 35, true)
on conflict (id) do nothing;

insert into public.inventory (shop_id, variant_id, stock_quantity, reserved_quantity, low_stock_threshold)
values
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000014', 24, 0, 5),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000015', 18, 0, 5),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000016', 32, 0, 5),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000017', 20, 0, 5),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000018', 15, 0, 5),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000019', 22, 0, 5),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000020', 14, 0, 5),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000021', 12, 0, 5),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000022', 17, 0, 5),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000023', 19, 0, 5),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000024', 21, 0, 5),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000025', 16, 0, 5),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000026', 11, 0, 5),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000027', 13, 0, 5),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000028', 18, 0, 5),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000029', 25, 0, 5),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000030', 20, 0, 5),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000031', 30, 0, 5),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000032', 15, 0, 5),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000033', 28, 0, 5)
on conflict (shop_id, variant_id) do nothing;
