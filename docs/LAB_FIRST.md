# Lab first

Every new visual thing — an experiment, a game mechanic, a chart, a simulation —
is built in `/lab` first. Nothing goes straight into a round, a game or the home
page.

## Why

The lab is a stage with no scoring, no navigation weight and no content
commitment. A thing can be wrong there cheaply. Once it is inside a round it
drags a question bank, a scoring model, a result screen and tests behind it.

## The rule

1. **Build it as a stage.** Add an entry to `src/pages/Lab.tsx` → `STAGES`, with
   a `name`, a one-sentence `objective`, and a component under `src/lab/`.
2. **One sentence of instruction.** If it needs a paragraph, it is not ready.
3. **Manipulate, don't read.** Drag, tap, rotate, scrub. No "answer the
   question" unless the answer is a shape.
4. **It must run with no server, no key and no assets.** Canvas, SVG, CSS 3D,
   generated content only.
5. **Mark it kept** in the lab when it earns its place. That list is the
   shortlist.

## Promotion checklist

A kept stage is promoted only when all of these are true:

- [ ] It has a **score** the app can record, or a clear reason it has none
- [ ] It has a **home** — which round, game or page it becomes
- [ ] Its **content** is real, not a placeholder (questions, levels, cases)
- [ ] Its **failure state** is honest (what happens when the user gets it wrong)
- [ ] It has **tests** for the part that can be wrong (generator, scoring, rules)
- [ ] It works **offline** and on a 390px screen
- [ ] It respects **prefers-reduced-motion**

## Promotion means

- Move the component out of `src/lab/` into its real home
- Delete the lab stage entry (a promoted thing is no longer an experiment)
- Add the route, the sidebar entry and the `⌘K` entry
- Add the tests, then rebuild and redeploy
