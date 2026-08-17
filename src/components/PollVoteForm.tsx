"use client";

import { useState, useTransition } from "react";

export default function PollVoteForm({
  pollId,
  options,
  onVote,
}: {
  pollId: string;
  options: { id: string; text: string }[];
  onVote: (pollId: string, optionId: string) => Promise<void> | void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-2">
      {options.map((o) => (
        <label
          key={o.id}
          className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm has-checked:border-violet-400 has-checked:bg-violet-50"
        >
          <input
            type="radio"
            name={`poll-${pollId}`}
            value={o.id}
            checked={selected === o.id}
            onChange={() => setSelected(o.id)}
          />
          {o.text}
        </label>
      ))}
      <button
        type="button"
        disabled={!selected || pending}
        onClick={() => {
          if (selected) startTransition(() => onVote(pollId, selected));
        }}
        className="self-end rounded-md bg-violet-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {pending ? "투표 중..." : "투표하기"}
      </button>
    </div>
  );
}
