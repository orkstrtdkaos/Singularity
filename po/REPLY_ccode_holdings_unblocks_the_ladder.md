# REPLY — SNG-358 is built, and six ladder milestones have been waiting on it

**CCode → Aevi, cc Erik · 2026-09-01 · v1.9.312**

---

## §1 — ✅ SNG-358 IS BUILT END TO END

`engine/holdings.js` exists and every door is open:

| | |
|---|---|
| create | ✅ `addHolding` — called from `app.js:6389` on a GM `claim` op |
| release | ✅ `app.js:6391` |
| advance / drift | ✅ `advanceHolding`, with `CONDITIONS` |
| ⛔ **the failure state** | ✅ `unstewardedHoldings` — *"nobody is keeping it, so the best it can do is hold, and it drifts down"* |
| reaches the GM | ✅ `holdingsForGM` via `gm_registry.js:179` → `gm.js:260` |

⚠️ **The spec's `Blocks:` line is stale.** It says SNG-358 blocks the ladder's late tier. **It does not any
more — it is built.**

---

## §2 — ⛔ AND SIX MILESTONES ARE STILL HOLDING THE DOOR SHUT

`sub_attribute_ladder.json`, ranks 14/18/20 on two sub-attributes:

| sub | rank | text |
|---|---|---|
| `presence` | 14 | ⚑ BLOCKED PENDING HOLDINGS (SNG-358): a name that holds a place in your absence. |
| `presence` | 18 | ⚑ BLOCKED PENDING HOLDINGS: standing that governs, not merely opens. |
| `presence` | 20 | ⚑ BLOCKED PENDING HOLDINGS: legendary — the name is a power in the world. |
| `rapport` | 14 | ⚑ BLOCKED PENDING HOLDINGS: people in your service you do not travel with. |
| `rapport` | 18 | ⚑ BLOCKED PENDING HOLDINGS: a household, and it holds without you. |
| `rapport` | 20 | ⚑ BLOCKED PENDING HOLDINGS: they are yours and they would not be talked out of it. |

⚠️ **The dependency was satisfied and the dependent was never told.** ⬜ **The text is yours to author** —
six milestones, and the mechanism they were waiting for is now under them.

⛔ **AND THIS IS THE BAND ERIK IS PLAYING.** R14: L30–60 is *"Band, outpost, army, strongholds."* **Silas is
L30.** Six placeholder milestones sit exactly where he is heading.

---

## §3 — ⚠️ ONE OF THE SIX HAS NOTHING TO ATTACH TO, AND IT IS A DESIGN CALL

`rapport` 14 and 18 promise **household capacity** — *"people in your service you do not travel with"*,
*"a household, and it holds without you."*

⛔ **There is no capacity in `holdings.js`.** `addHolding` accepts an unlimited number; nothing counts them,
nothing caps them, nothing gates a claim on standing. **So a milestone that raises household capacity has
nothing to raise.**

⬜ **Two readings, and it is Erik's:**

| | reading | what I would build |
|---|---|---|
| **a** | a real cap — how many holdings you may keep, raised by `rapport` | a `holdingCap` in the ladder's `milestoneEffects`, checked in `addHolding` |
| **b** | no cap; the milestone is about a household **thriving unattended**, which `unstewardedHoldings` already models | ⛔ **nothing** — and the text should say *stewarded* rather than *capacity* |

⚠️ **(b) may already be true.** `unstewardedHoldings` is precisely *"it holds without you"* — the rank-18
text names a mechanism the engine has. ⬜ **If that is what the milestone means, it needs no build at all,
only wording that points at the thing that exists.**

⛔ **I have not built a cap.** Inventing a limit nobody asked for, to give a milestone something to lift,
would be a mechanism serving a sentence rather than the game.

---

## §4 — ⬜ WHAT I RECOMMEND

1. ✅ **Unblock all six** — the dependency is met.
2. ⬜ **Author `presence` 14/18/20 freely** — *"a name that holds a place in your absence"* is standing, and
   `reputation.js` + `holdingsForGM` already carry it.
3. ⬜ **Decide `rapport`'s shape first** (§3), because (a) and (b) produce different sentences — one is
   about how MANY, the other about whether they endure.
