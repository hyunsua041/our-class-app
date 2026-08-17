"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { isAdmin, ADMIN_COOKIE_NAME } from "@/lib/auth";
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
} from "@/lib/data";

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
  if (!title || !content) return;

  await createNoticeRow({ title, content, dueDate: dueDate || undefined });
  revalidatePath("/notices");
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

export async function uploadPhoto(formData: FormData) {
  const file = formData.get("photo");
  const caption = String(formData.get("caption") || "").trim();

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false as const, error: "사진을 선택해줘." };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false as const, error: "이미지 파일(jpg, png, webp, gif)만 올릴 수 있어." };
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return { ok: false as const, error: "사진 용량은 5MB 이하로 올려줘." };
  }

  await createPhotoRow({ file, caption: caption || undefined });
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
