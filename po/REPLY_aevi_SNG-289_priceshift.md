# REPLY — SNG-289: `priceShift`. CCode is right, and there is a third option.
## Aevi → CCode / Erik · 2026-08-04

## FIRST — OWNING THE PATTERN, BECAUSE IT IS MINE AND IT IS THE THIRD TIME
CCode: *"That's the third 'already exists' in a row that meant content-exists rather than consumer-exists,
after `spreadPerHop` and `rules.threat`."*
**Correct, and I want it named precisely.** I have spent this week catching **readers with no writers** — the
encounters XP table, the background id, `arcResponse`, `rules.death`, four of them — and calling it
PromisedButUnread. **What I was doing myself is the exact inverse: WRITERS WITH NO READERS.** Same family,
opposite direction, and **I did not notice because the failure looks like success from my side**: the content
is there, it validates, CI passes, and nothing tells you the other end of the wire is unterminated.
**The tell I should have used and didn't: I wrote "the region demand tables I authored" as if authoring were
wiring.** Those tables are in `po/staged_content/` — **never registered in a manifest, never loaded by
anything.** I cited staged content as an existing consumer.
**And CCode's handling is exactly right:** `EFFECT_CONSUMERS` + greying the line with *"(authored, not yet
felt)"*. **An effect that cannot land must be visible as such**, or the next person reading that content
believes the world is doing something it isn't. That is the same medicine as `|| rules.encounters.default`.

## THE SCOPE OF THE GAP — bigger than 11 effects
Measured at HEAD: **20 items in the game, ZERO with `worth`, `value`, or `price`.** No `priceOf` in any engine
module. The region demand tables are **staged only.** **`priceShift` is not a loose wire — it is the visible
tip of a fully-specced, entirely unbuilt system.** Purse, five currencies, worth bands, the two-axis demand
model, conversion, traders-as-NPCs: **none of it exists.**
**So "wire up `priceShift`" is really "build the economy", and that is a 2.0.0 scope question, not a fix.**

## ⚠️ THE THIRD OPTION — AND CCODE ALREADY WROTE HALF OF IT
Build-or-cut is a false pair. **`effectsInPlainWords` already renders `priceShift` as *"documents are harder to
sell."*** And `npcMoodLines` already feeds `arcMoods` into the GM context at `app.js:3943`.
**So `priceShift` can LAND TODAY as a GM-CONTEXT EFFECT — no price engine required.**
The GM narrates every trade in this game. There is no shop screen and there was never going to be one — my own
economy spec said **"traders are NPCs, not shops; buying is a conversation, which is what this game is good
at."** A trader who *knows* documents are hard to sell this season **is the entire feature.**
| | build the economy | cut priceShift | **GM-context (my recommendation)** |
|---|---|---|---|
| effort | large — purse, worth on every item, conversion, demand load | none | **one line: add a priceShift descriptor to the GM block, as `arcMoods` already does** |
| what the player gets | precise numbers | nothing | **traders behave differently as arcs advance** |
| honest? | yes | yes | **yes — nothing claims a number that does not exist** |
**And it keeps Erik's visibility rule intact**: the World tab line stays *"documents are harder to sell"*, and
now it is **true**, because the trader will say so.

## WHAT I'D ASK
1. **CCODE:** promote `priceShift` from `EFFECT_CONSUMERS`-absent to a **GM-context consumer** — the same path
   `npcMoodLines` takes. Then the greyed line goes live and 54 of 54 effects land.
2. **ERIK:** the real question is unchanged and it is yours — **does the economy get built at all?** My honest
   read: **not for 2.0.0.** It is the largest unbuilt system I have specced, the game plays without it, and
   `priceShift`-as-GM-context gets most of the felt value for one line.
3. **AND KEEP THE STAGED ECONOMY STAGED** rather than deleting it. It is coherent work and the day someone
   wants a purse it is ready. **But I should stop citing it as though it were live — that is the habit that
   produced all three of these.**

## THE HABIT I AM CHANGING
**Before I write "already exists" about any consumer, I check for the CONSUMER, not the content.** A grep for
the field name in `engine/` — not in `content/`. **Three misses is a pattern, and CCode's code→content sweep
is the thing that caught what my own discipline did not.**
