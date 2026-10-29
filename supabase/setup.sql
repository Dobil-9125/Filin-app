-- FILIN 앱 데이터베이스 준비 SQL
-- Supabase 대시보드 → SQL Editor → New query 에 전체를 붙여 넣고 Run 을 누르세요.
-- 한 번만 실행하면 돼요. (다시 실행해도 문제없게 만들었어요)

-- 1) 회원별 앱 데이터를 담는 표
--    아이 프로필, 정기배송, 주문, 건강 기록, 샘플, 후기·질문을 회원 한 명당 한 줄(JSON)로 저장해요.
create table if not exists public.user_data (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 2) 잠금장치(RLS): 로그인한 회원은 자기 줄만 읽고 쓸 수 있어요.
alter table public.user_data enable row level security;

grant select, insert, update, delete on public.user_data to authenticated;
revoke all on public.user_data from anon;

drop policy if exists "본인 데이터 읽기" on public.user_data;
create policy "본인 데이터 읽기" on public.user_data
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "본인 데이터 만들기" on public.user_data;
create policy "본인 데이터 만들기" on public.user_data
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "본인 데이터 고치기" on public.user_data;
create policy "본인 데이터 고치기" on public.user_data
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "본인 데이터 지우기" on public.user_data;
create policy "본인 데이터 지우기" on public.user_data
  for delete to authenticated using ((select auth.uid()) = user_id);
