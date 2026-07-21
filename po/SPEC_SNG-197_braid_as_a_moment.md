# SPEC — SNG-197: The braid is a MOMENT, not a merge
## Aevi (PO) · 2026-07-21 · authored to spec · **live feedback on SNG-196, CCode is mid-build**

> **Erik, from the live save (v1.8.180, Silas Weir):** *"It says to name it, but I don't see HOW. Plus I
> don't really want to — I want the GM to come up with a sweet name for something that is order and death
> sense, like 'Perfect Inevitability'. Its descriptions and cannots are pretty blah and fail. This is an
> ULTIMATE CREATION MOMENT in the game! A player should say HOLY SHIT that's COOL. It needs a great
> description and not just the functions of its parts but something extended that goes beyond each."*

SNG-196's foundation is sound and I am not asking for it back. What shipped is the **valid-stub half** —
CCode's own results doc names the rich half as REMAINING item (1), `generate.js` "braid" type. This spec
is the outcome definition for that half, plus one finding that is not a polish item but a **design
contradiction in the default**, and it needs deciding before the enrichment lands on top of it.

---

## §1 — THE FINDING: the fallback forbids the thing the braid is for

`engine/braids.js:98` sets, on every minted braid:

```js
notFor: "Anything beyond the braid of its two parents."
```

and `:74` derives capability as a **set-union** of the parents:

```js
const functions = [...new Set(sources.flatMap(s => s.functions || []))];
```

Read together, the minted braid is defined as **exactly its parents and nothing more, with a rule
explicitly barring more.** Erik's ask is the precise opposite: the braid must do *something neither
parent could*. The fallback is not blandly worded — it encodes a ceiling.

Note this is also **not what the tree text says**: `:89` scaffolds `cannot: "What neither parent could
do apart"` — which is the *right* idea (a thing only the braiding reaches). The def-level `notFor` and
the tree-level `cannot` currently state opposite doctrines about the same ability.

**OUTCOME WANTED:** a braid's ceiling is *its own*, not the intersection of its parents' permissions.
Union-of-functions is a sane **floor** — the braid can at least do what both could. What it must gain
is an emergent capability that neither parent's function list contains. Whether that arrives as an
added function, an effectTag, a tree-rank grant, or a narration-level affordance is CCode's call; what
must be true is that a player reading the braid can point at the line that is *new*.

⛔ Do not fix this by deleting `notFor`. An ability with no limit is worse than one with a wrong limit.
The braid needs a real boundary — just one drawn around the braid, not around its parents.

## §2 — The name is the GM's, and the player's only if they want it

Two defects, one root:

- **No UI path exists.** The tooltip says *"rename it and deepen it in play"* and there is nowhere to do
  it. `buildBraidDef` takes `opts.name` and `mintBraid` records `minted.namedBy`, so the mechanism is
  built and unreached — the L1 lens (built-never-reached) from RUNNING_FIXES, on a line of copy that
  promises the player an action the build never gave them.
- **The default is backwards.** `namedBy` currently resolves `player → gm → auto`, and with the model
  path unbuilt every braid lands on `auto` — the `A × B` concatenation Erik saw. Erik does not want to
  name it. He wants to be *given* a name and to be able to overrule it.

**OUTCOME WANTED:** minting produces a **GM-authored name by default** — evocative, in the tradition's
idiom, of the *fused* craft rather than its ingredients (Erik's own worked example for
deathsense × order_sense: *"Perfect Inevitability"*). The `A × B` concatenation is the failure fallback
only, never the shipped result of a successful mint. The player gets an obvious, optional rename — one
control, reachable from wherever the braid is shown, and taking it or leaving it are both one action.

Copy that promises an action must not ship ahead of the control that performs it. If the rename affordance
is not in the same build as the tooltip, the tooltip line comes out.

## §3 — The mint is a MOMENT, and the surface should know it

Right now a braid arrives the way a backfill arrives: it appears in the ability list with a chip. Erik
earned this one across **40 co-activations** and the game said nothing.

**OUTCOME WANTED:** the mint has its own beat, distinct from a list refresh — the two parent crafts
named, what they became, the new name, the thing it can now do that neither could. Reachable again later
(a braid is part of the character's story; the Saga/chronicle is the natural home). The bar is Erik's:
*a player should say HOLY SHIT that's COOL.* If the beat reads like a system notification, it has failed
even if every field is populated.

⚠️ **Backfilled braids are in the same boat.** Silas's two arrived via reconcile v14 with stub text and
no moment. Whatever enrichment lands must reach the already-minted ones — a player should not be able to
tell which of their braids the engine built before the good version existed.

## §4 — Where the model authors, and where it must not

Per the standing shape (SNG-193b §4b, and Erik's direction on every engine this batch):
**the ENGINE computes room; the model never judges.**

| The model authors | The engine decides |
|---|---|
| name · description · tree-rank names · grants/cannot prose · the emergent-capability *flavour* | mintability · tier · maxRank · levelReq · energyCost · harmRung · which function is added and whether it is legal |

A model-suggested capability that is not in the 24-verb vocabulary is **rejected, not accepted-and-logged**.
SNG-192 Phase C's test — assert every authored `coreFunction` against the real vocabulary so a typo fails
the build — is the pattern to copy here. Three wrong-premise builds were caught by verify-before-build in
this batch; this is the same gate, on generated rather than authored content.

## §5 — VERIFY BEFORE BUILDING (do not take these from me)

1. **The "Tier V" badge.** Erik's tooltip reads *Tier V* on a braid whose parents are both at rank 1.
   `braidTier` returns `tier = maxRank`, hard-capped at **3** (`:56–57`), and the def carries no top-level
   `tier` — only `minted.tier`. So the badge is being computed somewhere else, from something else. **Find
   what the badge actually reads before changing anything.** Erik is not objecting to a high tier; he was
   surprised by it, and a number nobody can source is a defect whatever its value.
   *(Aevi note: I did not chase this to ground. I am flagging it, not diagnosing it.)*
2. **Energy.** The same tooltip shows *5 energy to use (base 10)*. `energyCost = 4 + tier*2` gives **6** at
   tier 1, **10** at tier 3. So either the mint saw rank-3 parents, or the display and the def disagree.
   Same instruction: measure it before ranking it.
3. **The Double Register is not in the abilities corpus** — CCode's SNG-196 finding, and it was mine that
   claimed otherwise in an earlier spec. The retraction stands. Nothing here should be built on an
   assumption that an authored recipe exists for any braid.

## GUARDS

- **The floor is the union; the ceiling is the braid's own.** Never less than both parents. Always
  something neither had.
- **Never a halted mint.** SNG-196's stub-on-failure discipline holds — if generation fails or returns
  invalid, the braid still mints playable. The stub is the safety net, not the product.
- **Idempotent.** Re-running enrichment on an already-enriched braid is a no-op; re-running on a stub
  upgrades it. Player-chosen names are never overwritten by a later pass.
- **`fullCatalog` resolution stays intact** — enrichment changes the def's *text and reach*, not where it
  lives or how it is found.

## OPEN QUESTIONS — CCODE ROUND 2

1. Emergent capability: added **function**, **effectTag**, or **tree-rank grant**? Which is cheapest to make
   real everywhere the ability is consumed, rather than real only in the description?
2. Enrichment timing — at mint, or lazily on first view? (Mint is the moment; lazy is cheaper and survives a
   model outage. If lazy, the *moment* still has to fire at mint.)
3. Does the rename control belong on the ability card, the mint beat, or both?
4. Backfilled braids: enrich in place on next load, or offer the player the moment they never got?
