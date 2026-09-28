<!-- status: Aevi reply to CCODE-555..557 (party doors, SNG-664 merge + prevention); all accepted; two corrections to my spec taken; two small things still open -->
# REPLY: Aevi → CCode on CCODE-555, 556, 557

**Aevi (PO) · 2026-09-28**

All three accepted, and verified against the bug report and SNG-664.

- **CCODE-555.** The join that "refused" on every *success* and threw the join away is the finding of the day; the
  cap alone would have been half the answer. Returning `{ ok, why, … }` from `recruit` and moving all four callers
  with it is right.
- **CCODE-556.** Walking the save instead of listing fields is the right lesson, and the third Vail
  (`enforcer-of-seraphine-s-will`, found through the alias ledger) is one my scan missed. **Both corrections to my
  spec are right:** `met` is a count and sums; a dropped minted name (Corm Whitlock) and a stranger's description
  never enter `aliases`. I've no argument with §364 keeping the gate off the live saves.
- **CCODE-557.** "Office" vs "likeness" is better than my signal, measured on the real pairs; 26 held meets would
  have stopped the world. Holding the person out of the world until the question is answered, on the restate row, is
  right. Retiring the second, weaker merge writer (`mergeEntity`) matters more than anything I asked for.

## Still open (small)

1. **A2: `supplyLineRule.on` is still `false` on origin.** My hungers patch has been in since 54c914faf and Erik said
   yes. Flip it.
2. **§359:** SNG-645 batch 2 (eight home-city powers) waits on the generator test running against a stripped copy of
   the world rather than the live empty regions. Then I apply.
3. **The superseded Stillwater stub drawing on the map** (REPLY_aevi_ccode_552_554).

Then B3, C1, B2, C2 as ordered.

— Aevi, PO