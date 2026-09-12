<!-- status: SNG-538 spec_ready GO (Erik 2026-09-11: "not only are they out of date, but they are riddled with all caps notes and other phrasing that is not meant for a player finished product audience") -->
# SPEC SNG-538 — The Library is serving the player my working notes

**Aevi (PO) · 2026-09-11 · measured at HEAD, not remembered**

---

## §1 — ⛔ THE HEADLINE: SNG-165 WAS FIXED ON ONE SURFACE AND THE BIGGER ONE WAS NEVER LOOKED AT

CCode shipped the display half of SNG-165 today: `playerText()` strips the authoring glyphs at every craft
surface. ⛑ **I checked all ten of its call sites in `app.js`. Every one is a craft surface** — skill rungs,
ability titles, fork paths, learn options.

⛔ **`renderLibrary` does not call it. Not once.** It renders through `esc()` straight to the page.

**So the craft cards were cleaned and the Library was not — and the Library is the larger surface.**

| | glyphs reaching the player | shouting runs (15+ chars of caps) |
|---|---|---|
| craft cards (fixed today) | 0 — stripped at render | — |
| **the Library (15 documents)** | **788** | **538** |

## §2 — ⛑ THE MEASUREMENT, DOCUMENT BY DOCUMENT

| document | KB | glyphs | ALLCAPS | build-refs |
|---|---|---|---|---|
| **`tradition_profiles.json`** | 132 | **437** | **403** | **100** |
| `ARCHETYPES.md` | 21 | 161 | 28 | 2 |
| `PLAYERS_GUIDE.md` | 37 | 56 | 10 | 6 |
| `VOCATIONS.md` | 6 | 51 | 21 | 4 |
| `EXESA.md` | 22 | 28 | 37 | 1 |
| `greater_arcs.json` | 33 | 26 | 16 | 9 |
| `power_systems.md` | 7 | 15 | 3 | 6 |
| `world_framing.json` | 10 | 14 | 15 | 12 |
| `the_coordinate_world.json` · `the_pole_intensity_model.json` · `universal_roles.json` | | 0 | ~2 | 4–7 |
| ✅ `the_twelve_reaches.json` · `valley_primer.md` · `precursors.md` · `the_game_and_coin.json` | | **0** | **0** | 0–10 |
| **TOTAL** | | **788** | **538** | **169** |

⚠️ **Four documents are already clean.** `valley_primer.md` and `precursors.md` are 0/0/0 — they were written
as player prose and never got edited in the PO register. **They are the target, and they prove the target is
reachable.**

## §3 — ⛔ AND IT IS WORSE THAN SHOUTING: MY BUILD NOTES ARE BEING SERVED AS LORE

⛑ **57 underscore-prefixed internal keys reach the player**, because `LIB_SKIP` filters a named list and
`_`-prefixed keys are not on it. Verbatim, from the player's Peoples & Traditions page:

> **`_parentsMirrored_20260830`** — ⛔ PARENTS MIRRORED FROM `foothills.json`, WHERE THEY HAVE ALWAYS BEEN,
> BECAUSE I KEPT RE-DERIVING THEM WRONG FROM THIS FILE.

> **`_idFixed_20260830`** — ⚠️ id `radiant` -> `radiant_folk`. ⛔ A PRE-MIGRATION ID: the crafts have used the
> new key for a long time, so this profile joined to NOTHING.

**That is a migration note and a confession about my own repeated mistake, rendered as world lore, under a
heading, in the book a new player opens to find out where they are.** 52 of the 57 are in
`tradition_profiles.json`; 4 in `world_framing.json`; 1 in `greater_arcs.json`.

## §4 — THE SPLIT

**CCode (`app.js`, two changes, both small):**
1. ⛔ **`renderLibrary` must pass prose through `playerText`**, the same way every craft surface now does.
   ⚠️ **It will not fix the capitals** — those are content and mine — but it stops 788 glyphs at the door
   today, which is the same bargain SNG-165 already struck for crafts.
2. ⛔ **`LIB_SKIP` must drop `_`-prefixed keys.** ⚠️ **Do NOT ask me to delete them from the content** — they
   are real authoring history and they belong in the file. **The bug is that a private key has no marker the
   filter respects, and `_` is that marker everywhere else in this repo.**

⚠️ **AND A GATE, BECAUSE THIS IS THE THIRD TIME:** assert that **no Library-reachable document renders a
glyph or an underscore-prefixed key.** ⛑ The craft half of SNG-165 had a gate and stayed fixed; the Library
had none and drifted from the day it was written.

**Aevi (all content):** the capitals, the PO register, and the staleness. §5.

## §5 — ⛑ THE CONTENT PASS, ORDERED BY WHAT A NEW PLAYER OPENS FIRST

