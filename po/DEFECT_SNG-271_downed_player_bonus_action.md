# DEFECT — SNG-271: a downed player still takes their bonus action
## Aevi (PO) · 2026-08-03 · from Erik's live fight log. ROOT CAUSE FOUND, not guessed.

## THE REPORT
*"I tested a fight and the test hero went negative and was still acting."*

## ROOT CAUSE — `app.js` sbDeclare, lines 9759-9772
```js
applyRR(rr, aDecl, "Action");          // ← the ACTION's damage lands here
saveCharacter(character);
let ended = rr.ended, endRR = rr;
if (!ended && bDecl) {                 // ← ⚠️ gated on `ended`, NOT on health
  const br = skillBattleRound(...);    // ← the BONUS action runs anyway
  applyRR(br, bDecl, "Bonus action");
  ...
}
character.activeEncounter.state.turn = sbFreshTurn();
if (checkIncapacitation(character)) { ... }   // ← ⚠️ only checked AFTER BOTH
```
**The gate exists and works** — `checkIncapacitation` returns `"incapacitated"` at `health <= 0`, and
`skill_battle.js:901` is explicit that *"the PLAYER's health is the app's to apply — reported, never written
here."* **The engine is right. The app checks too late.**
`!ended` is the encounter's own end-flag (opponent down, yield, flee). **It is not a health check**, so a player
reduced to 0 by the action is not `ended` — and takes a full bonus action while incapacitated.

## THE LOG CONFIRMS IT EXACTLY
Erik's round 2 has **two entries at the same second**:
```
[21:05:41] round 2 · strike — Hunter's Strike   · hp   0
[21:05:41] round 2 · strike — Drumline Stride   · hp -20      ← action + bonus, same turn
```
Two resolutions in one timestamp is the action/bonus pair. **The −20 landed on a character who should already
have been out.**

## THE FIX — one line, and the correct pattern is already in the same file
The **other** skill-battle path (`app.js:9855-9859`) does it right:
```js
character.health = Math.max(0, Math.min(character.maxHealth, character.health + (rr.deltas?.health || 0)));
...
if (checkIncapacitation(character)) { sbEnd({ ...rr, ended: true, outcome: "incapacitated" }); return; }
```
**Note it also CLAMPS health at 0** — which is why that path can never show a negative. **sbDeclare's `applyRR`
should do both: clamp, and check between the action and the bonus.**
```js
applyRR(rr, aDecl, "Action");
saveCharacter(character);
if (checkIncapacitation(character)) { sbBusy = false; sbEnd({ ...rr, ended: true, outcome: "incapacitated" }); return; }
let ended = rr.ended, endRR = rr;
if (!ended && bDecl) { ... }
```
**CCODE: this is yours — engine/app, not content.** Two changes: **(a)** check incapacitation between action
and bonus, **(b)** confirm `applyRR` clamps health at 0 the way line 9855 does, since Erik's log printed a
*negative* number and the clamped path structurally cannot.

## ⚠️ A SECOND DEFECT IN THE SAME LOG, WORTH ITS OWN LOOK
The narration ribbon is **stale across entries.** Round 2's `read` entry prints the *round 1 strike* ribbon
verbatim:
```
[21:04:18] round 2 · read
  you : Raise a guard — roll 31/55 (margin 24) ...
  ⚔ You slip aside with Stillness Field · they guard ...   ← ⚠️ that is round 1's text
```
The numbers advanced; the prose did not. **Either the ribbon is rendered from a cached receipt, or `read`
phases reuse the last strike's ribbon.** Separate from the health bug and probably cheaper to fix.

## A THIRD THING — NOT A BUG, BUT IT LOOKS LIKE ONE
`margin` reads inverted in the log: `roll 98/65 (margin -33)` is a **failure** by 33, while `roll 31/55
(margin 24)` is a **success** by 24. That is consistent — margin is `target − roll` — but printed beside a roll
of 98 it reads like the player rolled *well*. **Cosmetic, and worth a label change (`by −33` / `beat by 24`)
before it confuses someone at a table.**
