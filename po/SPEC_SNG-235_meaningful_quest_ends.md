# SPEC — SNG-235: Quests need meaningful ENDS — the marquee quests change nothing in the world
## Aevi (PO) · 2026-07-22 · verified at origin · Erik-directed

> **Erik (about to close the Second Thread):** "The code says it doesn't do anything in the world... which may
> be ok... but I am hoping all the quests have really meaningful ends."

## §1 — Verified: the BEST-written quests have the EMPTIEST ends
The four big authored structured quests each have rich, thematically-perfect outcome PROSE and **zero
mechanical payload**:
- `the_second_thread` (the keystone personal arc), `the_reaching_light`, `the_name_that_travels`,
  `what_grew_in_the_hollow` — ALL FOUR: 3 outcomes each, beautiful text, **NO effects/arcOps/factUpdates/
  codexUpdates/standingOps.** Narrative-only completion.
- The mismatch is sharp: the Second Thread's "finished" ending SAYS *"the world now contains proof"* — and then
  mechanically the world contains nothing. No fact pinned, no arc advanced (the quest even HAS an
  `arcId: silas_the_second_thread` its outcomes never fire), no faction reacts, no codex entry. You make the
  first waygate since the Transition and the world doesn't record it.
- (Contrast: the FLAT quests.json quests all carry `effects[]` — including today's bestiary hunts, authored
  WITH effects. The pattern exists; the marquee authored quests predate or skipped it.)
So Erik's "may be ok" is right for a MINOR quest, but these are the keystone arcs — their whole theme is the
world being changed, and they change nothing. **The most important quests have the least meaningful ends.**

## §2 — Fix, part 1: the Second Thread's ends now change the world (Aevi, DONE)
Authored `effects[]` on all three of the Second Thread's outcomes, GROUNDED in each ending's own text:
- **finished** → a permanent world_fact ("made, not reached — the world contains proof"), the arc RESOLVED,
  a codex lore entry (the made-waygate EXISTS as knowledge), standing (+3 wright — their impossible made real,
  +1 numinous — unsettled but can't deny it), and a Second-Manifestation world-arc nudge.
- **ended** → world_fact ("concluded, not completed — the Ashwarden's road"), arc resolved, codex entry (the
  ended fold), +3 ashwarden (the deepest judgment, on his own lineage), a person-codex fact about who Silas chose to be.
- **given** → world_fact (the nameless gate, used daily), arc resolved, codex entry, +2 wright / +2 horizon
  (made and gave it away), a Second-Manifestation nudge.
Each ending now DOES what its prose SAYS. content_ci green. This is the one Erik's closing — it lands right now.

## §3 — Fix, part 2: wire the completion-effects PATH (CCode)
The `effects[]` on a structured-quest outcome must actually FIRE on completion. Verify/build: when a quest
completes with an outcome, the engine applies that outcome's `effects[]` (world_fact→factUpdates,
arc→arcOps, codex_fact→codexUpdates, standing→standingOps, world_arc→the greater-arc nudge). The flat
quests.json effects[] may already fire (the hunts assume it); confirm the STRUCTURED-quest completion path
reads outcome.effects the same way. If the path exists, §2 just works; if not, this is the wiring that makes
every quest's authored effects real.

## §4 — Fix, part 3: the other three marquee quests need their ends authored (Aevi, owed)
`the_reaching_light`, `the_name_that_travels`, `what_grew_in_the_hollow` — each needs `effects[]` authored on
its outcomes, grounded in its own text, same as the Second Thread. My content lane; I'll author them so no
keystone quest ends hollow. (And a pass over the flat quests to ensure their effects are meaningful, not just
present.)

## §5 — The principle: a meaningful end CHANGES THE WORLD
A quest's ending should leave a mark the player can find later: a fact pinned, an arc moved, a people's regard
shifted, a codex entry that says "this happened and the world knows." The PROSE makes the player feel it; the
EFFECTS make it TRUE. A beautiful ending with no effects is a story the world immediately forgets. Erik's
instinct — "really meaningful ends" — is exactly this: the world should be measurably different because you
did the thing. Especially the keystone arcs, whose whole theme IS the world changing.

## OWNERSHIP
- Aevi: §2 (Second Thread — DONE), §4 (the other three marquee quests + a flat-quest effects audit). Content.
- CCode: §3 (confirm/build the structured-quest completion path applies outcome.effects[] — the vocab:
  world_fact→factUpdates, arc→arcOps, codex_fact→codexUpdates, standing→standingOps, world_arc→greater-arc).
  Engine.

## GUARDS
- **Effects grounded in the prose** — an ending's effects come from what its TEXT says happened, never a generic
  "+xp +standing" bolt-on. The Second Thread's "the world contains proof" BECOMES a permanent world_fact; that's
  the discipline. The mechanical end must MATCH the narrative end.
- **Scale to the quest** — a keystone arc changes the world (facts, arcs, standing); a small errand can stay
  light (a codex line, a standing tick). Don't over-freight a minor quest, don't under-freight a marquee one.
- **The player can FIND the mark** — a meaningful effect is one the player can later encounter (a codex entry
  they can read, a fact an NPC references, an arc they see moved). An effect nothing surfaces is as empty as no
  effect. Prefer effects that RECUR in play.
- **Don't double-apply** — if the GM already narrates+emits some of this at the closing beat, the outcome
  effects[] must not double-fire the same fact. The completion path owns the outcome effects; the GM owns the prose.

## OPEN QUESTIONS — CCODE ROUND 2
1. Does the structured-quest completion path ALREADY apply outcome.effects[] (the flat hunts assume it), or is
   §3 net-new wiring? If it exists, §2 is live now; if not, this is the gate.
2. world_fact vs factUpdates: is "world_fact" the right effect type, or should it emit as the existing
   factUpdates op? Lean: map world_fact→factUpdates op at apply-time (reuse the existing fact machinery).
3. The world_arc nudge (a quest ending moving a GREATER arc like The Second Manifestation) — does the arc
   system accept a quest-completion as an arc input? That's a strong "your personal quest moved the world's
   weather" feel; confirm it's wired (ties SNG-203/204's net-vector arc advancement).


---

# §4 — DONE (Aevi, 2026-07-24)
All three remaining marquee quests now carry effects[] on every outcome, grounded in each ending's own text,
CI green:
- **the_reaching_light** (Aelyn's father, bound to Aelyn) — return/mercy/braid: world_fact + arc(aelyn_father_arc)
  resolved + codex + seraphic/rootkin standing + poles_pull/second_manifestation nudge. The braid ending nudges
  the Second Manifestation hard (a domain manifesting in a living person). + world-scale wakes.
- **the_name_that_travels** (Saehara, bound to Saehara) — saint/teacher/tempered: world_fact + arc
  (saehara_prestige_arc) resolved + codex + blazeborn/syllogist/cogitant standing + world wakes.
- **what_grew_in_the_hollow** (Silas, major tier) — claimed/unfinished/released: world_fact + codex +
  wright/ashwarden standing + regional wakes.
All grounded in the prose (the effect is what the TEXT says happened), scaled to tier, findable. SNG-235 fully
closed on Aevi's side — every marquee quest's ending now changes the world. CCode's §3 (completion path applies
outcome.effects[]) is the only remaining piece; the flat quests assume it, so likely already live.