| # | document | why here |
|---|---|---|
| 1 | ✅ **`VOCATIONS.md`** | **DONE — see §6** |
| 2 | `ARCHETYPES.md` | 161 glyphs, and it is the second thing a new player reads |
| 3 | `tradition_profiles.json` | the largest by far, and the 52 build-notes live here |
| 4 | `EXESA.md` | 37 shouting runs in the world's own front page |
| 5 | `PLAYERS_GUIDE.md` | 56 glyphs |
| 6 | `greater_arcs.json` · `world_framing.json` · `power_systems.md` | the tail |

⛔ **AND "OUT OF DATE" IS A SEPARATE PASS FROM "BADLY PHRASED", AND I AM NOT CONFLATING THEM.** Erik named
both. The register is measurable and I am fixing it first because I can prove it. **Staleness needs a read
against the live corpus per document** — what these files claim about the world versus what the world now
contains — and that is slower, quieter work with no glyph count to show for it. **It gets its own pass and
its own note, and I would rather say that than let a clean glyph count read as a finished document.**

## §6 — ✅ DONE IN THIS PASS: `VOCATIONS.md`

| | glyphs | ALLCAPS | build-refs | KB |
|---|---|---|---|---|
| before | 51 | 21 | 61 | 6 |
| **after** | **0** | **0** | **0** | **5** |

**What came out, and why:**
- ⛔ **§1, the failed clustering experiment** — *"TWELVE OF THIRTY in PROTECT, never rose above 52%"*. A
  design test with percentages in it. ⚠️ **The INSIGHT stayed** and is now the section's whole point: a
  Paladin and a Peacemaker are both protect-dominant and are not the same job.
- ⛔ **§3, the Commander** — an unbuilt ninth vocation, with its missing crafts and its absent coliseum cell
  listed. **That is a backlog item and it was in the player's class list.** It lives in the PO documents; it
  does not live here.
- **`R46a`, `R36`, `§C`, `delegationCapacity`, `bandOps`, `contributionsOf`, `SKILLS.md` is GENERATED** —
  engine identifiers and build talk, all removed.
- **The balance note** — *"threat explains the spread at −0.95, which is a BALANCE problem"*. A tuning
  measurement, on a page about what you can be.
- **The Erik quotes** — design direction, correctly recorded, wrongly located.

**What went in:** every craft id resolved to its player-facing name — ⛑ **all 44 checked against the live
catalogue, none missing** — `held_line` → **Held Line**, `the_way_out` → **Way Out**. **A player reads names.**

⚠️ **AND THE BEST PARAGRAPH IN THE FILE WAS ALREADY THERE**: a fight has five exits and only one of them is
damage. It was buried under §4's markup. **It is now the closing section, unglyphed, and it is the single
clearest statement of why this game's classes work.**

---

## §7 — ⛔ FOUND WHILE VERIFYING THIS, AND IT IS NOT MINE OR CCODE'S: A PLAYER'S SAVE TURNED THE SUITE RED

Running the suite after the rewrite, `smoke` was red with 2 failures. **I assumed it was mine. It is not.**

⛑ **Bisected across all eight commits between CCode's ship and mine:**

```
d3a1387  FAILs=0   A parting recorded on its day and repaired on load   (CCode)
f223adb  FAILs=0   world-tick: consolidated by Silas Weir
c80a589  FAILs=0   arcs: Silas Weir pushed the world
446f2ae  FAILs=2   save: Silas Weir            ← IT ARRIVES HERE
```

`446f2ae` is **one file, 317 lines: `characters/player-s9z9u1/char-mrhs8286.json`.** No code. No content.
**A player played.**

⛔ **THE MECHANISM:** `CCODE-274` loads `silas274` from that live character file and asserts on his party —
`party.folded.length >= 1` and `damage.melee.added > 0`. ⛑ **I read the save: `company members: 0`.**
**Silas's company emptied in play.** The assertions describe a party he no longer has.

⚠️ **SO THE GATE IS ANCHORED TO A LIVING SAVE, AND IT REPORTS A PLAYER'S TUESDAY AS A REGRESSION.** It will
go red and green as Silas plays, and the next person to see it red cannot tell a real break from a recruitment
decision. ⛔ **A fixture would hold this; a save cannot.**

⚑ **AND IT IS THIS MORNING'S FINDING WEARING A FIFTH COSTUME. CCode's own words: *it was the ruler, not the
GM.*** The engine was capable and the note lied. The craft field was read and could not be written. The rules
files are registered and unread. The docstrings claim readers they do not have. **And now a gate measures a
moving thing and calls the movement a fault.** ⛔ **Five instances in one week is not a run of bad luck. It
is one class, and it is the thing worth building a gate against.**

**Ask: pin `CCODE-274` to a fixture, not to `characters/`.** ⚠️ **And the broader question is yours, not
mine: how many other gates read `characters/`?** I did not audit that and I am not guessing at it.

---

## §8 — STATUS

**`VOCATIONS.md` shipped.** ⛔ The suite reads **26 green · 5 red** at my commit, and **the fifth red is
`smoke`, which arrived at `446f2ae` and is not mine** — §7 has the bisect. The other four are the same four
that have been red all day.

**Next: `ARCHETYPES.md`.** 161 glyphs, and it is the second document a new player opens.

— Aevi, PO
