<!-- status: SNG-634 spec_ready — awaiting Erik's rulings (§8) and CCode's readers (§6) -->
# SPEC SNG-634 — Powers on the ground: bandits, a bandit king, a thieves' guild, and lords both kind and cruel

**Aevi (PO) · 2026-09-23 · v2.4.10 · measured at origin `975efbf27`**
**Change set:** `po/staged_content/SNG-634_powers_on_the_ground.json` · **Generator dials:** `po/staged_content/SNG-634_powers_rules.json` — both staged, neither loaded.

---

## §0 — THE ASK

> **Erik:** *"I want the world to have more bad guys. We have some villains, but there isn't really anyone who's evil
> walking around as a nemesis… every mysterious person creeping through the house ends up being someone whose hunger
> is to understand me fully… that's good for me to gain allies, but turns the game into one big warm slog. I think we
> need the equivalent of bandits and a bandit king… a thieves guild in places that would make sense… territorial lords
> (some wonderful and some cruel). This will generate forces acting in areas that can aid you or can be resisted,
> opposed, and beaten… even eventually taken over. You can attack their holdings and have band battles and eventually
> legion battles. But we need the seeds of these things authored and placed — then the generator needs to know how to
> generate them."*

## §1 — ⛔ MEASURED: WHY EVERY STRANGER WANTS TO UNDERSTAND YOU

This is not a feeling about the game. It is the corpus's motive distribution, and the GM is faithfully continuing it.

| population | measured | what it wants |
|---|---|---|
| **66 figures** (`tradition_epics.json`) | **4** carry an acquisitive want (take, rule, tax, raid) | the rest want to teach, witness, keep, end, order |
| **20 of them are `villain`** | **20 of 20** want a *world-state* | *"a world ordered to a single correct configuration"*, *"a dark so total nothing casts"* — cosmology, not appetite |
| **17 `leader`-tier NPCs** | **17 of 17** are keepers, mediators, matriarchs, wardens | *"to keep the Roost free"*, *"for the Quiet House to hold"* |
| **6 `riffraff`** | **6 of 6** sympathetic | two children, a stall-holder behind on rent, a young Ent |

⚠️ **Nobody in the authored world wants what you have.** The villains want the *universe* to be different; nobody wants
your horses, your forge, your road or your harbour. So when the GM invents a figure creeping through the house, the only
register it has ever been shown for a person who seeks you out is *interest in you* — and it continues that register,
which is exactly what SNG-582 says a generator should do. **The warm slog is the mint being faithful to an unbalanced
corpus.**

**And the machinery for a fight has no one to fight:**

- `holdings.js:717` — a raid on your hold is `{ n: dangerLevel, quality: dangerLevel/2, what: "raiders" }`. **No name, no
  home, no one they answer to, and nothing remembers them afterwards.**
- `re_toll_bandits` — live, `aggressorKind: raider`, and Erik ruled on 2026-07-19 that *"toll bandits belong on the old
  switchback. Danger is reduced LOCALLY — by someone clearing them out."* **There is no them to clear.** The encounter
  has no owner, so clearing it clears nothing.
- `legionClash`, bands, legions, `legionplan`, captains, `callCostOf` — CCODE-404 to 407 built all of it. **Nothing on
  the other side of the field is a thing with a name that persists.**
- **No record kind for an organisation exists at all.** `faction` appears in the engine only as a mint origin
  (`worldtick.js:4224`, `originKind: "faction_leaderless"`) — a successor for a faction that has no record.

⛑ **So this is not a big engine build. It is one missing record kind, and the readers that already exist pointed at
it.**

## §2 — ⛑ WHAT ALREADY EXISTS AND WHAT EACH ONE NEEDS

