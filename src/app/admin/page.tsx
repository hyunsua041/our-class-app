import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getSubjects } from "@/lib/data";
import type { Subject } from "@/lib/types";
import { createSubject, deleteSubject } from "@/app/actions";
import DeleteButton from "@/components/DeleteButton";

export default async function AdminPage() {
  const admin = await isAdmin();
  if (!admin) redirect("/notices");

  const subjects: Subject[] = await getSubjects();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold">⚙️ 관리</h1>
        <p className="mt-1 text-sm text-slate-500">
          선택과목 목록을 관리해요. 여기 등록한 과목이 학생 가입 화면과 공지
          작성 화면에 나타나요.
        </p>
      </div>

      <form
        action={createSubject}
        className="flex flex-wrap items-center gap-2 rounded-xl border bg-white p-4 shadow-sm"
      >
        <input
          name="name"
          required
          placeholder="과목 이름 (예: 미적분)"
          className="min-w-0 flex-1 rounded-md border px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-1 text-xs text-slate-500">
          <input type="checkbox" name="isCommon" />
          공통과목
        </label>
        <button className="rounded-md bg-sky-500 px-4 py-2 text-sm font-semibold text-white">
          추가
        </button>
      </form>

      {(["공통과목", "선택과목"] as const).map((label) => {
        const list = subjects.filter((s) =>
          label === "공통과목" ? s.isCommon : !s.isCommon
        );
        return (
          <div key={label} className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-slate-600">{label}</h2>
            <ul className="flex flex-col gap-2">
              {list.length === 0 && (
                <li className="rounded-xl border border-dashed p-4 text-center text-sm text-slate-400">
                  등록된 과목이 없어요.
                </li>
              )}
              {list.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-xl border bg-white px-4 py-2 shadow-sm"
                >
                  <span className="text-sm">{s.name}</span>
                  <DeleteButton onDelete={deleteSubject.bind(null, s.id)} />
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
