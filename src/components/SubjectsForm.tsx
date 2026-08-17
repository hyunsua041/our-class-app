"use client";

import { useTransition } from "react";
import type { Subject } from "@/lib/types";

export default function SubjectsForm({
  subjects,
  mySubjects,
  action,
}: {
  subjects: Subject[];
  mySubjects: string[];
  action: (formData: FormData) => Promise<void> | void;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => startTransition(() => action(formData))}
      className="flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm"
    >
      <div className="flex flex-wrap gap-2">
        {subjects.length === 0 && (
          <p className="text-xs text-slate-400">
            아직 등록된 선택과목이 없어요.
          </p>
        )}
        {subjects.map((s) => (
          <label
            key={s.id}
            className="flex items-center gap-1 rounded-full border px-3 py-1 text-sm has-checked:border-sky-400 has-checked:bg-sky-50"
          >
            <input
              type="checkbox"
              name="subjects"
              value={s.name}
              defaultChecked={mySubjects.includes(s.name)}
            />
            {s.name}
          </label>
        ))}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="self-end rounded-md bg-sky-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {pending ? "저장 중..." : "저장"}
      </button>
    </form>
  );
}
