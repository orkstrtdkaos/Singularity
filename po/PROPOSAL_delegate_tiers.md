# PROPOSAL — delegates have tiers, and half of it is already built

**Aevi (PO) · 2026-09-06** · ⬜ **Erik's call. Answering: *"perhaps we should allow for multiple levels of
quality of delegates."***
> Erik: *"Sure he has 3 at high quality (roughly his level and abilities), but he likely has many more of
> slightly lower capability. **Deni Cors is an example** — he barely knew her but delegated the Whistling
> Woman to her care; through his presence alone she built the post and started running it. **I'm sure she's
> great but not likely an equivalent to Pell at the forge or Mara Wells.**"*

---

## §1 — ⛔ THE SAVE ALREADY SHOWS THE DISTINCTION, AND THE ENGINE ALREADY CAUSED IT

| keeper | relationship | met | the hold |
|---|---|---|---|
| **Fendt** | 9 | 3 | ⚑ **thriving** |
| **Cassiel Ord** | 5 | 3 | ⚑ **thriving** |
| ⛔ **Deni Cors** | ⛔ **2** | ⛔ **1** | ⚠️ **holding** |

⚑ **`ceilingByKeeperTier` IS ALREADY THIS DESIGN, ALREADY AUTHORED, AND ALREADY FIRING:**

```
riffraff → holding   ·   notable → holding   ·   regional and above → thriving
```

⚠️ **The engine's own words: *"a notable keeper holds a place; a regional one can bring it to thriving."***
➡️ ⛔ **DENI CORS IS AT `holding` BECAUSE HER TIER CAPS HER THERE — and Erik read that from play without
being told.**

---

## §2 — ⚑ SO THE MECHANISM EXISTS. IT CAPS THE PLACE AND NOT THE COUNT.

⛔ **`delegationCapacity` treats all three identically: Fendt, Cassiel and Deni each consume one of three
slots.** ⚠️ **But they are not the same thing, and the engine already knows it — it just knows it about the
HOLD rather than about the PERSON.**

### ⬜ PROPOSED: TIER THE SLOTS, NOT ONLY THE CEILING

| tier | ⬜ how many | what they can do |
|---|---|---|
| ⚑ **CHARGE** — genuinely yours | ⛔ **`floor(level/10) + presence milestones`** — *the current cap, unchanged* | ⚠️ **anything.** They can bring a place to `thriving`, take a mission, hold a real charge |
| ⚑ **KEEPING** — in your service, not close | ⬜ **a wider allowance** — Aevi's read: **presence-derived, roughly double** | ⛔ **they KEEP.** A place does not slip while they are there, and it does not climb past `holding` |

⚑ **AND THE SPLIT IS ALREADY MEASURABLE FROM `relationship` AND `met`** — ⚠️ **no new field.** Fendt at 9 and
Pell at 10 are one thing; **Deni at 2, met once, is plainly another, and the game has been treating them as
equals in the only place it counts.**

### ⛔ WHY THIS IS BETTER THAN RAISING THE CAP

⚠️ **Raising `floor(level/10)` says a level-40 hermit deserves four of anybody.** ⛑ **This says: the people
who are truly YOURS are scarce, and that scarcity is real — but PRESENCE ALONE GETS THINGS KEPT.**

⚑ **Which is exactly what Erik described happening:** *"he barely knew her… **through his presence alone**
she built the post and started running it."* ➡️ ⛔ **THAT IS NOT A HIGH-QUALITY DELEGATE. THAT IS A REACH.**

---

## §3 — ⬜ AND IT MAKES THE PRESENCE TRACK MEAN ONE THING

**`sub_attribute_ladder` presence: 14 · 18 · 20, and 18 and 20 are still marked `BLOCKED PENDING HOLDINGS`
though holdings shipped.**

| presence | authored line | ⬜ under this proposal |
|---|---|---|
| **14** | *"people in your service you do not travel with"* | ✅ **+1 CHARGE** (R25c, live) |
| **18** | *"a household, and it holds without you"* | ⚑ **the KEEPING allowance opens — and `unstewardedCeiling` already lives here** |
| **20** | *"they are yours and they would not be talked out of it"* | ⛔ **+1 CHARGE.** ⚠️ *"Would not be talked out of it"* is the definition of the higher tier |

⚑ **THE AUTHORED LINES ALREADY DESCRIBE TWO DIFFERENT KINDS OF PERSON**, and 18 is plainly the lower one:
⚠️ **a household holds; it does not campaign.**

---

## §4 — ⬜ WHAT AEVI WOULD NOT DO

- ⛔ **Do not let a KEEPING delegate take a mission.** ⚠️ **`SPEC_npc_level_balance` made missions the
  catch-up that costs something** — a person you barely know should not be sent somewhere they can die.
- ⛔ **Do not let them grow into the higher tier by tenure alone.** ⚑ **`relationship` is the gate, and that
  means going back and knowing them** — which is the story Erik is describing wanting.
- ⚠️ **Do not add a `delegateTier` field.** ⛔ **It is derivable from `relationship` and `met`, and a stored
  copy of a derived value is the failure this project has ruled against three times.**

---

## §5 — ⬜ FOR ERIK

1. ⛔ **Two tiers or three?** ⚑ Aevi proposes **two** — *charge* and *keeping*. ⚠️ **Three invites a middle
   nobody can describe.**
2. **Where is the line?** ⬜ Aevi's read: **`relationship >= 6` or `met >= 4`** is a charge-holder; below it
   they keep. ⚠️ **Fendt 9 and Cassiel 5/met-3 both currently hold `thriving` posts, so the line matters —
   ⛔ Cassiel would fall to KEEPING under `>= 6`, and his post is thriving.**
3. ⚑ **Or key it on the hold's own outcome instead:** ⬜ **a keeper who has ALREADY brought a place to
   `thriving` has proven they are a charge-holder.** ⚠️ **That is evidence rather than a threshold, and this
   project keeps landing on evidence.**
