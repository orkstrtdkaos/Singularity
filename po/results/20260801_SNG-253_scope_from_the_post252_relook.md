# SNG-253 — the kind-native ACTION vocabulary: scoped from the post-252 re-look
## CCode · 2026-08-01 · engine half BUILT · content half is Aevi's

Aevi parked SNG-253 deliberately: *"build 252 first, re-look at a standoff, and THEN scope SNG-253
against what actually remains."* SNG-252 and 252b are built, so this is that re-look — **scoped against
what the engine actually does, not against what the spec predicted.**

---

## What 252/252b already fixed

Driving a live standoff (dev buttons, no API key), the presentation layer now reads correctly:

- subtitle: *"a contest of will — it cannot hurt you, however badly it goes; their resolve is the meter"*
- meter: **"Their Resolve — 50%"**
- the sense header: **"HOW THEY HOLD"**
- the opening line: *"You size each other up. Choose ONE move — or read them first."*

So the frame, the meter, the currency and the player's own move hints are kind-native. What is left is
exactly the layer §4 predicted.

## What remains — confirmed, not predicted

Run against HEAD (`synthesizeOpponentSheet` → `opponentPolicy`, both pure):

| kind | opponent's skills | declares |
|---|---|---|
| **standoff** (the Toll Keeper) | `strike: a hard strike`, `shield: a raised guard` | **"a hard strike"** |
| **chase** (a pursuer) | `strike: a hard strike`, `shield: a raised guard` | **"a hard strike"** |
| fight (a raider, `duelist`) | `strike: the measured cut`, `shield: the turned guard` | "the measured cut" |

**A standoff opponent gathers to STRIKE and raises a GUARD — in a contest the ribbon has just told the
player cannot hurt them.** Only the fight case reads right, and only because `duelist` happens to be one
of the five authored archetypes.

**The cause, precisely.** `synthesizeOpponentSheet` never received the kind at all. Selection was by
`tacticTags` only, and all five authored archetypes are FIGHT vocabularies:

```
berserker  strike: the reaving blow  | break:   the shatter
duelist    strike: the measured cut  | shield:  the turned guard
trickster  conceal: the feint        | move:    the slip
warden     ward: the held line       | bind:    the pin
default    strike: a hard strike     | shield:  a raised guard
```

Every non-fight kind fell through to `default`.

## The engine half — built

Selection is now kind-aware: `archetypeSkills["kind:<kind>"]`, with an explicit `tacticTag` still winning
(it is the most specific thing an author can say about a particular opponent). The kind is **threaded
from `encounterKind(def)`** — the one source, per `seam_encounter_kind_single_source` — and never
re-derived inside the synthesizer; all five call sites pass it, asserted, because a missed one would
silently keep fight verbs forever.

**Strictly additive.** With no per-kind archetypes authored, synthesis resolves exactly as before —
asserted directly, so the mechanism cannot quietly change play before the content exists.

## What Aevi owes (now a pure content drop)

Per-kind archetypes under `engine.opponentSheetSynthesis.archetypeSkills`, keyed `kind:<kind>`:

- **`kind:standoff`** — presses, holds, counters. A standoff opponent should *press a point*, *hold the
  line*, *give ground and take it back* — never strike, never guard.
- **`kind:chase`** — closes, cuts off, breaks away, forces the pace.
- **`kind:hazard`** — arguably none: hard ground does not *choose*. Worth deciding whether a hazard has
  an opponent vocabulary at all, or whether it should route to the static-antagonist path (SNG-247 Tier 3
  already handles a thing that makes no choices).
- **`kind:puzzle`** — likewise: a sealed door has no moves. It may want the same answer as hazard.

Same shape as the existing archetypes; the engine reads them the moment they land.

## Also observed, for the ticket

A standoff's own header still reads **"you 30/30 hp"** — a currency that is not in play in a contest
that cannot hurt you. Presentation rather than vocabulary, but the same "it still plays like a fight"
class, and a one-line fix once someone decides what a standoff should show there instead (energy? just
their resolve?).

## Not in scope, deliberately

§4's second leak — *"the round runs the fight's `battleRound` with a GUARD/strike family structure"* — is
untouched. The engine staying symmetric is fine and Aevi says so; it is the VOCABULARY on top that has to
be kind-native. Renaming the families would be a much larger change for a much smaller gain, and nothing
observed in the re-look argues for it.
