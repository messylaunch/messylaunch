#!/usr/bin/env node
// Route smoke test: boots the production build and checks every route returns 200.
// Usage: npm run build && node scripts/smoke.mjs
// Exits non-zero on any failure. Requires a seeded database.

import { spawn } from "node:child_process";

const PORT = process.env.SMOKE_PORT ?? "3100";
const BASE = `http://localhost:${PORT}`;

const server = spawn("npx", ["next", "start", "-p", PORT], { stdio: "pipe" });
const kill = () => { try { server.kill("SIGTERM"); } catch {} };
process.on("exit", kill);

async function waitForServer(tries = 40) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(BASE, { redirect: "manual" });
      if (res.status < 500) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("server never came up");
}

async function main() {
  await waitForServer();

  // public pages → 200; protected areas must REDIRECT logged-out visitors
  const routes = [
    ["/", 200],
    ["/niches", 200],
    ["/niches/coatings-trades", 200],
    ["/work", 200],
    ["/login", 200],
    ["/manifest.webmanifest", 200],
    ["/sw.js", 200],
    ["/offline.html", 200],
    ["/definitely-not-a-page", 404],
    // auth walls (307 = redirected to /login)
    ["/portal", 307],
    ["/admin", 307],
    ["/admin/courses", 307],
    ["/admin/projects", 307],
    ["/admin/projects/better-man-website-build", 307],
    ["/admin/clients", 307],
    ["/admin/ai", 307],
  ];

  let failed = 0;
  for (const [route, expect] of routes) {
    let status = "ERR";
    try {
      status = (await fetch(`${BASE}${route}`, { redirect: "manual" })).status;
    } catch {}
    const ok = status === expect;
    if (!ok) failed++;
    console.log(`${ok ? "✓" : "✗"} ${route} → ${status}${ok ? "" : ` (expected ${expect})`}`);
  }

  // API smoke: AI generate must refuse anonymous callers
  const gen = await fetch(`${BASE}/api/ai/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind: "COURSE", prompt: "smoke test", useExisting: false }),
  });
  const genOk = gen.status === 403;
  if (!genOk) failed++;
  console.log(`${genOk ? "✓" : "✗"} POST /api/ai/generate (anon) → ${gen.status} (expected 403)`);

  const notif = await fetch(`${BASE}/api/notifications`);
  const notifOk = notif.status === 401;
  if (!notifOk) failed++;
  console.log(`${notifOk ? "✓" : "✗"} GET /api/notifications (anon) → ${notif.status} (expected 401)`);

  kill();
  if (failed) {
    console.error(`\n${failed} route(s) failed`);
    process.exit(1);
  }
  console.log("\nAll routes healthy 🚀");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  kill();
  process.exit(1);
});
