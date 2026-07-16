# Results — SNG-101b: Native-grants-at-creation

Date: 2026-07-15 · HEAD `4627783` · **v1.8.74** · `npm test` green · fresh-port + end-to-end (real Silas save) verified. Status: **shipped, complete_pending_review.**

Completes SNG-101's deferred native-grant piece, now unblocked by the classification pass. A character is granted their **primary tradition's** basic natives by right of being what they are — the starter kit — and existing characters are backfilled once. Built after a ROUND-2 that answered all three open questions.

## ROUND-2 answers
1. **Content home:** a new manifest-registered `content/packs/core/rules/native_grants.json` (442 lines, 27 traditions) — too large for `resolution.json`, and the loader now resolves rules by NAME (SNG-092-safe) so adding one is clean. Its two keys (`traditionNativeGrants`, `grantCap`) are merged **into the rules bag** at load so `nativeGrantIdsFor(character, rules)` reads them directly.
2. **Creation hook:** `app.js` character finalize (where `domains.primary` + `attributes` are both set, beside `grantsVersion = 1`).
3. **Versioning collision:** resolved with a **distinct `nativeGrantsVersion` flag** — `retroLevelGrants` owns `grantsVersion` (gates `>= 1`); the native retro gates its own `nativeGrantsVersion >= 1`, so the two never collide. (Also: named the function `nativeGrantIdsFor` because `nativeGrantsFor` was already taken in skilltree.js with a different, catalog-based signature.)

## What shipped
- **`engine/progression.js`**
  - `nativeGrantIdsFor(character, rules)` — anchors (always) + Tier-II basics matching the build lean (highest of `mental/physical/practical/social`, **filling from the mental caster-spine** when the lean pool is thin), capped at `grantCap`. Primary tradition via `domains.primary` (SNG-094-authoritative), legacy fallback only if domains absent. Pure.
  - `applyNativeGrants(character, rules)` — grants MISSING basics at rank 1. **Law 14: only adds** — never lowers an owned rank, never removes; idempotent.
  - `retroNativeGrants(character, rules)` — one-time, `nativeGrantsVersion`-gated, Law-14-safe.
- **`engine/state.js`** — loads `native_grants.json` via the existing `loadRule` pattern; merges `traditionNativeGrants` + `grantCap` into `rules`.
- **`app.js`** — `applyNativeGrants` at creation finalize (+ `nativeGrantsVersion = 1`); `retroNativeGrants` in the **load path** (beside `retroLevelGrants`) so the backfill runs on every load and **survives the sync-clobber** that ate the earlier hand-correction. A one-time login note names the granted basics.
- **`tests/content_ci.mjs`** — validates every grant ability id is real (191 refs across 27 traditions) + every tradition key has abilities + grantCap sane + each tradition declares an anchor. A typo would grant a phantom; CI catches it.
- **`tests/smoke.mjs`** — 10 tests (mental-lean caster spine; practical-lean fills from mental + caps at 5; keys off `domains.primary` not a stale `nativeTradition`; adds-missing-at-rank-1; Law-14 keeps earned ranks; idempotent; retro one-time + distinct flag; no-primary grants nothing).

## The Silas fix (the ask behind this ticket)
The earlier Aevi hand-correction that added Silas's ashwarden basics (`ede3b05`) was **clobbered the very next save** (`1cd0cbb`) — the SyncStaleLocalOverwrite pattern: a client push of a stale localStorage copy reverted the repo. SNG-101b makes the grant **client-side and versioned**, so it re-applies on load and persists.

**Verified end-to-end against Silas's real save, through the actually-loaded rules** (`characters/player-s9z9u1/char-mrhs8286.json`):
- Keys off `domains.primary: ashwarden` (Erik confirmed native ashwarden — the `nativeTradition/origin: wright` is his lived Wright backstory, correctly NOT the grant source).
- By-right set (practical lean 5): `deathsense, wither, palework, the_grey_hand, the_grey_road` (capped 5).
- **Grants the 3 he was missing:** `wither, the_grey_hand, the_grey_road` at rank 1.
- Law 14 holds: `deathsense` stays r3, `palework` stays r2; `order_sense`/`shadowstep`/`the-attended-end` untouched.
- `nativeGrantsVersion = 1` → won't re-run.

**Erik will see this land when he next loads Silas on v1.8.74** (in his own client, so it persists). Note: the computed model gives him **`wither`** (his practical lean) where Aevi's hand-pick had `the_dread` (social); both are valid ashwarden basics — the data-driven model picks by his highest attribute. If he wants `the_dread` specifically, it's a normal learn, or a one-line content nudge.

## Guards / notes
- **Foundation, not tree:** `grantCap = 5` keeps the grant a starter kit; skill points still buy the rest of the tradition.
- **Primary only:** secondary/tertiary basics stay learned/earned (consistent with the domain-access ceilings).
- Independent of SNG-098. Does not re-open promotion/acquisition/foreclosure (those shipped in the domain arc).

## Files
`content/packs/core/rules/native_grants.json` (new) · `content/packs/core/manifest.json` · `engine/state.js` · `engine/progression.js` · `app.js` · `tests/content_ci.mjs` · `tests/smoke.mjs` · `index.html`.
