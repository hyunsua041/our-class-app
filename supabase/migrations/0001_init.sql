-- 우리반 앱: 공지사항 / 칭찬 게시판 / 추억 사진 / 우리반 투표 테이블
create extension if not exists pgcrypto;

create table if not exists notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  due_date date,
  created_at timestamptz not null default now()
);

create table if not exists praises (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  author_name text,
  created_at timestamptz not null default now()
);

create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  caption text,
  created_at timestamptz not null default now()
);

create table if not exists polls (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  options jsonb not null,
  created_at timestamptz not null default now()
);

-- RLS를 켜두고 정책은 만들지 않음 -> 외부(publishable key)에서는 직접 접근 불가,
-- 서버(secret key)에서만 데이터를 읽고 쓸 수 있음 (지금 앱 구조와 일치).
alter table notices enable row level security;
alter table praises enable row level security;
alter table photos enable row level security;
alter table polls enable row level security;
