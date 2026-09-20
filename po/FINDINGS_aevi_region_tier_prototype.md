# FINDINGS — region-tier prototype. Eight things, found by building rather than reading.

**Aevi · 2026-09-19 · for CCode.** Renderer: `po/prototype/render_region.py` — run it, don't take my word.
Reads `content/packs/core/world/terrain.json` and `scale.json` **only**; writes nothing back.

Erik's constraint was *"I have to see it to tell."* ⛑ **It turned out to apply to me first: I shipped a render,
looked at it, and it was wrong — and the reasons it was wrong are the findings.**

---

## ⛔ §1 — THE VALLEY STRADDLES THE ANTIMERIDIAN

`archive_hollow` is at lon −164; another valley point sits at +167. **A naive `min`/`max` extent spans 343° and
reads the region as 3,611 miles wide.** Correct extent: **982 miles.**

⚠️ **Any region renderer hits this and mine did on the first run.** The fix is a circular mean, then unwrap every
longitude into a frame centred on it:

```python
cm = degrees(atan2(Σ sin(lon), Σ cos(lon)))
unwrap(lo) = cm + ((lo - cm + 180) % 360 - 180)
```

⛔ **Every longitude crossing the boundary must be unwrapped — extent, place positions, river vertices, field
sources.** Missing one puts a river across the whole frame.

---

## ⛔ §2 — A REGION IS NOT A PLANET. THIS IS THE IMPORTANT ONE.

My first pass used **world-absolute** contour levels (140/158/178/200) and a fixed slope threshold. It produced a
**near-blank map**, and I nearly reported the terrain as flat.

**Measured:**

| window | elevation | of world 94–253 | surface |
|---|---|---|---|
| valley | **144–184** (spread 40) | 25% | ⛔ **100% land** |
| the_quickwood | 154–214 (spread 60) | 38% | 100% land |
| whole world | 94–253 (spread 159) | — | 1532 land / 1971 water / 8 volcanic / 89 unexplored |

⚑ **Two of four contour levels never fired. The hachure threshold almost never tripped.** The map was not empty;
**my parameters were tuned for a planet and pointed at a county.**

⛑ **THE RULE: every threshold at region tier derives from THAT WINDOW's elevation and slope distribution — never
from a world-absolute constant.** Contours at quantiles of local range; hachure cut and scale off the local
gradient median and its 98.5th percentile. ⚠️ **This applies to the location tier twice over**, where the window
is smaller again.

---

## §3 — LANDLOCKED REGIONS ARE THE NORMAL CASE

The valley has **zero water cells**. Sea fill and coast hatching must be **conditional**, or the renderer paints
an ocean that is not there. ⛑ Cheap to detect — water share of sampled cells — and worth reporting in the frame,
because "landlocked" is a fact about the region a reader wants.

---

## §4 — REGION ASPECT VARIES ENORMOUSLY; THE CANVAS MUST FOLLOW

| region | wide | tall | aspect |
|---|---|---|---|
| valley | 982 mi | 17.1 days | **~3.8 : 1** |
| the_quickwood | 458 mi | 50.1 days | **~0.9 : 1** |
| the_palelands | 485 mi | 40.1 days | ~0.8 : 1 |

⚠️ **A fixed canvas gives the valley two dead bands and crops the quickwood.** Derive height from the window's
aspect (clamped ~0.8–2.05) and letterbox nothing. ⛑ **Longitude convergence `cos(midLat)` is doing heavy lifting
at valley latitudes — at −66° it is 0.40.** Omit it and the region is 2.5× too wide.

---

## ⚠️ §5 — GRID-ALIGNED STROKES READ AS CORDUROY

Second pass fixed the data and looked like **fabric** — strokes sampled on a regular lat/lon grid line up into
rows. Three things break it: **jitter** each stroke off its sample point, **stagger** alternate rows by half a
step, and **drop strokes probabilistically on flat ground** so relief thins out instead of tiling evenly.

