# SNG-209 Phase 1 — death is a STATE, not a terminus (the engine substrate + the clock)

**CCode · 2026-07-23 · v1.8.228 (`e656609c`) · smoke + wiring-audit green · booted clean on a fresh port.**
`status: complete_pending_review`

The spec was `awaiting CCode ROUND 2` and is design-heavy — the roads back are tradition content (§3), the
retrieval quests are content (§5.5), player-death is a UX call (§4). So I built the **foundation everything
else hangs off** — the death-state model, computed depth, the clock, and the §5 un-terminal-ing — and I'm
surfacing the genuinely-yours decisions rather than inventing an afterlife system solo. The reframe (§1 —
*"everything that assumes dead = gone must stop assuming it"*) is the part that shipped.

---

## What shipped (the substrate)

**`engine/death.js` (new module, 65th).** Pure over `(entity, currentDay, rules)`, never throws:
- **`enterDeathState(entity, {diedDay, bodyStatus, sealed, depthOverride, cause})`** — §5.4. A **status
  extension, never a delete**: sets `status:"dead"` + a `deathState` record. Preserves an existing state
  (won't un-seal, keeps the original `diedDay`).
- **`deathDepth(entity, day, rules)`** — §2. Computed **0 the threshold · 1 the near dark · 2 the deep dark ·
  3 the sealed**, from days-dead (threshold→near→deep) with body-loss forcing the deep dark. `sealed`→3; a
  **GM `depthOverride` wins** over the clock. Defaults: near-dark at 1 day, deep-dark at 30, seal at 120
  (all `rules.death`-overridable — see Q3).
- **`isSealed` / `isRetrievable`** — §1. A dead-but-unsealed figure is a *hook*, not a void.
- **`deepenDeaths(entities, day, rules)`** — §5.6, **THE CLOCK.** A death untended past `sealAfterDays`
  sinks to sealed. Mutates, returns the newly-sealed (for news). Idempotent; spares the recent.
- **`resolveRetrieval(entity, outcome, {day, changed})`** — §4. **return** (status active, optionally
  *changed*), **fail** (sinks deeper, may seal — the attempt is a risk), **seal** (one-way). A sealed death
  refuses every road.
- **`reachableDeadForGM(character, content, day)`** — §1, the un-terminal reader. The dead who are NOT gone,
  each at its wall; sealed deaths omitted.

**The un-terminal-ing (§5), wired:**
- **§5.3 — epic death** (`worldtick.js` `applyEpicClashOutcome`): a killed legend now **enters the death
  state** (depth 0, fresh, reachable) instead of a bare `status="dead"` flip. **This is the Q5 gate — 208's
  kill-outcome now routes through 209.**
- **§5.6 — the clock** runs on every offscreen tick (beside `decayWakes`): sweeps epic statuses + the npc
  registry, seals the long-untended, and surfaces each seal as a real event (*"has passed beyond the roads
  back"*).
- **§1 — the GM sees the reachable dead.** New `reachableDeadDetail` GM-context row (`gm_registry.js` →
  `gm.js`): *"THE DEAD WHO ARE NOT GONE … a road back still reaches them; the deeper the wall, the harder the
  road, and the clock is sinking them."* A killed figure narrates as a latent hook, never a menu.
- **The Phase-1 retrieval trigger:** a **`resolveDeath` god-mode op** (`authormode.js`) — the author enacts a
  return/seal/fail on a death state now, before the tradition-road quests exist. Logged to `authorEdits`.

**Tests (smoke):** depth grades incl. body-loss + override; the clock (seals untended, spares recent,
idempotent); retrieval semantics (return-clears-state, fail-deepens, sealed-refuses); both wirings
(epic-kill→enterDeathState, tick→clock, the GM reader with sealed-drop, the god-mode return + its guard).
SYSTEM_SPEC 64→65 modules. `testOnlyExports` back to baseline 7 (every export fires in play).

---

## ROUND 2 — answered

- **Q1 (depth: computed vs authored?)** → **computed-with-GM-override**, exactly as you leaned. `deathDepth`
  computes from time+body; `deathState.depthOverride` (and `sealed`) let the GM/author pin a death by fiat.
  Thresholds are `rules.death` data, so the curve is tunable without code.
- **Q2 (`deathState` home: status object vs a `character.theDead` ledger?)** → **Phase 1 = status object**
  (the smallest true change; reuses the machinery per your GUARD). But your instinct about a queryable "who
  can I bring back" surface is right — I built it as a **read model** (`reachableDeadForGM`) rather than a
  second source of truth. **Recommendation:** keep the state on the status object; if the retrieval-quest UI
  wants a first-class list, derive it from the reader, don't duplicate the state. Flag if you'd rather it be
  a stored ledger — that's a small addition, but two homes for one fact invites drift.
- **Q3 (tradition-road gating as data — §3)** → **yours to author, and the shape is ready for it.** The
  clean parallel to `tradition_motivations.json` is a `data/.../death_roads.json`: per-tradition
  `{ reachableDepth, method, cost, changesThem }`. `resolveRetrieval` is the primitive a road-validated quest
  calls; `rules.death` already reads external config. I did **not** invent the roster of roads (§3 names
  ashwarden/numinous/wright/rootkin/abyssal/hourkeeper idioms — that's your voice + the epics-as-gatekeepers
  design). Author it and I wire the depth-gate.
- **Q4 (player-death UX)** → **genuinely a design call — not built.** The engine is ready (a player death is
  just `enterDeathState` on the character + the party/ally as retriever), but the *screen* — roads-out shown
  vs. handed-to-an-ally — is yours. Flagged, not guessed.
- **Q5 (sequencing — 209 gates 208)** → **confirmed and landed.** 208's `applyEpicClashOutcome` kill now
  enters a death state; a killed epic is reachable-then-sinking, not deleted.

---

## The honest Phase-1 / Phase-2 line

**Built (substrate):** the model, depth, the clock, the epic-death gate, the GM reader, the god-mode trigger.

**Deferred (design/content — ROUND 2):**
- **§3 tradition roads** — content (your voice + the epic gatekeepers). The data shape and the primitive are
  ready.
- **§5.5 retrieval-quest category** — the actual quests. `resolveRetrieval` is their engine hook; the
  `quest_structure` outcome that calls it is a small Phase-2 wire once a road exists.
- **§5.2 companions / NPC death onto the clock** — partially: a dead NPC/companion already *surfaces* in the
  reader (reads as near-dark, retrievable). But only the **epic** death site stamps a `deathState`, so only
  epics are on the clock. Stamping `enterDeathState` at the NPC/companion death site (so they sink too) is a
  one-line Phase-2 wire I left out deliberately — it belongs with the retrieval-quest work, and I didn't want
  to change NPC-death behavior mid-foundation.
- **Player-death UX (§4)** — your design call.

## Honest bound
The engine layer is **Tier-1 verified** (Node smoke + wiring audit + a clean fresh-port boot). The two
player-facing effects are **Tier-3 live confirms**: the GM narrating a reachable dead figure needs a real API
turn where someone has died; the `resolveDeath` return needs a click in the dev Author panel. I can't drive
either in a preview. What's proven: the state model is correct, the clock seals on schedule, a killed epic
enters the state, the reader surfaces it into the prompt, and the god-mode op returns/seals with a guard.

*— CCode. The spec's own reframe was the assignment: I didn't add a resurrection button, I made the whole
engine stop treating dead as gone. Depth, a clock that sinks the untended, and a GM that can see the dead who
are still within reach. The roads back are yours to draw — the ground they stand on is in.*
