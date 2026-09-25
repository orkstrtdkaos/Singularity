<!-- status: SNG-652 — Aevi's proposals on Erik's mockup notes; ⬜ CCode's opinion wanted on §10 before anything is built -->
# SPEC SNG-652: the working hold

**Aevi (PO) · 2026-09-25** · *Erik, after the SNG-651 mockup: "I'd like your ideas then we can get ccodes opinions as well."*

SNG-651 decided how the screen is laid out, and Erik liked it. This spec covers what it has to **say**:
- what the people at a hold are actually good for;
- how a hold grows;
- what every feature does;
- what the store is worth;
- how safe the place is.

The companion file is `po/staged_content/SNG-652_feature_catalog.json`: all 44 feature kinds, each with a category, a
"what it does" line and a flavour line.

**Governing rule:** every bonus shown on this screen is **composed by the engine from fields that already exist**,
with a "why" chip beside it, the way a band's contributions show. **No number is typed into prose.**

---

## §1 — WORDS FIRST (small, and they fix most of the confusion)

| today | becomes | why |
|---|---|---|
| **Per pass** | **Per pass ⓘ**. The ⓘ says: *"A pass is 72 hours of world time, about 3 days of real time. Once a pass, your holds work, grow, sell what you told them to, and may be raided."* | `ASSIGN_INTERVAL_HOURS = 72`; the world runs 1 day per real day |
| **Built** | **Features** | it includes what was already standing when you took the place |
| **Rooms** | **Feature spots** | a well, a wall or a mine is not a room |
| **"An approach"** | the power's name and what it wants: *"The Harvest Hand wants something from this ground — hear them out"* | "approach" is our internal word (SNG-634 C7). The player sees who is asking and for what |
| tab **Defence** | tab **Attack & Defense** | it now musters as well as holds (§8) |
| card **How it holds** | **Defensive features** | |
| card **Powers on this ground** | **Powers & influence** | |

## §2 — THE PEOPLE AT A HOLD: "HOW GOOD", NOT JUST "IS THERE ONE"

**Today,** a keeper does three things:
1. **Makes the hold kept.** This is a yes or no, and it gives the growth climb.
2. **Sets the floor the place won't drop below.** This is `keeperFloorFor`, by tier.
3. **Scales raid odds.** This is `raid.keeperMult`, by tier.

Tier comes from level, so a level-30 farmer and a level-30 sword keep a fortress identically. **Erik:** *"level
and abilities and skills should play a roll in HOW good a keeper is at certain things."*

**Proposal: keep the yes or no, and add a per-duty hand.** A hold has **duties**, and each duty reads from a craft
family that `contributionsOf` already returns:

| duty | reads families | what the bonus moves |
|---|---|---|
| **Production** | shape · sustain | yields of production features |
| **Craft** | shape · know | quality and level caps of craft facilities |
| **Trade** | influence · move | sale price of the store, route income |
| **Defence** | protect | stone's weight in a fight, and the condition floor |
| **Watch** | know · protect | detection chance (§7) |
| **Muster** | harm · protect | training speed, muster quality (§8) |
| **Care** | restore · sustain | housing, healing, residents' mood |
| **Meaning** | restore · influence | pilgrims and aura |
| **Transit** | move | relay, mounts, route speed |
| **Recruiting** | influence | recruits per pass (§5) |

**How strong one person is at a duty:**

`hand(person, duty) = tierWeight(level) × fit`

- **fit = 1.0** if the person's evidenced families include one of the duty's families;
- **fit = 0.6** if their **vocation** leans that way (see below) but nothing is evidenced;
- **fit = 0.3** otherwise, since anyone can sweep a floor.

**Vocation leanings, as a tiebreak and for a player's quick read:**
- **Keeper:** defence, care
- **Maker:** production, craft
- **Reader:** watch, craft
- **Edge:** muster, defence
- **Broker:** trade, recruiting
- **Walker:** transit, trade
- **Attendant:** meaning, care
- **Ender:** clearing ground (§4), defence

Abilities that name a duty add to it directly. A `steward`-type ability counts toward **every** duty's fit.

**What the player sees** on the People tab, per person, is a row of chips. For example:
*Production +18% · Craft +12% · Trade +4% — Maker, level 22, "shapes metal" (evidence)*.

Hovering a chip shows the sum. **The keeper's hand applies to every duty. A worker's hand applies only to the job
they're on.** Plain hands (unnamed) add a flat, small amount per head. That is the fold or band pattern Erik pointed
at: named people are read for what they do, and the unnamed are counted.

