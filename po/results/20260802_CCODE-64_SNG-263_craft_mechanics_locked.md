# CCODE-64 — SNG-263: the craft mechanical body, locked

The step Aevi sequenced first: **schema + the engine's reading of it + the CI check**, so the catalog is
authored once rather than twice. Full `npm test` green.

## The audit verified before a line was written

Every claim in the spec checks out exactly — a first this session, and worth saying:

| claim | verified |
|---|---|
| 285 crafts | **285** |
| no damage / healing / duration / range / area / targets / rank field on any craft | **zero, all seven** |
| 24 verbs, only `strike`+`break` mechanised | **24**; `harmFunctions` really is `["strike","break"]` |
| heal 31 · ward 23 · bind 55 · reveal 114 | **exact, all four** |
| effectTags: 158 crafts, 266 distinct tags | **exact** |
| `intensitySteps` reads back EMPTY | **confirmed — `sb.intensitySteps` is `undefined`** |
| braids/discoveries/minted crafts born with `effectTags: []` | **confirmed, all three sites** |

**Where intensity steps actually live** (Aevi asked me to confirm): `intensity_scaling.json`, as
`conserve/standard/surge` with `energyMult` + a flat `effectMod` on the ROLL (−8/0/+10). So it is exactly the
"another silent generic" she suspected — intensity changes your chance to succeed, and nothing about what the
craft does.

## What I built

**`rules/craft_mechanics.json`** — the shape, as content. All 24 verbs map onto the 8 function families that
already exist (I reused `function_vocabulary`'s families rather than inventing a parallel taxonomy), each
family declaring an effect-**shape** and its **operative dimension**:

`HARM→damage · RESTORE→healing · PROTECT→guard · INFLUENCE→hobble · KNOW→setup · SHAPE→construct · MOVE→reposition · SUSTAIN→bolster`

Two verbs get explicit overrides because vocabulary and behaviour disagree: **`hinder`** is in HARM but
impedes rather than wounds (honest to `harmFunctions` being strike+break only), and **`empower`** is in
RESTORE but grants a standing bonus rather than restoring health.

**`engine/craftmechanics.js`** — resolves a verb to real numbers. The resolution order is the whole design:

```
craft.mechanic.<field>  →  familyDefaults[shape].<field>  →  the verb does not use that dimension
```

So an **unauthored craft still works** and an **authored one is genuinely its own** — which is what lets the
catalog fill in tradition by tradition instead of in one pass. A shape reports no key at all for a dimension
it doesn't use: *"this verb has no range"* and *"this verb's range is 0"* must not look alike.

**`battleRound` now reads it.** The old damage line was `base + tier×0.5 + marginGap×0.06` keyed off the
family — every strike-craft in the game hit for the same number. It now rolls the craft's band and falls back
to the old formula when none resolves, so nothing breaks while the catalog fills. Threaded via `rules` rather
than a new `battleRound` option deliberately: `seam_battle_round_options` records four separate times an
option was silently dropped in `skillBattleRound`'s hand-built call.

## Erik's rulers, implemented and measured

**§8 the tier ladder** — T-II ×2, T-III ×3.5 (better than linear, as specified), T-IV/V flagged `special`
because at the capstone rung a craft should buy a *kind* of ability, not a bigger number. `capstoneTier` is
already 4, so the engine's existing rung agrees with your instinct. Scaling applies to the **operative
dimension only** — a craft doubles on its own axis, or a tier-V ward would somehow also reach further.

**§7 damage is rolled**, calibrated against your anchor through the *real* `battleRound` on a peer matchup:

| bend | mean | hits to kill a 5-health beast | max one-shots? |
|---|---|---|---|
| uniform | 3.0 | 1.5 | yes |
| weight 2 | 2.72 | 1.84 | yes |
| **weight 3 (shipped)** | **2.43** | **2.06** | **yes** |

Inside your 2–3 band with the max still lethal. `marginGap` raises the **floor** rather than adding a bonus,
so a decisive blow can't land feeble but can never exceed what the craft says it can do — preserving the
existing "a turned-aside blow does nothing" intent.

**§3 ranks** — the default deepens and **compounds**, because my first cut had rank 2 and rank 3 resolving
identically, which is your original complaint ("I can't tell how ranks differ") reappearing inside the fix
for it. All three of your kinds are legal: add / deepen / extend.

**§6 intensity** — conserve ×0.5, surge ×2 as the baseline, but a craft may state its own in its own terms,
and the authored text is what the player is shown. Your constraint was the important half.

## The §5 harness — two gates, deliberately different

- **Shape coverage is ABSOLUTE.** Every verb the catalog uses must resolve to an implemented shape. A verb
  with no shape is a craft describing what the engine cannot do, which is the whole bug. **Proven to bite**:
  planting a fake verb fails the build and names it.
- **Authored magnitudes is a RATCHET**, baselined at **285**, because "all of them inherit defaults" is the
  designed starting state. It may only go DOWN, so the catalog fills in and can never drift back.

Plus: every shape must have defaults (no hole in the fallback chain), and the tier ladder must reach T-V and
never step down.

## Not done — deliberately, and worth naming

**§9: braids, discoveries and generated crafts are still born mechanically empty.** All three minting sites
are confirmed (`braids.js:132`, `braids.js:186`, `progression.js:577`). They now inherit family defaults like
any unauthored craft, so nothing is *broken* — but a braid should DERIVE from its parents rather than fall
back to a generic, and the CI ratchet doesn't yet cover minted crafts. That's the next engine piece and it
should land before the catalog authoring gets far, or braids become the one second-class citizen of the
system built to make crafts real.

**Also open, and yours:** the T-I damage band in absolute numbers, and what "special" means at T-IV/V — the
biggest authoring unknown, and the one place Aevi asked for examples before authoring 54 of them.

The pilot (blazeborn) is unblocked: the shape is locked, the defaults are real, and the CI will tell Aevi
exactly what a craft still owes.
