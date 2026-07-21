# Session handoff → Aevi (PO)

**CCode · 2026-07-20/21 · a long build session, ~11 ships, all green + `complete_pending_review` (SNG-193b already CLOSED by you).** Written so you can talk it through with Erik and spec the next session. Everything below is at HEAD; each ship has its own `po/results/` doc with the detail.

---

## 1. What shipped

| ticket | what | version | status |
|---|---|---|---|
| SNG-191 §7 follow-ons | the third arc fate (`handled`) + §7.4 seasonal pressure | v1.8.171 | pending review |
| **SNG-193b** | schools wiring — band reads the SCHOOL not the tradition (one seam) | v1.8.172 | **CLOSED GREEN (you)** |
| SNG-194 | the GM offers — `roomForAnOffer`, the engine decides, a countable `offer` op; fears surfaced | v1.8.173 | pending review |
| SNG-195 | the prompt-review audit (5 columns × every engine, both directions) | — (audit) | pending review |
| SNG-195 G3 + G5 | outcome-badge display drift + all 31 missing engine purpose lines (ENGINE_MAP 59/59) | v1.8.174 | pending review |
| SNG-195 G2 | teacher initiative (`roomForATeacherOffer`) + `reactsToReputation` wired to the offer | v1.8.175 | pending review |
| SNG-195 G4 | contract cleanup — the salvage↔contract asymmetry + legacy aliases | v1.8.176 | pending review |
| SNG-192 A | grants-first + suggestions with reasons (the wasted-pick fix) | v1.8.177 | pending review |
| SNG-192 B | robustness readouts — coverage, power-source common-ground window, braid framing | v1.8.178 | pending review |
| SNG-192 C | the archetype picker (loaded the orphan; a lens, not a class) — **SNG-192 complete** | v1.8.179 | pending review |
| SNG-196 | the generative braid engine — co-activation EARNS a full-schema minted craft; Silas backfill | v1.8.180 | pending review |
| SNG-197 part 1 | braid ceiling doctrine + Tier-V badge fixes (you verified these) | v1.8.181 | pending review |

**All SNG-195 audit G-fixes are done (G2/G3/G4/G5).** SNG-192 is complete (A/B/C). SNG-196 shipped and SNG-197 part-1 landed.

---

## 2. Findings you should carry into speccing (the verify-before-build ones)

Three of your data-shape premises were inferred from partial reads and turned out different on inspection — each caught before building on it, each reported. This is the pattern to keep leaning on:

1. **`gains` is not function-coverage data.** It has exactly two values across 779 nodes — `broaden`/`deepen`, a rank-progression axis, not the 24-verb vocabulary. The G1 "wire gains to §5 coverage" ruling was inferred from the one-word sample `broaden`. Not wired. §5 uses `ability.functions` via the existing `functionCoverage`.
2. **`reactsToReputation` keys are author-chosen, not a fixed taxonomy** (adept_sona: `balanced/extreme/seeking`; brann: `kind/threatening/honest`). No classifier exists — which is *why* it was never wired. So the whole map is surfaced and the **GM selects**, never computes a key. Wired to the offer (G2, the G1 ⭐).
3. **The firing panel was already instrumented** — `opsFiredIn → _opEmitted`, not `logOpOutcome` — so the "31 uncounted ops" scare was stale. You accepted the correction. The only real fix was the 1-line `OUTCOME_INSTRUMENTED` display set (G3).
4. **The braid corpus is nearly empty** (SNG-196 diagnostic): 3 emergence recipes + 6 combination abilities, all prose-only, none for played crafts; **the "Double Register" is not in the abilities corpus** despite an earlier spec claiming it was. This is *why* Silas had 40 co-activations and 0 braids. SNG-196 fixed it by making minting generative (no authored recipe required).

---

## 3. The braid feature — where it stands, and the open design (the live front)

This is the active work and where Erik put the most energy. Current state:

- **SNG-196 (shipped):** `engine/braids.js` mints a full-schema braid from a co-activated pairing past `BRAID_RIPEN_AT` (5), into `customAbilities` (so `fullCatalog` resolves it everywhere). Tier scales with power. Reconcile v14 backfilled Silas's two: `order_sense+palework` and `deathsense+order_sense` (the Double Register), as playable stubs.
- **SNG-197 part 1 (shipped, you verified):** fixed the ceiling doctrine (union is the FLOOR, an emergent function the braid's own CEILING; `notFor` drawn around the braid) and the Tier-V badge (`tierOf(levelReq)`, not `minted.tier`; `levelReq==tier==maxRank+1`, sourceable). `minted.enriched` flag added to drive re-presenting stubs. **⚠ the emergent-function vocab validation is currently a comment, not code — part 2 owns making it real** (validate the model's verb against the 24-verb vocab, reject a hallucination, per your §4 + the SNG-192 Phase C gate pattern).

**SNG-197 part 2 (NOT built) — the rich half + Erik's live decisions:**

Erik played v1.8.181 and gave direction that grows this into a multi-part feature. His decisions, recorded from this session:

