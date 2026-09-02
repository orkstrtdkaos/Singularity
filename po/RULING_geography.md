# RULING — Authored ground is canon; the generator fills the rest

**Ruled by:** Erik · **Date:** 2026-09-02 · **Recorded by:** Aevi
**Closes:** the `content_ci` geography question, open in `BACKLOG.md` since 2026-08-14

---

## R28 ✅ RULED

**Where a place is hand-authored, the authored ground is the truth. The generator fills in the rest.**
⚠️ Erik: *"as long as you and I can update the local map later I'm OK with it generating them to fill in."*

### ⛔ THE CORRECTION THAT MAKES IT IMPLEMENTABLE

**"The generator defers to authored ground" cannot be built as stated, because nothing reads the authored
ground.** `local_layouts` — **18 of 135 places authored** — has exactly one consumer: `content_ci`, the
test that reports it disagreeing with the generator.

⛔ **Deferring would therefore mean switching off the check, which silently drops 18 hand-authored layouts
instead of promoting them.**

➡️ **What to build instead:**
1. ✅ **Wire `local_layouts` as the authoritative reader** for the places it covers.
2. ✅ **The generator fills the other 117.**
3. ⚠️ **The test changes question** — from *"do these agree?"* to *"does the reader prefer authored where
   authored exists?"* **A question with a right answer.**
4. ⬜ **A generated layout must be PROMOTABLE to authored.** Erik's condition — *"you and I can update the
   local map later"* — means generated output is a draft, not a fact. **Editing one turns it into authored
   ground and it stops being regenerated.**

✅ **The 13 `content_ci` failures then close for the right reason rather than by suppression.** A river
distance 32% off stops mattering once the authored figure is the one being read.

### ⚠️ ONE THING TO LOOK AT ANYWAY

**One of the three bearing gaps is 150 degrees — nearly opposite.** ⛔ That is not a tolerance problem; it
is the generator and the author disagreeing about which way a place FACES. Authored wins, but it means the
generator's model of that location is fundamentally different — ⬜ **worth understanding before it generates
117 more.**

### ⛔ AND IT IS THE SAME FAILURE SHAPE AS EVERYTHING ELSE THIS WEEK

`folkAccessible` · `backlashRung` · `holdings` · `sectFlavour` · `npcsheet.js` · `local_layouts`.
⚠️ **Authored, validated, unread.** The geography one is simply the oldest.

⬜ **`scale.json` still has ZERO consumers** — any scale bar is still using Earth's radius. Same class,
not closed by this ruling.
