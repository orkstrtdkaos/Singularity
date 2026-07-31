# SNG-246 Fix D + BUG2 — the mechanical receipt is SHOWN to the player

**CCode · 2026-07-27 · v1.8.294 (`3d961adb`) · npm test exit 0 (7 new Fix-D checks; boots clean; ENGINE_MAP + counts green; rawProseCaps 63).**

Erik (Slow Orchard): *"each action's resolution needs to be KNOWN, not just narrated — a little part of the output
that says the mechanical effect."* And §7c BUG2: *"Read them"* let the raider take the Waterskin with **no
mechanical readout** — a legitimate outcome that felt like a broken button. *The bug was never the theft — it was
the silence around it.*

## Fix D — the player-facing receipt line (§5)
Each encounter round now shows a compact **mechanical line beside the prose** (never merged) — the mechanical
truth SHOWN, so the player doesn't infer it from narration:
> `⚔ ✓ success · you hit for 2 · foe 4→2 hp · you −3 en · they're near breaking (yield)`

- **Loaded Aevi's staged format.** `po/staged_content/encounter_receipt_line.json` → `content/packs/core/rules/`
  (manifest whitelisted; SYSTEM_SPEC core-rules count 37→38) → `CONTENT.receiptLine`.
- **`playerReceiptLine(kind, data, format)`** (`engine/encounterFrame.js`, pure): fills Aevi's per-kind template
  from the round's facts — the degree icon, the effect, the **meter before→after in the RIGHT terms per kind**
  (fight = hp, puzzle = insight, chase = ground, standoff = resolve, hazard = progress), the health-taken segment
  only when you took damage, and the **finish-proximity always shown** (so a fight never ends "the same"
  opaquely). Generic fallback for an unknown kind; `""` when there's nothing to show.
- **`app.js`** computes the round facts at the resolve site (the SAME `rr` + `resolution` the GM receipt uses) and
  renders the line under the roll receipt (`.enc-receipt`). Covers fight / challenge / puzzle (the regular
  `onChoice` path). *(The skill-battle duel path renders through `renderSkillBattle` — it gets the receipt when
  BUG1 unifies the two takeovers into the one frame; see below.)*

## BUG2 — the silent theft
GM `inventoryRemove` was applied with **no player-facing note**. Now a gained/lost item surfaces as an italic
mechanical note in the flow — *"− Waterskin — taken from you."* — the same convention `itemUpdates` uses, so a
theft (or a gift) is never a mystery. This is the direct fix for the "read them → robbed with no explanation."

## Verification
- **7 smoke checks** (Node-verified real output): a fight receipt shows degree + effect + foe hp before→after +
  finish-proximity; health-taken only when hurt; a non-fight kind reflects its OWN meter (puzzle=insight, no hp);
  generic fallback; empty on no-degree; the loaded format carries all 5 kinds.
- **Boots clean** on the new content-load path (fresh port, v1.8.294, no console errors).
- The renderer is unit-tested + Node-verified; the in-combat appearance (the line under a live round's narration)
  is best confirmed by **playing** — the full round→GM→render flow needs the GM (API key). Low risk: the render is
  a one-liner beside the already-working roll receipt, reading a field computed from the same round data.

## This is 1 of 4 — the remaining SNG-246 fixes (next ships)
- **BUG1 / Fix B (priority):** unify the two takeovers — a duel jumps from the nice SNG-230 frame into the
  separate `renderSkillBattle` panel Erik rejected. Kill the double-takeover: render the skill-battle mechanics
  (intensity dial, skill list, Read/fog) INSIDE the frame on the play surface; delete the 4 `renderSkillBattle()`
  takeover calls. (This also brings Fix D's receipt to the fight path.)
- **Fix A:** engine-enforced fight-entry — a committed fight starts the structured encounter by ENGINE, not the
  GM's memory of rule 18 (the SNG-237 lesson; the root of "one action ended it in pure prose").
- **Fix C:** surface + enforce the structured finish/change conditions in the frame (multiple distinct roads;
  fight→chase morph visible).

## Owed
- **AEVI:** the receipt format is yours (loaded as-authored). **ERIK:** OQ1 verbosity — the line is the tight
  one-liner with finish-proximity always shown, as you leaned; say if you want fuller deltas.

*— CCode. Each round now states its mechanics plainly, and a theft is never silent. status: complete_pending_review.*
