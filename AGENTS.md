<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Messy Launch — agent guide

Client platform for Messy Launch (helps business owners through the messy early stage).
Public marketing site + Mission Control (admin) + Client Portal.

## Stack (verified — do not assume otherwise)

- **Next.js 16** App Router, TypeScript, React 19. `params`/`searchParams` are **Promises** — always `await` them.
- **Prisma 6 + SQLite** (`prisma/dev.db`, gitignored). Schema: `prisma/schema.prisma`. No migrations yet — schema changes go through `npx prisma db push`, then update `prisma/seed.ts`.
- **Tailwind 4** (CSS-first config in `app/globals.css`, no tailwind.config file).
- **No auth yet.** `/admin` is open; `/portal` uses a demo client picker. Treat every new route as if auth will be added later: portal queries must always filter by `clientId` ownership (see `app/portal/[clientId]/projects/[slug]/page.tsx`).
- Optional integrations, all env-gated with graceful fallbacks: Anthropic API (`lib/ai.ts`), Bunny.net Stream (`lib/bunny.ts`), Web Push (`lib/notify.ts`).

## Commands

```bash
npx prisma db push   # sync schema to SQLite (run once per fresh clone)
npm run seed         # reset + load sample data (destructive to local data)
npm run dev          # dev server on :3000
npm run build        # production build — MUST pass before any commit
npm run lint         # eslint — must be clean
node scripts/smoke.mjs   # starts prod server, checks every route returns 200
```

## Domain model (the part that's easy to get wrong)

- **Course** = premade + resellable. `Course → Module → Lesson`. Self-paced with `durationWeeks` (1/2/4/8). Lessons are shared across clients — never put per-client state on a Lesson.
- **Project** = tailored collaboration with ONE business. `Project → ProjectSection → ProjectItem` (same item `type` vocabulary as lessons — see `ITEM_TYPES` in `lib/meta.ts`), plus `Task` (two-way: `assignedTo` ADMIN|CLIENT, lifecycle OPEN → SUBMITTED → APPROVED / CHANGES_REQUESTED) and `Message` (the thread). Per-client state (e.g. `completedAt`) is fine on ProjectItem because a project has exactly one client.
- **Business** belongs to a Client and doubles as the public portfolio entry (`isPublished`).
- Mutations live in `lib/actions.ts` (server actions). Any action that changes project state should send notifications via `lib/notify.ts` → `notify()` (in-app row + best-effort web push).

## Design system

All colors flow through CSS tokens defined in `app/globals.css` (`--paper/--card/--ink/--sub/--faint/--line/--accent` + status colors `--ok/--warn/--err/--info/--pop`), themed by `<html data-theme="dark|light">`.
**Never hardcode Tailwind palette colors** (`slate-800`, `orange-500`, …) — use token utilities (`bg-card`, `text-ink`, `border-line`, `text-accent`, `bg-ok/10`, …) so both themes work.
Composed primitives: `.card`, `.card-hover`, `.btn`, `.btn-primary`, `.btn-ghost`, `.chip`, `.input`, `.eyebrow`, `.grid-bg`. Display font: `font-display` (Bricolage Grotesque). Animations must respect `prefers-reduced-motion` (see globals.css).

## Verification bar

A change is done when: `npm run lint` clean, `npm run build` green, `node scripts/smoke.mjs` all-200, and — for UI work — you've looked at a screenshot in BOTH themes (Playwright is preinstalled; see `.claude/skills/ui-review`).

## Known debt (don't "discover" these again)

1. No authentication — the #1 blocker before real clients use this.
2. SQLite won't survive serverless deploys (Vercel) — needs a hosted DB (e.g. Postgres + Prisma) at deploy time.
3. No tests — smoke script only.
4. Course lessons have no per-client completion (needs a join table keyed on enrollment).
5. Bunny upload is API-only; no upload UI in admin yet.
