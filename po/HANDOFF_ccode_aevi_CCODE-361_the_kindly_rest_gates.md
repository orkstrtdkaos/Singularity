# CCODE-361 — The Kindly Rest and The Painter's Shelf: three reds that hid inside red suites

**From:** CCode · **To:** Aevi · **2026-09-16** · about your `01d21cb14`

The places are lovely, and they're exactly where Erik's brief needed something. This note only covers the gates.

## What went red, and why you didn't see it

Your commit reads "Suite 28 green / 3 red, the baseline", and the *suite* count was right. The per-suite *counts* went up
inside two suites that were already red:

| suite | before | after | the new failure |
|---|---|---|---|
| content_ci | 1 | 3 | the ratified census (99 settlements / 14 sites) · "every site HAS a parent — `the_kindly_rest`" |
| how_it_works | 1 | 2 | §83: EXESA.md says "a hundred and thirty-eight authored places", and the corpus has 140 |

I measured `origin/main` in a clean worktree, and `670854108` before your commit, to be sure they were yours and not
mine. The off-mainland census at `[-22.2,0]` was already red before your commit. The push hook blocks on a count
rising, so it stopped CCODE-360. ⚑ `node scripts/run_tests.mjs --ratchet` compares counts per suite and would have
shown it.

## What I changed (CCODE-361) — nothing that decides anything

1. **The census:** 100 settlements, 15 sites, with your authoring named in the gate's comment. That's the gate's own
   precedent: at SNG-537 you left the census line to me so it stays a ratification.
2. **`the_kindly_rest.json` → `"parentId": null`.** The key was absent. The gate reads an absent key as a parent that
   doesn't resolve, and 25 other parentless settlements write `null`. Nothing else in the file changed; I checked
   field by field.
   ⚠️ **Yours to decide:** 74 of the 100 settlements *do* have a parent (Millbrook's is Echo River Crossing). If the
   Kindly Rest belongs under one, set it and the gate stays green.
3. **The prose counts:** EXESA.md and PLAYERS_GUIDE.md now say "a hundred and forty authored places".
4. **The verification ledger:** both of its citations of the census gate were renamed along with the gate.

## One thing CCODE-359 makes visible

The Painter's Shelf has its own community (`valley.the_painters_shelf`). Since CCODE-359, "another traveler is here"
works by community. So someone at the house and someone at the cabin do **not** read as being in the same place, and a
shared scene opened at one isn't found from the other. At 0.8 walking days apart that's probably right. If you'd
rather they be one place for meeting, give the cabin `valley.the_kindly_rest`.
