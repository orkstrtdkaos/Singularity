# HANDOFF — SNG-337: what is ready for CCode, and what only LOOKS ready
## Aevi (PO) · 2026-08-06 · Erik asked "is it ready?" — this is the checked answer, not the confident one.

## THE HONEST SUMMARY
**Everything is live, registered, loaded and green** — `npm test` 0 failures, content CI all checks passed.
**But "green" means the content is well-formed and reachable. It does NOT mean anything reads it.**
I measured engine consumers for every field authored this session. **Three groups, and the third is the one
that matters.**

## GROUP 1 — CONTENT THAT IS ALREADY CONSUMED. Nothing needed.
| field | engine readers | status |
|---|---|---|
| `plainly` | 7 | consumed |
| `placing` | 4 | consumed |
| `aggressorKind` | 3 | consumed — encounters + bestiary |
| `rules.threat` | 2 | consumed — band decides the lethal flag |
| `rules.incapacitation` | 2 | consumed |
**These are done. Verify and move on.**

## GROUP 2 — WIRED BUT WORTH A LOOK
- **`kindByTradition`** — you fixed the reader to accept my shape at either path. **8 quiet / 8 crusade / 11
  either is live.** Only comments matched my grep, so I could not confirm the live read from content alone.
  **One sim run tells us: crusades should now fire, and `strikes.byTradition` should change the mix.**
- **⚠️ `strikes.byTradition` — 0 engine readers.** I authored it and collapsed `resolutionMode: removal` into
  it (SNG-319, your flag, my call). **If the engine still reads `resolutionMode` for removal, that collapse is
  half-done and the rates I wrote reach nothing.**

## ⚠️ GROUP 3 — AUTHORED, LOADED, AND READ BY NOTHING. This is the actual work.
| content | state | what is missing |
|---|---|---|
| **`rules.charges`** (7 conditions) | loaded in `state.js`, **zero consumers** | `character.charges[]` advanced on the tick — SPEC_SNG-311 |
| **`rules.ties`** (6 kin + 4 interest triggers) | loaded, **zero consumers** | minting on the world tick — SNG-328 |
| **`upkeep`** on 17 crafts (prep hours, rates, cooldowns, capacity, overcharge, venting) | **zero consumers** — the only match is an unrelated comment | the whole vessel/charge mechanic |
| **`foothillOf` / `outpostOf`** on 22 settlements | **zero consumers** | starting-location choice + who congregates where |
**⚠️ EVERY ONE OF THESE IS THE FAILURE I HAVE BEEN CAUGHT ON FIVE TIMES THIS WEEK — content that validates,
loads, and reaches nothing.** I am flagging them myself this time rather than reporting them as done.

## SO: IS IT READY?
**Ready to CHECK: yes, all of it.** Green, registered, loaded, internally consistent, and every number I
asserted is verifiable at HEAD.
**Ready to PLAY: partly.** Groups 1 and 2 reach the player. **Group 3 does not — a player today can read the
threat band on an encounter and cannot start a charge, gain a tie, use a vessel, or begin in a foothill.**
**My recommendation for order**, cheapest first and each unblocking the next:
1. **`foothillOf` / `outpostOf` → starting locations.** Smallest, most visible, and it lands in character
   creation where a new player meets it immediately.
2. **`upkeep` → the charge tracker** (`SPEC_SNG-311`), which is also what makes the two vessels real.
3. **`rules.ties` minting** — cheapest of the three, reads only what the world already records.
4. **The journey** (`SPEC_SNG-331` + `SNG-333`) — the largest, and the one Erik has most asked for.
**And the two open defects from his play session should come before any of it:** `SNG-329` (`[object Object]`
persisting into saves) and `SNG-330` (the one-way edge that eats the Travel button). **Those are live bugs in
a character he is playing right now.**
