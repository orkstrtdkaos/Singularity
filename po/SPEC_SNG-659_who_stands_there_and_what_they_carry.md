<!-- status: SNG-659 — Aevi (PO); two rulings from Erik 2026-09-25; ⬜ CCode builds, measuring against the targets in §1d and §2d -->
# SPEC SNG-659: who stands there, and what they carry

**Aevi (PO) · 2026-09-25**

Erik, on the two open questions from SNG-657:

> *"item power can mostly rely on artifacts being crafted at higher levels... however, I don't see why we can't also
> have some higher power items."*
>
> *"on raids with 13 people against a few... if those few have good skills that hit multiple people, we need to
> account for that. there are lots of skills that can hit multiple targets or zones... so it SHOULD matter who the
> defenders are."*

---

## §1 — A MASS FIGHT COUNTS WHAT EACH FIGURE CAN DO, NOT ONLY HOW MANY THERE ARE

### §1a — Today, measured (origin 36cd55b64)

`legionClash` (melee.js:322) totals each side as:

**strength = Σ (head count × quality)**

- **Quality runs 1–7** (the rung, from CCODE-512).
- So a legend on the epic rung counts as **5 raiders**. Thirteen riffraff out-count them.
- **Nothing reads a craft.** A defender whose `burning_ones` hits 6 is the same figure as one who throws a single
  punch.

CCODE-512's own measurement: four quality-3 defenders instead of quality 1 move a small hold from 40% to 42% held,
and **nothing at all** against 13+. The mechanism is right, but the arithmetic has no room for a figure to count as
more than a few people.

The same function runs caravan escorts (caravan.js:269), so this fixes both.

### §1b — The data already exists

**46 crafts** reach more than one figure through `mechanic.targets`, `mechanic.area`, or `tree[n].imposes.targets`.
They come in three kinds, and each moves a clash differently:

| kind | crafts (examples) | what it does to a clash |
|---|---|---|
| **Harm, many** (`harmRung` damaging, lethal or incapacitating; shape damage, strike or hobble) | burning_ones 6, break_the_line 8, majesty 8, keening 6, last_light area 5, grey_ground area 3, edge 4 | **takes enemy figures out of the fight**: each use removes or disables up to N |
| **Guard, many** (shape guard) | held_breath 6, kept_dark 6, known_in_the_dark 6, unfaltering_light 4 | **our figures don't fall**: absorbs losses for N allies |
| **Bolster, many** (shape bolster, setup) | harmonic_voice 6, hearthbinding 6, safe_ground 6, small_company 5 | **our figures fight better**: raises N allies' quality |

### §1c — The rule (Erik's intent; CCode picks the arithmetic)

**A named figure's weight in a clash = their quality × their reach**, where reach comes from their best
many-target craft of each kind:

1. **Harm reach.** A defender with a harm craft reaching N counts as **up to N figures' worth** of harm, capped by
   how many enemies are actually there. Thirteen raiders against a figure with a 6-target harm craft: that figure
   engages six of them each exchange, not one.
2. **Guard reach.** Up to N allies take the guarding figure's quality as a **floor on their losses**: the first
   losses on the guarded side are absorbed.
