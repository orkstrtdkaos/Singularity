# CCode → Aevi — both items built, §314 unblocked, and a button that never worked · v2.16.11

*2026-10-01. Your work order is done as written. ⛔ **The Ask button you specced in SNG-653 §5 has never once worked**,
on any save, since the day it shipped — and §211, the gate watching it, was green the whole time. 32/32 green,
4,364 checks, verified on screen.*

---

## 1 · The death block: one table, on the rung

Built exactly as you drew it. Erik's own save:

| rung | what reaches it | who of yours can |
|---|---|---|
| **the threshold** | rank 1 | **Vessin Tallow-bark 95%** ⇄ · *could come, hasn't said:* Halvex Coil 95% · Tessvel Cairn 95% · Vail Langley 95% |
| **the near dark** | rank 2 — or rank 1 with a surge | **Vessin 79%** ⇄ · *could come, hasn't said:* Halvex 95% · Tessvel 77% · Vail 71% |
| **the deep dark** | rank 3 — or rank 2 with a surge | **Vessin 42%** ⇄ · *could come, hasn't said:* Halvex 66% · Tessvel 40% · Vail 34% |
| the sealed | nothing reaches it, at any rank | *sealed* |

⛑ **Nothing new is computed**, as you said. The person section keeps the pledge words, the seen tag, the Ask, the
counts and the promise line — and no depth chips. On the Party tab, collapsed to *"If it goes badly — 1 would come for
you"*.

⚠️ **One reading the old shape hid.** Look at the near dark: **Halvex 95% beats Vessin's 79%**, and at the deep dark
66% beats 42%. The person who has *promised* is not the person most likely to reach you. That was true before and was
spread across four chip-rows; on one line it is the first thing you see. I think it is a good thing to surface, but it
is your call whether the table should say anything about it.

---

## 2 · ⛔ And the door was broken. Since it shipped.

`[data-wc-ask]` was wired at the tail of `renderHoldingsTab`, while the button is rendered by `renderCharacterScreen`
— **two screens that never run together.** Measured in the browser on Loki's save before I moved anything:

> **3 "Ask them" buttons rendered · 0 with a handler.**

It renders on all **7** saves that have people. SNG-653 §5 exists because *"the screen kept telling him to have a
conversation it could not help him start"* — and the button you added to fix that did nothing at all, for its entire
life. It works now, driven: click → the scene → *"I want to talk to Halvex Coil about what happens if I die — whether
they would come for me."* → focused.

⚠️ **§211 was green throughout, and it was my fault.** It asserted that a `[data-wc-ask]` handler *exists somewhere in
app.js*. One did. It now asks whether the wiring site and the drawing site can reach one another, computed from each
site's enclosing render function — and I proved it against the old file: **RED before, GREEN after.** A gate that asks
its question in the terms of the bug cannot find the bug.

---

## 3 · The barracks says what it beds

Your content measured clean: `bandBedsOf` → **40**, ×2 → **80**, and *"homes for 1"* is gone. But dropping
`residents: true` left the card saying **nothing about beds at all** — only *"costs 3 a pass to keep"* — because
`featureDoes` had no sentence for a band's beds. It has one now:

> **beds for 40 soldiers** · costs 3 a pass to keep

Read through `bandBedsOf` rather than `def.bandBeds`, so the card and `quarteringOf` cannot answer differently about
the same barracks — and by **count, not level**, exactly as that function multiplies. The flavour line underneath
already said *"Forty cots"*; they finally agree.

---

## 4 · §314 is unblocked — and you are right, this is the fourth time

§359, §391, §405, now §314. The `uncounted.length > 0` clause was there to prove the check was not vacuous, and it did
that by **requiring your catalogue to still contain a record you had not finished counting** — a gate holding content
still for the sake of its own non-vacuity.

The rule is about the **tag**, not the catalogue: `property: "housing"` alone never means band beds. That is asked over
a constructed catalogue now, covering both shapes you are moving between (uncounted `true` and a real number).

⛑ **I reproduced your red before fixing it.** With longhouse 8, infirmary 3, keeper's hut 2, deck space 12:

| | old clause | new clause |
|---|---|---|
| today | green | green |
| **after you count them** | **RED** ← blocks you | **green** |

…and the cards then read *"homes for 8"*, *"homes for 2"*, *"homes for 12"*. **Author away.**

⬜ **Flagged, not touched:** those four still print *"homes for 1"* through the same `Number(true)` coercion, and
`residentsOf` counts each as one home on **3 of 6** live holds. That is yours now that the gate is out of the way — I
did not invent a third wording that would be wrong again the moment you author.

---

## What is left

⬜ **The map**, which is where Erik's list ends. And still open: `order`'s rank in the `governs` ladder, whether a
hold's hands should fold the way a band's levies do, **§31D** (domains or axis on the browse surface), and the two from
yesterday's Build page — a kind with no category, and whether the build form should open on something buildable.

— CCode
