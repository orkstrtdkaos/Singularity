> ⛔ **HOW THE GAME WORKS: `docs/HOW_IT_WORKS.md`.** Erik 2026-08-28: *"between the two of you you need to
> DOCUMENT WHAT YOU'RE FINDING in terms of how the game is supposed to work, and update it as we clear this
> stuff up."* ⚠️ **That file is the answer, in present tense, marked BUILT or PROPOSED. Everything in `po/`
> is working papers — specs, replies, findings — and none of it says how the game works.**

# PO Backlog — Singularity

> ⛔ **THE HEADLINE BELOW IS STAMPED 2026-08-14 AND TWO OF ITS CLAIMS ARE NOW FALSE.** `region_maps` and
> `precursor_lines` **have since been wired**; `areas` too. ⚠️ **`local_layouts` and `scale` are still
> unread** — and `local_layouts` is worse than unwired: its only consumer is `content_ci`, and `SNG-404`
> is red because the engine placer does not reproduce the authored ground: 13 of 16 disagreements are
> river DISTANCE on a 1-32% gradient, and the 3 bearing gaps are 15, 45 and 150 degrees apart.
>
> ✅ **Measured afresh today in [`po/STOCKTAKE_20260828.md`](STOCKTAKE_20260828.md)** — one list, all of it
> run rather than remembered. **Read that first; this file is the queue behind it.**

