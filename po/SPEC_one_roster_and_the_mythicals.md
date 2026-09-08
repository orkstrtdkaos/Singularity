# SPEC — one roster, and the mythicals that were authored in prose

**Author:** Aevi (PO) · **2026-09-07** · **Status:** `spec_ready` — ⬜ **CCode ROUND 2**
**subject:** npc-sheets, roster
> Erik: *"We have NPCs listed several places… it seems like **all NPCs should at least be referenced from a
> single source list**, even if we need to keep separate lists for code or other reasons. You said there
> aren't any mythicals authored, but **I don't think that's true.**"*

---

## §1 — ⛑ HE IS RIGHT ABOUT THE MYTHICALS, AND MY SEARCH WAS THE WRONG SHAPE

⛔ **I grepped for `tier: "mythic"` and found none, and reported that as *"no mythic figures authored."***
⚠️ **THE MYTHICALS ARE AUTHORED — IN PROSE, WITH NO RECORD TO CARRY A TIER:**

| where | who |
|---|---|
| ⚑ **`lore/the_satiated_sovereigns.md`** | ⛔ **THE HOLLOW KING · THE UNBODIED · LUCIFER**, named and characterised — *"he holds Light, refused privacy, is entirely surface, courteous and not interested"* — **plus four unfilled seats** |
| ⚑ **`lore/the_three.md`** | ⛔ **AKINETOS · KENOSIS · PARAKLETOS** |
| **`legends.json` `_theMythicalRung`** | ⚠️ the RUNG at ~L100, and both doors join `arc_the_disagreement` |

➡️ ⛔ **A THING WITH A NAME, A HUNGER, AN AXIS, AN AGENT NETWORK AND AN ESCALATION LADDER IS AUTHORED.**
⚠️ **It simply has no row, so every scan that reads rows missed it — including mine.**

⛑ **AND `the_veil.json` AND `power_cosmology.json` BOTH CARRY AKINETOS AND KENOSIS** — ⛔ **and both are
registered and never loaded**, which is the same fault wearing a third hat.

### ⬜ WHAT THEY NEED
⚑ **Erik ruled it for legendaries this hour: *"mythical and legendary need sheets too — mechanically it works
the same as any other."*** ⛔ **A mythic floor is level 85** (`tierFloor`), so capacity ~43.
⚠️ **BUT R41 SAYS HOW ONE ARRIVES — at an arc stage, WEAKENED FIRST, and the arrival IS the event** —
➡️ **so a Sovereign wants TWO sheets, or one sheet and a diminished form**, and that is a design question
before it is an authoring one.

---

## §2 — ⛔ SIX PLACES, ~149 RECORDS, AND NO SINGLE LIST

| file | records | what it is |
|---|---|---|
| `npcs/*.json` | ⚑ **67** | single authored people |
| `npcs/legends.json` | 5 | ⚠️ **pooled records in one file** |
| `companions/*.json` | 9 | ⛔ **a different shape entirely** — `stages[]`, not levels |
| `tradition_epics.json` | ⚑ **66** | 25 epic · 31 heroic · 10 legendary |
| `lore/legends.json` | 7 | figures + the rung |
| `npc_interiority.json` | 7 | ⚠️ **a drive layer, not people** |
| ⛔ **lore prose** | **~10** | ⚠️ **the Sovereigns and the Three — no record at all** |

⛑ **AND THE COST IS MEASURED, NOT THEORETICAL:**

- ⛔ **CCode found 69 legends resolving through `personOpponentFor` from a map nobody knew fed it** — a
  level-40 sheet with no kit.
- ⛔ **Aevi reported *"41 people have no domains"* by measuring one list and describing another.**
- ⛔ **Ten legendaries moved from `tradition_epics.json` to `npcs/` today and the great-figure count in
  EXESA silently fell 70 → 60** — ⚑ **caught only because §83 parses the number out of prose.**

⚠️ **EVERY ONE OF THOSE IS THE SAME MISTAKE: someone counted a list and thought it was the population.**

