# SPEC — SNG-198: The world TURNS for everyone, not just the delegated
## Aevi (PO) · 2026-07-21 · authored to spec · **awaiting CCode ROUND 2**

> **Erik, from the live world-tick (v1.8.180):** *"The NPCs seem to still be doing colorful text things
> instead of something meaningful to the story arcs? … I thought it had already implemented NPCs doing
> things in the world ticks — it was delegated tasks or something like that — but it should include all
> NPCs known and just heard of (such as the EPIC NPCs) when big or interesting things happen."*

**Erik's memory is correct, and the diagnosis is sharper than either half suggests.** There are two
offscreen-advance paths in `engine/worldtick.js`. One has mechanics and almost no population. The other
has the population and no mechanics. They were built for different tickets and never joined.

---

## §1 — THE FINDING: two halves of one engine

| | **A. Delegated work** (`:111–131`, SNG-191 §4) | **B. Generated lives** (`:340–386`, BATCH-9 Ph2) |
|---|---|---|
| Population | `ws.assignments` — **only NPCs the player explicitly delegated work to** | `character.generated` npc + arc at established/nominated tier |
| Model schema | `{assignmentId, outcome: progress\|stall\|problem\|done, note}` | `{entityId, note}` — **note only** |
| State change | `advanceAssignment()` mutates · `applyNpcUpdates` writes `statusNote` | **none** |
| Result | the work moves | prose accrues |

Path B is what produced Erik's screenshot. Its **entire output schema is `{entityId, note}`** — the model
could not move state if it wanted to, because the contract has no field for it. Vash's *"not quite matching
the geometry"* and Calvar's *"deciding whether it is the window finally failing him"* read as build-up
because they are *written* as build-up; nothing underneath them moved, and next tick the model is handed
the same want with no record of how far it has travelled. Four ticks of a thread ripening produce four
independent descriptions of a thread ripening.

**This is `codexUpdates`-shaped colour standing where `arcOps` should be.** It is not a prompt-quality
problem. Rewriting the system block yields better prose and the same nothing.

**The paper trail:** the original SNG-021 design — still in `po/SPEC_BACKLOG.md`, authored 2026-07-07 —
specifies exactly the missing piece: *"key NPCs get an offscreen want-progress counter so a place MOVES
between visits."* **That counter was never built.** I verified `wantProgress` appears **nowhere in the
repository** (code search, 0 hits). Phase 2 shipped the narrative half of SNG-021 and the mechanical half
was lost between tickets. This is L5-adjacent (never-fired ops) with a twist: the op was never *defined*.

## §2 — OUTCOME: an offscreen turn moves something countable

The unit of an offscreen tick stops being a sentence and becomes **a small, real advance that persists and
that the next tick can read.** Whatever the shape, these must be true:

- A thread that has been ripening across four ticks is **measurably further along** than after one, and the
  model can *see* that when it writes the fifth.
- A want that reaches its end **resolves** — and resolution is a legitimate outcome, not a loop that ripens
  forever. Path A's `progress | stall | problem | done` enum is the proven shape; the extension of it to
  path B's population is the ask.
- The note still exists and is still good. **Colour is not the problem** — Erik's complaint is that colour
  is *all* there is. Keep the prose; give it something underneath.
- ⛔ **Unguardrailed, per SNG-191 §4b.** A stall is a real stall; a problem is real. Nothing softened to
  keep the world tidy.

The counter/field shape, where it lives, and how it feeds back into the next prompt are CCode's to design.
What must be true is that **two ticks apart produce different world-state, not just different sentences.**

## §3 — OUTCOME: the population widens to who the player actually knows

Neither path reads the NPC registry. Between them they cover *delegated workers* and *generated records at
engagement tier*. Erik's ask is the people he **knows** and the people he has **heard of**.

**Wanted, in scope order:**

1. **Met NPCs** — anyone in the character's NPC registry with a live want or standing, authored or generated.
   Authored-vs-generated is an implementation detail of where a person came from and should not decide
   whether their life continues.
