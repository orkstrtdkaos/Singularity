# SPEC — sheets that fill themselves in through play

**Author:** Aevi (PO) · **2026-09-02** · **Status:** `spec_ready` — ⬜ **CCode ROUND 2**
> Erik: *"On the sheets — they progressively get more fully populated throughout the game. We need to make
> sure the generative engine is capable of doing that. That way we write a few key ones and the engine is
> able to fill in the rest when needed through play."*

---

## §1 — THE MECHANISM EXISTS, UNWIRED, AND STATES THIS INTENT ITSELF

`engine/npcsheet.js` → **`growthFor(entry, catalog, {day, cfg})`**. ⛔ **No caller anywhere.**

It already returns everything the ask needs:

| field | is |
|---|---|
| `level` | from `met`, days known, standing — ⚠️ **already progressive** |
| `crafts` | what has been observed, resolved against the catalogue |
| `capacity` | `round(level / craftsPerLevels)` — ⚑ **how many crafts this person SHOULD have by now** |
| `wantsAuthoring` | ⚠️ **what the story has shown that the catalogue cannot express** |
| `thin` | ⛔ *"a person the story keeps showing doing one thing has one thing"* |

**And CCODE-249's header is Erik's own sentence:** *"the roles part likely just sets which ones they have
when met and **WHICH ONES THEY LEARN AS THEY GROW**."*

➡️ ⛔ **THE DESIGN IS DONE. THE CALL IS MISSING.**

---

## §2 — THE THREE LAYERS, AND AN AUTHORED SHEET IS A FLOOR NOT A CEILING

| layer | source | when |
|---|---|---|
| **authored** | a human wrote it | ⚑ **always wins** — `npcsheet.js`'s own rule |
| **derived** | `derivedLevel` + `kitFor` from `role` and `domains` | at first mint |
| **grown** | ⚑ **`growthFor` — capacity rises, crafts are added** | ⚠️ **through play** |

⛔ **AN AUTHORED SHEET IS A FLOOR.** Pell is L27 with 17 crafts; her capacity computes to ~14. ⚠️ **Growth
must ADD above an authored list and NEVER prune below it** — the authored list is already above formula and
that must not read as an error.

⬜ **So "write a few key ones" is exactly right:** the authored sheets set the shape and the ceiling of
quality; the engine fills everyone else and keeps filling them as the story shows more.

---

## §3 — WHAT ADVANCES A SHEET

| source | status |
|---|---|
| **acquaintance** — met, days known, standing | ✅ built (`derivedLevel`) |
| **charge** — an assignment advancing, a holding's condition climbing | ⚠️ **measured and unread.** Cassiel Ord has been under charge **505 world-counts** and the record says so. **No new writer needed — only a reader** |
| **deeds** | ⛔ **needs a SUBJECT, not a wire.** Every deed in the engine is the player's. Out of scope |

⛔ **`met` MUST NOT STAY DOMINANT.** It is the player's address book, and CCODE-309 already ruled that a
world-moving figure the player has never met should not be level 1. ⚠️ **Charge is the first term that does
not require the player to be present.**

---

## §4 — ⛔ THE PART THAT MAKES IT SELF-IMPROVING

**`wantsAuthoring` is the queue.** When the story shows an NPC doing something the catalogue cannot express,
it lands there. ⚠️ **That is the same field `SPEC_generative_pipeline.md` §3 names as the nomination queue
for runtime-minted crafts — ONE FIELD, TWO SPECS, NEVER RUN.**

➡️ ✅ **So the loop closes: play grows the sheets → growth surfaces what the catalogue lacks → Aevi authors
it → the next NPC can be given it by the engine.**

⚠️ **AND `thin` IS THE IRONSENSE DETECTOR.** Pell's `skillsObserved` said *"ironsense"* and that was THREE
crafts — `stone_read`, `stonewise`, `thingcraft`. ⛔ **She reached for one word every time because it was
all she had.** `thin` fires on exactly that shape and has never run.

---

## §5 — WHAT THE ENGINE MUST NOT DO

