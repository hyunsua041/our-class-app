alter table photos add column if not exists student_id uuid references students(id) on delete set null;
