# SPEC — SNG-245: The Pressure Queue — make the world DRIVE the player (the ONE update)
## Aevi (PO) · 2026-07-25 · Erik-directed ("how do we make them HOOK the narrative and drive a player? Activity!")

> **Erik:** "We have quest/arc advancement, NPCs with wants, villains with agendas... but how do we make them
> HOOK the narrative and DRIVE a player? I want people active, taking initiative — real treasures to find,
> beasts that suddenly attack and must be defended against. ACTIVITY!"

## §1 — The exact diagnosis: the world has an initiative TRIGGER but nothing to FIRE
Verified at origin — the "make the world active" machinery EXISTS but is passive-fed and generic:
- **SNG-080 "THE WORLD ACTS"** — tracks quiet turns; past a threshold injects "make something happen this turn."
  But its content is `worldPressureDetail = pendingPressure` — a GENERIC push with NO SOURCE. It tells the GM to
  invent *something*, so the GM invents a generic something.
- **SNG-194 unprompted OFFER, SNG-195 teacher-initiative, random encounters** — all real, all fire, all GENERIC
  or narrow.
- **THE MISSING PIECE (grep confirms — no such registry exists):** there is NO queue of the SPECIFIC DRIVEN
  THINGS you built — the villain's next move, the NPC's unmet want, the arc's pressure-on-advance, the treasure
  in the un-delved ruin. Those are only READ PASSIVELY when the player arrives at them. They never become an
  ACTIVE PUSH toward the player. The world can act; it has nothing DRIVEN to act WITH.
So the world pushes RANDOM activity, not DRIVEN activity. The villain schemes but never *moves on you*; the NPC
wants but never *comes to you*; the arc advances but never *reaches out*; the treasure waits but never *rumors
itself to you*. The pieces are all there — they're just not WIRED to the initiative trigger.

