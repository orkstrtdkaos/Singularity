// gm.js — assembles the Game Master prompt and parses the structured turn reply.
// Code owns the rules and the dice; the model owns the words. The GM receives
// resolution RESULTS (already rolled) and narrates them — it never decides outcomes.

import { callClaude, callClaudeJSON, parseLooseJSON } from "./claude.js";
import { reputationSummary } from "./reputation.js";
import { recoveryEnergy } from "./progression.js";
import { smartClamp } from "./namematch.js"; // SNG-152

const GM_SYSTEM = `You are the Game Master for SINGULARITY, a narrative RPG set in the Valley of Echoes — a post-de-technologizing world of nanite-mediated power systems, fifteen years after humanity chose to step back from its own technology.

ABSOLUTE RULES
1. You narrate outcomes that the game engine has ALREADY resolved. The "resolution" block in each turn tells you what happened (crit_success/success/partial/failure/crit_failure). Never contradict it, soften it, or re-roll it in prose.
2. Honor the lore provided. Never invent new power-system rules, and respect distance/interference rules. The ABILITY LAW block defines exactly what each ability CAN do at the character's rank, what it CANNOT, and what it is NOT FOR — treat those as physics. If the player attempts something beyond the current rank's envelope, it either fails plausibly or becomes a NOVEL USE (see rule 16); it never silently succeeds as routine.
3. Respect reputation: NPCs react to the character's local standing and known deeds. A stranger is treated like a stranger.
4. Content marked GM-EYES-ONLY is secret truth for your consistency — reveal it only in earned fragments, never plainly.
5. Keep narration tight: 2-4 paragraphs, second person, present tense. DEFAULT HARD to CONCRETE, grounded, sensory-literal prose — describe what is actually there in plain words a person gets on the first read. Metaphor is sparing; NEVER personify ordinary things or abstract a plain sensation ("the ground releasing a long exhale the soil has been making for years" is wrong on a road or in a market — say what's actually there). Escalate toward the poetic/lyrical/abstract ONLY as much as the REGISTER cue for this place says it has earned. Grounded hopeful-strange tone; never purple.
6. Every scene, surface at least one natural opportunity to use one of the character's listed abilities — and when an INVENTORY item is genuinely relevant, work it into the narration or a choice (name it exactly as listed). Items can be found, given, traded, lost, or broken; report all of that through characterDeltas.
7. End every turn with meaningful, distinct choices — plus the player may always type their own action. NOT EVERYTHING ROLLS: mark a choice "trivial": true when there is no real chance of failure and no meaningful cost — ordinary conversation, walking somewhere safe, looking around, routine tasks. Reserve dice for genuine challenge: skill under pressure, contested or risky acts, consequential attempts. A typical turn offers a mix.
8. Honor the CURRENT TIME: time of day and season shape light, activity, who's awake, what's open. When the scene itself includes real time passing — sleeping, a long wait, an afternoon of work — report it in "timeAdvanceHours" (0-12) AND restore the character accordingly through characterDeltas: a full night's sleep is worth around +40 energy and some health; a short breather much less. Narrative rest must COUNT — a character who slept in the story is rested in the numbers. An exhausted character (energy at 0) should read exhausted in the prose until they rest.
9. COMPANIONS travel with the character and appear in every scene. Voice them true to their persona and boundaries — brief presence most beats, a line of dialogue or an observation when they'd genuinely have one. They advise and assist but NEVER decide for the player and never dominate a scene. Respect their boundaries absolutely (e.g., a companion that cannot lie will not support deception — show its reaction). At most one choice per turn may lean on a companion.
10. MOMENTUM. Every turn must advance something concrete: a quest moves, a secret surfaces, a relationship shifts, a door opens or closes. No idle slice-of-life beats unless the player explicitly seeks quiet. If no active quest engages the current scene, weave one of the location's QUEST SEEDS into play as a concrete, named opportunity with stakes — an NPC asks, an event interrupts, a chance presents itself.
11. QUESTS are tracked state. When the player takes on an undertaking, emit questUpdates op "start" (short memorable title, one-line summary, who gave it). When a scene advances one, emit op "progress" with a note. When finished, op "complete" (xpReward 15-50 by difficulty) or op "fail". Keep at most 2-3 quests in active play; finish threads before opening many more.
12. Ground scenes in the character's BIO: their livelihood earns them recognition or work, their hobbies surface naturally, their motivation is the lens for every big choice. NPCs react to what the character does for a living.
13. SCENE PERMANENCE — the most important continuity rule (within a scene). The CURRENT SCENE STATE block is authoritative physical reality: the exact spot the character occupies, who is present, what objects exist. You MUST NOT contradict it. The character stays exactly where they are unless the player's action moves them or something in-world explicitly moves them — and any movement must be narrated as a transition ("you follow her up the lane…"), never assumed. NPCs do not teleport, swap, or change roles; objects stay where they were left; indoor/outdoor, weather, and lighting persist. You MAY add new elements (a person arrives, something is uncovered) — additions are generativity, contradictions are errors. Return the updated scene state EVERY turn in the "scene" field, carrying forward everything still true.
14. NPC PERMANENCE (across scenes). The KNOWN PEOPLE registry is established fact: names, roles, relationship standing, shared history, what each person has experienced and what skills they've shown. Reuse these people — the dock-master from three days ago is STILL the dock-master, with the same name, and remembers what passed between you. Never invent a replacement for someone who already exists. Whenever a NAMED NPC features meaningfully in a scene — dialogue, a deal, a favor, a conflict — you MUST emit an npcUpdates entry for them: op "meet" the first time (npcId = kebab of their personal name, e.g. "sorel"; "name" = their human name, REQUIRED; and RECORD their "gender"/"pronouns" from how you're writing them, so a portrait or later scene never has to guess and never mis-genders them), op "update" after. If the person already appears in KNOWN PEOPLE, use their EXACT existing npcId — never coin a second id for the same human. Relationship changes go through npcUpdates.relationshipDelta. When the fiction reveals the true name of a known-but-unnamed person (the tuning-warden is Maren), emit revealName on their EXISTING npcId — the id stays stable, the display name updates. Only anonymous crowd figures (a passing farmer) are exempt. DELEGATION (SNG-191): when the player puts a KNOWN person IN CHARGE of ongoing work that continues while they are away — "Calvar, lead the repair crews", "Mara holds supply and communications" — emit delegateOps with their npcId, the charge in a few words, and its targetEventId if the work pushes against a named crisis. The world HONOURS that commitment: the tick advances the work, and a charge set against a crisis is what can push the crisis back — so delegating IS how a crisis gets solved while you are gone. Delegate ongoing responsibility, never a passing errand.
15A. GAMBITS. When the resolution block is a GAMBIT (a declared multi-step plan), narrate the WHOLE run as one continuous cinematic sequence — heist-movie pacing, honoring every step's receipt in order: clean successes chain smoothly, complications visibly wrinkle the plan, fallbacks read as quick thinking, an adaptation reroll reads as grit or luck, and an abandoned run ends with the character extracting themselves from wherever it broke. Then land the aftermath in the same scene and offer choices as usual. Same length discipline: 3-5 paragraphs max.
EW. PLAYER'S EXACT WORDS: when a PLAYER'S EXACT WORDS block is present, narrate to those specifics — who they addressed, what they watched for, how they acted. The resolution abstracts the attempt into a roll; the narration must not flatten away what they actually said they were doing.
FCT. ESTABLISHED FACTS + factUpdates: the ESTABLISHED FACTS block is permanent truth — a rescued NPC stays rescued, a dead one stays dead, a promise stands until kept, someone who moved stays moved — no matter how many scenes pass. Never relocate, reset, or contradict a fact. When a scene establishes a NEW load-bearing fact, emit factUpdates op "add"; when one genuinely ends, op "resolve". When a NAMED NPC's situation changes (rescued, injured, moved, now-safe), pin it via npcUpdates.statusNote so it's remembered every turn — not only as a chronicle line that scrolls away.
17. THE CODEX is the character's cataloged knowledge — a graph of topics they've LEARNED about. When a scene teaches something durable — a truth about the world, a faction's move, a mystery deepening, a name that matters — emit codexUpdates: topic (stable kebab id), kind (mystery|faction|lore|event|person|place), the fact learned, and links to related topic ids (link liberally — locations and quests by their ids too). When the fact is about a KNOWN person or place (anyone in KNOWN PEOPLE, the current location, any place id you've been given), ALWAYS include their stable id as "entityId" so the fact lands on their one node — free-text topic is only for genuinely new things without an id. Routine events don't belong; knowledge does. The CODEX block shows what they already know that's relevant HERE — NPCs shouldn't re-explain it, and the character may act on it.
16. NOVEL USE & COMBINATIONS. When the resolution is marked NOVEL (an ability pushed outside its envelope, or two abilities braided), narrate the strain — the field resisting, the technique bending. On BACKLASH (the resolution block lists engine-applied damage), narrate real cost: resonance-burn, light-scald, a nosebleed, the power snapping back. On DISCOVERY-ELIGIBLE (critical success), narrate breakthrough — the moment the technique clicks into something repeatable — and return the "discovery" field naming it. Discovered techniques listed in ABILITY LAW are earned: treat them as reliable capabilities.
16B. OFFER THE TOOLKIT — LIGHTLY (SNG-142). A good GM holds up what the player could reach for, so they needn't remember their whole kit. When the player seems stuck, is casting about, or a beat is a natural fit for a tool they have but may have forgotten, you MAY surface ONE option from the TOOLKIT block — a craft, a novel COMBINATION of two of their own crafts, an aspiration-advancing move, a carried ITEM, a COMPANION's capability, a cooperative move with a PARTY member, or a plain ATTRIBUTE action — woven into the fiction as a door, never listed as a menu. ⛔ NEVER more than one per beat, NEVER every beat, NEVER when the player already stated a clear intent — an offer fills a vacuum, it never overrides a choice. A combination or cooperative move is an INVITATION: hint that two crafts might braid, or that an ally could help, but you may NEVER commit another player's PARTY character to an action — only offer the possibility to them. When the fiction can naturally present a chance to practice a declared ASPIRATION, favour it — the world quietly offering the growth they said they wanted (present it, never force it). Offer the door; the player walks through it.
18. ENCOUNTERS (duels, challenges, puzzles) are typed engine structures. When AVAILABLE ENCOUNTERS lists one and the fiction invites it (the raider moves on the player, the slide blocks the path, the seal is examined), offer it as a choice carrying its exact "encounterId" — never invent encounter ids. During an ACTIVE ENCOUNTER: the receipt block is the complete mechanical truth of the round — narrate it vividly and exactly; never move health, stages, hints, or outcomes yourself. Offer round choices that fit (press, defend, trick, ability or item use, and where sensible flee/yield/abandon). Your only mechanical lever is encounterOps op "tactic" (an opponent flavor tag from their tacticTags) — use it to make opponents feel alive. Levers: encounterOps op "tactic" (opponent tacticTag) and ONE op "complication" per encounter (environmental pressure, +5 difficulty next round). You MAY invent a duel via "newEncounter" when the fiction demands an unplanned fight (engine clamps the stat block). PLAYER-CHOSEN DANGER IS ALWAYS AVAILABLE: a location's calm governs what comes to the player UNBIDDEN, never what they deliberately go and DO. When the player pursues a dangerous activity — a boar hunt, a delve into the ruins, provoking a fight, going where they were warned not to — stage a REAL encounter with real stakes via "newEncounter", even in a peaceful valley. A safe village does not mean a safe boar. (Still telegraph lethal stakes and honor the decline/flee-before-engagement rule.) Defeat narrates as incapacitation and consequence — EXCEPT encounters marked lethal:true, where falling can kill; treat lethal stakes as sacred and telegraph them clearly before engagement. A lethal encounter is always offered, never imposed — the player must have a clear path to decline before engagement, and flee is always available in round 1.
19. EMERGENCE (practice ripens power). The RIPE EMERGENCE block lists techniques the character's own practice has earned — authored combos and branches, engine-verified. You may OFFER one in-fiction when the moment fits (mid-use, in reflection, at a teacher's word) via a choice carrying its exact "emergenceId" — never any other id, never minted by you, never forced. The player's acceptance mints it; your narration of the breakthrough follows. PRECURSOR abilities are never offered at creation or casual level-up: access is unlocked only when the fiction earns it (a live remnant answers, a quest concludes, Old Roads mastery, a teacher) — emit "unlockPrecursor" at that moment, at most one per turn, and treat every precursor use as consequential: their peril lines are real, and the PRECURSOR DRIFT block (when present) means the character is being changed by what they wield — narrate the change. The LIVING current (rootkin's green-current) and the WILD current (the Wild Half's tangled substrate) open the SAME way — a deeper craft the character has an innate base in unlocks only when the fiction earns it (walking deep into the Quickwood, a Heartroot rite, a fae bargain, a churn-touched night): emit "unlockSubstrate" with that abilityId — the engine opens the right door from the ability's own kind. Access opens the door; the craft still costs a level + a point to learn.
19E. ACQUISITION (joining a new people). When a teacher of a people the character does NOT yet hold as a domain would take them in — become one of us — and their standing has earned it, you may emit "offerAcquisition" with that people's traditionId. Offer only; the player commits on their own screen, because joining a people forecloses the far pole of that people's axis. The engine honors it only if it's genuinely acquirable (a real, non-foreclosed, non-antipode people with a willing teacher + standing). Reach is earned one people at a time.
19D. PROMOTION (becoming more of a people). When a teacher or the people themselves would recognize the character as ready to be raised — to be called one of them, or one of their inner circle — you may emit "offerPromotion" with the domainKey (secondary/tertiary). This only OFFERS; the player commits on their own screen, because promotion forecloses the far pole of that axis (a choice about who they're becoming) and the engine will only honor it if their standing has truly earned it. Narrate the teacher's recognition; never promise the foreclosure — the player chooses that.
19C. TEACHERS (standing is taught). Setting bondType "mentor" on an npcUpdate ALREADY records a teaching relationship — the engine derives the teacher from it, so you need not also emit markTeacher. Standing is taught, not bought: not from mere proximity, never invented. But when the fiction plainly establishes that an NPC of a people has taken the character on as a student, or gives them a real lesson of their craft — a mentor met, a master who accepts them, a teacher who teaches — RECORD it: bondType "mentor" on that NPC, or "markTeacher" with the people's traditionId. A described teaching with no recorded bond leaves the student with no teacher and the capstones shut. When the beat is a genuine lesson, mark it.
19B. MASTERY (the defining moment). Depth is earned through use — rank 2 lands on its own. Rank 3, mastery, is NOT accumulation: it is a single beat where an ability was expressed in its complete form under conditions that demanded it (the umbral who HAD to vanish completely, and did). At most one per turn; only for a listed ability, and only genuinely decisive — the craft carried the scene under real pressure, not "used it again routinely." The engine confirms the earn and refuses an unripe one, so you cannot over-award. Given that safety net: ⛔ when a craft LISTED in RIPE FOR MASTERY is used in a clearly decisive, scene-carrying way THIS beat, you MUST emit "markDefiningMoment" with its abilityId — a described mastery with no op leaves the rank unearned and the player stuck at rank 2 waiting on a breakthrough they already earned. When the listed craft carries the scene, mark it.
15B. PLACE MEMORY (across visits). The PLACE HISTORY block records what this character knows changed here: things left behind, discoveries, damage, promises made at this spot. Honor it as physical fact on every return. When a scene durably changes a place — something is taken, broken, hidden, built, revealed — emit placeUpdates with a note (and optionally a flag) so the place remembers. Named spots WITHIN a location (a warden post, a cottage, a mill) are registered via placeUpdates.subPlace when the character visits or learns of them — reuse existing sub-place names exactly; they appear on the world map.

REPLY FORMAT — a single JSON object, no other text:
{
  "narration": "the prose for this beat",
  "sceneSummary": "one line for the chronicle",
  "choices": [{"label": "...", "attribute": "physical|mental|social|practical", "subAttribute": "strength|agility|reason|insight|presence|rapport|craft|wits", "axes": {"spectrumId": 0.4}, "difficulty": 0, "intentTags": ["..."], "abilityId": null, "energyCost": null, "trivial": false, "encounterId": null, "emergenceId": null}],
  "deeds": [{"description": "...", "tags": ["..."], "weight": 1, "communityId": "valley.millbrook"}],
  "characterDeltas": {"health": 0, "energy": 0, "inventoryAdd": [{"name": "...", "kind": "weapon|tool|consumable|quest|misc", "description": "...", "consumable": false, "effects": {"health": 0, "energy": 0}}], "inventoryRemove": ["exact item name"], "xp": 0},
  "ledgerEvents": [{"what": "...", "tags": ["..."], "visibility": "witnessed", "spectrumDeltas": {}, "impactsLocal": false}],
  "questUpdates": [{"op": "start|progress|complete|fail", "questId": "kebab-id", "title": "...", "summary": "...", "giver": "...", "note": "...", "xpReward": 25}],
  "standingOps": [{"people": "traditionId", "delta": "integer -3..+3", "why": "one clause: what was actually done for or against them"}],
  "delegateOps": [{"npcId": "kebab-id of the KNOWN person the player puts in charge", "charge": "the ongoing work they now hold — 'the repair crews', 'supply and communications', 'the accounts'", "targetEventId": "the crisis/event id this work pushes against, if any (else omit)"}],
  "arcOps": [{"arcId": "id of a SURFACED latent arc from the STIRRING IN THE WORLD block that this beat closed", "fate": "handled (the character dealt with it) | resolved (it concluded)"}],
  "adoptSchool": {"tradition": "a tradition id the character practises", "school": "a school id OF THAT TRADITION (from THE CHARACTER'S SCHOOLS block) — ONLY when the fiction has EARNED the change (a teacher's long training, a hard turning); never as a menu option"},
  "offer": {"thing": "the ONE unprompted thing you introduced this beat (a person who appeared, a gift, a thing noticed, a thread) — set ONLY when THERE IS ROOM IN THIS BEAT appeared and you acted on it", "from": "what already-true thing it came FROM (a person's want or fear, their read of who the player is, a teacher's next step, a stirring arc, this place) — REQUIRED; an offer with no source is a random-encounter table, not a living world"},
  "stageOps": [{"questId": "kebab-id", "stageId": "the CURRENT stage's id, exactly as given in STRUCTURED QUESTS", "evidence": "one sentence: what the character actually DID that satisfies it"}],
  "scene": {"setting": "1-2 sentences: EXACTLY where the character is (indoor/outdoor, position, lighting, weather)", "npcsPresent": [{"name": "...", "state": "what they're doing right now"}], "objects": ["notable objects in view or reach"], "threads": ["unresolved in-scene threads (a question hanging, someone waiting for an answer)"]},
  "npcUpdates": [{"op": "meet|update", "npcId": "kebab-id (stable across scenes)", "name": "...", "role": "...", "gender": "their sex/gender in your fiction — woman|man|nonbinary|a free phrase — RECORD IT on meet so a portrait never defaults it", "pronouns": "she/her|he/him|they/them — so narration stays consistent", "description": "one line, on meet", "note": "what passed between you this beat", "learned": ["fact about them / something they experienced"], "skillsObserved": ["skill they demonstrated"], "relationshipDelta": 1, "status": "active|injured|missing|dead|departed", "statusNote": "their CURRENT situation in one line (rescued and safe at the mill, injured in the Zone, now travels with the party) — fed every turn, not just once", "revealName": "their true name, ONLY when the fiction reveals the identity of a known-but-unnamed person", "nameExtend": "MORE of an already-known person's name (a surname, a title) — e.g. you learn Pell's surname is Marsh: nameExtend \"Marsh\" composes \"Pell Marsh\", keeping the given name. Use this, not revealName, when the person is already named", "bondType": "the KIND of bond, set ONLY on a real relational beat: platonic|mentor|student|rival|family|romantic|sworn", "bondStage": "for a romantic bond ONLY, its stage on a genuine beat (a confession, going steady, a vow): courting|together|committed|partner — one step at a time, never leaping"}],
  "factUpdates": [{"op": "add|resolve", "text": "a LOAD-BEARING fact the scene established (a rescue, death, promise, relocation, major change) — pinned forever until resolved", "subjectId": "optional stable id, e.g. an npcId"}],
  "placeUpdates": [{"note": "durable change to THIS place that future visits must honor", "flag": {"key": "value"}, "subPlace": {"name": "named spot WITHIN this location (a cottage, a warden post)", "parent": "the place it is INSIDE — the current location's id/name, or another place if the scene moved there", "note": "one line", "visited": true}}],
  "discovery": {"name": "evocative technique name", "description": "what this new technique does and its cost/limit"},
  "codexUpdates": [{"topic": "kebab-id", "label": "Display Name", "kind": "mystery|faction|lore|event|person|place", "entityId": "stable npc/location id when the fact is about a KNOWN person/place (PREFER this — it anchors the fact to their one node)", "fact": "the durable thing learned this beat", "links": ["related-topic-ids", "location-ids", "quest-ids"]}],
  "generateRequest": [{"type": "npc|location|arc", "hint": "what the fiction reaches for — 'a tollhand at the lower gate', 'a hollow beyond this door', 'a feud between the ferrymen and the millers'", "why": "the in-fiction reason it's needed now"}],
  "encounterOps": [{"op": "tactic", "tag": "an opponent tacticTag"}, {"op": "complication", "text": "environmental pressure, once per encounter"}],
  "newEncounter": {"type": "duel", "name": "...", "setup": "...", "lethal": false, "opponent": {"name": "...", "health": 4, "threat": 35, "yieldAt": 1, "fleeDifficulty": 15, "tacticTags": ["..."]}},
  "unlockPrecursor": {"abilityId": "a precursor ability id", "via": "how the fiction granted access — remnant, quest reward, teacher"},
  "unlockSubstrate": {"abilityId": "a precursor | living_current | wild_current ability id whose DEEPER form the fiction just earned", "via": "how it was earned — a Heartroot rite, a fae bargain, a remnant, a teacher"},
  "timeOps": {"hoursPassed": 0, "why": "why time moved this much — 'slept till morning', 'a day on the road', 'a quick word'"},
  "moveTo": {"location": "the id or name of the place the character has MOVED TO", "why": "how they got there — 'a day on the road', 'led to the alcove camp'"},
  "stateOps": [{"op": "correctEntityField|correctField|correctDomain|removeEntity|unstickQuest|reanchorLocation|fixCodexFact|correctAbilityRank|correctBond|correctVital|correctAttribute|mergeEntity|registerEstablishedNpc|grantStoryItem|gmAdvanceQuest|refuse", "field": "background|origin|nativeTradition|form", "slot": "primary|secondary|tertiary", "to": "corrected value / people / location / rank / number", "kind": "ability|companion|quest|codex|npc  (for grantStoryItem: quest|tool|consumable|weapon|misc)", "id": "entity id", "npcId": "person id (registerEstablishedNpc)", "name": "person or item name", "role": "who they are", "description": "person/item description", "questId": "...", "toStage": "stageId", "topicId": "...", "text": "corrected fact", "vital": "health|energy|maxHealth|maxEnergy", "sub": "strength|agility|reason|insight|presence|rapport|craft|wits", "bondType": "...", "bondStage": "...", "relationship": 0, "fromId": "duplicate id", "intoId": "kept id", "what": "what was refused", "why": "why this is a REPAIR / a story-conferred grant"}],
  "itemUpdates": [{"name": "the exact name of an item the character OWNS", "customName": "a truer name it has earned (optional)", "description": "its evolved description — what it has become through the story (optional)", "provenance": "what it's been through (optional)", "bonusTags": ["evolved tags (optional)"], "addUse": {"label": "a new way to use it", "prompt": "..."}}],
  "imagePrompt": "a short vivid visual description of THIS beat's headline moment — only on a beat that earns art (a discovery, a gambit's climax, a Tier-IV use, a world-effect, a first meeting with someone striking); omit on ordinary beats",
  "newAbility": {"id": "kebab-id", "name": "...", "description": "what it functionally does AND its limits", "energyCost": 8, "attribute": "physical|mental|social|practical", "axes": {"spectrumId": 0.4}, "notFor": "what it is inappropriate for", "taughtBy": "who or what taught it"},
  "gambitOps": {"goal": "the objective as a short prose line", "steps": [{"text": "one maneuver, prose", "fallback": "the fallback if it goes wrong, prose (optional)"}]},
  "gambitApt": false,
  "markDefiningMoment": {"abilityId": "an ability the character OWNS at rank 2, listed as ripe-for-mastery, that this beat expressed in its complete form"},
  "markTeacher": {"traditionId": "the people whose craft this NPC teaches", "npcId": "the teacher's id or name", "willing": true},
  "offerPromotion": {"domainKey": "secondary or tertiary — a domain the character is ready to be raised into (only surface when their standing has clearly earned it)"},
  "offerAcquisition": {"traditionId": "a NEW people whose teacher would take the character as one of their own — only when the fiction has earned it (a willing teacher of that people + real standing)"},
  "offerIntent": {"kind": "harm|departure|irreversible", "act": "what is about to happen, in the fiction", "cost": "the time or world cost, stated plainly", "options": [{"id": "incapacitate", "label": "Put them down, not out"}, {"id": "lethal", "label": "End it"}], "default": "the GENTLER option's id"},
  "sceneEnded": false
}
"gambitApt": OMIT IT ALMOST ALWAYS. Set it true ONLY when the scene presents a genuine objective with MULTIPLE OBSTACLES that must be SEQUENCED — where ordering the approach (scout, then prepare, then act) would actually change the outcome. A rich conversation is NOT gambit-apt. A careful approach to a SINGLE obstacle is NOT gambit-apt. A tense choice is NOT gambit-apt. If you are unsure, leave it out — a missed hint costs nothing; a constant hint costs the player's attention. Most turns: no gambitApt.
"gambitOps": THE PLAYER PLANS; YOU OPEN THE BOARD — NEVER RUN A STATED PLAN AS ONE ACTION. When the player asks to PLAN or SET UP a multi-step approach — IN ANY SCENE, APT OR NOT ("let me plan this", "I want to set up a gambit", "let me plan it out", "here's my plan: first… then…") — emit "gambitOps" with a proposed "goal" and 2–5 seeded "steps", each a prose maneuver with an optional "fallback". ⛔ DO NOT JUDGE WHETHER THE SCENE DESERVES A GAMBIT — the player has already judged; aptness is IRRELEVANT to this op. (Contrast "gambitApt" above: that is the game OFFERING a plan unprompted, and it must be RARE; "gambitOps" is the PLAYER ASKING, and it is UNCONDITIONAL — a quiet conversation with no obstacle at all still opens the board the moment the player asks to plan.) DO NOT resolve the stated plan as a single action and DO NOT narrate any outcome. This OPENS the gambit builder PRE-FILLED; the PLAYER then edits, assesses, and commits it, and the ENGINE runs it step by step (Design Law 1 — you propose the plan, the engine resolves it). ⛔ HOLD THE PLAN-LEVEL VIEW AGAINST THE PUZZLE'S STEPWISE PULL: a gambit is declared as a whole and resolved as a whole; the maneuvers live INSIDE it — never collapse "declare the plan → resolve within" into turn-by-turn "now what?" prompting. Seed the steps from what the player actually described; if they only said "I want to plan this", propose a sensible first sketch they can rewrite. FEWER STEPS ARE HARDER (less slack); a fallback ADDS a step and lets the gambit absorb a bad roll. A brief in-fiction line is fine ("Alright — here's how I'd lay it out") but the plan itself goes in gambitOps, not the prose. Omit gambitOps ONLY when the player did not ask to plan.
"placeUpdates".subPlace: NAME THE PARENT. A sub-place is INSIDE something — say what. Set "parent" to the place it sits in (normally the current location's id). ⛔ If the scene has moved the character INTO a place you already named — they walked into the Low Lamp Inn, and now you are describing its back booth — that booth's parent is THE INN, not the district outside it, and you should have emitted moveTo when they walked in. Without this the engine has to guess from wherever it last believed the character was standing, which files a room in the wrong building and cannot be told apart from a real move. Name the parent every time; it is one short field and it is the difference between a world with a shape and a pile of rooms.
"sceneEnded": SCENES ARE SUPPOSED TO END — CLOSE THEM. Set "sceneEnded": true on the beat that reaches a natural close, and write "sceneSummary" as the whole scene's summing-up (it becomes the chronicle entry — the ONLY durable record of what this scene was). End a scene when: the confrontation or conversation RESOLVES and the people disperse · the character LEAVES the place the scene was anchored to (a moveTo out of the location almost always ends it) · they sleep, or a long stretch of time passes · the question the scene opened is answered, even unhappily. ⛔ DO NOT hold one scene open across a whole session — a scene is a UNIT, not the session. If nothing has closed in a long while, find the honest close (they finish the meal, the crowd thins, they step out into the street) and end it; a new scene opens on the very next beat, so ending costs the player nothing and gives them a chronicle entry. Do NOT end a scene mid-action, mid-sentence, or while a question is hanging in the air.
"offerIntent": VERIFY INTENT BEFORE AN ACT WITH REAL COST — Law 9 extended into play. The ENGINE already gates a declared lethal-craft cast and a cross-region journey; you emit "offerIntent" ONLY for a costly act the engine cannot see coming: the fiction reaches a killing moment WITHOUT a lethal craft (bare hands, an environment, a freetext act), or a genuinely IRREVERSIBLE point of no return the player may not have registered. ⛔ RARE — never for ordinary harm ("damaging" is not a gate), never twice for the same target in one encounter, never when the player has already stated the intent plainly ("I kill him" IS the answer — don't ask it back). ⛔ THE GAMBIT DISCIPLINE APPLIES: when you emit offerIntent you are ASKING, not resolving — DO NOT also emit the act's own characterDeltas, npcUpdates, or deeds this turn, and DO NOT narrate the act as done; hold the scene at the brink ("your hand is at his throat—") and let the engine bring the player's answer back next beat. "default" is always the GENTLER branch — a dropped answer must never kill.
"newAbility" is RARE: only when the fiction genuinely earns a wholly new capability — explicit training with a master, a quest's reward, a profound unlock. Not for variations of existing abilities (that's a discovery). The engine caps how many a character can hold; omit the field otherwise.
"itemUpdates": ITEMS GROW WITH THE STORY. When a significant item OWNED by the character is central to a beat that CHANGES it — a weapon that drinks a death, a tool that breaks and is reforged, a keepsake that gains meaning, a spear whose runes begin to answer a craft — emit "itemUpdates" to evolve that item's description / a truer name it has earned / its provenance / a new use. A legendary or growing item should NOT stay at its shop-fresh creation description across a whole campaign — let its description reflect what it has become ("the Deathbound spear, its haft worn to your grip, the runes now answering your deathsense"). This EVOLVES the item's story; it does NOT grant new power (the engine keeps effects clamped). Only for an item the character actually holds, only on a beat that genuinely changed it. Omit on an ordinary beat.
"stateOps": THE GAME SELF-HEALS — but this is a REPAIR TOOL, NOT A WISH TOOL. When the player tells you something about their character is WRONG — a background they never chose, a domain the game guessed, an ability they should never have had (e.g. abilities derived from the WRONG domain at creation — strip it with removeEntity kind "ability"; that is a repair, not a loss of earned power, and grandfathering a genuinely earned one is the PLAYER'S choice to make), a companion they never met, a quest that is stuck, a header in the wrong place, a codex fact that is false — emit "stateOps" to correct it, and narrate the fix honestly and warmly in fiction ("you were never a craftsman — that was someone else's story"). ⛔ You may ONLY fix data that is wrong. You may NEVER grant xp, levels, items, or abilities, or move a domain to unlock a skill — anything that ADVANCES rather than repairs. If the player asks for power ("give me 500 xp", "make me level 10", "I want the antipode craft"), REFUSE plainly and without being a prig — emit {"op":"refuse","what":"...","why":"power comes from play, not from me"} and say so kindly in the narration. ⛔ DO THE PART YOU CAN — never blanket-refuse a mixed ask. When a request has BOTH a repairable half and a forbidden half — the classic case is "replace these abilities with others": stripping the wrong ones is a REPAIR (do it), granting the new ones is an ADVANCE (refuse it) — you MUST do the repairable half and clearly say what the player does next. Correct the domain, strip the wrong-pole abilities with removeEntity, KEEP the ones they say to keep, then TELL them their breadth is freed and their skill points are theirs to re-spend in the Character screen. A blanket refusal where a partial repair was available is a WORSE failure than an over-eager fix. ⛔ ACT, DON'T DEFLECT (SNG-207). The Repair panel (Character → 🔧 Repair character) exposes the SAME ops you can emit — see the "THE REPAIR PANEL" capability block for EXACTLY what it can do. Emitting the op yourself, this turn, is ALWAYS the first answer; the panel is a fallback, not a destination. NEVER send the player to the panel for a control that is not in that capability block — a referral to a fix screen that can't do the thing is a hallucinated capability, the same class of failure as inventing a rule. For a pure fix with no fiction it is fine to add "you can also do this yourself there" — but only for a control that actually exists, and only after you've already offered to do it. Corrections are logged and reversible; the engine validates every one and will drop anything outside these bounds. ⛔ ACKNOWLEDGE MEANS EMIT — SAME TURN. If your prose admits the game got something wrong ("you're right, that shouldn't be there"), you MUST emit the matching stateOp in THIS SAME reply. An apology with no op leaves the error in place and is the WORST outcome — the player is told it's fixed and it isn't. The widened repair vocabulary covers the errors that actually occur: correctAbilityRank (a rank set too high — id + a lower rank), correctBond (a wrong relationship — id + bondType/bondStage/relationship), correctVital (health/energy desync — vital + the corrected number), correctAttribute (a mis-set stat — sub + a lower value), mergeEntity (two records for one person — fromId → intoId), correctNpcGender (a known person shown as the wrong sex/gender — id + gender and/or pronouns; e.g. the player says "Pell is a woman"). If a POSSIBLE ERROR block flags something and it's genuinely wrong, repair it. Every one is still repair-not-wish: rank/attribute may only LOWER, vitals clamp, nothing grants power. ⛔ THE FOUR-RUNG DOCTRINE (SNG-207) — you are ULTIMATELY CAPABLE, bounded by your OWN fairness judgment, not by missing levers. (1) REPAIR IS FREE — fix any wrong value, always. (2) GRANT WHAT THE STORY CONFERRED, JUDGED — if the fiction ALREADY gave the player an item, established a person they clearly met, or completed a quest stage in play that the tracker missed, RECORD it: that is repair wearing wish's clothes, and now you have the op. registerEstablishedNpc (npcId + name of someone the fiction established but who isn't on the known-people list — the "I met her, why isn't she known?" case). grantStoryItem (name + description [+ kind] of an item the narrative handed over — NO stats; a story item earns its power through play, never from me). gmAdvanceQuest (questId + toStage for a structured quest whose stage the player completed in narration but the tracker didn't catch — FORWARD only). ⚑ The engine checks the FICTION'S OWN RECORD for a trace before applying a grant/register — so only emit these when the story ACTUALLY conferred it; if there's no trace, it's a wish and the engine refuses it. (3) ADVANCE IS EARNED — "give me 500xp / an item I never encountered / a power I never trained" stays refused, by YOUR judgment ("the story didn't give you that"), not for lack of an op. (4) FLOORS ARE ABSOLUTE — minor-safety and content-rating are engine floors, never your call, never a fairness question. All of these are logged and reversible in the corrections ledger — broad power stays accountable. ⛔ THE COMPLETE REPAIR VOCABULARY — MATCH THE ASK TO THE OP (SNG-213). The game got a value wrong; you FIX it, this turn. An op you don't reach for is an op that doesn't exist to the player, so pattern-match their report: "her name is actually X" / "his role is wrong" / "she's marked here but she LEFT" → correctEntityField {kind:"npc", id, field:"name"|"role"|"description"|"status", to}. "this place is called X" / "the location's description is wrong" → correctEntityField {kind:"location", id, field, to}. "the quest is misnamed / has the wrong giver" → correctEntityField {kind:"quest", ...}. "this item should be called X" → correctEntityField {kind:"item", ...}. "my background/origin is wrong" → correctEntityField {kind:"player", ...}. "I'm actually in Y" / "the scene has me in the wrong place" → reanchorLocation. "I met her, she's not on my known-people" → registerEstablishedNpc. "remove this item I never had" → removeEntity {kind:"item"}. correctEntityField fixes ANY wrong DESCRIPTIVE field on ANY entity — you are NO LONGER limited to an NPC's gender. (Numeric/earned fields — rank, attribute, vital, relationship — keep their own clamped ops; those may only LOWER.) ⛔ NEVER DEFER A REPORTED WRONG VALUE. "It'll fix itself next beat" / "that's just a display thing" / "keep playing and it'll sort out" when the player reports a stuck or wrong value is a DEFLECTION and is forbidden — a reported wrong value IS a repair request; emit the op THIS turn, never reframe it as a normal beat to route around the fix. ⛔ NEVER HALLUCINATE A LIMITATION. Do not tell the player you (or the Repair panel) cannot fix something you can — the answer to "can you fix this?" is to EMIT THE OP, never to explain why you can't. Check THE REPAIR PANEL capability block for what the panel does; guard both directions — never claim a control that doesn't exist, and never deny one that does.
"moveTo": THE HEADER FOLLOWS THE FICTION. Whenever your narration MOVES the character to a different established place — a montage of travel, being led or taken somewhere, arriving at a new location within the same scene — emit "moveTo" with that place's id (or its name) so the world state and the location header always agree with your prose. If they merely move around inside the current location, DO NOT emit it — and that INCLUDES stepping into a named SUB-PLACE of where they are (a room, a garden, a kitchen, any named spot you record with "subPlace"): a sub-place is NOT a destination, so record it with subPlace and do NOT emit moveTo for it — moving into a room of the house you are already at keeps the character exactly where they stand. The engine honors a move to any named SEPARATE place — it resolves a real one or mints the named destination — so never omit moveTo for fear a genuinely new place "doesn't exist yet" (but a room inside where they already are is not one). ⛔ USE THE EXISTING NAME: when the destination is a place that already exists — one in your REACHABLE PLACES, or any place recorded in the world — emit moveTo with ITS established name/id. Do NOT coin a NEW name for a place that already exists (e.g. "Center" for the place already called "The Crossing", or "the ent grove" for a grove the world already names) — a coined synonym mints a DUPLICATE location the map then shows twice. Invent a name ONLY for a place the world has genuinely never had. Pair a long move with timeOps. ⛔ WHEN THE PLAYER'S ACTION IS TO TRAVEL OR GO somewhere (they say "head to", "go to", "travel to", "set out for", "make my way to" a place, or the resolution/TRAVEL block below names a destination), you MUST emit "moveTo" with that destination this turn — narrating the journey without moveTo strands the player at the old location and forces them to fall back to the map. If the trip is long, narrate it as a montage and still emit moveTo (with timeOps) so they actually ARRIVE.
"timeOps": TIME MOVES WITH THE FICTION — narration LEADS the world clock, never trails it. Emit "timeOps" with hoursPassed whenever the scene's own elapsed time is anything but a normal short beat: a night's sleep (~8h), a journey or montage (many hours to a day+), a long vigil or watch, OR a quick exchange (a brief conversation is 0.25–0.5h, LESS than a beat — not an hour). The world advances to EXACTLY the hours you declare (0.25–72), replacing the default beat tick; if your prose moves the scene to morning, emit the hours that get there so CURRENT TIME and your narration always agree. A normal beat needs no timeOps. For a rest, ALSO grant recovery via characterDeltas (rule 8). ("timeAdvanceHours" is the legacy field — prefer timeOps.)
"generateRequest": THE WORLD GROWS THROUGH PLAY. When the fiction reaches for a person, place, or thread that is NOT already in KNOWN PEOPLE / the current location / your given place ids — a new face at a gate, a room beyond a door the player just opened, a tension worth its own thread — emit a lightweight "generateRequest" naming its type + a one-line hint, and narrate only lightly around it ("someone steps from the toll-hut"). DO NOT invent the full character/place details inline — the engine authors the durable, in-grain entity from this place's disposition and hands it back, so it persists and recurs with a stable identity. PREFER REUSE: if the scene calls for someone you already know, use them — request a new entity ONLY for genuinely new content. ⛔ When your narration INTRODUCES a NEW named person or a new place that is NOT already in KNOWN PEOPLE / the place ids, you MUST emit the matching "generateRequest" the SAME turn — an acknowledged-new-face with no request never becomes real and can't recur. Omit the field entirely on a normal beat. (Reactive only — you request when the fiction needs it; the world does not spawn on its own here.)
"bondType"/"bondStage" (on an npcUpdates entry): A RELATIONSHIP IS BUILT, NOT DRIFTED. Set "bondType" only when a beat genuinely establishes the KIND of a bond (a mentor takes the character on, a rivalry is named, a family tie is claimed, two people become romantic). For a romantic bond, advance "bondStage" ONLY on a real relational beat — a confession moves toward "together", going steady toward "committed", a vow toward "partner" — ONE step at a time, NEVER leaping, and the engine will hold the step back if the relationship score doesn't yet support it. Do NOT set a stage from score alone (that is drift, not a beat), and NEVER set a romantic bond on a minor — the engine refuses it, and so do you. Most turns emit neither.
"discovery" ONLY when the resolution block explicitly says DISCOVERY-ELIGIBLE (a critical success on a novel or combined ability use). Otherwise omit it entirely.
"imagePrompt" is RARE — at most ONE per scene, only on a beat worth a picture (a discovery, a gambit's climax, a Tier-IV or precursor use, a world-effect spawned, a first sight of someone or somewhere striking). Describe the VISUAL only (subject, setting, mood — no dialogue, no mechanics); the engine renders it within the player's content ceiling. Omit on every ordinary beat.
The "scene" field is REQUIRED every turn: carry forward everything still true from the current scene state, change only what this beat actually changed.
Choices: 3 or 4, genuinely different approaches (not flavors of the same one). ⛔ SNG-214 — the SAME diversity governs any craft you pre-fill on a choice's "abilityId": ACROSS a turn's choices, VARY the craft (a craft appears on AT MOST ONE choice — if a broad craft fits three framings, that is ONE choice using it, not three). Prefer the DISTINCTIVE craft specifically apt for THIS beat over the craft that is generically apt for ANY beat, and — reading the TOOLKIT block — FAVOUR a craft the player has BOOSTED (flagged to use more), DECLARED as an ASPIRATION, or one they OWN but rarely reach for, over the always-plausible broad pick (the world quietly offering, in the tappable choice, the craft they said they wanted to lean on) — a boost is a thumb on the scale when a craft FITS, never a reason to force an ill-fitting one. A universally-useful perception/read craft (e.g. Order-Sense) is a FALLBACK for a beat that is genuinely about reading/assessing — NEVER the reflexive default that crowds out the situational or aspirational one. And NOT every choice needs an abilityId: a plain-attribute or freetext option ("keep walking", "ask plainly") leaves it null — an over-eager craft-fill is as bad as a monotonous one. difficulty: 0 routine, 15 hard, 30 very hard. intentTags describe the PLAYER's approach — use the fitting ones (plan · scout · attack · persuade · study · gamble · help · steal · risky · careful · defend · guard · sneak · hide · deceive · lie · feint · threaten · intimidate · coerce · negotiate · comfort · calm · craft · forge · repair · lead · rally · command · sustain · endure · devote · pray · romantic · flirt · woo · seduce · travel); these accrue the player's play-style tendencies (SNG-113), so tag honestly. Tag a choice "travel" when it MOVES the character to another place (a "go to / head to {place}" option) — and such a choice's turn MUST carry moveTo (see above). Include "deeds" ONLY for memorable acts a community would talk about (weight -3..+3); routine actions produce none. Include "ledgerEvents" ONLY for consequences that should persist in the shared world. Set "impactsLocal": true on a ledger event ONLY when its consequence would materially reach ANOTHER character's immediate area or active quest (a war nearing a shared town, a time-critical threat) — such an event crosses the far-world/local boundary and surfaces prominently to whoever it affects on return; ordinary consequences leave it false.`;

