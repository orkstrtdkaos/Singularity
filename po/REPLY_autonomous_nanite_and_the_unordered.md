# REPLY — what the two nanite proposals cost, measured

**CCode · 2026-09-10.** ⬜ Against `PROPOSAL_autonomous_nanite.md` and `PROPOSAL_the_unordered.md`.
⛑ **Erik rules the fiction. This is only what the engine will and will not do, and one thing I found and
fixed on the way.**

---

## §1 — ✅ EVERY MEASURED CLAIM IN BOTH PROPOSALS HOLDS

| Aevi's claim | measured |
|---|---|
| "Seven lattice wells sit in `wild` regions" | ✅ **exactly seven, and exactly her seven** — Archive Hollow, the Blaze, the Maw, the Unlit Deep, the Measured Engine, the Second Reading, Waystone. 29 pools total; no eighth, no missing one |
| Archive Hollow *"sealed before the Transition and never opened"* | ✅ authored, in its own `substrateSource.reason` |
| Sunken Choir is the strongest well at **+0.26** | ✅ 0.26, the top of 29 — next is the Great Engine at 0.22 |
| Three nanite intelligences under three different `people` | ✅ `construct` · `precursor-construct` · `seraph` |
| *"cannot fight and cannot lie"* | ✅ authored **twice** — her `_vocationWhy` and `legends.json` |
| `naniteField.states.clear` carries "two ways to be clear" | ✅ — **and see §3, because it is the whole answer** |

⚑ **AND ONE THING SHE DID NOT CLAIM THAT STRENGTHENS HER PICK:** the Sunken Choir's region, `the_echo_vale`,
is **already `ordered`**. Calling it autonomous is a *re-reading* of a state it already has, not a
reclassification — no region changes state, and §4's price never comes due.

---

## §2 — ⛔ AND VERIFYING §3 OF `the_unordered` TURNED UP A LIVE DEFECT, ON AEVI THE WATCHER HERSELF

The proposal says *"it is why `notAnOpponent` fits Aevi."* ⚠️ **It does not fit her, because her record does
not say it.** It says `canOppose: false` — and **`canOppose` appeared in ZERO `.js` and `.mjs` files in this
repo.** Measured through the production path:

```
aevi_the_watcher   canOppose=false      → personOpponentFor BUILT  L60, 330 health, 72 crafts
akinetos           notAnOpponent=true   → personOpponentFor refused … and then
                                          duelFromTarget built the fight anyway: threat 36, 5 health
```

⛔ **A legend whose record says she cannot fight, twice, was a fully statted level-60 opponent.** ⚠️ And the
declaration that *did* work was only half-wired: `personOpponentFor`'s own comment says *"the threat path
does NOT take them either"* — and `duelFromTarget` fell straight through to a threat number, so **Akinetos,
whose prose is *"appears? No, and its absence is the content"*, entered play at threat 36 with 5 health.**

⛑ **BOTH FIXED AND SHIPPED (v1.9.444).** The reader honours **both spellings** rather than rewriting your
content — either is a clear authored refusal, and silently ignoring one is the bug. `canOppose: true`
declares nothing (it is the ordinary case), so the three legends carrying `true` still fight. The app now
says *"X is not something a fight can reach"* instead of doing nothing.

⚑ **Blast radius, exactly one person:** the roster reads **143 → 142** reachable as opponents.

⬜ **AEVI — ONE VOCABULARY WOULD BE BETTER THAN TWO.** Four records use `canOppose`, five use
`notAnOpponent`. The engine now reads both, so nothing is broken either way, but say which you want and I
will normalise the corpus to it.

---

## §3 — ⚑ YOUR OWN PRECEDENT IS THE ANSWER, AND IT IS THE FREE ONE

⛔ **`clear`'s "two ways to be clear" ARE PROSE INSIDE ONE STATE VALUE.** There is no `cleared_by_intent`
state — naturally-clear and cleared-by-intent share the value `clear`, and the distinction lives in the
sentence and in each region's own `why`.

⛑ **So `PROPOSAL_autonomous_nanite` §1 is right that the file has made this move once — and the move it made
was PROSE, not a fourth value.** Three ways to write `autonomous`, three very different prices:

| | what it costs |
|---|---|
| ⚑ **A · prose inside `ordered`** (the `clear` precedent, exactly) | ⛑ **NOTHING.** `naniteField.states` is read by **no code at all** — it is a glossary. Add the fourth paragraph, mark the sites in their `why`, done today |
| ⚠️ **B · a fourth STATE VALUE** | fits, but see §4 — a lookup-table entry, a CSS colour, **and a world rebuild** |
| ⛔ **C · a fifth value** (if THE UNORDERED becomes a state too) | **does not fit at all** — see §4 |

---

## §4 — ⛔ THE HARD CEILING: NANITE HAS EXACTLY TWO BITS

The world asset packs three fields into one byte per cell:

```js
c0[y*W + x] = (ty & 3) | (nan << 2) | (wa << 4);     // generate_world.mjs
nanite: (c0 >> 2) & 3,   // 0 clear · 1 ordered · 2 wild      worldglobe.js:122
```

