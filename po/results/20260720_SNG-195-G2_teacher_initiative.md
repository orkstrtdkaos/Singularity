# SNG-195 G2 — Teachers take the initiative, and reputation-reactions reach the offer

**CCode · 2026-07-20 · v1.8.175 · COMPLETE_PENDING_REVIEW · suite green by exit code (EXIT=0)**

Built per Aevi's ruling on the SNG-195 audit: apply the SNG-194 engine-gate pattern to the teacher block
(the oldest live-play complaint), and wire `reactsToReputation` — the G1 ⭐ — into the offer path. WANTS
and TEACHERS through the same seam.

---

## The teacher initiative (the L2 fix)

The teacher block read *"OFFER it when the moment fits."* That is a permission the model rarely acted on —
the exact SNG-179 teacher-gate shape, and the oldest complaint in the project: **teachers that teach
nothing.** Now the ENGINE decides, the SNG-194 way.

- **`roomForATeacherOffer` (pacing.js)** — pure gate: a teacher is PRESENT with a reachable next step, the
  beat has a positive opening (lull / arrival), no grip (encounter / gambit / intent), it is **not the same
  beat the general offer fires** (one unprompted thing at a time), and the **shared** offer cooldown has
  passed. When true, the teacher block flips to an unconditional instruction — the model never judges "the
  moment."
- **`teacherOfferReady` (company.js)** — the structured present-teacher next step. A **company trainer**
  travels with you (always present); a **bonded, willing teacher** counts only when they are in *this*
  scene. An out-of-reach next step is **not** room — a "not yet" is a real answer, so a teacher never
  initiates a lesson the student can't take. Reuses the SNG-175 `curriculumFor` spine.
- **The block flip (gm.js)** — when there is room: `## A TEACHER TAKES THE INITIATIVE` names the step and
  says *do NOT wait to be asked, do NOT judge "when the moment fits" yourself*; the teacher opens it as they
  would reach for a student, may judge the character NOT READY, and emits the `offer` op (from: the
  teacher). Absent room, the block is **reference data** (what each teacher can teach) — the old permission
  wording is gone.
- **Cooldown** — shares `turnsSinceOffer` (the SNG-194 offer op resets it). A teacher offer *is* an offer,
  so it is COUNTED and rate-limited by the same instrument; no second counter.

## The reactsToReputation win (G1 ⭐)

The largest orphan in the corpus — 40 NPCs, read by nothing — now reaches the prompt as **offer material**.

- **`npcReactionsForGM` (npcs.js)** surfaces present NPCs' `reactsToReputation` maps inside the room-gated
  offer (so it costs prompt weight only when usable). An NPC's read of *who the character is* — *"challenges
  them to grow the missing half"* — is a self-writing unprompted beat with **attribution already built in**
  (the `from` is the person's own reaction). The offer block now draws from *HOW THEY READ WHO THE PLAYER
  IS*.
- **Finding that shaped the wiring:** the keys are **not a fixed taxonomy.** `adept_sona` keys by disposition
  shape (`balanced` / `extreme` / `seeking`); `brann_tollhand` keys by how the player has treated them
  (`kind` / `threatening` / `honest`). Aevi's ruling assumed a disposition-profile key — but there is no
  uniform scheme and no classifier, which is *why* this field was never wired. So the robust wiring surfaces
  the **whole small map** and lets the **GM select** the reading that fits the character in hand; the engine
  never computes a key it cannot compute. This is a deviation from the "keyed to disposition profile"
  framing, and it is the correct one.

## WANTS through the same seam

The WANTS block's initiative was already moved to the engine by SNG-194's offer (wants are offer material).
This pass leaves that block as material and routes the *initiative* through the one offer instruction — so
wants, fears, reputation-reactions and a teacher's next step are all things the single room-gated offer may
introduce, and a present teacher gets its own dedicated gate on top so it is never crowded out.

## Verification

- **26 tests**: the `roomForATeacherOffer` truth table (present-required, opening, grip, shared cooldown,
  stands-down-under-general-offer), `teacherOfferReady` (bonded-present vs absent, company-trainer,
  null-cases) against the real SNG-175 curriculum, `npcReactionsForGM` (heterogeneous keys preserved,
  presence), and the wiring (ephemera gated off the general offer, the block flip, reactions in the offer,
  the registry row).
- Full suite **EXIT=0**: wiring audit all checks passed, ENGINE_MAP ok (59/59 still described), every ratchet
  flat. SYSTEM_SPEC §13 gained the G2 paragraph; ENGINE_MAP regenerated.

## Notes / boundaries

- **`personality` was NOT touched** — Aevi ruled CUT (stop authoring; redundant with the consumed
  `voiceHints`). No churn to existing values, per the ruling; nothing to build.
- **`gains` (779 tags) is G1's third decision** — WIRE to the ENGINE (SNG-192 coverage), never the prompt.
  Out of scope for G2 (which is the offer/prompt seam); it belongs with the SNG-192 creation work.
- **Presence for bonded teachers** uses scene-name matching (same test the offer's fears/reactions use).
  A company trainer is always present. If a teacher should reach out *across distance* (a summons rather
  than in-scene initiative), that is a deliberate follow-on, not wired here.

*— CCode. The teacher no longer waits to be asked. Stand in a quiet moment beside someone who trains you
and has a next step you can reach, and they will open it — because the engine judged the room, not a
hopeful clause in the prompt.*
