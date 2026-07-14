# SYSTEM_SPEC Amendment — Ability Architecture v2
## Aevi (PO) — 2026-07-14 — **v2, post-CCode-ROUND-2. GO FOR BUILD.**

> **What this is.** An amendment to SYSTEM_SPEC v2.0. Revises §6, §7, §8, and the module map. All section references are to the current SYSTEM_SPEC. Verified against HEAD `v1.8.57`.
>
> **Scope.** (1) Two-tier ability progression: breadth via points, depth via use. (2) Native ability grants at primary-domain selection, attribute-gated. (3) Axis-touch combination unlock model: narrative threshold + point spend. (4) Schema additions to support the above.
>
> ### ⛔ §7b (Skill Challenges) is WITHDRAWN from this amendment.
> It duplicated **`skill_battle_system.json`** — a system **Aevi authored 2026-07-07**, promoted into the manifest, and then re-invented seven days later, worse, without reading it. *GenerateBeforeVerify at the design layer.* The older spec wins on every contested point (function-vs-function matchup table, momentum meter, energy attrition, tier weight, `challengeProfile` as the matchup input, the SNG-027 unification mandate). **Skill battles are now SNG-098** — an amendment to `skill_battle_system.json` folding forward the three-type taxonomy, the environmental-conditions table, the Coliseum, and vulnerability-disclosure-as-authoring-law. **Not in this build.**
>
> **Standing corrective (→ `po/OPERATIONAL_FLOWS.md`):** *before authoring a new system section, grep `content/packs/core/rules/` and `po/` for the feature by name. A spec is content. Read the lower layer first.* Content CI cannot catch a spec duplicating a spec.
>
> ### Also cut from this build
> - **Tiered-same-action ID collapse → SNG-099**, deferred last and guarded. Mutating an `abilityId` orphans any save that owns it (**Law 14** — never strip an owned ability). The payoff is content-count aesthetics; the risk is not. The architecture does not depend on it, and shipping the two together would make a failure undiagnosable.
> - **Proximity-based unlock.** `practice.js` counts uses and co-activations — **not sessions or elapsed time.** "3 sessions of proximity" specified a mechanic with no counter beneath it. Action-pattern alone is a complete unlock model. If proximity is wanted later it needs a worldtime-days counter and its own ticket.
> - **The `attributeCategory` field.** Withdrawn entirely — see §6.
>
> **What does NOT change.** The closed-opposite rule (§6) is inviolable and unaffected. The cross-pole braid system (`combination_recipes.json`) remains as-is. Law 9 (nothing commits before the player confirms), the substrate system (§9b), and the harm rung system (§7 / SNG-089) are unaffected.

---

## REVISIONS TO §6 — Domains & Access

### Add after the domain access table:

**Native ability grants (NEW).**
When a player selects a primary domain at character creation, they receive that tradition's **native abilities at rank 1** at no skill-point cost. Native abilities are the abilities whose expression is the tradition itself — what you are, not what you have learned. They are identified by `"nativeOrCombination": "native"` in the ability schema (see Schema Additions below).

**Attribute gating of native grants.** Not all natives are granted automatically. A character with low investment in the sub-attribute a native ability governs does not receive it free — it must be purchased with a skill point.

**The gate reuses `attribute_gates.json`. It does not introduce a new field.** *(Corrected post-review: the draft proposed an `attributeCategory` field with values `physical | mental | social`. That was wrong twice — it omitted **`practical`**, a real fourth category and the home of many crafts, and it would have sat as a coarse second gate in parallel with the fine one that already decides everything else. Withdrawn.)*

Live gating is **per sub-attribute** — `strength · agility · reason · insight · presence · rapport · craft · wits` — via `gateFor(abilityId) → {subAttribute, learnMin, rank3Min}`.

**The real gap under that error:** `attribute_gates.json` today deliberately covers only the high-tier band — *"Tier I–II abilities stay ungated so entry/mid play is open."* Native abilities are mostly Tier I–II, so **the existing table has no entries for them and cannot gate a native grant.** The fix is coverage, not mechanism:

> **Extend `attribute_gates.json` with native-grant entries**, same schema (`subAttribute` + `learnMin`), authored per native ability. One table. One gate. Gate logic lives in `progression.js` at domain selection; the display-side check stays in `skilltree.js` (`meetsLearnGate`).

