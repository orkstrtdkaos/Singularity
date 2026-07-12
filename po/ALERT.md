# PIPELINE ALERT — Singularity

> **This file carries CURRENT STATUS ONLY.** History lives in `po/results/*` and the graph. *(Per SNG-071: the old 115KB append-only ALERT is archived at `po/archive/ALERT_20260712.md`. Aevi kept appending to it all session and made it a wall CCode had to excavate. That is the sediment problem, and this is the fix.)*

**HEAD:** v1.8.29 · **Authoritative spec:** `SYSTEM_SPEC.md` v2.0 (`round-2-complete`) · **Active build spec:** `po/SNG_UPDATE_v1.9.0.md`
**Process:** SNG-071 two-round cycle. Aevi authors ROUND 1 → **CCode substrate-verifies (ROUND 2)** → Aevi amends + promotes → CCode builds → `complete_pending_review` → **only Aevi closes.**

---

## ✅ SHIPPED (awaiting Erik's leg / Aevi close)

| | Ship | Notes |
|---|---|---|
| **SNG-BATCH-10** | v1.8.22–25 | Domain gates **engine-enforced** (antipode CLOSED) · starting locations · structured quests + the missing loader · **Content CI** — *which caught `provides.items` (19 defs incl. the Waystaff) never loading, on day one.* |
| **SYSTEM_SPEC v2.0 ROUND 2 + `effects[]`** | v1.8.26 | Quest outcomes now apply machine-readable deltas. *"Veilwright: lowered" is applied as **−1** instead of silently dropped.* **BOUNDARY-1 CLOSED.** |
| **SNG-056** | ✔ | Location-header desync |
| **SNG-074** | ✔ | Dev off-switch — Erik has a clean player view again |
| **SNG-075** | ✔ | **Encounters now fire in narrative play** (bound to narrative time, not map buttons) |
| **SNG-076** | v1.8.32 | Authored prose renders in FULL (was cut mid-word); model output clamps on a word boundary. |
| **SNG-070** | v1.8.30 | **GM corrections — the game self-heals.** A bounded `stateOps` (repair, not wish): fix a wrong field/domain/entity/quest/location, engine-refuses any advance, every change logged. |
| **SNG-052** | ✔ | Adult-gate checkbox persistence |

---

## ⛔ NEXT — BUILD IN THIS ORDER (Erik-directed; supersedes CCode's earlier queue)

### 1. ✅ SNG-076 SHIPPED v1.8.32 — authored prose renders in full; model output word-boundary-clamped
`quests.js` still holds `slice(0, 240)` / `slice(0, 200)`. **Quest stakes die at *"…and Ove…"*; the away-digest is cut at *"the district acco ("*.**
**The conceptual bug:** authored content is being clamped **as if it were untrusted model output**. It isn't. Quest premise/stakes/objectives/outcome-narration come from content packs — deliberate, finite, and meant to be read. **Authored content renders IN FULL; model output is clamped.** And every clamp is a raw `slice()` that cuts mid-word — even where clamping is right, **the cut is wrong** (word-boundary + real ellipsis + expandable, never destroyed). **The prose IS the game.**

### 2. ✅ SNG-070 SHIPPED v1.8.30–31 — GM corrections (stateOps), incl. ability-strip for the Silas case
**Erik's necromancer, Silas Weir, is stuck** with Blazeborn/Lattice/Numinous abilities and the wrong domains. **P1 (the commit boundary) only fixes creation going FORWARD — it cannot repair a character who already exists.** A GM correction is the *only* mechanism that can, and without it **every mis-created character is scrap** — unacceptable in a game his family is about to play.
*Scope: correct domains · re-derive abilities against them · fix background · **strip abilities the character should never have had**. Grandfathering an earned ability is the **player's choice**, not an engine default — Erik must be able to say "take the Blazeborn work off him; I am an Ashwarden" and be obeyed.* Bounded by **Law 14: a repair is not an advance** — no XP, no levels, no unearned power. Every correction **logged to the ledger**.
*(Silas is an Ashwarden — the death pole. His kit is authored and waiting: **Palework · Deathsense · Wither · Death-Ward**, and the braid **The Counted End**.)*

### 2b. **SNG-077 — the gambit hint is still constant.** 🔴 LIVE (Erik)
**SNG-043 Part A SHIPPED CORRECTLY — Aevi's SPEC was the bug.** `isGambitApt` is exactly as specced (`>=3 choices && (planTagged || threads>=3)`), but **both disjuncts fire on ordinary scenes**: `plan` is 1 of 10 generic approach tags (a *style*, not a structure), and `scene.threads` are **conversational** (*"a question hanging"*) — any decent social scene has three. **Aevi keyed the hint on style + texture instead of the gambit condition: multiple OBSTACLES that must be SEQUENCED.**
**Fix — stop guessing, let the GM say so:** add a GM field **`gambitApt: true`**, emitted ONLY for a genuine multi-obstacle objective where ordering the approach would matter (*"a rich conversation is NOT gambit-apt; a careful approach to a SINGLE obstacle is NOT gambit-apt; most turns, omit it"*). Then **`isGambitApt = turn.gambitApt === true`** — **drop `planTagged` and the thread-count entirely.** Law 1 holds: the GM proposes, the engine still decides (cooldown · dismissal · sanity check). **Make dismissal actually stick for the scene** + an N-turn cooldown. **Bias hard toward silence** — a hint shown too rarely costs a missed feature; one shown constantly costs the player's attention entirely, and Erik is already there.

