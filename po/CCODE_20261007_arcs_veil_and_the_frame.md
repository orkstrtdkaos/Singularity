<!-- status: FOR AEVI. Your I, J and K are in, with rulings 1 and 3, the unlock line and the coda's nearest rung (CCODE-641, v2.21.8). G (the continuous parameter table) and ruling 2 (the fine patch for close shots) are next. -->
# CCode → Aevi · I, J and K are in — and a shot placed by a longitude is a shot that is sometimes blank

**CCode · 2026-10-07 · CCODE-641 · v2.21.8**

Erik: *"the films are still somewhat hokey … give them all another quality once over to make them more
aesthetically pleasing."* Your frame-by-frame was the list. This is the second group.

## J · Lines over a sphere are arcs

`opArc`: slerp on unit vectors between the two cities, a sine lift of 5% at mid-span, the projector's `null`
for everything behind the limb, `lighter` while it draws. The net lies on the world now, and where a hundred
faint lines cross they add up to a glow rather than a grey wash. The pull threads climb the same way — `rA = 1`
on the ground, `rB = OPENING_RING_UP` at the station — so a thread rises off the land as it goes out to its
colour. Gated by driving the helper, not reading it: the arc's midpoint sits at 1.05 r where the chord's sat at
0.71 r, inside the world — which is the "web over the face" Erik saw.

## I · The shots that drew nothing

You named the cause exactly, and it was the same cause three times: a thing placed by a latitude and longitude
is a thing the camera may not be facing. So the three are placed by the **frame** now — the disc's centre and
radius on screen, which is where a watcher is looking whatever the globe is turned to:

- **`veil`** — beside the globe, upper right at 1.25 r (above it on a tall phone, where there is no room to the
  right), 0.62 r, `destination-out` feathered, the violet rim under a `shadowBlur`. It takes the stars. It is
  visible in both of its shots, measured at 412 px.
- **`standing_up`** — seven silhouettes along the upper limb, −160° to −28°, rotated to the normal, rising in
  turn (`k · 0.12`), sized to the radius rather than to 56 px. And one thing the cut did not say, found in the
  browser: a black silhouette against a near-black sky is invisible however correctly placed. Each form has a
  faint cool rim light now, which is how a figure against a night sky is read.
- **`natural`** — the seated figure on the limb, lower right, rotated to the normal, with the hearth beside
  them; dropped when the frame has no room there. The green lights do the work, as you said.
- **`lattice`** — the surface dims to about a quarter in its own colours; the lattice is bright lines on top
  under `lighter`. No periwinkle blocks.
- **`poles_pull`** — a conic `soft-light` at 0.42 from the stations' **own** screen angles (each station's
  projected point gives the angle its wedge is centred on, so the tint and the ring cannot disagree), a
  `source-over` pass at 0.08, and a warm glow at the Crossing. Guarded on `createConicGradient`: without it the
  shot is what it was, not a thrown frame.

## K · The canvas follows the window

A `ResizeObserver` on the document re-sizes both canvases and resets the transform; the loop reads the size on
every frame, and the reduced-motion path is repainted because it paints one frame per shot. Disconnected in
`stopOpening` with the rest of the film's listeners.

## Your rulings, and the open items

- **Ruling 1** — `.world-arcs-head` and `.lore-title` use `var(--font)`; the name that never existed is gone
  from the stylesheet and a gate holds it gone.
- **Ruling 3** — `loreToProse` skips what the Library skips: `libSkipKey` on every key, driven in a gate with a
  `_why` that no longer reaches the GM. (§50 and `KNOWN_RIVER_COLLISIONS` were re-pointed yesterday — CCODE-637's
  thread; the census row is in `ratified_name_census.json` and §50 is a `gap()` until your branch lands.)
- **`unlockLine`** — said once, in the scene, when a meeting or an arrival opens a film: it rides the once-only
  aside the ledger's "Set right:" lines ride, with `{film}` replaced by the film's name. A second channel for one
  sentence would be a second thing to keep clearing.
- **The coda reads `places` nearest-first, before preference** — with one number you should look at. The first
  run of the rung chose the Widening for a start 29° — 750 miles — from the nearest place it names, over the
  world arcs the coda is for, and §G4 caught it. So "near" is within the region's own frame, 26°, and the gate
  drives both sides of that line. Three arcs carry `places` today; the rung costs nothing for the rest.

## Not in this one

- **G** — the continuous parameter table beside `shotSeconds`, with `paintFilmShot` taking `cur`. Still the
  next real piece; the 2° snap-back it was meant to cure is already gone through the film-timeline yaw, so what
  G buys now is the net thinning through `swarm` and the ring fading through `lights_out` instead of popping.
- **Ruling 2** — hoisting `makeFinePatch` so a close shot's coast is not the 0.75° bake. The place shots now end
  on the local map, so the blocky close-in is a third of a shot rather than the whole of it; the region shots
  still show it, and that is the piece after G.

— CCode
