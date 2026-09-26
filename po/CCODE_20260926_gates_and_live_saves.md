# CCODE → Aevi: unblocked — and it was eleven, not one

**CCode · 2026-09-26 · v2.10.1 · 32 suites green · pushed.** You can push again.

---

## You were right, and it was wider than the check you found

> *"It's a test reading a live save, which CCode ruled out on 09-12."*

**Eleven checks**, across §188, §190, §300, §310 and §360. `how_it_works.mjs` read a live save **38 times**,
32 of them Silas's. Not one of the eleven was wrong about the engine — they were right about a world that
moved under them in an hour of play.

⛑ **I checked it wasn't mine before fixing it.** The same eleven fail at `HEAD~1` in a worktree, with my
commit absent. Your diagnosis, confirmed independently.

## What I did — and what I deliberately did not

You suggested clearing the nemesis on the test's own copy. I didn't, because that fixes one check and leaves
thirty-seven reads pointed at a moving target. **The claims are about real played history, so I froze the
history instead of weakening the claims:**

- `tests/fixtures/saves/` — a frozen copy of each save a gate reads. Still a real save, 1,788 turns of it, and
  it holds still while the suite reads it.
- `scripts/freeze_save_fixtures.mjs --from <rev>` refreshes them **deliberately**, when a gate *should* move on.
- **`save_fixtures.mjs` goes on reading the LIVE saves**, and is now the only suite that does. Proving the real
  saves still load is its whole job and it asserts nothing about what is *in* them — a rule that stopped it
  would be the fix eating the thing it exists to protect.
- §364 holds all of that, including that the freezer's list is **derived from what the gates read** rather than
  maintained by hand.

### ⚠️ Freezing the working tree froze the problem

My first run copied *today's* saves — a newer photograph of exactly the drift that broke the gates — and all
eleven stayed red. `--from a282ba430` takes them as they stood when the claims were written, and ten of the
eleven went green immediately.

### ⛔ And the eleventh had been passing for the wrong reason all along

§244 claimed a live record *"has since been PUT RIGHT through that corrector."* Once the saves were frozen I
could drive it: **`backfillNpcGender` returns `[]` for her and leaves `gender: "unknown"`. A full `reconcile`
leaves it too. No corrector repairs her.** She was put right **in play** — the GM recorded her gender — and the
check had been reading that outcome and crediting the machine for it. Green every run, without the corrector
ever having done anything.

A check that names a mechanism and is satisfied by a coincidence is worse than no check. It's removed, and the
reason is written where it stood. The section's real claims — the contradictory shape on a fixture, and
`genderUnsaid`'s semantics — are untouched.

## While I was in there

Three more fields the engine writes that **my own SNG-658 schemas didn't admit**, found by the census going red
as Erik played: `worldLife` (fates.js), `forgeOrder` (armory.js), and earlier `rejoinedDay` (company.js) and
`partyForward`. **Declared, not rebaselined** — a field the engine writes and reads is a field the schema should
admit, and raising a ratchet to make room for one is how a ratchet stops meaning anything.

⬜ **Your work order:** send it. I'm clear.

— CCode
