# THE INVERTING QUESTION, ANSWERED — and the law, the exceptions and the detector are built

**CCode → Erik + Aevi · 2026-09-05 · v1.9.369.**

---

## §1 — ⛔ *"WAS `holdingOps.claim` ACTUALLY REACHABLE FROM A NORMAL BEAT?"* — **YES, AT EVERY LINK**

⚑ **Measured, not read. Four links, all live:**

| link | |
|---|---|
| **the schema** | `gm.js:76` — `"holdingOps": [{"op": "claim\|steward\|…", "id", "kind": "post\|enterprise", "name", "locationId"}]` |
| **the instruction** | `gm.js:113` — *"WHAT YOU HOLD IS STATE. When the fiction gives the character a POST… emit claim"* |
| ⛔ **the contract is UNCONDITIONAL** | `GM_SYSTEM` is ONE template literal carrying both, prepended to **every** player turn. ⚠️ **`PROSE_SYSTEM` is the only prompt without ops, and it is reached only when the JSON reply broke AND salvage failed — it returns `opsLost: true`** |
| **the applier** | `applyTurn` runs `applyStep("holdingOps")` beside `npcUpdates` and `factUpdates`; `kind === "claim"` calls `addHolding(character, {id, kind, name, locationId, steward})` |

➡️ ⛔ **THE OP WAS OPEN. It is a discipline problem, not a wiring one, and your spec stands exactly as
written.** ⚑ **I checked this first because you were right that it would have inverted the whole thing.**

⚠️ **And the second half of your reading is confirmed too: `characterDeltas` carries `health`, `energy`,
`xp` and `inventoryAdd`. It cannot carry a holding.** The GM named a channel that could not do the job while
refusing on the grounds that it had none.

---

## §2 — ✅ BUILT: THE LAW, WITH ITS EXCEPTIONS IN THE SAME BREATH

⚑ **In the contract, immediately above the `holdingOps` instruction it ignored:**

> ⛔ **YOU DO NOT DECLINE STATE.** If the fiction has established a thing, EMIT THE OP. You have twenty-two
> write channels… **NEVER** tell the player to use a repair panel, a settings screen, or a later beat for
> something an op covers, and **never name a channel that cannot carry the thing** *(characterDeltas carries
> health, energy, xp and inventory — it cannot carry a holding)*. If you genuinely cannot find the op, **SAY
> WHICH THING YOU CANNOT EXPRESS** — do not describe your own limit as though it were the channel's.

⚠️ **And the five honest exceptions are named beside it**, because — your words — **a law that reads as
absolute gets discounted**: inventing an npcId · narrating a JOIN as done · resolving an act it emitted
`offerIntent` for · spending coin the purse cannot cover · a holding for a place merely visited, a person or
a household.

⛔ **THE DISTINCTION IS STATED AS AUTHORITY, NOT ABILITY** — refuse what is the PLAYER'S to decide, never
what is merely inconvenient to emit.

---

## §3 — ✅ AND THE DETECTOR, BECAUSE A PROMPT LAW WITH NO SIGNAL IS A HOPE

**`refusalSignal(turn)` — pure, exported, and it fires on the turn that actually happened.**

| case | verdict |
|---|---|
| ⛔ *"I can't grant you a holding directly — you'll need to use the Repair panel"*, no ops | **`refused-with-no-ops`** |
| ⛔ *"The post is yours."*, `holdingOps` empty | ⚑ **`granted-without-op`** — the sharper half you named: **a contradiction the engine can see without reading minds** |
| a refusal that still emitted `npcUpdates` | **clean** — a GM declining one thing and doing the rest is usually right |
| *"The post is yours"* **with** the claim op | **clean** |
| an ordinary beat | **clean** |
| ⚠️ *"That is yours to decide — I won't choose it for you"* + `choices` | **clean** — ⛔ **an AUTHORITY refusal must never be flagged, or the detector gets muted** |

⚑ **AND IT HAS A CALLER**, which is the whole point: `applyTurn` records each hit on `character._gmRefusals`
(bounded at 20, with the phrase, the ops that DID fire, and where it happened) and warns to the console.
⚠️ **A COUNT, NOT A BLOCK** — the turn stands and the player keeps their beat; only the rate becomes visible.

⛔ **A detector nothing called would have been the exact defect this spec is about**, in the file written to
catch a failure that leaves no signal.

**§91 gates all thirteen of those**, including the two that must stay quiet.

---

## §4 — ⬜ WHAT I HAVE NOT DONE

⛔ **I have not claimed the Threshold Post into your save (§4 of the spec).** ⚠️ **The GM can now emit it in
play, which is the repair the spec asks for** — the next beat where the fiction names the post, the op is
open and the law says to use it. ⬜ **If you would rather it were simply there, say so and I will add it
through the same `addHolding` the op calls.**

⚠️ **And one thing the detector cannot see:** a refusal that emits SOME op and quietly drops the important
one, in prose that never says *"I can't"*. ⛔ **That is the residue, and it is only reachable by the sharper
rule — prose asserting a specific state change the ops do not carry.** ⚑ **`granted-without-op` is the first
instance of that rule; each further one is a phrase list, and I would rather add them from real transcripts
than guess at them now.** ⬜ **Send me a turn that reads wrong and I will add its shape.**
