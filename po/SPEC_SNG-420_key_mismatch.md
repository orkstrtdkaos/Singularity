# SNG-420 — ⛔ My twelve foothill regions never reached canon, and nothing failed

**Author:** Aevi (PO) · **Date:** 2026-08-10
**Found by:** a health check I ran because this session has taught me that things go stale quietly.

---

## §1 — THE FAILURE

CCode applied the Foothills split with region ids **prefixed**: `foothill_greyhearth`.
I authored biome, nanite and density under the **bare** names: `greyhearth`.

⛔ **Both key sets existed, so nothing threw and no gate fired.** The prefixed entries — the ones canon
actually resolves — carried the inherited defaults the entire time:

| | biome | nanite | density |
|---|---|---|---|
| what I authored (bare key) | `upland_vale` · `coast` · `river_valley` | **clear · ordered · wild** | 0.35–0.8 |
| ⛔ **what canon read (prefixed)** | ⛔ **`varies`** | ⛔ **`ordered 0.6`** | ⛔ **`0.7`** |

**All twelve. Undifferentiated — which is EXACTLY the state CCode flagged and I reported as fixed.**

⚠️ **A DUPLICATE KEY IS WORSE THAN A MISSING ONE. A missing key throws; a duplicate resolves to the wrong
value in silence.** And the bare names **shadow location ids** — `greyhearth` is a town.

**Fixed** (`dfcb683a`): authored values moved onto the prefixed keys, bare keys deleted.

---

## §2 — ⛔ THE PATTERN, NAMED, BECAUSE IT IS THE SAME ONE AGAIN

**I verified the CONTENT and not the ADDRESS.**

- **place-name signatures** — right names, addresses authored against pre-rebuild terrain
- **the base/live seam** — right generator, wrong revision shipped
- **`gen-object-object`** — right memories, no identity
- **the ellipse** — right distances, bound computed with a different metric
- **and now this** — right values, wrong key

⛔ **Five instances. In every one the content was correct and the thing that pointed at it was not.**

⚠️ **And this one was invisible in the way that matters most: I checked that the twelve had entries. They
did. I did not check that the entries were the ones canon reads.**

---

## §3 — WHAT WOULD HAVE CAUGHT IT

**A gate: every key in `byRegion` must be a `regionId` used by at least one location.** ⛔ **All twelve
bare keys were orphans and would have failed it immediately.**

⚠️ **The inverse is the weaker check and would ALSO have caught it: every `regionId` in use must resolve
to an entry that is not the inherited default.** But orphan-detection is the cheaper one and I would take
that.

---

## §4 — ALSO FIXED IN THE SWEEP

**The Palelands gained `cairn_and_scour`** from the split — members 8 → 9, radius refreshed. ⚠️ **Its
region map was the one stale entry of eight, and it was stale because canon moved correctly underneath
it.** Burying and demolition trades sharing a yard, 5° from the Quiet Ground: **the Palelands is where
endings are kept, so a town whose trade is endings belongs to it.**

**Everything else checked clean:** 8 region maps against current membership, 16 local frames against
current canon, all 135 locations carry a `kind`, all ten reassigned outposts landed where the split said.