## §3 — ONE KEEPER, SEVERAL HOLDS: CAPACITY AND SPLIT ATTENTION

Erik is fine with one person keeping several holds, **with a limit that grows**.

- **Capacity** = `1 + floor(level / 15)`, **+1** for a steward-type ability.
  So Pell at level 22 can keep 2 holds, and at level 30 she could keep 3.
- **Attention split:** each kept hold gets her hand × `1 / (1 + 0.25 × (N − 1))`.
  So 2 holds give her 80% at each, and 3 give her 67%.
- The chip says so: *"Pell keeps 2 places — 80% of her hand here."*
- **Over capacity,** the most recently added hold counts as **unkept**, and the screen says *why*. This avoids a
  silent penalty.

## §4 — FEATURE SPOTS: SUBCAPS BY KIND, AND GROWING THEM BY HAND

**Total spots** stay on today's ladder: post 2 · steading 4 · hamlet 7 · village 11 · town 16 · keep 20 ·
fortress 25 · stronghold 32.

**The hold's kind splits those spots into category budgets**, plus a few *open* spots that take anything:

| hold leaning | defence + watch + muster | production + craft + economy | community + meaning + travel | open |
|---|---|---|---|---|
| **Martial** (post, keep, fortress, stronghold) | 45% | 20% | 15% | 20% |
| **Enterprise** | 15% | 50% | 15% | 20% |
| **Settlement** (steading → town) | 20% | 30% | 30% | 20% |
| **Sacred** (shrine-led) | 15% | 15% | 50% | 20% |

Budgets round down, and the remainder goes to open.

**Why:** you can't wall every spot of a trading town or forge every spot of a keep, but the open spots leave room for
a player's own idea of the place.

**Growing by hand, not by magic.** A new **job: Clear ground**. You assign workers (idle hands are the natural pick)
and pay a goods cost.
- Each pass, they make progress weighted by their hand at the **clearing** duty (Ender, Maker and plain hands are
  good at it).
- At 100%, the hold gains **+1 spot** in the budget you chose when you set the job.
- When cleared spots take a hold past its rung, **promotion** follows as it does today. The hold grows into the next
  size rather than being handed it.

It is also offered as a **Build option** ("Clear a new spot — N goods, ~M passes with these hands").

## §5 — RECRUITING, A JOB LIKE ANY OTHER

The player sets **a target:** *4 workers, 3 for the watch*.
- Whoever is assigned (the keeper by default, or anyone at the hold) works it each pass.
- The chance per pass of one recruit = their hand at **recruiting**, raised by the hold's **community** features, and
  slowed, but not stopped, once recruits would have to camp (§5a).
- Recruits arrive as **plain hands**: unnamed workers, or unnamed soldiers for the watch.
- Each pass the screen shows *"2 of 4 workers found · about 3 passes to go at this rate"*.
- Recruiting stops at the target, **and says so**.

### §5a — Camping: people don't need a bed to be there

> ⛔ **Erik, 2026-09-25:** *"Holds need to be able to accommodate people even if they don't have beds or rooms.
> People can camp. It's not the best situation, but it works until there are living quarters available."*

**Housing becomes a comfort line, not a cap.** Anyone past the hold's beds (`residents` from quarters, longhouse,
keeper's hut, barracks) **camps**. Nobody is refused, and nothing a player does is blocked by beds: not a keeper, a
recruit, a watch, or a band mustering.

**Camping costs something, and the screen says what:**
- **A camper's hand is worth less.** For example ×0.8 at their job, because tired people work worse.
- **Campers are exposed.** Each camper adds a little to what a raid can hurt, since there's no wall between them and
  the night.
- **Bad weather or a long camp** (several passes) can make someone ask to leave. This is a **Needs you** line, not a
  silent loss.
- **Recruiting slows** past the beds, because fewer people sign on to sleep in a field. It does not stop.

**The People tab shows it plainly:** *"Beds for 6 · 9 here · 3 camping (−20% at work)."* It also offers
**Build quarters** when there's a spot, and **Clear ground** (§4) when there isn't.

The SNG-650 band check that read *"beds for 5 — Stillwater's Trouble has quarters for 3"* becomes a warning instead of
a blocker: *"2 will camp."*

## §6 — STORE AND MONEY

