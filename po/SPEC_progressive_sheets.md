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
