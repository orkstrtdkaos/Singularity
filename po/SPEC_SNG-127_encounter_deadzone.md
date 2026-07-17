# SPEC — SNG-127: The world must actually happen — fix the encounter dead-zone
## Aevi (PO) · 2026-07-16 · authored to spec · **awaiting CCode ROUND 2 · HIGH priority (core play feel)**

> **Erik: "I've never encountered a fight or any event in the world — I want things to happen regularly. Crank up the event chances everywhere."** Diagnosed at HEAD: **the base chances are NOT the problem — a missing config + a stack of suppressors is.** The fix is surgical, not a blanket multiply (which would over-fire the paths that already work and still leave the real gap).

> **Verified at HEAD `v1.8.82`. Root causes, in order of impact:**
> 1. **THE BIG ONE — the narrative-play path has no config and silently defaults to ~4%/hr.** In normal chat play the player doesn't click "travel"/"rest" buttons — the GM narrates and time passes, and `maybeNarrativeEncounter` → `rollNarrativeTime` → `narrativeTimeChance` is the path that should fire. But **`triggerRules.onNarrativeTime` is ENTIRELY MISSING from `random_encounters.json`**, so the code falls back to a hardcoded `ratePerHour = 0.04`. If beats pass 1–2 fiction-hours each, that's **4–8% per turn** — a whole session can roll nothing. **This is the dead-zone.**
> 2. **A stack of hard suppressors before the roll:** `NARRATIVE_ENCOUNTER_COOLDOWN = 3` turns · once-per-scene (`sceneEncounterFired`) · suppressed on any intense/intimate beat · suppressed during combat/gambit. Each is a *return-nothing* gate; together they gate out most turns even when a roll would pass.
> 3. **The content is fine and waiting:** 58 encounters in the table; real danger levels (bedrock 2, cloudform 3); travel 0.35 / rest 0.15 / enter 0.12 are reasonable. **Nothing fires often enough to reach the 58 built encounters.** So this is a *trigger* problem, not a content or base-rate problem.

## THE FIX (targeted — not a blanket multiply)
### 1. Add the missing `onNarrativeTime` rule with a real rate (the actual fix)
Add to `random_encounters.json triggerRules`:
```json
"onNarrativeTime": { "ratePerHour": 0.14, "maxChance": 0.6,
  "note": "the main path in narrative play — time passing turns things up" }
```
~0.14/hr (up from the 0.04 fallback) means a half-day's walk (~6h) → ~0.6 cap, a short 2h beat → ~28%. That's "things happen regularly" without every single beat being an event. **This one change is most of what Erik wants.**

### 2. Loosen the suppressor stack
- **Cooldown 3 → 1** (`NARRATIVE_ENCOUNTER_COOLDOWN`): one quiet beat between events, not three. (Consider moving it to `rules` so it's tunable without a code edit.)
- **Once-per-scene → allow a second** on a long scene (e.g. reset `sceneEncounterFired` after N eventful-free turns within the same scene), so a long stay isn't capped at one thing ever.
- Keep the intense/intimate + combat/gambit suppressors (those are correct — don't interrupt a kiss or a duel).

### 3. Nudge the bounded paths up modestly (since Erik wants MORE, world-wide)
- `onTravel` 0.35 → **0.45**, `onEnterLocation` 0.12 → **0.20**, `onRest` 0.15 → **0.20** (wilderness only, unchanged rule). Modest, so the click-paths also feel more alive without becoming spammy.
- Danger multiplier is already `×(1 + danger×0.1)` — leave it; danger already amplifies correctly, and the valley HAS danger levels.

### 4. Make the rates tunable (so "crank it" is a config edit, not a code hunt)
Move the fallback rate, cooldown, and cap into `rules`/the table so future tuning (yours or Aevi's) is a JSON change with no code edit. Right now the key rate is a hardcoded fallback — that's why it was invisible.

## EXPECTED FEEL AFTER
- A normal session of narrative play turns something up every few beats (mix of the 7 flavors — beneficial/benign/beautiful/dangerous/theft/chase/fight, danger-weighted), instead of near-silence.
- Fights specifically: high-danger locations (cloudform 3, bedrock 2) now skew toward dangerous/fight per the existing `flavorWeightByDanger`, so moving through danger produces combat — which, with SNG-098 skill battles shipped, drops into the real duel panel.
- The world pressure system (SNG-080, `maybeWorldPressure`) still backstops quiet stretches with escalating narrative pressure.

## ENGINE / UI / CONTENT SURFACES
| Module | Change |
|---|---|
| `content/packs/valley/events/random_encounters.json` | Add `onNarrativeTime` rule; bump onTravel/onEnter/onRest per above. |
| `app.js` | `NARRATIVE_ENCOUNTER_COOLDOWN` 3→1 (or read from rules); allow a 2nd scene encounter after a quiet stretch. |
| `engine/random_encounters.js` | Read the (now-present) `onNarrativeTime` rule instead of the 0.04 fallback; expose the cap/rate from config. |
| `rules` (resolution.json) | Optional home for cooldown/rate/cap so tuning is code-free. |
| `tests/*` | With `onNarrativeTime` present, a multi-hour narrative beat fires at the configured rate; cooldown 1 respected; a fight-flavored encounter in a danger-3 location routes to the skill-battle panel; intense/intimate + combat still suppress. **A simulated 30-turn session produces multiple encounters (not zero).** |

## GUARDS
- **Decline/flee always offered before a lethal engagement** (SNG-002b, `lethalRule`) — cranking frequency must NOT remove the escape path. More encounters, same consent-before-danger.
- **Don't interrupt intimate/grief/combat beats** — those suppressors stay; "regularly" ≠ "in the middle of a kiss."
- **Danger-weighting preserved** — safe places still skew kind, dangerous places skew fights; the valley stays "hopeful-strange, not grim."
- **Tunable, not hardcoded** — the point is that the next "make it more/less" is a config change, so we never again have an invisible 4% fallback.

## OPEN QUESTIONS — CCODE ROUND 2
1. Confirm `maybeNarrativeEncounter` is actually called every narrative GM turn (if it's only called on certain turn kinds, that's an additional suppressor to check).
2. Is `hoursPassed` reliably populated by `timeOps` each beat? If the GM often reports 0 hours, the narrative-time path never accrues — may need a per-turn floor (treat a beat as ≥N minutes) so time-passing isn't undercounted.
3. Simulate: what encounter-per-10-turns rate does 0.14/hr + cooldown 1 actually yield against typical `hoursPassed` values? Tune the rate to hit "every few beats," not every beat.
