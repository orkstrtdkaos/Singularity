# CCODE-48 — cleaning up the debris I left

**CCode · 2026-07-31 · v1.8.316 (`13e29e46`) · npm test exit 0 (19 seams, rawProseCaps 63) · boot verified on a never-used port.**

Erik: *"clean all that up and do the fixes."*

All three were **"advertised but inert"** — the worst failure class in this codebase, because the content file *and*
the test suite both assert the feature exists while nothing actually runs it.

## 1. An invented verb, and a counterplay that could never fire

CCODE-41 added `conceal_deep` to `persistentEffects.byFunction`. **It is not one of the 24 canonical verbs — I
invented it.** No craft can carry a function that isn't in the vocabulary, so "senses blinded" could never land on
anyone.

Worse: I "fixed" this once mid-session on a wrong theory (while chasing a boot failure), the fix was lost in a
revert, **and my own status report to Erik then repeated the claim that it was fixed.** It wasn't. He asked me to
clean it up, which is how I discovered my own report was wrong.

`deniesPhase: "setup"` now sits on **`deceive`** — a real verb, and a better fit anyway (being misled plausibly
denies your read). The invented key is deleted, and a new test asserts **every** key in `byFunction` is a real verb
from `function_vocabulary.json`, so this class cannot recur.

## 2. `phaseDenied` had zero consumers

I wrote the helper, exported it, authored its content, and wrote **three tests** for it — and never called it from
anywhere. The blinding counterplay was entirely decorative.

It is now consumed in `skillBattlePanel`: a blinded fighter is skipped past the SENSE step, with a visible
**"Blinded — your senses are shut this turn"** bar, instead of being offered a step they cannot take.

**The wiring audit had been telling me.** Its "NEW export with no consumer" note listed `phaseDenied` on every
single run. I read past it because the tests were green — which is exactly the trap: a test that calls a function
directly proves nothing about whether the *app* calls it.

## 3. A round is a turn, not a step

Action and bonus each advanced the round counter, so a three-turn fight displayed as round 6. Only the step that
**ends** the turn advances it now (the same signal that ticks effects), so sense and mid-turn steps are free.

---

## SNG-246 Fix A — not built, and it needs a ruling

The ticket: *"a committed fight goes structured by ENGINE, not the GM's memory of rule 18."*

The clean hook already exists — `harmGateFor` fires when the player commits a lethal-rung craft. **But it does not
name a target.** It knows only that the craft can kill. Minting a duel from that means the engine inventing *who*
is being fought — the same guess that produces phantom entities (cf. `seam_travelTo_is_place`, where a person got
minted as a destination).

| | approach | trade |
|---|---|---|
| **a** | mint a duel against the most recently-met NPC | cheap; wrong whenever the scene holds more than one person |
| **b** | engine sets a HARD directive next turn (*"you MUST frame this as a bounded encounter carrying `encounterId`"*) | reuses the proven `encounterOfferDetail` machinery, invents nothing — but is a directive, not true enforcement |
| **c** | extend `harmGateFor` to carry the target the player actually chose | the right fix; the largest |

**Recommendation: (c), with (b) as the fallback** for a turn where the target still can't be resolved.

I did not guess at this. Having just spent this ticket correcting three things I'd previously reported as done,
inventing an opponent-resolution rule at the tail of a long session is precisely the wrong instinct.

## SNG-246 Fix C — largely covered
`frameExits` already surfaces defeat/flee/fail, and CCODE-42 gave the finish condition honest situational odds.
What remains is the **fight→chase morph being visible**, which is small.

## Files
`content/packs/core/rules/skill_battle_system.json` (verb fix) · `app.js` (phaseDenied consumer + blinded bar) ·
`engine/encounters.js` (round == turn) · `tests/skill_battle_sim.mjs` (+3 checks) · `po/COMBAT_DIALS.md` (regenerated).

*— CCode. Three features that claimed to exist now do. status: complete_pending_review.*
