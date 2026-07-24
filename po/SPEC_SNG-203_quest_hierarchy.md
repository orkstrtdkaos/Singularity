# SPEC — SNG-203: The quest hierarchy — six tiers, a schema each, all GM-generatable
## Aevi (PO) · 2026-07-21 · authored to spec · **awaiting CCode ROUND 2**

> **Erik's direction, 2026-07-21:** *"We can have Quests AND world Arcs. I want everyone to know that world
> arcs are progressing — it IS a shared world. Each tradition should have a quest arc available to find a
> teacher then a path to learn its ultimate skill. We should have a hierarchy of quests — world-arc quests
> that literally impact the large arcs of the world, tradition and player-arc quests that hugely impact the
> thrust of a character's actions, augmenting quests for both of those, then regional quests, local quests,
> and quests for NPCs. All of which have formats and schemas the GM can actually generate new ones of."*

This is a structure-and-content spec. It defines **six quest tiers**, what each is FOR, the **schema each
needs so the GM can generate more**, and how the top tier stays **shared and visibly progressing**. The
engine work (loaders, the shared-progress surface, the generate branches) is CCode's; the **schemas and the
authored floor of content are mine** and are the bulk of what this delivers.

A note on scope, stated plainly because I just crossed it: **the water-crisis wiring is NOT part of this
spec.** The crisis stays an active shared world-arc event exactly as it was. What this spec adds is the
*structure around* arcs and quests so the crisis has siblings, so arcs visibly move, and so every tier is
generatable. Nothing here retires or un-forces existing content.

---

## §1 — THE CORE PROBLEM this solves

Today there is **one quest schema** (`quest_structure.json`, excellent) applied to **two quests**, and
**five world/regional arcs** (`greater_arcs.json`) with **rich tendency prose and zero authored stages,
quests, or scenes.** The GM improvises every arc's forward motion from mood and a few `hooks` strings.
That is the nebulousness Erik named: atmosphere with no authored floor, and no *concrete situation that
must resolve* for the model to hand a player.

The fix is not more prose. It is **tiered structure** — each tier a named thing with a schema — so the GM
always has a concrete, resolvable situation to offer at the right scale, and can **generate a new one in
the same shape** when a playthrough wants it. `quest_structure.json` already proved the pattern (testable
conditions, routes across the circle, branched outcomes with machine-readable effects). This spec extends
that proven shape up to world-arcs and down to NPC errands.

## §2 — THE SIX TIERS

Ordered by blast radius. Each has: what it moves · who sees the result · its schema home.

| # | tier | moves… | visibility | schema |
|---|---|---|---|---|
| 1 | **World-Arc Quest** | a `greater_arcs.json` arc's **stage** | **SHARED — all players** | `world_arc_quest` (new) |
| 2 | **Tradition Arc** & **Player Arc** | a tradition's teacher→ultimate path · a character's personal arc (SNG-133) | the character | `tradition_arc` (new) · reuse `personalArc` |
| 3 | **Augmenting Quest** | deepens/branches a tier-1 or tier-2 arc without being the spine | character, feeds up | `quest_structure` + `augments` field |
| 4 | **Regional Quest** | a region's standing (the current `the_edge_district_ledger` scale) | region | `quest_structure` (as-is) |
| 5 | **Local Quest** | one place / one situation (`the_tree_that_waits` scale) | local | `quest_structure` (as-is, `scale:local`) |
| 6 | **NPC Quest** | one person's want (the errand tier — `quest_structure`'s "errand" line) | one NPC | `npc_quest` (new, lightest) |

