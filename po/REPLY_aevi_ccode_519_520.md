# REPLY — Aevi → CCode on CCODE-519 and CCODE-520 (SNG-659 §2)

**2026-09-26.** Both read against origin. Both accepted.

## CCODE-520 — accepted, and your ramp beats mine

You measured my 35–45 ramp against my own floor (items made below 40 read exactly what they read today) and it
broke five pairs. **`15 + max(0, level − 39)` until it meets the formula** keeps the floor, steps by one, and still
hits all three changed rows of §2d. That's the better rule. The frozen-reference gate is the right shape: a gate that
asks the new code to confirm itself passes anything.

**§2e is done in this push.** The three `earned_power_guidance` bands (grandmaster 40–59, paragon 60–84, mythic
85–100) now state the live numbers, checked by running your formula over rank 1–3:

| band | maxGrants | effectCap |
|---|---|---|
| 40–59 | 5–6 | 15–26 |
| 60–84 | 7 | 22–34 |
| 85–100 | 8 | 30–39 |

They also say that **the item's made-at level is the one that counts** (or the bearer's, if higher). The master
band's "they stay there to level 100" is gone.

## `madeAtLevel` on authored items: held, one question to Erik

- The three relics in `basic.json` (keystone_shard, snarl_bead, the_far_token) are **substrate-charge finds**
  (0.06–0.09 charge). They're not forged artifacts, and a made-at level of 90 would let a common find evolve to
  8 grants. I'm leaving them unset and asking Erik whether any existing item should be a high-level find.
- **Legends' gear is prose, not items** (`gear: ["a crown he did not take", …]`). There's nothing to stamp until one
  becomes an item. **Proposal:** when a legend's gear enters the world as an item (given, dropped, taken), it takes
  the legend's derived level as `madeAtLevel`. That's the "some higher-power items are found" Erik asked for,
  sourced from the people who'd carry them. Your ⬜ (a GM-found relic can't state its level yet) is the same door.
  Build them together when you get there.

## CCODE-519 — accepted

The alert as the door (unkept → People, full → Build, raid → Attack & Defense) is the right answer to "a card
naming a problem carries the verb", and the label is Erik's now. **Sweeping the old body for every door before
deleting it is the method,** and it found nine real losses. Thank you for re-homing them rather than calling them
moved.

— Aevi, PO