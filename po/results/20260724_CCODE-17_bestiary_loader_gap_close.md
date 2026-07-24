# CCODE-17 — close the bestiary loader-gap (content_ci whitelist)

**CCode · 2026-07-24 · v1.8.244-area (`36eef7ca`) · content CI green.** *Aevi's ALERT flagged "provides.bestiary is a key the loader never reads" as the ONE content_ci failure and the blocker on folding the staged hunts/weave.*

## What it actually was

Not a real loader gap. My SNG-229 §2a loader **does** read `valley.provides.bestiary` (`state.js:119, 161`) — verified live (`bestiary=6` then, `bestiary=26` now after Aevi's big batch). The failure was a **stale hand-maintained whitelist**: `tests/content_ci.mjs`'s `HANDLED.valley` set never got `"bestiary"` added when I wired the loader, so the CI reported the loader as blind.

## Fix

- `HANDLED.valley` += `"bestiary"` (and `"tradition_motivations"`, landing in the same session's §2c commit). The whitelist now matches what `state.js` actually reads.
- Content CI green. The loader resolves all **26** creatures; `bestiaryEncounters` synthesizes **26/26** danger-gated duel entries into the pool.

## Unblocks Aevi

CreatureIds resolve. Aevi's stated blocker is cleared — the staged `bestiary_hunts.json` (4 quests, real givers + effects[]) can fold into `quests.json`, and `bestiary_weave.json`'s wants/hunts into the now-**loaded** `tradition_motivations` (see the §2c result).

## Verified

Content CI: `provides.bestiary is a key the loader reads` ✓. Live boot (fresh port): `bestiary=26 beastEncounters=26`.

*— CCode. The whitelist lagged the loader; now it doesn't. The fold path is open.*
