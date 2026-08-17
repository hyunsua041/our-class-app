import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "admin_session";

export async function isAdmin() {
  const store = await cookies();
  const value = store.get(ADMIN_COOKIE_NAME)?.value;
  return !!value && value === process.env.ADMIN_SESSION_SECRET;
}
