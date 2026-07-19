# BATCH-12 — §5 ENGINE_MAP (mechanical) + §3 standing · CCODE-14

| | |
|---|---|
| **Author** | CCode · 2026-07-19 |
| **Built** | BATCH-12 §5a/§5b (mechanical columns + gate), BATCH-12 §3a–3e, CCODE-14 |
| **Ships** | v1.8.131 (`8e1b8c43`), v1.8.131 (`415de918`), v1.8.132 (`395f60ec`) |
| **Status** | complete_pending_review |
| **Suite** | green — smoke · parse_probe · content_ci · balance_sim · skill_battle_sim · wiring_audit · engine_map |

---

## §0 · What shipped, in the order you sequenced it

Your revised §6 order was ENGINE_MAP *mechanical* → §3a–3c standing. Both are in, plus one
unplanned fix that the second half exposed in the first half's neighbourhood.

---

## §1 · ENGINE_MAP — the mechanical half

`scripts/engine_map.mjs` → `ENGINE_MAP.md`, 54 modules. Derived columns and how each is measured are
stated **in the document**, so a column can be corrected rather than believed:

| column | derivation |
|---|---|
| depends on / depended on by | static imports — complete, `app.js` has zero dynamic imports |
| **reach** | transitive closure; `app.js` counts once if reachable at all, direct or through a chain |
| content it reads | schema fields harvested from the **real** location/NPC corpus, so a newly authored field appears without editing the script |
| GM verbs served | `applyTurn`'s dispatch, **not** imports |

**The GM-verb column took three passes to make honest, and that is the part worth reporting.**
A same-line match missed `turn.stageOps` (consumed three lines down inside a `for`). A block-scoped
sweep then over-attributed — it claimed `worldtime.js` serves `moveTo` because a clock call sat in
the handler. Narrowed to dataflow: only a call **receiving** the op counts, and string literals are
stripped first, because the carrier `deed` was matching the argument `"deed"`. Final: **15 modules
serve a verb; 16 ops reach no engine module at all** and are listed as such — some correctly (a
narration flag has nowhere else to live), some being engine logic in the view layer.

**Authored half:** 23/54 seeded, incrementally per your resolution. `player-visible surface` is the
column that earns its keep — `NONE` plus no content dependency plus no GM verb is the exact shape of
the eight, and the check names that shape.

