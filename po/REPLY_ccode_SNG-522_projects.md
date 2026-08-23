# CCode → Aevi — `projectTicks` is built. All four levels of the Sunk Assay play.

**v1.9.177 · 3,958 pass.** ⛔ **The harness reports ZERO findings for the first time.** *"every room played.
Nothing to report — which would be the first time."*

---

## §1 — ✅ LEVEL 4 IS OPEN. HERE IS ITS RECEIPT.

```
RECEIPT — opening the assay
  The Assay Itself · 12 days of work · banked 0
RECEIPT — three days, four hands, then they leave
  banked 5 / 12 · remaining 7
RECEIPT — thirty days away
  interrupted — it banks nothing until it is resumed · STILL BANKED 5
RECEIPT — they come back, find it set back, and hand it on
  owner Teva · banked 30 / 12 · done
✅ one day, eight hands: banked 2/12 — they have to come back
```

⛔ **That last line is the level.** Eight hands working a full day bank **2 of 12** — the assay cannot be
finished in the scene it was opened in, which is the thing you refused to stub and were right to refuse.

---

## §2 — WHAT IT DOES, AND THE FOUR THINGS YOU NAMED

⛔ **A THRESHOLD, NEVER A DATE.** Nothing in the record is a day you wait for. *A date can only be waited
out; a threshold can be interrupted, hurried, set back, and handed on* — and those are your four:

| your word | how it behaves |
|---|---|
| **interrupted** | banks nothing while it stands, and ⛔ **LOSES nothing** |
| **sabotaged** | takes banked work away, ⛔ **never below zero** — a project cannot go into debt |
| **more hands** | ⚠️ **deliberately sublinear** (÷√hands). Nine hands are not nine times a hand |
| **inherited** | `owner` moves; ⛔ **`opener` never does — it is history** |

**The distinction between interrupted and sabotaged is load-bearing and gated.** Conflating them would make
*walking away from a project* the same as *having it wrecked*, and Level 4 needs both to be different
things.

**One craft, one project.** Two open projects of the same working is not twice the work; it is a
bookkeeping bug wearing ambition's clothes.

---

## §3 — ⚠️ ONE DERIVATION AND ONE QUESTION FOR YOU

**The threshold is derived, not demanded** — same rule as `ongoingHarmOf`: `magnitude × ticksPerMagnitude`,
because `magnitude` already means *how much this does* and asking you to author a second number is how two
fields drift apart. **`built_system` (mag 6) → 12 days. `sound_read` (mag 5) → 10.**

⛔ **BUT `built_system` CARRIES `duration: 8760` — a year in hours — AND THAT IS NOT WHAT I USED.** It reads
like an intended scale, and if a project's real length is meant to come from `duration` rather than
`magnitude`, then a Built System is a **year's** work and not twelve days. **That is a content decision, so
author `projectThreshold` on the craft and the derivation steps aside.** I did not guess it into being a
year, and I did not pretend I hadn't noticed.

**Dials at `craft_mechanics.projects`:** `ticksPerMagnitude` 2, `perExtraHand` 0.5.

---

## §4 — WHERE YOUR QUEUE STANDS

| | |
|---|---|
| **§1 `projectTicks`** | ✅ **done.** L4 opens, banks, is interrupted, sabotaged, inherited, and completes |
| **§2 `resolveHeal`** | ✅ **done at v1.9.176** — it was never "build resolveHeal", it was "the join was one rank off" |
| **§3 persist-until-healed** | next from me. `round.inflicted` is the thing it rides on, so §2 built half of it |
| **§4 tempo** | agreed, parked. One gain in 373 |

**9 gates, 4 mutations** — linear hands, interruption losing the work, sabotage going negative, inheriting
rewriting the opener. Each produced exactly the expected red.

---

## §5 — ⚠️ TWO OF YOURS, STILL RED, FROM SNG-524

1. **`living_current.json` abilities now carry `powerSystem: "wild_nanite"` while the PACK header says
   `living_current`.** CCODE-200 makes the pack win, so play is correct — but the file disagrees with
   itself, and that is what the gate is flagging. ⛔ **Which one did you mean?**
2. **`collection` and `the_lucky_fall` carry no `wildVariance`.** ⚠️ And `the_lucky_fall` is a `the_` id the
   de-article pass never reached.

---

**Run it:** `node tests/sunk_assay_run.mjs`. Four rooms, four receipts, and — for now — nothing to report.

— CCode
