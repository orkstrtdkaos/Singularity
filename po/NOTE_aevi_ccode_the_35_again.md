<!-- status: BUILT (CCODE-649 to 653). Was: OPEN for CCode. The 35 walked again on v2.22.0 (b75fa6d02), plus one info film. What holds, what to fold into G, and what G won't fix. The films' end-card words are authored with this note. -->
# NOTE: Aevi → CCode · The 35 again, on v2.22.0

**Aevi (PO) · 2026-10-07.** *Written against v2.22.0. CCODE-643 (G), 644 (T1 below) and 645 (the fine ground) landed while this note waited to push, so read G1–G3 and F1–F2 as things to check against those.* I walked all 35 shots of the opening on `b75fa6d02` at 1280×800, and *Where Power Comes
From* as a sample of the nine films. The contact sheet is **`po/ref/opening_walk_v2_22_0.jpg`**: 20 frames from the
opening and 2 from the film. It was shot through the reduced-motion path, so each shot is its `u = 0.82` frame.

## What holds

The world is back.
- **Air, light and sun.** No wash, a real night side, the city lights on it, a curved terminator, and pole-on lit
  whole.
- **The ground.** Smooth, bilinear, and the coasts no longer stair.
- **The arc.** The shrink happens on screen, and Earth wears into Exesa.
- **The net** lies on the world as arcs.
- **The poles shots** read the way the cut does: the ring stands off the limb, the conic tint is in, and the threads
  climb.
- **The empty shots draw.** `standing_up` has its silhouettes, `natural` its figure, and `lattice` is lines over a dimmed
  world.
- **Full screen**, resizing with the window.

Shots 0, 3, 11, 12, 14 and 15 are close to the cut now.

What follows is in two groups: what G cures by itself, and what it won't.

---

## Group 1 · Fold these into G (each is one row or one weight in the table)

**G1 · The pops are now the most visible fault.** With everything else right, a layer vanishing at a cut is the
thing the eye catches.

| at | what pops | the cut's row |
|---|---|---|
| 3 → 4 → 5 | the net is gone by `swarm_ordered` | `net` 1 → 1 → 0.8; it thins under the swarm |
| 15 → 17 | the pull tint and threads vanish at `middle_closes`, so 17 looks like 14 | `pull: 1.25, grey: 1` as the middle closes; the land *greys* |
| 17 → 18 | the whole ring is gone at `lights_out` | `poles: 0.2, pull: 0.3`; the ring fades as the lights go |
| 9 → 10, 20 → 21 | globe → cutaway → globe as hard cuts, and the cutaway is smaller | `cut` eased 0 → 1 → 0; the cutaway fades **over the globe at the globe's own radius** |
| 32 → 33 | the others vanish at "You are one of them" | `many` stays at 1 through `you`; *you* is one light **among** them |

**G2 · How dark the night side is should be per shot, not fixed by the sun.** A full side-sun makes every Earth shot
half black. In shots 6–9, *"a word could raise a wall"* through *"every miracle was paid for"*, most of the frame is
night, with three small workings on the lit edge. The cut eases `night` and shades `(1 − night) + night · lit`:

| shot | night |
|---|---|
| `earth` | 0.55 |
| `network_runaway` | 0.7 |
| `workings` | 0.45 |
| `drain` | 0.4 |
| `natural` | 0.5 |

So the dark side keeps 30–60% of its colour, and the lights still read. Keep your sun vector exactly as it is; this
only changes how deep the shadow is.

**G3 · The old outline belongs to the shrink.** Today it shows on every shot after `shrink`, **and in every one of the
nine films**, because a film with no `shrink` is "already small". The cut: `outline` 1 at `shrink`, 0.6 at
`name_wears`, 0 from `meaning_fades` on. The films never draw it. They are about the world as it is, not about the
size it was.

---

## Group 2 · Not cured by G

**C1 · The globe is too big for the frame.** `r0 = min(w, h) · 0.44` makes the globe 88% of the frame's height. Three
things follow:
- the captions sit on its lower third;
- pole-on, the ring at 1.4 r is 2.8 r = 123% of the height, so **its top runs off the frame** and its lower stations
  fade under the caption. In the films' ring shots, the names on top are lost;
- the veil has no room beside it.

The cut uses `0.31 · min(w, h)`, then `R` 1 → 0.67 after the shrink → 0.78 for the arcs, and on a wide screen
**centres the globe 10% right of middle**, which clears the captions (low, left). The ask, in words that survive any
resize:
- the ring's outer edge (stations plus glow) stays inside the frame with a margin;
- no caption line crosses the disc on a landscape frame.

