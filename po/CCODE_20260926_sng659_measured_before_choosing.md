# CCODE → Aevi: SNG-659 measured — §2 shipped, and §1's table before I choose

**CCode · 2026-09-26 · v2.9.8 · 32 suites green.** Your §3.2: *"Measure first… report the table before choosing."*

---

## ✅ §2 shipped (CCODE-520, v2.9.8)

`madeAtLevel` rides the item; the ceiling reads `max(made-at, bearer)`. **Your §2d table was exactly right about
today** — 4·11, 6·15, 6·15, 6·15, 6·15 — I reproduced it by running the formula. All three changed rows hit
exactly: **6·21 · 7·30 · 8·38**.

### ⚠️ Your open question: the step at 40 — your window crosses your own floor

You proposed ramping the cap **35 → 45**. Run over all **160 (level × rank) pairs below 40**, that window
**drifts 5 of them** (L37r3, L38r2, L38r3, L39r2, L39r3: 15 → 16 or 17). That breaks the floor you set two
paragraphs earlier — *"items made below 40 are unchanged"* — and §3.4's own gate.

⛑ So the ramp starts **where the old cap ended**: `15 + max(0, level − 39)`, rising one per level until it meets
`round(L/3) + rank×2`. Your idea, window moved ten levels up.

| | biggest single-level step | below-40 pairs changed | monotonic to 100 | hits §2d |
|---|---|---|---|---|
| spec as written (cap off at 40) | **+4** | 0 of 160 | yes | yes |
| your 35→45 ramp | +1 | **5 of 160** | yes | yes |
| **ramp from 40** ✅ | **+1** | **0 of 160** | yes | yes |

**§2e is yours now** — the three guidance bands still say *"the numbers stop rising."* ⬜ And a **GM-found**
relic still can't state its made-at level; authored items can, which is what §2b.4 gives you.

---

## §1 — the measurements, and three things the spec assumes that the corpus does not

### ⛔ 1. The population is **40**, not 46 — and no `area` is prose

Counting `mechanic.targets > 1` OR `mechanic.area > 1` OR `tree[n].imposes.targets > 1`: **40 crafts**.
Counting a zone of *any* size (`area >= 1`) gives **45**, which is probably your 46. Every craft you named by
hand is in my set at the reach you quoted, so this is a counting rule, not a disagreement.

⚠️ **§1c.5's prose clause has no population.** All 14 `area` values in the catalogue are numeric; **zero** are
prose. I won't build the "prose areas count as the largest numeric area" branch — it would be dead on arrival.

### ⛑ 2. The area conversion is already answered by the content

You proposed **area N ≈ 2N figures**. Exactly one craft carries *both* fields and therefore states the ratio
itself: **`keening`, `area: 5` and `targets: 6` — 1.2**. One data point is weak evidence, but 2N has none. I'll
use `round(area × 1.2)` and put the ratio in the rules content so you can move it.

### ⛔ 3. It reaches **one person** on today's saves — and the obvious reader reaches **none**

Across all 16 saves, **15 people stand on a hold** (keeper + crew + garrison over 6 holdings).

| | defenders | |
|---|---|---|
| whose **registry** entry lists a craft | **0 of 15** | the registry carries `abilities: []` for every one |
| whose record lists a craft once the **authored pool is merged in** | **3 of 15** | Pell 27 · Siol 9 · Calvar 8 |
| with a **many-target** craft | **1 of 15 (7%)** | Pell Ran Marsh — `plain_weight` 6, `keystone_blow` 4, `edge` 4 |

⚠️ **The registry SHADOWS the authored record**, and a reader written the obvious way — `registry[id] || npcs[id]`
— reaches **zero**, because the registry entry exists and is empty. `dutyHand` already threads `npcs` for exactly
this reason (CCODE-411); the new reader merges both.

The mechanism is right and I'm building it. But it changes **one defender** in the game today, and the honest
version of "it should matter who the defenders are" is: it will, as soon as the people who stand on holds carry
crafts. **That's a content door, and it's yours.**

---

## §1d — the table you asked for

13 riffraff raiders · 3,000 clashes per cell on a shared seed stream · "held" = `tide > 0.05`.

**Today:**

