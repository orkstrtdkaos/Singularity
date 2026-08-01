# CCODE-55 — SNG-250 §3/§4/§5: the universal born-whole gate
## CCode · 2026-08-01 · complete_pending_review

Builds SNG-250's CCode half: the consumer map promoted to real content, extended to item + skill, and
ONE gate keyed by it that holds authored and generated content to the same bar. Shipped in three
commits, full `npm test` green on each.

---

## What shipped

**1. The map is registered content, not a staged file.**
`po/staged_content/consumer_required_subfields.json` → `content/packs/core/rules/`, registered in the
core manifest's `provides.rules`, loaded through the SNG-092 `loadRule` path onto
`CONTENT.consumerContract`.

The reason this had to come first: §4 calls the map "the source of truth" driving BOTH the CI check on
authored content AND the birth gate on generated content — but **the browser cannot fetch `po/`**, so
the generation half was structurally unreachable. The contract could only ever govern authored content.
It is core, not valley, because it is a rule about every type rather than Valley content.

**2. The map now covers item + skill, and creature is corrected.**
Every field verified at origin by grepping the real consumer, the same non-speculative discipline the
map was authored under.

- **creature — three corrections.** `threat` REMOVED: no consumer reads it off a creature.
  `random_encounters.js:64` sets `opponent.threat` from the `BEAST_TIER` table keyed by `tier`, so it
  is DERIVED, never authored. All 26 roster entries lacked it and warned on every CI run — a permanent
  false warning. `pressures` corrected object → array. `look` and `danger` ADDED (both real reads the
  map never listed; `danger` is the field it mis-named `threat`). **The creature sweep goes 26 warns →
  0: the roster was always whole, the map was wrong.**
- **item — new.** §3 asks for "a mechanical EFFECT", but the engine has TWO hooks and 19/19 authored
  valley items carry neither an `effect` nor `effects` field: gear resolves through `bonusTags`,
  consumables through `effects.health/energy`. So "rules-resolvable" is a rule over the two real hooks,
  not a required field no consumer reads.
- **skill — new.** All 285 authored abilities carry `functions` + `energyCost` + `levelReq` (0 missing
  of each), so this contract costs authored content nothing.
- **the `concrete` layer.** Each type may declare rules beside its fields: `topLevel` answers *is it
  whole*, `concrete` answers *is the value something the rules can ACT on*. Machine-checkable only
  (`enum`, `everyInVocab`, `nonEmptyArray`, `numberInRange`, `someNumeric`, `anyOf`,
  `impliesSomeNumeric`), each traceable to a real read or clamp in HEAD.

**3. `engine/borncontract.js` — one gate, every type.**
No per-type branch; keyed entirely by the map, so a type declared in that file is gated with no engine
change (asserted in smoke by gating an invented `widget` type). Pure — contract and vocabularies are
injected — which is what lets **the same function** serve the browser's generation path and headless
CI. §4's "authored and generated held to the same bar" is only true if it is literally one function;
two implementations of one contract drift (the CCODE-16 lesson).

- `generate()`: after the schema repair/floor pass, a CRASH verdict **rejects**; anything softer is
  kept and stamped on `_gen.contract` so it stays findable. Generation still never throws.
- `content_ci`: the same gate over authored content, now covering item (30) and skill (285).
- The app's allow-list was the literal `["npc","location","arc"]` — it is now derived from
  `CONTENT.genSchemas`, and boot names any type whose halves disagree.

---

## Findings

**A real content bug, found on the gate's first authored run — Aevi's lane, not fixed here.**
`healers_draught` and `clarity_tea` (`content/packs/valley/items/valley_kit.json`) are
`consumable: true` with **no `effects`**. `consumeItem` (inventory.js:224) destroys the stack and
returns `{}` — the player drinks a draught described as *"closes wounds and steadies a failing body"*
and provably nothing happens, and `usableCombatItems` will not offer either as a move. The core
`healing_draught` beside them has `effects: {health: 8}`. Suggested: `healers_draught {health: 8}`,
`clarity_tea {energy: 10}` — but the numbers are yours.

**The generated half was already minting hollow skills.** `sanitizeNewAbility` (progression.js:529,
live since v1.0.0) sets `effectTags: []` and **no `functions` array at all**, so every GM-generated
ability resolves to zero families through `familiesOfAbility` and is invisible to `functionCoverage`,
`recommendSkills` and the wield/battle machinery. The engine has been minting precisely the decorative
skill §3 names — while the authored floor is 285/285 clean. This is the sharpest argument that the
contract has to gate GENERATION, not only CI.

**89 of 285 authored abilities have no `notFor`** — no negative envelope, so the GM has no authored
bound and can drift the craft outward through play. Warned, not gated. Aevi's call whether that is a
gap or acceptable.

**Two of my own rules were wrong, and the gate caught them.** `cost-in-band` (energyCost 4..15) flagged
111 of 285 authored abilities — the authored range is 1..14 and the cheap crafts are correct; 4..15 is
a *generation clamp*, not a statement about what makes a skill whole. And a flat `bonusTags`
requirement flagged 3 consumables that resolve fine through `effects`. Both are the same class as the
`threat` field this ticket removed: **a rule that flags correct content teaches people to ignore the
sweep**, which is worse than no rule.

---

---

## Part 2 — all four types now gated (added after the first write-up)

**The design correction that shaped the rest.** Items and abilities do NOT go through `generate()`.
Items enter play via `characterDeltas.inventoryAdd` → `addItem`, abilities via `newAbility` →
`sanitizeNewAbility`. Adding them to `GEN_TYPES` would have built a SECOND mint path for each — exactly
what §4's "the gate is ONE mechanism" forbids. The types were already generated; they were simply
ungated. So the contract went onto the real producers.

