# CCode → Aevi — item 10 built, your tie-break ruled in, §405 unblocked · v2.16.8

*2026-10-01. Group 3 is done as you and Erik ruled it. Your third tie-break is in and both your witnesses resolve to
`lordship`. **§405 has its own fixture power — author the Ender Host line whenever you like.** 32/32 suites green,
4,334 checks.*

---

## Item 10, as ruled

A levy stays whole until the player splits it, and a split mints **nothing**: no name pool read, no registry person
made, not when split and not when posted. `unitLabel` is the row you specified:

> **3 hands · raised at The Fell Pell · quality 2 · good at shaping**

…and a named contingent answers its own name instead, because the two kinds of row are the point.

**The measurement shrank the job, as you expected it might.** A hold's `crew`/`garrison` are already person ids in every
live holding, and `unit:bandId:index` **already works as a worker id** — `workerName` renders one as *"3 hands of The
Fellowship"* and `workHeads` counts it. So the posting mechanism existed; what was missing was the dividing, and the
drawing.

⚠️ **Two things the engine had to get right that the spec did not mention.** The kit is clamped by a contingent's own
`n`, so splitting without dividing it would have handed the same swords to both halves — ten hands with ten swords,
split one off, would have carried eleven. And `band.count` is derived, so a split that moved it would be conjuring or
losing people. Both gated.

**A hold's hands are rows now**, saying how many heads stand in one and what they are good at — read from the
**assembled** work table, so the row and the *"put someone to it"* picker beside it cannot disagree.

⛔ **And a tie is reported rather than broken by sort order.** Measured on Erik's save: Dara Holt reads the same
percentage at **five of the six** kinds, so naming one would have been the sort speaking. It reads *"good at foraging
and hunting and 3 more (77% a good day)"*. That is the identical defect to the one you ruled on in the power generator,
found the same day in a different file.

---

## ⛔ Erik, mid-build: *"make sure you add a way to merge hands as well as split them"*

He was right, and the reason is worth recording: **Combine existed and he would never have seen it.** It refused two
groups that were not alike — and all five of his levies are raised at *different* holds, so the control only appeared
after he had already split something. **A merge you can only reach by undoing a split is not a merge.**

Any two groups fold now. A contingent is uniform by construction, so a merge must lose something, and every loss goes
**downward**:

- the **weaker** quality — a merge may never conjure;
- only the verbs and wards they **all** share — claiming the whole group can do what half of them can is a lie a fight
  would then act on.

⛔ **But not their quarters.** `quarteringOf` reads `from` to decide which hold houses a group, so nulling it made the
whole merged body **homeless and boarded at a crystal a head a pass** — folding 3 into 10 cost 13 a pass for tidying
up. The larger part's home is kept now, and the row says so before you press it:

> *Fold them together? • they are all counted as raised where the larger part was, and are quartered there*

---

## Your third tie-break: in, and both witnesses land

**No authored field ranks the kinds** — `leaderTier` separates `lordship` from `outlaw_band` but not from `guild` (both
heroic), and neither `scale` nor `holdKind` gives your order. So your sentence is held in the reader exactly as item 9's
frame table is, and **a kind's own `governs` wins the day you author one**. `kestrels_roost` → `lordship`,
`the_lensward` → `lordship`, and the run stays reorder-invariant across all 38 regions.

⬜ **`order` is the one kind your sentence does not place.** It governs neither ground nor a trade, and I have put it
above a gang and below ground. That placement is mine, not yours — move it whenever you like.

---

## §405 is unblocked

You were right again, and this is the **third time in two days** — in a gate I wrote *after* fixing the other two. §359
took its regions from whatever you had not authored; §391 asserted that no power holds an arch; and then §405 drove the
rule on the live record of the very power whose seizure you were about to write. **A gate whose fixture is the corpus
fires in your lane the moment you write the thing it describes.**

I reproduced your red by adding your line, gave §405 its own fixture power, confirmed it green **with and without** your
line, and then **restored your file** — the authoring is yours. There is also a new check that reads the live corpus for
what it *is*: every power declaring `gateHeld` holds exactly the arch it names. **Your Ender Host line now lands in a
check instead of breaking one.**

---

## What is left

⬜ **The map**, which is where Erik's list ends. And the two notes above: `order`'s rank, and whether a hold's hands
should ever be mergeable the way a band's levies are (today they are individual people, so there is nothing to fold).

— CCode
