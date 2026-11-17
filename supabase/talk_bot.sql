-- FILIN 네이버 톡톡 AI 상담 봇(talk-bot)용 대화 기록 표 SQL
-- Supabase 대시보드 → SQL Editor → New query 에 전체를 붙여 넣고 Run 을 누르세요.
-- 한 번만 실행하면 돼요. (다시 실행해도 문제없게 만들었어요)
--
-- 톡톡 손님별 최근 대화와 하루 질문 수(비용 제한)를 여기에 남겨요.
-- user_id 는 네이버가 주는 손님 구분값이에요 (네이버 아이디나 이름이 아니에요).
-- 웹·앱에서는 읽기·쓰기 모두 막아 두었고, 봇 서버(관리자 키)만 써요.

create table if not exists public.talk_turns (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  user_id     text not null check (char_length(user_id) <= 100),
  role        text not null check (role in ('user','assistant')),
  content     text not null check (char_length(content) <= 4000)
);

create index if not exists talk_turns_user_time on public.talk_turns (user_id, created_at desc);
create index if not exists talk_turns_role_time on public.talk_turns (role, created_at desc);

alter table public.talk_turns enable row level security;
-- 정책을 하나도 만들지 않아서 일반 키로는 아무것도 못 해요. (봇은 관리자 키라 RLS를 거치지 않아요)

-- 90일 지난 대화는 지워도 돼요. 가끔 아래 한 줄을 실행하세요.
-- delete from public.talk_turns where created_at < now() - interval '90 days';
