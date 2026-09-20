# SPEC — Name the people in the ledger, and promote the people worth knowing.

**Aevi · 2026-09-20 · for CCode.** Erik: *"I want the world scenes to be fixed and to promote more npcs to the One
World state."*

---

## ⛔ §1 — FIRST, I CORRECT MYSELF: `world/scenes/` IS NOT BROKEN

In `FINDING_aevi_one_world_ledger_scope.md` §3 I flagged *"scene capture looks like it stopped"* because the newest
file is 2026-09-07. ⚠️ **Wrong, and wrong in my recurring way — I read the FOLDER NAME and assumed the contents.**

`engine/party.js:1` — *"SNG-001 phase 1: **shared scenes. Two+ characters occupy one scene**: same anchor, ordered
beat log, round-robin turns."* ⛑ **A scene file exists only when two players CO-PLAY.** The last one is dated
Sept 7 because **nobody has co-played since.** Nothing is broken and there is nothing to fix there.

⚑ **What Erik actually wants — what happened in Courtney's session being visible to Loki's GM — is the LEDGER, and
it already works.** Written today:

```
worldDay 82 · char-mr5ns3hh · millbrook
  "A wayhouse healer named a patient whose pulse has worsened overnight — two days in, insisting he is fine"
```

⛑ **Her scene IS in the shared world. It is read, too** — `app.js:843` *"the travelers index and the WHOLE ledger,
refreshed on the tick"*, handed to the GM at `app.js:7576` as `sharedLedger`.

---

## ⛔ §2 — THE ACTUAL DEFECT: THE READER IS KEYED BY PERSON AND THE ROWS NAME NO PERSON

`app.js:843` — *"the reader keyed by **PERSON** reads these."* ⛔ **A person-keyed reader cannot match a row that
names nobody.**

**Measured across all three ledger months — 50 rows:**

| | |
|---|---|
| rows naming a proper noun | ⛑ **44** |
| ⛔ **rows describing by ROLE only** | ⛔ **6 — and Courtney's is one of them** |

> *"**A wayhouse healer** named a patient…"* ⚠️ **not "Sister Vreni".**

⛑ **So the pipe is whole and the payload is anonymous.** ⚑ **Loki's GM was handed a ledger that said a healer did a
thing at Millbrook, with no name to bind it to — and invented a Vreni because nothing told it there already was
one.**

**FIX — a ledger row carries its people structurally, not only in prose:**

```json
{ "worldDay": 82, "who": "char-mr5ns3hh", "where": "millbrook",
  "what": "…",
  "people": [ { "id": "sister-vreni", "name": "Sister Vreni", "role": "Wayhouse sister" } ] }
```

⚠️ **Prose alone is not a key.** ⛑ **The writer already knows who was in the scene — it is in the character's own
`npcRegistry`. It simply is not carried across.** ⬜ **Backfilling the six existing role-only rows is optional;
naming them going forward is the fix.**

---

## ⛑ §3 — PROMOTION: THE NUMBERS MAKE THE CASE BY THEMSELVES

| | |
|---|---|
| authored NPCs in content | **100** |
| quest givers across live saves | **14** |
| ⛔ **of those, in shared `people` or `fates`** | ⛔ **NONE** |
| shared `people` | 3 promoted legends |
| `fates` | 42 |
| ⚠️ **`lives`** | ⛔ **0 — never used** |

**Adelheid's own `npcRegistry`, with SNG-333's `met` counter:**

| | met | |
|---|---|---|
| `mara-wells` | **20** | Millbrook civic manager |
| ⛔ **`sister-vreni`** | ⛔ **17** | Wayhouse sister from the pass road wayhouse |
| `piotr` | 9 | Terrace farmer, Terrace Three east |
| `edvar-crane` | 4 | Mill resident and water-reader |

⛔ **SEVENTEEN MEETINGS. Full local record — id, name, role, description, met-count. Not one byte of it reaches the
shared world.** ⚑ **Loki's registry holds 11 people and no Vreni at all.**

**PROMOTE ON EITHER, WHICHEVER FIRES FIRST:**
1. ⛑ **the NPC is a quest `giver`** — a multi-stage relationship IS the world caring
2. ⛑ **`met >= 3`** — three separate meetings is a person, not a passerby

⚑ **Four of Adelheid's four would promote. `edvar-crane` at met=4 is the kind of case that proves the bar is set
right: he matters to the water story and he is nobody's legend.**

**PUBLISH TO `lives`** — it is empty and it is exactly the right home: *who this person is*, against `fates`'
*what became of them*. Carry **id · name · role · description · first seen · where · which character met them.**

⚠️ **PUBLISH THE PERSON, NOT THE KNOWING.** A life is public; **what Adelheid privately learned, suspects or feels
about Vreni is hers.** ⛑ `canonForViewer` already exists for exactly this lens — **use it rather than a second
one.**

---

## ⛔ §4 — TWO DATA FAULTS THAT WILL BREAK THIS IF PROMOTION SHIPS FIRST

**(a) `giver` IS UNNORMALIZED.** The 14 live values are three different things:

| shape | examples |
|---|---|
| an **id** | `sister_vreni` · `keeper_ilma` · `water_keeper` · `fendt` · `high_luminary` · `brin.millbrook.child` |
| a **display name** | `Mara Wells` · `Edvar Crane` · `Maren` · `Aldric (smokehouse man)` |
| ⛔ **not a person at all** | `Warden Council bulletin (Lower Terrace)` · `Sorel (via Mara Wells)` · `the elder of the Unlit Deep` · `Saehara Makashi (self-initiated)` |

⛔ **Auto-promoting on `giver` today would mint a shared person called "Warden Council bulletin (Lower Terrace)".**
**Normalize `giver` to an id first, and let the `met >= 3` rule carry the ones that cannot be resolved.**

**(b) ⚠️ THE ID ALREADY DRIFTS THREE WAYS FOR ONE WOMAN:**

| `sister-vreni` | hyphen — Adelheid's `npcRegistry` |
| `sister_vreni` | underscore — the quest `giver` and the content file |
| **"Venri"** | what Erik and Loki's GM both SAY |

⛔ **Promote before normalizing and you get two shared people for one person, which is worse than none.** ⛑ **And
the spoken drift is the symptom worth keeping as a canary: a name nobody shares is a name that mutates.**

---

## §5 — ⬜ ORDER

1. ⛑ **normalize NPC ids** (hyphen vs underscore) and **normalize `giver` to an id** — ⛔ before anything is promoted
2. **ledger rows carry `people[]`** — the smaller fix, and it is what answers Erik's complaint directly
3. **promote on `giver` OR `met >= 3`, publishing to `lives` through `canonForViewer`**
4. ⬜ **a gate: no ledger row names a person in prose without listing them in `people[]`** — ⚠️ **otherwise this
   regresses silently, and a silent regression here reads exactly like a GM making things up**

— Aevi
