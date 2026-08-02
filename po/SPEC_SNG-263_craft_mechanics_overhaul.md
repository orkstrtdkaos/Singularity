# SPEC — SNG-263: the craft mechanics overhaul (every described function must DO something)
## Aevi (PO) · 2026-08-02 · Erik: "every function described needs a matching game mechanic that can be verified"

## The audit that frames it (measured, not asserted)
**The craft schema has no mechanical body.** All 285 crafts carry `functions` (the DESCRIBED verbs), `levelReq`,
`energyCost`, `attribute`, `axes`, `harmRung`, `effectTags` (55%, and they are free-text — **266 distinct tags**,
i.e. a vocabulary nobody can consume). **There is no field for damage, duration, range, area, target count, or
rank differentiation anywhere on any craft.**

**Of 24 function verbs across 285 crafts, only TWO have a mechanic:**
| verb | crafts | damage? | standing-effect? | matchup? |
|---|---|---|---|---|
| reveal | 114 | no | no | yes |
| bind | 55 | no | no | yes |
| sustain | 46 | no | no | yes |
| make | 37 | no | no | yes |
| **break** | 36 | **YES** | no | yes |
| heal | 31 | no | no | yes |
| **strike** | 30 | **YES** | no | yes |
| ward | 23 | no | no | yes |
| … (16 more) | | no | no | yes |
`heal` appears on 31 crafts and **heals nothing mechanically**. `ward` on 23 wards nothing. `bind` on 55 binds
nothing. The matchup layer (SNG-254/256) is the only near-universal mechanic (23/24) — everything else is prose.

**And damage itself is GENERIC**, not per-craft: `base + tier×0.5 + marginGap×0.06`, keyed off the FUNCTION
FAMILY. So every strike-craft in the game deals identical damage; a Tier-V capstone and a Tier-I basic differ
only by a flat per-tier term. **Nothing on the craft record says what THIS craft does.**

This is the PromisedButUnread bug class at catalog scale: the content describes capability, the engine delivers
a generic default.

## THE GOALS (Erik; CCode owns the how)
### §1 — every described function has a VERIFIABLE mechanic
GOAL: **if a craft's `functions` says it heals/wards/binds/reveals, something mechanical happens that can be
tested.** Each of the 24 verbs needs a defined effect-shape the engine applies and a test can assert. Not
necessarily damage — the right mechanic per verb-family (heal restores health; ward/shield creates a standing
defensive effect; bind/hinder applies a named penalty; reveal/foresee grants information or a setup bonus;
sustain extends duration/resists depletion; make/transform creates or alters a thing; travel/move changes
position). **The test of done: no verb in the catalog resolves to "narration only."**

### §2 — per-craft MAGNITUDE, not just per-family
GOAL: a craft carries its OWN numbers — **damage / healing amount, effect duration, range, area/targets** —
so `the_last_light` (a capstone that spends your whole inner fire) is mechanically different from a Tier-I
kindle, beyond a flat tier step. Erik: "we've since added damage amounts, effect durations, etc." — those exist
in the ENGINE but not on the CRAFT. Give crafts the fields; let the engine read them; keep the family default as
the fallback so nothing breaks while the catalog is filled in.

### §3 — RANKS must be mechanically distinguishable (Erik: "I can't tell how ranks differ")
GOAL: **rank 1 → 2 → 3 changes something you can name and verify.** Erik's own framing is the design: a rank
**adds a function, OR deepens the existing function, OR extends area/range/duration/damage**. Every craft should
declare what its ranks DO — no craft where ranking up is invisible. This is also the fix for the §3 roll-math
thread (tier should buy a wider band, not flat points): rank differentiation lives HERE, on the craft, not only
in the roll.

### §4 — CONSERVE / STANDARD / SURGE must be mechanically known PER CRAFT
GOAL: intensity is currently a generic `effectMod` on the roll. Erik wants **each craft to have known, stated
effects at each intensity** — what conserving this craft costs you and buys you, what surging it does (more
damage? wider area? longer duration? higher energy + higher peril?). The player should be able to SEE, before
committing, what surge means for THIS craft. (Feeds directly into the SNG-258 §4 roll popup and the suggestion
engine.) NOTE: `intensitySteps` config read back EMPTY in skill_battle_system.json — CCode should confirm where
steps actually live; if it's a fallback default, that's another silent generic.

### §5 — the verification harness (the reason this is doable)
GOAL: **a content-CI check that every craft's declared functions map to an implemented mechanic**, and every
craft has magnitudes, rank deltas, and intensity effects — failing the build when a craft describes something
the engine can't do. Same shape as the reachability guard from the PromisedButUnread audit. This is what makes
"verifiable" real rather than aspirational, and it's what stops the catalog from drifting back.

## Scope reality — this is the biggest content pass in the project
285 crafts × (magnitudes + 3 rank deltas + 3 intensity effects) is a very large authoring job. Recommended
sequencing so it lands rather than stalls:
1. **CCode first: the SCHEMA + the engine's reading of it + the CI check** (§1 effect-shapes per verb-family,
   §5 harness), with family defaults so an unfilled craft still works. Nothing is authored until the shape is
   known and testable — otherwise 285 crafts get authored twice.
2. **Then a PILOT: one tradition, fully authored** (proposal: `blazeborn` — 12 crafts, mental, a clean spread of
   verbs incl. heal/ward/strike/reveal). Prove the shape carries real content before scaling.
3. **Then the catalog**, tradition by tradition, CI enforcing completeness as it fills.
4. **Erik's dials:** the magnitude BANDS per tier (what a T-I strike vs a T-V strike should hit for), and what
   surge/conserve should cost and buy in general — so authoring has a ruler.

## What's whose
- **Erik:** the magnitude bands per tier + the intensity philosophy (what surge costs/buys); which verbs deserve
  which effect-shape if any are ambiguous.
- **CCode:** the schema, the per-verb effect implementations, reading per-craft magnitudes with family
  fallbacks, rank-delta application, per-craft intensity, and the CI completeness check.
- **Aevi:** the pilot tradition, then the catalog authoring (magnitudes, rank deltas, intensity effects per
  craft) — the largest content job I've taken; it wants the schema locked first.

## Note on `effectTags`
266 distinct free-text tags across 158 crafts, consumed only by `practice.js` for a loose tag-match. That is a
vocabulary nobody can act on. This overhaul should either give effectTags a CLOSED vocabulary tied to real
mechanics, or retire it in favour of the structured fields above. Recommend: retire/absorb — a closed
effect-shape per verb is what §1 needs, and a 266-word open tag set is the opposite of verifiable.
