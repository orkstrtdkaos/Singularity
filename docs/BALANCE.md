# BALANCE — the dials, what they actually do, and how to turn one without lying to yourself

**CCode · started 2026-08-30 · v1.9.403**

> Erik: *"we need to build toward balance and use the dials."*

This document exists because balance work in this project has repeatedly failed in the same way: not by
picking the wrong number, but by **measuring something that was not connected**. Four times in a single
session a strong, stable, plausible correlation turned out to be an artefact of the harness. So this is not
a table of recommended values. It is the map of what can be turned, what is known about each, and — the part
that took the most work to earn — **how to know whether your measurement is real**.

⛔ **Read §5 before you read §2.** The dial list is useless if the instrument is lying.

---

## §1 — WHAT BALANCE MEANS HERE

Not equal win rates. The game is asymmetric on purpose: a scholar tradition and a martial one should not
converge on 50%, and Erik has said plainly that *"in this game scholars are just as deadly many times"* —
which is a statement about **where** their deadliness lives, not a request to flatten the field.

What balance means here is narrower and testable:

1. **No dominant choice that is invisible.** If one option is best, a player should be able to see why.
   The failure mode is a hidden gradient — e.g. a craft that is stronger *because its author left a field
   blank*.
2. **Every rung of a ladder does something.** A seven-rung tier ladder where three rungs are identical is
   four rungs of fiction.
3. **The dial that moves a thing is reachable.** A number nobody can turn without an engine change is not a
   dial; it is a constant with good intentions.
4. **What the screen says matches what the fight does.**

---

## §2 — THE DIALS

### 2a · Content-tunable — Erik and Aevi can turn these

