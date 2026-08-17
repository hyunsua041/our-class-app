const TARGET_HOURS = 2800;
const DEADLINE = new Date("2026-10-06T23:59:59+09:00");

function BossSvg({ hpPct, defeated }: { hpPct: number; defeated: boolean }) {
  return (
    <svg viewBox="0 0 200 180" className="h-40 w-40">
      <defs>
        <radialGradient id="bossBody" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffd6e8" />
          <stop offset="100%" stopColor="#ff8fc0" />
        </radialGradient>
      </defs>
      <path
        d="M100 20 C150 20 175 60 175 100 C175 145 140 165 100 165 C60 165 25 145 25 100 C25 60 50 20 100 20 Z"
        fill="url(#bossBody)"
        stroke="#e0559a"
        strokeWidth="3"
      />
      <path d="M65 30 L58 8 L75 22 Z" fill="#ff8fc0" stroke="#e0559a" strokeWidth="2" />
      <path d="M135 30 L142 8 L125 22 Z" fill="#ff8fc0" stroke="#e0559a" strokeWidth="2" />
      <ellipse cx="55" cy="105" rx="12" ry="7" fill="#ff5c9e" opacity="0.5" />
      <ellipse cx="145" cy="105" rx="12" ry="7" fill="#ff5c9e" opacity="0.5" />
      {defeated ? (
        <g stroke="#7a2d55" strokeWidth="4" strokeLinecap="round">
          <line x1="72" y1="85" x2="88" y2="101" />
          <line x1="88" y1="85" x2="72" y2="101" />
          <line x1="112" y1="85" x2="128" y2="101" />
          <line x1="128" y1="85" x2="112" y2="101" />
        </g>
      ) : (
        <>
          <circle cx="80" cy="92" r="10" fill="white" />
          <circle cx="120" cy="92" r="10" fill="white" />
          <circle cx="82" cy="94" r="5" fill="#4a1d33" />
          <circle cx="122" cy="94" r="5" fill="#4a1d33" />
        </>
      )}
      {defeated ? (
        <ellipse cx="100" cy="125" rx="10" ry="6" fill="#7a2d55" />
      ) : hpPct < 40 ? (
        <path d="M85 120 Q100 112 115 120" stroke="#7a2d55" strokeWidth="3" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M85 118 Q100 130 115 118" stroke="#7a2d55" strokeWidth="3" fill="none" strokeLinecap="round" />
      )}
    </svg>
  );
}

export default function BossBattle({ totalMinutes }: { totalMinutes: number }) {
  const totalHours = totalMinutes / 60;
  const progress = Math.min(1, totalHours / TARGET_HOURS);
  const hpPct = Math.max(0, Math.round((1 - progress) * 100));
  const defeated = progress >= 1;
  const daysLeft = Math.max(
    0,
    Math.ceil((DEADLINE.getTime() - Date.now()) / 86400000)
  );

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border bg-gradient-to-b from-pink-50 to-white p-6 shadow-sm">
      <h2 className="text-sm font-bold text-pink-500">🌸 우리반 보스전</h2>
      <BossSvg hpPct={hpPct} defeated={defeated} />
      <div className="w-full max-w-xs">
        <div className="mb-1 flex justify-between text-xs font-semibold text-pink-500">
          <span>보스 체력</span>
          <span>{hpPct}%</span>
        </div>
        <div className="h-4 w-full overflow-hidden rounded-full bg-pink-100">
          <div
            className="h-full bg-gradient-to-r from-pink-400 to-rose-400 transition-all"
            style={{ width: `${hpPct}%` }}
          />
        </div>
      </div>
      <p className="text-center text-sm text-slate-600">
        {defeated
          ? "🎉 보스를 물리쳤어요! 우리 반 승리!"
          : `우리 반 누적 ${totalHours.toFixed(1)}시간 / ${TARGET_HOURS}시간 · D-${daysLeft} (10월 6일까지)`}
      </p>
    </div>
  );
}