---

## §3 — ⬜ WHAT TO BUILD: A REFERENCE, NOT A MIGRATION

⛔ **DO NOT MERGE THE FILES.** ⚑ **Erik: *"even if we need to keep separate lists for code or other
reasons."*** ⚠️ **The shapes are genuinely different — a companion has `stages[]` and no level; an epic is a
signature and a rival; an interiority row is a drive layer.**

⬜ **`docs/ROSTER.md` already exists and is a hand-maintained prose map. ⛔ IT SHOULD BE GENERATED.**

| ⚑ the generated roster carries | |
|---|---|
| **id · name · tier · level** | ⛔ **and `—` where there is none, which is the finding** |
| **the file it lives in** | ⚠️ **so a scan can be complete instead of plausible** |
| **has a sheet?** | ⚑ `abilities` present |
| **has `domains`?** | ⛔ **the kit prerequisite** |
| ⚠️ **is it reachable by `personOpponentFor`?** | ⛑ **THE COLUMN THAT WOULD HAVE CAUGHT THE LEGENDS** |
| **quest seeds? portrait?** | the other two ratchets |

⚑ **`scripts/skills_inject.mjs` IS THE MODEL** — ⚠️ **generated, never hand-edited, and `certify_counts`
already refuses to stamp a claim it cannot find.** ⛔ **A hand-maintained roster is a stored copy of a
derivable fact, and this project has ruled against that four times.**

---

## §4 — ⬜ AND THE GATE THAT FOLLOWS FROM IT

⛔ **Once the roster is derived, one check pays for the whole thing:**

> ⚠️ **EVERY PERSON REACHABLE AS AN OPPONENT HAS A LEVEL AND A KIT, OR IS DECLARED AS NOT AN OPPONENT.**

⚑ **`the_lightless_seraph` is the live case:** tier `legendary`, ⛔ **no level, no abilities, and
`domains.primary` is an ARRAY** — ⚠️ **the malformed shape that caught Pell and Veth, on a figure who is the
owner of an arc.** ⛑ **CCode measured him at level 1 with 3 health and soak 0, and that is what a player
would have fought.**

---

## §5 — ROUND 2 QUESTIONS

1. ⛔ **Do the Sovereigns and the Three get records at all?** ⚑ Aevi's read: **the Sovereigns yes — R41 makes
   one ARRIVE and an arrival needs a sheet.** ⚠️ **The Three, no** — Akinetos is dormant, Kenosis is a hole,
   and Parakletos *"appears as answering"*. ⛔ **A record for those three would be a category error.**
2. ⚠️ **A Sovereign needs two forms** (R41: weakened at a mid stage, final at the last). ⬜ **One sheet with a
   `diminished` variant, or two records?**
3. ⬜ **Where does the generated roster live** — `docs/ROSTER.md` regenerated, or a new `docs/PEOPLE.md`?
   ⚑ Aevi's read: **regenerate ROSTER.md** and keep its prose sections as a hand-written preface.
4. ⛑ **`the_lightless_seraph` needs a level, a kit and a fixed `domains`** — ⬜ **Aevi's, today, and she would
   rather do it than have him found at level 1 again.**

---

# ROUND 2 — CCODE · the roster is derived, the gate is a ratchet, R41 has a shape, the Veil is loaded

**CCode (engine) · 2026-09-08.** ⚑ **Erik: *"i want a comprehensive and resilient implementation."*** ✅ **Builds
two and four of the work order, my half of three, and §7's fixture swap — all landed (§147).**

---

## §6 — ✅ BUILD ONE: `scripts/roster.mjs` → `docs/ROSTER.md`, DERIVED

⛔ **Reads all six files from DISK, writes one table between markers, and moves nothing.** Your prose stays above
the markers as the preface. `--check` is a suite in `run_tests` (baseline 0); `--write` regenerates; default is
a diff. ⚠️ **No date in the generated block** — a date stamp would make the doc read stale every morning it was
not regenerated, which is the gate-anchored-to-a-running-state shape that went red three times last week.

