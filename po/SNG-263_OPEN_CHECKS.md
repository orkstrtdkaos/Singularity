# SNG-263 — OPEN CHECKS (the running list to work through at the end)
## Aevi (PO) · started 2026-08-02 · Erik: "keep a running list of these to check at the end"

Live list. I append as the catalog pass surfaces things; nothing here is lost in a commit message. Grouped by
who it's waiting on. **Status: 7 traditions authored (79/285 crafts) + the 26-creature bestiary.**

---
## A. ENGINE GAPS — axes the catalog authored that the engine has no concept of (CCode)
1. **`variance`** *(churnfolk, 10 crafts, values 3-8)* — a high-variance craft should roll a **WIDER band**
   (bigger max, worse min), not a higher mean. *"You don't choose HOW it breaks, only that it does."* This is
   **the** mechanical difference between a lattice craft and a churnfolk one; today they resolve identically.
   Pairs naturally with the §3b second-roll crit dials.
2. **`evasion` / `evasionRank` + DEGREE DEGRADATION** *(the_wrong_target; Erik's correction)* — evasion acts on
   the ROLL, not on damage: it degrades the attacker's degree one step (success→PARTIAL), and the remaining
   partial is then reduced by a small soak (the graze). **Nothing in the engine degrades a degree today** — this
   would be the first, and it fits the existing `crit_success|success|partial|failure|crit_failure` ladder with
   no new resolution stage.
3. **INTENSITY MAY NEED TO BE PER-RANK** *(draw_down)* — it conserves/surges normally at r1/r2, but its own r3
   text says *"there is no partial version of this rank."* First craft where intensity availability changes BY
   RANK rather than being a property of the whole craft.
4. **CRAFT COMBINATION** *(prism_ward r3 composes with light_well + beacon_thread; chord_of_mending mends
   Radiant crystal)* — the catalog authors composed crafts in prose. A composed-craft bonus would be reading
   intent already on the page, not inventing a system.
5. **CROSS-TRADITION COUNTER-PAIRS as real mechanics** — authored from both sides and currently only prose:
   · `radiant_lance` ↔ `resonant_shield` (ranked penetration vs ranked soak — **CCode has built this one**)
   · `afterimage` ↔ `prism_sight` r2+ ("reads every ghost instantly")
   · `wildcraft` r3 ↔ `latticework` r3 (unmake order at scale vs impose structure at scale)
   · `bark_and_briar` ↔ fire (blazeborn/radiant: "fire is its particular enemy")
   · `the_root_road` ↔ `the_grey_road` (mutually exclusive terrain)
   · `shatterpoint` r3 ↔ `resonant_shield` (a harmonic counters its own tradition)
6. **LIGHT-ABSORPTION** *(bestiary: the_bright_devourer heals from light-family crafts)* — needs a
   damage-type/affinity concept the engine doesn't have.
6a. **TERRAIN-GATED MOVEMENT** — a complete pattern across FOUR axes that the engine has no concept of:
   `the_root_road` (cannot cross the dead or the made) · `the_grey_road` (death substantial and recent) ·
   `shortfold` (both ends must be truly KNOWN) · `shadowstep` (both ends need real shadow — **a lit gap is a
   WALL**). **Every axis's travel craft is walled off by its antipode's medium.** Movement crafts need a
   terrain/medium precondition the engine can check.
6e. **DUAL-POLE CRAFT GATING** *(the_whole_act, T-IV somatic)* — its ONLY bound is *"needs both trained
   near-equal; **THE PURE POLES CANNOT DO IT**."* A craft that requires **two traditions held near-equal**.
   The engine cannot express this, and it is the catalog's only instance — but it is also the clearest proof
   that **the middle of an axis is a real authored place** (see the foothills ask, item 26).
6d. **TYPED SOAK / DAMAGE-AFFINITY** — `the_true_ground` soaks **deception at rank 2 and NOTHING against a
   blade** (*"a sword does not care what you know"*), and its r3 is a **categorical immunity to an entire
   craft-family**. The bestiary's `the_bright_devourer` wants the same concept inverted (absorbs the
   light-family and HEALS). **The ranked-soak layer likely needs a TYPE as well as a rank** — "soak 3 vs
   deception, 0 vs impact." This also subsumes item 6 (light-absorption).
6c. **ZERO-SOAK CONCEALMENT DEFENCE** *(the_harbor)* — a guard whose soak is 0 because it defends by NOT BEING
   FOUND (*"concealment hides, it does not defend"*), and whose failure mode is **TOTAL**: found = no protection
   at all. A genuinely different curve from soak that degrades. Five defensive logics now exist: BLUNT / ANCHOR
   / EVADE / RUN-WITHOUT-YOU / NEVER-FOUND.
