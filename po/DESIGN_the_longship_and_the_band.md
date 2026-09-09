# DESIGN — the longship, and how Brayden gets one

**Aevi (PO) · 2026-09-08.** ⬜ **Erik: *"Brayden is trying to raise a band and wants to get a longship as a
hold to have an enterprise. I think contact with that NPC could be an awesome pathway."***

---

## §1 — ⚑ MEASURED FIRST: ALMOST ALL OF THIS IS BUILT

| he wants | ⛑ exists |
|---|---|
| **an enterprise** | ✅ **`kind: "enterprise"` is a real holding kind — The Fell Pell is one, with a steward and features** |
| **a band** | ✅ `garrison[]` on a holding · `small_company` the craft · `bandOps` · `delegationCapacity` |
| **people who work it** | ✅ `steward`, `garrison`, crew as hands — and `SPEC_hold_costs_crafts_and_hiring` §5 opens *ask-to-work* below the travel bar |
| **features that pay** | ✅ 38 kinds, and `fishery`, `market`, `smithy`, `relay_station` all fit a ship |
| ⛔ **a MOBILE holding** | ⛔ **THE ONE GAP.** `addHolding` takes a `locationId` and everything downstream assumes it stays put |

⚠️ **So this is not a feature request. It is ONE FIELD and a design decision about what moves.**

---

## §2 — ⬜ THE LONGSHIP AS A HOLDING

```
kind: "enterprise"
locationId: <wherever she is moored right now>
mobile: true
```

⚑ **`mobile: true` means `locationId` is CURRENT, not permanent** — ⛔ **and that is the whole change.**

| what it breaks, and the answer | |
|---|---|
| ⚠️ **raids** | ⛑ **a moored ship is raidable; a ship at sea is not** — R46a's watch/garrison math applies only in port, which is a REAL tactical fact rather than an exemption |
| ⚠️ **upkeep** | ⛔ **a ship costs whether or not it sails**, and that is the pressure that makes an enterprise an enterprise |
| ⚠️ **features** | ⚑ **only some kinds may sit on a hull** — `fishery`, `smithy`, `quarters`, `watch`, `market` yes; `mine`, `quarry`, `ward_line`, `waygate` obviously not. ⬜ A `hullable: true` flag on the feature kind, or a small deny-list |
| ⚑ **and it can carry its own crew** | `garrison` is already a list of npc ids, and a crew IS a garrison that travels |

---

## §3 — ⛑ AND THE TWO NPCs ARE A TWO-STEP, NOT A CHOICE

⚠️ **They give different halves and the order matters.**

### ⚑ CASSA REDSAIL GETS HIM THE HULL
**She takes ships nobody insures.** ⛔ **A ship is exactly the thing she can put in someone's hands** —
⚠️ and her authored want is *"one take big enough to stop, and she has said that four times."*

⛑ **THE HOOK WRITES ITSELF: this take is the one that stops her, and the price of her help is that the ship
is not hers afterwards.** ⚠️ She is `patience: 3` and *"agrees to things fast and means them for about a
week"* — ⛔ **her own `poleSignature` says GET IT IN FRONT OF HER CREW IF YOU WANT IT TO LAST**, which is a
scene rather than a transaction.

### ⚑ ORRUN SHIELDBREAKER TEACHES HIM TO KEEP A CREW
⛔ **A hull is not an enterprise. NINE SEASONS AND A CREW THAT RE-SWEARS EVERY ONE OF THEM is.**

⚠️ **He is the only authored person whose `teaches` array is the band-scale set:**
`break_the_line` · `who_falls_first` · `small_company` — ⛑ **and `small_company` is the closest thing in the
corpus to command.**

⚑ **HIS OWN TELL IS THE LESSON: *"he asks what your people get out of it before he asks what you want."***
⚠️ **A Norse character raising a band is being taught the actual mechanism — a raider-captain's authority is
CONFERRED EVERY SEASON, and Brayden's band will work the same way or not at all.**

⬜ **AND HIS QUEST SEED IS ALREADY THE JOB:** *"he needs a tenth season and one of the old landings has been
taken by something that is not people."* ⛔ **That is a raid that needs a second ship.**

---

## §4 — ⚠️ AND THIS IS THE COMMANDER HOLE, ARRIVING AS PLAY

⛑ **Brayden is building the vocation the game cannot yet express.** ⛔ **`docs/VOCATIONS.md`: there is no
COMMANDER craft line and no coliseum cell — 30 `command` crafts and none commands a band.**

⚠️ **He will hit the ceiling exactly where Orrun does: `small_company` reaches a company and stops.**

⬜ **THAT MAKES THE COMMANDER LINE THE FIRST CONTENT REQUEST WITH A PLAYER BEHIND IT** — ⚑ **`the_gathering`,
`raise_banner`, `lead_the_line`, `command_field`** — and it stops being a hole in a document.

---

## §5 — ⬜ WHAT IS NEEDED

| # | | who |
|---|---|---|
| **1** | ⛔ **`mobile: true` on a holding, and `locationId` as current-not-permanent** | CCode — ⚠️ **plus the raid rule: moored is raidable, at sea is not** |
| **2** | ⬜ **which feature kinds may sit on a hull** | ⚑ Aevi authors the flag, CCode reads it |
| **3** | ⛔ **the COMMANDER craft line** | ⚠️ **now has a player waiting** |
| **4** | ⬜ **a longship feature kind or two** — `oar_benches`, `beaching_ground`? | Aevi |
| **5** | ⚑ **nothing else** | the enterprise kind, garrison, steward, upkeep and hiring are all built |