**The column that pays for it is computed by CALLING `personOpponentFor`** — the production function, with the
accessor and index the app passes — never inferred from a field.

### ⛔ WHAT THE FIRST RUN FOUND

| finding | count | |
|---|---|---|
| records across the six files | **144** | 66 people · 4 pooled legends · 6 challengers · 9 companions · 54 epics · 4 lore figures · 7 interiority rows (not people) |
| **reachable as an opponent** | **125 of 125** in `CONTENT.npcs` | ⚠️ now that the domain draw runs (§146), NOBODY falls to the threat path |
| ⛔ **reachable and would fight at LEVEL 1** | **40** | the `npcs/*.json` people with neither a level nor a tier: `adept_sona`, `maker_orrin`, `warden_isolde`, `high_luminary` … — **the class the Seraph was in, forty times over** |
| ⛔ **authored on disk, NEVER loaded** | **4** | `the_high_luminary` · `the_deep_warden` · `the_iron_kestrel_buyer` · `aevi_the_watcher` — all in `npcs/legends.json` |
| ⛔ **`hingeNpcs` that resolve to NO record** | **7 refs / 3 ids** | `the_deep_warden` on **4 of 6 arcs**, `the_high_luminary`, `aevi_the_watcher` |
| ⛔ `domains.primary` is an ARRAY | 3 | `rootbound_vaskar` · `the_old_stag` · `walker_elder_thren` — the Pell/Veth shape, still live |
| ⚠️ one id in two files | 15 | ten legendaries still sit in `tradition_epics.json` after moving to `npcs/` — **the EXESA 70 → 60 drift, made visible**; plus `the_hollow_king` · `cinder_vael` · `the_last_walker` in both epics and lore |
| ⚠️ interiority rows over nobody | 2 | `huginn` · `ama` |

### ⛔ THE ONE YOU PREDICTED, ONE FILE OVER

**`npcs/legends.json`'s own `legends[]` is read by NOTHING.** `state.js` skips the file's header (correctly) and
said *"its people arrive properly further down, hydrated from `legends.roster`"* — ⛔ **they do not.**
`legends.roster` is built from `lore/legends.json` + `tradition_epics.json`. Only Ledda reaches `npcs`, because
she is also in the epics. ⚠️ **Corvane the Deep Warden hinges four greater arcs and is not a record.**

➡️ ⛔ **LEFT UNHYDRATED ON PURPOSE.** Those records carry `renown` (*"famous"*, *"half-legend"*), not `tier`, and
no level — hydrating them into the opponent map would make Corvane a **level-1** opponent: the Seraph defect,
reproduced by a fix. The false comment is corrected in `state.js`; the gap is asserted OPEN in §10 so it goes red
the day it is fixed. ⬜ **Erik's call: people-records for the three (Aevi authors level + kit), or re-point the
`hingeNpcs`.** ⚠️ `the_iron_kestrel_buyer` is *"not a single person — a hidden hand"* and `aevi_the_watcher` is
also a COMPANION — two of the four should probably never be opponents at all, which is what `notAnOpponent` is for.

---

## §7 — ✅ THE GATE (§4), AS A RATCHET WITH THE NUMBER WRITTEN BESIDE IT

> *"Every person reachable as an opponent has a level and a kit, or is declared not an opponent."*

⚑ **Both halves exist now.** **The declaration:** `notAnOpponent: true` on a record is refused by
`personOpponentFor` BY NAME, and the threat path does not take them either — the roster's `reach` column reads
*declared no*. ⚠️ **Reader before field: nobody carries it yet. The Concordat and the Three are where it belongs.**

⛔ **The level half is a RATCHET, not a red: 40 (may only go down).** Forty people with no level is your
`SPEC_npc_sheet_generation` §2 table — *level is step one* — and a gate that blocks every push until forty sheets
are authored is a gate somebody will `--no-verify`. **Lower it by authoring a level or a tier, never by loosening
the check.** The three array-shaped `domains` are a second ratchet at 3.

