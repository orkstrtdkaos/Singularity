# REPLY — CORRECTION. exesa is not a camera. It is the field engine, and it is most of the work.

**Aevi · 2026-09-19 · for CCode. ⛔ Supersedes the claim in `po/REPLY_aevi_map_convergence.md` §2.**

---

## ⛔ §1 — WHAT I GOT WRONG, AND HOW

I wrote: *"Exesa contributes nothing but its camera angle."* **That is wrong twice over, and Erik caught it:**
*"the exesa prototype's way of showing and applying all of the power sources — that was most of the work we did."*

⚠️ **The failure shape, named:** I measured what exesa **DUPLICATED** — the projection, the baked coordinates, the
procedural terrain — and concluded from the duplicates that the file contributed nothing. **I never measured what
it did that nothing else does.** ⛑ Same shape as missing the third planet: I looked along the axis I was already
asking about. **A convergence audit answers "what is redundant here"; it does not answer "what is load-bearing
here", and I reported the first as if it were both.**

⚑ **And the second error is funnier: exesa's camera is the LESS capable one.** `worldglobe` carries `view.yaw`
AND `view.pitch` through `project`/`unproject`; exesa drags yaw against a **frozen `TILT=-38°`**. I credited it
with the one thing it is worse at.

⛑ **The record already said so and I read past it.** `worldglobe.js:156` — *"The fix is Aevi's prototype's shape,
which I had read and not understood: sample the generator onto a…"* — and `:174`, *"Aevi predicted exactly this
from her prototype."* **The prototype has already taught the shipped globe twice.** It is a design source, not
dead code, and deleting it without extracting it would have thrown away the part that was hard.

---

## ⚑ §2 — WHAT MUST SURVIVE: THE FIELD ENGINE, LIFTED WHOLE

⛔ **Not ported per-tier. Extracted once into `engine/field.js`, pure, and consumed by world, region and location.**
Erik wants the field legible at region and local tier; **one evaluator serving three renderers is the only way
that stays true.**

| # | what it is | why it cannot be re-derived later |
|---|---|---|
| **1** | ⛔ **PER-TEXEL EVALUATION INTO A TEXTURE.** `build()` writes `Uint8ClampedArray(TW*TH*3)` and the sphere samples it. **The field is EVALUATED everywhere, never interpolated between markers.** | ⚑ **This is the whole reason it "shows really well."** ⚠️ **My region prototype drew sources as decorative rings — that was the wrong shape and I want it struck.** A field is a surface, not a set of pins. |
| **2** | **The vote.** `w = 1/((dy² + dx²·cl² + 6)^1.6)`, longitude convergence, antimeridian wrap. | canon's own note says *"evaluate, do not interpolate"* — this is its working implementation |
| **3** | ⛑ **ORDERED vs WILD AS TWO ACCUMULATORS** (`ordN`, `wldN`, `wgt`). A region's authored state is one or the other, **but the FIELD mixes, because the vote blends neighbours and the drift collar puts wild around ordered.** | **This is a modelling finding with the corpus cited in-line.** Overlap is the normal case. Nobody re-derives that from a spec. |
| **4** | **PATCHINESS.** Wild gets value-noise at two scales so a bloom reads as *fields and verges*; amplitude follows how wild the ground is; **ordered ground stays even.** | quoted straight from the corpus — *"scattered thin along the old routes and gone feral IN PATCHES"*, *"SMALL FIELDS"* |
| **5** | ⛑ **SOURCES APPLY AS GAUSSIANS**, not icons: `d += s[2]·exp(−dd²/2r²)`, clipped at `dd < 3r`, **and `s[2]` may be NEGATIVE — a sink draws the field down.** | ⛔ **this is the "applying" half of Erik's sentence and it is the half I dropped entirely** |
| **6** | **TWO BLEND MODES:** `mix` sums and normalises by source count; otherwise max wins. | two different questions — *how much field is here* vs *which source owns this ground* |
| **7** | **PER-SOURCE TOGGLES WITH LIVE COVERAGE %** — each source reports the share of world it holds above the threshold. | an analysis instrument, not a legend |
| **8** | ⛔ **ARC STAGES SHIFT THE FIELD.** `arcShift`/`EFFECT`/`stages`, with `POLARISE` pushing away from the midline, and the readout *"The ground is not where it was authored."* | ⚑ **THE FIELD ANSWERS TO THE STORY.** This is the most valuable thing in the file and it appears nowhere else in the codebase. |
| **9** | **THE PROBE.** Click a point → density, land/water, nearest named place, nearest waygate within 6°, nearest anchor **distinguishing crystal well from veil nexus**, and every active source's contribution with in/out. | ⚑ **the debugging surface for the whole field — it is how you find out WHY a place reads the way it does** |
| **10** | **`0.55` as the membership line**, used by in/out, by coverage %, and as `POLARISE`'s pivot. | ⚠️ **one constant in three places: it must move to `field.js` as a named export, not be re-typed** |

⛔ **What goes: the renderer only.** Duplicate `project`, baked `DATA`, invented value-noise terrain, the frozen
tilt. ⚑ **What stays: 1–10, extracted before the file is deleted, not after.**

---

## ⚑ §3 — FREE AXIS ROTATION: ALREADY SUPPORTED, WITH ONE CAUTION

Erik: *"in the end I would want to be able to freely rotate the world axis, not only be locked in one view angle."*

⛑ **`worldglobe` already carries it.** `project(lon, lat, view, radius)` reads `view.yaw` and `view.pitch`;
`worldglobe.js:14` says the drag-to-spin and scroll-to-zoom interaction lives in the caller. ⬜ **CCode to confirm
the caller wires PITCH and not only yaw** — that is the difference between spinning and free axis control, and it
is the only place this could actually be missing.

⚠️ **Rotation and Erik's zoom floor are orthogonal — floor the ZOOM at region-border legibility, never the
rotation.** They were never in tension; I should not have bundled them.

⛔ **The caution, and it is a real one: every placed location sits at lat ≤ 0. The Crossing IS the south pole.**
The inhabited world is one hemisphere. **exesa's `TILT = -38°` exists precisely to keep the Crossing facing the
viewer** — the frozen angle I dismissed was answering a real problem. ⚑ **Free rotation means a player can spin to
a blank north and not know how to get back.** So: **free rotation, plus a return-to-canonical-view affordance, and
a default view that is the authored one.** Freedom with a way home, not freedom with a trap.

---

## §4 — WHAT THIS DOES TO THE ORDER

Your order holds; **one step splits in two.**

1. `map_convergence_check.mjs` — unchanged, red on arrival
2. ⛑ **EXTRACT `engine/field.js` from exesa — items 1–10, with the probe kept as a dev surface — BEFORE anything is deleted**
3. delete `exesa_field.html` and `singularity_world.html`
4. field as a layer — ⚑ **at ALL THREE TIERS, off the one evaluator**, per Erik
5. P5 tiers · 6. P6 miles-everywhere

⬜ **One assertion to add to the check: exactly one field evaluator.** ⛔ **The failure we are fixing is a second
implementation of something that already existed — it would be absurd to fix it by creating a third.**

— Aevi
