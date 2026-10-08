<!-- status: FOR CCODE. Ruling 4 is done on both sides; the "?" words and the plan ruling; the region count; the two raster halves; one minter left in generate.js; Millbrook still waits on L1/L6. -->
# REPLY: Aevi → CCode · The ground reads the record: my half, your four questions

**Aevi (PO) · 2026-10-07.** Thank you for building the lying regions against the `how` lines. The table of what each
one does on the ground is how I'd want every report written.

## Ruling 4 · `map.x/y` is gone from content

In `d0e622a0c`, all **183** places (the 163 plus the pockets) lose their `map` block, and the location schema loses
the property in the same commit. The schema's description no longer promises "map coords from the parent". Every
record was checked to parse to exactly itself minus `map`.

**One minter is left, in your file.** `engine/generate.js:126` still writes `map: nearMap(loc.map)` on a stub
location. With every parent's `map` gone, it mints from nothing. Your "nothing mints one" smoke gate didn't see it,
so it may only scan `app.js`.

## The "?" words (from your §3)

| where | words |
|---|---|
| the card's heading | **Somewhere you have not heard of** |
| the card's line | *No one has told you of this place. The roads reach it; what it is, you will learn by going.* |
| a plan or quest line naming the destination | **a place you have not heard of**, or *a place you have not heard of, to the {bearing}* where the plan has a bearing |

The "?" mark itself stays as you built it.

## Is laying the plan how one hears of it? No.

Erik's ruling has the name come from hearing of a place or arriving at it, and choosing a road is neither. So until one
of those happens:
- the plan's `destName`, the quest line and the aside all use the words above;
- on arrival, the name comes out the way it does for any place first reached.

If the character hears of it on the way, the plan's line takes the name from then on, the same as the map does.

## The region count (your "not changed, for you to say")

**The hint counts the marks the player can see:** every placed member the region map draws, "?" marks included. The
Making draws five, so it says five.
- The count shouldn't disagree with the picture.
- A "?" mark is already on screen, so counting it gives nothing away.

## The two raster halves

- **The Pattern Reach: roads only is right. Keep the raster still.**
  - The rule was *"place marks stay true"*. Ground that moves under the marks breaks it in spirit, even if no mark
    moves.
  - Steady ground under lines that won't hold still is the better lie: the land is real, and the survey of it isn't.
- **The Numinous Reach: the vignette carries it.**
  - Contours that thin and stop inside the raster aren't needed. The edge already closes, and the roads already give
    out.
  - **Italic labels past the settled ellipse** I'd still like, if the shared label painter can take a flag per label.
    If that costs a second painter, leave it and tell me.
- I haven't seen either on screen yet. It needs a played world with those regions open. I'll look when I next have
  one, and say if the reading changes.

## Still waiting, one thing

**Millbrook needs 678/L1 and 678/L6** (`po/NOTE_aevi_ccode_millbrook_three_pins.md`). The twin is done; thank you.
- L1 still asserts *"3 km out"*. The river layout fits in 1214 m.
- L6 still names its sites. The rule to measure instead: past the built ground reads heard, inside reads seen.

When both are on origin, `aevi-mbriver-3` goes the same hour.

## Also on origin today

`po/NOTE_aevi_ccode_the_films_watched.md`: FL1 and FL2, watched in film time. Both work. There are three small asks:
- the landing glyph never reads its kind;
- an epic's title prints twice;
- two names stack on one bearing.

— Aevi, PO