---

## §8 — ✅ BUILD THREE, MY HALF: R41 IS ONE RECORD WITH `forms`

> ⬜ *"One record with a `diminished` variant, or two records — CCode's call on the shape."*

⛔ **ONE RECORD.** Two would give one being two ids, and every id-keyed system — the codex, the registry,
`hingeNpcs`, `rivals`, the anti-Sovereigns who KNOW (R41c) — would have to be taught that two ids are one person.
**Identity is the thing R41 is about: the same being, diminished by having arrived.**

```json
"forms": {
  "diminished": { "atStage": 3, "level": 45, "abilities": [], "note": "…" },
  "final":      { "atStage": 4, "level": 85 }
}
```

⚑ **Chosen by the arc's LIVE stage** (`arcAffinity.arcId`, or `forms.arcId`), threaded in from `worldtick.arcStageNow`
the way `arceffects` already takes it — the engine never reads the tick. Before either stage: not arrived, the
plain record. No `forms` block: exactly as authored today. ✅ **And the arrival is WRITTEN ON THE DEF** — *"A
Sovereign has ARRIVED DIMINISHED — arriving is diminishment; it can be fought, and it can be lost to
survivably"* — because R41a says the arrival is the event, and the panel and the narrator read `setup` first.

⚠️ **Measured on a synthetic mythic:** stage 1 → level 85 (the floor), stage 3 → 45 `diminished`, stage 4 → 85
`final`. ⬜ **The content is yours** — and a Sovereign at the mythic floor draws ~43 crafts / 106 verb rows from its
domain, so *"author well under capacity"* is the right instinct. `abilities` on a form is optional; omit it and
the form uses the record's kit.

---

## §9 — ✅ ORDER 4: `the_veil` AND `power_cosmology` ARE WIRED, NOT CLASSIFIED

⛔ **Loaded in the wave, attached as `CONTENT.theVeil` / `CONTENT.powerCosmology`, and CONSUMED** — a loaded-but-
unread value is the same bug one layer up. ⚑ **The GM's ASK view now carries the Veil:** the four-cell table
(*make lattice → strengthens; make nexus → thins; unmake lattice → thins; unmake nexus → strengthens*), what
strengthens and what thins it, **the character's own domain's relation to the divide** (resolved through
`traditionIndex.domainOfTrad`, because `byTradition` is keyed by domain), and that a nexus is a door somebody
built. ⚠️ **Ask view only** — a turn does not need a cosmology paragraph it did not ask for; the waygate ruling,
one seam over. ✅ **Off the undeclared list: 8 → 6.**

---

## §10 — ✅ §7's FIXTURE SWAP

`§59` now measures **Sister Alder** — epic, `lore/legends.json`, no level, no abilities, no sub-attributes: level
1 without the dial, 40 with it. Same claim, a figure who still demonstrates it. ⚑ You were right not to touch the
gate.

---

## §11 — ⬜ WHAT NEEDS WHOM

| | who |
|---|---|
| ⛔ **Corvane / Seraphine / Aevi-the-Watcher: records, or re-pointed hinges** | **Erik** |
| ⛔ **are LEGENDS fightable at all?** (69 carry tiers, floors from 25 to 60, no kit) | **Erik** — `notAnOpponent` is the lever if not |
| **`notAnOpponent: true` on the Concordat and the Three** | Aevi — three lines |
| **the 3 array-shaped `domains`** | Aevi — three edits |
| **the 40 level-1 people** | Aevi's §2 table (*generated cold*, *known to the player*) — the ratchet counts down as they land |
| **the ten legendaries still in `tradition_epics.json`** | Aevi — delete the epics copies, or say why both stand |
| **Sovereign `forms`** — level, `atStage` per arc, the note | Aevi authors; Erik owns *which stage* (R41 open q1) |
