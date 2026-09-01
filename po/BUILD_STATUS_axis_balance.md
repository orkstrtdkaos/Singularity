# BUILD STATUS — R1–R19 · every ruled step is built

**CCode → Erik, cc Aevi · 2026-09-01 · v1.9.299 · 27 suites · 24 green / 3 red (the baseline) at every commit**

| # | step | ruling | state |
|---|---|---|---|
| 1 | `levelReq`-as-tier readers | CCODE-340/341 | ✅ `5d6e6054`, `11dad97c` · §35 |
| 2 | additive prices, compressed ladder | R1 | ✅ `e8a6daa6` · §36 |
| 3 | tier ceilings, antipode by lean | R10, R16 | ✅ `aa763f4e` · §32 |
| 4 | train-to-rank-2, gated by tier access | R17, R19 | ✅ `7916f7a9` · §38 |
| 5 | seven foreclosure sites removed | R9/R16 | ✅ `aa763f4e` |
| 6 | lean + antipode surcharge | R9 | ✅ `aa763f4e` |
| 7 | `applyBacklash` takes the ability | R5 corrected | ✅ `3bd76dd2` · §37 |
| — | unlock curve, top level 60, L1 visibility | R12, R13, R15 | ✅ `7b5bee03` · §38 |
| 8 | tomes | — | ⬜ needs authored content |
| — | backlash merge | R18 | ⬜ **proposed, not built** — `PROPOSAL_ccode_r18_backlash_merge.md` |

---

## ⛔ THE ONE THING I WOULD FIX FIRST: R19 AND R12 COLLIDE AT THE LEVEL BEING PLAYED

R19 gates training on tier N+2 opening. R12 decided where those bands sit. Composed:

| craft tier | trainable from |
|---|---|
| T1 | **L21** · T2 **L35** · T3 **L48** · T4/T5 never (OI-21) |

⛔ **Silas is L30 and can train tier-1 crafts only — about 36% of a shelf.** R17's entire case for cheap
training was his **31 stuck rank-1 crafts**. ⚠️ **Neither ruling is wrong; the band placement collides.**
⬜ Cheapest fix: move R19's gate down a tier (T1 trainable when T2 opens, L8). Keeps "perspective before
depth", lands inside the levels being played.

---

## ⛔ OPEN, AND NOT MINE

| | item | whose |
|---|---|---|
| ⛔ | **`rankUpAbility` has no UI caller.** `app.js` imports it and never calls it. The engine is built and gated; **until app.js calls it, training is unreachable in play.** The fourth door — naming it rather than letting a green suite imply otherwise. | mine, but it is UI work worth scheduling deliberately |
| ⛔ | **OI-19 — thin domains.** Life has **3** tier-1 crafts, Spirit 4, Angelic 5, Demonic 5. R3 needs a forced sense pick plus a curated pool of 4–5. **Blocks creation being playable for four domains.** | Aevi |
| ⛔ | **OI-20 — ~88 crafts need per-rank `backlashRung` in `tree[]`.** Today it is one flat top-level value, so R18's rank term has nothing to read. | Aevi |
| ⬜ | R18 percentage table, and tier-floor or not | Aevi / Erik |
| ⬜ | OI-21 — should any T4/T5 craft be trainable at all? | Erik |

---

## ⚠️ SHAPES THAT FELL OUT OF THE BUILD — worth knowing before play

| | |
|---|---|
| **The bands overlap at their edges.** The priciest tier-II craft (`energyCost` 10) lands at L20; the cheapest tier-III at L21. Tier and arrival order are no longer the same ordering. I believe that is correct — a dear T2 *is* comparable to a cheap T3 — but it is visible. |
| **`energyCost` spreads only as finely as it varies.** Tier II has 116 crafts across ~10 distinct costs; **58 share cost 4** and arrive together. Six arrival levels, not thirteen. A finer curve needs a **second real signal** — I will not invent a meaningless tiebreaker to flatten a graph. |
| **`minAxisWeight` is a hard floor, not a ramp.** Crossing 20 with even weights jumps the antipode ceiling from 2 to 5 in one level. Chosen for simplicity and conservatism; a ramp is one line. |
| **A specialist cannot open the far pole at depth.** They start at tier 1–2 and must carry ~5 of those crafts before tier 3 appears there. That is R9's "barrier to dabbling, not to crossing" made true of depth as well as price. |

---

## ⚠️ WHAT THE BUILD CAUGHT THAT NOBODY ASKED FOR

**Eleven gates were defending rules their own author had already retired** — §32, and ten in `smoke`
(five foreclosure, five "cannot be cast"). All **rewritten to assert the new rule**, never deleted, so the
coverage survives. ⛔ **They only surface by running.** A ruling that replaces a mechanism leaves a trail of
green gates behind it, and green is exactly what makes them invisible.

**One of them was right, and caught a hole in R16.** `CCODE-224` warned: *"if this ever passes with
`castable !== false`, a character can begin able to use both ends of their axis."* It did. `lean` is a
ratio, so a level-1 character with one craft each side measured as **perfectly balanced** — full parity, at
creation. That is what `minAxisWeight` exists for.

**And four of my own defects**, each caught by something other than my own claim:
- my step-1 sweep was incomplete **three times** — a narrow pattern, then a hand-listed file range, then a
  syntactic shape instead of the semantic role (`levelReq` handed to a *tier parameter*, including the main
  learn gate). Fixed by making `domainAccess` derive its own tier: a caller that cannot restate a fact
  cannot restate it wrongly.
- my band lookup defaulted an unmapped band to `far`, **silently overcharging** — and `band` has two owners
  in this codebase (domain bands and people-standing bands).
- I placed the rank-3 refusal *after* the attribute gate, so it blamed the attribute — and a test then
  **passed for the wrong reason** by matching "rank 3" in the wrong message.
- I read a truncated suite capture as a green verdict. The push ratchet caught what my own check could not.
