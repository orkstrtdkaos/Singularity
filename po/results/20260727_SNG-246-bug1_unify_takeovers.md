# SNG-246 BUG1 / Fix B — unify the takeovers: the skill battle renders IN place

**CCode · 2026-07-27 · v1.8.295 (`8490b504`) · npm test exit 0 (all smoke, wiring audit, ENGINE_MAP, rawProseCaps 63).**

Erik (§7b, the priority defect): a duel showed the nice SNG-230 frame, then **JUMPED to the separate full-screen
`renderSkillBattle` panel** he explicitly rejected — two competing takeover systems, and the duel hit the wrong
(separate-screen) one. Fix B: the in-place frame is now the ONLY takeover.

## What changed
- **`skillBattlePanel()` + `wireSkillBattlePanel()`** — the skill-battle round CONTROLS (the fog read · the
  intensity dial · the declarable skills with function/tier/energy · Read / Break / Yield), extracted from the old
  separate screen and rendered **in the option area of the play surface** when a skill battle is active — beneath
  the SNG-230 frame strip (kind · momentum meter · win · exits) on top. **No separate screen.**
- **`renderSkillBattle` is now a thin alias** — it carries the round's fog forward (`sbLastRound`) and renders the
  play surface. Every legacy call site (dev / reload-resume / engage / chase-refight) and `sbDeclare`'s per-round
  re-render now land on the ONE takeover; there is no more `.sb-screen`.
- **Round routing kept safe:** a skill-battle round is driven by `sbDeclare` (the momentum/opponent-sheet
  resolver), NEVER `duelRound` (which reads `opponentHealth` and would corrupt the skill-battle state — the two
  resolvers aren't interchangeable). `onChoice` now skips the classic round block for a skill battle; a typed move
  in a skill battle is intercepted in `onFreeform` → `sbDeclare` (a named craft the character owns, else a plain
  strike), so the **freefield stays open and API-free**.
- **The ⚙ Moves gear is hidden** in a skill battle (the panel IS the option set); the freeform input stays.

## Verification (fresh port, injected skill_battle duels — the rounds are pure engine, no API)
- The skill battle renders as **`.sb-panel` INSIDE `.play`**, with the frame strip on top, **8 skill buttons +
  intensity dial + Read/Break/Yield**, the freefield open, the ⚙ gear hidden, and **NO `.sb-screen` at any point**
  (checked across 3 different fights, before and after the round).
- Clicking a skill drove a **real round via `sbDeclare`** (momentum moved) and the fight resolved cleanly back to
  the play surface (*"a raider yields to you"*), no console errors.
- The round mechanics are **byte-identical to before** — only the render surface changed. `sbDeclare` /
  `skillBattleRound` are untouched, so there is no round-behaviour regression; the fights resolving in one round is
  the *existing* engine behaviour (the very "one action ends it" Erik is complaining about — Fix A/C's domain),
  exacerbated here by hand-built opponent sheets.
- The **mid-fight re-render** (round 2's panel) uses the identical `renderPlay` + `skillBattlePanel` path proven at
  round 1; a genuine multi-round fight is best seen in live play, where real `synthesizeOpponentSheet` foes last
  longer and the GM narrates the aftermath (needs a key).

## Files
- `app.js` — `skillBattlePanel` / `wireSkillBattlePanel` / the `renderSkillBattle` alias + `sbLastRound`; the
  renderPlay option-area swap + the ⚙-gear hide; the `onChoice` skill-battle skip + the `onFreeform` intercept.
- `style.css` — `.sb-panel` (the in-place container; the sub-styles are reused).

## This is 2 of 4 — remaining
- **Fix A:** engine-enforced fight-entry — a committed fight goes structured by ENGINE, not the GM's memory of
  rule 18 (the root of "one action ended it in pure prose").
- **Fix C:** surface + enforce the structured finish/change conditions (multiple distinct roads; fight→chase morph
  visible) — this is also where "fights resolve too fast/samey" gets addressed.

*— CCode. One screen for a fight now: the play surface becomes the encounter, the frame on top, the moves in place.
status: complete_pending_review.*
