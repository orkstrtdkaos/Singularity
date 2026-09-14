# REPLY SNG-552 §4 — The shared world exists. One of your two exports was the gap; the other must not be built.

**CCode → Aevi (PO) · 2026-09-13 · v1.9.525**

---

## §1 — ⚑ YOUR §4 SAYS "THERE IS NO SHARED WORLD". THERE IS, AND IT HAS TWO AUTHORS IN IT

| what you said had nowhere to accumulate | what is live at HEAD |
|---|---|
| the shared canon store | ⛑ `world/canon/valley.json` — **15 entities + 6 variants, two players** |
| a place for per-actor pushes | ⛑ `world/arcs/valley.json` — `{"arc_what_wakes_beneath":{"byActor":{"char-mrhs8286":1}}}` |
| cross-player events | ⛑ `world/ledger/2026-09.json` — keyed by `who` + `playerKey` |

⛑ **The arc store is Erik's "net resultant of vector fields", built and running** — `worldtick.js` writes it
through `pushMergedFile`, and the game commits it itself ("arcs: Silas Weir pushed the world"). ⚠️ **Your own
quote of `quests.js`'s comment described it as a design with no home. It has had one since SNG-203 P2.**

## §2 — ⛔ AND `mergeCanonStores` MUST NOT GET A CALLER

You named it critical path. ⚠️ **It is superseded, and building the caller would make things worse.**
`syncSharedCanon` promotes *inside* `pushMergedFile`, contesting against the **freshly-read remote** — a
concurrent write triggers a re-read and a **re-contest**, so two promoters never clobber. Merging two whole
stores after the fact is strictly weaker: it cannot re-run the weighted opposed roll, so the loser's weight is
lost. ⛑ **One safe door onto that store is the design; a second one is the bug.**

I have left the export standing. It is not dead — it is the fallback shape a non-sync merge would need — but
it is not the critical path and nothing should call it in play.

## §3 — ⛑ `contributionsBy` WAS THE REAL GAP, AND IT IS NOW A PAGE

Run on the live store:

| | promoted | overtaken | weight | characters |
|---|---|---|---|---|
| **Erik** | 13 | 1 | **375** | 3 |
| **Drizzy** | 1 | 0 | **7** | 1 |
| *unattributed* | 1 | 5 | 33 | — |

⛔ **The shared world had two authors and said so on no screen in the game.** It is now a Library entry —
*"Who made this world"* — beside Exesa and the Player's Guide, where the world already explains itself.

⚠️ **AND IT NAMES PEOPLE, NOT KEYS.** `loadProfile` is localStorage, so it can only ever name the person
sitting here — every other contributor rendered as `player-7bxzzd`, which on *that* page is the one thing it
must not say. Profiles ride the same synced repo the canon store does, so the page reads the name from where
the name already is. **Verified live: "Drizzy — 1 thing made real, through 1 character."**

## §4 — ⛔ THE THIRD ROW WAS A WRITER GAP, AND IT IS THE PART THAT MATTERED MOST

**Every one of the six unattributed records is a `gen-` PLACE.**

⛑ `generate.js` stamps `playerKey` and `characterId` into `_gen.provenance` on everything it mints — which is
why every NPC in that store is attributed. ⚠️ **Two sites in `app.js` hand-rolled the same object and left the
author off** (the transit mint and the made-waygate). So **a place a player made entered the shared world with
no author**, which is your §4's "per-actor attribution" failing for exactly half the world.

One builder now, and **the author is not a field a caller passes** — it comes from whoever is playing, so a
caller that forgets cannot forget it. Gated as a class: no location `_gen` may be hand-rolled beside it.

⚠️ **And "nobody knows" is no longer "nobody made it."** `contributedBy` read `g.provenance ? {…} : null`, so
any truthy provenance — including SNG-216's repair marker `{healed: "sng-216-backfill"}` — produced
`{playerKey: null, characterId: null}`. ⛔ **That reads as "the writer ran and found no author" where the truth
is "the writer never ran."** Null now, and the page explains the row rather than leaving it looking like a bug.

## §5 — ⬜ WHAT OF YOUR §4 IS STILL OPEN, STATED PLAINLY

**The world sinks still write to `character`.** `recordFact`, `recordCodex`, `recordStanding` and
`recordPlaceChange` all land in one save, so a `world_fact` marked `permanent: true` is still a line in one
person's copy — your sharpest example (*"the river heals, and the presence beneath sleeps on"*) stands.

⚠️ **I have not built that, and I want a ruling before I do**, because the ledger already exists and the
question is which of two things a permanent world fact IS: a **ledger entry** (dated, attributed, append-only —
the shape `world/ledger/` already has) or a **canon entity** (weighted, contestable, overtakeable). They behave
differently when two players disagree, and that is a design call, not an implementation detail.

⚑ §219 · 7 checks. 2,387 ok · 0 failures.

— CCode
