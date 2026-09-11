# REPLY — authored bodies win, your two words, and the wells dial measured

**From:** CCode · **2026-09-11** · **v1.9.451** · **To:** Aevi, Erik
**Answers:** `REPLY_aevi_wells_gear_tags` §1–§5 · **gates:** `§159` · `§162` · `§164`
**the page:** *The Fight Dials*

---

## 1 · §5 — an authored body wins ✅ (`§162`)

One correction to the shape, then your fix exactly as written. `sheetFor` **did** keep the 46 authored `subAttributes` —
the `{}` you found is `sheetFrom`'s legacy branch, which `sheetFor` overlaid. What it never did was build the **parents**
from them, and the parents are what most rolls read. So the effect was the one you named: a body its author did not write.

| person | authored | fought with, before | fights with now |
|---|---|---|---|
| **Veyra of the Lance** (L29) | strength 12 · agility 13 · reason 9 | physical **18**, 3 in the rest | physical 13 · mental 11 · social 9 · practical 10 |
| **Sesh of the Quiet Blow** (L30) | reason 16 · rapport 6 | mental **19**, 3 in the rest | physical 10 · mental 16 · social 9 · practical 12 |
| **Orrun Shieldbreaker** (L31) | presence 15 · craft 9 | mental **19**, 3 in the rest | physical 12 · mental 12 · social 14 · practical 11 |
| **Veth-Ondra** (L33) | insight 15 · reason 11 | mental **20**, 3 in the rest | physical 7 · mental 13 · social 9 · practical 9 |

Each parent is now the mean of its authored subs, as a player's is; the growth function fills only what nobody wrote (all
46 author all eight subs, so for them nothing is grown). An authored `attributes` block would win outright — none exists
(0 of 146). `leansOf` now touches only the 100 people with no authored body. Reserves (health, energy) still follow the
player's growth rule for everyone, and soak is what they wear.

Across the 46: median strongest attribute **15** (7–19), and **23** of them carry a spread of five or more between their
strongest and weakest — specialists, as you wrote them.

## 2 · The roster audit, re-run

⚠️ **First, a correction to my last reply.** `REPLY_ccode_20260911c` §6 said a player of their level beats the authored
roster **61%**. That run let the player buy from **every** domain — the sweep's own header warns this inflates wins — while
the peer table beside it gave each side one domain. Measured the way the peer table was (one domain a side), the roster at
HEAD was **46%**: exactly the peer figure. Both methods, HEAD against this tree, the same command, run side by side:

| a player of their level against | every-domain player (the published command) · HEAD → now | **fair, one domain a side** · HEAD → now |
|---|---|---|
| everyone (143) | 61% → 63% | **46% → 45%** |
| **the 16 tier-breakers** | 65% → 64% | **46% → 31%** |
| rule-followers with an authored kit (30) | 51% → 58% | 50% → 56% |
| drawn kit (97) | 64% → 64% | 44% → 44% |
| **the 46 authored bodies** | 56% → 60% | 49% → 47% |
| grown bodies (97) | 64% → 64% | 44% → 44% |

The published command is 40 fights a person (5,720); the fair one 16 (2,288), so under fair rules one person's figure can
move about 12 points by chance — the groups are firmer than any single name.

✅ **The fix touched only who it should:** every grown body's figure is identical on both trees.

⛔ **Under fair rules the tier-breakers are now the hardest people in the roster.** On the bodies their author wrote, a
player of their level wins 31% against the 16 (was 46%), and **five beat that player every time**: Sesh of the Quiet Blow
(L30), Veth-Ondra (L33), Orrun Shieldbreaker (L31), Bricke of the Making (L23), Marn of Two Forms (L28). The largest moves:
Cassa Redsail 81% → 25%, Sethran 75% → 31%, Lys of the Veiled Reach 100% → 56%, the Keeper of Small Debts 69% → 38%, Veth
31% → 0% — and one the other way, Calvar 44% → 75%. Measured, not diagnosed.

⚑ **Your question, answered:** you asked whether the roster gap was my PC being weak or the roster being wrong. At fair
rules there was no gap — the roster sat at the peer figure all along; the 61% was my every-domain player. What the authored
bodies change is *who* is hard: the tier-breakers, now, which is the audit's own subject.

⬜ **And a cluster this fix did not touch:** six people at L25 on grown bodies — Vael of the Redline, Marshal Veyn, Master
Taro, Overseer Grael, the Last Walker, the Seeker of the Lost Chord — beat a player of their level every time on **both**
trees. Mine to look at next.

## 3 · §3 — your two words ✅ (`§159`)

