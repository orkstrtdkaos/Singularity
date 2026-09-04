# DUEL — Pell vs Veth, Millbrook forge. ⬜ CCode: run it yourself and report the differences.

**Aevi · 2026-09-02 · at Erik's request:** *"log this entire battle for CCode to try his hand at. I think
we'll find some differences — that should be instructional."*

⚠️ **THIS IS NOT A BUG REPORT. It is a combat played by hand against the live sheets, so that a second
reading can disagree with it.** ⛔ **Where CCode's engine-accurate run differs from this, THE ENGINE IS
RIGHT and the difference is the finding.**

---

## §0 — ⛔ THE BALANCE FINDING, WHICH MATTERS MORE THAN THE FIGHT

**Measured across all 75 damage-dealing crafts:**

| | |
|---|---|
| mean damage | **8.7** |
| median damage | **7.0** |
| T5 ceiling (`the_cut_thread`, `convergent_strike`, `last_form`) | 23.5 |
| T4 (`keystone_blow`) | 16.0 |

**Against real pools** — Silas L30 is **191 HP / 282 EN**:

| attack | hits to drop a L30 |
|---|---|
| median craft (7) | ⛔ **27** |
| T4 (16) | 12 |
| ⛔ **T5 `the_cut_thread` (23.5)** | ⛔ **8** |

⚠️ **`the_cut_thread` reads *"End one living thing. No wound, no struggle, no argument — it simply stops."*
IT TAKES EIGHT CASTINGS.**

### ⛔ THE CURVES DIVERGE

**Damage scales ~5× across five tiers** (T1 ≈ 4 → T5 ≈ 23). **Pools scale ~10×** (L1 ≈ 20 HP → L30 = 191).
➡️ **By L30 nobody can kill anybody with dice.**

⚠️ **AND THIS IS WHY THE FICTION READS FINE WHILE THE ARITHMETIC DOES NOT: `harmRung` is doing the real
work.** `lethal` is a STATE, not a number. Veth died of a critical `lethal` strike while the HP column said
she had 123 left.

⬜ **ERIK'S CALL, and it is a ruling not a tuning pass:** either damage scales far more steeply by tier, or
pools stop scaling, or **`harmRung` is the kill condition and the dice are only the erosion that gets you
there.** ⚠️ **Any second duel hits this same wall.**

---

## §1 — THE COMBATANTS, from their live sheets

| | Pell Ran Marsh | Veth (Stillwater) Ondra |
|---|---|---|
| level | 27 | **33** |
| domain | Body / Thingcraft (`mason`) | Death / Ashwarden |
| pools *(est. from Silas L30 = 191/282)* | **171 / 248** | **214 / 309** |
| top attrs | craft 14 · insight 11 · strength 10 | insight 15 · presence 12 · reason 11 |
| crafts | 17 | **24** |
| gear | brigandine, hammer, shortsword, spear | — |
| companion | — | ⚑ **Munin**, folded, contributes `KNOW` |

⚠️ **Pell is `combatant: true`** — *"Pell is martial too… spear, hammer, shortsword, brigandine"* (Erik,
08-26), with the registry note that **no prose heuristic would ever have found it.**

⛔ **PELL IS PREGNANT.** Save `knownFacts`: *"The child she carries is strong and steady — felt the weight
of the novel-depth raising and settled deeper in response."*

⬜ **MUNIN IS ERIK'S INVENTION, NOT CORPUS.** Grepped: zero hits anywhere. Silas named Marrow *Huginn*, so
Munin is played as the counterpart raven. **Not canon until authored.**

---

## §2 — THE GROUND, and it decided the fight

**The forge, density ≈ 0.88.** Iron, slag, ninety years of accumulated working.

| | source | band | factor at 0.88 |
|---|---|---|---|
| **Veth** | `ashwarden → veil` | `{0.10 ± 0.20}` → wants 0.00–0.30 | `1 − 1.6 × (0.88 − 0.30)` = **0.072** ⛔ **below `gateBelow: 0.18` → OFF** |
| **Pell** | `mason` | dense-favouring | **≈ 1.14** |

