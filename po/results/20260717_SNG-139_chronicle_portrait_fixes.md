# Results — Chronicle/portrait fixes (SNG-139)

Date: 2026-07-17 · HEAD `c9d4ae5` · **v1.8.98** · full suite green · browser-verified (served bytes + live roster). Status: **shipped, complete_pending_review.**

Five issues from Erik's Chronicle/authorship screenshots. **The ROUND-2 substrate verify corrected the spec on item 3** — it was written against a pre-v1.8.95 HEAD.

## 1 — Canon count mismatch (BUG) — fixed
The spec's stated mechanism was slightly off (promotion is a ternary `outcome==="variant" ? "variant" : "canonical"` at worldtick.js:227, not a raw `=outcome`), but **the symptom is real**: `sessionLog().canonPromoted` (chronicle.js:108) counted *every* promoted record with no tier filter, so a collision-loser **variant** promotion showed in the session's **"Became shared-world canon: …"** banner while the authorship card (canonical-only count) filed it under "rumor" — three views, inconsistent.
**Fix (one tier field, all readouts agree):** `sessionLog` now splits promoted records into `canonPromoted` (canonTier `"canonical"`) and a new `canonRumored` (`"variant"`). The session render shows "★ Became shared-world canon: …" for canonical only and "◦ Live on as rumor others may yet confirm: …" for variants. The banner now matches the card's `persisted.shared` (canonical) and `persisted.rumor` (variant) exactly. `buildSessionPrompt`'s "became canon this session" line is now canonical-only too (honest recaps).

## 2 — "writing your story…" stuck (BUG) — fixed
`_chronicleBusy` is set true (app.js:4684), `saveCharacter` runs mid-flight (app.js:4688) — and `saveCharacter` serializes the whole object (no underscore stripping), so an interrupted generation (reload/crash/navigation) persisted `_chronicleBusy: true`; on reload the render showed "writing your story…" forever and `ensureChronicleParagraph` early-returned on the busy guard.
**Fix:** `migrate(c)` (the load path) now clears `_chronicleBusy` + `_chronicleError` on the character and `_recapBusy` on each session. A stale busy self-heals on the next load; no persisted transient flag can wedge the paragraph again.

## 3 — Pell portrait — NO CHANGE NEEDED (spec was stale)
The spec claimed SNG-136 is "half-built (npcPromptSeed exists, bond-trigger + backfill don't) — nothing calls it." **Verified FALSE at HEAD:** SNG-136 is fully wired — `npcPromptSeed` (art.js:199), `npcPortraitTier` (npcs.js:182), the lived-record fold-in in `characterPromptSeed` (art.js:182-190), and **`ensureBondPortraits` is called both on load (app.js:2419 — the Pell retro backfill) and per-turn after npcUpdates (app.js:2693)**. Committed in `53a3b79` (v1.8.95), *after* the SNG-139 spec was written. Pell (together · devoted, relationship ≥ 7) reaches the `devoted` portrait tier, so on Erik's next load with art on, her portrait mints via the retro backfill. Added a confirming test (`npcPortraitTier` returns "devoted" for Pell-like data); no code change. If she still lacks a portrait in live play it's a runtime cause (art off, a failed mint, or her registry record not yet at a tier), not missing wiring.

## 4 — Portrait user-selectable (MISSING) — built
Each gallery image gets a **"★ Set as portrait"** control (hidden on the one that already is the portrait). Picking it sets `character.portrait = url` + **`portraitPinned = true`** and saves; the current portrait's caption shows "portrait · pinned". Per OQ3 (**pin beats auto**): `refreshPortraitMilestone` (the every-2-levels auto-regen) now early-returns when `portraitPinned` is set, so an auto-regen never silently overrides the player's chosen face. Explicit user actions (the manual "New portrait" button, a form-change re-mint) still work. Deleting the pinned image clears the pin (then re-mints so the character is never imageless).

## 5 — Delete character (MISSING — never built) — restored
Git-confirmed a character delete **never existed** (`deleteCharacter` appears only in the spec/commit text, never in code). New **`deleteCharacter(id)`** (state.js) removes the save blob (`singularity.character.${id}`) + drops it from the local index (`singularity.characters`). A confirm-gated **Delete** control sits on each roster item next to Play. **Local by design** — the confirm states that a shared-world copy the family syncs is separate and is **not** touched (a local delete must never silently nuke shared canon). If the just-deleted character was the loaded one, the global is cleared so a dead reference isn't kept.

## Guards honored
- **Canon count:** one tier field; banner (canonical) + rumor (variant) partition the promoted total — verified by test (`canonPromoted.length + canonRumored.length === promoted total`; card agrees).
- **Busy flag:** transient render flags are session-scoped (cleared on load), never allowed to persist/wedge.
- **Delete is destructive:** always confirms; local-only scope, shared canon untouched.
- **User pick wins:** `portraitPinned` makes auto-regen defer to an explicit choice.
- **SNG-136 completion** stays within its guards — unchanged (it was already complete).

## Verification
- **15 smoke tests:** the canon split (banner=canonical, rumor=variant, they partition the total, card agrees); Pell reaches the devoted tier while an acquaintance reaches none; `deleteCharacter` drops the index entry + removes the blob + leaves others intact; app.js raw-source assertions (migrate clears `_chronicleBusy`; gallery `data-galpick` pins; `if (c.portraitPinned) return null`; roster `data-del` → `deleteCharacter(id)`; the `canonRumored` render line). Full `npm test` green.
- **Browser-runtime, served modules (cache-busted, fresh port 8398):** 6/6 — the canon split + card agreement, Pell's devoted tier, `deleteCharacter` against **real localStorage** (index + blob gone), all app.js wiring present, v1.8.98. Boot-clean.
- **Live UI:** seeded two characters, opened the roster — both render a "Delete this character from this device" button next to Play (read_page confirmed refs). The delete's `confirm()` dialog isn't drivable headlessly, but `deleteCharacter` itself is runtime-verified.
- **Not headless-reachable:** the full click-through (pick a gallery portrait → it pins → a level-up doesn't override it) needs a keyed play session with art on; the pin gate + pick handler are source- and unit-verified.

## Files
`engine/chronicle.js` (sessionLog canon/rumor split) · `engine/state.js` (`deleteCharacter`) · `app.js` (migrate busy-clear; gallery Set-as-portrait + pin; pin-beats-auto gate; roster delete control + handler + import; session-log rumor line) · `tests/smoke.mjs` · `index.html` (v1.8.98).

## Note for Aevi
- **Item 3 is already shipped** (SNG-136, v1.8.95) — the spec audited a stale HEAD. No rebuild; Pell's portrait mints on the next art-on load. The `authorshipStats` filter and `characterPromptSeed` lived-record fold-in the spec flagged as gaps are also already present.
