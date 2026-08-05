# PLAN — SNG-309: THE CLARITY PASS. A structured approach, because eyeballing has already failed twice.
## Aevi (PO) · 2026-08-05 · Erik: "there is a lot of this in the game, so you might want to take a good
## structured approach."

## THE SURFACE, MEASURED
**278 content files · 4,884 player-facing strings over 15 characters.**
| field | count | | field | count |
|---|---|---|---|---|
| name | 988 | | plainly | 301 |
| text (bounds) | 941 | | wants | 141 |
| grants | 833 | | objective / condition | 156 |
| cannot | 642 | | title / summary / role | 191 |
| description | 493 | | premise / stakes / publicFace | 81 |
**Too many to read by eye — and I have now missed this twice in one day, so my eye is not the instrument.**

## THE INSTRUMENT: FIVE STRUCTURAL DETECTORS
**Not "does this feel vague" — that is a judgement I have already proven unreliable at. These are patterns a
machine can find, and each maps to a specific way a sentence fails to say anything.**
| detector | hits | what it catches |
|---|---|---|
| **promise without a number** — *costs / takes / lasts / reaches* with no figure | **432** | *"it costs more"* · *"it lasts a while"* |
| **unquantified degree** — *more / harder / longer / deeper* with no "than" | **148** | *"harder to hold"* — than what? |
| **verb-phrase with no object** — *by X-ing* with nothing following | **60** | ⚠️ *"by turning"* — the exact thing Erik caught |
| **bare deictic subject** — a sentence opening *it is / that is* | **40** | *"it is their hand"* |
| **dash-clause reframe** — *X — which is Y* | **7** | a second clause that restates instead of specifying |
**687 hits total.** Overlapping, so the real count of bad strings is lower — **but every hit is a concrete
sentence I can open and judge, rather than a vibe.**

## THE ORDER — by how directly a player meets it
1. **`plainly` (301)** — ⚠️ **already done, and it is the model.** Whatever else stays evocative, this field is
   the contract.
2. **`cannot` (642) and `text` / bounds (941)** — **the highest-value target.** A limit nobody can apply is
   not a limit, and these are where *"the two poles fight"* lives. **~1,583 strings.**
3. **`grants` (833)** — what a rank gives you. **Same argument: a grant you cannot cash is flavour.**
4. **`name` (988)** — ⚠️ **Erik's NPC-and-title point.** Different failure: not vagueness but *unplaceable*
   names. Needs its own rule (below), not a `plainly`.
5. **`description` (493)** — lowest priority. **This field is ALLOWED to be evocative**, because `plainly` now
   sits beside it. **That is what the twin is for.**
6. Everything else (~750) — quests, lore, publicFace — sweep last.

## THE RULE PER FIELD — because they fail differently
- **`plainly`** — no metaphor, no drama-capitals, states roll/target/result/counterplay. **Enforced.**
- **`cannot` and bounds `text`** — must name **a condition someone can check.** *"The unreasonable are
  immune"* passes. *"The two poles fight"* fails: it names no test.
- **`grants`** — must name **what the character can now do that they could not before.**
- **⚠️ `name` — a different rule entirely.** A name is not vague, it is **unplaceable**: *"the Grey Lady"*
  tells you nothing about what she is or where. **Names need a companion line, not a rewrite** — one clause of
  who and where, so a name resolves on first encounter. *"The Grey Lady — Athena of the High Seat, water-
  arbitrator, four centuries in the Ascent."*
- **`description`** — may stay evocative **only where a `plainly` exists.** Elsewhere it inherits the
  bounds rule.

## THE PROCESS — repeatable, per file, not one heroic pass
1. run the detector over one file → a list of flagged strings with line context
2. **open each and judge it individually** — the detector finds candidates, it does not decide
3. fix or mark `clarity_ok` with a one-word reason
4. **re-run: the file's hit count may only go DOWN** — a ratchet, not a gate, so pre-existing debt does not
   block a build *(the lesson from CCode's `personalCoverage` decision)*
**⚠️ ASK FOR CCODE: put the five detectors in `tests/` as a reported ratchet.** It is the only way this stays
paid down instead of re-accruing — and **it will catch me, which is the point.**

## WHAT I EXPECT TO FIND, SO IT CAN BE CHECKED AGAINST
- **The 432 "promise without a number" hits are mostly REAL** and mostly in bounds — my most common failure is
  asserting a cost without saying how much.
- **The 60 "by X-ing" hits will be nearly all mine and nearly all recent.**
- **The `name` field will not respond to this treatment at all** and needs the companion-line pass instead.
