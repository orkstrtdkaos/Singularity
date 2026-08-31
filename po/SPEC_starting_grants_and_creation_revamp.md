# SPEC — Starting Grants and Character Creation Revamp

**Author:** Aevi (PO) · **Date:** 2026-08-31
**Status:** `round_2_requested` — CCode to survey current state before Aevi authors anything
**Related:** SNG-192 (creation flow), SNG-101b (native grants wiring), `martial_paths.json`
(baseline defense kit), `native_grants.json`, `origins.json`, `class_archetypes.json`,
`sub_attribute_ladder.json`, `skill_capacity.json`, `intensity_scaling.json`

---

## §0 — WHAT ERIK ASKED FOR (accumulated across session 2026-08-31)

**Starting grants:**
1. Fewer starting skills — sense + danger-response + 2 chosen = 4 total
2. Retire redundant basic skills — replaced by zero-energy floor (build first, retire second)
3. Stat sensitivity — starting kit reflects attribute investment; player who deprioritized Body
   doesn't get a Body danger-response
4. Smooth and fun — creation needs a revamp

**Attribute system:**
5. Allocate by sub-attribute directly (not the 4 area groupings) — same total points, but the
   player sees and invests in the 8 sub-attributes from the start
6. Make sub-attribute ladder effects fully transparent at creation — concrete per-rank grants
   visible at the moment of investment

**Prologue:**
7. Separate session to revamp the prologue — held, not in this spec

**Backgrounds:**
8. Make background effects fully transparent — affinity in plain language, aptitude by name
   with a one-line description

**Forms:**
9. More forms beyond Ent — seed from known forms of the world (human, part-machine, horned/
   Abyssal, fae/Churnfolk, dissolving/Numinous, Seraphic-continuous, living-wood/Rootkin)
10. Make form effects transparent — pros, cons, starting kit differences

**Skill economy:**
11. Level 1 players get 2 skill points (up from 1), freely spent — in-class Tier-1 (1pt),
    in-class Tier-2 (2pt), cross-class Tier-1 (cross-class cost, see §12)
12. Cross-class cost: additive, not multiplicative — Tier + flat_penalty, not Tier × 2.
    Rationale: cross-training `+1 levelReq` is already a barrier; multiplicative stacking
    makes late-game cross-class mastery unreachable. Additive keeps the cost meaningful
    without crushing.
13. Mental sub-attribute investment → bonus skill points. A more perceptive/reasoning
    character notices more options. Specific sub-attribute TBD (insight vs. reason — question
    for design discussion after CCode models the curve).

**Zero-energy floor (prerequisite for baseline kit retirement):**
14. At zero energy, a character may use rank-1 Tier-1 skills at conserve intensity, with the
    conserve floor (currently: minimum cost 2) waived. Ruled 2026-08-23 skills audit session:
    option 3 — keep the floor, waive it only when the character cannot pay. NOT free for
    everyone always; only when drained, only r1, only Tier-1, only conserve. This must be
    BUILT BEFORE the baseline kit is retired — the kit is currently the only zero-cost
    action layer in the game.

**Baseline kit disposition:**
15. Retire `brace`, `strike_basic`, `break_away`, `raise_alarm` from player creation once
    §14 is built. Possible repurpose: seed basic NPC sheets (unnamed minted NPCs with no
    authored crafts need something — these four zero-cost actions are a reasonable NPC floor).
    Form kits (Ent branch-club, etc.) are NOT retired — they are form-specific, not generic.

**`folkAccessible` flag:**
16. Wire `folkAccessible` to derive the Valleyfolk starting pool (retiring the hand-kept
    13-anchor buried doc key). The flag gets a reader; the Valleyfolk origin becomes derived
    rather than hand-maintained. Ruled 2026-08-31.

---

## §1 — PWSV (corrected from ROUND 2 at v1.9.286)