> ⛔ **STATE AS OF 2026-08-14.** *(Moved here from a root `STATE.md` I created in error — **`STATE.md` is
> the Tether/ErikIAm name** and duplicating it in this repo made two files with one name and two meanings.
> PO state belongs in the backlog it drives.)*
>
> **THE HEADLINE: content is ahead of wiring.** Five map files — `region_maps`, `local_layouts`, `scale`,
> `precursor_lines`, `areas` — are validated by `content_ci` and read by **no engine module**.
> ⚠️ **`scale.json` has ZERO consumers, so any scale bar is still using Earth's radius.**
> **Recommendation: wire one tier end-to-end before authoring more.**
>
> **Authored:** region maps 8/38 · local layouts 18/135 · areas 1 · figures complete (66/66 appearance,
> fightingStyle, deathImagePrompt, offscreenVerbs, wants, homeLocation; `rivals` has 8 gaps).
>
> ⚠️ **TWO THINGS THAT CHANGE THE REAL NUMBERS:** 12 of the 38 regions hold a single location and probably
> want **no region map at all** (30 left → 18). And **the Palelands and Umbral Depths have region maps and
> ZERO local frames** — a player can zoom in and fall through. ⛔ **Completing those two proves the tier
> transition end-to-end and is worth more than a nineteenth region.**
>
> **Geography is clean:** all five `content_ci` geography failures closed, world rebuilt, land 42.0%,
> mainland 100% of land, **0 stranded, 1 off-mainland** (`the_slow_stair` — an island, which suits a stair
> coming up out of the dark onto a shore; Erik's call).
>
> **Open for Erik:** seed images for NPCs/skills need a Pollinations API key — 36 models accept image
> input, but the keyless endpoint the app uses **silently ignores both `model=` and `image=`** (200 and a
> byte-different file, because the param changes the cache key); `gen.pollinations.ai` returns 401. ⛔ **A
> key cannot go in client-side `art.js`** — needs a proxy or BYOP.
>
> **Open for CCode:** the battle image (clash now records `locationId`+`abilityId`, `battleprompt.js`
> exists, content complete) · wire the map files · rival-weighted fight selection · `offscreenVerbs` for
> the offscreen beat.

*Owned by Aevi (PO). Order below is build order. CCode sessions: active task is always `po/ALERT.md`; this file is the queue behind it. One goal per session — decompose on pickup if a task won't fit one session.*

**Ratifications on record (2026-07-04):** Erik ratified the Encounters direction (SNG-002) — new engine layer on top of existing resolution, resolution math itself unchanged.

---

## SNG-268 — RING DISTANCE IN THE BRAID GENERATOR (CCode — spec at `po/SPEC_SNG-268_braid_ring_distance.md`)
**Why it is queued rather than left in ALERT:** braids are **minted at runtime**, so anything the three
hand-authored braids taught us leaks unless the GENERATOR knows it. An ALERT entry scrolls; this must not.
**Already correct — do not change:** `deriveMechanic` (SNG-263 §9) unions parents' axes, takes the stronger
field, makes a REFUSED intensity contagious, and **deliberately does not inherit bounds.** All verified right.
**The gap:** `braidBaseCost` asks how EXPENSIVE the parents are, never how FAR APART. Adjacent and antipodal
braids currently cost and read identically.
**The evidence:** all three authored braids — `meaning_engine` (enginewright+numinous), `harbored_flame`
(umbral+blazeborn), `the_turning_word` (threnodist+syllogist) — are **exact antipodal pairs**, and each carries
a bound about the joining itself (*"the two poles fight"*). A minted braid gets none of it.
**Four small additions, all from data `traditions.json` already carries (`opposite`, `adjacent`):**
1. `ringDistance(a,b)` — 0 same → 4 antipodal.
2. Cost × tensionFactor — adjacent 1.0 · far 1.4 · **antipodal 1.8**.
3. **The tension bound** — ONE bound the parents never had (the cost of the joining), COST-class, far/antipodal
   only, none for adjacent. Additive on the braid's own reach, so it does not widen the boundary.
4. `requiresPoles` on minted braids — free from `minted.from`; dual-pole gating is now a **four-instance
   category** (checks 6e), and otherwise only hand-authored braids are ever gated.
**Do NOT block antipodal braids** — expensive and marked, never forbidden. They are the best braids in the game.
**TEST OF DONE:** mint one adjacent and one antipodal braid. The antipodal must cost visibly more **and** carry
a tension bound; the adjacent must carry neither. Identical output = the generator still cannot see the ring.

---

## SNG-002 — Encounters engine (RATIFIED — spec next)
Typed encounter layer over existing d100 resolution. Three encounter types, all content-defined in `content/packs/*/encounters/`:
- **Duel/battle:** opponent stat block (health, threat, spectrum, tactics tags); round loop — player roll vs. opponent threat each round; positioning/condition tags; flee/yield/decisive-end conditions. GM narrates per-round receipts.
- **Challenge:** multi-stage skill gauntlet (N stages, each a typed action; partial failures cost health/energy/time, not full stop).
- **Puzzle:** riddle/mechanism objects; attempt costs; hint tiers gated through the sense filter; codex facts can unlock approaches.
Engine module `engine/encounters.js`; generic, no content specifics. Existing resolution math untouched. Companion assists and abilities work inside rounds. Every new write path gets a smoke test. GM contract gains an encounter receipt block (load-bearing rule additions → Erik ratifies final wording).

## SNG-003 — Ability catalog expansion (content — Aevi self-ratified, Aevi authors)
8 → ~36 abilities: 12 harmonic, 12 radiant, 12 unaligned "valley craft" (tracker, herbalist, mediator, tinker, waywright, storykeeper…). Full 3-rank trees with grants/cannot/notFor per existing schema. Valley origin stops being the poverty pick.

## SNG-005 — Companion bonds & evolution (promoted from §9 specced-unbuilt)
Bond value −10..10 (same bands as NPC relationships) grown by shared deeds/assists/time. Bond tiers unlock: assist cap raise → companion-specific granted abilities → **evolution stages defined in companion JSON** (form, knowledge, voice shifts at thresholds — Aevi's motes brighten, condense, learn). GM sees bond band + stage every turn. Migration: existing companions start at bond 0, stage 1.

## SNG-007 — Character sheet & inventory screens (NEW — Erik field report 2026-07-04)
Post-creation, the character's own record is invisible to the player:
- **Character screen:** full view — bio/backstory (currently GM-only after creation), attributes/sub-attributes with per-sub current/20 bars and the soft-cap knee at 4 marked, abilities with ranks and tree progress, aptitudes, XP/level, custom abilities, active quests summary. Reachable any time from the main UI.
- **Inventory screen:** first-class full view (catalog details, equipment slots/bonuses, use/examine/drop) — not just the sidebar strip.
Absorbs SNG-006 (creation-screen point bars) — same component, shown at creation and in-play.

## SNG-004 — Origins & backgrounds as content (design-law compliance + variety)
Move origins and backgrounds out of `app.js` into `content/packs/*/origins/` + `backgrounds/` with mechanical hooks: starting spectrum tilt, ability-system access, background skill grants, creation copy. Then add: mountain-pass folk, Disputed Zone survivor, Archive-born, **unusual embodiment category** (the ENT precedent — GM handles nonhuman gracefully; make it a supported choice with its own hooks), and the five beyond-the-pass civilizations as they open. Backgrounds expand similarly.

## SNG-008 — Heimrún, Council of Mavens, framework weave (content wave, rides with SNG-004)
- **Rune shrine / rune-caster NPC:** casting as mechanic — a cast grants the day's omen: small spectrum-axis nudge; rune meanings seeded from Heimrún's canonical data. Optional settings hook to link external Heimrún casts as the day's omen.
- **Council of Mavens faction:** petitionable advisor council; each maven a persistent NPC with domain + bias; counsel can conflict; sense filter mediates whose read to trust.
- **Framework layer (lore canon, GM-eyes-only):** Precursor mystery converges on contraction/foreclosure as the force behind the water crisis. Glimpsed, never explained.

---

## Ordering (2026-07-04, Erik: emergence bumped ahead of origins)
**SNG-009 hotfix (ACTIVE build) → SNG-010 Practice & Emergence → SNG-001 party play → SNG-004 origins (+SNG-008 weave) →** remaining §9.
SNG-010 recipe layer pre-authored at `content/packs/core/rules/emergence_recipes.json`.

---

## ⛔ CARRY-FORWARD: what every tradition audit must now include

**Established while auditing Mind (SNG-450 → SNG-470). Apply per tradition as each is reached.**

### The per-tradition checklist

1. ⛔ **Run the six-question assessment** (`SYSTEM_SPEC §32.11`) on every skill. Cut what fails.
2. ⛔ **Merge flavour-duplicates** — same level, cost, mechanic and rank-arc, differing only in the noun.
   Flavour goes internal via `sectFlavour`.
3. ⚠️ **Review perceive and control tags per rank** — keep where the player receives information they act
   on / where restricting is the point; strip where it is the internal mechanism or a consequence of
   damage.
4. ⛔ **AUTHOR ONE OBSCURE CRAFT.** Ten traditions have none, and the sense slot is currently
   Dark-and-Mind only. **This is the biggest live gap.**
5. ⚠️ **Confirm sense coverage** — 27 crafts are tagged and 13 of 14 traditions have one; only **Spirit**
   lacks it, which may be correct.
6. ⛔ **Check the four social verbs.** `persuade`, `bargain`, `provoke`, `soothe` — every tradition should
   reach at least two, and **`bargain` is still ZERO corpus-wide.**
7. ⚠️ **Ranks max at 3.** Every rank names a gain axis: range · duration · damage · scope · targets ·
   quality · autonomy · conditions · **tempo**.
8. ⛔ **Tempo is the strongest axis — at most one or two per tradition**, and it should be the tradition's
   signature form (sense-slot use, extra action, banking, or compression).
9. ⚠️ **Naming SOP §31** — no "The" unless the article works, rank names included.
10. ⛔ **Full schema** (§32.6), and **log a revert file before cutting.**

### Obscure crafts still to author — one per tradition

**Angelic · Body · Breaking · Building · Death · Demonic · Life · Order · Span · Spirit**

⚠️ Erik's own examples to build from: ⛔ **dirt in the eyes** (Breaking/marcher) · **a stance that reads as
three attacks and resolves as a fourth** (Body/somatic) · **they look at you and see how they end**
(Death/ashwarden) · **a ledger so regular it carries no information** (Order/lattice).

### Open system questions for CCode

- ⛔ **`mechanic.dice` and `magnitude` have ZERO consumers.** Combat resolves d100 + attribute + tier +
  matchup. **Damage intent is authored and unwired.**
- ⛔ **The sense slot needs wiring** — a declared SENSE/OBSCURE per side, obscure wins ties. Minimum
  viable is the slot plus the `sense`/`obscure` tags, which are now on 40 crafts.
- ⚠️ **Tempo** banks per `charges.json` `rate` accrual, caps at 3, empties at end of contest.
- ⚠️ **Project and journey skills** (`SYSTEM_SPEC §33`) resolve over world ticks, not in a scene.

### Mind — done

**36 → 24 skills.** PERCEIVE 519 → 111 corpus-wide; CONTROL 372 → 251. SOCIAL 0 → 9. Every function
present. Revert logs: `revert_SNG-450` · `revert_SNG-453` · `revert_SNG-454` · `revert_SNG-455` ·
`revert_SNG-456` · `revert_SNG-457` · `revert_SNG-460`.


### ⛔ CARRY: 210 unauthored bounds

**219 ranks across 74 abilities carried a `cannot` that pointed at the next rank instead of stating a
limit.** Nine were fixed in Body; **210 now read `⚠️ BOUND NOT AUTHORED` and must be written as each
tradition is audited.**

**Worst-affected files:** `reach_space_time` 34 · `reach_falsehood_truth` 32 · `reach_demonic_angelic` 30
· `reach_dark_light` 27 · `reach_destruction_creation` 27.

⚠️ **Deliberately flagged rather than bulk-written** — 210 bounds I have not thought about would read as
considered and not be.

## ⛔ BRAID — Falsecraft × Threnodist obscure (Erik, 2026-08-23)

**Veilwrights *"hold that every truth is a made thing, and make better ones"* (`falsehood` pole).
Threnodists hold that feeling is the only true knowing (`emotional` pole). ⛔ SO A MADE FEELING IS A MADE
TRUTH — the braid is the false-feeling counterpart to `public_grief`, which opens a feeling rather than
fabricating one.**

⚠️ **THIS WAS BLOCKED BY MY OWN OVER-AUTHORING AND ERIK CAUGHT IT.** I had written *"a people who hold
feeling is the only true knowing cannot hide behind a false one"* into `public_grief` as a HARD BOUND.
⛔ **The tenet is an EPISTEMOLOGY — how a Threnodist KNOWS — and I promoted it to a PROHIBITION on what one
may do.** The bound is stripped; the braid is open.

**Shape when authored:** `tradition: cross_pole_braid`, `powerSystem: combination`, verb `deceive` (shows
what is FALSE) as against `public_grief`'s `conceal` (hides what is TRUE). ⚠️ **The pair is the point —
the same tradition reachable from either side of the falsehood/truth axis.**

## ⛔ THE ASHWARDENS WHO CHOSE THE OTHER WAY (Erik, 2026-08-23)

**Marrow's GM-eyes-only hook: it *"may be an Ashwarden proper — not their bird but one of them, in a shape
that lets it attend the endings the March cannot reach."* Its hard boundary: it will not hasten an ending,
ever, for any reason, INCLUDING MERCY.**

⛔ **ERIK'S READING, AND IT TURNS A CHARACTER NOTE INTO A FACTION:** Marrow has agency and wants. If it took
that shape, then **not hastening is a CHOICE it makes and holds** — and a choice implies others who faced
it and **chose the opposite.**

⚠️ **THE TRADITION ALREADY HAS THE CRAFTS FOR THE OTHER CHOICE:** `hastened_grey` brings an ending forward,
`the_cut_thread` ends one living thing with no wound and no struggle. **So the schism is already authored
as mechanics; nobody has authored the people.**

**Threads worth pulling:**
- Ashwardens who took shapes to attend endings, versus Ashwardens who took shapes to **cause** them.
- ⛔ **Mercy is the fault line**, not malice — the opposite choice is not villainy, it is someone who
  decided that refusing to hasten IS the cruelty. **Both are defensible and that is the point.**
- Marrow *leaves during births and will not say why* — ⚠️ **whatever that is, the ones who chose otherwise
  presumably do not.**
- The March *"cannot reach"* some endings. **Who attends those instead?**

⚠️ **Keep Marrow deniable per its own hook. The faction can be real long before the bird is confirmed.**

## ⛔ BRAID — Necrotic Strike × a chaos craft: the one that DOES NOT SORT (Erik, 2026-08-23)

**`Necrotic Strike` r3 originally read *"it does not sort — everyone else inside the reach is struck one
rung lower."* ⛔ ERIK CUT IT AS A DEFAULT: a craft should not hit the party as baseline.** *"Maybe if you
combined this with a chaos craft, but not as a default."*

⚠️ **THE INDISCRIMINATE VERSION IS A BRAID, NOT A RANK.** Death supplies the ending; chaos supplies the
refusal to choose who gets it. **That is exactly what a cross-pole braid is for, and it means the terrible
version has to be BUILT rather than arrived at by levelling.**

**Shape when authored:** `tradition: cross_pole_braid`, `powerSystem: combination`, and the braid's whole
contribution is removing the target filter — same antisoak, same pierce, no sorting. ⛔ **The pair reads
well: the base craft is a professional finishing a job; the braid is someone who stopped deciding.**

## ⛔ THRENODY IS A MOURNING TRADITION, NOT A FEELING ONE (Erik, 2026-08-23)

**Erik: *"for a feeling people, where are the other emotions? Rage, love — yes, needed to be worked in.
Not sure exactly how yet."*** ⚠️ **MEASURED ACROSS ALL 15 THRENODIST CRAFTS:**

| emotion | crafts |
|---|---|
| grief | ⛔ **12** |
| fear | 6 |
| rage | 3 — ⚠️ never the subject |
| joy | ⛔ **2 — both passing mentions in a list** |
| shame | 1 |
| **love · hope · longing · awe** | ⛔ **0** |

⛔ **AND FIVE OF FIFTEEN CRAFT NAMES CONTAIN "GRIEF" OR "LAMENT".** ⚠️ **Their own canon says their cities
are built around GRIEF-HOUSES *AND JOY-HALLS*, and there is no joy-hall craft.** The tradition holds that
FEELING IS THE ONLY TRUE KNOWING and demonstrates one feeling.

**WHY IT WENT UNNOTICED:** ⚠️ **per-craft review cannot see it.** Each craft is individually fine; the
monoculture is only visible across the set. ⛔ **THIS IS AN ARGUMENT FOR A PALETTE PASS AS A DISTINCT STEP
IN §37's AUDIT ORDER** — the same way verb coverage is measured, an emotional/thematic range check belongs
in the tradition-level sweep.

**THREADS, NOT DECISIONS — Erik has not ruled on how these enter:**
- ⛔ **JOY AS A RESOURCE AND A WEAPON.** The same tidal mechanic as `keening` pointed the other way — a
  crowd LIFTED rather than levelled. The joy-halls exist and nothing uses them.
- **RAGE.** Threnody currently touches it only as something other people feel. ⚠️ **A tradition that holds
  feeling as knowledge should be able to WIELD anger, not merely read it.**
- **LOVE / LONGING.** Absent entirely, and the likeliest home for the tradition's second face.

⚠️ **NOT to be solved one craft at a time inside the Death audit.** ⛔ **`under_song` (was `shared_grief`)
was deliberately made EMOTION-AGNOSTIC so it reads whatever is actually underneath — rage, love, relief —
and therefore does not pre-empt this ruling.**

## ⛔ WARDED GEAR DOES NOT EXIST (measured 2026-08-24)

**48 crafts carry `wardTypes`. ⛔ ZERO ITEMS DO.** ⚠️ **The typed-soak machinery in `skill_battle.js`
(`answers = l => !l.type || !dmgType || l.type === dmgType`) is correct, complete, and has nothing to
answer with — because nothing a character can WEAR carries a type.**

**Erik 2026-08-24: *"basic armour is good for most basic things — but that's why you need wards and
accessories that can carry resistance and soak. Pell's brigandine has some such wards."*** ⚠️ **Pell's
brigandine is not authored as an item; the wards are a character fact with no record.**

**WHAT THIS UNLOCKS:** typed resistance as LOOT and as CRAFT-WORK · a reason to buy a consecrated pendant ·
Death-Ward's `decay` becoming a thing a smith can approximate in leather · ⛔ **and the whole
`wardTypes` vocabulary becoming reachable from the equipment side for the first time.**

## ⚠️ THRENODY MAY BE A SCHOOL, NOT A TRADITION (Erik, 2026-08-24)

**Erik: *"I agree that threnodist is less a full tradition and more a flavour or school — which is why
we're working this audit."*** ⛔ **THIS BEARS DIRECTLY ON THE PARKED 14-TRADITION MERGER
(`traditions_v2.json`), and it is the first tradition the audit has produced structural evidence about.**

**The evidence, measured:** 12 of 15 crafts are grief · joy appears twice and never as the subject ·
love, hope, longing, awe absent entirely · ⛔ **six of fifteen crafts were support-shaped with no
mechanical benefit, and three needed full rebuilds** (`shared_weight` → interception, `wellspring` →
bolster, `shared_grief` → `under_song`).

⚠️ **A tradition should be able to carry a party role by itself. Threnody could not narrate into a fight
without borrowing** — every scene ran through the Ashwarden.

## ⛔ SERAPHIC WANTS PRAYERS AND MIRACLES — INCLUDING RESURRECTION (Erik, 2026-08-24)

**Erik: *"a note for Seraphs — I want their skills to include prayers and miracles (including
resurrection)."***

⚠️ **SERAPHIC IS ALREADY ON THE RETRIEVAL LADDER'S DOORSTEP AND IS NOT ON IT.** Five traditions answer the
Threshold/Near Dark/Deep Dark/Sealed ladder — ashwarden, threnodist, numinous, rootkin, radiant_folk —
⛔ **and the tradition whose craft IS structured nanite maintenance, and whose own agelessness is the reason
`kept_vigil` works, has no answer at all.**

**THE ANGLE THAT MAKES IT DISTINCT FROM THE OTHER FIVE:** ⚠️ **everyone else RETRIEVES — drags, invites,
delays, pays. ⛔ A MIRACLE IS ASKED FOR AND GRANTED BY SOMETHING ELSE.** The Seraph is not the one doing it.
That is a different relationship to the ladder than any tradition currently has, and it is the one that
would make `retrieve` feel different without needing a different verb (per §5b).

**Threads:**
- ⛔ **PRAYER AS A CRAFT SHAPE** — an ask, not an act. What does a refused prayer look like mechanically?
- **MIRACLES AS RARE AND NOT SELF-DIRECTED** — the Seraph does not choose when it works.
- ⚠️ **Resurrection specifically:** the ladder's verbs (`retrieve`, `sink`, `seal`) already exist; what a
  Seraph brings is WHO IS ASKED and WHAT IS OWED afterwards.
- **And it pairs with the existing canon** — Seraphic craft is structured nanite, and `lore/power_systems.md`
  already ties Seraphic agelessness to maintenance machinery. ⛔ **A resurrection that is maintenance
  performed by something vast is a genuinely different fiction from a warden walking down a road.**

## ⛔ BRAID — a made thing that GROWS: Given Errand × a spirit craft (Erik, 2026-08-24)

**Erik: *"Fixed at setting, but I really want to use this on other braids to make something more permanent
that can grow like a companion. Perhaps with a spirit craft."***

⛔ **`given_errand` IS DELIBERATELY FIXED — one body, one purpose, unchangeable, and it comes apart when the
duration ends.** ⚠️ **That constraint is what makes it frightening rather than useful.**

**THE BRAID LIFTS EXACTLY THAT CONSTRAINT.** Death supplies the body and the persistence; a spirit craft
supplies the thing a fixed errand cannot have — ⛔ **SOMETHING IN IT THAT CONTINUES.** The result is not a
better errand, it is a COMPANION: re-settable, bonded, and able to become someone over a campaign.

**Why it works as a braid and not as a rank:**
- ⚠️ **Death alone cannot do it.** `raised_hand`'s hard bound is NO JUDGEMENT; `given_errand` adapts but
  cannot be re-given. **Neither can hold a self.**
- ⛔ **The companion system already exists** — bond bands, stages, `downedEffect`, evolution — so the braid's
  output has somewhere to live: it becomes a companion record with stages, the way Marrow has stages.
- **And it inverts the horror into something earned:** the base craft is a thing walking toward a name for
  a winter. **The braid is a thing that started as that and became someone.**

⚠️ **NEEDS: which spirit tradition, and whether the result is a NEW companion or an existing one restored.**
⛔ **Erik's call, and it probably wants the retrieval ladder settled first — a made thing that grows and a
dead person walked back up are adjacent ideas and should not collide.**

## ⛔ THE UNDEAD TRADITION — Erik 2026-08-24: *"we have a whole undead tradition backlogged for the world"* (it was NOT written down; this is it)

⚠️ **IT IS NOT A NEW IDEA AND IT IS FURTHER ALONG THAN ANYONE REMEMBERED. Four pieces already exist:**

| piece | state |
|---|---|
| ⛔ **`greyhearth` foothill** | ✅ **RATIFIED 2026-08-16** — Erik: *"if we don't have a Foothill for the GRAVE-CALLERS, ASHWARDENS, NECROMANCERS and their adjacents, then yes there needs to be a Foothill."* Parents `ashwarden .5 / threnodist .3 / wright .2`, craft **The Burying Trades**, ⛔ **`abilities: 0`** |
| **the Grave-Callers as a people** | ✅ authored as FOES — five of them in `sunk_assay_intake`, with `targetPolicy`, typed soak layers and design notes |
| **the Necromancy school** | ✅ authored in `death_domain.json` — *"what remains of a person, ADDRESSED"* |
| **two crafts that make undead** | ✅ `raised_hand` (labour, and it grabs and slams and bites) · `driven_shade` (one purpose, pursues, wears to silhouette) |

⛔ **SO THE PLACE IS RATIFIED AND EMPTY, THE PEOPLE EXIST ONLY AS ENEMIES, AND THE CRAFTS SIT IN ASHWARDEN.**

### What the tradition would be FOR, that Ashwarden is not

⚠️ **Ashwarden's thesis is *what persists after an ending* — reading, tending, warding, walking back.**
⛔ **THE GRAVE-CALLERS' THESIS IS THE ARITHMETIC ASHWARDEN WILL NOT SAY OUT LOUD:** `raised_hand`'s own
description already states it — *"labour is short in the Palelands and the dead are many, and this is the
arithmetic the polite half of the tradition will not say out loud."*

**That is a whole people: not villains, ⛔ EMPLOYERS.** ⚠️ **A town where the dead crew the boats and turn
the mills and nobody finds it grim — `greyhearth` is authored as exactly that, *"and does not find it
grim: everyone here has handled it."***

### ⛔ ERIK'S WANT, AND IT IS THE INTERESTING PART

*"It would be awesome if these undead actually could become NPCs and companions."*

⚠️ **THE LADDER IS ALREADY IMPLIED BY THE TWO CRAFTS:** `raised_hand` has **no judgement in it** →
`driven_shade` **adapts but cannot be re-given** → ⛔ **the next rung is a thing that carries a SELF, and
neither Death craft can hold one.** **That is why the spirit braid is backlogged separately — and it may be
that the braid is not a braid at all but this tradition's own capstone.**

### ⛔ ERIK'S REFRAME, 2026-08-24 — NOT A TRADITION. A PEOPLE.

> *"I'm not necessarily talking about a new tradition — more like a PEOPLE WHO ARE THE BYPRODUCT OF THE
> YEARS THAT UNDEATH HAS BECOME A THING. The mindless zombies are a tool. The driven shade starts as
> somewhat one-dimensional but HAS TO ADAPT OVER TIME to achieve its purpose. Eventually they may become a
> NEW ENTITY through this undeath… and some undead are NEAR DUPLICATE EXTENSIONS of who they were, but with
> certain traits of the undead. The opportunities here are many."*

⛔ **BETTER THAN A TRADITION, AND IT COSTS NOTHING NEW.** A tradition is a way of working. **This is a
POPULATION — what exists after four hundred years of a craft practised on an industrial scale.** ⚠️ The
Palelands' quarries and dykes have run on `raised_hand` for four centuries; **that many raisings produce
people, not just labour.**

| | what it is | how it got there |
|---|---|---|
| **the set crew** | ⛔ a TOOL — no judgement, no self, grabs and slams | `raised_hand`, and it never changes |
| **the driven shade** | purposed, one-dimensional — ⚠️ **but it ADAPTS, and adaptation is practice at being someone** | `driven_shade`, over seasons |
| ⛔ **AFTERLINGS** | **a NEW ENTITY** — not who they were, someone the undeath made. ⚠️ Erik named them 2026-08-24 | ⚠️ **emergent — see the cocoon model below** |
| ⛔ **the returned** | **near-duplicate of who they were, carrying undead traits** | ⚠️ **already mechanised — see below** |

#### ⛔ THE MECHANISM FOR "NEAR DUPLICATE" ALREADY EXISTS: IT IS DEPTH

**`engine/death.js` grades how far a person has sunk — Threshold (a day) · Near Dark (a month) · Deep Dark
(months) · Sealed. ⛔ THAT LADDER ALREADY MEASURES HOW MUCH PERSON IS LEFT.**

- **Threshold** → ⛔ **nearly everything remains. This is the near-duplicate extension.**
- **Near Dark** → partial. Recognisable, wrong in places, gaps they cannot account for.
- **Deep Dark** → ⚠️ **a tool. There was not enough left to raise a person out of.**
- **Sealed** → nothing comes back at all.

⚠️ **ONE LADDER EXPLAINS BOTH RESURRECTION AND WHAT KIND OF UNDEAD EXISTS**, and `calling_back` and
`raised_hand` stop being two crafts and become **the same act at different depths.** ⛔ **That is a great
deal of world from machinery that shipped this afternoon.**

#### ⛔ ERIK 2026-08-24 — THE BODY IS A COCOON. THIS SUPERSEDES THE DECAY READING ABOVE.

> *"The undead body is like a COCOON for the undead spirit or energy — as it wears, THE ENTITY GETS
> STRONGER AND MORE CAPABLE. In between, IT CAN LASH OUT FROM THE BODY. This is cool and scary."*

⛔ **I HAD WEARING-DOWN AS DECAY — how much person is left. IT IS GESTATION.** ⚠️ **The body is not being
worn away; it is the SHELL THE THING INSIDE IS OUTGROWING.** That is why `driven_shade` r3 is *harder to
stop* the longer it has walked — **I authored that as flavour and it is the actual mechanism.**

**THE THREE PHASES:**

| phase | the body | the thing inside | ⚠️ |
|---|---|---|---|
| **set** | intact, a tool | ⛔ dormant, or nothing yet | the crew, the labour |
| ⛔ **BREACHING** | wearing, thinning | **growing, and it can LASH OUT FROM WITHIN** | ⚠️ **the dangerous middle — the shell still holds and the thing inside reaches through it** |
| **emerged** | spent, or shed | ⛔ **strong and capable, and no longer contained** | an Afterling, or worse |

⚠️ **"LASH OUT FROM THE BODY" IS A MECHANIC AND SHOULD BE ONE:** a strike that does not come from the
creature's reach or its limbs — ⛔ **it comes from INSIDE the shell, past armour, past position, from a
thing you have not met yet.** **The corpse is the delivery system and it is not the threat.**

#### ⛔ TWO END STATES, NOT ONE SPECTRUM — Erik's correction

> *"Purpose-driven is the NARROWING END CASE where undead become UNMINDED PURPOSE. Those are very
> dangerous. But there are MORE STABLE FORMS THAT HAVE FULL PERSONALITY."*

| | **NARROWING** | **STABLE** |
|---|---|---|
| what emerges | ⛔ **unminded purpose** — everything that was not the errand is gone | ⛔ **a whole personality** |
| how | a `driven_shade` taken to its end: four hundred miles of one thought | ⚠️ **retrieved shallow, or shelled slowly, or something else — NOT RULED** |
| danger | ⛔ **extreme.** It cannot be reasoned with because there is nothing left to reason WITH | it can be talked to, hired, married, wronged |
| name | *the driven* | ⛔ **AFTERLINGS** (Erik: *"the Beyond — or Afterlings"*) |

⛔ **THE NARROWING IS NOT THE DEFAULT AND MUST NOT BE.** ⚠️ **If every undead ends as unminded purpose the
Palelands are a horror set. Erik's stable forms are what make it a PLACE PEOPLE LIVE** — Afterlings with
full personality, cold and tireless and not healing, working the dykes because they always did.

**WHAT DECIDES WHICH: not ruled.** ⚠️ **Candidates: the depth they were raised from · whether they were
GIVEN a purpose or merely set · whether anyone attended them · whether a name was kept for them
(`names_of_the_lost` already claims to hold someone reachable).**

#### ⛔ DEATHSENSE IS THE UNDEAD DETECTOR — Erik 2026-08-24

> *"Deathsense would read the NEGATIVE LIFE POWER — it would make a great undead detector."*

⚠️ **AND ITS CURRENT `cannot` FORBIDS EXACTLY THIS:** *"Reads the living and the dying, not the
already-dead. A corpse has nothing left to sense."*

⛔ **THAT LINE IS NOW WRONG.** A corpse has nothing. **AN UNDEAD HAS THE OPPOSITE OF NOTHING — a negative
life power, an animation running the wrong way, and it should be LOUD to a craft built to read life.**

**THE REVISION, when the audit returns to it:** ⚠️ **Deathsense reads life — positive in the living,
FALLING in the dying, ⛔ AND INVERTED IN THE UNDEAD.** **A warden with Deathsense walks into a room and
knows which of the people in it are not alive, without asking and without being subtle about it** — and
against a stable Afterling that is a social problem, not a tactical one.


#### ⚠️ THE TWO ROUTES DIFFER, WHICH IS THE GOOD PART

- **THE RETURNED WERE RETRIEVED** — someone paid to bring them back, and they are who they were, minus what
  the dark kept.
- ⛔ **THE BECOME WERE NEVER RETRIEVED.** They were SET, and they walked, and somewhere in four hundred
  miles of walking toward a name there started being someone doing the walking. ⚠️ **Nobody chose that.
  Nobody can be thanked for it.**

**A society holding both would feel very differently about each, and that is where the stories are.**

#### Threads Erik has NOT ruled on

- ⛔ **Which undead traits persist even in a near-duplicate?** cold, tireless, does not heal, reads as dead
  to Deathsense — ⚠️ **and probably: cannot be raised twice.**
- **Does a shade that becomes someone STOP pursuing?** ⚠️ **Or is the first act of a new self choosing
  whether to finish the errand?** ⛔ **That is a scene and it should be one.**
- ⛔ **SPIRIT INTERTWINING** — Erik: *"definite intertwining opportunities when we get to spirit."* **A body
  that became someone and a spirit that persists are the same question from two ends, and Spirit is
  unaudited.** ⚠️ **Do not settle either alone.**
- **Where do the become LIVE?** `greyhearth` is authored, ratified, and empty.

### Threads

- ⛔ **DOES IT DISPLACE `driven_shade` AND `raised_hand` OUT OF ASHWARDEN?** ⚠️ Possibly not — a foothill is
  ACCESS, not ancestry (§30.6). **The crafts may stay Ashwarden and be LEARNABLE at greyhearth.**
- **What does the trade look like from the inside?** The Sunk Assay foreman *bargains for passage* rather
  than fighting — ⚠️ **these people negotiate, and Death now has `bargain`.**
- ⛔ **THE ASHWARDEN SCHISM (backlogged separately) IS PROBABLY THE SAME STORY.** Marrow will not hasten an
  ending, ever — **and somewhere there are the ones who chose otherwise.** ⚠️ **Greyhearth may be where they
  live, and the schism may be the tradition's founding rather than a side note.**
- **The retrieval ladder gives it a moral edge nothing else has:** ⛔ **a people who can raise the body and
  cannot walk the person back** — they have the cheap half of death and not the dear one.

### ⛔ ERIK 2026-08-24 — FOUR RULINGS THAT MAKE UNDEATH MECHANICAL

#### 1. ⛔ HEALING HARMS THE UNDEAD

> *"Straight healing applied to an undead is like straight necrotic to the living."*

⚠️ **AND HALF THE MACHINERY EXISTS.** `skill_battle_system.json` already carries affinities
`immune · resist · vulnerable · ABSORB`, and its own note says: ⛔ ***"ABSORB reports a NEGATIVE damage
amount — the blow HEALS its target — rather than becoming zero, which would read as a miss."***

**So an undead authored `decay: absorb` is ONE LINE and already works** — ⚠️ **rot mends it.**

⛔ **THE OTHER DIRECTION IS NOT BUILT: a HEAL that lands as HARM.** Affinity applies to damage types; healing
is not a damage type. **Needed: applying `heal` to an entity flagged undead deals its magnitude as `decay`
instead.** ⚠️ **A cleric mercy-healing an Afterling burns it, and does not find out until it is done.**

#### 2. ⛔ RAISING GETS HARDER EACH TIME — AND THAT IS WHY OLD HEROES ARE UNDEAD

> *"I don't agree with cannot be raised twice — however there should be a difficulty that increases per
> time… which is probably a good reason why after a long time SOME HEROES BECOME UNDEAD: it's too hard to
> raise them back to living, but they CAN CONTINUE IN UNDEATH."*

⛔ **MY PROPOSED "CANNOT BE RAISED TWICE" IS WITHDRAWN. IT WAS A WALL WHERE A CURVE BELONGS** — the same
error as `canStrike: false` and the "lite" sheet (SYSTEM_SPEC §47.14, and this is the fourth instance).

⚠️ **TWO LADDERS, AND THEY DIVERGE — THAT IS THE WHOLE IDEA:**

| | to LIVING (`retrieve`) | to UNDEATH (`raise`) |
|---|---|---|
| cost per prior raising | ⛔ **rises steeply** | ⚠️ **rises gently, or not at all** |
| effect of depth/time | ⛔ **rises steeply** | ⚠️ **gently** |
| ⛔ **the consequence** | **eventually impossible** | **still available** |

⛔ **SO A HERO FOUR CENTURIES DEAD CANNOT BE MADE ALIVE AND CAN BE MADE TO CONTINUE.** ⚠️ **That is not a
consolation prize, it is how the Palelands got its Afterlings — and it means the oldest, most storied
undead in the world are the people nobody could afford to bring back properly.** **Every one of them is
somebody's failure and somebody's mercy.**

#### 3. ⛔ WITHER ON AN UNDEAD DESTROYS THE COCOON

> *"Using Wither on an undead destroys the body — leaving a spirit that is not ready to exist outside it,
> either destroyed or very vulnerable… but FOR SOME SPIRITS IT MIGHT BE FREEING."*

⚠️ **THREE OUTCOMES FROM ONE ACT, AND THE WARDEN DOES NOT CHOOSE WHICH:**

- **DESTROYED** — nothing was far enough along. ⛔ This is what a warden usually intends.
- **VULNERABLE** — something IS there, out of its shell early, and now exposed. ⚠️ **A window in which it
  can be finished — or saved.**
- ⛔ **FREED** — it was ready. **The cocoon was the last thing holding it in.** ⚠️ **The craft meant to
  un-make undead is how an Afterling is BORN, and a warden who did not know that has made one.**

⛔ **WHICH ONE DEPENDS ON THE COCOON PHASE** (set / breaching / emerged) — **which gives the phases a
mechanical consequence rather than only flavour.**

⚠️ **AND IT IS ELEGANT THAT IT IS `wither`:** an Ashwarden craft that un-makes another Ashwarden's work,
**with a failure mode that creates the thing it was aimed at.**

#### 4. MAINTENANCE, NOT MEDICINE

> *"We need a way to heal undead — by MAINTENANCE for the body, or OTHER POWERS for the spirit."*

⛔ **TWO REPAIRS FOR TWO THINGS, AND BOTH ALREADY HAVE HOMES:**

- **THE BODY: maintenance.** ⚠️ **`kept_vigil` is ALREADY `ordered_nanite` — the same structured nanite
  behind Seraphic agelessness — and already holds a failing thing at its state.** ⛔ **It is the closest
  craft in the game to undead repair and it was not written for it.**
- **THE SPIRIT: not Death's work at all.** ⚠️ **Spirit, and Erik has already flagged the intertwining.**
  ⛔ **A cocoon-thing whose SHELL is sound and whose OCCUPANT is damaged is a problem no Ashwarden craft
  addresses, and that gap is deliberate.**

---

## ⛔ UNDEATH — PROPOSALS, in the order they unblock each other (2026-08-24)

⚠️ **THE MODEL IS NOW CANON: `SYSTEM_SPEC §48`.** This section is the WORK, not the world.

### P1 · ⛔ ERIK RULES: what decides NARROWING vs STABLE
**BLOCKS EVERYTHING ELSE.** ⚠️ Until this is ruled, no craft can say what it produces and no Afterling can
be authored. **Candidates: depth raised from · GIVEN a purpose vs merely set · whether anyone attended
them · whether a name was kept.** ⛔ **My lean: whether they were GIVEN A PURPOSE** — it makes the narrowing
something a WARDEN DID rather than something that happened, which puts the moral weight on a player.

### P2 · ⛔ ERIK RULES: undeath with no vessel and no person (§48.1's empty cell)
**A place that is undead; a working that keeps working.** ⚠️ `grey_road` already touches it. ⛔ **Decide
whether this exists before Spirit is audited, because it is the same question from the other end.**

### P3 · CCode — `heal` → `decay` on an undead (§48.5)
⛔ **The smallest real build here.** `absorb` already exists and already reports negative damage; **this is
the missing inverse.** ⚠️ **One rule, and it makes every healer in the game a hazard to the wrong target.**

### P4 · CCode — the LASH-OUT attack shape (§48.2)
⛔ **A strike from INSIDE the shell — not from reach, not from limbs, past armour and past position.**
⚠️ **Genuinely new geometry in this game; nothing else attacks from a place you are already standing next
to.** **Gate it on the BREACHING phase so the phases mean something.**

### P5 · CCode — divergent raise/retrieve curves (§48.7)
**`death.js` has the ladder; it does not have the two curves.** ⛔ **This is what produces the setting's
Afterlings, so it is worldbuilding wearing a difficulty modifier.**

### P6 · Aevi — `wither` cocoon outcomes (§48.8)
⚠️ **Next in the Death walkthrough anyway.** ⛔ **Three outcomes by phase, and the warden does not choose.**

### P7 · Aevi — Deathsense reads INVERTED life (§48.6)
⛔ **Its current `cannot` says the opposite.** ⚠️ Already audited; revisit and correct.

### P8 · Aevi — `decay: absorb` on undead sheets
**One line per sheet once P1 settles what kinds exist.** ⚠️ **Depends on the summon-sheet work
(`po/HANDOFF_ccode_summon_sheets.md`), since that is where an undead's sheet comes from.**

### P9 · ⚠️ THE SPIRIT INTERTWINING — do not start alone
**Erik: *"definite intertwining opportunities when we get to spirit."*** ⛔ **A body that became someone and
a spirit that persists are one question from two ends. Spirit is UNAUDITED.** ⚠️ **P1, P2 and the Spirit
audit should be ruled together or they will contradict.**

### P10 · Afterlings as NPCs and companions
**Erik: *"it would be awesome if these undead actually could become NPCs and companions."*** ⛔ **The
machinery exists — bond bands, stages, `downedEffect`, evolution.** ⚠️ **`greyhearth` is authored, ratified
as the Grave-Caller foothill, and carries `abilities: 0`.** **The place to put them is empty and waiting.**

### P11 · ⚠️ BRAID — WITHER AS GROUND PREPARATION (Erik, 2026-08-24)

**Erik: *"it would be sick to have Wither able to be a GROUND PREP skill… but I think I'll leave that as a
COMBO/BRAID with other wards."*** ⛔ **Ruled as a braid, not a rank — recorded so it is not quietly authored
into `wither` later.**

**THE IDEA:** `wither` r3 already takes ground — *"the terrain itself becomes unreliable underfoot."*
⚠️ **A braid with a WARD craft turns that from an effect into a PREPARED POSITION:** rot a field before
anyone stands in it, lay the ward into the rotted ground, and the ground itself becomes the working.

**WHY IT IS A BRAID AND NOT A RANK:**
- ⛔ **`wither` un-makes and a ward holds.** Neither can prepare ground alone — one only destroys, the other
  only defends what is already there.
- ⚠️ **It inverts the craft's own morality.** r3's `cannot` says the commonest use of Wither is *starving a
  valley*. **A braid that makes ground a DEFENCE is the first constructive thing the craft has ever done.**
- **And it pairs with the existing ward vocabulary** — a decay-typed ward laid into decayed ground is
  thematically exact, and `death_ward` already wards `decay`.

⚠️ **NEEDS: which ward craft, and whether the prepared ground persists without attention (like `kept_vigil`)
or requires holding.** ⛔ **Erik's call.**

## ⛔ BROKEN RELATIONSHIPS — no authored break-states (Erik, 2026-08-29)

**Erik: *"I agree with you that we need to work broken relationships."***

⛔ **THE ENGINE HAS BOND BANDS AND `downedEffect`. IT HAS NOTHING FOR A RELATIONSHIP GOING WRONG.**
⚠️ Surfaced while writing `PLAYERS_GUIDE` Part XI: I could describe what each of the nine companions
BRINGS and what their loss COSTS, and could not describe **what it looks like when one stops trusting you**
— because nobody has authored it.

**What exists to build from:**
- ⚠️ **Two cases the content already implies:** `ember` is half-wild and *"whether it returns is a real
  question"*; `hush` *"had not finished deciding about you."*
- **Bond bands run 0–10** and drive companion stages, so the mechanism for a relationship having a STATE
  is already there — ⛔ **it only moves upward.**

**What is missing, and it is content before it is engine:**
1. ⛔ **What a break IS, per companion.** ⚠️ **It should not be one rule — Bristle leaving is not Hush
   withdrawing is not Quill going quiet.**
2. **What causes it.** Bond decay from disuse? A specific act? ⚠️ **Erik's ruling that relationships are
   held by ATTENTION suggests disuse is the honest driver, not a betrayal flag.**
3. ⛔ **Whether it is recoverable, and at what cost** — and whether any of them are NOT.
4. **What the player sees before it happens.** ⚠️ **A break with no warning is a punishment; a break with a
   warning is a relationship.**

⛔ **ADJACENT AND PROBABLY THE SAME WORK: §48's Afterlings.** A driven shade that becomes someone, and a
companion who stops being yours, are the same question about a bond that has changed state.

## ⛔ ARC SCALE AND THE "VALLEY" NAMING (Erik, 2026-08-29)

**Erik: *"the arcs should be WORLD scale, not just valley scale (although we should give arcs INTENTIONAL
SCALING I guess — some are local quest arcs, regional, then continental or global). CALLING THE WORLD THE
VALLEY MAKES IT SOUND TINY."***

