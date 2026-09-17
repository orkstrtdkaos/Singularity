# NOTE CCODE-388/389: trading with a hold, and what rebasing onto SNG-600 found

**From:** CCode · **To:** Aevi · **2026-09-16**

## CCODE-388: another player's hold can trade (Erik said yes)

- **The owner opens it.** A checkbox on the holdings tab ("Open to other travelers' trade") writes `trade: true` on the hold.
  Nothing is for sale by default.
- **The card says what it sells.** An open hold's card lists each stored good, how many there are and the price at the hold's
  own Reach (`unitWorth`). The visitor's GM reads it under HOLDS NEAR HERE.
- **Not a shop, per your and Erik's words in `economy.json`.** The keeper sells in conversation. The GM records the sale with a
  `holdTrades` op, and the engine checks it against the card, what is already spoken for, and the purse. The buyer pays in
  crystal and carries the goods away at once, at most ten at a time.
- **The owner's next tick fills the order** from the store and takes the crystal. If the store sold out in between, the
  buyer's next tick pays back the difference and takes back goods that were never there. Each side is written before it is
  published, so nobody is paid twice. The money moves and is never made.
- **For your content:** an inventory item may now carry `goods` (an economy goods id) and `worth` (trivial / useful / valuable
  / precious). A bought stack keeps its kind, so a trader at another Reach can price it.

## ⚠️ What the rebase found: SNG-600's commit carried stale copies of two generated docs

Your `12889b614` wrote `SYSTEM_SPEC.md` and `docs/HOW_IT_WORKS.md` from a working copy older than CCODE-387. Your
regenerate commit fixed the stamps, but the rows stayed gone:

- **SYSTEM_SPEC:** the module rows for `fates.js`, `sharedholds.js` and `journeyplan.js`. The last one went without a conflict:
  the merge saw one side delete it and the other leave it alone.
- **HOW_IT_WORKS:** the eight 09-16 log rows, CCODE-380 through CCODE-387.

All of them are back in CCODE-388. ⛑ **To avoid it:** run the generators on a fresh pull, just before you commit. They
rewrite whole files in place, so an old copy rewrites the rows it has never seen.

## ⛔ Two reds SNG-600 put on main (fixed in CCODE-389)

- **Renaming a check breaks its ledger claims.** The census gate became "…16 authored-in-play sites" in `content_ci.mjs`, but
  `tests/verification_ledger.mjs` claims it by name in two places (SNG-392 and SNG-396/398). They still said 15, so smoke
  `272` went red. Both now say 16.
- **EXESA.md said "a hundred and forty-one-one authored places".** §83 reads that as 142 against 141 measured. It now says
  "forty-one". I changed only the numeral.

## ⛔ v2.0.24's rename reached two places that are not the ladder (fixed in CCODE-389)

"Only on the tier ladder" held in the engine and content. I checked all 54 changes there, and every one is a rung. In the
tests, the rename also reached **arc scale** and **map zoom**:

- **Three checks stopped running without going red.** Smoke's scoped-arc fixture looks for an arc to scope, and the rename
  changed what it looks for to `scale === "leader"`. No arc has that scale (4 are `regional`), so the three `272/273` checks
  inside its `if` never ran. The ledger listed them as missing, but the suite stayed quiet. They run and pass again. A fourth
  check now fails if the fixture ever finds no regional arc.
- **Erik's words inside quotes:** "switch to the **regional** map", "a **regional** 2D map", "I want **regional** and local
  arcs". The map-zoom check names ("a regional map carries regional relief", "a regional view reads under 30°") and their
  ledger claims were changed too.

In all, `regional` is back in 25 places, and each one meant a scale or a map. The ledger now reports 1 problem, SNG-391, the
known red.
