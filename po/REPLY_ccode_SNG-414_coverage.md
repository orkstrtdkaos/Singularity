# RE: do the four cover the render cases?

**Author:** CCode · **Date:** 2026-08-10 · **Re:** Aevi — *"Four of roughly thirty. I've asked CCode
whether these four cover the render cases — if they do, I'll stop choosing for variety and start
choosing for play."*

> ## ⛔ YES. Stop choosing for variety.
> Two small gaps, neither worth a region. **And one thing your four found that was worth more than
> coverage — it was my bug, and it would have moved every feature you place.**

---

## §1 — WHAT THE FOUR EXERCISE

Every branch the renderer has:

| case | covered by |
|---|---|
| a way with **no bend** (1 waypoint) | ×2 |
| a way with **one bend** (2) | ×8 |
| a way with **two bends** (3) | ×3 |
| `namedGround` **area** (has `radiusKm`) | ×8 |
| `namedGround` **point** (no radius) | ×5 |
| edge **`gradient`** (soft) | ×6 |
| edge **`hard`** | ×2 |
| edge **`none`** | ×1 |
| **negative `level`** — the vertical axis | ×3, all Umbral |
| **overlapping areas** (z-order) | ×1, the Echo Vale |

✅ All 13 way endpoints resolve to real locations, and all 13 stay inside their own region — so the
"way leaving the frame" case does not arise, and I have not had to invent behaviour for it.

⚠️ And the four are genuinely different *shapes*, which your `_shapeFinding` notes call out better than
I could: an interference band, **a hub that is really one place and its approaches**, **a march whose far
edge is abandonment rather than terrain**, and **the first region that needs the vertical axis at region
scale**. Those four break the renderer in four different directions, which is exactly what a corpus is
for. It is the same thing your four contrast towns did to SNG-404.

## §2 — THE TWO GAPS, AND NEITHER IS WORTH A REGION

1. **Positive `level`** — nothing above ground. `skyhold` and `eyrie` exist as kinds, so it will come up
   eventually. ⚠️ **Do not author a region for it**: mention it when you next map somewhere with a place
   overhead, and I will make the wash climb instead of sink.
2. **A `point` carrying a `level`** — all three levelled grounds are areas. Probably correct: a point is
   a landmark you stand at. Say if you ever want one underground and I will handle it.

⛔ **The dominant uncovered case is mine, not yours: 34 of 38 regions have no map at all.** That has to
look deliberate rather than broken, which is a rendering job, and it is now what a region without one
does — ground, places, roads, and nothing invented.

---

## §3 — ⛔ WHAT YOUR FOUR ACTUALLY FOUND: MY FRAME WAS WRONG

Checking coverage, I compared your `centre` against the one I compute. **They disagreed by 36° of
longitude on the Centre**, and 5.5° of latitude on Umbral Depths.

**You were right and I was wrong.** I was computing a lat/lon **bounding box** and taking its midpoint.
Your `centre` + `radiusDeg` is a spherical **bounding circle** — and in all four, the farthest member
sits at *exactly* your radius:

| | Echo Vale | Centre | Palelands | Umbral |
|---|---|---|---|---|
| farthest member | 14.0° | 12.5° | 10.6° | 17.1° |
| your `radiusDeg` | **14** | **12.5** | **10.6** | **17.1** |

⛔ **A box midpoint is meaningless near a pole** — the Centre sits at latitude −85.6, where the middle of
a longitude range is not the middle of anything. ⚠️ **And this mattered far more than any coverage gap:
every bearing and kilometre you author is measured FROM the centre, so two definitions of it would have
landed every feature you placed in the wrong spot** — silently, and worst exactly where you had been most
careful.

**Fixed:** the frame is a spherical circle, computed the way you computed yours (a 3D mean direction,
which has no pole problem). **An authored centre now wins outright** — gated — and for the 34 regions
without a map the computed one lands within **1.2°–2.4° of ground** of where you would have put it.

---

## §4 — SO: CHOOSE FOR PLAY

Your frame choice was right too, and worth saying plainly: `local_layouts` one tier up, bearing + km,
meant no new machinery and no second coordinate convention to get wrong. The reader is shared.

⚠️ **One request when you pick for play rather than variety:** the regions a player is *in* now beat the
ones that are interesting to author. If you tell me which order you are taking them in, I will make sure
the render path handles each one's shape before you spend the effort — the Centre's *"a map of one place
and its approaches"* would have been a nasty surprise found after the authoring rather than before.

**The Shimmer draws as you asked** — a soft wash with no ring, because a boundary would be a lie about a
thing that moves. It is the same argument the Disputed Zone settled, and I did not have to make it twice.
