# SPEC — SNG-261: tier IV/V pricing + the precursor system that never surfaces
## Aevi (PO) · 2026-08-02 · Erik: "we have tier IV and V too… and precursor skills I have no idea what they do"

Two gaps Erik named. The first is a completion of SNG-260 §D. The second is a REAL finding: a fully-designed
system that appears never to fire in play.

## §A — TIER IV and V exist; §D's pricing must cover them
SNG-260 §D proposed Tier-II = 2, Tier-III = 3. But the catalog has **28 abilities at levelReq 4 and 26 at
levelReq 5** — the deep end (harmonic, radiant, precursor, and the reach_* braids). A 2/3 scale stops one tier
short of the actual content.
GOAL: the tier price covers the FULL ladder (I-V), and the top tiers are priced as the significant investments
they are. Straight extension: **T-I 1 · T-II 2 · T-III 3 · T-IV 4 · T-V 5** (a linear extension of Erik's
2/3 proposal), composing with the domain-distance penalty as §D says. Erik tunes — the open question is whether
the top should be linear (4/5) or accelerate (e.g. 4/6) so a Tier-V is a genuine capstone purchase. Whatever the
curve, the §D sweep must include T-IV/V in the cheapest-vs-strongest spread, because they're where an
"expensive build" actually gets expensive. NOTE also `capstoneStanding.capstoneTier: 4` — Tier-IV is already the
engine's capstone threshold, so pricing should respect that it's a real threshold, not just the next step.

## §B — THE PRECURSOR SYSTEM: fully designed, apparently never fires (the real finding)
Erik: *"the precursor skills which I have no idea what they do or how they show up in the game at all… Silas
hasn't seen them, neither has Loki, who is literally a walking precursor-created being."*

### What's actually there (verified — the design is GOOD and COMPLETE)
- **6 abilities**, `powerSystem: precursor`, T3-T5: `address_sense`, `latticespeak` (T3), `wake_the_line`,
  `foreclose` (T4), `unmake_seal`, `hold_the_aperture` (T5).
- **`traditions.json → specialSystems`**: "Precursor Arts", civilization *"none living — the ancient
  nanite-lattice"*, **OUTSIDE the pole matrix**, `access: {open:false, note:"fiction-gated: requires precursor
  contact/marking, not native/region/teacher"}`.
- **The GM doctrine exists** (`gm.js` rule 19): never offered at creation or casual level-up; unlocked only when
  the fiction earns it (a live remnant answers, a quest concludes, Old Roads mastery, a teacher); emit
  **`unlockPrecursor`** at that moment, at most one per turn; every use consequential, peril lines real.
- **PRECURSOR DRIFT is built**: `character.precursorAxes` + a `bandNotice` threshold; when a character's vector
  is pushed past the band the GM is told *"they are being changed by what they wield — let it show."*
- **Innate access exists**: `origins.json` seeds `innatePrecursor: ["latticespeak"]` / `["address_sense"]` for
  substrate-keeper origins (seraphic/abyssal) via `seedInnateSubstrate` — access, not a grant (still costs a
  level + a point to learn).
**So nothing is missing mechanically.** This is a well-designed, gated, consequential system with drift and
innate seeding. The failure is that it never REACHES the player.

### The gap (goal-first)
GOAL: **the precursor system actually surfaces in play — findable, legible, and reachable — instead of being
content that exists only in the files.** Specifically:
1. **It should APPEAR in the world.** Precursor remnants, Old Roads, live lattice — the fiction should put the
   player in contact with precursor presence often enough that `unlockPrecursor` has occasions to fire. Today
   the GM CAN unlock it but is given no pressure or cue to stage the encounters that would earn it. (Same shape
   as SNG-258 §11 — the world doesn't DO the thing the system describes.)
2. **The player should know it EXISTS.** Erik — the game's author — says "I have no idea what they do or how
   they show up." If he can't tell, no player can. Precursor arts should be legible as a *rumoured, gated
   thing* (codex, lore, a glimpsed remnant) long before they're reachable — mystery is fine, invisibility is not.
3. **LOKI IS THE TEST CASE and probably a data bug.** A character who is *literally a precursor-created being*
   should almost certainly carry an origin with `innatePrecursor` access (the mechanism exists and is authored
   for substrate-keepers). Either his origin record lacks the seeding, or precursor-construct isn't among the
   origins that seed it. **Check Loki's actual origin/people record against `origins.json`** — if a walking
   precursor construct has no precursor access, that's the single clearest proof the pathway isn't wired to the
   fiction.
4. **Drift should be visible when it happens.** PRECURSOR DRIFT changes the character; per SNG-258 §4d that
   belongs on the character sheet (a visible axis-shift), not only in a GM note.

### What's whose
- **Aevi:** audit Loki's origin/people record vs `origins.json` innatePrecursor seeding (item 3 — likely a
  content fix I can author); author the codex/lore legibility layer (item 2) so precursor arts are a known
  mystery; author GM-prompt pressure so remnant/Old-Roads contact is STAGED, not merely permitted (item 1).
- **CCode:** whether `unlockPrecursor` has ever fired in any save (instrument/telemetry — is this truly never, or
  rare?); surface precursorAxes drift on the sheet (§4d).
- **Erik:** what precursor arts SHOULD feel like when they land (the fiction's intent — these are the
  nanite-lattice's own verbs: address_sense, latticespeak, unmake_seal, hold_the_aperture; they read like
  reality-editing, not spellcasting), and whether Loki's construct-origin should carry innate access.

## Sequencing
§A folds into the SNG-260 §D sweep (just extend the price ladder + include T-IV/V in the test). §B is its own
thread and pairs naturally with SNG-258 §11 (the world uses crafts) — both are "designed system, no path into
play." The Loki origin check is the cheapest first move and would confirm the diagnosis.