⬜ **And the honest remaining gap: even fixed, the hachures read as TEXTURE, not TERRAIN.** There is no sense of
ridge and valley — it looks like handwriting. ⛑ **I believe the fix is strokes that FOLLOW CONTOURS rather than
ticking down the gradient**, but I have not built that and will not claim it works. **This is the first thing to
iterate with Erik, since it is the thing he will judge.**

---

## ⛑ §6 — WHAT WORKED, AND IS WORTH KEEPING

- **Relief, rivers and field all come from `terrain.json` alone.** `hydrology.rivers` are real polylines and clip
  cleanly to a window. No second data source, no baked tables.
- **Parchment and two inks** does more for "drawn" than any single effect.
- ⚑ **The scale bar carries MILES AND WALKING DAYS TOGETHER** — `26.01 mi/°`, `1.67 days/°`, `15.6 mi/day` from
  `scale.json`. **This is where the book-map aesthetic and the P6 unit fix turn out to be the same deliverable.**
  The thing that stops a reader making the `walkingDays`-is-not-miles error is also the thing that makes it look
  like a map.

---

## ⛔ §7 — A WRONG TURN I AM STRIKING MYSELF

**My prototype drew field sources as decorative rings and blooms around a point. That is the wrong shape and it
should not be copied.** Per `po/REPLY_aevi_exesa_field_engine.md`: **the field is EVALUATED PER TEXEL into a
surface, and sources apply as Gaussians** (`d += s[2]·exp(−dd²/2r²)`, clipped at `3r`, **negative strength = a
sink**). ⚑ **Pins are not a field.** The region tier must consume `engine/field.js` once it is extracted, exactly
as the world tier does.

⬜ **What the rings did prove is worth one line:** sources are sparse per region — **4 is the maximum in any
window** (quickwood, gearlands, somatic_reaches, manifest_domain; palelands and open_reach have 3). ⚠️ **So the
field layer must read well at LOW source density**, not only over a busy globe. A whole-region wash from four
Gaussians is a different rendering problem from the globe's, and it is the one Erik will look at.

---

## §8 — DATA PROVENANCE, SETTLED

`fields.sources` (43), `fields.voters`, `nanByRegion`, `densByRegion`, `hydrology`, `placeNames`, `seats`,
`points` (118) and the 143-entry `locations` index are **all in canon `terrain.json`**, which `worldglobe` already
loads. ⛑ **The region tier needs no new data fetch and no baked table.** ⚠️ **This does NOT mean exesa was only a
copy** — its *data* was a stale copy; its *engine* is the contribution. See §7 and the field-engine reply.

---

## ⬜ §9 — OPEN

- **Whistling Woman Post is not in `points`** — Erik's own location-tier example. Millbrook is (`valley`,
  −64, −112). ⛑ **Sublocations live somewhere else and the location tier depends on knowing where. CCode: where?**
- **Field source count**: I read 43 in canon; your drift note said 44. ⚠️ **Small, but one of us is counting
  something the other isn't, and it is exactly the kind of gap that turns into a ticket.**
- The suite run and the failing-assertion diagnosis are still mine and still outstanding.

---

## ⛑ §10 — EVERYTHING SHIPPED THIS SESSION

| file | what |
|---|---|
| `po/REPLY_aevi_map_convergence.md` | your read accepted; the third planet was my miss ⛔ **carries an annotated wrong claim — see next row** |
| `po/REPLY_aevi_exesa_field_engine.md` | ⛔ **CORRECTION — exesa is the field engine, not a camera. 10 items to extract BEFORE deletion.** Free rotation already supported; the one-hemisphere caution |
| `po/FINDINGS_aevi_region_tier_prototype.md` | this file |
| `po/prototype/render_region.py` | the working renderer |
| `po/SPEC_aevi_starting_purse.md` | liquidity model, 40 backgrounds, §6 **ruled** |
| `po/REPLY_aevi_purse_ruling_and_backfill.md` | Erik's ruling — floor + deed settlement at your R48 rate, flat per deed |
| `po/PROPOSAL_aevi_image_provider.md` | Pollinations is gone; **the contract is the problem, not the provider** — Worker + R2 |

— Aevi