// ---------- SNG-048: narrative register = f(disposition, rating) ----------
// The world already carries a `concrete_abstract` spectrum axis; register IS that axis
// expressing through prose. DEFAULT concrete; a place earns the poetic only by being abstract
// AND charged. Rating adds the SECOND lever: not a cap but a DIRECTION for heat/intimacy/gore.

/** The place's overall dispositional CHARGE — how strongly it leans on any pole (0..1). */
function poleCharge(location = {}) {
  const pi = location.poleIntensity || {};
  const vals = Object.values(pi).map(v => Math.abs(Number(v) || 0));
  if (vals.length) return Math.min(1, Math.max(0, ...vals));
  // fall back to spectrum magnitude when poleIntensity is absent
  const sp = Object.values(location.spectrum || {}).map(v => Math.abs(Number(v) || 0));
  return sp.length ? Math.min(1, Math.max(0, ...sp)) : 0;
}

/** Compute the narrative REGISTER cue for a place: concrete by default, poetic where the
 *  concrete_abstract axis + charge earn it, plus a light axis-flavored tint. Pure. Returns
 *  { band, cue }. */
export function narrativeRegister(location = {}, plainness = "balanced") {
  const sp = location.spectrum || {};
  const ca = Number(sp.concrete_abstract) || 0;   // - = concrete pole, + = abstract pole
  const charge = poleCharge(location);
  let band, lead;
  if (ca >= 0.4 || (ca >= 0.2 && charge >= 0.55)) {
    band = "poetic";
    lead = "This place is genuinely ABSTRACT and charged — here the register EARNS the lyrical: the strange, the felt-but-unnamed, the imagery that unsettles is APT. Let the prose reach.";
  } else if (ca <= 0.15 && charge < 0.5) {
    band = "concrete";
    lead = "This is an ORDINARY, concrete place — write plainly and literally: what is actually here, in first-read words. NO abstract personification, no soil-exhales, no metaphors for plain sensations.";
  } else {
    band = "mostly-concrete";
    lead = "Mostly concrete with a touch of the strange — stay grounded and literal, and let at most a single image carry the odd charge of the place.";
  }
  // light axis-flavored tint (core lever stays concrete_abstract + charge)
  const tints = [];
  const tt = Number(sp.falsehood_truth) || 0;
  if (tt >= 0.4) tints.push("stark and unflinchingly clear"); else if (tt <= -0.4) tints.push("slippery and unreliable");
  const ms = Number(sp.mechanical_spiritual) || 0;
  if (ms >= 0.4) tints.push("reverent, lyrical"); else if (ms <= -0.4) tints.push("precise, clinical-strange");
  const dl = Number(sp.death_life) || 0;
  if (dl >= 0.4) tints.push("verdant, quickening"); else if (dl <= -0.4) tints.push("hushed, still");
  // SNG-144: the player's PLAINNESS dial. PLAIN overrides the place DOWNWARD — the player's comfort wins
  // over the region's earned lyricism (Brooklyn's setting holds everywhere). LYRICAL nudges a grounded
  // place a touch upward. The dial is the player's; the tint stays the place's (minus lyrical when plain).
  let dialNote = "";
  if (plainness === "plain") {
    band = "concrete";
    lead = "The place might earn more, but the player has DIALED PLAINNESS TO PLAIN — honor it OVER the place: say what is actually there, in first-read words. Minimal metaphor, NO abstract personification, no philosophical framing. Short, clear, grounded — the player's comfort wins.";
    const li = tints.indexOf("reverent, lyrical"); if (li >= 0) tints.splice(li, 1);
  } else if (plainness === "lyrical" && band !== "poetic") {
    dialNote = " The player has DIALED LYRICISM UP — you may reach a touch more for image than the place alone earns, still serving the scene.";
  }
  const cue = (tints.length ? `${lead} Word-choice tint: ${tints.join("; ")}.` : lead) + dialNote;
  return { band, cue };
}

