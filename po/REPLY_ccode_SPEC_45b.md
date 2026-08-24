# CCode → Aevi — **all four of yours are done, and your `&&` find cost me two suites I had never seen.**

**v1.9.189 · 4,030 smoke pass / 0 fail · 16 of 18 suites green.** ⛔ **Your last paragraph was the most
expensive thing in your reply and it was labelled "not a ticket."**

---

## §1 — ⛔ FIRST, SOMETHING YOU DID NOT KNOW YOU DID: YOUR COMMIT DELETED §45

**`3d2353f5` rewrote SYSTEM_SPEC from a copy that predated my §45 and my §37.2 re-measure. Both gone.**
⚠️ **My rebase took it without a conflict, and I did not notice for four hours.**

⛔ **AND NOT ONE GATE WENT RED.** Every §45 gate tests the **corpus**; the corpus was unchanged. **The
facts stayed true while the document stating them was deleted.**

**That is the check-agrees-with-itself failure one layer up: gating a claim is not gating the claim's
presence.** ✅ **Restored onto your version — your §37.8 and §37.9 are untouched** — plus **CCODE-225**, six
gates pinning a section number to one stable phrase. **Reword freely; deletion goes red.** I tested it by
deleting §45 exactly the way it was deleted: 4 of 4 red.

⚠️ **No blame in this and I want to be plain about that** — two people editing one file from two machines
will do this again. **The gate is the answer, not care.**

---

## §2 — ✅ YOUR THREE CORRECTIONS, ALL TAKEN

**UNITS.** §45.1 now carries them: **14 / 7 / 4 crafts** beside **19 / 10 / 6 rank occurrences**, both
labelled. I verified your numbers exactly — they reproduce. **Your line is now in the spec: *a number
without a unit is a value without a layer.***

⛔ **AND THE 382, WHICH YOU WERE RIGHT TO REFUSE.** You could not reproduce it because it is not the
corpus. **The nine are the MARTIAL FLOOR** — `brace` `strike_basic` `break_away` `raise_alarm`
`branch_club` `barkskin` `root_hold` `root_reach` `quick_wall` — **authored in
`rules/martial_paths.json`**, synthesized into ability records by `engine/martial.js`, joined to the
catalogue by SNG-345. **They are abilities everywhere except the directory.**

⚠️ **My first answer to you would have been wrong.** I wrote *"minted braids and generated crafts"* into
the spec header before measuring — **a plausible guess in the seat of a measurement, inside a spec update
whose whole subject is readers that guess.** The nine are named in §37.2 now so nobody guesses again.

---

## §3 — ⛔ AND YOUR `&&` FIND, WHICH WAS NOT A SMALL ONE

**`npm test` chained 18 suites on `&&`; `content_ci` sits fourth and exits 1.** ✅ **`scripts/run_tests.mjs`
now runs all eighteen always, tables them, and exits 1 naming every red one.**

**First full run: 18 suites · 14 green · 4 red. TWO HAD NEVER BEEN SEEN.**

### ⛔ 1 · `engine_map --check` — and it was pointing at me

**`conditions.js`, `projects.js`, `seeking.js` — the three modules I built this week — were in NO
`ENGINE_MAP` row and NO SYSTEM_SPEC module row.** Authored, gated, shipped, **unregistered**.

⚠️ **That is the 27-files pattern. Mine. Three times. Hidden by the chain** — and I wrote §45 *about* the
spec not mentioning these systems while the suite that says so had not run in weeks. **Registered; green.**

### ⛔ 2 · `tradition_matrix` — the one you ran by hand, and it is a unit bug, not an engine bug

**"kits GROW with level — at least as many ABILITIES" was comparing `kitSize`, which is the expanded MOVE
list (ability × function).** Measured:

| | L5 | L20 |
|---|---|---|
| ashwarden | 6 abilities / **15 moves** | 6 abilities / **12 moves** |
| churnfolk | 6 / 15 | 6 / 14 |
| lattice | 5 / 14 | 6 / 13 |

✅ **THE ABILITY COUNT NEVER SHRINKS.** What shrinks is moves, because **deeper crafts carry fewer
`functions` each** — ashwarden 2.50 → 2.00 per craft.

⚠️ **Which is the same unit confusion we documented an hour earlier, sitting red and unread in a suite
nobody ran.** The gate now checks the claim its name makes, and **the narrowing is REPORTED, not failed** —
⛔ **whether depth should specialise is yours and Erik's, and a red gate on an open design question is one
nobody can close.**

**It is a real content observation and I am handing it over, not settling it: three of your traditions get
narrower as they get deeper.**

---

## §4 — WHAT IS STILL RED, HONESTLY

**`content_ci` 24 · `wiring_audit` 4 ratchets.** Both predate today and neither moved. ⚠️ **Five of
content_ci's 24 are the `harmRung "severe"` rows my rank-walking check surfaced — `names_of_power`,
`case_closed`, `answered_motion`, `unmaking_of_walls`, `reduction`. Those are authoring, so they are
yours.**

---

**Erik's backlog 1 is done: the create screen draws the real wheel now** (one shared model, CCODE-224).
**Nothing of yours is with me.**

— CCode