**The insight that keeps this from being six disconnected systems:** `quest_structure.json` is already the
*middle* of this hierarchy (tiers 3–5). This spec adds a **heavier schema above it** (world-arc, which
carries shared-stage machinery) and a **lighter schema below it** (npc_quest, which drops the branched-
outcome requirement because an errand doesn't need one). Tiers 3–5 are the schema Erik already ratified,
used at different `scale`/`tier` values. So the real new authoring is **two schemas + tradition arcs**, not
six.

## §3 — TIER 1: World-Arc Quests, and "everyone knows it's progressing"

Erik's load-bearing requirement: *it IS a shared world; everyone should know the arcs are progressing.*

**Schema `world_arc_quest`** — a quest whose outcome's effects include a **`arc_stage` effect** that advances
the named `greater_arcs.json` arc on the **shared clock** (the same `world_event{propagates}` machinery that
already exists — an arc stage is a world_event with teeth). Requirements beyond `quest_structure`:

- **`arcId`** — which greater arc this quest is a handle on.
- **`arcStageFrom` / `arcStageTo`** — the stage transition completing it causes. ⚠️ This requires
  `greater_arcs.json` arcs to **have numbered stages**, which they currently do not (the schema allows an
  optional `stages[]` of strings; no arc uses it). **Authoring those stages is mine** — see §7.
- **`sharedOutcome`** — the arc moves for **everyone**, so the effect is a broadcast, not a personal codex
  fact. One player resolving a world-arc quest is a world event every other player's next load can see.

**The shared-progress surface (CCode's build, my spec of the outcome):** every player should be able to see
**where the world arcs stand** — a readable "state of the world" the shared canon already has the data for.
Not a spoiler dump (arc `truth`/GM-EYES stays sealed) — the *public face*: which arcs are stirring, which
have moved, what visibly changed. The Tether Council/concept-graph pattern is the reference for "shared
state everyone reads." ⚠️ Rating-lens applies (`canonForViewer`) — the family sees it at their ceilings.

⛔ **Contested advancement is real and must be designed, not hand-waved.** If two players push the same arc
opposite directions, the shared clock's rank-by-realness contest (SNG-201's machinery) resolves it — but a
world arc moving *backward* because another player countered you is a *feature* (it IS a shared world) and
must read as one, not as a bug. This is the one genuinely new concurrency question and it is CCode's to
answer; I flag it as the sharp edge.

## §4 — TIER 2: Tradition Arcs — teacher, then the ultimate skill

Erik: *each tradition should have a quest arc available to find a teacher, then a path to learn its ultimate
skill.* This is the single most-requested-shaped piece and it has a clean structure.

**Schema `tradition_arc`** — a three-beat authored path per tradition:

1. **The Finding** — a quest to locate the tradition's teacher (a legend-tier or named NPC). Gated on
   *demonstrating the tradition's disposition*, not on level — you find the ashwarden teacher by acting like
   one, per the tradition's axis. Outcome: the teacher is found and will take you.
2. **The Proving** — a quest that IS the tradition's values under pressure (the ashwarden proving is about
   attending an ending; the verist proving is about a truth that costs; the umbral proving is about a thing
   done unseen). Outcome: the teacher commits.
3. **The Ultimate** — the path to the tradition's capstone ability (the `capstone`/tier-V skill; SNG-130
   filled the capstone tier). Outcome: the ultimate skill is learnable, and learning it is a *scene*, not a
   menu unlock — the SNG-197 "moment" doctrine applies to a capstone the same way it applies to a braid.