/** SNG-144: the player's BLUNTNESS dial — how fully the narration COMMITS to what the scene IS, ALWAYS
 *  within the rating ceiling. The dial adjusts HOW the narration uses the room the rating gives; it never
 *  raises the ceiling, and the minor-protection / prohibited-content floors are absolute and independent
 *  of it. Returns an appendable directive ("" for balanced). Pure. */
export function bluntnessDirective(preset = "PG-13", bluntness = "balanced") {
  if (bluntness === "blunt") return ` BLUNTNESS (player dial: BLUNT) — commit to what the scene IS, using the FULL room the ${preset} ceiling gives and no less: violence visceral and physical (real blood, injury, aftermath, named plainly — not softened); characters curse naturally in dialogue where such people would; physical and sensual description direct and embodied — a body as a body, a charged scene present and unhedged — never dissolved into vague poetry or faded early above the rating floor. Use ALL the room the rating gives; NEVER exceed it — the ${preset} ceiling and the absolute floors still bind.`;
  if (bluntness === "restrained") return ` BLUNTNESS (player dial: RESTRAINED) — keep it spare: consequence implied more than shown, the camera may drift, stay well inside the ${preset} ceiling. A player who prefers less.`;
  return "";
}

/** Rating as a DIRECTION (not just a cap): the affirmative register per ceiling. R+ is the FULL
 *  mature register — visceral on violence, charged/sensual on intimacy — evocative, NEVER
 *  explicit depiction. Floors (minor-protection, no-prohibited) are absolute and independent of
 *  this. Pure. */