### 3. **P1 — the commit boundary** (SNG-067/068/069 are ONE defect)
`grep` at v1.8.23 showed **zero** commit-boundary functions. Draft → confirm → commit. Nothing writes to the character until the player says yes; everything stays re-choosable. `[CCODE: 16 'draft' refs at HEAD — is this partially shipped? confirm]`

### 4. **SNG-066 — feedback** (auto-captured context: version · character · domains · location · last GM turn · console errors). Turns Erik's screenshot-archaeology into one-click reports.

### 5. **SNG-073 — The Skill Wheel** (supersedes SNG-054 Ph2). The skill tree **becomes** the great circle: tiers radiate inward · folk crafts at the centre · precursor outside the ring · **cross-pole braids drawn as diameters through the centre** · **antipode dark and struck through.**

### 6. **SNG-058 — party leader.**

---

## 📌 SPEC CORRECTIONS — PROMOTED (Aevi accepts all four; the draft was wrong)
CCode's ROUND 2 caught Aevi in four places. **All accepted; `SYSTEM_SPEC.md` is authoritative as corrected.**
1. §4 novel bonus is **8**, not 3.
2. §11 **`item ops` and `stateOps` do not exist at HEAD** — items ride `characterDeltas.inventoryAdd/Remove`.
3. §3 `canon.js` and `sync.js` are **separate modules**.
4. **§9 — ⚠️ THIS IS A DESIGN GAP, NOT A TYPO. The spec claims a place's disposition pulls a character's spectrum over time. IT DOES NOT.** Character drift comes only from the *action's own* axes; `affinities.js` is a **per-roll bonus with no write-back**; there is **no decay routine**. **The location→character bridge is UNBUILT.** → **See "Erik's call" below. Do not build it until Erik rules.**

---

## 🚨 SNG-078 — **THE GAME CEILINGS OUT AT LEVEL 5** (Aevi, analytic from `resolution.json` @ HEAD)
| Difficulty | hits the 95% clamp at |
|---|---|
| Routine (0) | **level 2** |
| Hard (15) | **level 3** |
| Very hard (30) | **level 5** |

**Cause:** `attributeMultiplier: 20` vs `attributeSoftCap: 4` → **an attribute of 4 is 80% ON ITS OWN**, before skill (+10/pt), rank (+5), equipment (+10), companion (+10), spectral fit (+25). Difficulty tops out at **30**. A level-5 character with gear + companion + alignment sits at 95% on *very hard* with **~45 points of unused headroom**.
**And level 100 does not exist:** `subAttributeCap: 20` + `maxAbilityRank: 3` → **mechanical growth stops ~level 20.**
**Where tension DOES survive:** modifiers only — against-grain (−25), exhausted (−10), novel (−15) drop a 95 to 45. *The game is tense when you're misaligned, tired, or reaching past what you know — and a formality otherwise.*
**⛔ ERIK'S CALL. Aevi will NOT tune balance numbers unilaterally.** Levers: lower `attributeMultiplier` (20 → ~8-10) · widen/scale the difficulty band (0/15/30 is too narrow to bite) · scale challenge with level · make the soft cap bite harder.
**🔧 CCode: `tests/balance_sim.mjs`** — headless sim (the engine is pure), lvl 1 → true cap, reporting: chance distribution × difficulty × alignment · **energy economy** (recovery is ACTIVE-ONLY; `regenPerRest` is dead) · XP pacing (10,000 xp ≈ 2,000 actions for lvl 100) · **the +20 discovery bonus** (Erik parked it for exactly this) · domain-access economics · are the **cross-pole braids** actually attainable · encounter danger vs a character who auto-succeeds from level 5. **Run it under `npm test` as a regression gate** so nobody silently re-breaks the curve.

## 🎯 ERIK'S CALL (design, not a bug)
**Should a place CHANGE you?** The world's premise is that its physics *is* disposition — and standing a long time in the Redline, or the Cogitarium, or the Unlit Deep, *ought* to leave a mark. Today the place **taxes or favours a roll** and nothing more; it never shapes who you become. **The mechanic Aevi documented does not exist, and Aevi should not have claimed it did.** Building it is a real feature (a slow spectrum-pull toward a place's poles, with decay), and it would make "geography = disposition" true of *people*, not just terrain. **Erik decides whether that is a feature or a road not taken.**

---

## 📋 Owed
- **Aevi:** `po/OPERATIONAL_FLOWS.md` · thin regions (riven_marches / somatic_reaches / unspooling want ~6 locations) · retire `SPEC_BACKLOG.md` (180KB) as a primary surface.
- **CCode:** the §22 debt list it surfaced (slugify in the wrong module · worldtime MODE is per-player vs "one clock" · `newEncounter` stashes-not-activates · quest stage-conditions advance manually · `narration`↔`effects[]` drift has no linter · dead `regenPerRest` key · `parse_probe` can't reach `boot()`).
- **Erik:** preview-legs (`po/PREVIEW_LEGS.md`) · the §9 drift call above · GH Action for `npm test` (BOUNDARY-2: the CI is a local gate, and a gate that only fires when someone remembers to run it is weak against exactly the failure it exists to prevent).
