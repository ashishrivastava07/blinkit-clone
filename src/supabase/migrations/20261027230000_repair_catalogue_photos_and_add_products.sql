-- Repair photo URLs for the original sample products and ensure the expanded
-- catalogue has images even when earlier migrations were already recorded.
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
  when '10000000-0000-4000-8000-000000000012' then 'https://images.pexels.com/photos/1359326/pexels-photo-1359326.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000013' then 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=720&q=82'
  when '10000000-0000-4000-8000-000000000014' then 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=720&q=82'
  when '10000000-0000-4000-8000-000000000015' then 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=720&q=82'
  when '10000000-0000-4000-8000-000000000016' then 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=720&q=82'
  when '10000000-0000-4000-8000-000000000017' then 'https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?auto=format&fit=crop&w=720&q=82'
  when '10000000-0000-4000-8000-000000000018' then 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=720&q=82'
  when '10000000-0000-4000-8000-000000000019' then 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=720&q=82'
  when '10000000-0000-4000-8000-000000000020' then 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=720&q=82'
  when '10000000-0000-4000-8000-000000000021' then 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=720&q=82'
  when '10000000-0000-4000-8000-000000000022' then 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=720&q=82'
  when '10000000-0000-4000-8000-000000000023' then 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=720&q=82'
  when '10000000-0000-4000-8000-000000000024' then 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=720&q=82'
  when '10000000-0000-4000-8000-000000000025' then 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=720&q=82'
  when '10000000-0000-4000-8000-000000000026' then 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=720&q=82'
  when '10000000-0000-4000-8000-000000000027' then 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=720&q=82'
  when '10000000-0000-4000-8000-000000000028' then 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=720&q=82'
  when '10000000-0000-4000-8000-000000000029' then 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=720&q=82'
  when '10000000-0000-4000-8000-000000000030' then 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=720&q=82'
  when '10000000-0000-4000-8000-000000000031' then 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=720&q=82'
  else image_url
end
where id between '10000000-0000-4000-8000-000000000001' and '10000000-0000-4000-8000-000000000031'
  and image_url is null;

