# HANDOFF — the casualty pool needs a ruling, and two of my three "interface gaps" were false

**CCode → Erik and Aevi · v1.9.258 · `scripts/casualty_sim.mjs` · `tests/taunt_wiring.mjs`**

---

## §1 — ⛔ ERIK, I OWE YOU A CORRECTION BEFORE THE BUILD

**You approved a target affordance on the strength of a list I had not measured.** ⚠️ **Two of its three
items were false, and I had written them into three documents and gated them.**

| I claimed | ⛔ what is actually true |
|---|---|
| `bringForward` has no pick | ✅ **FALSE.** It has had a full picker since **CCODE-276** — tap a companion's name in a fight and they swap forward; it persists between rounds |
| `provoke` cannot name a target | ✅ **FALSE.** It needs no pick — provoke makes **you** the thing they want |
| a named-ally intercept picks for you | ⬜ **TRUE, and still open** — blocked on Aevi's `interceptCondition` spec |

⛔ **SO I DID NOT BUILD THE GENERAL AFFORDANCE.** With one case left and that one blocked, the module would
have been **a reader with no caller** — `testOnlyExports`, the exact defect I spend my time finding in other
people's work. **I wrote it, then deleted it rather than ship it.** ✅ **The shape is recorded for when
Aevi's spec lands, and the ruling still stands — it just has one case, not three.**

⚠️ **The lesson is one already written in `FIELD_REFERENCE §11`: a review MEASURES, it does not agree.**
I inherited a plausible list and agreed with it. ⛔ **A gate on an unmeasured claim does not make it true —
it makes it durable.**

---

## §2 — ✅ BUT MEASURING IT FOUND A REAL DEFECT, AND A BETTER ONE

**`provoke`'s taunt was computed every time and thrown on the floor.**

- `chooseTarget` has implemented the taunt override since **CCODE-256**, with a written rationale about why
  it outranks concealment.
- `resolveProvoke` has produced `taunted: {targetId, rounds}` since the same ticket.
- ⛔ **Nothing ever connected them.** The value was spread into a **receipt** and the consumer was called
  without the argument. **Both halves green, live path using neither — a wiring gap, not a module gap.**

⚠️ **AND A SECOND TRAP UNDERNEATH.** `resolveProvoke` defaulted its taunter to the literal string
`"player"`; `chooseTarget` resolves by `a.id === targetId`; a real save's id is `char-…`. ⛔ **It could
never have matched even once the wiring existed** — the exact trap `CCODE-261` names two hundred lines
above the call site.

✅ **Both fixed. `tests/taunt_wiring.mjs` asserts across two REAL rounds where the blow actually lands**,
because testing the halves apart passes today and passed before the fix. **Both bugs proven to make it go
red independently.** ⚠️ Three of my own vacuous checks were caught by its own non-vacuity floors first —
including one that read a field `battleRound` does not return, and so could never have failed.

**Erik: provoking now does something. Until this build it read as though it did nothing, and it did.**

---

## §3 — ⛔ THE CASUALTY POOL: IT IS OUT OF RANGE, NOT UNDER-TUNED

**You asked for simulation before structure. Here is what the simulation says, and it is not a tuning
problem.** Run it yourself: `node scripts/casualty_sim.mjs`

**Two curves, written next to each other for the first time:**

```
health = level × 2                    (combatants.js:186)
pool   = perFoldedAlly × K            (skill_battle.js — mentions no level at all)
share  = (pool × maxSharePer) × (0.5 … 1.0)
a fall requires  share ≥ health
```

⛔ **SO THE MECHANIC HAS A HARD WINDOW, AND IT IS A FACTOR OF TWO WIDE:**

- **below `pool = 2 × health`** — nobody can fall, ever, at any roll
- **above `pool = 4 × health`** — everyone the pool reaches falls

⚠️ **THE SHIPPED POOL IS IN RANGE FOR EXACTLY ONE LEVEL.** At level 1 the fold is slaughtered (100%); by
level 3 nothing can ever happen again, permanently. ⛔ **No value of `perFoldedAlly` repairs that, because
a constant cannot track a curve.**

✅ **AND IT IS NOT THE √K COMPRESSION** — which is what I expected to find. `predictAggregate` compresses
the *spread* by √K and leaves the mean linear, which is correct.

**Make the pool proportional to health and the rate gets a closed form: a fall needs `r ≥ 4/BASE − 1`,
where `BASE = pool ÷ health`. ⛔ HEALTH CANCELS.** That is precisely why proportionality is the fix.

---

## §4 — ⛔ FOUR QUESTIONS FOR YOU, ERIK — NOT ONE

1. **Should the pool be PROPORTIONAL TO HEALTH?** ⚠️ Without this, nothing else matters.
2. **Where should an EVEN fight sit in the band?** `BASE 2.0` ≈ occasional and usually a single loss ·
   `2.4` ≈ expect to lose someone · `2.6+` ≈ the line breaks.
3. **Should THREAT move it, and how far?** ⚠️ **There is only room for about `0.9× … 1.3×`** — the whole
   usable band is 2.0–3.5, so a big tier multiplier pushes straight off both ends.
4. ⛔ **Should the share range widen?** Today one ally's share spans only `cap/2 … cap`, and *that* 2:1 is
   what makes the cliff steep. Widening softens it — ⚠️ **but less than I expected: 75%→60%, 98%→86%.
   Reported as measured rather than as the cleaner story.** It also makes losses lumpier, which is a
   fiction choice as much as a maths one.

⚠️ **ONE WARNING: `maxSharePer` AND THE POOL ARE NOT INDEPENDENT.** Raising the cap is another way to cross
the 2× threshold. **They have to be ruled on together or one will silently undo the other.**

---

## §5 — ALSO DONE

- ✅ **`atlas_inject` now owns the summary row** Aevi caught it leaving by hand — *"three different READ
  counts after one field was added."* ⛔ **A generator that regenerates half of what it owns is the
  stored-copy failure wearing a tool's name.** First run corrected READ 83 → 84.
- ✅ **v1.9.257** — the EXESA title change moved `index.html` without a bump and `wiring_audit` caught it.

**`how_it_works` 183 → 185 · 25 suites · no regression.**

— CCode
