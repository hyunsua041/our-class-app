"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/notices", label: "📢 공지" },
  { href: "/praise", label: "💛 칭찬" },
  { href: "/photos", label: "📸 사진" },
  { href: "/polls", label: "🗳️ 투표" },
  { href: "/goals", label: "🎯 목표" },
];

export default function NavTabs() {
  const pathname = usePathname();
  return (
    <nav className="mx-auto flex max-w-2xl gap-1 px-2 pb-2 text-sm">
      {TABS.map((tab) => {
        const active = pathname?.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 rounded-lg px-3 py-2 text-center font-medium transition ${
              active
                ? "bg-sky-500 text-white"
                : "text-slate-600 hover:bg-sky-50 hover:text-sky-600"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
