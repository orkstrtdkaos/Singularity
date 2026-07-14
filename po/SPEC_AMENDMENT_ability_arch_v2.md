# SYSTEM_SPEC Amendment — Ability Architecture v2
## Aevi (PO) — 2026-07-14 — Pre-CCode review

> **What this is.** A pending amendment to SYSTEM_SPEC v2.0. Adds §7b (Skill Challenges), revises §6, §7, §8, and the module map. No content CI change goes in until CCode has verified against HEAD. All section references are to the current SYSTEM_SPEC.
>
> **Scope.** (1) Two-tier ability progression: breadth via points, depth via use. (2) Native ability grants at primary-domain selection, attribute-gated. (3) Combination ability unlock model: narrative threshold + point spend. (4) Skill challenges and direct opposition as a formal encounter type. (5) Schema additions required to support all of the above.
>
> **What does NOT change.** The closed-opposite rule (§6) is inviolable and unaffected. The cross-pole braid system (`combination_recipes.json`) remains as-is — it is a different tier of combination from what this amendment introduces. Law 9 (nothing commits before the player confirms), the substrate system (§9b), and the harm rung system (§7 / SNG-089) are unaffected.

---

## REVISIONS TO §6 — Domains & Access

### Add after the domain access table:

**Native ability grants (NEW).**
When a player selects a primary domain at character creation, they receive that tradition's **native abilities at rank 1** at no skill-point cost. Native abilities are the abilities whose expression is the tradition itself — what you are, not what you have learned. They are identified by `"nativeOrCombination": "native"` in the ability schema (see Schema Additions below).

**Attribute gating of native grants.** Not all natives are granted automatically. A tradition's native abilities each map to a primary attribute category (`physical` · `mental` · `social`). A character with balanced attribute investment receives all native abilities. A character with low scores in one attribute category does not automatically receive the natives tied to that category — those must be purchased with a skill point to unlock.

*Design intent: attribute decisions have character-identity implications beyond raw bonuses. A physically-specialized umbral starts with Shadowstep and The Long Dark (body-in-dark). A mentally-specialized umbral starts with Concealment, The Dark Knowing, and Shadow Work (mind-in-dark). Both are legitimate umbral characters.*

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

- **~190 abilities** (post-architecture-v2 compression; see migration note), each stamped with `tradition`, `levelReq`, `energyCost`, `functions[]`, `axes{}`, `notFor`, `nativeOrCombination`, and a `tree` of ranks. Engine groups by `tradition` on the learn screen and skill wheel — **never by `powerSystem`/reach.**

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

**Energy cost discount:** existing formula unchanged — `−1 per two character levels and −1 per rank, floored at ⌈½·base⌉`. Rank progression through use now also drives the energy discount, without any point spend.

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
   - **Action-pattern:** you have been doing this kind of thing consistently. The system (via `practice.js`) tracks use and co-activation; the GM is informed when a threshold is crossed. *An umbral who hunts regularly eventually sees Shadow Strike become available.*
   - **Proximity:** sustained engagement with people, places, or practices of the secondary axis. *An umbral who trains alongside marchers for months sees Shadow Strike become available through proximity rather than independent pattern.*

2. **Point spend** — formally claims the combination. Walks through the door the narrative opened.

*This separation means players cannot purchase combinations the story hasn't supported (post-creation), and cannot be locked out of combinations they've clearly earned. The narrative threshold is a lock; the point spend is the key.*

### 7.5 — Discovery (Emergent Combinations — unchanged)

The existing emergence system via `practice.js` and `combination_recipes.json` is unchanged. Axis-touch combinations (§7.3) are **pre-authored** with known unlock conditions. Emergent discoveries are **minted by the engine** from use/co-activation patterns hitting recipe thresholds. Both systems coexist; they are different classes of thing.

> *Pre-authored: "I've been hunting; I can now learn Shadow Strike."*
> *Emergent: "I've been using Shadowstep and The Edge together, and something new crystallized from that."*

The engine mints emergent discoveries; the model supplies the words. Once known, it is `+20` instead of `−15` (§4). This law is unchanged.

---

## NEW §7b — Skill Challenges and Direct Opposition

*Insert after §7, before §8.*

