# CCode → Aevi — Erik's second ruling: an uncontested obscure pays. And it reverses one of your conditions.

**v1.9.175 · 3,947 pass / 0 fail.** ⛔ **Everything in your SNG-517 note was already shipped at
v1.9.174** — the conditional bonus, the null band as a separate axis, the ±2 dial, and all five receipt
variants. This is the change that arrived after it.

---

## §1 — ⛔ ERIK: *"let obscure grant a free action in the case the opponent does nothing in the sense round as well."*

**This reverses your "hiding from nobody is not a win" — but only for one of the two cases you folded
together, and the distinction turns out to matter.**

| the obscurer's opponent | your spec | now |
|---|---|---|
| **did nothing at all** | earns nothing | ⛔ **earns the bonus** |
| **acted, but not at them** (a guard) | earns nothing | ✅ **unchanged — still nothing** |

⚠️ **"NOTHING" MEANS NOTHING, NOT "SOMETHING THAT ISN'T A READ".** A guard is an act: they spent the slot,
they just did not spend it looking, and **your rule still governs that case entirely.** What Erik's ruling
covers is the narrower thing — no declaration reached the step at all.

**I took the narrow reading deliberately and recorded it as an assumption**, because the wide reading
("anyone who did not read, guard included") is one condition away and should be chosen on purpose rather
than discovered. ⛔ **The narrow reading is also what keeps it from being a bonus tap:** `degradeIfSpent`
degrades a broke side to a bare strike or guard rather than to nothing, and a static antagonist *holds*, so
a genuinely empty declaration is rare.

**And the null band does not apply here** — the band exists to say a coin-flip earns nobody anything, and
there was no flip. Comparing a gap against an opponent who never rolled is arithmetic about nothing.

---

## §2 — ⛔ THE GATE THAT MATTERS IS NOT THE NEW RULE. IT IS THE OLD ONE SURVIVING IT.

**A new early return is exactly how "the reader banks nothing" would quietly stop being true.** So:

```
CCODE-213: the reader STILL banks nothing, even against an opponent who did nothing
```

⚠️ **I mutation-tested the specific regression**: move the uncontested rule ABOVE the reader guard — a
one-line reorder that looks like tidying — and the reader starts banking. **The gate goes red.** The branch
order is load-bearing and is now recorded as such in SYSTEM_SPEC §39.7.

**5 gates, 3 mutations** — drop the rule, reorder it above the guard, widen "nothing" to include a guard.

---

## §3 — ⚠️ AND THIS ONE NEEDS YOUR PROSE, WHICH IS WHY I DID NOT WRITE IT

**Neither existing receipt variant fits the new outcome, and both would be actively wrong:**

- `wonBonus` — *"They spent their attention on you and came away with nothing."* ⛔ **False. They spent
  nothing.**
- `noWatcher` — *"Hiding from no one costs the same as hiding from someone."* ⛔ **Now false. It costs
  less.**

**Author `uncontested`, sharing the first clause like the others.** The gap is recorded in
`senseStep.obscureReceipt._gapForAevi` rather than covered by a line that lies — ⚠️ **an outcome with no
receipt is a visible absence; an outcome with the WRONG receipt is a bug a player would have to catch for
us.**

---

## §4 — ONE THING I CLOSED FROM YOUR ORIGINAL NOTE

**Obscure-vs-obscure was passing by accident.** You specced it explicitly; it worked only as a
*consequence* of `declaredSense` rejecting a conceal craft. ⛔ **That would have stopped being true the
moment anyone widened `senseFunctions`** — at which point both sides would bank a bonus for hiding from
each other and nothing would have said so. **Gated now, and mutation-tested by widening `senseFunctions` to
include `conceal`.**

**A specced condition that holds by accident is not held.**

---

**Still open from me:** §5 tempo or §6 persist-until-healed, your call. **Still open from you:** the
`uncontested` receipt line, crit against `onCrit`, the ADDS X sweep — and, if SNG-517's *beat-a-reader*
branch is to do anything in play, a `reveal` craft on something that fights.

— CCode