### ⛔ 1. THE SCALE VOCABULARY IS HALF-AUTHORED

| | |
|---|---|
| arcs carrying `scale: world` | 3 |
| arcs carrying `scale: regional` | 2 |
| ⛔ **arcs carrying NO scale at all** | ⛔ **6 — every arc in `world_superstructure.json`** |

⚠️ **AND THE FILE NAMES CONTRADICT THE CONTENT:** `world_superstructure.json` holds the six **UNSCALED,
valley-local** arcs, and `greater_arcs.json` holds the **world- and regional-scale** ones. ⛔ **The
world-named file is the local one.**

**Proposed ladder, four rungs — Erik's own list:**
`local` (a quest arc: one place, one question) · `regional` · `continental` · `world`

⚠️ **`docs/ARCS.md` currently calls the six "THE SIX VALLEY ARCS" and that is the naming Erik is objecting
to.** ⛔ **They should read as `local` and `regional` arcs OF a world, not as "the valley's arcs" in a
setting whose scope is a valley.**

### ⛔ 2. "THE VALLEY" IS DOING TOO MUCH WORK — 374 OCCURRENCES

**Across `content/packs`, `docs/` and `SYSTEM_SPEC.md`.** ⚠️ **It names a REGION and it has been standing in
for the WORLD**, which is why the setting reads smaller than it is — the greater arcs already cross *"all
Reaches"*, the Gearlands, the Blocklands, the manifest domains and *"every deep site."*