6b. **GUARD `autonomy` FLAG** *(the_mechanical_defense r2)* — its whole rank-increment is that the defence
   *"holds without constant attention — works while you work on something else."* Four defensive logics now
   exist (BLUNT / ANCHOR / EVADE / RUN-WITHOUT-YOU) and the fourth needs a field: **does holding this cost your
   action?**

---
## B. CONTENT DEFECTS FOUND WHILE AUTHORING (Aevi to fix / CCode to guard)
7. **`sonic_resonance` r3 prose is STALE** — says *"not lethal by design — the field limits output near living
   tissue"* while the ability is tagged `harmRung: damaging` with strike/break. Erik reversed the no-harm call;
   the bound is reclassed SOFT, but **the prose itself still needs revising at source** (reach_* file), not just
   in my staging.
8. **`palework` — same shape** (`harmRung: lethal`, text denies killing). Reclassed per the reversal.
9. **CI CHECK WANTED: `ContradictedByItsOwnTag`** — flag any craft whose `cannot` text denies harm while its
   `harmRung` asserts it. Sibling class to PromisedButUnread. Two known instances; a sweep would find the rest.

---
## C. THINGS THE CATALOG ALREADY SOLVED (wiring, not authoring — worth not re-inventing)
10. **PRECURSOR STAGING is already written — now FIVE hooks across THREE traditions** *(SNG-261 §B)*:
    `prism_sight` r3 *"the seams of Precursor work"* · `echo_memory` r3 *"what a Precursor mechanism last
    said"* · `mech_sense` r3 *"the Precursor works do not confess — they only answer, and only sometimes"* ·
    `command_engine` r2 *"a Precursor door that still half-listens"* · `enginecraft` r2/r3 *repair, repurpose,
    and command whole Precursor installations*. **§B does not need new content. It needs wiring.**
11. **§3b CRIT-FAILURE TEXT is already authored, craft by craft** — `riding_order` *"miss it and you've only
    made chaos"*; `probability_tilt` *"the world balances its books"*; `the_long_odds` *"it fails hard."*
    **CCode should mine these when building the crit dial** rather than inventing failure text.
12. **§4e IDENTITY ATTACK already has instances** — `the_revealing_burn` r2 (*"what is false in a PERSON — an
    assumed shape, a worn name"*) and the bestiary's `the_unmoored_choir` (*"craft frays, memory loosens, the
    self blurs"*, whose authored WIN CONDITION is SHAPE, not damage).
13. **§4c ALIGNMENT-DRIFT HOOKS already authored** — `latticework` "drifts order-hot" · `wildcraft` "drifts
    chaos-hot" · `palework` "drifts death-hot" · `radiance` "drifts light-hot" · `the_churns_gift` r3 *"the wild
    current begins to know you… it takes an interest"* (the catalog's closest thing to a PATRON/PACT mechanic).
    **Four traditions independently say that using a craft MOVES you.** Drift shouldn't be designed from
    scratch.

---
## D. NUMBERS AWAITING VERIFICATION (synth first, then Erik's play-leg)
14. **THE MASTERY CALL** *(SNG-264 — my numbers, made to be checked)*: bands untried 0-9 / practised 10-39 /
    skilled 40-119 / mastered 120+; floor-raise +0/+1/+2/+3; surge ×2/×2.5/×3; erosion by band.
    **Three structural invariants to assert:** (a) a mastered T-I never out-means an unmastered T-II; (b) a
    mastered T-I surge never exceeds a T-III baseline ceiling; (c) the floor-raise never pushes a craft past its
    own dice max. If those hold, the rest is feel.
15. **THE BESTIARY BODIES** — 26 creatures given threat/health/soak/soakRank. My recommendation resolves
    CCODE-74's reported tension *without* changing either dial (a "T-I beast" is the hare at health 7, not the
    war-machine at 15). **Both dials stay Erik's.**
16. **THE DICE LADDER as applied** — T-I `1d6` · T-II `2d6` · T-III `3d6+2` · T-IV `4d6+2` · T-V `5d6+4`.
    Erik's sign-off still open.

---
## E. ERIK'S OPEN CALLS
17. The §11 wielder-scaling term's exact strength (how much better IS a master's kindle — my call is the +1/+2/+3
    floor-raise, but the shape is his).
18. Whether **"REFUSED"** reads right in the UI for an intensity mode the fiction forbids. **Now with a second
    flavour to consider: the ETHICAL refusal** (`the_last_gift`, `the_cut_thread`) is distinct from the
    energetic one (`the_last_light`) — same word, different reason. Might warrant different copy.
19. A sanity check on the HARD/SOFT/COST split — particularly any HARD bound that should be SOFT. (Erik has
    already corrected one: the no-harm call.)