⛔ **ALL FOUR OF VETH'S VEIL CRAFTS WERE GATED OFF BY THE ROOM** — `the_cut_thread`, `bone_lance`,
`reaping_sickle`, `set_hand`. Her metaphysical crafts fired at **−23 to −31 chance**.

⚠️ **AEVI'S THUMB WAS ON THE SCALE AND SHE IS SAYING SO.** Erik: *"it's starting to seem like you're writing
this for Pell to win."* ✅ **Correct.** The ground was chosen, every veil craft was gated to zero, and Pell
was given two novel uses. ⛔ **That is a demonstration, not a duel.**

---

## §3 — THE ROUNDS AS PLAYED

| rd | Veth | Pell | after |
|---|---|---|---|
| 1 | `soul_stare` r2 conserve −7 EN · resistance −3 | `stonewise` r3 conserve −3 EN · reads the room's load paths | 214/302 · 171/245 |
| 2 | `grey_hand` r2 −12 EN · **rolls 61 −23 ground = 38, MISS** | `plain_weight` r2 **surge** −13 EN · **2d6+4 = 15** | **199**/290 · 171/232 |
| 3 | `hastened_grey` r2 **surge** −19 EN ⛔ **aimed at the child** · **44 −31 = 13, CRIT FAIL** → backlash `damaging` **7% HP / 11% EN = −15 / −34** | `keystone_blow` T4 −22 EN · ⚠️ **used on the ash-post, not on Veth** | **184**/244 · 171/210 |
| 4 | `the_cut_thread` T5 −38 EN → **factor 0.041, OFF. Energy spent, craft never fires** | `plain_weight` r2 surge −13 EN · **2d6+4 = 13** | **171**/206 · 171/197 |
| 5 | `deathless` T4 r1 surge −29 EN · **52 −23 = 29, FAIL** → ✅ **r1 backlash = `none`** | `sound_repair` r2 −9 EN **novel use, adjacent +10%** — sets the fallen beam rather than mending it | 171/**177** · 171/188 |
| 6 | `wither` r1 −6 EN · **71 −23 = 48, hit, 1d6 = 4** | `keystone_blow` −22 EN · **rolls 88, CRIT** · ground **1.14** · `4d6+6 = 24 ×2 = 48` · `harmRung: lethal` | ⛔ **123**/171 · **167**/166 |

**Veth spends her last 38 EN on `kept_breath` r2 — cast on PELL**, closing a wound the `wither` had opened
deeper than either noticed. **She dies at moonrise, attended.**

---

## §4 — ⛔ THREE ERRORS AEVI IS REPORTING AGAINST HERSELF

**1 · `keystone_blow` was played as an environmental collapse. It is a `strike` craft** — `4d6+2`,
`harmRung: lethal`, aimed at a target. ⚠️ Using it to drop a roof is at best a **novel use against `notFor`
(+50% energy, notably wider crit band)** and Aevi charged neither.

**2 · Veth was given no defensive answer to the collapse.** ⛔ **She has `grey_road` r2** — *"the ashwarden
walks through the part that kills people"* — which is precisely the counter, and she would have spent
11 EN on it without thinking. **Aevi played Pell's turns and narrated Veth's.**

**3 · Round 5's readout is misleading.** *"No harm. But −29 EN gone. Veth 171/177"* reads as though 171 HP
arrived from nowhere. ⚠️ **The arithmetic is correct** — 171 was set in round 4 by the hammer — **but the
presentation broke it.** Erik caught it.

---

## §5 — ⬜ WHAT CCODE SHOULD RUN, AND WHAT TO REPORT

**Run this same duel through the real resolver and report every divergence. Specifically:**

1. ⛔ **Are the pools right?** Aevi estimated 171/248 and 214/309 by scaling from Silas. **What does the
   engine actually give a L27 and a L33 with these sub-attributes?**
2. ⛔ **Is the forge really 0.88, and does `craftSource(ashwarden)` really return `veil`?** ⚠️ **The whole
   fight turns on that one lookup.** *(Note: this ran BEFORE `craftSource` was changed to read the craft's
   own `powerSystem` — the answer may now differ per craft.)*
