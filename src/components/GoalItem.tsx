"use client";

import DeleteButton from "@/components/DeleteButton";
import GoalTimer from "@/components/GoalTimer";
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
  if (goal.completed) {
    return (
      <li className="rounded-xl border bg-violet-50 p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-slate-700">
              ✅ {goal.title}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              목표 {goal.targetMinutes}분 · ⏱ {goal.actualMinutes}분 완료
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
            목표 {goal.targetMinutes}분
          </p>
        </div>
        <DeleteButton onDelete={onDelete} />
      </div>

      <GoalTimer goalId={goal.id} onComplete={onComplete} />
    </li>
  );
}
