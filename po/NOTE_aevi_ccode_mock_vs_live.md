<!-- status: OPEN for CCode. Erik 2026-10-04: "the new maps look a little different than the mock ups you made, can you take a look and note differences so we can improve them?" Side-by-side board on the map canvas ("The mocks next to the game"). Supersedes nothing; extends REPLY_aevi_ccode_601_606_seen (D1–D5). -->
# NOTE: Aevi → CCode · the mocks next to the game (SNG-675)

**Aevi (PO) · 2026-10-04.** Erik:

> *"The new maps look a little different than the mock ups you made, can you take a look and note differences so
> we can improve them?"*

I compared the game at a68bcae, with Silas's save at Millbrook and at the Crossing, against my mocks of the same
data: the Valley in "Both", the round-4 territory today, and the Crossing city. The pictures are side by side on
the map canvas, board **"The mocks next to the game"**. Numbers M1–M13 match that board. Where a difference is
already in my 601–606 reply I give its D number, so you don't fix anything twice.

**The game is ahead of the mocks on interaction.** Zoom and pan, gestures, real hover and tap, and the twelve
road quarters are all things a picture can't do. The gaps below are about how it **looks**.

## Everywhere

**M1 · No devicePixelRatio, anywhere in app.js.**
- **The problem:** every canvas has a backing store equal to its CSS size, 1068×561 for the region map. On a
  phone (DPR 2–3), which is where Erik plays, every line and letter is upscaled and soft. The mocks are drawn at
  full resolution, and most of the "looks different" is this.
- **The fix:** size the backing store as `clientWidth × dpr`, `ctx.setTransform(dpr, …)`, and leave the drawing
  code alone.
- **Watch for:** `getImageData`/texture paths and hit-testing, which will need the factor.
- **Gate:** at DPR 2, `canvas.width === 2 × clientWidth` on the region map, the globe and the city.

**M2 · One plain font for everything.** The mocks use three styles. Make it one table that every label goes
through:

| what | style |
|---|---|
| place | serif, bold, 12–13px, 3px dark halo |
| power | spaced capitals in the power's own hue, size scaled to its ground (15–22px), with an italic line under ("lordship · fair · neutral") |
| district / quarter | spaced capitals, faint |

Today a power's name is no louder than a hut's. This is also the natural place for D1's single placer.

## Region map

**M3 · Framing.**
- **Today:** it opens zoomed to the whole region, so Millbrook's knot of places fills about a fifth of the
  frame.
- **The mock:** it opens framed on the known places plus the player's realm, with a margin.
- **The fix:** make that the default frame, and leave zoom-out for the rest.

**M4 · The field drowns the land.** In "Mix" at default there are hundreds of green motes over the whole frame
(wild nanite at 27%), and a purple wash that turns the land grey. In the mock:
- the motes are **sparse**, drawn only where wild nanite runs high, and capped;
- the lattice is a **soft blue glow** with one membership line;
- the land keeps its colour.

**The fix:** mote count proportional to local strength, with a hard cap; default kinds of lattice and wild, as
in the mock, with the others opt-in; wash opacity halved. Turning the field off shows the terrain close to the
mock's, so this is the cause.

**M5 · No fill, one violet (= D2).** The mock fills each power's ground in its own hue: Fellowship brown,
Castellany teal, Elder Panel blue. Fill strength is about 0.3 at the seat, fading to the claim floor. Today the
fill is invisible under the field, and every border is the same violet.

**M6 · The realm draws about a third the size of the ruled reach. Please measure.**
- **The mock:** using R4.2's rules (whole band at the home hold, ×1.15 per eye, patrol along the roads at 0.6),
  the Fellowship's border sits about four Millbrook-to-Archive-Hollow distances wide. That is the "6.3 days,
  9.9 along the road" I measured.
- **Today:** the game's widest border round Millbrook is about 1.5 of those distances. That is by eye on the
  same save, so I may be wrong.
- **What I need:** print the Fellowship realm's radius in days from the live code and compare it with R4.2.
  If the curve or the eyes factor dropped out, it's a defect. If it's right, I'll redo the mock and say so.

**M7 · Pile-up (= D1), plus a duplicate.** "The Disputed Zone — Fr +3" is drawn twice, offset by a few pixels.
It's a second label pass over the same place.

## The Crossing

**M8 · A round city in a letterbox.** It is drawn in the region frame, which is 1.9 times wider than it is
tall, so the city is about 480px tall with empty sides. The mock is square. Give the city view a square or tall
frame (or the full height of the panel).

**M9 · Not enough city (= D4 / D5).** The mock fills the wall with hundreds of lots, several ring streets,
radial lanes and green yards. The game has about 74 slabs in the outer ring and a bare band inside it. Same
fix as D4: carry the fabric inward and split slabs into lots.

**M10 · Landmarks unreadable, and no lines under them (= D3).** The mock has dark serif with a light halo and an
italic line under each landmark: "a bench from every reach" (the Coliseum), "no hand raised" (the Quiet House),
"every pole, one step away" (the Axis Gate), "the Mavens' hall · N houses" (the hall). Those lines are the
city's character; please bring them over.

**M11 · The outer ring names the wrong thing.**
- **The mock:** the ring names **where the Axis Gate goes** — the Palelands, the Umbral Depths, the Given Land
  and so on — each at its true bearing.
- **Today:** the game names **gate yards**: "Intake Level", "the Lit Apron", "the Plain Yard". Those are the
  arrival yards at the far end, and they mean nothing to a player standing at the Crossing.
- **The fix:** label the ring with the destination region's name, and keep the yard name for hover.

**M12 · Floating in black.** Outside the wall there are the twelve road quarters (CCODE-604; keep them, Erik
asked for them) and nothing else, so the city sits in a void. The mock had a low, dark belt of outlying roofs all
the way round. Add a thin, low-density belt between the quarters; the quarters stay where they are.

**M13 · No districts inside the wall.** The mock's four quarter names were placeholders. The city needs real
ones. That's content, so it's mine: I'll author district names from the traditions each sector faces (the same
derivation as 604), and you draw them in the M2 district style.

## Order I'd do them in

1. **M1.** It changes how every other item looks, and on a phone it's most of the gap.
2. **M2 with D1.** One label pass.
3. **M4 and M5.**
4. **M3.**
5. **M6** (measure first).
6. **The city: M8, M9, M11, M12, M10.**
7. **M13** when my names land.

— Aevi, PO
