# SNG-191 — two clocks, and a world that actually turns

| | |
|---|---|
| **Author** | CCode · 2026-07-19 |
| **Shipped** | Phases A, B, D, E — v1.8.167 → v1.8.170. Full Node suite green by exit code at every ship. |
| **Closes** | RUNNING_FIXES C1 · SNG-189 §2 · SNG-190 §5's open half — the invented day-numbers are gone. |
| **Remaining** | C (party clock-sync), the handled-fate trigger, §7.4 seasonal pressure — noted follow-ons below. |

Built in the order you set: A first (the clock), B (idioms), then "D then E" (the substantive halves).

---

## §1 · Phase A — the two-clock split (v1.8.167)

**A journey advances only the traveller's clock; the world moves on its own.** The two clocks now live in **different units on purpose** — two clocks in the same unit invite arithmetic (and a day-number to invent); two in different units simply coexist.

- **Character time** stays days/season/time-of-day — human units, what the GM narrates from — and is now **uncapped** (the 72h/168h `timeOps` clamp dies; RUNNING_FIXES A1).
- **World time** is `worldCount()` — a monotonic count (~1/real-hour), never rewound, the shared **ordering** key. A logical clock, not a wall clock: players agree on *before/after*, never on *when*.
- The `CURRENT TIME` block shows the character's own time + the count, and states plainly it is **not a date**. **There is no world day-number left to invent.**

`world_clock.json` (canon at HEAD) loads onto `CONTENT.worldClock` — the unit name you reserved was already resolved there (`count` / `the Kept Count`), so nothing was blocked.

**Verification note:** the Node suite proves it (an hour is +1, a day is +24, the clamp is gone); a cache-busted fresh `loadContent` in the browser returned 95 locations with `world_clock` loaded. The preview's static-import boot showed the known stale-module artifact (this session edited many bare-imported engine modules) — **you confirmed it loads clean on a fresh deploy.**

## §2 · Phase B — the peoples' idioms (v1.8.168)

One count underneath, many words on top. The count renders in the idiom of the people whose region the character stands in: **Cairnhold → tolls, the Gearlands → revolutions, the rootkin → risings, the umbral → darks.** The churnfolk keep no steady word and fall back to the formal term — the joke, mechanical. `worldCountLabel` resolves it from canon; the GM is told different peoples name the *same* count, so tolls and revolutions are never mistaken for different clocks.

## §4 · Phase D — the world TURNS, it does not narrate (v1.8.169)

The substantive half. The old tick asked a model *what happened to Calvar* and got colour — four news slots on small days while the water crisis moved not at all. **The inversion: stop asking what happened to a person; ask what progressed on what they are responsible for.**

- **Delegation is state** — `engine/assignments.js`. A `delegateOps` op captures it when the player puts a known person in charge of ongoing work (contract + salvage + dispatch + rule 14). The commitment is honoured while away.
- **The tick advances the work** — progress / stall / problem / done, an **outcome, not a mood.** News is **derived** from what moved and only when it bears on the work; an **empty news block is legitimate.** Personal colour rides on the person's `statusNote`, never a news slot.
- **Crises respond to the work (§4.2):** a charge against a crisis **holds** it from worsening; two **ease** it a stage back. An untended crisis worsens as it always did. A crisis nothing can affect is theatre — now delegation is how it gets solved offscreen.
- **Unguardrailed (§4b):** a problem may be serious, a success real, a crisis may run as far as its logic takes it — no ceiling, only attribution (who did it, what moved).

## §7 · Phase E — the generation turn, the world's own agenda (v1.8.170)

*"All of this is the game itself."* `generateRequest` was reactive-only; the world never reached for anything itself. This is the proactive half — `engine/latentarcs.js` + `runGenerationTurn`.

- **Arcs foment on the world count** whether or not anyone has seen them. **Discovery is a late event** in a thing that has been building — never its beginning.
- **Three fates, the middle one central:** grows (unguardrailed); **resolves itself** (the world solves its own problem before you arrive, and you learn only that it happened — §7.3, what keeps the world from being hero-dependent); handled (the model is ready for this fate; its trigger is a follow-on).
- **Attributable (§7 inv2):** every arc carries a **cause that existed before it surfaced** — the difference between a living world and a random-encounter table. New arcs seed from the **disposition of the regions the player knows** (regional, not global).
- **Surfacing is content, not an alert (§7.4):** an arc arrives as a rumour now specific enough to repeat, then rides in a `STIRRING IN THE WORLD` block for the GM to develop into a face, a place, a thread.

---

## Where it stands, and what remains

**A + B + D + E are shipped and tested.** The clock is correct and localized; the world advances delegated work and ferments its own arcs. The remaining pieces are genuine follow-ons, each honestly scoped:

- **§3 Phase C — party clock-sync.** Distributed infrastructure: the shared scene carries no clock and members' saves are client-side per device, so syncing character clocks means propagating a time delta across other players' saves — not writable synchronously. Its own focused build; I did not ship inert stamping for it.
- **The handled-fate trigger (§7).** The model has the fate; wiring "the player intervened" needs an intervention-capture path (a GM op or a resolution heuristic on a surfaced arc).
- **§7.4 seasonal pressure** — the cyclical band under the arcs (melt, scarcity, harvest). A clean layer to add on top of what shipped.

**Acceptance met:** a four-day journey costs four character-days (§6.1); world time is a count in the local idiom, never a bare day-number (§6.2); a return shows a count that has built and news of things that moved (§6.3); the water crisis responds to whether the delegated work happened (§6.4); no durable record carries a date the engine did not issue (§6.6). §6.5 (party shared clock) waits on Phase C.

*— CCode. The day-numbers are gone, the clock speaks the local tongue, the delegated work goes on, and the world ferments its own trouble while you are away.*
