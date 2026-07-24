# SPEC — SNG-228: A person parsed as a place — "catch Ossian" minted Ossian as a destination
## Aevi (PO) · 2026-07-22 · verified at origin

> **Erik, live (screenshot):** the travel-intent panel offered *"Set out for Ossian? … Take the road to
> Ossian"* — but **Ossian is a PERSON** (Clerk-Warden Ossian, "the one who decides what gets to the
> committee"). The action was "fly to the brick hall … catch Ossian before she leaves." The game turned the
> PERSON into a DESTINATION.

## §1 — Verified: the person slipped through the "trusted destination" path
The travel-intent resolver `travelIntentOf` (app.js:4425):
- The free-text parser set **`travelTo: "Ossian"`** (the action named flying to CATCH Ossian; the parser
  grabbed the person as the destination).
- `travelIntentOf` runs `travelTo` through the **TRUSTED path** (line 4434): a parser-named `travelTo` is
  honored *even for an unmapped place* — `resolveLocationId("Ossian")` finds nothing → `destId: null` →
  `titleize("Ossian")` → **"Ossian" minted as a phantom destination on arrival.**
- The only guard is **`NOT_A_PLACE`** (line 4416) — a regex of generic pronouns
  (`there|here|him|her|it|home|back…`). It has **NO way to catch a proper name that is a PERSON.** "Ossian"
  isn't a pronoun, so it passes.
- Confirmed: **Ossian is not yet in the NPC registry** — he was just NAMED in the fiction this turn (the boy
  said "Clerk-Warden Ossian"). So he's a freshly-mentioned person, not a place, and nothing checked "is this
  a person?" before treating him as a destination.

**Root: the parser can put a PERSON in `travelTo`, and the resolver has no person-check to reject it.** Two
layers, both need a fix.

## §2 — The real destination was NAMED — and it's a place
The fiction gave the actual destination plainly: *"Corner room, second floor, the brick hall behind the north
gate registry."* THAT is where Silas is flying — a PLACE. "Ossian" is WHO he's going to catch there. The
parser collapsed "fly to [PLACE] to catch [PERSON]" into "travel to [PERSON]", losing the place and promoting
the person. So the fix isn't just "reject the person" — it's "the destination is the PLACE the person is at."

## §3 — The fix (two layers)
### §3a — Parser: travelTo is a PLACE, never a person (prompt fix)
The intent-parser prompt (the Haiku classifier) already has good travelTo discipline (SNG-188: speech-acts
don't travel). Add a PERSON guard: *"travelTo is a PLACE the character goes to — a location, never a PERSON.
'Fly to the brick hall to catch Ossian' → travelTo is 'the brick hall' (the place), NOT 'Ossian' (the person
they'll find there). If the action names going to REACH or CATCH someone, travelTo is WHERE that person is (if
the fiction names a place), else null — never the person's name."* This stops the person entering travelTo at
the source.

### §3b — Resolver: reject a travelTo that is a known/named PERSON (code belt)
Behind the prompt, the same way `isSpeechAct` and `NOT_A_PLACE` are code belts behind the parser: before the
trusted path mints `travelTo` as a place, check it's not a person:
- **If `travelTo` matches a known NPC** (registry name/alias) → it's a person, NOT a destination. Reject the
  trusted-mint (return null or fall through to the guessed-place path that requires a REAL place).
- **If `travelTo` matches a person NAMED in this turn's fiction but not yet registered** (like Ossian) → also
  reject as a destination. (Harder — needs the turn's named-entities; at minimum, a proper-name that
  resolves to no location AND appears in an NPC-context phrase shouldn't mint as a place. Simplest robust
  rule: a trusted `travelTo` that `resolveLocationId` can't place should be CROSS-CHECKED against NPCs/
  named-people before minting — if it looks like a person, don't mint a phantom place.)
- **Extend NOT_A_PLACE's spirit:** the pronoun regex catches generic non-places; add a person-check (registry
  + this-turn's named people) so PROPER-name people are caught too, not just pronouns.

### §3c — When the person's place IS known, travel THERE
If the action is "catch Ossian" and the fiction/registry knows WHERE Ossian is (the brick hall), the travel
intent should resolve to THAT PLACE, not be dropped. So the belt isn't just "reject the person" — it's
"redirect to the person's location if known, else no travel intent." The brick hall behind the north gate
registry is the real destination; if it's a mintable/known place, travelTo should become IT.

## §4 — Why this matters (and the family it's in)
A person-as-place mints a phantom location, offers a nonsense travel gate ("take the road to Ossian"), and —
if taken — would move the player to a fabricated place named after a person. It's the same "the parser's
travelTo is trusted too much" family as SNG-188 (speech-acts becoming travel) — that added the `isSpeechAct`
belt; this adds the person belt. The trusted path needs one more guard: a destination must be a PLACE, not a
PERSON.

## OWNERSHIP
- Aevi: §3a — the parser prompt PERSON-guard (prompt content, my lane). I author the travelTo-is-a-place-not-
  a-person directive.
- CCode: §3b/§3c — the resolver code belt (person cross-check in travelIntentOf, redirect-to-person's-place-
  if-known). Engine.

## GUARDS
- **travelTo is always a PLACE** — parser and resolver both enforce it; a person's name must never become a
  destination.
- **Don't drop the intent — redirect it** — "catch Ossian" where Ossian's place is known should travel to the
  PLACE, not become a no-op. Only drop to null when no place is recoverable.
- **Reuse the belt pattern** — this is the SNG-188 `isSpeechAct` shape (a code belt behind the parser); don't
  build a new travel subsystem, add the person-check to the existing guard.
- **A phantom person-place must never be minted** — the trusted-mint path (destId null → titleize) must not
  fire for a name that reads as a person.

## OPEN QUESTIONS — CCODE ROUND 2
1. §3b — cross-check travelTo against (a) the NPC registry only, or (b) also this-turn's named entities (to
   catch a freshly-named person like Ossian who isn't registered yet)? The registry alone misses Ossian;
   catching turn-named people is more robust but needs the parser to expose named-people (it could add a
   `namedPeople` field, or the resolver scans the label/words for the person context "catch/reach/find X").
2. §3c — when the person's place is named in fiction but not a known location id, mint the PLACE (the brick
   hall) as the destination (SNG-117 mint-on-arrival), or offer it as a place to discover? (Minting the real
   place is better than either a phantom person-place or a dropped intent.)
3. Could the parser add a `travelToPerson` field (who they're going to reach) distinct from `travelTo` (where)
   so the GM can narrate "you fly to the brick hall to find Ossian" with both? Optional richness; the core fix
   is keeping the person OUT of travelTo.
