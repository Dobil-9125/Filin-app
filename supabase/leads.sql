-- FILIN 맞춤추천 웹 "결과 저장" 명단 표 SQL
-- Supabase 대시보드 → SQL Editor → New query 에 전체를 붙여 넣고 Run 을 누르세요.
-- 한 번만 실행하면 돼요. (다시 실행해도 문제없게 만들었어요)
--
-- 맞춤추천 웹(recommend.html)의 추천 결과 아래에서 고객이 남긴 정보가 여기 쌓여요.
-- 로그인 없이 누구나 "넣기"만 할 수 있고, 읽기·고치기·지우기는 막아 두었어요.
-- 쌓인 명단은 Supabase 대시보드 → Table Editor → leads 에서 봐요 (대시보드는 관리자 권한이라 보여요).

-- 1) 명단 표
create table if not exists public.leads (
  id                bigint generated always as identity primary key,
  created_at        timestamptz not null default now(),

  -- 연락처 (휴대폰 번호, 숫자만)
  phone             text not null check (phone ~ '^01[0-9]{8,9}$'),

  -- 아이 정보 (추천 질문에서 받은 답)
  pet_name          text not null default '' check (char_length(pet_name) <= 20),
  species           text not null check (species in ('dog','cat')),
  stage             text not null default '' check (char_length(stage) <= 10),
  size              text not null default '' check (char_length(size) <= 10),
  prefs             text[] not null default '{}' check (cardinality(prefs) <= 10),
  allergies         text[] not null default '{}' check (cardinality(allergies) <= 10),
  active            text not null default '' check (char_length(active) <= 10),
  recommended       text[] not null default '{}' check (cardinality(recommended) <= 3),

  -- 동의 (필수 동의 없이는 저장되지 않아요)
  consent_privacy   boolean not null check (consent_privacy),
  consent_marketing boolean not null default false,
  consent_version   text not null default '' check (char_length(consent_version) <= 20),

  -- 어디서 왔는지 (링크의 utm_… 값, 이전 페이지)
  utm_source        text not null default '' check (char_length(utm_source) <= 100),
  utm_medium        text not null default '' check (char_length(utm_medium) <= 100),
  utm_campaign      text not null default '' check (char_length(utm_campaign) <= 100),
  utm_content       text not null default '' check (char_length(utm_content) <= 100),
  referrer          text not null default '' check (char_length(referrer) <= 300)
);
create index if not exists leads_created_idx on public.leads (created_at desc);
create index if not exists leads_phone_idx on public.leads (phone);

-- 2) 잠금장치(RLS): 웹에서는 넣기만 돼요. 남의 정보를 읽을 수 없어요.
alter table public.leads enable row level security;

revoke all on public.leads from anon, authenticated;
grant insert on public.leads to anon, authenticated;

drop policy if exists "명단 넣기만" on public.leads;
create policy "명단 넣기만" on public.leads
  for insert to anon, authenticated with check (consent_privacy);

-- 3) 보관 기간: 동의서에 "남긴 날부터 1년"이라고 안내해요.
--    매일 UTC 3시(한국 시각 낮 12시)에 1년 지난 줄을 자동으로 지워요.
--    pg_cron 확장을 써요. 처음 한 번만 아래 블록을 실행하면 돼요 (다시 실행해도 일정이 하나만 남아요).
create extension if not exists pg_cron;
select cron.unschedule(jobid) from cron.job where jobname = 'leads-1y-delete';
select cron.schedule('leads-1y-delete', '0 3 * * *',
  $$delete from public.leads where created_at < now() - interval '1 year'$$);
--    잘 걸렸는지 보기: select * from cron.job;  지운 기록 보기: select * from cron.job_run_details order by start_time desc limit 5;
--
--    고객이 삭제를 요청하면 (번호는 숫자만):
-- delete from public.leads where phone = '01012345678';
