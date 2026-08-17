import { redirect } from "next/navigation";
import { getSubjects } from "@/lib/data";
import { getStudentId } from "@/lib/studentAuth";
import StudentAuthForm from "@/components/StudentAuthForm";

export default async function LoginPage() {
  const studentId = await getStudentId();
  if (studentId) redirect("/notices");

  const subjects = await getSubjects();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold">👋 로그인</h1>
        <p className="mt-1 text-sm text-slate-500">
          이름이랑 번호 4자리로 나만의 화면을 만들어요. 처음이면 &quot;가입하기&quot;를
          눌러줘.
        </p>
      </div>
      <StudentAuthForm subjects={subjects} />
    </div>
  );
}
