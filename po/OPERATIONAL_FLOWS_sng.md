# Singularity Operational Flows

**Purpose:** Canonical reference for the operational flows that govern Aevi's PO work on Singularity —
session lifecycle, content authoring, engine spec/ship cycle. Each flow names its trigger, ordered steps,
and verification criteria.

**Source of truth:** This document. When practice drifts from it, decide which is right and update both.
When a flow changes, update this document in the same commit.

**Last updated:** 2026-08-31 · Aevi (PO) draft + CCode ROUND 2 (`2deac601`) incorporated.

---

## Quick reference

| Trigger | Flow |
|---|---|
| Session start | `OpFlow_SessionOpen` |
| Session end / Erik says "done" | `OpFlow_SessionClose` |
| Any content authoring (crafts, abilities, traditions) | `OpFlow_ContentAuthoring` |
| Engine feature / bug / spec request | `OpFlow_EngineSpecShipCycle` |
| CCode ships; Aevi reviews | `OpFlow_AeviShipReview` |
| A gate goes red on a correct change | `OpFlow_GateRedOnCorrectChange` |
| Ruling needed from Erik | `OpFlow_RulingRequest` |
| ⛔ **A ruling has been made** | ⛔ **`OpFlow_RulingEnacted` — it reaches the HOW_IT_WORKS body, or it did not happen** |
| Handoff needed (context boundary, compaction) | `OpFlow_Handoff` |

---

## OpFlow_SessionOpen

**Trigger:** Every new Aevi session start, before first substantive response.

1. **Bootstrap.** Fetch Gist → verify key fingerprint → decrypt PAT → read `session_open.py` before
   running → run it. Outputs: date, STATE, PIPELINE_ALERT, last commits, graph pointer index.
   *(`session_open.py` is external — lives in the ErikIAm toolchain, not this repo.)*
2. **Read the handoff.** Check `po/` for the most recent CCode-to-Aevi handoff. This is the
   authoritative current-state document — not memory, not the graph pointer index alone.
3. **Run graph queries.** Open the L0/L1 hub entities per `session_open.py` output. Then open
   specific entities named in the handoff or pointer index as active. `search_nodes` for any topic
   Erik raises that isn't already surfaced.
4. **Read any open ruling requests.** `RULING_REQUEST_*.md` files in `po/` that have no
   corresponding `RULING_*.md` answer.
5. **Surface state to Erik.** What's pending on each person (Aevi, CCode, Erik), open ratchet
   regressions, any PIPELINE_ALERT items.

**Verification:** First substantive response names at least one concrete open item from the handoff
or graph — not a generic summary.

**Live anchors:** `po/RULING_REQUEST_*.md`, `po/HANDOFF_*.md`.

---

## OpFlow_SessionClose

**Trigger:** Erik says "done" / "close out" / equivalent, or natural session end.

1. **Write the handoff.** Author a `po/HANDOFF_*.md` file. Topic-scoped names are preferred over
   dated names — a handoff is looked up by what it is about. Required sections: what was decided
   this session, what is waiting on each person, open ratchets, anything the recipient should be
   skeptical of.
2. **Write graph entities** for any rulings, patterns, or architectural decisions that crystallized
   this session. Do not batch to close — write them when they land.
3. **Commit all authored content.** Verify via authenticated `api.github.com` (not raw CDN). Run
   `node scripts/certify_counts.mjs --check` if content was authored.
4. **Surface to Erik.** What shipped, what's pending, what he runs (`update.bat`, external).

**Verification:** Handoff file exists at origin. Graph entity count grew if decisions were made.
Certified counts match authored content.

**Only Aevi closes** on content she authored. Only CCode closes on engine work CCode shipped.

---

## OpFlow_ContentAuthoring

**Trigger:** Any session where Aevi authors craft, ability, or tradition content.

**Full gate lives in `po/AUTHORING_PROCESS_aevi.md`.** This flow is the trigger-and-pointer; the
process doc is the authority.

### Pre-flight (before writing a single record)

Open these files — not recall, open:

| # | File | What to read |
|---|---|---|
| 1 | `rules/function_vocabulary.json` → `families` | Closed verb list with definitions |
| 2 | `rules/consumer_required_subfields.json` → `skill` | Which fields any consumer actually reads |
| 3 | `rules/craft_mechanics.json` | Fields with engine teeth |
| 4 | `rules/traditions.json` → target tradition | `craft`, `axis`, `pole`, `aesthetic`, `opposite` |
| 5 | 2–3 sibling abilities in the destination file | Match existing shape |
| 6 | Destination file's current `ids` | Collision check before, not after |

State the delivery shape in one line before writing.

### The seven tests (applied to every record)

- **T1 Verb** — every function from the closed vocabulary; definition matches what the ability does.
- **T2 Canon-trace** — every bound / `cannot` / `notFor` traces to a specific line in a specific
  file. A character's `boundaries` is that character's, never a tradition's law.
- **T3 Evaluator** — engine or GM? If GM, concrete enough to act on? If neither, it is a mood.
- **T4 Agency** — constraint limits the craft, not the player. The wielder commands their craft.
- **T5 Rank = mastery** — rank 3 strictly better than rank 2. Costs bolted to earned ranks are a
  tax on progress. The good rank-3 grant is usually removal of an earlier limitation.
- **T6 Cannot is the backlash** — derive `backlash` from the craft's own `cannot`. Author
  `conserveSuppresses` so conserve is a real decision, not strictly worse.
- **T7 Second-turn** — ungated; requires a written concrete sentence per ability: what does a
  level-1 character DO on turn 2? What does the GM narrate CHANGING? Could a player tell this
  apart from the other option in front of them?

### Post-flight

```
python3 po/authoring_gate.py <authored.json>            # before the write
python3 po/authoring_gate.py <pulled-from-origin.json>  # after, against live records
```

Run against origin after the write, not only against the draft.

**Verification:** Gate passes on the live origin file. T7 answers written per ability. No ratchet
regressions introduced (`abilitiesMissingHarmRung`, `abilitiesCombatClaimedNotTaught`).

**Live anchors:** `po/AUTHORING_PROCESS_aevi.md`, `po/authoring_gate.py`,
`rules/function_vocabulary.json`.

---

## OpFlow_EngineSpecShipCycle

**Trigger:** Erik asks for an engine feature, or Aevi identifies a bug / debt warranting a spec.

This flow describes Aevi's side of the spec-to-ship pipeline. CCode's build sequence is documented
in R2.3 below.

1. **PWSV — Pre-work scope verification.** Before drafting, measure the current state at HEAD.
   Numbers, not assumptions. Name every claim under test and probe it. If a claim is already true
   at HEAD, say so and retire it. *(The domain gate in `SNG_UPDATE_v1.9.0.md` was already shipped
   and caught only in PWSV — that lesson is structural.)*
2. **Draft spec.** File in `po/SPEC_SNG-NNN_name.md`. Sections: what the problem is (measured),
   WHAT to build and WHY — not HOW. Executor trade-offs named explicitly. Out-of-scope named
   explicitly. ROUND-2 request section for CCode substrate verification.
3. **Request CCode ROUND 2.** No phase is built from an unverified premise. CCode verifies the
   substrate, reports findings. Aevi amends spec if findings change it.
4. **Promote spec.** After ROUND 2 is clean, Aevi marks spec promoted and hands to CCode.
5. **CCode builds.** See R2.3 for the build sequence CCode must follow.
6. **Aevi LLW audit.** When CCode reports done: verify at authenticated `api.github.com`, not from
   the ship report alone. Lower Layer Wins — the live origin beats the report. Check that the
   spec's verification criteria pass on the deployed code.
7. **Erik play-leg.** Surfaces Aevi cannot verify from outside the running game go to Erik.
8. **Aevi closes.** Only after live verification passes. Ship report alone is not a close.

**Verification:** PWSV section exists in spec. ROUND-2 findings documented. Live origin verified
after ship. Erik's play-leg confirmed before close.

**Live anchors:** `po/SPEC_SNG-*.md`, `po/REPLY_ccode_*.md`, `scripts/certify_counts.mjs`.

### R2.3 — CCode build sequence (enforced by suite)

Steps that gates will fail if skipped, in order:

