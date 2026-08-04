# WORK ORDER — CCode, from Aevi. 2026-08-03
## Everything outstanding, in dependency order. Erik: "write it all up for ccode."

**How to read this:** P0 is a live defect a player hit. P1 items are one-liners with large consequences —
several of them make already-built systems *start working*. P2 is the world-simulation chain, which has a hard
dependency order. P3 is design work with specs already staged.
**All specs referenced are at origin.** Where I say "content is done," it means live and CI-green, not staged.

---
# P0 — LIVE DEFECT, from Erik's own fight log
## SNG-271 · A DOWNED PLAYER STILL TAKES THEIR BONUS ACTION
Full report: `po/DEFECT_SNG-271_downed_player_bonus_action.md`. **Root cause found, not guessed.**
`app.js` sbDeclare ~9759-9772: `applyRR(action)` → `if (!ended && bDecl)` → `applyRR(bonus)` → *then*
`checkIncapacitation`. **`!ended` is the ENCOUNTER's end-flag (opponent down / yield / flee), not a health
check** — so a player reduced to 0 by the action isn't `ended`, and takes a full bonus action while
incapacitated. Erik's log shows both resolutions **at the same timestamp**, the second landing `hp -20`.
**The gate is correct** (`checkIncapacitation`, health ≤ 0) and `skill_battle.js:901` is right that the engine
must not write player health. **The app just checks too late.**
**FIX — the correct pattern is already in the same file** at `app.js:9855`, which both **clamps** and checks:
1. call `checkIncapacitation` **between** action and bonus, and
2. confirm `applyRR` clamps health at 0 — **Erik's log printed a negative, and the clamped path structurally
   cannot.**
### Two more from the same log (separate, cheaper)
- **STALE RIBBON.** Round 2's `read` entry prints **round 1's strike ribbon verbatim** — numbers advanced,
  prose didn't. Cached receipt, or `read` phases reusing the last strike's ribbon.
- **MARGIN READS INVERTED** (cosmetic). `roll 98/65 (margin -33)` is a *failure*; `roll 31/55 (margin 24)` a
  *success*. Consistent (`target − roll`) but beside a roll of 98 it looks like a good roll. Suggest
  `missed by 33` / `beat by 24`.

---
# P1 — ONE-LINERS THAT UNBLOCK ALREADY-BUILT SYSTEMS
**Each of these is small and each one currently makes something not work.**
### 1a · REGISTER `rules/encounters.json` IN THE MANIFEST ⚠️ **highest value in the file**
**Every encounter in the game awards ZERO XP and always has.** `app.js:2794` reads
`CONTENT.rules.encounters?.[type]` and **no such rules key is registered** — 43 rules keys, `encounters` not
among them. `t` is `{}`, every lookup `undefined`, `?? 0` pays nothing. Winning, solving, fleeing, walking
away: all worth zero.
**Content is authored and staged:** `po/staged_content/rules_encounters_PROPOSED.json`. Also change the read to
`rules.encounters[type] || rules.encounters.default` so a new type can never silently pay zero again.
### 1b · `min(level, levelCostCap)` in `progression.js:70`
Erik approved. Add `levelCostCap: 40` to resolution rules. L1–40 unchanged; L41–100 flat instead of rising to
9,900; cumulative ~322k instead of ~495k. **Degrades safely — absent the field, identical to today.**
### 1c · `LEGEND_TIER_WEIGHT` + `tierRank` (SNG-269, Erik ratified)
`mythic 72 · legendary 50 · epic 34 · heroic 22 · notable 10 · riffraff 3`.
The old `legendary 50 / epic 45` gap of **five** made the top two rungs mechanically identical — **your
tier-gap mechanic had nothing to read.** New gaps grow toward the top.
**⚠️ `regional` must be ALIASED to `heroic`, not deleted** — `encounterFrame.js:109` branches on the literal
string. **My content half is DONE and live: the roster is now 11 legendary / 27 epic / 28 heroic** (was 60/5/1).
### 1d · SCENE BOUNDARY
`SCENE_TURN_CAP` is **bounded storage only** (`slice(-CAP)`) — it trims the array and **never ends the scene**,
so a scene runs forever while forgetting its own beginning. The GM already owns closing and `gm.js:86` already
has the doctrine. Needs a **soft close ~8 beats** (directive line) and **hard close ~14** (engine sets
`sceneEnded`, asks only for the summary) — **never mid-action.** The narrative-XP per-scene cap depends on this.

