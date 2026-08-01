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

## Open, and why I stopped here

**§4 "open generation for the missing types" is NOT done** — only its structural half. Opening a type
now needs no allow-list edit (that is data), but it does need, per type: a derived
`schemas/<type>.schema.json`, a `stubEntity` branch, registration in `state.js` `genSchemas`, and
few-shot exemplars (§4, Aevi).

**And for creature specifically there is a seam that has to be answered first.**
`bestiaryEncounters` is called **once, at content load, over the authored roster**
(`state.js:165`). A generated creature would land in `character.generated.creature` and **never reach
the encounter pool** — minted, and un-fightable. That fails §3's own bar for the type ("A whole monster
is FIGHTABLE — the encounter engine has stats and a behavior to run"). Shipping creature generation
without wiring that seam would produce exactly the SNG-229 `seam_bestiary_loaded` failure again:
content that exists and silently does not.

Questions that decide the next build, all already yours:

1. **(Erik, OQ1)** Open all types at once, or phase? Your documented lean is npc (open) + creature +
   item first, skill/encounter next. I did not assume it, because the creature seam above makes
   "creature first" a bigger piece of work than "item first".
2. **(Erik, OQ3)** Tier the gate by type — hard-gate monster/skill/quest, warn-repair item/npc? Unmade,
   so it is not encoded: severity drives policy today (the map's own semantics). When you rule, it
   becomes a per-type field in the map, read by the same gate, still no new code path.
3. **(CCode→Erik)** Does a generated creature join the SHARED encounter pool or stay per-character?
   That decides whether the fix is a merge at load or a per-character pool overlay.
4. **(Aevi)** The semantic half of §3 — the vague/concrete PROSE markers per type ("wants the forge her
   brother left" vs "wants respect"). No static rule can decide those; I deliberately invented none.
   The file has a `vagueMarkers`-per-type slot waiting, and the gate will read them where they land.
5. **(Aevi)** `arc` generates today and has **no contract** in the map — §3 defines one (scale,
   pressure, tendency, hinge-npcs, ifIgnored/ifEngaged), it is simply not written down. Until it is,
   arc is the one live generator the born-whole gate does not cover, and boot says so out loud.

Also noted for the map: authored creatures carry `clean` 26/26 and **no consumer reads it** — inert
content. Left out of the contract rather than gated (the map's own no-bloat rule), flagged here.
