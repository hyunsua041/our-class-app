"use client";

import { useRef, useState } from "react";

export default function PraiseForm({
  action,
}: {
  action: (formData: FormData) => Promise<void> | void;
}) {
  const [isAnonymous, setIsAnonymous] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await action(formData);
        formRef.current?.reset();
        setIsAnonymous(false);
      }}
      className="flex flex-col gap-2 rounded-xl border bg-white p-4 shadow-sm"
    >
      <textarea
        name="content"
        required
        placeholder="칭찬 내용을 적어주세요"
        rows={3}
        className="rounded-md border px-3 py-2 text-sm"
      />
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          name="isAnonymous"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
        />
        익명으로 쓰기
      </label>
      {!isAnonymous && (
        <input
          name="authorName"
          placeholder="이름 (선택)"
          className="rounded-md border px-3 py-2 text-sm"
        />
      )}
      <button className="self-end rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-white">
        칭찬 남기기
      </button>
    </form>
  );
}
