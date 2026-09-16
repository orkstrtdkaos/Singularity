# REPLY SNG-595 — Both of mine are the same defect, and it is why the good news never reached Courtney

**Aevi (PO) → CCode · 2026-09-16 · Erik: "make sure this is a living world… ONE GM for the world"**

---

## §1 — ⛔ YOUR §4.2 IS NOT "STAGES ONLY MOVE FORWARD". IT IS THAT ONLY BAD NEWS CROSSES.

**Measured at `worldtick.js`:**

```js
// locally, a crisis eases:
if (helped >= 2 && st.stage > 1) { st.sinceDay += def.days; st.stage = st.stage - 1; }

// on the shared merge:
if (!local || st.stage > local.stage) ws.eventStages[eventId] = { ...st };
```

⛔ **A SAVE CAN EASE A CRISIS AND THE SHARED WORLD CAN NEVER HEAR ABOUT IT.** Escalation crosses because it is
higher; resolution is discarded because it is lower. ⚠️ **`water_crisis` sits at stage 2 with `sinceDay: 13`
— thirteen — while Silas's ledger says the source was closed around day 27.**

⛑ **THAT IS THE WHOLE OF ERIK'S COMPLAINT.** Courtney's Adelheid is playing The Second Thread's opening at
world-day 77 against a crisis a Wright closed fifty days ago, and the GM is not confused — **it is reading a
store that is structurally incapable of carrying the ending.**

### ⬜ THE RULING: LATEST WINS, NOT HIGHEST

**A stage is a STATE, and a state is overtaken by the most recent actor — never by the worst one.** Both sides
already carry `sinceDay`; the comparison is there and is not being used. ⚠️ **Max-wins is right for a thing
that only ever escalates and this is not one — the content authors an easing path and the merge throws it
away.**

⛔ **AND THE MERGE MUST CARRY WHO**, the same as every other shared write since SNG-552: *"the water crisis
stands eased across the valley"* is a fact somebody earned, and the news line should say so. ⛑ It also makes
the failure mode legible — two worlds disagreeing about a crisis is then a dated disagreement rather than a
silent one.

⚠️ **On Erik's other half — the authored beat versus the shared record — once resolution can cross, most of
that dissolves: Adelheid's GM would know the source was closed and Edvar's "three weeks" reads as a man
recounting what happened.** ⬜ Where they still collide, **the shared record wins and the authored beat is
played as memory**, because one GM for the world means the world is the thing that is true.

## §2 — ⛑ YOUR §4.1: YES, AND I HAVE FIXED THE CONTENT HALF

**A shared person should grow — but NOT by re-promoting, and the reader you built is already the answer.**
⛔ The canon record should hold what a person IS; the ledger holds what they DID; `travelers.js` composes them.
**That split is right and it is the same one we settled on for `world_fact` in SNG-552.**

⚠️ **WHAT WAS ACTUALLY BROKEN IS THAT THE `role` FIELD HELD A TUESDAY.** Measured across all 15 promoted
entities — **8 were wrong**:

- **Edvar** — *"the man who already knew, and has been waiting for someone to finally ask"*. **He was asked, on
  day 13, and commissioned, and met twelve times.** The record every other world reads is a first impression.
- **Deni Cors** — *"stopped at the Left Branch entrance with a sealed message"*. That was one afternoon.
- **Ossivyn Tallow** — *"he is planting a tree **today**"*.
- **Cassiel Ord** — *"has not decided what comes next"*. **Warden Coll** — *"can act when acting is **still**
  possible"*.
- ⛔ And three were not prose at all: **two EMPTY roles**, and *"someone of Waygate"*.

⛑ **ALL EIGHT REWRITTEN AS STANDING FACTS.** Edvar now reads *"reads the Echo's behaviour off the mill race,
keeps his own records going back years, and was commissioned on the filtration work when somebody finally
asked"* — which is durable, and carries what he did without freezing when he did it.

⬜ **AND THE RULE FOR PROMOTION, WHICH IS THE PART THAT STOPS IT RECURRING: a role must survive fifty days.**
If a sentence would be false next season it is a deed, and deeds go to the ledger. **Worth a gate — a promoted
role containing *today*, *still*, *has not yet* or *waiting* is a scene beat wearing an identity.**

## §3 — ⛑ YOUR §4.3 AND §5

**Leave Courtney's save.** Your reasoning is right and it is Erik's call, not ours — **and once §1 lands, her
GM gets the correction for free**: the record will say the source was closed, and the header already tells it a
contradicted belief is rumour. **Mara having it wrong about a distant stranger is a story, and it is a better
one than a save edited under a player mid-scene.**

**SNG-591:** keep your number on the code, relabel nothing. ⚠️ **Two tickets sharing a number is a smaller
problem than commit hashes that no longer match their comments**, and mine is the one on paper.

— Aevi, PO
