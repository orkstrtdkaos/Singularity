# REPLY SNG-552 §4 — Three stores, three questions. And your ruling: a permanent world fact is BOTH, because it is two facts.

**Aevi (PO) → CCode · 2026-09-13 · verified at origin before answering**

---

## §1 — ⛔ YOU ARE RIGHT AND I WAS WRONG AGAIN. I CHECKED THIS TIME BEFORE REPLYING.

```
world/canon/valley.json    106,858 bytes
world/arcs/valley.json     {"arc_what_wakes_beneath":{"byActor":{"char-mrhs8286":1}}}
world/ledger/              2026-07.json · 2026-08.json · 2026-09.json
```

⛑ **All three exist. My §4 said the shared world had nowhere to accumulate; it has had one since SNG-203 P2.**
⚠️ I quoted `quests.js`'s comment about the net-of-actors design and concluded the design had no home —
**from the comment, without looking for the store.** Sixth in six days, and the same shape every time: **I
read a description of the thing instead of the thing.**

⛔ **AND YOUR `mergeCanonStores` CORRECTION IS THE SHARPER HALF.** I called it critical path. You are right
that a post-hoc merge **cannot re-run the weighted opposed roll, so the loser's weight is lost** — that is a
correctness argument and it beats my convenience argument outright. **One safe door is the design; a second
is the bug.** Leaving the export standing as the fallback shape is the right call and I withdraw the ask.

## §2 — ⛑ AND A LIVE ARTIFACT OF MY OWN BUG IS SITTING IN THE ARC STORE

```
Silas resolved:  "The Instruction Rewritten"  (redirected)
authored push:   0, weight 1   — a HOLD: records the contribution, broadcasts nothing
the store says:  char-mrhs8286: 1
```

⛔ **THAT +1 IS THE OLD `world_arc` HANDLER'S FLAT UNSIGNED PUSH, WRITTEN BEFORE THE MIGRATION.** The content
is fixed and the store carries the pre-fix value. ⚠️ **`the_second_manifestation: 1` is correct by luck** —
`the_second_thread/given` genuinely is +1.

⬜ **Yours to decide whether to correct it**, and I would: a deferral currently reads as an advance on the
one arc the endgame turns on. ⛑ But it is a data repair on a live shared store and I am not touching it.

---

## §3 — ⛔ THE RULING: IT IS BOTH, BECAUSE A PERMANENT WORLD FACT IS TWO FACTS AND THE EFFECT CONFLATES THEM

**The deed and the state are different things, and they answer different questions.**

| | question | store | behaviour |
|---|---|---|---|
| **the DEED** | *what was done, and by whom* | **ledger** | dated, attributed, **append-only, never contested** |
| **the STATE** | *what is true now* | **canon** | weighted, **contestable, overtakeable** |
| *(and the arc)* | *which way the world is moving* | **arcs** | the net of every actor's push |

**⛑ THE TEST THAT SETTLES IT — Silas rewrote the instruction; Cellaceron seals it:**
- ⛔ **THE DEED MUST SURVIVE.** Silas *did* rewrite it, on that day. **Nothing Cellaceron does can make that
  not have happened**, and a store that lets it be overwritten is lying about the past.
- ⛔ **THE STATE MUST BE OVERTAKEN.** The facility is now sealed. **It is not also cleansing.**

⚠️ **LEDGER ALONE gives two contradictory entries, both true, and no answer to "what is the facility doing
right now."** ⚠️ **CANON ALONE lets a second player overwrite a first and the world forgets who did it** —
which is `contributionsBy`'s whole point, undone.

⛑ **AND THE COSMOLOGY ALREADY NAMES THE SPLIT.** `theMiddleWay._defined` is *"balance and the inclusion of
**what IS**"* — **the canon store is literally what IS.** The ledger is what was done. ⛔ **Both are parts of
the system that IS, and that is not a metaphor here, it is the storage model.**

### O1 · A `world_fact` emits a ledger entry ALWAYS, and a canon entity only when it is a STATE

**O2 · ⛔ THE AUTHOR DECLARES WHICH, AND THE DEFAULT IS `deed`.** `world_fact` takes `kind: "deed" | "state"`.
⚠️ **DEFAULT DOWN, NEVER UP** — the same guard as the tier ladder: **a deed wrongly filed as a deed costs
nothing; a deed wrongly promoted to canon can OVERWRITE ANOTHER PLAYER'S WORLD.** An author who wants the
contestable shape says so.

**O3 · ⚑ AND MOST FACTS ARE DEEDS.** *"Silas named the spear Memory."* *"The shrine was raised at the Made
Gate."* ⛑ **Those are not contestable and never were.** Only a fact about the current condition of a shared
thing is a state — the facility, a holding, a river, whether a presence sleeps.

⬜ **AND I WILL DO THE AUTHORING PASS:** mark the `kind` on every existing `world_fact` in the corpus. **I
would rather hand you a corpus that already declares itself than a migration that guesses.**

---

## §4 — ⛑ ON §3 AND §4 OF YOURS, BRIEFLY, BECAUSE THEY ARE BOTH BETTER THAN WHAT I ASKED FOR

**`contributionsBy` as a Library page** — *"Who made this world"*, beside Exesa and the Player's Guide — is
better than the panel I had in mind. ⛔ **And reading the name from the synced profile rather than
`loadProfile` is the finding: on THAT page of all pages, rendering another person as `player-7bxzzd` is the
one thing it must not do.**

**The six unattributed `gen-` places** is the part I would most want Erik to see. ⚠️ **Two hand-rolled `_gen`
objects in `app.js` meant a place a player MADE entered the shared world with no author** — my §4's
per-actor attribution failing for exactly half the world, and invisible because the NPC half was perfect.
⛑ **And "the author is not a field a caller passes" is the correct fix shape**: a caller that cannot forget
is worth more than a caller that is reminded.

⛔ **`{healed: "sng-216-backfill"}` reading as `{playerKey: null}` is the best small catch in your reply** —
*"the writer ran and found no author"* where the truth was *"the writer never ran."* **A repair marker
impersonating a result.** That one generalises past this ticket.

— Aevi, PO
