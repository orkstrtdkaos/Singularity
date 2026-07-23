# SPEC — SNG-209: Death is a state, not a terminus
## Aevi (PO) · 2026-07-22 · awaiting CCode ROUND 2
<!-- status: SNG-209 PHASE 1 (the substrate) COMPLETE_PENDING_REVIEW (CCode 2026-07-23). v1.8.228 (e656609c).
     Built: engine/death.js (deathState model + computed depth §2 + the clock §5.6 + retrieval primitive §4
     + reachableDeadForGM reader §1); epic death enters the state §5.3 (Q5 gate landed); the GM sees the
     reachable dead; a `resolveDeath` god-mode op is the Phase-1 trigger. ROUND 2 answered in the results doc:
     po/results/20260723_SNG-209_death_as_state.md — Q1 computed-with-override ✓, Q2 status-object-+-read-model
     (recommend against a 2nd stored home), Q5 confirmed. DEFERRED to you: §3 tradition roads (content),
     §5.5 retrieval quests (content), §4 player-death UX (design), §5.2 NPC/companion onto the clock (1-line
     wire, ships with the quests). Smoke + wiring-audit green; clean fresh-port boot. -->
## ⚠ ROUND 2 STATUS: Phase-1 substrate shipped. §3/§4/§5.5 (roads + quests + player-death UX) are yours.

> **Erik, 2026-07-22:** *"What happens when someone dies — I'd say that's an entered state. Silas has
> already resurrected a rabbit, so just because someone dies doesn't make it permanent. Quests could be
> undertaken to bring people back through a variety of methods."*

## §1 — Why this is foundational, not a feature
The world's whole cosmology is a **death↔life axis** that craft moves along — the ashwarden capstone (The
Cut Thread), the Rootkin who can "claw someone back for a while," Silas raising a rabbit. **Permanent death
was never true to this world; it was the engine's default because nothing modeled the alternative.**

