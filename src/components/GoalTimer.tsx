"use client";

import { useEffect, useState, useTransition } from "react";

function storageKey(goalId: string) {
  return `goal_timer_${goalId}`;
}

export default function GoalTimer({
  goalId,
  onComplete,
}: {
  goalId: string;
  onComplete: (formData: FormData) => Promise<void> | void;
}) {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const saved = localStorage.getItem(storageKey(goalId));
    if (saved) setStartedAt(Number(saved));
  }, [goalId]);

  useEffect(() => {
    if (startedAt == null) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  function start() {
    const t = Date.now();
    localStorage.setItem(storageKey(goalId), String(t));
    setStartedAt(t);
  }

  function confirmComplete() {
    if (startedAt == null) return;
    const minutes = Math.max(1, Math.round((Date.now() - startedAt) / 60000));
    const fd = new FormData();
    fd.set("actualMinutes", String(minutes));
    fd.set("note", note);
    startTransition(async () => {
      await onComplete(fd);
      localStorage.removeItem(storageKey(goalId));
    });
  }

  if (startedAt == null) {
    return (
      <button
        onClick={start}
        className="mt-3 rounded-md bg-rose-400 px-3 py-1.5 text-xs font-semibold text-white"
      >
        ⏱ 타이머 시작
      </button>
    );
  }

  const elapsedSec = now ? Math.floor((now - startedAt) / 1000) : 0;
  const mm = String(Math.floor(elapsedSec / 60)).padStart(2, "0");
  const ss = String(elapsedSec % 60).padStart(2, "0");

  return (
    <div className="mt-3 flex flex-col gap-2">
      <div className="font-mono text-2xl font-bold text-rose-500">
        {mm}:{ss}
      </div>
      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="self-start rounded-md bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white"
        >
          ⏹ 타이머 정지 & 완료
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="뭐 했는지 한 줄 (선택)"
            className="rounded-md border px-3 py-2 text-xs"
          />
          <button
            onClick={confirmComplete}
            disabled={pending}
            className="self-start rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
          >
            {pending ? "저장 중..." : `완료 (${Math.max(1, Math.round(elapsedSec / 60))}분)`}
          </button>
        </div>
      )}
    </div>
  );
}
