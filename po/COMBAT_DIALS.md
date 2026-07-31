# Combat dials — everything you can turn for balance

**Auto-generated from `content/packs/core/rules/skill_battle_system.json` — values below are LIVE.**
Regenerate after changing content so this never drifts. Every dial here is CONTENT: change the number,
reload, play. No code change, no rebuild.

> Erik, 2026-07-31: *"Keep a running list of all the dials I could turn - we may need to for balance eventually."*

## The five that matter most

| dial | now | what it does |
|---|---|---|
| `momentum.marginScale` | `0.2` | How much a round's roll gap moves the meter. **THE big pacing dial. Higher = swingier, shorter fights.** |
| `momentum.pressure.breakAtPressure` | `2` | Pressure events before the opponent breaks. **THE fight-length dial. 2 -> 1 roughly halves peer fights.** |
| `momentum.pressure.playerHealthLoss` | `3` | Health you lose per pressure event. **THE danger dial for the player. Higher = fights hurt.** |
| `weave.energyMultiplier` | `1.8` | Energy cost multiplier for a woven round. **THE braid price dial. Too low and weaving is always correct.** |
| `opponentSheetSynthesis.threatToAttribute` | `0.08` | Threat -> foe attribute level. **THE foe-strength dial.** |

## Everything, by system

### Momentum & pressure — pacing, danger, how a fight ends

| dial | now | what it does | when you'd turn it |
|---|---|---|---|
| `momentum.meterMax` | `10` | How far the meter must fill before a PRESSURE event fires. | Lower = pressure (and its damage) comes sooner; fights get sharper. |
| `momentum.marginScale` | `0.2` | How much a round's roll gap moves the meter. | THE big pacing dial. Higher = swingier, shorter fights. |
| `momentum.surgeCrushEndsIt` | `20` | The swing size that counts as an overwhelming blow. | Lower = crushing blows happen more often. |
| `momentum.asModifier.perPoint` | `0.5` | Roll bonus per point of momentum you hold. | Higher = leads snowball. |
| `momentum.asModifier.max` | `8` | Cap on the momentum roll bonus. | Higher = a big lead is decisive. |
| `momentum.pressure.resetTo` | `0.35` | Fraction of the meter you keep after being driven back. | Higher = pressure events come in quicker succession. |
| `momentum.pressure.playerHealthLoss` | `3` | Health you lose per pressure event. | THE danger dial for the player. Higher = fights hurt. |
| `momentum.pressure.opponentEnergyLoss` | `22` | Energy/composure the foe loses per pressure event. | Higher = you wear foes down faster. |
| `momentum.pressure.breakAtPressure` | `2` | Pressure events before the opponent breaks. | THE fight-length dial. 2 -> 1 roughly halves peer fights. |

### The turn — sense / action / bonus

| dial | now | what it does | when you'd turn it |
|---|---|---|---|
| `turn.senseMovesMomentum` | `false` | Whether the SENSE step moves the meter. | true would make sensing cost you the exchange again. Leave false. |
| `turn.setupBonusScale` | `0.3` | How much a good read is worth on the action roll. | Higher = reading is stronger. |
| `turn.setupBonusMax` | `12` | Cap on the read bonus. | Higher = a great read can decide a turn. |
| `turn.bonusOnDegrees` | `["crit_success", "success"]` | Which read results earn the BONUS action. | MEASURED: crit-only left 20% of peer fights unresolved. Adding "partial" would make bonus actions near-constant. |

### Braiding two crafts in one step

| dial | now | what it does | when you'd turn it |
|---|---|---|---|
| `weave.bonusPerTier` | `2` | Roll bonus per tier of the woven (second) craft. | Higher = braiding is stronger. |
| `weave.maxBonus` | `8` | Cap on the weave bonus. | — |
| `weave.energyMultiplier` | `1.8` | Energy cost multiplier for a woven round. | THE braid price dial. Too low and weaving is always correct. |

### Standing effects (guard up, insight, bound…)

| dial | now | what it does | when you'd turn it |
|---|---|---|---|
| `persistentEffects.requiresDegree` | `["crit_success", "success", "partial"]` | Roll results that let an effect land. | Removing "partial" makes effects rarer. |
| `persistentEffects.partialValueMult` | `0.5` | Effect strength on a partial success. | — |
| `persistentEffects.critBonusRounds` | `1` | Extra rounds an effect lasts on a crit. | — |
| `persistentEffects.maxActivePerSide` | `3` | How many effects one side can hold at once. | Raise it if you want turtle/stacking builds to be viable. |

### What the player can SEE of the odds

| dial | now | what it does | when you'd turn it |
|---|---|---|---|
| `oddsPreview.counterCraftBonus` | `1` | Confidence gained from holding a counter-craft. | Higher = countering makes you a better judge of the odds. |
| `oddsPreview.confidenceByFogTier` | `[0, 1, 2, 3]` | Fog tier -> confidence in the shown odds. | Raise to show real numbers sooner. |

### Finishing potential

| dial | now | what it does | when you'd turn it |
|---|---|---|---|
| `finisher.finisherTierAt` | `3` | Tier at which an ordinary harm craft earns finishing potential. | Lower = more moves can end a fight. |
| `finisher.alwaysAtHarmRung` | `["lethal", "atrocity"]` | Harm rungs that carry finishing potential from the start. | — |

### How the opponent chooses its move

| dial | now | what it does | when you'd turn it |
|---|---|---|---|
| `opponentPolicy.behindSurgeAt` | `-3` | How far behind a foe must be before they Surge. | — |
| `opponentPolicy.aheadConserveAt` | `3` | How far ahead before a foe paces themselves. | — |

### How a foe is built from its threat rating

| dial | now | what it does | when you'd turn it |
|---|---|---|---|
| `opponentSheetSynthesis.threatToAttribute` | `0.08` | Threat -> foe attribute level. | THE foe-strength dial. |
| `opponentSheetSynthesis.threatToTier` | `0.06` | Threat -> foe craft tier. | — |
| `opponentSheetSynthesis.threatToEnergy` | `1.2` | Threat -> foe energy pool. | Higher = foes last longer. |

### The pre-fight read (stand and fight, or run)

| dial | now | what it does | when you'd turn it |
|---|---|---|---|
| `appraisal.relativeTolerance` | `1` | How different two stats must be to read as high/low in the pre-fight appraisal. | — |

## Measured, not guessed

Three of these were set by simulation rather than instinct — if you move them, it is worth re-running:

- **`momentum.marginScale` (CCODE-34)** — at 0.5, a *typical* round exceeded both the meter and the crush
  threshold: 47% of fights ended in ONE round and 90.6% by crush. 4000 fights/dial found 0.20.
- **`momentum.pressure.*` (CCODE-38)** — after momentum stopped being an exit, 1500 fights/dial on the real
  round path found 10 / 2 / 22: median ~15 rounds vs a peer with a genuine 32% player-loss rate.
- **`turn.bonusOnDegrees` (CCODE-45)** — crit-only left **20% of peer fights unresolved**; crit+success gives
  median 13 turns, 0% unresolved. The same sim showed sensing lifts the peer win-rate 53% -> 71%.

The harnesses live in the session scratchpad; say the word and I will make them a permanent `npm run dials`.

