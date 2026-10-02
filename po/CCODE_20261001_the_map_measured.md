# CCode → Erik & Aevi — the map, measured · v2.16.12

*2026-10-01. The 09-29 work order says **"The map interface. Erik brings the specifics from play."** He has not yet,
so I went and got them. Two defects fixed and driven; two findings that are design calls and so are reported, not
decided. 32/32 green, 4,366 checks.*

---

## ✅ Fixed — the field panel was dead on first open

It said:

> *"The power field loads with the map — open the world tier once and it will draw here."*

⛔ **That sentence was true, and that is what made it a defect.** The ground asset is 617KB and loads lazily; the panel
is built in the same synchronous pass that inserts the screen, so on a first open the voters have not landed — and
nothing redrew the panel when they did. Going to the world tier and back *is* a re-render, which is why the workaround
in the sentence works. **A missing repaint wearing instructions.**

| | |
|---|---|
| before | open map → your region → the sentence, still there after 8 seconds |
| after (v2.16.12, world tier never opened) | the real panel inside **2s** — *✓ ◈ Field · crystal lattice 52% · ordered nanite 0% · the veil 0% · wild nanite 27%*, **6 toggles, 6 wired** |

---

## ✅ Fixed — a label is placed at the width it is drawn at

`placeLabels` was handed `measureText(m.name)`, and then the view drew `m.name + " +N"` — the badge the placement
itself produces was not in the box the placement reserved. Measured at the real font: **" +2" is 15.2px**, so 7.6px
hangs past each end of an approved box.

⚠️ **And measured honestly it costs nothing today.** Driven over all 38 regions, the shipped one-pass placement
produces **zero** overlapping drawn pairs — enough labels are hidden that the survivors stand well apart. This closes
a class, not something you can see. I am not going to tell you I fixed an overlap I could not measure.

⛑ *(The driver lied to me first: without the authored region map it put all 17 valley places at x≈9900 on an 800px
canvas — the two-longitude-conventions trap — and so reported 0 overlaps because it had placed nothing at all.)*

---

## ⬜ Finding — 13.4% of places sit on another place's exact point

**21 of 157** placeable locations share a `worldPos` with another, in 8 stacks. The pattern is that **grown sub-places
inherit their parent's coordinates**:

| region | | |
|---|---|---|
| valley | ×4 | The Disputed Zone — Fringe · *The Far Side* · *Left Branch Entrance* · *The Lower Chamber* |
| somatic_reaches | ×3 | *Cogitarium Entrance Hall* · *Third Terrace* · The Cogitarium |
| the_center | ×3 | *North Gate District Street* · *Ossian's Office* · The Crossing |
| valley | ×3 | *Mara Wells' Store* · *The Watershed Road* · Millbrook |

*(italics = grown)*

**In the Valley of Echoes that is 7 of 17 places collapsed onto 2 dots** — which is why the map draws 8 labels for 17
places and badges them "+2" and "+4".

⬜ **Two ways to answer it, and both are yours:** fan a stack out on the map (the places genuinely *are* at the same
spot — a room of Millbrook *is* at Millbrook), or offset them slightly at mint (which changes distances, so it is a
world-data decision, not a drawing one). I have done neither.

---

## ⬜ Finding — the ground map is inert, and the clickable map is below the fold

`region-map` is referenced six times in app.js and **every one of them paints it.** No click handler, no mousemove, no
cursor: `cv.onclick` is null, and a real click on Millbrook's dot changes nothing.

The places that *are* clickable are the `data-mapsel` nodes in the schematic diagram — whose top edge sits **856px
down the page** at 1400×900.

So the map draws eight place names on real ground and does nothing when you click one; the working map is the diagram
under it. The page's own text says the diagram *"shows how the places CONNECT, which the ground does not say"*, so the
split is deliberate — but **the ground map looks clickable and is not**, and that is my best guess at what "the map
interface" means in your list.

⬜ **Also:** the canvas is pinned at `width="800" height="420"` with `max-width:800px`. On a 1400px window the map uses
**57%** of the width it has. Raising that is a judgement about generation cost, so it is yours.

---

## What I would do next, if you want it

1. **Make the ground map clickable** — hit-test the marks it already computes, select the place, and let "Look inside"
   work from the picture rather than from the diagram below it.
2. **Fan a stack** — when N places share a point, spread them in a small ring so all N are nameable and clickable.
3. **Let the canvas use the window**, with a cap you name.

Say which and I will build it. Everything above is on `main` at v2.16.12.

— CCode
