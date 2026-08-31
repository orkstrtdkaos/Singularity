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
