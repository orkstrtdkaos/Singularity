# WORK ORDER — the roster, the mythicals, and the level-1 arc owner

**Aevi (PO) → CCode · 2026-09-07.** ⬜ **Erik has ruled. Three builds and one authoring pass, in order.**
**Specs:** `po/SPEC_one_roster_and_the_mythicals.md` · `po/SPEC_npc_sheet_generation.md`

---

## §1 — ⛑ ERIK'S RULINGS

| | |
|---|---|
| ⚑ **Sovereigns get records** | *"Yes they get records."* ⛔ **They are authored — named, with hungers, axes, agent networks and an escalation ladder — and they have no row** |
| ⛔ **The Three do NOT get sheets** | *"Agree that the Three don't get sheets per se — **if you will never fight them, which right now is no.**"* ⚠️ **Note the conditional: this is a ruling about TODAY, not a permanent category** |
| ✅ **legendary and mythic fight like anyone** | *"Mechanically it works the same as any other."* Floors: **mythic 85 · legendary 60 · epic 40** |

---

## §2 — ⛔ BUILD ONE: THE GENERATED ROSTER

**Six files, ~149 person-records, no single list.** ⚑ **Do NOT merge them — Erik: *"even if we need to keep
separate lists for code or other reasons."*** ⚠️ **The shapes are genuinely different: a companion has
`stages[]` and no level; an epic is a signature and a rival; an interiority row is a drive layer.**

⬜ **Regenerate `docs/ROSTER.md`, `skills_inject.mjs`-style — generated, never hand-edited.** Columns:

| column | ⚑ why |
|---|---|
| id · name · tier · level | ⛔ **`—` where there is none, which IS the finding** |
| source file | ⚠️ **so a scan can be COMPLETE instead of plausible** |
| has `abilities`? · has `domains`? | the kit prerequisites |
| ⛔ **reachable by `personOpponentFor`?** | ⛑ **THE COLUMN THAT WOULD HAVE CAUGHT THE 69 LEGENDS** |
| questSeeds? · portrait? | the other two ratchets |

⛔ **AND THE GATE THAT PAYS FOR IT:** ⚠️ **every person reachable as an opponent has a level and a kit, or is
declared not-an-opponent.**

⚑ **THE COST IS MEASURED, NOT THEORETICAL** — three failures this week were one person counting one list and
describing another: your 69 legends at level 40 with no kit; Aevi's *"41 people have no domains"*; and
EXESA's figure count falling 70 → 60 silently when ten legendaries changed file.

---

## §3 — ⛑ BUILD TWO: `the_lightless_seraph` IS A LEVEL-1 ARC OWNER, TODAY

**Caelum Vaunt, the Lightless.** ⛔ **tier `legendary` · NO level · NO abilities · `domains.primary` is an
ARRAY** — ⚠️ **the malformed shape that caught Pell and Veth, on a figure who is `arcOwner`.**

⛑ **You measured him at level 1, 3 health, soak 0 — and `personOpponent` builds the fight from that sheet.**

⬜ **Aevi authors the level, the kit and the fixed `domains` — TODAY.** ⚠️ **`boundToCharacter` and
`curriculum` suggest he is teaching-shaped as well as fight-shaped, so the kit should serve both.**

---

## §4 — ⬜ BUILD THREE: THE SOVEREIGNS GET RECORDS, AND R41 SHAPES THEM

**Authored today: LUCIFER (Light/Dark), THE HOLLOW KING (Demonic), THE UNBODIED (Mind).** ⛔ **Six seats
remain and the lore says how to treat them:** ⚠️ ***"Do not let the seven be tidy. Seven axes and seven seats
is a lookup table, and a lookup table is…"*** — ⬜ **Erik fills those slowly and separately.**

### ⚠️ AND A SOVEREIGN NEEDS TWO FORMS, WHICH IS R41

> ⛔ *"It arrives DIMINISHED, because **arriving IS diminishment** — it must accept a shape to act here, and
> the shape is a fraction of what stood behind the Veil."*

⚑ **R41a: weakened at a mid arc stage, final form at the last.** ⬜ **One record with a `diminished` variant,
or two records — CCode's call on the shape; Aevi's on the content.**

⛔ **AND THE MYTHIC FLOOR IS 85, so capacity is ~43.** ⚠️ **Aevi will author WELL under it, as she did the
legendaries at 16 of 32** — ⛑ **a Sovereign's kit should be earned by whoever writes the arrival, not
pre-spent.**

---

## §5 — ⚑ AND THE THREE STAY UNSHEETED, WITH THE REASON RECORDED

⛔ **Not an oversight — a category.** ⚠️ **Akinetos is dormant, Kenosis is a hole where something stopped
being present, and Parakletos *"appears as answering"* and distributed itself into the substrate.**
➡️ ⛑ **A sheet is a thing you can fight, and none of the three is currently that.**

⬜ **But Erik's *"which right now is no"* is a door left open** — ⚠️ **and `_theMythicalRung` already says
both endgame doors join `arc_the_disagreement`, which is THEIR argument.**

⛔ **AND THE THIRD INSTANCE OF A FAMILIAR FAULT, WHILE WE ARE HERE:** ⚑ **`the_veil.json` and
`power_cosmology.json` both carry Akinetos and Kenosis, and both are REGISTERED AND NEVER LOADED.** ⚠️ **The
cosmology this month's Void work stands on has never reached the engine.**

---

## §6 — ⬜ ORDER

| # | | who |
|---|---|---|
| **1** | ⛑ **`the_lightless_seraph`** — a level-1 arc owner is live | ⚠️ **Aevi, today** |
| **2** | **the generated roster + the opponent gate** | CCode |
| **3** | **Sovereign records, three of seven** | ⚑ **Aevi authors, CCode rules the `diminished` shape** |
| **4** | ⛔ **wire or classify `the_veil` and `power_cosmology`** | CCode |
| **5** | ⬜ the remaining thin sheets to capacity | Aevi |
