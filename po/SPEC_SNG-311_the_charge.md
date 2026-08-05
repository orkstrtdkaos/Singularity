# SPEC — SNG-311: THE CHARGE. A progress indicator for prep, on a pattern that already exists.
## Aevi (PO) · 2026-08-05 · Erik: "on the ones that take prep time — do we have an indicator that tracks the
## prep % or charge up?"

## THE ANSWER: NO. `prepHours` is a cost with no accumulator.
I added 17 `upkeep` blocks with real hour figures and **nothing tracks a character's progress toward any of
them.** `light_well` says 168 hours; nothing counts them. **A cost nobody can be partway through is not a
cost — it is a gate that opens the first time you try after enough days have passed, and the player never sees
it coming or knows where they are.**

## ⚠️ THE PATTERN TO BUILD ON ALREADY EXISTS: `engine/assignments.js`
**Do not invent a new subsystem.** Delegation (SNG-191) already does this exact shape: **the player commits to
ongoing work, leaves, and the world tick advances it while they are away.** Its own comment: *"the tick
advances the work… delegating IS how a crisis gets solved while you are gone."*
**An unattended prep is a delegation to yourself.** Same lifecycle, same tick, same "ask after its progress."

## THE MECHANIC — `character.charges`
```
{ craftId, rank, startedWorldDay, hoursNeeded, hoursBanked,
  attended, condition, lastAdvancedDay, blockedReason }
```
- **advance on the world tick**, exactly as assignments do
- **`attended: false`** → banks hours whenever world-time passes, wherever the character is
- **`attended: true`** → banks only during passes where the character actually did the thing
   *(`hearthbinding` — a camp becomes a named place because you kept it)*
- **`condition`** gates which hours count: `light_well` banks only on **clear noons**, so weather and season
  change the real elapsed time. **⚠️ That is the good part — it makes a preparation something the WORLD can
  interfere with, not just a timer.**
- **`onInterrupt`** already authored per craft: `light_well` keeps what was banked; `hearthbinding` restarts
  the count; `the_perfect_erasure` breaks entirely if a record is restored.

## WHAT THE PLAYER SEES — and this is Erik's actual ask
**A charge is not a hidden number. It is a visible, named, in-progress thing:**
- **on the character sheet:** *"Light Well — 5 of 7 clear noons banked."* **Count the CONDITION, not the
  hours.** Nobody thinks in hours; they think *"two more good days."*
- **⚠️ percentage is the wrong unit here.** *"71%"* tells you less than *"two more clear noons"* — and when the
  condition is weather-gated, **the remaining time is not knowable in hours anyway.** Show hours only where
  the condition is plain elapsed time.
- **when it advances:** one line, at the moment it happens. *"A clear noon. The vessels take it."*
- **⚠️ when it is BLOCKED, say so** — *"Overcast. The Well took nothing today."* **A stalled charge that is
  silent reads as a bug.**
- **when it completes:** it should feel earned, because it was — *"The Well is full."*

## WHY THIS IS WORTH BUILDING RATHER THAN SIMPLIFYING AWAY
1. **It makes the numbers I just authored REAL.** Right now 168h is a fact in a JSON file no player meets.
2. **It gives long crafts a presence in play between casting and effect** — a thing you have going, that you
   check on, that the weather can hurt. **That is a texture the game currently has nowhere.**
3. **It makes interruption dramatic instead of administrative.** `the_perfect_erasure` is 90 days that anyone
   restoring one record can end — **that is only a scene if the player can see the counter.**
4. And **it pairs with the arc roll**: a figure mid-charge on something large is **exactly who a strike should
   be aimed at.**

## FOR CCODE
- `character.charges[]`, advanced in the same tick pass as assignments
- read `upkeep.prepHoursByRank[rank]`, `upkeep.attended`, `upkeep.prepCondition`, `upkeep.onInterrupt` — **all
  already authored on 17 crafts, none of it new**
- **the condition vocabulary is small and mine to finish**: `clear noon` · `uninterrupted sleep` · `same camp`
  · `daily training` · `community consent` · `impersonation held`. **Six strings, and I will author the
  matching rules for what counts as satisfying each.**
