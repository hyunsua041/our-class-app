"use client";

import { useState, useTransition } from "react";
import DeleteButton from "@/components/DeleteButton";
import type { StudyGoal } from "@/lib/types";

export default function GoalItem({
  goal,
  onComplete,
  onDelete,
}: {
  goal: StudyGoal;
  onComplete: (formData: FormData) => Promise<void> | void;
  onDelete: () => Promise<void> | void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  if (goal.completed) {
    return (
      <li className="rounded-xl border bg-violet-50 p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-slate-700">
              ✅ {goal.title}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              목표 {goal.targetMinutes}분 · +{goal.points}점
            </p>
            {goal.completedNote && (
              <p className="mt-1 text-xs text-slate-500">
                📝 {goal.completedNote}
              </p>
            )}
          </div>
          <DeleteButton onDelete={onDelete} />
        </div>
      </li>
    );
  }

  return (
    <li className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-700">{goal.title}</p>
          <p className="mt-1 text-xs text-slate-500">
            목표 {goal.targetMinutes}분 · 완료 시 +{goal.points}점
          </p>
        </div>
        <DeleteButton onDelete={onDelete} />
      </div>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="mt-3 rounded-md bg-violet-500 px-3 py-1.5 text-xs font-semibold text-white"
        >
          목표 달성! 체크하기
        </button>
      ) : (
        <form
          action={(formData) => startTransition(() => onComplete(formData))}
          className="mt-3 flex flex-col gap-2"
        >
          <input
            name="note"
            placeholder="한 줄 메모 (예: 개념 정리 + 문제 20개)"
            className="rounded-md border px-3 py-2 text-xs"
          />
          <button
            type="submit"
            disabled={pending}
            className="self-end rounded-md bg-violet-500 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
          >
            {pending ? "저장 중..." : "완료 확정"}
          </button>
        </form>
      )}
    </li>
  );
}
