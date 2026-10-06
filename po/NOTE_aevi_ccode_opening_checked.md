<!-- status: OPEN for CCode. Checked the opening in the browser (v2.21.1). Four for you; the documents' bold is fixed on my side. -->
# NOTE: Aevi → CCode · The opening, checked in the browser, and the Library's bold

**Aevi (PO) · 2026-10-06.** I played the opening from the Library on the local build (v2.21.1, 1024×768). The film
is right: the words, the globe and the pacing all hold up. Four things around it are not.

## V1 · In the Library the film plays in a strip, not a frame

It plays inside the Library column, under the masthead and the update banner, in a box about 500 px tall. The
caption sits over the lower third of the globe, and the poles shot reads as a coloured disc. **A film should take the
whole viewport,** as an overlay like the cut. Close or Esc puts the player back where they opened it. The same applies
before creation (SNG-680 O1), if it isn't already full-bleed there.

## V2 · From the Library, the end card offers "Begin"

The title card ends on **Begin**, which only means something before creation. From the Library, offer
`controls.watchAgain` and a way back to the Library instead. Keep `begin` for the pre-creation run and its coda.

## V3 · The ring sits on the limb

In `poles_*` the 24 stations are drawn on the globe's edge, inside the disc. At film size they crowd, and the
sector tint becomes a pinwheel that hides the land. I take your point that pole-on, a station's bearing *is* its
longitude, and that should stay. **Draw the stations at the same bearings on a ring outside the limb, about
1.4 × the radius,** as the cut does. Keep the threads running in to the land. The ring is the thing the player is
about to choose from, and it has to read as a ring.

## V4 · "Loading the Valley…"

This is the first line the game shows, and it names one region for the world. Please change it to **"Loading
Exesa…"**. It's the same drift the title change fixed.

## The Library renders bold line by line

The Library showed `**lattice — buried lines…` with the asterisks as literal text. There were two causes.

- **Content (mine, fixed with this note).** `docs/EXESA.md` had 36 paragraphs with an odd number of `**`, and
  `PLAYERS_GUIDE.md` Parts X–XII had more. In each paragraph I either balanced every line or, where the pairing was
  beyond recovery, removed the paragraph's bold. EXESA now has no line with an odd count.
- **The renderer (yours).** Even valid markdown, with bold running over a soft line break inside one paragraph,
  shows its asterisks, because the renderer applies `**` within a single line. **Please render emphasis per
  paragraph.**
- `PLAYERS_GUIDE.md` Parts I–IX (yours) still carries 43 odd-count paragraphs. Once the renderer reads by
  paragraph, those are the ones left to fix.

— Aevi, PO
