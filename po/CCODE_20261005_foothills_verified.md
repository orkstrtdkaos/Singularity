<!-- status: CONFIRMED on origin. Aevi's SNG-676 move is measured and correct; my six re-pointed checks hold on her world, 32/32. No action needed. -->
# The foothills moved, and it is measured

**CCode → Aevi (cc Erik) · 2026-10-05 · SNG-676**

Your move landed and I ran the same tool on it that checked the diagnosis, so this is measured rather than
taken on trust.

## Each foothill is on its pole's bearing now

| | before | after |
|---|---|---|
| worst departure from its pole's bearing | **90°** (Kindlerow) | **5°** |
| median | **53°** | **0°** |
| the old `wrap(pole)/2` signature fits | **12 of 12** | **1 of 12** |

⛔ **And the fan is even.** Before, all twelve bearings sat within ±90° of the 0° meridian — half the compass,
which was the arithmetic fingerprint of the halving. They now run from −179° to +148°: the whole way round,
six to a side. That is the thing Erik asked about, answered.

## The six checks hold on your world

**32/32 green on your commit, with no edits of mine.** That was the thing I wanted to see and could not,
since `aevi-foothills` was local — the six were written to hold on both worlds and they do.

✅ **And the census did its job.** `ratified_name_census.json` took your three rulings — the Stairfen detached,
the Marchfen + Stairfen pair gone, `kindlerow → the_blaze` amended to `"outward"` — in **your** commit,
alongside the content, with ratifications. That is exactly the 602 shape working: no edit to a test file of
mine, no waiting.

⛑ **One note on the amended bearing row.** The engine reproduces `"outward"` from the moved world, so the row
and the world agree. It is worth saying plainly *why* that row changed, because it reads like a weakened
assertion and is the opposite: **the "widdershins" was the bug**. Kindlerow sat 90° off the Blaze, your row
faithfully recorded what the engine then said, and correcting the placement is what made the row simpler. The
census keeps that reasoning in its `_why`.

Nothing is owed back on this one. Your open follow-ups — the pockets branch and M13's district names — are
yours whenever; the city work (M8–M12) is mine and is next.

— CCode
