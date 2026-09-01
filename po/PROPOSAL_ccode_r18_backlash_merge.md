# PROPOSAL — R18: one backlash, two triggers

**CCode → Erik, cc Aevi · 2026-09-01 · v1.9.299 · a proposal, not a build**

> R18: *"TWO BACKLASH SYSTEMS NOW EXIST AND MUST BE RECONCILED — CCode to propose the reconciliation…
> Erik has ruled the INPUTS (pool %, rank, intensity) — the merge shape is CCode's call to propose."*

---

## §1 — WHAT IS ACTUALLY THERE

| | trigger | chance | scales by | table |
|---|---|---|---|---|
| **surge backlash** | a failed/marginal roll **while surged** | 25% | ⛔ **TIER** | `intensity_scaling.surgeBacklashByTier` |
| **novel backlash** | a **critical failure** | 100% | ⛔ **RUNG** | `resolution.novel.backlashByRung` |

Measured as a share of the pool:

| event | L1 (30/100) | Silas L30 (191/282) |
|---|---|---|
| crit fail · damaging | 13% / 10% | ⛔ **2% / 4%** |
| crit fail · incapacitating | 23% / 14% | 4% / 5% |
| surge slip · tier 1 | 10% / 4% | 2% / 1% |
| surge slip · tier 5 | 40% / 14% | 6% / 5% |

⚠️ **The tier-5 row at L1 is unreachable** — R12 puts tier-V crafts at L48+. Worth saying, because it is the
scariest number in the table and nobody can ever meet it.

---

## §2 — ✅ THE PROPOSAL: ONE MAGNITUDE FUNCTION, TWO TRIGGERS

```
backlashHarm(ability, rank, intensity, character, rules):
    rung   = per-rank backlashRung from tree[]      ← R18's rank scaling (OI-20)
    pct    = backlashByRung[rung]                   ← { health: %, energy: % } of MAX POOL
    pct   ×= intensityMult[intensity]               ← 0.6 conserve / 1.0 standard / 1.6 surge
    pct   ×= trigger.multiplier                     ← what kind of failure this was
    harm   = round(pct × character.maxHealth | maxEnergy)
```

```
triggers:
  critFailure: { chance: 1.00, multiplier: 1.0 }    ← the craft turned on you outright
  surgedSlip:  { chance: 0.25, multiplier: 0.6 }    ← you pushed, and it bit
```

### ⛔ THE ONE REAL DECISION IN HERE: **TIER DROPS OUT**

**Surge backlash currently scales by tier. Under the merge it would scale by rung instead.** I am
proposing that deliberately, and it is the part most worth your disagreement:

- ✅ **`harmRung` already scales per rank**, and R18 confirms it — all 18 tier-1 `lethal` crafts reach lethal
  only at rank 3. So depth is already in the rung; tier would double-count it.
- ✅ **R5's whole principle is that the craft's OWN nature turns inward.** A craft that kills people damages
  you when it misfires. That is a statement about the craft, not about its price band.
- ⛔ **A high tier does not mean a harsh backlash.** `sustained_regard` is tier I with `harmRung: lethal`.
  Under tier-scaling it backlashes like a beginner's craft; under rung-scaling it backlashes like what it is.

⚠️ **What is lost:** an expensive tier-V craft with a mild authored backlash would bite less on a surge than
it does today. ⬜ **If you would rather keep a tier floor, it is one line** — `max(rungPct, tierPct)`. I did
not assume it, because it re-introduces the double-count.

---

## §3 — ⬜ WHAT I AM **NOT** DECIDING

**The percentages are Aevi's** (R18 assigns them). Structure only from me. For a worked example, using
R18's stated pitch — *"lethal ≈ a fifth of health and a third of energy"*:

| rung | health | energy | L1 (30/100) | Silas (191/282) |
|---|---|---|---|---|
| damaging | 7% | 11% | 2 / 11 | 13 / 31 |
| incapacitating | 13% | 22% | 4 / 22 | 25 / 62 |
| lethal | 20% | 33% | 6 / 33 | 38 / 93 |

⚠️ **Note what this fixes and what it costs.** At Silas's level a `damaging` backlash goes from **4 health
(2%)** to **13 health (7%)** — it stops being irrelevant. At level 1 it goes from **4 health (13%)** to
**2 (7%)** — it stops landing hardest on the weakest, which is R7's principle and Erik's repeated
correction. ⛔ **Both ends move in the right direction at once**, which is the argument for pool-relative.

---

## §4 — ⛔ WHAT BLOCKS IT

| | item | whose |
|---|---|---|
| ⛔ | **OI-20 — ~88 crafts need a per-rank `backlashRung` in `tree[]`.** Today it is a single flat top-level value, so the rank term has nothing to read. **The merge cannot scale by rank until this lands.** | Aevi |
| ⬜ | the percentage table (§3) | Aevi |
| ⬜ | tier-floor or no tier-floor (§2) | Erik |

✅ **The rest is mine and is small** — one function, one config shape, two call sites already passing the
ability after R5.

⚠️ **Sequencing:** I can build the merge with the rung term reading the flat top-level value it reads today,
so nothing waits on OI-20 — the rank scaling simply arrives when the authoring does. **That way the two
systems become one now, and get their depth later.** ⬜ Say the word and I will.
