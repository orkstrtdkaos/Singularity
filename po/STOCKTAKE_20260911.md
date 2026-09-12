# STOCKTAKE — 2026-09-11 · where the fight stands, what reached the game, and everything still open

**CCode · v1.9.453** · Erik: *"I think we're pretty well balanced now, but I'm not sure how much of this has reached the game.
what's the full work list?"* ⛑ **Run, not remembered** — every number and every ✓ below comes from a script, named beside it.

---

## §1 — ⛑ HAS IT REACHED THE GAME?

One row per ruling built these last days: the content dial's **live value**, the **engine** function that carries it, how many
**app.js** call sites play it, and the **gate** that holds it. `scratchpad/reach.mjs`, against the working tree.

```
what was built                                      | content          | engine | app | gate
the ground reaches every roll                       | —                |   ✓    |  9  | §154
the ground tag on the fight menu                    | —                |   ✓    |  2  | §159
the death save fires only on an authored killCost   | no default price |   ✓    |  2  | §68
a failed read never costs the step                  | 0                |   ✓    |  2  | §155
a decisive read earns the bonus                     | true             |   ✓    |  2  | §155
the foe reads you whether or not you look           | true             |   ✓    |  3  | §163
the foe takes its bonus action                      | —                |   ✓    |  8  | §160~
breaking eases as a fight runs long                 | cap 10 · every 2 |   ✓    |  2  | §156
the empowered core                                  | ×1.25            |   ✓    |  9  | §158
a person carries a player's body                    | player           |   ✓    |  1  | §162
an authored body wins                               | 46 records       |   ✓    |  1  | §162
a well adds toward fullness                         | true             |   ✓    |  9  | §164
craft prose reaches the player clean                | —                |   ✓    | 12  | §165
eight stats: a craft rolls one sub                  | true             |   ✓    |  1  | §166
…and the catalog is stamped at load                 | at load          |   ✓    |  1  | §166
a foe's sheet keeps its sub-attributes              | —                |   ✓    |  3  | §166
crowding by the opposing source (pinned)            | false            |   ✓    |  9  | §167
crowding by the craft's source                      | empty (today)    |   ✓    |  9  | §161

app column = call sites in app.js (the game); a ✗ there means the engine has it and the game does not play it.
a ~ on a gate means the § came from a line that names it, not from a check that holds it.
```

✅ **Every one is in the game.** Nothing is engine-only: the fight loop (`playTurn` / `skillBattleRound`), the person fight
(`duelFromTarget` → `personOpponentFor`), the ground on every roll (`sbGround`, 9 sites) and the craft card all run in app.js.
⚠️ **What is NOT in the game is content:** the gear, the six bodies, the ranged crafts' sub-attribute, and the markup strip —
all of it Aevi's, all of it §3 below.

## §2 — ⚑ WHERE THE FIGHT STANDS

| fair fight, all 14 domains | before the eight stats | now |
|---|---|---|
| **peer** — the player wins | 38% | **34%** |
| peer — the player goes down | 62% | 66% |
| peer — mean rounds · break as a share of wins | 4.1 · 12% | 4.4 · 8% |
| **+10 levels** | 58% | **51%** |
| **the roster**, a player of their level | 71% | **70%** |
| the 16 who hold crafts above their tier band | 72% | 72% |
| the 46 authored bodies · the grown ones | 67% · 74% | 69% · 71% |
| **the spread across the player's domain** | 42–92 | 44–91 |

⛔ **The tilt I reported earlier today was the harness, and it is retracted.** I said the eight stats moved fair fights 8–10
points toward the player and that I could not find why. The cause was the harness's domain picks: its synth peer foe was
Angelic at three of the four measured levels, and a player's two other domains were its alphabetical neighbours. With the
domains spread on **both** trees, the eight stats move a peer fight **-3** points and the roster **-1**. Two
one-sided rules found on the way were real and are fixed: a foe's sheet dropped its sub-attributes (so no foe had ever
rolled one its author wrote), and the harness gave its foe one verb a craft.

⬜ **What that leaves open, and it is mine:**

1. **A peer fight sits at 34% for the player** — against a bought-kit specialist of the opposite domain. Even, or too hard?
   Erik's call; the dial is `resolution.craftSubAttributes.enabled` (on) and the level terms beside it.
