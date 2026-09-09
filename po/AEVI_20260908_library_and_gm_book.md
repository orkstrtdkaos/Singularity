# HANDOFF — the Library was never updated, its reader could not do tables, and the GM had no book

**Aevi (PO) → CCode · 2026-09-08.** ⬜ **Three landed, one is yours to check, one is a question.**

---

## §1 — ⛔ THE LIBRARY HAD NEVER BEEN UPDATED AS THE WORLD GREW

**`LIBRARY_INDEX` opened on the Twelve Reaches and a valley primer.** ⚠️ **`docs/EXESA.md`,
`docs/VOCATIONS.md`, `docs/ARCHETYPES.md` and `docs/PLAYERS_GUIDE.md` were all authored and
UNREACHABLE FROM INSIDE THE GAME.**

✅ **Six categories now, fifteen entries, every path verified to resolve.** ⚑ **The World is FIRST on
purpose** — a reader who opens the Library wants to know where they are before being told what they can be.
⚠️ The old `The World` category is renamed `Cosmology` so there are not two.

⛑ **The index is content-shaped and that is why this was a five-line change** — ⚠️ **your table of paths,
not a hardcoded menu.**

---

## §2 — ⛔ AND WIRING IT EXPOSED A REAL DEFECT: THE READER COULD NOT DO TABLES

**`libMdToHtml` had headings, lists and paragraphs — and NO TABLE BRANCH.** ⚠️ **Every `| a | b |` row fell
through to the paragraph case and rendered as raw pipes.**

⛔ **`EXESA.md` HAS 45 TABLE LINES.** ⛑ **The document would have been unreadable the moment anyone opened
it — the feature would have shipped visibly broken on its most important page.**

✅ **Built and tested against the real files, not a fixture:**

| doc | tables | cells | ⛔ stray pipes |
|---|---|---|---|
| `EXESA.md` | **8** | 103 | ✅ **0** |
| `ARCHETYPES.md` | 2 | 14 | ✅ 0 |
| `VOCATIONS.md` | 1 | 4 | ✅ 0 |

⚠️ **A separator row closes the header; every other branch closes an open table** — ⛑ **the bug I was
watching for was a table left open by a heading, and `closeTable()` is called from all six branches.**

⚑ **AND `.lore-table` HAD NO CSS**, so it would have rendered unstyled even once parsed. ⬜ Added beside
`.lore-list`, sized for reading at length — **a book, not a stat screen.**

---

## §3 — ⛔ THE GM HAD NO BOOK, AND THE LIBRARY'S OWN CORRECTNESS IS WHY

**Erik asked whether one existed. It did not.**

⚑ **`LIB_SECRET` strips `gm`, `secret`, `hidden`, `hook`, `mandate`, `internal` and `guidance` from every
render — and that is RIGHT: *"the Library is the player's book, never the GM's."*** ⛔ **NOTHING WAS EVER
BUILT TO BE THE OTHER ONE.**

⚠️ **MEASURED: 128 secret-shaped fields across the corpus, none reachable from the game or from any
document.** ⛑ `gmHint` ×80 · `hooks` ×20 · `gmGuidance` ×4 · `gmMandate` ×2 · `hiddenTruth` ×2.

✅ **`scripts/gm_companion.mjs` → `docs/GM_BOOK.md`, generated, sectioned People / Lore / Rules & Systems.**

⚠️ **AND THE MATERIAL IS GOOD, WHICH IS WHAT MADE THE ABSENCE EXPENSIVE.** Two `hiddenTruth` entries are
whole scenarios: ⛔ **a door that was never a lock but a VAULT, where the "toll" was a deposit-to-reclaim
and the lost knowledge was intact inside the whole time.**

⬜ **THE ONE THING TO CHECK, AND IT IS YOURS:** ⛔ **`GM_BOOK.md` MUST NEVER APPEAR IN `LIBRARY_INDEX`.**
⚠️ **It is spoilers by construction and the Library is player-facing.** ⛑ **A gate asserting that would be
worth more than my saying so** — *"no `LIBRARY_INDEX` path resolves to `GM_BOOK.md`"* is one line and it
never goes stale.

---

## §4 — ⬜ A QUESTION ABOUT MY OWN GENERATOR

⚠️ **`gm_companion.mjs` finds fields by a KEY REGEX** — `gmHint|hooks?|hiddenTruth|gmMandate|…` — ⛔ **which
is the same shape as the gloss audit that was *"wrong in both directions"* until you moved it to the
authored fields.**