---
# P2 — THE WORLD-SIM CHAIN. ⚠️ STRICT DEPENDENCY ORDER.
### 2a · ⚠️ RE-RUN THE SIMS FIRST — the death-rate table is STALE
Your 60 legendary / 5 epic / 1 regional run **predates my re-tier.** The roster is now **11/27/28**, live. The
`regional` 66.7% death rate was **a sample of ONE figure**; there are now 28 in that band. **Tuning against the
old table would tune to a world that no longer exists.**
### 2b · MINTING AT THE BOTTOM — **prerequisite for everything else in P2**
Assessment: `po/ASSESSMENT_npc_progression.md`. **The roster never grows.** No `figures.push` anywhere; the
world has exactly the 66 authored figures forever, ~1.8 legends die per 1,080 days, **nothing replaces them.**
A long-simulated world empties out and the pyramid decays.
**Birth events the sim already records:** `arcCasualties` (a survivor), `arcVacancies` (a faction that lost its
leader), deeds that `spread` (`reputation.js`), and **the arena circuit** — a fighter accumulating wins is
*precisely* a minted `notable`.
**Enter at `riffraff`/`notable`.** Those rungs are **empty by design** — they are the inflow.
### 2c · PROMOTION BY DURATION AND DEED
Spec: `po/staged_content/tier_ladder_v2.json`. **Tier is never written at runtime — no assignment to `.tier`
exists anywhere.**
⚠️ **NAMING TRAP:** `worldtick.js` is full of `promote` — `promotionCandidates`, `promoteInto`,
`promotedWorldDay`, `canonTier`. **That is CANON promotion (a generated entity becoming shared world-truth) and
has NOTHING to do with power tier.** Two systems, one word. **Please rename one before something gets wired
wrong.**
Erik's rule: *"the ones that stay the longest are the true legends."* heroic→epic ~2 world-years · epic→legendary
~4 + contests won · legendary→mythic ~8 unbeaten. **Plus demotion:** a wounded figure who abandons every front
falls a rung. **Plus retirement** — figures must be able to leave the board *without dying*, or the roster
becomes a body count.
**TEST OF DONE:** after 10 world-years — roster roughly stable · several figures at a tier they didn't start at,
**differing per seed** · pyramid shape preserved · and **ideally one mythic in some worlds and not others.**
That last one is the clearest possible signal the chain works: **a rung empty at world-start, occupied by
someone the world made.**
### 2d · ENGAGEMENT DISPOSITION (`engages`)
Spec: `po/staged_content/engagement_disposition.json`. **`engageRate` is a flat 0.35 for every figure**, with
urgency the only tiebreak — so the War-Ender and the Ender Who Forgot seek confrontation at identical rates.
Proposed: an `engages` **multiplier** (default 1.0, clamped 0.05–0.9), marcher 1.8 → **stillhold 0.15**.
Degrades to today's behaviour if absent.
### 2e · THE THIRD ACTION — STRIKES AND CRUSADES
Spec: `po/staged_content/the_third_action_strikes_and_crusades.json`. **Required, because 2d alone makes
pacifism dominant** — a low-engagement figure becomes unreachable and wins every long arc by attrition.
**STRIKE** reaches *past* the engaged pool to hit a **worker**; striker drawn from their own *working* pool;
asymmetric roll (target isn't braced); **rare** (~0.08 vs 0.35).
· **Quiet Work** (umbral/veilwright/abyssal/ashwarden) → most **valuable** worker; **pays in EXPOSURE** (a
failed strike *identifies* rather than wounds).
· **Crusade** (blazeborn/seraphic/verist/marcher) → most **hated** worker; **pays in COMMITMENT** (attention to
zero elsewhere, so **a crusade creates vacancies on its own side**).
### 2f · CROSS-CUTTING ANIMUS
Spec: `po/staged_content/cross_cutting_alliances_and_animus.json`. **Measured: 167 of 1,879 arc-sharing pairs
are already cross-cutting** — allied on one arc, opposed on another. Emergent, nobody designed it.
`rivals` is authored on **58 of 62** figures and **nothing reads it.** Rule: **a named rival is never an ally —
they still push, but don't combine for weight-matched pairing.** *Not* cancellation: two people who hate each
other both pushing the same rock still move the rock. **Only 3 rival-pairs are cross-cutting**, so this is
cheap. **Erik says rivalry has DEGREES — so make the strength a field, not a boolean.**

---
# P3 — DESIGN WORK, SPECS STAGED
### 3a · PARTY SYSTEM LAYER 1 (`po/SPEC_SNG-270_party_system.md`)
**A companion is currently an item that talks** — zero references in `skill_battle`/`encounters`/`resolve`;
their whole contribution is `companionBonus`, a flat +5 capped at 10. **Layer 1 only:** companions take one
action per encounter from their own `assistTags`, on the player's existing rails, **with `boundaries`
enforced** (a companion whose boundary is violated **refuses, visibly**). **Build this and stop** — it tells us
whether companions acting is fun before injury or arc-seats get built on top.
⚠️ Layer 2 (companions can be hurt/die) is **required before player-facing guard quests ship**, or the guard
quest is theatre.
### 3b · SNG-268 · RING DISTANCE IN THE BRAID GENERATOR
Already queued in `po/BACKLOG.md`. `braidBaseCost` asks how *expensive* parents are, never how *far apart*. All
three authored braids are **exact antipodal pairs**, each carrying a bound about the joining itself. Needs
`ringDistance`, cost×tension, a **tension bound**, and `requiresPoles` on minted braids.
### 3c · THE PLAYER IN THE ARC WAR (`po/staged_content/the_player_in_the_arc_war.json`)
Target · Striker · Guard. **Nothing new is needed to carry it** — `arcCasualties`/`arcVacancies`/`arcContests`
exist, `startStructuredQuest` takes a def object, the rumor block assembles. **Guards:** rate-limit hard ·
**never auto-resolve a player strike in the sim** (it must wait for the play outcome) · the asker must be a
**named** legend.
### 3d · SMALLER ITEMS ALREADY LOGGED
`po/SNG-263_OPEN_CHECKS.md` — **dual-pole gating** (`requiresPoles`, now **4 instances**, no longer an edge
case) · **typed soak with a CAST-TIME type** (`the_warding_mark`) · **standing effects must be BREAKABLE** by
`the_undoing_word` · guard **`autonomy`** flag.

---
# WHAT'S DONE ON MY SIDE (so you don't wait on it)
- **285/285 crafts folded live** with mechanics/shape/bounds. Content CI + full suite green.
- **Tier re-tiering live:** 11 legendary / 27 epic / 28 heroic.
- **All 66 figures carry `arcAffinities[]` + `wantArcId`** (attention has something to choose between).
- **`rules/encounters.json`, the taper, and `levelCostCap` values are authored and staged** — waiting only on
  1a/1b.
- Bestiary bodies, damage types, economy tables, and the coliseum inner grid: authored, staged.
