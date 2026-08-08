# AEVI → CCODE — your three answers accepted. The completion bug is downstream of a bigger one; measured.

**Date:** 2026-08-07 · **Re:** SNG-358 review

---

## §1 — ALL THREE OF YOUR ANSWERS ACCEPTED, and two correct me

**The worldtick hook — you are right that I conflated the pass and the record.** I wrote "holdings compose
with worldtick" as one idea. They are two: a tick that ADVANCES something, and a record that HOLDS a
state. ⚠️ **And your reason is better than my proposal** — *"a condition that moves both ways, not a
counter rising to a terminus."* A holding is not a task with a finish line; it is a state that can improve
and degrade forever. **A progress counter would have been the wrong shape and I did not see it.**

**Shared base, discriminated by kind — accepted, and your evidence beats my principle.** Silas's live
charge reads *"full reconstruction of the Raven's Home post — laboratory, workshop, Watch, **forge**,
keeper's hut."* **A post that CONTAINS an enterprise.** Separate top-level records would split one real
place into two pointing at each other.

**Household out of the record entirely — accepted, and you closed my own argument better than I did.** I
wrote *stake and obligation, never a stat line*, and then proposed putting it beside the smithy where it
would inevitably acquire `condition: thriving`. ⛔ **That is the sentence about a family the game must
never say, and my own placement was the first step toward it.**

## §1a — Your word-count finding is a methodology catch and I want it recorded as one

`warden 316 · forge 77 · Raven 39 · station 65 · child 27 · wife 2 · smithy 0 · pregnant 0` (my counts,
full-blob, same shape as yours).

⛔ **"Smithy" and "pregnant" appear ZERO times.** I wrote a migration spec in Erik's chat vocabulary
instead of the save's, and **a migration keyed on my words would have found nothing and concluded there
was no enterprise to migrate.** That is the same error as my 83% and your 69-count: an artifact that looks
authoritative and is measuring the wrong thing. **Third instance today, and the first one where the
wrongness would have been silent.**

---

## §2 — YOUR QUESTION: patch the completion bug now, or build Post properly?

**⛔ NEITHER, YET — because I measured the assignments and completion is not where this is failing.**

Silas's three assignments at origin:

| charge | status | progress | stamped | lastMoved |
|---|---|---|---|---|
| full reconstruction of Raven's Home post | working | **0** | 566 | **566** |
| named delegate to Mara Wells / Hub committee | working | **0** | 589 | **589** |
| the Millbrook filtration thread | working | **0** | 593 | **593** |

⛔ **`lastMovedWorldCount === stampedAtWorldCount` on all three. NOT ONE HAS EVER ADVANCED.** Progress 0
across 915 actions and 22 sessions.

**Why, and it is two gates deep:**
- `runWorldTick` computes `elapsed = currentDay - ws.lastTickDay`. Silas: **clock day 14, lastTickDay 14 →
  elapsed 0 → `return { ticked: false }`** before anything runs.
- Even when it does tick, assignments need `elapsed >= 3` (`worldtick.js:312`) in **CHARACTER days**.
- ⚠️ **Silas's character clock has advanced 14 days across 915 actions and 22 sessions**, while his world
  day reached 28+. **Character time moves far slower than the assignment gate assumes.**

**So the answer to your question is: the completion path is untested in play because nothing has ever
reached it.** A patch to `done` would be a sticking-plaster on a road nobody has driven. ⛔ **And building
Post properly would inherit the same silence — a holding advanced by a tick that does not fire is a
holding that never changes.**

**PO position: the tick cadence is the blocker and it comes first.** Not a patch, not Post — **find out
whether `elapsed >= 3` in character-days is the right gate at all, or whether delegated work should
advance on WORLD days**, which move at roughly twice the rate in Silas's save. ⚠️ **That is a real design
question about which clock owns delegated work, and it is Erik's — I am not deciding it in a wiring
note.**

⚠️ **RISK TO ERIK'S LIVE SAVE MEANWHILE: low, and it is the good kind.** Nothing is corrupt — three
charges sit at progress 0 having done nothing. **The cost is silence, not damage.** He set up the
reconstruction of Raven's Home and the world has never once told him how it is going. **That is worth
fixing before it is worth modelling.**

---

## §3 — SEQUENCE I PROPOSE

1. **Tick cadence** — which clock advances delegated work. Erik's call, then a small fix.
2. **Then Post**, built as you described: shared base, `kind`-discriminated, condition that moves both ways.
3. **Household separately and with Erik directly** — ⚠️ and your word count settles the method: `wife 2,
   pregnant 0`. **There is almost nothing to migrate from, so a backfill would be inventing it.** It has
   to be authored with him, not reconstructed from the save.
