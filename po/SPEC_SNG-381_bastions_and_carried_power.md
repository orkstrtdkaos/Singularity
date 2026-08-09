# SNG-381 — The bastions: a bulk-stamp defect, and nothing anywhere says WHICH power a place pools

**Author:** Aevi (PO) · **Date:** 2026-08-08 · **Origin:** Erik — *"don't forget about the bastions… you
might need to tweak some or create new ones given the new power sources."*
**Status:** measurement · ⛔ **one defect needs Erik's ruling before I touch it**

---

## §1 — APPLYING THE SNG-380 LESSON FIRST: yes, they are read.

`substrateSource` is consumed by `engine/substrate.js` and `engine/state.js`. **48 of 118 locations carry
one** — 40 pools, 8 sinks, each with `delta`, `radiusWorld`, and a `reason`. **This is live machinery, not
decoration**, which is why the finding below matters.

---

## §2 — ⛔ THE DEFECT: the entire foothills is one stamped template

| region | locations with a source |
|---|---|
| ⛔ **the_foothills** | **22 of 22 — 100%** |
| the_quickwood | 4 of 6 |
| valley | 2 of 12 |
| every other region | 1 of 3–5 |

**All 22 foothills entries are byte-identical**: `delta +0.20`, `radiusWorld 0.054`, and **the same
`reason` string — "The Archive was sealed before the Transition and never opened to it."**

⛔ **Twenty-three locations claim to be the sealed Archive.** Only `archive_hollow` actually is. The other
22 are ordinary outposts and markets — Waystone, The Low Market, The Grindstone, Thinwater — **each
carrying the substrate profile of a sealed pre-Transition vault, with overlapping radii, across one
region.**

⚠️ **26 distinct reasons across 48 sources: the other 25 are individually authored and good.** This is one
batch write that stamped a template, not a systemic authoring failure.

⛔ **I AM NOT STRIPPING 22 POOLS UNILATERALLY.** Removing them re-shapes the substrate map of a whole
region, which changes the ground under every craft that works there. **Erik's call between:**
1. **Strip 21** (keep `archive_hollow`) — the foothills return to their regional baseline.
2. **Re-author 21 reasons and deltas individually** — if the foothills genuinely SHOULD be dense, say why
   per place. ⚠️ **More work and probably the better world**, since a market town pooling substrate is a
   fact worth explaining.
3. Leave it — ⛔ **only if the uniform +0.20 was intended**, which the copied reason argues against.

**Also malformed: `the_old_warden_post` has `substrateSource: "thin-unreached"` — a bare string where every
other entry is an object.** ⚠️ **It has not thrown, which means the reader tolerates it silently.**

---

## §3 — ⛔ THE ARCHITECTURAL GAP ERIK IS POINTING AT

**0 of 48 substrate sources name WHICH power they pool or sink.** Fields are `kind · delta · radius ·
reason` — a single undifferentiated "substrate density".

**Under SNG-376/378 that is no longer sufficient.** A pool of **Precursor lattice** and a pool of **wild
nanite** are not the same place:
- the first is good ground for The Instrumented and useless to The Reaching Mind
- the second widens both crit bands for everyone standing in it
- ⚠️ **and a VEIL-thin place is good ground for exactly one school in the game and terrible for the
  lattice-dependent — it should be somewhere a Seraphic does not want to camp**

⛔ **Today the model cannot express any of that.** A `sourceType` on `substrateSource` is the smallest
change that would — **but per SNG-380 I am not authoring the field before `substrate.js` reads it.**
**CCode: is `bandForSchool` able to take a per-location source, or does the band only compare against an
untyped density?** That answer decides whether this is a content pass or an engine change.

---

## §4 — ITEMS: 2 of 10 carry a charge, and neither says of what

`resonance_lantern` (0.04) and `prism_chip` (0.05) carry `substrateCharge`. **The other eight carry none,
correctly — a waterskin should not.**

⚠️ **Both existing charged items are harmonic/radiant, i.e. the two local craft families.** **There is no
item anywhere that carries precursor, nanite, wild, metaphysical or veil charge** — so the source
architecture has no physical presence in play at all. **That is Erik's "author new items with carried
power", and it is the highest-value authoring on this list** because an item is how a source becomes
something a player can hold, trade, lose, and want.

**Authored in §5 below**, using the SNG-374 pattern: **the source goes in `substrateNote` prose, which
reaches play today; `chargeSource` is specced, not authored, until it has a reader.**

---

## §5 — STILL TO REVIEW (named, not done)

- **Minted items** — `deriveItem` is in the op vocabulary; whether minted items carry charge and whether
  any names a source is unmeasured.
- **Companions** — SNG-353 established that 12 authored fields reach 2.5. ⚠️ **None of them is a power
  source**, and a companion who teaches you a craft is teaching you a craft *from somewhere*. Marrow's
  `bondGrants` has no source.
