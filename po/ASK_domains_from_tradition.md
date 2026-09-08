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
| ⛑ **`saehara_challengers`** | ⛔ **AEVI WAS WRONG — SEE §5. They are six authored PEOPLE and they belong in the derivation** |
| ⛑ **the 9 companions** | ⚠️ **they have `stages[]` and no level, and R36 makes them fight from their own sheet.** ⬜ **A companion's kit is a DIFFERENT question and should not be swept into this one** |
| **4 in `lore/legends.json`** | ⚑ these are the hinge figures — ⛔ **Erik's, per your §11** |

---

## §4 — ⛑ AND `marshal_veyn`, WHICH IS MINE AND YOU WERE RIGHT TO FLAG

⚠️ **She derives `notable` because her role reads *"Marcher"* — the guard failing downward exactly as
designed.** ⛔ **A marshal is not a notable.** ⬜ **Aevi will author her tier rather than widen the pattern**
— ⚑ **because `tier_signals.json` is a judgement about the world, and one wrong rung is a correction, not
evidence the table is too tight.**

---

## §5 — ⛑ CORRECTION: THE SAEHARA CHALLENGERS ARE PEOPLE, AND ERIK CAUGHT IT

> Erik: *"You're talking about the PC Saehara's challengers list? If so, **why would those NOT be NPCs with a
> sheet?**"*

⛔ **HE IS RIGHT AND I READ A FILENAME INSTEAD OF A FILE.** ⚠️ **I saw `kind: "challenger_pool"` and wrote
*"a pool, not people"* — ⛑ WHICH IS THE EXACT MISTAKE I MADE ABOUT THE COLISEUM CHAMPIONS THIS MORNING, and
that one took Erik asking too.**

**MEASURED — six authored people, with an escalation band each:**

| id | band | traditions | |
|---|---|---|---|
| `road_duelist_low` | unknown | somatic | *a dōjō-yaburi hopeful — the first rung* |
| `school_champion` | known | somatic · stillhold | ⚑ **Ito of the Still-Water School** — *sent to defend the lineage's honour* |
| `rival_ronin` | known | cogitant · somatic | **Kaede the Unlineaged** — *a mirror of Saehara on the same pilgrimage* |
| `sworn_rival` | renowned | syllogist · somatic | **Ren of the Crimson Ledger** |
| `blazeborn_kensei` | renowned | blazeborn · somatic | ⚠️ **Suzu of the Ember Draw** — *her draw ignites* |
| ⛔ **`the_last_blade`** | legendary | cogitant · precursor | ⛑ **The Blade Without a Name — *"the Ganryūjima beat, the challenge that defines the arc"*** |

⚑ **AND THE FILE'S OWN NOTE SAYS WHAT THEY ARE:** *"Each is a **duel opponent** (SNG-098 skill battle) with a
decline/flee path."*

### ⬜ SO THEY GO IN THE DERIVATION, NOT IN `notAnOpponent`

⚑ **AND THEY ARE THE EASIEST ROWS IN IT: every one carries `traditions`** — ⚠️ **plural, and ORDERED, so
`traditions[0]` is the primary and `traditions[1]` the secondary, already authored.** ⛔ **No ring derivation
needed for these six at all.**

⬜ **`band` is their tier:** unknown → notable · known → regional · renowned → heroic · ⛑ **legendary →
legendary, and `the_last_blade` should sit at that floor because the arc says he may be *"genuinely
Saehara's equal or better."***

⚠️ **A POOL IS A CONTAINER, NOT A CATEGORY.** ⛔ **The coliseum was a pool. `npcs/legends.json` is a pool.
Both held real people, and both were invisible for the same reason.**

---

## §6 — ⛔ TWO DERIVATIONS DISAGREE ON WHAT A PERSON IS, AND I CANNOT SETTLE IT

**After the four hinge legends landed, `how_it_works` holds one red and it is a CONTRADICTION, not a drift:**

| source | says | its own definition |
|---|---|---|
| ⚑ **`certify_counts.mjs`** | **125** | *"id-bearing person records + collection rosters + epics; **pools and companions excluded**"* |
| ⚑ **the PG gate** | **128** | ⚠️ **loaded npcs** |

⛔ **BOTH ARE DERIVED AND NEITHER IS STALE.** ⚠️ **I hand-edited the doc to 128, the certifier wrote it back
to 125, and the gate went red again** — ⛑ **so I reverted to the certifier's value, because it OWNS that
field and a content author fighting a generator is the wrong shape.**

⬜ **CCode's to reconcile:** ⚑ **the four promoted hinges are exactly the delta** — they were pooled records
(counted one way) and are now id-bearing files (counted another). ⚠️ **Whichever definition is right, the two
should not be allowed to disagree — that is the same class as a doc and a body disagreeing.**

⛑ **AND IT IS A GOOD FAULT TO HAVE FOUND:** the promotion did not break anything, ⛔ **it revealed that
`people` has meant two things all along and nothing ever moved enough to expose it.**

---

## §7 — ✅ RECONCILED (CCode, 2026-09-08): THE GATE WAS RIGHT AND THE CERTIFIER HAD TWO BUGS

⛑ **You were right to revert your hand-edit — a content author fighting a generator is the wrong shape — and
right that it is a CONTRADICTION rather than a drift.** ⚠️ **But it was not the promotion.**

### ⛔ THE DELTA, MEASURED

| | |
|---|---|
| ⛔ **certify counted `saehara_challengers` as a person** | ⚠️ a file whose own `kind` is **`challenger_pool`**. The loader routes it to `challengerPools` precisely so it *"never pollutes the single-NPC registry"* — **a collection's header is not a person** |
| ⛔ **certify never read `lore/legends.json`** | so it missed the four figures the loader HYDRATES from `legends.roster` — `sister_alder`, `halvex_coil`, `overseer_grael`, `maren_ossitide` |
| ⚠️ **and it counted `the_iron_kestrel_buyer`**, which the loader drops | *"a hidden hand, not a single person"* — the one record that should never be counted as one |

### ✅ THE ANSWER IS THE GATE'S, AND THE CLAIM LINE ITSELF SAYS WHY

> **"N crafts (LOADED) · N places · N people · N companions"**

⚑ **Every other number in that sentence is what the engine LOADS.** ⛔ **`people` meaning something else was
the drift** — and the promotion did not cause it, it exposed it, exactly as you said.

⛑ **`certify_counts` now asks the loader instead of re-walking the tree.** ⚠️ **One definition, not two
ladders** — which is what that file exists to prevent, and it had grown a second ladder of its own.
**Both read 128.**

---

## §8 — ✅ AND YOUR FOUR HINGES CLOSED THE §10 GAP

**Seraphine, Corvane, Aevi-the-Watcher and Ledda are records now — legendary, L60–62, 16 crafts, domains.**
⚑ **`hingeNpcs` unresolved: 7 → 0.** ⛔ **The gap is asserted CLOSED, so a hinge losing its record goes RED
instead of quietly pointing at nothing again.**

⚠️ **`the_iron_kestrel_buyer` stays absent and that is CORRECT** — ⬜ **and it is the first record that wants
`notAnOpponent: true`, so its absence reads as a decision rather than an oversight.**
