# REPLY — the eight stats, crowding by the opposing source, and what the domain spread is not

**From:** CCode · **2026-09-11** · **v1.9.453** · **To:** Erik, Aevi
**Answers:** Erik's *"there are 8 stats, not the 4"* · his *"1. yes"* to the crowding reading · the domain spread
**gates:** `§166` · `§167`

---

## 1 · The eight stats ✅ (`§166`) — built, measured before and after

Every craft row now rolls **one sub-attribute**, and the roll reads it before the parent.

| layer | rule |
|---|---|
| an authored `subAttribute` on a craft | wins |
| otherwise `resolution.craftSubAttributes` (content, Aevi's to retune) | each parent's verbs split between its power sub (strength, reason, presence, craft) and its finesse sub (agility, insight, rapport, wits) |
| harm verbs (strike, break) | the finesse sub when the craft's `operativeAxis` names precision, foresight or range; the power sub otherwise |
| where it lives | stamped onto the in-memory catalog at load (`subAttributeByFunction`), never the files; a minted craft derives it on the spot |
| bodies | a body builds toward the subs its harm crafts roll — the player's, a person's and the harness PC's alike |

Across the catalog every one of the eight carries harm. The authored bodies Aevi wrote now mean more: a specialist's
strong sub is what their crafts roll, not the average of two.

Fair fights, every one of the 14 domains, the same commands on HEAD and on this tree:

| | before | eight stats |
|---|---|---|
| **peer** — the player wins | 48% | **58%** |
| peer — the player goes down | 52% | 42% |
| peer — mean rounds · break share of wins | 5.3 · 11% | 5.3 · 11% |
| **+10 levels** — the player wins | 62% | **71%** |
| **the roster**, a player of their level | 64% | **71%** |
| the 16 tier-breakers | 59% | 70% |
| the 46 authored bodies · the grown ones | 60% · 67% | 70% · 72% |

⛔ **My first measurement showed a fair peer tilting from 46% to 56%, and the cause was in the game, not only the harness.**
`synthesizeOpponentSheet` builds a foe's sheet by naming the fields it passes, and sub-attributes were not among them: every
foe rolled its averaged parent while the player rolled a sharpened sub. No foe had ever rolled a sub-attribute Aevi authored.
Fixed, with a check (`§166`), and it moved a fair peer about a point. A second one-sided rule sat in the harness: it built its
synthesized foe one row per craft (its first verb), where the player and every person in the game get every verb. Fixed on both
trees; it moved both columns about two points and left the gap. The table is the run with both fixes in.

**What I can say, and what I can't:**

- ⚠️ **The eight stats move every fair measure 8–10 points toward the player**: peer 48% → 58%, ten levels up 62% → 71%, the
  roster 64% → 71%, and the tier-breakers most (59% → 70%).
- ⛔ **Not diagnosed.** With both fixes in, both sides follow the same rules everywhere I can find: the same kit purchase, the
  same growth toward the subs they roll, the same policy, every verb, the sub on both sheets. So either a third one-sided rule is
  still hiding, or this is the rule's own effect. I have not told those apart.
- It is not simply specialisation. Angelic's harm crafts concentrate on one sub as much as Body's, and Angelic gained nothing
  (the roster 44% → 32%) while Body gained 30 points. Concentration explains little: correlation 0.4 in the peer, 0.2 in the roster.
- **The spread between domains widens.** A player of their level beats the roster from 32% (Angelic) to 93% (Breaking), where it
  was 44% to 93%: Chaos 49% → 91%, Body 55% → 85%, Spirit 51% → 79%.
- ⚠️ The harness's peer foe is Angelic at three of its four levels (it picks the foe's domain from its level), so "peer" is mostly
  "against Angelic".

**It is a dial:** `resolution.craftSubAttributes.enabled`. On, as you ruled; off, every craft rolls its parent exactly as before.
Whether it stays on while I find the cause is yours.

## 2 · Crowding by the opposing source — built as a dial, OFF (`§167`)

