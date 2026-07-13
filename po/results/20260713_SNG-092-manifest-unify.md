# Results — SNG-092 (unify content loading through the manifest — fixed a LIVE break)

Date: 2026-07-13 · v1.8.49 · npm test green · live-verified (fresh manifest). Status: **shipped, complete_pending_review.**

Erik registered every core rules file in `provides.rules` (his half). The manifest note named the owed half: *"state.js ALSO fetches several of these by HARDCODED PATH… TWO loading mechanisms, and the manifest is not the source of truth. [CCODE: unify — read rules from provides.rules; delete the hardcoded fetches.] And the Content CI did NOT catch this because it checks the VALLEY manifest, not CORE."*

## The live break
Registering all the rules pushed `resolution.json` off `provides.rules[0]` (it's now `attribute_gates.json`, alphabetical). The loader read the **main rules object positionally** — `fetchJSON(provides.rules[0])` — so `rules` silently became `attribute_gates.json`: **no `baseChance`, `d100`, or `energy`**. Confirmed the **live deployed manifest already has `rules[0] = attribute_gates.json`**, so v1.8.48 is broken in production right now. This fix repairs it.

## What shipped
- **`state.js` — one loading mechanism.** `rulePath(name)` finds a core rules file by its distinctive stem in `provides.rules`; `loadRule(name, fallback)` fetches it. The **main rules resolves by name** (`rulePath("resolution")`), never `rules[0]` — array order can never break it again. **Deleted every hardcoded fetch** — `origins`, `backgrounds`, `regions`, `the_accords` now go through the manifest (they were bypassing it). The inline `.find()` blocks collapsed into `loadRule`.
- **Registered the 4 orphaned `reach_*` ability files** (`concrete_abstract`, `demonic_angelic`, `space_time`, `destruction_creation`) — valid, authored, and already referenced by the loaded Accords (broken links otherwise). +20 abilities; **6/7 Accord crafts now tag** (only the unauthored `the_raised_thing` remains). This closes the SNG-089 boundary.
- **Content CI — now checks core.** Added `core: ["rules", "abilities"]` to `STRICT_DIRS`: every `core/rules` and `core/abilities` file must be in `provides.*`. Would have caught both the `rules[0]` shuffle's blast radius and the 4 unloaded ability files. (It previously strict-checked the valley manifest only.)

## Verification (live, fresh manifest)
`loadContent()` → `rules.baseChance/d100/energy` present · origins **27** · backgrounds **40** · regions **25** · accords loaded · **6/7 Accord crafts tag** · **142** abilities. npm test green (core strict-dir + notFor-LAW now scan the newly-registered files, clean).

## spec_boundaries / note
- **Stale-content caching (pre-existing, surfaced here):** content files (`manifest.json`, rules) are fetched without a version param, so a returning player running new `app.js` against a browser-cached OLD manifest gets degraded content (empty origins/helpText) until the cache TTL. Not introduced by this change; the name-based loader degrades gracefully (fallbacks) rather than breaking. Worth a follow-on: cache-bust the manifest by `APP_VERSION` so code and content freshness stay in lockstep. (This is also what made local verification need a forced revalidation.)
- `the_substrate.json` is registered but still not *loaded* by the engine — correct; that's the SNG-090 build, blocked on the Round-2 amendment.