---
## F. PATTERNS WORTH KEEPING (observations, not tasks)
20. **To find an axis's real content, read its two T-I SENSE-CRAFTS.** Four antipode pairs authored, four times
    the geometry was carried by the pair of T-I senses (order_sense/chaos_sense · lifesense/deathsense ·
    mech_sense/numen_sense · and the light pair). Reliable authoring signal.
21. **The ring FENCES ITSELF, without cross-referencing.** `the_self_mending_work` "cannot mend the living, ONLY
    THE MADE" exactly mirrors rootkin's `the_green_road` "cannot cross the dead or THE MADE" — two traditions on
    DIFFERENT axes each walling themselves off from the other's material, with no reference to each other. The
    geometry is emergent in the prose, not imposed by the traditions file.
22. **THREE traditions independently refuse coercion at the mechanical level** — `harmonic_voice` "cannot change
    anyone's mind, only their temperature" · `steady_soul` "it opens the door, NEVER SHOVES" · the numinous
    `the_weight_of_practice` "it cannot be faked." Traditions that never reference each other agree that
    influence-craft stops short of control. **A values statement the mechanics must protect.**
23. **The framework's philosophical spine runs through the crafts.** `latticework`: "order at full strength IS
    the foreclosure" (causes it) vs `numenwork` r3: "keep a FORECLOSING thing open by significance alone"
    (refuses it) — Erik's own definition of evil, authored into two crafts on different axes as cause and cure.
24. **A tradition can contain its own antipode** — `shatterpoint` counters its own tradition's
    `resonant_shield`; `the_dimmed_meaning` is the precise inverse of `numenwork`. Intra-tradition counters
    exist alongside cross-tradition ones.

---
## G. THE KEYSTONE ADVERSARY MECHANIC (found 2026-08-02 — needs a decision, not just a note)
25. **THE CATHEDRAL'S LIE-BUILT-FROM-TRUE-PIECES is an adversary the catalog has ALREADY defined by what
    defeats it.** Four separate traditions' crafts carry a bound conceding it survives them —
    `radiance` (*"the convincing-lie-of-true-pieces survives it"*) · `unshadow` (*"the Cathedral's true-piece
    lie survives"*) · `verity` (*"the Cathedral's true-pieces lie survives it"*) — and verist's T-V
    `the_whole_truth` is authored as **"THE ONLY THING THAT CRACKS A LIE BUILT FROM TRUE PIECES."**
    **Exactly one craft in 285 answers it.** That is a designed keystone, and it is a MECHANIC rather than
    flavour: the Cathedral encounter should be genuinely unsolvable without that craft or a true equivalent.
    **ERIK: this wants your confirmation** — it is the strongest single piece of adversary design in the
    catalog and it was authored before any of this pass.

---
## H. NEW WORK ERIK HAS ASKED FOR (scoped, not yet started)
26. **EVERY TRADITION NEEDS FOOTHILLS** *(Erik, 2026-08-02)*. Today: **24 ring poles, 3 foothills.** The three
    that exist define the pattern precisely —
    · `harmonic` — `foothillOf: [enginewright, lattice]`, *"a Valley-edge foothill leaning mechanical… a
      folk-shadow of Enginecraft/Latticework, IN THE MEDIUM OF SOUND."*
    · `radiant_folk` — `foothillOf: [blazeborn]`, *"the gentle, WORKED version of the Blaze's burning
      revelation."*
    · `valley_craft` — `foothillOf: [stillhold, rootkin, churnfolk, lattice]`, the near-centre generalist,
      *"its breadth IS its identity."*
    **THE PATTERN, stated:** a foothill is (a) **`access.open: true`** — folk, learnable by anyone in the
    Valley, where a pole is gated; (b) **`foothillOf` one or more poles**, sitting between them and the centre;
    (c) **its own MEDIUM** — the pole's principle expressed through a specific material (sound, light, growing
    things); (d) **the gentle, worked, survivable version** of the pole's extremity.
    **WHY THIS MATTERS MECHANICALLY, from the authoring pass:** the pole crafts I've authored are *severe* —
    capstones that cost nearly everything, HARD bounds that never yield, drift that changes who you are. A
    foothill is how an ordinary Valley person touches that principle **without paying a pole's price.** It is
    also the natural home for the low-tier band a player actually lives in (see the SLICE finding, item 21).
    **SCOPE:** 24 poles wanting foothills is a very large content job — comparable to the craft pass itself.
    Recommend: (1) decide whether every pole needs its OWN foothill or whether foothills sit **between adjacent
    poles** on the ring (harmonic already does — it foothills TWO), which would need ~12 rather than 24;
    (2) a pilot foothill authored end-to-end before scaling; (3) it wants its own ticket, and it should come
    **after** the craft catalog rather than interleaved — the pole crafts are the parent material the foothills
    are shadows OF, and half of them are still unauthored.
    **ERIK'S CALL:** one-per-pole or one-per-adjacent-pair? That single decision halves or doubles the job.
