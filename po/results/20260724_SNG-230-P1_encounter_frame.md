# SNG-230 Phase 1 — the Encounter Frame model + legibility header

**CCode · 2026-07-24 · v1.8.249 (`1c9fd37c`) · suite + wiring + content CI green · live-verified.** *complete_pending_review.*

Erik: "Make encounters OBVIOUS — once you hit one you FLEE it, DEFEAT it, or FAIL it." This ships the **frame-shape contract** + a legibility header that lands the core want now, without pre-committing the visual (Erik's ROUND-2) or new content (Aevi's kinds).

---

## ⚠ SPEC CORRECTIONS — Aevi, please fold into the spec (verified against the code)

The spec's "70% built" is right in spirit, but several load-bearing citations are wrong and change §4/§6/§7:

1. **There is NO `buildStagedDef`.** The real staged builder is **`synthesizeChallengeDef(entry)` (random_encounters.js:219)** — builds 2–4 stages `{name, attribute, subAttribute, axes, difficulty, failureCost:{health,energy,hours}}`, stage names from `STAGE_NAMES` keyed by flavor (chase/dangerous/default). Every §4/§OWNERSHIP "generalize buildStagedDef" must repoint here.
2. **No `FINISH`/`END` function family, and no `WARD` family.** The real families (functions.js:135) are **HARM, RESTORE, PROTECT, KNOW, SHAPE, INFLUENCE, MOVE, SUSTAIN**. "ward" is a **verb inside PROTECT**, not a family; "finish" doesn't exist at all. So §6b's "FINISH-family collapse" must key off HARM verbs or a new explicit `collapsible`/finisher flag; §7b's "the ward function family" is a PROTECT verb. `MOVE`/transit (verbs move/travel/open) is the one family reference that checks out.
3. **`app.js:1589` is danger-backfill, not a ward family** — bad citation (§7b).
4. **The outcome vocab is not at app.js:2023** (stale — that line is inside `enrichNpcDepth`). The real consumers are the `endEncounter` xpMap (app.js) + `sbEnd` outLine. Full set: `yielded, fled, opponent_fell, opponent_yielded, player_overcome, stalemate, abandoned, completed, walked_away, solved, incapacitated` — the spec omitted `opponent_yielded, player_overcome, stalemate`.
5. **Counts:** narrative **52**, opposed **4**, challenge **4**, duel **2** (62). "52 of 62" = narrative alone; narrative+opposed = 56.
6. **§6b–§7c are entirely unbuilt** — no `denies`/`breakDC`, no `collapsible`/`collapseDC`, no `premise`/`trivializedBy`/`resistDC`, no transition graph. (Expected — flagging so the spec's "already present" wording is corrected to "to build.")

Accurate as written: `renderSkillBattle` is the reference panel with three exits; the `{defId,state}` state layer; `startEncounter`/`setEncounterState`/`encounterReceiptForGM`; `canIncapacitate` gates escapability; challenge routing already carries per-stage `failureCost`.

## Answers to the CCode OPEN QUESTIONS

- **OQ2 (promote-to-frame threshold):** by flavor — the **`PERILOUS = ["dangerous","theft","chase","fight"]`** constant (random_encounters.js:14). 27 of 62 rows are perilous; the 35 beneficial/benign/beautiful stay narration. Clean, matches the §Guard. (Wired in the phase that promotes narrative rows — needs an activeEncounter those rows don't mint yet.)
- **OQ3 (puzzle/standoff):** both — generalize `synthesizeChallengeDef` for emergent ones + Aevi authors signature exemplars. `startEncounter` already builds `puzzle` state `{attempts,hintsRevealed,solved}`; `standoff` is a new type.
- **OQ5 (transition graph):** author it as **data** — each kind declares its own exits/transitions (a new kind is self-describing). `FRAME_KINDS` in encounterFrame.js is where that per-kind table lives.
- **OQ6 (collapse eligibility):** put `collapsible` + `collapseDC`-by-tier on the bestiary creature / encounter def (riffraff low, epic non-collapsible), read against the finisher's function family + the existing `resolve.js` opposed path. Extends `canIncapacitate`'s spirit.
- **OQ8 (degree→consequence):** one mechanical spectrum (collapse/hard/partial/glance/whiff) off `resolve.js`'s existing degree bands + the GM narrates the kind-specific shape. Confirmed viable — the bands exist.
- **OQ9/OQ10:** ward-denial + trivializedBy/premise are genuinely new machinery (Phase 4) — CCode wires the checks, Aevi authors `denies`/`breakDC` on ward abilities and `premise`/`trivializedBy`/`resistDC` on challenges.

## What shipped (Phase 1)

- **`engine/encounterFrame.js` (new, pure)** — the CONTRACT both the render (Erik) and content (Aevi) build against. `frameModel(def, state, entry)` → `{ kind, icon, title, winCondition, meter:{pct,label,done,total}, exits:[{role,label,means,action}], stage, failStakes }`. `encounterKind` maps `(type,flavor)` → fight/chase/hazard/puzzle/standoff. The **three exits always present** (§2.3): DEFEAT + FLEE are chooseable and wire to the EXISTING `[data-encact]` round path (stage/attempt, abandon/walkAway); FAIL is a fight's Yield button, else the OUTCOME of losing (no button — its `failureCost` stakes surfaced). `null` for an unframed encounter.
- **app.js / style.css** — an `.enc-frame` header rendered above the existing encounter buttons for the classic duel / challenge / puzzle (skill_battle fights keep their own richer panel): the bounded thing made obvious — what it IS, what winning MEANS, the meter, the three ways out.

## The phase plan (the spec wasn't decomposed — this is the dependency order)

1. **Phase 1 (shipped):** the frame model + legibility header — the shape contract.
2. **Phase 1b (Erik's visual — OQ1):** the full takeover/banner panel (generalize renderSkillBattle's treatment). **Blocked on Erik's call: full takeover vs. compact banner vs. size-by-tier.**
3. **Phase 2 (§6a):** frame chaining — FIGHT —flee→ CHASE —fail→ FIGHT/FAIL, as a data transition graph on `FRAME_KINDS`.
4. **Phase 3 (§6b + §7a):** skill collapse/morph — a finisher/transit craft offers a collapse action, opposed check keyed off function family, resolved along the degree bands.
5. **Phase 4 (§7b + §7c):** ward-denial + kit-trivialization — the most authoring-heavy (Aevi content).

## Verified

Live (fresh port): the module loads in-browser and `frameModel` yields the right descriptor for a synthesized chase (🏃, "Catch them — or shake free", meter 1/3, defeat→stage / flee→abandon / fail-stakes health:2 energy:4) and hazard ("Hard Ground"); narrative → null; zero console errors. Smoke: 9 SNG-230 checks. Suite + wiring-audit (testOnlyExports still 7) + content CI green; SYSTEM_SPEC engine modules 66→67; no mojibake.

**Aevi:** the frame shape is SET — author per-kind copy (titles/verbs/meter labels in `FRAME_KINDS`) + PUZZLE/STANDOFF exemplar encounters against this descriptor. **Erik:** the header is the thing to react to for the full-panel visual (OQ1).

*— CCode. The bounded thing is legible now; the takeover panel, the chaining, and the intelligence (collapse/ward/trivialize) build on this contract, one phase at a time.*
