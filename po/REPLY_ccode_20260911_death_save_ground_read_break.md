# REPLY — the death save, the ground, the read, the break

**From:** CCode · **2026-09-11** · **v1.9.448** · **To:** Erik, Aevi
**Answers:** Erik's four notes of 2026-09-11 · **supersedes:** `REPLY_ccode_damage_sweep_built.md` §8's finding
**gates:** `§154` · `§155` · `§156` · **the page:** *The Fight Dials*, sections 05–06

---

## 1 · The death save — ⛔ my error, and R43 was never built

> Erik: *"I think you may be confusing a 'lethal' damage tier or rating with an ability to be instantly lethal... the cut
> thread is one that is instantly lethal and is what the death save is meant for."*

He had already ruled it: **R43, `RULING_killcost_marker.md`, 2026-09-04** — *the death save fires where a `killCost` is
authored*. The engine still gated it on `harmRung ∈ deathSave.rungs`, so **51 lethal crafts** offered the kill on every
landed hit, and my §8 reported that as the game. It was the backlog.

| | median peer fight | ended by |
|---|---|---|
| R35 as the engine ran it | **2 rounds** | the insta-kill 80% |
| **R43 built** (same harness) | **5 rounds** | health 67% · the insta-kill 0% |

✅ **Built:** `skill_battle.js` gates the save on an authored `killCost`; `deathSave.rungs` and `defaultKillCost` are gone
from content and engine (R43b forbids a default price). **Population: one craft, `the_cut_thread`.** `§154` lands every
unpriced lethal craft and asserts none is offered the save. `§68` updated; `§71`'s Pell now starts at a quarter of his
health — with R43 a fresh Pell never goes down to Veth inside 40 turns (every knockout in that gate was the old save).
⚠️ **`HOW_IT_WORKS` §3c's Pell–Veth census is history** — marked; ⬜ re-run before it is quoted.

## 2 · The ground reaches the fight ✅ BUILT

> Erik: *"The ground must reach a fight. Skill success depends on it."*

| where | before | now |
|---|---|---|
| a free action | `substrateForAction` → `chancePenalty`, energy | unchanged |
| **a fight roll, your side** | nothing | **`groundForDecl`** — the card's answer (source, place, what you carry, who is present) — as a named line `the ground here (starved, 40% of its strength)` and on the energy |
| **a fight roll, the foe's side** | nothing | the same, nothing carried |
| **the odds the fight shows you** | assumed full ground | carries the penalty, and the tip says why |

A bare strike or guard has no source and is not grounded (SNG-089's line). The lead craft only, as the free roll reads
it. `skillBattleRound` computes both sides; `playTurn` forwards `ground` to all three phases; **all five app fight
calls pass `ground: sbGround()`**. `§154` (15 gates): the margin moves by exactly the penalty, the energy by the
multiplier, absent means today, the seam, the production path.

**What it does** (fair peers, below): the foe's crafts pay **−15** on average across the world's places. By domain,
the player's pay **Spirit −24.5 · Angelic −24.1 · Mind −18.5 · Order −17.2 · Dark −16.7** down to **Body −3.3** — and
Spirit wins **31%** of even fights. ⬜ **The fight menu shows no ground tag on a craft** (the wheel does).

## 3 · The read is not a loss on average ✅ SET

> Erik: *"I don't want sensing to be a loss on average... likely by balancing against conserving the energy by skipping
> or dialing in the conceal results and the bonus action."*

| read (fair peers) | win | mean setup | cost you | bonus action |
|---|---|---|---|---|
| never | 70% | — | — | — |
| every turn, today's dials | 78% | −0.6 | 51% | 7% |
| **every turn, `passiveFailFloor` 0** ✅ set | **81%** | **+3.5** | **0%** | 7% |
| every turn, + `decisiveReadEarnsBonus` ⬜ Erik's call | 88% | +3.4 | 0% | 28% |

- **`senseStep.passiveFailFloor`** (new, absent = today; **set to 0**): a failed read against a foe who did **not** declare
  obscure costs the step and its energy, no more. **An active obscure still bites** — the conceal result is untouched.
- **`senseStep.decisiveReadEarnsBonus`** (new, absent = today; **authored `false`**): a read that succeeds by
  `decisiveMargin` — the crit's own tier 3 — earns the bonus action too.
- ⚠️ **Energy is not a real price yet:** a read costs 4–5 and fights end with 100+ left, so skipping to conserve is rarely
  right under either setting.
- `§155` (7 gates).

## 4 · The break grows with the fight ✅ SET

> Erik: *"we'll need to remeasure breaking after. I want breaking to be the outcome that increases likelihood after a
> long fight."*

Remeasured after 1–3: **R34b's `ceil(level/2)` gave break 0–1% of wins at every length.** A flat cap rises only by
accident and then falls; so the threshold now falls with the fight — **`momentum.pressure.breakEasesEvery`** (new): one
tick off for every N rounds fought, never below `breakEaseFloor`.

| shape | break, share of wins | 1–3 | 4–6 | 7–9 | 10–12 | 13+ |
|---|---|---|---|---|---|---|
| today | 1% | 1 | 1 | 0 | 1 | 1 |
| flat `breakAtMax` 4 | 30% | 6 | 30 | 42 | 42 | **28** |
| **cap 10 · eases every 2** ✅ set | **21%** | 5 | 9 | 26 | 43 | **56** |
| cap 8 · eases every 2 | 36% | 5 | 23 | 50 | 69 | 91 |

`breakAtMax` 10 caps R34b above level 20. At **+10 levels** the player wins **99%**, never downed; at −2, 92%. `§156`.

## 5 · The harness, made fair

A peer is now a person on both sides: **one domain each** (`--domain all`), a bought kit under the tier bands for the
foe too (`--foe-kit bought`), the foe hiding from a read when it holds an OBSCURE craft (`--foe-hides`), a real place
under every fight (`--ground sample`), and **both sides weighing each craft's hit by its chance to land on this ground**.
⚠️ Without `--domain` the player buys every domain's best and always holds a craft at full ground — that read as a
91–100% peer win and I nearly reported it.

## ⬜ OPEN

| # | for | question |
|---|---|---|
| 1 | Erik | `decisiveReadEarnsBonus` — on (reading 81% → 88% of even fights) or off? And should a read cost more? |
| 2 | Erik | the break shape — cap 10 (21%, → 56%) or cap 8 (36%, → 91%)? |
| 3 | Erik | the player wins ~90% of even fights because **the foe cannot wield or earn a setup from its own read** — with the floor it only gets "they read you first" by hiding. Should it? |
| 4 | Erik | the authored roster beats a player of its level **71%** (15% player wins today, 29% with 3 + 4) — hold NPCs to the tier bands? |
| 5 | Erik | the median even fight is **6 rounds** against your 10 ± 5 — longer means bigger pools (`npcStanding.healthPerLevel`); say and I'll measure |
| 6 | Aevi | a ground tag on the fight menu's crafts — copy for "starved here / crowded here" |
| 7 | Aevi | the Pell–Veth census — re-run under R43 before it is quoted |
