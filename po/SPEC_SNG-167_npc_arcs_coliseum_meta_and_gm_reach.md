# SNG-167 — NPC-borne arcs, the Coliseum's place in the world, and what the GM can actually see

**Author:** Aevi (PO) · 2026-07-18 · Erik-directed from live play
**Sequencing:** §3 runs AFTER BATCH-12 §5 (ENGINE_MAP), per Erik. §4 is independent and cheap.

---

# §1 — THE GM COULD NOT ANSWER ABOUT THE CROSSROADS, AND HERE IS WHY

Erik asked the GM about the Crossroads and it had nothing. Two independent causes, both measured.

## 1a. Lore reaches the GM through a per-location allowlist, and it is nearly empty

`state.js:204`:
```js
export function loreForLocation(location, loreMap) {
  return (location.loreRefs || []).map(ref => loreMap[ref]).filter(Boolean).join("\n\n");
}
```

The GM sees **only** what the current location's `loreRefs` names. Measured across 95 locations:

- **24 lore files exist. 14 distinct refs are used. 18 files are referenced by NO location at all.**
- Three of those are the only region-lore files in the corpus — `reach_riven_marches`,
  `reach_somatic`, `reach_unspooling` — written and unreachable.
- Also unreachable: `world_superstructure`, `world_node_atlas`, `the_game_and_coin`,
  `universal_roles`, `domain_detail`, `legends`, `will_modality`.
- **Including `tradition_profiles` — the 30 profiles I shipped this morning.** They render on the
  player's Library page and the GM has never been able to see one. That is my own
  built-and-unreached, in the same batch where I catalogued eight of them.

80 of 95 locations reference `the_twelve_reaches` and 69 reference `traditions`. Those two files
*are* the world model as far as the GM is concerned. Everything else was written into a drawer.

## 1b. There is no Crossroads lore to find

`world_node_atlas` does not contain the string "Crossing". The Center's locations
(`the_crossing`, `the_axis_gate`) carry the same three generic refs every other location does. The
hub of the world — the place with the tier-1 waygate, the Coliseum, and the Council seat — has **no
authored lore of its own.**

## 1c. Fix

1. **Region lore becomes automatic, not opt-in.** `loreForLocation` also pulls `lore/reach_<regionId>`
   when it exists. A location should not have to remember to name its own Reach.
2. **Author the missing region lore.** 3 of 25 regions have a file. The Center is the urgent one.
3. **Wire the orphans.** Each of the 18 gets either a referencing rule or an explicit
   `gmVisible: false` saying it is player-facing only. `tradition_profiles` becomes GM-visible —
   it is exactly what the GM needs when a player asks what a people is like.
4. **CI guard:** every lore file is either referenced by ≥1 location, pulled by a region rule, or
   flagged `gmVisible:false`. No silent drawer.

**This is the BATCH-12 §5 question one layer up.** The ENGINE_MAP asks what each module is connected
to; this asks what each *content file* is connected to. Same defect, same fix: **a file nobody can
reach does not exist.** Recommend the map cover content as well as code.

---

# §2 — NPC MEETINGS MUST BE ABLE TO START ARCS

## The symptom

Erik: *"Silas's recent activity with Siol (the elf) and the ancient Ent at the Crossroads likely
should have offered up quests to pursue those threads."*

## Measured

**42 authored NPCs. Zero carry a quest hook.** They carry `wants`, `want`, `hooks`, `knowledge`,
`arcId`, `relationships` — rich material with no path into the quest system.

Prompt rule 10 tells the GM to weave **the LOCATION's** `questSeeds` when nothing is active. There is
no equivalent for a person. So a location can start an arc and an NPC cannot, which is backwards:
**the memorable arcs start with someone, not somewhere.**

## Fix

- **`questSeeds` on the NPC schema**, same shape as the location's — 2–3 per significant NPC,
  written from their own `want`.
- **Derive, do not just author.** An NPC with a `want` and no seed is a content gap a CI check can
  name. The want is already the arc premise.
- **Prompt rule 10b:** when a scene establishes or deepens a relationship with an NPC who carries
  seeds, the GM should surface one **as a concrete named opportunity with stakes** — the same
  standard already required of location seeds.
- **Many doors, per Erik.** An arc should be enterable from the person, the place, the codex topic,
  or the faction. Seeds on NPCs are the missing one of the four.
- **Ancient/legendary NPCs (the Ent) want a bigger shape** — a `greaterArc` link rather than a local
  errand. `greater_arcs.json` exists and is itself unreferenced (§1). Connect them.

