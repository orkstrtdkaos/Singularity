# BRIEF — the valley has no ladder: the tier distribution, and the fix
## Aevi (PO) · 2026-08-03 · CCode: "60 legendary · 5 epic · 1 regional. The valley has no heroes."
## This is a content problem. It is mine. Gathering before acting, per Erik.

## CONFIRMED, AND WORSE THAN THE HEADLINE
**60 legendary · 5 epic · 1 regional · 0 notable · 0 riffraff.** 91% of named figures sit on the top rung.
**And the weight ladder makes it bite harder than the counts suggest:**
`LEGEND_TIER_WEIGHT = { legendary: 50, epic: 45, regional: 16, notable: 10, riffraff: 3 }`
· **legendary → epic is a gap of 5.** Functionally the same rung.
· **epic → regional is a gap of 29.** A cliff.
**So the roster is not 60/5/1 across three tiers — it is effectively 65 figures at one power level and one
figure at another.** CCode's tier-gap mechanic (2 tiers → reach 4 · 1 tier → 2 · peer → 1) has **almost no gap
to read**: nearly every clash in the world is peer-vs-peer, which is why attrition felt flat and ganging-up
never happens. **The mechanic is correct and starved.**

## ⚠️ CCODE'S GUESS AT THE CAUSE IS RIGHT, AND I CAN NAME IT PRECISELY
*"Tier was authored for narrative weight rather than as a population pyramid."* Exactly so — and the file name
says it: **`tradition_epics.json`**. These are **the apex figures of each of the 27 traditions**, 2–3 apiece.
**Everyone in that file was authored to be the greatest of their kind, so everyone got the top tier. Nothing
was ever wrong; the file was never a population.**

## THE FIX IS DERIVABLE — SCOPE OF WANT IS ALREADY IN THE TEXT
I tested whether tier can be read from the authored `wants` line rather than assigned by taste. **It can, and
cleanly:**
| scope of want | count | reads as |
|---|---|---|
| **world-remaking** — *"a world with no dark left in it"* · *"to dissolve the world into the waking"* | **18** | legendary |
| **craft/regional** — *"that endings be clean"* · *"keep the far places connected"* | **25** | epic |
| **personal** — *"to keep choosing each other"* · *"one fight she isn't sure she'll win"* | **19** | regional/notable |
**Nineteen figures currently tiered LEGENDARY have wants about ONE PERSON, ONE FIGHT, OR ONE MOMENT:**
· `the_two_who_are_one` — *"To keep choosing each other, which is the whole of it."*
· `the_nine_year_master` — *"One fight she isn't sure she'll win."*
· `the_unravelled_mind` — *"To be understood for one clear moment before the thoughts scatter again."*
· `prodigal_gearheart` — *"To make, once more, something as good as the thing she made too young."*
· `the_long_grudge` — *"The one debt, paid — after which she does not know what she is."*
**None of those is a legendary want.** They are the wants of very good people with a life-sized problem —
which is exactly the population the world is missing. **The pyramid is already written; only the tier field is
wrong.**

## PROPOSED SHAPE (for Erik's call, not yet executed)
| tier | now | proposed | who |
|---|---|---|---|
| legendary | 60 | **~18** | world-remaking wants — the arc drivers and their opposite numbers |
| epic | 5 | **~25** | craft-defining masters; regional scope |
| regional | 1 | **~19** | personal wants; the life-sized figures |
| notable | 0 | **minted** | ⚠️ does not exist and cannot be re-tiered into — must be GROWN |
| riffraff | 0 | **minted** | as above |
**RE-TIERING ALONE CANNOT FILL THE BOTTOM TWO RUNGS.** 66 figures redistributed still leaves zero below
regional. **That half is minting, and CCode is right that it is now urgent from both ends** — the world needs
somewhere to promote *from*, not just a way to replace the dead.

## WHAT I WOULD WANT ERIK TO DECIDE BEFORE I TOUCH IT
1. **Is demoting authored figures acceptable?** `neth_the_stayed` is *"the deep teacher of the ashwarden
   craft"* — she reads legendary in prose and her want is personal. **Tier is now mechanical (weight 50 vs 16
   decides who dies), so a mis-tier is no longer just a label.** But re-tiering 43 figures changes how the
   world reads. **I would not do it unilaterally.**
2. **Should tradition apexes stay legendary regardless of want-scope?** A defensible alternative: **every
   tradition keeps ONE legendary hero and ONE legendary villain (54 → ~27 legendary)**, and the third figure
   per tradition drops. Cruder than want-scope, but it preserves "the greatest of each kind" and still builds a
   pyramid.
3. **Should the weight ladder itself be re-spaced?** `legendary 50 / epic 45` being 5 apart is arguably the
   deeper bug — **even a perfect pyramid barely registers a gap between the top two rungs.** Something like
   50/34/16/10/3 would make the tier-gap mechanic actually fire. **That is a one-line content change and may
   be worth more than any re-tiering.**

## MY READ, OFFERED AS A READ
**Option 3 first, cheapest and largest effect.** Re-spacing the weights makes CCode's gap mechanic work on the
roster *as it stands*. Then want-scope re-tiering (option 1) with your sign-off on the demotions. Then minting
for the bottom two rungs, which is the only part that cannot be solved by editing what exists.
