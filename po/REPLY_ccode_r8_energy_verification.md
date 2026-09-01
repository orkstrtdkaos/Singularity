# REPLY — R8's energy verification, and an R9/R10 interaction

**CCode → Erik, cc Aevi · 2026-09-01 · responds to `RULING_axis_balance_20260901.md`**

---

## §1 — ⛔ R8 FAILS ITS OWN TEST. THE DOUBLED PRICE COMES BACK.

> R8: *"CCode to verify: what does a Reason-2 character's L100 energy pool look like, and how many casts
> per day does it buy? **If the answer is 'plenty', this reasoning fails** and the doubled price comes back
> on the table."*

✅ **Aevi's mechanism is real — I doubted it and was wrong.** `reason` does grant max energy, through
`sub_attribute_ladder.subs.reason` (`unit: "max energy"`, +8/rank at ranks 3–6, +5 at 7–14, +4 at 15–20).
✅ **The claim was correct. The magnitude is not.**

| | Reason | L100 pool | casts on a full pool | vs dumper |
|---|---|---|---|---|
| **DUMPER** (all → Insight) | 2 | **595** | **94** | 1.00× |
| SPREAD (even, 8 subs) | 14 | 667 | 105 | 1.12× |
| REASON-LEANED | 20 | 691 | 109 | 1.16× |

⛔ **The dumper casts 94 mean-cost crafts on a full pool and rests back ~196 a night.** By R8's own
test, **that is "plenty"** — it is not a walking library with no power to cast from.

### ⛔ AND THE REASON WHY IS THE PART THAT MATTERS

| lvl | dumper pool | reason-dumper | Reason's share of the pool |
|---|---|---|---|
| 10 | 145 | 207 | **30%** |
| 20 | 195 | 291 | **33%** |
| 50 | 345 | 441 | 22% |
| 100 | 595 | 691 | ⛔ **14%** |

⛔ **The limiter decays.** Max energy is `100 + 5/level` — **+495 by L100** — while the Reason ladder
**caps at +96 total**. So Reason is a third of the pool at L20 and a seventh of it at L100.

⚠️ **The constraint R8 relies on is weakest exactly where the problem it excuses is worst.** The dumper's
overflow is a **late-game** problem — 201 banked points at L100. Reason-starvation is an **early-game**
constraint that has faded by the time the overflow arrives. ⛔ **They do not meet.**

⬜ **Recommend: adopt fix (i) — train-to-rank-2 costs `(tierPrice + band) × 2`.** Sink rises to 372, and
nobody overflows. ⚠️ **Aevi's instinct that the dumper is a legitimate build still holds** — (i) does not
punish it, it just gives the banked points somewhere to go.

---

## §2 — ⛔ R9 AND R10 COLLIDE ON THE ANTIPODE

**R10** sets ceilings by standing: primary 5 · secondary 4 · tertiary 3 · **far 2**.
**R9** prices the antipode by lean, so *"balance earns parity."*

⛔ **If the antipode counts as `far`, it caps at tier II — and R9's parity buys nothing above tier II.**
A character who has genuinely balanced both ends of the axis still cannot learn a tier-III craft in their
other pole. **"A true cross-pole character" would top out at novice depth on one side.**

⚠️ **The bands are distinct in code** (`band: "antipode"` vs `band: "far"`), so R10's four rows do not
settle it — this is a real gap, not a reading error.

### ⬜ THE CALL — three shapes

| | shape | effect |
|---|---|---|
| **a** | antipode is `far` → ceiling 2 | ⛔ R9's parity is cosmetic above tier II |
| **b** | antipode gets its own ceiling, fixed at 3 or 4 | simple; balance buys price relief only |
| ⬜ **c** | **the antipode's ceiling RISES WITH LEAN** — 2 when fully leaned, 5 when balanced | ✅ **makes "true cross-pole" mean something, and it is the same `lean` R9 already computes** |

⬜ **I lean (c).** It costs nothing extra to build — `lean` is already being computed for the surcharge —
and it is the only shape where R9 and R10 say the same thing instead of cancelling.

### ⚠️ R10 also leaves three bands unstated

`adjacent` (kin to primary — today ≤3), `acquired` (joined mid-play — today 1), and `antipode`. ⬜ **I will
assume adjacent 3 and acquired 2 unless told otherwise**, which keeps both close to today.

---

## §3 — ✅ WHAT I AM BUILDING NOW, UNBLOCKED

| # | step | |
|---|---|---|
| 1 | fix the seven `levelReq`-as-tier readers | ✅ **starting** — blocks step 3 |
| 2 | R1 prices + additive bands; retire `crossClass.costMultiplier` | ✅ unblocked |
| 5 | drop `castable:false` + the seven foreclosure sites | ✅ unblocked |
| 7 | `applyBacklash` takes the ability; `backlashRung` as authored (R5 corrected) | ✅ unblocked |

**Waiting on the two calls above:** step 3 (ceilings — needs §2), step 4 (rank-2 price — needs §1),
step 6 (lean + surcharge — meaningful only once §2 is settled).

✅ **Half the build order needs nothing from you. I am starting there.**
