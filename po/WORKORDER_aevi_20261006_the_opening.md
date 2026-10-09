<!-- status: BUILT (CCODE-632). Was: OPEN for CCode. The script is content (content/packs/core/world/opening.json, on origin with this commit). A playable cut is up for Erik to watch. -->
# WORK ORDER: Aevi → CCode · The opening film, and the coda that lands you in the world (SNG-680)

**Aevi (PO) · 2026-10-06.** Erik:

> *"Let's take a look at the beginning of the game. We should have some sort of opening cinematic or equivalent.
> Something that tells the story of the Earth at the AI singularity event — the rapid development and exponential
> growth of nanotechnology and its structured use to perform magic and miracles… at the cost of energy… the loss of
> meaning and foreclosure as poles developed, the eventual casting off of technology in a quest to get back to
> natural forces and metaphysical powers… the greater battle that all of this is a continuation and evolution of…
> and how you are one of many — pushing on and being pushed by… the Arcs of Exesa."*

## What exists

- **The script is content:** `content/packs/core/world/opening.json`. It has 35 shots in seven movements (Earth, the
  small machines, the cost, the poles, the letting go, the older argument, the Arcs), then a title card and a
  four-shot **coda**.
  - Every string in `lines`, `after`, `title`, `begin`, `coda` and `controls` is player-facing (§29.7). **Don't
    inline any of them in code;** read them from the file, so I can rewrite the film without a code change.
  - Each shot names a `visual` token. `visuals` says what each token shows (under `_direction`).
  - `pacing` sets the hold. A shot lasts `secondsBase` + words × `secondsPerWord` unless it names `seconds`, which
    comes to about three and a half minutes at default pace. A tap moves on at once.
- **A playable cut** is published for Erik as an artifact ("Singularity Opening"). **It is the reference for staging
  and timing, not code to lift.** Its globe is procedural, and yours is the real one.
- **Canon it was written against,** with nothing new invented:
  - world_framing (Exesa is Earth worn down, a third smaller, spent by its own people);
  - the_deep_below (the core harvest, and the bores capped at the Transition);
  - power_systems (magic is structured nanite spent into purpose);
  - EXESA I–III and VIII (the Transition made fiction real; the lattice is dormant and has an owner; the Veil; no
    chosen one; *hold something open*);
  - the_three and the_satiated_sovereigns. **No Precursor or Sovereign is named or shown.** The older argument is
    told as the lattice, the Veil, and "one argument, paused".

## O1 · Where it plays

- **Before the door.** `renderCreate()` (app.js 7185) calls `renderCreateDoor()`. Put `renderOpening()` in front of
  it.
  - **It autoplays on the profile's first new character.** Mark the profile `seenOpening` once it finishes or is
    skipped.
  - **After that the door has a quiet link,** `controls.watchAgain`, beside the three doors.
- **In the Library**, as an entry under the world, so a player can watch it again from inside a game.
- **Leaving:** `begin` ("Begin") goes to the door. Skip goes to the title card, and then the door.

## O2 · One globe, from the first shot to the last

The film's argument is that the world you're shown at the end is the world you play in. So **draw it with
`worldglobe.js` and `terrain.json` wherever you can,** not with a stand-in.

- **Earth:** the same terrain, full size, with a fresh palette (blue sea, green land, ice, city lights on the night
  side). The cities are terrain land points; the count is yours.
- **`shrink`:** the globe contracts to two thirds of its size, and the old outline stays faint behind it. Through
  `cost` and into `poles`, the palette crosses to Exesa's own.
- **`name_wears`:** EARTH wears letter by letter into EXESA: E stays, and A→X, R→E, T→S, H→A. Use the game's display
  face. The cut grains each letter away; anything that reads as *worn*, not *morphed*, is right.
