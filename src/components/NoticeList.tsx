"use client";

import { useState } from "react";
import DeleteButton from "@/components/DeleteButton";
import type { Notice } from "@/lib/types";

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

export default function NoticeList({
  notices,
  admin,
  mySubjects,
  commonSubjectNames,
  onDelete,
}: {
  notices: Notice[];
  admin: boolean;
  mySubjects: string[] | null;
  commonSubjectNames: string[];
  onDelete: (id: string) => Promise<void> | void;
}) {
  const [onlyMine, setOnlyMine] = useState(!!mySubjects && mySubjects.length > 0);

  const visible =
    onlyMine && mySubjects
      ? notices.filter(
          (n) =>
            !n.subject ||
            mySubjects.includes(n.subject) ||
            commonSubjectNames.includes(n.subject)
        )
      : notices;

  return (
    <div className="flex flex-col gap-3">
      {mySubjects && mySubjects.length > 0 && (
        <div className="flex gap-1 self-start rounded-lg bg-slate-100 p-1 text-xs">
          <button
            onClick={() => setOnlyMine(true)}
            className={`rounded-md px-3 py-1.5 font-medium ${
              onlyMine ? "bg-white shadow-sm" : "text-slate-500"
            }`}
          >
            내 과목만
          </button>
          <button
            onClick={() => setOnlyMine(false)}
            className={`rounded-md px-3 py-1.5 font-medium ${
              !onlyMine ? "bg-white shadow-sm" : "text-slate-500"
            }`}
          >
            전체 보기
          </button>
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {visible.length === 0 && (
          <li className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-400">
            {onlyMine ? "내 과목 관련 공지가 아직 없어요." : "아직 등록된 공지가 없어요."}
          </li>
        )}
        {visible.map((n) => (
          <li key={n.id} className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-semibold">{n.title}</h2>
              {admin && <DeleteButton onDelete={() => onDelete(n.id)} />}
            </div>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
              {n.content}
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
              <span>{formatDate(n.createdAt)}</span>
              {n.subject && (
                <span className="rounded-full bg-sky-100 px-2 py-0.5 font-medium text-sky-600">
                  {n.subject}
                </span>
              )}
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
