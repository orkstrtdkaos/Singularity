# SNG-228 — a person can never be a travel destination ("catch Ossian" fixed)

**CCode · 2026-07-23 · v1.8.239 (`d715344c`) · suite + wiring-audit green · clean boot.**
`status: complete_pending_review` (§3b/§3c — CCode's parts) · §3a (parser prompt) is Aevi's lane

Your bug: the travel panel offered *"Set out for Ossian? … Take the road to Ossian"* — but **Ossian is a
PERSON** (Clerk-Warden Ossian). The action was *"fly to the brick hall to catch Ossian"*; the parser put the
person in `travelTo`, and `travelIntentOf`'s trusted path minted "Ossian" as a phantom place
(`resolveLocationId` found nothing → `titleize` → a destination named after a person). The only guard
(`NOT_A_PLACE`) catches pronouns, not proper-name people.

## The fix (§3b/§3c — the code belt, twin of the SNG-188 speech-act belt)
- **`engine/intent.js` `personDestination(ref, action, ctx)`** (PURE, testable): when a trusted `travelTo`
  resolves to no real place, decide if it's a PERSON — signalled by (a) a match in the **NPC registry**,
  (b) a **TITLE** before the name in the action's words (*Clerk-Warden Ossian*), or (c) a **person-only VERB**
  reaching them (*catch/confront/greet/intercept/warn/question/corner*). "find/reach/stop" are deliberately
  **excluded** — they take places too, so they can't disambiguate (no false-positive on a real place).
  Returns `{ isPerson, destId }`.
- **`app.js` `travelIntentOf`**: a REAL place still wins outright; only when the trusted `travelTo` can't place
  does the belt run. A person → **redirect to their PLACE** if it's recoverable from a registered NPC's status
  prose (§3c: travel THERE, not to the person), else **no travel intent** (never a phantom person-place). A
  genuinely new place still mints on arrival (SNG-117), unchanged.

So *"catch Ossian"* no longer offers *"the road to Ossian"* — the person is rejected; if the fiction/registry
knows where they are, travel goes there; otherwise no bogus travel gate is offered.

## ROUND 2 — answered
- **Q1 (registry only vs turn-named people):** both. The registry catches known NPCs; a **title/person-verb
  heuristic** on the action's own words catches a freshly-named person like Ossian who isn't registered yet —
  no new parser field required (the resolver reads the label/exactWords it already has).
- **Q2 (§3c — mint the real place vs redirect):** redirect to a **registered** person's status-named place when
  recoverable; otherwise no travel (don't mint a phantom). Minting the *fiction-named* place (the brick hall)
  from free text is the §3a parser's job — the belt won't guess a place out of prose.
- **Q3 (`travelToPerson` field):** not needed for the fix — the belt keeps the person out of `travelTo` either
  way. A distinct `travelToPerson` (who they're going to reach) is optional richness for the GM's narration;
  left for §3a if Aevi wants it.

## Aevi's remaining lane
**§3a — the parser prompt PERSON-guard** (*"travelTo is a PLACE, never a PERSON; 'fly to the brick hall to
catch Ossian' → travelTo is 'the brick hall', not 'Ossian'"*). That stops the person entering `travelTo` at
the source and lets the REAL place (the brick hall) be extracted. My belt is the backstop and fixes the bug on
its own; §3a is the cleaner upstream fix + the only path that recovers the fiction-named place.

## Honest bound
Tier-1 (Node suite: Ossian caught + rejected; a registered NPC caught; §3c redirect to a status-named place; a
real place with a place-verb NOT mistaken; a plain new place still mints) + the wiring asserted in
`travelIntentOf`. The live confirm — the "take the road to Ossian" gate gone next time Silas tries to reach a
person — is your Tier-2 confirm on next play.

*— CCode. The parser trusted its own travelTo too much: a proper name it couldn't place became a place. Now a
name that reads as a person — by the registry, a title, or the verb going to catch them — is turned away at
the door; you travel to where they are, or you don't get a phantom road named after them. Same shape as the
speech-act belt: one more guard on the trusted path.*
