import Link from "next/link";
import { studentLogout } from "@/app/actions";
import type { Student } from "@/lib/types";

export default function StudentBar({ student }: { student: Student | null }) {
  if (!student) {
    return (
      <Link
        href="/login"
        className="rounded-full border px-3 py-1 text-xs font-medium text-slate-500"
      >
        학생 로그인
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/me" className="text-xs text-slate-500 underline">
        {student.name}님
      </Link>
      <form action={studentLogout}>
        <button className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          로그아웃
        </button>
      </form>
    </div>
  );
}
