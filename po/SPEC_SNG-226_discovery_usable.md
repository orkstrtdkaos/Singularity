# SPEC — SNG-226: A discovery is recorded but NOT usable — the intent-parser refuses it
## Aevi (PO) · 2026-07-22 · verified at origin with the live "See the Machine" panel + the save

> **Erik, live:** told the GM to "let your Marrow's Wings emerge as you ask and prepare to fly there" — the
> GM/parser refused: *"Character has no ability named 'Marrow's Wings' or any flight ability in their sheet.
> The action cannot proceed."* He EARNED the skill and the game won't let him use it.

## §1 — Verified: a discovery is a RECORDED FACT, not a USABLE CRAFT
The "See the Machine" panel (SNG-179 dev diagnostic) shows the whole chain: the intent-parse call
(claude-haiku, 23:37:37) was fed **"Character abilities: order_sense, deathsense, … hunters_strike"** — and
`marrow-s-wings` is **NOT in that list**. The parser checked, didn't find it, and correctly returned
`feasible:false` / OPS EMITTED: none. Working as coded — the parser only knows `abilities[]`.

Confirmed in the save:
- Marrow's Wings is in `character.discoveries[]` (id `marrow-s-wings`, parents [the-attended-end,
  the_shadow_work], day 13) but **NOT in `character.abilities[]`.**
- `recordDiscovery` (progression.js) pushes to `discoveries` and STOPS — it writes
  `{key, id, name, description, abilities, discoveredDay}` and **nothing with a USABLE shape** (no rank, no
  energyCost, no effect, no functionFamily). It records the FACT of the discovery, never the CAPABILITY.

**So a discovery today is a diary entry, not a spell.** Every system that reads `abilities[]` — the
intent-parser, the skill wheel, the roll resolver, the GM's ability context — is blind to it. The player
earned a craft they cannot cast, reference, or roll. This is the mechanical twin of SNG-222 (no celebration):
222 is the discovery has no MOMENT; 226 is the discovery has no USE.

## §2 — Outcome wanted: a discovery becomes a usable ability
When a discovery mints, it should also register as a learnable/usable craft, so the player can actually DO it.
`recordDiscovery` (or its caller) must ALSO add a usable ability entry:
- **Register the ability** — add `marrow-s-wings` to `character.abilities[]` with a real usable shape: an
  `abilityId`, a starting `rank` (1 — earned raw, deepens through use like any craft), an `energyCost`, a
  `functionFamily` (MOVE/transit, given it's flight), and the `description` the GM already authored.
- **Derive the shape from the parents + the discovery.** The discovery already names its parent crafts
  ([the-attended-end, the_shadow_work]) and has the GM's description. Cost/family can derive from the parents
  (a braid of a death-craft + a shaping-craft → a MOVE-family craft at a cost near the pricier parent) or be
  authored at mint. A braid/discovery is a rank-1 craft the moment it's discovered — that's the reward.
- **It's a BRAID-shaped ability.** Existing braids (`braid_order_sense_palework`,
  `braid_deathsense_order_sense`) are ALREADY in Silas's `abilities[]` as usable crafts with the `braid_`
  shape. **Marrow's Wings should be registered the SAME way a braid is** — the machinery exists; discoveries
  just aren't routed through it. Likely fix: `recordDiscovery` calls the same registration `mintBraid` /
  `applyNewAbility` uses, so a discovery lands in `abilities[]` with a usable shape, not only in
  `discoveries[]`.

## §3 — The parser must then SEE it (the downstream half)
Once the ability is in `abilities[]`, the intent-parser's "Character abilities:" line includes it
automatically (it lists `abilities[]`), so "let Marrow's Wings emerge" resolves to `abilityId:
marrow-s-wings` instead of `feasible:false`. Verify the parser context builds from `abilities[]` (it does —
the panel shows it) so no extra wiring is needed beyond §2. **Fixing the registration fixes the parser, the
wheel, and the resolver all at once** — they all read the one list.

## §4 — Backfill Marrow's Wings (Erik's, exists now)
Marrow's Wings already minted as discovery-only. Like the SNG-222 moment-backfill and the SNG-216 _gen
backfill: a load-time pass registers any discovery that isn't yet in `abilities[]` as a usable craft, so
Silas can USE Marrow's Wings without re-discovering it. ⚠️ Live layer (the running app backfills on load) —
no origin save-poke.

## §5 — Ties to SNG-222 (do them together)
222 (the discovery gets a MOMENT) and 226 (the discovery becomes USABLE) are the two halves of "a discovery
is real." Both fire at the same `recordDiscovery` mint site. Do them in one pass: mint → register as usable
ability (226) → queue the celebration moment with its image (222 + §5) → backfill covers both for
Marrow's Wings. A discovery should arrive as a usable, celebrated, illustrated craft — not a silent diary
line the parser then refuses.

## OWNERSHIP
CCode — engine (recordDiscovery registers a usable ability; derive/author the shape; backfill). No content
authoring needed for the fix itself; the GM already wrote Marrow's Wings' description. Aevi: if discoveries
want a standard function-family/cost DERIVATION rule (so every future discovery gets a sane usable shape
without per-mint authoring), Aevi can author that derivation guidance — flag if wanted.

## GUARDS
- **A discovery must be USABLE, not just recorded** — the whole point of discovering a craft is to wield it;
  a discovery that can't be cast is a broken reward.
- **Register like a braid** — reuse the existing braid/newAbility registration; don't invent a parallel
  "discovered ability" type that the parser/wheel/resolver would ALSO need teaching to read.
- **Rank 1, deepens through use** — a discovery arrives raw (rank 1), earns depth through practice like every
  craft; it's not free mastery, it's a new door at the ground floor.
- **Backfill idempotent** — a discovery already in `abilities[]` is not re-registered.
- **Keep the discovery record too** — `discoveries[]` stays (it's the moment/codex source); §2 ADDS the
  usable ability, doesn't replace the discovery fact.

## OPEN QUESTIONS — CCODE ROUND 2
1. Does `recordDiscovery` route through `mintBraid`/`applyNewAbility` cleanly, or does the discovery shape
   need a small adapter to become a usable ability? (Braids are already usable — follow that path.)
2. Cost/family derivation — derive from parents at mint (automatic) or author per-discovery? Automatic is
   better for a generative system; a derivation rule (Aevi can author) keeps it sane.
3. Backfill scope — just Marrow's Wings, or general "any discovery not in abilities[] gets registered"? Lean
   general (other saves may have silent-unusable discoveries too).
4. Should a discovery's ability be immediately usable, or require a "practice it once" step first? (Lean
   immediately usable — the discovery IS the earning; gating it again would blunt the reward Erik just felt.)
