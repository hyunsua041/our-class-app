import { readCollection } from "@/lib/store";
import { isAdmin } from "@/lib/auth";
import type { Praise } from "@/lib/types";
import { createPraise, deletePraise } from "@/app/actions";
import DeleteButton from "@/components/DeleteButton";
import PraiseForm from "@/components/PraiseForm";

export default async function PraisePage() {
  const admin = await isAdmin();
  const praises = readCollection<Praise>("praises");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold">💛 칭찬 게시판</h1>
        <p className="mt-1 text-sm text-slate-500">
          친구에게 하고 싶은 칭찬을 남겨보세요. 이름을 밝혀도, 익명으로 써도 돼요.
        </p>
      </div>

      <PraiseForm action={createPraise} />

      <ul className="flex flex-col gap-3">
        {praises.length === 0 && (
          <li className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-400">
            아직 등록된 칭찬이 없어요. 첫 칭찬을 남겨보세요!
          </li>
        )}
        {praises.map((p) => (
          <li key={p.id} className="rounded-xl border bg-amber-50 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <p className="whitespace-pre-wrap text-sm text-slate-700">
                {p.content}
              </p>
              {admin && <DeleteButton onDelete={deletePraise.bind(null, p.id)} />}
            </div>
            <div className="mt-2 text-xs text-slate-400">
              {p.authorName ? `- ${p.authorName}` : "- 익명"} ·{" "}
              {formatDate(p.createdAt)}
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
