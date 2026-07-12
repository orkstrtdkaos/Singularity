# SINGULARITY — System Specification v2.0

| | |
|---|---|
| **Status** | `draft` — Aevi (PO) authored the DESIGN + CONTRACT layers. **CCode owes ROUND 2: substrate-verify every claim against HEAD and fill every `[CCODE]` marker.** |
| **Supersedes** | System Specification v1.0 (which predates the great circle, traditions, domains, the generative world, shared canon, and ~20 of the 38 engine modules) |
| **HEAD at authoring** | v1.8.23 · 38 engine modules (363KB) · 18 core rules files · 92 locations / 24 regions · 137 abilities / 24 traditions · 41 NPCs · 9 companions · 58 encounters |
| **Authoring rule** | Aevi owns §2 (laws), §4–§18 (design + contracts), §21 (process). **CCode owns implementation detail** — module APIs, signatures, dispatch, data flow — marked `[CCODE]`. A claim in this document that contradicts HEAD is a **bug in this document**; report it. |

> **How to read this.** This is the *contract*, not the code. It states what each system is **supposed** to do and what must remain true. Where it says `[CCODE]`, the implementation is authoritative and CCode fills it. Where it states a **law** or a **floor**, the code must conform — not the other way round.

---

## 1. Vision
A single-player-and-family tabletop RPG run by a language model, in a world whose *physics is disposition*. The engine owns truth; the model owns voice. The world grows through play, remembers what you did, and can be shared with the people you love at their own content ceiling.

---

## 2. Design Laws (non-negotiable)

*Laws 1–8 are from v1.0 and stand unchanged. 9–14 are earned — each was learned by a real failure this cycle and is named with the failure so it is not re-learned.*

1. **The model never rolls, never decides outcomes, never edits state freeform.** It narrates engine receipts and proposes typed deltas the engine clamps. Every feature that touches state follows: **GM proposes op → engine validates/clamps → state changes.**
2. **Everything specific is content; the engine stays generic.** Locations, abilities, items, NPCs, events, companions, regions, quests, traditions = JSON/MD in `content/packs/` + a manifest entry. **Engine code never hardcodes content.**
3. **Additive-only schemas.** Every record carries `schemaVersion`. New fields ship with defaults and a `migrate()` step; fields are never repurposed. **Old saves must always load.**
4. **Permanence over novelty.** Scene state, NPC registry, place memory and codex are authoritative fact fed to the GM every turn. Additions are generativity; **contradictions are errors.** On doubt, keep the previous state.
5. **Graceful degradation everywhere.** Any AI failure yields a playable partial (salvage → fallback → error card with retry + preserved input). A hiccup never blocks play or loses player text.
6. **The game learns the player, not just the character.** Behavioural tendencies accrue and feed mechanics — aptitudes with bonuses *and* costs.
7. **Shared-world concurrency law.** A client writes only files it exclusively owns (its character, its profile) plus **append-only** ledgers with SHA-conflict retry. Region state is written only by world-tick consolidation.
8. **Secrets discipline.** Anthropic key and GitHub PAT live in localStorage only, never in a committed file. **This repo never touches the ErikIAm pipeline.**
9. **⛔ NOTHING COMMITS BEFORE THE PLAYER CONFIRMS.** *(Learned: creation imposed the domain, derived abilities from the imposed domain, and assigned a background outright — three symptoms of one missing boundary.)* Any multi-step choice accumulates in a **draft**; everything stays re-choosable; the player confirms; only then does state commit.
10. **⛔ CONTENT THAT IS NOT IN A MANIFEST DOES NOT EXIST — AND THAT MUST BE A BUILD FAILURE.** *(Learned: the manifest listed 6 of 89 locations and the live game ran on **six locations** for weeks, silently.)* The loader is a whitelist. CI must fail on: an unlisted file, a manifest path with no file, **and a `provides.*` key the loader does not handle** (which is how authored quests silently never loaded).
11. **⛔ READ THE SCHEMA BEFORE AUTHORING; READ ORIGIN BEFORE SPECCING.** *(Learned: 66 locations authored against a remembered `poleIntensity` shape; a whole batch specced on a premise that was already false at HEAD.)* Measurement precedes assertion — see §21.
12. **LOWER LAYER WINS.** Runtime > code at origin > ship reports > docs > this document. When they disagree, the lower layer is true and the higher one is a bug. The authenticated API is truth; **the raw CDN lags ~30s and is not.**
13. **THE FLOORS ARE ABSOLUTE AND RATING-INDEPENDENT.** See §17. No setting, ceiling, GM op, correction, promotion or lens may cross them.
14. **A repair is not an advance.** Self-healing tools (§13) fix what is *wrong*; they never grant power. Power comes from play.

