# ANALYSIS — the authored catalog by the numbers: who heals, who harms, who wards, who is lite
## Aevi (PO) · 2026-08-02 · measured across all 288 authored crafts, 27 traditions

Erik asked for numerical analysis now that the crafts are mechanized. **Everything below is measured from the
staged files, not estimated.** One caveat stated up front and then not repeated: these are MY authored numbers,
so this measures the CATALOG'S SHAPE, not playtested balance. It answers "what did the source material actually
ask for", which is the right question at this stage.

## ⚠️ FIRST — THE ANALYSIS FOUND A REAL DEFECT IN MY OWN WORK
`blazeborn` reported **0/5 role coverage**, which is impossible for the tradition that owns `kindle` and
`radiance`. Cause: **the pilot predated the schema lock, and my conversion pass added the `mechanic` block but
never added the `shape` field** — all 12 crafts were missing it. **The engine INFERS shape from verbs, so
everything still resolved and `npm run staged` stayed green the whole time.** Fixed (12 shapes added).
**LESSON WORTH KEEPING: a field the engine can infer is a field that can go silently missing.** The staged tool
checks *resolution*; it cannot check *analysability*. This is the same class as PromisedButUnread — content that
looks fine because nothing tries to read it the hard way.

## THE HEADLINE: five traditions cover all five combat roles; twenty-two do not, ON PURPOSE
| roles covered | traditions |
|---|---|
| **5/5 — a self-sufficient party of one** | **radiant · abyssal · blazeborn · marcher · syllogist** |
| 4/5 | valley_craft · harmonic · rootkin · ashwarden · umbral · enginewright · horizon · hourkeeper · veilwright · mason · unmaker |
| 3/5 | cogitant · churnfolk · threnodist · seraphic · figurist · stillhold · lattice · numinous |
| **2/5 — narrowest** | **wright · somatic · verist** |
*(roles = damage · healing · guard · hobble/control · bolster/buff)*

**THE FIVE COMPLETE TRADITIONS ARE NOT AN ACCIDENT AND THEY ARE NOT A BALANCE PROBLEM.** Look at which ones they
are: two **light** traditions (radiant, blazeborn), the **appetite** pole, the **violence** pole, and **formal
logic**. Every one of them is a tradition whose fiction is about a UNIVERSAL SOLVENT — light reveals and burns
and heals; appetite touches everyone; violence answers anything; logic applies to all things. **The completeness
is thematic, and it is earned in the prose.**

## WHO HEALS — and the answer is "almost everyone, incompatibly"
**14 traditions carry a healing craft, and I authored FOURTEEN INCOMPATIBLE THEORIES OF WHAT HEALING IS.** That
is the single most striking number in the catalog:
· radiant BURNS CLEAN · rootkin RESTORES THE DESIGN · umbral uses DARKNESS AS MEDICINE · veilwright REFRAMES
WITHOUT LYING · unmaker HEALS BY REMOVAL · marcher KEEPS YOU FUNCTIONAL AND CHARGES YOU LATER · horizon heals by
MOVEMENT · hourkeeper heals NOTHING and BUYS THE HOURS · mason repairs the MATERIAL · figurist restores the FORM
· threnodist DISTRIBUTES A GROUP'S GRIEF · syllogist applies THE CORRECT PROTOCOL WITH NO COMFORT · abyssal
FEEDS THE WOUND TO SOMETHING · valley_craft brews HERBAL, small and reliable.
**All fourteen ride ONE `healing` shape.** That is the strongest evidence in the entire pass that the CCODE-64
schema generalises — fourteen philosophies of care, expressed entirely through magnitudes, rank-deltas and
bounds, with no new field required.
**HEAVIEST HEALERS BY COUNT:** rootkin (3), radiant (2), valley_craft (2), numinous (2).
**NOTABLE ABSENCE:** ashwarden, seraphic, cogitant, somatic, wright, churnfolk, verist, threnodist and stillhold
carry NO healing craft. For most that is right (a death tradition should not mend); **seraphic is the one worth
a look** — the angelic pole has absolution (`ascent` r2) but no HEALING, which may be intentional and may be a
gap. **ERIK'S CALL.**