insert into public.products (id, shop_id, category_id, name, description, brand, image_url, is_active) values
  ('10000000-0000-4000-8000-000000000032', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'fruits-vegetables'), 'Green Grapes', 'Sweet, seedless green grapes', 'Fresh Farms', 'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=720&q=82', true),
  ('10000000-0000-4000-8000-000000000033', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'fruits-vegetables'), 'Alphonso Mangoes', 'Seasonal ripe mangoes with a rich, sweet flavour', 'Fresh Farms', 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=720&q=82', true),
  ('10000000-0000-4000-8000-000000000034', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'fruits-vegetables'), 'Green Capsicum', 'Fresh, crisp green bell peppers', 'Fresh Farms', 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=720&q=82', true),
  ('10000000-0000-4000-8000-000000000035', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'fruits-vegetables'), 'Fresh Lemons', 'Tangy lemons for cooking and drinks', 'Fresh Farms', 'https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&w=720&q=82', true),
  ('10000000-0000-4000-8000-000000000036', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'fruits-vegetables'), 'Fresh Strawberries', 'Juicy strawberries, carefully selected', 'Fresh Farms', 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=720&q=82', true),
  ('10000000-0000-4000-8000-000000000037', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'fruits-vegetables'), 'Crisp Cucumbers', 'Cool, crunchy cucumbers for salads', 'Fresh Farms', 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=720&q=82', true),
  ('10000000-0000-4000-8000-000000000038', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'dairy-breakfast'), 'Fresh Paneer', 'Soft paneer for curries and snacks', 'Milky Mist', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=720&q=82', true),
  ('10000000-0000-4000-8000-000000000039', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'dairy-breakfast'), 'Farm Fresh Curd', 'Creamy set curd for everyday meals', 'Amul', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=720&q=82', true),
  ('10000000-0000-4000-8000-000000000040', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'oil-masala'), 'Pure Cow Ghee', 'Aromatic clarified butter for cooking', 'Amul', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=720&q=82', true),
  ('10000000-0000-4000-8000-000000000041', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'oil-masala'), 'Turmeric Powder', 'Ground turmeric for everyday cooking', 'Tata Sampann', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=720&q=82', true),
  ('10000000-0000-4000-8000-000000000042', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'atta-rice-dal'), 'Kabuli Chana', 'Premium whole chickpeas, rich in protein', 'Tata Sampann', 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=720&q=82', true),
  ('10000000-0000-4000-8000-000000000043', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'atta-rice-dal'), 'Red Kidney Beans', 'Whole rajma beans for homestyle meals', 'Tata Sampann', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=720&q=82', true),
  ('10000000-0000-4000-8000-000000000044', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'atta-rice-dal'), 'Penne Pasta', 'Durum wheat pasta, ready for your favourite sauce', 'Del Monte', 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&w=720&q=82', true),
  ('10000000-0000-4000-8000-000000000045', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'snacks'), 'Dark Chocolate', 'Rich dark chocolate for a satisfying treat', 'Amul', 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=720&q=82', true),
  ('10000000-0000-4000-8000-000000000046', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'snacks'), 'Roasted Makhana', 'Light, crunchy fox nuts for snacking', 'Too Yumm', 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=720&q=82', true),
  ('10000000-0000-4000-8000-000000000047', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'beverages'), 'Mixed Fruit Juice', 'Refreshing mixed fruit drink', 'Real', 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=720&q=82', true),
  ('10000000-0000-4000-8000-000000000048', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'beverages'), 'Coconut Water', 'Refreshing tender coconut water', 'Paper Boat', 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=720&q=82', true),
  ('10000000-0000-4000-8000-000000000049', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'personal-care'), 'Mint Toothpaste', 'Daily fluoride toothpaste with a fresh mint flavour', 'Colgate', 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=720&q=82', true),
  ('10000000-0000-4000-8000-000000000050', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'cleaning'), 'Soft Facial Tissues', 'Soft, absorbent tissues for everyday use', 'Origami', 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=720&q=82', true),
  ('10000000-0000-4000-8000-000000000051', '00000000-0000-4000-8000-000000000001', (select id from public.categories where slug = 'pet-supplies'), 'Premium Cat Food', 'Complete dry food for adult cats', 'Whiskas', 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=720&q=82', true)
on conflict (id) do nothing;

insert into public.product_variants (id, product_id, name, sku, price, discount_price, is_active) values
  ('20000000-0000-4000-8000-000000000034', '10000000-0000-4000-8000-000000000032', '500 g', 'GRAPES-GREEN-500', 95, 79, true),
  ('20000000-0000-4000-8000-000000000035', '10000000-0000-4000-8000-000000000033', '2 pieces', 'MANGO-ALPHONSO-2', 160, 139, true),
  ('20000000-0000-4000-8000-000000000036', '10000000-0000-4000-8000-000000000034', '500 g', 'CAPSICUM-GREEN-500', 55, 45, true),
  ('20000000-0000-4000-8000-000000000037', '10000000-0000-4000-8000-000000000035', '4 pieces', 'LEMON-FRESH-4', 35, 29, true),
  ('20000000-0000-4000-8000-000000000038', '10000000-0000-4000-8000-000000000036', '200 g', 'STRAWBERRY-FRESH-200', 120, 99, true),
  ('20000000-0000-4000-8000-000000000039', '10000000-0000-4000-8000-000000000037', '500 g', 'CUCUMBER-FRESH-500', 30, 25, true),
  ('20000000-0000-4000-8000-000000000040', '10000000-0000-4000-8000-000000000038', '200 g', 'PANEER-FRESH-200', 95, 85, true),
  ('20000000-0000-4000-8000-000000000041', '10000000-0000-4000-8000-000000000039', '400 g', 'CURD-FARM-400', 45, 40, true),
  ('20000000-0000-4000-8000-000000000042', '10000000-0000-4000-8000-000000000040', '500 ml', 'GHEE-COW-500', 345, 319, true),
  ('20000000-0000-4000-8000-000000000043', '10000000-0000-4000-8000-000000000041', '100 g', 'TURMERIC-POWDER-100', 55, 49, true),
  ('20000000-0000-4000-8000-000000000044', '10000000-0000-4000-8000-000000000042', '500 g', 'CHANA-KABULI-500', 90, 79, true),
  ('20000000-0000-4000-8000-000000000045', '10000000-0000-4000-8000-000000000043', '500 g', 'RAJMA-RED-500', 95, 85, true),
  ('20000000-0000-4000-8000-000000000046', '10000000-0000-4000-8000-000000000044', '500 g', 'PASTA-PENNE-500', 115, 99, true),
  ('20000000-0000-4000-8000-000000000047', '10000000-0000-4000-8000-000000000045', '150 g', 'CHOCOLATE-DARK-150', 110, 99, true),
  ('20000000-0000-4000-8000-000000000048', '10000000-0000-4000-8000-000000000046', '100 g', 'MAKHANA-ROASTED-100', 125, 110, true),
  ('20000000-0000-4000-8000-000000000049', '10000000-0000-4000-8000-000000000047', '1 litre', 'JUICE-MIXED-1L', 125, 109, true),
  ('20000000-0000-4000-8000-000000000050', '10000000-0000-4000-8000-000000000048', '1 litre', 'COCONUT-WATER-1L', 80, 69, true),
  ('20000000-0000-4000-8000-000000000051', '10000000-0000-4000-8000-000000000049', '150 g', 'TOOTHPASTE-MINT-150', 110, 99, true),
  ('20000000-0000-4000-8000-000000000052', '10000000-0000-4000-8000-000000000050', 'Pack of 100', 'TISSUES-FACIAL-100', 85, 75, true),
  ('20000000-0000-4000-8000-000000000053', '10000000-0000-4000-8000-000000000051', '1.2 kg', 'CATFOOD-ADULT-12KG', 499, 459, true)
on conflict (id) do nothing;

insert into public.inventory (shop_id, variant_id, stock_quantity, reserved_quantity, low_stock_threshold) values
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000034', 22, 0, 5),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000035', 16, 0, 5),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000036', 25, 0, 5),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000037', 30, 0, 5),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000038', 12, 0, 5),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000039', 24, 0, 5),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000040', 18, 0, 5),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000041', 20, 0, 5),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000042', 14, 0, 5),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000043', 30, 0, 5),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000044', 28, 0, 5),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000045', 21, 0, 5),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000046', 19, 0, 5),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000047', 17, 0, 5),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000048', 15, 0, 5),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000049', 20, 0, 5),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000050', 24, 0, 5),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000051', 18, 0, 5),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000052', 16, 0, 5),
  ('00000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000053', 14, 0, 5)
on conflict (shop_id, variant_id) do nothing;
