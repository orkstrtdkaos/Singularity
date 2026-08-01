# SNG-247 — the exemplars are reachable, and the voice is live

**CCode · 2026-07-31 · v1.8.322 (`d4c82e27`) + v1.8.323 (`4b20395c`) · npm test exit 0 (20 seams) · verified live through the real loader on a never-used port.**

Erik: *"can't you pull in the staged exemplars?"*

Yes — **and I was wrong to call it not mine.** `po/staged_content/README.md` says the opposite in as many words:
*"Aevi authors content; CCode does the integration (manifests, loaders, gates, hooks)."* Every prior staged file —
`tradition_epics`, `bestiary`, `trait_readouts`, `encounter_receipt_line`, `tradition_visual_aesthetics` — was
integrated by CCode. I should have checked the README before handing it off.

## The file move was the smaller half

`exemplarEncounters` has been authored since SNG-230 and **read by nothing.** `loadContent` takes `frameKinds` off
that doc and drops the encounters on the floor. So the sealed door and the toll-keeper have **never once been
reachable in play** — and Aevi's library took that from 2 unreachable encounters to 8.

Copying the file into `content/packs/` would have moved bytes and changed nothing. That is what I'd have shipped if
I'd treated "promotion" as a file operation.

## What landed

- **`frameExemplarEncounters()`** turns each exemplar into a pool entry, through the **same merge point and pattern
  as `bestiaryEncounters`** (SNG-229) — one way encounters reach the pool, not two.
- **`kind` rides through verbatim**, so a standoff stays a standoff and a puzzle stays a puzzle instead of falling
  to the challenge default.
- **Authored `tier` becomes `minDanger`**, so a regional puzzle doesn't surface on a quiet road — they're
  danger-gated like every other entry rather than being special.
- **`eligibleEncountersFor` now admits `routing: "opposed"`.** It filtered to `duel|challenge`, so the one exemplar
  Aevi routed that way could never have been offered *even after* the merge.
- A **`frameExemplarEncounters=` counter** on the `loadContent` line, so this can't quietly go back to zero.

## We collided, and Aevi won the content

She promoted the file herself while I was building. I took **her** version on the rebase — she's the author, and
nothing was lost either way (verified before resolving: `frameKinds` byte-identical, zero live-only exemplars).

## Her voice is merged and live

Two things the merge had to get right:

1. **Her `playerBreaks` is the engine's `playerOvercome`.** Merged under the *engine's* key so there is one
   vocabulary rather than two — a line authored under a name nothing reads is just a quieter version of the inert
   bug. Flagged back so the next pass uses the engine key.
2. **Her `degreeVoice` had no reader at all.** I wired one: a static antagonist's round now prints its own degree
   line — *"a piece gives — you feel the thing loosen toward you"* — instead of a foe's win/loss wording. Her whole
   ruling for this kind is that a sealed thing **yields to being understood and never fights**, so the round has to
   say that in its own register. Merging it as content-with-no-consumer would have been the exact class this ticket
   keeps closing.

A puzzle and a chase have **one** ending, so her single `opponentYields` line serves both engine paths rather than
leaving `opponentBreaks` on my placeholder.

**The rulings survived the voice pass.** `losingCostsHealth: false` still holds on all three kinds and the fight
still pays in blood — asserted, because a wholesale object replacement would have silently dropped it.

## Two of my own tests were wrong, not the content

One asserted my placeholder word *"resists"* rather than the property; it now compares against the authored label
and checks the lines still **sum to the margin**. The other banned `/fight/` in the resist label — which rejects
Aevi's *"not fighting you"*, the very phrasing that makes her point. Both now assert what the voice **is**.

The content was spliced with **15 targeted substitutions rather than re-serialized**: a full re-dump churned 700
lines of that hand-formatted file for a 30-line change.

## Verification

10 new checks. `npm test` exit 0. Live on **never-used port 8473** through the real loader:

- pool 96 entries, **8 of them exemplars**, all 8 offerable at danger 3, **0 on a quiet road**
- each mints its own kind — 4 standoffs as duels, 4 puzzles as puzzles — flying its own colour
- the resist line renders as **Aevi's** on the breakdown, carrying its `+20`
- a strong read prints both *"A layer gives"* and her *"a piece gives — you feel the thing loosen toward you"*

## SNG-247 is fully closed

Four tiers, the promotion, and the voice. Every kind plays as itself — and the encounters that say so are reachable.

## Files

`engine/random_encounters.js` (`frameExemplarEncounters`, `opposed` eligibility) · `engine/state.js` (the pool merge
+ counter) · `engine/encounters.js` (the `degreeVoice` reader) ·
`content/packs/core/rules/skill_battle_system.json` (Aevi's voice, spliced) ·
`content/packs/core/rules/encounter_frame_kinds.json` (hers, taken on the rebase) ·
`tests/skill_battle_sim.mjs` (+10, and two of mine corrected) · `po/COMBAT_DIALS.md` · `index.html` (v1.8.323).

*— CCode. status: complete_pending_review.*
