# Round One

**Train the rounds that cut people out.** An interview trainer with four scored rounds — aptitude and logic, memory and recall, riddles and traps, and a panel you answer in your own words.

Built as a real application, not a single-file demo: React 19 + TypeScript, Vite, Tailwind CSS v4, Radix primitives, Zustand, Framer Motion, a service worker, and a test suite.

---

## Lab first

Every new visual idea is built in `/lab` before it touches the product — a
full-bleed stage with a one-line objective, no scoring and no content
commitment. Kept stages form the shortlist; promoted ones move out of
`src/lab/` into a real round or game. The rule and the promotion checklist live
in [`docs/LAB_FIRST.md`](docs/LAB_FIRST.md).

## What's inside

| Round | What it trains | Content | Scoring |
| --- | --- | --- | --- |
| **01 Logic & aptitude** | Series, odd-one-out, syllogisms, data reasoning, arithmetic | 30 questions, 30s each | 10 pts per correct answer |
| **02 Memory & recall** | Reading a brief once and answering from it | 6 briefs × 3 questions, 12s to read | 10 pts per question |
| **03 Riddles & traps** | Refusing the reflex answer | 16 riddles, 45s each | 10 pts per riddle |
| **04 The panel** | Structure of spoken answers | 18 real questions, untimed | 4 structure marks each |

Plus **6 guides** (classification, number series, syllogisms, data reasoning, STAR answers, salary negotiation) with worked examples, and a **readiness score** weighted across all four rounds.

## Features

- **Segmented readiness dial** — four arcs, one per round, filling to your best score.
- **Score profile** — a hand-drawn radar of all four rounds on every result screen, so the weak axis is obvious.
- **Sound and haptics** — correct and incorrect cues generated with the Web Audio API (no audio files), with a mute toggle.
- **Confetti, ring timer, XP and levels** — game feel that respects `prefers-reduced-motion`.
- **Command palette** — `⌘K` / `Ctrl K` to jump anywhere; `1`–`4` to answer, `↵` for the next question.
- **Installable PWA** — manifest, maskable icons and a cache-first service worker. Works offline once loaded.
- **Local-first** — progress lives in `localStorage` through Zustand's persist middleware. No account, no server.
- **App shell, not a landing page** — a persistent sidebar on desktop (rounds, arcade, guides, XP), a five-tab bottom bar on mobile with a Menu sheet that reaches everything, and a context rail beside each quiz showing progress and scoring.
- **Route-level code splitting** — the first paint carries React, not the quiz engine.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # vitest
npm run build      # tsc -b && vite build → dist/
npm run preview    # serve the production build
```

Tailwind's stylesheet is **pre-generated** into `src/generated.css` by `npm run css`, which runs automatically before `dev` and `build`. After adding new utility classes, either re-run `npm run css` or leave `npm run css:watch` running in a second terminal.

## Project layout

```
src/
  components/        Shell: AppShell, Sidebar, TopBar, BottomNav, NavSheet,
                     CommandPalette. UI: Dial, TrackRow, QuizRunner, TimerRing,
                     OptionButton, Explanation, ResultShell, RadarProfile
  components/ui/     Button, Card, Chip, Progress (Radix + cva primitives)
  data/              Question banks and guide content, typed
  lib/               scoring, effects (audio/confetti/haptics), utils
  pages/             Home, Logic, Memory, Riddles, Panel, Guides, GuideDetail
  store/             Zustand progress store (persisted)
  test/              content integrity, scoring and render tests
public/              icons, manifest, service worker
```

## Testing

`npm test` runs three suites:

- **content** — every question has four distinct options, an in-range answer and a real explanation; ids are unique; every track has a sensible maximum; track weights sum to 1.
- **scoring** — readiness is weighted (not averaged), clamps at the maximum, and reaches 100 only when every round is maxed.
- **render** — the home screen lists all four rounds and renders the dial.

## Deploying

`npm run build` produces a static `dist/` folder. Any static host works — Netlify, Vercel, Cloudflare Pages, GitHub Pages. The included workflow (`.github/workflows/deploy.yml`) publishes to GitHub Pages on every push to `main`.

Because the app uses a hash router, deep links work on any host without rewrite rules. Service workers need **https** (or `localhost`) to register.

## Licence

MIT — see [LICENSE](LICENSE).
