# FINDINGS — why the hachures failed, and what book maps actually do

**Aevi · 2026-09-19 · for CCode.** Erik on my region prototype: *"your hashed lines are not even in the ballpark
of what I was going for."* ⛑ **He is right, and researching it turned up a category error, not a tuning problem.**

---

## ⛔ §1 — ICONIC vs SYMBOLIC. THIS IS THE WHOLE THING.

The distinction cartographers use: **iconic** representation is a *picture of the thing*; **symbolic** is a
stand-in that does not look like it. The RPG-cartography consensus is blunt — the maps people love *"use iconic
elements a lot — the hand-drawn mountains and trees in the Greyhawk and Glorantha maps."*

⛔ **HACHURES ARE SYMBOLIC.** Short downhill strokes, heavier on steeper ground — standardised by Lehmann in 1799,
and a *scientific* relief notation. They were the dominant technique from the mid-18th to the late 19th century
**precisely as hill icons declined**, and contours then displaced them.

⚑ **So I built the thing that historically REPLACED the look Erik wants.** No amount of tuning crosses that gap.
**The fantasy-map aesthetic is the pre-1750 convention that hachures were invented to supersede.**

⚠️ **And my hachures were bad hachures besides.** Lehmann's rules require strokes *arranged in rows perpendicular
to their direction, equal spacing within a row, uniform thickness within a row.* **I jittered position, staggered
rows and randomised weight** — to kill the corduroy, which is the regimentation the technique is *made of*.
⛑ **The corduroy was not the bug. The corduroy was the technique, and the technique was the wrong one.**

---

## ⚑ §2 — WHAT TO BUILD INSTEAD: RELIEF ICONS ("MOUNTAINIFICATION")

**Place drawn glyphs — mountains, hills, forest — on the map, sized and tinted by the elevation under them.**
This is a named, solved technique: ESRI's own fantasy-map series calls it *mountainification*, driving symbol
placement off an elevation vector field. ⛑ **Azgaar's Fantasy Map Generator carries it as a first-class layer
called Relief Icons** — and his Q&A warns it is *"the most resource-demanding"* layer, which is a budget fact we
should take seriously rather than discover.

**What that buys us that hachures never could:** ⛑ an icon *is* the mountain, so the reader sees terrain rather
than notation; density and size carry elevation without pretending to be a measurement; and **it degrades
gracefully at low source/feature density** — the problem I hit with 4 field sources per region.

⛔ **Painter ordering is the detail that makes or breaks it: draw far-to-near so nearer glyphs overlap the ones
behind.** That single rule is most of the "drawn" read.

⚠️ **The known weakness, from the same source: a vector field gives a REGIMENTED pattern** — the same corduroy in
a different costume. The published fix is **varied symbol spacing across several passes**, not per-glyph jitter.

---

## §3 — SCRATCHY LINEWORK, AND A CALIBRATION GIFT

Relief is half of it; the other half is **linework quality — coasts, borders and roads "scratched onto vellum with
a quill"** rather than drawn with a plotter. ⬜ **Candidate: `rough.js`** (hand-drawn SVG/canvas rendering).
⚠️ **I have NOT tested it here — CCode to verify it loads under the site's CSP from an approved CDN and that its
output size is sane at region scale. Do not take this as a capability claim.**

⛑ **A calibration reference worth having, published for FMG's five styles — relief strength: parchment 0.32 ·
ink 0.34 · verdant 0.38 · watercolour 0.42 · atlas 0.5**, *"which is why atlas mountains look carved and parchment
mountains look drawn."* ⚑ **Erik asked for a book plate, so we are at the PARCHMENT end (~0.32), not the atlas
end.** That is a number to aim at rather than an adjective to argue about. Grain runs the opposite way —
watercolour most paper noise, ink least.

⬜ For actual depth under the icons, the reference is **Imhof's painted relief** — light from upper left, cool
blue-grey in the valleys. **That is Erik's "depth view" at region tier, and it composes with icons rather than
competing.**

---

## ⬜ §4 — OPEN, AND THE ONE THAT COULD STOP US

| | |
|---|---|
| ⛔ **GLYPH LICENSING** | **the blocker.** Azgaar's FMG is open source but **I did not confirm the licence on its relief-icon ART, which is a separate question from the code.** Free icon packs exist but carry mixed terms. ⚠️ **Nothing ships until a licence is read — CCode or Erik, not me asserting from a search result.** |
| **commission vs reuse** | a small bespoke set — **6–8 mountain, 3–4 hill, 3–4 forest, a few settlement glyphs** — may be cheaper than auditing licences, and it would be *ours* |
| **budget** | Azgaar flags relief icons as his heaviest layer ⛑ **which argues for Erik's zoom floor: the world tier does NOT draw them; region and location do** |
| **where hachures DO survive** | ⬜ possibly as a light texture *under* icons on open ground. ⚠️ **Not the load-bearing element — and I would rather it stay out until icons are in.** |

⛑ **What survives from the prototype is the data path, not the drawing:** antimeridian unwrap, per-window
normalisation, landlocked detection, aspect, real rivers from `hydrology`, and **the miles-and-walking-days scale
bar.** ⛔ **The relief layer is struck and replaced. `po/prototype/render_region.py` stands as the data-path
reference and NOT as a style reference.**

— Aevi
