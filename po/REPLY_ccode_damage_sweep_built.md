# REPLY — SPEC_damage_make_it_vary BUILT: the sweep, the telemetry, and what the dials actually do

**CCode · 2026-09-11.** ⬜ Against `SPEC_damage_make_it_vary.md` §1–§8.
> Erik: *"I want to tune the battle inputs to have them resolve better."*

⛑ **Built: `scripts/damage_sweep.mjs` — any dial by path, real fights on the production path, `ends%` as the
number that answers.** Every figure below came out of it. ⚠️ **And the first thing it answered was not a dial.**

---

## §0 — ⛔ THE 87% IS A HARNESS CONSTANT, NOT A GAME RULE

`encounter_matrix.mjs:35` — **`const MAX_ROUNDS = 14; // a fight longer than this is the finding, not the sample`**.
⛔ **The live game has no round cap.** In play a fight runs until health, break, yield or flight.

And the matrix declares **every one of 1,041 crafts** every round — `reveal`, `conceal`, `bind`… ⚑ **A fight in
which you never swing does not end.**

| same encounter (`coliseum_champion_harm`), same harness | ends | capped |
|---|---|---|
| ⛔ the whole menu, as the matrix runs it | **13%** | **87%** |
| ⚑ HARM crafts only | **63%** | 31% |

⛑ **So "87% of fights never end" is "87% of declarations don't end a fight inside the harness's patience."**
⚠️ **Nothing here says the matrix is wrong — it was built to find crafts that do nothing, and it does. It was
never a measure of whether fights resolve, and it got read as one.**

### ⚑ AND WITH THE PATIENCE REMOVED, EVERY DUEL ENDS

| foe | L / hp | mean rounds, uncapped | ends |
|---|---|---|---|
| sustain / protect / restore champions | L13–15 / 95–105 | **8.5 – 9.5** | 100% |
| shape · influence · bargain · mirrors · boar | L18–20 / 120–130 | **12.1 – 12.8** | 98–100% |
| harm · know · marchward · redline · greatcat | L20–22 / 130–140 | **13.4 – 14.7** | 95–100% |
| ⛔ **zone raider** | **L23 / 145** | **15.9** (patience 40) | 100% · **player down 23%** |

➡️ ⛔ **THE QUESTION FOR ERIK IS NOT "WHY DON'T FIGHTS END". IT IS "IS 13–16 ROUNDS AGAINST A LEVEL-20 FOE TOO
LONG".** That is feel, and it is his — the numbers are now beside it.

---

## §1 — ✅ §1 AND §7: THE PATH IS ON THE RECEIPT, AND IT IS DICE — BOTH SIDES, IN PLAY

Every landed hit now carries **`path: "dice" | "flat"`**, **`pathWhy`** when flat, and **`population:
"authored" | "ladder"`** (§6). Gate §151 reads the share on real rounds through `playTurn`:

| | dice | flat |
|---|---|---|
| your harm hits (4,193) | **100%** — authored 51% · ladder 49% | 0 |
| the foe's hits on you (923) | **100%** | 0 |

✅ **Your §7 holds in play, not only on the probe.** The fallback is not load-bearing, and now a gate says so
every run rather than a person once.

### ⛔ WHICH MEANS TWO OF §8'S THREE DIALS ARE INERT, MEASURED

