# SNG_UPDATE_v1.9.0 — The Front Door, The Pipeline, and The Wheel

| | |
|---|---|
| **Spec id** | SNG_UPDATE_v1.9.0 |
| **Status** | `queued` → **awaiting CCode ROUND 2** (do not build yet) |
| **Authored** | Aevi (PO), 2026-07-12, at Erik's directive |
| **Supersedes** | SNG-BATCH-10 (its premise was measured stale — see PWSV) |
| **Live anchor** | `po/SNG_UPDATE_v1.9.0.md` |
| **Process** | First spec written under **SNG-071** (ported Tether PO discipline). It therefore opens with pre-work scope verification and closes with an explicit ROUND-2 request. **No phase is built until CCode substrate-verifies and Aevi promotes.** |

---

## 1. Pre-work scope verification (PWSV)
*Measured at HEAD `v1.8.23`, 2026-07-12T14:15Z. Numbers, not assumptions. This section exists because the previous batch was specced on a premise that was already false.*

| Claim under test | Probe | Result |
|---|---|---|
| Creation has a commit boundary | `grep -c "function commitCharacter\|finalizeCharacter\|confirmAndCommit" app.js` | **0** — *no boundary exists* |
| Abilities granted during prologue | `grep -c "prologue.granted.push" app.js` | **1** (app.js ~1617) — granted on path-pick |
| Player can choose a background | `grep -c "data-bg\|backgroundPick\|renderBackgroundStep" app.js` | **0** — *auto-assigned* |
| Feedback mechanism exists | `grep -ci "feedback\|bugReport" app.js` | **0** |
| GM can correct state | `grep -ci "stateOps\|correction" engine/gm.js` | **0** — only `timeOps` exists as an op family |
| Quests load | `grep -c "provides.quests" engine/state.js` | **0** — `quests.json` exists + is manifest-registered and **never loads** |
| Starting location offered | `grep -c "startingRegion" app.js` | **0** — 19 homelands, nobody can start in one |
| Pipeline CI exists | `GET scripts/check_pipeline.py` | **404** (Tether has 11 checks) |
| Skill screen is polar | `grep -ci "polar\|wheelLayout\|radiusFor" app.js` | **0**; `renderSkillGraph` present (3) |
| **Domain gate exists** | `grep -ci "ringDistance\|antipode\|domainGate" engine/progression.js` | **3 — SHIPPED.** *Retires SNG-BATCH-10's core premise. I was wrong.* |
| Content dependencies | `traditions/origins/backgrounds/quests/quest_structure.json` | **all 200** — no content blocks this spec |

**Diagnosis:** SNG-067, SNG-068 and SNG-069 are **not three bugs**. They are one defect — *creation writes state before the player confirms it* — and the PWSV proves it: **there is no commit boundary in the code at all.** P1 builds the boundary; the three symptoms fall out.

---

## 1b. ⚡ BUILD ORDER (Erik-directed 2026-07-12) — REVISED

**P4 and P5 already SHIPPED as SNG-BATCH-10** (v1.8.22–25: domain gates engine-enforced · starting location · structured quests + loader · Content CI). Remaining phases, **re-ordered by what unblocks Erik RIGHT NOW:**

| Order | Phase | Why here |
|---|---|---|
| **1** | **SNG-074 — dev mode off-switch** | Erik has **no clean player view** and is about to hand the game to Brooklyn. Small. Do it first. |
| **2** | **P3 — GM corrections (`stateOps`)** | **⚡ THIS IS THE ONE THAT FIXES SILAS.** *P1 fixes creation going FORWARD; it does nothing for a character that already exists.* Erik's necromancer is stuck with Blazeborn/Lattice/Numinous abilities and the wrong domains, and **the only mechanism that can repair an existing character is a GM correction.** Without it, every mis-created character is scrap. |
| **3** | **P1 — the commit boundary** | Stops it happening again (SNG-067/068/069 are one defect: creation commits before the player confirms). |
| **4** | **P2 — feedback (auto-captured context)** | Turns Erik's screenshot-archaeology into one-click reports. |
| **5** | **P6 — The Skill Wheel (SNG-073)** | The payoff — the skill tree becomes the great circle. |
| then | SNG-056 · SNG-058 · SNG-052 | queued fast-follows |

**⚡ P3 SCOPE NOTE — the repair Erik needs must include:** correct **domains** (primary/secondary/tertiary) on an existing character · **re-derive or re-grant abilities** against the corrected domains · **correct the background** · and **remove abilities the character should never have had** (prologue-granted, out-of-domain, un-chosen). **Grandfathering an earned ability is a CHOICE the player makes, not a default the engine imposes** — Erik must be able to say *"strip the Blazeborn work; I am an Ashwarden"* and have it obeyed. Still bounded by Law 14: **a repair is not an advance** — no XP, no levels, no power the character did not earn.

