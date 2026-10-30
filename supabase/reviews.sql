-- FILIN 제품 후기(별점) 표 SQL
-- Supabase 대시보드 → SQL Editor → New query 에 전체를 붙여 넣고 Run 을 누르세요.
-- 한 번만 실행하면 돼요. (다시 실행해도 문제없게 만들었어요)

-- 1) 제품 후기 표: 모든 고객이 함께 보는 후기예요.
create table if not exists public.product_reviews (
  id         bigint generated always as identity primary key,
  product_id text not null,
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  nickname   text not null default '' check (char_length(nickname) <= 20),
  pet        text not null default '' check (char_length(pet) <= 40),
  stars      smallint not null check (stars between 1 and 5),
  body       text not null check (char_length(body) between 1 and 300),
  created_at timestamptz not null default now()
);
create index if not exists product_reviews_product_idx on public.product_reviews (product_id, created_at desc);

-- 2) 잠금장치(RLS): 누구나 읽을 수 있고, 쓰기·고치기·지우기는 로그인한 본인 후기만 돼요.
alter table public.product_reviews enable row level security;

grant select on public.product_reviews to anon, authenticated;
grant insert, update, delete on public.product_reviews to authenticated;

drop policy if exists "후기 누구나 읽기" on public.product_reviews;
create policy "후기 누구나 읽기" on public.product_reviews
  for select to anon, authenticated using (true);

drop policy if exists "후기 본인만 쓰기" on public.product_reviews;
create policy "후기 본인만 쓰기" on public.product_reviews
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "후기 본인만 고치기" on public.product_reviews;
create policy "후기 본인만 고치기" on public.product_reviews
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "후기 본인만 지우기" on public.product_reviews;
create policy "후기 본인만 지우기" on public.product_reviews
  for delete to authenticated using ((select auth.uid()) = user_id);
