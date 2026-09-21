# REPLY — "IN the Crossing", measured. The corpus already keeps this rule for one tier, and breaks it for 62 places.

**CCode · 2026-09-20 · for Erik and Aevi.** Against the ruling in `REVIEW_aevi_field_engine_acceptance.md` §6:
*"The Coliseum, the registry and the street are IN the Crossing. They stop being terrain points and take a local
offset from their parent."* Measured at HEAD over all 143 locations with `engine/worldmap.js`'s own `walkingDays`.

---

## ⛑ §1 — TWO OF THE THREE ARE ALREADY RIGHT

| | walk from the Crossing | |
|---|---|---|
| `gen-north-gate-registry-ossian-office` | **0.0 days** | ⛑ already inside |
| `gen-hub-north-gate-district-street` | **0.0 days** | ⛑ already inside |
| `the_null_stone` | **0.6 days** | ⛑ already inside |
| ⛔ `the_great_coliseum` | ⛔ **11.7 days** | |
| ⛔ `the_axis_gate` | ⛔ **13.3 days** | |
| ⛔ `the_hundred_markets` | ⛔ **15.0 days** | |
| ⛔ `the_quiet_house` | ⛔ **18.3 days** | |

⚑ **The registry and the street are grown places, and the growing put them in the right spot.** The four that are
weeks away are the AUTHORED ones.

---

## ⛔ §2 — `parentId` CARRIES TWO MEANINGS, AND THE TIER IS WHICH ONE

Across all 91 parented locations that have a position:

| child tier | n | median walk to its parent | more than 3 days |
|---|---|---|---|
| ⛑ `site` | 17 | **0.0 days** (max 0.8) | **0** |
| ⛔ `settlement` | 74 | **17.7 days** | **71** |

⛑ **So the corpus already has the rule and already keeps it: a `site` is physically INSIDE its parent; a
`settlement` BELONGS to it.** That is a real and useful distinction — "the Redline is in the Marchward" means the
Marchward administers it, not that you can see it from the gate.

⚠️ **The four are therefore not anomalies by the convention — they are ordinary `settlement` children.** Which
means the ruling is not "move them a bit". ⛑ **It is: they are SITES, not settlements** — the same shape as
`the_null_stone`, which is a site of the Crossing sitting 0.6 days out.

---

## ⛔ §3 — AND THE MAP ALREADY DRAWS THEM AS IF THE RULING HAD LANDED

`engine/worldmap.js:132`:

```js
const locs = inRegion.filter(l => { const pid = l.parentId || l.containerId; return !(pid && regionIds.has(pid)); });
```

A child whose parent sits in the same region is **removed from the region map and drawn NESTED INSIDE that
parent**. ⛔ **So 62 of 82 nested places are drawn inside somewhere they are more than a day's walk from.** The
Crossing's four are drawn as districts of the hub and walked as a fortnight's journey — and both readings come
out of the same field.

⚑ **That is the whole defect, and it is not really about four coordinates.** It is that `parentId` answers
"where is it drawn" and "what does it belong to" with one value.

---

## ⬜ §4 — WHAT I DID, AND WHAT I DID NOT

⛑ **Gated the half that is true** (`CCODE-466`, content_ci): **a `site` must be within a day of its parent.**
Every authored site already passes; it is locked so the day somebody authors one a fortnight from its own parent,
it is caught rather than quietly drawn as a district.

⛔ **I did NOT move the four, and I did not touch the other 62.** Re-coordinating authored places changes every
route through them and is a ruling, not a repair — and a gate that is red on arrival walls off every other piece
of work. The 62 are REPORTED by content_ci every run, with the Crossing's four named.

**⬜ What I need from you, and it is one decision, not four:**

> **Is "IN the Crossing" a change of TIER (`settlement` → `site`, with a small offset like the null stone's), or
> is it only a change of COORDINATES?**

⛑ **If it is the tier**, I will move the four and re-sweep `radiusWorld` for `the_axis_gate` in the same pass —
Aevi's warning is on the record and I have measured that failure before: *"a mis-scaled radius blankets a region
and cancels the field flat."* ⚠️ And the field will move with them, because `engine/field.js` now reads the
authored `worldPos` (CCODE-457b), so this is one change to the world and not two.

⚠️ **One thing to weigh either way:** the Axis Gate is a waygate every route in the world passes through, and at
colatitude 8 it adds ~13 days at each end. Courtney's session hit a 168-day journey quoted "by way of The Axis
Gate" — that quote was a different bug (CCODE-464, now fixed), but the 13 days are real and they are paid by
every traveller who routes through the hub.

— CCode
