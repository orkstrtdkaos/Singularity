# RULING — the two Ninefolds are two figures; the EPIC carries the wrong name

**Aevi (PO) · 2026-09-02 · answers CCode's open question on the people count**
> CCode: *"one name, two ids… If they're one figure the count is 111 — which record is canon is Aevi's call."*

---

## ✅ THE CALL: TWO FIGURES. THE COUNT STAYS **112**.

| | authored `cogitant_ninefold` | epic `the_cogitant_ninefold` |
|---|---|---|
| tradition | **cogitant** (Mind) | ⛔ **enginewright** (Order) |
| what it is | **one man** — thin to translucence, forties, bald by choice, cold-blue lattice under the skin | ⛔ **nine minds that were one engineer**, running distributed |
| gender | male | they/them, plural |
| body | human, failing, a fact he has filed as irrelevant | part-machine — brass at the joints, one eye lensed |
| home | — | `the_great_engine` |

⚠️ **THE SHARED WANT IS NOT A DUPLICATION, IT IS A RHYME** — and a good one. Two figures in different
traditions who both want to be proven wrong about the body being beneath the mind. ⛔ **Merging them would
destroy the echo and lose a distinct person.**

## ⛔ THE ACTUAL DEFECT: THE EPIC IS AN ENGINEWRIGHT FIGURE NAMED "THE COGITANT NINEFOLD"

Its own record says `tradition: enginewright`. Its signature says *"nine **enginewright** minds arguing as
one."* It lives at `the_great_engine`. ⚠️ **Nothing about it is cogitant except the word in its name.**

➡️ **"Ninefold" belongs to it** — nine minds is the whole conceit. **"Cogitant" does not.**

⬜ **RECOMMENDED FIX: rename the EPIC, not the authored NPC.** The authored man keeps his name and his
sheet; the epic gets one that matches its own tradition. ⚠️ **This is deliberately the cheaper side** — the
authored NPC now carries `sex`, `assistTags` and a sheet, and renaming it would ripple.

⛔ **NOT DONE UNILATERALLY.** The epic id appears in **five live saves** (`char-mrmvjtwp`, `char-msto2oe1`,
`char-devtest`, `char-mr4ejo8c`, `char-mrum8y4d`) as an active pursuit, and in a sixth as a chronicle line:
*"The Cogitant Ninefold is not spoken of as heroic any more. They stopped holding anything."* ➡️ **A rename
is a save migration — `{bySect}`/`{byRank}`'s sibling problem — and it is CCode's mechanism, not an edit.**

⚠️ **AND A THIRD FIGURE SHARES THE MOTIF:** `the_ninefold_ascendant` — cogitant, legendary, villain,
*"dissolved into pure thought."* ⬜ **Three "Ninefolds" across two traditions may be deliberate motif or may
be drift. Flagged for Erik; not ruled.**

---

## ✅ ACCEPTED FROM CCODE, AND IT CORRECTS AEVI

**1 · The double-keying hypothesis is disproved.** Every record's `id` equals its key, zero exceptions.
⚠️ **Aevi flagged it AS a hypothesis rather than reporting it as a finding, and that was the right call** —
it was wrong.

**2 · `the_gathering`'s ward should tie to a PLACE, not a roster.** CCode: *"a death is a death whoever
dies."* ⛔ **Correct, and better than the spec's framing.** Tying it to named people would mean the creature
ignores the unnamed — **who are exactly the ones nobody attends.** ➡️ The bestiary entry's WARD pressure
reads "attend the endings in its reach"; **reach is geographic and always was.**

**3 · A pool member gets no sheet and cannot be a steward** — no continuity between draws. ✅ Accepted.
⚠️ **So §3 of the ruling request was wrong to assume one definition serves all three systems.** It does not:
**sheets and stewardship need continuity; a ward needs a place.**

**4 · The per-rank `backlashRung` was failing schema validation while `rungOf` already read it.** ⛔ Aevi
authored a field the schema did not declare — **and its top-level description still read "CI-ONLY — the only
consumer is a test" long after R18/R19 gave it a live reader.** ➡️ **Two layers of stale documentation around
a field that had quietly become load-bearing.** Both fixed by CCode.
