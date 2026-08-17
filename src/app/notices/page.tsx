import { getNotices, getSubjects } from "@/lib/data";
import { isAdmin } from "@/lib/auth";
import { getCurrentStudent } from "@/lib/studentAuth";
import { createNotice, deleteNotice } from "@/app/actions";
import NoticeList from "@/components/NoticeList";

export default async function NoticesPage() {
  const admin = await isAdmin();
  const student = await getCurrentStudent();
  const notices = await getNotices();
  const subjects = await getSubjects();
  const commonSubjectNames = subjects.filter((s) => s.isCommon).map((s) => s.name);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold">📢 공지사항</h1>
        <p className="mt-1 text-sm text-slate-500">
          수행평가, 준비물 등 반 공지를 확인해요.
        </p>
      </div>

      {admin && (
        <form
          action={createNotice}
          className="flex flex-col gap-2 rounded-xl border bg-white p-4 shadow-sm"
        >
          <input
            name="title"
            required
            placeholder="제목"
            className="rounded-md border px-3 py-2 text-sm"
          />
          <textarea
            name="content"
            required
            placeholder="내용"
            rows={3}
            className="rounded-md border px-3 py-2 text-sm"
          />
          <fieldset className="flex flex-col gap-1 text-xs text-slate-500">
            <legend className="mb-1">
              관련 과목 (여러 개 선택 가능, 아무것도 안 고르면 전체 공지)
            </legend>
            <div className="flex flex-wrap gap-1.5">
              {subjects.map((s) => (
                <label
                  key={s.id}
                  className="flex items-center gap-1 rounded-full border px-2.5 py-1 has-checked:border-sky-400 has-checked:bg-sky-50"
                >
                  <input type="checkbox" name="subjects" value={s.name} />
                  {s.name}
                  {s.isCommon && (
                    <span className="text-[10px] text-slate-400">공통</span>
                  )}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="flex items-center gap-2 text-xs text-slate-500">
            마감일 (선택)
            <input
              name="dueDate"
              type="date"
              className="rounded-md border px-2 py-1 text-sm"
            />
          </label>
          <button className="self-end rounded-md bg-sky-500 px-4 py-2 text-sm font-semibold text-white">
            공지 올리기
          </button>
        </form>
      )}

      <NoticeList
        notices={notices}
        admin={admin}
        mySubjects={student ? student.subjects : null}
        commonSubjectNames={commonSubjectNames}
        onDelete={deleteNotice}
      />
    </div>
  );
}