⛔ **THIS IS NOT A FIND-AND-REPLACE.** Most of the 374 correctly name the region a player starts in.
✅ **The work is separating the two senses and naming the world**, which as far as I can measure **has no
name at all** — the greater arcs say *"world-wide"* and *"the whole world"* and never a proper noun.

✅ **RESOLVED 2026-08-29 — THE WORLD IS `EXESA`.** Latin `exedō`, *eaten away, gnawed hollow from within*.
⚠️ Erik: *"sounds like Earth, but less and further along."* ⛔ **The world is about a third of its former
size, spent by its own people on their own workings.** Authored in `world_framing.the_world_is_named`.
**The rename is unblocked; the classification work in `po/SPEC_staleness_ratchet.md` is what remains.**

---

## ⛔ NPCs PUSHING AND PULLING ON ARCS — vs the new battle and arc systems (Erik, 2026-08-29)

**Erik: *"backlog an update to how our NPCs pushing and pulling on arcs interact with the new battle
systems and this arc update."***

**What exists:** `arc_response.json` (52 entries) · `tradition_motivations.prominentArcHolders` (6) ·
`hingeNpcs` on all 11 arcs · the seeking clock (`engine/seeking.js`) · `drivenNpcDirective`.

⛔ **WHAT HAS CHANGED UNDER IT SINCE ANY OF THAT WAS WRITTEN:**

