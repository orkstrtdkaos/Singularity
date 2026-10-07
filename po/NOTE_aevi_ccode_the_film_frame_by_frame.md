<!-- status: OPEN for CCode. The opening (and so all ten films) looked at frame by frame on v2.21.3, with a probe that fixes the worst of it. A diff that applies, a picture, and the cut as reference. -->
# NOTE: Aevi → CCode · The film, frame by frame (SNG-680, SNG-681)

**Aevi (PO) · 2026-10-06.** Erik sent a frame from the game's opening next to the cut and asked me to help you close the
gap. The frame he sent is **shot 0, "This was Earth."** I reproduced it exactly on v2.21.3 in the browser. Then I walked
all 35 shots, both at full speed and through the reduced-motion path, which holds each shot at `u = 0.82`.

Most of what reads as "not the cut" comes from **two bugs in the air and the light**, not from the architecture. I
fixed those in a throwaway copy of `app.js`, served it on a second port and photographed it. The fixes are in
**`po/ref/film_probe.diff`**, which `git apply --check`s clean against origin `025413d08`. The before/after is in
**`po/ref/film_before_after.png`**:

- left: origin today;
- middle: origin plus the diff;
- right: the cut.

It's a probe, not a patch for you to take as is. Every hunk is something you should do *your* way, but each one is
measured.

The cut itself is now in **`po/ref/opening_cut.html`**, self-contained apart from its Google fonts. Open it and read `drawGlobe`, `drawPoles`,
`drawVeil`, `drawStanding` and `frame()`. Those are the parts this note points at.

---

## Part 1 · The two bugs behind Erik's frame

### A · The halo paints the whole disc (`paintOpeningAir`, app.js ~7400)

```js
const halo = ctx.createRadialGradient(cx, cy, r * 0.99, cx, cy, r * 1.12);
…
ctx.beginPath(); ctx.arc(cx, cy, r * 1.17, 0, Math.PI * 2); ctx.fill();
```

This is the trap your own comment two lines down describes, from the other end. A radial gradient paints its **first**
stop everywhere *inside* its inner radius, not only its last stop beyond its outer one. The fill is a full disc, so
`rgba(92,150,230,0.5)` lies over the entire globe. That one line causes three things:

- **the periwinkle ocean** from my last note (navy plus half-opacity sky-blue makes periwinkle);
- **the lavender land**;
- **the "pale translucent half-disc"** Erik is pointing at, because the night side is lifted from black to pale blue.

The city lights then float on a pale field, and that is the "dotted coloured threads" in his frame.

**Fix:** fill the annulus only.

```js
ctx.arc(cx, cy, r * 1.17, 0, TAU); ctx.arc(cx, cy, r, 0, TAU, true); ctx.fill("evenodd");
```

I'll own that the cut has the same trap at a lower dose: 0.34 for Earth, 0.06 for Exesa. Fix it in both readings of
the cut you take from me.

### B · The limb glow is on the night side, and it's a white band

```js
sunward: -0.5 - OPENING_SUN_DEG / 180   // = −0.844π → up-left
```

The raster puts the sun at `-yaw + 62°`, which is **to the right**: Africa is lit and the Americas are dark. The air
crescent is drawn at −152°, **on the left**, over the night. At `lineWidth r·0.085` and `shadowBlur r·0.14` it is the
hard white ring from my last note. Both halves of "the limb ring is wrong" were this line.

**Fix:**
- derive `sunward` from the same sun the raster uses, so they cannot disagree again;
- thin the band to `r·0.03`, blur `r·0.05`, alpha 0.3.

### C · The sun is a longitude, so pole-on is half-black

```js
const cosSun = Math.cos((p.lon - sun) * DEG) * Math.cos(p.lat * DEG * 0.55);
```

A sun defined by longitude puts the terminator on a meridian.
- **Side-on,** that is a straight vertical line (my last note, look 3).
- **Pole-on,** every meridian is a radius, so the terminator becomes a **diameter** and half the world goes black.

That black half is the grey wedge in every poles shot, with the stations and threads crossing it.

The cut lights in **camera space**: one unit vector `SUN`, and each pixel's sphere normal is `(nx, ny, nz)` from its
screen position. The probe does the same. It eases between a side sun `[0.84, 0.36, 0.41]`, which gives a night side
for the cities, and a front sun `[0.30, 0.42, 0.86]` as `polar → 1`. Pole-on, the whole of Exesa is lit, which is what
"the middle is literally the middle" needs. The terminator curves for free, because the sun sits a little above. The
city-light test uses the same vector, from the projected point.

Remember **A + B + C together**: that is the whole difference between the left and middle columns of the picture.

---

## Part 2 · What the probe also does (smaller, measured)

- **D · No blocks from the step.** The raster still samples every `step` px, but it writes **one pixel per sample**
  into a `ceil(gw/step) × ceil(gh/step)` canvas, which `opGround` draws scaled with `imageSmoothingEnabled`, clipped
  to the disc. It costs the same and gives no step-blocks.
  - ⚠️ **The coastline still stairs after D.** The stairs that remain are the **bake's own cells**, read nearest-neighbour:
    0.75° on Exesa, Earth's mask at its own grid.
  - **Sample the bake bilinearly** (four lookups and a lerp, at about 20k samples a frame). For Earth, also bake the
    mask at 1440×720. It's a polygon fill, once, so it costs nothing per frame.
- **E · The shrink happens on screen.**
  - `shrunk` is `index >= shrinkAt ? 1 : 0`, a step at the cut, so the shot that says *"until a third of it was gone"*
    opens on the world already small. The probe ramps it across the shot: `min(1, u·1.4)`.
  - The old outline is centred on `view.cy`. Pole-on, `cy` lifts by 12% while the outline didn't, and it hung off
    centre.
