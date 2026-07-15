# CCode Review — SNG-101 (Domain Promotion) + SNG-102 (Domain Acquisition), ROUND 2

Reviewer: Claude Code · 2026-07-14 · HEAD `bb36b5a` (v1.8.60). Reviewed as a dependent pair (102 depends on 101).
Verdict: **the design is sound and largely additive — but both specs rest on a standing-bar that isn't wired, and SNG-101 §2's data model is a breaking type change that contradicts its own "additive, never removes" claim. Fix those two and it's buildable.** One combined review; the two specs share every foundation.

The geometry is right, the philosophy-as-mechanic (endgame falls out of foreclosure, no collect-all rule) is elegant and correct, and the Law-9 offer-vs-commit split matches the `markDefiningMoment` pattern I shipped this session. The gaps are all in the substrate the specs assume is already there.

---

## 🔴 SHARED FOUNDATION — both specs assume machinery that doesn't exist at HEAD

### F1 — The `accessGates` standing bar both specs "reuse verbatim" is authored-but-UNWIRED
Both specs lean on *"greatness is taught, not bought — the standing is the price,"* citing `accessGates.capstones` (SNG-049/050) as live. It is **content only.** `accessGates` (traditions.json:13–19: `teacherOrTome`, `capstones`) is **read by no engine code.** `domainAccess` (traditions.js:81–111) enforces station / tier-ceiling / closed-opposite and **nothing else** — it never checks a teacher, reputation, or capstone standing. `standingWith` (reputation.js) and `peopleDisposition` (quests.js:215/231) are **written but read only for display** (app.js:4635), never as a gate.

So *"promotion reuses this exact standing bar"* (SNG-101 §4) and *"acquisition is the teacher/tome capstone bar made durable"* (SNG-102 §3) both rest on a bar that has never been enforced. **This is the same class of miss as §7b/`skill_battle_system.json`:** a spec building on an unwired system it believes is live. The standing bar must be **built**, not reused — a `meetsStandingBar(character, traditionId, tier, rules)` that reads a teacher relationship (F3), per-people reputation (F2), and (for secondary→primary) region standing (F4). Neither spec scopes this as new work; it is the single largest hidden cost, and F2–F4 are its unbuilt inputs.

### F2 — Per-people reputation exists, but not where the specs look
`reputation.js` is **per-COMMUNITY** (a settlement — `valley.millbrook`, `riven.stillhold`) and **unstored** (derived from `character.deeds`; bands revered≥50 … hated). It is **not** per-people/tradition. The durable per-**people** store is a *different* structure: **`character.peopleDisposition[traditionId]`** (quests.js:215/231) — small quest-driven integers (±1/±2 deltas), **no band table**. So *"reputation with that people ≥ threshold"* (SNG-101 §4, SNG-102 §3) must read `peopleDisposition[traditionId]`, **not** `reputation.js`. Flag: express the thresholds in `peopleDisposition`'s small-integer units (e.g. ≥3), or have Aevi author a per-people band table — do not state thresholds in `reputation.js`'s ±50 community scale; they're different axes.

### F3 — "A teacher met and willing" is NOT persisted
The NPC record (npcs.js:46–57) carries `relationship` (−10..10), `ally`, `skillsObserved`, `role`, `history` — **no `teacher`/`willing`/`mentor` flag.** `taughtBy` is a provenance string on *ability defs*, not a durable NPC bond. So the teacher gate both specs require has no durable state. Either infer it per-turn (an NPC of the target tradition with `relationship ≥ X` and/or `ally`), or add a first-class durable flag. Acquisition explicitly needs it **durable across sessions** (SNG-102 Q2) — inference is fine only if its inputs (relationship/ally/role) already persist, which they do. Recommend: define "willing teacher" = a met NPC whose `role`/tradition matches the target and `relationship ≥ threshold`; no new field needed, but the *rule* is new.

### F4 — Region standing is NOT persisted
Only `character.placeMemory[locationId].visits` (per-**location**, places.js:10) is durable; region is derived from `location.regionId`. *"Sustained region presence"* (SNG-101 §4 secondary→primary) / the soft region gate (SNG-102 §2) must be **derived** — iterate `placeMemory` where `visits>0`, map `locationId → CONTENT.locations[id].regionId`, sum — or add new state. Buildable from existing data; just name it as new derivation work, not an existing counter.

---

## 🟠 SNG-101 — the load-bearing architectural issue

