# SPEC — SNG-142: A GM that offers the player their own toolkit — skills, combinations, aspirations, attribute actions
## Aevi (PO) · 2026-07-17 · authored to spec · **awaiting CCode ROUND 2**

> **Erik: "The GM should be smarter about suggesting skills for use, novel combinations, practice of aspirations, or even just attribute-based actions."** The player shouldn't have to remember their whole toolkit — a good GM holds it up in the moment.

> **Verified at HEAD — strong REACTIVE machinery, no PROACTIVE surfacing:**
> - NOVEL USE + COMBINATIONS are well-handled *when the player attempts one* (gm.js rule 16, `comboAbilities`, DISCOVERY-eligible on a novel/combined crit) — but the GM never SUGGESTS a novel use or combination.
> - Attribute/sub-attribute actions resolve fine (the intent parser maps to physical/mental/social/practical + sub) — but the GM doesn't remind a player that a plain attribute action is an option when they're stuck.
> - **Aspirations exist as a full system** (`declareAspiration`/`recordAspirationProgress`/`asp*`, app.js L37) — but `aspiration` appears **0 times in gm.js.** The GM is BLIND to the player's declared aspirations, so it can't steer a scene toward practicing one.
> - **The SNG-124 gap-aware recommender (`recommendSkills`) feeds only the wheel UI, not the GM** — the intelligence about what the player should explore never reaches narration.
> **Root: the GM reacts to what the player does; it doesn't proactively offer what the player COULD do.** All the data exists; none of it is surfaced as "here's what's available to you."

## THE DESIGN — a "WHAT YOU COULD REACH FOR" context block + a rule to use it lightly
Enrich the GM context each turn with a compact toolkit summary, and add a rule that spends it as an OFFER, not a nag.

### 1. The toolkit context block (new)
A compact block the engine builds each turn (like the RIPE FOR MASTERY + POSSIBLE ERROR blocks already do):
- **Your notable abilities** — the character's owned crafts by name, especially ones UNUSED-lately or newly-ranked (so the GM can nudge toward a tool the player may have forgotten). Reuse `recordUse` recency.
- **Combination candidates** — 1-2 pairs of the character's OWN abilities that could plausibly combine here (the intelligence exists in the novel/combo resolver; surface the *suggestion* side). E.g. Silas: "deathsense + order_sense read as a Double Register" (a real combo he discovered).
- **Aspiration in play** — the character's declared aspiration(s) + progress, so the GM can bend a beat toward practicing it. THIS IS THE BIG GAP — the GM currently can't see them at all.
- **Attribute fallback** — a reminder that a plain attribute/sub-attribute action is always available (for when a player has no perfect ability — "your Agility alone could serve here").
- **Gap nudge (SNG-124)** — pipe `recommendSkills`'s gap-awareness in: "you've no RESTORE craft yet — a moment may come to want one."

### 2. The rule (how the GM SPENDS it) — offer, don't nag
- **Rule 16B — OFFER THE TOOLKIT, LIGHTLY.** When a player seems stuck, is casting about, or a beat is a natural fit for a tool they have, the GM MAY surface ONE option from the toolkit block — a skill, a novel combination, an aspiration-advancing move, or a plain attribute action — woven into the fiction, not listed as a menu. NEVER more than one per beat, NEVER every beat, NEVER when the player has their own clear intent. The GM offers a door; the player always chooses.
- **Aspiration-aware pacing.** When the fiction can naturally present a chance to practice a declared aspiration, favor it — the world quietly offering the player the growth they said they wanted. (Not forcing; presenting.)
- **Combination discovery, invited.** The GM may HINT that two of the player's crafts might reach further together ("deathsense catches the end; order_sense catches the pattern — together, perhaps, something you haven't tried") — turning the well-built combo RESOLVER into an occasional combo INVITATION.

## ENGINE / UI SURFACES
| Module | Change |
|---|---|
| `engine/gm.js` context build | A `TOOLKIT` block: notable/unused-lately abilities, 1-2 combo candidates, declared aspiration(s)+progress, the attribute-fallback reminder, SNG-124 gap nudge. Mirror the RIPE FOR MASTERY block's construction. |
| `engine/gm.js` rules | Rule 16B (offer-the-toolkit-lightly, ≤1/beat, never on clear player intent) + aspiration-aware pacing. |
| `engine/aspirations` → context | Surface `declareAspiration`/`recordAspirationProgress` state into the GM context (the 0-mentions gap). |
| `recommendSkills` (SNG-124) → GM | Pipe the gap-aware output into the toolkit block, not just the wheel. |
| `tests/*` | The toolkit block lists owned abilities + a real combo candidate + the declared aspiration; the GM offers ≤1 option/beat and NONE when player intent is explicit; an aspiration in play biases a fitting beat; a stuck player gets an attribute-action reminder; no toolkit spam across consecutive beats. |

## GUARDS
- **Offer, never nag** — ≤1 suggestion per beat, never when the player has clear intent, never a menu; woven into fiction. The player's agency is the point; the GM widens the door, doesn't push through it.
- **The player's OWN toolkit** — suggest the character's actual abilities/attributes/aspirations, not new powers; a combo suggestion uses two crafts they HAVE (composes with the novel/combo resolver + DISCOVERY rules, unchanged).
- **Aspiration = present, not force** — bend a beat toward a chance to practice; never railroad the player into their aspiration.
- **Reuses built systems** — recency (`recordUse`), combos (rule 16), aspirations (the existing system), gap-awareness (SNG-124). This surfaces them to the GM; it doesn't rebuild them.
- **Rating + minor-safe** as all GM output.

## OPEN QUESTIONS — CCODE ROUND 2
1. Combo-candidate generation: compute 1-2 plausible pairs engine-side (cheap heuristic: two owned abilities whose functions/axes are adjacent), or let the GM propose from the ability list in context? (Recommend engine surfaces the ability list + a light "these two are adjacent" hint; the GM decides if the beat fits.)
2. "Unused-lately" threshold from `recordUse` recency — N beats since last use? (Tune so the nudge feels like a reminder, not a scold.)
3. Aspiration surfacing: full progress detail, or just "declared: X (in progress)" so the GM knows to look for chances? (Recommend the lighter form — enough to bias pacing, not to micromanage.)
