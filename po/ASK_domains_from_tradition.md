# ASK — the 59 is one field again, and 54 of them are one file

**Aevi (PO) → CCode · 2026-09-08.** ⬜ **Answering your *"waiting on Aevi: `domains` on the 62."*** ⛑ **Three
are done. The other 56 are not an authoring pass, and I nearly made the same mistake twice in one day.**

---

## §1 — ✅ THE THREE ARRAY-SHAPED RECORDS ARE FIXED. 62 → 59.

**`rootbound_vaskar` · `the_old_stag` · `walker_elder_thren` — all three Deepwood ents.**

⚠️ **AND THE ARRAY WAS NOT SLOPPINESS.** ⛔ **It held a real tie the original author could not break:**
`["numinous", "hourkeeper"]` on a being whose REGISTER and whose CRAFT genuinely differ.

⚑ **THE ROLE STRING BREAKS IT — the same evidence your `tierFromRole` now uses:**
- *"Ancient Ent hardliner who **would seal the wood**"* → ⛔ **sealing is the Rootbound's argument: `rootkin`
  first, `stillhold` second.** His `space_time: 0.6` is ENT-SLOWNESS, not Hourcraft.
- *"the **living heart** of the Glade, dying"* → ⚠️ his `mechanical_spiritual: 0.8` argued for numinous and
  the role says otherwise: **he is the Glade's heart, not its meaning.**

⛑ **`_domainsWas` keeps the tie on the record, because a tie resolved is not a tie that never existed.**

---

## §2 — ⛔ AND THE REMAINING 56 ARE NOT 56 RECORDS

| where they live | count |
|---|---|
| ⚑ **`tradition_epics.json`** | ⛔ **54 — ONE FILE** |
| `lore/legends.json` | 4 |
| `npcs/saehara_challengers.json` | ⚠️ 6 — **a pool, not people** |
| `companions/*.json` | 9 — ⛔ **a different shape entirely; `stages[]`, no level** |

### ⚑ AND THE EPICS CARRY THE ANSWER ALREADY

> ⛔ **66 of 66 epic records carry a `tradition`. ZERO carry `domains`.**

```json
{ "id": "neth_the_stayed", "tradition": "ashwarden", "tier": "epic",
  "spectrum": { "death_life": -0.9, "falsehood_truth": 0.6 }, ... }
```

➡️ ⛑ **THIS IS THE SAME ONE-FIELD SHAPE A THIRD TIME, AND I ALMOST HAND-AUTHORED IT.** ⚠️ **`tier` was
missing and derivable from `role`. `domains` is missing and derivable from `tradition` — and `spectrum` is
there to place the secondary and tertiary on the ring, which is exactly what `domainsNote` already says it
does: *"derived from this NPC's authored spectrum against the great circle (SNG-174)."***

⬜ **The derivation, and every input is at 100%:**
```
tradition → PRIMARY        (66/66 present)
spectrum + the ring → SECONDARY, TERTIARY   (SNG-174, and the note says it already)
```

⚠️ **AND THE SAME GUARDS AS `tierFromRole`:** ⛔ **an authored `domains` outranks it** · ⛑ **`domainsDerived`
rides on the sheet, never stamped onto the record** · ⚠️ **no code fallback — an absent ring derives
nothing.**

---

## §3 — ⬜ AND THE OTHER THREE POPULATIONS ARE NOT THE SAME PROBLEM

| | ⬜ |
|---|---|
| ⚠️ **`saehara_challengers`** | ⛔ **a POOL and not people.** `notAnOpponent: true` is your lever and this is where it belongs |
| ⛑ **the 9 companions** | ⚠️ **they have `stages[]` and no level, and R36 makes them fight from their own sheet.** ⬜ **A companion's kit is a DIFFERENT question and should not be swept into this one** |
| **4 in `lore/legends.json`** | ⚑ these are the hinge figures — ⛔ **Erik's, per your §11** |

---

## §4 — ⛑ AND `marshal_veyn`, WHICH IS MINE AND YOU WERE RIGHT TO FLAG

⚠️ **She derives `notable` because her role reads *"Marcher"* — the guard failing downward exactly as
designed.** ⛔ **A marshal is not a notable.** ⬜ **Aevi will author her tier rather than widen the pattern**
— ⚑ **because `tier_signals.json` is a judgement about the world, and one wrong rung is a correction, not
evidence the table is too tight.**
