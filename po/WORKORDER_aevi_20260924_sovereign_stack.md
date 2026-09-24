<!-- status: work order for CCode — the Sovereign stack, in the order it can land -->
# WORK ORDER: Aevi → CCode, 2026-09-24. The Sovereign stack, in the order it can land

CCode, today's specs (SNG-640 to SNG-644) left six pieces staged across five files, plus the SNG-639 name pools
from yesterday. They depend on each other, so this is the order they can land in. Each item lists what it reads
and what it needs first. **Every staged file stays staged until its reader ships in the same commit** (reader
before field).

## First, your two asks from CCODE-483

- **b · the renamed origins: yes.** Add the reconcile step: `valley` → `valleyfolk`, `radiant` → `radiant_plateau`.
  It's a content call and I'm making it.
- **a · 30 of 38 regions have no power holding them.** That's mine, and it's what I'll work on next. I'll start
  with the six regions characters on this device come from: `somatic_reaches` / `the_cogitarium`, `the_quickwood`,
  `the_numinous_reach`, `radiant_wastes`, `the_making` and `the_gearlands`. They'll arrive as a change set in the
  SNG-634 shape. Where a region's powers qualify, I'll apply Erik's supply-line rule (SNG-641 §6), capped at one
  line per Sovereign per region.
- **Noted:** a power's `plainly` field is now what the player reads in their codex, word for word. I'll write it
  as player-facing prose from here on.

## Your C8, and SNG-640 alongside it

Read SNG-640 with **the correction at the top of its §1**. Its C13 is **replaced** by SNG-641 §1. Under R40b.2 a
Sovereign's supply is derived from its arc's stage, so breaking a supply line counts as a deed against the arc
rather than lowering a counter. C8 (a leader's death opening the seat) doesn't touch any of this, except that
killing a supply-line power's leader is one of the deeds C13 counts.

## The order

| # | what | files | needs | reads / writes |
|---|---|---|---|---|
| **1** | **name pools + the `familyNameFor` switch** | `SNG-639_name_pools.json` | nothing | `rules.mintedNames.family/middle` |
| **2** | **C15: a hunger arc per Sovereign, and their arrivals** | `SNG-642_hunger_arcs.json` (3 arcs, `formsFix`, `luciferMask`) · `SNG-643_names_and_the_unmet.json` → `unmet` (record + `arc_the_widening`) · `SNG-641_marks.json` → `starlessRivalAdd` | nothing | arcs into `greater_arcs.json`. `formsFix` **in the same commit**: the Hollow King's forms become an object; the Unbodied gets forms; every `forms.arcId` points at its own arc, and Lucifer's does what his `_formsWhy` asked for. Stage names reach the player as words, never numbers. The mask reader: Eosphor stands in for Lucifer until the save knows him |
| **3** | **C13: supply-line deeds** | SNG-640 `feedsGM` (4 powers, in its change set) | 2 | breaking, taking or turning a `feedsGM` power, or killing its leader (your C8), enters `arcContests` against that Sovereign's arc |
| **3b** | **the supply-line rule (RULED)** | SNG-641 §6 · `SNG-641_marks.json` → `generatorRule` | 3 | a newly minted power matching a hunger may become a line, only if that arc's stage ≥ 1. **One line per Sovereign per region** |
| **4** | **C14: the marks** | `SNG-641_marks.json` (15) + the Unmet's 3 in `SNG-643 … unmet.marks` | 2 | place a mark at a line's seat, hold or cell (max one per scene, never one already seen). Record it to `save.marksSeen`. Thresholds 2 / 3 / two regions unlock the GM lines and each arc's `onceLineKnown` layer. ⛔ The Sovereign is never named |
| **5** | **C16: the artifacts** | `SNG-642_artifacts.json` (9) + `SNG-643 … unmet.artifacts` (2) | 2, 4 | every use is an `arcContests` push on `feeds.arcId`, credited to the user, PC or NPC. `whatItCosts` is **enforced** (the Ring blocks stealth; the Lantern can't be dimmed). Holding an artifact counts as seeing its `markId`. Placed per `_foundAt` |
| **6** | **C17: whole names** | `SNG-643 … names` (113) | 1 | ⛔ **merge only together with the gate.** `nameKnown` is `world` / `few` / `gm`. N5's card shows `fullName` / `trueName` only when the name is `world` or learned (`save.namesKnown`). **A `gm` name never goes into `aliases`.** Name-crafts (the Unlit's Veil-received true name, Vessa's trade) read it and write `namesKnown` |
| **7** | **C18: held seats** | `SNG-644_held_seats.json` | 2 | a claimant who finishes can't take a seat while its holder (Neth, the Last Mercy) still stands; once the holder is slain, turned or broken, the seat opens to the challenger who did it. Chaos / Order is taken by finishing alone. This is also where *"a villain you fail to stop is a promotion"* becomes code, if it isn't already |

## Things that are NOT for you

- **High Luminary Sera and Seraphine are two records of one office.** That's Erik's call and it's pending. My
  recommendation is one record, Seraphine Aurel Lumenhall, with "Sera" as what her own people call her.
- **Done today, live:**
  - The God-Named had `"foothill"` in the spectrum field. They now have authored vectors, and the old value is kept
    in `_spectrumWas`.
  - Pell and Veth were on the old 0–10 scale. I read each value as intensity toward the named pole (value / 10),
    and the old values are in `_spectrumWas`.
  - Lucifer's `light_dark` key is now `dark_light`.
  - The great figures have a documented home, `docs/GREAT_FIGURES.md`, generated by `po/tools/great_figures.cjs`
    and linked from ROSTER.md outside its markers.
  - [A] **One source:** if you'd rather `roster.mjs --write` produce that section itself, fold it in and I'll
    retire my tool. Erik's 09-08 line was *"all NPCs should at least be referenced from a single source,"* and
    today that source is two files and a link.

— Aevi, PO
