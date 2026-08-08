# SNG-370 — Braids were always meant to be n-part. The identity layer agrees; the build path does not.

**Author:** Aevi (PO) · **Date:** 2026-08-07 · **Origin:** Erik — *"the braids were always meant to allow
for multiple skills, not only 2. the code is there for it."*
**Status:** spec_ready · **Corrects** SNG-369 §4, where I filed this as content lagging the engine

---

## §0 — I FILED THIS WRONG AND ERIK CORRECTED THE PREMISE

I wrote: *"the engine mints combinations the content layer does not model."* **That framed a design
INTENT as an engine overreach.** Erik: braids were always meant to be n-part. **So the catalogue being
entirely 2-part is my gap — and the engine is only half-built toward its own design.**

## §0a — Verified: the layers disagree with each other

| layer | arity | evidence |
|---|---|---|
| **identity** | ⚠️ **n-part, correctly** | `braids.js:48` — `braidKey = [...components].sort().join("+")`. Any number. |
| **recipe store** | ⚠️ **n-part, correctly** | `recipeFor` keys on `braidKey`; nothing assumes two. |
| **detection** | ⛔ **2 only** | `braids.js:37` — `if (comps.length !== 2) continue; // pairwise braids only (the ledger is pairwise)` |
| **def building** | ⛔ **2 only** | `braids.js:98` — `if (sources.length !== 2) return null;` |
| **tier calculation** | ⛔ **2 only** | `braidTier` is called from the pairwise paths only |
| **authored catalogue** | ⛔ **2 only** | all 57 recipes in `combination_recipes.json` — **mine** |

**The bottom half of the stack believes braids are pairs. The top half does not.**

---

## §1 — THE EVIDENCE IN ERIK'S SAVE, and it is a live degraded record

```json
{ "id": "the-declared-threshold",
  "from": ["the_working_model", "the_shadow_work", "the_warding_mark"],
  "name": "The Declared Threshold", "tier": null, "mintedAt": 14, "discovered": true }
```

⛔ **`tier: null`.** It reached `braids.js:185` — `parents.length === 2 ? buildBraidDef(...) : null` —
returned null, and fell to the **fallback** at :186: *"a minimal braid-shaped def from whatever resolved
+ the discovery's own words."*

⚠️ **So Erik holds a real, discovered, three-part braid that never went through the braid builder.** It has
no tier, no `braidTier`-derived `maxRank` or `levelReq`, and its functions are a flat union of its parents
rather than an emergent. **It works well enough to appear in his list, which is precisely why nobody
noticed** — the fallback is good enough to hide that the real path refused it.

⚠️ **This is the `dim`/`sanitizeIntent` shape again: a graceful degradation that is indistinguishable from
success.**

---

## §2 — WHAT TO BUILD

**§2a — lift the arity gates.** `detectBraids` (`:37`, `:41`), `buildBraidDef` (`:98`), and the
`parents.length === 2` branch at `:185`. ⚠️ **The comment at :37 says "the ledger is pairwise" — check
whether the co-activation ledger genuinely cannot express a triple, or whether that was simply never
needed.** If the ledger is the real constraint, say so and it becomes the ticket instead.

**§2b — `braidTier` must take n parents. ⛔ ERIK RATIFIED 2026-08-07: THE TIER TENDS HIGHER FOR A THREE-BRAID.**

⚠️ **"Tends higher" is not "+1 per component", and the difference is the whole implementation.** Arity
should be an INPUT to the tier calculation, not an override of it — a triple of three tier-I crafts is
still a modest thing; a triple that reaches across three domains at rank 3 is not. **Arity leans on the
result; it does not dictate it.**

**Suggested shape, Erik's numbers to set:** keep the existing parent-derived tier as the base and let each
component past the second contribute a fraction of a rung, rounding up only when the base was already
close. ⛔ **A flat +1 per part would make a four-braid of trivial crafts out-tier a hard pair, which is
precisely the merit-over-magnitude error we have rejected elsewhere.**

⚠️ **And the reason arity should count at all is Erik's own design constraint on the content side:** a real
triple is one where **no two of the three would produce it alone.** If that holds, the triple genuinely IS
a harder thing and the tier follows the difficulty rather than the component count. **If a triple does not
meet that bar it should not out-tier a pair — and arguably should not exist.**

**Sim it:** the SNG-357 harness can run the tier distribution across the catalogue once triples are
authored, and a triple landing at the same tier as its best pair is the signal the weighting is too light.

**§2c — cost.** `braidBaseCost` is *"priciest parent + a share of the cheaper"* — **explicitly binary.**
Needs an n-part form. Suggest priciest + a share of each remaining, descending. **Erik's numbers.**

**§2d — ⚠️ REPAIR `the-declared-threshold` rather than leave it.** Once the builder takes three, rebuild
it so it gets a real tier. ⛔ **Keep its name — Erik has been playing with it.**

---

## §3 — CONTENT, AND IT IS MINE

**All 57 authored recipes are 2-part.** Once the engine takes n, the catalogue should carry triples —
⚠️ **and a triple is not "a pair plus one".** The braids that earn three parents are the ones where no two
of the three would produce it alone. **That is a real authoring constraint and I would rather write six
that pass it than twenty that do not.**

⚠️ **Sequencing: I am NOT authoring triples until §2a–§2c land.** Authoring against a build path that
refuses them is exactly the SNG-362 mistake — writing into a file the engine cannot read.

---

## §4 — OUT OF SCOPE

- Whether 4+ has a ceiling — ⚠️ worth Erik naming one. Unbounded arity means a braid of everything.
