# SPEC — SNG-308: THE ARC ROLL. One table that is a hit list and an MVP list.
## Aevi (PO) · 2026-08-05 · Erik's three rulings

## RULING 1 — THE PLAYER CAN BE STRUCK, AND IT IS A FIGHT ENCOUNTER
> *"that would be a fight encounter that probably would warrant gambits to overcome."*
**So a strike against the party is not a world-tick roll — it becomes an ENCOUNTER.** The sim decides *that* a
strike is coming and *who sent it*; the table decides what happens. **Gambits are the intended counterplay**,
which fits: a striker is drawn from the *working* pool, so they are not braced for a fight they started.
**And the warning asymmetry from the third-action spec now matters directly to the player:** a **crusade is
declared** — the party gets notice. **A quiet strike gives none**, unless a verist, a foresense craft, or a
bought rumour reveals it. **That is the argument for information as a purchasable good, made personal.**

## RULING 2 — ⚠️ NOT "MOST HATED". MOST EFFECTIVE, PERIOD.
> *"it's not the most hated worker, it's the most effective period. One side can have the most effective, but
> that's just the story."*
**This corrects my own spec and it is the same error I keep making.** I wrote the Quiet Work as targeting *"the
most valuable"* and the Crusade as targeting *"the most HATED"* — **which smuggles a moral ranking into target
selection.** CCode had already flagged the risk and built position-not-merit; **Erik is going further: there is
only one criterion, and it is EFFECTIVENESS.**
**Both kinds target the same person.** What differs is **method, not choice of victim** — quiet is deniable,
crusade is declared. **And "one side has the most effective figure" is not an imbalance to correct. It is the
story.**

## RULING 3 — THE ARC ROLL (the table)
> *"a list of all NPCs and PCs that shows their effect on the arc and how they had the effects — their arc
> stats. That list is basically a hit list at the top, but also the MVP list."*
**⚠️ THAT DOUBLE READING IS THE WHOLE DESIGN AND IT SHOULD NOT BE SPLIT INTO TWO SCREENS.** The same ranking,
read by the side that owns them, is *who we must protect*. Read by the other side, it is *who we must remove*.
**One table. The player's own name is on it.**
### COLUMNS — every one from data that already exists
| column | source | why it earns its place |
|---|---|---|
| **figure / player** | roster + party | ⚠️ **PCs and NPCs in one list, ranked together** |
| tier | `ws.figureTier` | |
| tradition | roster | |
| **arc** | `ws.figureCares` | a figure appears once per arc they act on |
| **NET PUSH** | `ws.epicArcPushes` | ⚠️ **the ranking column — this IS effectiveness** |
| contests W–L | `ws.figureCareer` | how they got it |
| strikes landed / survived | `ws.arcStrikes` | |
| guards held | `ws.figureCareer` | |
| **turnings** | `ws.arcTurnings` | the rarest and largest line |
| **streak** | `ws.arcUnheldStreak` | ⚠️ constancy — the holding bonus, visible |
| status | `ws.epicStatus` | active / wounded / dead / sealed |
| **how** | derived | ⚠️ **THE "AND HOW THEY HAD THE EFFECTS" COLUMN** |
### ⚠️ THE "HOW" COLUMN IS THE POINT — AND MY FIRST LABELS WERE JARGON
**Erik caught these, hours after I wrote the directive against exactly this:** *"Standing over WHAT? Turning
WHAT? Winning — I would guess you mean battle victories or duel wins."*
**He is right. "By holding", "by standing over", "by turning" are MY internal shorthand** — words that carry
meaning because I have been using them all session, and none because they name nothing. **A column label is
the worst place for that: there is no room for context to rescue it.**
**The labels, said properly:**
| label | what it actually means | what it tells you about removing them |
|---|---|---|
| **Wins fights** | most of their push comes from **won duels and arc contests** | **beatable in a fight — send someone stronger** |
| **Never leaves** | push comes from **holding one position for many consecutive passes**, rarely fighting | **you cannot beat them off a front; they have to be killed or lured away** |
| **Heals the wounded** | carries a healing craft and **shortens their side's recoveries** | **killing them raises the whole front's death rate, not just their own** |
| **Guards others** | **intercepts strikes aimed at their own side's people** | **they are why your last assassin failed — remove them first** |
| **Moved the arc** | has **personally pushed this arc to a new stage** | **the most dangerous name on the board; everything else is contributing, this one has changed the world** |
**Two figures with the same net push and different rows here need completely different answers, which is what
turns a leaderboard into a plan.**

## WHAT IT NEEDS
- `ws.arcRoll` assembled per pass from the sources above — **all of them already recorded; nothing new to
  track.** *(`ws.arcStandings` is only `{risen, fallen}` — promotions, not effectiveness. Different thing.)*
- **the player's own row, computed the same way**, so a party can see whether they are on it — **and where.**
- ⚠️ **visibility by standing, not global omniscience.** A player should see the rows for arcs they act on, and
  figures whose deeds have *spread* to them. **You learn who the dangerous people are by being near them** —
  and a quiet-strike tradition should be UNDER-represented in what you can see, because that is what quiet
  means.

## AND THE THING THIS MAKES POSSIBLE
**The guard and strike quests stop needing to be authored.** *"She is fourth on the Bleed and holding a
nine-pass streak; someone is coming for her"* **is a quest generated from a table.** And when the player is on
it, **the game can say so** — which is the sharpest version of Erik's *see and feel it* requirement:
**you find out you are worth killing.**
