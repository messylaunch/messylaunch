---
name: ui-review
description: Screenshot every key page of the Messy Launch platform in both themes (and mobile width) using Playwright, then visually review for regressions. Run after any UI change and before committing UI work.
---

# UI review

Prereq: a production server running the current code (`npm run build && npm start`) with seeded data (`npm run seed`).

1. Write a throwaway Playwright script **in the scratchpad directory** (never in the repo) using
   `chromium.launch({ executablePath: "/opt/pw-browsers/chromium" })`.
2. For each theme (`dark`, `light` — set via `ctx.addInitScript(t => localStorage.setItem("ml-theme", t), theme)`),
   screenshot at 1440px, and additionally at 390px width for the portal + one admin page:
   - `/` (full hero + one scroll position)
   - `/niches/coatings-trades`
   - `/work`
   - `/admin` and `/admin/projects/better-man-website-build`
   - `/admin/ai`
   - `/portal` → `/portal/<first client id>` → its project page
3. Wait ~1200ms after load so reveal animations settle before capturing.
4. **Actually read every screenshot** with the Read tool. Check: token colors applied in both themes
   (no dark text on dark bg / vice versa), no horizontal overflow at 390px, badges legible,
   focus states visible, empty sections show a message not a void.
5. Report findings ordered by severity with the screenshot filename as evidence; send the most
   informative screenshots to the user. Fix only regressions you introduced; report pre-existing issues.
