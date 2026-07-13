# Results — SNG-084 Phase 1 (in-context helper text — every mechanic explains itself where it bites)

Date: 2026-07-13 · v1.8.51 · npm test green · live-verified. Status: **Phase 1 shipped, complete_pending_review.** Copy authored by Aevi (`helper_text.json`), surfaced by CCode.

Erik — who designed the game — could not tell the breadth-capacity rule from a bug. *"A rule the player cannot distinguish from a bug is, functionally, a bug."*

## The mechanism (reusable)
- **Loads the authored copy** (`helper_text.json`, 37 entries `id → {short, more}`) through the manifest into `CONTENT.helpText` (now loadable per SNG-092).
- **`infoDot(id)`** renders an **ⓘ** ONLY where authored copy exists (no dangling dots). **One delegated `app`-level click listener** drives them all — it survives `chrome()` re-renders (those replace app's children, not app itself).
- **`showHelp(id)`** — a dismissible overlay: the one-sentence **`short`**, **`more`** behind a progressive toggle (don't dump the system on a new player), and **📖 The Library** for the deep read. `mdLite` renders the copy's `**bold**`.

## Wired surfaces (the walls the Erik test names)
- **The breadth-capacity cap** (`lock.capacity`) — Character screen abilities header **and** the play-time learn list, shown **only AT capacity** (the exact wall Erik hit).
- **Energy** (`energy.no_regen`) — the play sidebar (no passive regen).
- **The great circle** (`circle.what`) — the Skill Wheel header.

## Verification (live)
The ⓘ renders at each surface; clicking opens the authored copy — e.g. *"Energy does not come back on its own. You recover by eating, resting, sleeping, or sitting still on purpose."* and *"Twenty-four peoples on a ring. Twelve axes…"*; **more** expands; **Got it** closes; **Library** navigates. The capacity dot correctly appears only *at* capacity (absent at 2/6). No console errors. CSS added to `style.css` (`.info-dot`, `.help-overlay`, `.help-card`), theme-aware.

## Erik test
"Hit any wall — a capacity cap, a locked skill, an empty energy bar — and verify the game tells you WHY, in one sentence, without asking anyone." Capacity cap + energy confirmed live; both pull the authored line.

## Phase 2 (deferred — flagged, same mechanism)
The remaining surfaces in the spec table: **roll receipts** (novel −15, discovery +20, spectral fit, difficulty, exhaustion), **gambits**, **tiers/ranks**, **XP/levels**, **quest routes**, **companion bond**, **world.danger/precursor/heard-of**, and a **locked-ability** ⓘ (the learn list currently hides barred abilities rather than showing them with a reason). Plus spec point 2 — **"every refusal explains itself"** (a silent "no" is the worst thing in the game). All reuse `infoDot`/`showHelp` + the authored entries that already exist in `helper_text.json`.