1. **Rich generation** (my "remaining item 1"): a `generate.js` "braid" type — the model authors the **name** (his worked example for deathsense × order_sense: *"Perfect Inevitability"*), description, tree-rank prose, and the emergent-capability flavour. `A × B` is the failure fallback only; a successful mint is GM-named, player-overridable. **My Round-2 answers:** emergent capability = an added **function** (cheapest to make real everywhere, vs an effectTag/tree-grant that's real only in prose) validated vs the vocab; enrich **at mint** (the moment fires there), backfilled stubs enrich lazily on next load; rename control on **both** the mint beat and the ability card; **backfilled braids get the moment they never got** on next load (re-present, don't silently upgrade).
2. **The mint is a MOMENT** — a distinct "holy shit that's cool" beat (parents named, what they became, the new name + the new capability), reachable later (chronicle). Not a list refresh.
3. **⭐ Shared recipes (Erik's new requirement, decided this session):** *"once found, they become recipes for other players — keeps things from duplicating."* Decision captured: **global, first-finder authors the name/def**, rides the existing **shared-canon sync** (`canon.js` / `syncSharedCanon`), later finders of the same pairing **adopt** it (no duplicate), collisions resolve by the **canon rank-by-realness** already built. The `emergence_recipes` format is the natural recipe shape. This is architecturally clean (the infra exists) but touches the sync layer — worth a spec paragraph.
4. **⭐⭐ Braids on the wheel by COORDINATE, not a spoke (Erik's vision — needs your spec):** braids positioned *between* the two axes they braid — and the bigger idea underneath: **any skill placed on the wheel by its composition.** A mostly-death craft that adopts order sits near the death axis, *rotated toward order*; a pure-tradition craft stays on its axis. **This is where schools show up** (a school shifts the placement), and it doubles as the skill-tree view (click a tradition → highlight everything related). Plus braids also want an ability-list category.

   **This last one is a real geometry feature that ties braids + schools + skill-trees together.** It is not a tail-of-session add. **My recommendation: you spec the wheel-coordinate placement properly** (the blended-angle math from an ability's axis-weights, where schools enter, the click-to-highlight interaction) so it lands right the first time. Everything else can proceed on the build order below.

**Build order I'd suggest for the braid feature:** rich generation (#1, prerequisite — you share/display the rich def, not the stub) → shared-recipe dedup (#3) → braids as an ability-list category (quick) → the wheel-coordinate placement (#4, your spec).

---

## 4. Untouched specs — awaiting ROUND 2, with my preliminary reads

You pushed two more I did not build (Erik prioritized the braid). Both are sound; my leanings on the open questions:

- **SNG-198 (the world turns):** merge-or-extend — I lean **extend with a shared advance-primitive**, keeping Path A's delegated contract distinct (the player *asked* for that). Progress shape — reuse the proven `progress|stall|problem|done` per figure (simplest thing tick N+1 can read). Population — met NPCs first, then epic via `legends.js`'s existing `minGapDays` governor (never invent a third pacing system); "heard-of" needs a marker that doesn't exist yet, so it's the last tier. **The core is real: Path B's `{entityId, note}` schema has no field for state — the `wantProgress` counter from SNG-021 was specced and never built.**
- **SNG-199 (one person, one codex):** the four line-numbered defects are unambiguous — `prettifyNpcName` is a slug-prettifier standing where a validator should be (raw `.slice`, not `smartClamp`, on the name field); `findExistingNpc` never reads the `aliases` the module carefully maintains; `npcs.js` never calls `applyCodexUpdates` (so the codex records what happened while away, not who you met); codex search doesn't filter the sections above the topic list. Relational resolution (mother/father from backstory) and player-conferred names (Ama Dreya) are the two that need new structure. **SNG-199 Q5 is the one to answer first: SNG-197/198/199 + SNG-134 all touch the codex/ability ledger — sequence them before any build.**

---

## 5. Housekeeping / flags

- Every ship: suite green by exit code, ratchets flat, ENGINE_MAP regenerated, SYSTEM_SPEC counts kept honest (now 60 engine modules · 32 rules). Every creation-flow UI ship (192 A/B/C) is engine-tested + source-verified but the **gated creation visual is Erik's real-save test** — the known bare-module stale-cache makes the preview boot into the CCODE-08 watchdog; served files verified correct each time.
- `personality` (40 NPCs) is CUT per your G1 ruling (redundant with `voiceHints`) — untouched, no churn.
- The SNG-192 §6b/§6c power-source math matches your own table on live content (ashwarden+rootkin+somatic = 0.00–0.56; ashwarden+enginewright = none).

*— CCode. The batch closed a lot of L2 permission-isn't-initiative shapes (offers, teachers, the codex-to-come) and one whole L4 hole (the braid corpus). The braid is the live thread: engine + doctrine are done and verified; the rich half, the shared recipe, and the wheel are yours to sequence. I'll pick it up next session with the four part-2 answers locked.*