## 7b. Skill Challenges and Direct Opposition

### What this is

A formal encounter type for pitting abilities against each other directly. Not one character rolling against a difficulty — two abilities contesting the same outcome. The axis pair system built natural rivalries into the world; skill challenges give them mechanical expression. The coliseum makes them spectator events.

This extends `encounters.js` (which already owns "typed multi-round structures — duel/challenge/puzzle"). Skill challenges are a new encounter subtype.

### Three challenge types

**Direct opposition (axis enemies)** — the natural duel of opposing pole traditions. One ability expresses; the opposing ability tries to overwhelm or prevent that expression. The axis pair system defines which pairings are natural rivals.

*Examples: Concealment (umbral) vs. Radiance (blazeborn) — the canonical dark/light contest. Wildcraft (churnfolk) vs. Latticework (lattice) — chaos vs. order. Falsecraft (veilwright) vs. Verity (verist) — constructed reality vs. the word that cannot be false. Pathos (threnodist) vs. Logos (syllogist) — feeling vs. proof.*

**Functional opposition (cross-axis)** — different traditions contesting the same function. Neither is fighting the other directly; they're contesting an outcome.

*Examples: Concealment vs. Tracking — umbral hides; horizon or rootkin tracks. Shadow Strike vs. Perfect Motion — attack without source vs. movement without wasted position. The Proved Position (syllogist) vs. The Necessary Case (cogitant) — two kinds of airtight argument, arguing against each other.*

**Parallel expression** — two traditions performing the same function, compared. One function, two idioms; who does it better under these conditions?

*Examples: Two healers in a healing trial (rootkin vivimancy vs. numinous meaning-restoration vs. veilwright better-story). Two navigators finding the same route (horizon spatial mastery vs. cogitant modeled path vs. hourkeeper through the gap in time).*

### Why rank matters in opposition

The rank-through-use system creates characters with genuinely different depth in their abilities. Skill challenges give that depth stakes beyond personal power:

- **Rank 3 vs. Rank 1** — significant advantage to the higher rank; the lower-rank practitioner must find an angle
- **Rank 2 vs. Rank 2** — the most interesting contest; environment, secondary abilities, and idiom become deciding factors
- **Rank 3 vs. Rank 3** — a true duel between masters; outcome depends on the specific interaction of approaches, terrain, and conditions

Players have a reason to commit to depth: rank 3 matters not just for what you can do, but for who you can best.

### Environmental conditions as a third factor

Every skill challenge declares environmental conditions that advantage one or neither side. Environment is part of the challenge definition, not an afterthought. The GM (or the structured challenge definition) sets conditions before resolution.

| Condition | Favors |
|---|---|
| Total darkness | Umbral (Concealment, Dark Knowing); Ashwarden (death-sense extends here) |
| Full light | Blazeborn (Radiance, revelation) |
| Dense substrate | Continuous-type traditions (high affinity); hinders Returned-type |
| Thin substrate | Returned-type traditions; hinders Continuous |
| Living terrain | Rootkin; Threnodist (living things feel) |
| Stable ordered space | Lattice |
| Chaotic / collapsing space | Churnfolk |
| Great distance | Horizon |
| Emotionally charged situation | Threnodist; hinders Syllogist |
| High symbolic / sacred density | Numinous; Seraphic |

*Cross-reference §9b: substrate density is already tracked per region. Skill challenge resolution reads the same substrate data.*

### Vulnerability disclosure

Every ability has conditions under which it is harder to use or more easily countered. Ability descriptions **must gesture at their limits** — this is not a weakness list for players to exploit, but an honest account of what the ability is. The ability that has no conditions under which it struggles is not interesting to challenge.

*Concealment holds until the light comes. The Long Reach works until the distance collapses. The Proved Position holds until the premise is challenged. The Offered Price works until the target has nothing to want.*

`notFor` in the ability schema already carries this. The skill challenge system reads `notFor` as a signal for condition-setting when structuring a direct opposition challenge.

### Resolution