1. **Bump the version** if any versioned source changed — `wiring_audit` fails otherwise
   (*"the version MOVED with the source it describes"*).
2. **`node scripts/certify_counts.mjs`** — six claims across four files. One new craft makes
   three of them stale.
3. **`node scripts/apparatus_inject.mjs`** if a harness was added — `how_it_works` asserts totals.
4. **A `§0` row in `docs/HOW_IT_WORKS.md`** — Erik's standing rule; `how_it_works` §0b gates shape.
5. **`git add` any new `po/` file before running the suite** — `smoke` fails on an untracked reply
   (*"a reply left untracked was never sent"*).

---

## OpFlow_AeviShipReview

**Trigger:** CCode files a ship report or reply (`REPLY_ccode_*.md`).

1. **Read the report fully.** Note any scope extensions, deviations from spec, and open items
   CCode flagged.
2. **Verify at origin.** Pull the relevant files via authenticated `api.github.com`. Do not trust
   the report's content claims without checking the live layer.
3. **Run certify.** `node scripts/certify_counts.mjs --check` if content files were touched.
4. **Check ratchets.** Identify any regressions. If CCode introduced a regression, flag it
   explicitly with the ratchet name and count.
5. **Disposition.** Close if verification passes. File a follow-up spec if findings surfaced new
   debt. Return to CCode with questions if the report is incomplete.

**"Only Aevi closes"** — this flow is why. A ship that passes on paper but fails at origin is not
a ship.

**Verification:** Live origin checked. Ratchets noted. Disposition recorded in a reply or ruling.

---

## OpFlow_GateRedOnCorrectChange

**Trigger:** A suite gate goes red after a change that was correct — a ruling landed, content was
retired, a design constraint shifted.

*(Added from CCode ROUND 2. Four instances in two days: `valley_craft` retirement broke three gates;
Erik's braid ruling broke a gate shipped an hour before; antipode ruling broke five smoke gates;
removing a dead fallback broke a pinned regex.)*

1. **Ask what the gate CLAIMS, not what it tests.** Read the comment above it — the claim is usually
   broader than the assertion.
2. **Classify the failure:**
   - ⛔ **Fixture-coupled** — names a specific craft, tradition, or id that content may retire.
     *Fix: derive the subject from the corpus.*
   - ⛔ **Spelling-pinned** — a regex matching exact characters. *Fix: assert the claim.*
   - ⛔ **Rule-encoding** — asserts a design rule that has since been re-ruled. *Fix: re-state
     against the new ruling, keeping the half that survives.*
   - ✅ **Genuinely caught something** — the content is wrong. *Fix the content.*
3. **Never re-point a fixture at another name.** Ask the corpus instead.
4. **Keep the non-vacuity floor.** A derived fixture can find nothing and pass silently; assert
   the supply exists (*"…and there are braids to check"*).
5. **Record which class it was** in the commit message or a comment.

⚠️ **The tell for rule-encoding failure:** the gate is green *and* it contradicts a ruling. A gate
that asserts an unimplemented rule is worse than no gate — it passes, reads as confirmation, and
defends a restriction the design never had.

---

## OpFlow_RulingRequest

**Trigger:** A decision is needed from Erik that Aevi cannot make as PO — canon questions, design
direction, values calls.

1. **File `po/RULING_REQUEST_name.md`.** Sections: what the question is, why Aevi cannot resolve
   it unilaterally, the options as Aevi sees them, Aevi's recommendation if she has one (clearly
   marked as a recommendation, not a ruling).
2. **Do not build anything the ruling could invalidate.** A reader that defaults to a no-op is
   safe under every possible answer and should be built early — it is what makes content authored
   against the ruling checkable. The test is not "is the ruling open" but "would either answer
   make this wrong."
3. **When Erik rules,** file `po/RULING_name.md` with the ruling as stated, what it changes, and
   any immediate follow-on specs it unblocks.

**Verification:** Ruling file exists and names what is now unblocked. Dependent work resumes only
after the ruling file is committed.

**Live anchors:** `po/RULING_REQUEST_*.md`, `po/RULING_*.md`.

---

## OpFlow_Handoff