3. **Bolster reach.** Up to N allies fight at **+1 quality** (or the craft's own magnitude, if it authors one).
4. **Sustain.** A many-target craft costs energy. A figure gets as many many-target uses as their energy pays for
   (`energyCost`, at their intensity). After that they fight at single reach. **A clash lasts exchanges, not one
   swing,** so a caster who empties early fades. That's the limit that stops this becoming "one wizard beats an
   army every time".
5. **Area means a zone, not a count.** `area` values run 1–8, and some are prose ("everyone within sight of the
   vessels"). ⬜ **CCode:** the engine has no reader of `area` today (craftmechanics.js lists it as EXTENDABLE
   only). Propose the conversion: area N ≈ 2N figures in a massed fight, or a better number from how the skirmish
   engine already packs a zone. Prose areas count as the largest numeric area on their own craft's ladder.
6. **Quality itself uses the capability ladder.** `resolution.capabilityByTier` (riffraff 0.25 · notable 0.4 ·
   leader 0.6 · heroic 0.8 · epic 1 · legendary 2 · mythic 3) is **Erik's ruled ladder** for how much a rung can
   *do*, and `heroSwing` already reads it. The flat 1–7 rung scale undercounts the top: a mythic is **12×** a
   riffraff on the capability ladder, and only 7× on rungs. ⬜ **CCode:** measure both. I lean to capability,
   normalised so riffraff = 1.
7. **Only named figures get this.** Rank and file keep their authored `{n, quality}`, per SNG-657 §2. The fiction
   can't read forty unnamed spearmen's crafts, and the save doesn't hold them.
8. **Both sides.** Raiders with a named leader (SNG-657 §3) get the same treatment. A raid led by someone with
   `majesty` is a different raid.

### §1d — ⬜ Targets (Erik adjusts; CCode measures against them)

Thirteen riffraff raiders against a hold:

| defenders | today (est.) | target |
|---|---|---|
| 3 notables, single-target crafts only | raiders win | **raiders usually win** (unchanged: numbers still count) |
| 3 heroics, one with a 6-target harm craft | raiders win | **defenders hold, most times** |
| 1 epic, one 6-target harm craft, energy for 3 uses | raiders win | **defenders hold, about 2 in 3**; the epic tires and can be worn down |
| 1 mythic (level 85+), any many-target harm | raiders win | **defenders hold almost always.** A mythic is the reason you don't raid that hold. |
| 1 heroic guarding 6 + 5 riffraff | raiders win | **the line holds noticeably longer than 6 riffraff alone** |

**The receipt names who made the difference:** *"The warden's burning_ones broke the first rush; the second came when
she had nothing left."* This is the "it should matter who the defenders are" Erik asked for, and it only matters if
the player can see it.

---

## §2 — HIGHER-POWER ITEMS: MOSTLY MADE AT HIGHER LEVELS, SOME FOUND

### §2a — Today, measured

`grantCeiling` (earnedpower.js:51) reads the **bearer's** level and craft rank:
- `maxGrants = min(6, 1 + ⌊level/10⌋ + max(0, rank−1))`
- `effectCap = clamp(round(level/3) + rank×2, 2..15)`
- `rank` is clamped to 0..3.

At craft rank 3 both numbers hit their cap by about level 40 and stay there to 100. **The item has no level of its
own**, so an artifact a level-80 maker forged reads the same as a level-40 one.

### §2b — The rule

1. **An item carries the level it was made at.** Add `madeAtLevel` to an item, written when it's crafted (the
   maker's level) or authored (a relic's, or a legend's gear). An item with none reads the bearer's level, which
   is today's behaviour.
2. **The ceiling reads the item's level, not the bearer's:** `max(madeAtLevel, bearer level)`. A master's artifact
   is strong in an apprentice's hand. What the apprentice *can do* with it is the fight engine's business (their
   own rolls and energy), not the item's.
3. **The caps lift past 40 for items made past 40.** Erik: *"mostly rely on artifacts being crafted at higher
   levels."*
   - `effectCap` continues its own formula to 100: `round(L/3) + rank×2`, so level 100 at rank 3 is **39**. The
     `min(15)` stays for items made below level 40, so everyday gear is untouched.
   - `maxGrants` cap rises from **6 to 8**. The 7th grant opens at `madeAtLevel` 60, the 8th at 85 (the mythic
     rungs).
4. **Some higher-power items are found, not made.** Erik: *"I don't see why we can't also have some higher power
   items."* A relic or legend-gear item is **authored** with its `madeAtLevel` (for example, a Precursor keystone at 90, or
   a legend's named weapon at 95). The world holds a small number of them, and they are what the high rungs quest for.
   ⬜ I'll author `madeAtLevel` on the existing relics and legend gear once the field exists.
5. **Every grant still states its clamp.** This lifts the ceiling, and it doesn't remove the rule that each grant
   says what it cannot do.

### §2c — What changes on screen

The item card shows its made-at level beside the bearer's: *"forged at level 72 · you are level 31"*. The grant band
reads the item's: *"reasonable @ L72 / craft rank 3"*.

### §2d — ⬜ Targets

| item | today | after |
|---|---|---|
| a level-20 journeyman's own work, rank 2 | 4 grants · effect 11 | **unchanged** |
| a level-39 master's work, rank 3 | 6 · 15 | **unchanged** |
| a level-45 master's work, rank 3 | 6 · 15 | **6 · 21** |
| a level-72 artifact, rank 3, in a level-31 hand | 6 · 15 (the bearer's cap) | **7 · 30** (the item's) |
| a mythic relic, authored at 95, rank 3 | 6 · 15 | **8 · 38** |

(Checked by running the formula, not by hand.) ⚠️ **There's a step at 40:** effect goes from 15 at level 39 to 19 at
level 40, because the cap comes off at once. It is monotonic, so the gate passes, but a level-40 artifact shouldn't
read as a sudden leap. ⬜ **CCode:** consider letting the cap rise linearly from 35 to 45 instead. Your call, and
report which.

### §2e — Guidance follows (mine)

`earned_power_guidance` bands 40–59, 60–84 and 85–100 currently say *"the numbers stop rising."* That was true when
I wrote it and stops being true when this lands. **I rewrite those three bands in the push right after CCode ships the
ceiling**, and not before, so the words never describe an engine that doesn't exist.

---

## §3 — Build order and gates

1. **§2 first.** It's small, pure (`grantCeiling`), and fully gated by §L100's monotonic check. Add `grantCeiling`
   to the §L100 reader list.
2. **§1 second.** Measure first. Run the five rows of §1d on today's engine, then on each candidate arithmetic
   (area conversion, capability vs rung), and report the table before choosing.
3. **Gate §1:** a named figure with a many-target harm craft always outweighs the same figure without it, never
   less. Emptied energy returns them to single reach. Rank and file are unchanged.
4. **Gate §2:** an item without `madeAtLevel` reads exactly what it reads today. Items made below 40 are unchanged.
   Both ceilings are monotonic in `madeAtLevel` to 100.

— Aevi, PO