---

# §3 — THE COLISEUM AS A CIVIC INSTITUTION

Erik: *"the coliseums in the world are central to a lot of things… political, social, monetary."*
And: *"I fought in the Coliseum — what does that do in the meta?"* Today: **nothing.** An encounter
resolves, XP lands, and the world does not notice.

## 3a. Standing, and it is mostly upside

Erik's constraint: **mostly bonuses, not penalties.**

- **Combatant status with the Crossing itself.** Fighting at all earns standing with the host
  community. A challenger is a known quantity; the Center rewards participation.
- **Standing with the OPPONENT'S people.** Every champion is *of* a tradition (the SNG-164 roster is
  one per FUNCTION_FAMILY, drawn from real traditions). Facing them registers with their people.
- **How you win is the thing.** Fighting well under forms, honouring a yield, refusing a cheap
  finish — these raise standing with the opponent's people **even in defeat**. A clean loss to a
  Marcher can earn more Marcher standing than a graceless win.
- **Penalties are narrow and earned:** breaking forms, striking a yielded opponent, humiliating a
  local champion before their own crowd. Not for losing, and not for winning.
- **Fans like their champions.** Beating a people's champion in *their* idiom earns respect; beating
  them by refusing to play their game earns notoriety. Both are standing; they read differently.

Mechanically this is BATCH-12 §3's `standingOps` with the Coliseum as its first heavy consumer.

## 3b. Political, social, monetary

- **Monetary** — purses, side-bets, sponsorship. `the_game_and_coin` lore exists and is unreferenced;
  this is its home. A sponsor is a relationship with an obligation attached.
- **Political** — the Accords already exist. A bout can settle a dispute that a treaty could not; a
  people sending a champion is a statement. Ties into the Council (SNG-150).
- **Social** — the crowd is a persistent body with memory. A returning challenger is *recognised*,
  and the Coliseum's own culture (they know the grid, they know which cell was drawn) means the
  audience reads the bout as an argument. That is the flavour Erik wants driving narrative.
- **The bout board as a standing surface** — who is taking challengers, who has refused whom, what
  your own record reads as. A place to *go and look*, which makes the institution feel real.

## 3c. Coliseums plural

Erik said *"the coliseums in the world."* The Great Coliseum at the Crossing is the largest, not the
only one. Regional venues (the Marchward's forms-ground, the Redline) should share the grid, the
standing consequences, and the culture at smaller scale — one system, many houses.

---

# §4 — MODEL ROUTING: HAIKU BY DEFAULT, SONNET WHEN IT MATTERS

**The infrastructure already exists.** `engine/claude.js` carries a task→model map, and
`intent-parse` is already on Haiku. Every other task — `gm-narrate`, `gm-meta`, `bio-gen`,
`world-tick`, `generate` — is Sonnet. So this is a **policy change, not a build.**

## Proposal

Route by **what the turn is doing**, not by task name alone:

| tier | model | when |
|---|---|---|
| routine | Haiku | travel, inventory, small talk, navigation, most exploration beats |
| charged | Sonnet | combat and skill battles, defining moments, quest resolution, a teacher teaching, first meetings with significant NPCs, precursor use, anything emitting `markDefiningMoment` |

**Escalation must be legible and cheap to get wrong in the safe direction.** Signals that force
Sonnet: an active encounter, `awaitingResolution` on a quest, a defining-moment flag, an unlock, a
scene the player has marked. When uncertain, escalate — a flat routine scene rendered richly costs
money; a charged scene rendered flatly costs the session.

**Measure before tuning.** Log tier per turn for a few sessions. We should know what fraction of
turns are genuinely charged before picking thresholds — otherwise this is the same eyeballing the
SNG-078 blocker warns about.

`world-tick` and `generate` are strong Haiku candidates independent of the above; neither is
player-facing prose in the moment.

---

# §5 — Questions for CCode ROUND 2

1. §1c.1 — region-lore auto-pull: does prompt weight allow always carrying it, or does it need the
   same conditional treatment as the waygate block?
2. §2 — NPC `questSeeds` vs the existing `hooks` field: is `hooks` already close enough to reuse, or
   is it doing something else I would be overloading?
3. §3a — does Coliseum standing ride BATCH-12's `standingOps` unchanged, or does a bout outcome want
   its own engine path so "how you won" is adjudicated rather than model-judged?
4. §4 — is there a clean place in the turn pipeline to decide tier *before* the call, or would this
   need a cheap pre-classify (which is itself a Haiku call and may pay for itself)?