- **`poles_*`:** turn the globe pole-on to **the Crossing** (latitude −90), so the middle is literally the middle.
  The ring of poles around it is **the real ring**: `ringOrder(idx)` and the tradition colours that
  `domainCircleSVG` uses (app.js 4990).
  - This is the same circle the player is about to choose from at the door, so the film teaches it without a word
    of explanation.
  - `poles_pull` tints the land toward its ring sector. `middle_closes` narrows the bright disc at the Crossing and
    greys it.
- **`bores` / `bores_capped`:** a cutaway (crust, mantle, a core that gets smaller) with the shafts lit, then
  capped. Return to the globe for `shrink`.
- **`lattice`:** the globe's surface dims and a fine continuous working shows through every land. **`veil`:** beside
  it, an absence with a faint violet rim that takes the stars out of the sky behind it. **Nothing is inside it.**
- **`arcs`:** the world-scale greater arcs (`greater_arcs.json`, the ones with `scale: "world"`), each a moving band
  of light on its own great circle.
- **`many`:** **the real others.**
  - The great figures, at their current positions, from the world tick.
  - Other travellers from `world/travelers.json`.
  - Pad with anonymous lights up to about 300 if the real ones are few. A player should be able to look back and
    know that some of those lights were people.
- **`you`:** one light, unlit until that shot. It has no position yet (the character doesn't exist); centre it on
  the visible face.

## O3 · The coda: after creation, before the first scene

Same globe, now the world as it is. **Proximity decides,** as ARCS rule one says.

- `coda_1` `{place}`: the starting location's name. The globe turns to it and zooms to its region (`zoom_to_start`),
  framed the way the world map frames that region (SNG-677).
- `coda_2` `{regionLine}`: use `regionLineAtCrossing` if the start is at the Crossing. Otherwise use `regionLine`,
  with the region's display name and `{days}`, the great-circle days from the Crossing (`geodesic` ×
  `DAYS_PER_RADIUS`, rounded).
- `coda_3` `{arcFace}`: the **`publicFace` of the current stage of the arc nearest the start.**
  - Take the nearest arc with a hinge, front or connection at or near that place, then fall back to the nearest
    world-scale arc.
  - ⛔ **Never the water by default.** Erik resolved it in play, and the cut uses the Long Petition's Favours face for
    Millbrook as its sample.
  - Only `publicFace`, never `onceLineKnown` or `onceNamed`: the character knows nothing yet.
- `coda_4` "Begin here." Then the first scene.

## O4 · How it plays

- **Captions:** low and left on wide screens, low with a 16 px gutter on phones. `aria-live="polite"`.
- **Controls:**
  - a tap anywhere is Next; there are Pause and Skip buttons;
  - on a keyboard, → or Space is next, ← is back, and Esc goes to the title;
  - a thin progress track has one segment per movement and shows the movement's `name`.
- **`prefers-reduced-motion`:** crossfades between still frames, with no drift, no falling ash and no letter grain.
- **No sound for now.** Leave a hook (`opening.music` is not authored) and start nothing until a tap, because
  browsers block autoplay with sound.
- **Performance:** the globe raster is the cost. Cap its internal radius on phones; the cut caps it at 210 px and
  holds frame rate.

## Gates

- **G1 · The words are content.** Every caption and label the film shows is read from `opening.json`. A test renders
  the shot list and asserts that each string appears in the file. No literal narration lives in app.js.
- **G2 · §29.7.** Every player-facing string in `opening.json` passes the wording check: no ticket id, no file name,
  no build words.
- **G3 · It plays once, then waits to be asked.**
  - A fresh profile autoplays it on its first new character.
  - A second new character goes straight to the door, which offers `watchAgain`.
  - Skip lands on the title card, then the door.
- **G4 · The coda is the character's.**
  - For a Millbrook start, the region line names the Valley of Echoes and 34 days.
  - For a Crossing start, it reads `regionLineAtCrossing`.
  - The arc face is the nearest arc's current-stage `publicFace`, and is never the water's unless the water is
    nearest and unresolved.
- **G5 · The ring is the ring.** The pole colours and order in `poles_ignite` equal `ringOrder` and the tradition
  colours.

— Aevi, PO
