# SNG-175 — Companions who grow, and teachers with a curriculum

**Author:** Aevi (PO) · 2026-07-18 · Erik-directed. Outcomes; the engineering is CCode's.

Erik: *"Basic NPCs have everything they need — but as you travel with them, they need skills and
abilities to use, things they can teach. Pell should gain more depth and motivations preferences and
opinions she will act and initiate from. My bonded teacher should have fields that show the entirety
of what they can teach and the path they want to take through it."*

**Also ratified this turn:** multiple primaries credit standing at **reduced gain each** (SNG-174 §4.1)
— *"you can only learn so much at a time."* Breadth is not strictly better than depth.

---

# §1 — THERE ARE TWO CLASSES OF COMPANION AND ONLY ONE OF THEM IS ALIVE

## Measured

**Authored companions** (9 — `content/packs/valley/companions/`) carry:
`stages`, `bondGrants`, `assistTags`, `persona`, `boundaries`, `knowledge`, `hooks`, `voiceHints`,
`appearance`, `startingOption`.

**A recruited NPC** gets `recruit()` (company.js:40):

```js
entry = { npcId, roles: [], teaches: null, liaisonFor: null, joinedDay: day };
```

**A membership row.** No stages, no persona, no boundaries, no knowledge, no abilities.
`engine/companions.js:9` states the split outright: *"They are NOT recruited companions (no catalog
def / assistTags)."*

**So Pell can travel with Erik indefinitely and never acquire what an authored companion has on the
day it is created.** That is the whole of his complaint, and it is structural — no amount of play
moves her, because there is nowhere for the movement to go.

## Outcome wanted

**One companion model, two entry points.** An authored companion is *born* rich; a met NPC *becomes*
rich by travelling. The difference should be provenance, not ceiling.

---

# §2 — WHAT A TRAVELLING COMPANION ACCRUES

1. **Abilities they can actually use.** Today a companion contributes `assistTags` — a bonus to *your*
   roll. Erik wants *"skills and abilities to use."* A companion should be able to **act in a scene**:
   their own craft, their own function-family coverage, their own moment. This is also the honest
   basis for SNG-167's Coliseum and any fight where you are not alone.
2. **Depth that drives INITIATION, not just reaction.** Erik's exact words: *"motivations preferences
   and opinions she will act and initiate from."* The distinction is the spec. Today NPCs answer;
   they should also **want**, and act on it unprompted — raise a subject, object to a plan, ask for
   something, refuse. Authored companions have `persona` and `boundaries`; a grown one needs the same
   and needs the GM told they may be *acted from*.
3. **Opinions that are ABOUT things** — the player's choices, other NPCs, the peoples, the current
   quest. An opinion with no object cannot generate a beat.
4. **Growth earned by shared experience**, not by clock. Travel together, fight together, survive
   something — these are the ledger the growth reads. The practice ledger already records
   co-activation (`practice.coActivations`), which is the closest existing signal.
5. **SNG-174's domains do the shaping.** A companion's primary/secondary/tertiary already say what
   they care about and who they trust. Preferences should fall out of disposition rather than being
   authored twice.

---

# §3 — THE TEACHER'S CURRICULUM

Erik: *"fields that show the entirety of what they can teach and the path they want to take through it."*

## Measured

**`teaches` is authored on exactly ONE NPC** — `master_taro: "somatic"`. A bare tradition string.
`recruit()` copies it onto the membership; `trainerFor()` returns a Set of traditions; the teacher
gate opens tier access.

**So "what can my teacher teach me?" has no answer in the data** — only "which tradition are they of."

## Outcomes wanted

1. **The whole set is legible.** A bonded teacher declares everything they can teach — not a
   tradition label but the actual craft: abilities, braids, and the practice that leads to them.
   The player should be able to *look* and see the shape of what is on offer.
2. **A path, and it is the teacher's own.** Erik: *"the path they want to take through it."* A
   curriculum is **ordered by the teacher's judgement**, not by the player's convenience — this is
   what makes a teacher a character rather than a shop. Two teachers of the same tradition should
   walk it differently, and that difference is characterisation.
3. **The teacher initiates.** Per §2.2 — a teacher with a path *offers the next step* when the moment
   fits, in the fiction. Erik has held a Radiant teacher and a bound Ashwarden teacher and been
   taught nothing; SNG-170's rank-3 mastery *"works beautifully"* and nothing walks him onto it.
4. **Teaching is a relationship with cost.** Time, the teacher's own attention, and their judgement of
   readiness. A refusal — *"not yet"* — is a legitimate and interesting outcome.
5. **Teaching moves standing** (BATCH-12 §3c). Being taught is a bond with that people.
6. **Braids become visible through the teacher**, per SNG-170 §4 — a teacher of tradition T should
   name reachable combinations involving T. That is the answer to *"make braids more obvious"*.

---

# §4 — ACCEPTANCE

1. A met NPC who has travelled with the player a while has persona, boundaries, opinions, and at
   least one thing they can do in a scene.
2. That companion initiates something at least once without being addressed.
3. Looking at a bonded teacher shows the whole of what they can teach and where they would start.
4. The teacher offers the next step in fiction, unprompted, when the moment fits.
5. An authored companion and a long-travelled met NPC are indistinguishable in *kind* — only in history.

---

# §5 — QUESTIONS FOR CCODE

1. §1 — does a met NPC get *promoted* into a companion record on some threshold, or does the
   companion model become a view over the NPC record so there is only ever one object? I lean the
   second — two records for one person is the `mergeEntity` bug class we already have repair ops for.
2. §2.1 — companion abilities in a scene: does this ride the existing ability catalog with an
   owner field, or do companions need their own lighter thing? Full parity may be more than the
   fiction needs.
3. §2.4 — is `practice.coActivations` the right growth ledger, or is there a better shared-experience
   signal already recorded? **Ask before I author anything** — I have twice specced what already
   existed today.
4. §3.1 — a curriculum is content. Before I author it across every teaching NPC, is there an existing
   ability→tradition→tier structure that already implies the ordering, so the teacher only needs to
   declare deviations from it?
