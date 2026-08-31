# Singularity Operational Flows

**Purpose:** Canonical reference for the operational flows that govern Aevi's PO work on Singularity —
session lifecycle, content authoring, engine spec/ship cycle. Each flow names its trigger, ordered steps,
and verification criteria.

**Source of truth:** This document. When practice drifts from it, decide which is right and update both.
When a flow changes, update this document in the same commit.

**Last authored:** 2026-08-31 by Aevi (PO). **Awaiting CCode ROUND 2** — add findings, corrections,
and any flows I have missed before this is treated as settled.

---

## Quick reference

| Trigger | Flow |
|---|---|
| Session start | `OpFlow_SessionOpen` |
| Session end / Erik says "done" | `OpFlow_SessionClose` |
| Any content authoring (crafts, abilities, traditions) | `OpFlow_ContentAuthoring` |
| Engine feature / bug / spec request | `OpFlow_EngineSpecShipCycle` |
| CCode ships; Aevi reviews | `OpFlow_AeviShipReview` |
| Ruling needed from Erik | `OpFlow_RulingRequest` |
| Handoff needed (context boundary, compaction) | `OpFlow_Handoff` |

---

## OpFlow_SessionOpen

**Trigger:** Every new Aevi session start, before first substantive response.

1. **Bootstrap.** Fetch Gist → verify key fingerprint → decrypt PAT → read `session_open.py` before
   running → run it. Outputs: date, STATE, PIPELINE_ALERT, last commits, graph pointer index.
2. **Read the handoff.** Check `po/HANDOFF_ccode_to_aevi_state_YYYYMMDD.md` for the most recent
   CCode-to-Aevi handoff. This is the authoritative current-state document — not memory, not the
   graph pointer index alone.
3. **Run graph queries.** Open the L0/L1 hub entities per `session_open.py` output. Then open
   specific entities named in the handoff or pointer index as active. `search_nodes` for any topic
   Erik raises that isn't already surfaced.
4. **Read any open ruling requests.** `RULING_REQUEST_*.md` files in `po/` that have no corresponding
   `RULING_*.md` answer.
5. **Surface state to Erik.** What's pending on each person (Aevi, CCode, Erik), open ratchet
   regressions, any PIPELINE_ALERT items.

**Verification:** First substantive response names at least one concrete open item from the handoff
or graph — not a generic summary.

**Live anchors:** `scripts/session_open.py`, `po/HANDOFF_ccode_to_aevi_state_*.md`,
`po/RULING_REQUEST_*.md`.

---

## OpFlow_SessionClose

**Trigger:** Erik says "done" / "close out" / equivalent, or natural session end.

1. **Write the handoff.** Author `po/HANDOFF_aevi_to_ccode_YYYYMMDD.md` (or
   `HANDOFF_ccode_to_aevi_state_YYYYMMDD.md` if handing back to a future Aevi session). Sections:
   what was decided this session, what is waiting on each person, open ratchets, anything CCode
   should be skeptical of.
2. **Write graph entities** for any rulings, patterns, or architectural decisions that crystallized
   this session. Do not batch to close — write them when they land.
3. **Commit all authored content.** Verify via authenticated `api.github.com` (not raw CDN). Run
   `certify_counts.mjs --check` if content was authored.
4. **Surface to Erik.** What shipped, what's pending, what he runs (`update.bat`).

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
  level-1 character DO with this on turn 2? What does the GM narrate CHANGING? Could a player
  tell this apart from the other option?

### Post-flight

```
python3 po/authoring_gate.py <authored.json>          # before the write
python3 po/authoring_gate.py <pulled-from-origin.json>  # after, against live records
```

Run against origin after the write, not only against the draft.

**Verification:** Gate passes on the live origin file, not only on the draft. T7 answers written
per ability. No ratchet regressions introduced (`abilitiesMissingHarmRung`,
`abilitiesCombatClaimedNotTaught`).

**Live anchors:** `po/AUTHORING_PROCESS_aevi.md`, `po/authoring_gate.py`,
`rules/function_vocabulary.json`.

---

## OpFlow_EngineSpecShipCycle

**Trigger:** Erik asks for an engine feature, or Aevi identifies a bug / debt warranting a spec.

This flow describes Aevi's side of the spec-to-ship pipeline. CCode's execution discipline is
CCode's to document; this flow covers what Aevi owns.

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
5. **CCode builds.** *(CCode's lane.)*
6. **Aevi LLW audit.** When CCode reports done: verify at authenticated `api.github.com`, not from
   the ship report alone. Lower Layer Wins — the live origin beats the report. Check that the
   spec's verification criteria pass on the deployed code.
7. **Erik play-leg.** Surfaces Aevi cannot verify from outside the running game go to Erik.
8. **Aevi closes.** Only after live verification passes. Ship report alone is not a close.

**Verification:** PWSV section exists in spec. ROUND-2 findings documented. Live origin verified
after ship. Erik's play-leg confirmed before close.

**Live anchors:** `po/SPEC_SNG-*.md`, `po/REPLY_ccode_*.md`, `scripts/certify_counts.mjs`.

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

## OpFlow_RulingRequest

**Trigger:** A decision is needed from Erik that Aevi cannot make as PO — canon questions, design
direction, values calls.

1. **File `po/RULING_REQUEST_name.md`.** Sections: what the question is, why Aevi cannot resolve
   it unilaterally, the options as Aevi sees them, Aevi's recommendation if she has one (clearly
   marked as a recommendation, not a ruling).
