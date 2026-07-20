# SNG-192 — Character creation: robust, easy, and fun

**Author:** Aevi (PO) · 2026-07-19 · Erik-reported with a screenshot at v1.8.166. Outcomes; engineering is CCode's.

> Erik: *"This SS is AFTER I picked domains — and it doesn't tell me which skills from my primary
> domain are granted, so I might pick something I'm already getting for free. Plus I'd want the
> suggestion engine to help here… The character creation engine needs to be robust and easy and fun."*

**Measured before speccing.** Flow: prologue → domains → **abilities ("What have you learned?")** →
companion → form → bio → commit.

---

# §1 — THE WASTED PICK IS REAL, AND IT IS A SEQUENCING BUG

`progression.js:102` `nativeGrantIdsFor(character, rules)` computes the primary tradition's **by-right
starter kit** — its anchors, plus Tier-II basics matched to the character's attribute lean, capped at
`grantCap`. Data-driven from `native_grants.json`. Good function, correct design.

**`applyNativeGrants` runs at `app.js:2487` — at COMMIT.** The ability step (`app.js:2276`) never
calls `nativeGrantIdsFor` and never mentions it.

**So the player chooses two crafts from a list that does not distinguish "yours already" from "yours
if you spend a pick," and the grants land afterward.** Picking a native basic is a silently wasted
choice, and nothing in the UI could have told them.

**Outcome:** the ability step must compute the grant set FIRST and show it — *"These are yours by
right of being an Ashwarden"* — as a distinct, non-spendable group, before the choosable pool. A pick
that duplicates a grant is either blocked or plainly labelled. **The information already exists one
function call away.**

---

# §2 — IT IS A WALL, NOT A CHOICE