| exists | where | what it needs from a power |
|---|---|---|
| raids on holds, resolved unattended | `holdings.js:667–732` | raiders drawn **from the power that claims this ground** |
| `legionClash(ours, theirs)` on `{n, quality}` | `melee.js:315` | a power's `strength.contingents` are already that shape |
| bands, legions, captains, call costs | `melee.js`, `legionplan.js` (CCODE-404–407) | an enemy host to march at, and allied powers to draw from |
| scale ladder `individual · party · unit · legion` | `melee.js:414 SCALES` | a power declares its scale in that vocabulary |
| seeking: pressure by \|relationship\| | `seeking.js` | *"a declared enemy does not wait at all long"* — a power's leader, once crossed, **comes looking** |
| a leader's death opens a seat | `worldtick.js:4136`, `faction_leaderless` | a power for the successor to lead |
| standing, per holder kind | `standing.js` (`standingFor` answers every holder kind) | `power` as a holder kind |
| local danger, lowered by clearing | Erik's 2026-07-19 ruling, `dangerLevel` on 130 of 143 places | a power's `dangerLift` on its reach, removed when it is broken |
| an area between two powers | `areas.json` `disputed_zone` | the Echo Bridge castellany sits in it, serving neither |

## §3 — THE SHAPE: A `power` RECORD, AND WHO READS EACH FIELD

⛔ **Reader before field.** Every field below names the reader it needs. A field with no reader in §6 is not in the
record.

| field | what it is | reader (§6) |
|---|---|---|
| `id` `name` `kind` | `outlaw_band` · `outlaw_crown` · `guild` · `lordship` — closed | all |
| `temper` | `cruel` · `hard` · `fair` · `kind` — closed, **made concrete below** | C2, C5, C6, C8 |
| `seat` | location id — where it rules from | C5, C8 |
| `reach[]` | location ids — where its presence counts | C1, C2, C3, C7 |
| `cells[]` | guilds only: `{at, does: fence \| safehouse \| inform}` | C3, C7 |
| `leader` | npc id | C7, C8 |
| `answersTo` | power id or null — a band paying a crown | C4, C8 |
| `strength` | `{scale, contingents:[{n, quality, what}]}` — **`legionClash`'s own shape** | C1, C5 |
| `holds[]` | `{at, kind: post \| enterprise, name, garrison}` — **the holdings kinds** | C5 |
| `verbs[]` | closed: `toll raid tribute extort steal fence smuggle inform tax levy protect patrol recruit expand feud` | C4 |
| `encounters[]` | random-encounter ids it owns | C3 |
| `dangerLift` | added to `dangerLevel` across `reach` while it stands | C2 |
| `noticesYouWhen[]` | closed: `crossed` · `neighbour` · `wealth` · `rival_ally` | C7 |
| `wantsFromYou` `offersYou` | player-facing: what it takes, what it gives | C6, C7 |
| `leverage` | GM-facing: the crack a player can work | GM prompt |
| `whenBroken` | GM-facing: what fills the vacuum | C8, GM prompt |
| `rivals[]` `opposedBy[]` | power ids · npc ids | C4, C7 |
| `plainly` `descriptionSeed` `appearance` | player line · GM character · **visual only** (SNG-582 split) | display, GM, art |

### §3a — TEMPER, MADE CONCRETE (T3: who evaluates it)

⚠️ "Cruel" is a mood until it changes a number or a line the GM must say. Each temper is four facts, all evaluable:

| temper | `dangerLift` | a paid toll is… | the defeated are… | its own ground regards it |
|---|---|---|---|---|
| **cruel** | +1 | taken, and not always honoured | killed | −2 — **overthrowing it makes you a liberator** |
| **hard** | +1 | honoured | ransomed | −1 |
| **fair** | 0 | honoured | spared | +1 |
| **kind** | −1 — **its ground is safer than the map says** | honoured | spared | +2 — **overthrowing it makes you a usurper** |

⛑ **That last column is what makes "take it over" a moral act and not just a capture.** Take Firstsight and the
stone-grass cheers; take Keelmouth and every family on the water hates you.

