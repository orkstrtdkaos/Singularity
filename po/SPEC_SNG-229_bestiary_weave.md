# SPEC — SNG-229: Weave the bestiary into the living world (not just authored — feared, wanted, hunted)
## Aevi (PO) · 2026-07-22 · verified at origin · Erik-directed

> **Erik:** "Did the monsters and things you can and should kill get incorporated? I want them not just
> authored, but woven into the lore, what people are scared of, wants, motivations, quests, etc."

## §1 — Verified state: authored, woven into NOTHING
The bestiary exists — `po/staged_content/bestiary.json`: 3 classes (manifested creatures / feral constructs /
substrate-warped beasts) + 6 roster entries riffraff→epic (glimmerling swarm, hollow-pace, warpling hare, the
wrong stag, tessellith, the unmoored choir). Good content, good design laws (no person, a hazard not a
villain, each pressures function families).
**But it is STAGED and INERT:** no manifest loads it (0 loader refs), no encounter references it, and
`tradition_motivations.json` mentions creatures/beasts/monsters **ZERO times.** So the world has things to
kill on paper, and nothing in play — no fear, no want, no quest, no encounter — points at them. Erik's
question answered: NO, not incorporated, in either sense (not loaded, not woven).

## §2 — What "woven in" actually means (5 layers, the real job)
### §2a — LOADED (CCode) — the prerequisite
`provides.bestiary` in the valley manifest + a loader (`CONTENT.bestiary`), so the game can reference a
creature by id. Move bestiary.json from po/staged_content/ into content/packs/valley/ with its manifest line.
Without this, nothing below can point at a creature id.

### §2b — ENCOUNTERABLE (CCode + Aevi) — the things you actually fight
Each bestiary entry needs to be reachable as an ENCOUNTER (the schema already supports it — encounters have
an `opponent{health,threat,yieldAt,fleeDifficulty}` block; see wild_boar_valley). Two paths:
- Author a random-encounter entry per creature-tier (Aevi: content) that spawns the creature as an opponent,
  danger-gated (riffraff at danger 1-2, epic at 3-4), region-free per the SNG-225 §4c drop, flavor
  "dangerous"/"fight".
- OR a generative hook (CCode): the encounter system can pull a bestiary creature as the opponent for a
  "fight/dangerous" roll, scaled to location danger. This is the cleaner long-term wiring (ties SNG-225 — the
  encounter pool now HAS somewhere to get monsters from).

### §2c — FEARED (Aevi: content) — woven into what people dread
The creatures must appear in what NPCs and peoples are AFRAID of:
- Add creature-fears to `tradition_motivations.json` (Aevi authored it — extend it): each affected tradition
  gains a "dreads" line naming the creature that threatens THEM specifically (Ashwardens dread the wrong stag
  — death-craft can't stop a thing already past dying-right; Wrights dread the hollow-pace — a made thing that
  outlived its purpose is their nightmare of their own work; Lattice dread the tessellith — block-logic gone
  feral is their order turned predator). Fear that's SPECIFIC to each people's craft is the weave.
- Add to location `encounterFlavor` (Aevi): places near a creature's range carry a line of dread ("the graze
  at the tree-line has been wrong since the stag changed").

### §2d — WANTED/MOTIVATION (Aevi: content) — woven into what people want
- Creatures create WANTS: someone wants the wrong stag's lattice-antler (worth a fortune / a key to something);
  a settlement wants the warpling cleared from its water; the Enginewrights want a hollow-pace captured intact
  to study the rotted directive. Add these as `wantsHook`s to the creatures AND as motivations on the
  relevant traditions/NPCs. A monster the world WANTS something about is woven; a monster that just spawns is
  set dressing.

### §2e — QUESTED (Aevi: content) — the hunts
- Author quest seeds/quests where a creature is the stakes: a clearing-quest (rid the water of the warpling),
  a hunt (the wrong stag has taken three walkers — end it), a study/capture (bring the Enginewrights a
  hollow-pace's core), an epic (the unmoored choir is growing — a domain-scale problem). These are the "should
  kill" quests. Add to valley `quests.json` (Aevi's loaded-path lane) with the creature as the objective,
  bound to the giver whose tradition FEARS or WANTS it (closing the loop: the fear → the want → the quest →
  the kill).

## §3 — The weave is the point (Erik's real ask)
A monster loaded and encounterable (§2a/b) is a THING TO FIGHT. A monster feared, wanted, and quested
(§2c/d/e) is woven into the WORLD — it changes what people dread, gives them something to want, and hands the
player a reason to hunt it that comes from the fiction, not a spawn table. Erik wants the second. The chain
per creature: a people FEARS it (specific to their craft) → someone WANTS something about it → that becomes a
QUEST → the player HUNTS it → the encounter is the KILL. Every creature should sit in that chain, not just in
a spawn pool.

## §4 — OWNERSHIP + honest scope
This is a MULTI-FILE weave, more than a one-shot. Split:
- **CCode:** §2a (load the bestiary — manifest + loader), §2b generative hook (encounter system pulls a
  bestiary opponent for fight/dangerous rolls, danger-scaled) — engine.
- **Aevi (me):** §2b per-creature encounter entries (if not generative), §2c the fear-weave into
  tradition_motivations + location encounterFlavor, §2d the wants/motivation hooks, §2e the hunt quests. All
  content, my lane. I'll do these in passes.
- Sequence: §2a (load) FIRST — nothing can reference a creature until it's loadable. Then the weave content
  can land against real creature ids.

## §5 — First pass done this session (see commits)
Aevi begins the weave now with the content that DOESN'T depend on the loader (it references creature ids that
will resolve once §2a lands): the per-creature FEAR + WANT + one HUNT-QUEST-SEED, authored into a
`bestiary_weave.json` staged beside the bestiary, ready to fold into tradition_motivations/quests once CCode
loads the bestiary. (Doing it as a staged weave-file first avoids editing loaded files against creature ids
that aren't loadable yet — LLW discipline: don't reference an id the game can't resolve.)

## GUARDS
- **The design laws hold** — these stay HAZARDS, not people. The fear/want/quest weave is about what PEOPLE
  feel and want ABOUT the creature; the creature itself gets no grievance, no plea, no story-being-ended. A
  quest to kill one is never a tragedy (that's what NPCs are for).
- **Fear specific to craft** — the weave is strongest when each people dreads the creature that defeats THEIR
  craft specifically; generic "everyone fears monsters" is set dressing.
- **Load before reference** — §2a first; don't weave creature ids into loaded files until the loader resolves
  them (the phantom-id lesson from the arcs' connectsTo).

## OPEN QUESTIONS — CCODE ROUND 2
1. §2b — generative opponent-from-bestiary hook (encounter pulls a creature scaled to danger) vs. hand-authored
   encounter-per-creature? Generative is less content + ties SNG-225's now-monster-less fight pool; lean
   generative with a few hand-authored signature fights (the wrong stag, the unmoored choir).
2. §2a — bestiary as its own `provides.bestiary`, or fold creatures into the existing encounters content type?
   (Own type is cleaner — a creature is reusable across many encounters/quests.)
3. Does the epic (the unmoored choir) tie into the offscreen-epic/arc system (SNG-208) as a domain-scale
   world threat, not just a fight? (A growing epic monster as an ARC is richer than a single encounter.)
