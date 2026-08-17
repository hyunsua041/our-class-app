"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin, adminLogout } from "@/app/actions";

type LoginState = { ok: boolean; error?: string } | null;

export default function AdminBar({ isAdmin }: { isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    async (_prev, formData) => {
      const res = await adminLogin(formData);
      if (res.ok) {
        setOpen(false);
        router.refresh();
      }
      return res;
    },
    null
  );

  if (isAdmin) {
    return (
      <form action={adminLogout}>
        <button className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
          관리자 모드 · 로그아웃
        </button>
      </form>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-full border px-3 py-1 text-xs font-medium text-slate-500"
      >
        관리자 로그인
      </button>
      {open && (
        <form
          action={formAction}
          className="absolute right-0 top-9 z-20 flex w-56 flex-col gap-2 rounded-xl border bg-white p-3 shadow-lg"
        >
          <input
            type="password"
            name="password"
            placeholder="관리자 비밀번호"
            className="rounded-md border px-2 py-1 text-sm"
            autoFocus
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-sky-500 px-2 py-1 text-sm font-semibold text-white disabled:opacity-50"
          >
            {pending ? "확인 중..." : "입장"}
          </button>
          {state?.error && <p className="text-xs text-red-500">{state.error}</p>}
        </form>
      )}
    </div>
  );
}
