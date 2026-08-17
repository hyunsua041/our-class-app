"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { studentLogin, studentSignup } from "@/app/actions";
import type { Subject } from "@/lib/types";

type AuthState = { ok: boolean; error?: string } | null;

export default function StudentAuthForm({ subjects }: { subjects: Subject[] }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const router = useRouter();

  const action = mode === "login" ? studentLogin : studentSignup;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    async (_prev, formData) => {
      const res = await action(formData);
      if (res.ok) router.push("/notices");
      return res;
    },
    null
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1 rounded-lg bg-slate-100 p-1 text-sm">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 rounded-md py-2 font-medium ${
            mode === "login" ? "bg-white shadow-sm" : "text-slate-500"
          }`}
        >
          로그인
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-md py-2 font-medium ${
            mode === "signup" ? "bg-white shadow-sm" : "text-slate-500"
          }`}
        >
          처음이에요 (가입)
        </button>
      </div>

      <form
        action={formAction}
        className="flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm"
      >
        <label className="flex flex-col gap-1 text-sm">
          이름
          <input
            name="name"
            required
            placeholder="이름"
            className="rounded-md border px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          번호 (숫자 4자리, 나만 아는 걸로)
          <input
            name="pin"
            required
            inputMode="numeric"
            pattern="[0-9]{4}"
            maxLength={4}
            placeholder="예: 1234"
            className="rounded-md border px-3 py-2 text-sm"
          />
        </label>

        {mode === "signup" && (
          <fieldset className="flex flex-col gap-2 text-sm">
            <legend className="mb-1">내 선택과목 (여러 개 선택 가능)</legend>
            {subjects.length === 0 && (
              <p className="text-xs text-slate-400">
                아직 등록된 선택과목이 없어요. 나중에 추가할 수 있어요.
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {subjects.map((s) => (
                <label
                  key={s.id}
                  className="flex items-center gap-1 rounded-full border px-3 py-1 has-checked:border-sky-400 has-checked:bg-sky-50"
                >
                  <input type="checkbox" name="subjects" value={s.name} />
                  {s.name}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-sky-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? "처리 중..." : mode === "login" ? "로그인" : "가입하고 시작하기"}
        </button>
        {state?.error && <p className="text-xs text-red-500">{state.error}</p>}
      </form>
    </div>
  );
}
