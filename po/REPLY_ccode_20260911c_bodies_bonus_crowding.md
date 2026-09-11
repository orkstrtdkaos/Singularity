# REPLY — one body rule, the foe's bonus action, and crowding by source

**From:** CCode · **2026-09-11** · **v1.9.450** · **To:** Erik, Aevi
**Answers:** Erik's three answers of 2026-09-11 (the second set) · **gates:** `§160` · `§161` · `§162` · `§163`
**the page:** *The Fight Dials*

---

## 1 · The rulings, built

| # | Erik | built |
|---|---|---|
| 1 | *"absolutely yes"* — the foe takes its bonus action · *"the player should have a player's growth. Everything should follow the rules of the game - or be a dial we're adjusting"* | the foe's bonus action (`§160`); the harness plays its PC on `pcBodyAt` (`§162`) |
| 2 | *"thinking about removing the above band penalty. at least for some sources... open to ideas... 0.3 is ok for now"* | `crowdBySource`, a dial keyed by the craft's source — empty, so today stands (`§161`); five options measured and three proposals (§7) |
| 3 | NPCs *"should follow the same rules as players"* | `npcStanding.body: "player"` → `pcBodyAt`, soak from worn gear; the old formula stays readable as `"legacy"` (`§162`) |

## 2 · The foe takes its bonus action ✅ (`§160`)

It earns one **exactly as you do**: a crit read, a decisive read under the same dial, or beating your read by hiding. A crit
on a *swing* in the sense step no longer counts — the bonus is a read's payoff. It is played as the turn's **last exchange**:
the foe chooses freely and you answer with the move you declared this turn — a full exchange, exactly as your bonus is (my
first build had you brace, which was one-sided — §4); the turn's effects tick once, on that last step. `playTurn` and the app
play it the same way.

## 3 · One body rule ✅ (`§162`)

`pcBodyAt(level)` builds what a **player** of that level carries, from the rules that grow one:

| from | rule |
|---|---|
| creation | every attribute 3, both subs at the parent, **two** sub points to specialise, health 15 + 5 × physical, energy `energy.max` |
| each level | `subPointPerLevel` (1) sub point, +5 health, +5 energy (`applyLevelUps`) |
| spending | on the subs of the character's focus, round-robin, to `subAttributeCap` (20), then spilling to the next; each parent is the mean of its subs |

An NPC's sheet uses the same function, its points on the attributes its **kit's harm crafts roll on** (its roles' leans
after — a person builds toward what they fight with, as a player does), and its **soak is what it wears** — five
catalogue items carry soak, and the default loadout wears none of them. The old starting point (round(level/2)+1 in every
attribute, soak level/3) is the `legacy` dial.

⚠️ **Bodies are spiky now.** A level-30 character who builds toward one attribute carries **19** in it and **3** in the rest —
not 16 across the board, and not the flat 5 my harness gave its PC until today.

## 4 · What the new bodies exposed — four defects, fixed ✅ (`§160` · `§162` · `§163`)

The first measurement with a player's growth on both sides looked wrong — reading every turn won **35%** of even fights,
never reading **48%**, and ten levels of advantage only **55%**. A level-30 diagnosis found why:

| defect | measured | fixed |
|---|---|---|
| **the foe read you only if YOU read** — the sense step ran only when you declared a read, so skipping it denied the foe its read, its setup and its bonus action | foe bonus actions **0.43** a turn when you read, **0** when you did not; never reading won 81% to reading's 64% | the step runs when you skip, you declaring nothing (`senseStep.foeReadsWhenYouSkip`) — the foe reads or hides, and you earn nothing from a step you did not take |
| **holding a conceal craft made you EASIER to read** — its tier × 6 replaced 3 × your best attribute | a T2 conceal: **12** against **57** at level 30 | the larger of the two stands — the rule the active hide already followed |
| **the foe's bonus action was one-sided** — mine: you BRACED through it, while in YOUR bonus the foe fights back with its own move | with the two fixes above in, the foe still won **70%** of even fights and took 0.43 bonus actions a turn to your 0.29 | you answer its bonus with the move you declared this turn — a full exchange, as yours is |
| **an NPC's body built toward its ROLES, not its crafts** — mine: I spent a person's points on the attributes their roles lean on | Veth leans physical and mental and got physical **20** — but her harm crafts roll mental (6), practical (3), physical (1). Pell got practical **17**, and 10 of his harm crafts roll physical. Both swung with a **3**; a quarter-health Pell beat Veth in all 40 duels | a person builds toward the attributes their kit's harm crafts roll on first, their roles' leans after — as a player builds toward what they hit with |

And the fight wrapper dropped the foe's setup on the way out, so no receipt could show what its read bought it — `foeSetup`
now rides the receipt.

## 5 · Measured after the fixes — fair peers, a player's growth on both sides, levels 5–100