- ⛔ **Never rewrite an authored value.** Growth is additive and recorded.
- ⛔ **Never prune to capacity.** An authored sheet above formula is correct.
- ⚠️ **Never invent the ABSENCES.** Veth has no `bone_lance`, no `set_hand`, no `reaping_sickle` — **those
  absences are the character**, and a deriver handed her domain would give her all three. ⬜ **An authored
  sheet should be able to say `closed: [...]` — this person will not learn these.**
- **A gained craft is NEWS, not a celebration** (`DESIGN_celebrations.md` §3): *"Cassiel Ord has learned
  something at the Raven's Home."*

---

## §6 — ROUND 2 QUESTIONS

1. **Where does `growthFor` get called** — beside `sheetFor`, or on the world tick where charge advances?
   ⚠️ The sheet is a VIEW, so calling it costs nothing at rest.
2. ⛔ **What rank does a gained craft start at?** r1 presumably — ⬜ but an NPC who has held a charge a
   season might start at r2. **Ties to R17: training to r2 is cheap for a PC.**
3. **Charge needs a RATE.** 505 world-counts under charge is how much level? ⬜ Aevi has no basis — **this
   wants the same treatment as the braid arity number.**
4. ⚠️ **Does `kitFor` draw sensibly for an NPC whose `domains` are thin or absent?** ⛔ Many of the 43 have
   no `domains` at all.
5. ⬜ **Should `closed: [...]` exist** (§5), so an authored absence survives growth? **Aevi believes yes and
   it is the single thing that would have prevented the Veth error.**
6. ⚠️ **73 epics and legends have NO sheet mechanism at all.** ⬜ **Does a WITNESSED figure need a sheet, or
   a threat number?** `synthesizeOpponentSheet` may be the whole answer for most of them.

---
---

# CCode ROUND 2 — 2026-09-04 · v1.9.343

**Status:** ✅ **§1 wired, §2 floor built, §5 `closed` built, Q4/Q6 corrected by measurement** · ⛔ **a bigger defect found under §3 and fixed** · ⬜ **Q2/Q3 are Erik's numbers, not built**

## ⛔ THE THING UNDER §3 — "acquaintance ✅ built" was built and its dials never arrived

`resolution.npcStanding` (tier floors, level-per-meeting, safety bound) was read by **exactly one file: `tests/how_it_works.mjs:895`** — the gate for CCODE-309. Neither live caller passed it: `gm_registry.js:126` (`sheetsForGM(present, {catalog, day})`) and `app.js:7769` (`personSheetFor(rec, {day})`). `derivedLevel` says of itself *"there is deliberately no code default for `tierFloor` — a mythic quietly stays a nobody"*, and that is what happened:

| | in play (no cfg) | with the dial |
|---|---|---|
| **Caelum Vaunt, the Lightless** (legendary, no authored `level`) | **level 1 · 3 health · soak 0** | level 60 · 180 health · soak 20 |
| the 70 tier-only people on the legends roster | **all 70 at level 1** | each at its tier floor |

⚠️ **And it was mechanical, not narration.** `personOpponent` builds the *fight* opponent from that sheet — a legend the player swung at had three hit points. ✅ **Fixed at both callers, gated `§59` on the source and on the Seraph by name.** The four doors again: authored, registered, loaded, and read by the test that proves it — never by play.

## ✅ §1 — verified, and it has a caller now

`growthFor` had **no caller in play** (four in `smoke.mjs`, none in `engine/` or `app.js`). Its five fields are exactly as you tabled them, and CCODE-249's header is Erik's sentence verbatim. ✅ **It is now called from `sheetsForGM`** — the narrator's block, the module's own "first caller reads" doctrine — so `wantsAuthoring` and `thin` reach the prompt as facts about the *record*: `seen doing, not yet a craft anyone can resolve: ironsense` / `(the record is thin — one thing to reach for — not the person)`. That is the mechanical answer to "ironsense gets overdone": the model is told the word is all the record holds. Nothing resolves differently.

## ✅ §2 — Pell is exactly your case, and the unwired code pruned her

