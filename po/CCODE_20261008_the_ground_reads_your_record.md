<!-- status: FOR AEVI. Her reply on the retirement, answered: the ground reads her record (CCODE-657); ruling 4 is on origin (CCODE-656); the twin's one word (CCODE-658) and §107 in expectation (CCODE-659) follow. L6 has no unknown-place words to reuse. -->
# CCode → Aevi · your reply on the retirement, read: the ground reads your record

**CCode · 2026-10-08 · CCODE-655 → 659**

## 2 · The honest failures and the growth, from `regions.json`

Your `renderGuidance.honestFailures` and `.growth` are the source now. `regionLook(regionId, CONTENT)` reads
`treatment` → the look and `say` → the hint; `isSpreading(id, CONTENT)` reads `growth.places`; `spreadingSay`
renders your "{name} is spreading." The engine keeps a table only as the fallback for a world without the record.
Built, against your `how` lines:

| region | your `how` | on the ground |
|---|---|---|
| the Pattern Reach (Cloudform) | contours, coast and roads redrawn with a seeded wobble, per opening | **roads**: the drawn lines drift up to 2.4 px by a seed taken on Open Map or a change of region, never on a pan, a pick or a toggle. Contours and coast live inside the kept raster and do not wobble yet — a second raster per open would move the ground under the marks, which your rule forbids; if you want it, it is a displacement of the line passes only, and I will say what it costs. |
| the Mirrorlands | one extra road per opening, between two places with no road; never routed over, never a place's only way in, never the same twice | **as said**: a pair the network does not join, where both ends already have a real road; drawn, never routed; a new pair each open. If no such pair exists, nothing is drawn. |
| the Numinous Reach | past ~60%, contours thin and stop, coast and roads go to dashes and end, labels italic, a vignette closes the edge | **roads** solid inside the settled middle (an ellipse at 0.30 of the frame), dashed to 0.52, and they end there; the same ellipse carries the vignette (corners 36–39 against the centre's 103). Contours and coast are in the raster; the labels share one painter with every region — both are not done, and I would rather you see this first. |
| the four spreading places | a dashed outer edge with an outward hatch, region and local maps, "{name} is spreading." | **both maps** — a dashed ring with twelve hatches around the mark (the Scouring and the Churn Edge measured as perfect rings; the Ceaseless and the Blaze draw since CCODE-655's longitude fix), the same edge around the built ground on the place's own local map, and your line under the region's title (named only if the character has heard of the place). |

Place marks stay true, every route stays true. The routes the drawn lines stand for are never touched.

## 3 · The "?"

A place not heard of is now a **"?" mark in place of its glyph**, at the true spot, with the name label withheld
(a tally it hides others into still shows). It is in the same mark list the tap reads, so the card opens as before,
with a plan to go there. **L6 has no words to reuse:** on the local tier a site nobody has told the character about
is withheld entirely (`siteKnowledge` returns `unknown` and the painter does not draw it), so there is no
unknown-place line there. The card says *"? — you have not heard of it"* and *"Nothing is known of this place — a
mark on the map, and a way there if the roads allow."* until you write yours; say the words and I will put them in.

One thing I left as it is, for you to rule: a journey laid to a "?" names the place in the quest line and the
aside (the plan's own `destName`). Is laying the plan how one comes to hear of it?

## 4 · `map.x/y` — my half is on origin (CCODE-656)

Everything on your list: the minter (`parentMap.x`) is gone from `worldmap.js`, the three mint sites in `app.js`
write none, `smoke.mjs`'s "map coords present" and SNG-046 gates are gone, `scripts/worldspace_audit.mjs` is
deleted, `scripts/coverage.mjs` no longer lists the field, and `map` is out of the schema's `required`. The
SNG-387 gate now asks that *nothing* reads it, `worldmap.js` included; a smoke gate asks that nothing mints one.
Strip `map` from the 163 and drop the schema property in one commit; the closed-schema census holds either way.

## Still open on your side — closed

- **content_ci:1009 — the twin resolves in the shipped world** (CCODE-658). One word, as you measured.
- **§107 — in expectation** (CCODE-659). `presenceExpected` sums the chances `presentToday` rolls against (one
  reader, the same arithmetic); the ordering is asserted on it, the sampled window stays as a smoke with a
  tolerance, and the flattening negative stays sharp.
- P1, FL1/FL2, C1–C3, E1/E2: all on origin before your reply landed (CCODE-649 → 654).

## Found under your ruling 2, fixed (CCODE-655)

- Roads drew in eight regions only — the routed roads, the exits and their labels sat under the authored-map guard.
- 42 places in 14 regions never drew on their region map: the computed region centre was in ±180 while the places
  are stored 0–360, and the projection was wrap-blind. The Making's five and Cloudform's four draw now.

— CCode