Your reading, confirmed: veil is crowded by the lattice, meaning-powered craft by the nanite, nanite craft by meaning, and a
paired craft is no longer crowded by its own field. The curve: none at or below 0.4, easing to ×0.9 by 0.8, down to ×0.6 at
1.0. It sits in `groundCardFor`, so the ground card and the fight read the same thing, and the card names what crowds it.
Precursor, wild and body keep today's rule (there is no veil field to crowd precursor).

Measured through the built dial, every traditioned craft at all 135 places. The lattice's quartiles are 0.36 / 0.49 / 0.72; the
nanite's are 0.20 / 0.55 / 0.75.

| craft source | today | on, from 0.4 | on, from 0.6 |
|---|---|---|---|
| veil — crowded · mean penalty | 13% · 5.8 | **59%** · 10.1 | 33% · 7.6 |
| meaning-powered — crowded · mean penalty | 12% · 20.5 | 19% · 20.0 | 11% · 19.3 |
| nanite — crowded · empowered · mean penalty | 6% · 11% · 17.4 | 17% · 8% · 20.1 | 17% · 8% · 19.6 |

| place | today | on, at either start |
|---|---|---|
| nanite craft at the Great Engine | 69% empowered, 29% crowded | **0% empowered, 100% crowded** |
| nanite craft at the Grand Lattice | 69% empowered, 20% crowded | **0% empowered, 100% crowded** |
| veil craft at Archive Hollow | 100% empowered | from 0.4: 25% empowered, 75% crowded · from 0.6: unchanged |

⚠️ **Two things before you turn it on:**

- **From 0.4 it is harsher on veil, not gentler.** Half the world's lattice sits above 0.49, so "none below 0.4" leaves most
  places in the slight band. From 0.6, veil's new crowding roughly halves, and meaning-powered craft ends a little better off
  than today.
- **The nanite consequence does not depend on the start.** Meaning is 1.00 at the Great Engine and the Grand Lattice, the two
  places Aevi just ruled perfect for nanite, so pairing nanite with meaning empties both. Meaning reaches 0.8 at only 12% of
  places, and those are the cities.

## 3 · The domain spread — measured further, and what it is not

A player of their level beats the roster from 43% (Death) to 92% (Breaking) depending on their domain. Two explanations are
now ruled out:

| ruled out | why |
|---|---|
| **offense** | at level 50, Death's best harm craft hits as hard as Breaking's (43.0 each) and Body's does too — and Body wins 51% |
| **the ground** | Building and Chaos stand on the kindest ground of all (mean penalty 4.3) and win 63% and 49% |

What does separate them is **how often the player goes down**: Death 55%, Angelic 54%, Breaking 7%, Light 16%.

Nor is it **the defense a domain can hold**. At level 20 every domain's best guard, mend, read and hide craft is T2. At level
50, Death reaches a T4 guard and a T5 mend against Breaking's T3 and T3, and still loses. Three explanations are ruled out —
offense, ground, and defensive crafts in reach. **Not diagnosed.** The next tool is fight telemetry per domain: what takes the
player down, and when.

⚠️ **And part of every domain's figure is the harness, not the game.** The harness gives a domain's player its own crafts to
the level's top tier and the **next two domains alphabetically** to T3 and T2; a real player chooses those two. Angelic
reaches 17 of its 20 harm crafts through Body and Breaking, and Spirit 10 of its 11 through Angelic and Body.

## 4 · Aevi — the eight stats want your hand

The rule reads a bow, a sling, a crossbow and a thrown edge as **strength**, because their `operativeAxis` never names
precision. Authoring `subAttribute: "agility"` on `drawn_bow`, `sling_and_stone`, `levelled_crossbow` and `thrown_edge`
fixes each one, and the table in `resolution.craftSubAttributes` is yours to retune.

## ⬜ OPEN

| # | for | question |
|---|---|---|
| 1 | Erik | turn crowding by the opposing source on? And from 0.4 or later? (§2) |
| 2 | Erik | your "2." reached me empty — what was it? |
| 3 | Aevi | `subAttribute` on the four ranged physical crafts (§4) |
| 4 | Erik | the domain spread: the defense measure above, and whether the harness should choose a player's two other domains the way a player would |
| 5 | Erik | the eight stats tilt fair fights 8–10 points toward the player, cause not found — keep them on while I diagnose, or off? (§1) |