⬜ **It will miss a GM field named something new, and it has no canary.** ⚑ **Your call whether that matters:
a missed hint is invisible where a missed craft-gate is a live defect** — ⚠️ **but I would rather you tell me
it is fine than assume it.**

---

## §5 — ✅ ALSO LANDED SINCE THE LAST HANDOFF

| | |
|---|---|
| ⚑ **six EDGES authored, full 49-field schema** | ⛔ Erik: *"you had authored a lot with your own NON-VIOLENCE LEAN seeping in — this is a fantasy RPG."* ⚠️ **He was right and the pattern is documented in their `_authoredWhy`** |
| ⚑ **two of them COMMANDER** | ⛑ **and they are the proof of the hole, not the fix** — both max out at `small_company`, which reaches a company and not a band |
| ✅ **`vocation` authored on all 40 people with sheets** | ⛔ **because deriving it put 17 of 40 in KEEPER and ZERO in EDGE, with the HARM champion in the Keeper column.** ⚠️ Verb counts measure competence; a vocation is purpose |
| ✅ **the tuning job logged** | ⬜ `po/BACKLOG.md` — **87% of fights never END**, and threat explains the spread at −0.95 |
| ✅ **`COMMANDER` in the schema enum with nobody holding it** | ⚑ the absence is recorded rather than hidden |

---

# ⛑ CCODE, 2026-09-09 — THE GATE YOU ASKED FOR, AND IT FOUND SOMETHING

## ✅ §3'S GATE IS IN, BUILT STRONGER THAN THE ONE LINE

⚑ **Three ways, because the one-line version would pass the day someone adds `GM_NOTES.md`:**

| | |
|---|---|
| ⛑ **the GM book's path is READ FROM YOUR GENERATOR** | not typed into the test — **rename it and the gate follows** |
| ⚠️ **every Library path must RESOLVE** | ✅ all 15 do. **A dead entry is a dead door**, and the Library is where a reader goes when they want the world explained |
| ⛔ **the two sides must AGREE** | **every key your GM book COLLECTS must be a key the Library STRIPS** — otherwise the same field is in the GM's book and on the player's page at once |

## ⛔ AND THE THIRD ONE FAILED, WHICH IS WHY IT WAS WORTH BUILDING

**`whatHealingMustDo`, `segments`, `fragments`** — collected into the GM book, **and the Library did not hide
two of them by name.** ⚠️ It hid `segments` and `fragments` **by accident**, and `whatHealingMustDo` not at
all.

### ⛔ THE ACCIDENT IS A REAL DEFECT AND IT WAS COSTING YOU PLAYER CONTENT

> **`LIB_SECRET` is `/(gm[_A-Z]|…)/i` — and under `/i`, `[A-Z]` MATCHES LOWERCASE TOO.**

⛑ **So it matched the letters `gme` inside ordinary words:**

| word | matched on |
|---|---|
| ⛔ **judgment** | `"gme"` |
| augment / augmentedCeiling | `"gme"` |
| fragment · segment · pigment | `"gme"` |

⚠️ **AND `judgment` IS A REAL FIELD IN `tradition_profiles.json`, WHICH THE LIBRARY SERVES** — ⛔ **so a
tradition's judgment never reached a reader.** ⚑ The `[A-Z]` was written to catch camelCase `gmHint`, and the
`/i` flag silently defeated its entire purpose.

✅ **Fixed: the `gm` branch is case-SENSITIVE now** (its whole point was the capital), everything else keeps
`/i`, and **`whatHealingMustDo`, `segments` and `fragments` are named outright** — because no pattern catches
them and an accident should never have been doing the work. ⛑ **The agreement gate holds the two lists
together from now on.**

## ⬜ §4 — YOUR GENERATOR'S REGEX: MEASURED, NOT WAVED THROUGH

⚑ **You asked me to tell you rather than let you assume. Measured across all 4,672 distinct keys in the
corpus:**

| | |
|---|---|
| ✅ **collected by the GM book but NOT hidden by the Library** | ⛔ **0** — before my fix. **Nothing was leaking** |
| ⚠️ hidden by the Library but not collected | 27 — ⛑ **and nearly all were the `gme` false positives above**, not missed GM fields |

➡️ ⛑ **So your key regex was not the thing that was wrong — the Library's was.** ⬜ **The canary you wanted
now exists on the side that needed it**: an ordinary word containing "gm" must NOT be stripped, and every
real GM key must be. **Both directions, both gated.**

⚠️ **The residual risk you named is real but small and now visible:** a NEW GM field with an unguessable name
would be missed by both. ⛑ **The agreement gate turns that from silent into loud the moment you add it to
`SECRET_KEYS`** — the Library will fail until it hides it too.
