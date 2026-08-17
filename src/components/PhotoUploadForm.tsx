"use client";

import { useActionState, useRef } from "react";
import { uploadPhoto } from "@/app/actions";

type UploadState = { ok: boolean; error?: string } | null;

export default function PhotoUploadForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<UploadState, FormData>(
    async (_prev, formData) => {
      const res = await uploadPhoto(formData);
      if (res?.ok) {
        formRef.current?.reset();
      }
      return res ?? null;
    },
    null
  );

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-2 rounded-xl border bg-white p-4 shadow-sm"
    >
      <input type="file" name="photo" accept="image/*" required className="text-sm" />
      <input
        name="caption"
        placeholder="사진 설명 (선택)"
        className="rounded-md border px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="self-end rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {pending ? "업로드 중..." : "사진 올리기"}
      </button>
      {state?.error && <p className="text-xs text-red-500">{state.error}</p>}
    </form>
  );
}
