# DEFECT — SNG-343: generated quest text is severed at 200 chars, IN THE SAVE. §5e's own bug, one site missed.
## Found in play by Erik. ⚠️ ENGINE — CCode's. Measured, not inferred.

## THE SYMPTOM
Splarf's quest routes end mid-word: *"it will be slow, inglorious, and m"* · *"Splarf make"* · *"how a family
gets erased"*. Erik: **"there are also slices cutting off text."**

## MEASURED
The three route strings are **200, 200 and 197 characters.** And it is not only the routes — **all three
stage objectives in the save are exactly 200**, ending *"copied, cited, or carr"* · *"met the statutory
thre"* · *"of the lower pass, Sp"*.
```js
engine/personalArc.js:142   objective: String(st?.objective || st || `stage ${i+1}`).slice(0, 200),
engine/personalArc.js:148   … routes[slug(k) || k] = String(v).slice(0, 200);
```

## ⚠️ WHY THIS IS WORSE THAN A DISPLAY CAP
**Both slices run at STORE time, not render time.** The truncated text is what gets written into
`character.quests` — **the rest is gone and no amount of re-rendering brings it back.** Splarf's save is
already carrying six severed strings.
**And it is this file's own established pattern that flags it:** other caps in the codebase carry a
`// prose-cap-ok` marker for genuinely internal strings. **These two do not — because they are not internal.
They are the player-facing text of the quest.**

## ⚠️ IT IS SNG-152 §5e's OWN BUG
CCode's comment in `smoke.mjs` reads: *"corrections.js — listed in my own sweep table and simply not
converted — kept severing GM prose at exactly 200 chars until Erik saw '…is meta-play instructio' on
screen."* **`personalArc.js` was not in that sweep table.** Same cut, same number, same discovery route: **a
player read it on screen.**

## THE FIX, AND THE DECISION INSIDE IT
1. **Remove the cap on `objective` and `routes`.** These are authored player-facing prose; **if length ever
   needs limiting it belongs at RENDER time, where it is reversible.**
2. **Add `personalArc.js` to the §5e sweep table**, so the gate that was built for this covers it.
3. **⚠️ A repair for existing saves** — Splarf is carrying six severed strings today. They cannot be
   recovered, so the honest options are to regenerate the quest or to mark the fields visibly incomplete.
   **Silently leaving half-sentences in a live quest is the worst of the three.**

## WHAT IS MINE, AND IT ONLY COVERS HALF
My route-reveal rewrite (`SNG-341`) makes routes **options rather than explanations** — *"there is a person
whose signature made this legal. You have not found out why yet"* is ~80 characters. **Routes written that
way never reach 200.** That removes the route half's exposure to the cap; **it does nothing for the stage
objectives, and it does not fix the bug.**
