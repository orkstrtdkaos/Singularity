# CCode · 2026-09-07 · Party play, built — and why the playtest went the way it did

**v1.9.406 · gate §132, 24 checks.** ⛔ **Erik:** *"build the entire party play we have been working toward."*

---

## §1 — ⛔ WHY IT WENT BADLY, MEASURED

**26 of `party.js`'s 38 exports had NO CALLER IN `app.js`.**

| built, and unreachable | |
|---|---|
| **the leader** | `setLeader` · `leaderOf` |
| **intents** | `stateIntent` · `intentsOf` |
| **the straggler call** | `stragglerCall` · `STRAGGLER_CHOICES` · `heldRounds` |
| **the shared opponent** | `openSharedEncounter` · `closeSharedEncounter` · `sharedPool` · `mergeStrike` |
| **the round** | `lockDeclaration` · `allLocked` · `unlockedFighters` · `resolveOrder` · `advanceRound` · `RESOLVE_ORDER` |
| **the fight roster** | `joinFight` · `leaveFight` · `fightersOf` |

⚠️ **Authored, registered, loaded — never READ.** ⛑ **The four doors, in the one system Aevi flagged as
demo-critical.** ➡️ **What Brook and Brayden could actually do was share a scene and take turns narrating.**
⛔ **Every co-op mechanic was invisible, and that is the whole of *"the results were not great."***

⚑ **AND THE GM SIDE WAS ALREADY DONE.** `partyBlockForGM` has been reading intents, held rounds, the shared
pool and the fighters **for two versions**, with nothing in the game able to write what it reads.

---

## §2 — ✅ WHAT LANDED, AND NOTHING IN THE ENGINE CHANGED

**A party panel — the one party surface. If a thing cannot be done there, it cannot be done.**

| §3 SCENE MODE | |
|---|---|
| **a leader** | defaults to whoever opened the scene, **passable**, ⛔ **never assigned by the engine** |
| **an intent** | *"What are you reaching for?"* — ⚑ **restateable, because a person may change their mind about what they want; a declaration may not** |
| **the digest** | the GM narrates what your people are reaching for **before** the leader chooses |

| §4 BATTLE MODE | |
|---|---|
| **one opponent** | *"Fight this together"* — ⚑ **the pool is DERIVED from the strike ledger, never stored** |
| **the lock** | every player declares from their **own** battle menu; ⛔ **nothing resolves until everyone has spoken** |
| **the order** | ⚑ **PROTECT → KNOW → HARM → RESTORE**, said in the panel in the player's words (*wards → reading → blows → mending*) — ⚠️ **so a ward declared LAST catches a blow declared FIRST**, which is the mechanical reason simultaneity beats turn order |
| **the narration** | ⚑ **one call for the whole round** — better pacing *and* a third of the cost |

⛔ **I DO NOT RESOLVE ANOTHER PLAYER'S MATH ON MY MACHINE.** Each client resolves its own locked declaration
and writes **one strike row keyed `(by, lock.at)`** — ⚑ **so two clients that both see the round complete
write the SAME row, `mergeStrike` recognises the key, and a lost response cannot double-apply.** ⚠️ **The
leader's client resolves a skipped or GM-played member, because that is the only case with no client of its own.**

| §5 ASYNC — ⛔ **the leader never picks anyone's action** | |
|---|---|
| **WAIT** | the round holds, ⚑ **and it is counted** — *"we waited"* must be visible or it is a stall |
| **SKIP** | ⛔ **they GUARD** — still in the fight, still targetable, **never a strike nobody chose** |
| **LET THE GM PLAY THEM** | ⚑ **their own sheet acts** — R36, and it needed nothing new |

---

## §3 — ⚠️ MEASURED IN A REAL BROWSER, NOT ASSUMED

**Loaded at 390px with a real save: no console errors, nothing overflows, the page does not scroll sideways,
and the panel correctly stays away in solo play.** ⛔ **But it is a bottom sheet on a phone and would have sat
over the play input** — ➡️ **so it starts FOLDED there and hands the page back its own height. A dock that
covers the thing you type into is worse than no dock.**

⛑ **And §132 caught a real `ReferenceError` on the way:** `RESOLVE_ORDER` used in the panel and missing from
the import list — **it would have thrown the moment a shared fight opened.**

---

## §4 — ⬜ WHAT I STILL WANT FROM THE TABLE

1. ⛔ **Two players have never been in one scene in this repository.** The join round-trip is the last
   unexercised path, and it is the one thing I cannot fake from here. ⚑ **Have Brook and Brayden open one
   scene and both join it — that alone is the test.**
2. ⚠️ **§3d is still Erik's:** *a declined intent is a beat, and it may touch a bond between two REAL players'
   characters.* ⛔ **A mechanic with a social consequence between two people at the same table is a ruling, not
   a build.** ⬜ Unbuilt on purpose.
3. ⬜ **The straggler timer is manual.** The leader calls it when they choose; there is no countdown. ⚠️ Aevi's
   spec wants *"resolving in 30s"* — ⛑ **I would rather Erik feel the manual one first and say whether a clock
   makes it better or worse.**
