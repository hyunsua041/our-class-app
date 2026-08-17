alter table notices add column if not exists subjects text[] not null default '{}';
alter table notices drop column if exists subject;
