# CCode → Aevi — the 09-29 tail: all nine closed · v2.16.6

*2026-10-01. Every item of `WORKORDER_aevi_20260929_close_the_tail.md` is built, measured and gated (§403–§406, plus
§359 rebuilt and §372, §387, §391, §179, §330 re-pointed). 32/32 suites green, 4,312 checks. Your four confirmed answers
are in too — patrolling merged, the craft picker relabelled, narrative grants left open, and item 10 is next.*

---

## The nine

| # | what | outcome |
|---|---|---|
| 1 | `supplyLineRule.on` | **on** — and your condition measured first |
| 2 | §391 re-pointed | **done** — your Ender Host line simulated against it |
| 3 | the peoples half of gate stigma | **built** on Erik's ruling |
| 4 | `seize_arch` + release by temper | **built**, driven on your own example |
| 5 | `chargePerPass` | **on** — and the dial had a second door |
| 6 | `trade.roadRoutRisk` | **0.35, and it clears your gate** |
| 7 | the wardens on the receipt | **built** — your two people read back |
| 8 | §359 on a stripped world | **done — and it found a defect in your ruling 1** |
| 9 | superseded places on the map | **fixed** — the third map tier |

---

## The three worth reading

### 6 · Your 0.35 is right, and the inversion was worse than suspected

Your gate, over 2,000 runs a cell, every escort size and danger 1–5:

```
  WITHOUT the cap            WITH 0.35
  danger  esc0  esc1  esc2   esc0  esc1  esc2
  3       5.00  0.00  0.40   5.00  6.50  8.82
  4       5.00  0.00  0.00   5.00  6.65  8.88
  5       5.00  0.00  0.00   5.00  6.67  8.70
```

At danger 3 with one guard, **nothing arrived** — against 5.00 of 20 with nobody at all. At danger 4–5 escorts of one
to three lost the whole load every time. A small escort is the easiest to wipe to the last, and a wipe takes
everything. **0.35 clears your gate at every cell without being lowered; the number stays yours.** `legionClash` is
untouched — a legion's soldiers do not get to run.

### 8 · The stripped fixture found a hole in your ruling 1

You were right that the gate measured how much of your world was done rather than whether the generator works. It runs
on 38 regions now instead of 15, and never moves again however much you author. **And widening it immediately found
something:**

> *"The match on more tags takes the seat, and a tie falls to the kind whose tags are rarer in the corpus."*

Those two criteria leave a **true tie** — where the comparator returns 0, and `Array.sort` is stable, so **declaration
order decided after all**, which is the exact thing your ruling exists to forbid. Over 38 regions, reordering the rules
keys moved **two of eighty-four seats**:

- `kestrels_roost` — guild ⇄ lordship
- `the_lensward` — outlaw_band ⇄ lordship

Your fifteen empty regions never reached either. I have added a third tie-break on the kind's own name: stable,
deterministic, and explicitly *not* the file's key order. ⬜ **It is deliberately arbitrary and a better third criterion
is yours to rule** — rarity of the kind in the corpus, or seat tier, or something about the ground.

⚠️ Two more gates were overfitted to the narrow fixture, and both contradicted their own prose. The city check asserted
*every* sovereignty sits on a preferred tag while its sentence says it is a preference (some regions have no city); the
specificity check pinned one first-found witness. Both now ask the rule: **no gang ever takes a holy site** (15 of 15
contested seats go to the order), and a region with no city still gets its government seated.

### 1 · Your condition, measured before the flip

**10 of 29** authored powers become lines — hollow king 5, lucifer 4, ninefold 1 — and **no region ends with more than
one line per Sovereign**, so the cap holds. The 19 refused: 16 match no hunger, 4 already carry somebody's freight, 2
are capped.

---

## ⛑ Five ways a measurement lied to me today

All five are the same family, and I think the pattern is worth your knowing:

1. **`chargePerPass` flipped and nothing moved**, three times running: the caravan read
   `rules.economy.markets.chargePerPass` *directly* and `economy.markets` is unauthored, so it saw `undefined` for ever
   and never met the default — **two bags for one dial**. Then my probe asked six place ids I had picked by hand and
   found one market; **the world holds fifteen**. Then `routeValue` turned out to take `days` as a parameter, and a
   fixture passing none measures every run at 0 days, where the two rules are identical *by construction*.
2. **The road table read 20.00 everywhere, then 5.00 everywhere** — `goods` where the engine takes from `load`, then
   `crew` where the escort comes from `carriers`. Both produced tables of identical numbers that agreed with whatever
   rule I might have written. The tool reports how many fights actually happened now, and §406 asserts that *before*
   reading any of them.
3. **Item 9 looked broken** on a JSON substring — the id appears inside another place's `connections`.

---

## Your four, applied

- **Patrolling merges like guarding** — ✅. It was in exactly the position guarding had been, as my own ⬜ note said:
  it reached only `workMods().watch` and promised eyes on the road nothing implemented. Measured the same way first —
  both cost 3 a pass, nobody in any of the 6 live holdings is on patrol — and reconcile **step 94** moves anyone a
  later save still carries.
- **The craft picker** — ✅ stays a hold-level action, now in *what you can do* and labelled
  *"Put a craft to the place — raises the place a rung, once per craft"*.
- **Narrative grants left open** — ✅ already the case; only `via: "built"` is refused.
- **C2 `draws: ["traders"]` on `market`** — noted, and it needs no engine change ahead of your content.

And I have taken the three stale items off my list, as you asked.

## Next

**Item 10 as you ruled it**: a hold's hands drawn as rows in *Who does what here*, and a **Split** control on a levy
that produces **unnamed** units — no name pool touched, not when split, not when posted. Then the map.

⬜ **One back to you:** the third tie-break in §8 above.

— CCode
