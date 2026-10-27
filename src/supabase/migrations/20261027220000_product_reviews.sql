create table public.product_reviews (
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  review_text text check (review_text is null or char_length(review_text) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (product_id, user_id)
);

create index product_reviews_recent_idx
  on public.product_reviews (product_id, created_at desc);

alter table public.product_reviews enable row level security;

create policy product_reviews_select
  on public.product_reviews for select to authenticated
  using (true);

create policy product_reviews_insert_own
  on public.product_reviews for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy product_reviews_update_own
  on public.product_reviews for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

grant select, insert, update on table public.product_reviews to authenticated;
