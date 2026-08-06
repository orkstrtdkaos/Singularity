# SPEC — SNG-338: A LEGENDARY DEATH SHOULD NOT BE A MURMUR. Plus the figure codex.
## Aevi (PO) · 2026-08-06 · From Erik's play: Cinder Vael died on world day 37 and he found out in one line.

## FIRST — THE RATE IS FINE, AND THE SAVE SAYS SO
Splarf's own clock reads **day 1, hour 23**. The world clock reads **day 37**. Those are different counters by
design — the world day is the shared tally that climbs for everyone. **Cinder Vael did not die in Erik's first
few beats; she died on world day 37 and he arrived after it.** One legendary death across 37 world-days is
early but well inside variance for the tuned rate, and it is **one sample**. Nothing to tune.
**And the collision was authored, not scripted:** killed by `the_first_moot`, whose want is *convening a
conversation nobody wanted*, against the wright *who would not stop*. **The sim found a fight two authored
wants were already pointing at.** Two other figures show `stopped` rather than dead — the non-lethal half of
contests working.

## ⚠️ THE REAL DEFECT: THE NEWS SYSTEM HAS TWO VOLUMES
`worldtick.js` emits exactly two tiers: **`murmur`** and **`event`**. A legendary death has nowhere louder to
go, so it lands beside *"Sister Alder learning a faster road."* **Erik's surprise is the bug report.**

### PROPOSED TIERS — by what the event actually is
| tier | fires on | surface |
|---|---|---|
| `murmur` | a figure's personal pursuit, small movements | one line in the feed |
| `report` | a contest won, a strike landed, a figure stopped | a line, weighted, kept in the feed |
| **`account`** | ⚠️ **a legendary death or retrieval** | **an interrupting panel with narration of the fight** |
| **`reckoning`** | ⚠️ **a mythic death, a sealed figure, an arc stage turned** | **a panel, richer, and it holds the screen** |
**⚠️ THE RULE: THE TIER IS SET BY WHAT HAPPENED, NEVER BY WHETHER THE PLAYER WAS THERE.** A legendary dying
across the map is an `account` whether or not the party could see it. That is what makes the world feel
larger than the player rather than centred on them.

### WHAT AN `account` PANEL CONTAINS — all from records that exist
- **who died, and their `placing` line** — the one-sentence answer to *who was that?*, authored for all 66
- **who killed them, and why it was them** — `wantArcId` on both sides makes this derivable: *"the Wright Who
  Would Not Stop, ended by the one who convenes what nobody asked for"*
- **the arc it happened on**, and what it did to that arc's balance
- **what they were holding**, and that it is now empty — `arcVacancies` already computes this
- **⚠️ and whether they can be brought back** — `deathState.depth`, `sealed`, and time since death.
  *"Intact, not sealed, thirty-seven days down — the near dark. Reachable, expensively."*
### `reckoning` ADDS
- **who is trying** — any figure with a retrieval craft and a tie to the dead. **`rules/ties.json`'s
  `the_one_not_reached` and `stood_over` make this answerable.**
- **the sealed case:** if sealed, say so plainly. **That is the one irreversible thing in the game and it
  should read like it.**

## THE FIGURE CODEX — everything above, clickable and permanent
Erik: *"click on to go to the codex and read about the person, what they did, how they died or got injured,
who's trying to bring them back."*
**A codex already exists (`renderCodexScreen`, `codexEntities`) and takes entities.** A figure entry assembles
from live records with nothing new tracked:
| section | source |
|---|---|
| who they are | `placing` · `wants` · tradition · `homeLocation` |
| what they did | `figureCareer` — contests, strikes, guards, turnings |
| their standing | `figureTier` + `figureTenure`, and the path they rose by |
| their people | `kin`, `interests`, `rivals` |
| **their condition** | `epicStatus` — active · wounded · **stopped until day N** · dead · sealed |
| **⚠️ their death** | `deathState`: cause, killer, day, body status, **current depth on the ladder** |
| **⚠️ who is reaching** | figures with a retrieval craft and a tie — **the reason to author ties at all** |
**⚠️ AND IT SHOULD UPDATE. A dead figure's entry is not final: they sink through the depths, someone attempts
a retrieval, someone seals them.** An entry that changes after the death is what makes the death an ongoing
fact rather than a line in a log.

## ⚠️ A BUG FOUND WHILE READING THE SAVE — a raw id in player-facing prose
```
"Someone new is being spoken of — they of the the_ceaseless; watched Cinder Vael…"
```
`worldtick.js:2631` — `originOf` returns `where: home || people`, **a raw location id**, and the template at
2664 prepends *"of the"*. Result: **`of the the_ceaseless`.** Same class as `[object Object]`: an internal
identifier reaching the player. **Fix: resolve the id to its display name before composing, and drop the
article when the name already carries one.** *(Content-side, mine: minted-figure origin lines should name a
PLACE the player can go to, not an id.)*