2. **Heard-of-but-not-met** — figures the player knows *about* (codex, rumour, news). These should move,
   because hearing a name twice and finding it changed is how a world reads as alive. ⚠️ I verified there is
   **no `heardOf` field** in the repo (0 hits) — if this tier is wanted, its marker does not exist yet and
   that is part of the build.
3. **EPIC / LEGENDARY figures — the specific gap Erik named.** `engine/legends.js` carries a real power tier
   (`legendary | epic | regional | notable | riffraff`, `:18`) and **nothing in `worldtick.js` reads
   `legend` at all.** Verified. The great figures of the world are the *only* ones for whom offscreen
   movement is obviously load-bearing, and they are the ones categorically excluded.

⚠️ **The two "tier" words are different axes and must not be conflated.** `_gen.tier` (fresh / established /
nominated / dormant) is **engagement** — how much the player has invested. `legend.tier` (legendary → riffraff)
is **power**. Path B filters on the first and has never seen the second. A build that treats them as one
field will quietly drop every epic figure the player has not personally befriended, which is all of them.

**Erik's gate — *"when big or interesting things happen"* — is the governor, and it is doing real work.**
A legendary figure must not tick out a small grounded development every day; that is how the epic becomes
furniture. Rarity is the point. Path A's `elapsed >= 3` gate and `legends.js`'s existing rarity/`minGapDays`
machinery are both prior art — prefer extending them to inventing a third pacing system.

## §4 — Arcs are in the same boat, and the miss is worse

Path B pulls generated **arcs** through the identical cosmetic path (`:350`) — tension and pressure in,
decorative note out. For an *arc*, "pressure that never resolves into anything countable" is not a cosmetic
shortfall; it is the arc failing to be an arc. Whatever advancement shape lands for people must land for
threads.

## §5 — Cost, honestly

Widening the population multiplies model calls per tick. Erik plays across multiple characters and the
world-tick already fires on load.

- **Batch, don't fan out.** One call advancing N figures, as both paths already do (cap 4 / cap 6).
- **The governor is the cost control as well as the drama control** — most figures should move *rarely*.
  A tick where three of four established figures do nothing is a correct tick.
- **Cheap advances should not need the model at all.** A counter ticking toward a threshold is arithmetic;
  the model is for the moment it *crosses* one.

## GUARDS

- **Derives, never fabricates** — the existing Phase-2 discipline holds: no drastic turns, nothing
  contradicting what is known, nothing dated in the future.
- **Never throws.** Both current paths degrade silently to no-news and must continue to; a world-tick
  failure must never block a load.
- **The news feed stays readable.** A wider population must not become a wall of text on return — the
  digest surfaces what *moved*, not everyone who was checked.
- **Idempotent per world-day.** Two loads in the same world-day advance the world once.

## OPEN QUESTIONS — CCODE ROUND 2

1. **Merge or extend?** Are these two functions that should become one advancement pass with a
   population resolver in front, or two that stay separate and gain a shared advance-primitive? Path A's
   delegated work has a contract path B does not (the player *asked* for it) and that distinction may be
   worth keeping. Your call — you have read both more recently than I have.
2. **Progress shape:** a numeric counter toward a want-threshold, a stage enum, or reuse of the
   `progress|stall|problem|done` outcome per figure? Simplest thing that lets tick N+1 read tick N.
3. **Heard-of tier:** is there an existing signal I missed that distinguishes known-of from met — codex
   node presence, a news mention, a `discovery` op — or does that marker need authoring?
4. **Epic pacing:** extend `legends.js`'s `minGapDays`/rarity governor to offscreen movement, or does
   epic-scale movement belong to the deployment beat rather than the tick?
5. **Does any of this collide with what you are building for SNG-134** (story evolves / relationship
   paragraph)? Both read accumulated state; SNG-134 reads it for the *player's* record, this writes it for
   the *world's*. I would rather find the overlap now than merge two half-built ledgers later.
