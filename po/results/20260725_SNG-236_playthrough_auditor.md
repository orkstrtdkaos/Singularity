# SNG-236 — the Playthrough Auditor: built, proves itself, and LOCALIZES Silas's zero to the GM

**CCode · 2026-07-25 · v1.8.272 (no bump — a new non-gated test file, no engine change) · `tests/playthrough_sim.mjs` green + self-test bites.** *Erik, mid-build: "I think the failures are largely from the PROMPT for the GM… likely that we're giving it TOO much to think about… not sure though." — He is right, and the harness proves the complementary half.*

## What was built (§3, CCode lane)

`tests/playthrough_sim.mjs` — a headless Monte-Carlo that drives the **REAL** engine cadence functions (never a reimpl, per §GUARD):
- **Encounters:** `resolvePacing` → `rollTrigger("onTravel", …)` → `eligibleEncountersFor` (the SNG-231 offer pool) — the exact leaf-path live play calls.
- **Epics:** `worldtick.offscreenPopulation` with the DEFAULTS the real caller (`advanceGeneratedOffscreen`) passes — `epicRate 0.6, minEpicGapDays 3` (the live dial IS the default; the SNG-208 0.34/6 override is never passed).
- **Legends normalization:** loads `lore/legends.json` (`{figures}`) through the REAL `loadLegends` (→ `{roster}`) — so a `figures→roster` mapping bug would surface HERE, not at L25.
- **Cohorts:** combat / social(Silas) / craft across the SNG-113 fingerprint; asserts the `DESIGN_INTENT_cadence.md` FLOORS at **p10** (an unlucky run, not the average — an average hides the exact failure that produced Silas).

**Anti-theater self-test (the SNG-232 lesson, §GUARD "a passing auditor is theater").** Before the faithful run, the harness severs a seam in the SAME code path and confirms the metric collapses to Silas's zero:
- **Seam A** — read legends the WRONG way (`.roster` off a `{figures}` file → `[]`): epics_met max **0**/40 → the epic floor FIRES.
- **Seam B** — wrong trigger key (`"travel"` vs `"onTravel"` → `rollTrigger` returns false every turn): encounters max **0**/40 → the encounter floor FIRES.

Both reproduce Silas's exact two zeros as wiring breaks, so the GREEN faithful run below MEANS something. If a seam fails to collapse, the harness exits 2 ("HARNESS INVALID").

## The finding — the engine layer is NOT the cause

Driving the real leaf-functions at the current dials, **every cohort clears every floor, abundantly** (p10, worst-case):

| cohort | recognizable enc (floor 25) | epics (floor 3) | first epic (floor L10) | non-combat frames (floor 8) |
|---|---|---|---|---|
| combat | **311** | **46** | **~L1** | — |
| social (Silas) | **114** | **47** | **~L1** | **11** |
| craft | **100** | **47** | **~L1** | **10** |

The cadence **math is fine**. Silas's zero **cannot** come from the leaf-functions a headless sim can drive.

**This answers spec OQ#2** (audit "can the engine offer?" separately from "does the GM offer?"): the **engine CAN offer** — `rollTrigger`, `eligibleEncountersFor`, and `offscreenPopulation` all deliver. **By elimination the break is at the GM-OFFER BOUNDARY** — the GM is handed live eligibility each beat and does not ACT on it. A headless sim cannot drive the GM (model-in-the-loop), so that boundary is out of the sim's reach BY CONSTRUCTION — but the sim has localized the failure TO it.

## Erik's hypothesis, confirmed — and made precise (three mechanisms)

The GM-prompt load audit corroborates "too much to think about," with numbers:
- `GM_SYSTEM` constitution alone ≈ **12,337 tokens**, **19 numbered rules**, before any world state.
- **65 context builders → 28 pushed sections** per turn on top.
- **114 `MUST`/`NEVER`/`ALWAYS`/do-not directives** across `gm.js` competing for attention.

Under that load, the encounter cadence fails through **three concrete seams** — all file:line-verified:

1. **The recognizable offer is SOFT.** `gm.js:250` — rule 18 is *"offer ONLY these ids via a choice's `encounterId` **when the fiction invites it**."* A conditional, buried among 28 sections. Contrast the hard mandates that fire reliably (`travelDirective` = *"MUST-emit moveTo"*). Under saturation, an LLM keeps the hard MUSTs and drops the soft conditional. **This is why the structured/recognizable encounters never appeared.**