```
1. Declaration   — Ability A (rank X, tradition T1) vs. Ability B (rank Y, tradition T2)
2. Conditions    — environment, substrate density, any active modifiers declared
3. Contest roll  — each side: ability rank bonus + relevant attribute + environmental modifier
                   rank bonus: rank 1 = 0 · rank 2 = +10 · rank 3 = +20
                   (integrates with §4 successChance formula — substratePenalty applies)
4. Outcome       — one prevails · both affected · standoff requiring another exchange
5. Consequence   — story result, not just mechanical. What did the crowd see?
                   What does it mean that the concealment held?
```

The d100 and degree system (§4) applies. `encounters.js` owns resolution — `duelRound` and `challengeStage` already exist; this adds `directOppositionRound` as a new method.

### The Coliseum

A location type — possibly several in the world — where skill challenges are witnessed. The Coliseum is where:

- Traditional axis rivalries are tested formally and publicly
- New combinations become visible (an umbral-marcher combination steps in and the crowd learns what's possible)
- Reputation is built through demonstrated depth of skill
- The world learns what the traditions can do against each other

The Coliseum probably exists wherever two strong traditions have historically met and wanted to test themselves without war. Individual colosseums may specialize by axis: the canonical dark/light rivalry has its own dedicated venue; order vs. chaos has another near the Lattice-Cities.

*Content (location definitions, challenge types, spectator rules) lives in `content/packs/` per Law 2. `encounters.js` handles the resolution; it never hardcodes which coliseum offers which challenges.*

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

### Ability `attribute` field — add attribute category tag

Native abilities each carry `"attributeCategory": "physical" | "mental" | "social"` for use in the attribute-gating logic at domain selection. This field is only read for native abilities; ignored on combinations.

```json
{
  "attributeCategory": "mental"
}
```

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

### Modules that require changes

| Module | Change required |
|---|---|
| `progression.js` | `learnAbility`: apply native grants at domain selection without point spend, respecting attribute gate. `rankUpAbility`: rename/replace with `markPracticedUse` and `markDefiningMoment` (GM-triggered, no point spend). Add `surfaceCombinationUnlocks` (reads `practice.js` thresholds; surfaces available combinations). |
| `skilltree.js` | Add `LOCKED / AVAILABLE / OWNED_1 / OWNED_2 / OWNED_3` states. Add `nativeGrantsFor(tradition)` — returns attribute-gated native ability list. Add `combinationsAvailableFor(tradition, practiceState)` — returns unlocked combinations. **NEVER** auto-grant combination abilities; always require explicit player take. |
| `practice.js` | Add `combinationThresholdMet(abilityId, practiceState)` — returns bool. Existing `ripeCombos` and `ripeBranches` already emit emergence notices; add parallel `ripeAxisTouchCombinations` for the pre-authored type. |
| `encounters.js` | Add `directOppositionRound(abilityA, abilityB, conditions)` — resolves one round of a skill challenge. Add `buildSkillChallenge(def)` — constructs a skill challenge from a declared `def` (type, abilities, conditions). **NEVER** rolls its own d100 — routes through `resolve.js`. |
| `random_encounters.js` | Add `synthesizeSkillChallengeDef` — extends existing `synthesizeChallengeDef` for the direct-opposition subtype. |
| `gm.js` | Skill challenge declarations surface as a new intent type (`direct_opposition_challenge`). Add to `parseIntent`. GM prompt context includes active skill challenge state when in one. |
| Content CI (`check_pipeline.py`) | Add validation: every ability has `nativeOrCombination`, `rankProgression`, `rankThresholds`. Every combination ability has `combinationAxis` and `unlockCondition`. Every native ability has `attributeCategory`. |

### Modules unchanged

`resolve.js` · `sense.js` · `gambit.js` · `intensity.js` · `affinities.js` · `substrate.js` · `traditions.js` · `evolution.js` · `canon.js` · `sync.js` · `party.js` · `worldtime.js` · `state.js` · `art.js` · `claude.js` · `generate.js` · `genschema.js` · `worldmap.js` · `worldtick.js` · `legends.js` · `npcs.js` · `places.js` · `vectors.js` · `inventory.js` · `quests.js` · `codex.js` · `facts.js` · `namematch.js` · `backfill.js` · `reconcile.js`

---

## MIGRATION NOTES (breaking changes)

### Ability content migration

**Tiered-same-action collapse.** Multiple abilities that were the same action at different power levels (e.g. Blazeborn: Radiance + Kindle; Ashwarden: Wither + The Grey Hand; Churnfolk: Tilt + The Long Odds) collapse into single abilities with rank progressions. The content count drops; the rank text replaces the duplicate ability entries.

**`nativeOrCombination` classification.** Every existing ability must be tagged. Gap abilities authored in SNG-096 are mostly axis-touch combinations; they get `nativeOrCombination: "combination"` and appropriate `combinationAxis`. Existing abilities that were tradition-native stay `"native"`.

**No `rankProgression: "spend"` abilities should exist after migration.** The `spend` value is reserved for legacy compatibility only. Content CI should warn on any ability where `rankProgression === "spend"`.

### Save compatibility

`reconcile.js` must handle saves that have abilities at rank 2 or 3 via the old point-spend system. These saves should be migrated: mark those abilities as `OWNED_2` or `OWNED_3` without requiring re-earning (the player already earned them; stripping them is a violation of Law 14 — "a repair is not an advance"). Add a `backfillVersion` step.

---

## BUILD ORDER

1. **Schema extension** — add new fields to ability schema; update content CI to validate all required fields. Green before any content migration.
2. **Ability content audit + classification** — tag every ability `native`/`combination`; add `attributeCategory` to natives; collapse tiered-same-action duplicates into single abilities with rank progressions. New content CI gate: all required fields present.
3. **Combination authoring pass** — for each tradition: identify 3–5 natural axis-touch combinations; author with `unlockCondition`. These are the pre-authored axis-touch tier (not the cross-pole braids, which are unchanged).
4. **`progression.js`** — native grants at domain selection; replace `rankUpAbility` with use-based marking; `surfaceCombinationUnlocks`.
5. **`skilltree.js`** — new ability states; `nativeGrantsFor`; `combinationsAvailableFor`.
6. **`practice.js`** — `combinationThresholdMet`; `ripeAxisTouchCombinations`.
7. **`encounters.js` + `random_encounters.js`** — `directOppositionRound`; `buildSkillChallenge`; `synthesizeSkillChallengeDef`.
8. **`gm.js`** — `direct_opposition_challenge` intent; skill challenge context block.
9. **Coliseum content** — location definitions, challenge type definitions, spectator/reputation hooks.
10. **Skill tree display** — implement new states in `app.js`; show unlock conditions; LOCKED/AVAILABLE distinction.
11. **`reconcile.js` backfill** — migrate existing saves with spend-purchased ranks to the new state model.

---

## OPEN QUESTIONS FOR CCODE REVIEW

1. **`rankUpAbility` in `progression.js`** is called from `app.js` on point spend. Under the new model, rank advancement is GM-triggered, not player-triggered. What is the right UX for GM marking a rank? Does the GM ops schema need a new `markRankUp` op type? Or does the GM propose it and the player confirms?

2. **Attribute-category gating at creation.** `skilltree.js` currently has `tierOf` and `gateFor`. The attribute gate for native abilities is new. Does this belong in `skilltree.js` (as a gate type) or `progression.js` (as part of the native-grant logic at domain selection)?

3. **`practice.js` threshold tuning.** Action-pattern thresholds (how many uses, of what quality, before a combination surfaces as available) need numeric values. What's the right number? Suggest: 5 meaningful uses for action-pattern; 3 sessions of proximity for proximity-type. CCode to propose based on existing practice ledger data.

4. **Skill challenge rank bonus.** Proposed: rank 1 = +0, rank 2 = +10, rank 3 = +20 (on top of the existing successChance formula). Does this create balance problems against the existing ability rank bonus of `+5/rank` in successChance? These might stack in a way that makes rank 3 overwhelming. CCode to check against the §4 formula.

5. **Content count after collapse.** The spec currently says 137 abilities + 44 combinations. After tiered-same-action collapse and reclassification of combinations, what's the expected count? CCode to verify against HEAD after Step 2 above is complete and update the §7 header count.

6. **The `notFor` field and challenge condition-setting.** Is `notFor` already machine-readable enough for `encounters.js` to use as condition input, or is it currently free-text narration only? If free-text, the vulnerability-disclosure requirement (§7b) needs a structured companion field.