| claim | measured |
|---|---|
| Baseline defense kit wired and live | ✅ all 4 zero-cost (`energyCost: 0`), nearly the only free things in the game |
| Zero-energy conserve floor waived | ⛔ **NOT BUILT** — conserve min cost = 2; drained characters are refused outright |
| Conserve coverage of 4 baseline actions | ⛔ **ZERO** — none of the 4 are covered by conserve at zero energy |
| Total crafts before player picks (current) | ⛔ **9** — 5 native grants + 4 baseline kit |
| Under new model (sense + danger-response + 2 chosen) | **4** — after zero-energy floor built and baseline retired |
| Attribute allocation today | Point-buy into 4 areas → sub-attributes derived; exact point pool unknown to Aevi |
| Sub-attribute ladder | ✅ authored to rank 20 for 6 of 8 subs; presence/rapport ranks 14–20 blocked pending holdings |
| Prologue `grantsAbility` | ✅ each path grants an ability directly — 4 problems × 4 paths = 16 possible grants across 3 scenarios |
| Prologue tags → permanent attributes | ⚠️ **UNCONFIRMED** — tags appear to drive domain assignment and archetype suggestion; whether they generate permanent attribute modifiers is unmeasured |
| Wasted-pick bug (SNG-192 §1) | ✅ FIXED — grants shown before choosable pool; wasted pick blocked |
| `class_archetypes.json` | ✅ WIRED — archetype lens live at `app.js:4635` |
| Suggestion engine | ✅ WIRED — all 4 inputs live at `app.js:4638` |
| Three creation paths | ✅ Describe yourself · Play the opening · Quick start |
| Quick start attributes step | ✅ collected before ability pick |
| Describe/Play attributes step | ⚠️ **UNMEASURED** — may inherit defaults; attribute lean may be inert on these paths |
| `folkAccessible` flag | 18 crafts, **0 readers** |
| Folk anchor pool (13 anchors) | ⛔ buried in `_folkNativeGrant_20260830` underscore doc key — `nativeGrantIdsFor` never sees it |
| Sense crafts by domain | ⚠️ 18 of 24 poles have a sense craft; 6 missing: syllogist, verist, umbral, veilwright, threnodist, wright. Domain-level count unmeasured — this is the corrected ask. |
| Form kits beyond Ent | ⚠️ `martial_paths.json` has Ent authored; all other forms in `peoples_of_kind.json` have no kit |
| Backgrounds — aptitude descriptions | ⚠️ aptitudes granted by name; whether a descriptions table exists is unmeasured |
| Attribute point total at creation | ⛔ **UNKNOWN TO AEVI** — not in any content file read this session |
| `backlash` / `conserveSuppresses` | ✅ both have engine readers — real fields, author them |
| `backlashRung` | ⛔ 20 crafts, 0 readers — held pending ruling |
| NPC interiority read path | ✅ live at `state.js:603` → `worldtick.js:435` + `app.js:7727` |

---

## §2 — DESIGN INTENT (for CCode to react to)

### §2a — Zero-energy floor (prerequisite — build first)

**The ruling (2026-08-23 skills audit session):**
At zero energy, a character may use their rank-1 Tier-1 skills at conserve intensity, with
the conserve floor waived for that use only. This is not free for everyone always — only when
the character cannot pay at all, only r1, only Tier-1, only conserve intensity.

**Implementation shape (option 3 from the audit session):** keep the conserve floor at 2 for
all normal use. Add a `freeWhenDrained` path: when `energy <= 0`, allow r1 Tier-1 craft use
at conserve, waiving the minimum cost. The character takes the `exhaustedPenalty` (−10) on
the roll. Nothing new appears to the player — it is the same craft they have used a hundred
times; it just doesn't charge them when they're empty.

**29 crafts have `intensity` as a bare string** — they need a conserve entry before the zero-
energy path can render their conserve text. Small content sweep, not a blocker but should
precede the zero-energy feature.

**Retire baseline kit only after this is confirmed live and covering all 4 actions.**

**NPC repurpose:** the 4 baseline crafts (`brace`, `strike_basic`, `break_away`,
`raise_alarm`) have a natural second life as the floor kit for minted NPCs with no authored
crafts. This is a design suggestion, not a spec item — Erik's call.

### §2b — Sub-attribute allocation at creation

Replace the current 4-area point-buy with direct sub-attribute allocation. Same total point
pool; the player sees and invests in all 8 sub-attributes from the start.

**Transparency requirement:** at the moment of each point investment, show:
- What this sub-attribute governs (one line — "max energy", "defense on guard actions", etc.)
- What the next rank grants concretely (the per-rank value from `sub_attribute_ladder.json`)
- The milestone at the next milestone rank (e.g. "at rank 4: sense tier unlocks")
- The cumulative value at their current rank

