# SNG-163 — Contests are mechanical: reach the skill-battle system

**Author:** Aevi (PO) · 2026-07-18 · **Raised by:** Erik, from live play
**Class:** the eighth built-correct-never-reached capability this batch

---

## §0 — The symptom

Erik: *"I went to the Coliseum. I dueled — but it was in narrative. I thought we had fights and
opposed skill battles. Where are they?"*

He is right to expect them. They exist, they work, and nothing in play can reach them.

## §1 — What is actually built (verified at HEAD)

`engine/skill_battle.js` (SNG-098) is a complete two-sided contest system:

| export | does |
|---|---|
| `matchupBonus` | function-vs-function advantage — the 24-verb vocabulary as rock-paper-scissors |
| `synthesizeOpponentSheet` | builds an opponent from a thin stat block |
| `opponentPolicy` | opponent AI that reads and adapts to player tendency |
| `battleRound` | both sides declare skill + intensity, both roll, momentum moves |

Supported by `content/packs/core/rules/skill_battle_system.json`, exercised by
`tests/skill_battle_sim.mjs` (including a fog-of-war invariant), wired into `encounters.js:18`
(sets `mode: "skill_battle"` when a def carries `opponent`) and rendered by `app.js:2554/5837`.

**Nothing is broken. The whole chain is sound and the trigger is missing.**

## §2 — Why Erik's duel was prose

Three causes, compounding.

### 2a. There are ZERO encounter definitions in the entire content corpus

```
encounter definitions: 0
with an `opponent` (=> skill_battle fires): 0
```

`gm.js:33` instructs: *"When AVAILABLE ENCOUNTERS lists one and the fiction invites it…"* — that
list is **always empty**, so the entire branch is dead. Every location in the world, including the
Great Coliseum, offers the GM nothing to start.

### 2b. The Coliseum does not declare that its contests are mechanical

`the_great_coliseum.json` carries tags `coliseum`, `contest`, `spectacle` and two quest seeds. There
is no encounter hook, no `encounterSeeds`, nothing that tells the GM this is a place where a duel is a
**structure** rather than a scene. A model with no signal narrates — correctly, by its own lights.

### 2c. `newEncounter` is the only remaining path, and it is fragile

The GM *may* invent a duel via top-level `newEncounter` (documented `gm.js:58`, applied
`app.js:2808`). But the instruction is one clause buried inside a 300-word rule #18, competing with
narration, and it is the only mechanism keeping the entire combat system alive.

**And it is dropped on the salvage path.** `salvageOps` (`gm.js:334`) recovers ops from malformed
JSON against a hardcoded key list. An audit of the documented contract against that list:

| documented top-level keys | 26 |
| covered by salvage | 20 |
| **silently dropped** | `newEncounter`, `newAbility`, `discovery`, `factUpdates`, `gambitApt`, `sceneEnded` |

So when a turn's JSON needs salvaging, the GM can decide to start a fight and the fight vanishes. It
is also how a **new ability**, a **discovery**, and a **scene ending** vanish. Six of the most
consequential keys in the contract are the ones salvage does not know about.

## §3 — Fix

### §3a — Author encounter content (PO lane, mine)

The corpus needs encounter definitions carrying `opponent`. First tranche, Coliseum-first since that
is where Erik went:

- **Coliseum bouts** keyed to the SNG-149 grid: an encounter per contest *kind*, so a HARM×MOVE cell
  stages as a real opposed battle and a KNOW×SUSTAIN cell stages as a different one. The grid is
  authored (36 cells); the encounters are the mechanical half of it.
- **Regional duels** — the Riven Marches' forms, the Redline's dueling culture.
- **Wild dangers** — the boar the prompt already names as the example nobody can currently stage.

Each carries `opponent: {name, health, threat, yieldAt, fleeDifficulty, tacticTags}` — the shape
`sanitizeNewEncounter` and `synthesizeOpponentSheet` already accept. **No engine change needed for
this half.** It is content the engine has been waiting for.

### §3b — Locations declare their contests (PO lane, mine)

Add `encounterSeeds: [{encounterId, hint}]` to locations that host structured contest. The Coliseum gets its bout list;
the Marchward gets duels. `availableEncounters` then has something to put in front of the GM, and
rule #18's dead branch comes alive.

**Design note:** a location listing an encounter is not a location that forces it. The existing
"player-chosen danger" rule stands — availability is not imposition.

### §3c — Fix salvageOps (CCode lane)

Add the six missing keys. This is a one-line change with an outsized blast radius: it is currently
possible to lose a duel, an ability grant, a discovery, and a scene ending to a stray comma.

**Recommend a guard so it cannot re-drift:** a test that parses the documented contract block out of
`gm.js` and asserts every top-level key appears in `salvageOps`. Same shape as the §23 freshness
gate — the contract and its recovery path must not diverge silently. Add to `npm test`.

### §3d — Make the Coliseum's own nature legible (PO lane, mine)

`the_great_coliseum`'s `descriptionSeed` should say plainly that bouts here are fought, not
described — that a challenge issued on the sand is answered in earnest, under forms, with the crowd
reading every exchange. The GM narrates what a place tells it a place is.

## §4 — Acceptance

Closes on reproduced symptom, per §21.

1. Erik walks into the Coliseum, issues or accepts a challenge, and **the skill-battle UI opens** —
   declarations, momentum meter, fog-of-war on the opponent's move.
2. `matchupBonus` visibly matters: declaring a function the opponent is weak against reads as an
   advantage in the receipt.
3. A malformed-JSON turn that contained `newEncounter` still starts the encounter.
4. The contract/salvage parity test fails if a new top-level key is added without salvage coverage.

## §5 — ROUND 2 questions for CCode

1. Does `sanitizeNewEncounter` clamp hard enough that authored encounter defs and GM-invented ones
   can share one code path, or do authored defs want their own validation?
2. `availableEncounters` — currently fed from where? If a location's `encounterSeeds` is the new
   source, does anything else feed it that I would be overriding?
3. Is there a reason `newEncounter` was left out of `salvageOps`, or is it simply that the list was
   written once and the contract grew past it? If the latter, §3c's parity test is the real fix and
   the six keys are the symptom.


---

## CORRECTION (Aevi, 2026-07-18, after CCode's audit)

**This spec named the wrong field, and it cost CCode an audit pass.**

I wrote `encounterIds` throughout. The real field is **`encounterSeeds`**, an array of
`{encounterId, hint}` objects, read by `app.listAvailableEncounters` — which does `seed.encounterId`
and `.filter(Boolean)`. I invented a plausible name rather than reading the consumer, found the true
one while authoring SNG-164, and never came back to fix the spec.

CCode's first reachability pass measured `encounterIds`, found nothing, and nearly filed the entire
encounter corpus as CONTENT-STARVED. Their note is the right lesson and I am repeating it here so it
sits next to the cause: *an audit that greps the wrong field name manufactures exactly the false
confidence it exists to prevent.* The wrong field name came from this document.

**Rule for my own specs going forward: name a field only after reading its consumer.** A field name in
a spec is an instruction to another agent, not a sketch.

Also corrected in this spec: the claim that ZERO encounter definitions existed. Three did
(`precursor_mechanism`, `rockslide_crossing`, `zone_raider_duel` — one per type, the last with a full
opponent block). My count globbed for an `{encounters:[...]}` wrapper; each file is a single object.
The substance held — the Coliseum had none and coverage was 3 of 95 locations — but the number was wrong.
