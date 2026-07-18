# SNG-152 — Prose Integrity: no text is ever silently cut

| | |
|---|---|
| **Status** | `ROUND 1 — awaiting CCode ROUND 2` |
| **Author** | Aevi (PO) · 2026-07-18 |
| **Report** | Erik, with a screenshot: an NPC card ending *"…Dry two seasons. Named the s"* — cut mid-word, no ellipsis. *"Still losing some text in various places. Audit all locations and make this not happen."* |
| **Prior art** | **SNG-076 and SNG-088 both addressed truncation and it is still happening.** That recurrence is the finding — see §2. |
| **Depends on** | Nothing. Independent of BATCH-11; can build in parallel. |

---

## §0 · PRE-WORK SCOPE VERIFICATION (Law 11)

Measured at HEAD `05872f2` by direct read.

| Claim | Measured |
|---|---|
| Fixed-length caps (`.slice(0,N)` / `.substring` / `.substr`, N ≥ 10) across `engine/*.js` + `app.js` | **190** |
| …that write into a **persisted state field** (destructive — unrecoverable at render) | **52** |
| …that carry **any ellipsis marker** | **12 of 190** |
| …that cut on a **word boundary** | **0** (outside `smartClamp` itself) |
| Files with raw prose caps and **no** `smartClamp` import | **9 files · 79 caps** |
| `smartClamp` exists | **Yes** — `engine/namematch.js:8`, shipped by **SNG-076** |
| `smartClamp` applied in | **4 files** — `quests.js`, `worldtick.js`, `app.js` ×2 |

**The reported card:** `npcs.js` caps NPC `description` at 240 and each history note at 180, **inside the state-update function** — the cut happens on the way *into* saved state. `npcs.js` has **21 raw caps and zero `smartClamp` imports.**

---

## §1 · The load-bearing fact

**This cannot be fixed in the view.** 52 of the caps run at the persist boundary, so the tail is never stored. No CSS, no expander, no re-render recovers a sentence that was severed before it was written to disk. Any fix that only touches rendering will appear to work and will still be losing text.

---

## §2 · Why this recurred, and what that means

SNG-076 did not merely patch sites. **It got the doctrine exactly right and wrote it down**, in `smartClamp`'s own docstring:

> *"clamp MODEL output on a WORD BOUNDARY with a real ellipsis — never mid-word, never losing a word's tail like `slice()` does. AUTHORED content is never clamped (it is finite and meant to be read); this exists only to bound untrusted model strings, and generously."*

That is the correct rule, the correct primitive, and the correct three-way distinction — **already in the repo.** It was then applied to four files and never generalized to the other nineteen.

So SNG-076 and SNG-088 were not wrong. They were **site-specific fixes to a systemic defect**, which is why the same bug walked back in through `npcs.js`. Erik's instruction — *audit all locations* — is the correct response, and the reason it is correct is that the previous two attempts fixed the instances they were shown.

*This is the fifth capability this session found built, correct, and applied at one site: `skill_battle`, `pushMergedFile`, `gmAdviceFull`, `stateOps`, and now `smartClamp`. It belongs in the §23 evidence list.*

---

## §3 · The taxonomy — three kinds of string, three rules

Every cap in the codebase is one of these. The audit's job is to classify all 190 and apply the matching rule. **A single global "don't truncate" rule would be wrong** — capping a `gender` field at 40 characters is correct and should stay.

| Kind | Examples | Rule |
|---|---|---|
| **IDENTIFIER** — a label, name, id, or enum-ish value | `name` 60 · `gender` 40 · `pronouns` 40 · `subjectId` 40 · `function` 20 | **Hard cap is CORRECT. Leave it.** These are not prose; a long value is malformed input, not lost meaning. |
| **MODEL PROSE** — narrative text produced by the GM | NPC `description` · history `note` · `statusNote` · scene `summary` · beat `summary` · encounter text | **`smartClamp` at a generous bound.** Word boundary, real ellipsis, never mid-word. Bound exists to stop unbounded save growth, not to shorten for reading. |
| **AUTHORED PROSE** — content from `content/packs/**` | ability `grants` · location `descriptionSeed` · quest outcome `narration` · lore | **NEVER clamped.** Finite, hand-written, meant to be read whole. Per SNG-076's own doctrine. |

