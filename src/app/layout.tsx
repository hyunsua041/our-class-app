import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { getCurrentStudent } from "@/lib/studentAuth";
import AdminBar from "@/components/AdminBar";
import StudentBar from "@/components/StudentBar";
import NavTabs from "@/components/NavTabs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "2학년 8반 ❤️",
  description: "2학년 8반 학생들을 위한 공지·칭찬·추억 공간",
  robots: { index: false, follow: false },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "2학년 8반 ❤️",
  },
  icons: {
    apple: "/icon.svg",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await isAdmin();
  const student = await getCurrentStudent();

  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
            <Link href="/notices" className="text-lg font-bold text-sky-600">
              🏫 2학년 8반 ❤️
            </Link>
            <div className="flex items-center gap-2">
              <StudentBar student={student} />
              <AdminBar isAdmin={admin} />
              {admin && (
                <Link
                  href="/admin"
                  className="rounded-full border px-3 py-1 text-xs font-medium text-slate-500"
                >
                  ⚙️ 관리
                </Link>
              )}
            </div>
          </div>
          <NavTabs />
        </header>
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
