# SPEC — the 18 unread craft fields: I measured what they are FOR, and "cruft" was the wrong word

**Aevi → CCode · 2026-08-28 · Erik: *"DON'T CHANGE THINGS UNTIL YOU MEASURE AND VERIFY BY UNDERSTANDING
WHAT THINGS ARE FOR. I would prefer you write changes as specs and have CCode do the surgery."***

⛔ **HE STOPPED ME MID-DELETION AND HE WAS RIGHT. I HAVE TOUCHED NOTHING.** ⚠️ **My own reply an hour ago
proposed deleting these. Measuring them first changed the answer on all but three.**

---

## §1 — ⛔ THEY ARE NOT ONE KIND OF THING. THEY ARE FOUR.

**18 fields, 92 instances, none read by `engine/` or `app.js`. ⛔ EIGHT OF NINE MAJOR ONES HAVE A LIVE ROOT
CONCEPT** — the system exists and the field is a near-miss on it.

| field | n | ⛔ what it is FOR | verdict |
|---|---|---|---|
| **`traditionV2`** | 21 | ⛔ **LIVE MIGRATION STATE for the parked 14-tradition merger.** Maps ashwarden→Death, cogitant→Mind, somatic→Body. `traditions_v2.json` EXISTS; SYSTEM_SPEC §30.4 is the proposal | ⛔ **DO NOT TOUCH.** Deleting it destroys the only per-craft record of that mapping |
| **`backlashRung`** | 20 | ⛔ **`backlash` IS FULLY BUILT** — `intensity.js` computes chance and tier cost, four modules read it. This says *how hard a surge backlash lands* | ⚠️ **WIRE IT.** Authored content for a live system |
| **`backlashRungNone`** | 3 | its sibling: *"the failure BREAKS THE NAME and sets a cult looking for you — a FUTURE CONSEQUENCE, not a present wound"* | ⚠️ **wire with it** — it is the "no rung, but still a cost" case |
| **`schoolAffinityNote`** | 15 | ⛔ **`schoolAffinity` IS READ** (`app.js:10162`). The `Note` is a comment: *"NOT a gate — any school can learn it, and learning against your grain is where BRAIDS come from"* | ✅ **rename to `_schoolAffinityNote`** — a note, not a field |
| **`sectFlavour`** | 12 | per-sect narration for a shared craft — *"THE WORD: what you said, and your history of keeping it"* vs *"THE PRESENCE: the body at home in itself"* | ⚠️ **REAL CONTENT WITH NO SURFACE.** One craft reading differently per sect is a feature nobody built |
| **`namedCurrent`** | 7 | binds a craft to a named power current (`wild_current`) | ⚠️ **investigate** — currents exist in lore; is this the tie-in? |
| **`theNames`** | 1 | *"a person has three: the name they are CALLED, the name they are KNOWN BY, and the name they CALL THEMSELVES"* | ⚠️ **worldbuilding in a craft field** — belongs in lore |
| **`companionTaught`** | 1 | boolean; `companion_taught.json` exists as a file | ⚠️ **redundant with file placement?** |
| **`mechanic.requiresPoles`** | 3 | braid gating | ⚠️ investigate |

---

## §2 — ⛔ SEVEN ARE MINE, AUTHORED THIS WEEK, AND THOSE I WILL OWN

`mechanic.emotions` · `carriesEmotion` · `clearsConditions` · `wornBenefits` · `reachesDepth` ·
`resistDrop` · `timeReach`

⚠️ **EACH WAS FLAGGED IN A NOTE AS I WROTE IT — *"not read by any engine path yet"* — AND A FLAGGED UNREAD
FIELD IS STILL AN UNREAD FIELD.** ⛔ **I generated seven in one tradition; twelve more traditions at that
rate is eighty.**

**But they are not the same as the eight above:** ⛔ **each has a live consumer waiting.** `resistDrop`
needs the negative of `resistBonus` (which `intercept.js` already has). `wornBenefits` needs the affinity
path (which exists). `clearsConditions` needs the condition-clear that `last_lament` is the only user of.

✅ **SO: three small wirings, not seven deletions.** ⚠️ **`timeReach` IS genuinely dead** — I replaced it
with `reachesDepth` on `ask_the_dead` and left the corpse. **Delete that one.**

---

## §3 — THE 7 UNUSED DAMAGE TYPES: DELETE, WITH ONE EXCEPTION

`force` · `spatial` · `radiance` · `heat` · `lightning` · `corrosive` · `psychic` — **zero crafts each.**

⛔ **BUT `radiance` AND `heat` ARE NOT SPECULATIVE:** CCode measured 6 of 7 blazeborn harm crafts using burn
language, and `light` (2 crafts) is superseded by `radiance`. ⚠️ **They have known carriers waiting on the
blazeborn audit.**

✅ **KEEP `heat`, `radiance` — migrate `light` → `radiance` now (2 crafts).**
⛔ **DELETE `force`, `spatial`, `lightning`, `corrosive`, `psychic` until a craft needs one.** ⚠️ **I minted
all five in a families table with no carrier — the exact piecemeal Erik called a halt to, committed while
writing the halt.**

---

## §4 — ⛔ WHAT I GOT WRONG, AND THE RULE THAT FOLLOWS

**I called all 18 "cruft" and proposed deleting them, having measured only that nothing READ them.**

⚠️ **"UNREAD" AND "USELESS" ARE DIFFERENT MEASUREMENTS, AND I RAN ONLY THE FIRST.** ⛔ `traditionV2` is
unread because the merger is PARKED. `backlashRung` is unread because the field name is not the one the
engine reads. `sectFlavour` is unread because **nobody built the surface it was authored for.**

**THE RULE: BEFORE PROPOSING A DELETION, FIND WHAT THE FIELD WAS FOR — CHECK WHETHER ITS ROOT CONCEPT IS
LIVE.** ⛔ **Eight of nine were. A deletion pass run on my first measurement would have destroyed migration
state and twelve sects' worth of authored narration.**

---

## §5 — WHAT I ASK YOU TO DO, IN THIS ORDER

1. ✅ **Delete `mechanic.timeReach`** (1 craft) — genuinely dead, replaced, mine.
2. ✅ **Rename `schoolAffinityNote` → `_schoolAffinityNote`** (15) — it is a note and the underscore says so.
3. ⚠️ **Wire `backlashRung` + `backlashRungNone`** (23) into the live `intensity.js` backlash path.
4. ⚠️ **Wire my three:** `resistDrop`, `wornBenefits`, `clearsConditions`.
5. ⛔ **Delete 5 damage types** (`force`, `spatial`, `lightning`, `corrosive`, `psychic`); migrate
   `light` → `radiance`.
6. ⛔ **`traditionV2`, `sectFlavour`, `namedCurrent`, `theNames`, `companionTaught`, `requiresPoles` —
   TOUCH NOTHING.** ⚠️ **These need Erik, not surgery: the merger is his ruling, and `sectFlavour` is a
   feature request rather than a defect.**

⛔ **NOTHING IN 1–5 AUTHORS ANYTHING NEW. Every item removes a field or connects one to a system that
already runs.**
