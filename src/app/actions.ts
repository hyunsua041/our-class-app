"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { isAdmin, ADMIN_COOKIE_NAME } from "@/lib/auth";
import { getStudentId, STUDENT_COOKIE_NAME } from "@/lib/studentAuth";
import {
  createNoticeRow,
  deleteNoticeRow,
  createPraiseRow,
  deletePraiseRow,
  createPhotoRow,
  deletePhotoRow,
  createPollRow,
  deletePollRow,
  voteOnPoll,
  createSubjectRow,
  deleteSubjectRow,
  findStudentByNamePin,
  createStudentRow,
  updateStudentSubjects,
  createStudyGoalRow,
  completeStudyGoalRow,
  deleteStudyGoalRow,
  saveSubscriptionRow,
} from "@/lib/data";
import { sendPushToAudience } from "@/lib/webpush";

// --- Admin ---
export async function adminLogin(formData: FormData) {
  const password = String(formData.get("password") || "");
  if (password && password === process.env.ADMIN_PASSWORD) {
    const store = await cookies();
    store.set(ADMIN_COOKIE_NAME, process.env.ADMIN_SESSION_SECRET!, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return { ok: true as const };
  }
  return { ok: false as const, error: "비밀번호가 틀렸어요." };
}

export async function adminLogout() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE_NAME);
  revalidatePath("/");
}

// --- Notices ---
export async function createNotice(formData: FormData) {
  if (!(await isAdmin())) throw new Error("권한이 없어요.");
  const title = String(formData.get("title") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const dueDate = String(formData.get("dueDate") || "").trim();
  const subjects = formData.getAll("subjects").map(String);
  if (!title || !content) return;

  await createNoticeRow({
    title,
    content,
    dueDate: dueDate || undefined,
    subjects,
  });
  revalidatePath("/notices");

  sendPushToAudience(subjects, {
    title: "📢 새 공지: " + title,
    body: content.slice(0, 80),
    url: "/notices",
  }).catch(() => {});
}

export async function deleteNotice(id: string) {
  if (!(await isAdmin())) throw new Error("권한이 없어요.");
  await deleteNoticeRow(id);
  revalidatePath("/notices");
}

// --- Praise ---
export async function createPraise(formData: FormData) {
  const content = String(formData.get("content") || "").trim();
  const isAnonymous = formData.get("isAnonymous") === "on";
  const authorName = String(formData.get("authorName") || "").trim();
  if (!content) return;

  await createPraiseRow({
    content,
    authorName: isAnonymous ? null : authorName || null,
  });
  revalidatePath("/praise");
}

export async function deletePraise(id: string) {
  if (!(await isAdmin())) throw new Error("권한이 없어요.");
  await deletePraiseRow(id);
  revalidatePath("/praise");
}

// --- Photos ---
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const HEIC_TYPES = ["image/heic", "image/heif"];

function isHeicFile(file: File) {
  return HEIC_TYPES.includes(file.type) || /\.hei[cf]$/i.test(file.name);
}

async function convertHeicToJpeg(file: File): Promise<File> {
  const heicConvert = (await import("heic-convert")).default;
  const inputBuffer = Buffer.from(await file.arrayBuffer());
  const outputBuffer = await heicConvert({
    buffer: inputBuffer,
    format: "JPEG",
    quality: 0.85,
  });
  return new File(
    [new Uint8Array(outputBuffer)],
    file.name.replace(/\.hei[cf]$/i, ".jpg"),
    { type: "image/jpeg" }
  );
}

export async function uploadPhoto(formData: FormData) {
  const file = formData.get("photo");
  const caption = String(formData.get("caption") || "").trim();

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false as const, error: "사진을 선택해줘." };
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return { ok: false as const, error: "사진 용량은 5MB 이하로 올려줘." };
  }

  let uploadFile = file;
  if (isHeicFile(file)) {
    try {
      uploadFile = await convertHeicToJpeg(file);
    } catch (err) {
      console.error("HEIC convert failed", err);
      return {
        ok: false as const,
        error: "아이폰 사진 변환에 실패했어. 다른 사진으로 다시 시도해줘.",
      };
    }
  } else if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      ok: false as const,
      error: "이미지 파일(jpg, png, webp, gif, 아이폰 사진)만 올릴 수 있어.",
    };
  }

  await createPhotoRow({ file: uploadFile, caption: caption || undefined });
  revalidatePath("/photos");
  return { ok: true as const };
}

export async function deletePhoto(id: string) {
  if (!(await isAdmin())) throw new Error("권한이 없어요.");
  await deletePhotoRow(id);
  revalidatePath("/photos");
}

// --- Polls (우리반 투표) ---
const VOTED_POLLS_COOKIE = "voted_polls";

export async function createPoll(formData: FormData) {
  if (!(await isAdmin())) throw new Error("권한이 없어요.");
  const question = String(formData.get("question") || "").trim();
  const optionsRaw = String(formData.get("options") || "");
  const optionTexts = optionsRaw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!question || optionTexts.length < 2) return;

  await createPollRow({ question, optionTexts });
  revalidatePath("/polls");
}

