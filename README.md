# Camp — Training & Nutrition Companion

A local-first Progressive Web App (PWA). No backend, no accounts, no server.
All state lives on-device in `localStorage`. Works offline after first load.

## What it does

Progress-anchored, **not** calendar-driven: the home screen shows whatever is
next on your rotation cursor. Mark a session done and the cursor advances. Miss
days and nothing breaks — the cursor just waits.

Four tabs + Progress:
- **Today** — next session, today's meals, quick knee (0–10) + weight entry, the "this week" strip (tap any session you actually did).
- **Train** — full program per phase (1/2/3), the CP Left-Side Rule + Tendon Protocol + 24-Hour Rule callouts, and a Travel-mode toggle (bodyweight + band).
- **Eat** — meal plan (fixed breakfast, Lunch A/B, Dinner A/B, snack), daily target banner, travel/restaurant rules.
- **Shop** — grouped checklist, persists until you reset.
- **Progress** — weekly-average weight + morning-knee sparklines, lbs-to-go, recent sessions.

## Run locally

It's plain HTML/CSS/JS — any static server works. From this folder:

```bash
npx serve .          # then open the printed http://localhost:PORT
# or
python -m http.server 8080
```

Service workers need `https://` or `localhost`, so opening `index.html` as a
`file://` won't enable offline mode — use a server.

## Live URL

Deployed on GitHub Pages: **https://jeremymdsn121.github.io/fitness-app/**

To update it after editing files: commit and push to `master` — Pages rebuilds
automatically in a minute or two.

```bash
git add -A && git commit -m "..." && git push
```

## Add it to your phone

**iPhone (Safari):** open the URL → **Share → Add to Home Screen**.

**Android (Chrome):** open the URL → tap **⋮ → Install app** (or *Add to Home
screen*). Android uses the maskable icon and full manifest.

Then set **one** daily phone reminder pointing at the app — that's your workout
nudge. No push notifications are built in by design.

## Files

- `index.html` — shell + tab bar + onboarding tip
- `app.js` — all state, content data, rendering, and logic
- `styles.css` — navy/blue theme, dark-mode aware
- `manifest.webmanifest`, `sw.js` — PWA install + offline
- `icons/` — app icons (regenerate with `make_icons.py`)

## Reset

Clearing the site's data in Safari (or `localStorage.clear()` in dev tools)
resets everything to a fresh Phase 1 start.
