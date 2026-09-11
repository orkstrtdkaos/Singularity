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
