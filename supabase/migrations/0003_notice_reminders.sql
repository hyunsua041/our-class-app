-- 마감 하루/일주일 전 알림을 중복 발송하지 않기 위한 표시 컬럼
alter table notices add column if not exists reminded_1day boolean not null default false;
alter table notices add column if not exists reminded_7day boolean not null default false;