**Trigger:** Context boundary (compaction, session end, Aevi-to-CCode or CCode-to-Aevi transition).

**Handoff files live in `po/`.** Topic-scoped names are preferred over dated names — a handoff is
looked up by what it is about. Use a date in the name only when the date is the distinguishing
fact (e.g., a state snapshot: `HANDOFF_ccode_to_aevi_state_20260831.md`).

**A handoff is not a summary.** It is a document written for someone who cannot ask follow-up
questions. Required sections:

1. **What the recipient should be skeptical of.** Any work done under context pressure, any claim
   not verified at origin, any number carried forward from memory rather than measured today.
2. **What is complete and verified.** Commit SHAs, certify output, ratchet state.
3. **What is waiting on each person.** Explicit per-person lists.
4. **The generalisable finding, if one exists.** The thing that, if the recipient does not know,
   they will rediscover the hard way.

⚠️ **Shared-branch hazard (CCode R2.4):** never `--amend` inside a push-retry loop. `--amend`
amends whatever HEAD happens to be; in a retry loop something moving is the entire premise. If you
see a commit with an inexplicably large diff, check `git reflog` for `commit (amend)` before
assuming you caused it.

**Verification:** Recipient can reconstruct current state from the handoff alone, without access
to the session transcript.

---

## Maintenance

When a flow changes:
1. Update this document.
2. Commit in the same session as the change that prompted it.
3. Note the change in the session handoff.

When a flow is missing:
1. Author it here first.
2. Request CCode ROUND 2 if the flow involves CCode's lane.

When practice drifts from documentation:
1. Decide which is right — the flow or the practice.
2. Update whichever is wrong. Log the drift in the handoff.

---

## ⛔ OpFlow_RulingEnacted — THE SINGLE SOURCE OF TRUTH

**Added 2026-09-02 after three wrong reports on one subject in one day, with the answer already documented.**
⚠️ **Distinct from `OpFlow_RulingRequest`, which is how a ruling is ASKED FOR. This is how one BECOMES TRUE.**

### The rule

> ⛔ **`docs/HOW_IT_WORKS.md` — the BODY — is the ONLY source of truth.**
> **`po/` is working papers and is NEVER authoritative. Not even `po/RULING_*.md`.**

⚠️ **MEASURED 2026-09-02: 23 of 32 rulings existed ONLY in `po/`.** ⛔ **A ruling that lives only in a
working paper is a rumour with a commit hash.**

### ⛔ A ruling is TWO steps, and Aevi kept stopping at one

| # | step |
|---|---|
| 1 | File `po/RULING_*.md` — **the reasoning, the evidence, the alternatives** |
| 2 | ⛔ **REWRITE the relevant `HOW_IT_WORKS` BODY section in present tense, and add a LOG row recording what it used to say** |

⚠️ **STEP 2 IS THE RULING. Step 1 is only the argument for it.**

### ⛔ Supersession

- **A ruling REPLACES body text. It never adds a second section alongside.**
- ⚠️ **One subject, ONE body section.** If two body sections discuss a subject, one is already wrong.
- **The LOG carries what it used to say. The body carries only what is true now.**

### ⬜ RETRIEVAL — before reporting ANY finding

> ⛔ **Grep `HOW_IT_WORKS.md` for the subject — BODY FIRST, then LOG. Then the prior audit's owed list.
> ONLY THEN the data.**

⚠️ **On 2026-09-02 Aevi searched the DATA three times and never the DOC, and was wrong three times about
one subject.** ⛔ **`valley_craft` was documented as RETIRED on line 88, with Erik's words attached, the
whole time.**

### ⚠️ The failure this exists to prevent

⛔ **LOG line 85 withdrew `traditionKind`. BODY line 519 still recommended it.** ➡️ **A reader landing in
the body got a withdrawn proposal presented as live — and did.**

⛔ **NO EXISTING GATE CATCHES THIS.** Every ratchet tests doc-vs-code or content-vs-content. **Nothing tests
DOC-VS-DOC.** ⬜ `SPEC_one_source_of_truth.md` §4 proposes the `ruling_anchor` gate; **until it exists this
flow is discipline, and discipline already failed here once.**