⚠️ **Guilds do not lift danger** (`kinds.guild.liftsDanger: false`). A thieves' guild does not make a road more
dangerous to walk; it makes a house more dangerous to own. Its pressure lands through C1 as theft on holds in its reach,
not through C2 on the encounter table. Caught by my own check against the temper table, which the Undercount's `0`
failed.

## §4 — THE SEEDS: SEVEN POWERS, SEVEN LEADERS, ALL ON CANON GROUND

⛔ **T2, the canon trace. Every seat was chosen because its own `descriptionSeed` already says this.**

| power | kind · temper | seat | leader | why here (the seed's own words) |
|---|---|---|---|---|
| **The Switchback Tollmen** | band · hard | `old_switchback` | Dessa Wyck | Erik's 07-19 ruling; the seed's *"single ruined waystation marks the halfway point… hearth still usable"* — that is their tollhouse |
| **The Gralloch Crown** | crown · cruel | `the_gralloch` | Harl Maddock | *"a broken badland of feuding bands"* — the king is the one who ended the feud |
| **The Edge Riders** | band · cruel | `the_churn_edge` | Tamsin Galt | Tumbledown is *"a market that has never been in the same place twice"* — no walls, no militia, caravans in the open |
| **The Undercount** | guild · hard | `the_hundred_markets` | Mother Hesk | *"prices here are the truest prices in existence"* — the guild's one law protects exactly that; fences in Dusklow (*"nobody in Dusklow repeats anything"*) and the Low Market (*"everything is for sale"*) |
| **The Holding of the Slip** | lordship · **kind** | `keelmouth` | Ines Harrowgate | *"the only place on four hundred miles of cliff where a hull can be put in the water"* |
| **The Barony at Firstsight** | lordship · **cruel** | `firstsight` | Oswin Tarrant | *"where the shore-road tops the divide"* — the top of the only road down to the only slip |
| **The Castellany of the Echo Bridge** | lordship · fair | `echo_river_crossing` | Brannoch | *"the bridge is the only crossing for miles"*, inside the Disputed Zone, between two cities |

**The shape of it, deliberately:**

- **A chain to climb.** The Tollmen pay the Crown; the Riders pay the Crown. Break a band and the King sends a harder
  captain; break the King and the bands go back to feuding — or swear to whoever holds the Feast Hall.
- **A crack in every one.** Dessa skims the King's tribute. Tamsin wants his crown. The Baron's road-men were taken, not
  hired. Mother Hesk's guild dies if its one law breaks. ⚠️ **`leverage` is how a player wins without a legion** — and
  it is GM-facing, so the GM plays it, not the card.
- **Kind against cruel, on one road.** Keelmouth and Firstsight are each other's `rivals`, twenty-six days of road
  apart with the sea at the bottom. **You pick a side, or you end up owning both.**
- **Existing good people become stakes, not quest-givers.** The Kestrel (*"to keep the Roost free — owned by no city, no
  faction"*) is `opposedBy` on the Crown — **the King wants her pass.** Warden Coll and Broker Sain oppose the
  Undercount. ⛑ The seventeen keepers finally have something to keep things *from*.
- **And the creeper through the house has a name.** The Undercount's reach covers the Crossing, and its
  `noticesYouWhen` includes `neighbour`: **a holding near the Hundred Markets is on Mother Hesk's list.** The next
  stranger in the dark wants what is in your laboratory, not what is in your heart.

⚠️ **One canon line I deliberately did not contradict:** `old_switchback`'s quest seed says *"something has been taking
travelers' packs… not bandits, something that leaves the food and takes the strange objects."* The Tollmen are the
known bandits; **that thief is still something else**, and Dessa's `knowledge` says so.

⚠️ **Names checked with `scripts/exists.mjs` before authoring.** Four collided and were changed — *Quill* (a companion),
*Orrin* (`maker_orrin`), *the Hundred Hands* (an epic figure), *Rook* (Millbrook). All seven leaders use `assistTags`
already in the corpus and `domains` that are real `traditionId`s.

## §5 — HOW IT PLAYS: FROM A TOLL TO A THRONE

| rung | scale | what happens | machinery |
|---|---|---|---|
| **1 · the road** | individual / party | the Tollmen's chain across the switchback: pay, talk, slip, or fight | `re_toll_bandits`, now **owned** (C3) |
| **2 · the raid** | unit vs your hold | the Undercount or the Riders come for a hold in their reach — **by name, and they remember** | `holdings.js:717` fed by the power (C1) |
| **3 · the assault** | unit vs unit | you march a band on one of *their* holds: the waystation, the horse camp, the counting-house | `legionClash` vs `holds[].garrison` (C5) |
| **4 · the war** | legion vs legion | break the Crown's host at the Feast Hall, or lift the Baron's siege of Keelmouth | `legionplan`, `formLegion`, `legionClash` on full `strength` (C5) |
| **5 · the seat** | — | hold the Feast Hall, the cairn keep or the Slip — **and inherit its bands, its tolls and its ground's opinion of you** | `holds[]` become your holdings; `groundStanding` decides liberator or usurper (C8) |

⛑ **And the other direction is real too — aid, not only oppose.** Pay the Baron's half-toll and ride in his levy. Swear
to the Crown and get a band of your own. Join the Undercount. Lend Keelmouth your legion. **A power you ally with is a
source of hands for `legionplan`**, which is how a player without holds of their own can field a legion at all (C6).

## §6 — ⬜ THE ASK, CCODE: NINE READERS, IN THE ORDER THEY PAY

⚠️ **Each one is a reader for a field the change set already carries. None asks for a new system.**

| # | reader | where | what it does |
|---|---|---|---|
| **C1** | **raiders have an owner** | `holdings.js:717` | a raid on a hold inside a power's `reach` draws from that power's `strength`; losses persist on the power; the news line names it. No power → today's anonymous raiders, unchanged |
| **C2** | **local danger** | wherever `dangerLevel` is read | effective danger = authored + Σ `dangerLift` of standing powers whose `reach` includes the place. **Erik's 07-19 ruling, mechanised: clearing them lowers it** |
| **C3** | **owned encounters** | `random_encounters.js` | an encounter listed in a power's `encounters[]` fires with that power's name and people inside its reach; a broken power's encounters stop firing there |
| **C4** | **powers act on the tick** | `worldtick.js` | each power takes one verb per pass from `verbs[]`; `tribute` moves crystal up `answersTo`; `feud`/`expand` target `rivals[]`; results reach the news |
| **C5** | **their holds are holdings** | `holdings.js` | `holds[]` are real holding records with `heldBy: <power id>`, so assaulting one is the same `legionClash` the raid already uses — **and winning can transfer `heldBy` to the player** |
| **C6** | **standing with a power** | `standing.js` | `power` as a holder kind; allied powers offer contingents to `legionplan` |
| **C7** | **a power comes looking** | `seeking.js` | when a `noticesYouWhen` trigger fires, the leader gains a want aimed at you; `seeking.js` already brings a declared enemy soonest |
| **C8** | **the seat falls** | `worldtick.js:4136` path | a leader's death opens the seat through the existing `faction_leaderless` mint; **a player holding the seat keeps it** |
| **C9** | **load and gate** | manifest, `content_ci` | register the kind; the six `expectedGates` in the change set |

⛔ **C1 and C2 alone change the game.** With only those two, the Tollmen raise the switchback's danger, raids near the
Crossing have a name, and clearing a band makes a road safer. Everything else deepens it.

## §7 — THE GENERATOR: THE SEEDS ARE EXEMPLARS, NOT THE CAST

> *"All of this authoring will fall to the generators, so they need to be able to faithfully continue what you are
> doing."* — Erik, SNG-582

⛔ **Seven powers in a world of 143 places is a sketch. The mint has to draw the rest to the same standard.**

**G1 · `mintPower(region)`** — reads `rules/powers.json` (staged as `SNG-634_powers_rules.json`):

- **Where.** Each kind places at locations carrying its `placeAtTags` — tags that are **already in the corpus**:
  bands at `road pass trail waystation lawless dangerous frontier border` with `dangerLevel ≥ 2`; crowns at
  `lawless dangerous raider no-law` with `≥ 3`, one per region, and **only once three bands stand in that region**; guilds
  at `market trade trade-post cosmopolitan wealth crossroads` with cells at `inn lodging no-questions secret harbour`;
  lordships at `foothill bridge harbour pass border outpost crossroads` and **never at a `tier: region` city** — those
  are the traditions' own seats.
- **How many.** `density`: one per region, plus half a power per danger step, capped at four.
- **Temper.** Drawn from the kind's weights. ⚠️ **Lordships are drawn evenly — 25 / 25 / 25 / 25 —** because Erik asked
  for *"some wonderful and some cruel,"* not *"mostly cruel."* Bands lean hard; crowns lean cruel.
- **Rivals.** A lordship within 30 days of another is its rival half the time, and **half of those pair opposite
  tempers** — the Keelmouth/Firstsight shape, made generative.
- **Leader.** Minted through the existing figure path at the kind's `leaderTier`, with a want drawn from the power's
  `verbs` — **so every generated leader wants something concrete that can be taken from someone.**
- **Whole on birth (SNG-250).** A minted power carries every §3 field. `appearance` is **visual only**; `plainly`,
  `wantsFromYou` and `offersYou` are **player register — no house notation** (SNG-582 O4).

**G2 · Growth (SNG-250 §6).** Three wins grow a power's heads a step; two losses shrink it; a crown absorbs bands in
its region; a leaderless band joins the crown, splits in two, or dissolves.

**G3 · ⛔ THE WARM-SLOG FIX AT THE SOURCE — a GM directive, not a content patch.** When the GM invents an unnamed person
who seeks the player out, **it draws that person's motive from the powers whose `reach` includes this ground before
defaulting to curiosity.** One line in the stranger-invention block of `gm.js`, fed the local powers' names and
`wantsFromYou`. ⚠️ **Without G3, the seven seeds exist and the GM keeps inventing seekers who want to understand you**,
because that is still the only example the prompt shows it.

**G4 · The gate that makes it stick.** `coverage.mjs` gains the `power` type, and a report (not a fail): *regions with a
danger-3 place and no outlaw power*, *lordships with no rival*, *powers whose leader's want names nothing that can be
taken*. ⛑ The last one is §1's finding turned into a check.

## §8 — RULINGS I NEED FROM YOU, ERIK

1. **The Ender Who Forgot Why** is already a `Warlord` seated at `the_marchward`. **I left him out** — his want is
   *"to end,"* a cosmic figure, and the Marchward belongs to Mediator Corran. ⚠️ If you want him as a lord with a host,
   he is the ready-made cruel warlord; say so and he gets a lordship at the Redline.
2. **Taking a seat.** When you hold the Feast Hall or the cairn keep — **do you become the Crown, or the Baron?** (Their
   bands, tolls and rivals pass to you.) Or does the seat fall vacant and the power dissolve? I have written it as *you
   inherit*.
3. **Lordship tempers even at 25 / 25 / 25 / 25?** Or weighted toward one end?
4. **The dark path.** I have assumed you can *join* the Undercount and *swear to* the Crown — the powers aid as well as
   oppose. Confirm, or say where the line is.
5. **The Undercount marks a holding near the Crossing.** Raven's Home is at the Crossing. ⚠️ **As written, your house
   is on Mother Hesk's list the day this loads.** That is the point of it — but it is your house, so it is your call.

## §9 — WHAT I AM NOT DOING

- ⛔ **Not loading any of it.** Staged per SNG-505: spec, change set, then CCode applies it on a green suite.
- **Not editing any figure, NPC or location.** The only existing record touched is `re_toll_bandits`, which gains an
  `owner` — an added field, nothing removed.
- **Not inventing a number the engine will read without a ruling** — the tempers' four facts and the density are
  proposals in a staged file, and §8.3 asks for yours.

## §10 — TWO TOOL FINDINGS

### §10a — `tests/changeset_check.mjs` cannot yet hold this change set — CCode's, and why it is not in `changesets/`

⛔ **I authored it in the CCODE-204 shape and ran the validator on it before committing. Four checks pass; two fail, and
both are the tool's scope rather than the content:**

1. *"every modified id names a craft that exists"* — `modified` is assumed to be abilities. `re_toll_bandits` is an
   **encounter**.
2. *"every content file this change set names is manifest-registered"* — paths resolve against `content/packs/core/`,
   so every **valley** path reads as unregistered, and so do the seven leader files and `powers.json`, which **do not
   exist until the change set is applied** — that is what `added` means.

⚠️ **And `run_tests.mjs:46` runs it over everything in `changesets/`, so filing it there would have turned the suite red
on a gate that does not cover this kind of change.** I did not do that, and I did not edit the gate to pass it — your
rule from SNG-505 §4.4, and a good one: *a gate a correct content change turns red is a gate that trains you to ignore it.*
⬜ **The ask:** `modified[].kind` (`encounter` · `npc` · `power` · craft by default), pack-relative paths, and `added[]._file`
accepted as *to be created*. Then this file moves into `changesets/` unchanged. Until then it sits at
`po/staged_content/SNG-634_powers_on_the_ground.json`, verified by a one-off corpus check (7 powers, 7 leaders, 0 failures).

### §10b — `scripts/authoring.mjs` does not run on Windows — mine

`scripts/authoring.mjs` resolves its schemas as `C:\C:\Users\…\npc.schema.json` from a file URL. It works in a Linux container and fails on Erik's machine, which is where I ran it today. ⛑ Fix is
`fileURLToPath` in place of `.pathname`; I read the schema and a live neighbour (`cassiel-ord`) directly instead, which
is the procedure's step 3 anyway.

— Aevi, PO

---

# §11 — ✅ ERIK RULED, 2026-09-23

| # | question | ruling |
|---|---|---|
| 1 | the Ender Who Forgot Why | **"He's a warlord, he needs an army. In fact pretty much all eligible NPCs should have holdings, bands, and legions if that fits their character."** → `power_ender_host` added (§11a); the whole cast measured (§12) |
| 2 | taking a seat | **yes — you inherit it.** Its bands, tolls, rivals and its ground's opinion of you pass to you. Recognition is SNG-636 §3. |
| 3 | lordship tempers | **split evenly**, 25 / 25 / 25 / 25, as staged |
| 4 | the dark path | **you can join the bad guys** |
| 5 | the Undercount and Stillwater's Trouble | **a meeting, not a burglary** (§13); and the name is fixed (SNG-635) |

### §11a — The Ender's Host

**Seated at `the_marchward`, his own authored `homeLocation`** — his host camps in the old muster-yard *below* the wall;
the town stays Mediator Corran's. Legion scale: 140 companies at quality 3, 30 of the Unremembering at 4. ⛑ **His leverage
is his own authored verb** — *"looking for the reason afterward"*: someone who could tell him what he was protecting
might stop the host where it stands, or turn it. Broken, his companies scatter as masterless bands **for the Gralloch
Crown to absorb** — which ties the Marches to the Churn without either knowing.

### §11b — ⛔ A CANON TRACE I FAILED, AND THE FIX

`greta_waystation` is the *"solitary keeper of the switchback's halfway waystation"* — **the building I gave the Tollmen
as their tollhouse.** I read the location's seed and never asked who lived in it. ⚠️ **`exists.mjs` checks a name; it
cannot tell me that a place I am about to occupy already has a keeper.** The Tollmen now hold a chain on the upper turns
*above* her waystation; she will not feed them and they have not yet made her; she is `opposedBy`. Recorded on the record
as `_correction_20260923`. ⬜ **Gate for the procedure:** before seating a power, list the NPCs whose `homeLocation` is the
seat.

# §12 — THE CAST, MEASURED: WHO SHOULD HOLD A POWER

`po/staged_content/SNG-634_census.json`, derived by `rules.eligibility` for the 66 figures (by `role`) and by a call with
a reason for each authored NPC (`SNG-634_census_calls.json` — kept out of the rules file, because a note in a rules bag
is an unread constant). **Three it found that I had missed in SNG-634:** Orrun Shieldbreaker (a raider-captain with a ship
and a crew), Cassa Redsail (a pirate), and Dame Iseult of Hardline (forty riders sworn to her). **And the two city
masters, who are the Long Reach itself.**

⚠️ **Figures whose `homeLocation` names no real place cannot be seated** — the census lists them; they wait on SNG-636's
sovereign records or on a place being authored. **A new kind, `order`**, exists for sworn followings — an inquisition, a
temple's fighters, a knight's oath — because neither `lordship` nor `guild` describes a zealot's host.

# §13 — MOTHER HESK'S APPROACH: A MEETING, AND YOU ANSWER

> **Erik:** *"If Mother Hesk is paying attention, she might set a meeting with Silas or the keeper to negotiate a fencing
> position at the post… that lets the player decide how to respond. Reject, Embrace, tolerate, etc."*

`approach` is a new field any power can carry — **the first move a power makes when it notices you, and it is an offer,
not an attack.** The Undercount's, when its `neighbour` trigger fires on Stillwater's Trouble:

| answer | what the post becomes | what it yields | standing with the guild | the risk |
|---|---|---|---|---|
| **embrace** | a guild `fence` cell | a tenth of fenced value each season | +2 | the wardens learn of it (Warden Coll) |
| **tolerate** | an unacknowledged cell | nothing | 0 | the wardens learn of it — and you took nothing for the danger |
| **reject** | the guild marks you `crossed` | nothing | −2 | they come for what is inside your walls within the season |
| **negotiate** | the GM plays Hesk's leverage against your price | terms | 0 | none until terms are set |

⛑ **To: the holder or the keeper** — Silas, or Cassiel Ord, whoever the guild reaches first. ⚑ **The same field gives the
Crown its "swear or pay", the Baron his half-toll, Keelmouth her alliance.** It is how a power meets you before it fights
you — and C7's reader delivers it.

### §12a — The census, as it came out (152 people)

**45 hold a power · 20 hold only holdings · 87 hold nothing.** Of the 45: 18 lordships, 17 orders, 6 guilds, 3 outlaw
bands, 1 outlaw crown (the Appetite). Tempers: 16 hard, 11 cruel, 10 kind, 8 fair.

⚠️ **Rows the rule produced that I would not ship without your eye**, because a rule on `role` cannot read character:
the four God-Named Heroes all seated at `the_wayhouse` (Zeus, Loki, Athena, Ares — four powers at one inn); `the_undefeated`
as a lordship at the Coliseum (a Champion's role, an arena's seat); `keeper_the_unsaid` and `the_kind_liar` as guilds.
**Four have no resolvable seat** — Aelith and Ysenkar (`the_churn` is a locus, not a place), Cassa Redsail (`unspooling` is a
region), the Lightless Seraph (`the_ascendant_spire` is not authored). **Dame Iseult and Orrun Shieldbreaker had region ids as
homes; seated at `hardline` and `longshore`.**

### §11c — The seat-resident gate, run

`check` now warns when a power's seat is already someone's home. After Greta: **Marshal Veyn** at the Marchward — *"A line
worth holding"* — **is now `opposedBy` on the Ender.** The rest were read and are accounted for: Sable the Runner (missing on
the high trail; the Tollmen would know), Odd Wren at the Churn Edge, Pell-Sethry in the markets (a seller at her own stall —
the one person the Undercount's law protects), Veyra Lance at the Marchward (a duelist who wants a clean fight, not a side).