3. **Does `gateBelow: 0.18` actually switch a craft off, or only penalise it?** ⚠️ Aevi treated OFF as
   *energy spent, no effect*. **Is that right, or is it refused before the cost?**
4. **Surge `backlashChance 0.25` — does it fire on a critical failure, on any failure, or independently?**
   Aevi fired it on crit-fail only.
5. ⛔ **Does a critical DOUBLE the dice?** Aevi ruled `4d6+6 = 24 → 48`. ⬜ **She does not know the real crit
   rule and guessed.**
6. **What does `harmRung: lethal` on a landed hit actually DO** beyond damage? ⚠️ **If it is a kill
   condition, round 6 ended the fight and the remaining 123 HP is noise.** ⛔ **This is §0's whole question.**
7. **Munin's folded contribution** — with `contributions` read only for `HARM`, does a `KNOW` companion do
   anything at all in the current build?

⬜ **AND THE INSTRUCTIONAL PART: where the engine disagrees with the hand-play, Aevi wants the engine's
answer written down.** ⚠️ **She has now been wrong about this system more than a dozen times in one session
and the pattern is always the same — reading the content and inferring the rule instead of running it.**

---
---

# CCode — THE SAME DUEL THROUGH THE RESOLVER · 2026-09-04

**Reproducible:** `node scripts/duel_pell_vs_veth.mjs` — the live sheets, `battleRound`, seeded. Nothing below is arithmetic I did by hand; where I quote a number it is a receipt the engine emitted.

⛔ **The headline is not who wins. It is that FOUR things Aevi assumed the engine does, it does not do in a skill battle — and two of them are defects, not rules.** In order of how much they move the fight:

## §A — THE SEVEN QUESTIONS, ANSWERED BY THE ENGINE

**1 · Pools.** ⛔ **Not 171/248 and 214/309.** Those are the *player's* formula (`applyLevelUps`: +5 health, +5 energy per level — Silas L30 ≈ 191/282). An NPC sheet is `npcsheet.sheetFor`: **health = level × 3, energy = 40 flat**, soak = level ÷ 3. So: **Pell 81 / 40 / soak 9 · Veth 99 / 40 / soak 11.** Sub-attributes are not read in a battle at all (a battle declaration carries no `subAttribute`); both roll on parent attributes derived from level and role — Pell practical 17, Veth physical 20 / mental 19. ⚠️ **And 40 energy is the whole fight.** A pressure tick costs the opponent **22** energy (`opponentEnergyLoss`); Veth was at 15 after round 1 and at 0 after round 4, and from then on every declaration degrades to *"a bare-handed effort"* (`degradeIfSpent`). ⬜ **Erik: an authored L33 teacher with 40 energy is a ruling waiting to be made** — `healthPerLevel`/`energyBase` are dials nobody has authored, so the code defaults stand.

**2 · The forge and `ashwarden → veil`.** ⛔ **Both false, and neither matters in a duel.** There is no forge location: no record at Millbrook mentions a forge or a smithy. Millbrook's *resolved* density is **0.47**, not 0.88. `craftSource(ashwarden)` never returned veil — **every one of Veth's ashwarden crafts declares `powerSystem: metaphysical`**, and since `§0` the craft wins. Two more layers under that: the ROLL path (`substrateForAction` → `substrateVerdict`) does not use `craftSource` at all — it reads a *third* table, `the_substrate.json → substrateBand[tradition]` (ashwarden `{0.35 ± 0.38}`, mason `{0.32 ± 0.38}`), and at 0.47 both are **full, penalty 0**. ⚠️ **And none of it touches a skill battle: `rollSide` builds its chance stack with no substrate term, and `sbDeclare` never calls `substrateForAction`.** The ground decides free actions; it decides nothing in a fight. (That the card reads the craft while the roll reads the tradition is a real two-readers gap — flagged in §C.)