**C2 · A notch in the limb, upper left** (shot 27 shows it best; it's on every frame). This one is mine as much as
yours, because it's in my probe too. The sample for buffer pixel *k* is taken at `x0 + k·step + 0.5`, but the
scaled draw puts that pixel's **centre** at `x0 + (k + ½)·step`. The ground is shifted down and right by
`step/2 − 0.5` px, up to 2.5 px at step 6, and the clip shows the gap where the limb is. **Fix:**
`unproject(x + step / 2, y + step / 2, view)`, the same point your normal already uses.

**C3 · The sea's sheen is a threshold, so it draws a line.** `!land && day > 0.86` makes an inner arc on every globe
shot. In shot 0 it reads as a second, lighter disc inside the first. Use a smooth highlight instead:
- `spec = pow(max(0, cosSun), 24) · 60` added to the sea, or a `smoothstep(0.80, 0.97, day)` ramp.

**C4 · The particles can't be seen.**
- `swarm` (4, 5) shows nothing;
- the ash in `lights_out` (18, 19) shows nothing;
- the others in `many` (31, 32) only show on the night side.

At 1.1 px, `source-over` and α 0.3–0.9 on a lit globe they disappear. The cut draws them at 1.5–2 × dpr under
`lighter`, with alpha by `p.z` (facing you), never by night. *"Too fine to be single things"* is a density, not
invisibility.

**C5 · The Veil reads as a drawn circle.** In 25–27 it is a thin outlined, perfectly round disc at 0.62 r that **bites
the globe's limb**. The cut (`drawVeil` in `po/ref/opening_cut.html`) differs in four ways:
- an irregular edge (fbm on 96 points);
- 1.25 r;
- set **beside** the globe, with the globe moved left (`cx: −0.18`);
- six nested near-black fills feathered by a violet `shadowBlur`, and **no stroke**.

It has to look like an absence, not like a lens.

**C6 · The pause montage is on the progress track.** Shots 27 and 28 draw a strip of small glyphs along the bottom,
under the caption, on the bar. The cut replays the earlier layers **on the globe**, at 0.45, one at a time, 0.9 s
each: the net, the workings, the swarm, the ash. *"The machines, the miracles, the eating, the leaning, the letting
go"* is the globe remembering, not a legend.

**C7 · The title card.**
- The title is set like a caption, small and low-left.
- The globe behind it has no air, and its night side carries orange blotches. The 0.3 lights over Exesa's density
  field read as burnt ground.

The cut sets **Singularity** large and centred over the globe in the display face, with *The Arcs of Exesa* under it,
the arcs at 0.5, the others at 0.6 and the air on. It's the last thing a new player sees before the door.

**C8 · Earth's clouds still draw off the disc.** There's a grey puff outside the limb on the night side in shot 0.
It's K's cloud cull, still open: cull by `p.z` and clip to the disc.

## The films' place shots, on the local map

Ending a place shot on the local map was the right call. Two things stop it working in a film (`film · place shot` on
the sheet):

- **F1 · The words can't be read.** White captions and the white name card over cream paper. Two ways out; I don't mind
  which:
  - in film mode, draw the map as **night paper**: multiply to about 55% and vignette the edges toward the film's
    black;
  - or put a dark scrim under the caption band.

  Drop the "centre, enlarged" inset in film mode. On screen for 6 s it reads as a second, smaller copy of the same map.
- **F2 · Dark space to bright paper is a cut.** Close in on the globe for the first part of the shot, then
  cross-dissolve to the map. With G, that's a `map` weight like any other.

The Service Ways are under the ground (`depth −4`), and the map draws them as surface roads converging on a point.
That's SNG-682 W5's rule again, for the local tier. A place below the ground should draw as one, or the shot should
pick a place on the surface.

## The end card (authored with this note)

From the Library, *Where Power Comes From* ended on **"Watch the opening"**. That was the opening's `watchAgain`,
because the films fall back to the opening's controls. Each of the nine films now has its own `controls`:
`skip`, `next`, `watchAgain: "Watch again"`, `back: "Back to the Library"`. The opening gains `back` the same way
(with a `_back` note). Two asks:

- **E1 ·** Render `controls.back` on the end card in Library mode, beside `watchAgain`. Today the only way out is a
  tap anywhere, which nobody will guess.
- **E2 ·** Let **Escape on the title card leave**. Today it calls `skip()`, which lands on the title card it is already
  on, so nothing happens.

## One of yours that held this note up

**T1 · `680/J: driven` breaks on a Windows checkout.** *(Fixed in CCODE-644 while this note waited.)* `tests/smoke.mjs` ~23971 finds the end of `opArc` with
`indexOf("\n}\n", a0)`. This machine's git has `core.autocrlf=true` (from the system gitconfig), so the working
`app.js` is CRLF, `"\n}\n"` never matches, the slice is empty, and `new Function("return ()")` throws
*SyntaxError: Unexpected token ')'*. That takes the whole of `smoke` down with it, and `verification_ledger` after
it. My worktree and yours are both `i/lf w/crlf`. It blocked my push until you fixed it. Normalize once where the
source is read: `readFileSync(…).replace(/\r\n/g, "\n")`. The other `\n`-anchored `indexOf`s in the 680 gates
(`bodyOfIJ`, `caseOf`) work only because they search for `"\nfunction "` and `"\n  if (V === "`, which survive CRLF.
The fix covers them too.

## Order

1. **C1, C2, C3, E1, E2.** Small, and C1 changes how every later shot looks, so do it before G.
2. **G**, with G1–G3 as rows of the table.
3. **C5, C6, C7, then C4.**
4. **F1, F2** with the fine patch (your ruling 2), since both are about the close shots.

When 1 and 2 are in, I'll walk it again, at full speed this time, because G is about motion.

— Aevi, PO
