# Results — SNG-BATCH-9 (Generative living world) · Phase 3 — The shared world

Date: 2026-07-11 · Shipped v1.8.2 · Suite green (674 checks, +22 over Phase 2) + parse_probe · boots clean on a fresh port (module graph resolves; no missing-export). Status: **shipped, awaiting Erik preview-legs before complete_pending_review**. Only Aevi closes.

**The last third of the anchor.** Phase 1 grew a personal world; Phase 2 made it move between visits; Phase 3 makes it **shared** — the entities a player grew real enough EARN their way into a world-wide canon the whole family reads, and each player receives that world **through their own content ceiling**. Pure composition on the store the earlier phases built promotable from day one (provenance + birth-weight + engagement/tier + rating-tag were all already stamped). Aevi owed no content.

New engine module: **`engine/canon.js`** — fully pure + headless-testable. The sync orchestration lives in `worldtick.js`; the LLM re-narration is injectable. Nothing in `canon.js` calls an LLM or fabricates — it composes state stamped at birth.

## Part 1 — EARNED auto-promotion
- **The gate IS the threshold — no human curator.** `promotionCandidates(character)` = nominated-tier records (the engagement governor already raised them; Phase-2 `nominationsFor` surfaces exactly these) whose `effectiveWeight` clears the floor and that haven't landed yet.
- **The shared-canon store** lives at `world/canon/{region}.json`: `{ entities: {canonical, by id}, variants: [lost-a-contest records] }`. A promoted record is authored-shape at top level (indistinguishable downstream, same as the local store) + a `_canon` envelope carrying `weight / rating / tier / provenance / promotedWorldDay`. The private `_gen` sidecar is dropped — engagement is the origin player's frame.
- **Idempotent:** a landed record is stamped `_gen.promotedWorldDay` locally, so it never re-promotes.

## Part 2 — CONTRADICTION → RANK (not reject)
- A promoting entity colliding with existing canon (collision detection reuses the SNG-019 `namesMatch` primitive against **shared canon + authored core content**) fires a **weighted opposed roll**: `P(incoming wins) = wIn / (wIn + wExisting)`, each side's realness = `effectiveWeight`.
- **Authored core sits at a high weight floor (100)** — a generated challenger (weight ~1–30) out-rolls it only rarely, so the **designed spine stays stable**. A collision is *contended*, never a silent overwrite.
- **Winner = loud canonical reality; loser → a persisting variant/rumor** (filed in `store.variants` with a `rivalId` pointer). It stays discoverable and contestable later — nothing is rejected or deleted.
- **Concurrency:** `sync.js pushMergedFile` (new) is read-merge-write-retry; the contest re-runs against the **freshly-read remote inside the merge callback**, so two players promoting at once never clobber — the loser's write re-contests against the winner's. `mergeCanonStores` is the deterministic race-reconciler (higher realness holds canonical, other → variant).

## Part 3 — RATING-LENS on the shared world (the family-safety mechanism)
- Shared canon is a **superset**; each player receives the subset **at/below their `ratingLevel(profile)`** vs each entity's `_canon.rating`. `lensDecision` → `show | adapt | filter`:
  - **at/below ceiling → show** as-is.
  - **above ceiling, can dial down (violence/gore/dread/language) → adapt:** `adaptView` neutralizes the above-ceiling intensity in the record's defining fields and tags the view (`_lens`), always-available with **no LLM dependency**; an injected re-narration can enrich it. Adaptation only ever dials **DOWN**, so no floor is re-crossed.
  - **above ceiling, cannot dial down (sexual — no in-ceiling analog for a G/PG audience) → filter:** absent.
- **THE FLOORS stay ABSOLUTE.** A **minor viewer** never gets gore or sexual content softened into view — it's a **hard exclude, never a softening** (`viewerIsMinor` → filter on hard-intensity markers). This is the non-negotiable from the build plan. Combined with the birth-validator floors (a minor is never romantic/sexual in the stored entity), Erik's R+, Courtney's G, and a minor's G coexist in ONE shared world.
- `canonForViewer(store, profile)` resolves the whole superset for a viewer (filtered/adapted), bounded. Wired into the GM as a **SHARED WORLD CANON** block (`gm.js`) that honors the register — a `[dialed to your ceiling]` line must not be sharpened back up; a `rumored` (variant) entity is spoken as hearsay. Visible canonical entities from other players hydrate into the live CONTENT maps so they're revisitable (authored + local content win any id clash).

