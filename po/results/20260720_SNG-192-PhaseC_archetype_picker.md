# SNG-192 Phase C — The archetype picker (a lens, not a class)

**CCode · 2026-07-20 · v1.8.179 · COMPLETE_PENDING_REVIEW · suite green by exit code (EXIT=0)**

The last SNG-192 phase, and the "fun" front door (§4): a player who doesn't want to read 45 buttons picks a
**shape** — Magus, Shadow, Seer, Warden, Artificer, Voice — and the suggestions lean toward it, with the
reasoning shown, and they change any of it. **This also completes the SNG-192 decomposition** (A · B · C).

---

## The orphan, loaded (§4 / §8 Q2)

`content/packs/core/rules/class_archetypes.json` was authored, registered in `provides.rules`, and **called
by nothing** — a clean L4 orphan (the manifest was fine; the loader just never asked for it). `state.js`
now `loadRule("class_archetypes")` → `CONTENT.classArchetypes`. Reached; `content_ci` clean.

## The verify-before-build check — this time the premise HELD

Before wiring `coreFunctions`, I confirmed the values (as with `gains` last phase). **All 9 distinct
`coreFunctions` — bind, break, reveal, mend, conceal, move, heal, shield, ward — ARE in the 24-verb
vocabulary**, so they map cleanly: Shadow's `conceal/move/reveal → INFLUENCE/MOVE/KNOW`. The premise was
sound; the field is real function data. (A test now asserts *every* archetype's coreFunctions are real
verbs, so a future authoring typo fails the build.)

## The lens — biases, never locks (§7.5)

- **`archetypeFamilies(coreFunctions, fnIndex)`** (functions.js) maps a shape to the function families it
  leans on. **`suggestForCreation`** gains an `archetypeFams` param: a craft whose families intersect the
  lens is boosted, and its reason becomes *"fits the Shadow / Stealth path."*
- **It BIASES, never gates.** An off-shape craft still surfaces when it earns its own reason (a
  prologue-favoured or coverage-filling craft is never suppressed by the lens) — tested explicitly.
- **The UI** (`renderAbilityStep`): an archetype picker row — *"A shape to start from — optional, a lens not
  a class"* — above the suggestions. Picking a shape shows its `whatItIsHere` + `signature` and re-leans the
  suggestions; the toggle **never touches the picks** (clicking it again clears the lens). §7.5: it selects,
  it does not lock — the player still chooses the 2 crafts, now from an archetype-shaped list.

## Invariants held (§7)
- **An archetype is a lens, not a class** (§7.5) — it biases the suggestions; the picks are untouched. ✓
- **Suggestions never restrict** (§7.3) — the full pool stays one click away; the lens only re-orders. ✓

## What I did NOT do (a deliberate scope line)
- **No auto-fill.** The spec's "get a coherent build" could mean pre-selecting the 2 crafts. I made the lens
  *surface* the coherent build as the top suggestions (one click each) rather than auto-writing
  `state.abilities` — auto-fill risks clobbering a deliberate pick, and "a lens never locks" reads as
  *surface*, not *impose*. If Erik wants a one-tap "build me a Shadow," that's a small, safe addition on top
  (auto-select the top-N lens suggestions only when the picks are empty).
- **No per-tradition `byReach` filtering.** `byReach` is keyed by *reach/axis*, not tradition, so "this
  archetype as an Ashwarden" needs a tradition→reach map. The picker shows `whatItIsHere` + `signature`
  (the durable, honest part); wiring the exact per-people `byReach` line is a small follow-on if wanted.

## Verification
- **7 tests**: `archetypeFamilies` mapping, the every-coreFunction-is-a-real-verb premise check, the lens
  boost + reason, the never-gates guarantee, and the load + picker + toggle wiring. Full suite **EXIT=0**;
  wiring audit + ENGINE_MAP (59/59) ok; ratchets flat; `class_archetypes` no longer an orphan.
- **Browser:** same creation-flow leg as A/B — engine tested, UI source-verified; the gated creation
  **visual** (the archetype row, the re-leaning suggestions) is Erik's real-save test on a fresh load.

## SNG-192 is complete
- **A** — grants shown first + suggestions with reasons (the wasted-pick fix, the wall folded).
- **B** — robustness readouts (coverage, the power-source common-ground window, the coherence/divergence
  framing) + the `gains` finding (premise wrong, not wired).
- **C** — the archetype front door (this).

*— CCode. Pick "Shadow" and the list leans toward the unseen ways; pick nothing and choose freely. The shape
is a door you walk through, never a wall you're put behind.*
