# SPEC — SNG-133: Every character's backstory seeds a personal quest arc at creation
## Aevi (PO) · 2026-07-16 · authored to spec · **awaiting CCode ROUND 2**

> **Erik: "Learn from this and make it part of every character — their backstory is used to create an arc that is a primary personal quest arc."** Brooklyn proved the pattern: Aelyn's bio WAS an arc waiting to be bodied (SNG-132, authored by hand). Make that automatic — every character is born with a central quest generated from the story they wrote.

> **Verified at HEAD `v1.8.89` — this is a hookup, not a new engine:**
> - **Backstory is captured at creation:** `renderBioStep` (app.js L1926) collects hometown/residence/livelihood/hobbies/motivation/story; `finish()` (L1959) writes `character.bio`; the origin's `whyYouAreHere` folds in (L1999). There's even a "✦ Weave it for me" button (L1940) that already generates a bio.
> - **The generate engine already authors arcs:** `GEN_TYPES = ["npc", "location", "arc"]` (generate.js L23). It can produce an arc record.
> - **What's MISSING:** nothing connects them. Backstory→personal-arc generation does not exist (searched — empty). Aelyn's arc was a MANUAL one-off. This spec makes it systematic: at creation, generate a bound personal arc from the bio, exactly like the one hand-authored for Aelyn.

## THE MODEL — the personal arc, generated from the story they told
At the end of creation (right after `finish()` writes `character.bio`), generate a **primary personal quest arc** seeded by the backstory, and bind it to the character (like SNG-132's `boundToCharacter`/`arcId`). The arc is authored by `generate("arc", …)` with the bio as context, producing the same shape as the hand-authored `the_reaching_light`:
- **Premise + stakes** drawn from the character's OWN story — the unresolved tension the player wrote (a dying parent, a lost sibling, a debt, a fall, a question they left home to answer).
- **A legend/antagonist-or-catalyst NPC** generated from the story's other pole (Aelyn's father → Caelum). The person or force the backstory is *about*.
- **3 stages + open routes** (like the shipped arc): a beginning that reaches into their play, a deepening, and a hinge whose ending the player's choices decide — never foreclosed.
- **Bound + paced:** surfaces in THAT character's play across sessions (SNG-132 binding), following the character, not a location.

## SEEDING FROM THE BIO FIELDS (what maps to what)
| Bio field | Feeds the arc's… |
|---|---|
| `motivation` / `whyHere` | the arc's driving question — why they left, what they're chasing |
| `story` | premise + stakes + the catalyst NPC (the other pole of their tale) |
| `hometown` / `residence` | the place the arc reaches back to (a home to return to, lose, or free) |
| domains (SNG-125) | the arc's thematic axis — Aelyn's rootkin/seraphic → the two-substrate arc; a character's domains hint their central tension |
| origin `whyYouAreHere` | the hook the world already gave them |

**Quality guard — the "weave" bar:** the generated arc must be as good as the hand-authored one, or it cheapens the feature. Use a rich generation prompt (the SNG-132 arc as the few-shot exemplar), require the mythic-tragic-or-heroic register, and produce a real catalyst NPC — not a generic fetch quest. A thin backstory ("I'm a wandering fighter") still yields an arc, but a rich one (Aelyn's) yields an epic; the generator scales to what the player gave it.

## ENGINE / UI SURFACES
| Module | Change |
|---|---|
| `app.js` `finish()` (L1959) | After writing `bio`, call `generatePersonalArc(character)` → bind the result; if bio is empty/thin, generate a light hook arc from origin `whyYouAreHere` instead (never zero). |
| `engine/generate.js` | A `generatePersonalArc(character, content)` using `generate("arc", {bio, domains, origin})` with the SNG-132 arc as exemplar; outputs the bound-arc shape (stages/routes/legend NPC + `boundToCharacter`/`arcId`). |
| (ties to SNG-132) | The bound-arc surfacing + pacing + never-foreclose-the-ending wiring is shared — SNG-133 produces the arcs SNG-132 knows how to run. |
| `app.js` (optional UI) | After creation, a one-line "Your story has become a thread here: *{arc name}*" so the player sees their backstory was heard. |
| `tests/*` | A character created with a rich bio gets a bound personal arc with a catalyst NPC + 3 stages + open routes; a thin/empty bio still gets a light hook arc (never zero); the arc binds to that character and surfaces only in their play; the generated arc validates against the quest/arc schema. |

## GUARDS
- **Never foreclose the ending** — generated arcs, like the hand-authored one, keep routes open; the player's choices decide (SNG-132 guard, inherited).
- **Register + quality** — mythic/heroic/tragic as the story warrants; the SNG-132 arc is the quality bar and the few-shot exemplar; no generic fetch-quest personal arcs.
- **Scales to input** — rich backstory → epic; thin backstory → a modest hook; empty → origin-seeded light thread. Always something, never a wall of nothing.
- **Bound + private** — the personal arc is that character's; it surfaces in their play (promoted canon may become shared per SNG-128 lens).
- **Additive, paced** — one primary personal arc per character at creation; it unfolds across sessions, doesn't dump.
- **Rating-aware** — generated at/below the character's rating ceiling.

## OPEN QUESTIONS — CCODE ROUND 2
1. Generate the arc synchronously at creation (a brief "weaving your thread…" beat) or lazily on first play? (Recommend at creation so it's ready + the player sees it was heard; fall back to lazy if generation latency hurts the creation flow.)
2. Re-generation: if a player edits their bio later, offer to re-weave the personal arc, or lock it once created? (Recommend lock-with-optional-reweave; a central arc shouldn't silently change.)
3. Should the catalyst NPC generated here also register in the NPC catalog (so it can recur, be met, be named — SNG-111/119), like Caelum is a full NPC record? (Recommend yes — the arc's legend NPC is a real, recurring person.)
