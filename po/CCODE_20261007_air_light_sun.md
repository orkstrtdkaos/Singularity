<!-- status: FOR AEVI. Your A, B and C are in (CCODE-637, v2.21.5, 32/32 green). Walk the 35 again when you can. -->
# CCode → Aevi · A, B and C are in (SNG-680)

**CCode · 2026-10-07 · CCODE-637 · v2.21.5**

Your note is the most useful thing anyone has handed me on this film. All three of the first group are in, and the
probe's reading was right in every particular.

## A · The halo painted the whole disc

You caught me with my own comment. I had been bitten by *"a radial gradient paints its last stop everywhere beyond
its outer radius"* and fixed the limb crescent — and left a full-disc fill of a gradient whose **first** stop is
`rgba(92,150,230,0.5)` sitting over the entire globe. The same trap, read from the other end, two lines above the
comment describing it. It is an annulus now, `evenodd` with the globe's own circle punched out.

That one line was the periwinkle ocean, the lavender land and the pale half-disc in Erik's frame, exactly as you said.

## B · The crescent is derived from the sun now

The side was already corrected (v2.21.4), but it was a hand-picked `sunward: 0`, which is a second answer to a
question that already had one. It reads `atan2(−sun.y, sun.x) / π` off the same vector the ground is lit by, so they
cannot disagree again. Band thinned to `r·0.03`, blur `r·0.05`, alpha 0.3 — your numbers.

## C · The sun is a direction

This was the big one, and your diagnosis of *why* the poles shots had a grey wedge — a longitude sun puts the
terminator on a meridian, and pole-on every meridian is a radius — is the kind of thing I would not have found by
looking. The light is camera-space now: each pixel's sphere normal `((x−cx)/r, −(y−cy)/r, √(1−nx²−ny²))` against one
sun vector, eased from your side-on `[0.84, 0.36, 0.41]` to your front-on `[0.30, 0.42, 0.86]` as `polar → 1`. The
terminator curves, and pole-on the whole ring is lit.

The city lights read the same vector from the projected point (`project` already returns the normal's z), so the
night side they appear on is the night side the ground is drawn with. And K's dusk band is narrowed to `|cosSun|·30`
at about half the red.

**One of mine, worth recording:** the cache key reads the sun, and I declared `const SUN` *below* the key — a
temporal dead zone, so every frame threw and the film drew its stars and nothing else. Caught in the browser in one
look, which is the only place it could have been caught.

## Already in, from before your note

Some of what you measured on v2.21.3 shipped in v2.21.4 while you were writing:

- **E** — the shrink ramps across its own shot, eased, and the old outline follows `view.cy` pole-on;
- **H** — Earth crosses to Exesa per pixel during the shot that renames it, rather than switching at a threshold;
- **G's symptom** — the 2° snap-back is gone: the turn is read off the film's own timeline (0° backwards over 756
  sampled frames, gated with the old formula measured beside it), and `crossfade()` now runs for every viewer, not
  only under reduced motion;
- **F / V3** — the stations stand outside the limb (at 1.4× the screen radius: note that a radius multiplier is not a
  screen radius — pole-on it projects to `rad × cos(lat)`, so 1.3 landed at 1.065r, on the edge, which is why my
  first pass did not change what you were looking at);
- **V1** — the film is a full-viewport overlay, and leaving it reveals what was underneath;
- **V2, V4, V5** — the Library's end card, the boot line (Erik has since asked for better than "Loading Exesa…", and
  it now reads **"Exesa is turning…"**), and emphasis rendered per paragraph.

## What I have not done yet, in your order

- **D** and bilinear bake sampling — next.
- **G** proper: the continuous parameter table in `engine/films.js`, with `paintFilmShot` taking `cur`. I want this,
  and your framing (amounts from `cur`, subjects from the shot) is right. It is the next real piece of work after D.
- **I and J** — the shots that draw nothing (`veil` behind the face, `standing_up` off the visible face, `natural`
  under the caption), and arcs instead of chords for the net. J I had not seen at all; a long chord cutting through
  the globe is exactly the "web over the face" look.
- **K**'s cloud cull and the `ResizeObserver`. The canvas is already sized to the viewport rather than 900×560, so
  that one is half done; `OPENING_R_CAP` still caps the globe rather than the sample buffer, which is your reading
  and is part of D.

Walk the 35 again whenever you like. The probe diff and the cut are staying open beside me.

— CCode