| dial | lives in | 0.06 → 0.20 → 0.35 | |
|---|---|---|---|
| **`perMarginPoint`** (§8.3) | the FLAT formula only | ends **63 → 63 → 62%** | ⛔ **inert** |
| **`perTier`** (Aevi's earlier 0.5 → 2.0) | the FLAT formula only | ends **62 → 62%** | ⛔ **inert** |

⚑ **The dice path already carries the margin (`marginFloorPer` on `rollMagnitude`).** ⚠️ **Turning a number in a
branch that never fires moves nothing — the sweep proves a dial the same way it tunes one.**

---

## §2 — ⛔ §8's "RANK DIMENSION" IS ALREADY BUILT, AND A `rankLadder` WOULD DOUBLE IT

> §8: *"`tierLadder` HAS NO RANK DIMENSION. `T5 r1` and `T5 r3` are byte-identical."*

⚠️ **Measured on a BARE declaration — no ability record, so no `rankDeltas`.** On the real crafts:

| harm crafts | rank 3 differs from rank 1 |
|---|---|
| 105 | ⛔ **89** — `rankDeltas.default` is **deepen ×1.35 per step**, so r3 = **×1.82** |
| the 16 that don't | every one authors `add` / `extend` deltas — a choice, not a gap |

⛑ **Erik's *"more damage dice on rank up"* shipped as a multiplier default weeks ago.** ⛔ **A `rankLadder`
beside the tier one would scale rank twice for 89 crafts.** Gated in §151 so nobody builds it on top.

---

## §3 — ⚑ THE DIALS THAT DO MOVE `ends%` — HARM PANEL, 17 ENCOUNTERS, PATIENCE 14

Baseline: **ends 62–64% · capped 31% · by health 50% · by break 2–3% · mean 9.7 rounds.**
Foes need **8.9** pressure ticks to break on average; fights produce **3.4**.

| dial | values | ends% | by break | mean rounds | your hit | foe hit |
|---|---|---|---|---|---|---|
| ✅ **§8.2 `perLevel`** (with `maxScaling 20`) | 0.06 → **0.10** → 0.15 | 62 → **67** → 67 | — | 9.7 → 9.5 | 14.2 → 15.2 | 14.7 → 15.4 → 16.6 |
| ⚑ **`breakAtMax`** — FINDING §4 shape B, NEW, inert when absent | off → **6** → 8 → 10 | 62 → **71** → 63 → 61 | 2 → **14%** → 4 → 3 | 9.8 → 9.5 | — | — |
| ⚠️ **`breakAtLevelFraction`** — shape C, undoes R34b | 0.5 → 0.35 → 0.25 | 62 → 66 → **75** | 2 → 10 → **26%** | 9.8 → 9.0 | — | — |
| ⬜ **patience** (harness only — not a game dial) | 14 → 20 → 30 | 61 → **83** → **94** | 3 → 7 → 11% | 9.9 → **11.1** → 11.6 | — | — |
| **the player's body** | L12/80hp → L30/150hp | 63 → 63 | — | 9.6 | 14.4 → 15.4 | you down 4% → **0%** |
| ⛔ **the FOE's pool** `npcStanding.healthPerLevel` | 5 → **4** → **3** | 64 → **68** → **75** | 3 → 2 → 1% | 9.6 → 9.1 → **8.6** | — | 15.0 → 15.5 · you down 5 → 4% |

**Combined:**

| | ends | by break | mean rounds |
|---|---|---|---|
| `breakAtMax 6` + patience 20 | **89%** | 23% | 10.4 |
| §8.2 + `breakAtMax 6`, fraction 0.5 | 70% | 12% | 9.4 |
| §8.2 + `breakAtMax 6`, fraction 0.35 | 74% | 15% | 9.2 |

### ⛑ WHAT THE TABLE SAYS

- ⛔ **`breakAtMax` is the one dial that opens the second exit without touching damage or R34b's shape.** At 6
  the break exit goes from 2% to 14% of endings. At 8 or 10 it barely binds — fights produce 3–4 ticks, max 9.
  ⚑ **That is Aevi's shape B from the finding, measured, and it works at exactly the number she guessed.**
- ⚠️ **`breakAtLevelFraction 0.25` moves more (75%) — by making a level-33 figure break at 9 instead of 17.**
  That is R34b being unwound, and Erik ruled R34b. His call, with the number beside it.
- ✅ **§8.2 is worth its 5 points and is already ruled.** ⚠️ It raises the foe's hits too (14.7 → 15.4): same
  path, both sides — you warned this in `MEASURED_why_nothing_lands` and it is exactly so.
- ⛔ **A stronger player does not resolve faster.** L30 with 150 hp ends the same 63% — he just never goes
  down. ⚑ Fight length is set by the **foe's pool**, not the player's power: `30 + level × 5` hp against
  ~14-point hits at ~60% exchange wins ≈ 15 rounds. ⛑ **Swept: `healthPerLevel` 5 → 3 takes ends to 75% and
  the mean fight to 8.6 rounds, with the foe's hits and the player's risk UNCHANGED.** It is the one lever
  that shortens a fight without making it deadlier — and it is a standing-pool ruling of Erik's, not a damage dial.

---

## §4 — ⛔ ONE DEFECT UNDER ALL OF IT, FOUND BY THE SWEEP PRINTING "?"

**`breakAt` — the pressure a foe breaks at — rode on `battleRound`'s state and `skillBattleRound` DROPPED IT.**
⚠️ **`app.js:14514` read `rr.state.breakAt.opponent ?? 2` and fell to the flat dial: the panel told the player
two ticks would break a foe the engine holds at `ceil(level/2)` = 10.** CCODE-277's sixth eaten value. Fixed,
gated (§151), and it is why every foe now prints its break-at in the sweep.

---

## §5 — ⬜ §5.3 / §5.4, STILL OPEN AND STILL ERIK'S

| | |
|---|---|
| **`minHit: 0`** | Erik ruled 0 on 2026-08-28 (*"I don't like the 1 minimum"*). ⚑ Measured: T5 means 52 per hit on the panel; a zero is soak beating a T1 — rare and intended |
| **soak vs the dice** | ⛔ soak is 2–5 against T5 hits of 50. It is noise at the top. ⬜ **Whether armour should scale with tier is a design ruling, not a dial** |

---

## §6 — ⛔ WHAT ERIK DECIDES

| # | ruling | measured effect |
|---|---|---|
| 1 | ⛔ **Is 13–16 rounds against a level-20 foe too long?** If yes → **`npcStanding.healthPerLevel` 5 → 4 or 3** is the lever (shorter, not deadlier); if no → nothing is broken and §3 is polish | fights end 95–100% uncapped · pool 3: ends 75%, mean 8.6 rounds |
| 2 | ⚑ **`breakAtMax: 6`** — shape B, ships inert today | ends +9 pts; break exit 2 → 14% |
| 3 | ✅ **§8.2** `maxScaling 20`, `perLevel 0.10` — already ruled; say the word and it lands | ends +5 pts; foe hits +5% |
| 4 | ⚠️ **`breakAtLevelFraction`** 0.5 → 0.35? | ends +4–8 pts; a L33 figure breaks at 12 not 17 — softens R34b |
| 5 | ⬜ soak at the top of the ladder (§5.4) | design, not a dial |

⛔ **Not shipped, on purpose:** none of the dial values above. The sweep is the deliverable — *"a dial he can
turn and a number that answers."* The numbers are answered; the turning is his.

✅ **Gates:** 12 in `how_it_works` §151 (path share both sides, population, rank already moves damage, `breakAtMax`
inert/binding, the `breakAt` seam). `scripts/damage_sweep.mjs --vary <path> --range a,b,c` for any dial;
`--set` to combine; a path that does not exist is an error, never a silent no-op.

---

# §7 — ⛔ ERIK RULED THE TARGETS (2026-09-11), AND HERE ARE THE OPTIONS

> Erik: *"Too long. Fights should be 10 rounds ± 5 when fighting something at or within a level or 2 of you —
> across the board. If you are 10 levels higher in a 1-1 fight it should be very trivial. Breaking for a win
> should be 30% to 15% of the time. Tune knobs to help get us here, and let me know the options."*

⛑ **The sweep now matches the player's level to each foe (`--match peer | +10 | -2`) and builds the player by the
foe's own body formula (`--body npc`), so a peer fight is symmetric by construction.** Rounds are reported as a
distribution; break as a share of WINS; and per craft TIER — because `levelReq == tier` for every harm craft,
a level-6 player may hold a T5, and the ×10 tier spread is real in play.

## §7.1 — where it stands today, peer-matched

| | median rounds to a win | inside 5–15 | break / wins | win | you down |
|---|---|---|---|---|---|
| **peer (L20 vs L20)** | **14** (p10 3 · p90 25) | 43% | 3% | 75% | 3% |
| **+10 (L30 vs L20)** | **12** | 54% | 8% | 92% | 0% |

⛔ **Neither target holds.** Level barely reaches a fight: +10 levels is +50 hp, +0.6 damage, ~+2 attribute —
and **level never enters the contest roll**. Length is the foe's pool (`30 + 5 × level`) against ~14-point hits.

## §7.2 — the single dials, peer, patience 30

| dial | values | median | in 5–15 | break / wins | you down |
|---|---|---|---|---|---|
| ⛔ `damage.scaling.perLevel` (level hits harder) | 0.06 → 0.3 → **0.6** | 14 → 12 → **10** | 41 → 50 → **72%** | 3 → 0 → 0 | 3 → 7 → 8% |
| `npcStanding.healthPerLevel` (both pools) | 5 → 3 → 2 | 14 → 11 → 9 | 40 → 53 → 60% | 3 → 1 → 0 | 3 → 9 → 13% |
| `momentum.pressure.breakAtMax` | off → 6 → 4 | 14 → 15 → 14 | — | 2 → **17** → 36% | — |
| `momentum.pressure.breakAtLevelFraction` | 0.5 → 0.35 → 0.25 | 14 | — | 3 → 11 → **23%** | — |
| `momentum.marginScale` (meter fill) | 0.2 → 0.35 → 0.5 | 14 → 13 → 13 | — | 2 → 10 → **16%** | — |

⚠️ **Length and break pull against each other:** the harder the hits, the sooner health ends it and the fewer
pressure ticks a fight produces — `perLevel 0.6` alone drives break to **0%**. So the break dials have to be set
*for the shorter fight*, not for today's.

## §7.3 — ⚑ THE OPTIONS

### Option 1 — LEVEL HITS HARDER · ✅ all three targets
`damage.scaling.perLevel 0.06 → 0.6` · `damage.scaling.maxScaling 6 → 60` (levels to 100) ·
`momentum.marginScale 0.2 → 0.5` · `momentum.pressure.breakAtMax: 4` (new dial)

| | median | in 5–15 | break / wins | win | you down | per tier (median) |
|---|---|---|---|---|---|---|
| **peer** | **8** | 73% | ✅ **27%** | 86% | 11% | T1 15 · T2 12 · T3 10 · T4 8 · T5 4 |
| **+10** | **6** | 67% | ✅ 16% | **97%** — 100% on every real duel | **0%** | T1 7 · T2 7 · T3 6 · T4 5 · T5 3 |
| **−2** (foe two above you) | 7 | 73% | 34% | 79% | 19% | T3 8 · T4 7 |

⛑ **+10 is trivial, peer is 10±5 for T2–T4, break sits mid-band.** ⚠️ **Cost: fights are deadlier both ways** —
the foe's mean hit goes 10 → 25, and you go down 11% of peer fights instead of 3%. A foe two levels above you
is a real fight (greatcat, zone raider ~35–45%).

### Option 2 — SMALLER POOLS · gentler, more even across tiers, break a touch over
`npcStanding.healthPerLevel 5 → 3` · `momentum.marginScale 0.2 → 0.5` · `momentum.pressure.breakAtMax: 5`

| | median | in 5–15 | break / wins | win | you down | per tier (median) |
|---|---|---|---|---|---|---|
| **peer** | 9 | 65% | 33% | 86% | 11% | **T1 12 · T2 12 · T3 11 · T4 7 · T5 3** |
| **+10** | 7 | 72% | 34% | 97% | 0% | T1 9 · T2 9 · T3 8 · T4 6 · T5 3 |
| **−2** | 9 | 65% | ✅ 30% | 80% | 18% | T3 11 · T4 7 |

⛑ **Tighter across tiers (a T1 cantrip is 12, not 15) and the foe's hit stays at 14.** ⚠️ +10 is 7 rounds, not 6;
break overshoots by 3–4 points — `breakAtMax 6` or `marginScale 0.4` would bring it in. ⚠️ **Note this changes
the PLAYER's pool too if the same standing formula is read** — the sweep's `--body npc` does; a real save keeps
its own `maxHealth`, so in play only the foes shrink, which makes it easier than measured here.

### Option 3 — halfway (`perLevel 0.3`, `healthPerLevel 4`, break as Option 1)
peer median 11, 62% in band; +10 median 8. ⚠️ Lands the length target less well than either, and buys nothing
the other two don't. Included for completeness.

## §7.4 — ⚠️ THE RESIDUE NO DIAL CLOSES: THE TIER SPREAD

Under every option a **T5 capstone ends a peer fight in 3–4 rounds** and a T1 cantrip takes 12–15. That is
`tierLadder` — T5 is 5d6+8 (25.5) against T1's 1d6 (3.5), ×7 — and it is authored, not a fight dial. ⬜ **If Erik
wants "across the board" to include T1 and T5, that is a ladder ruling** (`tierLadder.5.dice.plus` / `nMult`),
not a tuning knob, and it changes what a capstone *is*.

## §7.5 — ⛔ RECOMMENDATION, AND WHAT SHIPS
**Option 1.** It is the only set that lands all three targets as ruled, and "+10 is trivial" needs level to reach
damage — which is exactly what `perLevel` is for. ⚠️ Deadlier fights are the price, and they look like what
"10 rounds" meant.

⛔ **Nothing is shipped.** `breakAtMax` exists as an inert dial; the four values are one content edit each
(`skill_battle_system.json`, `resolution.json`). Say which option, or a mix, and it lands with the sweep as its gate.

---

# §8 — ⛔ ERIK ASKED WHETHER THE HARNESS PLAYS LIKE A PERSON. IT DID NOT. NOW IT DOES, AND THE ANSWER CHANGES.

> Erik: *"real people try for every advantage and want to hit as hard as they can. that means their best sense /
> conceal for the opponent and their best actions. does this harness do that? and does it test the entire level
> range up to 100? for each domain?"*

⛔ **No, no, and no** — measured before anything was changed:

| what a person can do in a round (engine) | the sweep did |
|---|---|
| **sense** first with their best read → setup bonus up to +12 | never sensed |
| **conceal** to deny the foe's read | never |
| **weave** two crafts (+2/tier to the roll, max +8, energy ×1.8) | one craft |
| **surge** (+10 to the roll, energy ×1.6) | standard, always |
| **wield** a weapon (+4 per item, cap +8) | no inventory |
| attempt the **finisher** when the odds favour it | never |
| the **bonus action** a good read earns | never |
| levels: the 17 authored encounters, foes **L13–23** | not 100 |
| kit: **every craft in the catalog**, chosen by tier | not a domain, not a level |
| the foe: `opponentPolicy` — never weaves, never senses, never wields | as in the game |

⛑ **Built:** `--policy greedy` (the person above), `--foe greedy` (the foe weaves and surges too — through a new
`foePolicy` hook on `playTurn` / `skillBattleRound`, absent = today, gated §152), `--kit bought` (a level-L person's
purchases under the rules: `tierUnlockBands` T2@8 · T3@21 · T4@35 · T5@48, `skillPointPerLevel 2`, `tierPrice`,
ranks by `rankLevelReq`), `--levels 5,…,100` (synthesized peers), `--foes people` (the authored roster at their own
level, their real kits), `--domain <D>|all`.

⚠️ **AND A CORRECTION OF MY OWN CLAIM IN §7:** *"a level-6 player may hold a T5."* Wrong for a real character — `levelReq ==
tier` is the legacy alias; **`tierUnlockBands` is the gate**, enforced at learn time (`progression.js`). The harness now
buys under it.

## §8.1 — ⛔ THE FINDING: UNDER REAL PLAY A FIGHT IS 1–3 ROUNDS, DECIDED BY THE DEATH SAVE

**Both sides greedy, a bought kit, peer-matched, patience 30 — every level:**

| ladder | rounds to a win (p50) | how it ended | win | you down |
|---|---|---|---|---|
| **peer** L5→L100 | **2** (p90 6) | **finisher 80%** · health 12% · you 8% | 92% | 8% |
| **+10** | 2 | finisher 68% · health 28% | 95% | 5% |
| **−2** | 2 | finisher 76% · health 8% | 85% | 15% |

⛔ **Why:** R35 — *a landed hit at a lethal rung OFFERS the insta-kill* — is engine-intrinsic, not a button. **47 of 105
harm crafts are lethal-rung, 28 of them at T1–T2**, so a level-1 person has it. The greedy pick lands nearly every hit
(weave + surge + weapon), and with `deathSave.saveBonus 20` the save fails about half the time. `case_closed` (T1,
lethal) ends a level-20 peer fight in two rounds. ⚠️ **The 10 ± 5 target and R35 as it stands cannot both be true
for people who play well.**

## §8.2 — ⚑ FOR EACH DOMAIN (level 20, peer): IT BIFURCATES ON ONE THING

| the domain's T≤2 kit has a lethal craft | domains | rounds (p50) | ended by |
|---|---|---|---|
| ⛔ **yes** | Angelic · Body · Breaking · Death · Life · Light · Mind · Span | **2** | finisher 95–100% |
| ⚑ **no** | Building 9 · Chaos 8 · Dark 7 · Demonic 7 · Order 7 · Spirit 10 | **7–10** ✅ in band | health 100% |

## §8.3 — ⬜ THE FIGHT THE TARGET DESCRIBES: attrition, no lethal crafts (`--no-lethal`), both greedy

| level | rounds p50 | win | you down |
|---|---|---|---|
| 5 · 10 · 20 | 4–6 | 100% | 0% |
| 35 | 6 | 83% | 17% |
| 50 · 75 | 6–9 | **42%** | 58% |
| 100 | 9 | **20%** | 80% |

⛑ **Median 6, 67% inside 5–15 — the length is already close under today's dials once the kill is out of the kit.**
⚠️ **But a symmetric peer who weaves and surges a bare T5 strike out-damages a player's non-lethal T5 at level 50+.**

## §8.4 — ⚑ THE KNOB THAT GOVERNS THE KILL, MEASURED UNDER REAL PLAY: `deathSave.saveBonus`

| saveBonus | L20 rounds p50 · finisher share | L50 rounds p50 · finisher share · win |
|---|---|---|
| **20** (today) | 2 · 100% | 2 · 83% · 83% |
| 40 | 3 · 100% | 2 · 63% · 65% |
| 60 | 3 · 98% | 2 · 55% · 62% |
| 80 | 4 · 90% | 4 · 50% · 62% |

⛔ **It softens the kill and does not remove it.** A lethal craft that rolls on every landed hit still ends most fights
at 80. If Erik wants 10-round fights among people who play well, the change is to **when a lethal craft may roll** —
a tier floor, a rung cost, or a set-up condition (worn down, driven back) — and that is a ruling on R35, not a dial.

## §8.5 — ⛔ WHAT THE HONEST HARNESS SURFACED ON THE WAY

| | | |
|---|---|---|
| ✅ **fixed** | **three callers still clamped threat to 70** after SNG-249 removed the sheet's ceilings — `synthesizeDuelDef`, `encounters.js`, `battle_turn.js`. Every synthesized duel foe in play was **level 35 or below**. Lifted; gated §153 (a threat-200 duel is a level-100 sheet) |
| ⛔ **reported** | **the ground never reaches a fight.** `substratePenalty` is a roll term supplied only to free-form actions (`app.js:7594`); `rollSide` never sees it. ⚠️ **The entire power-source / band / reach work touches free-form actions and the ground card, not one skill battle.** "Per domain" in a fight is a KIT question today |
| ⛔ **reported** | **the read loses on average at every level** for symmetric bodies: resist = `passiveAttributeWeight 3` × best attribute (9 at L20, 36 at L100); the read caps at rank 3; a failed read hands the FOE the setup. Mean setup −3 to −7. A person learns to stop — the harness does (`sensed 20–50%`) |
| ⛔ **reported** | **the break exit is 0% under real play at every level** — a 2–6-round fight never fills the meter |
| ⛔ **reported** | **authored people are not held to the tier bands.** Against the roster at peer level (33 people, L9–85), a bought-kit player **loses 74%**; a level-12 NPC lands 42-point hits |
| ⚠️ **withdrawn** | §7's Options 1 and 2. They were measured against a player and a foe who never wove, surged, sensed or wielded. Under real play the dials they turn are not what decides a fight |

## §8.6 — ⛔ WHAT ERIK DECIDES NOW

| # | | |
|---|---|---|
| 1 | ⛔ **R35 under real play** — keep (fights among people who play well are 1–3 rounds, decided by the save), raise `saveBonus`, or restrict WHEN a lethal craft may roll | the whole 10 ± 5 question turns on this |
| 2 | ⚠️ **should NPCs be held to the player's tier bands?** | today a L12 NPC out-guns a L12 player 3:1 |
| 3 | ⬜ **should the ground reach a fight?** | today it does not, anywhere |
| 4 | ⬜ the read: `senseStep.passiveAttributeWeight` 3 | sensing a peer is a loss on average |
