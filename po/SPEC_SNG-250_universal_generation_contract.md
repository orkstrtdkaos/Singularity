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


---

# §6 — WHOLE IS NOT FROZEN: every type declares how it EVOLVES (Erik, 2026-07-27)
Erik: "Making each of these whole doesn't mean making them completely rigid. They all likely need a way to
evolve and grow. We've seen this with Pell (NPC) and Memory — so build that in as well."

The essential counterbalance to §1-5. "Born whole" must not harden into "born FROZEN." A world where nothing
changes after creation is dead. The contract has TWO halves:
- **Born whole** (§1-5): complete, concrete, coherent AT creation.
- **Grows through play** (§6): a defined way to EVOLVE after creation, so the whole thing is a living seed, not
  a finished statue.

## §6a — the state (verified): growth EXISTS but is per-type, ad hoc, and has a hole
Most types already evolve — but via scattered, per-type mechanisms, and one type can't evolve at all:
- **item** → applyItemUpdates + evoStage (SNG-215) — grows in stages ✓
- **npc** → applyNpcUpdates + relationshipDelta — **the Pell mechanism** ✓ (disposition/relationship move through play)
- **location** → applyPlaceUpdates + placeMemory — accrues history/**memory** ✓ (Erik's second example)
- **companion** → growBond + stageCount — bond deepens ✓
- **skill/ability** → tree/rank ladder (CCODE-29) — evolves rank-by-rank ✓
- **arc** → net-vector advancement (SNG-203) ✓
- **creature/monster** → **NOTHING** — frozen once minted (no creatureUpdates path)
- **quest/encounter** → stages ADVANCE (progress) but the quest itself doesn't EVOLVE (a static structure you walk)
So growth is REAL but UNCONTRACTED — nothing guarantees every generatable type declares HOW it grows, the
mechanisms are six different scattered modules, and creatures are frozen. Erik's point: make evolution part of
the contract, universally.

## §6b — the growth half of the contract
Just as §3 defines what makes each type WHOLE, each type declares HOW IT GROWS — its evolution vector(s):
- **NPC** — relationship/disposition moves with the player (the Pell path); wants can shift as they're met or
  betrayed; a new want can surface. The interiority is a STARTING state, not a fixed one.
- **CREATURE** (the gap to fill) — a creature can evolve: a beast that survives an encounter grows warier/scarred;
  a recurring threat escalates tier; a bonded/tamed creature shifts disposition. Give creatures a `creatureUpdates`
  path (generalize itemUpdates/npcUpdates) so a monster met twice isn't identical.
- **ITEM** — evoStage growth through use (SNG-215) — already there; keep as the model.
- **SKILL** — rank-ladder evolution (already there); a skill deepens with mastery.
- **LOCATION** — placeMemory accrues; a place remembers what happened there, its danger/tone can shift with events.
- **QUEST/ENCOUNTER** — beyond stage-advance: a quest can EVOLVE (a new stage surfaces from a choice, an outcome's
  aftermath spawns a follow-on, the world's reaction changes the remaining arc). Distinct from §5's "complete arc
  at creation": the arc is whole at birth AND the world can extend/branch it through play — the SNG-204 wake +
  SNG-245 pressure are the vectors (a finished quest WAKES into new pressure). Growth here = the aftermath lives.
- **ARC** — net-vector advancement (already there).

## §6c — the same discipline as §1-5, applied to growth
- **The evolution vector is CONCRETE** — "grows warier (threat +1, gains a scar-trait)" not "changes somehow." A
  growth path is as testable as a birth field: a real state transition, engine-detectable (ties SNG-235/249).
- **Growth is COHERENT with what the thing IS** — an NPC's evolution follows from their authored interiority
  (Pell grows possessive because she was born possessive), a creature's from its class, an item's from its use.
  Growth EXTENDS the whole; it doesn't contradict it. (A gentle NPC doesn't randomly turn cruel — evolution is
  grounded in the born-whole self, the way §5's arc is grounded in the premise.)
- **Growth is BOUNDED** — no power inflation (the itemUpdates rule already: "no power inflation"). Evolution
  deepens and shifts; it doesn't runaway-escalate. The bound is part of the contract.

## §6d — enforcement
- **CCode:** a `creatureUpdates` path (the missing one) generalizing the itemUpdates/npcUpdates pattern; and a
  contract check that every generatable type DECLARES an evolution vector (a type that can be generated but has NO
  way to grow is flagged — creatures today). Unify the scattered growth mechanisms under one "evolvable" contract
  (each type points at its evolution path) so it's legible + every future type must declare how it grows.
- **Aevi:** the per-type growth SEMANTICS — what a concrete, coherent, bounded evolution looks like per type
  (how a creature grows warier, how an NPC's want shifts, what a quest's aftermath spawns), + the growth prompt
  guidance so generated updates stay concrete + grounded + bounded.
- **Erik:** how MUCH the world evolves things (aggressive living-world vs. stable) — likely the same pacing/
  Eventful dial; and whether generated entities evolve as readily as authored ones (lean: yes — a generated NPC
  is as alive as an authored one, that's the point).

## §6e — guards
- **Whole AND living** — born complete (§1-5) AND able to grow (§6); neither half alone. A frozen-whole entity is
  a statue; a growing-but-hollow one is the mush §1-5 banned. Both halves, every type.
- **Evolution is grounded** — growth follows from the born-whole self (Pell's possessiveness deepens; it doesn't
  invert). Coherent evolution, not random mutation. The §5 coherence bar applies to growth too.
- **Concrete + bounded** — a growth step is a real, testable, bounded transition (no "changes somehow", no power
  inflation). Same bar as birth.
- **Every type declares its vector** — the contract's second half: a generatable type with no evolution path is
  incomplete (fix creatures). Future types declare how they grow, as they declare how they're whole.
- **Fix the creature hole** — creatures are the one generatable-ish type that's frozen; the creatureUpdates path
  is the concrete first deliverable of §6.

## §6 open questions
1. (Erik) Living-world aggression for evolution — reuse the Eventful/pacing dial (Calm = things change slowly,
   Eventful = the world evolves fast)? Lean: yes, one dial.
2. (CCode) creatureUpdates: generalize itemUpdates, or does a creature need its own shape (threat/behavior/
   disposition deltas)? Lean: generalize the pattern, creature-specific fields.
3. (Aevi) Per-type growth semantics + the "how it grows" prompt guidance — I author next, grounded in each type's
   real evolution path.
4. (Erik) Do quests EVOLVE (aftermath spawns follow-ons) or just ADVANCE? The wake engine (SNG-204) is the vector
   — lean: yes, a finished quest's aftermath can grow the world (that's what wake is FOR).


---

# §7 — DECIDED (Erik, 2026-08-01): gate tiering + generated-creature scope
Two rulings that close SNG-250's + CCODE-55's open questions:

## §7a — OQ3: tier the gate per type — YES, but LIGHT (the gate already tiers by FIELD severity)
Erik: "If the gate tiered per type makes sense, ok." It does, and the key is it's a SMALL addition, not a new
system — the gate ALREADY decides reject-vs-warn by FIELD severity (CRASH→reject, EMPTY→repair, DEGRADED→warn),
and those severities are already set per-type in the map. So per-type tiering is just a **per-type policy field**
that raises the stakes for the types whose hollowness BREAKS play:
- **Hard-gate (a broken one must NOT ship): monster/creature, skill, quest, encounter.** A hollow monster gives
  the encounter engine nothing to run; a hollow skill resolves to nothing; a hollow quest/encounter has no
  playable arc. For these, EMPTY escalates toward reject (regenerate), not just repair.
- **Warn-repair (a thin one degrades but plays): item, npc, location, arc.** A thin item does a bit less, a thin
  npc is flatter — annoying, not broken. For these, EMPTY stays repair/warn.
Implementation is a `gateTier: "hard" | "soft"` field per type in the consumer map (default soft), read by the
SAME one gate — no new code path (CCode's CCODE-55 already anticipated this: "when you rule, it becomes a per-type
field in the map, read by the same gate"). Aevi sets the tier field per type; the severities themselves are
unchanged. LIGHT: don't build a parallel policy system; one field, honored by the existing verdict logic.

## §7b — generated-creature scope: SHARED-ON-SIGHT (Erik)
Erik: "shared-on-sight — yes." A generated creature does NOT stay locked to the character who minted it — it joins
the SHARED world so another character can encounter it too. This matches the one-shared-Valley principle (the
death-propagation call): one player's world is the shared world. CCode built per-character (matching every other
grown entity); this OVERRIDES that for creatures → shared-on-sight.
- **"On sight" = the live-scene guard applies** (same as the shared-death principle): a generated creature
  becomes shared/canonical, but reaches another character as the world catches up at a safe seam — it doesn't
  teleport a monster into someone's active scene. It becomes available to encounter, not injected mid-beat.
- **This depends on the creature bestiary-pool SEAM being wired first** (CCODE-55 flagged: a generated creature
  lands in character.generated.creature and never reaches the encounter pool — the SNG-229 class). Shared-on-sight
  makes that wiring a SHARED-pool merge, not a per-character overlay — so the seam fix and the shared-scope
  decision are the same piece of work: generated creatures promote into a shared bestiary pool (via the
  syncSharedCanon path that already promotes generated npcs/locations), guarded by the live-scene rule.
CCode: wire generated creatures into a SHARED encounter pool (via syncSharedCanon-style promotion), live-scene
guarded, so a creature one character mints becomes another's possible encounter.