## §2 — The ONE update: a PRESSURE QUEUE that feeds the initiative trigger
A single registry — the **Pressure Queue** — of "driven things that WANT to happen to the player," fed by the
agendas that already exist, that SNG-080's trigger DRAWS FROM. When the world acts, it acts with a REAL,
SPECIFIC, DRIVEN thing, aimed at the player:
- **Producers (feed the queue — all from things already in the game):**
  - **Villain agendas** → a `pressure` entry when a villain's plan reaches a step that touches the player's
    orbit ("the Pure-of-Ash's mercy-killings reach a village you know"). The villain MOVES.
  - **NPC unmet wants** (SNG-233 interiority) → a `pressure` when a bonded NPC's want has gone unmet long enough
    that they'd ACT on it ("Pell, tired of your absence, comes to find you" — her want reaching out).
  - **Arc pressure-on-advance** (the greater-arcs field we saw) → a `pressure` when an arc advances a stage
    ("What Wakes Beneath stirs — the deep sites report a tremor near you").
  - **Undiscovered treasures/sites** → a `pressure` that RUMORS a real reward toward the player ("a delver
    speaks of an unopened vault in the ruins you passed"). The treasure reaches for the player.
  - **Beasts/threats** → a `pressure` that becomes a SUDDEN ATTACK/defense encounter ("the wrong stag has come
    down to the holding — defend it NOW"). The beast comes to YOU.
- **The queue entry:** `{ source, kind (villain-move|npc-want|arc-stir|treasure-rumor|threat-attack), subjectId,
  aimedAtPlayer, urgency, oneLineHook, becomes (an encounter id | an offer | a scene) }`. Each is a DRIVEN thing
  with a HOOK and a mechanical consequence.
- **The consumer (already exists — just repoint it):** SNG-080's quiet-turn trigger, instead of a generic
  `pendingPressure`, PULLS THE HIGHEST-URGENCY queue entry and hands the GM its `oneLineHook` + `becomes`. The
  world still acts on quiet — but now it acts with the villain's move, the NPC's want, the beast's attack, the
  treasure's rumor. Same trigger, DRIVEN content.

## §3 — Why this is the RIGHT one update (leverage)
- It doesn't build new initiative machinery — the TRIGGER, the OFFER system, the encounter frames, the arc
  pressure fields, the NPC wants (SNG-233) ALL EXIST. It builds the ONE missing connective piece: a QUEUE that
  turns the agendas you authored into active pushes, and repoints the existing trigger at it.
- It makes EVERY driven thing you already built actually DRIVE: the villain agendas start MOVING on the player,
  the NPC wants start REACHING for the player, the arcs start STIRRING at the player, the treasures start
  RUMORING to the player, the beasts start ATTACKING the player. All the "Activity!" Erik wants, from parts
  already in the game.
- It's the natural home for the wake engine (SNG-204) too — a fired wake becomes a Pressure Queue entry (the
  Second Thread's made gate wakes → a pressure toward the player: the Numinous come asking). The queue is where
  "the world responds" turns into "the world acts on YOU."

## §4 — Scope discipline (keep it ONE update)
- **Start with 2 producers, not 5.** Wire the two highest-leverage feeds first: NPC unmet wants (SNG-233 — the
  interiority is authored, the wants are RIGHT there) and threat-attacks (the beast-comes-to-you — the most
  visceral "Activity!"). Prove the queue→trigger loop with those two, then add villain-moves, arc-stirs,
  treasure-rumors.
- **Reuse, don't rebuild:** producers write queue entries; the consumer is the EXISTING SNG-080 trigger
  repointed. The only NEW code is the queue itself + the 2 producers + the repoint.
- **Respect the existing restraint rules:** the queue feeds the trigger, which ALREADY honors the "quiet/intimate
  scenes stay uninterrupted" rule and the offer cooldown. A driven push obeys the same "never break a tender
  moment" floor — DRIVEN doesn't mean RELENTLESS. The Eventful/frequency preference still governs rate.

## OWNERSHIP
- CCode: the Pressure Queue registry + the 2 starter producers (npc-unmet-want, threat-attack) + repoint SNG-080's
  worldPressureDetail to pull the top queue entry. Engine. The rest of the producers (villain-move, arc-stir,
  treasure-rumor) as follow-ons.
- Aevi: the HOOK voice — how a queue entry announces itself ("Pell has come looking for you, and she is not
  smiling"), per kind, so a driven push reads as a story beat not a system event. And author the producer RULES
  (when does an unmet want become a push? how long unmet? — the design of "driven"). Content/design, my lane.
- Erik: the urgency/rate feel — how AGGRESSIVE the world is (how quickly an unmet want becomes a knock at the
  door, how often a threat attacks). The "Activity!" dial. And which producers matter most to wire first.

## GUARDS
- **Driven, never relentless** — the queue feeds the EXISTING trigger, which honors the quiet/intimate-scene
  floor and the cooldown. A tender or charged beat is NEVER broken by a queued push (the frequency pref already
  guarantees this — the queue inherits it). Activity is not harassment.
- **Aimed, not random** — the whole point is that a push is a SPECIFIC driven thing (this villain, this want,
  this beast), not "a random stranger." A queue entry without a real subjectId + hook is generic noise — don't
  queue it.
- **The hook must have TEETH** — a push `becomes` a real mechanical thing (an encounter to defend, an offer to
  take, a scene with stakes), not just a line of flavor. "The beast attacks" MUST become a defend-encounter, or
  it's theater (the SNG-232/236 lesson: an event that can't actually engage is fog).
- **Start small, prove the loop** — 2 producers, verify the queue→trigger→driven-beat loop works in play, THEN
  scale. Don't wire all 5 feeds before the first one drives a real beat.
- **The player can still say no** — a driven push is an INVITATION with stakes (the beast can be fled, the
  villain's move can be dodged), never a forced loss. Initiative for the WORLD, agency for the PLAYER.

## OPEN QUESTIONS
1. (Erik) The aggression dial — how fast does an unmet want become a knock, a threat become an attack? Ties the
   Eventful/frequency pref; the queue could respect that same setting (Calm = the world drives gently, Eventful =
   the world drives hard). Lean: yes, reuse the existing frequency pref as the queue's aggression.
2. (CCode) Does an unmet-want producer read SNG-233's `wants` + the bond's staleness (turns since the NPC got
   the player's attention)? That's the cleanest "the want reaches out" trigger.
3. (Aevi/Erik) Which 2 producers first — npc-want + threat-attack (my lean: the most felt "Activity!"), or
   villain-move + treasure-rumor (the more plot-driving)? Erik's call on what he wants to FEEL first.
