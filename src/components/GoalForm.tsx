"use client";

import { useRef } from "react";

export default function GoalForm({
  action,
}: {
  action: (formData: FormData) => Promise<void> | void;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await action(formData);
        formRef.current?.reset();
      }}
      className="flex flex-col gap-2 rounded-xl border bg-white p-4 shadow-sm"
    >
      <input
        name="title"
        required
        placeholder="목표 (예: 수학 3단원 복습)"
        className="rounded-md border px-3 py-2 text-sm"
      />
      <label className="flex items-center gap-2 text-sm text-slate-600">
        목표 시간(분)
        <input
          name="targetMinutes"
          type="number"
          min={1}
          required
          placeholder="60"
          className="w-24 rounded-md border px-2 py-1 text-sm"
        />
      </label>
      <button className="self-end rounded-md bg-violet-500 px-4 py-2 text-sm font-semibold text-white">
        목표 추가
      </button>
    </form>
  );
}
