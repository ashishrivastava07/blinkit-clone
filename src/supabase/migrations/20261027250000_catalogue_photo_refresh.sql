-- Replace legacy catalogue image URLs with stable, product-relevant Pexels
-- photos. This update is safe to re-run and does not change product records.
update public.products
set image_url = case id
  when '10000000-0000-4000-8000-000000000001' then 'https://images.pexels.com/photos/14534512/pexels-photo-14534512.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000002' then 'https://images.pexels.com/photos/37182860/pexels-photo-37182860.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000003' then 'https://images.pexels.com/photos/209206/pexels-photo-209206.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000004' then 'https://images.pexels.com/photos/36346840/pexels-photo-36346840.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000005' then 'https://images.pexels.com/photos/18708752/pexels-photo-18708752.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000006' then 'https://images.pexels.com/photos/6696938/pexels-photo-6696938.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000007' then 'https://images.pexels.com/photos/9220520/pexels-photo-9220520.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000008' then 'https://images.pexels.com/photos/5938598/pexels-photo-5938598.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000009' then 'https://images.pexels.com/photos/10566513/pexels-photo-10566513.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000010' then 'https://images.pexels.com/photos/30344708/pexels-photo-30344708.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000011' then 'https://images.pexels.com/photos/34952073/pexels-photo-34952073.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000012' then 'https://images.pexels.com/photos/38924564/pexels-photo-38924564.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000013' then 'https://images.pexels.com/photos/18452311/pexels-photo-18452311.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000014' then 'https://images.pexels.com/photos/38088072/pexels-photo-38088072.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000015' then 'https://images.pexels.com/photos/29479888/pexels-photo-29479888.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000016' then 'https://images.pexels.com/photos/38571502/pexels-photo-38571502.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000017' then 'https://images.pexels.com/photos/4110225/pexels-photo-4110225.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000018' then 'https://images.pexels.com/photos/5620413/pexels-photo-5620413.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000019' then 'https://images.pexels.com/photos/7966386/pexels-photo-7966386.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000020' then 'https://images.pexels.com/photos/36570893/pexels-photo-36570893.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000021' then 'https://images.pexels.com/photos/27850088/pexels-photo-27850088.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000022' then 'https://images.pexels.com/photos/11789292/pexels-photo-11789292.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000023' then 'https://images.pexels.com/photos/6086414/pexels-photo-6086414.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000024' then 'https://images.pexels.com/photos/16682442/pexels-photo-16682442.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000025' then 'https://images.pexels.com/photos/12944684/pexels-photo-12944684.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000026' then 'https://images.pexels.com/photos/8215113/pexels-photo-8215113.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000027' then 'https://images.pexels.com/photos/298485/pexels-photo-298485.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000028' then 'https://images.pexels.com/photos/4223948/pexels-photo-4223948.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000029' then 'https://images.pexels.com/photos/11860562/pexels-photo-11860562.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000030' then 'https://images.pexels.com/photos/5904038/pexels-photo-5904038.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000031' then 'https://images.pexels.com/photos/36400786/pexels-photo-36400786.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000032' then 'https://images.pexels.com/photos/29195196/pexels-photo-29195196.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000033' then 'https://images.pexels.com/photos/31757889/pexels-photo-31757889.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000034' then 'https://images.pexels.com/photos/18640811/pexels-photo-18640811.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000035' then 'https://images.pexels.com/photos/952374/pexels-photo-952374.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000036' then 'https://images.pexels.com/photos/18018686/pexels-photo-18018686.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000037' then 'https://images.pexels.com/photos/39490165/pexels-photo-39490165.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000038' then 'https://images.pexels.com/photos/3928854/pexels-photo-3928854.png?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000039' then 'https://images.pexels.com/photos/5953691/pexels-photo-5953691.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000040' then 'https://images.pexels.com/photos/4910159/pexels-photo-4910159.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000041' then 'https://images.pexels.com/photos/6104651/pexels-photo-6104651.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000042' then 'https://images.pexels.com/photos/14965274/pexels-photo-14965274.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000043' then 'https://images.pexels.com/photos/35553032/pexels-photo-35553032.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000044' then 'https://images.pexels.com/photos/5531093/pexels-photo-5531093.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000045' then 'https://images.pexels.com/photos/6167328/pexels-photo-6167328.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000046' then 'https://images.pexels.com/photos/7051132/pexels-photo-7051132.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000047' then 'https://images.pexels.com/photos/14510445/pexels-photo-14510445.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000048' then 'https://images.pexels.com/photos/20720084/pexels-photo-20720084.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000049' then 'https://images.pexels.com/photos/6322805/pexels-photo-6322805.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000050' then 'https://images.pexels.com/photos/2062424/pexels-photo-2062424.jpeg?auto=compress&cs=tinysrgb&w=720'
  when '10000000-0000-4000-8000-000000000051' then 'https://images.pexels.com/photos/11435532/pexels-photo-11435532.jpeg?auto=compress&cs=tinysrgb&w=720'
  else image_url
end
where id between '10000000-0000-4000-8000-000000000001'
  and '10000000-0000-4000-8000-000000000051'
  and image_url in (
    'https://images.pexels.com/photos/1359326/pexels-photo-1359326.jpeg?auto=compress&cs=tinysrgb&w=720',
    'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=720&q=82',
    'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=720&q=82',
    'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=720&q=82',
    'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=720&q=82',
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=720&q=82',
    'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=720&q=82',
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=720&q=82',
    'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=720&q=82',
    'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=720&q=82',
    'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=720&q=82',
    'https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?auto=format&fit=crop&w=720&q=82',
    'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=720&q=82',
    'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=720&q=82',
    'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=720&q=82',
    'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=720&q=82',
    'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=720&q=82',
    'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=720&q=82',
    'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=720&q=82',
    'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=720&q=82',
    'https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&w=720&q=82',
    'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=720&q=82',
    'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=720&q=82',
    'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=720&q=82',
    'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=720&q=82',
    'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=720&q=82',
    'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=720&q=82',
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=720&q=82',
    'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=720&q=82',
    'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=720&q=82',
    'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=720&q=82',
    'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=720&q=82',
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=720&q=82',
    'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=720&q=82',
    'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=720&q=82',
    'https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&w=720&q=82',
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=720&q=82',
    'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=720&q=82',
    'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=720&q=82',
    'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=720&q=82',
    'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=720&q=82',
    'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=720&q=82'
  );
