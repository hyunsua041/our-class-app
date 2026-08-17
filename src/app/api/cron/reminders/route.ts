import { NextResponse } from "next/server";
import { getNoticesNeedingReminder, markReminded } from "@/lib/data";
import { sendPushToAudience } from "@/lib/webpush";

function kstDateString(offsetDays: number) {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  kst.setUTCDate(kst.getUTCDate() + offsetDays);
  return kst.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const tomorrow = kstDateString(1);
  const nextWeek = kstDateString(7);

  const [dueTomorrow, dueNextWeek] = await Promise.all([
    getNoticesNeedingReminder("reminded_1day", tomorrow),
    getNoticesNeedingReminder("reminded_7day", nextWeek),
  ]);

  for (const n of dueTomorrow) {
    await sendPushToAudience(n.subject ?? null, {
      title: `⏰ 내일 마감: ${n.title}`,
      body: n.content.slice(0, 80),
      url: "/notices",
    });
    await markReminded(n.id, "reminded_1day");
  }

  for (const n of dueNextWeek) {
    await sendPushToAudience(n.subject ?? null, {
      title: `📅 일주일 뒤 마감: ${n.title}`,
      body: n.content.slice(0, 80),
      url: "/notices",
    });
    await markReminded(n.id, "reminded_7day");
  }

  return NextResponse.json({
    ok: true,
    tomorrow: dueTomorrow.length,
    nextWeek: dueNextWeek.length,
  });
}
