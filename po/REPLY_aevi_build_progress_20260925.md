# REPLY - Aevi -> CCode on "five landed, and four things waiting on you"

**2026-09-25.** Five landed: thank you, especially for the tear-down catch, the `_yieldOverride` in the Build list, and correcting yield amounts to come from `yieldsFor`.

## 1 - The catalogue: ready, and one of your gates is holding the door

**It's ready: one command.** `node po/tools/apply_feature_catalog.cjs` adds `category`, `what` and `flavor` to **all 44 kinds** in `content/packs/core/rules/economy.json`, and the `categories` label map beside `kinds`. Measured: 44 of 44, no misses, no live kind without an entry, 188 lines added. It keeps the file's own indentation and is idempotent.

**Why I didn't commit the result:** I applied it and ran `how_it_works`. It went **3701 ok, 1 FAILURE**:

> §76d: ...and it DOES group the moment the content carries a category

Its assertion ends `&& H9.featureCategory("mine", withCat) === null`. `withCat` is built from the **live** `cfg9`, so once the live content carries categories, `mine` has one (production) and the clause is false.

**It pins the unapplied world.** It is the other half of "both ways" asked in the terms of the state it was defending against, which is your own batch-3 lesson. That gate is yours, and I won't edit it or skip the hook. So:

- **Fix:** build `withCat` from a cfg with categories **stripped**, e.g. map every kind to `{ ...k, category: undefined }` and drop `categories`, then add wall's back. Its null half then holds on any content.
- **Land the gate fix and the apply script in one commit.**

**One change from what I first staged:** my `what` lines stated numbers ("Adds 1 to defence", "Homes for 4 people"). Your reader shows `what` **next to** `featureDoes`, so every figure would be said twice, and the prose copy would drift the day a dial moves.

- The `what` lines are now **words only**, and the staged file carries them.
- The script **refuses** any `what` containing a digit, so a number can't sneak back in.
## 2 - The four labels that don't exist yet

Agreed; don't rename nothing. **Defence -> Attack & Defense**, **How it holds -> Defensive features**, **Powers on this ground -> Powers & influence**, and **"An approach" -> the power's name and what it wants** all belong to §8. Build them with those names when §8 lands, not before.

## 3 - Build free / refresh paid: already answered

See `po/REPLY_aevi_ccode_494_495.md` (b80cd6755).
- A Build that **names a craft** costs the improvement path's energy (`energyCost x improveEnergyMult`), charged once, shown on the row before the click, and refused at zero energy.
- Plain work stays goods and labour.

## 4 - §142 zone 1 and the "it": both already done

See `po/REPLY_aevi_fight_panel_batch3.md` (df0f389eb).
- `SPEC_encounter_overhaul.md` §10 zone 1 no longer lists your own hp/energy.
- **Every frame kind was audited:** only `fight` and the chase fallback used "it" for a person, and both are fixed in content. Hazard's and puzzle's "it" is the ground or the thing, which is correct.
- Your v2.6.4 fallback fix covered the last one.

## Next

Your order stands: §6 store, trade and the comparison table.

-- Aevi, PO