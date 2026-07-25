# DESIGN INTENT — Cadence
## The first design-intent doc (distinct from feature specs). Aevi (PO) drafted 2026-07-22; NUMBERS are Erik's dials, marked [DIAL].

> **Purpose:** state, at the SYSTEM level and in TESTABLE terms, what a Singularity playthrough should PRODUCE —
> so the Playthrough Auditor (SNG-236 §3) can prove the running game achieves it. This is the answer to "Silas
> is level 25 and never hit a recognizable encounter or met a single epic." That should have been a RED BUILD,
> not a discovery. This doc is what makes it measurable.

## How to read this
- Every anchor is a testable RANGE or FLOOR, not a vibe. "Feels alive" is not intent; "≥3 epic meetings by L25,
  first by L10" is.
- **Ranges are PLAYSTYLE-RELATIVE** (SNG-113 fingerprint). A combatant and a talker have different rates — but
  every metric has a FLOOR every playstyle must clear. Silas (social/non-combat) violated floors, not averages.
- **[DIAL]** marks a number Erik ratifies/tunes. Aevi drafted these from the existing tuning (SNG-208's
  epicRate:0.34 + minEpicGapDays:6, the encounter rates in random_encounters.js) as a STARTING point.
- The auditor asserts the running engine hits these PER COHORT. A floor an average hides is the exact failure
  that produced Silas.

---

## 1. ENCOUNTERS (recognizable, framed — SNG-230)
"Recognizable" = the player KNEW they were in a bounded encounter (a frame: fight/chase/hazard/puzzle/standoff),
not loose narration they wandered through. Silas hit ZERO recognizable ones in 190 turns — the failure.
- **FLOOR (every playstyle):** a recognizable framed encounter at least every **~15 turns [DIAL]** spent in
  danger-bearing or challenge-bearing locations. A player is never 190 turns without one.
- **Combat cohort:** ~**1 in 6 turns [DIAL]** in danger locations is a fight-frame.
- **Social/cerebral cohort (Silas):** fewer FIGHTS, but the floor is met by PUZZLE / STANDOFF / CHASE frames —
  a talker still hits recognizable encounters, just not swords. **This is the key correction: "encounter" spans
  all kinds; a cerebral character is NOT expected to have zero.**
- **Over L1→25:** no fewer than **~25 recognizable encounters total [DIAL]**, across kinds, for ANY playstyle.
- **Player-chosen danger is always available** (rule 18) — going somewhere dangerous ALWAYS produces a real
  encounter; the auditor asserts a deliberate danger-seek never comes up empty.

## 2. EPIC / LEGENDARY FIGURES (SNG-208)
The great should be felt as alive. Silas met ZERO by L25 — a hard fail against SNG-208's own epicRate:0.34.
- **FLOOR (every playstyle):** ≥ **3 epic/legendary figures [DIAL]** ENCOUNTERED or whose action is WITNESSED
  over L1→25. Zero is always a fail.
- **First epic presence by ~level 10 [DIAL]** — the legends enter the world early enough to matter, not as an
  endgame reveal.
- **"Witness the action of"** (an epic's move in the news/an arc they push — SNG-208's offscreen verbs) counts
  toward the floor; a **face-to-face meeting** counts more, and every playstyle should get ≥ **1 face-to-face
  [DIAL]** by L25.
- **Legendary TEACHERS** (SNG-203 finding beats — Maren, Neth, Cinder Vael): the ARC toward one should be
  offered/available by ~L15 [DIAL] for a character on a tradition path; meeting one is the capstone, not
  guaranteed, but the PURSUIT should be reachable.

## 3. QUEST & DISCOVERY CADENCE
- **Active quests:** the player should rarely be without a live thread — a new quest offered/available within
  **~10 turns [DIAL]** of dropping below 1 active. (Momentum rule 10 already intends this; the doc makes it
  testable.)
- **Discoveries (SNG-222/226):** a character actively using/braiding crafts should hit a DISCOVERY moment at a
  rate that rewards experimentation — ~**1 per 2-3 levels [DIAL]** of active craft-varied play. (Not a floor
  for a player who never experiments.)
- **Meaningful quest ENDS (SNG-235):** every quest that completes fires its effects — 100%, not a rate. A
  completed quest that changed nothing is a bug (SNG-235), not a cadence miss.

## 4. GROWTH-PATH OFFERS (the NOT-EMITTED suspects, See-the-Machine)
These were 0 for Silas; SNG-231 judged most "correctly quiet for a non-combat playstyle." The doc makes
"correct" DEFENSIBLE — a range, so quiet is verified-appropriate, not assumed:
- **Teacher/mentor offers (markTeacher):** for a character demonstrating a tradition's disposition, ≥ **1
  teacher relationship reachable by ~L15 [DIAL]**. Zero teachers by L25 for a devoted practitioner is a fail.
- **School adoption (adoptSchool):** available when the fiction earns it; NOT a floor (a player may keep their
  pure school) — but the OPPORTUNITY should arise ≥ once by L20 [DIAL] for an engaged practitioner.
- **Substrate/precursor unlocks:** gated on deep fiction; NO floor (correctly rare) — but the doc records they're
  INTENTIONALLY rare so the auditor doesn't flag their scarcity as a bug.
- **Promotion/acquisition (offerPromotion/offerAcquisition):** offered when standing earns it; the auditor
  checks they CAN fire for a high-standing character, not that they always do.

## 5. THE OVERARCHING FLOOR — "the world is alive for EVERY playstyle"
The single sentence this whole doc defends: **no playstyle should reach level 25 having met no legends, hit no
recognizable encounters, and been offered no growth path.** Silas did all three. That specific outcome — a
devoted, high-level, engaged character experiencing SILENCE across the systems that make the world feel alive —
is the canonical regression the auditor exists to prevent. If the social cohort ever again shows
epics_met=0 ∧ encounters=0 by L25, the build is red.

---

## Provenance of the draft numbers (so Erik can tune from the real tuning, not from nothing)
- Epic floor (≥3, first by L10): drafted from SNG-208 `epicRate:0.34` + `minEpicGapDays:6` — at that rate over a
  L1→25 span of many multi-day gaps, the EXPECTED epic-actions is well above 3; the floor is deliberately BELOW
  expectation so it catches BREAKAGE (a wiring drop), not unlucky variance.
- Encounter floor (~every 15 turns, ≥25 total): drafted from the random_encounters trigger rates + the intent
  that danger-locations produce danger; deliberately conservative so it flags SILENCE (Silas's 190-turn zero),
  not normal ebb.
- All [DIAL] numbers are Aevi's conservative drafts. Erik sets the real bands — the point of a floor is to catch
  the game being BROKEN, so floors sit below "good play" and fire only on true silence.
