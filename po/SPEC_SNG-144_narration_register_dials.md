# SPEC — SNG-144: Narration register dials — plainness, bluntness, region voice (rating as the cap)
## Aevi (PO) · 2026-07-17 · authored to spec · **awaiting CCode ROUND 2**

> **Erik + Brooklyn:** the GM over-writes in two directions at once — too poetic/philosophical when a scene wants plain and direct (Brooklyn's note; the Tether "meet people in plain language" lesson), AND too soft/euphemistic when a scene wants to commit — visceral violence, natural profanity, charged and embodied physical/sensual description at the rating the table has chosen. **These are one miscalibration** (a narrator that flinches from directness of every kind), and the fix is USER-CONTROLLED DIALS, not a word list — put register in the player's hands so it matches what the scene, the rating, and their taste call for.

> **Verified at HEAD — a strong engine foundation exists; the USER CONTROL does not:**
> - `narrativeRegister(location)` (gm.js SNG-048) already computes **concrete↔poetic** from the region's `concrete_abstract` axis + charge, with region-flavored **tints** (mechanical→precise/clinical, death_life→verdant, falsehood_truth→stark/slippery). So REGION-VOICE is already partly built.
> - `ratingRegister(preset)` already frames rating as **direction, not just cap** (R+ = "unflinching and visceral on violence… charged/sensual on intimacy — evocative, never explicit depiction").
> - **What's MISSING: any user-facing control.** Brooklyn can't dial plainness UP independent of where she is; the rating direction isn't an adjustable intensity; nothing lets a player say "less lyrical" or "commit harder at my rating." No `plainness`/`proseStyle`/register setting exists (searched — none). The per-profile `pacing` setting (SNG-127) is the pattern to mirror.

## THE DESIGN — two independent user sliders + region modifier, rating as the ceiling
Per Erik: plainness and bluntness are **separable axes** (you can want plain AND blunt, or lyrical AND restrained), region layers on top, and the rating sets the CAP on how far bluntness reaches.

### Slider 1 — PLAINNESS ↔ LYRICISM (Brooklyn's dial)
How much the prose reaches for metaphor, personification, and philosophical framing vs. stays plain, literal, first-read.
- **Plain end:** "Say what is actually there, in first-read words. No abstract personification, minimal metaphor, no philosophical framing. Short, clear, grounded." (Brooklyn's setting.)
- **Lyrical end:** the current default — imagery, the felt-but-unnamed, allowed to unsettle.
- Interacts with region: a plain-dialed player in an ABSTRACT/charged place still gets grounded prose (the user dial can OVERRIDE the region's earned lyricism downward — the player's comfort wins). A lyrical-dialed player in a concrete place gets a touch more image than the place alone would earn.

### Slider 2 — RESTRAINT ↔ BLUNTNESS (the "commit to the scene" dial, rating-capped)
How unflinchingly the narration commits to what the scene IS — within the rating.
- **Blunt end (at R/R+):** violence is visceral and physical — real blood, injury, aftermath, named plainly; characters CURSE naturally in dialogue where they would; physical and sensual description is direct and embodied (a body described as a body, a charged scene that stays present and unhedged) — NOT dissolved into vague poetry or faded to black above the rating floor. This is the fix for "Silas and Pell in the bath reads euphemistic when it should be direct and charged."
- **Restrained end:** consequence implied, kept spare, the camera drifts — for a player who prefers less.
- **Rating is the CAP:** bluntness can only reach as far as the rating's ceiling allows. At PG-13 the blunt end is still PG-13. At R+ the blunt end delivers the full mature register the rating already defines (visceral/charged/sensual, evocative — the existing R+ ceiling, NOT changed by this spec). The dial adjusts how fully the narration USES the room the rating gives; it never exceeds it.

### Modifier — REGION VOICE (already partly built; expose + extend)
Place shapes texture (SNG-048 tints): Deep Works terse/mechanical/precise; Wild Half strange/unruly/shifting; a verdant place quickening; a stark place unflinchingly clear. Keep the engine computing this from the region's axes; the user sliders MODULATE it (plainness can damp a region's lyricism; bluntness works within it).

## PRECEDENCE (how they compose)
1. **Rating ceiling** — absolute cap on bluntness; minor-safety + prohibited-content floors are independent and never moved by any dial.
2. **User sliders** — the player's plainness + bluntness, per-profile (mirror SNG-127 pacing), the primary register drivers.
3. **Region voice** — modulates texture within what the sliders allow.
So: rating says how far bluntness CAN go; the player's dials say how plain and how blunt they WANT it; the region colors the result.

## ENGINE / UI SURFACES
| Module | Change |
|---|---|
| Settings (mirror SNG-127 pacing) | Two per-profile sliders: **Plainness** (plain↔lyrical) + **Bluntness** (restrained↔blunt), with plain-language labels + a one-line explainer each. Store on profile like `pacing`. |
| `engine/gm.js` `narrativeRegister` | Take the player's plainness dial as an input that can override the region's earned band downward (plain wins) or nudge it up; keep region tints. |
| `engine/gm.js` `ratingRegister` / register assembly | Take the bluntness dial: at a given rating, select the affirmative-and-committed phrasing (blunt) vs. the spare phrasing (restrained), CAPPED by the rating. Emphasize: at R/R+, blunt = visceral violence + natural profanity + direct embodied physical/sensual description, within the existing ceiling. |
| GM context assembly | Compose rating-cap → user sliders → region into the single REGISTER block the GM already receives. |
| `tests/*` | Plainness-plain yields grounded prose even in an abstract charged place (user overrides region); bluntness-blunt at R yields committed visceral/direct phrasing, bluntness-restrained yields spare; bluntness NEVER exceeds the rating cap (PG-13 blunt is still PG-13); minor-safety/prohibited floors hold regardless of any dial; region tints still apply. |

## GUARDS
- **Rating + floors are the cap, dials never exceed them** — bluntness works WITHIN the rating; minor-protection and prohibited-content floors are absolute and independent of every dial (unchanged).
- **The dials adjust HOW the narration uses the room the rating gives — they don't change the room.** R+ already defines its ceiling; this spec does not raise it. (No explicit-act content is added by this ticket; R+ stays evocative-not-explicit per the existing register.)
- **Plainness is the player's comfort and wins downward** — a plain-dialed player is never forced into lyricism by a region; Brooklyn's setting holds everywhere she plays.
- **Per-profile** — each family member's dials are their own (Brooklyn plain, someone else lyrical); a shared scene resolves per whose turn is narrated, or a sensible blend — CCode's call.
- **Reuses SNG-048** — builds on `narrativeRegister`/`ratingRegister`; adds the user layer, doesn't rebuild the engine.

## OPEN QUESTIONS — CCODE ROUND 2
1. Slider granularity — 3 stops each (e.g. Plain / Balanced / Lyrical; Restrained / Balanced / Blunt) or a finer scale? (Recommend 3 stops — legible, matches the pacing setting's feel.)
2. Shared-scene resolution when family members have different dials — narrate per active player's dials, or blend to the plainer/less-blunt of those present (safer for a mixed table)? (Recommend: per active player, but never exceed the MOST restrictive rating present.)
3. Default stops — Balanced/Balanced, or default plainness a touch toward plain given the over-writing complaint? (Recommend Balanced/Balanced; let the complaint be fixed by the dial, not a new default that surprises current players.)
