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

// subjects가 비어있으면 전체 학생에게, 지정하면 해당 과목을 고른 학생(+공통과목이면 전체)에게 발송
export async function sendPushToAudience(
  subjects: string[],
  payload: PushPayload
) {
  const [{ data: subs, error }, { data: subjectRows }] = await Promise.all([
    supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth, student_id, students(subjects)"),
    supabase.from("subjects").select("name, is_common"),
  ]);
  if (error) throw error;

  const hasCommon = (subjectRows || []).some(
    (s) => s.is_common && subjects.includes(s.name)
  );

  const targets = subs.filter((s) => {
    if (subjects.length === 0 || hasCommon) return true;
    const studentSubjects = (s.students as unknown as { subjects: string[] } | null)
      ?.subjects;
    return studentSubjects?.some((name) => subjects.includes(name)) ?? false;
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