## WHO HARMS — and the real finding is about the ones who DON'T
**Tier-normalised damage output is 1.00 across EVERY damage-carrying tradition.** That is not a coincidence and
it is not me flattening things: it means **every damage craft in the catalog sits exactly on the T-I 1d6 /
T-II 2d6 / T-III 3d6+2 / T-IV 4d6+2 / T-V 5d6+4 ladder Erik set.** The ladder held across 27 traditions without
a single outlier. **The dice ladder is doing its job.**
**MOST ARMED (damage-craft count):** blazeborn 4 · marcher 3 · ashwarden 3 · unmaker 3 · mason 2.
**TEN TRADITIONS CARRY NO DAMAGE CRAFT AT ALL** — and the important distinction is that **six of them are ARMED
DIFFERENTLY, not disarmed:**
| tradition | dmg | control | ward | verdict |
|---|---|---|---|---|
| stillhold | 0 | 1 | **3** | armed differently — it out-wards everyone |
| umbral | 0 | **2** | 1 | armed differently — control |
| churnfolk | 0 | **2** | 1 | armed differently — control |
| veilwright | 0 | 1 | **2** | armed differently — control/defence |
| threnodist | 0 | 1 | 1 | armed differently — and **5 bolster crafts**, the most in the catalog |
| **somatic** | **0** | **0** | 1 | **genuinely lite** |
| **figurist** | **0** | **0** | 1 | **genuinely lite** |
| **lattice** | **0** | **0** | 1 | **genuinely lite** |
| **numinous** | **0** | **0** | **0** | **genuinely lite — and the only tradition with NO guard craft either** |
| **verist** | **0** | **0** | 1 | **genuinely lite** |

## ⚠️ THE LITE TRADITIONS — five, and I think four of them are CORRECT
**numinous · verist · lattice · figurist · somatic.**
- **numinous is the extreme case: no damage, no control, NO GUARD.** It is pure attention, sustain and healing.
  **I believe this is right** — its whole thesis is *"attention reveals and steadies; IT DOES NOT COMMAND OR
  COERCE."* A numinous who could fight would be a different tradition. **But it means a solo numinous cannot
  survive a fight at all**, which is a real play consequence Erik should know about rather than discover.
- **verist (7 crafts, smallest in the catalog) and lattice (8)** are lite because their power is SOCIAL and
  EPISTEMIC — `the_whole_truth`, `the_established_fact`, `latticework`. They win arguments, not fights. **Also
  correct**, and verist is the Cathedral's only key, so it is not weak where it matters.
- **figurist is lite but has 6 UTILITY crafts** — it is a toolbox tradition, not a weak one.
- **SOMATIC IS THE ONE I WOULD QUESTION.** It is the BODY pole, it is TOP-HEAVY (3 crafts at T-IV/V), and it has
  **zero damage and zero control crafts.** A body tradition with no way to hurt anyone is a strange shape — its
  crafts are all self-directed (`soma`, `perfect_motion`, `the_shaped_body`). **That may be exactly right — the
  Somatics are athletes and monks, not fighters, and MARCHER is the violence pole — but it is the one place the
  numbers surprised me. ERIK'S CALL.**

## WHO WARDS
**stillhold (3) · harmonic (3) · radiant (2) · veilwright (2) · seraphic (2) · valley_craft (2)** carry the most
guard crafts. **Highest soak values: seraphic 5.5 avg · marcher 5.0 · ashwarden 5.0 · mason 5.0 · cogitant 5.0.**
**The pattern is clean and thematic:** the traditions that ward MOST OFTEN are the social/peace ones (stillhold,
harmonic), while the traditions that ward HARDEST are the martial and judicial ones (marcher's `the_stand`,
seraphic's `the_unfaltering_light`). **Frequency and strength are different axes, and the catalog splits them
sensibly.**

## THE TWO STRUCTURAL NOTES
1. **TOP-HEAVY:** only `abyssal` (4 crafts at T-IV/V) and `somatic` (3). Everything else is bottom-weighted,
   which is correct — **the player lives in the T-I–T-II slice** (the SLICE finding from the coherence pass).
2. **SIZE RANGE:** valley_craft 15 → verist 7. **That 2× spread is fine** given the folk generalist should be
   broad and a specialist pole should be narrow — but **verist at 7 is the thinnest, and it carries the
   catalog's keystone craft.** Worth knowing.

## RECOMMENDATIONS (three, and only three)
1. **Look at somatic.** Zero damage AND zero control on the BODY pole is the one result that surprised me. If
   intentional, it should be stated in the tradition's lore so nobody "fixes" it later.
2. **Look at seraphic's missing healing.** The angelic pole absolves but does not heal. Probably intentional
   (absolution is not medicine), but it is the only major tradition where a role is missing rather than refused.
3. **Do NOT balance the lite traditions upward.** numinous, verist and lattice are lite because their fiction
   says so, and every one of them is decisive in the arena it actually plays in. **The catalog's own answer to
   "how does a numinous survive a fight" is A PARTY** — which is a better answer than giving them a damage craft.
