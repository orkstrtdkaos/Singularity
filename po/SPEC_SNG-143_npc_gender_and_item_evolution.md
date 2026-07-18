# SPEC — SNG-143: NPC sex/gender as explicit data + let the GM evolve items in-play
## Aevi (PO) · 2026-07-17 · authored to spec · **awaiting CCode ROUND 2**

> Two issues from Erik's screenshot. #1 is a real immersion break (the GM rendered Pell — Silas's devoted woman partner — as a male blacksmith). #2 is the GM punting an in-play item update to the sheet editor.

## 1 — NPC SEX/GENDER must be explicit structured data (the Pell bug)
> **Erik: "The game rendered Pell as a male blacksmith. Not OK — she's a woman. Do we need to be more explicit about the sex of NPCs?" — YES.**
> **Verified at HEAD — a real data gap:**
> - The text history is FULL of correct gender: "Pell herself," "she needed," "her forge," "her pocket" — the prose knows she's a woman.
> - **But there is NO sex/gender/pronoun field anywhere:** not on the NPC schema (`schemas/npc.schema.json` — id/name/role/personality/spectrum/voiceHints/knowledge/wants/fears, no gender), not captured by the GM's `npcUpdates` op (meet/update records name/role/description/note/learned — no gender), and NOT read by `npcPromptSeed` (art.js — reads appearance/role/bond, no gender term).
> - **So Pell's gender lives ONLY in scattered narration, never as a fact.** The portrait generator reads the gender-less record + "blacksmith" role → defaults to male. Nothing pins it. Erik's instinct is exactly right: sex must be explicit data, not inference.

### The fix — capture it, store it, feed it everywhere an NPC is rendered
- **Add a `gender` field to the NPC record** (schema + records): a small free-ish value — `"woman" | "man" | "nonbinary" | <free string>` + optional `pronouns` (she/her, he/him, they/them). Keep it simple and inclusive.
- **The GM CAPTURES it on `meet`.** Add `gender`/`pronouns` to the `npcUpdates` meet op, and a rule: *when you introduce or first substantially describe an NPC, record their gender/pronouns* — so it's fixed as data the first time they appear, from the fiction the GM already wrote.
- **`npcPromptSeed` READS it** (art.js) — the portrait prompt states the NPC's gender explicitly ("Pell, a woman, blacksmith…") so the generator can't default. This alone fixes the Pell render.
- **The GM context surfaces it** — an NPC's gender/pronouns ride in the KNOWN PEOPLE / companion / party detail so narration uses the right pronouns consistently (no more "he" for Pell mid-scene).
- **Retro-backfill from existing narration** for known NPCs where gender is unambiguous in the record's history (Pell → woman): a one-time pass that reads established pronouns from deeds/notes and stamps the field, so existing NPCs get fixed without waiting to be re-met. Where ambiguous, leave unset (don't guess).
- **Player can correct it** — the Repair panel / entity editor exposes gender so a wrong or missing value is a one-tap fix (ties to SNG-137's correction ops — a `correctNpcGender` or via the existing field-correct path).

## 2 — The GM should evolve an item in-play, not punt to the sheet editor
> **Screenshot:** player asked (out of character) to update Memory's description + trigger art; the GM said "this channel can't write to your sheet — go to Repair character." **But the GM HAS `itemUpdates` (SNG-137) and a rule that "ITEMS GROW WITH THE STORY."**
> **Verified:** the request came through the OOC "PLAYER ASKS" channel (gm.js L437), which handles "repair something wrong at creation" and correctly punts those to the sheet editor — but it has **no awareness that item EVOLUTION is a normal in-play action.** So it treated an evolvable item request like an un-makeable repair. The capability exists; the OOC channel doesn't know to route to it.
- **Fix:** teach the OOC channel the distinction. When a player asks (even out of character) to update/evolve an item they OWN — a new description, a truer name, what it's become — the GM should recognize this is an **in-play `itemUpdates` action, not a sheet repair**, and either (a) do it as the next in-fiction beat ("bring it into the scene — as you turn Memory in the firelight, its description settles into…") emitting `itemUpdates`, or (b) tell the player it's a normal in-play thing: "just describe the change in play and I'll evolve it — no sheet editing needed." NOT "go to the sheet editor."
- **Distinguish repair vs evolution:** a creation ERROR (wrong domain, wrong background) → sheet/Repair panel (correct as-is). An item GROWING (Memory earning a truer description) → `itemUpdates` in play. The OOC channel should route the second to play, not to the editor.
- **The offered description in the screenshot is good** — that's the kind of evolved text `itemUpdates` should write. The GM just needs to WRITE it (via the op) rather than tell the player to paste it into a form.

## ENGINE / UI SURFACES
| Module | Change |
|---|---|
| `schemas/npc.schema.json` | Add `gender` + optional `pronouns` fields. |
| `engine/gm.js` `npcUpdates` op + rule | Capture `gender`/`pronouns` on meet; a rule to record it when first describing an NPC. |
| `engine/art.js` `npcPromptSeed` | Read `gender`/`pronouns` into the portrait prompt (the direct Pell fix). |
| GM context (KNOWN PEOPLE/companions/party) | Surface gender/pronouns so narration is consistent. |
| retro-backfill | One-time: infer unambiguous gender from existing NPC narration (Pell → woman), stamp the field; leave ambiguous unset. |
| `engine/gm.js` OOC "PLAYER ASKS" (L433-437) | Route an item-evolution request to in-play `itemUpdates`, not the sheet editor; distinguish creation-repair (editor) from item-growth (play). |
| Repair/entity editor | Expose NPC gender as a correctable field. |
| `tests/*` | An NPC met in play gets gender captured; `npcPromptSeed` states gender (a woman NPC prompts as a woman); the retro-backfill stamps Pell = woman from her history; narration uses correct pronouns; an OOC "update my item's description" routes to itemUpdates/play, not the sheet editor; a creation-error still routes to the editor. |

## GUARDS
- **Gender is explicit, never guessed at render** — the portrait/narration read the FIELD; if unset, the GM records it from the fiction rather than defaulting. Retro-backfill only stamps UNAMBIGUOUS cases; never guesses.
- **Inclusive + simple** — free-string gender + pronouns; not a fixed binary. Respect whatever the fiction/player established.
- **Player can always correct** — a wrong gender is a one-tap fix; never locked.
- **Item-evolution stays "grows with the story"** (SNG-137 guards intact) — never-creates-unowned, in-fiction; this only widens the DOOR to it (the OOC channel), not the mechanic.
- **Minor-safety unchanged** — gender data doesn't touch the SNG-108 bond/minor rules.

## OPEN QUESTIONS — CCODE ROUND 2
1. `gender` as free-string + `pronouns`, or a small enum + free-string escape hatch? (Recommend free-string gender + explicit `pronouns` string — inclusive, and pronouns are what narration actually needs.)
2. Retro-backfill confidence bar — stamp only when the record's history has unambiguous gendered pronouns (≥N consistent, 0 conflicting)? (Recommend conservative: consistent pronouns + no conflicts, else leave unset.)
3. OOC item-evolution: do it immediately as a mini-beat, or tell the player "bring it into play"? (Recommend: offer to do it as the next beat — least friction, and it's exactly what itemUpdates is for.)