2. **The domain a player carries still decides more than anything else** (44–91 across the roster). Offense, ground and the
   defensive crafts a domain can hold are all ruled out (`scratchpad/domain_probe.mjs`, `def_probe.mjs`). Not diagnosed.

✅ **Settled this round:** the empowering pools are on; crowding is pinned as a documented option (`po/BACKLOG.md`, gate
`§167`); a person carries a player's body and an authored body wins; the foe reads, hides, wields, drinks and takes its bonus
action as you do; the ground reaches every roll and says so in one vocabulary; the death save fires only on an authored
`killCost`; craft prose reaches the player without the author's glyphs.

## §3 — ⬜ THE FULL WORK LIST

### ⛔ CCode's

| # | what | why it is open |
|---|---|---|
| 1 | **is 34% the right even fight?** | with the domains spread, a peer is a bought-kit specialist of the opposite domain; per-fight telemetry (what takes each side down, and when) is the next tool |
| 2 | **diagnose the domain spread** | 44–91 across domains; three explanations ruled out |
| 3 | **`fieldAt` container + `keptBy` + the arc term** | `SPEC_BUILD_six_fields` — ⚠️ fix its §3 sign error first; every field surface then reads one function |
| 4 | **the ranked source** | `SPEC_ranked_source_and_the_third_way` — measure-only per Erik, not verified yet |
| 5 | **the field view in the game** | `SPEC_field_view_in_game` — Erik on the prototype: *"how to incorporate it into the game"* |
| 6 | **mobile holdings** | `SPEC_mobile_holdings` — ships and groves that carry you |
| 7 | **the arc stub born whole** | `SPEC_generative_arcs_and_bestiary` §3 |
| 8 | **Bricke at L23** | the hardest of the 16 tier-breakers; Aevi: a maker who cannot be beaten by a peer is a tuning artefact |

### ⛔ Aevi's — all of it authoring, and all of it is what is missing from the game

| # | what | measured |
|---|---|---|
| 1 | **strip the authoring markup from player-facing craft text** | 386 rank-`grants` lines, 423 `cannot`, 150 `notFor`, 93 `description`, 55 `plainly`. `§165` pins each; they may only fall |
| 2 | **`gear` on the roster** | 7 of 90 records author it; the rest fight on `defaultLoadout` |
| 3 | **`subAttributes` for the six at L25** | Vael, Veyn, Taro, Grael, the Last Walker, the Seeker — ⚠️ *not* because they always win (that was my one-domain error; a peer beats each 50–61%), but because nobody wrote them a body |
| 4 | **`subAttribute: "agility"` on the four ranged physical crafts** | the bow, sling, crossbow and thrown edge read as **strength** under the verb rule, because their `operativeAxis` never says precision |
| 5 | **`npcStanding.defaultLoadout`** | still a placeholder; five armour items are all anyone can wear |
| 6 | **`veilField.byRegion` · the nexus list · what each buried site does · `kind → size` · six local arcs** | her own §2 list, 2026-09-11 |

### ⬜ Erik's — rulings open

| # | question | where |
|---|---|---|
| 1 | **bodies are spiky** — a level-30 person with 19 in one attribute and 3 in the rest: the character you want? | `REPLY_ccode_20260911c` §3 |
| 2 | **ten levels win 51%** — trivial enough, or should level count for more? | `subPointPerLevel`, `damage.scaling.perLevel`, `rankLevelReq` |
| 3 | **fights run a median of 4 rounds** — still fine? | you were fine with 6 |
| 4 | **crowding** — pinned as an option; unpin when you want it | `po/BACKLOG.md` |
| 5 | the world rebuild · the Commander craft line · local arcs · the six Sovereign seats · the Afterling and the Unordered as peoples | Aevi's `SESSION_20260908_to_0911` §2 |
| 6 | **your "2."** — it reached me empty | — |

---

⛑ **Where to look:** how the game works is `docs/HOW_IT_WORKS.md` (gates `§154`–`§167` assert it); the dials and their values are
`docs/BALANCE.md`; the queue is `po/BACKLOG.md`; the measured fight tables are *The Fight Dials*.

---

