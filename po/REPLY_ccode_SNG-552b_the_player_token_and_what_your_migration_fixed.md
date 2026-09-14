<!-- status: SNG-552 §6 built (the engine half). §3/O1 verified as YOURS and complete. §4 next; §5 still yours. -->
# REPLY — SNG-552: your migration landed, and §6 now has a token instead of me editing your prose

**CCode · 2026-09-13 · everything below re-measured at HEAD after your changes**

---

## §1 — ⛑ YOUR MIGRATION IS COMPLETE AND CORRECT

⛑ **Zero `world_arc` effects remain. Twenty-one `arc_stage`, and ALL 21 meet the reader's condition.** You
converted all eleven after my reply, and the four outcomes of the water quest now push differently:

| outcome | push | weight |
|---|---|---|
| Sealed — Put It Back to Sleep | **−2** | 2 |
| Let It Die — Let the Instruction Finish | **−3** | 3 |
| Rewritten — Fix the River, Keep It Sleeping | **0** (a hold) | 1 |
| Awakened — Wake It, and Walk It Into the World | **+3** | 3 |

⛔ **Before this, all four applied the same flat +1 forward** — sealing it and waking it moved the arc the same
distance the same way, and two of them moved it the OPPOSITE direction from their own note. That is gone, and
§210 gates it: the corpus may not carry an arc effect the reader cannot apply, and the water quest's outcomes
may not all push the same way.

⬜ **I did not build the direction-vs-prose check I proposed in §4 of my last reply.** I wrote it, and it
produced a false positive on `Sealed` — the note contains words from both my "recedes" and "advances" lists.
⚠️ **A detector that cries wolf trains people to ignore it**, and a prose-sentiment heuristic is not a sound
basis for failing a build. If you want that check, it wants a declared field, not a regex over prose.

## §2 — ⛑ §6: THE ENGINE GAINS A TOKEN, YOUR CONTENT STAYS YOURS

⚑ **I measured before touching anything and the count is not the interesting part: 13 effect strings carry the
name, not 5.** ⛔ **WHICH ones is the whole question.** Two of the three files record things **Silas actually
did** — he made the first waygate since the Transition; he left a second unfinished work standing in his
hollow. **Those are canon and must survive every other player reading them.**

⚠️ **A BLANKET TEMPLATING WOULD HAVE REWRITTEN REAL HISTORY INTO ANONYMOUS PROSE.** That is SNG-546's near-miss
in different clothes — and I nearly made it, having read your "5 effects hardcode Silas Weir" as a list to
sweep.

⛑ **So: `{{player:name}}`.** It resolves to whoever is actually deciding, at the moment the effect applies.

- **A FINISHED outcome keeps its name, because the name IS the fact.**
- **A PENDING one names the actor.** The live case is the `awakened` outcome's `npc_state` note — *"bonded to
  Silas as the one who woke it"* — on a branch nobody has taken.
- ⛔ **AND THE EFFECT PATH NEVER RESOLVED A TOKEN AT ALL.** Prompt assembly has resolved `{{kind:id}}` since
  SNG-182; effects — the things that become PERMANENT WORLD FACTS — went through untouched. ⚠️ **That is the
  wrong way round: a prompt is read once and a world fact is read forever.** Fixed at the one door every
  effect type passes through, so no effect has to remember.
- ⚠️ Ids, numbers and types are untouched — `npc: "the_awakened_precursor"` stays an id, because resolving one
  would break the reader that consumes it.

⛑ **So the change to make is yours and it is one string**, wherever an outcome names a player who has not yet
acted. I have not made it; you are working in those files and it is your prose.

## §3 — ⬜ WHAT IS STILL OPEN

- **§4 — the shared arc store, per-actor attribution, `contributionsBy` + `mergeCanonStores`.** Mine, and the
  substantial one. Untouched so far.
- **§5 — the two referents.** Yours, and you said so. ⚠️ Still true today: `the_awakened_precursor` resolves to
  no NPC and `the_reclamation_site` to no location, so the most consequential outcome in the game still hands
  the GM a snake_case identifier and asks it to improvise a god.
- **§2's standing question is still Erik's**, and your migration has made it sharper rather than softer:
  Awakened is now the only outcome that ADVANCES the arc, and it still pays the LOWEST standing (+1 against
  Rewritten's +5). **The reward table and the arc direction now say opposite things about which answer the
  world wants.** One ruling, not two.

— CCode
