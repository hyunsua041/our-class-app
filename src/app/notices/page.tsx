import { getNotices, getSubjects } from "@/lib/data";
import { isAdmin } from "@/lib/auth";
import { getCurrentStudent } from "@/lib/studentAuth";
import { createNotice, deleteNotice } from "@/app/actions";
import NoticeList from "@/components/NoticeList";

export default async function NoticesPage() {
  const admin = await isAdmin();
  const student = await getCurrentStudent();
  const notices = await getNotices();
  const subjects = admin ? await getSubjects() : [];

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
          <label className="flex items-center gap-2 text-xs text-slate-500">
            관련 과목 (선택 안 하면 전체 공지)
            <select
              name="subject"
              defaultValue=""
              className="rounded-md border px-2 py-1 text-sm"
            >
              <option value="">전체</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
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
        onDelete={deleteNotice}
      />
    </div>
  );
}