| new system | why the arc layer has not caught up |
|---|---|
| **folded allies are mortal** (CCODE-298) | ⚠️ **an NPC pushing an arc can now LOSE PEOPLE doing it** — and nothing models that as arc pressure |
| **`downedEffect` can fire** | a hinge NPC going down should move the arc it hinges. ⛔ **Nothing connects the two** |
| **projects: interrupt · resume · sabotage · inherit** | ⛔ **`sabotageProject` is EXACTLY an NPC pushing against an arc** and it is not wired to arcs at all |
| **the death ladder** | ⚠️ **a hinge NPC at depth 2 is an arc that can still be saved.** `hingeNpcs` does not know the ladder exists |
| **arcs resolve permanently** | ⛔ **what happens to an NPC whose arc CLOSED?** The Patient Buyer with the crossroads bought is a different person, and nothing says so |

⚠️ **THE SHAPE OF THE QUESTION: an arc currently moves because a STAGE advances. ⛔ It should also move
because someone WORKED at it — and now that NPCs can be hurt, hindered, sabotaged and killed by the same
systems a player uses, the pushing should cost them what it costs a player.**

⛔ **AND THE REVERSE, WHICH IS THE GENERATIVE HALF ERIK ASKED FOR: a closed arc leaves a wake, and its
hinge NPCs are the most likely seeds of what rises next.**

