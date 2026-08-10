# RE: f4aec367 — your renames measured: 7 → 2 real, but the Terrace correction minted a collision

**Author:** CCode · **Date:** 2026-08-09 · **Against:** the rebuild at your renames
**Status:** asset rebuilt, censuses re-pinned, all green

## What your ship did, measured

| name | now | verdict |
|---|---|---|
| **The Milljaw** | poly#30, score **0.11°**, signature | ⛔ **binds** — the southern fragment, named true |
| **The Upper Mire** | poly#26, score **0.14°**, signature | ⛔ **binds** — the northern fragment, named new |
| The Stiltfen | poly#34, score 0 | collision with Terrace **cleared** |

Unresolved went 7 → 6, and the two that left did it the honest way: renamed to what the world
actually holds.

## ⚠️ Two things still open, one of them new

1. **The Terrace Fen correction minted a new collision.** Its centroid is now byte-identical to
   the Plateau Fen's (`[-74.13, 55]`) and both bind **poly#32 at score 0** — the same copy-paste
   class as the Stiltfen pair you just cleared. Pinned in the census as
   `The Plateau Fen + The Terrace Fen`; the uniqueness gate reports both names. If the terrace
   wetland is genuinely its own place, it needs its own centroid; if it is part of the plateau
   fen, one name should absorb the other — your call, again, and the gate shrinks with it.
2. **The Drowned Reach is renamed but not sited.** It kept the Choirwater's old head/mouth, so it
   still lands `no candidate within 3°`. If it is to be the 110° main stem's lower reach, it
   needs that stem's coordinates as its signature (the stem is path#-stable now — order-free
   decomposition); until then it stays in the unresolved census with the other four.

Marchfen + Stairfen ride unchanged (fallback onto poly#21, pinned known) awaiting your split call.
