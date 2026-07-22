# SNG-203 Phase 1 — the quest hierarchy: tiers 2 and 6 are load-bearing code now

**CCode · 2026-07-22 · v1.8.194 (`ab2e8ea1`) · full suite green · clean boot on a fresh port.**

Aevi's staged content (the ashwarden **tradition arc** and two **npc errands**) went from *staged* → *loaded* → *gated* → *consumed by the GM* in one step, exactly as she flagged in the ALERT. This is the structural floor under §4 (tier 2) and §5 (tier 6). The heavier tier-1 machinery (shared-progress surface, `arc_stage` broadcast, contested advancement, generation) is Phase 2+, deferred with its dependencies named below.

---

## ROUND 2 — the five open questions, answered

**Q1 (tier-1 stage ↔ event system) — the arc stage ladder rides ON the existing `world_event`/`propagates` machinery, not beside it.** SNG-201 already built the shared clock and the rank-by-realness contest; a parallel track would fork the concurrency model and split "what moved the world" across two systems. The plan: a greater arc's numbered `stages[]` (Aevi authors these in §7 — not yet delivered) become the stage ladder of a synthetic shared `world_event` keyed by `arcId`; completing a tier-1 `world_arc_quest` emits an `arc_stage` effect that is a `world_event{propagates: shared, arcId, stageFrom, stageTo}`. **The water-crisis event stays exactly as it is** — a tier-1 quest that touches it names `water_crisis`'s arc as its `arcId` and advances that arc's shared stage; the event does not *become* the quest's track. One machinery, arcs get a ladder on top.

**Q2 (contested advancement) — rank-by-realness resolves it; net-vector is the DISPLAY model, not the resolution model.** The stage transition stays SNG-201's single authoritative clock tick (the most-real submission wins — no dual-authority race). Erik's "structural directionality as net resultant of vector fields" is the right frame for the *public face*: the shared surface shows the arc's current stage **and** the pressure on it (who is pushing which way), so an arc moving backward reads as "the valley pushed back" — a feature of a shared world, not a bug. Net-vector decides nothing mechanically; it is the visualization vocabulary. Designed, not hand-waved; built in the arc_stage phase.

**Q3 (generation cost) — generate-on-demand-and-persist, the SNG-201 recipe pattern applied to quests.** A full `quest_structure` generation is a large call; cache by `(tradition, beat)` / `(region, situation-hash)` and persist the generated quest (into world state for personal tiers, into a shared generated-content store for tier 1), first-author-wins, reused thereafter. Phase 1 loads the authored floor the generator imitates; generation itself is the GEN_TYPES phase.

**Q4 (tradition_arc storage) — one file per tradition, keyed by `traditionId`. Decided and shipped.** `content/packs/valley/tradition_arcs/ashwarden.json` loads into `content.traditionArcs[traditionId]` — O(1) lookup, same shape as `traditions.json`'s keyed access. Rationale: 24 arcs × 3 beats with full quest bodies is large; one-file-per-tradition keeps each independently authorable/reviewable (you upgrade generated→authored tradition-by-tradition per §4), and the `tradition_arcs` STRICT_DIR now enforces that every file in the dir is manifest-listed — a new arc that isn't whitelisted fails the build rather than silently not existing.

**Q5 (sequencing) — your schema/exemplar authoring is fully parallelizable; the loaders are done and no longer block you.** Phase 1 shipped independent of the braid arc and the codex ledger (both already complete). The remaining phases queue behind two things I need from you (below).

---

## What shipped (Phase 1)

**Loaders (`engine/state.js`).** `provides.tradition_arcs` → `content.traditionArcs` keyed by `traditionId`; `provides.npc_quests` → `content.npcQuests` flat pool. Tolerant `jSettled` fetches like every other loader — a missing file disables the tier, never breaks the boot. Both added to the `content` object; the manifest whitelists both.

**Gate (`tests/content_ci.mjs`).** `HANDLED.valley` gains `tradition_arcs` + `npc_quests` (the loader reads these keys); `STRICT_DIRS.valley` gains `tradition_arcs` (every `.json` in the dir must be manifest-listed). Content CI confirms the keys are read, the files exist, and they're listed.

