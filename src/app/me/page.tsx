import { redirect } from "next/navigation";
import { getCurrentStudent } from "@/lib/studentAuth";
import { getSubjects, getTotalPoints } from "@/lib/data";
import { updateMySubjects } from "@/app/actions";
import SubjectsForm from "@/components/SubjectsForm";
import PushSubscribeButton from "@/components/PushSubscribeButton";

export default async function MePage() {
  const student = await getCurrentStudent();
  if (!student) redirect("/login");

  const [subjects, points] = await Promise.all([
    getSubjects(),
    getTotalPoints(student.id),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold">👤 {student.name}님</h1>
        <p className="mt-1 text-sm text-slate-500">
          누적 점수 <span className="font-semibold text-violet-600">{points}점</span>
        </p>
      </div>

      <PushSubscribeButton />

      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-600">내 선택과목</h2>
        <SubjectsForm
          subjects={subjects}
          mySubjects={student.subjects}
          action={updateMySubjects}
        />
      </div>
    </div>
  );
}