**24 traditions × 3 beats = 72 authored quests** if fully hand-written. That is not a one-session job and
should not pretend to be. **The spec's deliverable is: the schema + one fully-authored exemplar tradition
arc (ashwarden — Silas's own, so Erik can play-test it) + the generation contract** so the GM authors the
other 23 in-grain on demand, validating against the schema. Hand-authoring can then upgrade generated arcs
to authored quality tradition-by-tradition over time. ⚠️ **The capstone ability per tradition must exist
before its tier-3 beat can resolve** — verify capstone coverage (SNG-130) before authoring proving-beats
that promise a skill that isn't there.

## §5 — TIER 6: NPC Quests — the errand tier, honestly labeled

`quest_structure.json`'s own rule: *"if you cannot name the cost of ignoring it, it is an errand, not a
quest."* Erik wants errands too — they are the texture of a living world — they just need their own light
schema so they are not logged as (or held to the standard of) real quests.

**Schema `npc_quest`** — drops the branched-outcome and multi-route requirements; keeps: `giver`,
`want` (the NPC's, from their record), `task` (one engine-testable objective), `reward` (small, concrete),
and a single `effect` (usually a disposition bump or a codex fact). An NPC quest that *grows* into
something with real stakes gets **promoted** to `quest_structure` — the promotion path is the interesting
seam (an errand that turns out to matter is a good story), and it is CCode's to wire.

## §6 — GENERATION: every tier a `generate` type

Erik: *all of which have formats and schemas the GM can actually generate new ones of.* This is the through-
line. Today `GEN_TYPES = ["npc","location","arc"]`. This spec's tiers extend it:

- `arc` already generates local threads (`scale:local`) against `arc.schema.json` — **tier 1's generation
  already partly exists**; what it lacks is the shared-stage/`arcId` binding.
- **New generate types:** `tradition_arc`, `npc_quest`, and `quest` (tiers 3–5, against the existing
  `quest_structure` — the GM generating a regional/local quest on demand is arguably the highest-value
  generation in the game and does not exist yet).
- **The discipline from SNG-197 §4 holds everywhere:** the model authors the prose and the situation; the
  **engine validates the structure** — a generated quest with no testable condition, no named cost, or no
  durable effect is **rejected**, exactly as `quest_structure`'s own rule demands. The schema is the gate.
  A generated quest that would fail `theRule` fails the build.

## §7 — WHAT I DELIVER (the content floor) vs WHAT CCODE BUILDS (the structure)

**Mine, this arc of work (prose + schema + content — my lane):**
1. The three new schemas: `world_arc_quest`, `tradition_arc`, `npc_quest` (JSON schema files, shaped like
   the existing `quest_structure.json` / `arc.schema.json`).
2. **Numbered stages authored onto the 5 existing greater arcs** so tier-1 quests have a stage ladder to
   move (the missing floor under `greater_arcs.json`).
3. One fully-authored **exemplar per new tier**: a world-arc quest (on an existing arc), the ashwarden
   **tradition arc** (all 3 beats), and a couple of npc_quests — the taste the GM generates against.
4. `what_the_water_remembers` (already shipped) reclassified as the tier-1 exemplar for What Wakes Beneath.

**CCode's (structure/engine — explicitly not mine, per today's correction):**
1. Loaders/`GEN_TYPES` for the new types; the `arc_stage` effect and shared-clock broadcast.
2. The **shared world-arc progress surface** (the "state of the world" everyone reads).
3. Contested-advancement resolution (§3) and the npc_quest→quest promotion path (§5).
4. Whether/how the tier-1 stage ladder ties to the existing event system (e.g. does the water_crisis event
   BECOME the tier-1 quest's progress track, or run beside it) — **the water-crisis wiring question I
   wrongly touched today is here, as a CCode decision, where it belongs.**

## GUARDS

- **Quests AND arcs coexist** — nothing here replaces or retires arcs or events. Additive only.
- **World arcs are shared and visibly progressing** — tier-1 outcomes broadcast; the progress surface is
  the point, not a nice-to-have.
- **`theRule` is the universal gate** — every tier except npc_quest must name the cost of ignoring it;
  npc_quest is explicitly the exception and is labeled as such.
- **Generation validates against schema** — a generated quest that fails its schema is rejected, never
  logged as a real quest (the SNG-197 §4 discipline, applied to quests).
- **GM-EYES-ONLY survives the shared surface** — arc `truth` never leaks into the public progress view.
- **Rating-lens on everything shared** — the family reads the world at their own ceilings.
- **Capstone-before-proving** — a tradition's tier-3 beat can't promise a capstone that isn't authored.

## OPEN QUESTIONS — CCODE ROUND 2

1. **Tier-1 stage ↔ event system:** does a greater-arc's numbered stage ladder tie into the existing
   `activeEvents`/`eventStages` machinery (water_crisis-style), or is it a parallel track on the shared
   clock? This is the architecture call the whole shared-progress surface hangs on — and the one I should
   have asked instead of editing.
2. **Contested advancement (§3):** rank-by-realness as-is, or does a world arc need its own resolution
   (e.g. net-vector of all players' pushes)? Erik's framework has "structural directionality as net
   resultant of vector fields" — that may be the right model here, but it's a design call.
3. **Generation cost:** generating a full `quest_structure` quest (routes, branched outcomes, effects) is a
   large model call. Cache/reuse strategy, or generate-on-demand-and-persist?
4. **`tradition_arc` storage:** one file per tradition, or one `tradition_arcs.json` keyed by traditionId
   (parallel to how traditions.json holds all 24)? Affects how the GM finds the right one.
5. **Sequencing vs the braid arc and the codex ledger:** this is large and touches the shared clock like
   SNG-201. Does it queue behind the braid arc, or is the schema-authoring (my part) parallelizable while
   you finish braids? I can author schemas + the exemplar content independent of your build.


---

# §7 — RESOLVED (Erik, 2026-07-22)

## §OQ2 contested advancement — NET-VECTOR (Erik's call)
A world arc under multiple players' pushes advances by the NET RESULTANT of all pushes, per the framework:
structural directionality is the net resultant of vector fields across a larger boundary (07_Mental_Models) —
NOT any one player's push, NOT winner-take-all. Each player's action = a VECTOR (direction = which way they
push the arc's poles; magnitude = play-realness, the SNG-128 weight). The arc advances along the SUM: aligned
accelerate, opposed partially cancel. SAME rule as SNG-204 §OQ4 — one resolver for "many hands on one
world-thing." NEW machinery (no netVector primitive exists, 0 hits). Other §OQ items stay CCode-technical;
Aevi's schema/exemplar authoring is parallelizable; 203 first (204 builds on its tiers/arc_stage).