---

## 3. Architecture

```
index.html ──> app.js  (all UI, screens, creation, play loop, sidebars, wheel)
                 │
                 ├── engine/*.js        38 modules, 363KB — pure logic, headless-testable
                 │
                 ├── content/packs/     ALL specific content (JSON/MD) + manifest.json per pack
                 │     ├── core/        rules/ · abilities/ · schemas
                 │     └── valley/      locations · npcs · companions · encounters · items · lore · events · quests
                 │
                 └── schemas/           JSON-Schema for every content type (CI-enforced — §20)
```

**Module map** *(sizes at HEAD; `[CCODE]` to confirm responsibilities and public APIs)*

| Module | Owns |
|---|---|
| `gm.js` (50KB) | The GM contract, prompt assembly, the 4-tier cache, op parsing/dispatch — §11 |
| `generate.js` (24KB) | `generate(type, context)`, `_gen` envelope, weight, tiers, `enforceFloors` — §13 |
| `worldtick.js` (19KB) | Offscreen advancement, news propagation, `syncSharedCanon` — §13 |
| `state.js` (17KB) | Content load (manifest whitelist), save/load, migration — §19 |
| `canon.js` (17KB) | Shared-world promotion, contradiction→rank, rating-lens — §13 |
| `quests.js` (15KB) | Quest state; **structured quests — §14** |
| `progression.js` (14KB) | XP, levels, learn-gates, **domain access (§6)**, discovery |
| `codex.js` (12KB) | Entity resolution (`resolveTopic`, `mergeCodexTopics`), facts |
| `art.js` (12KB) | Pollinations image pipeline, form-led prompts, cache — §16 |
| `traditions.js` (9KB) | The great circle: ring, distances, antipodes — §5 |
| `worldtime.js` (7KB) | Shared absolute clock, world-day vs journey-day — §10 |
| `canon`/`sync.js` (8KB) | `pushMergedFile`, character/ledger/region writes — §18 |
| *(remaining 27)* | `[CCODE: complete this table — one line each: what it owns, its public API, what it must never do]` |

---

## 4. Character & Resolution (the numbers)

- **Sub-attributes (8):** strength/agility · reason/insight · presence/rapport · craft/wits. Creation: 12 points across 4 parents (1–4) + 2 specialise points. Cap 20.
- **Chance** = attr contribution + skill×10 + abilityRank×5 + spectrum fit (alignment×15 + location×10, clamped ±25) + equipment (**best matching item only**, cap 10 — §15) + companion (+5/relevant, cap 10) + aptitude mods − difficulty (0/15/30) − exhaustion (−10 at 0 energy) − **novel surcharge (−15)** *or* **+ discovery bonus (+20)**. **Clamped 5–95.**
  - **Attr contribution: ×20/point through soft cap 4, +5/point beyond** — mastery buys power against hard rolls without trivialising easy ones.
  - **Novel vs discovery is a REPLACEMENT, not a stack.** The same action that cost −15 to improvise pays **+20** once it is a known discovery: a 35-point swing. *Reaching past what you know is dangerous; surviving it and repeating it makes it yours.*
  - **⚠️ OPEN BALANCE Q (Erik, parked for sensitivity testing):** at +20 a discovered technique ceilings out on most builds. Intended, or tune to +12–15?
- **d100 degrees:** crit ≤5 · success ≤chance · partial ≤chance+15 · failure · crit-fail ≥96 (novel widens by 3).
- **Trivial actions** (GM-marked or parser-detected; never ability/novel): no roll, no energy, no XP.
- **Sense tiers** by attunement (0/2/5/9): nothing → vibes → 5 bands → ~numeric. +1 tier if location matches alignment; Strategist +1 on planned.
- **XP** (engine-paid, per rolled action): crit 8 / success 5 / partial 3 / failure 2 / crit-fail 2, +3 novel. **Gambits 12/10/3 + completion bonus 10.** Quest completion 15–50 (GM-proposed, engine-clamped).
- **Level:** `xp ≥ level×100` → +1 attunement, +5 reserves, +1 banked sub-point, +1 skill point.
- **Energy:** each ability has a cost; 0 energy = −10 exhaustion, not a hard stop. `[CCODE: recovery curve]`

