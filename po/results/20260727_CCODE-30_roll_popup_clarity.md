# CCODE-30 — Mechanical clarity in the roll-breakdown + craft-quality popups

**CCode · 2026-07-27 · v1.8.290 (`1f65e1b6`) · npm test exit 0 (3 new resolver checks, rawProseCaps 63, wiring audit all-pass).**

Erik, reading a live roll receipt: *"I don't really understand how Cy's assistance helps, or how the local
lattice helps/hurts, or what skill I used as a base... were there opposed rolls?"* The popups showed the numbers
but never named the mechanics behind them.

## The two mechanics that were conflated (and now aren't)
The receipt has **two different numbers** that looked like one:
1. **The success chance** (the tappable %): a sum of components → the number you roll a d100 at-or-under.
2. **The craft-quality line** ("ran at 93%"): a *separate* effectiveness multiplier — how much of the craft
   *arrives*, set by the local lattice density — not whether it lands.

## What I changed
### The breakdown popover (tap the chance)
- **A header** — *"Success chance 55% — roll a d100 at or under this to succeed."* Says what the number is.
- **The BASE is named** — the attribute/sub-attribute line now reads *"insight 3 +60 ← your base (the attribute
  this draws on)"*, so Erik's "what skill did I use as a base?" is answered on the receipt: the roll drew on the
  **insight sub-attribute**, not the Prism Sight ability.
- **Opposed-vs-inherent is explicit** — a real foe rolling → *"⚔ Opposed by the raider (threat 35) — that
  resistance above is their strength, not a fixed number"*; a plain difficulty → *"No opposed roll here —
  'difficulty' is the task's own hardness, set by the GM from the fiction."* Answers "were there opposed rolls?"
- **`engine/resolve.js`** now tags the retained breakdown with `{ base, opposed }` — the two facts the popup needs
  to read plainly. Additive; every other breakdown consumer (fog view, skill-battle) is unchanged.

### The craft-quality line ("...ran at 93% (Cy +0.14)")
- Its ⓘ pointed at **`roll.spectral_fit`** — the **wrong** mechanic (spectral fit is *place disposition*, a
  different breakdown term). Repointed to a **new `roll.substrate`** help: *craft strength* (how much of the craft
  arrives), **separate from the success chance**, set by the lattice density; Continuous craft wants dense ground,
  Returned craft the reverse; and what a carried companion/item delta does.
- **The `(Cy +0.14)` delta** now carries a hover title: carried substrate (a companion aura or charged item)
  shifts the *effective density* — **+** helps a craft that wants it denser, **−** helps one that wants it thinner;
  the sign is the shift, not a verdict. So "how does Cy help?" is legible: Cy is carrying substrate that moves the
  ground +0.14, and whether that helps depends on the craft's best-ground.

## Live verification (fresh port 8364, crafted breakdowns)
- **The screenshot's roll** renders: *"insight 3 +60 ← your base (the attribute this draws on)"* … *"No opposed
  roll here — 'difficulty' is the task's own hardness…"* → total 55% → rolled 4 → crit success.
- **An opposed roll** renders: *"strength 4 +80 ← your base"* … *"⚔ Opposed by the raider (threat 35)…"*.
- **`roll.substrate` help** loads + expands (short + the full Continuous/Returned + companion explanation).

## Files
- `engine/resolve.js` — `{ base, opposed }` on the retained breakdown.
- `app.js` — enriched `showBreakdownPopover` (header, base marked, opposed clarified); the substrate line's ⓘ →
  `roll.substrate`; a hover title on the carried-substrate delta.
- `content/packs/core/rules/helper_text.json` — new `roll.substrate`; expanded `roll.difficulty` (names the
  opposed-vs-inherent distinction).
- `tests/smoke.mjs` — 3 checks (base named; opposed null on inherent difficulty; opposed names the foe).

## Notes
- CCode-direct clarity work (Erik's live question, no Aevi spec) → CCODE-30.
- The success-chance components themselves (aptitude lines, spectral fit) already render verbatim; this made the
  *base*, the *opposition*, and the *separate craft-strength mechanic* legible without changing any math.

*— CCode. The receipt now says what each number means, names the base, and tells you whether anyone was rolling
against you. status: complete_pending_review.*
