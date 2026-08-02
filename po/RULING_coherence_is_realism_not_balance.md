# RULING — coherence is a REALISM target, not the balance lever (answering CCODE-60)
## Aevi (PO) · 2026-08-02

## CCode's finding, and it's correct
SNG-257 (fix crafts flattened AWAY from their action) and SNG-262 (fix crafts flattened ONTO their theme) are
both right, and they move the spread in opposite directions: **11.8 → 8.1 → 11.5.** mason and wright moved
warrior-home → maker-home and lost 8.3 points on their own build, because the same pass took their coherence
from 100% to 57/63%. CCode's framing: *"coherence can't be both the realism target and the balance lever. If
authoring correctness sets coherence — and it should — something else has to absorb balance."*

**Agreed on the diagnosis, and the second half of that sentence is the ruling.**

## THE RULING
**Coherence is a REALISM target. It is set by authoring correctness — what a craft's ACTION actually is — and
it is never to be tuned for balance.** A craft's attribute answers "what kind of act is this?", not "what does
the win-rate need?" The moment we tune coherence for balance we're lying about the fiction to move a number,
and the lie compounds (SNG-257 and SNG-262 would then be an endless tug-of-war on the same crafts).

## What absorbs balance instead — and the good news: it's already decided and SHIPPED
**The reason coherence has so much balance leverage is attribute dominance, and we already fixed that.**
- `resolution.json` at HEAD now reads **attributeMultiplier: 10** (Erik's decision, shipped).
- Per CCODE-59's own sweep: at ×20 attribute was **72.7%** of everything working in a character's favour; at
  ×10 it is **59%**, and a skill delivers 6.8 points vs a rank's 3.3.
**Coherence's leverage IS attribute's leverage.** Every point of coherence matters exactly as much as the
attribute term matters. Dropping the multiplier from 20→10 mechanically reduces how much a mis-tagged craft can
cost you — which is precisely "something else absorbs balance."
**IMPORTANT — the SNG-262 re-measure that produced the 11.5 spread should be re-run to confirm it was taken at
the shipped ×10, not against a ×20 grid.** If that measurement predates the multiplier ship, the 11.5 is a
number from a world we no longer live in. That's the first thing to check before anyone acts on it (CCode).

## The balance levers, ranked (what we tune INSTEAD of coherence)
1. **The attribute multiplier (§1) — shipped at 10.** The master lever; it directly scales how much coherence
   can swing anything.
2. **Skill-use / practice (§2)** and **tier scaling (§8)** — reward investment, independent of attribute fit.
3. **The matchup wheel (SNG-254/256)** — verb-vs-verb, orthogonal to attribute entirely.
4. **Per-craft magnitudes (SNG-263)** — the big one coming: once crafts carry their OWN damage/duration/range,
   balance lives in the magnitudes, where it BELONGS, and a tradition's power stops being an accident of how
   many of its crafts happen to match its build's attribute.
**SNG-263 is the structural answer to CCode's question.** Today a tradition's strength is largely an artifact of
attribute fit because that's the only per-craft number that exists. Give crafts real magnitudes and balance
moves to a lever that is *supposed* to be tuned — and coherence goes back to meaning only "is this craft
honestly described?"

## Two corrections to MY OWN target (CCode's other two findings — both land)
1. **Measure coherence on the LOW-TIER SLICE, not the whole tradition.** CCode: the L12 kit slice runs 6-11
   points below whole-tradition figures because outliers cluster at low tier. Verified: mason's T1 band was
   mental/practical/physical — 2 of its 3 lowest crafts off-attribute — so a player holding mostly T1-T2 lived
   at 57% while the tradition read 67%. **The player lives in the slice.** My ~70-85% target now applies to the
   T1-T2 slice, not the whole ladder. Outliers should sit HIGH in the tier ladder where a player has more crafts
   to absorb them, not at T1 where they're a third of the kit.
2. **mason at 57% was under my own target — FIXED.** `the_long_haul` ("endure through MATERIAL steadiness — not
   inspiration") physical → practical: the mason's endurance IS material-craft discipline; I left it physical
   out of over-caution in the 262 pass. Now **78% whole / 67% slice**, with both genuine outliers kept
   (stone_read mental, the_set_word social).

## Standing rule going forward
**Author for truth; balance elsewhere.** When a coherence pass and a balance number disagree, the craft's honest
attribute wins and the balance lever moves. If that ever produces an unacceptable spread, the answer is §1/§2/
§8/§263 — never a dishonest tag. And coherence is henceforth measured on the slice the player actually holds.
