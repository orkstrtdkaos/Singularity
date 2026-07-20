# SNG-194 — The GM brings something of its own

**Author:** Aevi (PO) · 2026-07-19 · Erik-directed. Outcomes; engineering is CCode's.

> Erik: *"Novelty and initiative introduced in the narrative. The NPCs have this built in — their
> wants, etc. I want the GM to read those and the world and the whole scene and ask: what thing could
> be introduced from all of this that the player's prompts aren't necessarily driving toward? A little
> surprise can work wonders and makes the world richer."*

---

# §1 — MEASURED: the material is there and the instruction is a permission

`gm.js:204` already assembles a block titled **WHAT THE PEOPLE HERE WANT**. Its rule reads:

> *"rule 10b — **when a scene establishes or deepens a bond** with one of them, **you may** surface ONE
> as a CONCRETE, NAMED opportunity with stakes."*

**Gated on a bond event. Worded as permission.** **40 of 42 authored NPCs carry `wants` and 41 carry
`fears`** — a corpus the GM is allowed to touch in one narrow circumstance and is never asked to
consult.

**This is L2 — *permission isn't initiative* — in narrative rather than in code.** It is the same
failure as the teacher gate that decided what you were permitted to learn while nothing ever made a
teacher act, and the same failure as `markTeacher` never firing: **capability present, trigger
absent.**

---

# §2 — THE OUTCOME WANTED

**A standing question the GM asks itself every scene, not a permission it may exercise:**

> *Given everything true in this context — what these people want and fear, what is stirring in the
> world, what this place is, what the ground is doing, what work is underway elsewhere — **what could
> enter this scene that the player is not reaching for?***

Then, **rarely**, it acts on the answer.

## §2a — the material it already has

Ranked by how much is authored versus how little is used:

1. **NPC `wants` and `fears`** — 40 and 41 authored. **The richest and most neglected source.** A
   want is a reason for someone to do something *to* the player rather than wait to be asked.
2. **Latent arcs** (SNG-191 §E, shipped) — things fomenting on the world count. **Surfacing is
   exactly what they were built for**, and the GM is the surface.
3. **Delegated assignments in progress** (SNG-191 §D) — Calvar's crews are working. Someone comes to
   report, or to complain, or because a crew found something.
4. **The place itself** — `poleIntensity`, disposition, sub-places, its own seeds.
5. **The substrate** — thin ground behaves. An inherent craft is clearer here; a lattice one falters.
6. **The people-of-kind** — who is here, whose country this is, what the Accords say about it.

# §3 — INVARIANTS, and these are what stop it becoming noise

1. **⛔ ATTRIBUTABLE.** Whatever enters must come from something already true in the context, and the
   GM must be able to name what. **Same invariant as latent arcs (SNG-191 §7): no arc springs from
   nothing at the moment of contact.** This is the entire difference between a living world and a
   random-encounter table, and it is the invariant that matters most.
2. **⛔ RARE.** `gambitApt` is the precedent and its wording is already right: *"the game OFFERING a
   plan unprompted, and it must be RARE."* **A surprise every turn is wallpaper.** Something like one
   in four or five scenes, and never twice running.
3. **⛔ NON-BLOCKING.** It enters *beside* the player's action, never instead of it. The player's
   intent still resolves this turn. **An interruption that overrides is a hijack, and the game
   already has a name for that failure — it is what moved Silas without consent.**
4. **NOT ALWAYS A COMPLICATION.** An offer, a gift, a person who simply appears because they wanted
   to, a thing noticed. **If every surprise is trouble, the world is not richer — it is only more
   dangerous**, and the player learns to dread the unprompted.
5. **THE PLAYER COULD HAVE SEEN IT COMING.** The best version is not a non-sequitur but a
   **consequence of something they walked past.** They said no to someone three scenes ago. They left
   a crew unsupervised. **Surprise is not the same as arbitrariness, and this rule is the difference.**
6. **IT MAY BE DECLINED WITHOUT COST.** Not every thread offered must be picked up, and refusing one
   should not read as a failure state.

# §4 — WHY THIS MATTERS MORE THAN IT LOOKS

Erik's other note this session: *"I burned through the current arc almost too easily — I still
haven't seen it result in anything."*

**A world that only responds is a world you can finish.** Every thread is one the player started, so
running out of prompts means running out of game. **A world that also OFFERS cannot be exhausted**,
because it is generating faster than any one player consumes — which is exactly what SNG-191 §E built
underneath, and this is the surface it needs to reach the table.

# §5 — QUESTIONS FOR CCODE

1. Is `fears` in the assembled prompt at all, or only `wants`? **41 authored fears would be the
   single best source for a non-hostile surprise** — someone acting out of fear is doing something
   sympathetic, not attacking.
2. Rate-limiting: is there an existing per-scene counter (`gambitApt` must already have one), or does
   this need its own?
3. Should the offer be a distinct op — so it can be COUNTED, per SNG-190 §3 — rather than prose only?
   **I lean yes: an unmeasurable behaviour is one we cannot tell is working**, and we have been
   caught by exactly that three times.
