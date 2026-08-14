# STATE — Singularity world & content (Aevi PO)

**Last updated:** 2026-08-14 · **Session:** map tiers, scale, figures, names, news

---

## WHERE THINGS STAND

### ⛔ THE HEADLINE: content is ahead of wiring, and that is the thing to fix first

| file | authored | engine reads it |
|---|---|---|
| `region_maps.json` | **8 of ~30 regions** | ⛔ **tests only** |
| `local_layouts.json` | **18 of 135 locations** | ⛔ **tests only** |
| `scale.json` | world radius, km/degree | ⛔ **nothing at all** |
| `precursor_lines.json` | 29 nodes, 30 spans | ⛔ tests only |
| `areas.json` | Disputed Zone ellipse | ⛔ tests only |
| `location_kinds.json` | 135 kinds + regionDisplay | ✅ generator + tests |
| `minted_names.json` | 27 traditions, 146 bynames | ⏳ shipped this session |
| `news_templates.json` | 4 outcomes × 3 relationships | ⏳ shipped this session |

⚠️ **`scale.json` HAS ZERO CONSUMERS, WHICH MEANS ANY SCALE BAR IS STILL USING EARTH'S RADIUS —
a 2.76× error.** Cheapest high-value wiring available.

⛔ **RECOMMENDATION: wire ONE tier end-to-end (region_maps for the Echo Vale) before authoring 22 more
regions.** Five files validated by CI and rendered by nothing is the evidence that authoring outran
consumption.

---

## GEOGRAPHY — clean as of this session

**All five `content_ci` geography failures closed (SNG-434).** World rebuilt from corrected genparams:
**land 42.0% · mainland 100% of land · 0 stranded · 1 off-mainland** (`the_slow_stair`, an island, which
suits a stair coming up out of the dark onto a shore — ⚠️ **Erik's call if he wants it moved**).

**The Echo cluster is on the Echo.** Millbrook 14 mi above the crossing — *the crossing exists because the
village does.* Archive Hollow upstream, Waystone downstream. **Echo River Crossing moved to `valley`** (it
was 936+ mi from every Vale member); **Waystone likewise.**

⛔ **RECURRING FAULT, TWICE THIS SESSION: moving a position and forgetting `regionId` is a separate
field.**

---

## OPEN — MINE

- **Region maps: 22 of 30 unauthored.** ⚠️ Hold until one is wired.
- **Local layouts: 117 of 135 unauthored.** Same hold.
- **The Valley region map has no authored roads** — it renders places without connections.
- **12 single-location foothill regions** — ⚠️ probably want a local map and no region map. **Unsettled.**
- `_originModifier` tone weighting is authored but unproven in play.

## OPEN — CCODE

- **The battle image.** ⛔ **The last piece of Erik's original ask.** The clash now records `locationId`
  and `abilityId`; `battleprompt.js` exists; content is complete (appearance 66/66, fightingStyle 66/66,
  374 abilities with shape + intensity).
- **Wire the map files** (above).
- **Rival-weighted fight selection** and **`offscreenVerbs` for the offscreen beat** — both answered with
  measurements in `news_templates.json`.

## OPEN — ERIK

- **Seed images need a Pollinations API key.** Tested: 36 models accept image input, but the keyless
  endpoint the app uses **silently ignores both `model=` and `image=`** — it returns 200 and a
  slightly-different file because the param changes the cache key. **`gen.pollinations.ai` returns 401.**
  ⚠️ **A key cannot go in client-side `art.js`; it needs a proxy or BYOP.**
- **Standing debt** (ratcheted, not breaking): 89 abilities with non-canon challenge types · 62 raw prose
  caps · 26 unread rule constants · 15 modules missing from the spec map · 5 imported-never-called exports.

---

## METHOD NOTES WORTH KEEPING

⛔ **THE RECURRING FAILURE IS VERIFYING CONTENT AND NOT ADDRESS.** Six instances: stale place-name
signatures · the base/live seam · `gen-object-object` · the ellipse computed with a mixed metric · twelve
foothill regions authored under bare keys while canon used `foothill_` prefixed · `genparams.json` as a
stale cache of `worldPos`.

⚠️ **A duplicate key is worse than a missing one — a missing key throws, a duplicate resolves to the wrong
value in silence.**

⛔ **TEST THE PROSE AGAINST REAL DATA.** Rendering the templates with actual figures caught three bugs
reading alone did not: a short-name rule that cut *"Morvane of the"*, fragments needing two grammars, and
an editorial marker in player-facing text.

⛔ **THE CHOICE OF NULL IS THE CLAIM.** A biased null made waygates look actively anti-correlated with
Precursor lines at 0.43×; against the honest null it is 0.89× — indistinguishable.

**Erik's standing ruling: WORLD GEOGRAPHY OUTRANKS UNANCHORED PLAY MEMORY** — but it demotes remembered
POSITIONS only, never play-authored CONTENT.