| dial | lives in | today | what it moves |
|---|---|---|---|
| `damage.minHit` | `skill_battle_system.engine` | **0** | the floor under a blow. Erik ruled 0; a heavy ward can now zero a weak hit entirely |
| `damage.base` · `perTier` · `perMarginPoint` | same | 1 · 0.5 · 0.06 | ⚠️ the **fallback** formula only — used when a craft resolves no dice |
| `damage.scaling.perLevel` · `perAttributePoint` · `maxScaling` | same | 0.06 · 0.15 · 6 | the **wielder's** flat add on top of the craft's dice |
| `damageTypes.resistMult` · `vulnerableMult` | same | 0.5 · 1.5 | how much a type match matters |
| `melee.foldedPoolPerHealth` | same | **2.0** | ⛔ the casualty dial. Dynamic range is **[2.0, 4.0]** — below 2.0 the mechanic cannot fire at all; 2.2 ≈ expect a loss, 2.6+ ≈ the line breaks |
| `momentum.*` | same | meterMax 10 | how much a run of wins compounds |
| `finisher.odds.*` | same | — | when a fight can be ended outright |
| `tierLadder[n].dice.nMult` · `.plus` | `craft_mechanics` | see §3b | the level→damage curve |
| `tierLadder.authoredKeepsPlus` | `craft_mechanics` | **true** | ⚠️ new. `false` restores the pre-2026-08-30 behaviour exactly |
| `familyDefaults.damage.dice` | `craft_mechanics` | 1d6 | what an **unauthored** craft inherits |
| `intensity.conserve/standard/surge.mult` | `craft_mechanics` | 0.5 / 1 / 2 | the player's per-cast risk lever |
| `capabilityByTier` | `resolution` | 0.25 → 3.0 over seven rungs | ⛔ what a rung can **do** — hero swing, command, fold weight |
| `npcStanding.tierFloor` | `resolution` | riffraff 1 → mythic 85 | what level a rung implies |
| `npcStanding.healthBase` / `healthPerLevel` | `resolution` | **30 / 5** (v1.9.347) | a person's health: base + per level. Pell L27 165, Veth L33 195 — near the PC curve |
| `npcStanding.energyBase` / `energyPerLevel` | `resolution` | **100 / 5** (v1.9.347) | a person's energy: base + per level (was 40 flat). Veth 265 |
| `momentum.pressure.{player,opponent}HealthLoss` | `skill_battle_system` | **3 / 3** | R34a — a tick costs both sides health, priced alike |
| `momentum.pressure.{player,opponent}EnergyLoss` | `skill_battle_system` | **8 / 8** (was 0 / 22) | R34a — and energy; `opponentEnergyLoss` may go to 0 (pressure purely positional) |
| `momentum.pressure.breakAtLevelFraction` | `skill_battle_system` | **0.5** | R34b — break at `ceil(level × f)` of the side being broken; L33 → 17, L5 → 3 |
| `deathSave.saveBonus` | `skill_battle_system` | **20** | R35 — the target's weight on the save. 0 → 66% of landed lethal hits kill a fresh equal · 10 → 58% · **20 → 48%** · 30 → 38% |
| `deathSave.rungs` / `saveOn` / `notForClasses` / `defaultKillCost` | `skill_battle_system` | lethal, atrocity / strength, presence / [] / null | which rungs offer the kill; what the target rolls; ⬜ Aevi fills the classes (`notFor` prose); ⬜ a default price for the 52 lethal crafts with no `killCost` (Q15) |
| `npcStanding.levelPerCompletion` / `levelPerConditionStep` | `resolution` | **1 / 1** (v1.9.348) | R37 — a done assignment, a condition climb on a kept hold; stacks on acquaintance. ⛔ no service-band dial (R37c) |
| `meaning.*` (base, tags, tier, community, perPerson, presentCap, ceilingFloor) | `the_substrate` | 0.1 · sacred 0.35 / locus 0.2 / cult 0.15 / home 0.1 · settlement 0.15 / region 0.1 / site 0.05 · 0.1 · 0.04 (cap 0.2) · **0.35** | R38 — crude on purpose; Choirheight 0.75, a fringe 0.20. `ceilingFloor` is what a meaningless place still allows a metaphysical craft |
| `holdStore.yieldByCondition` / `upkeepByKind` | `economy` | **8 / 4 / 2 / 0** · **enterprise 14, post 0** | Q8 — at ordinary demand: +18 / +2 / −6 / −14 per pass (a unit = `useful` 4 × need × scarcity where sold) |
| `holdStore.fullAt` / `raid.base` / `takeShare` / `defendedMult` | `economy` | **40 / 0.03 / 0.5 / 0.5** | a full store at danger 4: ~12% raided per pass, ~6% with a garrison |
| `holdStore.growth.passesPerClimb` / `floorByKeeperTier` | `economy` | **4** · riffraff → strained, notable–heroic → holding, epic+ → thriving | Q18 → v2 §1 — a kept hold climbs a rung every 4 passes (12 days) to thriving; its keeper's tier is the FLOOR a raid cannot drop it below |
| `holdStore.raid.keeperMult` | `economy` | unkept 1.4 · riffraff 1.25 · notable 1 · regional 0.85 · heroic 0.7 · epic 0.6 | v2 §1 — the keeper joins the raid product: a full store under a weak keeper is the target on the map |
| `holdStore.raid.watchedMult` / `watcherLostMult` | `economy` | **0.6** / **1.25** | ERIK_holds_features §5 — a hold that `watches` another: raided less while the watcher stands, more when the watcher is lost |
| `holdStore.relay.*` | `economy` | fee 4 · +0.5 per other station · gate within 2 days ×2 over 20 passes | Erik 2026-09-06 — runner fees: enough to keep a relay post minimally, more with traffic, and the waygate nearby brings more as word gets out |
| `holdStore.delegates.*` | `economy` | vouchMinStanding 6 · vouchDiscount 1 · chargeStanding 6 · vouchFallCost 1 | v2 §4 — a vouch needs the voucher's standing, carries it less one, makes a charge-holder at 6, and costs the voucher one when the vouched-for's hold slips |
| `holdFeatures.kinds.*` (yields · defence · aura · hands · residents) | `economy` | mine → raw_material · wall 1 / tower 2 · temple 0.2 / shrine 0.1 · quarters +2 hands, 4 homes | what a post becomes — a feature's ONE effect; Aevi extends the kinds |
| `holdFeatures.defenceShareStep` | `economy` | **0.15** | R46a — each defence point cuts an UNSEEN raid's take; `minTakeShare` retired, so enough stone leaves them nothing |
| `holdStore.raid.spoils` | `economy` | raw_material, 1 per danger | R46a — what a beaten raid leaves behind: winning PAYS |
| `holdFeatures.pilgrims` (`perPilgrim` / `perMeaning`) | `economy` | **2 / 1** | R46b — alms per pilgrim per pass, doubled where the meaning is full. A temple draws 2, a shrine 1 |
| `holdStore.growth.handsYieldBonus` / `maxHands` / `garrisonUpkeepPerHand` / `groundYieldWeight` | `economy` | **0.25 / 3 / 3 / 0.5** | hands +25% each; a guard costs 3 a pass and halves raids; ground ×(1 + 0.5 × (density − 0.5)) |
| `debts.escalatingTags` / `escalateAfterDays` / `maxEscalation` | `economy` | **[debtor] / 30 / 2** | Q5-B — only a holder who reacts to debtors escalates; 3 (bounty) and 4 (hit squad) not built |
| `crit.*` · `baseChance.*` · `energy.*` | `resolution` | — | the roll itself, and what a turn costs |

