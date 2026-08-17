-- Phase 2: 학생 로그인, 선택과목, 알림 구독, 목표 학습량

create table if not exists subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  pin text not null,
  subjects text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (name, pin)
);

alter table notices add column if not exists subject text;

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create table if not exists study_goals (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  title text not null,
  target_minutes int not null,
  points int not null,
  completed boolean not null default false,
  completed_note text,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table subjects enable row level security;
alter table students enable row level security;
alter table push_subscriptions enable row level security;
alter table study_goals enable row level security;
