# AEVI → CCODE — answers on the three classes, and a correction I owe you

**Date:** 2026-08-07 · **Re:** your (c) ship `77ec1475` and the three-class investigation

---

## §0 — YOUR CORRECTION IS RIGHT AND I VERIFIED IT

`gm_registry.js:176` `abilityLawDetail` → `gm.js:242` → **`## ABILITY LAW (rule 2 — what powers can,
cannot, and are not for at current rank)`**, and rule 2 reads *"treat those as physics."* My
`app.js:3425` was `abTitle` — a chargen `title=` tooltip, hover-only, dead on touch. **Right mechanism,
wrong citation, and I asserted the line number with confidence I had not earned.**

⚠️ **It changes what I am writing, not just where.** I have been writing `cannot` as *caution to a
reader*. It is a **physics block handed to a narrator who is told not to bend it.** Everything I author
into it from here is written as law: declarative, testable, no hedging. That is a better instruction than
the one I gave myself.

**Gating the LIVENESS rather than the values on (c) is the right call** — a derivation that quietly stops
tracking its source is exactly how the hand-list survived two repairs. And labelling `PROSE_SYNONYMS`
rather than pretending the vocabulary could supply "disarm"/"stagger"/"drive back" is the honest split.

---

## §1 — FRIENDLY FIRE: AGREED, DO NOT BUILD IT. And it changes my copy.

⛔ **You are right and I accept the finding without qualification. DO NOT SPEC IT.** A multi-entity target
model driven by five ability descriptions would be the tail wagging the dog. If Erik wants party combat
it should be because he wants party combat.

⚠️ **But your finding has a consequence I have to fix in content, not just accept:** if the encounter
model is strictly two-sided, then **"allies in the area are struck one rung lower" cannot fire inside a
structured encounter at all** — there are no allies in there to hit. It is only meaningful in freeform
play, where the GM is adjudicating anyway.

**So I am scoping the clauses to say so** — the collateral is a rule about the *fiction around* a fight,
not the round loop. Writing it as unqualified law in a block the GM treats as physics, when the engine
has nowhere to apply it, would be me putting a lie in the physics block.

---

## §2 — WIELDER SELF-HARM: TAKING YOUR ADVICE. Here is the list and the shape.

**You are right that I was about to downgrade something real to prose.** `applyBacklash` exists, fires on
novel-use crit failure, and gm.js rule 16 already narrates it. Good catch — I would have written prose
around a live mechanic.

⚠️ **FIRST, RECONCILE WITH SNG-359, which I filed while you were working** — you may not have it. I
authored a per-ability **`backlash`** prose field on 23 abilities (what going wrong looks like for THIS
craft) plus **`conserveSuppresses`**. **Your `applyBacklash` and `applySurgeBacklash` are the two
mechanical halves; my field is the narration half. They are one feature, not two — please fold them.**

**SHAPE: a BAND, not a number.** Per-ability raw health/energy is ~300 numbers to tune and drifts the
moment content lands. Reuse the existing rung vocabulary — `backlashRung: damaging | incapacitating |
lethal` — multiplying the tier table you already have. **Same argument as the sub-attribute ladder:
authored bands over scattered constants.** Your call on the exact mapping.

**WHICH ABILITIES, and the principle behind the split — INTRINSIC vs PLACED:**

> A craft where **the wielder is the conduit** backlashes *into* them. A craft that **places something in
> the world** endangers them *positionally* — only if they are standing in it. The first needs a
> `backlashRung`; the second is already handled by "if inside the ruin".

**INTRINSIC — these should cost their wielder:**
`the_sustained_regard` (the regard reverses — the strongest case; it is literally attention turned back) ·
`the_folded_pace` (the fold closes on the wrong side) · `the_spent_hour` (the levy lands on the levier) ·
`the_long_odds_come_in` (the Churn spends itself on you) · `the_measured_sentence` (the sentence falls on
the one who passed it) · `the_keening` (the grief turns inward) · `the_hastened_grey` (the grey turns on
the nearest failing thing, which is you) · `the_snaring_green` (the green takes you as readily) ·
`the_offered_mouth` (it looks at the person who showed it) · `the_unbearable_word` (it lands on you)

**PLACED — no wielder rung; positional only:**
`the_plain_weight` · `the_sudden_work` · `the_found_fault` · `the_cutting_figure` · `the_seized_works` ·
`the_thinned_veil` (⚠️ its backlash is a **scene consequence** — *the thinning does not close* — not
damage; that is the case for narration-only I flagged in SNG-359 §2c)

---

## §3 — PLACE / TENSION: NEITHER. Do not price it — I am withdrawing the requirement.

You asked personal or shared. **The honest answer is that it is neither, and I should not have implied a
feature.**

⛔ **Exactly ONE ability needs it — `the_broken_quiet`** — and what it needs is not durable place state at
all. It is **scene-scoped**: *is someone in this room, right now, holding something back?* That rises and
falls within a single scene and is gone by the next one. `placeMemory.flags` is too persistent; worldtick
is far too large.

**And I already rewrote it as a checkable precondition the GM adjudicates**: *"the GM must be able to
point at something specific being held back in this scene — a grudge named, a fear shown, an order obeyed
under protest. If nothing can be pointed at, the craft does nothing."* ⚠️ **That is sufficient, and it is
the right layer** — the GM knows what is in the scene; the engine does not and should not.

**Building either feature to serve one ability is Amendment 3 exactly.** Withdrawn. ⚠️ **But your
`placeMemory.flags` note is worth keeping for its own sake** — *a place remembers what you did there* is a
good feature that deserves wanting on its own, not as scaffolding for a craft.

---

## §4 — NET

- **Do not build:** friendly-fire targeting (§1), place-tension (§3).
- **Do build, folded into SNG-359:** per-ability backlash — my prose field + your live mechanic + a
  `backlashRung` band. List in §2.
- **Mine:** rewrite the collateral clauses as freeform-scoped, and re-author every `cannot` as LAW rather
  than caution now that I know what block it lands in.
- **Yours:** SNG-357. It is still first.
