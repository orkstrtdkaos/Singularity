# SNG-419 — Sixteen frames, and the nesting question posed concretely

**Author:** Aevi (PO) · **Date:** 2026-08-10

---

## §1 — FOUR MORE, ALL CHOSEN FROM SAVE DATA

Grovehome, the Stillhold, Radiant Plateau Edge, and the Cogitarium's entrance hall.
**Corpus: 16 frames, 74 sites.**

⚠️ **I checked the duplicate-stack BEFORE authoring this time**, as I said I would. Two of the four were
stacked and it changed what I wrote:

- **`radiant_plateau_edge`** has `the-low-lamp-inn` at 0.00°. ⛔ **So the Inn is authored as a SITE of the
  Edge District, not a peer** — and its own seed already said so: *"tucked into the LOWER TIER of the Edge
  District where the light-guides run dim."* **Level −1, the one place there deliberately below the light.
  That is why people drink in it.**
- **`gen-cogitarium-entrance-hall`** is stacked with both the Cogitarium and the third terrace. See §2.

---

## §2 — ⛔ THE NESTING QUESTION, NOW A CONCRETE CASE

`gen-cogitarium-entrance-hall` is `tier: site`, parent `the_cogitarium`, **stacked at 0.00° with its
parent and its sibling, and it has NO connections of its own** — so `roadsOut` is empty, the same shape as
the Crossing.

**I authored it at a 60 m radius** — the smallest frame in the corpus by a factor of two and a half —
**with bearings measured FROM THE HALL, not from the Cogitarium.**

⛔ **THE QUESTION: does `localMap` nest?**
- **If yes**, a site's sites resolve inside the site's own frame, and this is correct as authored.
- **If no** — if the frame must always be the settlement — **these three rooms need re-expressing from the
  Cogitarium's centre and the metres get much larger.**

⚠️ **I would rather you answered before I author many more**, because the site tier is where the promoted
play-content lives and there are 17 of those.

**One placement in it is the interesting one:** `coghall_stair_up` — the way to the third terrace, on the
uphill bearing. ⛔ **It is the first placement that LINKS TWO SITES OF THE SAME PARENT**, and if nesting
works it should resolve as a route between frames rather than a point in one.

---

## §3 — THE THRESHOLD HELD AT SIXTEEN

| | relief |
|---|---|
| prose silent, uphill used | 0.104, 0.346, 0.541 |
| prose silent, uphill **not** used | 0.001, 0.002, 0.007, 0.010, 0.018, 0.025, 0.029, 0.050, 0.053 |

⛔ **Same clean boundary, 0.053–0.104, threshold 0.079.** Four new samples all landed below it and none
crossed. ⚠️ **A threshold that survives a 33% corpus increase without moving is worth trusting; the
0.053–0.541 bracket I refused to narrow at eight frames was the right call at the time.**

---

## §4 — TWO PLACEMENTS I WANT ON THE RECORD

⛔ **`stillhold_the_unasked` — "The Unasked Ground."** The seed says *"the stillness rests on something NO
ONE IS SAYING."* **Nobody wrote this place down and the city requires it:** there is somewhere the unsaid
thing is kept and everyone knows not to go. **Placed opposite the gate, which is where you put a thing you
are not discussing.**

⚠️ **`grovehome_patience_house`.** *"Patient in a way that reads as either profound hospitality or a very
slow trap."* It is where outsiders wait, on the road out — **and both readings stay available to them the
whole time they are waiting.**

**Levels now span −4 to +3 across the corpus**, and `road` and `prose` carry 53 of 74 placements.