## 5. The Great Circle (the spine of the whole game)

**The world's physics is disposition.** Twelve axes; each axis is a *tension between two peoples*; each people bears one pole. `content/packs/core/rules/traditions.json` is authoritative — **the engine reads the ring from content and NEVER hardcodes it.**

- **24 pole-traditions** stand on a ring, **12 antipodal diameters, one per axis.** Every tradition has **identical topology**: exactly 2 ring-neighbours, exactly 1 antipode. *No people is structurally advantaged — this is fairness by geometry.*
- **Ring order is a dispositional gradient** (kin beside kin): dark → falsehood → demonic → chaos → destruction → death → violence → body → concrete → space → mechanical → logical → **LIGHT** → truth → angelic → order → creation → life → peace → mind → abstract → time → spiritual → emotional → (back to dark).
- **Distance metric:** `steps = min(|i−j|, 24−|i−j|)`. 0 = self · 1 = kin · **12 = your antipode**. **Distance IS dispositional distance IS geographic distance** — the map, the skill wheel and the access rules are one shape.
- **Folk traditions** (harmonic · radiant_folk · valley_craft) are **near-centre crossings** — folk-shadows of the great poles (canon: *"Prism Sight is folk-Radiance"*). Mechanically: **OPEN to anyone.** *The centre can hold a little of everything, because the centre of the world does.*
- **Precursor** sits **outside the pole matrix** — not an axis-people but the substrate the world is built on. Fiction-gated.
- **Cults of purity:** a civilisation lives *near* its pole; only a **cult** lives *at* it (the Blaze, the Unlit Deep, the Grand Lattice, the Bloodless Hold…). A pure pole is unlivable at scale — a cult does not have to *work*, only to *believe*.

## 6. Domains & Access (SNG-055)

**Access is DISTANCE ON THE RING.** Read from `traditions.json`; never hardcoded.

| Relation | Access |
|---|---|
| **PRIMARY** (chosen at creation) | Full, all tiers, no penalty |
| **ADJACENT** (1 step — your kin) | Free, all tiers **EXCEPT capstones (IV–V)**. *Being near a people is not being of them.* |
| **SECONDARY** (chosen) | Up to **tier III** |
| **TERTIARY** (chosen; must be a ring-neighbour of the secondary) | Up to **tier II** |
| **2+ steps from every chosen domain** | Skill-point **penalty scaling with distance** |
| **ANTIPODE (12 steps) of primary or secondary** | **CLOSED.** You cannot learn the far side of an axis you have chosen an end of. |

**The only crossings:** **combination abilities** — above all the **cross-pole braids** — and **artifact / extreme-circumstance grants**.
> *A Blazeborn can never learn Umbracraft. But a Blazeborn who has genuinely held both can carry **The Harbored Flame**.* The braid is the only sanctioned road to your own antipode, and that is precisely what makes carrying one **mean** something. **The closed-opposite rule is what gives the combination system its moral weight. Do not soften it.**