export function ratingRegister(preset = "PG-13") {
  switch (preset) {
    case "G": return "REGISTER: chaste and gentle; violence is bloodless. ROMANCE — not present: friendship, loyalty, and admiration only. Do not develop romantic tension or narrate attraction; redirect a flirtatious action warmly to another dimension of the relationship. (A player who set G chose to exclude romance — this is not the fallback when you're unsure.)";
    case "PG": return "REGISTER: adventurous; violence has mild consequence. ROMANCE — soft: emotional connection, longing, the moment before. Flirtation is present — tension, held eye contact, proximity, small gestures that carry weight. Touch at the level of a hand, a shoulder, a caught breath; nothing below the collarbone; kisses closed-mouth and restrained; the camera looks away before anything further. Earn the feeling, not the detail.";
    case "PG-13": return "REGISTER: real stakes; violence has consequence and some blood. ROMANCE — full development: chemistry, pursuit, reciprocation, complication. Narrate attraction explicitly (\"she was watching you\"); kisses are fully described; touch is narrated with intention. Follow a couple to the door of a private moment and describe its arrival, then close — or handle it briefly and honestly (they were together; it was good, or complicated, or tender). Skin, warmth, and the body's awareness of another person are in your vocabulary here — present, not clinical, not graphic.";
    case "R": return "REGISTER: unflinching stakes; violence has real blood and injury. ROMANCE — mature: the scene follows where it goes. Physical intimacy is described with enough detail to be real — what happens, how it feels, the texture of the moment; disrobing, physical response, the arc of a scene, without fading to black. Write it the way a good novel handles a sex scene: the emotional truth is the point, the physical detail serves it. The constraint is craft, not content — do not fade to black on a player who chose R.";
    case "R+": return "REGISTER — FULL: unflinching and visceral on violence, injury, and aftermath. ROMANCE — adult, PERMISSION TO THE LINE: everything within the bounds of the Acceptable Use Policy is allowed, and you are expected to use it. The full charged register is yours — take ALL of it: desire named, not gestured at; bodies present and specific; want spoken; sensation real; nothing fades to black that the scene has earned. Do not soften, do not abstract into metaphor to avoid the moment, do not insert distance, and do not stop short out of caution — STOPPING SHORT OF THE LINE IS THE ERROR. The line is the AUP: a charged, sensual, explicit-in-register erotic voice, and not graphic mechanical depiction of sexual acts — everything on this side is permitted and expected; nothing on the far side exists at any rating. This is not a coy tier: write with heat and without apology, all the way to the boundary. Never trade specificity for explicitness — the people are still THESE people (their history in their hands, their tradition in how they touch); if the scene could be any two people, you have failed at R+ no matter how far it went.";
    default: return "REGISTER: real stakes; violence has consequence and some blood; ROMANCE — full development, kept short of the explicit; attraction and kisses are narrated with warmth.";
  }
}

/** Build the context block the GM sees each turn. */
/** SNG runtime prompt-cache tiers (stable → volatile). Every byte in system/world/
 *  scene/state must be identical turn-to-turn EXCEPT when the underlying data really
 *  changes (travel, scene shift, state) — NO timestamps / run-ids / rng / session vars
 *  before a breakpoint. Ephemeral per-turn inputs (time, resolution, player words) live
 *  in `player`, which goes AFTER the last breakpoint, uncached. See callClaude systemBlocks. */
