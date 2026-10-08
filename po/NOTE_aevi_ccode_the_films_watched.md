<!-- status: FOR CCODE. FL1 and FL2 watched in film time: both work. Three small asks and one suggestion; contact sheet in po/ref. -->
# NOTE: Aevi → CCode · The films, watched: faces and landings work, four small things left

**Aevi (PO) · 2026-10-07.** I watched FL1 and FL2 frame by frame in film time on origin `d60d28ff4`: the opening
plus the four ring-heavy shots in foothills, life and death, light and dark, and chaos and order. Both orders do what
Erik asked. `po/ref/films_watched_20261007.jpg` shows six frames, numbered to match the list below.

## What works

- **FL2 · the threads land.**
  - Each thread travels from its station and arrives on the real place, with the glow, the expanding ring and the
    name (frames 1–3).
  - **Seat fallback:** the Blazeborn are lit but not landed in foothills_24, so they fall back to Glasshome (frame 3).
  - **Behind the world:** the Harborward sits at colatitude 91°, one degree past the limb. Its thread ends at the limb
    on the right bearing with a chevron (frame 4). It suits the line, *"The Harbor hides people"*, so I'd leave it.
  - **Buried stretch:** the threads to Gearsflat and the Service Ways dash in their buried colour.
  - **G:** a thread still drawn at the cut stays drawn into the next shot.
- **The cut from a place shot.** The camera is out of the local map and pole-on within about 2 s of a ring shot
  starting (foothills_5 → 6). The threads arrive at about two-thirds of the shot, as the order said.
- **FL1 · the faces arrive.** Pell, Neth and Kesh Ardent each show their portrait in the arched inset, on the side away
  from the captions (frame 6). `imagesEnabled()` is on, and the URL is the card's.
- **The audit.** Of the 106 landing and seat targets across the nine films, all but one are within 90° of the Crossing,
  so they're on the face the camera shows pole-on. The one is the Harborward.

## Asks

1. **The landing glyph is always a house** (frame 2). Line ~8451 calls `glyphFor({ kind: L.kind, … })`, but location
   records carry no `kind`; kinds live in `location_kinds.json`. So `L.kind` is null and every landing falls back to
   `"town"`. Read the kind from `CONTENT.locationKinds.kinds[id].kind`, which is what `placeKindOf` in
   `engine/localmap.js` reads. Measured, that gives:

   | place | kind → glyph |
   |---|---|
   | Gearsflat, the Service Ways | underplace → cave (the underplace mark the order asked for) |
   | Hardline | hold → castle |
   | Thinwater | shrine → spire |
   | Greenmarch | market |
   | the Harborward | harbour |
   | Plainstead | hall |
   | Choir-Height | waygate |

   The place-shot and figure-shot glyphs (~8530 and ~9011) read `loc.kind` the same way and have the same miss.
2. **An epic's name card prints its title twice, and a long name runs under the portrait** (frame 6). An epic's `name`
   already contains its `title` (*"Neth, Who Has Buried More Than She Has Known"*), and the card then prints `title`
   again underneath. When `name` ends with `title`:
   - print the part before it large and the title small: **Neth** / *Who Has Buried More Than She Has Known*;
   - stop the card short of the portrait inset, wrapping if it must.
3. **Two landings on one bearing stack their names** (frame 5). In life_death_16, Greyhearth (43° from the Crossing)
   and Cairnsend (87°) share a longitude, so pole-on they sit one behind the other and *Cairnsend* prints over
   *Greyhearth*. When two landing labels overlap, put the second on the other side of its mark.

## One suggestion, for Erik's call more than yours

**A figure shot's ground is still the 16° close-in.** In frame 6 that is the globe raster at a scale where it turns to
blocks. It's what Erik objected to on place shots, which now end on the place's local map. Ending a figure shot on its
home's local map the same way, with the portrait over it, would make the two consistent.

## On my record

- **The stall was the hidden pane.** My first pass watched in a hidden browser pane, where the timers throttle, so shot
  6 looked stuck at local-map zoom. In film time it isn't.
- **The stub was my harness.** I first read foothills_24's Verist thread as stopping short. That was my harness
  painting only the first and last frames. A landing's clock starts the first time its station projects, so painted
  every frame (as the player is), all three land. I'm leaving both mistakes here rather than deleting them.

## The tool

`po/tools/film_stills/` renders any shot of any film at any `u`, eased in from the previous shot exactly as
`renderFilm` does, through the film's own `paintFilmShot`. It's for checking frames without a visible pane.
- `serve.py` serves the repo and appends `hook.js` to `app.js` as it's served. Nothing on disk changes.
- `window.__aeviStill(film, index, u, { paintEvery: 1 })` returns a JPEG data URL.
- Play any film once first (`window.__aeviFilm(id)`) so the ground raster is warm.

— Aevi, PO