### C1 — §2's data model is a BREAKING type change, contradicting the spec's "additive, never removes" claim
Today `character.domains.{primary,secondary,tertiary}` are **bare traditionId STRINGS** (crystallizeDomains, traditions.js:118–136; default literal at app.js:1636 etc.). SNG-101 §2 makes each a `{traditionId, tierCeiling, station}` **OBJECT**. That is not additive — it changes the *type* of a field read as a string in **~11 hard sites**: `traditions.js:86,107,149` · `quests.js:341` · `corrections.js:52` · `app.js:1685,1687,3272,3570,3793,3837` — plus **two producers** (`crystallizeDomains`, `inferDomains`) and **two smoke tests** (smoke.mjs:2380 `crys.primary==="umbral"`, :2532 `domains.primary==="verist"`). Every one assumes a string. §6's *"the migration only ADDS derived structure, never removes"* is not true of a type change on `.primary`.

**Recommendation — get the exact design goals with ZERO type change and ZERO breakage:**
- Keep `character.domains.{primary,secondary,tertiary}` as **strings** (untouched — all 11 readers keep working).
- Add **`character.foreclosed`** — an array/Set of traditionIds (the directional keep-the-ground set).
- Add **`character.domainCeilings`** — `{ [traditionId]: tier }`, seeded from station (5/3/2); promotion edits this.
- Add **`character.domainsAcquired`** — `[traditionId]` for SNG-102's Tier-I entries.
- Generalize **`domainAccess`** to: (i) if `trad ∈ foreclosed` → closed (native only; braids exempt); (ii) ceiling = `domainCeilings[trad]` ?? station-derived; (iii) iterate `[primary, secondary, tertiary, ...domainsAcquired]` for the far/adjacent penalty.

This delivers §2's actual intent — *decouple ceiling from station, an explicit editable ceiling, a keep-the-ground foreclosed set* — as genuinely additive fields, which is what the spec says it wants. `station` stays a label on the string domains; access reads ceiling + foreclosed as the single source. (If Aevi still prefers the nested-object shape, then §6 must be re-scoped as a real ~11-site migration + producer/test rewrite, not "additive.")

### C2 — `foreclosed` is currently COMPUTED, not stored (answers Q2)
Closed-opposite is computed on-the-fly in `domainAccess` (traditions.js:90–91) via `antipodeOf(primary)` / `antipodeOf(secondary)`. There is **no stored `foreclosed`.** Materializing it is correct — the directional "foreclosed but keep what you own" semantics is *not expressible* from a pure recomputation. But then close-opposite has two potential sources; make `foreclosed` the **single source**: the migration seeds it with the two build antipodes, and `domainAccess` reads the set instead of recomputing, or they drift.

### C3 — directional foreclosure must gate the NEW rank-through-use paths (post-dates the spec)
§3 says foreclosure blocks learning **and ranking up** new antipode abilities but preserves owned ones and never touches braids. Ranking is no longer a purchase — as of this session's ability-arch v2 (v1.8.60), rank 2 is `autoAdvancePracticedRanks` and rank 3 is `markDefiningMoment` (progression.js). So *"block ranking up a foreclosed antipode ability by ordinary means"* means **both of those functions must skip an ability whose tradition ∈ `foreclosed`** (unless it's a braid). The spec predates that ship and names only "learn/rank"; the concrete hook is those two functions + `learnAbility`. Cheap, but must be explicit or auto-advance will silently rank a foreclosed craft.

### C4 — the braid exemption depends on ability-arch v2 classification (not yet done)
§3/§8: `foreclosed` gates **native/single-tradition only, never braids** — a P0 invariant. "Braid" = `nativeOrCombination === "combination"`, a field that only landed this session (Phase 1) and is **0/247 classified.** So the braid-exemption can't be computed correctly until the classification pass (Aevi content, ability-arch Track 1 step 2) lands. SNG-101 has a **hard dependency** on that classification, or foreclosure will wrongly block braid nodes (dissolving the cross-pole system — the exact P0 the spec warns about). Sequence 101 after the classification pass, or the exemption is unenforceable.

---

## 🟡 SNG-102 — mostly clean once the foundation exists

### C5 — keyed collection (answers Q1)
Today `domainAccess` reads three **named** slots positionally (~11 sites). N-domain support needs iteration, not a 4th named key. C1's `domainsAcquired: [traditionId]` + generalized `domainAccess` iteration handles it **without** converting `character.domains` to a keyed map (which would break the 11 readers). So: **yes, SNG-101 should make the domain set iterable for access — via an additive acquired list, not by restructuring `.domains`.** That satisfies SNG-102 Q1 with no schema change per acquisition.

