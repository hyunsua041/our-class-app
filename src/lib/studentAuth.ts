import "server-only";
import { cookies } from "next/headers";
import { getStudentById } from "@/lib/data";
import type { Student } from "@/lib/types";

export const STUDENT_COOKIE_NAME = "student_id";

export async function getStudentId(): Promise<string | null> {
  const store = await cookies();
  return store.get(STUDENT_COOKIE_NAME)?.value ?? null;
}

export async function getCurrentStudent(): Promise<Student | null> {
  const id = await getStudentId();
  if (!id) return null;
  return getStudentById(id);
}