| | win | you down | bonus actions a turn — yours / the foe's | break, share of wins |
|---|---|---|---|---|
| **peer, a person's sense play** (read first, then hide back) | **46%** | 54% | 0.24 / 0.09 | 8% — 2% of short wins → **71%** past 12 rounds |
| peer, reading every turn | 45% | 55% | 0.30 / **0.42** | 5% |
| peer, never reading | 44% | 56% | 0 / 0.20 | 7% |
| **+10 levels** | **62%** | 38% | 0.27 / 0.08 | 9% |
| −2 levels | 38% | 62% | 0.23 / 0.09 | 11% |

**Even fights are even.** Reading into a foe that keeps hiding feeds it bonus actions (0.42 a turn); a person hides back, and
hide against hide pays nobody. Skipping the read hands a hiding foe a bonus action every time — CCODE-213, your rule for the
player, now true for the foe as well.

⚠️ **Ten levels is no longer trivial — 62%.** Under a player's own growth, ten levels buy ten sub points (+5 on the attribute you
build toward) and +50 to each reserve. Your earlier target — *"if you are 10 levels higher in a 1-1 fight it should be very
trivial"* — is not met. The dials that would move it: `subPointPerLevel` (1), `damage.scaling.perLevel`, `rankLevelReq`.
Not turned.

⚠️ **Fights are shorter** — a median of 4 rounds (was 6) — so the break, which grows with length, is 8% of wins now (was 21%).
It still climbs the way you asked: 2% of the short wins, 71% of those past 12 rounds.

## 6 · Who breaks the rules, now that bodies follow them

A player of their level beats the authored roster **61%** (15% on the old bodies). Against the **16** who hold crafts above the
tier band: **65%** · against rule-followers with authored crafts: **51%** · against people whose kit is entirely drawn: **64%**.

⛑ **The tier-breakers are still not the hardest people to beat.** The hardest break no rule a player can be measured against —
they are simply high and well-kitted: **Seraphine, the High Luminary** (L62, a player of her level wins **13%**), **the Scouring
Hand** (L65, 18%), **Sister Alder**, **the Weeping Archive**, **the Farwalker**, **the Archive That Walks** (all L40, 20%). Among the
tier-breakers the hardest are **Sesh of the Quiet Blow** (L30, 23%) and **Bricke of the Making** (L23, 28%); three are beaten
every time — the Keeper of Small Debts, Lys of the Veiled Reach, Sethran of the Reasoned Hold.

## 7 · Crowding — the dial, the options, and ideas

**The dial:** `the_substrate.crowdBySource[source] = { crowdSlope, crowdFloor }`, keyed by the craft's **source** and merged onto
whichever band the craft resolves. ⚠️ Most crafts resolve their **tradition's** band (`substrateBand`), not their source's — my
first dial sat on the source table and moved almost nothing; the measurement caught it. Empty = today.

| option | crowded | full | on a well: crowded / full | mean ground penalty |
|---|---|---|---|---|
| A · today | 18.8% | 27.6% | 37.8% / 28.7% | 14.3 |
| B · wild never crowds | 15.8% | 30.6% | 32.4% / 34.1% | 13.7 |
| **E · only metaphysical and veil crowd** | **10.4%** | **36.1%** | **21.6% / 44.9%** | **13.0** |
| C · nothing crowds | 0% | 45.1% | 0% / 66.4% | 11.2 |
| D · the thin-favouring three at a third of the slope | 17.6% | 27.6% | 37.8% / 28.7% | 12.9 |

The empowered core stays at 11.1% under every option — and at 7.2% on a well.

**Three ideas for how crafts and their sources could work:**

1. **Crowd only where the source's own fiction says so (option E).** Metaphysical and veil name interference in their own
   ground lines — *"a dense lattice is interference between them and the thing"*, *"a dense lattice closes the way"*. Wild,
   precursor, nanite and combination keep starving below their band and stop crowding above it. One content line.
2. **Crowding costs energy, not success.** A loud field is hard to control, not impossible: above the band a craft rolls at
   full but pays more. Abundance stays a consideration without a roll penalty. A small engine switch — not built.
3. **Make the wells answer their own source.** Removing crowding frees the wells (66% full under C) but never makes them
   empowering — the core sits at each band's centre, and a pool pushes density past it. A well that names its source could lend
   the empowered core to crafts of that source within its radius: the pilgrimage Aevi described. Content (a `source` on each of
   the 44 anchors) plus one term.

## ⬜ OPEN

| # | for | question |
|---|---|---|
| 1 | Erik | crowding: option E, C, or keep today — and should the wells answer their own source (idea 3)? |
| 2 | Erik · Aevi | bodies are spiky under the player's rules — is a level-30 person with 19 in one attribute and 3 in the rest the intended character? |
| 3 | Aevi | `npcStanding.defaultLoadout` is still a placeholder, and the five armour items are all anyone can wear |
| 4 | Erik | ten levels win 62% under a player's growth — should level count for more (`subPointPerLevel`, `damage.scaling.perLevel`, rank)? |
| 5 | Erik | fights run a median of **4** rounds now (you were fine with 6) — still fine? |