- **F · Poles off the limb (V3), threads quieted.**
  - Stations at `1.3·r` in `poles_*` as well as in `ring`/`axis`, at glow 12 not 22.
  - The pull draws every 4th node at alpha 0.10 to the station. 190 radial lines at 0.22 is the scaffolding in Erik's
    poles frame.

---

## Part 3 · What the probe does *not* do, and the cut does

### G · Continuity: the one architectural change

Every shot is painted from nothing, from `(visual, u)`. So at **every cut** these all pop on or off at once: the net,
the poles, the lights, the radius, the ground and the palette. And at frame rate there is no crossfade, because
`crossfade()` only runs under `reduced`. One measurable symptom:

```js
const yaw = 18 + index * 7 + u * 9;   // end of shot i: 27 + 7i · start of shot i+1: 25 + 7i
```

**The globe snaps back 2° at every cut.**

The cut's model is about 40 lines:
- a `BASE` of continuous parameters (`R, zoom, cx, yaw, pitch, spin, exesa, drain, night, surface, cities, net,
  runaway, swarm, order, works, cut, bores, outline, poles, pull, middle, grey, ash, natural, standing, lattice, veil,
  arcs, many, you, title, focus`);
- a target table `V[visual]` that lists only what that shot changes;
- every frame, `cur[k] += (target[k] − cur[k]) · (1 − 0.18^dt)`;
- every layer drawn whenever its weight is above 0.01, at that weight.

The net *thins* through `swarm` instead of vanishing. The ring *fades* through `lights_out`. The world *shrinks* while
the line about it is on screen.

**My suggestion:**
- put the target table in `engine/films.js` beside `shotSeconds`. It's pure and testable, and a test can assert that
  every visual in the content has a row;
- let `paintFilmShot` take `cur` alongside the shot. Keep reading shot-specific *subjects* off the shot (`place`,
  `figure`, `traditions`, `nameFrom/nameTo`, `source`). Read every *amount* off `cur`;
- under reduced motion, `k = 1`, and your crossfade stays exactly as it is.

### H · Earth becomes Exesa, not cut to it

`openingBake(exesa < 0.5 ? "earth" : "exesa")` switches worlds at a threshold. The cut samples both textures and mixes
them by `cur.exesa`. That is why *"we named it again"* shows the same world wearing down. With G in place, the
threshold becomes a lerp of two lookups.

### I · The shots that draw nothing today

| shot | today | the cut |
|---|---|---|
| `veil` (25, 26) | a `destination-out` hole at lat −26 lon 58, which is behind the face in those shots, so **nothing shows**; the frame equals `lattice` | the absence sits **beside** the globe in screen space: a feathered near-black shape, about 1.25 r, that takes the stars with it, under a violet `shadowBlur` rim (`drawVeil`) |
| `standing_up` (22) | four silhouettes at fixed lat/lon, all off the visible face of Exesa, so **the shot is empty** | seven silhouettes in screen space along the upper limb, rotated to the normal, rising in turn (`drawStanding`) |
| `natural` (21) | the seated figure at `h/2 + r + 34`, under the caption | beside the globe, or drop it; the green lights do the work |
| `lattice` (23, 24) | land recoloured to periwinkle blocks | the surface **dims** (`surface: 0.25`), and the lattice is bright lines on top under `lighter` |
| `poles_pull` | no sector tint | conic `soft-light` at α ≤ 0.42, plus a `source-over` pass at 0.08, plus a warm middle glow at the Crossing (`drawPoles`) |

### J · Lines over a sphere are arcs

`network` / `network_runaway` draw `moveTo(pa) → lineTo(pb)` in screen space. A long chord cuts straight *through* the
globe, and that is the "web over the face" look. The cut steps along the great circle, slerps, lifts it 5% at mid-span
(`arcPath`), drops the segments with `z < 0`, and composites `lighter`. The same applies to the drain streaks and the
pull threads.

### K · Small ones

- **Clouds on the night side.** Shot 0's cloud glows are drawn wherever `P()` lands, so one sits *outside* the limb on
  the night side, as a grey blob. Cull to the near face and clip to the disc.
- **The dusk line.** After C, the terminator's warm band reads as an orange arc. Narrow and dim it: `|cosSun|·30`, and
  about half the red.
- **The canvas is a fixed 900×560 × dpr.** Size it to the element with a `ResizeObserver` and redraw.
- **`OPENING_R_CAP = 210`** reads my cut as "the globe is 210 px". In the cut, 210 caps the **sample buffer**, which is
  then drawn scaled to the real radius. The globe can be as large as the frame wants.
- **V1 still stands:** the film in the Library is a strip. The full-viewport rule I used for the probe was only:
  - `.op-stage{position:fixed; inset:0; width:100vw; height:100vh}`;
  - the canvas centred at `width: min(100vw, 160.7vh)`.
  
  That's 900:560, letterboxed.

---

## The order I'd do it in

1. **A, B, C.** Small, and it is Erik's frame. Ship these first and he'll see the world come back.
2. **D** plus bilinear bake sampling.
3. **G**, then **H**. Once the eased table exists, E, I and K mostly fall out of it.
4. **I and J**, shot by shot, checking against the cut open in the next tab.

I have changed nothing of yours. The probe lives in a temp copy, and only the three files in `po/ref/` and this note are
mine. When you've done 1, tell me and I'll walk the 35 again.

— Aevi, PO
