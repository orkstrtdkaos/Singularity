# SPEC — SNG-249: Concrete objectives + satisfaction criteria required on all quests/encounters (esp. generated)
## Aevi (PO) · 2026-07-27 · Erik-directed (the concreteness REQUIREMENT on generation)

> **Erik:** "Build the requirement of CONCRETE objectives and criteria to satisfy them into any quests,
> encounters, etc. Just because we CAN generate a quest doesn't mean I want some vague nice-sounding wordy mess
> that is nonsensical."

## §1 — Diagnosis (verified): the FIELD exists, the CONCRETENESS isn't enforced
- A quest stage already REQUIRES `id`, `objective`, AND `condition` (content_ci:565). The self-test shows the
  intent perfectly: `objective: "Go to the tree-line", condition: "you reach the tree-line"` — a concrete GOAL
  and a concrete SATISFACTION CRITERION. The slot for "how you know it's done" EXISTS and is required-present.
- BUT the check is PRESENCE ONLY (genschema.js is a generic required-field validator — it checks a field is
  THERE, never that it's CONCRETE). `condition: "when harmony is restored"` passes exactly as happily as
  `"you reach the tree-line"`. And SNG-239 (the quest-clarity work) stayed a PROSE RULE — it never became a gate.
- So a generated quest can satisfy every schema check while being the vague nonsense Erik is describing: a
  present-but-meaningless objective, a present-but-untestable condition. Generation without a concreteness
  REQUIREMENT just produces prettier nonsense faster (Erik's exact worry — SNG-248 makes generation powerful;
  SNG-249 makes it DISCIPLINED).

## §2 — The requirement: objective + satisfaction criterion must be CONCRETE and TESTABLE
Every quest stage and every encounter, AUTHORED OR GENERATED, must carry:
- **A concrete OBJECTIVE** — a specific, doable thing, not a mood. "Find the engineer Corren in the Edge
  District" not "restore what was lost." Names a WHAT and usually a WHERE/WHO.
- **A testable SATISFACTION CRITERION** (`condition` / for encounters the finish condition) — a checkable state
  the engine or GM can UNAMBIGUOUSLY evaluate as met/not-met. "You reach the tree-line" / "the ward is disarmed"
  / "Corren agrees to come" — not "harmony is restored" / "the truth is understood" / "balance returns."
- **The test of concreteness:** could a GM (or the engine) look at the game state and say YES, that happened, or
  NO, not yet — without interpreting a metaphor? If satisfaction requires reading tea-leaves, it's not concrete.

## §3 — How to ENFORCE it (not just request it) — three layers
### §3a — generation prompt (Aevi): demand it at authorship
The generate() prompt for quests/encounters must REQUIRE a concrete objective + testable condition per stage,
with the concreteness test stated and good/bad examples IN the prompt ("GOOD condition: 'you reach the ridge'.
BAD condition: 'you find peace' — untestable"). The model authors concrete because the prompt makes vague
non-compliant. (SNG-239's clarity rule, moved into the generation prompt as a hard requirement.)
### §3b — a CONCRETENESS VALIDATOR (CCode): gate it, don't hope
A new validator (extends the born-complete gate, SNG-234/248) that checks objective+condition are concrete, not
just present. Structured signals it can check cheaply:
- **condition names a checkable event/state** — references a place, entity, item, or state-change the game
  tracks (reach X / obtain Y / N of Z / talk-to W / disarm V), not only abstract nouns.
- **reject the vague-marker set** — a condition that is ONLY mood/abstraction ("harmony/balance/peace/truth/
  understanding is restored/found/achieved") with no concrete anchor FAILS.
- **objective is actionable** — starts with or contains a doable verb toward a named target, not a state-of-being.
A generated quest/encounter that fails concreteness is REPAIRED (regenerate the stage with a sharper prompt) or
REJECTED — never shipped. Same gate for authored content in content_ci (SNG-239 finally becomes a gate).
### §3c — the satisfaction criterion must WIRE to a real effect (CCode)
Concrete isn't only readable — it must be MECHANICALLY LIVE. A stage's condition should map to something the
engine can actually detect as satisfied (SNG-235's effects[] work — a completed stage/quest fires real effects).
A condition the engine can't detect isn't concrete, it's decorative. Tie the criterion to the tracked state so
"met" is a real transition, not a GM guess.

## §4 — Why this is the necessary guardrail on SNG-248
SNG-248 makes the engine generate quests/encounters on demand, in-style. WITHOUT §249, "in-style" includes
in-the-vague-evocative-style, and the generator will happily mint beautiful nonsense — a quest that SOUNDS like
a quest but has no doable objective and no checkable end. §249 is the discipline that makes generative power
TRUSTWORTHY: every generated thing has a concrete point and a testable finish, so the world can grow itself
WITHOUT filling with wordy mush. Generation earns trust by being concrete, not just fluent.

## OWNERSHIP
- CCode: §3b the concreteness validator (extend the born-complete/consumer-map gate — objective+condition must be
  concrete, not just present; vague-only conditions rejected/repaired); §3c wire the satisfaction criterion to
  detectable state (tie to SNG-235 effects[] so "met" is real); apply the gate to BOTH generated content (at mint)
  and authored content (in content_ci — SNG-239 becomes a gate at last).
- Aevi: §3a the generation-prompt concreteness requirement (the hard "concrete objective + testable condition,
  GOOD/BAD examples" language, per type); and the vague-marker set (which abstractions signal untestable) from the
  SNG-239 audit. Content/rule authoring, my lane.
- Erik: how STRICT the gate is — hard-reject a vague generation (regenerate until concrete) vs. flag-and-repair;
  and whether authored content is held to the same bar in CI (lean: yes — the rule is the rule regardless of
  source).

## GUARDS
- **Concrete means TESTABLE, not verbose** — the fix is a checkable end, NOT more words. A long objective can be
  as vague as a short one; the test is "can the GM say yes/no from game state," not length. Don't let "concrete"
  become "wordier."
- **Mystery at the START is still fine** (SNG-239 §6a) — a quest can OPEN unclear; the requirement is that the
  OBJECTIVE and CONDITION are concrete, so the player always has a doable thing and a knowable end even when the
  story's meaning unfolds. Concrete structure under evocative surface — not evocative structure.
- **Reject vague, don't just warn, on GENERATION** — a generated quest that fails concreteness must not ship;
  regenerate or reject. Authored content can warn-and-fix in CI, but generation is the higher risk (volume,
  unattended) and gets the hard gate.
- **The criterion must be engine-detectable** (§3c) — a concrete-SOUNDING condition the engine can't actually
  check is still decorative. Concrete = the engine/GM can evaluate met/not-met against real state. Tie to SNG-235.
- **Don't strip voice** — concreteness is a floor, not a ceiling on flavor. A stage can be concrete AND beautifully
  written; the gate removes nonsense, never richness. (The grieving-warden standoff is concrete — "get under the
  refusal to the grief," "they step aside" — AND fully voiced. That's the target: both.)

## OPEN QUESTIONS
1. (Erik) Gate strictness on generation: hard-reject-and-regenerate a vague objective/condition, or repair it
   with a sharpening pass? Lean: repair once, reject if still vague (don't loop forever, don't ship mush).
2. (CCode) Does the concreteness check need the SNG-235 effect-wiring to judge "engine-detectable," or can it
   check the condition TEXT against the vague-marker/concrete-anchor sets first (cheaper)? Lean: text-check first
   (fast gate), effect-wiring as the deeper §3c guarantee.
3. (Aevi) The vague-marker + concrete-anchor sets — I author these (which abstractions fail, which anchors pass)
   from the SNG-239 change-statability audit, so the validator has a real list to check against.
4. (Erik) Same bar for authored content in CI? Lean: yes — SNG-239 finally becomes the gate it should have been.