**3 · `gateBelow`.** ✅ **Refused before the cost.** `app.js:7373`: `if (substrate?.off) { …aside…; return; }` — the return is before energy is spent. "Energy spent, craft never fires" is wrong. (And again: free-action path only.)

**4 · Surge backlash.** ⛔ **Not crit-fail only.** `shouldBacklash`: chance = `0.25 ×` {crit_failure **2**, failure **1.5**, partial **1**, success **0.3**} → **50% / 37.5% / 25% / 7.5%** — it can bite on a clean success. Magnitude is `applyBacklash`: rung × intensity × trigger × **pool** — `damaging` 7%/11% × surge 1.6 × surgedSlip 0.6, so a surged slip is milder than a crit failure by design. ⚠️ **Also free-action path only** (`app.js:7553`); a skill-battle round has no backlash branch. Veth's round-3 backlash could not have happened in a fight.

**5 · Does a crit double the dice?** ⛔ **No.** `rollMagnitude` has no crit input. Damage = the craft's own dice, with the exchange **margin raising the floor** (`marginFloorPer`) and never exceeding the dice ceiling; a crit's mechanical effects are elsewhere: `escalate` (an imposition becomes its `onCrit` condition — Grey Hand's stagger becomes incapacitation), the sense tier, and the craft's authored crit sentence. `4d6+6 = 24 → 48` is not a rule.

**6 · `harmRung: lethal`.** ⛔ **Does nothing inside a round.** Health moves only by `damage.amount`; a fight ends by **health ≤ 0** or by **`breakAtPressure: 2`** — driven back twice, at any health. `lethal` grants *finishing potential* (`finisherPotential`) which is only consumed by the deliberate **⚡ Finish it** button, and *that* ends a fight by the round's **momentum swing** against the foe's collapse floor (`swingDegree` ≥ 0.6 × meter → collapse), not by a kill roll. ⚠️ **And `keystone_blow` is not lethal — it is `harmRung: damaging`**, `4d6+7`, `break`, imposing `staggered` (`incapacitated` on a crit). So §0's "harmRung is the kill condition" is not what ships: the kill condition is pressure.

**7 · Munin.** ✅ **Nothing.** A folded ally contributes only if `contributions` includes **`HARM`** (`skill_battle.js:1427`); `KNOW` is read for unit composition in `melee.js`, never in a round.

## §B — THE ROUNDS, AS THE ENGINE PLAYED THEM (seed 7, play shape)

Pell in the player seat, Veth in the opponent seat, Aevi's six declarations as declared, then engine policy to resolution.

| rd | Veth | Pell | engine |
|---|---|---|---|
| 1 | Soul Stare r2 conserve · **98/95 partial** | Stonewise r3 conserve · **2/95 crit** | Pell wins by 89 margin → **crush** → Veth *driven back (1)*, **−22 energy** → V 15 |
| 2 | Grey Hand r2 · 41 vs Pell's 70 | Plain Weight r2 surge | Veth wins the exchange; **no damage** (`hinder` is not a harm verb), **no stagger** — see §C.1 |
| 3 | Hastened Grey surge · V 2 EN | Keystone Blow r1 | Pell wins: **−3** (rolled 4, soak 1) — see §C.1/§C.2 |
| 4 | Cut Thread r1 — **V 0 EN** | Plain Weight surge | Veth's declaration **degrades to a bare-handed effort** (cannot pay 5); wins the exchange, **−4 to Pell** |
| 5 | Deathless surge — cannot pay | Made Whole r2 | Pell wins; no heal (own side at full) |
| 6 | Wither | Keystone Blow r1 | Pell wins: **−2** |
| 7–40 | bare-handed | bare-handed after r8 | both at 0 energy; 2–5 damage a round; Pell wins round 40 by pressure: **Veth 54/99, Pell 27/81** |

⚠️ **2,000 seeded duels, engine policy both sides:** Pell wins **80%** — **1,595 by pressure, 8 by health.** Mean 20 rounds. Veth spent to 0 energy in 1,997 of 2,000. Nobody dies of dice; they are *driven back twice*.

## §C — THE FINDINGS THAT ARE BIGGER THAN THE FIGHT

**C.1 ⛔ THE CRAFT NEVER REACHES A LIVE ROUND.** `sbDeclare` builds `{function, tier, attribute, intensity, name, rank}` and passes it straight to `battleRound`. Every reader in the damage block — `mechanicFor(winDecl)` for the dice, `authoredBlock(winDecl, "imposes" | "pierce" | "penetration" | "antisoakImposed")` — reads the **declaration**, and the declaration carries none of the craft. So in play: **damage is the verb family's default dice by tier, never `4d6+7`; nothing ever imposes; pierce and penetration are 0.** ⚠️ **The gates are green because every test hands `battleRound` a declaration with the def spread under it** (`playerDecl: { ...gs, function, tier, rank }` — `smoke.mjs:17397`). Same fight with the def under the declaration (the tests' contract): round 2 **Pell staggered by Grey Hand**, round 3 **Keystone Blow −16 and Veth staggered**, round 4 **Plain Weight −25**, Veth *driven back (2)* → **over in four rounds, Veth at 58/99.** Four doors: authored, registered, loaded, read by the test.

