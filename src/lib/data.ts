import "server-only";
import { randomUUID } from "crypto";
import { supabase } from "@/lib/supabase";
import type {
  Notice,
  Praise,
  Photo,
  Poll,
  PollOption,
  Subject,
  Student,
  StudyGoal,
} from "@/lib/types";

const PHOTOS_BUCKET = "photos";

// --- Notices ---
export async function getNotices(): Promise<Notice[]> {
  const { data, error } = await supabase
    .from("notices")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map((n) => ({
    id: n.id,
    title: n.title,
    content: n.content,
    dueDate: n.due_date ?? undefined,
    subject: n.subject ?? null,
    createdAt: n.created_at,
  }));
}

export async function createNoticeRow(input: {
  title: string;
  content: string;
  dueDate?: string;
  subject?: string | null;
}) {
  const { data, error } = await supabase
    .from("notices")
    .insert({
      title: input.title,
      content: input.content,
      due_date: input.dueDate || null,
      subject: input.subject || null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function deleteNoticeRow(id: string) {
  const { error } = await supabase.from("notices").delete().eq("id", id);
  if (error) throw error;
}

// --- Praises ---
export async function getPraises(): Promise<Praise[]> {
  const { data, error } = await supabase
    .from("praises")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map((p) => ({
    id: p.id,
    content: p.content,
    authorName: p.author_name,
    createdAt: p.created_at,
  }));
}

export async function createPraiseRow(input: {
  content: string;
  authorName: string | null;
}) {
  const { error } = await supabase.from("praises").insert({
    content: input.content,
    author_name: input.authorName,
  });
  if (error) throw error;
}

export async function deletePraiseRow(id: string) {
  const { error } = await supabase.from("praises").delete().eq("id", id);
  if (error) throw error;
}

// --- Photos ---
export async function getPhotos(): Promise<Photo[]> {
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map((p) => ({
    id: p.id,
    url: p.url,
    caption: p.caption ?? undefined,
    createdAt: p.created_at,
  }));
}

export async function createPhotoRow(input: {
  file: File;
  caption?: string;
}) {
  const ext = input.file.name.includes(".")
    ? input.file.name.split(".").pop()
    : "";
  const path = `${randomUUID()}${ext ? `.${ext}` : ""}`;
  const bytes = Buffer.from(await input.file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .upload(path, bytes, { contentType: input.file.type });
  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(path);

  const { error } = await supabase.from("photos").insert({
    url: publicUrl,
    caption: input.caption || null,
  });
  if (error) throw error;
}

export async function deletePhotoRow(id: string) {
  const { data: photo, error: fetchError } = await supabase
    .from("photos")
    .select("url")
    .eq("id", id)
    .single();
  if (fetchError) throw fetchError;

  const marker = `/storage/v1/object/public/${PHOTOS_BUCKET}/`;
  const path = photo.url.includes(marker)
    ? photo.url.split(marker)[1]
    : undefined;
  if (path) {
    await supabase.storage.from(PHOTOS_BUCKET).remove([path]);
  }

  const { error } = await supabase.from("photos").delete().eq("id", id);
  if (error) throw error;
}

// --- Polls ---
export async function getPolls(): Promise<Poll[]> {
  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map((p) => ({
    id: p.id,
    question: p.question,
    options: p.options as PollOption[],
    createdAt: p.created_at,
  }));
}

export async function createPollRow(input: {
  question: string;
  optionTexts: string[];
}) {
  const options: PollOption[] = input.optionTexts.map((text) => ({
    id: randomUUID(),
    text,
    votes: 0,
  }));
  const { error } = await supabase.from("polls").insert({
    question: input.question,
    options,
  });
  if (error) throw error;
}

export async function deletePollRow(id: string) {
  const { error } = await supabase.from("polls").delete().eq("id", id);
  if (error) throw error;
}

export async function voteOnPoll(pollId: string, optionId: string) {
  const { data: poll, error: fetchError } = await supabase
    .from("polls")
    .select("options")
    .eq("id", pollId)
    .single();
  if (fetchError) throw fetchError;

  const options = poll.options as PollOption[];
  const option = options.find((o) => o.id === optionId);
  if (!option) return;
  option.votes += 1;

  const { error } = await supabase
    .from("polls")
    .update({ options })
    .eq("id", pollId);
  if (error) throw error;
}

// --- Subjects (공통과목 + 선택과목 목록, 관리자가 관리) ---
export async function getSubjects(): Promise<Subject[]> {
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .order("is_common", { ascending: false })
    .order("name", { ascending: true });
  if (error) throw error;
  return data.map((s) => ({ id: s.id, name: s.name, isCommon: s.is_common }));
}

export async function createSubjectRow(name: string, isCommon: boolean) {
  const { error } = await supabase
    .from("subjects")
    .insert({ name, is_common: isCommon });
  if (error) throw error;
}

export async function deleteSubjectRow(id: string) {
  const { error } = await supabase.from("subjects").delete().eq("id", id);
  if (error) throw error;
}

// --- Students (이름 + PIN 로그인) ---
function toStudent(row: {
  id: string;
  name: string;
  subjects: string[] | null;
}): Student {
  return { id: row.id, name: row.name, subjects: row.subjects ?? [] };
}

export async function getStudentById(id: string): Promise<Student | null> {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? toStudent(data) : null;
}

export async function findStudentByNamePin(
  name: string,
  pin: string
): Promise<Student | null> {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("name", name)
    .eq("pin", pin)
    .maybeSingle();
  if (error) throw error;
  return data ? toStudent(data) : null;
}

export async function nameTaken(name: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("students")
    .select("id")
    .eq("name", name)
    .limit(1);
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

export async function createStudentRow(input: {
  name: string;
  pin: string;
  subjects: string[];
}): Promise<string> {
  const { data, error } = await supabase
    .from("students")
    .insert({ name: input.name, pin: input.pin, subjects: input.subjects })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function updateStudentSubjects(id: string, subjects: string[]) {
  const { error } = await supabase
    .from("students")
    .update({ subjects })
    .eq("id", id);
  if (error) throw error;
}

// --- Study goals (목표 학습량 + 점수) ---
function toStudyGoal(row: {
  id: string;
  title: string;
  target_minutes: number;
  actual_minutes: number | null;
  points: number;
  completed: boolean;
  completed_note: string | null;
  completed_at: string | null;
  created_at: string;
}): StudyGoal {
  return {
    id: row.id,
    title: row.title,
    targetMinutes: row.target_minutes,
    actualMinutes: row.actual_minutes,
    points: row.points,
    completed: row.completed,
    completedNote: row.completed_note,
    completedAt: row.completed_at,
    createdAt: row.created_at,
  };
}

export async function getStudyGoals(studentId: string): Promise<StudyGoal[]> {
  const { data, error } = await supabase
    .from("study_goals")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(toStudyGoal);
}

export async function getTotalMinutes(studentId: string): Promise<number> {
  const { data, error } = await supabase
    .from("study_goals")
    .select("actual_minutes")
    .eq("student_id", studentId)
    .eq("completed", true);
  if (error) throw error;
  return data.reduce((sum, g) => sum + (g.actual_minutes || 0), 0);
}

export async function getClassTotalMinutes(): Promise<number> {
  const { data, error } = await supabase
    .from("study_goals")
    .select("actual_minutes")
    .eq("completed", true);
  if (error) throw error;
  return data.reduce((sum, g) => sum + (g.actual_minutes || 0), 0);
}

export async function createStudyGoalRow(input: {
  studentId: string;
  title: string;
  targetMinutes: number;
}) {
  const points = Math.max(1, Math.round(input.targetMinutes / 10));
  const { error } = await supabase.from("study_goals").insert({
    student_id: input.studentId,
    title: input.title,
    target_minutes: input.targetMinutes,
    points,
  });
  if (error) throw error;
}

export async function completeStudyGoalRow(
  id: string,
  studentId: string,
  actualMinutes: number,
  note: string
) {
  const points = Math.max(1, Math.round(actualMinutes / 10));
  const { error } = await supabase
    .from("study_goals")
    .update({
      completed: true,
      actual_minutes: actualMinutes,
      points,
      completed_note: note || null,
      completed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("student_id", studentId);
  if (error) throw error;
}

export async function deleteStudyGoalRow(id: string, studentId: string) {
  const { error } = await supabase
    .from("study_goals")
    .delete()
    .eq("id", id)
    .eq("student_id", studentId);
  if (error) throw error;
}

// --- Push subscriptions ---
export async function saveSubscriptionRow(input: {
  studentId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}) {
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      student_id: input.studentId,
      endpoint: input.endpoint,
      p256dh: input.p256dh,
      auth: input.auth,
    },
    { onConflict: "endpoint" }
  );
  if (error) throw error;
}

// --- Reminders (마감 하루/일주일 전 자동 알림) ---
export async function getNoticesNeedingReminder(
  field: "reminded_1day" | "reminded_7day",
  targetDate: string
): Promise<Notice[]> {
  const { data, error } = await supabase
    .from("notices")
    .select("*")
    .eq("due_date", targetDate)
    .eq(field, false);
  if (error) throw error;
  return data.map((n) => ({
    id: n.id,
    title: n.title,
    content: n.content,
    dueDate: n.due_date ?? undefined,
    subject: n.subject ?? null,
    createdAt: n.created_at,
  }));
}

export async function markReminded(
  id: string,
  field: "reminded_1day" | "reminded_7day"
) {
  const { error } = await supabase
    .from("notices")
    .update({ [field]: true })
    .eq("id", id);
  if (error) throw error;
}
