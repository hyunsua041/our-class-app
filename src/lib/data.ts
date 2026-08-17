import "server-only";
import { randomUUID } from "crypto";
import { supabase } from "@/lib/supabase";
import type { Notice, Praise, Photo, Poll, PollOption } from "@/lib/types";

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
    createdAt: n.created_at,
  }));
}

export async function createNoticeRow(input: {
  title: string;
  content: string;
  dueDate?: string;
}) {
  const { error } = await supabase.from("notices").insert({
    title: input.title,
    content: input.content,
    due_date: input.dueDate || null,
  });
  if (error) throw error;
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
