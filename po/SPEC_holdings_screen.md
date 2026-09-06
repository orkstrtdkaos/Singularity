# SPEC — the Holdings screen: images that never mint, and staffing that never shows

**Author:** Aevi (PO) · **2026-09-06** · **Status:** `spec_ready` — ⬜ **CCode ROUND 2**
**subject:** holdings-ui
> Erik: *"Only 2 of my Silas holds got an image — need to fix that for the others and for the new manage
> screen that pops up. Plus I have a lot more options to staff and guard my holds in the manage screen, but
> **those names don't transfer over to the main holds screen**."*

---

## §1 — ⛔ THE IMAGE HAS EXACTLY ONE CALLER, AND IT IS THE CELEBRATION

**`ensureHoldingImage` is called from ONE place: `app.js:6043`, inside the celebration card.**

➡️ ⛔ **A HOLD GETS AN IMAGE ONLY IF IT ARRIVED THROUGH THE *"A PLACE IS YOURS"* MOMENT.** ⚠️ **Anything
claimed by another path — an op, a repair, a migration — can never get one, and there is no path that would
ever give it one later.**

**Measured on Erik's save:**

| hold | image |
|---|---|
| Threshold Post | ✅ |
| Stillwater's Trouble | ⚠️ **yes, and it is WRONG — see §2** |
| ⛔ **The Fell Pell** | ⛔ **none** |
| ⛔ **Whistling Woman Post** | ⛔ **none** — ⚠️ **and this is the one the GM refused this morning and CCode later claimed directly** |

⬜ **Fix: mint on READ, not on celebration.** ⚑ **`ensureAbilityImage` and `ensureLocationImage` are the
model and the function's own header says it mirrors them** — ⚠️ **they mint when the thing is looked at.**
⛔ **Call it from the holdings list and from the manage popup**, not only from the moment of claiming.

---

## §2 — ⛔ AND A CACHED IMAGE SURVIVES A RENAME

**`Stillwater's Trouble` carries an image whose prompt reads:**
> *"**Raven's Home**: a standing post, steady, kept up. full reconstruction of the Raven's Home post…"*

⚠️ **The hold was renamed and the art was not.** ⛔ **`if (holding.image) return holding.image` is correct
for *never regenerate* and wrong for *the subject changed*.**

⬜ **Fix: `renameHolding` clears `image`** — ⚑ **so the next read mints a fresh one under the new name.**
⚠️ **Not a regeneration on every read; one clear, at the one moment the subject actually changed.**

---

## §3 — ⛔ THE MAIN LIST SHOWS FOUR FACTS AND THE RECORD HOLDS TEN

**`renderHoldings`, the hint line, is the whole of it:**
```
kind · condition · location · kept by <steward>
```

⚠️ **AND THE GM'S OWN BLOCK ALREADY RENDERS EVERYTHING ERIK IS ASKING FOR** (`holdings.js:169`):
> *"· store: 4 raw_material · **hands: Bette Harrow, Dav Cutter** · **guarded by Ilma** · improved by
> Sound-Read · has a mine · in arrears 12"*

➡️ ⛔ **THE NARRATOR IS TOLD WHO STAFFS A HOLD AND THE PLAYER IS NOT.**

| ⬜ the list should carry | already on the record |
|---|---|
| ⚑ **hands** — `h.crew`, by name | ✅ `setCrew` |
| ⚑ **guarded by** — `h.garrison`, by name | ✅ `setGarrison` |
| **features** | ✅ `h.features` |
| **store** | ✅ `h.store` — ⚠️ The Fell Pell has one |
| ⛔ **arrears** | ⚠️ **a hold in debt should say so where a player looks, not only in the GM's prompt** |

⚑ **`holdingSentence(h, { nameOf })` ALREADY COMPOSES THIS.** ⬜ **The list may be able to call it directly
rather than rebuilding the string.**

---

## §4 — ⚠️ AND THE MANAGE POPUP AND THE LIST MUST AGREE

⛔ **Erik's complaint is not that the manage screen is wrong — it is that the two screens disagree.** ⚑ **He
set crew and garrison in one place and the other still says the hold is just *kept by Deni Cors*.**

⬜ **Whatever the list renders, the popup should render the same facts in the same words** — ⚠️ **two
surfaces describing one hold differently is the same class as a doc and a body disagreeing, and this project
has a rule about that.**

---

## §5 — ROUND 2 QUESTIONS

1. ⛔ **Should `ensureHoldingImage` mint on list-render, or only in the popup?** ⚠️ **Four holds rendering at
   once is four image calls** — ⬜ **the popup is the safer surface and the list can show what is cached.**
2. **Does anything else cache art across a rename?** ⬜ **A location, an ability, an NPC portrait** —
   ⚠️ **`renameHolding` is one case of a class, and `revealName` on an NPC is plainly another.**
3. ⚑ **Is `holdingSentence` player-safe?** ⬜ It was written for the GM's prompt — ⚠️ **check it carries no
   `[PRIVATE]`-shaped detail before a player screen renders it.**
4. ⬜ **Erik has four holds and one is `enterprise` with an `owner` that is not him** (The Fell Pell, Pell's
   forge). ⚠️ **Does the list say whose it is?** ⛔ **A hold you do not own reading identically to one you do
   is a real confusion, and the `payer` work will multiply it.**
