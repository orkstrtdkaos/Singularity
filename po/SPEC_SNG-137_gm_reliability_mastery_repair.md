# SPEC — SNG-137: GM reliability — emit the mastery mark, and fix errors, when it should
## Aevi (PO) · 2026-07-16 · authored to spec · **awaiting CCode ROUND 2**

> **Erik: (1) mastery isn't promoting even after ripe skills are used repeatedly; (2) "strengthen the GM's ability to fix errors."** Root cause is SHARED: the GM's machinery for both is CORRECT and wired, but it depends on the GM *recognizing the moment and emitting the structured op* — and an LLM reliably narrates the right thing while intermittently forgetting to fire the op. This ticket strengthens the PROMPTING + closes coverage gaps; it does NOT change the (sound) mechanics.

> **Verified at HEAD `v1.8.92` — both systems exist and work:**
> - **Mastery (rank 3):** correctly GM-driven-only (`markDefiningMoment`, progression.js L215) — NOT accumulation, a single defining beat. The RIPE FOR MASTERY context block (gm.js L194) + rule 19B (L36) tell the GM. The op applies (app.js L2676). **So it's not broken — it's waiting for a defining beat the GM must mark.** But: rule 19B is terse, the ripe block is one line among many, and it doesn't NAME the specific ripe skills inline — so the GM can miss an earned moment.
> - **Error-fixing:** TWO channels, both real. (a) In-fiction `stateOps` self-heal (gm.js L60/74) — vocabulary `correctField·correctDomain·removeEntity·unstickQuest·reanchorLocation·fixCodexFact·refuse`, "repair not wish," applied at app.js L2769. (b) The Repair panel (SNG-085, app.js L4270) — exposes `corrections.js` DIRECTLY to the player, logged. **So the GM CAN fix errors — the gaps are reliability (does it emit?) + coverage (the vocab is fixed) + visibility (can it see the error?).**

## PART 1 — Mastery: make the GM reliably mark the earned moment
- **Name the ripe skills inline in the context block.** The RIPE FOR MASTERY block should list the SPECIFIC ripe abilities by name ("**Wither** and **The Grey Hand** are ripe RIGHT NOW — practiced enough; if this beat expresses either at its full, decisive form, emit markDefiningMoment"), not a generic reminder. The GM sees exactly what's waiting.
- **Strengthen rule 19B from permissive to imperative.** Current tone lets mastery slide. Make it: *when a ripe craft is used in a clearly decisive, scene-carrying way, you MUST emit markDefiningMoment — do not merely narrate the triumph and move on.* Keep the anti-inflation guard (mastery is still a real beat, not every use).
- **A gentle nudge after prolonged ripeness.** If a craft has been ripe for many beats and used decisively at least once, the ripe block can escalate the hint ("this craft has long been ripe — if this beat earns it, mark it"). Not automatic promotion — a stronger prompt to the GM's judgment.

## PART 2 — Error-fixing: reliability + coverage + visibility
- **Reliability — emit the correction, don't just apologize.** Strengthen the stateOps instruction: *when you acknowledge the game got something wrong (in prose), you MUST emit the matching stateOp in the SAME turn — an acknowledgment without the op leaves the error in place.* This is the biggest gap: the GM says "you're right, that's wrong" and forgets the fix.
- **Coverage — widen the repair vocabulary** to the errors that actually occur but have no verb today: `correctAbilityRank` (a rank set wrong), `correctBond` (a relationship state/stage that's wrong), `correctVital` (health/energy desync), `correctAttribute` (a stat the game mis-set), `mergeEntity` (two records for one person/place — dedup). Each bounded + logged like the existing ops; each "repair not wish" (no power/rank the play didn't earn). Add matching entries to the Repair panel so the player can also make these directly.
- **Visibility — surface likely errors so the GM CAN see them.** A light consistency check each turn can flag probable errors into the GM context ("POSSIBLE ERROR: this NPC has two registry entries; this ability's rank exceeds its practice") so the GM knows to repair. The engine already has the data; make the anomaly visible so the fix can be chosen.
- **Repair panel discoverability.** The 🔧 panel is the player's direct fix path but is easy to miss. When the GM emits a `refuse` on a repair the channel can't make (or a player asks to fix something out of character), point them to the Repair panel explicitly.

## ENGINE / UI SURFACES
| Module | Change |
|---|---|
| `engine/gm.js` | RIPE FOR MASTERY block names specific ripe abilities inline; rule 19B → imperative-on-earned-beat; stateOps instruction → "acknowledge-means-emit-same-turn"; widen the stateOps vocabulary list + a POSSIBLE ERROR context block from a consistency check. |
| `engine/corrections.js` | New ops: `correctAbilityRank·correctBond·correctVital·correctAttribute·mergeEntity` — bounded, logged, repair-not-wish. |
| `engine/*` (consistency) | A light `detectAnomalies(character)` (dup entities, rank>practice, vital desync) → feeds the GM POSSIBLE ERROR block + the Repair panel. |
| `app.js` Repair panel (L4270) | Expose the new correction ops; point players here on a refused/out-of-channel repair. |
| `tests/*` | The ripe block names the specific ripe crafts; a decisive use of a ripe craft yields markDefiningMoment (sim a defining beat); a prose acknowledgment of an error co-occurs with the matching stateOp; each new correction op fixes its target + is logged + refuses over-reach; detectAnomalies flags a seeded dup/rank error; Repair panel applies the new ops. |

## GUARDS
- **Mechanics unchanged** — mastery stays a GM-marked defining beat (not accumulation); repairs stay "repair not wish." This ticket makes the GM more RELIABLE at the existing rules, it doesn't relax them.
- **Repair not wish, always** — every new correction op refuses to grant rank/power/standing the play didn't earn; caps + logging as existing ops (applyStateOps 6-op cap holds).
- **Anti-inflation on mastery** — the stronger prompt still requires a genuinely decisive beat; "used it again routinely" must NOT trigger it. The imperative is on EARNED moments only.
- **Consistency check is advisory** — POSSIBLE ERROR flags inform the GM/player; they never auto-mutate state (a false positive must not "fix" a non-error).
- **No new player-cheat surface** — widening repair coverage must not let a player repair themselves into power; the panel's repair-not-wish refusal covers the new ops too.

## OPEN QUESTIONS — CCODE ROUND 2
1. Is the RIPE FOR MASTERY block already passed the ripe ability NAMES, or just a count? (Determines whether inlining names is a prompt change or needs the detail plumbed through — `masteryDetail` likely has them.)
2. `detectAnomalies` scope for v1 — start with the cheap high-value checks (dup entities via the SNG-019 resolver, ability-rank > practice, vital > max) and expand later?
3. Should the "acknowledge-means-emit" rule risk over-emitting corrections on ambiguous player claims? (Guard: the existing "repair not wish — when the player tells you something IS wrong" framing already scopes it to genuine wrongness, not player preference; keep that scoping.)