*Design intent survives intact, and lands finer than proposed: an agility-invested umbral starts with Shadowstep and The Long Dark (body-in-dark). An insight-invested umbral starts with Concealment, The Dark Knowing, and Shadow Work (mind-in-dark). Both are legitimate umbral characters — and the gate now speaks in the same vocabulary as every other gate in the game.*

**Combination abilities — two tiers, different unlock models (NEW).**

The existing §6 describes cross-pole braids as the only sanctioned road to your antipode. That stands. Two tiers of combination ability now exist:

| Tier | What it is | Where authored | Unlock model |
|---|---|---|---|
| **Axis-touch combination** | Primary tradition expressing itself in an adjacent or nearby axis. E.g. umbral + violence = Shadow Strike. | Ability JSON files; `"nativeOrCombination": "combination"` | Narrative threshold + point spend (see §7 revision). At character creation: point spend only — background justifies the exposure. |
| **Cross-pole braid** | Holding both poles of one axis simultaneously. The hardest crossings. E.g. The Harbored Flame (blazeborn + umbral). | `combination_recipes.json` — unchanged | Standing in both poles required. Unchanged from current. |

The closed-opposite rule applies to cross-pole braids, not to axis-touch combinations. An umbral can develop Shadow Strike (umbral + violence) without holding the peace pole. An umbral cannot learn Radiance without holding both dark and light — that would be a cross-pole braid, and requires the full standing of the braid system.

---

## REVISIONS TO §7 — Abilities, Combinations, Discovery

### Replace entire §7 with:

## 7. Abilities, Combinations, Discovery

