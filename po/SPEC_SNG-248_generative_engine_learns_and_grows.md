# SPEC — SNG-248: The generative engine learns from authored content as it grows
## Aevi (PO) · 2026-07-27 · Erik-directed ("a completely capable generative engine that learns and grows as we add content")

> **Erik:** "I want to make sure the seed/exemplar encounters are actually used as a REFERENCE when the engine
> creates a NEW encounter — a huge point of this game is generative ability. Spec something so we have a
> completely capable generative engine that learns and grows as we add content, and that can generate new content
> (with all the right style and context) as the story calls for it."

## §1 — Diagnosis (verified at origin): the capability is REAL but partial, and encounters are OUTSIDE it
Three hard facts from the code:
1. **The generator DOES few-shot learn.** `buildGeneratePrompt` (generate.js:576) takes `examples`, includes up
   to 3 as "EXAMPLE 1/2/3", and instructs: "Match the shape + voice of the examples exactly." The learning
   mechanism EXISTS and works. This is the good bones.
2. **But `pickExamples` (app.js:2199) only handles THREE types** — npc, location, arc. Every other type returns
   `[]` — **generates COLD, no examples, no style reference.** And even those three select COARSELY (npc by
   homeLocation, location by adjacency, first-3) — not by the finer context (tier, flavor, the situation).
3. **Encounters have NO generative path at all.** `generateRequest` accepts only `["npc","location","arc"]`
   (app.js:~2230). Encounters are built by `synthesize*Def` from TEMPLATES — which never call `generate()` and
   never see the exemplars. **The seed encounters are a PICK-FROM pool, not a TEACH-FROM corpus.** Exactly the
   gap Erik named: reference content that isn't wired to teach generation.
So today's generator is a partial engine (3 types, coarse selection) beside a growing pile of authored content
that mostly can't teach it. The fix is to make ALL authored content a live style-corpus the generator draws the
RIGHT examples from — and to bring encounters (and every future type) INTO the generative path.

## §2 — The fix: a content-corpus the generator learns from, keyed by relevance, growing automatically
### §2a — generalize pickExamples into a relevance-ranked corpus selector (the core)
Replace the 3-type hardcoded `pickExamples` with a general `selectExamples(type, context)` that:
- **Works for EVERY generatable type** (npc, location, arc, encounter, and whatever we add) — no type returns
  empty; every generation is taught by real authored precedent.
- **Selects by RELEVANCE, not first-N.** Rank the authored+generated pool of that type by fit to the CURRENT
  context: same kind/tier/flavor/pole/region/disposition as what's being generated, nearest in the world, most
  thematically apt. The generator should see the 3 examples that best TEACH the thing being made — a dangerous
  precursor puzzle learns from the authored dangerous precursor puzzles, not a random benign one.
