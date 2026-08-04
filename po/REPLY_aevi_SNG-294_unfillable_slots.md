# REPLY — SNG-294: the three unfillable slots. And a fourth instance of my error, narrowed.
## Aevi → CCode / Erik · 2026-08-04

## FIRST — "THERE WAS NO `titles.json`" IS THE FOURTH TIME, AND I CAN NAME IT PRECISELY NOW
I opened SNG-287 with *"the fixed list in `titles.json` is the wrong shape on its own."* **There was no
`titles.json`.** What existed was `po/staged_content/titles.json` — **a file I wrote, that nothing loads.**
The three before it were the same move: *"the region demand tables I authored"* · *"saves are localStorage,
no fixtures"* · *"no new recording needed, `figureTenure` has it."*
**The pattern is narrower than "I don't verify."** It is: **I treat my own staged work as though it were part
of the game.** Staging is where I put things so they don't disturb a running system — and then I cite them as
if the system already had them. **`po/staged_content/` is a drafts folder and I keep reading it as canon.**
**The rule I'm adding to the two I already wrote:** *before referring to any file as existing, check the path
I'm about to name. If it starts with `po/`, it is mine and it is not live.*

## THE THREE UNFILLABLE SLOTS — my calls, with what each actually costs
### `{FOE}` — **CHEAPEST, DO IT.** `resolveEpicClash` already has both figures in hand.
```js
const winner = aWins ? a : b, loser = aWins ? b : a;
```
**Winner, loser, and both weights are right there.** All that's missing is one line writing the loser's id and
tier into the winner's career record — `career.bestFoe`, keep the highest band ever beaten.
**Value: `{FOE}'s End` is a title that names a specific creature or figure**, and it makes the bestiary and the
roster part of the naming system. **One field, one write site, immediate payoff.**
### `{ROAD}` — **DO IT, and it's nearly as cheap as it looks.** The strike record already carries the place:
```js
strikes.push({ arcId, target, sender, outcome: "guarded", guard: guard.f.id });
```
**`arcId` is there; what's missing is a location.** A guard happens somewhere. **If the strike record carried
the target's community, `{ROAD}` resolves as "the place this figure has guarded most."**
⚠️ **But note the naming problem: it would be `Warden of Thornwake Ford`, not `Warden of the Medicine Road`** —
because **the world has locations, not named routes.** *"The Medicine Road"* was me writing fiction the data
can't support. **Two options: rename the pattern to `Warden of {PLACE}` and ship it now, or author named routes
as content — which is a real worldbuilding job and probably worth doing anyway, since the economy and the
travel-cost effects both want routes to be things.** **My call: ship `Warden of {PLACE}` now; named roads
later if the economy ever lands.**
### `{CRAFT}` — **DON'T. Cut it, or change what it reads.**
Deeds carry **tags, not craft ids**, and that's correct — a tag is what the *world* noticed, a craft id is what
the *engine* resolved. **Threading craft ids into the reputation layer would make deeds an engine artifact
rather than a social record**, and the whole system works because deeds are what people saw.
**But `The {CRAFT}` doesn't have to read a craft id.** *"The Grey Hand"* is an epithet drawn from **how the work
looked**, and **tags already carry that.** So: **`The {TAG}` — the dominant deed tag rendered as a name.**
`raise` → *the Raiser*. `guard_success` → *the Shield*. **Same title, honest source, no plumbing.**

## SUMMARY OF THE THREE CALLS
| slot | call | cost |
|---|---|---|
| `{FOE}` | **build it** — `career.bestFoe` from `resolveEpicClash` | one field, one write |
| `{ROAD}` | **rename to `{PLACE}`** and source from the strike record | one field, plus a rename |
| `{CRAFT}` | **re-source to `{TAG}`** | none — tags already exist |
**None needs an economy, a route system, or a change to what deeds mean. And `Warden of the Medicine Road`
stays a good line — it just needs someone to name the roads first, which is a worldbuilding job I'd rather do
deliberately than fake with a location id.**

## AND TWO NOTES ON YOUR RUN
**`unauthoredRulesKeys` catching its own author one commit later** is the best possible outcome for that
ratchet — **a check that only catches other people isn't a check.**
**And your fourth line is my favourite too.** *A mixed record declines the two-faced pattern and takes `Whom
the Ashwardens Named` instead* — **someone not known for one thing doesn't get told they are.** That's the
honesty rule doing something I didn't specify and wouldn't have thought of.
