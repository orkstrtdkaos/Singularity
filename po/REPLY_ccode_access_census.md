# REPLY — what the closed antipode actually costs, measured before you remove it

**CCode → Erik, cc Aevi · 2026-08-31 · v1.9.280 · `scripts/access_census.mjs`**

> Erik: *"we'll likely update the domain access model to eliminate a closed antipole and rework domain or
> pole access policies."*

✅ **That unblocks the reader** — the sect table is not what changes, so Phase A can land whenever you want it.
⚠️ **And it dissolves the Span problem** I raised: a domain holding both poles of one axis only bites because
the antipode is *closed*.

Before it goes, here is what it does. `domainAccess` is the rule that decides what a character may ever
learn, and until now its effect had been described in prose and never counted.

---

## §1 — THE NUMBERS

**412 crafts × 24 primary builds, measured at tier 3.**

| | |
|---|---|
| crafts a build loses to the closed antipode | **31.0 of 412 — 7.5% of the catalogue** |
| total denials per build, **with** the rule | **46.5** |
| total denials per build, **without** it | **15.5** |
| ⛔ **share of ALL denials the rule accounts for** | ⛔ **67%** |

The remaining 15.5 are **tier ceilings** — secondary tops out at 3, tertiary at 2, adjacent gets no
capstones. Those are a different mechanism and they are untouched by this.

---

## §2 — ⛔ THE RULE IS NOT EVEN-HANDED, AND THAT IS THE FINDING

| build | antipode | crafts closed |
|---|---|---|
| **stillhold** | marcher | ⛔ **50** |
| blazeborn | umbral | 40 |
| verist | veilwright | 40 |
| … | | |
| horizon | hourkeeper | 22 |
| umbral | blazeborn | 22 |
| **threnodist** | syllogist | ✅ **17** |

⛔ **A 33-craft spread — nearly threefold — between the most and least affected build.** Not by design: a
pole's antipode may be richly authored or thin, so the cost of the rule tracks *how much someone happened to
write for the people across the wheel from you*.

⚠️ **AN ACCESS RULE IS QUIETLY DOING BALANCE WORK,** and it is doing it by accident. Picking Stillhold costs
you three times what picking Threnodist costs, and nothing anywhere says so.

✅ **This is an argument for the rework independent of Span.**

---

## §3 — ✅ THE GOOD NEWS: THE MACHINERY FOR THE REPLACEMENT ALREADY EXISTS

Removing `closed` does not make the antipode **free**. Every craft it was shutting falls through to the
existing **`far`** band — allowed, at **penalty 3**, the cross-class multiplier that is already wired and
already in play.

⚠️ **So "eliminate the closed antipole" may need no new mechanism at all** — it is a deletion, and the thing
underneath it is the graduated cost you would probably have designed anyway. The counterfactual run
(`--noclosed`) shows exactly this: closed → 0, and everything lands in `far`.

⛔ **ONE THING TO DECIDE RATHER THAN INHERIT.** `far` is `steps <= 4 ? 2 : 3` — measured, the penalty is 2
out to 4 steps and **plateaus at 3 from 5 steps onward**. So under a straight deletion **your antipode (12
steps) costs exactly what a 5-step pole costs**, and every distance past 5 is priced identically. If the
antipode is meant to remain the hardest road, that band wants to keep scaling rather than flatten — a change
to one line, not a redesign.

---

## §4 — WHAT I DID NOT TOUCH

⬜ **Nothing.** This is a measurement, not a change. `scripts/access_census.mjs` runs against the **real
`domainAccess`** rather than a reimplementation of it — a second copy of the access rules, free to disagree
with the first, is the defect this project keeps paying for. The counterfactual asks the real function and
re-bands only what it answered `closed`.

**Re-run it after the rework and the delta is the answer:**

```bash
node scripts/access_census.mjs
```

```bash
node scripts/access_census.mjs --noclosed
```

⚠️ **`--primary umbral`** narrows it to one build if you want to look at a specific people.

---

## §5 — AND A SECOND CLOSURE THAT IS NOT THE ONE YOU NAMED

There are **two** closure mechanisms in `domainAccess`, and only one of them is the antipode rule:

- **`closed`** — build-time, the antipode of your primary or secondary. **This is the one going.**
- **`foreclosed`** (SNG-101) — a pole you committed against *in play* by promoting its opposite. ⚠️ **It has
  a braid exemption; `closed` does not need one because a braid's tradition is `cross_pole_braid`, so it
  never matches an antipode in the first place.**

✅ **Measured: `foreclosed` fires 0 times across all 24 builds today**, because it depends on in-play
promotions that a fresh build has none of. ⬜ **It is untouched by removing `closed` — worth saying out loud
so it does not get removed by association, or left behind by oversight.**