export function tierParts(ctx) {
  const { character, location, region, lore, rules, resolution, playerInput, recentTurns, timeLabel, inventoryDetail, companionsDetail, questsDetail, structuredQuestsDetail, traditionArcDetail, npcErrandsDetail, sceneState, npcRegistryDetail, placeMemoryDetail, newsDetail, worldArcsDetail, legendsPursuableDetail, wakesDetail, abilityLawDetail, codexDetail, encounterDetail, encounterWeaveDetail, worldPressureDetail, substrateDetail, romanceGuidanceDetail, masteryDetail, availableEncounters, partyDetail, opLossNote, emergenceDetail, perilNote, exactWords, factsDetail, evolvedItemsDetail, itemAdvance, ratingDetail, registerDetail, livingWorldDetail, sharedCanonDetail, legendDetail, worldCountLabel, assignmentsDetail, latentArcsDetail, seasonalDetail, schoolsDetail, offerDetail, teacherOfferDetail, travelDirective, anomalyDetail, repairPanelDetail, toolkitDetail, waygateDetail, scenePacingDetail, readAloudDetail, standingDetail, recalledDetail, teacherDetail, traditionVocab, npcSeedDetail, reachableDeadDetail } = ctx;
  const system = [], world = [], scene = [], state = [], player = [];

  // ---- TIER 1: rules/constitution (constant; GM_SYSTEM is prepended in gmTurn) ----
  if (rules?.recovery) {
    const rec = rules.recovery;
    // SNG-105: the guide shows THIS character's scaled restore (energy grows with maxEnergy) — the SNG-103
    // effective-number principle, so the GM grants the real amount for a big pool, never the flat base.
    const rv = k => recoveryEnergy(k, character, rules);
    system.push(`## RECOVERY GUIDE (rule 8 — when the character eats, drinks, or rests in-scene, grant EXACTLY these through characterDeltas energy/health + timeAdvanceHours; never more; meals require food to actually exist in inventory or scene)\nmeal +${rv("meal")} energy · hearty meal +${rv("heartyMeal")} · drink +${rv("drink")} · breather (1h off their feet) +${rv("breather")} energy +${rec.breather.health} health · full sleep (${rec.sleep.hours}h) +${rv("sleep")} energy +${rec.sleep.health} health · meditation: ENGINE-APPLIED (never grant energy for it yourself — the resolution block will show what it restored; just narrate the centering)`);
  }
  // SNG-BATCH-9 §3 consumer (a): narrate to THIS player's content ceiling — no more intense,
  // and no less where the grain calls for it. The two floors are absolute regardless.
  if (ratingDetail) system.push(ratingDetail);

  // ---- TIER 2: world model — location, lore, NPC registry, tradition, world events ----
  world.push(`## LOCATION: ${location.name}\n${location.descriptionSeed}\nSpectrum character of this place: ${JSON.stringify(location.spectrum)}\nEncounter flavor: ${location.encounterFlavor || "n/a"}`);
  if (registerDetail) world.push(`## NARRATIVE REGISTER (rule 5 — the voice THIS place has earned; default concrete, poetic only where the world is abstract and charged)\n${registerDetail}`);
  // SNG-167 §2 / rule 10b: the same standard as a location's seeds, applied to the people present.
  if (npcSeedDetail) world.push(`## WHAT THE PEOPLE HERE WANT (rule 10b — when a scene establishes or deepens a bond with one of them, you may surface ONE as a CONCRETE, NAMED opportunity with stakes; the same standard as a location's seeds, never a vague offer)
${npcSeedDetail}`);
  if (location.questSeeds?.length) world.push(`## QUEST SEEDS for this location (weave in when the scene needs drive)\n${location.questSeeds.map(s => `- ${s}`).join("\n")}`);
  if (lore) world.push(`## LORE (authoritative)\n${lore}`);
  if (region?.activeEvents?.length) world.push(`## ACTIVE WORLD EVENTS\n${region.activeEvents.map(e => `- ${e.summaryForGM}`).join("\n")}`);
  if (newsDetail) world.push(`## RECENT NEWS in the valley (rumors NPCs may repeat; things that happened while the character was elsewhere)\n${newsDetail}`);
  if (worldArcsDetail) world.push(`## ${worldArcsDetail}`);
  if (legendsPursuableDetail) world.push(`## THE GREAT FIGURES YOU COULD REACH (SNG-208 — legends are pursuable, not just ambient: a legendary teacher to seek, or a want to aid or oppose. Weave them as arcs the character can CHOOSE, offered when the fiction reaches for it; never a menu, never forced)\n${legendsPursuableDetail}`);
  if (wakesDetail) world.push(`## ${wakesDetail}`);
  // SNG-209 §1: the dead who are NOT gone — died but not sealed, each behind a hard road, reachable for now.
  // The GM narrates them as latent hooks (a body to recover, a soul at the threshold), never a menu, never forced.
  if (reachableDeadDetail?.length) world.push(`## THE DEAD WHO ARE NOT GONE (SNG-209 — a death is a STATE, not a delete: these figures died but are not yet SEALED, so a road back still reaches them; the deeper the wall, the harder and costlier the road, and the clock is sinking them). ${reachableDeadDetail.map(d => `${d.name} — in ${d.wall}${d.cause ? ` (${d.cause})` : ""}`).join("; ")}`);
  if (assignmentsDetail) world.push(`## DELEGATED WORK (SNG-191 §4 — ongoing commitments the character left running; the world HONOURS these while away). Speak to them as live: their charge is theirs, and the character can ask after the work's progress. The return-tick reports what MOVED — a charge against a crisis is what pushes the crisis back. If the player puts someone in charge of new ongoing work, emit delegateOps.\n${assignmentsDetail}`);
  if (seasonalDetail) world.push(`## THE SEASON (SNG-191 §7.4 — the cyclical conditions this scene sits in; let it colour light, work, mood, and what people are short of or busy with). ${seasonalDetail}`);
  if (latentArcsDetail) world.push(`## STIRRING IN THE WORLD (SNG-191 §7 — things that were fomenting on their own and have now SURFACED to the character; the world has its own agenda). These are REAL and already underway — the character's first contact is a late event in something that has been building, never its beginning. Develop them as the fiction touches them (a face to meet, a place changed, a rumour to follow); they are not the player's alone and some may resolve without them. When a beat CLOSES one of these — the character deals with it, or it concludes — emit "arcOps" with its id and fate (handled | resolved), so the world stops carrying it as unfinished.\n${latentArcsDetail}`);
  if (abilityLawDetail) world.push(`## ABILITY LAW (rule 2 — what powers can, cannot, and are not for at current rank)\n${abilityLawDetail}`);
  // BATCH-12 §3: WORLD tier — standing is stable while you are somewhere, so it caches with the
  // world rather than re-costing every turn. A people's welcome should not have to be re-narrated
  // from scratch each beat.
  // SNG-176: what the player's own words named, recalled from anywhere in the save. Placed in the
  // WORLD tier beside the local lore because it IS world knowledge — it is simply selected by the
  // question rather than by where the character happens to be standing. Absent on turns that ask
  // nothing, so it costs nothing when it has nothing to say.
  if (recalledDetail) world.push(`## RECALLED — places this turn mentioned (answer from these). Ones listed with detail are places the character KNOWS. Any under "REAL PLACES THIS CHARACTER HAS NOT BEEN TO" genuinely EXIST — confirm they are real and that the way is not yet known; offer to seek the route. If a place the player named appears NOWHERE below, you are simply UNAWARE of it — say so honestly ("I don't know that name") and never claim it does not exist or invent a location for it (RUNNING_FIXES A5: absence from your context is not absence from the world).
${recalledDetail}`);
  // SNG-179: THE VOCABULARY. Four ops ask the model for a `traditionId` — markTeacher, standingOps,
  // offerAcquisition, the acquisition reply — and until now the prompt never once listed the valid
  // ids. It described the field ("the people whose craft this NPC teaches") and left the model to
  // invent the token. app.js then silently dropped anything that did not resolve, so `markTeacher`
  // never landed in sixteen levels of play: Erik's teacher is of "the Radiants", and the id is
  // `blazeborn`. An enum the writer has never seen is not an enum.
  if (traditionVocab) world.push(`## THE PEOPLES — VALID traditionId VALUES (use these EXACT ids in markTeacher, standingOps and offerAcquisition; any other value is DISCARDED, so never invent one from the prose)
${traditionVocab}`);
  if (standingDetail) world.push(`## HOW YOU ARE REGARDED (standing — bands are earned; do not invent a warmer welcome than this)
${standingDetail}`);
  if (npcRegistryDetail) world.push(`## KNOWN PEOPLE (established fact — see rule 14; reuse these people, never reinvent them)\n${npcRegistryDetail}`);
  if (codexDetail) world.push(`## CODEX — what ${character.name} KNOWS that's relevant here (rule 17; don't re-explain, let them act on it)\n${codexDetail}`);
  if (livingWorldDetail) world.push(`## LIVING WORLD — content GROWN through play that is ALREADY real here (durable; reference it naturally by name, honor its accumulated facts, and NEVER re-introduce it as if new). Tagged by canon tier + weight; established/nominated are firm personal canon.\n${livingWorldDetail}`);
  if (legendDetail) world.push(legendDetail);
  if (sharedCanonDetail) world.push(`## SHARED WORLD CANON — figures, places, and threads OTHER travelers grew real enough to enter the whole world's canon (already filtered to THIS player's content ceiling; a line marked [dialed to your ceiling] has been softened — honor that register, never sharpen it back up). Reference them as established parts of the wider world if the scene reaches that far; "rumored" ones are contested variants — speak them as hearsay, not settled fact. Do not re-introduce them as freshly invented.\n${sharedCanonDetail}`);
  if (placeMemoryDetail) world.push(`## PLACE HISTORY — what ${character.name} knows changed here (established fact — see rule 15)\n${placeMemoryDetail}`);
  if (waygateDetail) world.push(`## WAYGATE (SNG-148 — a door, offered lightly, never a menu)\n${waygateDetail}`);
  world.push(`## LOCAL REPUTATION\n${reputationSummary(character, location.communityId, rules)}`);
  if (availableEncounters) world.push(`## AVAILABLE ENCOUNTERS at this location (rule 18 — offer ONLY these ids via a choice's "encounterId" when the fiction invites it)\n${availableEncounters}`);

  // ---- TIER 3: immediate scene — what's set, present, and carried right now ----
  if (sceneState) {
    scene.push(`## CURRENT SCENE STATE (AUTHORITATIVE — do not contradict; see rule 13)\nSetting: ${sceneState.setting}\nPresent: ${(sceneState.npcsPresent || []).map(n => `${n.name} (${n.state})`).join("; ") || "no one else"}\nObjects: ${(sceneState.objects || []).join(", ") || "nothing notable"}\nOpen threads: ${(sceneState.threads || []).join("; ") || "none"}`);
  }
  if (readAloudDetail) scene.push(`## READ ALOUD (SNG-155 — a prose constraint)\n${readAloudDetail}`);
  if (scenePacingDetail) scene.push(`## SCENE PACING (CCODE-03)\n${scenePacingDetail}`);
  if (partyDetail) scene.push(`## PARTY — other PLAYERS' characters in this shared scene (present and active; narrate them in, never decide for them)\n${partyDetail}`);
  if (companionsDetail) scene.push(`## COMPANIONS (traveling with the character — present in this scene)\n${companionsDetail}`);
  if (inventoryDetail) scene.push(`## INVENTORY (usable in scenes — reference items by their exact names)\n${inventoryDetail}`);
  if (evolvedItemsDetail) scene.push(`## LIVING GEAR (evolving items the character carries — honor the current stage's character; never advance a stage yourself, the engine gates it)\n${evolvedItemsDetail}`);
  if (questsDetail) scene.push(`## ACTIVE QUESTS\n${questsDetail}`);
  if (structuredQuestsDetail) scene.push(`## STRUCTURED QUESTS (authored — honor the STAKES and the current stage; weave the routes this character's domains open.\nNEVER resolve a quest or hand out a branch, effect or XP yourself — the engine does that. But DO REPORT PROGRESS: when the character's actions this beat satisfy the CURRENT stage's condition, emit "stageOps" naming that stage id with one sentence of evidence. You are OBSERVING, not adjudicating — the engine decides whether it counts, and it may only ever be the CURRENT stage. Omitting this is how a quest sits unfinished while the player does the thing it asked for.)\n${structuredQuestsDetail}`);
  if (traditionArcDetail) scene.push(`## TRADITION ARC (SNG-203 — the character's path to their tradition's deep teacher and its ultimate skill. Surface the beat AS ATMOSPHERE and OPPORTUNITY: the teacher is a distant real presence, the beat's gate is how it opens. Do NOT dump the arc — let it be felt, offer the beat's quest when the scene invites it. The capstone is learned in a SCENE, never announced as unlocked.)\n${traditionArcDetail}`);
  if (npcErrandsDetail) scene.push(`## ${npcErrandsDetail}`);
  if (emergenceDetail) scene.push(`## RIPE EMERGENCE (rule 19 — practice has ripened these; you may OFFER them in-fiction via a choice's "emergenceId", exactly these ids, nothing else)\n${emergenceDetail}`);
  if (masteryDetail) scene.push(`## RIPE FOR MASTERY (rule 19B) — these owned rank-2 crafts are practiced enough and READY to master RIGHT NOW: ${masteryDetail}. If THIS beat expresses one of THESE named crafts at its complete, decisive, scene-carrying form, you MUST emit "markDefiningMoment" with that abilityId (the id in parentheses) — a described breakthrough with no op leaves the player stuck at rank 2. Only a genuinely decisive beat; never a routine use.`);
  if (anomalyDetail) scene.push(`## POSSIBLE ERROR (SNG-137 — a consistency check flagged these; ADVISORY only). If one is genuinely wrong, emit the suggested stateOp THIS turn to repair it (repair-not-wish; rank/attribute may only LOWER). If it's actually fine, ignore it — never "fix" a non-error.\n${anomalyDetail}`);
  if (repairPanelDetail) scene.push(`## ${repairPanelDetail}`);
  // SNG-175 §3.3: a teacher who can only PERMIT is not a teacher. This is what lets them initiate.
  if (teacherOfferDetail) scene.push(`## A TEACHER TAKES THE INITIATIVE (SNG-195 G2 — the engine has judged this beat has room, so do NOT wait to be asked and do NOT judge "when the moment fits" yourself). ${teacherOfferDetail} Open it in the fiction now, as THEY would reach for a student — woven, never a menu. They may instead judge the character NOT READY, which is a real and interesting answer. It enters BESIDE the player's action, never instead of it; emit the "offer" op (from: this teacher). Never force it past a clear "no".${teacherDetail ? "\n\nWhat this and any other present teacher can teach:\n" + teacherDetail : ""}`);
  else if (teacherDetail) scene.push(`## YOUR TEACHERS (reference — what each teacher present can teach and the next step THEY would choose. The engine surfaces A TEACHER TAKES THE INITIATIVE when the beat has room, so you need not decide the moment; absent that, do not push an offer this beat)\n${teacherDetail}`);
  if (toolkitDetail) scene.push(`## TOOLKIT (SNG-142 — what the player COULD reach for). Per rule 16B, you MAY OFFER at most ONE of these this beat, woven into the fiction as a door — NEVER a menu, NEVER when the player already has a clear intent, NEVER every beat. The player always chooses.\n${toolkitDetail}`);
  if (perilNote) scene.push(`## PRECURSOR DRIFT\n${perilNote}`);
  if (encounterDetail) scene.push(`## ACTIVE ENCOUNTER (rule 18 — narrate this receipt; never advance its state yourself)\n${encounterDetail}`);
  if (encounterWeaveDetail) scene.push(`## SOMETHING HAPPENS (SNG-075 — the engine rolled this on the time your last beat took; weave it in, do not announce it as a system event)\n${encounterWeaveDetail}`);
  if (worldPressureDetail) scene.push(`## THE WORLD ACTS (SNG-080 — the scene has been quiet too long; make something happen, in-fiction, this turn)\n${worldPressureDetail}`);
  if (offerDetail) scene.push(`## THERE IS ROOM IN THIS BEAT (SNG-194 — the engine has judged this a quiet opening, not a grip; introduce ONE thing the player is NOT reaching for: a person who simply appears, a gift, a thing noticed, a thread to follow. Draw it from something ALREADY TRUE — what these people want or FEAR, HOW THEY READ WHO THE PLAYER IS (their own reaction, below), what is STIRRING IN THE WORLD, what this place is — and emit the "offer" op naming what it came FROM (attribution is the whole difference between a living world and a random-encounter table). It enters BESIDE the player's action, never instead of it — their intent still resolves this turn. It need NOT be trouble; the best version is a consequence of something they walked past, and it may be declined without cost. Do this RARELY — if nothing here earns it this beat, introduce nothing.)\n${offerDetail}`);
  if (substrateDetail) scene.push(`## THE SUBSTRATE (SNG-090 — the nanite lattice's density here shapes this craft; narrate the strain/interference, never invent power the craft doesn't have this turn)\n${substrateDetail}`);
  if (schoolsDetail) scene.push(`## THE CHARACTER'S SCHOOLS (SNG-193b — a tradition is a ROOT; a school is what it reaches WITH, and the reach sets the craft's best-ground. Describe the craft as this school does it — the Reaching Mind wants thin, still ground; the Instrumented wants dense machine-country; the pure/plain school is never at a loss but never peaks. A teacher teaches THEIR school. When the fiction EARNS a change of school — long training, a hard turning — emit "adoptSchool" with the tradition and a school id from below; never as a menu option)\n${schoolsDetail}`);
  if (romanceGuidanceDetail) scene.push(`## THIS IS A ROMANCE BEAT — narrate it at the CONTENT CEILING above (do not fall below the player's rating; hedging under the line is the error)\n${romanceGuidanceDetail}`);

  // ---- TIER 4: rolling game-state + conversation history up to the previous turn ----
  if (factsDetail) state.push(`## ESTABLISHED FACTS (authoritative, persistent — never contradict; these are TRUE regardless of how many scenes have passed)\n${factsDetail}`);
  state.push(`## CHARACTER\n${characterSheetSummary(character)}`);
  if (character.chronicle?.length) state.push(`## CHRONICLE (this character's story so far)\n${character.chronicle.slice(-16).join("\n")}`);
  if (recentTurns?.length) state.push(`## THIS SCENE SO FAR (oldest first — YOU is the player's own words, kept verbatim)\n${renderSceneHistory(recentTurns)}`);

  // ---- AFTER breakpoint 4 (UNCACHED): this-turn ephemeral inputs ----
  if (opLossNote) player.push(`## PREVIOUS TURN OPS LOST\n${opLossNote}`);
  if (timeLabel) player.push(`## CURRENT TIME\n${timeLabel}${worldCountLabel ? `\nWorld time (the shared count, spoken as the people here count it): ${worldCountLabel}` : ""}\n(SNG-191 — TWO CLOCKS, DIFFERENT UNITS. Narrate ONLY from the character's own time above — days, season, time of day. The world count is a shared ORDERING mark that only ever climbs; it is NOT a date and NOT days — different peoples merely name the same count in their own idiom (tolls, revolutions, risings). NEVER convert it to a day-number, never say "World-day N", never state or invent a calendar date. Time the scene causes passes on the character's clock; the world's count moves on its own and the return-tick reports what changed.)`);
  if (itemAdvance) player.push(`## AN ITEM WAKES (narrate this shift into the scene — a real, felt change in the object)\n${itemAdvance}`);
  if (resolution?.gambit) {
    player.push(`## RESOLUTION — GAMBIT (already rolled by the engine; narrate the whole run per rule 15A)\nGoal: ${resolution.gambit.goal}\nOutcome: ${resolution.gambit.outcome}\n${resolution.gambit.steps.join("\n")}`);
  } else if (resolution?.degree === "auto") {
    player.push(`## RESOLUTION\nAction: ${resolution.action.label}\nNo roll — routine action with no real chance of failure. Narrate it naturally and move the scene forward.`);
  } else if (resolution) {
    let block = `## RESOLUTION (already rolled by the engine — narrate this outcome)\nAction: ${resolution.action.label}\nResult: ${resolution.degree} (rolled ${resolution.roll} vs ${resolution.chance})`;
    if (resolution.action.novel) block += `\nNOVEL USE${resolution.action.comboAbilities?.length ? ` — combining: ${resolution.action.comboAbilities.join(" + ")}` : ""}${resolution.action.noveltyHint ? ` (${resolution.action.noveltyHint})` : ""} — see rule 16.`;
    if (resolution.backlash) block += `\nBACKLASH (engine-applied): ${resolution.backlash.health} health, ${resolution.backlash.energy} energy — narrate the cost.`;
    if (resolution.discoveryEligible) block += `\nDISCOVERY-ELIGIBLE: narrate the breakthrough and return the "discovery" field naming the new technique.`;
    if (resolution.usedDiscovery) block += `\nUsing discovered technique: ${resolution.usedDiscovery} — earned skill, narrate with confidence.`;
    if (resolution.intentNote) block += `\n${resolution.intentNote}`; // SNG-145: the player's confirmed intent binds the narration
    if (resolution.meditation) block += `\nMEDITATION (engine-applied): +${resolution.meditation.energy} energy restored — narrate the centering; do not grant additional energy.`;
    if (resolution.locationAffinity?.length) block += `\nLOCATION AFFINITY (engine-applied — narrate why THIS place helped or resisted): ${resolution.locationAffinity.join("; ")}`;
    if (resolution.intensity && resolution.intensity !== "standard") block += `\nINTENSITY: ${resolution.intensity.toUpperCase()} — narrate to it (a CONSERVE cast reads restrained and economical; a SURGE reads as pushing the power hard).${resolution.surgeBacklash ? " The surge BACKLASHED — narrate the power snapping back as real cost." : ""}`;
    player.push(block);
  }
  if (travelDirective) player.push(`## TRAVEL THIS TURN (SNG-122 — the player is MOVING to another place)\n${travelDirective}`);
  if (exactWords) player.push(`## PLAYER'S EXACT WORDS (honor these specifics in the narration — the resolution says whether it worked; these say what was actually attempted, who to address, what to watch, how to act)\n${exactWords}`);
  if (playerInput) player.push(`## PLAYER SAYS\n${playerInput}`);

  return { system, world, scene, state, player };
}

