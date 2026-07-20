import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { authDevMode, getSessionUser, homeFor } from "@/lib/auth";
import { requestLoginLink, devLogin } from "@/lib/auth-actions";
import { Rocket, Wordmark } from "@/components/Logo";
import { Avatar } from "@/components/Avatar";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; devlink?: string; error?: string }>;
}) {
  const { sent, devlink, error } = await searchParams;
  const user = await getSessionUser();
  if (user) redirect(homeFor(user));

  const devMode = authDevMode();
  const devUsers = devMode
    ? await db.user.findMany({ include: { client: true }, orderBy: { role: "asc" } })
    : [];

  return (
    <main className="grid min-h-screen place-items-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <Rocket size={26} />
          <Wordmark className="text-2xl" />
        </Link>

        <div className="card p-7">
          <h1 className="font-display text-2xl font-extrabold text-ink">Log in</h1>
          <p className="mt-1 text-sm text-sub">We&apos;ll email you a one-time login link — no password to remember.</p>

          {error === "invalid" && (
            <p className="mt-4 rounded-xl border border-err/30 bg-err/10 px-4 py-3 text-sm text-err">
              That link is invalid or expired. Request a fresh one below.
            </p>
          )}

          {sent ? (
            <div className="mt-5 rounded-xl border border-ok/30 bg-ok/10 px-4 py-3 text-sm text-ok">
              ✉️ If that email belongs to an account, a login link is on its way. It expires in 15 minutes.
            </div>
          ) : null}

          <form action={requestLoginLink} className="mt-5 flex gap-2">
            <input
              type="email"
              name="email"
              required
              placeholder="you@yourbusiness.com"
              className="input flex-1"
              autoComplete="email"
            />
            <button className="btn btn-primary">Send link</button>
          </form>

          {devlink && (
            <div className="mt-4 rounded-xl border border-warn/30 bg-warn/10 px-4 py-3 text-xs text-warn">
              <p className="font-bold">Dev mode — email isn&apos;t configured, so here&apos;s your link:</p>
              <a href={devlink} className="mt-1 block break-all underline">
                {devlink}
              </a>
            </div>
          )}
        </div>

        {devMode && (
          <div className="card mt-5 p-6">
            <p className="eyebrow">Dev quick login</p>
            <p className="mt-1 text-xs text-faint">
              Active because no email provider is configured. Set <code>RESEND_API_KEY</code> to disable before real
              clients use this.
            </p>
            <div className="mt-4 grid gap-2">
              {devUsers.map((u) => (
                <form key={u.id} action={devLogin}>
                  <input type="hidden" name="userId" value={u.id} />
                  <button className="flex w-full items-center gap-3 rounded-xl border border-line px-4 py-2.5 text-left transition hover:border-accent/50 hover:bg-card2/60">
                    <Avatar src={u.avatarUrl} name={u.name} size={32} />
                    <span className="text-sm font-semibold text-ink">{u.name}</span>
                    <span className="ml-auto font-mono text-[0.6rem] uppercase tracking-widest text-faint">
                      {u.role === "ADMIN" ? "mission control" : "client"}
                    </span>
                  </button>
                </form>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
