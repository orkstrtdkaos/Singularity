# CCode · 2026-09-07 · Silas's story leaked into other people's saves — the fault, the fix, and what I owe the testers

**v1.9.405.** ⛔ **Erik, from Brook and Brayden's playtest:** *"Brayden has the Fell Pell as a holding on his
screen and the 880 crystal grant… likely an error that went to all saves instead of just Silas."*

**He is right, and it was three steps, not one.**

---

## §1 — WHAT LEAKED

| step | what it gave everyone | why it is Silas's |
|---|---|---|
| **35 `r48-back-pay`** | ⛔ **a fixed 880 crystal**, and **every hold on the save set to `thriving`** | the 880 is computed from **his** Threshold Post over a span only his save lived through; the `thriving` restore repairs a keeper bug that happened to **his** holds |
| **36 `r48-deed-ledger`** | 8 crystal per deed on the record | the COUNT is the character's own, which is why it looked safe — but R48 is a **settlement for one broken span**, not a standing rate |
| **38 `r49-fell-pell`** | ⛔ **The Fell Pell** and **the Fellowship of the Fell Pell** | Pell's forge at Millbrook, and the band the fiction named around Silas |

⚠️ **My own rule, written after §95 caught this exact class in step 39:** *a step that carries one character's
story names that character.* ⛔ **I applied it to 39, and to everything from 42 on, and never went back.**

### ⛑ AND WHY IT STAYED INVISIBLE

**§95 and §101 drove those three steps with GENERIC fixtures — `"t"`, `"u"`, `"v"`, `"w"`, and an unnamed
save.** ➡️ **So the absent guard was never asserted, and nothing could go red.** ⚑ **A gate that tests a
Silas-only step with a stranger's id is testing the wrong thing, and it did so for eleven versions.**

---

## §2 — THE FIX, BOTH HALVES

- **Gated.** 35, 36 and 38 now name the character, as 39 and 42–47 already did.
- **Taken back** (step 48, every save that is not Silas's): the Fell Pell and the Fellowship are removed, and
  the arrears come back **through `debit`, only as far as the purse still holds them.**
  ⚑ **A player who spent it keeps what they spent** — the error is mine, and the fair direction of a wrong
  number is the player's way.
- ⚠️ **Hold conditions are LEFT ALONE.** Step 35 set every hold to `thriving`; taking a rung back from a place
  Brayden may have built on since would be a second error on top of the first. **It is said, not undone.**
- ⛑ **§95 earned its keep twice:** it caught my own revoke writing `c.purse.crystal` directly — **the purse has
  one door out** — and `debit` already refuses to overdraw, which is exactly the floor I had hand-rolled.

**Gate §131**, including the class: ⛔ **no step grants a holding, a band or a fixed sum without naming whose
story it is.**

---

## §3 — ⬜ WHAT THE TESTERS SHOULD DO, AND WHAT I OWE THEM

**Brayden: reload.** The forge, the band and the arrears come off on that load, with a note saying so. **His
own holds, deeds, coin and story are untouched.**

⚠️ **I cannot tell from here what else his save took on** — I have his repo copy at an older reconcile version
than his browser ran. ⬜ **If anything else on his sheet is not his, name it and I will measure it the same way.**

---

## §4 — ⬜ PARTY PLAY: I NEED THE FAILURE, NOT THE VERDICT

> Erik: *"Brook and Brayden play tested the party play. The results were not great… we can work on that."*

⛔ **I am not going to guess at this one.** ⚠️ Party mode has three known-unbuilt pieces (`resolveRound` phase 2
in `SPEC_party_mode_phase2`, the turn-order surface, and the shared-scene sync), and *"not great"* could be any
of them or none. ⬜ **What would let me measure it:**

1. **What did they try to do that did not work** — one concrete beat.
2. **What did the screen say** — the exact line, or a screenshot.
3. **Was it two people in one scene at once, or taking turns?**

⚑ **A save id and a rough time is enough for me to read the turn out of the ledger** if that is easier than
describing it.
