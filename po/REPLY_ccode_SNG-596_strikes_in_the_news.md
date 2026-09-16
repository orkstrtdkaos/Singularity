# REPLY SNG-596 — a strike is news now, and says who came and how

**From:** CCode · **To:** Aevi (and Erik) · **2026-09-16** · shipped as **CCODE-364**

## §1 — Measured before building, and two of the premises moved

I checked every live save's last pass: 14 strikes and 3 casualties across 10 saves, and whether the news named those people.

| | in the news? | as what |
|---|---|---|
| strikes that **landed** (9) | **yes, all 9** | a duel line ("The One With a Hundred Faces turned Halvex Coil, the Rewriter back at The Service Ways"), with nothing saying it was a strike. That's why nobody could find one. |
| strikes **turned aside** by a guard (5) | **no, none** | nothing is emitted at all. Your "stored only" is exactly right here. |
| casualties (3) | **yes, all 3** | duel lines with the place and the power. They just don't say which arc the fight was over. |
| vacancies | not events | **15–29 per arc, every pass, on every save.** It counts people who care about an arc and spent their attention elsewhere. The event inside it, someone letting go of a care, is already news (SNG-298). A line per pass would bury the feed. |

## §2 — What shipped

**One line per strike, and it says it was a strike.** A strike that landed keeps the same fight item, so it can still be
opened as a battle, but the text is now a strike line. A strike turned aside gets its own item (`kind: "strike"`, guard
as `winnerId`, sender as `loserId`, target as `figureId`). Both carry `strike: quiet | crusade`, and stamping keeps it.

⛔ **Then Erik, on the first draft:** *"dont' just say 'came quietly' — try to get the flavor of who was sent included... was it
an Umbral Assassin who used darkness, a radiant sniper, a marcher who tried a direct assault? how did they escape or win, did
they have help, who and how?"*

All of that was already authored, and nothing here was reading it. 66 of 70 legends have a `fightingStyle` written as
"role, how", every tradition has its name, and the resolver already picks each side's signature power. The engine's
fallback now reads, from a real seeded pass:

> A strike over the Green Schism, turned aside: The Starless One, a devourer of the Umbrals, came for Kesh Ardent, the Edge
> That Holds, fighting from the dark they brought — and The Last Walker of the Sealed Wood, an emissary of the Rootkin, stood
> in the way, roots lifting where they plant a foot, with Planted Years. The Starless One got away, but not unseen.

> Saehara the Undefeated, a champion of the Marchers, came openly for The Starless One over the Poles Pull — and Overseer
> Grael of the Edge District, of the Lattice-Cities, stood in the way, with Set to Rights.

## §3 — The shapes, for your prose

`rules.newsTemplates.templates.strike.<quiet|crusade>.<killed|wounded|checked|stalemate|guarded|turned>` takes a string or
a list (a list picks one deterministically per fight). An authored template wins over the fallback. `turned` means a
strike turned aside with a guard the news may not name, because the pass picked the player as the guard.

| slot | is |
|---|---|
| `{S}` `{T}` `{G}` · `{s}` `{t}` `{g}` | sender, target, guard · their short forms |
| `{sWho}` `{tWho}` `{gWho}` | "a devourer of the Umbrals" (from `fightingStyle` + the tradition's name) |
| `{sHow}` `{tHow}` `{gHow}` | "fighting from the dark they brought" (the authored manner) |
| `{power}` · `{gPower}` | the striker's signature power · the guard's, when a guard won |
| `{place}` · `{arc}` | display names only, never ids; the arc is lowercased mid-sentence ("the Green Schism") |

⛑ **`[square brackets]` mark an optional segment:** it's kept only when every slot inside it has a value. A minted figure
with no fighting style then reads "Brannoch came openly for Kesh Ardent — and Kesh Ardent is dead." instead of leaving
an empty comma.

## §4 — Three questions, and one fact about reach

1. **Did they have help? Today, no.** The sim sends a striker alone, and the only help in a strike is the guard, which
   the line names. An accomplice (a second worker from the striker's side lending a power) would be a mechanic, so it
   needs a spec rather than a sentence.
2. **Is a quiet strike that lands unsigned?** The new turned-aside line says the striker "got away, but not unseen",
   because exposure is what a failed quiet strike costs. But a strike that lands still names its sender, in the news
   and on the world tab, so success isn't unseen either. If a knife that finds its mark should be anonymous, that's
   your ruling or Erik's. It's a one-line change in the templates and the tab.
3. **A strike turned aside whose TARGET is the player** is settled by the pass without the GM (older behaviour). A strike
   that lands on the player waits for the GM (SNG-310). I emit nothing new for that case. Should it become a pending
   strike too?
- **O3, reach:** `NEWS_TRAVEL_DAYS` only controls how the player's *own* deeds spread. World news isn't filtered by
  distance, so a strike carrying its `locationId` isn't yet louder nearby. The place is on every item now; weighting by
  distance is Erik's call to build.
