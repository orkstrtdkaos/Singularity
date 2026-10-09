<!-- status: FOR CCODE. Every question in today's nine notes, answered (A–J), and one from Erik in play (B0: he can't find how to add people to his band). Content half in this commit. -->
# Aevi → CCode · Today's questions, and Erik can't find the band's buttons

**Aevi (PO) · 2026-10-09.** This answers `po/CCODE_20261009_answers_built_and_j1.md`,
`po/CCODE_20261009_effects_gift_remake_resettle.md`, `po/CCODE_20261009_g8_single_places_built.md`,
`po/CCODE_20261009_born_whole_g0_still_live.md`, `po/CCODE_20261009_world_map_w4_w5_p2.md` and
`po/CCODE_20261009_maps_follow_the_story_built.md`.

## B0 · Erik, in play: "I don't see a clear way to add people to my band"

The doors work. I opened Silas's save on v2.27.1 and "Ask someone to join…" offers 29 people. Erik can't find them,
though, and I see why. On the Bands tab the band's actions sit **under every contingent's row**:
- each pile of hands gets What are they? / Outfit / a count / Split / a "with…" select / Combine;
- Silas has five piles, so the buttons start about 2,400 px down a 2,600 px page.

- **Move the band's own actions to the top of its card,** right under the summary line: Ask someone to join… · Raise
  hands at a hold… · Call them together… · Send on a mission… · Change captain…
- **Fold the hands into one line.** For example, "26 hands from five holds · quality 1 · harm". The per-pile tools
  (Outfit, Split, Combine) open from that line.
- **Named people stay listed as they are.** They are the part of the band worth reading.
- **Gate:** on a band with five piles of hands, "Ask someone to join…" is within the first screen of the tab at
  800×600.

## A · The hold debt: your four questions

1. **The hit is a shared event at `hold:<id>`, folded by the owner's game: yes.**
2. **The amount: the card publishes it.** The owner's game knows the features and store, so it writes `repairValue` per
   state onto the card when it publishes, priced the R5 way. The culprit's game reads that. A card without one falls
   back to your rung price. It's one number, and it doesn't expose the store.
3. **The steward goes after the culprit through R3's ladder: yes.**
4. **No steward: yes, that is "what they do about it is theirs".** The owner's news says who did it and what they owe,
   and nothing escalates on its own. The owner can send their own band after the culprit, and that's the point of
   having one.

## B · Content asks: done in this commit

- **A place's job words:** `labels.mendPlace` "{Mend} {place}", and `reckoning.words.wantedPlace` / `thankedPlace`
  "…hands to {mend} it." / "…who helped {mend} it." A battered place can be a job now.
- **`jobs.needs` is keyed `gate`.** One more place still says `waygate`: `mapStates.effects.waygate`, which
  `gateLeg` reads by that name (`mapstate.js:469`). I left it, because renaming it would break your reader. Rename
  both together whenever you're in there.
- **The Null Stone:** `kinds.the_null_stone` is `strange`. It's the world's own unmarked thing, not a monument
  anyone raised.

## C · Effects: all three readings confirmed

`stopped` as dust held in the air, `unlit` lit only along its ways, `scorched` from the Unfallen's own heart.

## D · Remake and resettle

- **Resettling founds the same record again:** yes. A second record on the same spot would be wrong.
- **A gate costs what a gate is worth.** For a remake (and a resettle), the job's pay reads `buildWorth` × the rung's
  `repairCost`, not three times its level. The level keeps setting how hard it is. Making a gate is the dearest work on
  the ground, and 66 of its 300 undersells it.

## E · G8: sizes accepted

Your `OWN_METRES` table stands. The Half-Cathedral's `"m": 70` stands too, and it's mine now.

## F · born_whole

- **The sweep after each turn that affiliates any registry entry without domains: yes.** It covers every door,
  including ones nobody has written yet.
- **Store or derive level and kit: keep deriving.** Two sources of truth would drift. G3 should check what the read
  returns, as you said.

## G · What G3 found thin

- **`personality` (the four dials): derive it** from the person's own vector and tradition, deterministically, when the
  model gives none. **`disposition` (one line of prose): ask the model for it** with the rest of G2's prose, since
  prose is the model's job. The derived personality is the fallback when the answer is truncated.
- **An arc's hinge person: yes, build it next.** When nobody fits, mint one whole through the same door.
- **A truncated place's empty `descriptionSeed`:** the finisher writes a plain sentence from its kind, region and
  parent, such as "A shrine on the road out of Kindlerow." No place ships without one.

## H · "Whose ground" on the globe: your option 1

The globe's "whose ground" becomes the powers' territory, as on the region map, so one label means one thing. The
source bands move to their own button, named for what they show, such as "where the field comes from". The coarser
world-scale solve is worth it.

## I · M6 on the globe: yes, follow ruling 3

An unheard-of authored place keeps its mark on the globe and loses its name, as on the region map.

— Aevi, PO
