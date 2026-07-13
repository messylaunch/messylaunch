---
name: health-check
description: Full repository health check for the Messy Launch platform — dependencies, schema sync, seed, lint, types, build, and route smoke test. Run after pulling changes, before starting a work session, or when anything feels broken.
---

# Repo health check

Run these in order; stop and report at the first failure. All are non-destructive
except `npm run seed`, which resets **local sample data only** (prisma/dev.db is gitignored).

1. `npm install` — only if node_modules is missing or package.json changed.
2. `npx prisma db push` — sync schema to the local SQLite db.
3. `npm run seed` — reload sample data (skip if the user has local data they care about — ask first if unsure).
4. `npm run lint` — must be clean (warnings count as findings).
5. `npx tsc --noEmit` — must be clean.
6. `npm run build` — must succeed.
7. `node scripts/smoke.mjs` — boots the prod server and checks every route returns 200.

Report as a table: step · pass/fail · one-line detail. On failure, include the exact
error output and the most likely cause, then fix only clear-cut breaks (type errors,
missing imports); anything architectural gets reported, not auto-fixed.