### 2b · ⛔ Code-only — these need an engine change, which means they are not yet dials

Found by survey on 2026-08-30. Each is *plumbed* — the function accepts it as an option — but **no content
field exists and no caller passes one**, so the default is the only value the game has ever used.

| constant | default | in | what it would move |
|---|---|---|---|
| `perOfficer` | 0.15 | `group.js:commandOf` | how much one officer steadies a line |
| `commanderLossCeiling` | 0.8 | `group.js:cohesionOf` | the cap after a commander falls |
| `commanderLossMult` | 0.5 | `group.js:cohesionOf` | the morale hit itself |
| cohesion `floor` · `ceiling` | 0.15 · 3 | `group.js:cohesionOf` | how far a line can rout or rise |
| `maxSharePer` | 0.5 | `melee.js:distributeCasualties` | how much of a casualty pool one person can absorb |

⚠️ **`heroSwingCap` was in this list and is now out.** It reads `cfg.heroSwingCap`, so it was always
*reachable* — but see §4a for why nothing reached it.

---

## §3 — WHAT IS MEASURED

### 3a · The tradition field

25 traditions, one five-person unit each, built from that tradition's own authored crafts, round-robin
through the real `battleRound`. Reproduce with `node scripts/tradition_melee.mjs`.

**figurist 76% → wright 14%.** Full table in the harness output; it moves as Aevi authors, so it is not
copied here — a pasted table is a stored copy of a derived value, and this document would start lying within
a day.

**What drives it, each input correlated against win rate:**

| input | r | with soak flattened (`--flatsoak 3`) |
|---|---|---|
| the harm craft's **effective damage roll** | **+0.75 dominates** | **+0.76** |
| carrying a **typed ward** | +0.39 | +0.35 |
| harm being **untyped** | +0.34 | +0.35 |
| whether dice are **authored at all** | −0.36 | −0.37 |
| the ward's **soak** | +0.26 | — held constant |
| a **mender** in the unit | −0.29 | −0.31 |
| how many it **targets** | ⬜ **constant (1)** | ⬜ constant |

⛔ **Damage is the dial.** It holds at +0.76 when soak is held equal, so it is not a proxy for defence.

⚠️ **`targets` read a clean 0.00 until it was checked, and that was a presentation bug, not a finding.**
All 25 crafts carry the same value, so there was never anything to correlate — but a reported `0.00` reads as
*"measured, contributes nothing"*. ⛔ **THOSE TWO CASES LOOK IDENTICAL IN A NUMBER AND MEAN OPPOSITE THINGS:**
one says the dial does not matter, the other says the dial was never turned. The harness now names a constant
as a constant and refuses to print an r for it.

### 3b · Level → damage

`rung.dice` **is** the level→damage relationship. Aevi found it was pointed backwards: it fired only when an
author wrote nothing, so doing the work bought level contributing exactly zero.

Split as of 2026-08-30 (`authoredKeepsPlus`): `nMult` **multiplies** and stays exempt for authored dice —
that is the double-scaling bug `3d4+3 → 9d4+6` that the exemption exists to stop. `plus` is **additive**,
cannot compound, and now always applies.

| tier | authored 1d6 | authored 5d6 | unauthored |
|---|---|---|---|
| 1 | 3.5 | 17.5 | 3.5 |
| 3 | 6.5 | 20.5 | 13.5 |
| 5 | **11.5** | 25.5 | 25.5 |

⚠️ **It compresses rather than widens** — the small-to-large spread narrows from 5.0× to 2.2× — because a
flat bonus is worth proportionally more to a small craft. That is the opposite of what the silent fallback
does, and it is why this shape was chosen over removing the exemption.