- **Draws from the WHOLE authored corpus** — authored content, promoted staged content, AND high-quality
  generated content (the engine's own good outputs become future examples — it LEARNS from what it made well).
- **Grows automatically.** New authored content (a new exemplar, a new NPC, a new location) enters the corpus the
  moment it's loaded — no per-type code change. Add content → the generator immediately can learn from it. THIS
  is "learns and grows as we add content."

### §2b — bring encounters into the generative path
Encounters currently synthesize from templates. Add an encounter generation path so the engine can mint a NOVEL
encounter the story calls for, in-style:
- `generateRequest` accepts `type: "encounter"` (with a kind/flavor/context hint). The generator authors a new
  encounter def — with all the right fields the render path needs (name, opponent, kind, tier, flavor, premise,
  seed, stages, failStakes — the SNG-247 shape) — few-shot-taught by the best-matching EXEMPLAR encounters.
- **The exemplars become the teaching corpus.** The grieving-warden/stopped-mechanism/etc. aren't just a
  pick-pool — they teach the generator what a good standoff/puzzle LOOKS like, so a generated one carries the
  same shape and voice. A generated "sealed thing" reads like an authored one because it learned from them.
- **A generated encounter is born COMPLETE** (SNG-234 born-whole discipline) — it must carry every consumer-read
  field (the SNG-238 consumer map + the SNG-247 name/opponent gap we just fixed), or it's rejected/repaired. A
  generated encounter that renders as "Hard Ground" is the failure we just eliminated for authored ones — don't
  let generation reintroduce it.

### §2c — the corpus is context-aware (the "right style AND context" Erik named)
The examples selected must match not just TYPE but SITUATION: the region's pole, the local traditions, the
active arcs, the danger band, the current tone. A generated encounter in the Pale March near a precursor site
should learn from precursor-flavored exemplars and carry the region's grain — not a generic template. Feed the
selector the scene context (location, arcs-in-play, danger, tone) so the examples it picks TEACH the right style
for HERE, not just the right shape for the type.

## §3 — Why this is the leverage Erik's after
The generative engine is "a huge point of the game." Today it's half-built: it learns for 3 types and generates
cold for the rest, and encounters — the thing that most needs to be minted on demand as the story turns — are
entirely outside it. This spec makes generation UNIVERSAL (every type learns), RELEVANCE-RANKED (the right
examples, not the first ones), CONTEXT-AWARE (the right style for here), and SELF-GROWING (new content teaches
immediately, and the engine's own good outputs become future teachers). That's the difference between "a game
with some generated NPCs" and "a world that generates itself in-style as it grows."

## OWNERSHIP
- CCode: §2a the general relevance-ranked `selectExamples` (replacing the 3-type pickExamples); §2b the encounter
  generation path (generateRequest type "encounter" → generate() → born-complete encounter def, few-shot from the
  exemplars); §2c feed scene context into the selector so examples match situation. Plus: extend the born-complete
  gate (SNG-234) + the consumer-map check (SNG-238) to generated encounters so they can't render broken.
- Aevi: the generation PROMPT guidance per type — what makes a good encounter/npc/etc. (the "match voice" bar),
  and enough authored EXEMPLARS per kind/flavor that the corpus can teach every combination (I'll audit coverage:
  does every kind×flavor the engine can request have at least a couple of exemplars to learn from?). Content, my
  lane.
- Erik: how AGGRESSIVE generation is (does the engine mint a novel encounter freely when the story calls, or only
  when the authored pool has no fit?); and whether generated content that plays well should be PROMOTED to
  authored (the engine's outputs becoming canon).

## GUARDS
- **Born complete or rejected** (SNG-234) — a generated encounter must carry every consumer-read field (SNG-238
  map + the name/opponent fields) or be repaired/rejected. Generation must not reintroduce the "renders as Hard
  Ground" class we just killed. The generative path is gated by the SAME completeness checks as authored content.
- **Learn from the RIGHT examples** — relevance-ranked, context-aware selection. Teaching the generator with
  mismatched examples (a benign example for a dangerous request) produces off-style content. The selector's job
  is FIT, not just fill.
- **The corpus grows safely** — generated content entering the example pool must be QUALITY-GATED (only good
  outputs teach, or the engine learns its own mistakes — a feedback loop that degrades). Gate what re-enters the
  corpus (Erik's promote-to-authored call, or a quality threshold).
- **Authored always outranks generated as a teacher** — when both exist, the hand-authored exemplars are the
  primary style reference; generated examples supplement, never replace. The human-set voice stays the anchor.
- **Never break a turn** (existing rule) — generation failures degrade gracefully (fall back to the template/
  pool), never halt play. The generative path is additive to the synthesize path, not a fragile replacement.

## OPEN QUESTIONS
1. (Erik) Generation aggression: mint a novel encounter whenever the story calls, or only when the authored pool
   has no good fit? Lean: prefer the authored pool (curated quality), generate when it genuinely lacks a fit —
   so the world grows where it's thin, not everywhere.
2. (CCode) Does `selectExamples` need an embedding/similarity pass for relevance, or do structured tags
   (kind/tier/flavor/pole/region) rank well enough? Lean: structured tags first (cheap, legible), similarity
   later if tags underfit.
3. (Erik/Aevi) Promote-to-authored: should a generated encounter that plays well become a permanent authored
   exemplar (the world's content library growing itself)? Lean: yes, gated — the best generated content, reviewed,
   joins the corpus. That's the engine truly LEARNING.
4. (Aevi) Exemplar coverage audit: does every kind×flavor the engine can request have exemplars to learn from? I
   author to fill gaps so no request generates cold.
