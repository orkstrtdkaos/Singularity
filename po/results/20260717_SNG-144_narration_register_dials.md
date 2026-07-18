# Results — Narration register dials (SNG-144)

Date: 2026-07-17 · HEAD `b194127` · **v1.8.104** · full suite green · browser-verified (served bytes + live Settings). Status: **shipped, complete_pending_review.**

Erik + Brooklyn: the GM over-writes in **two directions at once** — too poetic/philosophical when a scene wants plain and direct (Brooklyn's note; the Tether "meet people in plain language" lesson), AND too soft/euphemistic when a scene wants to commit (visceral violence, natural profanity, charged embodied physical/sensual description at the rating the table chose). **One miscalibration** — a narrator that flinches from directness of every kind — and the fix is **user-controlled dials, not a word list.** Builds on SNG-048's `narrativeRegister`/`ratingRegister` (region + rating already computed); this adds the missing **user layer**.

## Two independent per-profile sliders (3 stops each — OQ1; mirror the SNG-127 pacing setting)

### Plainness — plain / balanced / lyrical (Brooklyn's dial) — `engine/gm.js narrativeRegister`
`narrativeRegister(location, plainness)`:
- **PLAIN** overrides the place's earned register **DOWNWARD** to concrete + a firm plain directive ("say what is actually there, in first-read words; minimal metaphor, no abstract personification or philosophical framing"), and **strips the lyrical tint** — the player's comfort wins over a region's lyricism, so Brooklyn's setting holds everywhere she plays.
- **LYRICAL** nudges a grounded place a touch up ("reach a little more for image than the place alone earns").
- **BALANCED** = the current SNG-048 behavior (the place sets the voice). Region tints still apply either way.

### Bluntness — restrained / balanced / blunt (the "commit to the scene" dial, rating-capped) — new `engine/gm.js bluntnessDirective`
`bluntnessDirective(preset, bluntness)`, composed into `ratingLineForGM` right after the rating register and before the ABSOLUTE FLOORS:
- **BLUNT** commits to what the scene IS, using the **full room the rating gives and no less** — violence visceral and physical (real blood, injury, aftermath, named plainly); characters curse naturally where such people would; physical/sensual description direct and embodied, never dissolved into vague poetry or faded early above the rating floor. (The fix for "Silas and Pell in the bath read euphemistic when it should be direct and charged.")
- **RESTRAINED** keeps it spare — consequence implied, the camera may drift.
- **BALANCED** adds nothing (current behavior).
- **ALWAYS rating-capped** — the directive names the `${preset}` ceiling and says "NEVER exceed it." **PG-13 blunt is still PG-13** (verified: no explicit/graphic content added). The **R+ ceiling is unchanged** by this ticket (it already defines its evocative-not-explicit register); the dial adjusts how fully the narration *uses* the room the rating gives, never the room itself.

## Precedence (how they compose)
1. **Rating ceiling** — absolute cap on bluntness; minor-safety + prohibited-content floors are independent and never moved by any dial (they sit in `ratingLineForGM`, untouched).
2. **User sliders** — the player's plainness + bluntness (per-profile, mirror `pacing`), the primary register drivers.
3. **Region voice** — modulates texture within what the sliders allow (SNG-048 tints, kept).

## Guards honored
- **Rating + floors are the cap; dials never exceed them** — bluntness works within the rating; the blunt directive re-states the ceiling and the floors line is unchanged.
- **The dials adjust HOW the narration uses the room, not the room** — R+ ceiling not raised; no explicit-act content added.
- **Plainness is the player's comfort and wins downward** — a plain-dialed player is never forced into lyricism by a region.
- **Per-profile** — each family member's dials are their own (Brooklyn plain, another lyrical); stored on the profile like `pacing`. OQ2 (shared-scene blend): the register is driven by the narrated player's profile (`profile.plainness`/`bluntness`) — the same per-profile resolution as pacing; a mixed-table blend can layer later if wanted.
- **Reuses SNG-048** — adds the user layer to `narrativeRegister`/`ratingRegister`; doesn't rebuild the engine.
- **Defaults Balanced/Balanced** (OQ3) — the over-writing complaint is fixed by the dial, not by surprising current players with a new default.

## Verification
- **12 smoke tests:** PLAIN overrides an abstract/charged place → concrete + plain directive (region overridden); balanced leaves the earned band intact; LYRICAL nudges a concrete place up; PLAIN strips the lyrical tint but keeps a non-lyrical one (a stark place stays stark); BLUNT at R commits (visceral/profanity/embodied) and is rating-capped; PG-13 blunt is still PG-13 (no explicit/graphic); RESTRAINED is spare, balanced empty; `ratingLineForGM` composes the bluntness dial before the floors; the register block passes plainness; Settings expose + save both dials. Full `npm test` green.
- **Browser-runtime (served bytes, fresh port 8104):** served `narrativeRegister` plain-overrides an abstract place; served `bluntnessDirective` commits + is rating-capped, PG-13 stays PG-13, balanced empty; **both dials render live in Settings** (Plainness: Plain/Balanced/Lyrical; Bluntness: Restrained/Balanced/Blunt, Balanced default); v1.8.104; boot-clean.
- **Not headless-reachable:** the GM actually writing plainer / more committed prose in a live scene — a prompt-register behavior; the directive assembly, the override logic, the rating cap, and the UI are all fully verified.

## Files
`engine/gm.js` (`narrativeRegister` plainness param + new `bluntnessDirective`) · `app.js` (thread plainness into the register + bluntness into `ratingLineForGM`; two Settings selects + save; import) · `tests/smoke.mjs` · `index.html` (v1.8.104).