**Classification is a judgement call per site, and it is CCode's to make with the PO available for content-side questions.** The mechanical sweep produces the candidate list; it cannot decide which field is prose.

---

## §4 · The rule (proposed for SYSTEM_SPEC §2)

> **No prose is ever silently cut.** Identifier fields may be hard-capped. Model prose is clamped only on a word boundary with a visible ellipsis, generously bounded. Authored content is never clamped. Where a display must shorten, the full text remains in state and stays reachable.

Stated as a requirement, per PM direction on positive framing.

---

## §5 · The work

**5a — Classify all 190.** Every fixed cap tagged IDENTIFIER / MODEL PROSE / AUTHORED PROSE. Deliverable: the table, so the decisions are reviewable rather than buried in a diff.

**5b — Convert every MODEL PROSE cap to `smartClamp`,** at a generous bound. Priority order by blast radius: `npcs.js` (21 — the reported bug) → `gm.js` (14) → `inventory.js` (11) → `encounters.js` (8) → `progression.js` (8) → `codex.js` (5) → `places.js` (4) → `party.js` (4) → `facts.js` (4).

**5c — Remove clamps on AUTHORED content** wherever the sweep finds them. These are pure loss with no upside.

**5d — Display truncation keeps the full text.** The pattern already exists and works: `gmAdvice` / `gmAdviceFull` / `gmAdviceExpanded` with a "more" button (`app.js:5228`, `5301`). Generalize it. A display clamp must never be the only copy.

**5e — CI gate, so it cannot regress a third time.** A new check in the audit suite: **a fixed-length cap applied to a field on the prose list fails the build.** Identifier fields are allowlisted by name. This is what turns SNG-152 from a third site-specific fix into the last one.

---

## §6 · Verification (close on the symptom — §21)

**Not a code read.** Reproduce Erik's screenshot: open the NPC card for **Bren Thalle** and confirm the history note ends as a whole sentence, or ends with a visible ellipsis and an affordance to read the rest. Then:

- an NPC whose description exceeds the old 240 cap survives a save/reload with its tail intact
- a shared-scene beat summary over 200 chars is not severed mid-word
- an authored `descriptionSeed` renders **whole**, with no clamp anywhere in its path
- the CI check fails on a deliberately reintroduced `String(u.description).slice(0, 240)`

**Note on scope honesty:** existing saves already contain severed text. Prior loss is **not recoverable** — the tails were never written. This spec stops the bleeding; it does not heal what is already cut. Worth telling Erik plainly rather than letting him find old NPCs still ending mid-word and think the fix failed.

---

## §7 · Questions for CCode — ROUND 2

1. **Is 52 the right destructive count?** The PO's classifier keys on assignment shape and will have both false positives and misses. The persist-boundary set is the load-bearing one.
2. **Generous bound — what number?** `smartClamp` defaults to 600 and quests use 600–800. Is one bound right for all model prose, or does per-field sizing matter for save growth?
3. **Save-size risk.** Raising NPC `description` 240 → 600 and history notes 180 → 600, across a long campaign with many NPCs — does this materially grow the character file, and does any sync path have a size ceiling?
4. **Is `namematch.js` the right home?** `smartClamp` currently lives in the name-resolution module for import-cycle reasons (its own header explains). Nine more importers may argue for a `text.js`. CCode's call.
5. **Does any consumer depend on a cap?** A fixed width assumed downstream — a card layout, a prompt budget, a token estimate — would break on longer strings.

---

*— Aevi (PO), ROUND 1. Counts measured at HEAD this session. The primitive and the doctrine both already exist; this spec is almost entirely the work of applying what SNG-076 wrote down.*