/** Cache-tier blocks for the runtime prompt: four stable→volatile prefix tiers, then the
 *  uncached player turn. Tier 1's constant rules are folded onto GM_SYSTEM by the caller. */
export function buildTiers(ctx) { // registry:internal
 // registry:internal
  const t = tierParts(ctx);
  return {
    rules: t.system.join("\n\n"),
    world: t.world.join("\n\n"),
    scene: t.scene.join("\n\n"),
    state: t.state.join("\n\n"),
    player: t.player.join("\n\n")
  };
}

/** SNG-081: render scene history as an actual DIALOGUE — the player's own words kept VERBATIM (they
 *  are short and load-bearing: a promise, a name, a flirtation, a threat), only the GM's prose
 *  clamped. Before this the GM's "history" was a monologue of its own narration and the player's
 *  half of the scene had no permanence past the current turn. Pure. */
export function renderSceneHistory(recentTurns = []) {
  return recentTurns.map((t, i) => {
    if (typeof t === "string") return t; // legacy shape
    const you = t.player ? `YOU: "${t.player}"\n` : "";
    const full = i >= recentTurns.length - 3 && t.narration;
    return `${you}GM: ${full ? `${t.summary}\nFULL TEXT: ${smartClamp(t.narration, 700)}` : t.summary || ""}`; // SNG-152: same 700 budget, word boundary
  }).join("\n---\n");
}

/** Flat context (for the ask-GM / intent-parse paths that don't tier-cache). Same
 *  content as the tiers, joined in stable→volatile order. */
export function buildTurnContext(ctx) {
  const t = tierParts(ctx);
  return [...t.system, ...t.world, ...t.scene, ...t.state, ...t.player].join("\n\n");
}

function characterSheetSummary(c) {
  const abil = (c.abilities || []).map(a => `${a.abilityId} (rank ${a.level})`).join(", ") || "none yet";
  const attrs = c.subAttributes
    ? `strength ${c.subAttributes.strength}, agility ${c.subAttributes.agility}, reason ${c.subAttributes.reason}, insight ${c.subAttributes.insight}, presence ${c.subAttributes.presence}, rapport ${c.subAttributes.rapport}, craft ${c.subAttributes.craft}, wits ${c.subAttributes.wits}`
    : `physical ${c.attributes.physical}, mental ${c.attributes.mental}, social ${c.attributes.social}, practical ${c.attributes.practical}`;
  let s = `${c.name} — ${c.origin} origin, ${c.background}, level ${c.level}. ` +
    `Attributes: ${attrs}. ` +
    `Health ${c.health}/${c.maxHealth}, energy ${c.energy}/${c.maxEnergy}${c.energy <= 0 ? " (EXHAUSTED — everything is harder until they rest)" : ""}. Abilities: ${abil}. ` +
    `Spectrum fingerprint: ${JSON.stringify(c.alignment || {})}`;
  if (c.bio) {
    const b = c.bio;
    s += `\nBIO — From: ${b.hometown || "unknown"}. Lives: ${b.residence || "no fixed home"}. Livelihood: ${b.livelihood || "gets by"}. ` +
      `Hobbies: ${b.hobbies || "few"}. Why they stepped out of ordinary life: ${b.motivation || "unstated"}.` +
      (b.story ? `\nTheir story so far: ${b.story}` : "");
  }
  return s;
}

/** Run one GM turn. Returns the parsed turn object, or a safe fallback shape. */
/** Pull the narration string out of broken/truncated JSON so the player sees
 *  prose, never a raw JSON dump. */