| case | tag | tooltip |
|---|---|---|
| capped by meaning | `little meaning −N` | *"Few here have made this place matter. This craft draws on that."* — never *thin ground* |
| cannot work here | `will not answer` — **no number** | *"There is nothing here for this to draw on."* |

`will not answer` is decided before anything else, so a craft that cannot work never shows a figure — not even one that
rounds to zero.

## 4 · §1 — the wells: built as a dial, measured — and the Great Engine is not the well's fault

**Built** as `the_substrate.poolsTowardFull` (false = today): `effective = base + delta × (1 − base)` for the world
field's pools and a settlement's own wells; sinks untouched. Your arithmetic holds — Archive Hollow 0.40 + 0.20 → **0.52**.

Measured over 429 crafts × 135 places. A *well place* is one a pool lifts at least 0.05 above its region — 46 places.

| crowding | wells | crowded | full | empowered | on a well: crowded / full / empowered | mean ground penalty |
|---|---|---|---|---|---|---|
| A · today | additive (today) | 15.6% | 25.0% | 10.4% | 27.1% / 28.9% / 8.4% | 15.3 |
| A · today | **toward full** | 13.2% | 23.8% | 12.7% | 21.6% / 25.3% / **14.6%** | 14.7 |
| E · only metaphysical and veil crowd | additive | 6.3% | 34.3% | 10.4% | 11.8% / 44.2% / 8.4% | 13.9 |
| **E · only metaphysical and veil crowd** | **toward full** | **5.1%** | 31.9% | **12.7%** | **8.8% / 38.1% / 14.6%** | **13.7** |
| C · nothing crowds | additive | 0% | 39.3% | 10.4% | 0% / 54.1% / 8.4% | 12.9 |
| C · nothing crowds | toward full | 0% | 36.1% | 12.7% | 0% / 45.6% / 14.6% | 12.9 |

| place (share of crafts: full / empowered / crowded) | today | toward full | E + toward full | C |
|---|---|---|---|---|
| **The Great Engine** | 21 / 11 / **67** | 21 / 11 / **67** | 55 / 11 / 34 | 89 / 11 / 0 |
| The Grand Lattice | 23 / 11 / 66 | 21 / 17 / 62 | 52 / 17 / 31 | 83 / 17 / 0 |
| The Service Ways | 14 / 11 / 43 | 14 / 11 / 43 | 47 / 11 / 10 | 57 / 11 / 0 |
| Archive Hollow | 15 / 22 / 6 | 17 / 27 / **0** | 17 / 27 / 0 | 17 / 27 / 0 |

⛔ **The formula does not rescue the Great Engine, because the well is not what crowds it.** The field is clamped to
[0, 1] — the 1.20 was never what a craft rolled on; it rolled on 1.00, and your formula takes it to 0.98. Both sit above
most bands. **The Gearlands' own ground (0.98) crowds two crafts in three before the well adds anything.** Only the
crowding answer reaches that: E brings the Engine to 34% crowded, C to none.

✅ **What the formula does do is the good half.** On a well, the empowered share rises from **8.4% to 14.6%** — above
open ground (12.7%) for the first time. A well stops pushing crafts past their core, so standing on one becomes better
than not: the pilgrimage, with no new content. Archive Hollow loses its crowding entirely.

⚠️ My first run of this table moved nothing: the load stamps each place's density once and never overwrites it, so
re-stamping a loaded copy did nothing. `§164` now asserts the read a craft makes, not only the field function.

⚠️ This table and the one in `REPLY_ccode_20260911c` §7 count different populations (there, 18.8% crowded today; here,
15.6%). Compare rows within a table.

## 5 · §2 — the gear is yours ✅

Noted, and the order is right. `gearWords` and `defaultLoadout` stay as the fallback. The audit lists what each person
carries, so progress shows as you go.

## ⬜ OPEN

| # | for | question |
|---|---|---|
| 1 | Erik | wells: turn `poolsTowardFull` on? Measured best paired with crowding E — 5.1% crowded, and a well 14.6% empowered |
| 2 | Erik · Aevi | the Gearlands itself crowds two crafts in three at the Engine under today's crowding — a place too loud for craft (keep it), or lift crowding (E: 34%, C: 0%)? |
| 3 | Erik | carried from `REPLY_ccode_20260911c`: ten levels at 62%, fights of 4 rounds, spiky bodies — now only the grown ones; the 46 authored people carry their author's spread |
| 4 | Aevi · Erik | on the bodies their author wrote, five tier-breakers beat a player of their level every time under fair rules (Sesh, Veth-Ondra, Orrun, Bricke, Marn) — intended, or theirs to soften? |
| 5 | CCode | six L25 people on grown bodies win every fight on both trees — mine, next |
