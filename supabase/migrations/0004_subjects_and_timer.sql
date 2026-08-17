-- 과목: 공통과목/선택과목 구분
alter table subjects add column if not exists is_common boolean not null default false;

-- 목표 학습량: 실제 측정 시간(타이머) 기록
alter table study_goals add column if not exists actual_minutes int;