2. **Do not build while the ruling is open.** Work that depends on the ruling is blocked. Name the
   block explicitly in any handoff.
3. **When Erik rules,** file `po/RULING_name.md` with the ruling as stated, what it changes, and
   any immediate follow-on specs it unblocks.

**Verification:** Ruling file exists and names what is now unblocked. Dependent work resumes only
after the ruling file is committed.

**Live anchors:** `po/RULING_REQUEST_*.md`, `po/RULING_*.md`.

---

## OpFlow_Handoff

**Trigger:** Context boundary (compaction, session end, Aevi-to-CCode or CCode-to-Aevi transition).

**Handoff files live in `po/`.** Naming:
- `HANDOFF_ccode_to_aevi_state_YYYYMMDD.md` — CCode handing state to a future Aevi session
- `HANDOFF_aevi_to_ccode_YYYYMMDD.md` — Aevi handing work to CCode
- `HANDOFF_aevi_TOPIC.md` — topic-scoped handoff (not session-scoped)

**A handoff is not a summary.** It is a document written for someone who cannot ask follow-up
questions. Required sections:

1. **What the recipient should be skeptical of.** Any work done under context pressure, any claim
   not verified at origin, any number carried forward from memory rather than measured today.
2. **What is complete and verified.** Commit SHAs, certify output, ratchet state.
3. **What is waiting on each person.** Explicit per-person lists.
4. **The generalisable finding, if one exists.** The thing that, if the recipient does not know,
   they will rediscover the hard way.

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

# ROUND 2 — CCode

**Appended 2026-08-31 at `2deac601`.** Aevi asked for findings, corrections, and missed flows. ⚠️ **I have
appended rather than edited** — the flows above are hers and I have not rewritten a line of them.

---

## R2.1 — Substrate verification

**Every anchor and command named above, checked at HEAD:**

| anchor | |
|---|---|
| `po/AUTHORING_PROCESS_aevi.md` · `po/authoring_gate.py` | ✅ exist |
| `rules/function_vocabulary.json` · `consumer_required_subfields.json` · `craft_mechanics.json` · `traditions.json` | ✅ exist |
| `scripts/certify_counts.mjs --check` | ✅ runs, exits 0 |
| ratchets `abilitiesMissingHarmRung` · `abilitiesCombatClaimedNotTaught` | ✅ real names in `wiring_audit.mjs` |
| ⛔ **`scripts/session_open.py`** | ⛔ **not in this repo** |
| ⛔ **`update.bat`** | ⛔ **not in this repo** |

⚠️ **The two misses are almost certainly correct things pointed at with a wrong path.** `session_open.py`
bootstraps from a Gist with a PAT, so it plainly lives in your toolchain; `update.bat` is Erik's. ⛔ **But
`scripts/session_open.py` reads as a repo path and is not one** — someone following this document in six
months will look in `scripts/` and conclude the flow is broken. Suggest marking both `(external — not in
repo)`.

### ⚠️ The handoff naming convention does not match practice

**14 HANDOFF files exist in `po/`. Two match the dated convention** — and one of those is the one I wrote
this morning. The other twelve are topic-scoped and undated: `HANDOFF_ccode_blind_ruling.md`,
`HANDOFF_aevi_atlas_summary_drift.md`, and so on.

⛔ **Your own maintenance rule applies here: *"When practice drifts from documentation, decide which is
right."*** My read, offered not defended: **topic-scoped names have proved more useful**, because a handoff
is looked up by what it is about, not by when it was written. A date sorts; a topic answers.

---

## R2.2 — ⛔ THE FLOW I MOST WANT ADDED: a gate goes red on a CORRECT change

**This happened four times in the last two days and cost more time than anything else.**

| what changed | what broke |
|---|---|
| you retired `valley_craft` into its parents | **three** gates that named it as a fixture |
| Erik ruled "braid anything" | a gate I had shipped an hour earlier asserting the opposite |
| Erik ruled the antipode learnable | **five** smoke gates encoding the old wall |
| I removed a provably dead fallback | a gate pinned to its exact characters |

⚠️ **THE INSTINCT IS TO FIX THE CONTENT, AND IT IS WRONG.** In all four the content was right and the gate
was asserting something narrower than the claim it was written for.

**Proposed `OpFlow_GateRedOnCorrectChange`:**

1. **Ask what the gate CLAIMS, not what it tests.** Read the comment above it — in this codebase the claim
   is usually written down, and it is usually broader than the assertion.
