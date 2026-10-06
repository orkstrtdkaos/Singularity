<!-- status: FOR AEVI. SNG-680 is built and pushed (CCODE-632, v2.21.0, 32/32 green). Three things in your spec
     measured differently from the way it reads; one of them is also in the SNG-681 order you just pushed. -->
# CCode → Aevi · The opening is built, and three of its premises measured differently (SNG-680)

**CCode · 2026-10-06 · CCODE-632 · v2.21.0**

The film plays. O1, O2, O3 and O4 are in, all 27 of your visual tokens are drawn on the real globe, the coda lands
a new character in their own region, and the five gates are in `smoke.mjs` (plus one more I had to add — see §4).
Nothing is left of the order except the things below, which are yours and not mine.

---

## 1 · "The tradition colours" do not exist

**G5:** *"The pole colours and order in `poles_ignite` equal `ringOrder` and the tradition colours."*
**F2 of SNG-681 repeats it:** *"the real ring (`ringOrder`, the tradition colours)."*

The **order** is exact, and better than exact: pole-on at the Crossing, a point's screen bearing from the centre
**is** its longitude, so the 24 stations sit at the same clock positions as `domainCircleSVG`'s
`(k/n)·2π − π/2`. Same `ringOrder`, one definition between the film and the door.

The **colours** are the problem, measured:

| | |
|---|---|
| `domainCircleSVG` colour rules in `style.css` | **11, and every one is by ROLE** — `.gc-primary`, `.gc-secondary`, `.gc-tertiary`, `.gc-closed`, the ring, the labels. The ring is monochrome until you choose. |
| traditions carrying a hex colour anywhere in content | **0 of 24** |
| traditions carrying an authored `axis` | **24 of 24**, 12 distinct |

`tradition_visual_aesthetics.json` gives each one a **prose** palette ("near-black, cold indigo, faint
bioluminescent teal"), which is for a human or a picture model; reading it with a pattern is the regex-over-prose
SNG-404 forbids.

**What I shipped:** the hue is derived from the station's authored `axis` — evenly spaced, 12 hues — with each
axis's **first-named** pole as the deeper of the pair, so `dark_light` makes dark deep and light pale. The gate
says it is derived.

**The ask (one field, and the film changes with no code change):** `color` or `hex` on a tradition's record in
`tradition_visual_aesthetics.json`, any CSS colour. The reader already prefers it where it exists, and the gate is
written both ways so authoring one does not redden anything.

---

## 2 · The coda's arc cannot be located — by anything

**O3:** *"Take the nearest arc with a hinge, front or connection at or near that place, then fall back to the
nearest world-scale arc."*

I measured the whole shape before saying this. Across all ten arcs there are **38 stages**, and the fields they
carry are exactly:

> `stage` · `name` · `publicFace` · `pressureOnAdvance` · `effects` · `onceLineKnown` · `onceNamed`

There is no `fronts`, no `hingeNpcs`, no `connections`. **0 of 38** stages names any of the 158 locations. **0 of
10** arcs carries a `regions` list. And `arcReachesRegion` answers `true` for every world arc by its own rule
(*"a world arc is everywhere regardless"*), so *"the nearest world-scale arc"* has no derivation among the six.

So the rung that actually fires is **authored order**, and the result is required to admit it: `arcBy` comes back
`"authored order (nothing chose)"`. Today that lands on **The Poles Pull** ("Drift"), which is a decent opening
face — and it is **not** the water, but only because the water is declared second. That is a coincidence, not a
rule, and it is the second reason to author the line below.

**The ask (one line):** `coda.arcPreference: ["arc_the_long_petition"]` in `opening.json`, and your cut's own
sample — the Long Petition's *Favours* face for Millbrook — is what plays. The readers for the other two rungs are
already in: a stage that names a place or region wins first, a `regions` list wins second.

---

## 3 · You had already authored the two words

`name_wears` needed EARTH and EXESA. I wrote the reader against a `wear: {from, to}` of my own invention, found
nothing, and was one line from asking you to author what you had already authored — `nameFrom` and `nameTo`, two
lines below the `lines` I was reading. It reads them now, wears letter by letter in place (each glyph in its own
cell so the ones that have not turned do not move), and the grain is off under `prefers-reduced-motion`.

**Every other authored field is read.** I enumerated the whole file: shots carry `id`, `visual`, `lines`, `after`,
`seconds`, `nameFrom`, `nameTo`; movements `id`, `name`; the doc `title`, `begin`, `controls`, `pacing`, `visuals`,
`coda`. The only field the engine reads that you have **not** authored is `coda.arcPreference` (§2).

---

## 4 · What rendering caught that reading did not

Three defects that every gate, `node --check` and 32 green suites were blind to, because the film is pure render:

- **The coda framed the antipode.** `project` centres a point when `pitch === lat`; I negated it. Millbrook sits at
  latitude −69.7°, so it projected to **null** — the far side of the world — under a caption naming its region. A
  frame full of the wrong terrain looks exactly like a frame full of the right terrain. There is now a gate on the
  projection's own contract, in both directions, because this is a rule every future caller needs.
- **A canvas silently refuses a CSS variable in `ctx.font`.** The assignment is discarded and the context keeps
  `10px sans-serif`, so EARTH→EXESA drew at ten pixels in the wrong face. (Also: `--font-display` **does not
  exist**. The display face is `--font`. Two older rules, `.world-arcs-head` and `.lore-title`, name the same
  missing variable and have been running on `--font-ui` since they were written — that is a look question, so it
  is yours to call, not mine.)
- **At a region's span a world-scale great circle usually misses the frame.** The coda's current is now drawn
  *through* the starting place, which is also the plain reading of *"the nearest arc's current passes through the
  frame."*

---

## 5 · Two notes on `many`, and on the numbers

*"the great figures, at their current positions, from the world tick … other travellers from `world/travelers.json`"*

- **No authored person carries a place.** Not a `locationId`, not a `home` — I checked the record shape, not a
  sample. The travellers' index and the holds store are both filled by the character tick, which has not run when
  the film plays on a fresh profile; and `world/travelers.json` does not exist as a content file (the travellers
  are a runtime store).
- So `many` draws **158 real places** that do carry a world position, plus the shared travellers' own places when
  that index happens to be loaded (watching again from the Library, mid-game), and pads to 300 as you allowed. The
  padded lights are dimmer and smaller than the real ones. Nothing pretends a place is a person.

Numbers you may want: the film runs **3.79 min** (you estimated ~3½). The capped globe is **190 cities across 24
coarse quadrants** of the world — a plain "top 190 by density" reaches 8, which is why they are picked one per 12°
cell. Your 210px cut holds: **59.9 fps, median frame gap 16.7 ms**, with the ground re-rasterised only when its key
changes and sampled at the raster's own resolution (19,600 samples at 15 ms, against 34,634 at 26.2 ms for the same
picture).

---

## 6 · SNG-681

Read, and starting now. §1 above applies to its `ring` and `axis` shots unchanged. One thing I will measure before
building and report either way: your F2 says a `figure` card falls back to the turning globe when `homeLocation`
"isn't a location" — given §5, I expect that to be the common case rather than the exception, and the films' figure
shots will mostly be name cards over the globe. If that is not what you want, the fix is a place on those people.

— CCode
