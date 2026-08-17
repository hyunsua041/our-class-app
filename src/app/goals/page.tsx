import { redirect } from "next/navigation";
import { getCurrentStudent } from "@/lib/studentAuth";
import { getStudyGoals, getTotalPoints } from "@/lib/data";
import { createStudyGoal, completeStudyGoal, deleteStudyGoal } from "@/app/actions";
import GoalForm from "@/components/GoalForm";
import GoalItem from "@/components/GoalItem";

export default async function GoalsPage() {
  const student = await getCurrentStudent();
  if (!student) redirect("/login");

  const [goals, points] = await Promise.all([
    getStudyGoals(student.id),
    getTotalPoints(student.id),
  ]);
  const incomplete = goals.filter((g) => !g.completed);
  const completed = goals.filter((g) => g.completed);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold">🎯 목표 학습량</h1>
        <p className="mt-1 text-sm text-slate-500">
          공부 목표를 정하고, 끝내면 체크! 누적 점수{" "}
          <span className="font-semibold text-violet-600">{points}점</span>
        </p>
      </div>

      <GoalForm action={createStudyGoal} />

      <ul className="flex flex-col gap-3">
        {incomplete.length === 0 && completed.length === 0 && (
          <li className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-400">
            아직 목표가 없어요. 하나 만들어봐요!
          </li>
        )}
        {incomplete.map((g) => (
          <GoalItem
            key={g.id}
            goal={g}
            onComplete={completeStudyGoal.bind(null, g.id)}
            onDelete={deleteStudyGoal.bind(null, g.id)}
          />
        ))}
        {completed.map((g) => (
          <GoalItem
            key={g.id}
            goal={g}
            onComplete={completeStudyGoal.bind(null, g.id)}
            onDelete={deleteStudyGoal.bind(null, g.id)}
          />
        ))}
      </ul>
    </div>
  );
}
