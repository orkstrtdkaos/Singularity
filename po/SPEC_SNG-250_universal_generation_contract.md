# SPEC — SNG-250: The universal generation contract — born whole, concrete, coherent, for EVERY type
## Aevi (PO) · 2026-07-27 · Erik-directed ("the engine needs to do this same basic thing for everything it can generate")

> **Erik:** "The engine needs to do this same basic thing for everything it can generate — NPCs, items, monsters,
> skills, etc."

## §1 — The principle, universalized
SNG-248 (learns from exemplars), SNG-249 (concrete objectives + complete coherent arc) established the contract
for quests/encounters. SNG-250 makes it UNIVERSAL: **whatever the engine can generate, it generates WHOLE,
CONCRETE, and COHERENT — never a nice-sounding fragment.** The failure is the same shape for every type:
- an NPC born without real wants/disposition = SNG-233 "agreeable furniture" (renders as pleasant nothing);
- a monster born without stats/behavior = un-fightable (the encounter engine has nothing to run);
- a skill born without a mechanical function = decorative (does nothing the rules can resolve);
- an item born without an effect = flavor text you can't use;
- a location born without pole/danger = a backdrop the world-tick and encounters can't act on.
One rule, every type: **born with everything its consumers read, every field concrete, the whole thing coherent.**

## §2 — State (verified): 3 types generate, 4 have a contract, the rest have neither
- **Generates today:** npc, location, arc ONLY (app.js:2233 allow-list). Everything else is generation-disabled.
- **Born-whole CONTRACT defined (consumer map):** quest, npc, location, creature. So we already know what a whole
  NPC needs (personality, wants, fears, disposition, appearance) and a whole creature needs (tier, class,
  pressures, threat) — but creature/quest can't be GENERATED yet, and item/skill/ability have NO contract at all.
- **The gap:** items, monsters (creatures), skills/abilities, encounters need BOTH a born-whole contract AND a
  generation path. This spec defines the per-type contract and opens generation for them, under one rule.

## §3 — The per-type WHOLE+CONCRETE contract
Each type declares what makes it complete (born-whole, extends the consumer map) AND what makes each field
concrete (not vague). CCode gates generation against this; a generated entity that fails is repaired or rejected.

- **NPC** — whole: name, personality, wants, fears, disposition, appearance (+ bond hooks). CONCRETE: wants/fears
  are SPECIFIC and ACTABLE ("wants the forge her brother left, resents that Silas holds it") not generic
  ("wants respect"); disposition drives real behavior (SNG-233). A whole NPC can be MET again, wants something
  the world can act on, reacts from a real interior.
- **CREATURE/MONSTER** — whole: id, name, tier, class, pressures, threat (+ behavior, the encounter frame it
  fights in). CONCRETE: threat is a real number/band, pressures are real mechanics the encounter engine runs,
  behavior names what it DOES in a fight. A whole monster is FIGHTABLE — the encounter engine has stats and a
  behavior to run, not just a scary description.
