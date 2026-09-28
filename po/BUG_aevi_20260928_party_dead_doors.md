<!-- status: BUG REPORT, Aevi → CCode, from Erik's play on Loki 2026-09-28; two dead doors on the party screen; fix before the work order -->
# BUG: two party-screen buttons that do nothing (Erik, playing Loki)

**Aevi (PO) · 2026-09-28 · priority: ahead of the 09-27 work order** (Erik is playing on it now)

> **Erik:** *"some buttons don't work — such as let them hang back, or keep out of it. They don't seem to do
> anything. Also, when I try to add my other allies to my party, it says they refuse. Is that because they are not
> next to me?"*

Read on origin 75eac8d62. Both are the same family: a write nothing reads, and a gate the comment says is gone.

## 1 · "Let them hang back" writes a field nothing reads

- The button (`[data-ally-hold]`, app.js ~15791, CCODE-511) toggles
  **`character.allyOrders[id].holdBack`**.
- **Nothing in app.js or engine/ reads `holdBack`** (one hit in the whole tree: the write).
- The card's own label reads **`a.present === false`**, and the fight code reads `present === false` (group.js,
  melee.js, champion.js). Nothing turns `holdBack` into `present: false`, so the label never flips and the ally
  never leaves the line.
- ⬜ **Fix:** wherever the ally roster is built for the card and the fight (`bringForward` or its caller), derive
  `present: false` from `allyOrders[id].holdBack`. One reader, used by both. **Gate:** click it, and the same ally
  is `present === false` in the fight roster and the card says "Back into the line".

## 2 · "Walks with you" refuses, and not because of distance

- The picker (CCODE-524) calls `recruit(character, id, { …, ladder })`.
- `recruit()` (engine/company.js) **still returns `null` when the company is at `companyPlaces`**, whenever a
  `ladder` is passed, and the picker passes one.
- The picker's own comment says the cap *"decides who comes FORWARD and no longer refuses the join"*: Erik's
  CCODE-511 ruling (closeness buys a named place; **anyone who will come can travel with you**). The code still
  refuses.
- And it refuses **silently**: `recruit` returns `null`, so the alert falls back to "They will not come." The
  player reads it as the person refusing him.
- **Location isn't checked anywhere in that path.** Erik asked whether it's because they aren't beside him; it
  isn't.
- ⬜ **Fix:** the cap applies to *forward* places only; a join into the line always succeeds for anyone
  `isRecruitable`. If some refusal remains legitimate, `recruit` returns `{ ok: false, why }` with a sentence the
  player can act on, never `null`. **Gate:** on Loki's save, add someone from the picker past `companyPlaces` and
  they join the line (not forward).
- ⬜ **Measure first on Loki's live save:** `activeCompany` vs `companyPlaces`, to confirm the cap is what he's
  hitting.

## 3 · Worth a sweep

This is the "fourth door" your wiring audit exists for (`holdBack` was written and never read). ⬜ Run it over the
CCODE-548 UI (holdings, party, bands, legion): every `data-*` button whose handler writes a field, and whether
that field has a reader. Erik said *"some buttons"*, so these two may not be all of them.

— Aevi, PO