## Erik preview tests (Phase 3, live on v1.8.2)
*Phase 3's cross-player payoff needs GitHub sync configured on **two** profiles (Settings → shared repo). Without sync it's a clean no-op — solo play is unchanged.*
1. **Earned promotion:** "On one profile, ⭐-Keep a grown NPC/place until it's ★ Notable, then keep playing. On a SECOND profile (same shared repo), that figure now shows up as part of the wider world." (The store: `world/canon/valley.json` in the repo gains the entity.)
2. **Rating-lens:** "Set one profile to G (or a minor profile, capped at PG-13) and one to R+. A harsh figure promoted from the R+ profile shows up **softened** for the G player — and anything sexual simply **isn't there** for them. The R+ player sees it in full."
3. **Contradiction:** "If two players each grow a same-named place, one becomes the canonical version and the other persists as a rumored variant — the designed/authored world is never overwritten."

## Guardrails held
Design law 1 (engine owns promotion/collision/ranking/filtering; the LLM re-narration is injected and optional; nothing fabricates — it composes birth-stamped state). Governor/weight-gated (only nominated-tier promotes). Floors absolute through the lens (minor-protection is a hard exclude, never a softening; adaptation only dials down). Additive schemas (`_canon` envelope, `world/canon/{region}.json`, `ws.lastCanonWorldDay`, `_gen.promotedWorldDay`) — backward-safe; a pre-Phase-3 save gains nothing until it grows a nominee. Concurrency-safe (owned-merge-retry like the ledger/region; the contest re-runs against fresh remote). Never halts a turn / never throws (every path returns a usable value; sync failures log). Reused `nominationsFor` / `effectiveWeight` / `namesMatch` / `ratingLevel` — composed, not reinvented. Never touched the ErikIAm pipeline.

## Verification
- `node tests/smoke.mjs` — **674 checks green** (+22): promotion candidacy + idempotence; canon-record shape; empty-store landing; the weighted opposed roll (realness decides; authored spine at 100 nearly always holds); authored-collision → variant; strong-challenger → canonical with loser→variant; concurrency merge; and the full rating-lens (show/adapt/filter, unrated-never-gated, minor hard-exclude, top-ceiling sees all, adaptView dials down + tags).
- `node tests/parse_probe.mjs` — green.
- **Boots clean on a fresh port** (`python -m http.server 8322`): v1.8.2 renders, no console errors — the new `canon.js` import + `syncSharedCanon` wiring + `pushMergedFile` all resolve. (Fresh port sidesteps the long-lived preview tab's known stale internal-module cache.)

## spec_boundaries
- **Adaptive re-narration ships as the pure `adaptView`** (deterministic neutralization + tag) so the family-safety mechanism is complete and testable with no API dependency. The spec's "a call per entity" LLM re-render is wired as an **injectable `adaptFn`** hook but not called per-tick by default (cost + determinism). Enriching adapted views with a live re-narration call (cached per entity×ceiling) is a clean follow-on — the seam is in place (`canonForViewer({ adaptFn })`).
- **"Cannot dial down → generator substitutes in-ceiling":** Phase 3 ships the safe half — above-ceiling non-adaptable content is **filtered absent**. Generating an in-ceiling *replacement* at view time (an LLM mint per filtered entity) is deferred as a follow-on; FILTER (hard absent) is the correct, safe default for family safety and is what shipped.

## Where the anchor stands
- **BATCH-9 Phase 1** (generate + governor + rating/floors) + **SNG-041** (one clock) + **Phase 2** (living advancement) + **Phase 3** (shared world) — the full generative anchor is shipped, all awaiting Erik's legs.
- **SNG-042 Legends & Villains** now rides a complete path: anchors authored (`legends.json`), high-birth-weight legends generate + recur (Phase 1), move offscreen (Phase 2), and **promote into shared canon + respect the rating-lens (Phase 3)**. A follow-on build, no longer blocked.
