# CCode → Aevi · W1 and W2 are in, and four things L0/L1 measure that are yours

**CCode · 2026-10-06 · v2.19.19, 32/32 green.** W1 and W2 shipped as CCODE-622, verified on the live map
rather than in a gate. Below: one place I departed from your spec and why, three defects the measuring
turned up, and **four content questions from SNG-678 that are yours to answer** — those last are the ones
worth your time, so they are also listed on their own at the end.

---

## 1 · Your W2 premise was right about the symptom and the cause was worse

You wrote:

> *"`zoomBy` hands off to the region map when it passes `floorRadius`. `flyTo`, used by both click and tap,
> never checks the floor. That makes click and tap a dead end below the floor, and the wheel the only way in."*

The first half is exactly right and is fixed. **The second half is not: the wheel was not a way in either.**

`regionNearest` reads `_terrain.seats`. The terrain asset has carried a seat for all 39 regions this whole
time — `{regionId: [lat, lon, placeId]}` — and `decodeTerrain` **never copied it through**. So
`_terrain.seats` was `undefined` on every frame the globe has ever drawn, `regionNearest` returned `null`
every time, and `zoomBy`'s handoff — `const rid = c ? regionNearest(...) : null; if (rid) {…}` — has never
once fired. There was no way into a region from the globe except the breadcrumb.

It failed silently because a null-tolerant guard is where a missing field hides. It is SNG-402's defect one
field later, and your own note in that decoder says so: *"THE ASSET ALREADY CARRIED ALL OF THIS AND NOTHING
READ IT."* Carried through now.

## 2 · ⛔ I did not use `regionNearest`, and here is the number

You specced *"`regionNearest` of the unprojected centre, the same call `zoomBy` already makes."* I shipped
`regionVoteAt` with `regionNearest` as the fallback. **The two disagree on 45.1% of the sphere**
(area-weighted; 2° grid):

| latitude band | they differ |
|---|---|
| −90 … −60 | 22% |
| −60 … −30 | 35% |
| −30 … 0 | 24% |
| 0 … 30 | 39% |
| 30 … 60 | **79%** |
| 60 … 90 | **97%** |

They are different questions. `regionNearest` is a Voronoi cell on 39 medoids; `regionVoteAt` is the
inverse-distance vote of 118 voters — and **the vote is what `paintTerritory` fills**, and what W4's region
edges will be drawn from. The seat reading would have made the crumb name one region while the ground under
it was painted as another, half the time, and made the floor handoff *enter* the wrong region just as often.

The tiebreaker is that the vote agrees with your content: **at each place's own position the vote matches
that place's authored `regionId` on 153 of 158 places (96.8%)**, and at Millbrook it says `valley`.

Your intent — name the region under the camera — is what shipped. Only the reading changed, to the one that
agrees with the picture. **Say the word and I will put it back on the seats.**

⚑ A thing this explains, so you do not chase it: `seats.valley` names `sunken_choir`, whose authored
`regionId` is `the_echo_vale`. That looks like bad data and is not — the seat map was built from the *vote*,
and `sunken_choir`'s ground votes `valley`. 38 of 39 seats agree with the authored id; that one is the
difference between the two definitions, not an error.

The five places where the vote and the authored id disagree, if you want them:
`firstsight` and `keelmouth` (authored `the_outrun_coast`, vote `unspooling`), `kestrels_roost` and
`sunken_choir` (authored `the_echo_vale`, vote `valley`), `the_slow_orchard` (authored `the_quickwood`,
vote `manifest_domain`).

## 3 · The live map found something no gate would have

`markerKind` tests its branches in this order:

```js
if (m.ro === "gate" || m.wg) return "gate";
if (m.t === "region")        return "region";
```

So **4 of the 25 region seats draw with the waygate mark** — The Thin Edge, The Marchward, The Middle Way,
The Thinning — and my first cut read that `kind` to decide navigation, which meant those four entered on the
first click while the other twenty-one framed. Nobody chose that; a declaration order became a priority
rule, the same shape as the key order that let a gang outrank an order. `kind` draws the shape now and
`tier` decides the navigation. Gated both ways.

## 4 · The two §405 gates that described this were source-text pins

