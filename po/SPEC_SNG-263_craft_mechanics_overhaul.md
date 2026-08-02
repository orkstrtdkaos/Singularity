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


---

# SNG-263 round 2 — Erik's magnitude ruler (the authoring spec)

Erik gave the ruler the authoring pass needed. Captured as goals + the calibration data I verified against.

## §6 — INTENSITY: conserve halves, surge doubles — but PER CRAFT, verified
GOAL: **conserve ≈ HALF the range/damage/push-strength; surge ≈ DOUBLE them.** That's the baseline rule.
**But Erik's constraint is the important half:** *"each skill has its own descriptions, so you would need to
audit each to verify they get applied logically."* A blanket ×0.5/×2 on every number is wrong for many crafts —
what does "double" mean for a concealment, a ward, a read, a bargain? So:
- the ×0.5 / ×2 baseline applies to the craft's **magnitude fields that make sense for it** (damage, range,
  area, push/force, duration where duration is the operative dimension);
- **every craft is audited individually** so the intensity effect is stated in that craft's own terms and reads
  logically against its description — a surged reveal widens what you see or how deep, not "double damage";
- and the stated per-craft effect is what the player SEES before committing (SNG-258 §4 popup).
This is the audit half Erik asked for: not just "apply a multiplier," but "verify each craft's conserve/surge
means something true about THAT craft."

## §7 — DAMAGE IS ROLLED (Erik: "damage should be rolled btw")
GOAL: damage is a **roll, not a fixed number** — a distribution with a max, so outcomes vary. Calibrated by
Erik's own benchmark:
- **"A T-I strike at max damage should be able to KILL a T-I beast — but likely take 2-3 hits due to random
  distribution."**
- VERIFIED ANCHOR: the engine's default opponent health is **5** (`encounters.js:108`), and today's generic
  formula gives a T-I strike ≈2 — i.e. ~3 hits. **So today's average is already near Erik's target; what's
  missing is the ROLL (variance) and the MAX reaching lethal.** A T-I strike wants a spread whose top end can
  take a 5-health beast in one blow and whose average lands the kill in 2-3.
- CCode owns the distribution shape (die-like? margin-weighted?); the GOAL is: **max can one-shot a peer T-I
  beast, average kills in 2-3, and the variance is real enough to feel.**

## §8 — TIER SCALING: doubling, then non-linear, then SPECIAL (Erik)
GOAL, in Erik's own terms:
- **T-II ≈ double a T-I** on the craft's operative dimension — twice the damage, OR twice the area, OR twice the
  range (a craft doubles on ITS axis, not all axes).
- **T-III is NOT linear** — it should exceed a straight doubling-again; a real step up, not 3×.
- **T-IV and T-V have SPECIAL ABILITIES** — they stop being "more of the same" and gain a distinct capability.
  This is where the capstone threshold already lives (`capstoneStanding.capstoneTier: 4` — the engine ALREADY
  treats T-IV as the capstone rung, so Erik's instinct matches the existing structure).
So the ladder is: **T-I baseline → T-II ×2 → T-III more-than-linear → T-IV/V qualitative (a special ability,
not a bigger number).** That also settles SNG-258 §3 ("tier must buy more than flat points") at the content
layer: the top tiers buy KIND, not just quantity.
NOTE this pairs with §3 (rank deltas): TIER is the craft's level-band; RANK is depth within an owned craft.
Both must be legible; they're different axes and should not be conflated in authoring.

## §9 — BRAIDS, DISCOVERIES, and GENERATED skills need the same body (Erik: "don't forget")
**VERIFIED GAP:** every dynamically-minted craft is born mechanically empty —
- `braids.js:132` and `:186` hard-code **`effectTags: []`** and carry no magnitude fields;
- `progression.js:577` (minted/new abilities) does the same;
- generated abilities via the gen path likewise carry no magnitudes.
So the moment the overhaul lands, **every braid, discovery, and generated craft would be born WITHOUT damage,
duration, range, rank-deltas, or intensity effects** — a second-class citizen of the very system meant to make
crafts real. GOAL: **the minting paths must produce a complete mechanical body**, either authored (for
GM/generated crafts, the generator states the magnitudes within clamps) or DERIVED (a braid inherits/combines
its parents' magnitudes; a discovery derives from its source craft) — and the §5 CI completeness check must
cover minted crafts too, not just the authored catalog. A braid that deals no damage because nobody filled a
field is exactly the PromisedButUnread bug reappearing through the back door.

## Authoring ruler (what I'll use, once CCode locks the schema)
1. every craft declares its OPERATIVE dimension(s) — what it actually does (damage / heal / duration / range /
   area / targets / push);
2. magnitudes at T-I baseline, doubling at T-II, better-than-linear at T-III, special at T-IV/V;
3. damage as a rolled range (max can one-shot a peer beast; average 2-3 hits);
4. rank deltas per craft (add a function / deepen it / extend a dimension);
5. conserve ≈ half, surge ≈ double **on that craft's operative dimension**, stated in the craft's own language
   and audited for logic;
6. the same body for braids/discoveries/generated crafts, derived where authoring isn't possible.

## Still Erik's to settle
- The T-I damage BAND in numbers (what's the roll's min/max?) — the anchor is "max kills a 5-health T-I beast."
- What "special" means at T-IV/V — a per-craft qualitative ability is the biggest authoring unknown, and it's
  the one place I'd want examples from Erik before authoring 54 of them (28 at levelReq 4, 26 at levelReq 5).