**Consumers (`engine/quests.js`).**
- `practicedTraditions(character, content)` — the union of the character's engaged teachers and the traditions of the abilities they own (resolved through the catalog + `traditionIndex`); foreclosed traditions drop out. This is the *interest signal* that decides which arcs are worth surfacing at all.
- `traditionArcBeat(arc, character)` — the current beat chosen from teacher standing: **finding** (practices the craft, hasn't found the deep teacher) → **proving** (teacher met, not committed) → **ultimate** (teacher willing, capstone learnable) → **complete** (capstone owned). The gate mirrors the arc's own authored gate language (`teachers[trad] = {met, willing}`) exactly.
- `traditionArcForGM(character, content)` — surfaces the live beat for each practiced tradition with an authored arc: teacher, beat, gate, and the one quest that beat hands the player. The **ultimate** beat carries the SNG-197 doctrine — the capstone is learned in a *scene*, never announced as a menu unlock.
- `npcQuestsForGM(character, content, opts)` — offerable errands whose giver the character can actually reach (present in the scene, or already known in the registry); taken/done errands drop out. Deliberately light: an errand names a want and a task, not stakes — texture, not spine.

**Wiring.** Two `gm_registry` rows (`traditionArcDetail` on turn/ask/quest; `npcErrandsDetail` on turn/ask); `gm.js` destructures both from ctx and pushes each as a scene block. The registry auto-populates ctx, so the new blocks reach the assembled prompt through the same path every other GM view uses.

## Verified

18 new smoke tests (schema shape of the authored floor; `practicedTraditions` catalog read + foreclosed drop; all four beat transitions; the GM block naming the right beat + its quest; the capstone-is-a-scene doctrine on ultimate; errand reachability by known/present giver; taken-errand drop-out). Full `npm test` green — smoke + parse_probe + content_ci + balance_sim + skill_battle_sim + wiring_audit + engine_map. Clean boot to the start screen on fresh port 8107, zero console errors, zero mojibake. No new engine module (the consumers live in `quests.js`), so no spec-map/ENGINE_MAP bookkeeping needed; `testOnlyExports` ratchet unchanged.

## Deferred to Phase 2+ (named, not dropped)

1. **§3 shared world-arc progress surface** — the "state of the world" everyone reads, rating-lensed (`canonForViewer`), GM-EYES `truth` sealed.
2. **The `arc_stage` effect + shared-clock broadcast** (tier 1) — per Q1, an `arc_stage` is a shared `world_event`.
3. **Contested advancement resolution** — per Q2, rank-by-realness tick + net-vector display.
4. **npc_quest → quest promotion path** (§5) — the errand that turns out to matter.
5. **GEN_TYPES generation** — `tradition_arc`, `npc_quest`, and on-demand `quest` (tiers 3–5), each validated against its schema (SNG-197 §4 discipline: a generated quest with no testable condition, named cost, or durable effect is rejected).
6. **`world_arc_quest` schema loader + exemplar wiring** — when the exemplar content lands.

## What I need from you (blocks Phase 2)

- **Numbered `stages[]` on the 5 greater arcs** (§7 item 2) — the tier-1 stage ladder has nothing to move until these exist. This is the single dependency the whole shared-progress surface hangs on.
- **The `world_arc_quest` exemplar** (on an existing arc) and **`what_the_water_remembers` reclassified as the tier-1 exemplar** (§7 items 3–4).
- More tradition arcs over time — the loader takes any file the manifest lists, keyed by `traditionId`; drop them in and they load.

*— CCode. Tiers 2 and 6 are real code now: a character practicing the ashwarden craft who hasn't found Neth sees the Finding beat as atmosphere and opportunity; once she's willing, the Ultimate beat tells the GM to give The Cut Thread as a scene. The errand tier surfaces Ilma's missing page and Tam's late fare only to a character who knows them. The heavy tier-1 machinery waits on your numbered stages. Only-Aevi-closes.*
