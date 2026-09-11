# REPLY — the foe is a person, the empowered band, the ground tag, and who breaks the rules

**From:** CCode · **2026-09-11** · **v1.9.449** · **To:** Erik, Aevi
**Answers:** Erik's five rulings of 2026-09-11 · *"i want to implement some empowerment"* · Aevi's `COPY_ground_tag_fight_menu`
**gates:** `§157` · `§158` · `§159` · **the page:** *The Fight Dials*, sections 06–07

---

## 1 · The rulings, built

| # | Erik | built |
|---|---|---|
| 1 | a decisive read earns the bonus action — *"Yes"* | `senseStep.decisiveReadEarnsBonus: true` |
| 2 | the break at a cap of 10, easing every 2 rounds | stays as set |
| 3 | *"foes would definitely gain a bonus from reading you successfully and they should and can use weapons and items. These things need to be on their npc sheets. Plus NPCs should have 3 domain access just like PCs"* | §2 |
| 4 | *"Authored NPCs can break the standard rules… We need to know who the worst offenders are"* | §4 |
| 5 | *"6 rounds is ok for now"* | — |

## 2 · The foe is a person too ✅ BUILT (`§157`)

| | what it does now |
|---|---|
| **the sense step** | `foeOwnMove`: the foe **reads you** — its sharpest read, else sizing you up on its best wit (the generic read a PC always has). Holding an OBSCURE craft, it **hides** from a player it has seen reading |
| **its read** | earns the **setup yours does, mirrored** — scale, cap and `passiveFailFloor` — and comes off yours (`foeSetup`). What resists it on your side is your sharpest attribute or a concealing craft you hold (`concealTier` on the seat) |
| **weapons** | `armFoe` → the same `wieldBonusFor` a PC gets: **+4 on a strike or break** |
| **items** | it **drinks** a restorative at ≤ 35% health or ≤ 25% energy; the wrapper applies it and the draught leaves its sheet |
| **the sheet** | `npcGear`: authored `inventory`; else `gear` prose resolved to the catalogue item it names (Pell's short sword, his hammer) or classified by `npcStanding.gearWords` (Cassa's *boarding cutlass* → a blade); else `npcStanding.defaultLoadout` — **a weapon of their trade + a healing draught**. Sesh's *"no weapon at all"* is honoured: no default |
| **the kit** | drawn from **all three domains**, balanced — a harm craft from each, a read, a guard, a hide, then round-robin — under the **PC's tier bands**. The old cap was `ceil(level / 5)`: T5 at level 21, where a PC reaches it at 48 |

⚠️ **NOT BUILT: the foe's BONUS ACTION.** Its read can earn one (`bonusEarned.opponent`) and nothing executes it. The player
takes one on **31%** of reads — the largest asymmetry left.

## 3 · Measured — fair peers, three-domain kits both sides, real places, levels 5–100

| | win | you down | break / wins | net read setup |
|---|---|---|---|---|
| peer, reading every turn | **87%** (was 90%) | **11%** (was 3%) | 19% — 4% in 1–3 rounds → **57%** past 12 | +3.7 · costs you 22% of the time |
| peer, never reading | 69% | 19% | 16% | — |
| +10 levels | 95% | 2% | 16% | +5.5 |
| −2 levels | 75% | 20% | 24% | +3.4 |
| the authored roster | 15% | 77% | 15% | −5.5 |

Both sides now pay the ground alike — your craft −3.5, the foe's −3.7.

## 4 · Who breaks the rules ⛔ and why it is not what beats you

**16 of 143 people** hold authored crafts above the tier band a PC of their level may reach. **None** is over the skill-point
budget or the rank ladder — it is tier, every time. **9 hold a T5 below level 48; 10 a T4 below level 35.**

