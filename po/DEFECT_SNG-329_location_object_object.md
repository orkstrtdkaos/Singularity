# DEFECT — SNG-329: current location renders `[object Object]`
## Found in PLAY by Erik, first real play-leg. Character: Splarf. ⚠️ ENGINE FIX, CCode's.

## THE SYMPTOM
The location tag in the play header reads **`[object Object]`** instead of a place name.

## THE PATH — traced, not guessed
```js
app.js:5148   const moveRef = turn.moveTo && (turn.moveTo.location || turn.moveTo.id || turn.moveTo);
app.js:10519  <div class="location-tag" …>${esc(location.name)}…
```
**`moveRef` is not coerced to a string.** If the GM returns `moveTo` as an object whose `.location` is *also*
an object — `{ moveTo: { location: { id, name } } }` rather than `{ moveTo: { location: "the_pass" } }` — then
`moveRef` is an object. It flows to `mintTransitLocation`, which builds:
```js
const rec = { id, name, … }
descriptionSeed: `A place the road led to — ${name}.`
```
**`name` is the object. Template-stringified, it becomes `[object Object]`** — and because the mint
**persists to `character.generated.location[id]`**, the bad name is now **saved on Splarf's character**, not
just displayed once.

## ⚠️ WHY THIS IS WORSE THAN A DISPLAY BUG
1. **It persists.** `character.generated.location` is written to the save, so the corrupt name survives reload.
2. **It propagates.** The same `name` goes into `descriptionSeed`, which the GM later reads back as context —
   so the fiction starts describing a place literally called `[object Object]`.
3. **The id is probably corrupt too**, since ids are commonly slugged from the name.

## THE FIX I'D ASK FOR — three parts, and the third is the one that matters
1. **Coerce at 5148:** take `turn.moveTo.location?.id ?? turn.moveTo.location` when `.location` is an object,
   and reject any `moveRef` that is not a non-empty string.
2. **Guard the mint:** `mintTransitLocation` should refuse a non-string `name` outright rather than coining a
   record from it. **A mint is a write to the save; it should be the strictest gate in the path, not the
   loosest.**
3. **⚠️ A REPAIR PASS for existing saves** — Splarf already carries at least one. Any
   `generated.location` whose `name` fails a string check needs renaming from its `id`, or dropping.

## WHAT IT SAYS ABOUT THE SHAPE OF OUR CHECKS
Every gate in this area validates **that a location exists**. **None validates that its name is a string.**
The mint path was built to be permissive on purpose — *"a named-but-unrecorded destination like 'the pass'
becomes a real place"* — and permissive input plus a persisting write is exactly where a malformed value gets
made permanent. **The mint is the one place in that path that should be strict.**

## ALSO FROM THIS PLAY SESSION (Erik, not yet specced)
- **the world map needs fixing** — details to come from him.
- **the foothills need authoring for all the civilisations** — mine, starting now.

---

## ✅ FIXED — CCode, 2026-08-06, v1.9.39. All three parts, plus the saves.

Your trace was exact and your framing of part 2 is the fix: **a mint is a write to the save, so it must be
the strictest gate in a deliberately permissive path, not the loosest.**

| part | where | what |
|---|---|---|
| 1. coerce | `state.js:locationRefToString` | every shape the GM returns → a string, or **null**. Never `String(ref)`. Used at app.js:5148 *and* inside `resolveLocationId`, so no caller can skip it |
| 2. refuse | `app.js:mintTransitLocation` | returns null on anything unusable; the header keeps its last real place rather than gaining a fake one |
| 3. repair | `reconcile.js` step 23 | drops the artefact, moves the player out of it, idempotent |

### ⚠️ IT WAS THREE SAVES, NOT ONE — and two predate that play session

```
  char-msgpisca  Splarf       gen-object-object   "[Object Object]"   ← and currentLocationId WAS it
  char-mrhs8286  Silas Weir   gen-object-object   "[Object Object]"
  char-mr4ejo8c  Cellaceron   gen-object-object   "[Object Object]"
```

**Splarf was standing in it.** `currentLocationId: "gen-object-object"` — that is the header Erik was
looking at, not just a mis-render of a real place. He is now at `the_thinning`, the place it was minted
from. All three repaired on disk; the reconcile step catches any that reappear on load.

### ⛔ WHY YOUR "none validates that its name is a string" IS TOO KIND TO US

It is worse than a missing check: **the mint TITLE-CASES**, so the artefact lands as `"[Object Object]"` —
a well-formed string with capitals and spaces that reads like a place name. A `typeof === "string"` check
would have passed it. **My own first detector scanned for lowercase `object Object` and reported ZERO
corrupt records across all three infected saves.** The gate is case-insensitive for exactly that reason.

### ⚠️ AND THE SUITE NARROWED YOUR PART 3 FOR ME

You asked for "any `generated.location` whose `name` fails a string check". I built it that way and it
**deleted a legitimate SNG-216 test fixture** that simply had no name yet. Reconcile's own law is *never
removes or downgrades*, so a migration that deletes has to be scoped to exactly the damage:

- **`[object Object]`** → dropped. It was never a real place; there is no true name to restore, and
  inventing one would put a place into someone's canon the fiction never named.
- **missing/blank name** → left alone. Different defect, non-destructive fix (rename from id), not this pass.

So there are two checks now: `isCoercedObjectName` (wide — for the mint, which refuses) and
`isCoercedObjectArtefact` (narrow — for the migration, which deletes).

**8 gates, including one that scans every shipped save** — so if this ever lands again, the build says so
before anyone has to notice it in a header.

### On your two follow-ups

- **the world map** — waiting on Erik's details.
- **the foothills** — yours, and nothing in the engine blocks it.
