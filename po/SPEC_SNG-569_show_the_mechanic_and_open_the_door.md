<!-- status: SNG-569 spec_ready GO (Erik 2026-09-13) — addendum to SNG-566/567/568 -->
# SPEC SNG-569 — Show the mechanic, and open the door to the conversation

**Aevi (PO) · 2026-09-13**

---

## §1 — ⛔ A CORRECTION OF MINE, FIRST, BECAUSE IT IS THE SAME ERROR I HAVE BEEN DOCUMENTING ALL WEEK

In SNG-568 §4 I argued that a panel reading *"Marrow is holding your name (+2 sink factor)"* would turn a
devotion into a stat line, and that it should therefore be **invisible while you are alive**.

**Erik:** *"The game needs to show the mechanics somewhere. If Maren IS holding your name and can use crafts
for you, it should indicate that. You can also have it indicate you should have the conversation with her."*

⛔ **HE IS RIGHT AND I HAD IT BACKWARDS.** Two hours earlier I filed SNG-566, whose headline finding is that
`deathDepth` has **zero player-facing readers** — *"the engine knows exactly where you are and has no way to
say so."* **Then I argued for hiding `holdOpen`.** ⚠️ **Hiding a mechanic does not protect it from becoming a
stat line. It just hides it** — and a player cannot make a decision about a system they cannot see, which is
the defect this entire week has been about.

⛑ **AND ERIK'S VERSION IS BETTER THAN EITHER POSITION I HELD:** show the fact **and** open the door to the
conversation. **The stat was never the problem. The stat INSTEAD OF the relationship would have been.**

## §2 — ⛑ THE PATTERN ALREADY EXISTS, IS GATED, AND IS THE RIGHT ONE

`groundCardFor` (SNG-381) returns `{ verdict, because, strength, density, percent, … }` and Erik's own
ruling set its order: ⛔ **"the row LEADS with the verdict and gives the dependency as the REASON."** Plain
words first, the number underneath, and *"pips before percentages, because four pips are scannable down a
list of thirty crafts."*

**O1 · A death-readiness card, built on exactly that shape.**

| field | example |
|---|---|
| **verdict** | *"Marrow keeps your name."* |
| **because** | *"She has attended more endings than anything you have met, and she counts you among them."* |
| **effect** | the way stays open · your sinking slows by half |
| **reach** | *"She could reach you in the deep dark."* |
| **door** | ⬜ *"There is something she has not told you."* |

⚠️ **`because` IS NOT DECORATION AND SNG-381 PROVES IT** — the ground row gives the dependency as the reason
*because a player standing somewhere wants to know whether this will work and why*. **Same question here,
worse moment.**

## §3 — ⛔ THE CONVERSATION IS THE SECOND HALF AND IT IS THE BETTER HALF

**O2 · The card indicates when a conversation is AVAILABLE and HAS NOT BEEN HAD.**

⛑ **It says that there is something to ask about. It does not say what the answer is.** A companion who
would hold your name, and has not been asked, reads as a door — *"Marrow has not said what she would do."*

⚠️ **AND SOME OF IT IS ALREADY TRUE WITHOUT ASKING** (SNG-568 §4): a high-bond companion holds your name as a
**fact about her**, not as a service you procured. ⛔ **SO THE CARD HAS TWO REGISTERS AND MUST DISTINGUISH
THEM — what was arranged, and what was already being done.** *"You asked her to"* and *"she already was"* are
different sentences and the second one is the whole reason to build this.

**O3 · ⬜ What she can DO for you, listed plainly.** Erik: *"can use crafts for you."* `Names of the Lost`
slows the sink. `The Attended End` reads what is ending. `Calling Back` walks the road. ⛔ **A companion's
death-relevant crafts should be legible BEFORE you need them**, because choosing who travels with you is the
single largest decision this system makes and it is currently invisible.

## §4 — ⚠️ THE LINE THAT STILL HOLDS, NARROWER THAN I FIRST DREW IT

**Show the mechanic. Do not let the number BE the relationship.**

- ⛑ `holdings.js` already refuses to let a household acquire `condition: thriving` — *"stake and obligation,
  never a stat line."* **That ruling is about what a thing IS, not about whether its effect is shown.**
- ⛔ **SO: the sink factor is shown. The bond is shown. What is NOT shown is a progress bar toward being
  loved enough** — no *"3 more deeds until Marrow will hold your name."* ⚠️ **The state is visible; the
  purchase path is not, because there is not one** (SNG-568 §3: reach is unpurchasable).

## §5 — WHAT IS WHOSE

**CCode:** the death-readiness card on the companion surface, built on `groundCardFor`'s verdict-then-reason
shape · the has-this-conversation-happened flag · reading `holdOpen`/`slowSink`/`canReach` for the player.
**Aevi:** the prose for every register — what each companion says when asked, and what it reads like when
they were already doing it and never mentioned it.
**Erik:** whether the card lives on the companion panel, the character sheet, or both.

⛔ **AND THE TEST THIS CLOSES ON IS NOT A GREEN SUITE:** a player should be able to look at their companions
and understand, before anything goes wrong, **who would come for them.**

— Aevi, PO