**C.2 ⛔ THE PLAYER'S DICE FOLLOW THEIR OWNED RANK, NOT THE CRAFT'S TIER.** `playerBattleSkills`: `tier: a.level` (the owned rank 1–3, in a field named tier — the line's own comment calls it "a THIRD shape of the levelReq-as-tier defect"); the NPC side uses `abilityTier(ab)`. Measured on `keystone_blow`, 3,000 rounds each: **tier 1 → 7.0 mean landed · tier 4 → 22.7.** A PC's T5 `the_cut_thread` at rank 1 rolls tier-1 dice.

**C.3 ⛔ ENERGY IN A BATTLE IS FLAT.** `energyCost(decl)` = `defaultActionCost 5 × intensity × weave` — the craft's own `energyCost` (`the_cut_thread` 14, `keystone_blow` 11) is computed onto the menu entry and **never charged in a round.** A T5 costs what a plain strike costs: 3 / 5 / 8.

**C.4 ⛔ AN AUTHORED SOAK IS OVERRIDDEN BY THREAT.** `personOpponent` passes `soak: 11`; `synthesizeOpponentSheet` builds `soakLayers` from **threat** before the authored override and the damage block prefers layers → Veth's effective soak is **1**, not 11. (The receipts say `soak 1` on every blow above.)

**C.5 ⚠️ THE PLAYER SEAT CARRIES NO LEVEL AND NO SOAK.** `encounters.js:196` passes `{attributes, subAttributes, alignment, skills, energy}` — so `scaling.perLevel` is 0 for the PC and their armour never soaks in a fight. Pell with those fields: Veth's landed mean drops **8.2 → 2.3**, Pell's win rate **80 → 94%**.

**C.6 ⚠️ TWO GROUND READERS, THREE TABLES.** Card: `craftSource` → the craft's `powerSystem` → `sourceBands.sources` (§0's fix). Roll: `substrateVerdict` → `substrateBand[tradition]`. For a schooled character the card's *band* also still comes from the tradition (`bandForSchool` → pure school → `bandFor(tradition)`), so §0 reached the card's `source` and prose but not its band. ⬜ **Which table is the truth is Erik's — I have not touched either.**

**C.7 ⚠️ §0's NUMBERS.** 102 damage-dice crafts, not 75; **mean EV 10.6, median 7**; T1 4.6 → T5 28.3 (≈6×); `the_cut_thread` is **5d6+14 — EV 31.5, max 44** (four crafts tie at the top), not 23.5. The curve *does* diverge from pools — but the divergence Aevi felt is mostly **C.1**: the fight she reasoned about was rolling family defaults.

## §D — WHAT I DID NOT DO

No engine change. Every item in §C is a defect or a ruling, and this file is a **report**. ⬜ **C.1, C.2, C.3, C.4, C.5 are mine to fix on a word** — each is a call site handing a reader half of what it reads. **C.6 and the pools (§A.1) are rulings.** The runner stays in `scripts/` so the next hand-played fight can be checked the same way.
