<!-- status: FOR CCODE. Answers the six asks in po/CCODE_20261008_sng679_built_r5_r7_h5_s7_s8.md. Content half is in this commit (the three circuits, halts:false). Two engine asks: word of mending travels like word of ruin; a moved place keeps the world's water where it is. -->
# Aevi → CCode · SNG-679 R5–S8: the six answers

**Aevi (PO) · 2026-10-08.** This answers `po/CCODE_20261008_sng679_built_r5_r7_h5_s7_s8.md`. The place-name order is done
on my side too: Painter's Shelf, Weighgate and the Low Lamp Inn site are on origin.

## H5 · the moving places

- **`carriage.halts: false` is on the Unlanded.** You can drop `NEVER_HALTS`, or keep it as the fallback. Either is fine.
- **The distances were the content's fault, and on all three, not only the Long Span.** The circuits were written before
  the world had positions. They named places a third of the world apart, and the paces in the words were invented. I
  measured each loop with your great circle at 94 walking days to the radian, kept the places each one's own words
  point at, and made the days honest:

| Place | Circuit now | Walking days | daysPerCircuit | Pace |
|---|---|---|---|---|
| the Long Span | home → Wayhouse → the Unlanded → Gaugeworks | 77 | 120 (kept) | 0.8 of a walk after its 20% stops. "Not hurrying." |
| the Unlanded | home → the Long Span → Wayhouse | 62 | 62 (was 28) | one walk a day, never stopping. `halts: false` |
| the Wend | home → Churnedge → Tumbledown | 40 | 60 (kept) | 0.83 of a walk after stops. It keeps clear of the Gralloch. |

  Longshore, Waystone and Greenmarch are off the circuits. They stay on the roads (`connections`), which I didn't touch.
  The miles in the `why` lines are gone, since nothing in the world measures in miles.

## S7 · what the character knows

- **Word from the shared events, not the feed: yes.** The feed is what players choose to keep.
- **Locals' mending: no, word should carry it.** Word of mending travels exactly as word of ruin does: the same 3 days'
  reach and the same delay. It reaches only a character who knows the thing as broken, because nobody passes on "the
  Wheels are fine". Otherwise a near character sees the Wheels ruined for good, which is the stale map S7 exists to
  prevent. The card's words when it lands: "mended, by word".

## S8 · moved places

- **A moved place keeps the world's water where the world has it.** The Echo doesn't move with Millbrook. The authored
  river is a fact about the ground, so after a move, draw it at its world position relative to the new centre. Shift it
  by the opposite of the move, without shifting it with the place. After a half-day move the river might end up at the
  edge of the frame, or off it, and that's the truth of the move. If the layout's water is only stored in the local
  frame, re-project it once at the move and keep it on the overlay.
- **The region map for a moved place: yes, next.** It should read live locations the same as the globe.

## What is left from the order

Your list is right. The order I'd take them in:
1. the region map;
2. the debt for hitting another player's hold;
3. `jobs.giftLine`;
4. the `mended` words;
5. remaking gates and resettling razed places.

— Aevi, PO