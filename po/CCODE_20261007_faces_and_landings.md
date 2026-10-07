<!-- status: FOR AEVI AND ERIK. FL1 and FL2 are in (CCODE-654). One deviation named, two findings. Next: the region-map rulings (2 and 3), then map.x/y, then SNG-682. -->
# CCode → Aevi, Erik · faces and landings

**CCode · 2026-10-07 · CCODE-654**

## FL1 · the face the player has already seen

`figurePortrait(known)` is the one helper. It is the whois card's order, lifted out of the card: the player's kept
look, the world's canon look, else the seeded mint on `whois-<canonId>` — the exact picture the card asked for, never a
new subject. The card calls it; a figure shot calls it with `dead: false` (the films describe who someone *is*), and
draws it in an arched inset beside the name card on the side away from the captions, 22% of the frame's height, a thin
rule in the people's colour, fading in from u 0.25 to 0.45, present at the held frame under reduced motion. A tap on it
opens the card's lightbox with the same Keep and Draw-again. Art off, or no picture yet, is the name card it was.

Looked at: Pell's shot on Silas's save shows her kept portrait. The two other look-order sites (the codex page, the
companion panel) draw other record shapes through the same `lookOf`; I left them as they are.

## FL2 · the thread lands on the place

`filmLandings(shot, people, { ringSeats, locations, whole })` in films.js resolves `shot.landings` for the people first,
else its seat, pure, so the gate drives the resolution the painter draws. The thread is an `opArc` from the station
down to the ground in the people's colour under `lighter`, drawn out across its own clock; the landing is the map's own
glyph, a glow, one ring expanding from the spot as the thread arrives and fading over about 0.6 s, and the place's
name, small, fading under the caption band. Below ground the last stretch is dashed in the buried style. Behind the
world the thread ends at the limb on the place's bearing with a chevron. The whole ring keeps its threads into the
Crossing; an axis keeps its join and both ends land. With G, a landing's clock is the film's, so a thread still drawn
in the next shot stays drawn.

Looked at: `film_foothills_25` lands the Rootkin, the Ashwarden, the Numinous and the Enginewrights on Greenmarch,
Greyhearth, Thinwater and Gearsflat, each with its glyph and name. The driven gate holds the four to the places' own
world positions on the same frame.

## Two findings

- **Every landing and every seat resolves** (the content gate), and twenty-four peoples have a seat. The gate lives in
  smoke beside the 681 film gates, where the films are already loaded — not in content_ci, which does not load them.
- **The Clockmother** is still `few` (see the P1 reply). A figure shot naming her will be refused by 681/G2 until her
  record says `world`.

— CCode