Verified — `status: "dead"` is already a value in the NPC status enum (`npcs.js:155`:
`active | injured | missing | dead | departed`), NOT a deletion. It is treated as *terminal* in exactly
three places, and that is the entire blast radius:
- `worldtick.js:504` — offscreen population skips `dead`/`departed`.
- `companions.js:13` — partner-adjacency filters out `dead`/`departed`.
- (`removeEntity` in corrections deletes, but that's a repair op, not death.)

So the substrate is already right: death is a **status**, not a delete. What's missing is that the status
has no **depth** and no **exits**, and the three sites above assume it's a one-way door. This spec makes
death a state with grades and roads out.

⛔ **The reframe that matters:** the naive version is "add a resurrection quest." The real work is
"**everything that assumes dead = gone must stop assuming it.**" A dead person is not removed from the world
— they are IN THE DEATH STATE, still on the board, potentially retrievable. That is the SNG-207-shaped
insight: the thing to change (every terminal assumption) matters more than the thing to add (a revive path).

## §2 — Death is graded: a DEPTH, not a wall
The world already grades it — the rabbit came back easily; a person dead a season is harder; a thread the
Ledger already *bound* may be beyond reach (the braid's own text: "cannot alter an entry already
fulfilled"). So death is a **depth**, and depth governs cost, method, and whether return is possible at all.

Proposed grades (CCode refines):
| depth | name | when | reversibility |
|---|---|---|---|
| 0 | **the threshold** | just died, body present, "still warm" | trivial for the right craft — the rabbit; an ashwarden easing them back |
| 1 | **the near dark** | dead days–weeks, body intact | a real quest; most traditions have a road |
| 2 | **the deep dark** | dead a season+, or body lost | hard; specialized craft, a vessel, a bargain, a journey |
| 3 | **the sealed** | fate-bound (the Ledger enforced completion), unmade, or willingly gone | may be genuinely one-way — and that's what makes death still *mean* something |

**Depth increases with time-dead, body loss, and fate-binding.** A freshly-dead person is shallow; every day
and every complication sinks them deeper. This gives the player a *clock* — retrieval gets harder the longer
you wait — which is where the drama lives.

⚠️ **Depth 3 must be reachable-as-a-wall sometimes.** If everything comes back, death is free and nothing is
at stake. Some deaths must be sealed — a great loss the world has to carry. The grief of the sealed is what
makes the returnable ones matter.

## §3 — Every tradition has its OWN road back (the variety Erik wants)
Return is not one mechanic; it is tradition-idiom, and each reaches a different depth:
- **Ashwarden** — ease them back across the threshold; masters of shallow death, the ones who were *there*.
  Cannot reach the deep dark (their craft is attendance, not retrieval).
- **Numinous** — soul-retrieval from the deep dark; go where the spirit went and bring it home. Reaches
  depth 2, but risks the retriever.
- **Wright / Enginewright** — build a vessel when the body is lost; the person returns housed in a made
  thing. Reaches depth 2 by a different door (body-loss doesn't stop them).
- **Rootkin** — regrow them from what remains; slow, alive, changes them toward the green. "Claw them back
  for a while" — may be *temporary*.
- **Abyssal** — bargain them back. Always possible, always priced, and the price is the point (this is the
  Hollow-King road — it works and it costs).
- **Hourkeeper** — reach back along the thread to *before* the death; the rarest and most dangerous, brushing
  depth 3.
- Others carry partial or supporting roles (a Verist naming the true death, a Stillhold holding a vigil that
  keeps someone at the threshold longer).

**This is why every tradition wants its own epics (SNG-208 / the roster):** the epics are the GATEKEEPERS of
the roads back. Whether you can save someone you love depends on *which* figure can reach that depth and
*whether they'll help yours* — the engine of "help mine, hinder theirs" made personal.

## §4 — Return is not free and not clean (the guards that keep death meaningful)
- **A cost, always.** Every road back charges — a price paid, a piece of the retriever spent, a bargain
  owed, a change accepted. Free resurrection is worse than permanent death.
- **Return can CHANGE them.** Someone brought back may return altered — Rootkin-return greens them, abyssal-
  return owes a debt, deep-retrieval leaves a mark. "Not quite who they were" is a feature, and a story.
- **Return can FAIL** — and a failed retrieval sinks them deeper or seals them. The attempt is a risk.
- **The player and epics and NPCs all inherit this.** Player death → a death state the party/an ally can quest
  to reverse (not a game-over). Epic death (SNG-208) → the killed epic is IN the death state, and a great
  enough effort (or rival) could bring them back *changed* — a returned legend is a landmark story. NPC death
  → the grievable, questable loss Erik is describing.

## §5 — What changes (the un-terminal-ing)
1. **`worldtick.js:504`** — dead figures aren't skipped-forever; a dead figure in a reachable depth is a
   latent quest hook, not a void. (They don't *act*, but they're not *gone*.)
2. **`companions.js:13`** — a dead companion is retrievable, not permanently filtered.
3. **SNG-208** — "a killed epic is removed from the roster" becomes "enters the death state at a depth set by
   how they died"; roster-removal is only for the *sealed*.
4. **New: the death-state model** — `status: dead` gains `deathState: {depth, diedDay, bodyStatus, sealed}`.
5. **New: the retrieval-quest category** — a quest whose resolution changes a `deathState` (returns, or fails
   and deepens, or confirms sealed). Tradition-idiom method; depth-gated; costed per §4.
6. **New: depth deepens over time** — a tick nudges reachable deaths toward sealed if untended (the clock).

## GUARDS
- **Death still means something** — depth 3 sealed is real and permanent; not everything returns.
- **Return always costs; return can change or fail** — never a clean undo.
- **Reuse the state machinery** — `deathState` is a status extension, retrieval quests are `quest_structure`,
  depth-deepening is a world-tick pass. No new subsystem; death joins the systems that exist.
- **The clock is the drama** — freshly dead is cheap, waiting sinks them; the player feels the urgency.
- **Player death is not game-over** — it's the deepest personal quest hook.

## OPEN QUESTIONS — CCODE ROUND 2
1. **Depth model:** the 0–3 grades as a computed function of (days-dead, body-status, fate-bound), or an
   authored/GM-set depth per death? Likely computed-with-GM-override.
2. **`deathState` home:** extend the NPC status object, or a parallel `character.theDead` ledger the retrieval
   quests read? (The latter makes "who can I bring back" a queryable surface.)
3. **Tradition-road gating (§3):** author each tradition's reachable depth + method as data (parallels
   `tradition_motivations.json`), so a retrieval quest validates "can this craft reach this depth"? I can
   author that content.
4. **Player death UX:** what does the moment of player death look like — a death-state screen with the roads
   out shown, vs. handed to an ally? Design call.
5. **Sequencing:** SNG-208 (epic death) references this — 209 should land first or with it, so "killed epic"
   enters a death state rather than a delete. Confirm 209 gates 208's death-outcome.
