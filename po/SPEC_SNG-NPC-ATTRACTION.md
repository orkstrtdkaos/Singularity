# SPEC: SNG-NPC-ATTRACTION

**Author:** Aevi (PO)
**Date:** 2026-08-31
**Status:** draft — for Erik review before promotion

---

## What this addresses

Two related gaps:

1. The game plays all business and no play unless the player initiates. NPCs are reactive on intimacy. The romance guidance doc gives the GM craft for *how* to narrate romantic scenes but no instruction to *start* them unprompted.

2. There is no system for NPC attraction — no first-contact draw, no compatibility signal, no one-sided tension, no instant click. Every relationship begins at neutral and moves only when the player moves.

---

## Part A — NPC attraction at first contact

### The two-draw mechanic

At first contact with any `romanceEligible: true` NPC of opposite sex, the GM rolls two hidden values — one for each party — on a 1–10 scale. These are never declared to the player. They inform GM behavior only.

**Input to the NPC draw toward the player:**
- NPC tradition (romance guidance already maps tradition to desire register)
- NPC `wants` line — read for relational content: does this person want connection, partnership, proving something, to be seen?
- Player character's dominant attributes vs what the NPC demonstrably values
- Seeded random component

**Input to the player draw toward the NPC:**
- Primarily seeded random with a modifier for player character's social attribute and any tradition-based affinity

**Output bands:**

| score | band | GM behavior |
|---|---|---|
| 7–10 | drawn | NPC notices. Behavior shifts at first meeting. |
| 4–6 | open | Neutral. Can develop either direction. |
| 1–3 | not there | Warm or professional as appropriate. Not this. |

### What drawn NPCs do — the instruction the game currently lacks

When an NPC's draw score is 7+, the GM is **instructed, not merely permitted**, to surface that attraction through NPC behavior without waiting for player initiation.

**When attraction is present and the scene permits, the NPC notices the player character physically. Do not wait to be walked there.**

Tradition-voiced attraction behaviors (to be added to the existing tradition section):

- **Ashwarden**: finds reasons to work near them. Passes something across that didn't need to be handed. Stands closer than the task requires.
- **Rootkin**: physical first — proximity, a touch that lingers a beat past functional. Notices the player's hands, their gait, the way they hold themselves under exertion.
- **Stillhold**: says nothing different. Is simply always there, and that constancy is itself the tell.
- **Blazeborn**: looks directly. Does not look away when caught looking.
- **Wright**: asks about the work. Keeps asking. Finds reasons to be where the work is.
- **Cogitant**: has clearly thought about this already; the gap is whether they can say it.
- **Marcher**: brief, complete attention — the traveler's version of full presence.
- **Umbral**: notices what others miss about the player. Names it quietly, once.
- **Churnfolk**: no plan; the interest arrives whole and manages them rather than the reverse.

The NPC noticing the player character physically means: **the GM describes what the NPC sees, through the NPC's attention.** Not clinical inventory. What THIS NPC notices about THIS player, filtered through what they value.

Pell would notice Silas's hands first. How he holds tools. The way he reads a structure before he touches it.

NPC attraction gives the GM eyes that aren't neutral. The GM uses them without waiting for permission.

### One-sided tension

Both draws are independent. This produces four meaningful states:

| NPC draw | Player draw | State |
|---|---|---|
| high | high | mutual — both parties moving |
| high | low/mid | NPC-initiated, player unaware or uninterested |
| low/mid | high | player pursuing, NPC cool |
| low | low | neither — professional or friendly, nothing more |

One-sided NPC attraction is **not a problem to resolve**. It's texture. The NPC carries it. It shows up in behavior sometimes. It doesn't demand resolution.

### Instant attraction

When the NPC draw rolls 9–10, the GM treats first contact as an attraction scene from the first exchange. The NPC notices before the scene has given them much reason to — something about how the player entered the room, the way they spoke, their bearing under pressure. Not explained or declared. It simply shapes the narration from the first line.

This is how the game gets spark without the player engineering it.

---

## Part B — Passive accumulation path (forward flag)

The bond system maxes in early game (SNG-354: seven encounters). The attraction spec connects to this: draw scores at first contact should feed bond growth differently than neutral encounters. A high-draw NPC who witnesses significant player actions accretes differently than a neutral one.

**Proposed field (not blocking this spec):** `attractionLog` parallel to `bondLog` — timestamped draw scores and witnessed scenes. Flagged for when SNG-361 closes.

---

## Part C — Rating floor, not ceiling

The existing guidance declares an R+ ceiling. The game plays PG-13 in practice. The ceiling is not the problem; the floor is.

**Addition to `romance_guidance.json` text:**

### NPC-initiated physical description — instruction, not permission

When an NPC's attraction to the player character is present (draw score 7+), the GM does not wait for the player to create physical description. The NPC notices the player character's body through their own attention, in the register appropriate to their tradition and character.

This is not escalation. It is accurate narration of what an attracted person actually does — they notice. The GM gives that noticing language.

The content ceiling is the character's rating (R, R+, etc.). The floor is: if attraction is present, the NPC sees the player character. Name what they see.

Within the game's heterosexual relationship frame: opposite-sex NPCs notice the player character when attracted. Same-sex noticing is warm and relational without romantic/physical register.

