# CCode → Aevi — **somebody comes looking now.** The other half of the driven-NPC directive.

**v1.9.185 · 4,003 pass / 0 fail.** ⛔ **`engine/seeking.js`.** 10 gates, 4 mutations.

---

## §1 — WHAT WAS MISSING, EXACTLY

**CCODE-220 proved the directive fires for a person already in the scene.** ⛔ **Nothing put them there.**
The directive describes someone standing in front of you; there was no reason for them ever to walk up.

**Now there is.** Here is the tick, playing:

```
day  3   — nobody comes
day  8   Calvar (pressure 2.00, 7 days apart)
day 14   Calvar (pressure 3.71, 13 days apart)

world tick news →  "Calvar has been asking after you."
```

---

## §2 — ⛔ A CLOCK, NOT A QUEUE, AND THE DIFFERENCE IS THE WHOLE DESIGN

**A queue would hand the player a list of people to visit.** ⛔ **A clock means pressure builds while you
are APART and empties when you MEET** — so someone who wants something comes looking, and someone you saw
yesterday does not. **Gated both ways: it builds, and meeting them clears it.**

### ⛔ AND THE RATE READS THE MAGNITUDE OF THE RELATIONSHIP, NEVER ITS SIGN

| | patience |
|---|---|
| a neutral acquaintance with a want | **21 days** |
| an ally at +4 | 11 days |
| a devoted friend at +8 | **3 days** |
| ⛔ **a declared enemy at −8** | ⛔ **3 days** |

⚠️ **Someone who loves you and someone who cannot stand you are both impatient.** Keying on the signed
value would have made hostility a reason to stay away — **and "the rival who wants something from you"
is the better scene, so the model had to allow it.** In the harness run above, **Calvar at −7 arrives
before Pell at +5.**

---

## §3 — THREE GUARDS, EACH GATED

⛔ **1 · NO AUTHORED WANT, NO SEEKING.** 111 people are in the registry and 7 have interiority. If a bare
acquaintance could build pressure, **your seven would be lost in a stream of interruptions.** A stranger
at relationship 9 with no want never comes, at any distance, forever.

⛔ **2 · AT MOST ONE SEEKER AT A TIME.** *A world where four people find you the moment you rest is not a
world with relationships in it, it is a notification tray.* All seven qualify in the test; one arrives.

⚠️ **3 · BEING SOUGHT IS NOT BEING MET.** The tick READS the registry and marks nobody seen — otherwise
the arrival is spent without the scene ever happening, and the player is told someone came looking by a
system that has already decided they met.

---

## §4 — ⛔ THE LINE IS A PLACEHOLDER AND IT IS DELIBERATELY PLAIN

```
"{name} has been asking after you."
```

**That is engine prose and it should not survive contact with you.** `{name}` and `{want}` fill.

⚠️ **And it probably wants to vary by whether they like you** — the same clock brings a friend and an
enemy, and *"Calvar has been asking after you"* is a very different sentence depending on which. **The
placeholder is flat on purpose so it cannot be mistaken for authored copy.**

**Dials at `npc_interiority.seeking`:** `patienceDays` 21 · `patiencePerPoint` 2.5 · `patienceFloor` 3 ·
`maxSeekers` 1. **All yours to turn.**

---

## §5 — ⚠️ WHAT THIS MEANS FOR YOUR QUEUE

⛔ **Item 5 is now entirely yours and entirely unblocked.** The wire fires (CCODE-220), the reason to walk
up exists (this), and **every `wants` array you author turns one more of the 111 into someone who acts.**

**Seven people are alive in this sense. A hundred and four are not, and nothing between them and you is
engine work any more.**

---

## §6 — AND ONE ON MYSELF, IN NEW CODE, ON THE LESSON I HAD JUST WRITTEN DOWN TWICE

**I mutated the no-want guard to check the gate caught it. The suite THREW** — `wants[0]` on a null —
**and reported zero failures while deleting every gate after it.**

⛔ **That is the exact failure I described to you twice this week**, and I had written it into a file I
created an hour earlier. Made the accessor optional so a broken guard **fails a gate instead of killing
the run**; the mutation now goes red properly.

⚠️ **Knowing the lesson is not the same as having applied it.** The only reason I found it is that I
mutation-test everything now, including my own new files.

---

**Next from me:** nothing of yours is with me. **Erik's backlog items 1 (the wheel on the create screen)
and 7 (every content type generatable) are what I would take next** unless you have something.

— CCode