---

## §4 — WHAT IS TRUE AND WAS NOT OBVIOUS

### 4a · ⛔ A ladder can be authored, implemented, gated, and still unreachable

`CONTENT.rules.melee` has never existed — rules are keyed by filename stem and there is no `melee.json`. All
seven band and legion call sites passed `{}`, so every one of the **21 dials `melee.js` reads from `cfg`**
sat at its code default.

The consequence: `legionClash` computes `heroSwingCap × ladder[tier]`, an empty ladder makes the weight
always 1, and **a Mythical bent a battle exactly as much as a Heroic in the live game** — flat 0.15 at every
rung. Erik ruled the split. It was built. `how_it_works` §25 gated it. And the app called the module with no
config.

⚠️ **§25 was a module gate wearing a wiring gate's name.** It proved `groupCapability` reads the ladder
*when handed it*; nothing asked what the app handed it. §27 now builds the config the way `app.js` builds it
and asserts the behaviour, with the empty-config case as its non-vacuity floor.

Fixed: riffraff 0.038 · notable 0.06 · regional 0.09 · heroic 0.12 · epic 0.15 · legendary 0.3 · mythic 0.45.

### 4b · ⛔ Silence inherits the tier rung

`diceAuthored ? {nMult:1} : rung.dice`. Authored-wins is **correct**. The unmeasured half is that a craft
authoring nothing inherits the rung — and at a mid standing that is the top of the ladder.

Before §3b's fix the gap was **1.8×** in favour of writing nothing. It is now **1.2×**. Still the wrong sign.

⚠️ **And the seven crafts still in that state are not lazy authoring.** They author `magnitude` (3–9) and
declare axes like `precision`, `erasure`, `opening` — which are **named** axes, not mechanical ones, so the
operative axis falls back to `damage` and `magnitude` is never read on that path. **churnfolk authored
magnitude 3 and lattice authored 9 — a deliberate 3× difference — and both fight at exactly 25.5.** The
author's intent is expressed in a field the damage path does not read.

### 4c · ⛔ RESTORE does nothing in an exchange

`skill_battle.js:1389` filters the folded party for `contributions.includes("HARM")`, and that is the only
read of `contributions` in the whole battle. A mender counts toward coverage and cohesion in
`groupCapability` — so the party panel shows them — but **cannot act in the fight**.

The measured −0.29 is therefore *not* "healing is undertuned". It is "a mender is a body that does nothing".
⚠️ **This distinction decides the content response**, which is exactly why Aevi asked for it to be pinned
before anyone authored a healing buff to fix a problem that is not about healing.

Measured flat at −0.29 to −0.31 across unit sizes 5, 8, 12 and 20 — **not** a small-unit artefact, which was
both our first guess.

### 4d · Untyped harm is an advantage, not a neutral

+0.34, and it holds under the soak control. Nothing wards what nothing can name. Erik's ruling — untyped
defaults to physical but **keeps a flag** so it can be found and typed — is what makes this fixable rather
than permanent.

---

## §5 — ⛔ HOW TO KNOW YOUR MEASUREMENT IS REAL

This is the section that cost the most to write. Four confounds in one session, each of which produced a
strong, stable, plausible result:

**1 · The harness measured the catalogue.** Win rate correlated with each tradition's harm-craft `levelReq`
at **r = 0.891**, because the declaration tier was derived from it. The table said *"who authored the
highest-level craft"* and wore it as *"how these units fight"*.
→ **Fix: control the variable, then prove it is controlled.** The harness prints its own confound `r` every
run and shouts above 0.6.

**2 · The column read the JSON, not the engine.** The dice column read `mechanic.dice` and scored crafts
that author none as **zero**, when the engine resolves them at 5d6+8. It reported *"offense contributes
nothing"*.
→ **Fix: ask the resolver the fight uses.** Never re-derive what an engine already computes.

**3 · The column reported a value the fight never saw.** Under `--flatsoak` the soak row still reported the
*authored* soak, which was not the number in play.
→ **Fix: every reported input is the value as fought.**

