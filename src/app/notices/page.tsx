import { readCollection } from "@/lib/store";
import { isAdmin } from "@/lib/auth";
import type { Notice } from "@/lib/types";
import { createNotice, deleteNotice } from "@/app/actions";
import DeleteButton from "@/components/DeleteButton";

export default async function NoticesPage() {
  const admin = await isAdmin();
  const notices = readCollection<Notice>("notices");

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

      <ul className="flex flex-col gap-3">
        {notices.length === 0 && (
          <li className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-400">
            아직 등록된 공지가 없어요.
          </li>
        )}
        {notices.map((n) => (
          <li key={n.id} className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-semibold">{n.title}</h2>
              {admin && <DeleteButton onDelete={deleteNotice.bind(null, n.id)} />}
            </div>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
              {n.content}
            </p>
            <div className="mt-2 flex gap-3 text-xs text-slate-400">
              <span>{formatDate(n.createdAt)}</span>
              {n.dueDate && (
                <span className="font-semibold text-rose-500">
                  마감 {n.dueDate} ({dDay(n.dueDate)})
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
}

function dDay(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "D-day";
  return diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;
}
