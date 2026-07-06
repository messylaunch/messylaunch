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

- **AI Builder** — set `ANTHROPIC_API_KEY` (without it you get a sample outline so the flow still demos)
- **Bunny.net video** — set `BUNNY_STREAM_LIBRARY_ID` + `BUNNY_STREAM_API_KEY`; lessons with a Bunny video ID render the Stream player, and `POST /api/bunny/videos` registers uploads

## How courses vs. projects work

- **Course** = premade, one goal, start whenever, paced to a 1/2/4/8-week time frame. One big folder → module folders → lessons inside.
- **Project** = built together for one business. Same section/item structure, but with a live thread and tasks that flow **both directions** — "send me 5 photos" (client owes) and "QR code business card" (you owe) — each with a due date and a submit → approve / request-changes loop.

## Sample data

Seeded via `prisma/seed.ts`: 5 niches, 5 client businesses (including **Better Man Coatings** with a live website-build project — open thread, submitted bio awaiting review, and tasks on both sides), and 2 full courses (**The Messy Launch Framework**, 8 weeks · **Website in a Week**, 1 week).

## Stack

Next.js (App Router) · Prisma + SQLite · Tailwind CSS · Anthropic API · Bunny.net Stream

> Auth is not wired up yet — `/portal` uses a demo client picker. That's the next brick to lay before real clients touch it.
