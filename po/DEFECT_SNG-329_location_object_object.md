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