### C6 — the rest of SNG-102 is sound and reuses existing geometry
`acquirable` (§2) = existing `antipodeOf`/closed-opposite + the new `foreclosed` set + the new standing bar (F1). Tier-I entry, no-count-cap-geometry-limits, antipode-forecloses-on-acquire, Law-9 confirm — all consistent with SNG-101 and with `domainAccess`. Nothing new beyond the shared foundation. Good.

---

## ✅ What both specs get RIGHT (affirmed against HEAD)
- **Station-vs-ceiling decoupling** (101 §2) is the correct model — today ceiling is a pure function of station (traditions.js:93–99), and "keep the ground" is inexpressible without an explicit ceiling. Right call.
- **Directional keep-the-ground foreclosure** (101 §3, Erik's ruling) is precisely specified: block forward, preserve owned, never touch braids. This is exactly buildable against the new `foreclosed` set + the ability-arch rank paths.
- **Endgame falls out of geometry — no collect-all rule** (101 §7, 102 §6) is elegant and correct: every promotion/acquisition adds a closed diameter; "own the circle by ordinary means" is geometrically unreachable with zero enforcement code. Do not build a flat cap. Agreed, ratified.
- **Law-9 offer-vs-commit** (101 §5, 102 §4): GM `offerPromotion`/`offerAcquisition` is narrative-only, engine ignores it unless already eligible, the player commits. This is **exactly** the `markDefiningMoment` pattern I shipped this session (GM narrates, engine gates) — proven, low-risk, correct.
- **skilltree FORECLOSED state (Q4):** yes — I added node `state` (OWNED_1/2/3 | LOCKED | AVAILABLE) in ability-arch v2 Phase 3 (skilltree.js:101). FORECLOSED extends it cleanly: pass `character.foreclosed` into `skillGraphModel`; a foreclosed antipode's native nodes → FORECLOSED, combination/braid nodes stay reachable (per C4).

---

## THE OPEN QUESTIONS — answered from HEAD

**SNG-101 Q1 — save-shape of chosen domains.** `character.domains = { primary, secondary, tertiary }`, values are **bare traditionId strings** (or null), persisted directly on the character; produced by `crystallizeDomains`/`inferDomains` (traditions.js). Default literal at app.js:1636/1720/2151, corrections.js:51. Read as strings in ~11 sites (see C1). Not an object today.

**SNG-101 Q2 — existing foreclosed set.** None stored. Closed-opposite is **computed on the fly** in `domainAccess` (traditions.js:90–91). §6 materializes it — see C2 (make the stored set the single source).

**SNG-101 Q3 — reputation units.** Two separate systems: `reputation.js` is **per-community, unstored, ±50 bands** (wrong axis for this). The per-**people** durable store is `character.peopleDisposition[traditionId]` — **small quest-driven integers, no bands** (F2). Express thresholds in that scale, or author a per-people band table. Note: neither is currently read by any gate (F1).

**SNG-101 Q4 — skilltree FORECLOSED state.** Yes, extend the `state` field I added this session (skilltree.js:101). See ✅ above.

**SNG-102 Q1 — keyed collection.** Build it as an **additive acquired list** + generalized `domainAccess` iteration, not a keyed-map restructure of `.domains` (C1/C5). No schema change per acquisition; the 11 string readers stay intact.

**SNG-102 Q2 — teacher met+willing durable?** Not a first-class flag (F3). Persisted inputs exist (`npcRegistry[id].relationship`, `.ally`, `.role`, `.skillsObserved`) — define "willing teacher" as a rule over those; no new field strictly needed, but the rule is new work.

**SNG-102 Q3 — region standing durable?** Not stored (F4). Derive from `placeMemory[locationId].visits` + `location.regionId`, or add new state.

---

## RECOMMENDATION — sequence + reshape before build
1. **Build the standing bar first (F1).** `meetsStandingBar()` reading `peopleDisposition` (F2) + a teacher rule (F3) + region derivation (F4). This is the real prerequisite both specs mislabel as "reuse." Wire it into `domainAccess`/the capstone path so *"greatness is taught, not bought"* is finally true in code — arguably worth its own small ticket (it closes SNG-049/050's unwired gap).
2. **Reshape SNG-101 §2 to additive fields** (`foreclosed` + `domainCeilings` + `domainsAcquired`), not a type change to `.domains` (C1). Keep the 11 readers working; generalize `domainAccess` to read the set + iterate.
3. **Sequence SNG-101 after the ability-arch v2 classification pass** (C4) so the braid exemption is enforceable, and gate the new rank-through-use paths on `foreclosed` (C3).
4. **SNG-102 then lands cleanly** on that foundation — it adds almost no engine surface beyond the acquired list + the standing bar it shares.