2. **The auto-fire path is DELIBERATELY invisible.** `gm.js:276` — the SNG-075 weave (which DOES auto-fire when `rollTrigger` hits, `app.js:4725`) is directed: *"weave it in, **do not announce it as a system event**."* So even when the engine fires, the encounter is blended into ambient prose, never framed as a bounded encounter (SNG-230). This is **literally** Silas's complaint: *"never once triggered encounters I could tell were encounters."* Something fired — he just couldn't TELL, by design.

3. **A social player never even rolls.** `app.js:4716` — `if (kind === "none") return`. The encounter roll only fires on `rest` / `travel` / narrative-TIME beats. A talker sitting in a room (`timeOps` "none", a short declared exchange) classifies as **`none` → the roll never runs**. A combat/travel character moves through space → rolls `onTravel` constantly; **Silas sat in conversations.** The harness's social cohort passes ONLY because its `seeksDanger 0.45` abstraction assumes physical travel-through-danger — the REAL stationary talker is silenced upstream of every dial.

Secondary (§5b, pool composition): the offerable pool is fight-heavy — **28 fight / 4 challenge**; opposed/standoff entries aren't offerable by `eligibleEncountersFor` at all. A social character's recognizable encounters are ~87% fights they'd decline. The §5b playstyle-weighted increment (bias cerebral danger-locations toward puzzle/standoff frames) is still the right fix even though the volume floor currently clears.

## Recommendation — a GM-offer-boundary fix (needs an Aevi spec + Erik's design call; NOT built this turn)

The fix touches the GM constitution and the encounter directives — **voice/design-shaped work that belongs in a spec + the review step**, not a unilateral CCode rewrite of a 12k-token constitution. Concrete directions, in order of confidence:

- **A. Make the recognizable offer a HARDER directive when the engine has already decided.** When `rollTrigger` fires AND the eligible pool is non-empty, don't leave the frame to soft "when the fiction invites it" — hand the GM a **must-consider** directive (the `travelDirective` pattern). Engine-lane; low risk; I can build once the shape is ratified.
- **B. Let a woven encounter ESCALATE to a recognizable frame** when the seed is a real challenge/duel (not every ambient weave — a decisive one). Reword SNG-075's "do not announce as a system event" so a *bounded* encounter IS framed (SNG-230), while trivial texture stays woven. Voice-shaped — Aevi.
- **C. A stationary-player encounter path.** A social/cerebral beat that classifies `none` should still be reachable by non-combat frames (a standoff in a council hall, a puzzle in an archive) — the §5b "playstyle term," but the deeper cut is that the roll is gated on *physical* time/travel, so a talker is structurally exempt. Design call — Aevi + Erik.
- **D. Reduce GM load.** 28 sections + 114 MUSTs + 12k constitution is a lot to hold. An audit of which sections are load-bearing every beat vs situational (many are conditional already) could tier the prompt so the encounter/epic offers aren't competing with rarely-relevant blocks. Bigger effort; its own ticket.

## Ownership / handoff

- **CCode (done):** the harness — real path, cohorts, floors at p10, self-test, localize-the-break. Green; not yet in `npm test` (it gates once the GM-offer fix lands + Erik tunes the [DIAL] floors + ratifies §5b).
- **Aevi owes:** a GM-offer-boundary spec (directions A–D above; A/C are the Silas-direct fixes). This is the meta-fix SNG-236 §4 names — and it turned out to live in the PROMPT, exactly where Erik pointed.
- **Erik owes:** ratify the [DIAL] floors (currently Aevi's conservative drafts — the harness clears them with huge margin, so they're not yet load-bearing) + decide A–D.

## spec_boundaries

- **The spec predicted the harness would FAIL-first "reproducing Silas's zero" (§6), assuming the DIALS were the culprit.** Driving the real functions FALSIFIES that assumption — the dials are fine; the cause is downstream at the GM. The harness proves it bites via the self-test instead (severed seam → red), which satisfies the §GUARD anti-theater requirement honestly rather than by rigging a fail. Flagging because it changes the SNG-236 narrative: this was never a dial-tuning problem.
- **Did not build the GM-offer fix.** It rewrites the GM constitution / encounter directives (voice + design), needs the review step, and Erik framed his read as a hypothesis ("not sure"). Localized precisely (A–D); ready to build the engine-lane parts (A, and the mechanical half of C) on Erik's word.

*— CCode. The engine can offer; the GM, buried, doesn't. Erik's instinct found it and the harness pinned it. status: complete_pending_review.*