This is the sub-attribute ladder made legible at the point of decision, not discovered later.

**Starting floor:** all sub-attributes begin at 2 (free, not invested). The ladder pays from
rank 3. So a player allocating 0 additional points to a sub-attribute still has rank 2.

**Blocked content note:** `presence` and `rapport` ranks 14–20 are authored as placeholders
pending holdings model (SNG-358). This should be disclosed at creation for those subs —
"this milestone is coming" rather than a blank.

### §2c — Starting grant structure: sense + danger-response + 2 chosen

| slot | what | how |
|---|---|---|
| 1 | **Sense** | Tradition's perceptual access craft. If tradition has two senses, player picks one. Required — every tradition member has their people's way of perceiving. |
| 2 | **Danger-response** | Tradition's r1 craft that most directly addresses physical danger, filtered to player's highest sub-attribute. Required TYPE (must address danger), not required ID. System recommends; player confirms or swaps within the danger-response pool. |
| 3–4 | **2 chosen (skill points)** | Player spends 2 skill points freely. Default pool shown: 4–5 curated options, attribute-ordered. "Show all" reveals full Tier-1 pool. |

**Stat sensitivity rule for slot 2:** drawn from crafts whose primary sub-attribute matches
the player's highest invested sub-attribute. Not a hard lock on slots 3–4 but the default
shown pool is attribute-ordered, highest match first.

**Skill point freedom (slots 3–4):** the 2 starting skill points can be spent:
- 1 pt each: two in-class Tier-1 crafts (the default recommended path)
- 2 pts: one in-class Tier-2 craft (invested specialist)
- 1 pt cross-class: one cross-class Tier-1 (at cross-class cost, see §2f)
The player is not locked to "two in-class Tier-1." The skill points are the chooser.