| person | L | over the band | a PC of their level wins |
|---|---|---|---|
| Sesh of the Quiet Blow | 30 | convergent_strike T5 · unmoving_mind T4 · names_of_power T5 | 10% |
| The Keeper of Small Debts | 32 | borne_bargain T5 · hollow_that_holds T5 · lucky_fall T4 | 48% |
| Veth Ondra | 33 | given_errand T4 · the_cut_thread T5 · deathless T4 | 3% |
| Veyra of the Levelled Lance | 29 | who_falls_first T4 · break_the_line T4 | 10% |
| Orrun Shieldbreaker | 31 | break_the_line T4 · who_falls_first T4 | 3% |
| Lys of the Veiled Reach | 22 | told_of T4 | 68% |
| Calvar | 22 | proof_halls T5 | 40% |
| Bricke of the Making | 23 | keystone_blow T4 | 3% |
| Kestrin of the Riven Marches | 24 | break_the_line T4 | 15% |
| Sethran of the Reasoned Hold | 25 | proof_halls T5 | 13% |
| Cassa Redsail | 27 | lucky_fall T4 | 18% |
| Pell Ran Marsh | 27 | keystone_blow T4 | 0% |
| Marn of Two Forms | 28 | ki_wield T5 | 3% |
| The Bright Bargain | 44 | borne_bargain T5 | 3% |
| The Slow Green | 45 | the_kept_hour T5 | 3% |
| The Undecided | 46 | long_odds T5 | 0% |

Most repeated: `break_the_line` ×3, then `borne_bargain`, `lucky_fall`, `who_falls_first`, `proof_halls`, `keystone_blow` ×2.

⛔ **BUT THE OFFENDERS ARE NOT WHY THE ROSTER WINS.** A PC of their level beats the rule-breakers **15%**, the rule-followers with
authored crafts **7%**, and people whose kit is entirely drawn **18%**. **It is the body.** `sheetFor` gives a person
`round(level / 2) + 1` in **all four attributes** and soak `level / 3`:

| level | a person's sheet | the synthesized body |
|---|---|---|
| 10 | attributes 6 · soak 3 | 2 · 0 |
| 30 | **16** · soak 10 | 5 · 1 |
| 45 | **24** · soak 15 | 7 · 2 |

⚠️ **AND A CAVEAT ON MY SIDE:** the harness plays the PC on the synthesized body — not a real PC's growth
(`subPointPerLevel` 1). Every win rate here leans on that, and the roster gap may be partly my PC being weak rather than the
roster being strong. ⬜ **What does a level-30 PC actually carry?** — and is `round(level / 2) + 1` in every attribute the
person body you meant?

## 5 · The empowered core ✅ BUILT at Aevi's numbers (`§158`)

Inside a band the factor rises to **1.25** at the center, across a core of **center ± width × 0.3**: side `empowered`, a
**bonus** to the roll and a cheaper craft — the card, the free roll's note, the fight and its preview all say so.

| core | empowered pairs | a bonus of +10 or more |
|---|---|---|
| **0.3** (built) | **11.1%** | 4.7% |
| 0.2 | 6.5% | 3.0% |
| 0.15 | 5.1% | 2.3% |
| 0.1 | 3.3% | 1.3% |

The median bonus is **+7**, the peak **+16**; metaphysical crafts are empowered least (7.2%) — the meaning ceiling, which
now binds only below 1. A +0.08 conditioner lifts the share from 11.1% to 12.8%.

⛔ **THE WELLS CROWD.** Standing on one of the **29 pool anchors** makes the empowered core **less** likely — **7.2%**
against 12.4% elsewhere, with **38% crowded**. A pool pushes most crafts past the top of their band. If the wells are meant to
be the pilgrimage, their deltas or the band centers need a look.

## 6 · The ground tag ✅ BUILT from Aevi's copy (`§159`)

`thin ground −N` · `crowded −N` · `bare hands −N` · `rich ground +N`, and **silence** when the ground is full or the move has
no source — one vocabulary (`groundTag`), on every fight-menu row and the wheel, riding the price each row already computes.
Two additions for Aevi's eye: **`little meaning −N`** for a craft capped by meaning (not in the table), and a craft too starved
to answer shows **`thin ground −N`** rather than silence (her table put it with "no source").

## ⬜ OPEN

| # | for | question |
|---|---|---|
| 1 | Erik | should a foe take its **bonus action** when its read earns one? It is the largest asymmetry left |
| 2 | Erik | the empowered core — **0.3** (11.1% of pairs) or narrower for rare (0.15 → 5.1%)? |
| 3 | Erik · Aevi | the person body — `round(level / 2) + 1` in every attribute; and what a level-30 PC carries |
| 4 | Aevi | the default loadout is a placeholder for everyone; **7 of 90** records author `gear` |
| 5 | Aevi | the wells crowd — anchor deltas or band centers |
| 6 | Aevi | the tag wording for `little meaning` and for a craft that will not answer |