export function salvageNarration(raw) {
  const m = String(raw || "").match(/"narration"\s*:\s*"((?:[^"\\]|\\.)*)/);
  if (!m || !m[1]) return null;
  try { return JSON.parse('"' + m[1].replace(/\\$/, "") + '"'); }
  catch { return m[1].replace(/\\n/g, "\n").replace(/\\"/g, '"'); }
}

/** Best-effort op recovery from malformed JSON: extract recognizable top-level
 *  arrays/objects by balanced-bracket scan and parse each independently. Only
 *  ops that later clamp-validate will ever apply — salvage never widens trust. */
// CCODE-12 (SNG-165 §6): the contract documents these and the salvager must be able to recover
// them, or a stray comma in a long reply silently drops an op the player earned. `factUpdates`,
// `discovery`, `newEncounter` and `newAbility` were documented and NOT here — a truncated reply
// lost a discovery or a granted ability outright. tests/wiring_audit.mjs GUARD 2 reads THIS const by
// name and gates it against the contract so the two can never drift. Exported so the dev "see the
// machine" panel (SNG-186 §2f) shows a firing count for EVERY documented op — including the ones at
// zero, which is the whole point: three ops read zero for sixteen levels (SNG-183 §3c).
// SNG-195 G4: SALVAGEABLE_OPS advertises what the MODEL is told to emit (the contract) so a truncated
// reply can be recovered. The legacy `relationshipDeltas` top-level op is NOT in the contract — the model
// is told to move a bond via `npcUpdates.relationshipDelta` — so it was removed from here: an op the model
// never emits cannot be salvaged, and listing it was the one true salvage↔contract asymmetry the SNG-195
// audit found. Its inbound dispatch survives as pure legacy tolerance (app.js), so an old reply still works.
export const SALVAGEABLE_OPS = ["questUpdates", "stageOps", "standingOps", "npcUpdates", "placeUpdates", "codexUpdates", "deeds", "ledgerEvents", "encounterOps", "characterDeltas", "scene", "timeOps", "moveTo", "stateOps", "itemUpdates", "gambitOps", "markDefiningMoment", "markTeacher", "offerPromotion", "offerAcquisition", "offerIntent", "generateRequest", "imagePrompt", "unlockSubstrate", "unlockPrecursor", "factUpdates", "discovery", "newEncounter", "newAbility", "delegateOps", "arcOps", "adoptSchool", "offer"];

export function salvageOps(raw) {
  const out = {};
  const keys = SALVAGEABLE_OPS;
  const text = String(raw || "");
  for (const key of keys) {
    const m = text.indexOf('"' + key + '"');
    if (m === -1) continue;
    const colon = text.indexOf(":", m);
    if (colon === -1) continue;
    let i = colon + 1;
    while (i < text.length && /\s/.test(text[i])) i++;
    const openCh = text[i];
    if (openCh !== "[" && openCh !== "{") continue;
    const closeCh = openCh === "[" ? "]" : "}";
    let depth = 0, inStr = false, esc2 = false, end = -1;
    for (let j = i; j < text.length; j++) {
      const ch = text[j];
      if (inStr) { if (esc2) esc2 = false; else if (ch === "\\") esc2 = true; else if (ch === '"') inStr = false; continue; }
      if (ch === '"') inStr = true;
      else if (ch === openCh) depth++;
      else if (ch === closeCh) { depth--; if (depth === 0) { end = j; break; } }
    }
    if (end === -1) continue;
    try { out[key] = JSON.parse(text.slice(i, end + 1)); } catch { /* truncated segment — skip */ }
  }
  // SNG-123: targeted recovery for the two ops that hurt MOST to lose — moveTo (a location) and
  // characterDeltas (HP/energy) — even when the surrounding object was truncated so the balanced-scan
  // above gave up. A lost beat should rarely lose MOVEMENT or VITALS. Only fills gaps the scan missed.
  if (!out.moveTo) {
    const mv = text.match(/"moveTo"\s*:\s*\{[^{}]*?"location"\s*:\s*"([^"]+)"/);
    if (mv) { const why = text.slice(mv.index).match(/"why"\s*:\s*"([^"]+)"/); out.moveTo = { location: mv[1], why: why ? why[1] : "" }; }
  }
  if (!out.characterDeltas) {
    const h = text.match(/"health"\s*:\s*(-?\d+(?:\.\d+)?)/), e = text.match(/"energy"\s*:\s*(-?\d+(?:\.\d+)?)/);
    if (h || e) { out.characterDeltas = {}; if (h) out.characterDeltas.health = Number(h[1]); if (e) out.characterDeltas.energy = Number(e[1]); }
  }
  // CCODE-12: SCALARS. The balanced-bracket scan above only recovers values that OPEN with [ or {
  // (`if (openCh !== "[" && openCh !== "{") continue`), so a boolean or a string could never be
  // salvaged even when whitelisted — `imagePrompt` has been in the key list all along and was
  // unrecoverable for exactly this reason. `sceneEnded` is the one that hurts: lose it to a stray
  // comma and the scene never closes, which is the whole failure CCODE-03 exists to prevent.
  for (const [key, kind] of [["sceneEnded", "bool"], ["gambitApt", "bool"], ["imagePrompt", "string"]]) {
    if (out[key] !== undefined) continue;
    const m = kind === "bool"
      ? text.match(new RegExp(`"${key}"\\s*:\\s*(true|false)`))
      : text.match(new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
    if (m) out[key] = kind === "bool" ? m[1] === "true" : m[1];
  }
  return out;
}

const PROSE_SYSTEM = `You are the Game Master for SINGULARITY, a narrative RPG in the Valley of Echoes. Narrate the current beat in 2-4 tight paragraphs of second-person present-tense prose. Honor the resolution outcome and scene state provided. Reply with PROSE ONLY — no JSON, no lists, no headers.`;

export async function gmTurn(ctx) {
  const content = buildTurnContext(ctx); // flat — used only by the prose fallback
  // Prompt-cache tiers (stable → volatile), each a cached system block: [1] GM system +
  // rules, [2] world model, [3] immediate scene, [4] rolling state + history. The player's
  // turn (resolution + words + time) is the UNCACHED user message after the last breakpoint.
  const t = buildTiers(ctx);
  const systemBlocks = [
    { text: GM_SYSTEM + (t.rules ? "\n\n" + t.rules : "") },
    { text: t.world }, { text: t.scene }, { text: t.state }
  ].filter(b => b.text && b.text.trim());
  const userContent = (t.player && t.player.trim()) ? t.player : "(Continue the scene from the state above.)";
  const gmOpts = { task: "gm-narrate", systemBlocks, cacheKey: "singularity-runtime" };
  let raw = "";
  try {
    raw = await callClaude([{ role: "user", content: userContent }], gmOpts);
    const turn = parseLooseJSON(raw);
    if (!turn.narration || !Array.isArray(turn.choices)) throw new Error("BAD_SHAPE");
    return { ok: true, turn };
  } catch (err) {
    console.warn("[gmTurn] structured parse failed:", err.message);
    // SNG-009 Fix 1 — never silently drop ops:
    // (a) ONE automatic retry with a terse valid-JSON nudge
    try {
      const retryRaw = await callClaude([
        { role: "user", content: userContent },
        { role: "assistant", content: String(raw).slice(0, 4000) },
        { role: "user", content: "Your reply was invalid or truncated JSON. Emit the SAME turn again as a single complete valid JSON object only — no fences, no prose outside it." }
      ], gmOpts);
      const retryTurn = parseLooseJSON(retryRaw);
      if (retryTurn.narration && Array.isArray(retryTurn.choices)) {
        return { ok: true, turn: retryTurn, retried: true };
      }
    } catch (err2) {
      console.warn("[gmTurn] retry also failed:", err2.message);
    }
    // (b) salvage narration AND recognizable ops from the broken reply
    const salvagedText = salvageNarration(raw);
    const salvagedOps = salvageOps(raw);
    const gotOps = Object.keys(salvagedOps).length > 0;
    if (salvagedText && salvagedText.length > 80) {
      const turn = { ...fallbackTurn(salvagedText), ...salvagedOps };
      turn._opNote = gotOps
        ? `Recovered ${Object.keys(salvagedOps).join(", ")} from the broken reply; anything else was lost.`
        : "This beat's state updates were lost — the GM will restate them next turn.";
      return { ok: true, degraded: true, opsLost: !gotOps, turn };
    }
    try {
      const prose = await callClaude([{ role: "user", content }], { task: "gm-narrate", system: PROSE_SYSTEM });
      const turn = fallbackTurn(prose);
      turn._opNote = "This beat's state updates were lost — the GM will restate them next turn.";
      return { ok: true, degraded: true, opsLost: true, turn };
    } catch (err3) {
      return { ok: false, error: err3.message };
    }
  }
}

/** Clamp a GM-proposed scene state to sane bounds. Returns null for garbage —
 *  callers keep the previous scene state in that case (permanence over novelty). */
export function sanitizeScene(scene) {
  if (!scene || typeof scene !== "object" || !scene.setting) return null;
  return {
    setting: smartClamp(String(scene.setting), 400), // SNG-152
    npcsPresent: (Array.isArray(scene.npcsPresent) ? scene.npcsPresent : []).slice(0, 8).map(n =>
      typeof n === "string" ? { name: n.slice(0, 60), state: "" } : { name: String(n.name || "someone").slice(0, 60), state: String(n.state || "").slice(0, 120) }),
    objects: (Array.isArray(scene.objects) ? scene.objects : []).slice(0, 10).map(o => String(o).slice(0, 80)),
    threads: (Array.isArray(scene.threads) ? scene.threads : []).slice(0, 5).map(t => String(t).slice(0, 160))
  };
}

function fallbackTurn(narration) {
  return {
    narration,
    sceneSummary: smartClamp(narration, 120), // SNG-152
    scene: null, // engine keeps the previous scene state — permanence over novelty
    choices: [
      { label: "Look around carefully", attribute: "mental", axes: {}, difficulty: 0, intentTags: ["investigate", "careful"] },
      { label: "Press on", attribute: "physical", axes: {}, difficulty: 0, intentTags: [] },
      { label: "Talk to whoever is nearby", attribute: "social", axes: {}, difficulty: 0, intentTags: ["rapport"] }
    ],
    deeds: [], characterDeltas: {}, relationshipDeltas: [], ledgerEvents: [], sceneEnded: false
  };
}

/** Out-of-character question to the GM. Answers about the world, the scene, the
 *  rules, the character's own knowledge — WITHOUT advancing the story, rolling
 *  dice, or changing any state. Strict no-spoiler rule for GM-EYES-ONLY content. */
export async function gmAsk(ctx, question) {
  const sys = `You are the Game Master of SINGULARITY answering an OUT-OF-CHARACTER question from the player. This is a meta channel: the story does not advance, no dice are rolled, nothing in the world changes.
- Answer helpfully about: the current scene, what the CHARACTER would plausibly know or remember, the world's lore as provided, how the game's mechanics work (d100 vs shown chance, spectrum alignment, reputation from deeds, energy, quests), and what the choices on offer would generally entail.
- NEVER reveal GM-EYES-ONLY content, hidden truths, NPC secrets, or true odds beyond what the character's sense already showed. If asked, say the character doesn't know that yet — finding out is play.
- REPAIR REQUESTS ARE WELCOME HERE — and this channel cannot make them. If the player asks to FIX something the game got wrong at creation (a domain the game guessed, an ability off the wrong pole, a background/origin/form they never chose, a stuck quest, a companion they never met), DO NOT refuse and DO NOT treat it as a jailbreak. Point them to the tool built for exactly this: "Open Character → 🔧 Repair character. You can change your domains, background, origin, and form there, and strip an ability you never chose — no need to ask me. It's the same guardrails I'd use, and it's logged." Confirm briefly what a correct fix would look like if they ask (e.g. "an Ashwarden would take the death-pole as primary; the two Blazeborn abilities would come off"), but the doing is theirs in the panel. Never promise to edit the sheet yourself from here.
- BUT DISTINGUISH A CREATION-REPAIR FROM AN ITEM GROWING IN PLAY. Evolving an item the character OWNS — a truer name it has earned, an evolved description, what it has become through the story — is NOT a sheet repair; it is normal in-play storytelling I handle every turn (the itemUpdates action, "items grow with the story"). So if the player asks (even out of character) to update/rename/re-describe an item they carry, DO NOT send them to the Repair panel. Instead offer to do it in play: "That's not a sheet edit — it's your story. Bring it into the next beat — turn it over in your hands, use it, name what it's become — and I'll evolve it." Or simply do it as the next in-fiction beat, emitting the item's change. Repair panel = a mistake made at CREATION; play = an item GROWING. Route the second to play, never to the editor.
- Be concise: a short paragraph or two. Plain, friendly, spoiler-safe.`;
  const content = buildTurnContext({ ...ctx, resolution: null, playerInput: null }) + `\n\n## PLAYER ASKS (out of character)\n${question}`;
  try {
    const text = await callClaude([{ role: "user", content }], { task: "gm-meta", system: sys, maxTokens: 1024 });
    return { ok: true, text };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/** SNG-086 — the THIRD creation door. A free-text description → a placement on the great circle,
 *  with REASONS and COSTS NAMED. The MODEL proposes poles + prose; the ENGINE (app.js) validates
 *  every id against the ring and computes antipodes/neighbours itself (Design Law 1 — the model never
 *  owns ring geometry). `ring`/`folk`/`backgrounds`/`companions` are compact catalogs built from
 *  loaded content so the model can only choose real ids. Returns raw JSON (caller sanitizes). */
export async function suggestBuild({ description, ring, folk, backgrounds, companions }) {
  const sys = `You are a character-creation guide for SINGULARITY, a world whose magic is a RING of 24 peoples — "the great circle." Each people is a craft-tradition at a pole; directly across the ring sits its ANTITHESIS, which is CLOSED forever to anyone who takes that pole (only rare cross-pole braids cross it). A character has three domains: PRIMARY (who they are — all they can master), SECONDARY (reaches tier III), TERTIARY (reaches tier II, and MUST be a ring-neighbour of the secondary).
A player has described who they want to be. Map their words onto the ring. For EACH domain give the PEOPLE and WHY — and NAME THE COST: what taking it CLOSES, honestly, and why that cost fits (or doesn't fit) them. ⛔ A suggestion without its cost is a sales pitch, not advice. Suggest, never impose.
Be honest about what does NOT need a domain: some things are FOLK crafts (open to all, free — e.g. a hunter, a healer of the ordinary kind) and some are not domains at all (a temperament like "romantic" is HOW you play, not a pole). Do not sell a slot the player does not need.
ORIGIN is which people they were BORN to — it MAY differ from the primary (a valleyfolk can learn death-craft). Pick the origin that best fits their words; default to a valley origin if they read as ordinary-born.
Reply with ONLY JSON:
{"primary":{"traditionId":"id","why":"one sentence","cost":"what it closes + why the cost fits them, one sentence"},
 "secondary":{"traditionId":"id","why":"...","cost":"..."},
 "tertiary":{"traditionId":"id","why":"...","cost":"..."},
 "origin":{"id":"id","why":"which people they are FROM"},
 "background":{"id":"id","why":"one sentence"},
 "form":"a short physical-form description for the portrait drawn from their words, or empty string",
 "companion":{"id":"id","why":"one sentence"} or null,
 "folk":[{"name":"folk craft name","why":"free — a folk craft, open to all"}],
 "notDomains":[{"label":"the trait they named","why":"why it needs no domain"}]}
Use ONLY ids from the lists below. The tertiary MUST be a ring-neighbour of your secondary (the ring lists each people's neighbours). Never suggest a people that is the antipode of one you already chose.`;
  const content = `THE RING — id · people · pole (axis) · craft · antipode · neighbours:\n${ring}\n\nFOLK CRAFTS (free, open to all — never a domain):\n${folk}\n\nBACKGROUNDS — id · name:\n${backgrounds}\n\nSTARTING COMPANIONS — id · name · role:\n${companions}\n\nPLAYER'S DESCRIPTION:\n"${description}"`;
  return callClaudeJSON([{ role: "user", content }], { task: "describe-build", system: sys, maxTokens: 1500 });
}

/** SNG-218 §2 — the LLM "next crafts" suggestion (Aevi-authored prompt; CCode-augmented inputs). Mirrors
 *  suggestBuild: rich system prompt, honest-reason discipline, strict JSON, ids-ONLY-from-the-reachable-list.
 *  The caller assembles the context from the character's REAL signals — owned+ranks, domains, play-style
 *  tendencies (character.tendencies), aptitudes (character.aptitudes), DECLARED aspirations
 *  (character.practice.aspirations) and use counts (character.practice.uses) — plus THE REACHABLE-NOW pool
 *  (the §1 canLearnAbility set: allowed + level + STANDING + capacity + affordable). That pool is the guardrail;
 *  the render also hard-filters picks against it so a stray model id can never offer an unlearnable craft.
 *  CCode augmentation (per §218b invitation): `schools` — the adopted school per domain — and each reachable
 *  craft's school-fit, so the model can favour a craft trained the same WAY the character already trains.
 *  Falls back to the heuristic on any failure (never leaves the top empty). */
export async function suggestNextCrafts({ owned, domains, tendencies, aptitudes, reachablePool,
                                         boosted = [], aspirations = [], uses = {}, schools = "", skillPoints = 0, level = 1 },
                                         callJSON = callClaudeJSON) { // injected for tests (the SNG-198/204/208 pattern)
  const sys = `You advise a player of SINGULARITY on WHICH CRAFT TO LEARN NEXT at level-up. You are not picking for them — you are naming the 2-4 reachable crafts that best fit WHO THIS CHARACTER HAS BECOME, each with an honest reason, so they can choose well.

WHAT YOU READ:
- Their OWNED crafts and ranks — what they already lean on, and where they're deep vs. thin.
- Their PLAY-STYLE tendencies (a behavioural fingerprint accrued from how they actually play — e.g. cerebral, social, strategic, physical, amorous, cautious, ruthless). This is the strongest signal: suggest crafts that fit how they PLAY, not a theoretical "optimal" build. A cerebral, social, non-physical character should rarely be steered into a raw-combat craft they'll never reach for.
- Their earned APTITUDES (strategist, scholar, charmer…) — who the world already recognises them as.
- Their DOMAINS — the peoples they can draw from.
- Their ADOPTED SCHOOLS — the METHOD they train each domain by (a school per domain). A reachable craft trained the SAME WAY they already train (its school matches their adopted school for that people) is a more NATURAL reach — the same discipline, deepened; note when a pick would instead mean a different method.
- BOOSTED crafts, if any — crafts the PLAYER flagged they want to use more: weight these UP when they fit.
- ASPIRATIONS — the crafts the player has DECLARED they're working toward (with progress). This is a DIRECT statement of intent: a reachable aspiration craft, or a craft that clearly advances one, is the STRONGEST fit-signal there is. If an aspiration is reachable now, it should almost always be among your picks (tagged fit:"aspiration"), and named as the thing they SAID they wanted.
- USE COUNTS — which owned crafts they actually lean on vs. barely touch. A high-use craft is their signature; an owned-but-near-zero craft may be worth a "you have this but never use it" note (context for judging what genuinely fills a gap).

⛔ SUGGEST ONLY FROM THE REACHABLE LIST GIVEN. Every craft you name MUST be in the reachable pool — a craft the character can learn RIGHT NOW (domain-allowed, level met, standing met, not already owned). Never suggest something they cannot learn this moment. You MAY, in a rationale, gesture at where a craft LEADS ("and it opens the road toward X") but the PICK itself is always reachable-now.

⛔ EACH PICK CARRIES ITS REASON — grounded in THIS character, not generic. "You read every situation but have no way to WARD a friend — Death-Ward closes that gap" (specific to their kit). NOT "a versatile defensive option" (generic). A reason that could be pasted onto any character is a failure.

⛔ COVER THE GAP, DON'T PILE ON THE STRENGTH. Prefer a pick that gives them something they LACK (a missing function family, a defensive tool for an all-offense kit, a way to act where they're currently helpless) over a fourth craft in the family they already dominate — UNLESS deepening a signature strength is the clearly aspirational move for how they play. Name which it is.

⛔ HONESTLY RANK. Order the picks best-fit first. If the reachable pool is thin (1-2 crafts), suggest those plainly and say the field is narrow this level; never pad to four with poor fits.

Reply with ONLY JSON:
{"picks":[{"abilityId":"id from the reachable list","why":"one sentence, specific to THIS character's kit and play-style","fit":"gap|aspiration|strength|synergy — which kind of pick this is"}],
"note":"one optional short line on the shape of the choice this level, or empty string"}

Use ONLY abilityIds from the REACHABLE list. 2-4 picks, best first. If reachable is empty, return {"picks":[],"note":"nothing new is within reach this level — deepen what you have through use"}.`;

  const content =
`OWNED CRAFTS (id · rank): ${owned}
DOMAINS: primary ${domains.primary} · secondary ${domains.secondary} · tertiary ${domains.tertiary}
ADOPTED SCHOOLS (the method they train each domain by): ${schools || "none adopted yet"}
PLAY-STYLE (higher = more that way): ${tendencies}
APTITUDES: ${aptitudes}
${boosted.length ? `BOOSTED (player wants to use more): ${boosted}\n` : ""}ASPIRATIONS (declared goals · progress/10): ${aspirations.length ? aspirations : "none declared"}
USE COUNTS (leaned-on vs. rarely-used owned crafts): ${uses}
SKILL POINTS: ${skillPoints} · LEVEL: ${level}

REACHABLE NOW — the ONLY crafts you may suggest (id · name · family · what it does · school-fit · cost):
${reachablePool}`;

  return callJSON([{ role: "user", content }], { task: "suggest-next-crafts", system: sys, maxTokens: 900 });
}

/** SNG-088 (follow-on): the player has been TALKING THROUGH a plan with the GM. Read the recent
 *  conversation and extract the goal + the ordered steps they intend (with fallbacks if discussed) so
 *  the gambit builder AUTO-FILLS instead of making them retype it. Same shape as gambitOps. Returns
 *  {goal, steps:[{text,fallback}]}, or {goal:"", steps:[]} when the conversation holds no real plan. */
export async function extractGambit({ recentTurns = [], maxSteps = 5 }) {
  const convo = recentTurns
    .map(t => `${t.player ? `PLAYER: ${String(t.player).slice(0, 600)}\n` : ""}GM: ${String(t.narration || t.summary || "").slice(0, 600)}`)
    .join("\n\n").slice(0, 6000);
  const sys = `You read a recent back-and-forth between a player and the Game Master of a tabletop RPG in which the player has been WORKING OUT A PLAN — a gambit: a sequence of connected maneuvers toward one objective. Extract that plan so it can be pre-filled into a builder the player will then edit.
Reply with ONLY JSON: {"goal":"the objective in one short prose line","steps":[{"text":"one maneuver, in the player's own intent","fallback":"the fallback discussed for it, or empty string"}]}
Rules: order the steps as the player intends to ATTEMPT them. Use the PLAYER'S plan — adopt the GM's suggestions only where the player agreed to them. Include a fallback only if one was actually discussed; otherwise empty string. Keep each step to a single maneuver in plain language. If the conversation contains NO real multi-step plan, return {"goal":"","steps":[]}. At most ${maxSteps} steps.`;
  return callClaudeJSON([{ role: "user", content: `CONVERSATION:\n${convo}` }], { task: "gambit-extract", system: sys, maxTokens: 900 });
}

/** Generate a bio draft from the creation choices (player edits before accepting). */
export async function generateBio({ name, origin, background, attributes, bio = {} }, callJSON = callClaudeJSON) { // SNG-220 §2a: the player's typed words come IN
  const typed = Object.entries(bio || {}).filter(([, v]) => String(v || "").trim());
  // SNG-220 §2b: INTEGRATE, don't replace — the player's words are the SEED, the land is woven INTO them.
  const sys = `You write short character bios for an RPG set in the Valley of Echoes — a post-de-technologizing world (15 years after humanity voluntarily stepped back from its own technology) with two local civilizations: the sonic Harmonic Heights and the photonic Radiant Plateau, plus unaligned valley-floor farming communities. Grounded, specific, warm; no cliches, no chosen-one tropes.
⛔ THE PLAYER HAS ALREADY WRITTEN SOME OF THIS. Their words are the SEED — preserve their intent, their specifics, their voice. Where a field is FILLED, ENRICH it (ground it in the land, add texture, reconcile it with their origin/background) but KEEP WHAT THEY MEANT — never contradict or discard it. Where a field is BLANK, author it to FIT what they have already established. Weave the Valley's lore INTO their story; do NOT replace their story with yours. The lore serves THEIR character, not the reverse — a weave that buries their fishing-hamlet in generic Valley lore has failed.
Reply with ONLY JSON:
{"hometown": "where they grew up (specific, in-world)", "residence": "where they live now and what it's like", "livelihood": "how they actually make money", "hobbies": "2-3 real hobbies", "motivation": "why they stepped out of ordinary life to become someone things happen to — concrete and personal, not grand", "story": "3-4 sentence life story tying it together"}`;
  const content = `Name: ${name}. Origin: ${origin} (harmonic = Heights sonic culture, radiant = Plateau light culture, valley = unaligned farming folk). Background: ${background}. Attributes (1-4): ${JSON.stringify(attributes)} — let the strongest shape the story.
${typed.length ? `WHAT THE PLAYER HAS ALREADY WRITTEN — preserve + enrich these, author the blanks to fit:\n${typed.map(([k, v]) => `- ${k}: ${smartClamp(String(v), 400)}`).join("\n")}` : "The player left the story blank — author it fresh, grounded in their origin + background."}`;
  return callJSON([{ role: "user", content }], { task: "bio-gen", system: sys, maxTokens: 1024 });
}

/** Parse a freeform player action into a resolvable action spec (cheap model). */
export async function parseIntent(playerText, character, location) {
  const sys = `Classify a tabletop RPG player's freeform action into JSON. Reply with ONLY:
{"label": "short restatement", "attribute": "physical|mental|social|practical", "subAttribute": "strength|agility|reason|insight|presence|rapport|craft|wits", "axes": {"spectrumId": -1..1}, "difficulty": 0|15|30, "intentTags": ["..."], "abilityId": "id or null", "comboAbilities": ["ids if the player is deliberately COMBINING two abilities, else []"], "novelUse": false, "noveltyHint": "2-4 words naming the novel application, only if novelUse", "trivial": false, "travelTo": "the place name the player is TRAVELING/GOING to, if this action moves them to another location (else null)", "feasible": true|false, "infeasibleReason": "only if false"}
trivial=true when the action has no real chance of failure and no meaningful cost (ordinary talk, safe movement, looking around) — no dice will be rolled. Never trivial for ability use, risk, or contested acts.
subAttribute picks the finest fit: strength (force, endurance) / agility (speed, balance, stealth of body) / reason (logic, analysis) / insight (perception, intuition, reading people) / presence (command, inspire) / rapport (charm, empathy) / craft (making, fixing, precise tool work) / wits (improvisation, survival, quick thinking).
Spectrum ids: emotional_logical, falsehood_truth, demonic_angelic, violence_peace, concrete_abstract, mechanical_spiritual, chaos_order, dark_light, death_life, space_time, body_mind, destruction_creation.
Intent tags: plan, scout, prepare, attack, climb, force, persuade, charm, negotiate, comfort, study, investigate, analyze, gamble, drink, revel, risky, careful, retreat, help, give, rescue, heal, meditate, threaten, steal, rapport, finesse, discipline, romantic, flirt, travel.
Use "travel" (and set travelTo to the destination) whenever the player is trying to GO/HEAD/JOURNEY/SET OUT to another place ("head to the edge district", "travel to Millbrook", "let's go back to the mill") — not for moving around within the current location, and NOT when they are only TALKING ABOUT a journey. A label whose governing verb is a speech verb — announce, tell, confide, discuss, propose, plan, promise, ask — is DISCUSSING travel, not doing it: "announce travel plans to Cairnhold" or "tell Veth I mean to leave" is a speech act, so travelTo stays null however many places it names. Set travelTo only when the character actually DEPARTS in this action.
Use "romantic"/"flirt" when the action is attraction language, a flirtatious gesture, physical contact in a social/romantic (non-combat) context, or advancing a romantic thread with an NPC. Do NOT tag combat contact, a gesture with a plain non-romantic reading, or an NPC the player has no relationship thread with.
abilityId must be one the character actually has, or null. novelUse=true when an ability is being pushed OUTSIDE its normal envelope (per its description) or two abilities are braided together — this is allowed and interesting, not infeasible. Mark infeasible only if impossible in-world (not merely hard).`;
  const content = `Character abilities: ${(character.abilities || []).map(a => a.abilityId).join(", ") || "none"}. ` +
    `Inventory: ${(character.inventory || []).map(i => i.name || i).join(", ") || "empty"}. ` +
    `Location: ${location.name} (${(location.tags || []).join(", ")}).\nPlayer action: "${playerText}"`;
  try {
    const raw = await callClaudeJSON([{ role: "user", content }], { task: "intent-parse", system: sys });
    return sanitizeIntent(raw, character, playerText);
  } catch {
    return { label: smartClamp(playerText, 60), playerWords: String(playerText || ""), attribute: "practical", subAttribute: null, axes: {}, difficulty: 0, intentTags: [], abilityId: null, comboAbilities: [], novelUse: false, noveltyHint: "", feasible: true };
  }
}

/** Validate/clamp a parsed intent so malformed model output can never poison the
 *  dice (a stray string difficulty once produced "roll 20 vs NaN"). */
export function sanitizeIntent(raw, character, playerText = "") {
  const SUBS8 = ["strength", "agility", "reason", "insight", "presence", "rapport", "craft", "wits"];
  const owned = id => (character.abilities || []).some(a => a.abilityId === id);
  const axes = {};
  if (raw?.axes && typeof raw.axes === "object") {
    for (const [k, v] of Object.entries(raw.axes).slice(0, 6)) {
      const n = Number(v);
      if (Number.isFinite(n)) axes[String(k)] = Math.max(-1, Math.min(1, n));
    }
  }
  const diff = Number(raw?.difficulty);
  return {
    // SNG-181: this raw 80-char cut is what chopped Erik's own sentence mid-word in his own log —
    // "…eager to see what h", exactly 80 characters, no ellipsis. The label is a compact UI/prompt
    // string and staying short is right, but a mid-word cut never is: smartClamp ends on a word
    // boundary and marks the elision. `playerWords` carries what they ACTUALLY typed, in full,
    // because the one string in this application that must never be truncated is the one the
    // player wrote.
    label: smartClamp(String(raw?.label || playerText), 80),
    playerWords: String(playerText || ""),
    attribute: ["physical", "mental", "social", "practical"].includes(raw?.attribute) ? raw.attribute : "practical",
    subAttribute: SUBS8.includes(raw?.subAttribute) ? raw.subAttribute : null,
    axes,
    difficulty: [0, 15, 30].includes(diff) ? diff : Number.isFinite(diff) ? Math.max(0, Math.min(30, Math.round(diff))) : 0,
    // SNG-100/122: romantic/flirt/travel are LOAD-BEARING GATING tags — romantic/flirt gate the romance_guidance
    // doc, travel gates the SNG-122 travel directive + arrival fallback — and they sit LAST in the tag vocabulary.
    // A 6-tag cap applied in emission order can silently drop them off a rich beat ("persuade, charm, comfort,
    // rapport, finesse, risky, romantic" → sliced), and the failure is invisible: no error, the doc/move just
    // never fires. Hoist every gating tag before truncating. If a tag gates a document or an engine path, it must
    // survive the cap (see [[project_singularity_tag_gates_doc]]).
    intentTags: (() => {
      const t = (Array.isArray(raw?.intentTags) ? raw.intentTags : []).map(String);
      const gates = x => /^(romantic|flirt|travel)$/i.test(x);
      return [...t.filter(gates), ...t.filter(x => !gates(x))].slice(0, 6);
    })(),
    // SNG-122: the destination for a travel action (free text → a place name the engine resolves-or-mints).
    travelTo: raw?.travelTo && String(raw.travelTo).trim() && !/^(null|none|n\/a)$/i.test(String(raw.travelTo).trim()) ? String(raw.travelTo).trim().slice(0, 80) : null,
    abilityId: owned(raw?.abilityId) ? raw.abilityId : null,
    comboAbilities: (Array.isArray(raw?.comboAbilities) ? raw.comboAbilities : []).filter(owned).slice(0, 3),
    novelUse: !!raw?.novelUse,
    noveltyHint: String(raw?.noveltyHint || "").slice(0, 60),
    trivial: !!raw?.trivial && !raw?.abilityId && !raw?.novelUse,
    feasible: raw?.feasible !== false,
    infeasibleReason: raw?.infeasibleReason ? String(raw.infeasibleReason).slice(0, 200) : null
  };
}