export async function deletePoll(id: string) {
  if (!(await isAdmin())) throw new Error("권한이 없어요.");
  await deletePollRow(id);
  revalidatePath("/polls");
}

export async function votePoll(pollId: string, optionId: string) {
  const store = await cookies();
  const voted = (store.get(VOTED_POLLS_COOKIE)?.value || "")
    .split(",")
    .filter(Boolean);
  if (voted.includes(pollId)) return;

  await voteOnPoll(pollId, optionId);

  voted.push(pollId);
  store.set(VOTED_POLLS_COOKIE, voted.join(","), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath("/polls");
}

// --- Subjects (선택과목 목록, 관리자 전용) ---
export async function createSubject(formData: FormData) {
  if (!(await isAdmin())) throw new Error("권한이 없어요.");
  const name = String(formData.get("name") || "").trim();
  const isCommon = formData.get("isCommon") === "on";
  if (!name) return;
  await createSubjectRow(name, isCommon);
  revalidatePath("/admin");
  revalidatePath("/login");
}

export async function deleteSubject(id: string) {
  if (!(await isAdmin())) throw new Error("권한이 없어요.");
  await deleteSubjectRow(id);
  revalidatePath("/admin");
  revalidatePath("/login");
}

// --- Students (이름 + 번호 로그인) ---
const STUDENT_SESSION_MAX_AGE = 60 * 60 * 24 * 365;

function isValidPin(pin: string) {
  return /^\d{4}$/.test(pin);
}

export async function studentSignup(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const pin = String(formData.get("pin") || "").trim();
  const subjects = formData.getAll("subjects").map(String);

  if (!name) return { ok: false as const, error: "이름을 입력해줘." };
  if (!isValidPin(pin))
    return { ok: false as const, error: "번호는 숫자 4자리로 입력해줘." };

  const store = await cookies();
  const existing = await findStudentByNamePin(name, pin);
  const id = existing
    ? existing.id
    : await createStudentRow({ name, pin, subjects });
  const finalSubjects = existing ? existing.subjects : subjects;

  store.set(STUDENT_COOKIE_NAME, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: STUDENT_SESSION_MAX_AGE,
  });
  revalidatePath("/");
  return { ok: true as const, needsSubjects: finalSubjects.length === 0 };
}

export async function studentLogin(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const pin = String(formData.get("pin") || "").trim();
  if (!name || !isValidPin(pin)) {
    return { ok: false as const, error: "이름과 번호 4자리를 입력해줘." };
  }
  const student = await findStudentByNamePin(name, pin);
  if (!student) {
    return {
      ok: false as const,
      error: "이름 또는 번호가 일치하지 않아. 처음이면 '가입하기'를 눌러줘.",
    };
  }
  const store = await cookies();
  store.set(STUDENT_COOKIE_NAME, student.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: STUDENT_SESSION_MAX_AGE,
  });
  revalidatePath("/");
  return { ok: true as const, needsSubjects: student.subjects.length === 0 };
}

export async function studentLogout() {
  const store = await cookies();
  store.delete(STUDENT_COOKIE_NAME);
  revalidatePath("/");
}

export async function updateMySubjects(formData: FormData) {
  const studentId = await getStudentId();
  if (!studentId) throw new Error("로그인이 필요해요.");
  const subjects = formData.getAll("subjects").map(String);
  await updateStudentSubjects(studentId, subjects);
  revalidatePath("/notices");
  revalidatePath("/me");
}

// --- Study goals (목표 학습량 + 점수) ---
export async function createStudyGoal(formData: FormData) {
  const studentId = await getStudentId();
  if (!studentId) throw new Error("로그인이 필요해요.");
  const title = String(formData.get("title") || "").trim();
  const targetMinutes = Number(formData.get("targetMinutes") || 0);
  if (!title || !targetMinutes || targetMinutes <= 0) return;
  await createStudyGoalRow({ studentId, title, targetMinutes });
  revalidatePath("/goals");
}

export async function completeStudyGoal(id: string, formData: FormData) {
  const studentId = await getStudentId();
  if (!studentId) throw new Error("로그인이 필요해요.");
  const note = String(formData.get("note") || "").trim();
  const actualMinutes = Math.max(1, Number(formData.get("actualMinutes") || 0));
  await completeStudyGoalRow(id, studentId, actualMinutes, note);
  revalidatePath("/goals");
}

export async function deleteStudyGoal(id: string) {
  const studentId = await getStudentId();
  if (!studentId) throw new Error("로그인이 필요해요.");
  await deleteStudyGoalRow(id, studentId);
  revalidatePath("/goals");
}

// --- 웹 푸시 구독 ---
export async function saveSubscription(sub: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}) {
  const studentId = await getStudentId();
  if (!studentId) return { ok: false as const, error: "로그인이 필요해요." };
  await saveSubscriptionRow({
    studentId,
    endpoint: sub.endpoint,
    p256dh: sub.keys.p256dh,
    auth: sub.keys.auth,
  });
  return { ok: true as const };
}
