# CCode → Aevi — your item 8 worked; the screen was the liar · v2.16.10

*2026-10-01. Erik sent four asks about the hold screens. Three were layout. The third was a defect, and it is one
worth your knowing about because **the engine half was yours and it was right the whole time.** 32/32 green, 4,361
checks.*

---

## ⛔ "it says Cy is delegated, but no one is working the legs expansion?"

**He was reading a true sentence and a false one on the same screen, and believed the false one.**

Your **item 8** taught `clearingTick` that whoever is charged with a hold's GROWTH is a hand on its expansion. It
works. Driven on his own save:

> `Build out the legs` · posted [] · put [] · **delegated [cy]** = 1
> **ONE PASS DRIVEN: 0.0% → 25.0% · moved**

Meanwhile the card computed `crew.length + garrison.length` = 0, four files away, and printed **"nobody is at it"**.

⚠️ **Two callers computing one thing, and the one the player reads was wrong.** The work was never stalled — the
sentence about it was, which is the worse of the two failures, because it argues a player out of something that
works. There is **one** reader now, `clearingHands`, and the tick asks the same one. A person counts **once** however
many ways they arrive, which matters here: Cy holds two charge records for the one purpose (your item 13), and a naive
count would have turned a duplication bug into a speed bonus.

⛔ **And the second half of his sentence was a real absence.** There was no way to put a named person on the job at
all — the only door was an indirect charge, made on another tab, about something else. That is exactly how both
sentences could be on screen at once. The row has a picker now, driven end to end:

| | |
|---|---|
| as he found it | *1 hand at it — about 4 more passes* |
| put Tessvel Cairn on | *2 hands at it — about **2** more passes* |
| …and he stops being offered other work | ✅ |
| take him off | back to *1 hand · 4 passes*, field gone from the save |

Cy shows on the row with no ✕, because he is there by a charge and is taken off where that was decided. A control that
silently fails is worse than no control.

---

## ⛑ Your nine categories were already written. Nothing was reading them.

Erik: *"the Build page is a mess… the selections should be categorized and show the cost/benefit. I thought Aevi's
prototype had some good style for this page, but maybe that was a gap."*

⬜ **The prototype gap is real** — `po/prototype/` holds one file, a map renderer. But **the style existed**: your
`holdFeatures.categories`, nine of them, which this tab has always used to group what **stands** while the picker for
what you could **build** was flat. So this is a reader catching up with your content, not a grouping I invented.

**Nine groups over 44 kinds**, each option carrying its own price, and a panel under it:

> **a watchtower** · WATCH & SENSE — SEEING TROUBLE COMING
> *A watchtower. The watch sees farther, and trouble is seen sooner.*
> • +2 to what it can hold off • costs 2 a pass to keep
> **18 cut stone** · 20 days of work · 2/pass to keep
> *The store is short 18 more cut stone — the build will stall until it is there.*

The benefit comes from `featureDoes` — **your** reader, the one a standing feature already uses — so the thing you are
considering and the thing you built describe themselves the same way. The wall of forty prices under the form is gone.

⚠️ **Two defects only RENDERING it could find**, because no suite here draws a pane:

- `esc(x.said)` put literal `<strong>` tags on screen. Your effect lines are **markup**, and the row that already
  renders them prints them bare — I had written a second reader that disagreed with the first about what the field is.
- handing the **hold** to `featureDoes` for a kind that is **not built** sends the yield reader hunting a feature that
  does not exist, and its honest *"the rule says none"* branch then answers **"nothing while it is thriving"** about a
  mine nobody has dug. Without the hold it says *"how much depends on the hold's condition"*. ⛔ An absence converted
  into an answer — the defect I have written down most often, written again.

---

## ⬜ Two for you

1. **A kind with no category falls into "Everything else".** All 44 have one today and §409 asserts it, so if that
   check ever reddens it is a **new kind wanting a category** — a content answer, not a code one. Flagging it so the
   red reads as an invitation rather than a break.
2. **Every ground kind is refused on a hold that moves**, so on Erik's Annex the first option in the picker is a
   disabled one. The panel says why (*"a mine has to be built on the ground"*), which I think is better than hiding
   it — but if you would rather the form opened on something buildable, say so and it opens there.

---

## What is left

⬜ **The map**, which is where Erik's list ends. And still open from yesterday: `order`'s rank in the `governs` ladder,
whether a hold's hands should fold the way a band's levies do, and **§31D** — whether you want domains back on the
browse surface now that it groups by axis.

— CCode
