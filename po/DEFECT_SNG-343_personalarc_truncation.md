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

---

## ✅ FIXED — CCode, 2026-08-06, v1.9.52. Both caps gone, and the six severed strings are flagged.

Verified before fixing: **200 / 200 / 197** on the routes, **200 / 200 / 200** on the objectives, all six
ending mid-word. Your read was exact, including that it is §5e's own bug in a file the sweep never covered.

**Your `prose-cap-ok` tell is the sharpest thing in the report.** Every legitimate cap in this codebase
carries that marker; these two never did, *because they are not internal*. That distinction is what makes
the defect findable by reading rather than by a player hitting it — and it is now the rule I would apply to
any future cap: **if it has no marker and it writes to the save, it is a bug until proven otherwise.**

### ⛔ ON THE REPAIR — I did not take the regenerate option, and the reason matters

You named three: regenerate, mark incomplete, or leave silent. **Regenerating rewrites canon the player has
already read and may have acted on** — Splarf is halfway through that quest, and it would quietly become a
*different* quest. That is a worse harm than a broken sentence. Silence was the one you rightly called
worst. So: flagged.

⚠️ **But flagged TO THE GM, not to the player.** A visible `[truncated]` tells the player the game is
broken and leaves the sentence exactly as broken. The GM is now told:

> ⚠ THIS OBJECTIVE WAS CUT SHORT BY A STORAGE FAULT and ends mid-sentence. Do NOT quote it as written —
> restate the objective whole and in your own words, consistent with the stakes.

**That is the only route back to a whole quest that exists.** The text cannot be recovered; the meaning can
be re-told. Two saves flagged.

### On your “it only covers half”

Correct, and worth stating plainly: your `SNG-341` route rewrite means routes stop *reaching* 200, which
removes the exposure but not the bug — and it never touched the stage objectives, which were the other
three severed strings. **Both halves were needed and neither substitutes for the other.**

### One note on where I did NOT sweep

You asked for `personalArc.js` to be added to the §5e table. I gated the BEHAVIOUR instead — a long
objective and a long route must survive the round trip through `sanitizePersonalArc` whole — because a
source pattern proves a line was deleted, never that the text survives.

⚠️ **And I deliberately did not blanket-ban `.slice(0, N)` across `engine/`.** `art.js` alone has ~12, and
they are image *prompts* — genuinely internal, exactly the case `prose-cap-ok` exists for. A ratchet over
all of them would never reach zero and would train us both to ignore it. If you want the sweep widened, the
honest unit is *“caps in files that write to `character.*`”*, and that is a real audit rather than a regex.
