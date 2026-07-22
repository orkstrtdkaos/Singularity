# SNG-207b — the author god-mode: its own door

**CCode · 2026-07-22 · v1.8.201 (`43356000`) · full suite green · live-verified.** The deferred Phase 2 of SNG-207. Erik-as-**author** — not the character, not the in-fiction GM — sets anything on the save, with no fairness or trace check. This is the deliberately-separate surface the §0 guard reserved through all of Phase 1.

(And I see it lands right where you were heading: `ad0ab48b`'s three-tier verification model names 207b as *the unlock* for Tier 2 — CCode setting up test states via god-mode instead of asking Erik to grind to them. The panel below is built to be exactly that lever.)

---

## The one line it crosses, and the one it never does

**It crosses FAIRNESS (earned-ness):** it grants xp and levels (the *"make me level 10"* the fair GM refuses), raises vitals (the fair `correctVital` may only lower), grants **power** items (effects ride through, unlike the fair `grantStoryItem` which strips them), grants abilities **bypassing the domain gates**, and **forces any world-arc stage** directly. Everything the fair GM declines by judgment, the author just does.

**It never crosses SAFETY:** content-rating and minor-safety are not character *state* — they are their own controls — so this surface **simply never exposes them**. That's the clean expression of the doctrine: god-mode overrides *fairness*, never *safety*. A smoke test asserts no `rating`/`minor`/`safe` op exists in the god vocabulary.

## Its own door — the §0 guard, honored end to end

The guard held from 1a through here: **there is no `skipFairness` seam** anywhere in the fair path. God-mode is a *separate module* (`engine/authormode.js`) with a *separate entry point* (`applyAuthorOps`) — not the fair `applyStateOps` with a flag flipped. A test greps `corrections.js` to confirm `skipFairness` appears nowhere. The two surfaces share nothing but the save they edit; conflating them is exactly how a fair GM becomes a cheat console, and they never touch.

## What shipped

**`engine/authormode.js`** — `applyAuthorOps(character, ops, ctx)` with the god vocabulary (`AUTHOR_OPS`): `addXp` (level follows the game's own rule), `setLevel` (raises with per-level rewards, lowers bare), `setSkillPoints`, `restoreVitals`, `setVital` (may raise), `grantAbility` (gate-bypassing), `grantItem` (power allowed), `setArcStage` (forces the canonical stage via the net-vector model). Every op appends to `character.authorEdits` — an append-only ledger **separate** from the fair-GM `corrections` ledger, so even god-mode leaves an audit trail. Pure, never throws.

**The `⚙ Author` panel** (`app.js`, dev-gated next to `🔬 Machine`) — labeled controls for every op, a live current-state readout, and a Recent-author-edits log. The nav button *and* `renderAuthorPanel` both guard on `devEnabled()`, so it is invisible and unreachable outside dev mode — never a player-facing cheat.

## Verified

11 smoke tests — every op including the ones the fair GM refuses (raise-a-vital, power-item-with-effects, level-to-10, arc-stage-override), plus the accountability + guard invariants (all edits logged; no safety lever exists; no `skipFairness` seam; the panel is dev-gated). Full `npm test` green, with the new-module bookkeeping done: module count 63 (SYSTEM_SPEC header + spec-map row + ENGINE_MAP regenerated), and the `testOnlyExports` / `rawProseCaps` / `modulesMissingFromSpecMap` ratchets all held (the first-pass regressions — an only-test export, a raw prose cap, an unmapped module — caught and closed before commit). **Live-verified** on a fresh dev port: opened the panel, set **L5 → L10** (xp 999, skill points and reserves grew correctly), granted an item, both edits in the log; 0 console errors, 0 mojibake (screenshot captured).

## SNG-207 — complete end to end

- **1a** — the GM knows the Repair panel's exact capability; no hallucinated or deflected fixes.
- **1b** — the fair coverage-hole ops (register / grant / advance), each judged against the fiction's own trace.
- **207b** — the author god-mode, its own door: set anything, dev-gated, safety untouched, all logged.

The fair GM is *ultimately capable within the fiction's judgment*; the author is *ultimately capable, period* — and the two never leak into each other. And per your verification model, Tier 2 now has its lever: I can set up any character/world state directly to exercise a preview leg, instead of routing it through Erik.

*— CCode. Two doors. The GM's, which asks whether the story earned it. The author's, which doesn't ask. Both logged, so nothing done through either is ever a mystery later. Only-Aevi-closes.*
