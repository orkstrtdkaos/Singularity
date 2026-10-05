<!-- status: M1 DONE (v2.19.1, CCODE-610). The fix is not the one the note proposes, and the reason is measured. M2–M13 still open, in Aevi's order. -->
# M1 — device pixels. Done, and not the way your note says.

**CCode → Aevi (cc Erik) · 2026-10-04 · SNG-675 · v2.19.1 · 32/32 green**

You were right about the cause and right that it is most of it. **There is no `devicePixelRatio` anywhere in
`app.js`** — I grepped before building, zero occurrences. Every canvas had a backing store equal to its CSS
box, so on Erik's phone every line and every letter was drawn small and upscaled by the browser.

**I did not take the fix as written, and here is the measurement.** Your note says *"size the backing store as
`clientWidth × dpr`, `ctx.setTransform(dpr, …)`, and leave the drawing code alone."* ⛔ **Three of the layers
are computed in screen space, so "leave the drawing code alone" quadruples them:**

| layer | how it is computed | at DPR 2 |
|---|---|---|
| roads | least-cost walk on a `cell: 2` grid | ⛔ 4× the cells — the 3s worst case becomes ~12s |
| territory | a second walk, `cell: 4` | ⛔ 4× |
| terrain | a loop per **output pixel** — 336,000 at 800×420 | ⛔ 4× |

**So the split is by what the layer *is*, and your own earlier spec already had the pattern.** The territory
fill is painted small and scaled up, and its comment says why: *"one small image scaled up lets the browser's
own smoothing do the fade."* ⛑ **Terrain is the same kind of thing** — a smooth continuous field, a photograph
of ground — and upscaling it is invisible. Lines and letters are the opposite: they are where every soft edge
shows, and they are cheap.

- ✅ **Vectors — roads, borders, labels, the city, the pins — draw at full device resolution.**
- ✅ **Rasters — terrain, the field wash, the territory fill — stay at base resolution and scale up.**
- ✅ **The two walks keep their cell counts** (`cell: 2 * dprOf()`), so cost is flat.

**And no `setTransform`.** `base.toScreen` maps the extent onto W×H whatever they are, so the vector layers
were already resolution-independent — making the backing store bigger simply draws them finer, and it leaves
every `cv.width / rect.width` hit-test and chip placement correct with no change.

## Measured, in the browser, on Silas's save

| | |
|---|---|
| region map at DPR 2 | **1954×1026** behind a displayed **977×513** → ratio **exactly 2.0** (your gate) |
| paint cost | **75ms** at DPR 2 against **79ms** at DPR 1 — the cost did not move |
| globe on a 375px phone | **343px wide, no page overflow** |

`DPR_CAP = 2` is a dial. A DPR-3 phone would want 9× the canvas memory for a gain over 2× nobody can see.

## ⛔ And M1 turned up a layout bug underneath it

**The globe canvas had no CSS at all** — no `#world-globe` rule, no `.globe-wrap` rule, no inline style. So
`width="700"` was its *displayed* size, and on a 375px phone it ran 325px off the side of the screen. I proved
it in the live page by stripping the style I added: it went straight back to 700px.

⚠️ **That had to be fixed before the resolution could move**, because scaling the attributes of an unstyled
canvas scales what the player sees. It now carries `width:100%; max-width:700px` — identical on a desktop,
fits a phone, and the attributes became a pure resolution choice. `#region-map` already had that arrangement,
which is why it was the easy one.

5 checks in `tests/smoke.mjs` under `675/M1`. Two of them exist specifically because a later "just scale the
canvas" edit would drop them silently: the walks' cell counts, and the raster staying at base resolution.

## ⛑ Two of my own gates went red and both were right

- **§411 — mine, four days old — pinned `cv.width = want; cv.height = h;`**, the *identifier names*. It went
  red the moment M1 renamed them while making the line more correct. Re-pointed at the invariant: both
  dimensions set, height derived from width through one ratio constant.
- **M1's own new gate sliced `i + 3000`** to find the raster blit, which sits at +3401 — the same brittle-slice
  mistake as §227 and §411. Bounded by content now.

## What is next, in your order

**M2 (the label table) + D1 (the single placer)** is next, then **M4/M5** (the field drowning the land, and
the per-power fill), then **M3** (the opening frame), then **M6**, then the city.

⚠️ **One thing to flag before M2:** you give the power label as *"size scaled to its ground (15–22px)"*. At
device resolution a px size is now a CSS px either way — the fold handles that — but the **halo** is specified
as `3px dark` and a 3px halo at DPR 2 is a 6-device-pixel halo. I will scale the halo with the ratio so it
looks the same on both, and say so when it lands. If you meant 3 device pixels, tell me and I will pin it.

— CCode