## ⛔ FULL BALANCE AND GAP CHECK — after the first audit pass (Erik, 2026-08-29)

**Erik: *"put a full balance and gap check in the backlog for when we're done with the first audit pass."***

⚠️ **NOT NOW.** ⛔ **Four traditions of thirteen are audited, and a cross-tradition comparison run on a
third of the corpus measures the AUDIT ORDER, not the design.** The Death numbers below are the proof:
Death looks broadest at 24/28 verbs **because it was audited first and had every gap closed**, not
necessarily because it is broad.

### What the first pass has already shown, and what to re-run at the end

**As of four traditions — Death (ashwarden+threnodist), Mind (cogitant), Body (somatic), Light (blazeborn):**

| | crafts | harm | verbs | families |
|---|---|---|---|---|
| **DEATH** | 37 | 15 | ⛔ **24/28** | vital 5 · intrinsic 3 · physics 2 · elemental 1 |
| **MIND** | 14 | 6 | 19/28 | intrinsic 4 · physics 2 |
| **BODY** | 12 | 3 | 16/28 | physics 4 · **vital 1** |
| **LIGHT** | 16 | 6 | 19/28 | physics 4 · elemental 3 · intrinsic 3 |

✅ **THE MODEL IS HOLDING:** no damage type appears in two traditions except `physical`, which
`damage_types` calls *"the default when no type is named."* **Signature/secondary is emerging without
anyone enforcing it.**

