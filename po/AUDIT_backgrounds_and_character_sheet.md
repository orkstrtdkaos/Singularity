# AUDIT + DEFECT — backgrounds, and the character sheet
## Aevi (PO) · 2026-08-03 · from Erik's screenshot: "MECHANICS: No fixed challenge affinity."

# PART 1 — THE BACKGROUNDS ALL WORK. THE SHEET IS LYING.
**All 40 backgrounds carry real mechanics. Zero dead.** Every one has an `affinity` array and a
`grantsAptitudes` array; `precursor_marked` additionally carries `innatePrecursor`.
The one in the screenshot is not an exception:
```json
{ "id": "organizer", "name": "Community Organizer",
  "affinity": ["SOCIAL"], "grantsAptitudes": ["banner"] }
```
**It grants a SOCIAL challenge edge and the `banner` aptitude. The tooltip says it does nothing.**

## SNG-272 — AN ID MISMATCH, NOT MISSING CONTENT
The tooltip header reads **`community-organizer — background`**. **The authored id is `organizer`.** No
background id in the file contains a hyphen — **all 40 are snake_case** (`line_soldier`, `ruin_picker`,
`former_professional`).
`app.js:7401`:
```js
const def = (CONTENT.backgrounds || []).find(b => b.id === id) || {};
mech = mech || `${def.affinity?.length ? `Helps with ...` : "No fixed challenge affinity."}...`;
```
The lookup returns `{}` → `def.affinity` undefined → the fallback string prints. **Content loads fine
(`state.js:290`). The CHARACTER is carrying an id that does not exist in the catalog.**

### ⚠️ IT IS A BUG CLASS, NOT A TOOLTIP
`|| {}` means every consumer of that id fails **silently and differently**:
- the tooltip prints "no affinity"
- `backgroundById()` (app.js:3089) returns `null` → **the SOCIAL challenge edge never applies**
- `grantsAptitudes` never fires → **the `banner` aptitude was never granted**
- `seedInnateSubstrate` reads this same record — **the exact twin of the `precursor_marked` bug from SNG-261.**
  *(That was PromisedButUnread: a field nothing READ. This is a record nothing FINDS.)*

### FIX — three parts; the third is the one that matters
1. **Find where the hyphenated id is written** — likely creation slugging a display name, or the `suggestBuild`
   path (app.js:3562) which hands `id · name` pairs to a model and may get a *display* string back.
2. **Normalise on read** — `id.replace(/-/g,"_")` in `backgroundById`. One line, and **it repairs existing
   saves**, which matters because characters already exist with the bad id.
3. **⚠️ MAKE THE MISS LOUD.** `|| {}` is the real defect. **An id that resolves to nothing should fail a
   content check, not render a plausible sentence.** Same medicine as `|| rules.encounters.default`:
   *a lookup that can silently return nothing eventually will.*

# PART 2 — THE CHARACTER SHEET OVERHAUL
## THE DIAGNOSIS
Today's page: portrait · tradition/background/level/xp · Form · Story · Attributes, under **Traits | Chronicle**.
**That is a character-CREATION artifact.** It answers *"who did I make?"* — a question the player stops asking
around level 2.
## WHAT THE PLAYER NOW HAS AND CANNOT SEE
| built | on the sheet |
|---|---|
| 285 crafts with dice, bounds, intensity, rank deltas | ❌ |
| bound CLASSES (soft erodes with mastery · hard never does) | ❌ |
| practice counts → mastery bands | ❌ |
| purse, 5 currencies, regional demand | ❌ |
| companions: bond stage, what they witnessed, boundaries | ❌ |
| standing per community, how far a deed SPREAD | ❌ |
| **world arcs — and WHO is pushing them** | ⚠️ arcs on the Chronicle; **the people are not** |

## ⚠️ ERIK'S POINT IS THE SHARPEST ONE, AND THE DATA IS ALREADY THERE
*"they have the arcs on their chronicle, but not who's doing what to them."*
`ws.arcContests` records **who won and by how much** · `ws.arcCasualties` **who died or was wounded, on which
arc** · `ws.arcVacancies` **which seats went empty and why.** **The sim already knows the story. Nothing
surfaces it.**
And it becomes urgent the moment the third action ships: **a player needs to know who is on their arc before
being asked to guard someone, strike someone, or be struck.**

## PROPOSED — five tabs, replacing "Traits | Chronicle"
1. **SELF** — portrait, form, story, attributes, aptitudes. *(today's page, kept whole — it's good, it just
   isn't the whole sheet)*
2. **CRAFT** — crafts by tradition with **tier · dice · operative axis · intensity**; **practice count and
   mastery band**; and **bounds shown WITH their class** — *"this limit erodes with mastery / this one never
   will."* **That is a player-facing promise the catalog makes and nothing currently keeps.**
3. **TIES** — companions (bond stage, what they witnessed, their boundaries) · standing per community · **known
   legends**: who you've met, who owes you, who has a grievance.
4. **THE WORLD** — ⚠️ **the new one, and Erik's ask.** Per arc: stage **by name**, which way it moved, **and WHO
   moved it.** *"The Burning Certainty left three fronts to hunt one man; the poles moved while he was gone."*
   Casualties and vacancies **with names**.
5. **HOLDINGS** — purse across five currencies · inventory with `worth` bands · **what a region will and will
   not buy** (the dead lists), so a player can plan a route.

## THE PRINCIPLE
**Show the state, not the machine** — Erik's own currency correction, applied to the whole sheet. *The numbers
are visible and precise; the narration doesn't recite them.* A stage reads **"Stage 2 · The Bleed"**, never
`2.351351`. A bound reads *"no mastery will ever reach this"*, not `class: hard`.