- **ITEM** — whole: id, name, kind, a mechanical EFFECT (+ how it's used, evolve hooks). CONCRETE: the effect is
  a real rules-resolvable thing (heals N / grants function F / opens X), not "hums with old power." A whole item
  DOES something the rules can apply — usable, not just flavor.
- **SKILL/ABILITY** — whole: id, name, a FUNCTION (from the vocab: HARM/RESTORE/PROTECT/KNOW/SHAPE/INFLUENCE/
  MOVE/SUSTAIN), a tier, an energy cost (+ tradition). CONCRETE: it resolves to a real function family with tier
  + cost, not "channels the essence of the deep." A whole skill can be USED in the contest engine — it maps to a
  mechanic, not a mood.
- **QUEST / ENCOUNTER** — as SNG-249: whole arc (all stages + resolutions + win-condition) at creation, each
  stage concrete (objective + testable condition), coherent (stages lead to resolutions, outcomes answer the
  premise).
- **LOCATION** — whole: name, dangerLevel, worldPos, axisVector, poleIntensity, descriptionSeed. CONCRETE: pole/
  danger are real values the world-tick + encounters read (not "a place of strange energy"). A whole location is
  a place the world can ACT on and through.
- **ARC** — whole: scale, pressure, tendency, hinge-npcs, ifIgnored/ifEngaged. CONCRETE: the pressure is a real
  directional force with named consequences, the tremor is statable (SNG-239). A whole arc DRIVES (SNG-245) and
  RESOLVES.

## §4 — Enforcement: one gate, every type (CCode)
- **Open generation for the missing types:** extend the allow-list beyond npc/location/arc to creature, item,
  skill/ability, quest, encounter — each with its genSchema + born-whole contract.
- **The universal born-whole gate:** extend the SNG-234/248 gate to check EVERY generated type against its §3
  contract — all consumer-read fields present, each concrete (per the §3 concreteness rule for that type),
  the whole coherent (for structured types, SNG-249 §5). Fail → repair (regenerate the thin field/stage) or
  reject. NO type ships hollow.
- **The consumer map is the source of truth** — the born-whole contract per type IS the consumer_required_
  subfields map (already defined for quest/npc/location/creature); extend it to item/skill/ability. One map,
  driving both the generation contract and the CI shape-check (SNG-238) — authored and generated content held to
  the same completeness bar.
- **Few-shot from exemplars per type (SNG-248):** each type generates taught by its best-matching authored
  examples, so a generated item/monster/skill reads in-style AND is born whole.

## §5 — Why one rule for all types (not per-type specs)
Erik's instinct is right: this is ONE principle, applied uniformly, not seven separate features. A single
born-whole+concrete+coherent gate, driven by a per-type contract in the consumer map, covers every generatable
type — and every FUTURE type inherits it by declaring its contract. That's the durable win: not "make NPCs
whole, then make items whole, then monsters" one-off, but "generation is CONTRACTUALLY whole for all types, and
adding a type means declaring its contract." The engine can't generate a hollow anything.

## OWNERSHIP
- CCode: §4 the universal gate (extend born-whole to every type against its contract) + open generation for
  creature/item/skill/encounter + extend the consumer map to item/skill/ability. The gate is ONE mechanism keyed
  by type-contract, not per-type code.
- Aevi: the per-type CONCRETENESS definition (what makes a whole NPC/item/monster/skill — §3, the "concrete not
  vague" bar per type) + the vague/concrete markers per type + the generation-prompt guidance per type + enough
  exemplars per type that each can be taught (the SNG-248 coverage audit, now across all types). Content, my lane.
- Erik: which types to OPEN generation for first (all, or phase it — npc/creature/item most player-facing?) + how
  strict per type (a hollow monster is worse than a slightly-thin item — tier the gate?).

## GUARDS
- **One rule, uniformly** — resist per-type special-casing; the gate is the contract-check, the contract lives in
  the consumer map, every type (present + future) plays by it. Special cases are how "whole" erodes.
- **Concrete is per-type but the PRINCIPLE is constant** — "concrete" means a real number for a monster's threat,
  a real function for a skill, an actable want for an NPC, a testable condition for a quest. Different fields,
  same bar: the rules/engine can ACT on it, no metaphor-reading required.
- **Whole = every consumer reads a real value** — the test is the consumer map: does every field a consumer
  READS carry a real value at birth? A field no one reads isn't required; a field a consumer reads is mandatory
  and concrete. (This is why the consumer map is the contract — it's grounded in what the code actually uses.)
- **Born-whole or rejected, all types** — the SNG-234 discipline, universalized: repair the thin field or reject
  the entity; never ship a hollow NPC/item/monster/skill any more than a hollow quest. Generation is whole by
  contract, or it doesn't generate.
- **Don't strip voice, any type** — whole+concrete is the floor; a monster can be terrifying AND statted, an item
  evocative AND usable, an NPC vivid AND actable. The gate removes hollowness, never richness.

## OPEN QUESTIONS
1. (Erik) Open all types at once, or phase? Lean: npc (already open) + creature + item first (most player-facing,
   most-wanted), skill/encounter next. Each ships when its contract + exemplars are ready.
2. (Aevi) The per-type contract + concreteness markers for item/skill/ability (not yet in the consumer map) — I
   author these next, grounded in the real schemas (item effect, skill function-family/tier/cost).
3. (Erik) Tier the gate by type? A hollow MONSTER breaks a fight (hard-reject); a slightly-thin ITEM degrades
   gracefully (warn-repair)? Lean: hard-gate the types whose hollowness BREAKS play (monster, skill, quest,
   encounter), warn-repair the types that only DEGRADE (item flavor, npc depth).
4. (CCode) Can the consumer map fully drive the gate for all types, or do some need a bespoke coherence check
   (like SNG-249 §5 for quests)? Lean: consumer map for completeness+concreteness; bespoke coherence only for the
   structured/arc types (quest, encounter, arc).