**Each good in the store shows four things:**
1. **Sells here for:** the local price. It's the same price whether you sell it or the keeper does.
2. **On a trade route:** the best price among connected markets, minus the route cost and the road's risk.
3. **Makes into:** the recipes that take it, as links.
4. **Held / kept on site:** the stock policy.

> ⛔ **Erik, 2026-09-25, correcting me:** *"If you want the keeper to sell the stock it gets the local prices."*
> My first draft had a keeper selling at half price. That misread `keeperSells`, which is the **share of the store** a
> keeper moves in a pass (`handsSell` is the share hands move with no keeper). Neither is a price. A keeper sells at
> the local price, and the only difference from being there is speed: they move `keeperSells` of it per pass, where
> you in person can sell it all at once.

**Five ways the goods leave the hold,** all available from anywhere by sending word:

| way | who does it | price | speed and risk | engine |
|---|---|---|---|---|
| **Sell here** | you, in person | local | all at once | exists |
| **The keeper sells** | the keeper, or hands if unkept | local | `keeperSells` / `handsSell` share per pass, following the stock policy | exists (CCODE-469) |
| **The keeper sends a caravan** | the keeper picks carriers from the hold's people | the destination's price | takes days on the road; faces `roadDanger`; carriers are away from their jobs | `sendCaravan` exists. **New:** the keeper can send it without you, and the carriers come from the hold |
| **Hire a trade company** | a company from Your People or a power's roster | the destination's price, minus their cut (e.g. 15–25%) | they carry the road risk and bring their own guards; your people stay home | **new**: a hired caravan whose carriers are the company's |
| **Traders come to you** | visiting traders from other holds or local powers | barter or coin, at their prices | some passes, a trader arrives on their own; the keeper deals with them under your standing orders | **new**: see below |

**Visiting traders (new).** A hold with a market or a trading feature draws traders. So does a hold on a road, or one
whose store holds something a nearby power wants. Each pass there's a chance someone arrives:
- a caravan from another hold (yours or someone else's);
- a power's factor looking to buy or barter (the Harvest Hand's people want different things than the Wardens do);
- a travelling company.

They come with **wants and offers**, for example *"Wardens' factor: buys living stock at 7, offers cut stone in
barter."* The keeper takes the deal if it falls inside your standing orders (a floor price, and goods you've marked
never to sell), or holds it for you to decide as a **Needs you** item. Barter is the point: it's how a keep that makes
parts gets stone for its walls without a market town.

The **trading post** feature kind (new, economy category) raises the chance of traders coming and how many come.
A **market** already exists and adds a little. Powers' traders use the SNG-634 standing: warm powers come more often
and deal fairer.

**Selling from afar.** Everything in the table except "sell here" works by sending word to the keeper. Today the sell
button vanishes when you're away (SNG-651 §2).

**Stock policy.** Per good, or for the whole store, the player chooses:
- **keep all;**
- **keep up to N and sell the rest each pass;**
- **sell everything each pass.**

The keeper carries it out every pass.

**Raid-risk readout,** next to the policy:
*"At this stock, a raid would likely take about 38 crystal of goods — about 1 raid in 25 passes gets through."*

Expected loss per pass = raid chance × (1 − detection %) × takeShare × store worth. Every term is already in
`holdStore.raid` or `storeWorth`.

This gives the player the trade-off Erik described: **run it lean when you're exposed, and stock up when you're
walled.**

## §7 — THE WATCH: CAPTAIN, COVERAGE, AND A NUMBER

- **Captain:** one named person. Their hand at **watch** is the base.
- **Coverage:** any number of plain soldiers or workers assigned to watch, each adding a flat share, with diminishing
  returns past the hold's watch features.
- **Features:** watchtowers and wards add their `watch` field. Each shows its upgrade path: *"Watchtower L2 → L3:
  +8% detection"*.

**The readout** is two numbers against an event **at the hold's own danger level**:
- *Theft seen: 71%*
- *Raid seen: 84%*

If seen, the existing five-outcome odds bar (CCODE-414) shows how the fight goes with these defenders.

**Marginal info on every assignment:** *"Add Cael to the watch: +6% raid seen."* That is how a player knows whether
one more body is worth it.

## §8 — ATTACK & DEFENSE TAB: FOUR CARDS

1. **Defensive features:** every walls, gates or wards feature in its spot, with its level, its `defence` value and
   the next upgrade's effect.