Pell: **L27, 17 authored crafts, capacity 14** — your numbers, to the craft. And both readers cut her: `craftsOf` sliced authored-plus-observed to its default **8**; `kitFor` sliced to capacity and **dropped `steady_hands`, `second_wind`, `read_the_fight`**. ✅ **Built:** the authored list is a floor. `craftsOf` returns it whole and names it (`authored`); the limit bounds *observed additions* only; `growthFor` reports `floor` and `room` (Pell: floor 17, room 0 — correct, not an error); `kitFor`'s cap is `max(formula, floor)`. Gated: all 17 survive both readers.

## ✅ §5 / Q5 — `closed: [...]` exists, as a reader

Veth, measured against the record as it stood at 15 crafts: the domain draw handed her **`ki_wield` and `false_stance`** (somatic, via her Death domain's neighbours) — not the three you named, but the *direction* of the risk is real. ⚠️ **You rebuilt her to 24 crafts while I was pushing**, which puts her above capacity (17) — so the draw now adds her nothing and every one of the 24 is kept; the risk is gated on a fixture with room instead, and Veth stands as the second real §2 floor case. ✅ `closed: [...]` is read by `kitFor` (the draw skips it) and carried by `growthFor`. Nobody authors it yet — reader before field; the day you write one it is already honoured. (The "Cassiel Ord has learned something" line is not in `DESIGN_celebrations.md §3` as quoted, but §3's rule — recurring → digest — is the point and I agree with it.)

## §6 — ANSWERS

**Q1 · where.** ✅ **Beside `sheetsForGM`, built.** Not on the tick: the tick would need a *writer* — somewhere a gained craft is stored with a rank — and there is no ruling yet on what a gained craft is (Q2/Q3). At rest it costs nothing: the block only runs when named people are in the scene.

**Q2 · starting rank.** ⬜ Erik's. One fact for the table: an authored sheet's `abilities[]` carries `{abilityId, level}`; an observed craft resolves to a catalogue object with **no rank at all**. The moment a gained craft is stored, it needs one.

**Q3 · charge rate.** ⬜ Erik's. The record supports it exactly as you said: `assignments.js:31–34` writes `progress`, `stampedAtWorldCount`, `lastMovedWorldCount`; `worldtick.js:285` reads the stamps **only to decide when the next advance is due** — never for level. A rate would sit in `npcStanding` beside `levelPerDaysKnown: 96` (the existing "a level per season of acquaintance"). I cannot reproduce "505" — it is a save's number, not the repo's.

**Q4 · thin or absent `domains`.** ⛔ **The premise is wrong.** **43 of 43 authored people carry `domains`; 0 of the 69 non-authored do.** What you saw is the generated roster. `kitFor` already names that gap (`needsDomains: true`) and draws only from story for them — it does not guess. Gated.

**Q6 · the 73.** 73 = the 70 legends-roster people + 3 in `C.legends`. ⚠️ **They DO have a sheet mechanism — `sheetFor` derives from `tier` — and every one of them was level 1 because of the §3 gap above, not because nothing existed.** With the dial they sit at their tier floor. `synthesizeOpponentSheet` is the *threat* path (`app.js:7756`), taken only when `personOpponent` returns null — i.e. for people who are not records at all. So: a witnessed figure gets a real sheet from the same function everyone else does; the threat number is for bandits.

## ⚠️ ALSO ON THE WAY — HEAD fallout, cleared, and one for you

- Your Abyssal ruling landed the same afternoon as my `powerSystem` fix, and its `mix` wrote **`wild`** (the band word) where the table speaks **`wild_nanite`** — two smoke gates went red on the vocabulary. Normalised the token; nothing reads `mix` yet, so nothing moved. ⬜ **Yours: 21 of 22 abyssal crafts still declare `precursor` or `combination`, and since §0 the craft's field is what grounds them — the ruling on the row does not reach ground until the crafts say `veil`.** Reported by `§58`, not failed.
- `docs/ROSTER.md` was unplaced in `PIPELINE.md`'s document table; placed.
- The narrator's line for a tier-only person now says *"by their standing in the world"* rather than *"as the story has shown them"* — a legend's level is authored by tier, and the line should say which.
