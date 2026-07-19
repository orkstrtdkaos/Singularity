# SNG-176 — The GM can only see HERE

**Author:** Aevi (PO) · 2026-07-18 · Erik-directed from live play. Outcomes; engineering is CCode's.

Erik: *"I just asked the GM where my mother's house was located. It described it beautifully, but the
GM has nothing."*

---

# §1 — THE GENERAL DEFECT

Every world-knowledge block the GM receives is scoped to **the location the character is standing in.**

| block | builder | scope |
|---|---|---|
| LORE | `loreForLocation(location, loreMap)` | **this location's `loreRefs` only** |
| PLACE HISTORY | `placeMemoryForGM(character, locationId)` | **`character.placeMemory[locationId]` — one id** |
| CODEX | rule 17: *"shows what they already know that's relevant HERE"* | **here** |
| KNOWN PEOPLE | `knownPeopleAt(character, locationId, …)` | **here** |

**A player question about anywhere else cannot be answered, however well the game once knew the
answer.** The mother's house is almost certainly stored — `placeUpdates.subPlace` registers named
spots within a location, with a parent, capped at 24 per place, and the schema is good. It is simply
**out of scope from wherever Erik was standing when he asked.**

This is the same shape as the Crossroads bug and the lore-loader bug, one level up: **the data is
fine and the retrieval is narrower than the question.** Three instances in one session is a pattern,
not three bugs.

## Why it reads so badly in play

The failure is *specifically* worst for the things a character cares most about — a mother's house, a
hometown, the place someone was buried. **Those are exactly the places you are usually NOT standing
in when you speak of them.** Present-location scoping is precisely wrong for memory.

---

# §2 — OUTCOMES WANTED

1. **A question about a known place is answerable from anywhere.** If the character knows it, the GM
   can speak to it — where it is, what is known of it, when they were last there.
2. **Named sub-places are findable by name across the whole save**, not only under their parent.
   `subPlaceSlug` and the resolver already exist (`places.js:18,33`) — the lookup is built; it is the
   *delivery* that is here-only.
3. **Retrieval follows the question, not the position.** When the player's input names a place, a
   person, or a topic they know, that record should be in context for that turn. `parseIntent`
   already runs on Haiku and already reads the input — the hook exists.
4. **Backstory anchors resolve.** A bio names a hometown and a story; those should be registerable as
   real places the character knows, so *"my mother's house"* is a record rather than a phrase. If it
   cannot resolve, the GM should be able to say honestly that it is not yet on any map — **which is
   a better answer than inventing one.**
5. **Never silently substitute.** Today the GM has nothing and must improvise, so it either invents a
   location — which then conflicts with what was said before — or deflects. Both are worse than
   *"you have not told me where that is yet."*
6. **Bounded.** This is not "send the whole save." A few relevant records selected by the question,
   the same discipline the TOOLKIT and CODEX blocks already use.

---

# §3 — WHY THE ANSWER IS NOT "SEND MORE"

The lore-loader fix already carries a token warning (~2,900 mean, ~5,900 worst for raw JSON). Widening
every block to global scope would multiply that on every turn, most of it unread.

**The fix is selection, not volume.** The player's own words say which records matter this turn — that
is what makes this cheap. It also composes with BATCH-13's Haiku-default routing: a question that
needs retrieval is a signal about the turn, and the retrieval step can itself be cheap.

---

# §4 — ACCEPTANCE

1. Erik asks where his mother's house is, from anywhere, and the GM answers consistently with whatever
   was established — or says plainly that it has not been placed yet.
2. Asking about a place visited ten sessions ago returns what is known of it.
3. A sub-place is findable by its name without standing in its parent.
4. Token cost per turn does not materially rise for turns that ask nothing.

# §5 — QUESTIONS FOR CCODE

1. §2.3 — is `parseIntent` the right place to detect a retrieval-worthy reference, or does that belong
   in the same registry pass that builds the other blocks?
2. §2.2 — `resolveSubPlace` looks like it already scans across places. If so, the retrieval is one
   call and this whole spec is a delivery change rather than a build. **Please check before building
   anything** — I have specced what already existed twice today.
3. §2.4 — should bio anchors be *registered as places* at creation (hometown becomes a known place),
   or resolved lazily on first mention? Registering is cleaner and gives the map something real.
4. Does the CODEX already cover part of this? Rule 17 says it is here-scoped, but entity-anchored
   facts may already be global — in which case the gap is narrower than I have written it.
