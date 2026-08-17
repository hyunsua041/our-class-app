"use client";

import { useTransition } from "react";

export default function DeleteButton({
  onDelete,
  label = "삭제",
}: {
  onDelete: () => Promise<void> | void;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (confirm("정말 삭제할까요?")) {
          startTransition(() => {
            onDelete();
          });
        }
      }}
      disabled={pending}
      className="rounded-md bg-white/80 px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-50"
    >
      {pending ? "삭제 중..." : label}
    </button>
  );
}