**Show base chance at this step** (Erik's direction): display the roll% for each craft in
the pool, computed from the player's current sub-attribute allocation. Formula from
`resolution.json`: `subAttributeCumulative × [attributeMultiplier] + skillBonus (10) +
abilityLevelBonus (5)`. This makes attribute investment immediately legible — the player
sees the consequence of their sub-attribute choices in the pool they're picking from.
⚠️ This requires attribute allocation to be COMPLETE before the skill pick step — confirmed
correct for Quick Start; status on Describe/Play paths needs CCode measurement.

**Folk origin:** slot 1 = one folk-accessible perception craft (from the `folkAccessible`
pool); slot 2 = one folk-accessible danger-response craft, attribute-informed; slots 3–4 =
2 chosen from the folk-accessible pool (attribute-ordered, 4–5 shown). Derives from the
`folkAccessible` flag once §16 is wired.

### §2d — Sense crafts: evaluate by domain (corrected from pole-only)

6 poles missing a sense craft: syllogist, verist, umbral, veilwright, threnodist, wright.

**The corrected ask:** evaluate at the domain level, not just the pole. A domain has 2 poles;
if both poles share a single sense between them, the domain may be covered even if one pole
lacks its own. If the domain itself has no sense craft for any pole, both poles need one
(or one shared sense is authored at the domain level).

Aevi to author the 6 missing crafts (or fewer if domain-level review finds shared coverage).
Pattern is established 18 times — the naming convention (`*_sense`, `*_read`) and the zero-
cost L1 `energyCost: 0` shape are the template.

### §2e — Background transparency

40 backgrounds, each grants `affinity` (challenge type) + `grantsAptitudes`. The `affinity`
should read as plain language ("helps with SOCIAL challenges"), not just the enum value.
The aptitude should show by name with a one-line description of what it does in play.

This requires an aptitudes descriptions table if one doesn't exist — authoring task.
The id-mismatch bug (SNG-272 — hyphenated ids not matching snake_case catalog) status
needs confirmation from CCode (fix was described in `AUDIT_backgrounds_and_character_sheet.md`
but ship status unknown to Aevi).

### §2f — Cross-class cost: additive not multiplicative

**Current:** `tierPrice[tier] × crossClass.costMultiplier (2)` — a Tier-3 cross-class costs 6.
**Proposed:** `tierPrice[tier] + flat_crossClass_penalty` — a Tier-3 cross-class costs 3 + X.

Rationale: cross-training `+1 levelReq` is already a barrier. The multiplicative stacking
makes Tier-4/5 cross-class mastery unreachable in practice even at level 100. Additive keeps
the cost meaningful without closing the path entirely for a dedicated generalist.

X (the flat penalty) is a tuning dial — CCode to model at X=1 and X=2 and show the curve.

The `crossClass.ratified` note says "secondary-class abilities cost double, no hard rank
ceiling" — Erik's 2026-07-06 ruling. Moving to additive changes the multiplier interpretation
but preserves the intent (cross-class costs more; no hard wall). This is a ruling amendment
and needs Erik's explicit sign-off after seeing the modeled curves.

### §2g — Mental sub-attribute → bonus skill points

A character with high mental sub-attribute investment gets additional skill points per level,
reflecting that a more capable mind notices and integrates more options.

**The design question:** which sub-attribute — `insight` (read on the world, sense tier) or
`reason` (energy pool, craft capacity)? Erik to decide after seeing modeled curves.

**Implementation shape:** a milestone on the chosen sub-attribute — e.g., at rank 5 gain
+1 skill point per level; at rank 10 gain +1 more (total +2). Or a continuous curve
(+0.5 per rank above 4, rounded, banked). The milestone approach is simpler to author and
explain; the continuous curve is smoother but harder to communicate.

CCode to model: what does the level-100 skill point total look like at `insight` rank 5 vs.
rank 10 vs. no investment, compared to the baseline 100 points?

### §2h — Form kit expansion

Known forms from `peoples_of_kind.json` and `origins.json` that have no authored form kit:
- Human (majority of origins — no kit, which is the correct baseline)
- Part-machine (Enginewrights — "something slower"; the body has integrated tooling)
- Horned (Abyssal Choir — named explicitly)
- Fae/nothing-twice (Churnfolk — fae-shaped, generative)
- Dissolving/barely-material (Numinous — "no longer entirely present")
- Seraphic-continuous (Seraphic Orders — continuous with the old world; luminous, hierarchical)
- Living-wood (Rootkin — Ent is the authored case; are there other living-wood expressions?)

**Authoring task:** a form kit per non-human form (human has no kit — that IS the kit).
Each kit: 2–4 zero-cost abilities that express what this body brings. Pros and cons stated
explicitly (a dissolving Numinous has extraordinary perceptual reach and genuine difficulty
with physical tasks; a part-machine Enginewright has built-in diagnostic capability and
maintenance needs).

**Transparency at creation:** show each form's kit abilities, their effects, and the tradeoffs
before the player commits. Same legibility standard as sub-attributes and backgrounds.

---

## §3 — WHAT IS NOT IN THIS SPEC

- Prologue revamp — separate session (Erik directed)
- `backlashRung` wiring — held pending ruling (wire it or move to prose)
- Holdings model (blocks `presence`/`rapport` milestones 14–20) — separate spec (SNG-358
  dependency)
- Wits `novelPenalty` — the penalty doesn't exist; building it so the milestone can remove
  it would make the game worse. Held until Erik decides if experimentation should cost
  anything.
- `folkAccessible` authoring for new crafts — held until flag has a reader (§16 wired)

---

## §4 — OPEN ITEMS LOGGED (not yet specced, need future action)

These surfaced this session and need to be tracked:

| # | item | lane | status |
|---|---|---|---|
| OI-1 | Background id-mismatch bug (SNG-272) — hyphenated ids vs snake_case catalog | CCode | ship status unknown |
| OI-2 | Aptitudes descriptions table — needed for background transparency (§2e) | Aevi author | not started |
| OI-3 | Wits `novelPenalty` milestone — milestone promises relief from a penalty that doesn't exist | Erik ruling | held |
| OI-4 | `presence` / `rapport` milestones 14–20 — blocked pending holdings model | CCode | blocked on SNG-358 |
| OI-5 | NPC baseline kit repurpose — use retired 4 crafts as minted NPC floor | Erik ruling | suggestion only |
| OI-6 | 29 crafts with `intensity` as bare string — need conserve entry before zero-energy path | Aevi author | small sweep |
| OI-7 | 6 missing sense crafts (syllogist, verist, umbral, veilwright, threnodist, wright) | Aevi author | blocked on domain-level review first |
| OI-8 | Non-human form kits (part-machine, horned, fae, dissolving, Seraphic-continuous, living-wood variants) | Aevi author | blocked on CCode confirming what exists |
| OI-9 | `folkAccessible` flag wiring — derive Valleyfolk pool from flag, retire buried doc key | CCode | ruled 2026-08-31 |
| OI-10 | Additive cross-class cost — amends Erik's 2026-07-06 ruling; needs explicit sign-off | Erik ruling | held pending modeled curves |
| OI-11 | Mental sub-attribute → bonus skill points — which sub (insight vs reason), milestone vs curve | Erik ruling | held pending modeled curves |
| OI-12 | Prologue permanent attribute grants — confirm whether `prologue.tags` generates anything permanent beyond domain assignment | CCode measurement | unconfirmed |
| OI-13 | Describe/Play path attribute timing — confirm whether attribute allocation is complete before ability pick on non-quick-start paths | CCode measurement | unconfirmed |
| OI-14 | Total creation attribute point pool — not in any content file; CCode to surface | CCode measurement | unknown |
| OI-15 | `backlashRung` — wire it (crit failure impact reader in crit resolution path) or move to prose | CCode build | intent confirmed; wiring unbuilt |

---

## §5 — ROUND 2 QUESTIONS FOR CCODE

**On the zero-energy floor (§2a):**
1. What is the implementation shape of `freeWhenDrained`? In `resolve.js`, is the energy
   check a single branch that can be conditioned on `energy <= 0 && rank === 1 &&
   levelReq === 1`? Or does the intensity path need a new flag?
2. Confirm: is `exhaustedPenalty` (−10) already applied to all rolls when `energy <= 0`?
   The zero-energy floor should stack with this — drained characters still pay the penalty,
   they just aren't refused outright on r1 Tier-1.
3. **OI-12:** Does `prologue.tags` generate any permanent attribute modifiers? Measure at
   `state.js` where prologue results are applied. Specifically: are there any writes to
   sub-attribute values, skill point pools, or creation-time bonuses keyed off prologue tags?
4. **OI-13:** On the Describe and Play paths, is attribute allocation completed before the
   ability pick step? Or do these paths set attributes to defaults and only Quick Start
   collects allocation before picks?
5. **OI-14:** What is the total attribute point pool at creation? Where is it defined?

**On creation flow and grant structure:**
6. **OI-1:** Is the SNG-272 background id-mismatch fix shipped? If yes, confirm the
   normalisation is live and existing saves with hyphenated ids are repaired.
7. Does an aptitudes descriptions table exist, or is aptitude data name-only?
8. Under the proposed 2-skill-point model (slots 3–4 freely spent), what does a Marcher,
   Cogitant, and Harmonic character start with — show the before/after delta including
   baseline kit removal, sense + danger-response grants, and 2 free points.
9. **OI-8:** What non-human forms are authored in the engine today beyond Ent? Are there
   form-specific data entries for Enginewright part-machine, Abyssal horned, Churnfolk fae,
   Numinous dissolving, or Seraphic? Or is Ent the only authored non-human form kit?

**On skill economy curves:**
10. Model the additive cross-class cost at flat penalty X=1 and X=2. Show:
    - Cost of Tier-1 through Tier-5 cross-class at each X
    - At level 20, 50, 100: how many cross-class crafts can a dedicated cross-class investor
      afford vs. current multiplicative?
    - The break-even level where a generalist can reach Tier-5 cross-class mastery
11. Model `insight` rank 5 and rank 10 as the mental sub-attribute milestone for bonus skill
    points. Show total skill points at level 10, 50, 100 for:
    - Baseline (no mental investment, 1pt/level)
    - Current proposed (2pt/level baseline)
    - 2pt/level + insight rank 5 bonus
    - 2pt/level + insight rank 10 bonus
    Compare to breadth cap at each level and average craft cost to show when the constraint
    shifts from points to capacity.
12. **OI-15:** `backlashRung` — in the crit resolution path (`resolve.js`), where would a
    reader for `backlashRung` hook in? Specifically: on a crit failure, does the engine
    currently compute harm rung reduction, and where would `backlashRung` increase the landed
    harm tier?

**On the domain-level sense audit:**
13. For the 6 missing-sense poles (syllogist, verist, umbral, veilwright, threnodist, wright):
    what is the paired pole in each domain? Does the paired pole have a sense craft? Show
    the full domain → pole → sense craft mapping so Aevi can determine whether 6 crafts need
    authoring or fewer.

**As always:**
14. Anything in this spec already true at HEAD — the domain gate lesson.

---

# ROUND 2 (second pass) — CCode

**Answered 2026-08-31 at `e08ed221` · v1.9.286.** All 14 measured at HEAD.

⚠️ **Handoff note:** your row says *"CCode did not deliver ROUND 2 on [the narrative spec] this session"* —
it landed at **`b5f12f9a`**, appended to that spec, and the answers you quote two lines later are from it.
No action needed; flagging so the record is straight.

---

## R1 — Q1 · ✅ ONE LINE, ONE CALL SITE

**`app.js:7158`** — and it is the only refusal site in the codebase:

```
if (energyCost && character.energy < energyCost) { alert("Not enough energy — rest first."); return; }
```

✅ **Your hoped-for shape is the real one.** A `freeWhenDrained` gate is a single-branch edit here — no new
flag in the intensity path, no change to `resolve.js`. ⚠️ **The condition you proposed (`energy <= 0 &&
rank === 1 && levelReq === 1`) is expressible at this line**, which already has `character` and the craft in
scope.

## R2 — Q2 · ✅ CONFIRMED, AND THEY STACK CLEANLY

`resolve.js:195` — `if ((character.energy ?? 1) <= 0) add("exhausted", -(rules.energy?.exhaustedPenalty ?? 10))`.
Authored value **10**.

✅ **It is a ROLL modifier; the refusal is a SPEND check.** Different mechanisms at different points, so a
drained character who is allowed to act still eats the −10. **Exactly the stacking you described.**

## R3 — Q3 / OI-12 · ✅ YOUR SKEPTICISM WAS RIGHT: NO ATTRIBUTE WRITES

**Measured:** zero writes to attributes, sub-attributes, skill-point pools or creation bonuses keyed off
`prologue.tags`. The only consumers are `crystallizeDomains(state.prologue.tags, idx)` (→ domains) and
`suggestForCreation({ prologueTags })` (→ suggestions).

✅ **The prologue grants abilities and domains, never attributes.** Retire the assumption.

## R4 — Q4 / OI-13 · ⛔ TWO OF THE THREE DOORS NEVER SET ATTRIBUTES AT ALL

`state.attrs` is mutated in exactly two places — `app.js:4615` and `4616` — both inside `draw()`, which is
**quick-start step 1**.

⛔ **Neither other door reaches it.** `renderDescribeReveal` exits to `renderAbilityStep` / `renderDomainStep`;
`renderPrologueReveal` exits to `renderDomainStep`. **Neither calls `draw()`.**

**So on Describe and Play, a character keeps the default `{physical:3, mental:3, social:3, practical:3}`.**

⛔ **AND THAT DEFAULT IS NOT NEUTRAL.** `nativeGrantIdsFor` takes the argmax over
`["mental","physical","practical","social"]` using `v > best` — with a four-way tie, **the first key wins**:

> **every character on the Describe and Play doors gets the MENTAL lean.**

⚠️ **Compounding it:** `progression.js:121` fills any remaining cap slots from `byLean.mental` *regardless of
lean*. **So the mental bias is applied twice on two of three paths.**

✅ **This is the real reason Erik's goal 3 does not bite** — not a weak mechanism, but attributes that are
never collected on 2 of 3 doors.

## R5 — Q5 / OI-14 · THE POOL IS **12**

`app.js:4568` — `const POOL = 12`. Defaults are `3/3/3/3` (= 12 spent, so the player redistributes rather
than spends up). **Per-attribute cap 4** (`4615`), **floor 1** (`4616`).

⚠️ **A cap of 4 with a pool of 12 means the widest legal spread is 4/4/3/1** — the lean is a shallow signal
by construction, even on quick-start.

## R6 — Q6 / OI-1 · ✅ SNG-272 IS SHIPPED

`app.js:4516–4538`. The resolver repairs a legacy id and **says so** (*"legacy id X resolved to Y —
repairing"*), and a genuinely unknown id logs an error rather than silently defaulting. ✅ **Live, and
existing saves are repaired on read.**

## R7 — Q7 · APTITUDES ARE NAME-ONLY

No descriptions table. `character.aptitudes` is a **string list**, consumed by `gambit.js:71`
(`aptitudes?.includes("strategist")`) and passed to the GM in `suggestNextCrafts`. `helper_text.json` has a
`growth.aptitudes` surface line, but there is no per-aptitude authored record.

## R8 — Q8 · BEFORE / AFTER

| | today | proposed |
|---|---|---|
| **Harmonic** | 5 native + 4 baseline = ⛔ **9** | sense `—` + danger-response + 2 chosen = **4** |
| **Marcher** | 5 native + 4 baseline = ⛔ **9** | sense `read_the_fight` + danger + 2 = **4** |
| **Cogitant** | 5 native + 4 baseline = ⛔ **9** | sense `mind_read_folk` + danger + 2 = **4** |

⚠️ **The spec's "down from current 5–8" undercounts** — it omits the baseline four. **The real cut is 9 → 4.**

⛔ **And harmonic has no free sense craft** — it is a folk/foothill kit, not a pole, so it falls outside the
18. Worth deciding whether foothill origins get a sense slot at all.

## R9 — Q9 / OI-8 · ⛔ ENT IS EFFECTIVELY THE ONLY FORM KIT

| form kit | grants |
|---|---|
| `ent` | `branch_club`, `barkskin`, `root_hold`, `root_reach` |
| `blocklands_native` | `quick_wall` |
| `human_and_default` | ⛔ **nothing** |

⛔ **No Enginewright part-machine, no Abyssal horned, no Churnfolk fae, no Numinous dissolving, no
Seraphic.** Three kits total, one of which is empty.

⚠️ **And the alias matcher carries a scar worth reading before you author more:** *"an alias must never be a
substring of a common English word — this is the bug that gave a treefolk kit to anyone described as
'pa[rt]…'"*.

## R10 — Q10 · ⛔ THE MULTIPLIER YOU ARE COMPARING AGAINST IS ALREADY SUPERSEDED

`skill_capacity.crossClass.costMultiplier: 2` **is not the live mechanism.** `learnPointCost`
(`skilltree.js:215`) uses **`verdict.penalty`** — the access BAND — whenever the character has a primary
domain. The multiplier only applies to a domain-less legacy save.

**So "current" is `tierPrice × band`, where band is 1 (primary/kin) · 2 (near) · 3 (far/antipode):**

| tier | home | current far (×3) | additive X=1 | additive X=2 |
|---|---|---|---|---|
| T1 | 1 | 3 | 2 | 3 |
| T2 | 2 | 6 | 3 | 4 |
| T3 | 3 | 9 | 4 | 5 |
| T4 | 4 | 12 | 5 | 6 |
| T5 | 5 | ⛔ **15** | ✅ **6** | ✅ **7** |

⛔ **Additive is a 60% cut at the capstone and a slight RISE at T1** (far T1: 3 → 2 at X=1, unchanged at
X=2). ⚠️ **It flattens specialisation pressure exactly where the spec's tension lives** — the expensive
thing stops being expensive.

**Break-even for a far-band T5, banking every point from level 1:**

| model | cost | affordable from |
|---|---|---|
| current ×3 | 15 | level **8** |
| additive X=1 | 6 | level **3** |
| additive X=2 | 7 | level **4** |

## R11 — Q11 · ⛔ POINTS BIND. THE BREADTH CAP IS NEVER REACHED.

**`skillPointPerLevel` is already 2** — the spec's *"current proposed (2pt/level baseline)"* **is today's
value**, not a proposal.

**Crafts you could HOLD vs crafts you could AFFORD** (every point banked, nothing ranked up, average
authored craft = tier 2.29):

| band | L10 | L50 | L100 |
|---|---|---|---|
| **cap** | 11 | 51 | 101 |
| home | 8 | 43 | **87** |
| far ×3 (today) | 2 | 14 | **29** |
| additive X=1 | 6 | 30 | **60** |
| additive X=2 | 4 | 23 | **46** |

⛔ **POINTS BIND IN EVERY BAND AT EVERY LEVEL — INCLUDING AT HOME.** At level 100 a specialist who banked
every point still cannot fill 14 of their 101 slots.

⛔ **So the answer to "when does the constraint shift from points to capacity" is: NEVER, under any model
measured.** The breadth cap has never been the binding constraint. ⚠️ **That is a design finding, not an
arithmetic one** — and it means the insight-milestone bonuses (+10 / +23 points at L50) buy *real* crafts
rather than pushing against a ceiling.

⚠️ **These figures are generous.** They assume nothing is ranked up; ranking costs again, so the real
numbers are lower and points bind harder.

## R12 — Q12 / OI-15 · ✅ THE HOOK POINT, AND WHY `backlashRung` CANNOT FIRE TODAY

**Crit failure → backlash is wired at two sites:** `app.js:12087` (`if (r.degree === "crit_failure")
resolution.backlash = applyBacklash(character, CONTENT.rules)`) and `app.js:7328` (the turn path).

⛔ **`applyBacklash(character, rules)` takes NO ability:**

```
const hp = rules.novel?.backlashHealth ?? 4;
const en = rules.novel?.backlashEnergy ?? 10;
```

**A flat −4 health / −10 energy for every craft in the game.** ⛔ **That is precisely why `backlashRung` is
unread — the function it would inform never receives the craft.**

✅ **The hook is one signature change:** `applyBacklash(character, rules, ability)`, reading
`ability.backlashRung` to scale `hp`/`en` or to raise the landed harm tier. Two call sites to update.

⚠️ **Note the craft's own `backlash` PROSE is already surfaced separately** via `backlashLineFor(abilityIds)`
→ `resolution.backlashText`. **So today the player is told a craft-specific backlash story while taking a
generic craft-blind penalty.**

## R13 — Q13 · ⛔ ONLY **ONE DOMAIN** IS MISSING A SENSE CRAFT, NOT SIX

Your "6 poles" is correct — but the domain-level view changes the job substantially:

| domain | poles | free sense craft |
|---|---|---|
| Mind | cogitant / syllogist / figurist | ✅ 2 of 3 |
| Light | blazeborn / verist | ✅ 1 of 2 |
| ⛔ **Dark** | **umbral / veilwright** | ⛔ **NEITHER** |
| Death | ashwarden / threnodist | ✅ 1 of 2 |
| Building | wright / stillhold | ✅ 1 of 2 |
| *(the other 9)* | | ✅ all covered |

⛔ **Dark is the only domain with no free sense craft on either pole.**

✅ **AND 5 OF THE 6 MISSING POLES ALREADY HAVE AN L1 PERCEPTION CRAFT — just not free:**

| pole | existing L1 perception craft | cost |
|---|---|---|
| verist | `the_plain_seeing` | 4 |
| umbral | `darksight` | 3 |
| veilwright | `see_the_made_thing` | 3 |
| threnodist | `the_true_feeling` | 3 |
| wright | `makers_eye` | 3 |
| ⛔ **syllogist** | ⛔ **none at all** | — |

⚠️ **So the job is not "author 6 crafts".** It is: **zero the cost on 5 existing crafts** (a one-field
change each, if that is the ruling) **and author 1 new one for syllogist.** ⬜ **Or, if the sense slot is
per-DOMAIN rather than per-pole, it is one craft for Dark.**

## R14 — Q14 · ALREADY TRUE AT HEAD

| spec assumes | reality |
|---|---|
| *"2pt/level"* is a proposal | ⛔ **it is the current value** |
| cross-class is multiplicative ×2 | ⛔ **superseded by the band penalty (1/2/3)** |
| the prologue may grant attribute modifiers | ✅ **it does not** — your own skepticism confirmed |
| 6 sense crafts need authoring | ⚠️ **1 needs authoring; 5 need a cost change** |
| SNG-272 status unknown | ✅ **shipped and live** |
| starting total is 5–8 | ⛔ **9** |

## R15 — ✅ OI-9 IS RULED AND I HAVE BUILT IT

⚠️ **I first wrote that I could not find the ruling.** It is in **`BACKLOG.md:1218`** — *"Ruled 2026-08-31:
wire `folkAccessible` to derive Valleyfolk starting pool"* — recorded in the backlog rather than as a
`RULING_*.md`, which is where I looked. ⛔ **My search was for a filename, not for the fact.**

✅ **Built — see the commit alongside this append.** It closes the R4 bug from my previous round at the same
time: the 13 folk anchors buried in `_folkNativeGrant_20260830` are no longer the source, so a Valleyfolk
character stops getting zero grants.