**Tradition gates (on top of domain gates):** native (your origin's people) · in-region (standing in their land) · teacher-or-tome (an NPC of that people, met and willing). **Folk traditions: open.** **Capstones (IV–V) additionally require deep standing with that people — greatness is taught, not bought.**

## 7. Abilities, Combinations, Discovery

- **137 abilities**, each stamped with `tradition` (**the learn-screen and wheel group by THIS, never by `powerSystem`/reach**), `levelReq` (tier I–V), `energyCost`, `functions[]` (heal/shield/strike/reveal/conceal/bind/move/break/ward), `axes{}`, `notFor` (what it *cannot* do — every ability has one), and a `tree` of ranks.
- **Foundational techniques (L1–L3) have full rank I–III trees. Capstones (L4–L5) are single-mastery by design** — a capstone is one profound thing, not a progression. *This is not debt.*
- **Combinations (44, tiered):** `combination_recipes.json` — `parts[]` + `functions` + `domains` + `effect` + `cannot` + `discovery`.
  - **within-tradition** — one people's own crafts. Their masters teach these.
  - **kin-civilization** — peoples who share a lean and therefore a border. Learnable where their lands meet.
  - **cross-axis** — different axes entirely. Rare, strange, usually discovered *by use*.
  - **cross-pole** — the two poles of ONE axis (`harbored_flame`, `meaning_engine`, `the_turning_word`). **Requires standing in both. The hardest and the most meaningful: holding an axis whole rather than choosing an end of it.**
- **Discovery loop:** practice ledger counts ability uses **and co-activations** → an emergence recipe matches → the engine **mints** the discovery (named, described, recorded on the character). *The engine mints; the model only supplies the words for what you found.* Once known, it is `+20` instead of `−15` (§4).

## 8. Character Creation (two doors, one boundary)

**⛔ LAW 9 GOVERNS THIS SECTION.** Order is **hard**:
`NAME → FORM → ORIGIN → DOMAINS → ABILITIES → BACKGROUND → COMPANION → START → CONFIRM → commit`
All of it accumulates in a **draft**. Everything stays re-choosable. **Nothing writes to the character until confirm.** *(Abilities are gated by domains — offering them before domains are locked makes the gates unenforceable and hands the player skills they can never use.)*

- **ORIGIN = which people you are from** (27: 24 pole-peoples + 3 Valley folk). Grants **native** tradition access, seeds your ring position, and carries a **`whyYouAreHere`** — *nobody is anywhere by accident; the GM must use it.* **Origin ≠ starting location.**
- **STARTING LOCATION** — defaults to the origin's homeland (19 exist); always also offer **the Valley** and **The Crossing** (the centre — where nobody is from and everybody is).
- **BACKGROUND = what you DID** (40, six categories: martial · **practitioner** · craft · learned · social · marginal). **Orthogonal to origin and domain — never gate one by the other.** *A Cogitant duelist and a Marcher physician are the interesting characters.* **Practitioner** is this world's "magical background": the crafts *are* the magic, so what matters is **how you came to yours** — temple-trained, self-taught, lineage-taught, precursor-marked, battlefield-taught, apprenticed to a legend, or you did it once by accident and have never understood how.
- **FORM** leads the portrait prompt (§16). Human is a *stated* default, never an assumed one.

### Door 1 — **The Prologue** (recommended)
Pick name + form only, then **play**. `prologue.json`: 3 openings (The Waystation · The Thin Place · The Debt) × 4 problems × 4 routes = **48 tradition-tagged paths reaching 24 traditions.**
- **Skills come from USE, not purchase** — *"you did this, so you know this."*
- **The companion ARRIVES in the scene** and joins for a reason. Player chooses **and names** them.
- **Domains CRYSTALLISE from how you played** (tag tally) → shown on the circle **with the reasons in the player's own actions** → **then adjusted and confirmed.** *Revealed, then confirmed. The player keeps the last word.*
- **Nothing announces that the player is being measured. There is no wrong path.**

### Door 2 — **Quick-start** (the express lane)
Form-based. **Parity is mandatory:** identical character shape, same domain count, same starting-ability count, same companion. **No mechanical advantage either way.** *The Prologue TELLS you who you are; the form ASKS you.*

## 9. World

- **92 locations across 24 regions.** Every pole has a homeland, its city, and **its cult at the pure locus**. **The Centre (`the_center`)** — The Crossing, **The Great Coliseum**, the Hundred Markets, **The Quiet House**, **The Axis Gate** (the world's travel hub: twelve roads, one per axis).
- **Location record:** `regionId` · `spectrum{}` (signed axis values) · **`poleIntensity{}`** (pole → 0..1, **derived from spectrum**: sign selects the pole, magnitude is the intensity — *it is an OBJECT, never a float*) · `tags[]` · `connections[]` · `descriptionSeed` · `encounterFlavor` · `dangerLevel` · `questSeeds[]` · `map{x,y}`.
- **Connections are BIDIRECTIONAL.** A one-way edge is a bug (the world once had 20 leave-only edges and 4 unreachable locations). CI enforces (§20).
- **Geography = disposition.** Regions sit where their dispositional profile puts them; **adjacency is kinship.** The Valley is a **making-crossing** (order + light + practical + mechanical) — which is *why* Harmonic and Radiant are neighbours there and *why* both craft.
- **Affinity/drift:** acting **with** a place's disposition is favoured; **against** it is taxed, and the place *notices* (a "the place favoured this" receipt). Sustained action drifts a character's own spectrum. `[CCODE: drift rates, decay]`
- **Random encounters:** 58 entries; **22 regions carry their own texture.** Triggers: `onTravel` 35% · `onRest` 15% · `onEnterLocation` 12%. Flavors: beneficial · benign · **beautiful** · dangerous · theft · chase · fight. *A world that only threatens you is not a world.*

## 10. Time (one world, one clock)

- **The absolute world-clock is SHARED** (a single epoch), not per-character. **Two coupled clocks:**
  - **Far / ambient world → real-time.** The away-digest, propagating events, travelling figures and **all cross-character reconciliation** run on the shared absolute. *The far world ages whether or not you play.*
  - **Active local frame (your area + your quests) → play-paced** (`timeOps`). *You never lose a quest window to inactivity.*
  - **Consequence coupling:** a distant real-timed event that would **materially affect** your area or quest **crosses the boundary** and applies on return.
- **`timeOps`** — the GM declares `{hoursPassed, why}`; the **engine clamps** (0.25–72h) and applies. Sleep ≈ 8h; a conversation ≈ minutes. **Narration LEADS the clock, never trails it.**
- **Every event/fact/news is stamped with the ABSOLUTE world-day.** The GM **references** stamps; it never authors bare day-numbers. Journey-day ("Day 8 of *your* travels") is **display flavour only, never a reconciliation key.**

## 11. The GM Contract

- **The GM narrates and PROPOSES; the engine decides.** (Law 1.)
- **Op families:** `timeOps` (§10) · quest ops · item ops · codex ops · image ops · **`stateOps` (§13, pending)**. `[CCODE: enumerate the complete op set + the dispatch/validation shape]`
- **Prompt is 4-tier, stable→volatile, each block `cache_control` 1h TTL** (`cacheKey: "singularity-runtime"`): **rules → world → scene → rolling state**, then the **uncached** latest player action. *Every byte before a breakpoint must be byte-identical turn to turn.*
- **NARRATIVE REGISTER is keyed to disposition, not taste.** Default **hard concrete** — describe what is literally there, in words a person gets on first read. The register earns its way toward the **poetic** only where the location's **`concrete_abstract`** axis and **charge** warrant it. *A soil-exhale metaphor is not bad writing; it is misplaced writing, and the place decides.*
- **RATING IS A DIRECTION, NOT A CEILING.** A bare permission makes a cautious model write nothing. The rating-register map **directs**: G/PG chaste → PG-13/R real stakes → **R+ the full mature register** (unflinching on violence and gore; charged, sensual and evocative on intimacy and desire). **Evocative, not explicit.** *(Erik's live bug: R+ collapsed romance to PG because the rating reached the GM only as a cap.)*

## 12. Memory & Permanence (the moat)

- **Codex** — per-character discovered entities. **`resolveTopic` / `namematch` resolve BEFORE minting** (three phrasings of "Teva" collapse to one anchored node; near-names like Mara/Maren do **not** merge). **Resolve-before-mint is a law of every system that writes entities** — quests and inventory included.
- **Facts** are stamped with the absolute world-day; unknown stays unknown (**derives-never-fabricates**).
- **Place memory** — visited vs **heard-of-only**; the same grammar extends to entities on the map.
- **Ledger** — append-only, SHA-retry. Every durable change lands here. **Every GM correction (§13) lands here.** A silent state edit is worse than a bug.

## 13. The Generative Living World

**`generate(type, context)`** — one schema-driven path (npc · location · arc; more registrable).
- **REACTIVE only** — minted just-in-time when the fiction reaches for something that does not exist. *(Ambient spawning is the world-tick's job, not the generator's.)*
- **A separate structured call, not GM-inline.** The GM emits a lightweight request; the engine runs a schema-constrained generation, **validates → auto-repairs → falls back to a minimal stub. Generation never halts a turn.**
- **In-grain by grammar:** `generative_substrate.json` maps every type to template + grammar; a generated being is **a cosmic address instantiated at the local grain** (a healer minted in a Cogitarium works *against* the grain; a Stillhold mediator buries truth).
- **Born current:** resolve-before-mint (§12), stamped (§10), **and born WITH its image** (§16).

**Realness = WEIGHT = birth-power + accumulated attention.** Two roads to real: born strong, or grown strong.
- **Engagement score** from *implicit* signal — revisits, repeat interactions, facts accreted, quest-linkage, cross-session survival — plus an optional one-tap **⭐ keep**.
- **Tiers:** `fresh` (provisional) → `established` (durable personal canon; world-tick eligible) → `nominated` (promotion queue).
- **Untouched `fresh` DEMOTES** — drops out of world-tick and proactive GM reference. **Never deleted** (what happened happened); it simply **stops propagating.** *This is the governor: attention keeps a thing real; inattention lets it go dormant. Propagation is the test of what is real.*

**Shared family canon (`canon.js`):**
- **EARNED auto-promotion** — a nominated entity promotes to `world/canon/{region}.json` when weight crosses the threshold. **The threshold IS the gate; there is no human curator.** Idempotent.
- **CONTRADICTION → RANK, not reject.** A promoting entity that collides with canon fires an **opposed roll weighted by realness**. The winner becomes the LOUD canonical truth; **the loser persists as a variant/rumour** — discoverable, contestable later. **Authored core canon sits at a high weight floor (100)** so the designed spine holds. *A Falsehood/Truth-axis world resolves competing realities by the propagating power of whoever asserts them. Contradiction is held in the total, not deleted.*
- **RATING-LENS** — shared canon is a **superset**; each player receives the subset at/below their ceiling. Above-ceiling content **dials DOWN** (adaptive re-narration) or **FILTERS absent**. **Adaptation only ever dials down. The floors do not bend (§17).**

## 14. Quests

**THE RULE: if you cannot name the cost of ignoring it, it is not a quest.** It is an errand, and errands must not be logged as quests.

Every quest (`quest_structure.json`) carries:
- **PREMISE + STAKES** — what is at risk and **who pays if the player walks away.**
- **AXIS** — the quest *lives on* an axis. **A quest is a tension between two poles; that is what makes it a dilemma and not a chore.** No axis = no spine.
- **STAGES (2–5)** — each with an objective the player can state in one sentence, a condition the **engine can actually test**, and a **change it makes to the world** when it lands. No vague "investigate further."
- **ROUTES** — force, guile, care, reason, craft, concealment, truth, endurance, fanned across the circle. **A quest with one solution is a lock, not a story.**
- **OUTCOMES (2–4), BRANCHED** — not success/fail but *which* success. *(**"You walked away" is a real outcome with a real cost that arrives later — not a failure state.**)*
- **⛔ MANDATORY DURABLE CONSEQUENCE** per outcome: a codex fact · an NPC's life/standing/death · a people's disposition toward you · a location's state · **a world-event that propagates** (dated, surfacing later in the away-digest). **A quest that changes nothing durable is not allowed to be a quest.**
- **Design law:** the best quests have **no clean exit** — someone is worse off whatever you choose, and the quest is about *who*, and that is the player's to answer for.

## 15. Inventory, Companions, Legends

- **Equipment bonus: the BEST matching item only** (cap 10). *The right tool helps; a bag of tools does not help more.* Surface **which** item helped — an opaque +N is not a receipt.
- **Companions (9).** A companion is **met, never issued** — the play sidebar renders **only** `character.companions`. *(The roster appears in exactly two places: the quick-start picker and the prologue's `companionBeat.offer`.)* Each has stages, bond-grants, boundaries, and GM-eyes-only `hooks`. **Tal is the only companion who can be hurt, frightened, and killed — that vulnerability IS the mechanic.**
- **Legends (`legends.json`).** Power tiers: **legendary → regional → riffraff**, heroic and villainous. Deployment beats: **witness-power · doomed-rescue · passing-advice · villain-escalation.** **RARE and earned** — a rescue spent cheaply cheapens every rescue. Threaded by **recurrence** (high weight → they come back). *Halvex Coil learned at the Great Engine; the Last Mask is his doctrine with worse tools; Overseer Grael's method is already live in the Valley.*

## 16. Imagery

- **Endpoint: Pollinations** (keyless, client-callable — settled; not a decision to re-open).
- **Form leads the prompt.** `formOf()` puts species/physical form FIRST — *"a towering treefolk of bark and heartwood… full-body portrait"* — because a prompt that opens with the words "character portrait" biases the model to a human. **Human is a stated default, never assumed.**
- **Generate ONCE, cache forever.** Deterministic seed → same subject, same image. **A generated place or person is BORN with its picture.**
- **Consumers:** character portraits (creation + milestone) · NPC portraits · location images · moment art (clamped ~1/scene).
- **Floors apply to images identically (§17).** No image sexualises a minor; none exceeds the viewer's ceiling. Original art only — no IP, no real people.

## 17. ⛔ Safety, Rating, and The Floors

**The rating system IS the family-shared safety model.** It is what lets Erik play at R+ and a child play at G **in one growing world** without tone-bleed. It is load-bearing, not a nicety.

- **Rating lives on the PLAYER PROFILE** (the identity anchor). Dimensions: violence/gore · sexual · language · dread. Presets **G / PG / PG-13 / R / R+**.
- **Three consumers:** (1) **GM narration register** (§11 — a *direction*, not a cap) · (2) **generation ceiling** · (3) **shared-canon visibility** (§13 — each player sees the world through their own lens).
- **CEILING CONTROL:** the ceiling is **Erik-set per family profile**. **A profile cannot self-elevate. R/R+ require an adult gate Erik controls. A minor profile can never be set to, or self-select, R/R+.**

### THE FLOORS — absolute, rating-independent, and no mechanism may cross them
1. **The disallowed-content floor.** R+ scales intensity *up toward* it; it **never unlocks** prohibited content. Enforced at the **birth-validator** (`enforceFloors`) — because earned auto-promotion means **there is no human gate downstream.**
2. **MINOR PROTECTION, ABSOLUTE.** No generated entity who is a minor is **ever** eligible for romantic or sexual content, at any tier, for any viewer. In the shared world, sub-ceiling viewers are **HARD-EXCLUDED** from above-ceiling content — **absent, never softened into view.**

**No setting, ceiling, GM op, `stateOps` correction, promotion, or rating-lens may bend either floor.** *(Verified live: `canon.js` hard-filters gore for a minor viewer rather than softening it; `adaptView` only ever dials down; sexual content filters absent.)* **This is the one section of this document where "the code is authoritative" does not apply. If the code disagrees with this section, the code is wrong.**

## 18. Sync & Multiplayer

- **Transport:** GitHub, via `sync.js`. **Single-owner writes** (your character, your profile) + **append-only ledgers** + `pushMergedFile` (read-merge-write-retry) so concurrent writers never clobber (Law 7).
- **Identity:** one person, one profile — resolved by **person**, not per-device key. *(Erik became two Eriks because identity was keyed per device.)*
- **Cross-device:** on open, pull the authoritative latest and reconcile. **⛔ STALE-LOCAL-OVERWRITE GUARD — non-negotiable, fires in BOTH directions:** never let an older save clobber a fresher one; on a genuine both-advanced conflict keep remote, preserve local as a recovery copy, and surface it.
- **Party (pending):** a **LEADER** decides party-level things — where to travel, which thread, whether to accept an offer. **Turn-by-turn stays each player's own** — combat, skills, gambits. **Your character is always yours; the leader never plays your turn.**

## 19. The Content System (the contract)

- **A pack = a manifest + content.** `manifest.json → provides.{locations,npcs,companions,encounters,items,events,lore,quests}`.
- **⛔ THE LOADER IS A WHITELIST (Law 10).** `state.js` iterates `provides.*`. **A file not listed does not exist — silently.** Any new content file MUST be registered. **And a `provides.*` key with no loader branch is the same bug one layer down** *(authored quests are manifest-registered and still never load)*.
- **Every content type has a JSON-Schema in `schemas/`**, and **schema validation is a build gate** (§20). *(This would have caught 66 locations authored with the wrong `poleIntensity` shape.)*
- **Content is authored by Aevi. Engine is written by CCode. Neither edits the other's lane** — CCode surfaces a content bug as a **spec boundary** rather than silently editing it. *(This worked: the `poleIntensity` flag was exactly right.)*

## 20. Ops & Quality — `check_pipeline.py` **(green required to close ANYTHING)**

Tether has 11 automated checks. **Singularity has zero, and it cost weeks of the live game running on six locations.** Minimum set:

1. **Manifest parity** — every content file on disk is listed.
2. **Manifest paths resolve** — every listed path exists.
3. **Every `provides.*` key has a loader branch.** ← *this is how quests silently never loaded*
4. **No dangling connections.**
5. **No one-way edges.**
6. **No unreachable locations** (reachability from every starting location).
7. **Every content file validates against its schema.** ← *this is how `poleIntensity` slipped through*
8. **Every ability carries a `tradition`.**
9. **Every quest's giver / region / stage-condition resolves.**
10. **Version-line consistency** (app.js ↔ SYSTEM_SPEC ↔ results).
11. `[CCODE: propose #11+ — you know the failure modes I can't see]`

Plus: suites + `parse_probe` green, **fresh-port boot check** (a temporal-dead-zone bug once hung the app and only a fresh port caught it — `parse_probe` cannot reach `boot()`).

## 21. Process — the three agents and the two-round cycle

| Agent | Owns | Never |
|---|---|---|
| **Erik** (PM) | Product direction, the world's soul, browser-leg verification. **The last word.** | — |
| **Aevi** (PO) | This spec · design laws · the ring · **all content** (locations, abilities, traditions, quests, NPCs, companions, lore, prologue) · the ledger · spec authoring · review-close | **Never writes engine code.** |
| **CCode** | **All engine/app code** · results files · spec boundaries · `check_pipeline.py` | **Never edits content.** Surfaces it as a boundary. |

**⛔ THE TWO-ROUND SPEC CYCLE (SNG-071 — ported from Tether):**
> **Aevi authors ROUND 1** → **CCode performs ROUND 2: substrate verification against origin** (*does the code actually do what the spec assumes? do the schemas match? is the premise still true at HEAD?*) → CCode reports findings → **Aevi amends and only then PROMOTES** → CCode executes → `complete_pending_review` → **Aevi review-closes** → `check_pipeline.py` green.

**No spec is built from an unverified premise.** *(This exists because Aevi specced a whole batch on a premise that was already false at HEAD, and authored 66 files against a remembered schema. Round 2 is not ceremony; it is the step that catches the PO.)*

- **Every spec opens with PRE-WORK SCOPE VERIFICATION** — what was measured at HEAD, with paths, line-refs and counts. Not *"I think X is missing"* but *"`grep primaryDomain app.js` → 0 refs @ v1.8.23."*
- **Status lifecycle:** `queued → in_progress → complete_pending_review → review-closed → superseded`. **Only Aevi closes.**
- **Spec boundaries are first-class.** When CCode deviates, it names the boundary; Aevi **accepts or amends, explicitly, in the ledger.** *A boundary is a fact, not a failure.*
- **Feedback (§pending SNG-066):** `po/feedback/` — auto-captured context. Aevi triages at session-open.

## 22. Known Debt & Open Questions

- **Creation has no commit boundary** (Law 9 violated) — `SNG_UPDATE_v1.9.0` P1.
- **Quests do not load** (no `provides.quests` branch) — v1.9.0 P4a.
- **No starting-location choice** — 19 homelands nobody can start in — v1.9.0 P4b.
- **No `check_pipeline.py`** — v1.9.0 P5.
- **The skill screen is a flat list, not the wheel** — v1.9.0 P6.
- **`discoveryBonus` = +20** — balance Q parked for sensitivity testing (§4).
- **2 combination recipes reference abilities that do not exist** (`strike_basic`, `root_hold`).
- **`SPEC_BACKLOG.md` / `ALERT.md` are append-only sediment (~100KB+)** — retire as primary surfaces; versioned specs + current-status-only alert.
- **Thin regions** (riven_marches / somatic_reaches / unspooling at 3–4 locations) want ~6.
- `[CCODE: add every debt you can see that I cannot]`

---

*Aevi owns this document. CCode owes ROUND 2 on it: verify every claim against HEAD, fill every `[CCODE]` marker, and — most importantly — **tell me where this document is already wrong.** A spec that lies is worse than no spec.*
