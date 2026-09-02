# RULING — Three capacity scales: party, delegation, holdings

**Ruled by:** Erik · **Date:** 2026-09-02 · **Recorded by:** Aevi
**Closes:** CCode's open question — *"`rapport` 14/18/20: cap, or a household that endures unattended?"*
**Amends:** the `presence` 14/18/20 authoring of 2026-09-02 (`113a22b3`) — those milestones now carry a
second effect each.

---

## R25 — There are THREE capacity scales, not one ladder ✅ RULED

⛔ **Aevi's first recommendation collapsed party and delegation into a single rapport ladder. Erik's model
separates them, and they are governed differently.**

| scale | what it is | governed by |
|---|---|---|
| **Party** | at your side. ⚠️ **3 turn-by-turn, the rest folded** (CCode's battle work) | `rapport` **then** `presence` |
| **Delegation** | in your service, absent, running what you would otherwise run yourself | ⚠️ **level AND ability — a formula, not a milestone** |
| **Band / unit / legion / army** | what you move with when the party is not the frame | separate system |

---

## R25a — Party capacity: rapport to 4, presence to 6 ✅ RULED

| rank | grants | sub |
|---|---|---|
| rapport 1 · 4 · 7 · 10 | 1st · 2nd · 3rd · 4th place | `rapport` (already live) |
| **presence 10** | ⚑ **5th place** | `presence` |
| **presence 14** | ⚑ **6th place** | `presence` |

**Cap is 6.** ⚠️ **Rapport is who will follow YOU. Presence is who will follow a NAME.** That split is the
reason the ladder changes hands at 4.

✅ **Validated against Silas:** L30, rapport 7, presence 9, **4 in company** — exactly at the rapport
ceiling with the 5th just out of reach. ⛔ **The model was not fitted to him; he fell on it.**

⚠️ **This gives `presence` 10 and 14 a SECOND effect each.** 14 already carries `unstewardedFloor` from
the 2026-09-02 authoring. **Milestones may be compound — but it must be deliberate, and it is recorded
here so the next reader does not find it by surprise.**

---

## R25b — Delegation capacity is a FORMULA ✅ RULED

Erik: *"How many you can delegate to manage things you would otherwise need to should grow with level and
ability."*

⛔ **Not a milestone number.** Shape: `floor(level / 10) + rapport milestone bonus`.

✅ **Validated against Silas:** L30 → 3 base, and he is running **exactly 3 delegates** — Cassiel Ord,
Edvar Crane (×2 charges), Fendt. ⚠️ **He is at capacity today without anything enforcing it.**

⬜ **CCode tunes the constants.** The shape is ruled; the numbers are not.

---

## R25c — `rapport` 14 / 18 / 20 ✅ RULED

| rank | authored text | ruling |
|---|---|---|
| **14** | *"people in your service you do not travel with"* | ✅ **raises delegation capacity** (a number, on the R25b formula) |
| **18** | *"a household, and it holds without you"* | ✅ **a STATE, not a count** — the household endures unattended |
| **20** | *"they are yours and they would not be talked out of it"* | ✅ **a STATE** — loyalty that cannot be bought away |

⛔ **HOUSEHOLD NEVER BECOMES A NUMBER.** CCode's module comment stands and this ruling does not weaken it:
*"the moment a pregnant wife grants a combat bonus the game has said something false."* Ranks 18 and 20
change what your people DO in your absence. They never count them and they never add to a roll.

---

## §What Silas's save showed, and one of it is a bug

| finding | |
|---|---|
| `holdings: []` | ⛔ **EMPTY at L30** |
| assignments | 4, across 3 delegates |
| company | 4 |

⛔ **THE SNG-358 BUG IS WORSE THAN AEVI REPORTED IT.** She wrote that the Raven's Home post *"will leave
state when the reconstruction completes."* ⚠️ **It is not in the holdings system at all** — it exists only
as an assignment string, `cassiel-ord::full-reconstruction-of-the-raven-s-home-`. **There is nothing for
completion to delete because nothing was ever created.**

➡️ **The fix is not "make holdings outlive assignments." It is a MIGRATION: existing assignments that
describe a place must mint the holding they have been standing in for.**

---

## ⚠️ THE GAP THIS RULING OPENS — flagged, not solved

Erik: *"Being IN the party must be beneficial… using skills more effectively, and providing a use for the
area effects and bolster/protection that is a bit more intimate than band or unit level."*

⛔ **None of that exists yet.** ⚠️ **If party slots 5 and 6 unlock into a system where the 4th member
already contributes nothing mechanical, the milestone is hollow.**

✅ **Erik: CCode has done substantial battle work on parties and folding — this connects to it.**
➡️ **CCode: does the folded-member layer already carry the intimate-scale bolster/area effects, or is that
still open? The party milestones should not ship ahead of the thing that makes a party place worth having.**

---

## Wiring

| # | item | owner |
|---|---|---|
| 1 | `presence` 10 → 5th company place; `presence` 14 → 6th (compound with `unstewardedFloor`) | CCode |
| 2 | Delegation capacity formula `floor(level/10) + rapport bonus`; enforce it | CCode |
| 3 | `rapport` 14 raises delegation capacity; 18 and 20 authored as states | ⬜ **Aevi authors, then CCode wires** |
| 4 | ⛔ Migrate place-describing assignments into `holdings` | CCode — **live save affected** |
| 5 | Confirm the folded-party benefit layer exists before 1 ships | CCode |