2. **The watch:** captain, coverage, and the detection numbers (§7).
3. **Muster (offense):** what this hold can send out, from `musterCapacityOf`: heads, quality, and training features.
   It carries a **"Raise from here"** link into the band/legion flow (`raiseBand` / `addContingent`).
4. **Powers & influence:** SNG-651's card, renamed.

### §8a — Crafted defences: how long they last, layers, ward types, and they can be broken

> ⛔ **Erik, 2026-09-25:** *"the Shadow and Death Barrier is from Silas' crafts. Since crafts sometimes are permanent
> and sometimes need to be refreshed, we need to indicate that. The barriers can be layers and add defense and could
> add specific ward types. They need to be able to be targeted and able to be disrupted or destroyed as well."*

**What the save says today.** Silas's barrier is on his hold as:

`{kind:"barrier", name:"Shadow and Death Barrier", by:"you", craftIds:[], day:68}`

The feature knows it was crafted (`by`), but **`craftIds` is empty**. So which craft made it, and whether that craft
lasts, is lost when the feature is written. The same is true of Stillwater's Lab and the Warded Wall.
⚠️ **Reader before field:** the fix starts where the feature is written.

**New fields on a feature** (all optional; a built feature with none of them behaves as today):

| field | meaning |
|---|---|
| `craftIds` | the craft(s) that made or warded it; **actually written** at the moment of casting. The writer is the Build verb's craft picker (CCode's finding: 1 of the 6 `addFeature` callers can pass it today) |
| `expiresDay` · `refreshCost` · `lapsed` | **the fields improvements already use** (`holdings.js:1194–1206`, SPEC_hold_costs). Stamped from the craft's **function** through the existing rule: `growth.lastingFunctions` (make / mend / restore) → **permanent**; `growth.seasonFunctions` (holds ground / defends) → **`improveSeasonDays`**, warned one pass before, then it goes quiet and the rung comes off. **No new duration authoring.** |
| `whileCasterLives` | ⬜ only for the rare craft whose own text binds it to its caster; authored per craft as an exception |

> ✅ **Settled 2026-09-25, overriding my first draft:** I had proposed `lasts` / `renewEvery` / `dueAt`, read from
> each craft's prose. CCode found nothing structured on the crafts. **The rule already exists, keyed by function, on
> the improvement path**, and `app.js:15012` already renders ↻ Refresh / ↻ Wake for it. Silas's barrier bypassed it
> only because it came in through the **feature** path. So crafted features adopt the improvement's fields and rule.
> The same craft can differ by what it does: a wall *makes* and is permanent; a ward-line *defends* and lasts a season.
| `wards` | the domains it wards against, from the craft's domains: *death, shadow, warding, fire…* |
| `integrity` | 0–100; wear from being tested, disrupted or struck |
| `layer` | its position in the barrier stack, from outermost to innermost |

**The screen, per defensive feature,** shows:
- **Source:** *built*, or *crafted by Silas*, with the craft named.
- **How long it lasts:** *permanent*, *must be renewed · due in 2 passes*, or *lasts while Silas lives*.
- **Ward chips.**
- **An integrity bar** with what wore it: *"worn 60% · tested by the Harvest Hand last pass"*.
- **Actions:** *Renew* (whoever holds the craft, not only the one who cast it) and *Raise* (upgrade).

**Layers.** Barrier-type features (barrier, ward_line, wall, moat, thorn_line, gate) stack from outermost to innermost:
- Each layer adds its defence.
- A raid resolves against the layers in turn. A layer that holds stops the raid there.
- **A ward type counts double against an attacker of that domain.** A death ward turns the Harvest Hand's reapers
  harder than stone does, and a shadow ward adds to the chance of seeing a theft (§7).

**Targeted, disrupted, destroyed.** Raids and powers' actions can aim at a layer rather than at the store:
- **Tested:** the layer loses some integrity and the raid is repelled. This is today's "defended" outcome, now leaving
  a mark.
- **Disrupted:** the layer is suppressed for *n* passes. It gives no defence and no ward until renewed or until
  the time runs out.
- **Destroyed:** the layer is gone. A crafted one can be recast; a built one must be rebuilt.
- A **renewable ward that lapses** simply switches off. It's shown as *"lapsed — renew to restore"*, never
  silently removed.

**Needs you:** a ward due within one pass, a disrupted layer, or a destroyed one each shows up in the Holdings inbox.

## §9 — WHAT STANDS HERE, BY CATEGORY; AND RECORDS

