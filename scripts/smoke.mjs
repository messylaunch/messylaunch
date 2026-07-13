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

  // discover seeded dynamic segments from the live app
  const portalHtml = await (await fetch(`${BASE}/portal`)).text();
  const clientId = portalHtml.match(/\/portal\/([a-z0-9]+)/)?.[1];

  const routes = [
    "/", "/niches", "/niches/coatings-trades", "/work", "/portal",
    "/admin", "/admin/courses", "/admin/courses/messy-launch-framework",
    "/admin/projects", "/admin/projects/better-man-website-build",
    "/admin/clients", "/admin/ai",
    "/manifest.webmanifest", "/sw.js", "/offline.html",
    "/definitely-not-a-page", // expect 404
  ];
  if (clientId) {
    routes.push(`/portal/${clientId}`, `/portal/${clientId}/projects/better-man-website-build`);
  } else {
    console.warn("⚠ could not discover a client id from /portal — is the db seeded?");
  }

  let failed = 0;
  for (const route of routes) {
    const expect = route === "/definitely-not-a-page" ? 404 : 200;
    let status = "ERR";
    try {
      status = (await fetch(`${BASE}${route}`)).status;
    } catch {}
    const ok = status === expect;
    if (!ok) failed++;
    console.log(`${ok ? "✓" : "✗"} ${route} → ${status}${ok ? "" : ` (expected ${expect})`}`);
  }

  // API smoke: AI generate fallback shape
  const gen = await fetch(`${BASE}/api/ai/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind: "COURSE", prompt: "smoke test", useExisting: false }),
  });
  const genOk = gen.status === 200 && (await gen.json()).outline?.sections?.length > 0;
  if (!genOk) failed++;
  console.log(`${genOk ? "✓" : "✗"} POST /api/ai/generate → ${gen.status}`);

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
