// Notifications: always writes an in-app Notification row; additionally sends
// a web push to every subscribed browser when VAPID keys are configured.
// Push is best-effort — a push failure never blocks the action that caused it.

import webpush from "web-push";
import { db } from "./db";

export function pushConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

let vapidReady = false;
function ensureVapid() {
  if (vapidReady || !pushConfigured()) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:michael.quinn0831@gmail.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  vapidReady = true;
}

export type Notice = { title: string; body?: string; href?: string };

export async function notify(userIds: string[], notice: Notice | ((userId: string) => Notice)) {
  const unique = [...new Set(userIds)];
  for (const userId of unique) {
    const n = typeof notice === "function" ? notice(userId) : notice;
    await db.notification.create({ data: { userId, title: n.title, body: n.body, href: n.href } });
    void sendPush(userId, n); // fire and forget
  }
}

async function sendPush(userId: string, notice: Notice) {
  if (!pushConfigured()) return;
  ensureVapid();
  const subs = await db.pushSubscription.findMany({ where: { userId } });
  await Promise.allSettled(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify({ title: notice.title, body: notice.body ?? "", href: notice.href ?? "/" })
        );
      } catch (err: unknown) {
        // 404/410 mean the browser dropped the subscription — clean it up
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await db.pushSubscription.delete({ where: { id: s.id } }).catch(() => {});
        }
      }
    })
  );
}

// Resolves who's on each side of a project and where each side views it.
export async function projectParties(projectId: string) {
  const [project, admin] = await Promise.all([
    db.project.findUnique({
      where: { id: projectId },
      include: { business: { include: { client: { include: { user: true } } } } },
    }),
    db.user.findFirst({ where: { role: "ADMIN" } }),
  ]);
  if (!project || !admin) return null;
  const clientUser = project.business.client.user;
  return {
    project,
    adminId: admin.id,
    clientUserId: clientUser.id,
    clientName: clientUser.name,
    hrefFor: (userId: string) =>
      userId === admin.id
        ? `/admin/projects/${project.slug}`
        : `/portal/${project.business.clientId}/projects/${project.slug}`,
  };
}