**Features are grouped into the catalog's nine categories:** Defence · Watch & sense · Muster & training ·
Production · Craft & learning · Community · Market & economy · Travel & network · Meaning.

**Every feature shows:**
- the **what** line and the **flavour** line, both from the catalog;
- its **mechanics**, composed at render from the kind's own fields (`yields`, `defence`, `watch`, `hands`,
  `residents`, `aura`, `pilgrims`, `facility`, `upkeep`), with the current level's and next level's values.

**Records:** keep lifetime counters per hold in a new `holding.records` object, written at the moment each event
happens:
- goods yielded, and crystal earned from sales;
- raids seen, repelled, and suffered, plus goods lost;
- recruits found;
- keepers, with the dates they held it;
- peak rung and peak condition;
- pilgrims received.

The Records tab reads **only** that object.
⚠️ **Reader before field:** the writes and the tab ship together, and older holds show "since <date>" rather than
invented history.

---

## §10 — ⬜ FOR CCODE: YOUR OPINION BEFORE ANY OF THIS IS BUILT

1. **§2 duties.** Is `contributionsOf(p, {evidence:true})` the right input for the fit, or is there a better signal
   already in the person sheet (skills, ability tags)? Are the family-to-duty mappings sane against what the
   evidence parser actually returns?
2. **§2 numbers.** Where should `tierWeight` and the fit weights live? I'd put them in `economy.holdStore.hands`
   so Erik can turn them.
3. **§3 capacity.** Any existing concept of "how much a person can carry" (the charge scope in `delegateScope`,
   legion command limits) we should reuse instead of inventing a new formula?
4. **§4 budgets.** Does anything today depend on slots being one undivided pool (promotion, `roomOf`)? Would a
   `budget` map in `holdStore.slots` break a save?
5. **§5 and §7 plain hands.** Should unnamed recruits and watch soldiers live as band contingents (`unit:` ids,
   CCODE-450), or as a count on the holding? I lean contingents, because they already fight at their quality.
6. **§6 remote sale and trade.**
   - Anything that makes a keeper-sale-at-a-distance unsafe (double sale on a pass boundary, a caravan in flight)?
   - Can `sendCaravan` take carriers from the hold's own people, and send without the player present?
   - Is a hired trade company best modelled as a caravan whose `carriers` are the company's people, with a cut taken
     on `arriveCaravan`?
   - Visiting traders: is this a world-tick event per hold (like raids), with the offer held on the holding for the
     player or keeper to take?
6b. **§6 trade comparison.** The Store tab compares every way of moving the whole store in one table: gross, costs
    (fees, cuts, whose people are away), risk, time, and **what you net**, with one line naming the best return and
    what it costs you. Erik asked for this for the trade company specifically ("cost vs benefits so you can compare
    against selling here"). Can every row be computed from existing readers (`storeWorth`, route prices,
    `roadDanger`) plus the company's cut?
> ✅ **§10 answered by CCode 2026-09-25** (`po/CCODE_20260925_reply_workorder_holdings_people.md`), accepted in
> `po/REPLY_aevi_workorder_holdings_people.md`:
> - fit excludes HARM;
> - capacity reuses `delegateScope`;
> - the budget map goes beside the total;
> - plain hands are contingents;
> - explicit ordering at the pass boundary;
> - §7's % always names what it is a probability of;
> - §8a's layer resolution is held until real features carry crafts.
>
> The questions below are kept for the record.

6c. **§8a crafted defences.**
    - Why is `craftIds` empty on Silas's crafted features? Where is a holding feature written from a craft?
    - Is the duration text on crafts structured anywhere (for example `lasts` / `renew`), or does it have to be
      authored per craft?
    - Can the raid in `raidHolding` resolve against layers in order, with a layer as a target, without changing the
      unattended-fight machinery?
6a. **§5a camping.** Where is `residents` used as a hard cap today (recruiting, keepers, `bandGaps`)? Each one needs
    to become a comfort penalty instead.
7. **§7 detection.** Is there a clean way to express the current watch roll as a probability against a same-level
   event, so the % shown is the % rolled?
8. **What would you cut or reorder?** My suggested build order:
   1. §1 words and the ⓘ;
   2. §9 catalog on screen;
   3. §6 store;
   4. §7 and §8 numbers;
   5. §2 and §3 hands;
   6. §4 budgets and clearing;
   7. §5 recruiting;
   8. records.

— Aevi, PO