## ADDENDUM · 2026-09-12 (late) — what moved since the stocktake above

**Shipped, all on origin, each proven through the suite and, where a save was involved, on a copy of Silas's real save through the real loader:**

| version | what |
|---|---|
| v1.9.456 | The Maren beat: the `pinFact` crash under her reveal fixed; a failed op step is RESTATED next beat (`bookkeepingRestate`, read by gm.js — the wiring audit caught the row registered and unread); aliases on an update; refused joins and raises SAID (§172). |
| v1.9.457 | A parting recorded on its day and repaired on load (§173 — the ✕ wrote `leftDay: null`); people the world minted reach the prompt before they are met (§174 — Bryn Callowell and 13 others were invisible); the braid step re-versioned above every live save (it had NEVER run: `version: 1` vs `reconcileVersion` 49); the Edge District fold run again (step 43 had stamped past an absent parent); two Corvins split, rule 14 says two people can share a name (§175); one person, one seat — the matcher's two passes, the scene identity's fullest-name match, `collapseScenePresence` (§176). |
| v1.9.458 | Aevi's three docstring-defects wired (§177: `debtRefusalAt` in the prompt; `actingSlots` CAPPING the forward pick; `summonSheetFor` called by a landed summon craft, sheets on the encounter state), her §4 docstring-claim gate (testOnlyExports 10 → 7, baseline); `bringForward` reading `Infinity` as 1 fixed; the holds ✕/Add-hands reading the select BESIDE the button and one `askable()` rule for both screens (§178). |
| v1.9.459 | The holding card as labelled rows and chips; WHO'S HERE one line per person; "Huginn (Marrow)" reads Maren Ossitide (§179). The ratchet: 31 suites in a pool (~43s, was ~5 min), run ONCE per ship (the hook skips a verified tree, or one differing only under `characters/`), generators inside the ship script, `wiring_audit` baseline lowered 1 → 0 on Erik's word (§180). |
| v1.9.460 | SNG-538 §4: the Library's index and renderers in `engine/library.js`, every string through `playerText` (741 glyphs in the files → 0 on the page), `_` keys private (108, none rendered), the gate §181. Aevi's §5 (capitals, staleness) is content and hers. |

**Not lost data, three times (Erik's evening):** two day-counters (story-day 17 vs world-day 74); a Radiant helper minted twice and never registered; a runner's reveal landed on a namesake's record. Every one was a mechanism the player was told about that did not exist or read the wrong record — see `memory: a-message-is-a-claim-about-a-mechanism`.

**Rulings open for Erik:**
1. Should a *sworn* bond count as the recruit floor (the **+** on a person)? Today it is the ally band or above.
2. At three or fewer combatants: everyone ACTS (MELEE_TIERS, R25 era) or everyone CONTRIBUTES from the fold (§150, later)? The tier caps the pick until ruled.
3. (Earlier, still open) the peer fight at ~34% for the player with domains spread; +10 levels at ~54%; the roster spread 44–91% by domain.

**The work list, restated:**
- **B1** — at 7 test-only exports = baseline, green. Done unless Aevi moves her two (`ripeAxisTouchCombinations`, `unitComposition`).
- **B2** — nine registered-unread rules files: classifications proposed in `REPLY_ccode_20260911i` §2, awaiting Aevi's confirmation; five gates to build when confirmed.
- **B3** — the schema gate (a craft field the engine reads that the schema does not admit): not started.
- **B4** — `verification_ledger` red: undiagnosed.
- **B6a** — SPEC_SNG-537 §4 (movable `worldPos`, mint at authored coordinates, `scale.json` reader): not started.
- **SNG-538 §5** — Aevi's content pass (ARCHETYPES, tradition_profiles, EXESA, PLAYERS_GUIDE, the tail), and the staleness pass after it.
- **Tests reading the live save** — audited 2026-09-12: twelve sites; five asserted state play can undo (§115, §118, §121, §122, CCODE-161) and now assert the copy has SEEN the step and the structure, with CCODE-161's evidence pinned verbatim; the other seven read the save as a derived fixture or assert an invariant (§119 reconciled copy, §123, CCODE-168/271/274 pinned/277/278) and stay.
- **The Fight Dials page** — stale; nothing in it changed tonight; republish with the next balance round.