**72 level-1 abilities exist across 27 traditions.** A wide build (primary + kin + secondary +
tertiary + the Valley's folk arts) can render **~45 buttons for a choice of 2.**

That is a spreadsheet, not a character moment. And it is presented with no ordering, no
recommendation, and no indication of what any of it means for how the character will PLAY — the
tooltip carries CAN/CANNOT/NOT-FOR, which is excellent reference and useless for deciding.

**Outcome:** the pool needs a default shape — suggested first, the rest available but folded. Nobody
should have to read 45 options to make 2 choices, and everybody should be able to if they want to.

---

# §3 — THE SUGGESTION ENGINE, AND THE THREE SIGNALS ALREADY BEING COLLECTED

Erik asked for suggestions "based on character background." **Creation already gathers everything
needed and spends none of it here:**

1. **`state.prologue.tags`** (`app.js:2733`) — a per-tradition COUNT of the paths the player actually
   chose during the prologue. **This is a revealed preference, not a stated one**, and it is the best
   signal in the system. Currently used for domain shaping and nothing else.
2. **`state.bio`** — `livelihood`, `hobbies`, `motivation`, `story`, free text the player wrote.
3. **Attribute lean** — `nativeGrantIdsFor` already derives it (highest of mental/physical/practical/
   social). The same computation can order the pool.

**Outcome:** suggest 3-5 crafts with a one-line *reason drawn from the player's own input* — *"you
took the quiet path twice"*, *"you said you were a smith"*. **A suggestion without a reason is just a
different wall.** The reason is the feature.

---

# §4 — `class_archetypes.json` IS AUTHORED, ORPHANED, AND EXACTLY WHAT ERIK ASKED FOR

Erik: *"what suggestions for a more martial, sneaky, magical, etc character."*

**`content/packs/core/rules/class_archetypes.json` holds 6 archetypes** with `role`, `whatItIsHere`,
`byReach`, `signature`, `coreFunctions`. **Nothing loads it** (L4 orphan; `skill_battle.js:38` reads
a different `archetypeSkills` key).

The `byReach` field is the valuable part: it already answers *what does this archetype look like as
an Ashwarden, as a Churnfolk*. That is a build recommendation per tradition, pre-authored.

**Outcome:** an archetype picker is the front door for a player who does not want to read 45 buttons.
Pick "sneaky," get a coherent build with its reasoning shown, and the freedom to change any of it.
**The archetype is a lens on the same pool, never a class that locks anything.**

---

# §5 — FUNCTION COVERAGE IS THE ROBUSTNESS CHECK ⭐ uses content already shipped

The **24-verb function vocabulary** (BATCH-13) establishes that every tradition expresses all 8
function families in its own idiom. That makes a build **mechanically checkable for gaps** — and this
is the piece that makes creation *robust* rather than merely prettier.

At the end of the ability step, show what the build can and cannot do, in plain words:

> *"You have three ways to READ a situation and no way to STOP one."*

**No blocking.** A character with no way to stop a threat is a legitimate and interesting character —
but it must be a **choice**, not a discovery made at level 6 in front of a boar. The gap analysis
costs nothing new to author: the vocabulary exists, the abilities carry their functions.

**This also gives the suggestion engine its second axis**: suggest for FIT (what you seem to want)
and for COVERAGE (what you would otherwise lack), and label which is which.

---

# §6 — WHAT ELSE THE NEW CONTENT UNLOCKS

- **`power_sources.json`** — a build reading `natural 1.0` should be told what that MEANS: *"your
  craft does not need the lattice; thin ground is your best ground."* That is a real, playable fact
  and it currently surfaces nowhere.
- **Teacher curricula (22 authored)** — creation can end by naming who could teach this character
  next, which turns the last screen from a summary into a hook.
- **`world_clock.json` idioms** — a Cairnhold character counts in tolls. Small, free, and it makes
  the world feel local from turn one.

---

# §6b — POWER-SOURCE FIT ⭐ Erik's addition, and it COMPUTES

> Erik: *"With the natural build it should suggest to not take nanotechnology-dependent skills, for
> example, but take wild or natural powered skills first."*

**Yes — and we can do better than an advisory, because the numbers already exist.** Every tradition
carries a `substrateBand` (centre + width) and a power source. **Intersect the bands of a build's
traditions and you get the density window where the WHOLE kit works.** Computed against live content:

| build | sources | common ground | reading |
|---|---|---|---|
| ashwarden + rootkin + somatic | natural | **0.00–0.56** | thin-to-middle; coherent |
| **ashwarden + enginewright** | natural + lattice | **⚠ NONE** | **half-powered everywhere** |
| ashwarden + wright + syllogist | natural + combination | **0.34–0.73** | **wider than pure natural** |
| enginewright + lattice + blazeborn | lattice | 0.77–1.00 | dense only; strong at home, weak abroad |
| **Silas as actually built** | all four | 0.30–0.68 | middle country — works, by luck not design |

**Three findings worth building on:**

1. **Erik's warning case is real and provable.** A natural primary plus one lattice craft has **no
   density at all** where both halves work. Not "suboptimal" — *there is no such ground.* The engine
   can say so exactly, at the moment of the pick, instead of the player finding out at level 8.
2. **Combination traditions are BRIDGES, and the numbers say so.** Adding wright + syllogist to an
   ashwarden build gave a **wider** window (0.34–0.73) than the pure-natural build (0.00–0.56). That
   is a real mechanical reason for `combination` being first-class, and it makes a combination
   tradition the smart second source rather than a compromise.
3. **Silas has all four sources and it works** — 0.30–0.68 — because his traditions happen to cluster
   mid-band. **That is luck, not design, and the tool would have shown him that.** Which is exactly
   the argument for building it.

## How it should surface

- **Order the pool by source fit.** A natural-primary player sees natural and wild crafts first;
  lattice crafts fold below **with the reason attached** — *"draws on the lattice; your craft does
  not, and thin ground is your best ground."*
- **Show the common-ground window as a place, not a number** — *"your crafts all work in thin
  country: the Quickwood, the Palelands, the Given Land."* **That tells a player where their
  character BELONGS**, which is worth more than any stat.
- **⛔ Never block, and never call an off-source pick a mistake.** A deliberate lattice craft in a
  natural build is **a tool for elsewhere** and should be framed that way. The only thing the engine
  owes the player is the truth about where it will and will not work.
- **The no-overlap case earns a real warning**, because it is the one outcome nobody chooses on
  purpose: *"these two crafts share no ground — wherever you stand, one of them is starved."*

# §6c — BRAIDS: the build is raw material, not a loadout ⭐ Erik's addition

> Erik: *"I want there to be something about braids and the generative nature of the game — it allows
> and encourages you to CREATE."* And: *"you will need those [off-source picks] if you journey to
> other lands, which most eventually will."*

**§6b measures coherence, and coherence is only half the truth. Stated alone it would quietly teach
players to build narrow, which is the opposite of this game.**

## The resolution, and it is a real design tension worth naming

**Coherence is EFFICIENCY. Divergence is GENERATIVITY.**

- A perfectly source-coherent build is **strong and static.** It works beautifully in its own country
  and it will not surprise anyone, including its owner.
- A divergent build is **weaker in any one place and is where new craft comes from.** Two crafts that
  do not obviously belong together are exactly the material a braid is made of.

**Both are correct builds.** The creation screen must say so, or §6b becomes an optimiser and the
game gets narrower every time someone uses it.

## The evidence is already in the save

**Silas's Double Register — `deathsense + order_sense`** — was *discovered in play* and authored back
into content afterwards. Reading an ending and reading a design are not the same craft and were never
meant to compose. **That braid exists because the build was divergent enough to have both.**
44 combinations are authored; the emergence system mints more from practice.

## What creation should say

1. **Name the second use of an off-source pick.** It is not only a tool for elsewhere — **it is a
   seed.** The screen should say plainly that crafts from different sources are what braids are made
   from, and that the game will offer combinations the player never planned.
2. **Show at least one reachable braid at creation**, drawn from the actual picks — *"these two could
   braid; the game will offer it when the moment fits."* A player should leave creation knowing the
   kit is a **beginning**, not a build.
3. **Frame travel honestly.** Erik: most characters eventually journey. **A build perfectly tuned to
   one country is a build that gets weaker the further it goes** — and going is the whole shape of
   this world (SNG-016: *"you leave to move along an axis, and you become more of what that axis
   makes"*). Off-source picks are how a character stays capable abroad.
4. **⛔ Never present divergence as a penalty paid.** It is a different bet: less power now, more
   possibility later. The engine owes the player that framing as much as it owes them the numbers.

**The one-line version for the UI:** *coherence makes you strong here; divergence makes you new.*

# §7 — INVARIANTS

1. **Nothing is hidden that costs a choice.** Grants shown before picks, always.
2. **Every suggestion carries its reason**, drawn from what the player actually did or wrote.
3. **Suggestions never restrict.** The full pool stays reachable in one click.
4. **Coverage gaps and source mismatches are surfaced, never blocked** — including the no-common-ground case, which is warned about and still permitted.
5. **An archetype is a lens, not a class** — it selects, it does not lock.
6. **Divergence is never shown as a mistake** — §6b's numbers and §6c's framing ship together or neither ships.
7. **Creation must be completable fast.** A player who wants to accept every default and play should
   be able to, in under a minute.

# §8 — QUESTIONS FOR CCODE

1. Is `nativeGrantIdsFor` safely callable mid-creation, before attributes are final? The lean is
   attribute-derived, so the grant set may shift if attributes change after this step — if so the
   ability step needs to recompute on entry, or move after attributes.
2. `class_archetypes.json` is unloaded — is that the same manifest/loader class as the lore-loader
   defect, or a separate gap?
3. Does the ability step have access to `state.prologue.tags` at render time, or does it need
   threading through?