*Concretely: Erik's Silas Weir is a NECROMANCER → primary domain **ashwarden** (the death pole). His kit exists and is authored: **Palework · Deathsense · Wither · Death-Ward**, and the within-tradition braid **The Counted End** (see an ending's exact hour and bring it to that hour precisely — the Ashwarden mercy). He should have that, not Lightsense.*

## 2. Phases

### P1 — The commit boundary *(fixes SNG-067 + 068 + 069 at the root)*
**Deliverable:** a single explicit `draft → confirm → commit` boundary in creation.
- All creation state (name, form, origin, **domains**, **abilities**, **background**, companion, starting location) accumulates in a **draft** object. **Nothing is written to the character until the player confirms.**
- **Everything remains re-choosable until commit.** `redo` returns to a genuinely re-selectable state — clear derived values; do not recompute the same answer and call it a choice.
- **Domains:** on redo, offer BOTH *re-derive from my play* and *choose freely on the ring* (the reveal's reasoning shown as advice, never a lock).
- **Abilities are derived AFTER domains are confirmed** (SNG-063's order rule). Prologue-earned abilities are kept — *"you did this, so you know this"* — but any that fall outside the confirmed domains are **grandfathered explicitly and told to the player** (*"you did this in the fire; it stays with you, though it is not your people's craft"*). **AND the character must receive ability/ies from the confirmed PRIMARY.** A wright who knows nothing wright is broken.
- **Background is CHOSEN, never assigned.** Categorized picker (40 backgrounds, 6 categories: martial · practitioner · craft · learned · social · marginal). The prologue may **suggest** from play; it may not assign. Never gate by origin or domain.
- **Companions:** the play sidebar renders `activeCompanions(character, …)` ONLY. The roster appears in exactly two places — quick-start picker, prologue `companionBeat.offer`. *A companion you have not met must not exist to you.*
- **Order (hard):** NAME → FORM → ORIGIN → **DOMAINS** → ABILITIES → BACKGROUND → COMPANION → START → **CONFIRM** → commit.
**Files:** `app.js` (creation/prologue), `engine/progression.js`.
**Verify:** create a character; adjust domains at the reveal; confirm → abilities match the CHOSEN domains (+ labelled grandfathered extras); background is one you picked; sidebar shows only the companion who stayed; nothing persisted before confirm.

### P2 — Feedback (SNG-066)
**Deliverable:** `⚑ Feedback` on every screen (incl. creation/prologue). Types: 🐛 Bug · 💡 Idea · 🤔 **Felt off**.
- **Value is the AUTO-CAPTURE:** version · screen · character (level/domains/origin/background) · location+region · active quest/scene · last GM turn · last player action · console errors · world-day + real timestamp. Player types one sentence.
- Writes `po/feedback/YYYY-MM-DD.md` via sync PAT + `pushMergedFile` (read-merge-write-retry). Queue locally when sync is off; **never lose a report.** Redact credentials.
**Verify:** submit from mid-scene → entry lands with full context; Aevi can triage with zero follow-up questions.

### P3 — GM corrections (SNG-070) — *the game self-heals*
**Deliverable:** a bounded **`stateOps`** GM op, **modelled on the existing `timeOps` pattern** (the only op family present — PWSV).
- **Allowed (repair):** correct a background/domain/origin the player never chose · remove an entity never acquired · unstick/re-stage a quest · re-anchor location · fix a codex fact · repair a companion entry.
- **Refused (advance):** XP, levels, items, abilities outside the domain gates. Decline plainly and warmly. *Power comes from play.*
- **Every correction LOGGED** to the ledger (from → to, why, world-day). Bounded to the asking player's own save. Never touches shared canon. Cannot bypass the rating floors.
**Verify:** *"my background should be Duelist"* → corrected, narrated, logged. *"give me 500 XP"* → declined.

### P4 — Content plumbing *(BATCH-10 remainder, minus the retired premise)*
- **P4a Quests load.** Add the `provides.quests` branch to `engine/state.js`. Implement **SNG-065 structured quests** in `engine/quests.js`: stakes · engine-testable stage conditions · multiple routes · **branched outcomes** · a `consequences` block the engine APPLIES (codex writes · NPC state · people-disposition · location state · propagating world-event). Quest log shows **stakes + stage objective**, not just a title. *Authored and waiting:* **The Edge District Ledger** (Grael/Fendt — live in Erik's game) and **The Tree That Waits**.
- **P4b Starting location.** Creation offers it; default = the origin's homeland (`origin.startingRegion` / `startingLocation`); always also offer **the Valley** and **The Crossing**. Feed `origin.whyYouAreHere` to the GM as opening context.
- **P4c Origin labels (SNG-072).** Render `origin.displayLabel` **verbatim**. Never rebuild by concatenation (that produced *"of the the quickwood"*).
**Verify:** a quest with stakes/stages/routes/outcomes runs and leaves a durable change; an Umbral starts in the Underlight; the dropdown reads *"The Rootkin — Life · of the Quickwood"*.

### P5 — `check_pipeline.py` (SNG-071 / SNG-040 / SNG-064) — **green required to close anything**
Minimum checks: manifest parity · manifest paths resolve · **every `provides.*` key has a loader** *(this is what let quests silently not-exist)* · no dangling connections · no one-way edges · no unreachable locations · every content file validates against its schema *(would have caught `poleIntensity`)* · every ability carries a `tradition` · every quest's giver/region resolves · version-line consistency.
*The manifest bug ran the live game on **six locations** for weeks. This is the insurance.*

### P6 — The Skill Wheel (SNG-073) — *supersedes SNG-054 Phase 2*
Polar layout, read from `traditions.json` (**never hardcode the ring**):
- 24 tradition nodes on the ring at `ring.position`; **abilities radiate INWARD, tier V at the node → tier I near the centre.** Depth = mastery.
- **Folk crafts at the CENTRE** (valley_craft / harmonic / radiant_folk) — the Valley *is* the near-centre crossing and its crafts are open to all. **PRECURSOR outside the ring** — the substrate, not an axis-people.
- **Braids as connections, not nodes:** cross-pole braids draw as **DIAMETERS through the centre** (the picture of holding an axis whole); kin combos = short arcs; cross-axis = chords. **Known braids only** — they are discoveries, not a menu.
- **State off the ring:** primary lit to its capstone · adjacent lit with capstone barred · secondary to III · tertiary to II · penalized ring dimmed with cost · **ANTIPODE DARK AND STRUCK THROUGH.** *You can see at a glance what you can never be.*

---

## 3. ⚠️ ROUND-2 REQUEST — CCode, substrate-verify BEFORE Aevi promotes
Per SNG-071, **no phase is built from an unverified premise.** Report findings; Aevi amends, then promotes.
1. **P1:** is there truly no commit boundary, or is state committed in several places? **Enumerate every write-to-character during creation.** (Aevi's PWSV says 0 boundary fns — confirm.)
2. **P1:** what actually happens on `redo` today? Does it re-derive from the tag tally (Aevi's hypothesis) or something else?
3. **P3:** is `timeOps` genuinely the only GM op family? Confirm the op-dispatch shape `stateOps` should follow.
4. **P4a:** does `engine/quests.js` have anything Aevi's structured schema would break? Is the GM's ad-hoc quest minting worth preserving alongside?
5. **P6:** does the existing `renderSkillGraph` SVG substrate support a polar rewrite, or is this a new component? Cost estimate.
6. **Anything in this spec that is already true at HEAD** — Aevi has been wrong about that once already this cycle (the domain gate) and wants it caught here, not after a build.

---

## 4. Verification (post-ship)
- All phases: suites + `parse_probe` + **`check_pipeline.py` green** on a fresh port.
- Erik's browser-leg per phase (one-liners in each phase's Verify).
- **Status lifecycle:** `queued → in_progress → complete_pending_review → review-closed`. **Only Aevi closes.**

## 5. Spec boundaries
*CCode records deviations here. A boundary is a fact, not a failure — Aevi accepts or amends explicitly.*

**BOUNDARY-1 — quest consequences were authored as tagged PROSE, so mechanical application was best-effort.** Raised by CCode @ v1.8.24. *(An elliptical form like "Veilwright: lowered" was preserved in the findable record but never parsed into a delta.)*
→ **ACCEPTED, and the defect is AEVI'S.** I authored consequences as prose and called them mandatory — a consequence the engine cannot apply changes nothing durable, which by my own rule (§14: *a quest that changes nothing durable is not allowed to be a quest*) means those were not quests. **Fixed at origin:** every outcome now carries BOTH `narration` (the authored prose — the chronicle voice, kept) AND **`effects[]`** — machine-readable deltas the engine applies: `npc_state` · `disposition{people,delta}` · `codex_fact{text,secret?}` · `world_event{text,propagates,delayDays}` · `location_state` · `quest_seed` · `ally` · `xp`. **`quest_structure.json` now REQUIRES both**, so no future quest can repeat it. **CCode: wire `effects[]` into the resolve path.**

**BOUNDARY-2 — Content CI is a local `npm test` gate, not a GitHub Action** (no CI workflow exists in the repo). Raised by CCode @ v1.8.25.
→ **ACCEPTED as shipped; AMENDED as follow-up.** A local gate is genuinely better than nothing and it has already earned its keep — building it **surfaced a live latent bug: `valley.provides.items` (19 definitions, including the Waystaff) was never loaded.** That is the SNG-064 disease caught by its own insurance on day one. **But a local gate only fires if someone runs it, and the failure it exists to prevent is exactly the one nobody notices.** Follow-up: a GitHub Action running `npm test` on push. **Erik's call whether that is now or later; the gate is real either way.**

## 6. Open follow-ups
- `po/OPERATIONAL_FLOWS.md` (Aevi) — write the flows down.
- Retire `SPEC_BACKLOG.md` / `ALERT.md` as append-only sediment (~100KB+); versioned specs + current-status-only alert.
- SNG-058 (party leader) · SNG-056 (location-header desync) · SNG-052 (adult-gate checkbox) — queued behind this spec.
