import { cookies } from "next/headers";
import { readCollection } from "@/lib/store";
import { isAdmin } from "@/lib/auth";
import type { Poll } from "@/lib/types";
import { createPoll, deletePoll, votePoll } from "@/app/actions";
import DeleteButton from "@/components/DeleteButton";
import PollVoteForm from "@/components/PollVoteForm";

export default async function PollsPage() {
  const admin = await isAdmin();
  const polls = readCollection<Poll>("polls");
  const cookieStore = await cookies();
  const votedIds = (cookieStore.get("voted_polls")?.value || "")
    .split(",")
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold">🗳️ 우리반 투표</h1>
        <p className="mt-1 text-sm text-slate-500">
          반 친구들의 의견을 모아봐요. 한 사람당 한 번씩 투표할 수 있어요.
        </p>
      </div>

      {admin && (
        <form
          action={createPoll}
          className="flex flex-col gap-2 rounded-xl border bg-white p-4 shadow-sm"
        >
          <input
            name="question"
            required
            placeholder="투표 질문 (예: 체육대회 종목 뭐할까?)"
            className="rounded-md border px-3 py-2 text-sm"
          />
          <textarea
            name="options"
            required
            placeholder={"선택지를 한 줄에 하나씩 적어주세요\n예)\n피구\n발야구\n줄다리기"}
            rows={4}
            className="rounded-md border px-3 py-2 text-sm"
          />
          <button className="self-end rounded-md bg-violet-500 px-4 py-2 text-sm font-semibold text-white">
            투표 만들기
          </button>
        </form>
      )}

      <ul className="flex flex-col gap-4">
        {polls.length === 0 && (
          <li className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-400">
            아직 등록된 투표가 없어요.
          </li>
        )}
        {polls.map((poll) => {
          const hasVoted = votedIds.includes(poll.id);
          const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
          return (
            <li key={poll.id} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold">{poll.question}</h2>
                {admin && <DeleteButton onDelete={deletePoll.bind(null, poll.id)} />}
              </div>

              {hasVoted ? (
                <div className="mt-3 flex flex-col gap-2">
                  {poll.options.map((o) => {
                    const pct =
                      totalVotes === 0 ? 0 : Math.round((o.votes / totalVotes) * 100);
                    return (
                      <div key={o.id} className="text-sm">
                        <div className="flex justify-between text-slate-600">
                          <span>{o.text}</span>
                          <span>
                            {pct}% ({o.votes}표)
                          </span>
                        </div>
                        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full bg-violet-400"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <p className="mt-1 text-xs text-slate-400">
                    투표해줘서 고마워요! 총 {totalVotes}표
                  </p>
                </div>
              ) : (
                <div className="mt-3">
                  <PollVoteForm pollId={poll.id} options={poll.options} onVote={votePoll} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