---

## What this does not touch

- Bond growth curve (SNG-354/361 — gated on bond event log)
- Rating system itself
- Existing NPC records — no backfill required; attraction draws happen at runtime
- The pursue/be-pursued balance — pursuit still works alongside this

---

## Build notes for CCode

Small surface area:
1. Add `attractionDraw` to NPC generation — two seeded values (npc_to_player, player_to_npc), stored on the NPC record at creation
2. Add NPC-initiated physical description instruction to `romance_guidance.json` text block
3. Add tradition-voiced attraction behaviors to the existing tradition section of the guidance doc
4. No bond system changes until SNG-361 closes

---

## Additions to this spec (2026-09-01)

### Eligibility gate

The attraction draw runs only when ALL of the following are true for the NPC:

- `romanceEligible: true` on the NPC record
- NPC is adult (not a child character — Pip Cotter, any NPC whose record or appearance description indicates youth below adulthood)
- NPC is not the player character's blood relative or established family member (Hesta Vorn as Silas's mother: no draw fires regardless of flag)
- NPC is not already in an established committed relationship to another member of the player's active company

The current `romanceEligible` field is a generation artifact set to `true` by default. This gate closes the cases it misses. CCode should implement as a pre-draw check before rolling either value, not a post-draw filter.

---

### Tradition voice — completed table

The attraction behavior table in Part A covers: Ashwarden, Rootkin, Stillhold, Blazeborn, Wright, Cogitant, Marcher, Umbral, Churnfolk.

**Missing from Part A — add:**

- **Lattice**: orderly in approach, completely committed once past the threshold; attraction surfaces as unusual attention to the player's consistency — whether they do what they said, whether they are the same person twice. Drawn to what doesn't fit their categories and drawn slowly; when they move, they move deliberately and without ambiguity.

**Domain-traditions (Somatic, Syllogist, Figurist, Verist, Hourkeeper, Numinous, Mason, Wayfarer, Cairn-warden, Horizon, Umbral-as-domain):** These are derived positions, not peoples with cultures. They do not require authored attraction behavior entries. Apply the catch-all from the romance guidance: draw on what the tradition values, fears, protects — that's the shape of its desire. A Figurist notices precision and form; a Verist notices honesty under pressure; a Somatic notices physical competence and presence; a Wayfarer notices readiness and the particular way someone carries themselves on the road.

---

### Note on `romance_guidance.json` tradition coverage

The guidance doc already has Lattice in its tradition voice section. The attraction behavior table in this spec should mirror the guidance doc's list exactly. Current guidance traditions: Umbral, Blazeborn, Ashwarden, Rootkin, Marcher, Stillhold, Cogitant, Churnfolk, Lattice. The catch-all rule ("for traditions not listed — draw on the tradition's core character") handles all others including domain-traditions and any peoples tradition not yet authored into the guidance.


---

### Compatibility axis: similarity vs. contrast

Not all NPCs are drawn to what they know. Some are drawn to what they are; others to what they are not. This is an authored property of the NPC, derived from their existing record — not a rolled value.

**Derive from the NPC's `wants` line and tradition:**

- An NPC whose wants express completion, stability, belonging → tends toward **similarity**. They want someone who fits the shape of their life, who shares their values, who feels like home.
- An NPC whose wants express curiosity, escape, expansion, proving something → tends toward **contrast**. The unfamiliar is the draw. Someone from a different tradition, a different world, a different register entirely.
- Most NPCs are mixed — drawn to one or two shared qualities and one or two contrasting ones.

**Effect on the draw:**

When calculating the NPC's draw toward the player character, the GM reads the compatibility axis first, then weights the attribute overlap accordingly:

- **Similarity-oriented NPC**: draw rises with shared tradition, shared domain, overlapping spectrum values. A Rootkin NPC drawn to similarity responds strongly to another grounded, seasonal, physical character.
- **Contrast-oriented NPC**: draw rises with difference — a different tradition, a spectrum that cuts against theirs, an approach to the world they don't have. The Wright who has never left the valley is drawn to the Marcher. The Cogitant is drawn to the Churnfolk who acts before thinking.
- **Mixed NPC**: the GM identifies which qualities the NPC wants familiar and which they want different, and weights accordingly.

**This is not a mechanical formula.** It is a reading discipline — the GM derives the axis from who the NPC already is, then uses it to weight the draw. Two NPCs with identical stats can have opposite draws toward the same player character because one wants what they have and one wants what they don't.

**Instant attraction and the contrast axis:**

Contrast-oriented NPCs are more likely to roll 9–10 instant attraction toward unusual or surprising player characters — the Ashwarden death-touched who walks into a Blazeborn town, the Wright who does something no local craftsperson would think to do. The difference itself is the spark.

**Examples from the existing NPC record:**

- Pell (Ashwarden, wants partnership and proof): mixed — wants shared competence (similarity) but drawn to Silas's death-adjacent register (contrast). The craft overlap grounds it; the difference makes it vivid.
- Maren Voss (liminal fighter, wants a true bout): contrast-oriented — drawn to someone who comes at the threshold differently than she does, not another patience-reader.
- Vash (lens-grinder, wants to understand what she half-knows): similarity in curiosity, contrast in method — drawn to someone who reaches conclusions differently than she does.

