# AUDIT — every tradition's skills vs its pole and stat (SNG-257 full read)
## Aevi (PO) · 2026-08-02 · Erik asked for the complete audit; the folk framing was wrong

## Erik's correction that reframes the whole thing
Radiant and Harmonic (and Valley Craft) are folk ONLY because they were the FIRST built — before the "one pole,
one attribute" discipline existed. They are NOT inherently spread. **They should get their own PURE pole-trees
like every tradition built more carefully afterward.** So there is no Case-A/Case-B split — there is ONE finding:
**six traditions have incoherent kits, and all six should be made coherent.** The other 18 already are.

## The full coherence audit (attribute one craft rolls on / kit size)
COHERENT (already right — 88-100%, no work): blazeborn·somatic·cogitant·threnodist·syllogist·veilwright·verist·
mason·figurist·abyssal·seraphic·horizon·hourkeeper·wright (all 100%); umbral 91·stillhold 89·unmaker 89·numinous
88. **18 poles are clean.** Their attribute matches their nature: mind→mental, body→physical, emotion→social.

THE INCOHERENT SIX (the work):
| tradition | pole | dom attr | coherence | the defect |
|---|---|---|---|---|
| enginewright | mechanical | practical | 80% | 2 sense-crafts tagged mental — mostly fine |
| marcher | violence | physical | 70% | 3 crafts (soldiers_hand/whats_at_hand/the_weight) off-physical |
| lattice | order | practical | 63% | 3 mental — order_sense is legit, latticework/the_fixed_point are practical order-work |
| rootkin | life | practical | 55% | 5 off — sense-crafts legit, but the_green_road/quicken/last_gift are life-practical |
| harmonic | (none) | practical | 43% | never got a pole; sound-work scattered across all 4 |
| radiant_folk | (none) | practical | 36% | never got a pole; light-work scattered across all 4 |

## The PRINCIPLE for the fix (NOT "flatten to dominant")
Reading the off-attribute crafts, two kinds appear, and only ONE is the bug:
- **Legitimately off-attribute (LEAVE):** a `reveal`/`track` SENSE craft is genuinely MENTAL — sensing is a
  mental act (lifesense, order_sense, chaos_sense, mech_sense, echo_sense, prism_sight, tremor_sense). A pole is
  allowed a SENSE craft on mental even if its body of work is practical. Coherence target is ~85%, not 100% — a
  pole can have ONE off-attribute sense-craft without being incoherent.
- **Mis-tagged pole-work (FIX):** a craft whose ACTION is the pole's own craft but got tagged by its EFFECT
  register. radiant's `daybreak_mantle` (working light to inspire) tagged SOCIAL — but the SKILL is shaping light
  (practical); the social is the effect, not the roll. Same for harmonic's `harmonic_voice`/`voice_of_the_flock`
  (working sound, tagged social). These are the real bug: the attribute should be the CRAFT, not the OUTCOME.

## The pole-attribute each of the six SHOULD center on (from the pole's nature)
- **radiant → PRACTICAL** (light is a MATERIAL you work: bend/focus/store/inscribe). Keep prism_sight mental (a
  sense). Re-tag the effect-register mistags: daybreak_mantle, afterimage, radiant_lance → practical (working
  light); beacon_thread → practical. Target ~85%.
- **harmonic → PRACTICAL** (sound is a material you shape: resonate/dampen/tune). Keep echo_sense/tremor_sense/
  echo_memory/shatterpoint's sense-half mental. Re-tag harmonic_voice, voice_of_the_flock (working sound, effect
  is social), resonant_anchor/drumline_stride (physical→practical: it's sound-craft, not athletics). Target ~85%.
- **lattice → PRACTICAL** (order is BUILT: structures, fixed points). Keep order_sense mental. latticework +
  the_fixed_point → practical (building/holding structure). Target ~88%.
- **rootkin → PRACTICAL** (life is TENDED: grow/heal/road). Keep lifesense/speaking_grove mental (senses/
  speech). quicken_the_ground, the_green_road → practical (working the living ground); the_last_gift stays (a
  social death-gift). Target ~82%.
- **marcher → PHYSICAL** (violence is BODILY). soldiers_hand (heal/reveal — a medic-craft) may legitimately be
  practical; whats_at_hand (improvised strike) → physical; the_weight (command/bind — a leader's presence) is
  legit social. Marcher's 70% may be close to correct — LIGHT touch, 1-2 crafts.
- **enginewright → PRACTICAL** (already 80%; the 2 mental are mech_sense/shortfold — both legit senses/moves).
  Likely NO change — 80% with two legit sense/move crafts is coherent enough.

## What this is worth (the honest scope)
This is a genuinely SMALL content pass: ~12-15 craft attribute re-tags across 5 traditions (enginewright likely
untouched), each judged individually — never a blanket flatten. It's the ONE real balance lever CCode's corrected
harness found (attribute fit is the 60-point term; a coherent kit lets a build be RIGHT for its own tradition).
And it makes radiant + harmonic real poles, which is the fiction Erik wants — they were shortchanged by being
built first.

## Owed / sequence
1. **Aevi:** author the per-craft re-tags (this audit → the actual attribute edits), radiant + harmonic first
   (biggest lift + Erik's priority), then lattice/rootkin, marcher light-touch, enginewright likely skip.
2. **CCode:** after the re-tags, re-run tradition_matrix on best-fit build — does maker/folk close to within a
   few points of the other builds? (The pure test of whether coherence was the lever.)
3. **Erik:** radiant + harmonic getting pure trees may want a POLE/AXIS assignment in traditions.json (they're
   axis=? now). Are they folk-shadows that get a coherent attribute but stay centre-placed, or do they claim a
   real axis? (Design call — the attribute fix works either way; the ring placement is separate.)

## The discipline line
The folk framing I gave last turn ("Case B — the spread is canon") was WRONG because I trusted the folkTraditions
flag as design intent when it was historical accident. Erik corrected it. Same lesson as the harness artifacts:
verify the INTENT, don't infer it from a flag. A "folk" tag meant "built first," not "meant to be spread."