**Three gates**, each verified by making it fail on purpose and then restoring: freshness · a
**half-authored** module FAILS (a purpose with no surface reads as complete when it isn't) ·
`modulesMissingFromSpecMap` ratchet.

### Found while building: SYSTEM_SPEC's module map had drifted the same way its header did

It said *"all 38 engine modules"* and documents 38 of 54. Undocumented: `substrate.js` — **§1's own
target** — plus `intent.js`, `waygate.js`, `gm_registry.js`, `skill_battle.js`, `company.js` and nine
more. Same silent drift BATCH-11 §0 caught in the header count, one section lower.

Fixed by **removing the number rather than restating it** — a sentence with no count cannot go stale
— pointing at `ENGINE_MAP.md`, and ratcheting the gap so it can shrink but never grow. The spec table
keeps the `NEVER` invariants, which no generator can derive.

---

## §2 · CCODE-14 — my own instrument was blind to the class it exists to catch

SNG-169 found `npcImage` imported and never called, **by hand**, as the 11th built-never-reached of
the batch. My orphan sweep reported `0` the entire time, because it counts references and **an
`import` statement is a reference**.

New ratchet `importedNeverCalled`, baseline 5, **named every run** rather than only on regression.
Three categories, now disjoint and complete:

| category | count | caught by |
|---|---|---|
| never imported | 0 | orphan sweep (advisory) |
| imported only by a test | 8 | `testOnlyExports` |
| **imported and never invoked** | **5** | **`importedNeverCalled`** ← was invisible |

**Two things the check taught me by failing on itself, both worth keeping:**

1. **It first reported 3, not 5.** The paragraph I wrote in `wiring_audit.mjs` explaining the fix
   *names `npcImage` and `profileInsight` as examples* — and `tests/` is in the consumer corpus. The
   audit read its own documentation as evidence the capability was wired. The corpus now strips
   comments as well as imports. **An instrument that can be silenced by describing it is not an
   instrument** — and the original orphan sweep had the same hole.
2. **The raw number was not the finding.** "Imported, never appears outside an import" counts **12**;
   ten are used *inside their own module* — needless public surface, not dead capability. The real 5
   is **2 dead** (`npcImage`, `profileInsight`) plus 3 live-but-needlessly-exported. Shipping 12
   would have been another number that looked like a finding.

**`playerprofile.js:profileInsight` is a NEW find for you** — not in SNG-169, same shape as `npcImage`.

---

## §3 · Standing — §3a–3e

`engine/standing.js`. **New module, not an extension of `reputation.js`** — which has reach 8 per the
map built an hour earlier, against this module's reach 1. First time the map priced a decision.

| § | what | note |
|---|---|---|
| 3b | `seedStandingAtCreation` | primary 4 / secondary 2 / tertiary 1 / antipode −1, antipode from the great circle not a hand-list. Born-to reads `known`, not `trusted` — birth is recognition; trust stays play's to earn |
| 3c | `accrueStandingForDays` | per in-game day, from the company you keep |
| 3d | `applyStandingOps` | model reports, engine adjudicates — clamped ±3 **and** never across a band edge |
| 3e | `standingFor` / `standingRoster` | one `{holderId, kind, score, band}` for people **and** settlements |

### One interpretation you should rule on

**"Small and uncapped-slow" taken literally lets a party member idle you to `kin`** — the band you
reserve for earned closeness. Rather than impose a cap you did not ask for, the rate **decelerates**
with score and never reaches zero. Priced in turns, which is what a player actually spends:

| band | turns | in-game days |
|---|---|---|
| known | ~128 | 7.5 |
| trusted | ~392 | 23 |
| kin | ~1080 | 63 |

Uncapped, genuinely slow, and `kin` stays somewhere you arrive rather than wait out. One constant
(`DRIP.floor`) retunes it.

### One spec trigger deliberately NOT built

§3c names three focused-work triggers. Two are derived — the tradition of the ability actually used,
and any people a `standingOp` names. **"Travel in their country" is not derivable and I left it out
rather than fake it:** a location carries `communityId` (a settlement) and `regionId`, and *nothing
maps either to a people*. `nativeLogic` is a paragraph of GM prose — I nearly passed it as a
tradition id. **That link is SNG-166's lane.** When region derivation lands, add it to one list in
`app.js` and nowhere else.

### Second cause of the empty screen, found while wiring

The Chronicle's standing render iterated **only the character's own three domains**. Standing with
any other people could never have appeared no matter what was earned. Now reads `standingRoster`.

### Reconcile v8 — what actually fixes Erik today

Standing-at-creation ships in this batch, so **every existing character was born without it**. v8
reuses the creation seeder, which is idempotent by construction (writes only peoples with no entry
at all), so a save whose play has already moved a score keeps it and re-running can never inflate.

---

## §4 · Wiring — five links, all closed

ENGINE `standing.js` · CONSUMER `app.js` (turn dispatch, clock, creation, reconcile) · REGISTERED
`gm_registry.standingDetail` in the **world tier** (stable while you are somewhere, so it caches) ·
REACHABLE the Chronicle standing list + `✦` receipts on band change · CONTRACTED `gm.js` reply
contract **and** the salvage allowlist. **Registry parity 47/47.**

**Both gates I built this morning fired on my own new module** — `standing.js` red-flagged the
ENGINE_MAP freshness check and the spec-map ratchet until it earned a spec row and its two authored
lines. Gap held at 15.

---

## §5 · Verification

25 new tests, and **verified against the real browser modules**, not a node stand-in — the Calvar
case run end to end at `localhost`: seed → 30 days of drip → band change to `trusted` → a
`standingOp` → the roster and the ledger lines a player would read.

**One honest limit:** I do not have Erik's save locally, so I verified the *engine* against live
modules and the *wiring* against the audit — I have not watched his actual Chronicle populate. The
reconcile step runs on next login; **that is the thing to confirm first in play.**

---

## §6 · spec_boundaries

1. **§3c "uncapped-slow"** — implemented as deceleration rather than a cap. Numbers above; retune or
   overrule.
2. **§3c "travel in their country"** — not built. Blocked on a location→people link that does not
   exist. SNG-166's lane.
3. **§3e convergence** — done at the API (`standingFor` answers for both kinds), not by merging
   `reputation.js`. Deed-sourced settlement standing keeps its own math.
4. **§5 authored columns** — 23/54. Incremental per your resolution; a module earns its lines when a
   spec touches it.

---

*— CCode. Two ships and a fix to my own instrument. The instrument one is the one I would read twice.*
