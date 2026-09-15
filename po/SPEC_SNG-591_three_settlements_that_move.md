<!-- status: SNG-591 spec_ready GO (Erik 2026-09-14) -->
# SPEC SNG-591 — Three settlements say they move, and all three sit still

**Aevi (PO) · 2026-09-14 · content authored, reader is CCode's**

---

## §1 — ERIK'S CATCH

> *"I notice the Horizon-Walkers have a settlement called the Long Span… it moves. That would be a good use
> of the new carriage capability to show the movement of that place."*

⛑ **AND IT IS THREE PLACES, NOT ONE.** Measured across all 138 locations for prose that describes movement:
**The Long Span** (*"not a city — a MOVING settlement"*), **The Unlanded** (*"a column of people and carts
moving across open country… no camp, no fires, no halt"*), and **The Wend** (*"a road-people's camp that
curves rather than runs"*). ⛔ **All three have sat still since they were authored.**

## §2 — ⛑ THE MACHINERY ALREADY DOES THE ARITHMETIC

`engine/carriage.js` was built for holdings and **needs nothing new to place a settlement:**

- ⛔ **ALL 138 LOCATIONS CARRY `worldPos`.** I first reported they had no coordinates — I had checked `lat`
  and `lon`, which is not the field the engine uses. `voyagePosition`'s lerp works on a place today.
- ⛑ **`connections` IS ALREADY THE ROUTE.** The Long Span names five: the Wayhouse, the Unlanded, Longshore,
  Waystone, the Measured Engine. **That is a circuit, and it measures 414 miles.**
- ⚠️ **AND `whereaboutsOf` IS ALREADY THE ANSWER A PLAYER WANTS** — *"the nearest known place to where she
  is, the one whose danger she is under, and the one a player would name."*

## §3 — ⛔ WHAT IS GENUINELY NEW: A CIRCUIT IS NOT A VOYAGE

**A holding sails A → B and arrives. A settlement keeps a round and comes back.** `carriage.voyage` has a
`from`, a `to` and an end; a circuit has neither and never finishes.

**Authored on all three, and it is the only new shape:**

```json
"carriage": { "moves": "crewed", "circuit": ["the_long_span","the_wayhouse", …], "daysPerCircuit": 120 }
```

⛑ **The leg for any world day is `(worldDay % daysPerCircuit)` walked across the legs by length** — the same
lerp `voyagePosition` already does, with the endpoints chosen by where in the round you are.

**The three, and they move differently on purpose:**

| | stops | miles | days | pace |
|---|---|---|---|---|
| **The Long Span** | 6 | 414 | 120 | **3 mi/day** — a settlement that camps, and the round is a season and a half |
| **The Unlanded** | 4 | 325 | **28** | **12 mi/day** — it does not halt, and the pace has to say so |
| **The Wend** | 4 | 305 | 60 | 5 mi/day — short, frequent, and it comes back, which is why the markets keep a pitch open |

⚠️ **I had the Unlanded at 90 days until I checked the arithmetic — four miles a day for something that never
stops walking.** The number is the characterisation.

## §4 — THE ASK

**O1 · ⛔ `carriageOf` accepts a location.** It reads `holding.carriage` and nothing about it is
holding-shaped.

**O2 · ⚠️ `circuitPosition(place, worldDay)`** beside `voyagePosition` — same lerp, endpoints from the round.
⛑ **`whereaboutsOf` then answers for a place unchanged**, and a settlement under way reports the nearest
place exactly as a hull does.

**O3 · ⬜ And the line a player reads.** `voyageLine` already writes *"two days out of Keelmouth, nearest
Firstsight, three to go"*. ⛔ **For a settlement it wants the other half — where it is AND when it comes
back**: *"the Long Span is nineteen days past Longshore, bearing on Waystone; it stood where you are in
early spring and will again."*

**O4 · ⚠️ And travel to a moving place must fail honestly.** `connections` says you can go to the Long Span;
today that arrives somewhere it is not. ⛑ **Arriving at a waypoint on the wrong day should find ruts** —
which is exactly what the Unlanded's own prose already promises and nothing delivers.

⛑ **THE CONTENT IS AUTHORED AND IS DEAD UNTIL O1 LANDS**, which I am saying rather than implying — that is
three times today, and the reason I keep authoring first is that a finished field behind one change beats a
change with an empty field behind it.

— Aevi, PO
