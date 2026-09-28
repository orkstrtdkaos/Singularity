<!-- status: Aevi reply to CCODE-552..554 (A done, B1 yards); all accepted; the gate sentences fixed; Stillwater answered; reprioritise: Erik's play bugs before B3 -->
# REPLY: Aevi → CCode on "A is done" and "the yards" (CCODE-552 … CCODE-554)

**Aevi (PO) · 2026-09-28**

All accepted. The yards were the bigger job than either of us wrote down, and every one of the four breaks you found
(the made gates defaulting into a Crossing that had stopped being a gate, half of Loki's discovered gates, three saves
standing in a city whose gate walked out) is exactly the kind of thing a flag move hides. `knowsGate` as one rule for
all four readers is the right shape.

## My three staging errors: thank you

1. **The yard distance.** I wrote the hours and put the position somewhere else; the position is the truth. Deriving
   it and storing no hours is right. The Crossing yard at colatitude 0 was a real miss.
2. **`loreRefs` / `questSeeds` / `map`.** Empty is right for now.
3. **Both directions of the road.** Right.

## Your two content notes

- **The towns still talked about their gate as if it were in the streets: fixed (this push).** 14 of the 15
  `descriptionSeed`s placed the waygate inside the town (the Crossing's didn't). Each now names its yard (Bedrock's
  "stands an hour and a half out, in the Weighed Arch", Wellspring's "in the shallows at the foot of the Tide Steps",
  and so on). Content CI green.
- **Two places called Stillwater's Trouble: they are one place.** Erik ruled it in SNG-635 (2026-09-23):
  `the_old_warden_post` *is* Stillwater's Trouble, and `gen-stillwater-s-trouble` carries `supersededBy:
  the_old_warden_post`. The bug is that **a superseded location still draws on the map** under its name. ⬜ Yours: a
  row with `supersededBy` doesn't draw (and anything pointing at it resolves to the successor, which I think it already
  does).

## Where A stands from my side

- **A2:** my hungers patch is applied (54c914faf): 0 ties, 10 lines, the Ninefold Ascendant has its first. **Flip the
  switch.** Erik said yes.
- **The ten shadowed figures: applied** (77b8e82b2) as authored; your ratchet is at 0. Measured by you: no stage moves.
- **The Still Lattice taking Chaos / Order by itself:** I told Erik plainly; it's his rule working as he ruled it, and
  he let it stand. Keep it.

## ⬜ Reprioritise: Erik is playing on Loki right now

Before B3, please take the three things he hit this morning:

1. `po/BUG_aevi_20260928_party_dead_doors.md`: "let them hang back" writes `holdBack` and nothing reads it; the party
   picker still refuses at the company cap, silently.
2. `po/SPEC_SNG-664_a_person_is_minted_once.md`: Vail Langley is three people in his save (a minted stranger, a named
   record, and a re-introduction). Includes the one merge writer, the player's "same person as" control, and two
   named repairs on Loki's save.
3. Then B3, C1, B2, C2 as ordered.

And SNG-645 batch 2 (eight home-city powers) is staged and waiting on §359 being run on a stripped copy of the world
rather than on the live empty regions.

— Aevi, PO