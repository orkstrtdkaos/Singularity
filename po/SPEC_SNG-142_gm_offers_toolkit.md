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

## PART 1B — The toolkit is the WHOLE situation: items, companions, party (Erik amendment)
> **Erik: "This includes item, companion and party member inclusion in all of the above."** The toolkit a good GM offers isn't just the character's skills — it's everything they can reach for: what they CARRY, who travels WITH them, and what the PARTY brings.

> **Verified at HEAD — same reactive/proactive gap, one layer wider:** items (INVENTORY block, gm.js L191), companions (L190), and party members (L189) ARE in the GM context — but framed as SCENE-DRESSING, not TOOLKIT. The rules say "reference items by exact name," "voice companions true to persona," "narrate party members" — the GM knows they're PRESENT; it's never prompted to OFFER them as options, and companion/party detail carries persona, not offerable CAPABILITY. So the GM won't nudge "Huginn could scout that ledge," "Pell's smithing could mend it," or "your and Kaede's blades together might—".

**Every part of SNG-142 extends to include these:**
- **The TOOLKIT block gains:**
  - **Items as options** — not just "you carry Memory" but "Memory (the deathbound spear) could serve HERE" when a beat fits a carried item; especially a growing/legendary item (SNG-137 itemUpdates) or a consumable the player forgot they have.
  - **Companion capabilities** — what each companion CAN DO, not just who they are: Huginn (a carrion bird that attends endings) can scout, watch, reach where you can't. Surface the capability so the GM can offer it.
  - **Party-member capabilities** — in a shared family scene, what the OTHER players' characters bring: Aelyn's rootkin life-craft, Saehara's blade-mind. So the GM can invite cooperative play ("this is beyond you alone — but not beyond you and Aelyn").
- **Combinations extend across ALL of them** — the novel/combo invitation (Part 1) isn't just ability+ability. It's:
  - **ability + item** ("your deathsense, channeled through Memory, might reach further")
  - **ability + companion** ("send Huginn ahead and your order_sense reads what he sees")
  - **ability + party member** ("Saehara's stillness and your deathsense, together, could hold that threshold") — the cooperative combo, the heart of family play.
- **Aspiration practice can involve them** — an aspiration advanced WITH a companion or party member (a bond deepened, a craft taught) counts; the GM can steer a beat toward that shared growth.
- **Attribute actions include the situation** — "your Strength, or Pell's, could force it" — a plain attribute action isn't only the character's own.

## PART 1B — surfaces (added)
| Module | Change |
|---|---|
| `companionsDetail` / `partyDetail` build | Include each companion's/party-member's OFFERABLE CAPABILITY (what they can do), not only persona — so the toolkit block and rule 16B can offer them. |
| `inventoryDetail` → toolkit | Flag items that FIT the current beat (a carried tool/consumable/legendary item the moment calls for) into the toolkit block, not just the flat inventory list. |
| Rule 16B (extended) | The single offered option MAY be an item, a companion action, a party-member's capability, or a cross-actor combination — same "offer ONE, lightly, never a menu, never on clear intent" discipline. |
| `tests/*` (added) | The toolkit block surfaces a fitting carried item + a companion capability + (in a shared scene) a party-member capability; the GM can offer an ability+item / ability+companion / ability+party-member combination; a cooperative combo appears in a shared family scene; still ≤1 offer/beat, never a menu. |

**Guards (extended):** cooperative offers respect each actor's agency (never volunteer another PLAYER's character into an action they didn't choose — the GM OFFERS the possibility to the party, it doesn't commit another player); companion actions respect the companion's persona/boundaries (rule 9, unchanged); a party-member combo is an INVITATION to cooperate, resolved only if that player agrees. The minor-safety + bond rules on companions/party are unchanged (SNG-108).

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
