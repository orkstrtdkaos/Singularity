# SNG-196 — The augmented ceiling: 1.25

**Author:** Aevi (PO) · 2026-07-20 · **Erik RULED.** Outcomes; engineering is CCode's.
Closes the follow-on CCode flagged from SNG-193b and correctly declined to improvise.

---

# §1 — THE GAP THIS FIXES, AND IT IS NOT A TUNING NUDGE

`bandFactor` (substrate.js:144) **caps at 1.0**:

- a **pure** school has no band → `return 1` → **flat 1.0 at every density**
- an **augmented** school → 1.0 inside its band, less outside, floored at `materialFloor` 0.7

**So augmentation is currently strictly downside.** Pure is 1.0 always; augmented is 1.0 at best.
Erik's ruling was that material joined to inherent or lattice is *"amazing"* — and there was nowhere
for amazing to live, because the ceiling was the number the pure school already gets for free.

**Every school-choice in the game was therefore a trap dressed as a decision.**

# §2 — THE RULING

**An augmented craft reaches 1.25 in ground its extension agrees with.**

Break-even against a flat pure 1.0, with the 0.7 floor:

| ceiling | time at home needed to pay |
|---|---|
| 1.15 | ~67% |
| **1.25 ← RULED** | **~55%** |
| 1.35 | ~46% |

**Why 1.25 and not 1.15:** Erik — *"you will need those [off-source picks] if you journey to other
lands, which most eventually will."* If travel is the shape of this world (SNG-016: you leave to move
along an axis, and become more of what that axis makes), most characters sit BELOW 67% time at home.
**At 1.15 augmentation would be a trap that reads as an upgrade** — the worst kind of choice to offer.

At 1.25 the bet is honest and answerable both ways: **stay in your country and you are meaningfully
stronger than a pure practitioner; travel widely and you would have been better off plain.** It also
makes the material schools that travel — the Grave-Handed, the Hand-Built, the Ember-Kept, the
Bargainers — genuinely competitive rather than consolation picks.

# §3 — ⛔ THE IMPLEMENTATION CONSTRAINT THAT MATTERS

**The ceiling applies to the EXTENSION's contribution, not to the whole craft.**

The root still supplies 1.0; the extension adds **up to 0.25 on top** when the ground agrees.

**If the ceiling is applied to the whole factor instead, a lattice-ROOTED augmented school reaches
1.25 while carrying no material floor to pay for it — strictly better than everything, and the whole
bet collapses.** The 0.25 is what the extension buys, and it is paid for by the extension's band
being narrow and by the out-of-band loss the pure school never takes.

# §4 — INVARIANTS

1. **Pure stays flat 1.0.** *The pure never loses because it never leaned on anything* — the ceiling
   change must not touch it.
2. **`materialFloor` stays 0.7.** Floor and ceiling are the two halves of one bet; moving both makes
   neither legible.
3. **The bonus applies only INSIDE the extension's band** — not partially, on the way in. A craft
   either has the ground it wants or it does not.
4. **`crowdFloor` (0.6) and `gateBelow` (0.18) are untouched.** Interference from abundance is a
   different mechanism and is not part of this ruling.
5. **Un-schooled saves are unaffected** — no school means no extension means no ceiling, and the
   legacy per-tradition verdict resolves byte-identically. SNG-193b §5 Q3 already holds this line.

# §5 — VERIFICATION

Not a unit test alone. **The reading Erik should be able to get from creation (SNG-192 §4c) is
floor-and-ceiling in plain words:**

> *"You can always do this. In thin country you can do it better than anyone plain."*

If that sentence is not true of an augmented build after this ships, the number is wrong and not the
sentence.