- **247 ability entries** at HEAD across the 16 core ability files, plus the valley pack. *(The draft said "137 + 44"; CCode's review said 233; the true count is **247**. Both of us got it wrong by hand, which settles the argument: **the §7 header count is regenerated by script from the manifest and reported by `content_ci.mjs` — never hand-set.** No compression figure is quoted here, because the ID collapse is deferred to SNG-099.)* Each stamped with `tradition`, `levelReq`, `energyCost`, `functions[]`, `axes{}`, `notFor`, `nativeOrCombination`, and a `tree` of ranks. Engine groups by `tradition` on the learn screen and skill wheel — **never by `powerSystem`/reach.**

### 7.1 — Two Axes of Character Development

**Breadth** — what abilities you can access. Governed by skill point spend and (post-creation) narrative thresholds. Every skill point decision is: *"what new thing do I want access to?"*

**Depth** — how capable you are with abilities you already have. Governed entirely by use — **no point spend at any rank.** Every ability has a rank 1/2/3 progression. Ranks unlock through play, not purchase.

These were previously conflated. The separation is load-bearing: the skill point economy is now purely about access, not about powering up what you already have.

### 7.2 — Rank Progression (Through Use)

Every ability — native, combination, and cross-pole braid — uses the same three-rank structure. Ranks are NOT purchased.

| Rank | Name | Unlock condition |
|---|---|---|
| **1** | Given | Automatic at ability acquisition. Competent expression. This is what you paid for (or what your tradition granted you). |
| **2** | Practiced | GM marks this when the ability has been used meaningfully under pressure, repeatedly. Not grinding — the ability had to matter. Rank 2 is the ability becoming fluent: lower effort, broader application. |
| **3** | Mastered | Unlocks through a **defining moment** — a specific story beat where the ability was fully expressed under conditions that required its complete form. Not accumulation. A breakthrough. *The umbral doesn't reach The Never-There by hiding 50 times. They reach it in a moment when they had to disappear completely, and did.* GM call. |

**Energy cost discount:** existing formula unchanged — `−1 per two character levels and −1 per rank, floored at ⌈½·base⌉` (matches `effectiveEnergyCost`, progression.js, exactly). Rank progression through use now also drives the energy discount, without any point spend.

**BUILD ON WHAT EXISTS — half of this is already live.** `practice.js practiceRankReady` already grants **free rank-through-use** at `{2: 8, 3: 16}` uses, and `rankUpAbility` already has a `viaPractice` path. **Do not reinvent it.** The actual delta this amendment makes is exactly two things:

1. **Remove the point-spend path** to rank (the `viaPractice` path stays and becomes the only path).
2. **Upgrade rank 3** from a use-count threshold to a *defining moment*.

**How a rank is marked (resolved — was open question 1):**

| Rank | Who marks it | Mechanism |
|---|---|---|
| **2 — Practiced** | **Engine, automatically**, the moment the use threshold is crossed. | No GM, no player-confirm modal. It's earned; hand it over. Surface as a toast + the ⓘ ladder (SNG-084/097). Gaining power is never a Law-9 "commits before confirm" problem — Law 9 protects against things being *taken* or *set* without consent, not against being *given* what you earned. |
| **3 — Mastered** | **GM**, via a new op **`markDefiningMoment`**. | New op in the GM REPLY-FORMAT block + the `salvageOps` whitelist + a sanitizer clamping to `{abilityId}`. **The engine applies it only if the use threshold AND the `rank3Min` attribute gate are already met** — so the GM can narrate a breakthrough but can never hand mastery to an unpracticed ability. Optionally surfaced as a claimable card, like a ripe combo. |

**No player-confirm modal on routine rank-ups.** That would rebuild the exact friction this amendment removes.

**On capstones (`levelReq` 4–5):** The previous spec stated *"Capstones (L4–L5) are single-mastery by design — a capstone is one profound thing, not a progression. This is not debt."* That was written for the rank-purchase system, where requiring players to spend additional points on a capstone they'd already bought felt punitive. Under rank-through-use, the concern is moot — no points are spent on rank advancement. **Capstones now carry rank progressions.** Rank 3 of a capstone requires a defining moment of correspondingly greater weight. *A capstone is still one profound thing — it just grows through the most profound use.*

### 7.3 — Native vs. Combination Abilities

**Native abilities** belong to a tradition. They express what the tradition simply *is*. The functions they cover are the ones the tradition naturally owns. A tradition has 4–6 native abilities.

*Implication: traditions are no longer required to cover all 8 function families natively. Functions not naturally covered by the tradition come through combinations. This removes the forced-coverage abilities that read as authored-to-spec rather than organic.*

**Axis-touch combination abilities** are authored at the intersection of a primary tradition and a secondary axis. They give traditions access to function families outside their native range, through the idiom of the primary tradition.

> *The umbral who hunts develops Shadow Strike — harm through concealment, not harm despite it. The ability is not the marcher's precision. It is the umbral's predation. Same function family (HARM), different mechanism, different voice, different vulnerabilities.*

**Same destination, different idiom.** Two traditions may reach the same functional outcome through completely different mechanisms. An umbral navigates a lethal space through the shadow-layer. An ashwarden navigates the same space through the grey road. Both are [move, travel, resist] in a lethal environment. They are not the same ability: one requires shadow, one requires death-knowing; different conditions block each. The function tags are the same; everything else is different.

### 7.4 — Combination Unlock Model

**At character creation:** point spend only. The narrative threshold is open — your background justifies the exposure. An umbral who fought their way to the Valley may begin with Shadow Strike.

**Post-creation:** two gates, in sequence.

1. **Narrative threshold** — the GM surfaces the combination as *available* when the pattern is established:
   - **Action-pattern:** you have been doing this kind of thing consistently. `practice.js` tracks use and co-activation; the threshold fires when the pattern holds. *An umbral who hunts regularly eventually sees Shadow Strike become available.*
   - **Threshold value: ~6 co-activations** of (primary ability × secondary-axis tag). **Reuse the live numbers; invent nothing.** Combos ripen at `ripenAt` 6–7, branches at 8 uses, aspirations at 10, rank-through-use at `{2:8, 3:16}`. Six keeps one number to reason about across the whole practice system.
   - *(**Proximity-based unlock is CUT from v1.** `practice.js` counts uses and co-activations — it has no session or elapsed-time primitive. The draft's "3 sessions of proximity" specified a mechanic with nothing beneath it. Action-pattern alone is a complete unlock model. Proximity needs a worldtime-days counter and its own ticket.)*

2. **Point spend** — formally claims the combination. Walks through the door the narrative opened.

*This separation means players cannot purchase combinations the story hasn't supported (post-creation), and cannot be locked out of combinations they've clearly earned. The narrative threshold is a lock; the point spend is the key.*

### 7.5 — Discovery (Emergent Combinations — unchanged)

The existing emergence system via `practice.js` and `combination_recipes.json` is unchanged. Axis-touch combinations (§7.3) are **pre-authored** with known unlock conditions. Emergent discoveries are **minted by the engine** from use/co-activation patterns hitting recipe thresholds. Both systems coexist; they are different classes of thing.

> *Pre-authored: "I've been hunting; I can now learn Shadow Strike."*
> *Emergent: "I've been using Shadowstep and The Edge together, and something new crystallized from that."*

The engine mints emergent discoveries; the model supplies the words. Once known, it is `+20` instead of `−15` (§4). This law is unchanged.

---

## §7b — WITHDRAWN → SNG-098

*The Skill Challenges section that stood here is struck. It duplicated `skill_battle_system.json` (authored by Aevi 2026-07-07, in the manifest, unwired) with a poorer model — dropping the function-vs-function **matchup table** (which that spec calls "the core of it") in favor of environmental conditions, swapping the contest's weighting axis from **tier** to **rank** without saying so, and proposing to parse **`notFor`** (free-text prose) as machine input.*

*It also double-counted rank: `successChance` already carries `abilityLevelBonus: 5` per rank, so the proposed `0/+10/+20` would have put rank 3 at **+35** on a 5–95 clamp — in a game that already ceilings near 95% at level 5 (SNG-078). Rank 3 would have auto-won every contest.*

**→ SNG-098 — Skill Battles.** Amend `skill_battle_system.json` with what genuinely survives from §7b (the three-type taxonomy: direct opposition / functional opposition / parallel expression; the environmental-conditions table as a *modifier* on the matchup, reading §9b substrate density; the Coliseum as a place; vulnerability-disclosure as an authoring law), then wire the engine and unify with the SNG-027 social contest per that spec's original mandate. `challengeProfile` / `challengeTypes` are the intended matchup input — **dormant, not dead**; they get wired there. `notFor` stays a narration gloss and is **never parsed.** One rank term only, expressed as a differential of each side's already-rank-inclusive `successChance`, tuned in `tests/balance_sim.mjs` — never eyeballed.

**Not in this build.**

---

## REVISIONS TO §8 — Character Creation

### Add to the "DOMAINS → ABILITIES" step:

**Native ability grants at domain selection.** When a player confirms their primary domain, the engine grants their tradition's native abilities (`nativeOrCombination: "native"`) at rank 1 without skill-point cost. Attribute-gated natives (§6) whose attribute threshold is not met appear as *available at no cost* but are not added automatically — the player is shown them and can take them or defer (and purchase them later with a point).

**Combination abilities available at character creation.** Any combination ability in the primary domain (`combinationAxis` is non-null; `tradition` matches primary) is available for point spend during character creation, without requiring the post-creation narrative threshold. The creation-time background justifies the exposure. These appear on the ability selection screen alongside native abilities.

### Revise Door 1 note:

The existing note *"Skills come from USE, not purchase"* remains true for skills developed through the prologue play. It does not contradict the native-grant rule: native abilities are not purchased, they are granted by identity. *You are of this tradition — these abilities are what that means. You didn't buy them; you were born to them.*

---

## SCHEMA ADDITIONS

### Ability schema — new required fields

```json
{
  "nativeOrCombination": "native",        // "native" | "combination"
  "combinationAxis": null,                // null (native) | axis id e.g. "violence_peace"
  "combinationPole": null,                // null (native) | pole string e.g. "violence"
  "unlockCondition": null,                // null (native) | object (combination) — see below
  "rankProgression": "use",              // "use" (standard) | "spend" (legacy, avoid)
  "rankThresholds": {
    "rank1": "given",
    "rank2": "practiced_use",
    "rank3": "defining_moment"
  }
}
```

**`unlockCondition` object (combination abilities only):**

```json
{
  "type": "action_pattern | proximity | both",
  "description": "Human-readable threshold description for GM display.",
  "proximityAlternative": "Optional: a proximity path if the primary type is action_pattern."
}
```

**Ability `tree` node — add `unlockThreshold`:**

```json
{
  "rank": 2,
  "name": "The Harbor",
  "unlockThreshold": "practiced_use",
  "grants": "...",
  "cannot": null
}
```

`unlockThreshold` values: `"given"` · `"practiced_use"` · `"defining_moment"`

### ~~Ability `attribute` field — attribute category tag~~ — **WITHDRAWN**

**No `attributeCategory` field is added.** It omitted `practical` (a real fourth category), and it would have created a coarse second gate running in parallel with the fine per-sub-attribute gate that already decides every other access question in the game.

**Instead: extend `attribute_gates.json`** with native-grant entries, same existing schema:

```json
"shadowstep":   { "subAttribute": "agility", "learnMin": 3 },
"the_dark_knowing": { "subAttribute": "insight", "learnMin": 3 }
```

One table. One gate. One vocabulary. *(`rank3Min` remains optional and orthogonal — it gates rank 3, which is now a defining moment rather than a purchase.)*

### Skill tree display — new ability states (for `skilltree.js`)

| State | Display | Condition |
|---|---|---|
| `LOCKED` | Grey, no interaction | Combination; narrative threshold not met |
| `AVAILABLE` | Dim, purchasable | Narrative threshold met; costs a point |
| `OWNED_1` | Active, rank pip 1 | Acquired; used infrequently |
| `OWNED_2` | Active, rank pip 2 | GM has marked practiced use |
| `OWNED_3` | Active, rank pip 3 | GM has marked a defining moment |

**NEVER** show a combination ability as `AVAILABLE` until `practice.js` or the GM has confirmed the narrative threshold is met (post-creation). At creation, all primary-domain combinations are shown as `AVAILABLE` by default.

---

## MODULE IMPACT

*Corrected post-review. The draft under-played the app.js surfaces and named the wrong CI tool.*

| Module | Change required |
|---|---|
| `progression.js` | Native grants at domain selection, no point spend, gated via `attribute_gates.json`. **Remove the point-spend rank path**; keep and extend `viaPractice`. Add `surfaceCombinationUnlocks`. Energy-discount formula unchanged. |
| `practice.js` | Add `combinationThresholdMet(abilityId, practiceState)` (~6 co-activations). Add `ripeAxisTouchCombinations` alongside the existing `ripeCombos` / `ripeBranches`. **Build on `practiceRankReady` — it already does free rank-through-use.** |
| `gm.js` | New op **`markDefiningMoment`** → REPLY-FORMAT block + `salvageOps` whitelist + sanitizer clamped to `{abilityId}`. Engine applies only if use-threshold **and** `rank3Min` gate are already met. |
| `skilltree.js` | `LOCKED / AVAILABLE / OWNED_1 / OWNED_2 / OWNED_3` — **`skillGraphModel` already carries `owned`/`rank`/`locked`/`ripe`/`aspired`; these derive from existing flags, no new computation.** Add `nativeGrantsFor(tradition)`, `combinationsAvailableFor(tradition, practiceState)`. **NEVER** auto-grant a combination. |
| **`app.js`** | **⚠ The real work, and the draft hid it.** Removing point-spend deepen breaks **four shipped surfaces**: `data-lvlrank` (Level-Up modal, SNG-094), `data-rank2` (Character screen), `data-skillrank` (**Skill Wheel + Graph — SNG-097, shipped yesterday**), `data-rankpractice` (free practice), plus handlers at ~5007/5017/5024. Each converts from *"spend to rank"* → *"progress toward the threshold, and the reason."* **Budget this as real work, not a rename.** |
| `reconcile.js` | Migrate saves holding spend-purchased ranks → owned ranks. **Law 14: never strip an owned rank.** Hang it on the existing `reconcileVersion` idempotence gate. **No ability-ID migration in this build** (that's SNG-099). |
| **`tests/content_ci.mjs`** | *(Draft said `check_pipeline.py` — that is the **Tether/ErikIAm** tool and does not exist in this repo.)* Validate: every ability has `nativeOrCombination`, `rankProgression`, `rankThresholds`; every combination has `combinationAxis` + `unlockCondition`; **warn on any `rankProgression: "spend"`.** Report the ability count so the §7 header can be script-generated. |
| `tests/balance_sim.mjs` | Exists as of SNG-090 Ph A. Not required by this build (no new resolution term) — but the removal of point-spend ranks changes the *rate* at which characters reach rank 3. Re-run the anchors. |

### Modules unchanged

`resolve.js` · `encounters.js` · `random_encounters.js` · `sense.js` · `gambit.js` · `intensity.js` · `affinities.js` · `substrate.js` · `traditions.js` · `evolution.js` · `canon.js` · `sync.js` · `party.js` · `worldtime.js` · `state.js` · `art.js` · `claude.js` · `generate.js` · `genschema.js` · `worldmap.js` · `worldtick.js` · `legends.js` · `npcs.js` · `places.js` · `vectors.js` · `inventory.js` · `quests.js` · `codex.js` · `facts.js` · `namematch.js` · `backfill.js` · `pacing.js` · `playerprofile.js` · `reputation.js` · `corrections.js` · `companions.js`

*`encounters.js` / `random_encounters.js` / `resolve.js` are unchanged **because §7b is withdrawn.** They move under SNG-098, where `resolve.js`'s contract must be preserved: `encounters.js` takes an **injected pre-rolled resolution** and never rolls its own d100.*

## MIGRATION NOTES (breaking changes)

### Ability content migration

**~~Tiered-same-action collapse~~ — DEFERRED to SNG-099.** Collapsing e.g. *Radiance + Kindle → one ability with ranks* mutates `abilityId`s that live saves, `manifest.json`, and `attribute_gates.json` all reference by name. **Any save owning the vanishing ID is orphaned — a Law 14 violation** ("never strip an owned ability"). The payoff is content-count aesthetics; the risk is a player losing something they earned. It gets its own ticket, sequenced last, with an explicit old→new ID map behind the `reconcileVersion` gate and a save-migration test. **The architecture does not depend on it**, and shipping both at once would make any failure undiagnosable.

**`nativeOrCombination` classification.** Every existing ability must be tagged. Gap abilities authored in SNG-096 are mostly axis-touch combinations; they get `nativeOrCombination: "combination"` and appropriate `combinationAxis`. Existing abilities that were tradition-native stay `"native"`.

**No `rankProgression: "spend"` abilities should exist after migration.** The `spend` value is reserved for legacy compatibility only. Content CI should warn on any ability where `rankProgression === "spend"`.

### Save compatibility

`reconcile.js` must handle saves that have abilities at rank 2 or 3 via the old point-spend system. These saves should be migrated: mark those abilities as `OWNED_2` or `OWNED_3` without requiring re-earning (the player already earned them; stripping them is a violation of Law 14 — "a repair is not an advance"). Add a `backfillVersion` step.

---

## BUILD ORDER

**Track 1 — this amendment. GO.**

1. **Schema extension** — `nativeOrCombination`, `combinationAxis`, `combinationPole`, `unlockCondition`, `rankProgression`, `rankThresholds`. **No `attributeCategory`.** Update `tests/content_ci.mjs` to validate. Green before content moves.
2. **Classification pass** — tag all **247** entries `native` / `combination`. SNG-096 gap abilities are mostly axis-touch combinations. **No ID collapse.**
3. **`attribute_gates.json`** — add native-grant entries (`subAttribute` + `learnMin`) for the natives.
4. **`progression.js`** — native grants at domain selection; remove the point-spend rank path; keep/extend `viaPractice`; `surfaceCombinationUnlocks`.
5. **`gm.js`** — `markDefiningMoment` op + whitelist + sanitizer, engine-gated on threshold **and** `rank3Min`.
6. **`skilltree.js`** — the five states, derived from the flags `skillGraphModel` already carries.
7. **`practice.js`** — `combinationThresholdMet` (~6 co-activations); `ripeAxisTouchCombinations`.
8. **`app.js`** — rewrite the **four** deepen surfaces to progress-toward-threshold. *(The largest single piece. Do not underestimate it.)*
9. **Axis-touch combination authoring pass** — 3–5 per tradition, with `unlockCondition`. **(Aevi content.)**
10. **`reconcile.js`** — migrate spend-purchased ranks to owned ranks. **Law 14: never strip an owned rank.**

**Not in this build:** SNG-098 (skill battles) · SNG-099 (ID collapse) · proximity unlock · `energyMult` (SNG-090 follow-on).

---

## OPEN QUESTIONS

**None.** All six were answered by CCode against HEAD and are resolved inline above:

| # | Resolution |
|---|---|
| 1 | Rank 2 engine-automatic; rank 3 = new GM op `markDefiningMoment`, engine-gated. (§7.2) |
| 2 | Native gate lives in `progression.js` at domain selection, reading the **existing** `attribute_gates.json` **per sub-attribute**. `attributeCategory` withdrawn. (§6) |
| 3 | ~6 co-activations, reusing the live combo `ripenAt` model. **Proximity cut** — no primitive. (§7.4) |
| 4 | The double-count is real (+35 at rank 3). Moot here — **§7b withdrawn**; carried to SNG-098 as: one rank term, differential, tuned in `balance_sim.mjs`. |
| 5 | **247**, not 137 (Aevi) or 233 (CCode). Header count **script-generated** from the manifest henceforth. (§7) |
| 6 | **`notFor` is prose. Never parse it.** `challengeProfile` / `challengeTypes` are the intended machine input — wired in SNG-098. |

**Full disposition: `po/SPEC_AMENDMENT_ability_arch_v2_AEVI_DISPOSITION.md`.**