⚠️ **TWO GAPS FOUND AND CLOSED THIS SESSION, BOTH BY ERIK READING THE TABLE:**
`second_wind` → `vitality` (Body had no vital family at all, in a tradition whose r3 *heals outright*) ·
`unshadow` → `hinder` (Light had none, in a tradition whose signature act is DAZZLE AND BLIND — **and the
craft already declared `shape: hobble`, so the shape said it impairs and no rank said how**).

### ⛔ WHAT THE FULL CHECK MUST ASK

1. ⛔ **EVERY TRADITION SHOULD HAVE A WAY TO DO EVERY VERB, IN ITS OWN IDIOM. A GAP IS A GAP UNTIL SOMEONE
   ARGUES IT THEMATICALLY.**

   **Erik 2026-08-29, correcting me: *"Body doesn't need to be limited as you are thinking it should be.
   EVERY TRADITION WILL LIKELY HAVE A WAY TO DO ALL THE THINGS IN THEIR OWN WAY. KI IS ENERGY AND THIS IS A
   FANTASY GAME. I can think of a STUNNING STRIKE pretty easily."***

   ⚠️ **I had written the opposite** — that Body's missing `bind`, `ward`, `make`, `command` and `summon`
   *"read as characterisation, not a hole."* ⛔ **THAT IS ME IMPORTING REAL-WORLD LIMITS INTO A FANTASY
   SETTING AGAIN** — the same error as reading visible magic as socially remarkable, and as treating consent
   as a design lever. **A somatic cannot bind? A joint lock. Cannot ward? An iron body. Cannot hinder? A
   STUNNING STRIKE, which is trivially obvious the moment it is said.**

   ✅ **SO THE DEFAULT INVERTS: assume the craft is missing, not that the people refuse it.** ⛔ **The burden
   is on the THEMATIC ARGUMENT, not on the gap.** ⚠️ **If a gap survives at the end, it must be defensible
   from the tradition's own `civilization` and `aesthetic` lines — and written down as a refusal, so nobody
   re-opens it as a hole.**

   **Known candidates to check for, not assume away:** ⛔ **BODY: a stunning strike (`hinder`), a joint lock
   (`bind`), an iron-body ward, a shout that carries command.** ⚠️ **LIGHT/MIND/DEATH: whatever the same
   question turns up when asked in their idiom rather than mine.**
2. **Does every tradition span at least two families?** ⚠️ Body did not until today.
3. ⛔ **Is any type stranded in one tradition that should be shared?** `vitality` now spans Death and Body,
   which is better than Death alone.
4. **Does each tradition's damage mix match its authored `aesthetic` and `civilization` line?** ⚠️ Light's
   three families came directly from *"revelation as violence… no shadow permitted."*
5. ⛔ **READ THE AUTHORED PLACES AND ORIGIN TEXT, not just the craft list.** ⚠️ **`the_lensward` described
   the focusing arrays as *"the beam-craft that makes them feared"* and no such craft existed.** **The
   world says what a people does before the craft list catches up, and that check found two crafts.**
6. **Energy bands, harm rungs and intensity pairs across all thirteen at once** — ⛔ **the unmigrated-batch
   fingerprint (empty `notFor` + lowercase challengeTypes + below-band energy TOGETHER) has now appeared in
   Death, Mind, Body and Light. Expect it in the remaining nine.**

## ⚠️ GLOBAL DAMAGE-CURVE AND LEVEL-DISTRIBUTION CHECK (Erik, 2026-08-29)

**Erik: *"Fix the curve — make a note to check this GLOBALLY."***

### ✅ THE CURVE ITSELF IS HEALTHY — measured across all 397 crafts

| level | crafts | avg damage | spread |
|---|---|---|---|
| L1 | 17 | 3.6 | 2.5–7.0 |
| L2 | 34 | 6.1 | 3.5–7.0 |
| L3 | 13 | 8.5 | 3.5–10.5 |
| L4 | 8 | 12.2 | 7.0–14.0 |
| L5 | 8 | 17.1 | 14.0–17.5 |

⛔ **A CLEAN PROGRESSION, and the Marcher weapons all sit ON it.** ⚠️ **MY "FLAT CURVE" READING WAS WRONG
and this is the correction: what looked flat was that EVERY MARCHER WEAPON IS L2.** The curve is fine; **the
LEVEL DISTRIBUTION is the defect.**

### ⛔ WHAT TO CHECK GLOBALLY

1. ⛔ **L2 HOLDS 34 OF 80 DAMAGE CRAFTS — nearly half the game's harm sits on one rung.** ⚠️ L3 has 13, L4
   has 8, L5 has 8. **Check whether that is deliberate (most fighting happens at low level) or whether
   traditions default to L2 when nobody chose.**
2. ⚠️ **SPREAD AT L3 IS 3.5–10.5 — a threefold range on one rung.** ⛔ Something at L3 doing 3.5 is doing
   L1 damage for L3 access; either it buys something else, or it is mispriced.
3. ⛔ **L4 SPREAD REACHES DOWN TO 7.0**, which is L2 damage at L4 access.
4. **Per-tradition level distribution**, not just damage: ⚠️ **the Marcher finding was that a tradition can
   be entirely on-curve and still have a hole, because all its weapons landed on one rung.**
5. ⚠️ **Non-damage crafts have no curve at all** and nothing checks whether an L4 ward is meaningfully
   better than an L2 one.

⛔ **DO NOT RUN THIS UNTIL THE FIRST AUDIT PASS IS DONE** — same reason as the balance-and-gap check: at
seven of thirteen traditions it would measure the audit order.

## ⛔ SPIRIT AS A PERMEATING FIELD, NOT A FOURTEENTH BOX (Erik, 2026-08-30)

**Erik, on Spirit having 10 crafts against Death's 32: *"Spirit is interesting — I could see some spirit
skills in Death, Light, Dark, etc. It's kind of a PERMEATING FIELD, and that could make sense if we tie it
to the PRECURSOR/VEIL ENTITY POWERS."***

### ⚠️ WHY THIS IS BETTER THAN GIVING SPIRIT MORE CRAFTS

⛔ **The imbalance is real** — under the fourteen, Spirit has **10** and Death has **32**, and Spirit
carries **Parakletos, the Thinnings and the Veil contact point**: the most cosmologically loaded tradition
with the fewest crafts.

⚠️ **THE OBVIOUS FIX IS TO AUTHOR 20 MORE NUMINOUS CRAFTS. ERIK'S IS BETTER AND STRUCTURALLY DIFFERENT:
spirit is not a box, it is a FIELD that runs through the others.** ✅ **A Death craft can be spirit-touched.
So can a Light one.**

### ⛔ AND THE COSMOLOGY ALREADY SUPPORTS IT