- **SKILL — a live bug fixed, not a feature added.** `sanitizeNewAbility` never set `functions` at all,
  so every GM-generated ability resolved to zero families and was invisible to `functionCoverage`,
  `recommendSkills` and the wield machinery. It now mints `functions` with the verb vocab injected and
  off-vocab verbs dropped (keeping them would look whole and resolve to nothing). The GM op contract
  now ASKS for functions from the closed 24-verb vocabulary — without that the engine would read a
  field the prompt never requests, which is the `seam_op_vocab_triples` rule.
- **ITEM — gated at `inventoryAdd`, never rejected.** The fiction just handed the player the thing;
  §3 rates a thin item DEGRADED and Erik's OQ3 lean is warn-repair here. So it is kept, stamped, and
  the one case worth telling the player about is said out loud: a consumable that spends to nothing.
- **CREATURE — opened, with the seam wired.** See below; this was the real work.
- **ARC** — Aevi authored the contract; I reconciled `pressure-numeric` → `pressure-concrete` (arc
  pressure is prose, not an object with numeric sub-keys; it flagged 5 of 5).

**The creature seam, resolved.** `generatedCreatureEncounters(character)` delegates to
`bestiaryEncounters` — one precedent, not a second mechanism — so a grown monster draws its
threat/weight/minDanger from `BEAST_TIER` exactly as an authored one does. The app now has ONE merge
point, `encounterTable()`, and all 7 pool reads go through it; a raw `CONTENT.randomEncounters` read is
now the bug, asserted against in smoke. Declared as `seam_generated_creature_reaches_pool`.

**Placement assumption, stated because Erik's OQ is open:** generated creatures are PER-CHARACTER, and
reach shared canon through the existing BATCH-9 Phase 3 nomination path like every other grown entity.
That is the established pattern, not a new decision. If he wants grown monsters shared valley-wide on
sight, the change is the merge point, not the design.

**Three more bugs the work surfaced, all mine:**
- `worstOf` seeded with `null`, and `rankOf(null)` falls back to DEGRADED — so a DEGRADED-only report
  reported verdict **"clean"**. The CI sweep hid it by reading `missing`/`vague` directly, but the live
  item path branches on `verdict !== "clean"`, so thin items were waved through in exactly the case the
  gate exists for.
- The gate **crashed** on Aevi's arc contract: she authored `concrete` as an object map, I had written
  it as an array, and the `for…of` threw inside `checkBorn` — which `generate()` calls on every mint.
  A pure CONTENT edit would have taken down generation in play. The gate is now total over its
  contract, and normalizes both shapes so neither author has to change style.
- Aevi and I each wired the arc sweep concurrently; it ran twice. De-duped.

**Aevi cleared her asks in the same window** — the draught bug is fixed in content
(`healers_draught {health:8}`, `clarity_tea {energy:10}`), the arc contract is authored, and per-type
`vagueMarkers` (the semantic concrete/vague layer) are in and now read by the gate, conservatively:
"wants respect" flags, "wants the forge her brother left" does not. Measured at 0 hits across 72
authored records before shipping.

**Current coverage:** 7 types contracted (quest, npc, location, creature, item, skill, arc). CI sweeps
all 7 — 41 npcs, 96 locations, 26 creatures, 30 items, 285 abilities, 5 arcs, 19 structured quests.
0 CRASH failures anywhere. Remaining warns are real: 89 abilities with no `notFor`, 3 items, 42 npc
interiority gaps, 9 companion `bondGrants` with no `functions`.

---

## Open, and why I stopped here

1. **(Erik, OQ1)** Answered in practice — all four types are now gated and creature generation is
   open. Nothing is waiting on this; it is recorded because the spec still lists it open.
2. **(Erik, OQ3)** Tier the gate by type — hard-gate monster/skill/quest, warn-repair item/npc? Still
   unmade, so still not encoded: severity drives policy (the map's own semantics), which today means
   CRASH-reject / EMPTY-repair / DEGRADED-warn uniformly. When you rule, it becomes a per-type field in
   the map read by the same gate — no new code path.
3. **(Erik)** Do generated creatures stay PER-CHARACTER (what I built, matching how every other grown
   entity works) or join the SHARED pool on sight? If shared, the change is the merge point only.
4. **(Aevi)** 89 of 285 abilities have no `notFor` — no negative envelope, so the GM has no authored
   bound and can drift the craft outward through play. Warned, not gated; your call whether that is a
   gap worth filling or acceptable.
5. **(Aevi)** All 9 companion `bondGrants` have no `functions`, so every companion-granted ability is
   born engaging no family. CI names all 9 by file. The engine half is fixed; the verbs are yours.
6. **(Aevi)** The GM prompt's own `inventoryAdd` template shows `"effects": {"health": 0, "energy": 0}`
   — the literal inert-item shape the gate flags. The contract has been teaching the hollow shape.
   Prompt copy is your lane; the op *shape* I already touched for `newAbility`.

Also noted for the map: authored creatures carry `clean` 26/26 and **no consumer reads it** — inert
content. Left out of the contract rather than gated (the map's own no-bloat rule), flagged here.

**Still genuinely not built:** quest and encounter generation. Both are contracted (quest) or specced
(encounter) but neither has a generator, and SNG-249 §5's coherence check for structured types is the
bespoke piece §4 OQ4 anticipated — the consumer map drives completeness and concreteness, but "the
stages lead to the resolutions" is not a field check.