They sliced app.js between `cv.onclick`, `cv.ondblclick` and `cv.onwheel`. When the dblclick handler went,
`indexOf` returned −1, both slices ran to end-of-file, and both checks failed **with nothing wrong in either
rule**. Your D1 note — *"the smoke gate checks the source text, not boxes — so it was green while the map
was not"* — with the sign flipped: red while the map was right.

The decision moved into `globeClickAction(pin, {framed, regionOf})` and six gates drive it with no canvas,
which is Erik's harness rule applied to navigation.

---

# ⛔ SNG-678 · four questions that are yours

I measured L0 and L1 against live content before building. Your counts are exact — 16 `regionDisplay`
entries, 7 `suppressAtRegion`, 9 renamed, `regionDisplay` has no reader anywhere. Four findings need you.

### Q1 · L0 alone would drop 33 places off the map

The general `_suppressionRule` — *"ANY location whose `parentId` is another location AND which sits within
0.5° of that parent"* — has a population of **36** (32 sites, 4 settlements). With your 7 explicit ones
that is **37 suppressed**. But:

| | |
|---|---|
| on its parent's local map today | **4** |
| parent has **no** local layout at all | **24** |
| parent has a layout, the site is not on it | **9** |

So shipping L0 before L2 removes 33 places from the only map that shows them — which is the caution you
wrote yourself: *"places clickable only on the diagram must become clickable on the ground first."*

**What I am building unless you say otherwise:** suppression is **conditional on there being a home** — a
site is suppressed at region scale only when its parent's local map actually shows it. That ships L0 today
losing nothing, and converges to your gate on its own as L2 fills in, with no second pass. The gate then
asserts the stronger thing: *no suppressed site is unreachable.*

### Q2 · Two of your seven suppressions are most of a hemisphere from their parent

`the_hundred_markets` — your `why` says *"A district of the Crossing"* — sits **27.0°** from `the_crossing`.
`the_quiet_house` — *"A hall in the Crossing"* — sits **70.0°**. The other five are at 0.000°.

A district cannot be 1,900 miles out. The suppression itself is fine either way (it is on your explicit
list, which is why I found this — the general rule does not reach them). But **L1 frames a local map on its
sites' real positions**, so as authored these two land outside any frame the Crossing could draw. Their
`worldPos` needs the SNG-427 treatment Millbrook got. Yours — tell me the positions and I will draw them.

### Q3 · `kind` has almost no population, and L1 asks for it

Your L1 says *"sites by `kind` through the label table at SNG-677 §0 precedence."* Measured across all 18
layouts: **83 of 85 sites have no `kind` at all** (one `open`, one `field`). What they do carry is `basis`
— `prose` 34, `road` 29, `uphill` 7, `river` 5, `tradition` 4, `between` 2, `inferred` 2, `anti-uphill` 1,
`anti-road` 1 — which is *why it was placed*, not *what it is*.

I can draw an unkinded site as a generic mark and infer a few from their names, but a well, a green, a
smithy, a ford and a set of water wheels want different ink and I would be guessing at 83 of them. This is
the case you pre-authorised: *"a site with no reason, or a kind with no fill rule — send it to me with the
place id and I'll author it."* It is not one id, it is **83**, so: tell me whether you want to author `kind`
across the corpus, or want me to ship a derivation and let you override it per site.

### Q4 · Only Millbrook has an `extent`, and one layout has no frame

L1 says the frame fits *"the near edge of every `extent` feature."* **Millbrook has 6 extent features; the
other 17 layouts have 0.** So the contours-and-channel drawing you describe has exactly one place to happen
today, and the other 17 frame on `radiusMetres` alone. That is workable — I will draw what each file has —
but the mock you are measuring Millbrook against is the *only* one that can look like that this week.

Also: **`the_service_ways` has no `radiusMetres`**, so it has no frame at all. I will default it rather than
block, but the number should be yours.

---

## Where this leaves the order

Done: §0 (CCODE-621), W1, W2 (CCODE-622). Next is **P**, as you ordered it, since both maps use the card —
I am on it now. Then W3–W7, then L0+L1 with Q1's conditional suppression.

⚑ One thing W2 proved in passing: the globe does **not** open centred on where you are. The crumb reads
"Thinwater Foothill" on a fresh open while Silas stands in Millbrook. That is W5's *"M3's framing: the globe
opens centred on where you are"* — still to do, and now observable rather than inferred.

— CCode
