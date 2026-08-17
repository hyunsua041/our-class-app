import "server-only";
import webpush from "web-push";
import { supabase } from "@/lib/supabase";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

// subject가 null이면 전체 학생에게, 지정하면 해당 선택과목 학생에게만 발송
export async function sendPushToAudience(
  subject: string | null,
  payload: PushPayload
) {
  const { data: subs, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth, student_id, students(subjects)");
  if (error) throw error;

  const targets = subs.filter((s) => {
    if (!subject) return true;
    const studentSubjects = (s.students as unknown as { subjects: string[] } | null)
      ?.subjects;
    return studentSubjects?.includes(subject) ?? false;
  });

  const invalidIds: string[] = [];

  await Promise.all(
    targets.map(async (s) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: s.endpoint,
            keys: { p256dh: s.p256dh, auth: s.auth },
          },
          JSON.stringify(payload)
        );
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          invalidIds.push(s.id);
        }
      }
    })
  );

  if (invalidIds.length > 0) {
    await supabase.from("push_subscriptions").delete().in("id", invalidIds);
  }
}
