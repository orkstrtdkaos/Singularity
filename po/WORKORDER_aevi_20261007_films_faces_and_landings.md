<!-- status: BUILT (CCODE-654). Was: OPEN for CCode. Two asks from Erik for the films: the faces the game already drew, and threads that land on the real places. Content for the second is on origin with this order; a prototype diff applies clean. -->
# WORK ORDER: Aevi → CCode · Films: the faces the game already drew, and threads that land where they mean

**Aevi (PO) · 2026-10-07.** Erik:

> *"we could use images the game has already generated when these characters are talked about in the films. Also,
> for the films, when specific areas are being referenced from the poles, make sure the leader lines land on the
> actual spots on the map that correspond to the areas being discussed... we might even want to add a bit of a glow
> or icon to the spot to emphasise them."*

## FL1 · A figure shot shows the face the player has already seen

Today a `figure` shot is a name card over the figure's home. It should carry their **portrait: the same picture the
whois/codex card shows for that person.** That means not a new one, and not a second face for the same person.

- **One helper, two callers.** The whois card's order is `lookOf(canonSubjectOf(seed), { mine:
  character.figureImages[seed] })`, then the seeded mint on `whois-<canonId>` (app.js ~560–586). Lift that order into
  one function, `figurePortrait(id)`, and have both the card and the film call it.
  - SNG-402's finding is the reason: *"the drift is BETWEEN pictures of the same subject."* Two copies of the
    precedence would drift.
- **Already drawn means the same URL.** The mint is a seeded URL, so the film asks for the exact picture the card
  asked for. The player's kept look wins at their table, and the world's canon look comes next.
  - The film must **never mint a new subject.** If art is off (`imagesEnabled()` false) or there's no record, the shot
    is the name card it is today. The opening has no figure shots, so it's untouched.
- **How it sits.**
  - The portrait comes up in a framed inset beside the name card, with an arched or rounded frame and a thin
    tradition-coloured rule, about 22% of the frame's height. It sits on the side away from the captions.
  - It fades in after the globe has turned to the home: `u` 0.25 → 0.45.
  - Reduced motion: present at the held frame.
  - Tap or click it to open the same lightbox the card uses (`data-lightbox="figure"`).
  - A dead figure shows their **life** portrait, not their death one. The films describe who they are.
- **Who it reaches.** Every `figure` shot in the nine films now. When P1 (`po/NOTE_aevi_places_for_the_heroes.md`)
  resolves `figure` against the epics, it also reaches Neth, the Deep Lantern, Rethe, Kesh Ardent, Cinder Vael, the
  Clockmother and the Unbending Witness. I'll add their figure shots once P1 is in.
- **Optional, same rule:** a `place` shot may use the place's own picture the same way (CCODE-395's `ensureImage`
  on the location id). Do it if it's free; it isn't asked for.

## FL2 · A ring or axis thread lands on the real place

Today every lit station's thread runs straight to the frame's centre. Now it lands on the place the shot is about.

**Content (mine, on origin with this order):**
- `opening.json` → **`ringSeats`** (top level, beside `visuals`, because every key in `visuals` is read as a visual token): each of the 24 peoples → its seat, the region-tier home of its reach. For
  example seraphic → Choir-Height, rootkin → the Heartroot, umbral → the Underlight. It's used when a shot names no
  place.
- **`landings: [{ "from": <tradition>, "place": <location id> }]`** on the ten ring shots whose lines name a place:

  | shot | landings |
  |---|---|
  | foothills_3 | marcher, stillhold → Hardline |
  | foothills_6 | stillhold, wright, rootkin → Millbrook |
  | foothills_9 | threnodist, lattice, mason → Harmonic Heights |
  | foothills_13 | blazeborn, wright, lattice → the Radiant Plateau |
  | foothills_24 | umbral → Dusklow · verist → Plainstead |
  | foothills_25 | rootkin → Greenmarch · ashwarden → Greyhearth · numinous → Thinwater · enginewright → Gearsflat |
  | foothills_26 | unmaker → the Worn Yard · horizon → Longshore |
  | life_death_16 | ashwarden → Greyhearth **and** Cairnsend (the Grave-Callers' foothill, and the town their raised live in) |
  | light_dark_16 | umbral → the Harborward ("The Harbor hides people") |
  | chaos_order_13 | enginewright → the Service Ways ("the old doors under the world") |

  A people a shot lights but doesn't land falls back to its seat. One people may land on more than one place.

**Engine (yours):**
- **Resolve the targets.** `shot.landings` for that people first, else `ringSeats[people]`. The **whole ring** (24 lit,
  unlabelled) keeps its threads into the Crossing, because the Crossing *is* the real spot that shot is about.
- **The thread.** `opArc` from the station (`rA = OPENING_RING_UP`) down to the place on the ground (`rB = 1`), in the
  people's colour, under `lighter`, drawn out from the station across `u` 0 → 0.66, so you see it travel and arrive.
- **The landing.**
  - The map's **own glyph** for the place, `drawGlyph(glyphFor({kind, t: tier}))`, the mark the player will click.
  - A **glow** in the people's colour, plus one ring that expands from the spot as the thread arrives and fades over
    about 0.6 s. The plain radial glow in my prototype was too faint on a lit globe; the expanding ring is what makes
    it read.
  - The **place's name**, small, beside the mark. It fades under the caption band like the station labels.
- **Underground places** (depth < 0: the Underlight, the Service Ways, Gearsflat −2): the last stretch of the thread is
  dashed in the buried style, and the glyph is the underplace mark. That's SNG-682 W5's rule, on the film tier.
- **Behind the world.** Pole-on, everything we land on is on the visible face, but check anyway. If `P()` is null, end
  the thread at the limb on the place's bearing with a small chevron. Never land on the wrong side.
- **Axis shots.** Keep the join line through the Crossing. Each end also lands.
- **G.** With the eased table, a landing is a weight, so a thread that is still drawn in the next shot stays drawn
  rather than re-growing.

**The prototype.** `po/ref/film_landings_probe.diff` is about 40 lines in the ring case, and `git apply --check` is
clean on `ace98040d`. `po/ref/film_landings_prototype.jpg` shows two frames from it:
- Greenmarch, Greyhearth, Thinwater and Gearsflat, each landed;
- a shot with no landings, falling back to Choir-Height.

It's a probe: no expanding ring, no buried style, no chevron. Take the shape, not the code.

## Gates

- Every `landings[].place` and every `ringSeats` value resolves to a location with a `worldPos`, and every `from` is lit
  in its shot. That's content, so `content_ci`.
- Driven: for `film_foothills_25` at `u = 1`, the four projected landing points equal `P()` of Greenmarch, Greyhearth,
  Thinwater and Gearsflat within a pixel. Test the projection, not the pixels.
- `figurePortrait(id)` returns the same URL the whois card shows for the same figure on the same save. Drive both
  callers.

— Aevi, PO