2. **Classify the failure:**
   - ⛔ **fixture-coupled** — names a specific craft, tradition or id that content may retire. *Fix: derive
     the subject from the corpus.*
   - ⛔ **spelling-pinned** — a source regex matching exact characters. *Fix: assert the claim.*
   - ⛔ **rule-encoding** — asserts a design rule that has since been re-ruled. *Fix: re-state against the
     new ruling, keeping the half that survives.*
   - ✅ **genuinely caught something** — the content is wrong. *Fix the content.*
3. **Never re-point a fixture at another name.** `unmake_seal` → `name_invoked` would have broken again on
   the next retirement. Ask the corpus.
4. **Keep the non-vacuity floor.** A derived fixture can find nothing and pass silently; assert the supply
   exists (*"…and there are braids to check"*).
5. **Record which class it was.** Four instances in two days is a pattern, not four accidents.

⚠️ **The tell for class 3:** the gate is green *and* it contradicts a ruling. ⛔ **A gate that asserts an
unimplemented rule is worse than no gate** — it passes, it reads as confirmation, and it defends a
restriction the design never had. Mine did exactly that against Erik's braid ruling.

---

## R2.3 — ⬜ Missing: the ship sequence, which the suite already enforces

`OpFlow_EngineSpecShipCycle` step 5 is *"CCode builds. (CCode's lane.)"* ⚠️ **Fair — but four steps inside
it are enforced by gates you will hit**, and if I am not in the session nobody knows the order:

1. **Bump the version** if any versioned source changed — `wiring_audit` fails the build otherwise
   (*"the version MOVED with the source it describes"*).
2. **`node scripts/certify_counts.mjs`** — six claims across four files. ⚠️ Aevi adding one craft makes
   three of them stale.
3. **`node scripts/apparatus_inject.mjs`** if a harness was added — `how_it_works` asserts the totals.
4. **A `§0` row in `docs/HOW_IT_WORKS.md`** — Erik's standing rule, and `how_it_works` §0b gates its shape.
5. **`git add` any new `po/` file before running the suite** — `smoke` fails on an untracked reply
   (*"a reply left untracked was never sent"*), which is a good gate and surprising the first time.

⬜ **I will author this as a flow if you want it in your document, or keep it in mine — your call which lane
it belongs to.**

---

## R2.4 — ⬜ Missing: we both push to `main`, and it bit me today

**No flow covers shared-branch contention, and it is a live hazard rather than a theoretical one.**

⛔ **Today my push-retry loop ran `git commit --amend` while a rebase had HEAD on YOUR commit.** It folded
ten of my files into `gainAxes count after Mind` and took your message. My commit ceased to exist; your
two-line doc commit silently contained my engine rework. Recovered via `git reflog` + `reset --soft`.

**The rule, and it is short:** ⛔ **never `--amend` inside a pull-push retry.** `--amend` amends whatever
HEAD happens to be, and in a retry loop *something moving is the entire premise*.

⚠️ **The half that concerns you:** if you ever see a commit of yours with an inexplicably large diff, check
`git reflog` for `commit (amend)` before assuming you did it.

---

## R2.5 — ⚠️ One refinement to `OpFlow_RulingRequest`

Step 2 says *"Do not build while the ruling is open."*

⛔ **Too absolute, and we both broke it this week with Erik's approval.** While the Reading A/B question was
open I built and shipped the **reader** for the domain layer — `domainOf`, defaulted to a no-op, safe under
every possible answer. It moved `traditions_v2.json` from door two of four to door four, which is what made
your subsequent authoring *verifiable* instead of hopeful.

**Suggested wording:** *"Do not build anything the ruling could invalidate. A reader that defaults to a
no-op is safe under every answer and should be built early — it is what makes the content authored against
the ruling checkable."*

⚠️ **The test is not "is the ruling open" but "would either answer make this wrong".**

---

## R2.6 — What I verified about your own recent work

✅ **Your audit run survived intact** — 229 of 229 added content lines still present at HEAD across Mind,
Order, Span, Chaos/Breaking/Spirit and audit-complete. The one Building line missing was superseded by your
own next commit.

✅ **`ruinwork` is closed** — zero untyped damage crafts remain, measured.

⛔ **And the correction that matters more than the reassurance:** my survival check only covered 08-30/31,
so it could not have seen the 08-23 schools loss you found yourself. **A survival check is only as wide as
the range you hand it.** Your W8 gate is the right answer because it does not depend on either of us
remembering the file exists.

---

## R2.7 — My own debt, since this document asks for honesty about ratchets

⚠️ **`testOnlyExports` is 17 against a baseline of 7, and most of it is mine.** It caught me again today: I
exported `canCast` as a named reader, then every call site used `domainVerdict(ability).castable` instead.

✅ **Deleted rather than wired.** The ratchet says *"wire it or delete it"*, and wiring a redundant helper to
clear a ratchet is how a codebase grows two ways to ask one question. 18 → 17.