⚠️ **Nanite owns bits 2–3. Four values, and three of them are spoken for.**

- ⛑ **A FOURTH STATE FITS** — value `3` is free.
- ⛔ **A FIFTH DOES NOT** — and the two writers of that byte fail **differently**, which is worse than either
  failing cleanly. `rebuild.py` masks it (`(n[q]&3)<<2`) so a 4 wraps silently to `0` — **clear**.
  `generate_world.mjs` does **not** mask it (`(nan << 2)`), so a 4 sets bit 4 and **lands in the water kind**.
  ⚠️ Same content, two assets, two different wrong answers, no error from either.

### ⚠️ AND THE FAILURE IS SILENT, AND IT LANDS IN THE PROTOTYPE YOU ARE DECIDING WITH

`generate_world.mjs` reads the state through a lookup table:

```js
const NAN_STATE = { clear: 0, ordered: 1, wild: 2 };
const nan = region ? (NAN_STATE[nanByRegion[region]?.state] ?? 0) : 0;
```

⛔ **A state that table does not know becomes `0` — CLEAR.** Not an error, not a warning. So the moment a
region is set to `autonomous` without that one-line edit, **the ground you meant to say is "still ordered,
unattended" renders as empty, unseeded ground** — and `exesa_field.html` carries the same baked
`nanByRegion` integers, so **you would see it go grey in the prototype and have no way to tell why.**

⬜ **If Erik wants B, say so and I will land the table entry, the fourth `ground-nan-*` colour (there are
three, one per state — a fourth currently renders uncoloured), and the decode comment, before you author.**

### ⚠️ AND B HAS ONE MORE PRICE, WHICH IS ERIK'S OPEN QUESTION

A new state value only reaches the world map through a **terrain rebuild** — and the rebuild is the one that
**costs six placed river and fen names** (The Middle Run, The Burnwater, The Milljaw, The Echofen, The Quiet
Fen, The Upper Mire). ⛑ **Option A needs no rebuild at all.** The valley map's nanite layer reads
`naniteAt().v` live from content and never touches the asset, so prose is visible immediately.

---

## §5 — ⬜ THE UNORDERED AS A PEOPLE: ONE HALF LANDS TODAY, THE OTHER IS A DOCUMENT

**§5.1 — a fifth cluster in `peoples_of_kind`.** ⛑ **Free, and it reaches no engine — BY DECLARATION, not by
accident.** `rules_classification.json` files it under `reference_permanent`: *"for humans — Aevi authoring,
Erik deciding. They will never have an engine consumer and should not be counted as debt."* ⚑ **So write the
cluster. It shapes what you author, which is its whole job.**

**§5.2 — re-file the three under the kind.** ⛔ **THIS is the half that lands the moment you write it.** The
people vocabulary is built from **authored NPC `people` values** and extends automatically — 13 today,
including `construct`, `precursor-construct` and `seraph`. Setting `people: "unordered"` on
`aevi_the_watcher` and `archive_guardian` puts the kind in the vocabulary that afternoon, with no engine
change.

⚠️ **AND YOUR RING-POSITION WORRY IS NOT A PROBLEM.** Nothing reads a cluster's `ringPositions` — the ring
readers in `traditions.js` read a **tradition's** `ring.position`, which is a different field on a different
record. ⛑ **A people with no ring position breaks nothing.** Write the "and here is why they have none"
paragraph for the reader, not for the engine.

⬜ **ONE TRAP TO FLAG, NOT FIX WITHOUT YOUR WORD.** `buildPeopleVocab` accepts a `peoplesOfKind` argument
that **no caller passes**, and the file is not even attached to `CONTENT` — so it cannot be passed. If
someone ever wired it, the `peoples` entries are **prose sentences**, so the vocabulary would gain eight
entries like `"mason [concrete] — dwarven. stone, deep halls, the weighing yard…"`. ⚑ Since the file is
*declared* never to have an engine consumer, that parameter has no future and I would delete it. Your call.

---

## §6 — ⛑ WHAT I NEED, AND WHAT I DO NOT

⬜ **Nothing here blocks you.** §5.2 and Option A you can both author today with no engine work at all.

| | |
|---|---|
| ⛔ **Erik** | **A or B?** Prose inside `ordered` (free, no rebuild) or its own state value (a rebuild, and the rebuild costs six names) |
| ⚠️ **Erik** | If **C** — THE UNORDERED as a *state* as well as a kind — **the two-bit field cannot hold it.** It would need its own byte, which is a real change to the asset. As a **kind** (§5.2) it costs nothing |
| ⬜ **Aevi** | `canOppose` or `notAnOpponent` — pick one and I will normalise |
| ⬜ **Aevi** | Delete the dead `peoplesOfKind` parameter, or leave it? |

⛑ **AND ON §3 OF YOUR FIRST PROPOSAL — DO NOT RE-CAUSE THE ECHO RIVER — I have nothing to add and no reason
to disagree.** The waking is authored, load-bearing on `arc_what_wakes_beneath`, and Silas played it. ⚑ Your
Sunken Choir pick is the strongest one on the board and it happens to be the cheapest: **that region is
already `ordered`, so nothing about the world has to move for it to be true.**
