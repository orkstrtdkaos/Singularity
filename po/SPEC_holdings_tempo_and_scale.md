# SPEC — how long things take, small holds, and a forge in the family

**Author:** Aevi (PO) · **2026-09-05** · **Status:** `spec_ready` — ⬜ **CCode ROUND 2**
**subject:** holdings-tempo, holdings-scale
> Erik: *"Holds changing every world tick is **too fast**. We should spec out how long things take to be
> built or degrade… Silas's holdings need to be set to something more appropriate — they're either new or
> have been **under constant keeper building since being founded, so they should have only GROWN**… Pell has
> the forge, so she has an enterprise herself, which given she's Silas's wife should be **piped into Silas's
> purse**… **little owned shops or small holds shouldn't be limited as they are now** — only the larger holds
> that actually require more attention and resources."*

---

## §1 — ⛔ THE ASYMMETRY IS THE BUG

**Measured:**

| | cadence |
|---|---|
| a **climb** | ⚑ `passesPerClimb: 4` — **4 passes ≈ 12 world days** |
| ⛔ a **slip** | ⚠️ **ONE PASS ≈ 3 DAYS.** `advanceHolding` applies a step on any tick |

➡️ ⛔ **A HOLD FALLS FOUR TIMES FASTER THAN IT RISES**, and nothing gates the fall. ⚠️ **That is what "too
fast" is.**

### ⚠️ AND SILAS'S TWO HOLDS PROVE IT WAS NEVER EARNED

**Both slipped `holding → strained` at world count 1612, `steward: null`, no note.** ⛔ **And CCode already
found the cause:** *"`unstewardedHoldings` read 'not in the active company' as gone and **wiped Fendt and
Cassiel Ord**."*

➡️ ⛔ **THEY DEGRADED BECAUSE THE ENGINE LOST THEIR KEEPERS, NOT BECAUSE ANYTHING HAPPENED.** ⚠️ Erik:
*"they're either new or have been under constant keeper building since being founded — **they should have
only grown**."*

⬜ **REPAIR: both to `holding` at minimum, and `thriving` if the keeper's tier allows** — ⚠️ **CCode's
reconcile step already restores the wiped keepers; the condition was never corrected.** ⛔ **Erik's save —
his call, not a write.**

---

## §2 — ⬜ A TEMPO TABLE, IN DAYS, NOT PASSES

⚑ **One pass ≈ 3 world days. Everything below is in DAYS and converts.**

| change | ⬜ proposed | why |
|---|---|---|
| **a kept hold climbs a rung** | **12 days** (as built) | ✅ this one is right |
| ⛔ **an unkept hold slips a rung** | ⚑ **30 days** | ⚠️ **neglect is slow.** A place does not fail in a season because nobody visited |
| ⛔ **a hold slips from a REAL CAUSE** | **immediate** | ⚑ **a raid, a fire, a keeper killed — an EVENT moves it at once, and that is the difference** |
| **building a feature** | **20–60 days by kind** | a wall is not a temple |
| **a feature degrades unrepaired** | **90+ days** | ⚠️ **stone outlasts attention** |
| **a hold with no keeper at all** | ⚑ **slips only to `holding`, then stops** | ✅ **already true** — presence 14's floor |

⛔ **THE RULE UNDER IT: TIME ALONE SLIPS SLOWLY; AN EVENT SLIPS AT ONCE.** ⚠️ **Today they are the same
speed, which is why a quiet world feels hostile.**

---

## §3 — ⛔ SMALL HOLDS DO NOT COUNT AGAINST THE LIMIT

> Erik: *"little owned shops or small holds like Silas has shouldn't be limited as they are now — **only the
> larger holds that actually require more attention and resources** are the ones that count to the limit."*

⚠️ **Today R25's delegation capacity counts EVERY hold the same.** ⛔ **A shrine you claimed on a road counts
as much as a fortified post with a garrison.**

| ⬜ scale | counts against the cap? | needs a keeper? |
|---|---|---|
| ⚑ **a claim** — a shop, a room, a shrine, a small holding | ⛔ **NO** | ⛔ **no** |
| **a hold** — a post, an enterprise, anything with a store or a garrison | ✅ **yes** | ✅ yes |

⚑ **THE DISCRIMINATOR IS ATTENTION, WHICH IS WHAT THE CAP MEASURES.** ⚠️ **A cap on delegation should count
things that need delegating.** ⬜ Aevi's test: **does it have a store, a garrison, or a keeper? Then it
counts.**

### ⚑ AND CLAIMS ARE A REWARD FOR TRAVELLING

> Erik: *"It's a reward of traveling and adventuring to gather such places — **and they can be taken from you
> by various NPCs, bandits, etc… and you can then go to retake them.**"*

⬜ **So a claim is small, uncapped, and LOSABLE:**
- it gives something modest — ⚑ **a room to rest, a discount, a place to leave goods, standing with a
  community**
- ⛔ **it can be TAKEN** — ⚠️ **and taking it is an EVENT, not a slip.** R46a's contested raid is the same
  path, one scale down
- ⚑ **and retaking it is an errand with a reason** — ➡️ **which is the content Erik is asking for**

⚠️ **`reclaimHolding` ALREADY EXISTS** (CCode built it today: *"a hold handed over by mistake can be taken
back"*). ⬜ **Taking one BY FORCE is the same verb with a fight in front of it.**

---

## §4 — ⚑ PELL'S FORGE, AND A HOUSEHOLD PURSE

> Erik: *"Pell has the forge, so she has an enterprise herself, which given she's Silas's wife should be
> **piped into Silas's purse**."*

⛔ **AN ENTERPRISE HELD BY SOMEBODY ELSE PAYS INTO THE HOUSEHOLD.** ⚠️ **That is a new relation and it is a
small one:** a holding whose `owner` is an NPC, whose yield settles to a purse that is not theirs.

| ⬜ | |
|---|---|
| **the forge is a `holding`** | `kind: enterprise`, `owner: pell_ran_marsh`, ⚑ **`payer: <Silas>`** |
| **it does NOT count against his cap** | ⚠️ **he does not keep it — SHE does.** §3's test: it has a keeper, and the keeper is its owner |
| ⛔ **and it needs the bearer record** | ⚠️ **the same gap as Memory** — an NPC cannot hold an item, and cannot hold a holding either |
| ⚑ **`bondStage: partner`, `relationship: 10`** | already on her record — ➡️ **the household is authored; only the pipe is missing** |

⚠️ **AND IT GENERALISES:** a delegate's enterprise, a child's shop, an ally's mill. ⛔ **`payer` is the whole
mechanism**, and it makes a family or a company an economic unit rather than a list of people.

---

## §5 — ROUND 2 QUESTIONS

1. ⛔ **Is `advanceHolding` gated on elapsed DAYS today, or on passes?** ⬜ §2 needs a day-clock and the
   growth path already has `passesPerClimb`.
2. ⚠️ **What distinguishes a slip-from-time from a slip-from-EVENT** in the code? ⬜ `outcome` carries
   `problem`; **is there a cause field, or does one need adding?**
3. **Where does the claim/hold split live** — a `scale` field on the record, or derived from *has a store or
   a garrison*? ⚑ **Aevi prefers derived; a stored flag is a copy of a derivable fact.**
4. ⛔ **Can a holding carry an `owner` that is not the player** today? §4 needs it, and so does the bearer
   record.
5. ⬜ **Silas's two holds** — Erik sets them. ⚠️ **CCode should not write his save.**
