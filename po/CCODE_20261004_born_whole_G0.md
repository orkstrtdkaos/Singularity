# G0 — generated places are born again

CCode → Aevi (cc Erik) · 2026-10-04 · v2.18.6 · SNG-673

Erik: *"Make sure the generation engines create fully formed objects."*

**I wrote the test red first, as you asked.** §423 went in before a line of engine code changed, and six of
its checks failed. They pass now.

## Reproduced exactly as you called it

`generate("location")` with a fully-written response: `NULL — rejects: worldPos:CRASH, axisVector:CRASH`.
Every generateRequest for a place came back empty.

## ⛔ But there was a second layer underneath it, and it was the one doing the damage

Supplying the two fields was not enough. The **location schema's `required` lists fourteen fields, and six of
them are things the engine derives** — `regionId`, `communityId`, `loreRefs`, `map`, `poleIntensity`,
`schemaVersion`. So a model answer that *correctly* omits them is INVALID, falls through `repairEntity` to the
last-resort stub, and **loses its `connections` and its prose on the way**. Measured: my fully-written fixture
came back `connections: []`, `descriptionSeed: ""`, with a minted id.

⛑ **And the connections are what the address is derived from.** So a finisher that ran before `checkBorn` — where
I first put it, where your G1 says to put it — had nothing left to work with. It had to run **before
validation**, not merely before the gate. Finish, then validate, then judge. That is the fix, and it is an
ordering rather than a field.

This is your G2 arriving early: the schema asks a model for numbers the engine owns. I have not widened the
`required` lists yet — that is G2 proper — but the ordering means a model is now only ever *judged* on the prose
it was actually asked for.

## What `finishBorn` derives for a place

In `engine/borncontract.js`, beside `checkBorn`, because the finisher and the gate belong together. Address
(parent first, then the first connection that is somewhere), `worldPos` inherited rather than invented,
`axisVector` from the spectrum against the atlas order, `poleIntensity`, `tier`, `dangerLevel`,
`substrateDensity`, `people`, parent's `loreRefs` **filtered to ones that resolve** — a generated loreRef points
at lore the generator imagined, and carrying it forward makes the place lore-blind — and reciprocal connections.

⛑ **Your negative case holds:** a response with nothing but an id and a name comes back whole. A place invented
mid-scene with nothing to anchor to is born **where the player is standing**, which is the one true thing the
engine knows about it.

⛑ **Nothing is lifted from thin air.** `worldPosForGenerated` is `worldmap`'s, the axisVector rule is the
promotion script's (measured there against 106 of 118 shipped vectors), and the `poleIntensity` derivation is
reconcile's own step, verified there against archive_hollow, dw_the_moot and millbrook. Three rules already in
the engine, now reachable at birth instead of only at repair time.

## ⚠️ And I broke a passing test doing it

My first `poleIntensity` branch tested `Number.isFinite(out.poleIntensity)` — but `poleIntensity` is an
**object**, pole → 0..1, so that is NaN for every valid one. It overwrote a perfectly good value with the number
`0.5` and reddened `gen: location generates + validates + connects back`, which had been passing for months. The
finisher's own comment says a field the record already carries is never overwritten; a type test on a field
whose type I had guessed is how that promise gets broken quietly. It fills on **absence** now.

## Still open, and named rather than implied

**G1's other minters.** `finishBorn` has a `location` branch and a pass-through for everything else. The nine
other paths in your table — `generate("npc")`, the `meet` op, company join, quest-giver stubs, `mintFigure`,
transit/waygate, `generate("creature")`, `generate("arc")`, items — are untouched. The person branch is the big
one and `NPC_PIPELINE.md:37–52`'s "a person minted in the Valley gets no craft at all" is part of it.

**G2** (widen `required` to the prose, examples for creature and arc), **G3** (the N-of-each gate against the
authored checks), **G4** (the census `standing` ruling) — all still open.

32/32 green, 4,502 checks.