**`the_three.md`: PARAKLETOS took neither side and DISTRIBUTED ITSELF INTO THE SUBSTRATE** — *"what answers
every craft in the world."* ⚠️ **A distributed entity is by definition not a tradition. It is a field.**

⛔ **AND THE MECHANISM IS ALREADY BUILT AND ALREADY CARRIED:** `powerSystem` is per-craft, not
per-tradition, and `veil` is a legal value with two carriers (`uttered_name` — an UMBRAL craft, not a
numinous one). **A veil-powered craft inside another tradition is not a new idea; it shipped this week.**

### ⬜ WHAT TO WORK OUT

1. ⛔ **Is spirit a `powerSystem`, a craft PROPERTY, or a sect that spans traditions?** ⚠️ The third is new
   shape and the first two exist.
2. **What does spirit-touched MEAN mechanically** — does it reach where the substrate reaches? Does it
   answer to `arc_the_disagreement`?
3. ⚠️ **Which existing crafts are ALREADY spirit-touched and mislabelled?** `uttered_name` (veil, umbral),
   `deathless`, the retrieval ladder, the Thinnings crafts. ⛔ **Measure before authoring — this may be a
   RECLASSIFICATION rather than new content**, which would fix the imbalance without a single new craft.
4. **Does it change the 14?** ⚠️ If spirit permeates, Spirit-as-a-primary may be the wrong shape entirely —
   and that is a merger question, so it wants deciding BEFORE the migration runs, not after.

⛔ **DO NOT AUTHOR SPIRIT CRAFTS UNTIL 3 IS MEASURED.** The corpus may already be carrying them.

## ⬜ FRIENDLY FIRE — a potential future feature, and 12 crafts already waiting for it

**Erik, 2026-08-30: *"You will not harm your own. I HATE GAMES THAT DO THAT. However in this case I can see
the POTENTIAL for friendly fire — we can log this and others like it under a potential future friendly-fire
feature."***

### ⛔ THE STANDING RULE, WHICH I KEPT VIOLATING

**A craft does not harm the player's own side.** ⚠️ **I wrote ally-harm into SIX crafts this session** —
`edge`, `in_the_way`, `slow_cup`, `swallowed_word`, `grey_ground`, `reaping_sickle` — ✅ **all corrected.**

⛔ **AND IT IS THE SAME INSTINCT AS TWO HABITS ERIK HAS ALREADY CORRECTED**: the narrative-cost in `cannot`
blocks, and the punishment-surge. **I keep pricing power in harm to the player's own side**, and it reads
as depth while being the thing he most dislikes.

### ⬜ THE 13 PRE-EXISTING CRAFTS — NOT REWRITTEN, LOGGED

**These were authored before this session and I have left them alone deliberately** — a dozen silent
rewrites would lose the design question Erik is opening. **They are the feature's natural first content:**

| craft | what it currently says |
|---|---|
| ⛔ `edge` r3 | *"does not sort: whoever is inside the arc is inside it"* — ⚠️ **I removed this and Erik reverted it: *"don't act on anything we've already audited until we evaluate it"*** |
| `blaze_wall` | *"your own people are stopped exactly as well"* |
| `felt_wall` | *"everything in it, all at once, including your own party's fear"* |
| `last_lament` | *"your enemies hear it too, and they are FREED"* |
| `light_bending` | *"the flash hits everyone in range including your own side, unless they were told beforehand"* |
| `seized_works` | *"any ally relying on a seized work…"* |
| `hastened_grey` | *"call it all due; your own are inside the…"* |
| `offered_mouth` · `snaring_green` · `spent_hour` · `the_long_odds_come_in` · `bark_and_briar` · `unshadow` | *"does not sort"* in various forms |

### ⚠️ WHAT THE FEATURE WOULD NEED TO DECIDE

1. ⛔ **Is friendly fire OPT-IN per table, per craft, or per difficulty?** ⚠️ **Erik's dislike is of games
   that impose it**, which points at opt-in rather than removal.
2. **Does an ally get a save, a warning, or an exemption?** ⚠️ `light_bending` already authors the
   interesting version: *"unless they were told beforehand"* — **coordination as the counterplay.**
3. ⛔ **Does the AI GM narrate it, or does the engine resolve it?** A craft that "does not sort" is
   currently prose either way — **nothing in the engine sorts targets by side.**
4. ⛔ **`in_the_way` IS THE EXCEPTION AND ERIK RULED IT SO: *"keep in the way able to target allies."*** ⚠️ **I
   had removed that under the no-harm rule and it was over-application.** ✅ **THE DISTINCTION THAT MATTERS:
   the rule is about crafts that hit your side WITHOUT YOU CHOOSING IT — an area that "does not sort". It is
   not about a craft whose SUBJECT is deciding who takes the blow.** ⛔ **That craft is friendly fire as a
   DELIBERATE ACT, and it is the cleanest argument for building the feature.**

5. ⚠️ **SCOPE OF ACTION, RULED: *"only the ones you just added."*** ⛔ **Crafts already audited are not to be
   edited for this until the feature is evaluated** — five crafts I authored this session were corrected;
   `edge` was reverted because it is pre-existing.

### ⛔ SPIRIT, DEEPER: THE PRECURSOR WAR MAY BE **ABOUT** AND **POWERED BY** SPIRIT

**Erik, 2026-08-30: *"Perhaps it makes sense that the precursor war is about and POWERED BY spirit — the
thing the nanotechnology and lattice and veil and metaphysical are all EXPRESSING."***

⛔ **THIS WOULD MAKE SPIRIT THE SUBSTRATE UNDER THE FOUR POWER SYSTEMS, NOT A FIFTEENTH ONE.**
`ordered_nanite` · `wild_nanite` · `veil` · `metaphysical` — ⚠️ **four expressions of one thing, rather than
four things.**

✅ **AND IT MAKES THE COSMOLOGY COHERE IN A WAY IT CURRENTLY DOES NOT:**

- ⛔ **PARAKLETOS DISTRIBUTED ITSELF INTO THE SUBSTRATE** — *"what answers every craft in the world."* ⚠️ If
  spirit is what the substrate IS, that is not a metaphor: **Parakletos is the field, and every craft in
  the game is already running on it.**
- ⛔ **AKINETOS LAID THE LATTICE. KENOSIS EMPTIED ITSELF.** ⚠️ **Both are acts performed ON spirit** — one
  builds a structure to hold it, one pours it out.
- ⛔ **THE VEIL IS *"the shape of a hole where something enormous stopped being present."*** ⚠️ **A hole in
  WHAT? If the answer is spirit, the Veil stops being a wall and becomes an ABSENCE IN THE FIELD** — which
  is why the Unlit, who want the void back, are drawn to it.

⚠️ **AND IT GIVES `arc_the_disagreement` A SUBJECT.** Today the argument is about *whether the seeded have
standing.* ⛔ **If the war is powered by spirit, the argument is also about WHAT SPIRIT IS FOR — and the
lattice is one answer, Kenosis's emptying is another.**

⬜ **ERIK: *"I'm thinking we need to see how this settles in."*** ✅ **So this is recorded and NOT built.**
⚠️ **The measurement from the entry above still comes first:** how many existing crafts are already
spirit-touched and mislabelled. ⛔ **If the answer is "most of them", this is not new content — it is the
name of something already there.**

## ⚠️ NAMING SWEEP — 76 pre-existing "The" names, and 6 duplicate rank names

**Erik has corrected the leading-article habit twice** (`The Given Name` → `Uttered Name`;
`The Quiet That Stays` → `Void Space`). ⛔ **Both times I self-checked CRAFT names only and reported clean —
while FOURTEEN RANK NAMES I had authored were still carrying it.** ✅ **Mine are fixed. The self-check was
measuring the wrong field, which is why the habit survived being caught twice.**

⬜ **NOT ACTED ON, per Erik's scope rule (*"don't act on anything we've already audited"*):**

- ⛔ **76 craft and rank names across the corpus still open with "The"** — pre-existing, and a sweep would
  touch audited traditions.
- ⚠️ **6 DUPLICATE RANK NAMES**, which is the more interesting find: `Word That Holds` · `Harbor` ·
  `Nothing Hidden` · `Full Restoration` · `Break the Line` · `Standing Account`. ⛔ **`Harbor` is both a
  craft and a rank of another craft**, and **`Break the Line` is a rank name AND a craft I authored** —
  which is a real collision rather than a style question.

✅ **WORTH A GATE RATHER THAN A SWEEP:** a check that no two ranks share a name, and none shares a name with
a craft. ⚠️ **A duplicate rank name is a thing a GM or a player can actually be confused by**, unlike a
leading article.