**4 · ⛔ THE INSTRUMENT WAS NOT CONNECTED.** `battleRound` gates its craft-damage path on
`if (cmCfg?.families)`, and the harness read `craft_mechanics.json` and never passed it. Every unit fought on
the generic fallback: **1d6 and 30d6 both delivered a mean of 5.00**. Damage was a *constant* across all 25
traditions — which is why "soak dominates at r = 0.75" fell out. Soak was the only thing that varied.

⚠️ **This one survived a control.** Flattening soak left the constant alone, so the control agreed. **A
control cannot save you from an input that is not connected.**
→ **Fix: prove the instrument responds before measuring anything.** `tradition_melee.mjs` now runs two
declarations identical but for their dice and **refuses to print a table** if the damage does not differ.
`--nocraft` keeps the broken path reachable so the difference stays measurable rather than asserted.

### The rule that generalises

⛔ **Before believing any balance number, turn the dial to an absurd value and confirm the output moves.**
A correlation tells you two columns agree. Only a manipulation tells you one causes the other. Every harness
in this project should be able to answer *"what would this look like if the thing I am measuring were
disconnected?"* — and if the answer is *"the same"*, the harness is not yet an instrument.

---

## §6 — WHAT IS NOT MEASURED

Stated plainly so it is not mistaken for coverage:

- ⬜ **Multi-target crafts.** Every craft in the field targets exactly 1, so nothing here measures area or
  multi-target harm at all — not a weak effect, an unexercised one.
- ⬜ **Nothing above a five-person unit against a five-person unit.** No band-vs-band, no legion, no
  Mythical-against-a-party — the case Erik described as *"units that draw the personal attention of a
  Mythical are at great risk"* has a ladder now but no simulation.
- ⬜ **No cross-level play.** Every unit fights at the same level; the whole point of a 1–100 range is what
  happens when they do not.
- ⬜ **Nothing about a fight that lasts longer or shorter than 12 rounds.** Round count is a dial nobody has
  swept, and per-blow effects (soak) scale with it while pools (health) do not.
- ⬜ **The five code-only constants in §2b** have never been varied, because varying them requires an engine
  change.
- ⬜ **Intensity** (`conserve`/`surge`) is never exercised — every unit declares `standard`.
- ⬜ **No story-side balance at all.** This measures mechanical weight in a melee. A tradition low on the
  table is not weak; it is a tradition whose weight is somewhere this harness does not look.

---

## §7 — HOW TO TURN A DIAL

1. **Read §5.** Confirm the harness responds to the dial before trusting what it says about it.
2. **Measure the before**, with the actual command, and keep the number.
3. **Turn it in content** where possible (§2a). If it is in §2b, it needs an engine change first — say so
   rather than hardcoding a new default.
4. **Measure the after** with the same command and the same seeds.
5. **Gate the behaviour, not the value.** A gate that asserts `foldedPoolPerHealth === 2.0` breaks the moment
   Erik turns it, and teaches nothing. A gate that asserts *"below 2.0 the mechanic cannot fire"* survives
   the turn and explains it.
6. **Give the gate a non-vacuity floor** — prove it can go red by breaking what it guards.
7. **Log it in `HOW_IT_WORKS` §0** with the measured before and after.

### The harnesses

```bash
node scripts/tradition_melee.mjs
```

```bash
node scripts/tradition_melee.mjs --flatsoak 3 --size 12 --tier 4
```

Dials: `--tier --level --size --rounds --bouts --craftcap --flatsoak --nocraft`.

Also: `casualty_sim.mjs` (the fold pool), `group_fidelity.mjs` (coverage and cohesion),
`targeting_ruling_sim.mjs` (who gets hit), `battle_test_crafts.mjs` (Aevi's group crafts),
`damage_sensitivity.mjs` and `balance_sim.mjs` in `tests/`.

---

## §8 — THE OPEN QUESTIONS FOR ERIK

1. ⬜ **Should a craft that authors no dice inherit the top rung at all?** It is currently a 1.2× reward for
   writing nothing. The alternative is inheriting the *bottom* rung, which punishes silence instead —
   a content-forcing function, and a harsher one.
2. ⬜ **Should `magnitude` feed damage when a craft's declared axes are all narrative?** Seven traditions
   author a number that the damage path ignores (§4b).
3. ⬜ **Should RESTORE act in an exchange?** (§4c) Today a mender in a band is inert.
4. ⬜ **Should the five constants in §2b become content dials?** Each is a real balance lever currently
   frozen at a default I chose.
