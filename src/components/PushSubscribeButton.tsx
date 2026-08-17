"use client";

import { useEffect, useState } from "react";
import { saveSubscription } from "@/app/actions";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

function checkSupport() {
  if (typeof window === "undefined") return true;
  return "serviceWorker" in navigator && "PushManager" in window;
}

export default function PushSubscribeButton() {
  const [status, setStatus] = useState<
    "idle" | "unsupported" | "subscribed" | "error"
  >(() => (checkSupport() ? "idle" : "unsupported"));
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!checkSupport()) return;
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => {
        if (sub) setStatus("subscribed");
      })
      .catch(() => {});
  }, []);

  async function subscribe() {
    setPending(true);
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("error");
        return;
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });
      const json = sub.toJSON();
      await saveSubscription({
        endpoint: json.endpoint!,
        keys: { p256dh: json.keys!.p256dh, auth: json.keys!.auth },
      });
      setStatus("subscribed");
    } catch {
      setStatus("error");
    } finally {
      setPending(false);
    }
  }

  if (status === "unsupported") {
    return (
      <p className="text-xs text-slate-400">
        이 브라우저는 알림을 지원하지 않아요. (아이폰은 홈 화면에 추가한 뒤
        열어야 알림이 돼요)
      </p>
    );
  }

  if (status === "subscribed") {
    return <p className="text-xs text-emerald-600">🔔 알림이 켜져 있어요!</p>;
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={subscribe}
        disabled={pending}
        className="self-start rounded-md bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
      >
        {pending ? "설정 중..." : "🔔 공지 알림 받기"}
      </button>
      {status === "error" && (
        <p className="text-xs text-red-500">
          알림을 켜지 못했어요. 브라우저 알림 권한을 확인해줘.
        </p>
      )}
    </div>
  );
}
