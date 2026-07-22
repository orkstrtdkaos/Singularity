# Verification Model — three tiers, not one (Erik-directed 2026-07-22)

Erik's observation: the "browser-leg is the only accepted proof, and it's Erik's to walk" rule was built for
a world where verifying meant Erik clicking through the live app. Two things we're building dissolve most of
that pile:
- **CCode's browser preview** can drive the live UI headlessly.
- **SNG-207b god-mode** (the author surface) can SET UP any state a test needs — jump to a location, force
  an arc stage, resolve a quest, grant an item — without grinding to reach it.

Together: the preview can be driven to the EXACT condition a leg needs (an arc mid-retreat, a braid just
minted, Teva questing) via god-mode, capture the result, and Aevi verifies at origin. This is different from
CCode's existing fresh-port screenshot — the difference is **god-mode as the state-setup tool**, so the
preview reaches the specific state a leg checks instead of only whatever state happens to exist.

## The three tiers (replaces "browser-leg = Erik's, always")

**Tier 1 — Origin-verifiable (Aevi, now).** The change is in data/code at HEAD. Aevi reads it at
authenticated origin. No UI needed. (Content writes, effect wiring, schema shape, truth-seals.)

**Tier 2 — Preview-verifiable (CCode + god-mode, then Aevi confirms).** The proof is "does the live UI reach
the right STATE." CCode drives the browser preview, using god-mode to set up the precondition, to the exact
condition; captures the result; Aevi verifies the captured state against origin. **Most of the stored
browser-leg backlog is here** — did the arc recede on the World Stands panel, did Teva appear as known, did
the tier badge read right, did the mint beat fire, does the wheel place a braid at the right coordinate.
These no longer wait on Erik.

**Tier 3 — Human-judgment (Erik, irreducible).** The proof is a HUMAN FEELING, not a state check. A preview
can confirm a moment FIRED; it cannot confirm it LANDED. These stay Erik's:
- Does the braid mint feel like a holy-shit moment?
- Does the R+ / romance narration actually land, or read clinical?
- Is the wheel legible on Erik's phone?
- Does an epic's death feel like a landmark or a footnote?
- Does the pacing of "fairly frequently" feel alive vs noisy?
The tell: if the acceptance criterion contains "feels," "lands," "reads as," or "is legible/satisfying," it's
Tier 3. If it contains "shows," "records," "advances," "appears," "equals," it's Tier 1 or 2.

## The reclassification of the current backlog
The ~20-deep "browser-leg" stack was almost all written as Tier-3-by-default because Tier 2 didn't exist yet.
Re-sorted:
- **Tier 2 (moves to CCode-preview):** arc recede/contest on the World Stands panel; Teva/known-people
  registry; braid tier badge + doctrine on the card; creation-flow save; companion stage 3 surfacing;
  most "did X render correctly."
- **Tier 3 (stays Erik):** the braid moment's *feel*; R+ narration landing; wheel phone-legibility; epic-death
  weight; romance/encounter pacing feel.

## What this changes for Aevi's operation
- Stop stacking mechanical checks on Erik as "browser-legs." Route them to CCode-preview + god-mode, then
  verify the captured state at origin.
- Only escalate to Erik the Tier-3 residue — the handful of genuine human-judgment calls.
- **Depends on:** SNG-207b god-mode (the state-setup tool) and CCode's preview being able to consume it.
  Until 207b ships, Tier 2 partially collapses back to Tier 3 for anything needing hard-to-reach state — so
  207b is the unlock for the whole model, worth sequencing with that in mind.

## Status
Directional agreement (Erik). Not a spec yet — it's a workflow/verification-doctrine change that becomes real
when god-mode (207b) + preview integration exist. Recorded here so the browser-leg backlog stops defaulting
to Erik, and so 207b's value is understood as ALSO being the verification unlock, not just an author toy.
