# Messy Launch 🚀

The platform behind Messy Launch — we help business owners through the messy early stage: get clear on the offer, build the online presence, launch organically, and learn to pull the strings themselves.

## What's in here

| Area | Route | What it does |
| --- | --- | --- |
| **Public site** | `/` | The story: launch messy, own the controls |
| Niches | `/niches`, `/niches/[slug]` | The niches we go deep on, and the businesses launched in each |
| Launches | `/work` | Portfolio — each business's story, first win, and where they are now |
| **Mission Control** (admin) | `/admin` | Dashboard: everything needing review, your tasks, waiting-on-client list |
| Courses | `/admin/courses` | Premade, resellable: Course → Modules → Lessons (Overview, Tutorial, Scenario, Assignment, Check Knowledge, Book a Call, …) |
| Projects | `/admin/projects` | Collaborative: same content structure **plus** a message thread and two-way tasks with due dates and an approve/request-changes flow |
| Clients | `/admin/clients` | Clients → their businesses → their projects & enrollments |
| AI Builder | `/admin/ai` | Describe the customer, pick Course or Project, get an outline modeled on your past work — then save it as a draft |
| **Client Portal** | `/portal` | What your clients see: their to-dos, what you owe them, the thread, and their course content |

## Running it

```bash
npm install
npx prisma db push        # creates prisma/dev.db (SQLite)
npm run seed              # loads the sample data
npm run dev               # http://localhost:3000
```

Copy `.env.example` to `.env` to enable:

- **AI Builder & catch-up briefs** — set `ANTHROPIC_API_KEY` (without it you get sample output so the flows still demo)
- **Bunny.net video** — set `BUNNY_STREAM_LIBRARY_ID` + `BUNNY_STREAM_API_KEY`; lessons with a Bunny video ID render the Stream player, and `POST /api/bunny/videos` registers uploads
- **Push notifications** — run `npx web-push generate-vapid-keys` once and set `NEXT_PUBLIC_VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY`. In-app notifications (the bell) work without this; push adds device notifications via the PWA service worker.

## PWA & notifications

The app is installable (manifest + service worker + icons). Every project event — new message, task created, submitted, approved, changes requested — writes an in-app notification for the other party (bell in Mission Control and the portal) and mirrors to web push when VAPID keys are set. `public/sw.js` deliberately doesn't cache pages: this is live collaboration, so it only handles push, notification clicks, and an offline fallback page.

## Working on this repo with Claude Code

- `AGENTS.md` — project memory: verified stack, domain invariants, design tokens, verification bar
- `.claude/agents/` — `repo-mapper` (read-only code tracing), `ux-auditor` (Playwright-driven UX audit), `data-reviewer` (schema/integrity review)
- `.claude/skills/` — `/health-check` (deps → schema → seed → lint → types → build → smoke) and `/ui-review` (both-theme + mobile screenshot review)
- `scripts/smoke.mjs` — boots the prod build and asserts every route (and the 404) responds correctly

## How courses vs. projects work

- **Course** = premade, one goal, start whenever, paced to a 1/2/4/8-week time frame. One big folder → module folders → lessons inside.
- **Project** = built together for one business. Same section/item structure, but with a live thread and tasks that flow **both directions** — "send me 5 photos" (client owes) and "QR code business card" (you owe) — each with a due date and a submit → approve / request-changes loop.

## Sample data

Seeded via `prisma/seed.ts`: 5 niches, 5 client businesses (including **Better Man Coatings** with a live website-build project — open thread, submitted bio awaiting review, and tasks on both sides), and 2 full courses (**The Messy Launch Framework**, 8 weeks · **Website in a Week**, 1 week).

## Stack

Next.js (App Router) · Prisma + SQLite · Tailwind CSS · Anthropic API · Bunny.net Stream

## Auth

Passwordless magic-link login (`/login`). Sessions are httpOnly cookies backed by hashed tokens; links are single-use and expire in 15 minutes. Clients only see their own portal; Mission Control is admin-only; every server action and API authorizes against the session.

**Dev mode:** while `RESEND_API_KEY` is unset, `/login` shows a one-click user picker (and prints magic links on screen) so you can demo without email. **Set `RESEND_API_KEY` + `AUTH_EMAIL_FROM` + `APP_URL` before real clients use the app** — that switches login to real emails automatically.