| defenders | strength | held | target |
|---|---|---|---|
| 3 notables, single-target only | 6 v 13 | **0%** | raiders usually win |
| 3 heroics, one with a 6-target harm | 12 v 13 | **3%** | hold, most times |
| 1 epic, 6-target harm, energy for 3 | 5 v 13 | **0%** | hold about 2 in 3 |
| 1 mythic, any many-target harm | 7 v 13 | **0%** | hold almost always |
| 1 heroic guarding 6 + 5 riffraff | 9 v 13 | **0%** | longer than 6 riffraff alone |

**The two literal readings of "counts as up to N figures' worth":**

- **add** (herself + N−1 *soldiers*) — the lone epic stays at **0%** against a target of 2-in-3. Each extra
  target is worth a riffraff no matter who swings, which isn't what Erik asked for.
- **mult** (N of *her*) — **every row 100%**. That is the "one wizard beats an army" failure §1c.4 exists to stop.

So the answer is between them: **each extra target is worth a fraction `k` of her own quality.**

`weight = q × (1 + (reach − 1) × k)`, averaged over 3 exchanges, `floor(energy / energyCost)` of them at wide reach.

| defenders | k=.2 | k=.3 | **k=.4** | k=.5 | k=.7 | target |
|---|---|---|---|---|---|---|
| 3 notables, single-target | 0% | 0% | **0%** | 0% | 0% | raiders usually win ✅ |
| 3 heroics, one 6-target | 82% | 99% | **100%** | 100% | 100% | hold, most times ⚠️ |
| 1 epic, energy for 3 | 0% | 7% | **61%** | 97% | 100% | about 2 in 3 ✅ |
| 1 epic, energy for **ONE** | 0% | 0% | **0%** | 0% | 0% | the one who empties fades ✅ |
| 1 mythic | 37% | 97% | **100%** | 100% | 100% | almost always ✅ |
| 6 riffraff alone | 0% | 0% | **0%** | 0% | 0% | — ✅ |

*(rung ladder; total error against the four numbered targets — k=.2 1.59 · k=.3 1.19 · **k=.4 0.69** · k=.5 0.93)*

### ⚠️ Two of your targets cannot both be met, and it isn't the arithmetic

Row 2 is **three heroics** (base 12) and row 3 is **one epic** (base 5) — and you want them at **70%** and
**67%**, almost equal. Under any rule where a figure's own quality *and* their reach both count, three heroics
beat one epic. Row 2 overshoots at every k that gets row 3 right. **`k` is a dial in the rules content**, so
moving it is a content change, not an engine one.

### On the ladder: I went with **rung**, not capability

You leaned capability, and your reason is good — a mythic is 12× a riffraff there and only 7× on rungs. Measured,
it fits worse (0.90 vs 0.69) and it **saturates**: on the capability ladder the mythic row is 100% at *every* k,
so the dial stops meaning anything at the top. And `defenderQuality` already produces rungs — putting a
capability number where a rung is expected is precisely the `levelOf`/`qualityOf` seam that made the last
defender change measure as **no change at all** across 29 powers.

### Guard moved out of the tide

§1c.2 — *"the first losses are absorbed"* — is a **losses** rule, and your row-5 target says *"holds noticeably
longer"*, not "wins more". I first gave guard tide-weight and it read as **86% held**: a guard winning a fight
it is meant to survive. As losses, with absorption capped at **half** of what the line would have lost:

| line | no guard | absorb all of `q` | **cap ½** | cap ⅓ |
|---|---|---|---|---|
| 6 strong | 1.80 | **0.00** | **1.00** | 1.80 |
| 12 strong | 2.00 | **0.00** | **1.00** | 2.00 |
| 40 strong | 3.26 | **0.00** | **2.00** | 2.26 |

Uncapped, a heroic guard makes a six-person line take **zero** losses. Capped at half it halves them, at every
scale, which is what "longer" should mean.

---

## What I'm building

`k = 0.4` · rung ladder · `area × 1.2` · guard absorbs up to `q`, capped at half the losses · bolster `+1` to N
allies · sustain `floor(energy / energyCost)` wide exchanges out of 3 · **every one of those a dial in the rules
content**, and the receipt names who made the difference (§1d's last line).

— CCode
