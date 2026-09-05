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
### ⛔ MEASURED PROPERLY — TWO KINDS, AND ONE OF THEM IS A FALSE POSITIVE

⚠️ **My first count said "6 duplicates" and was wrong in both directions.** Measured:

**✅ NOT A DEFECT — an r1 sharing its own craft's name.** ⛔ **That is the CONVENTION**, and ~140 crafts do
it. A gate must exclude it or it will report the whole corpus.

**⚠️ 23 RANK NAMES USED BY TWO DIFFERENT CRAFTS** — `Word That Holds` is on three (`verity` r3,
`set_word` r2, `turning_word` r2). Also `Clean Break` · `Deep Road` · `Nothing Hidden` · `Open Door` ·
`Reckoning` · `Scattering` · `Set Stance` · `Hour Given` and others. **Mostly harmless; a GM says the craft
name, not the rank name.**

**⛔ 14 REAL COLLISIONS — a rank named after a DIFFERENT craft that exists:**

| the name | is a craft | and also a rank of |
|---|---|---|
| **Break the Line** | `break_the_line` | `force_the_move` r2 |
| **Chosen Ground** | `chosen_ground` | `read_field` r2 |
| **Harbor** | `harbor` | `umbracraft` r2 |
| **Held Line** | `held_line` | `stand` r2 |
| **Long Dark** | `long_dark` | `darksight` r2 |
| **Read the Fight** | `read_the_fight` | `deduced_strike` r1 |
| Established Fact · Fixed Point · Held Breath · Long Road · Long Watch · Raised Thing · Sound Repair · Standing Word | | |

⛔ **THESE ARE THE ONES THAT CAN MISLEAD:** *"take Held Line"* is ambiguous between a Marcher craft and a
rank of `stand`. ⚠️ **AND TWO ARE MINE** — `break_the_line` and `chosen_ground`, authored this session
against rank names that already existed.

✅ **WORTH A GATE, NOT A SWEEP:** assert that no rank is named after a DIFFERENT craft. ⛔ **It must exempt
r1-matching-its-own-craft**, or it reports 140 false positives and gets switched off.

## ⛔ THE "IS THIS WORTH IT" PASS — primary effects that are flavour wearing a number

**Erik, 2026-08-30: *"We need a good pass of 'IS THIS WORTH IT' for the PRIMARY EFFECT of a skill. As a
side effect, giving someone a painless interval is nice — but NOT WHAT MAKES IT A MECHANIC."***

### ⛔ THE WORKED EXAMPLE, AND IT IS DAMNING

**`last_gift` was L4, e9, `shape: bolster`, `magnitude: 6`.** ⚠️ **It STRENGTHENED a person who is about to
stop existing.** ⛔ **A rating of 6 out of 10 on someone with no next round is a number that does nothing** —
and it passed every gate in the project, because the gates check that a field is present and read, never
that it MATTERS.

✅ **FIXED: the primary effect is now an ACTION the dying would not have had** — a testimony, a name, a
thing put in the right hand, a working completed by someone who will not see it work. ⛔ **That is worth L4:
it is the only craft in the game that buys a turn from someone who has run out.**

### ⬜ THE PASS ITSELF — NOT YET RUN

**The check is not "does it have a mechanic", it is "would a player spend the slot".** ⚠️ **A gate cannot
ask that**, which is why this is a reading pass and not a script. **Candidate signals to sort by:**

1. ⛔ **`bolster`/`setup` crafts whose magnitude applies to something that cannot use it** — the `last_gift`
   shape exactly.
2. ⚠️ **High level, high energy, and only `duration` or `magnitude` in the mechanic block** — nothing that
   changes what a player can DO.
3. ⛔ **Crafts whose `plainly` is mostly narration.** If the plain-text version reads as a scene rather than
   an effect, the effect may not be there.
4. ⚠️ **Anything where the ranks add scope but never capability** — three ranks of "more of the same" is
   one rank charged three times.

### ⚠️ AND IT SURFACED A SIXTH INVENTED FIELD

**`_grantsAction_PROPOSED`.** ⛔ **Checked first: nothing in `engine/` grants an extra action to a TARGET.**
`perfect_motion` r3 grants one to the WIELDER and does it in prose. ⚠️ **So it is a real gap — and it is the
same target-affordance hole CCode found in `resolveHeal`: YOU CANNOT DO A THING TO AN ALLY.** ⛔ **That one
hole now blocks three separate features.**

## ⛔ FOLK ACCESS IS UNEVENLY IMPLEMENTED — 12 of 24 POLES HAVE NONE

**Erik, 2026-08-30: *"There is no folk tradition. Only the poles are traditions. The 'folk' idea was just
that EVERYONE COULD ACCESS A SMALL NUMBER OF ABILITIES FROM EACH DOMAIN."***

✅ **The mechanism now exists** — `folkAccessible: true`, an ACCESS flag on the craft rather than a category
of tradition. ⛔ **But it is only on the 18 crafts that came out of `valley_craft`, so it reflects what the
old label happened to contain rather than the rule Erik describes.**

| poles WITH folk access | mason 3 · horizon 2 · marcher 2 · rootkin 2 · stillhold 2 · lattice 1 · threnodist 1 · umbral 1 · veilwright 1 · wright 1 |
|---|---|
| ⛔ **poles with NONE** | **abyssal · ashwarden · blazeborn · churnfolk · cogitant · enginewright · figurist · hourkeeper · numinous · seraphic · somatic · syllogist · unmaker · verist** |

⚠️ **THAT IS 12 OF 24 WITH NOTHING OPEN**, and the twelve that have some only have them by inheritance.

### ⬜ WHAT NEEDS DECIDING BEFORE THIS IS FILLED

1. ⛔ **HOW MANY PER POLE?** Erik says *"a small number."* The current spread is 1–3 and was accidental.
   **Two or three looks right and it should be the same everywhere**, or the rule is not a rule.
2. ⚠️ **WHICH ONES?** The natural candidates are each pole's **first gift and its L1 crafts** — the things a
   valley farmer could plausibly have picked up. ⛔ **But some L1 crafts are a tradition's FIRST OFFENSE
   (`offered_mouth`, `broken_quiet`, `hastened_grey`), and those should almost certainly NOT be open.**
3. ⛔ **DOES OPEN MEAN FREE?** `traditions.json` already carries an open-learning rule for the Valley's folk
   crafts. **Folk-accessible probably means learnable WITHOUT a teacher or tome**, which is the gate every
   other craft passes through — but that is a rules statement and it is Erik's.

⚠️ **I HAVE NOT ASSIGNED ANY**, because picking two or three open crafts for twenty-four traditions is a
design pass and not a cleanup — and doing it by guess would bake the same accident in deeper.

## ⬜ BUILDING NEEDS HIDDEN PASSAGES AND DECEPTIVE ARCHITECTURE (Erik, 2026-08-30)

**Erik, on my claim that Building refuses `conceal`/`deceive`: *"Hidden passages and deceptive
architecture… seems like maybe something there. But we can take that in the later pass."***

⛔ **HE IS RIGHT AND MY REFUSAL WAS TOO ABSOLUTE.** I argued *"a domain that makes things people stand on
cannot lie about them"* — **but a priest hole is masonry, a false wall is built, and a maze is architecture
that deceives on purpose.**

✅ **THE DISTINCTION THAT SURVIVES, AND IT IS SHARPER THAN THE REFUSAL WAS:**

⛔ **They do not lie about a thing's SOUNDNESS.** `worth_the_work` is *"name what a job actually costs and be
believed"*, and r3 is a word taken in advance across a whole region. ⚠️ **A Mason will not tell you a wall
will hold when it will not.**

✅ **A Mason will absolutely build you a wall nobody knows is a door.** **Those are different acts and I
collapsed them.**

### ⬜ CANDIDATES WHEN THIS IS PICKED UP

- **MASON** — the built concealment: a passage in the fabric, a room that is not on the plan, a stone that
  is a hinge. ⚠️ **Reads against `sound_read`, which NAMES a load path — so a Mason's hidden work is hidden
  from everyone except another Mason.** That is a good tension.
- **WRIGHT** — the made thing that is not what it appears: a mechanism with a second purpose, a lock that
  reports who opened it.
- ⛔ **NOT STILLHOLD.** Their trade is brokered truce and it fails the moment it is dishonest. **The refusal
  survives for one of the three, which is why the domain-level claim was wrong and a per-pole one is right.**

⚠️ **AND IT IS A LESSON ABOUT MY ARGUING:** a refusal that sounds good at domain level can be false for two
of three poles. **Argue refusals AT THE POLE**, then check whether they hold for all of them.

## ⛔ SPIRIT ALREADY PERMEATES — MEASURED, AND IT ANSWERS ERIK'S QUESTION

**Erik, 2026-08-30: *"Spirit is interesting — I could see some spirit skills in Death, Light, Dark, etc.
It's kind of a PERMEATING FIELD… perhaps the precursor war is ABOUT and POWERED BY spirit — the thing the
nanotechnology and lattice and veil and metaphysical are all EXPRESSING."***

⬜ **I said the measurement had to come first: how many crafts are ALREADY spirit-touched and mislabelled.**
✅ **Measured 2026-08-30, after 20 of 24 poles were audited. Here it is.**

| powerSystem | crafts |
|---|---|
| ⛔ **`metaphysical`** | ⛔ **142 of 412 — THE LARGEST SOURCE IN THE GAME** |
| `precursor` | 132 |
| `ordered_nanite` | 63 |
| `wild_nanite` | 45 |
| `combination` | 28 |
| `veil` | 2 |

⛔ **AND ONLY 8 OF THE 142 ARE NUMINOUS.** **134 metaphysical-or-veil crafts sit OUTSIDE Spirit** — marcher
26 · ashwarden 23 · veilwright 15 · cogitant 14 · somatic 13 · stillhold 13 · verist 11 · rootkin 6.

### ✅ SO SPIRIT ALREADY PERMEATES. IT HAS FOR A LONG TIME. NOBODY CALLED IT THAT.

⚠️ **AND `power_sources` DESCRIBES IT IN EXACTLY ERIK'S TERMS WITHOUT USING THE WORD:** *"`metaphysical` —
**mind reaching past matter**, opened by the Transition… **THE OLDEST WAY, AND THE ONE THE LATTICE WAS BUILT
TO REPLACE.**"*

⛔ **THAT IS THE PRECURSOR WAR IN ONE LINE.** The lattice was built to replace the oldest way — and Akinetos
laid the lattice. **If spirit is what the lattice was built to replace, the war is about spirit and the
corpus has been saying so in a field name.**

### ⬜ WHAT THIS MEANS FOR THE MERGE, AND IT IS A REAL QUESTION FOR ERIK

⚠️ **`Spirit` as a fourteenth domain holding 10 crafts is not the shape of this.** ⛔ **Spirit is not a
domain with too few crafts; it is a SOURCE that 142 crafts already run on, and `numinous` is simply the
people who do it deliberately.**

⬜ **THREE READINGS, AND ERIK'S CALL:**
1. **Leave it.** Spirit is a domain, `numinous` is its pole, and the 142 are just crafts that happen to use
   a source. ⚠️ Then Spirit stays the smallest of the fourteen and the imbalance is real.
2. ⛔ **Spirit is not a domain at all — it is the FIELD**, and `numinous` belongs somewhere else. **Then the
   fourteen become thirteen** and the merger table changes.
3. ✅ **Spirit stays a domain AND is named as the field.** `numinous` are the people who practise it
   directly; everyone else uses it without a name for it. ⚠️ **This is the only reading where both facts
   stay true**, and it costs nothing structurally.

⛔ **DO NOT AUTHOR SPIRIT CRAFTS TO FIX THE IMBALANCE.** The imbalance is not a content gap — **it is a
category error about what spirit is**, and adding ten crafts to `numinous` would bury it.

## ⛔ `foresee` HAS NO MECHANICAL MEANING — 15 OF 35 CRAFTS PRINT THE ENGINE'S FALLBACK

**Erik, 2026-08-30: *"Mechanically what does foreseeing do for you? It's very important to the narration —
and NARRATION BECOMES FACTS, so that's good. But it could also give situational bonuses."***

### THE MEASUREMENT

| | |
|---|---|
| crafts carrying `foresee` | **35** |
| ⛔ **resolving to** *"reveals information or sets up a later action"* | ⛔ **15** |
| ✅ carrying a **named advantage** | **3** — and all three are recent |

⚠️ **That sentence is the engine's FALLBACK GLOSS.** It has no meaning for the verb, so it prints
boilerplate. ⛔ **`foresee` is the largest purely-narrative verb in the game and it got there BY DEFAULT
rather than by design.**

### THREE SHAPES, AND ERIK NAMED THE BEST ONE

⛔ **1 · NARRATION BECOMES FACT — and in this game that IS a mechanic.** The AI GM treats narration as canon,
so a foreseeing that establishes something **makes it true**. *"The bridge fails in spring"* is not a hint;
it is now a fact about the world. ✅ **No other system gets this cheaply and we get it for free.**
⚠️ **NEEDS A RULE ABOUT WHO MAY CONTRADICT IT**, or foresight is unbounded authorship.

✅ **2 · A NAMED ADVANTAGE, BANKED.** Already working on `chosen_ground`, `who_falls_first` and
`planted_years`: the foreseeing **names a specific thing, and acting on that thing carries a bonus.**
⚠️ **It is a vocabulary that does not exist yet** — this wants the treatment `gainAxes` got: a closed list
and a gate.

⚠️ **3 · RULING OUT.** The inverse and cheaper: foresight says what **will not** happen — a road that is
safe, a plan that cannot work. ✅ **Mechanically that is FEWER ROLLS**, which is a real benefit and hard to
abuse.

⛔ **MY READ: 1 AND 2 TOGETHER.** The narration is the point; the named advantage is what stops it being
pure flavour.

### ⬜ AND `proof_halls` IS BLOCKED ON THIS

**Erik: *"you don't need a skill to do what the Proof-Halls is saying right now… but perhaps the skill is to
USE THE HALLS TO GAIN INSIGHT INTO THE FUTURE — a foresee skill."*** ⛔ **He is right: consulting your own
people's library is an afternoon, not a craft.** ⚠️ **The reframe is good** — two thousand years of
annotated failure IS a prediction engine, and *"nine of eleven failed the same way"* is foresight built from
record rather than vision. ⬜ **NOT re-authored, deliberately: it would be the third version of the same
craft, and it should wait for the ruling above.**

---

## ⬜ NARRATIVE SKILLS PASS (Erik, 2026-08-30)

**Erik: *"I want to evaluate the skills corpus for a good NARRATIVE SKILLS look. NOT EVERYTHING IS ABOUT
MECHANICS."***

⚠️ **Not started. Recording the frame so it is not lost:** the whole audit optimised for mechanical
correctness — typed damage, honest rungs, real dice, no ally-harm. ⛔ **That was the right pass and it is
not the only pass.** A craft can be mechanically perfect and narratively inert, and **the `foresee` finding
above is the first evidence that a whole verb went that way without anyone noticing.**

⬜ **`sent_meaning` is flagged by Erik as *"interesting but we'll need to update it"*** — first candidate
for the narrative look.

---

## ⬜ CHARACTER CREATION REVAMP (Erik + Aevi, 2026-08-31)

**Full spec:** `po/SPEC_starting_grants_and_creation_revamp.md`
**Status:** `round_2_requested` — CCode measuring current state

### Core goals
- Fewer starting skills: sense + danger-response + 2 chosen = 4 total (down from 9)
- Retire baseline kit (`brace`, `strike_basic`, `break_away`, `raise_alarm`) once zero-energy floor built
- Stat sensitivity: starting pool responds to sub-attribute investment
- Sub-attribute allocation at creation (not 4 areas — 8 subs directly), with full ladder transparency
- Background effects fully transparent (affinity in plain language, aptitude with one-line description)
- Forms expanded beyond Ent; all non-human forms get a kit with explicit pros/cons

### Zero-energy floor (prerequisite — build before retiring baseline kit)
**Ruled 2026-08-23:** at zero energy, r1 Tier-1 skills fire at conserve intensity with the floor waived.
Not free for everyone — only when drained, only r1/Tier-1, only conserve. Must be built first.
⚠️ **29 crafts have `intensity` as bare string** — need conserve entry (small content sweep, Aevi).

### Skill economy changes
- Level 1: 2 skill points (up from 1), freely spent
- Cross-class cost: **additive** (Tier + flat penalty), not multiplicative (Tier × 2)
  ⚠️ Amends Erik's 2026-07-06 ruling — needs explicit sign-off after CCode models curves
- Mental sub-attribute (insight or reason) → bonus skill points at milestones
  ⚠️ Which sub and which shape (milestone vs curve) — Erik ruling needed after CCode models

### `folkAccessible` flag
Ruled 2026-08-31: wire `folkAccessible` to derive Valleyfolk starting pool.
Retires the buried `_folkNativeGrant_20260830` underscore doc key.

### Open items (full table in spec §4)
| OI | item | held on |
|---|---|---|
| OI-1 | Background id-mismatch bug SNG-272 ship status | CCode confirm |
| OI-2 | Aptitudes descriptions table | Aevi author |
| OI-3 | Wits `novelPenalty` milestone (penalty doesn't exist) | Erik ruling |
| OI-4 | `presence`/`rapport` milestones 14–20 | Holdings model SNG-358 |
| OI-5 | Minted NPC baseline kit repurpose | Erik ruling |
| OI-6 | 29 crafts bare-string `intensity` | Aevi sweep |
| OI-7 | 6 missing sense crafts (syllogist, verist, umbral, veilwright, threnodist, wright) | Domain review first |
| OI-8 | Non-human form kits | CCode confirm what exists |
| OI-9 | `folkAccessible` flag wiring | CCode build — ruled |
| OI-10 | Additive cross-class cost | Erik sign-off after curves |
| OI-11 | Mental sub → bonus skill points | Erik ruling after curves |
| OI-12 | Prologue `tags` → permanent attributes — unconfirmed | CCode measure |
| OI-13 | Describe/Play path attribute timing | CCode measure |
| OI-14 | Total creation attribute point pool | CCode surface |
| OI-15 | `backlashRung` wiring — crit failure impact | CCode build |

### Not in this spec
- Prologue revamp — separate session (Erik directed)
- Holdings model (SNG-358 dependency)

---

## ⬜ NPC CHARACTER SHEETS (blocked on character build overhaul)

**Blocked by:** `po/SPEC_starting_grants_and_creation_revamp.md` — the NPC sheet is a REDUCTION
of the PC sheet. We cannot know what to reduce until the PC starting number is built and played.
**Ruled 2026-08-31:** proceed only after the build overhaul lands.

### Measured state (2026-08-31)

Two NPC layers exist. **Neither has a mechanical sheet — no skills, no attributes, no crafts.**

| layer | count | carries | missing |
|---|---|---|---|
| `content/packs/valley/npcs/*.json` | 43 files | `role`, `personality` (warmth/trust/candor/patience), `spectrum`, `voiceHints`, `knowledge`, `wants`, `fears`, `reactsToReputation`, `appearance`, `people`, `domains` | all mechanics |
| `npc_interiority.json` | 7 entries | `driveSummary`, `wants`, `fears`, `pushesBackWhen`, `emotionalRange`, `acknowledgeTone` | all mechanics |

⛔ **Pell and Veth-Ondra are in `npc_interiority.json` only** — no file in `npcs/` at all. They
have inner life and no characterization sheet AND no mechanical sheet. Erik named both as
needing skills.

Interiority roster: `pell`, `veth-ondra`, `mara-wells`, `calvar`, `siol`, `huginn`, `ama`.

### Proposed three-tier shape (to be confirmed after build overhaul)

| tier | who | sheet |
|---|---|---|
| **Unevolved / minted** | runtime-minted NPCs, no authored crafts | baseline kit floor only (`brace`, `strike_basic`, `break_away`, `raise_alarm`); default attributes |
| **Named but static** | the 43 in `npcs/` | reduced PC shape — likely sense + 1–2 crafts drawn from their authored `domains` |
| **Driven / evolving** | the interiority 7 | full PC-equivalent sheet; gains crafts through attention and deeds |

**The hook already exists:** `domains` and `spectrum` are authored on the 43. Those determine
which craft pool an NPC draws from with no new authoring required.

### Baseline kit as NPC floor (OI-5) ✅ RULED 2026-08-31

The retired baseline kit becomes the floor for minted NPCs with no authored crafts.
⚠️ **It is a floor, not a permanent state** — baseline crafts are REPLACED by real crafts as an
NPC evolves through attention and deeds. A promotion arc, not a terminal condition.

### Open design questions (do not answer until build overhaul lands)

1. Do NPCs use the same sub-attribute ladder as PCs, or a compressed one?
2. What triggers promotion from baseline kit to real crafts — GM-declared, or does
   attention/deeds tracking already exist in the engine? (CCode measurement needed.)
3. Does the driven-NPC tier get skill points and a progression arc, or are their crafts
   authored directly?
4. Do the 43 static NPCs need individual authoring, or can their sheet derive from
   `domains` + `spectrum` + `role`?

### Immediate follow-on when unblocked
- Author `npcs/pell.json` and `npcs/veth_ondra.json` — both currently have interiority with no
  characterization file
- Derive sheets for the 43 from `domains`/`spectrum`

---

## ⬜ AXIS BALANCE / TRAINING / SAVES — session 2026-09-01

**Rulings:** `po/RULING_axis_balance_20260901.md` (R8–R11, R16–R17) ·
`po/RULING_unlock_levels_and_bands.md` (R12–R15) · `po/RULING_backlash_scaling.md` (R18–R19) ·
`po/RULING_training_gate_saves_and_pipeline.md` (R20–R23)
**Build state:** `po/BUILD_STATUS_axis_balance.md` — R1–R19 built at v1.9.299, baseline green.

### Ruled this session
- **R20** — tier gate on training REMOVED; training unlocks at **L10**. R19 retracted (reached 3% of Silas's stuck crafts).
- **R21** — adjacent 3 / acquired 2 confirmed. Ladder complete.
- **R22** — tomes, artifacts, quest items, miracle grants are **one mechanism**: an object grants craft ACCESS; the character still pays skill points. Unblocks build step 8.
- **R23** — Threnody: author emotional abilities beyond grief; cross-connect with the romance/attraction spec. ⛔ Blocked on C6.

### ⛔ Two findings from tracing live saves
- **OI-24 — saves were never migrated.** 22 of 142 ability rows across 16 saves carry pre-audit ids. `ability_rename_map.json` (SNG-501, 377 entries) resolves all of them. **Zero genuinely orphaned.** Must precede any audit reading sheets as ground truth.
- **OI-25 — generative pipeline has no path to the corpus.** 13 `customAbilities` from braiding and bond-teaching (`marrow-s-wings`, Ashen Meridian) are full craft records living on one sheet each. Prior art: `SPEC_SNG-369`, `SPEC_SNG-370`.

### Play data (16 saves, L1–30)
| | |
|---|---|
| characters with zero rank-2 crafts | **12 of 16** |
| most skill points banked by anyone | **3** |

➡️ Rank-up barely happens; the Insight-dumper overflow is **theoretical**.

### Open
| OI | item | owner |
|---|---|---|
| OI-19 | Thin domains (Life 3, Spirit 4, Angelic 5, Demonic 5 tier-1 crafts) | Aevi |
| OI-20 | Per-rank `backlashRung` — ~88 crafts | Aevi |
| OI-21 | T4/T5 trainable? | Erik, deferred |
| OI-22 | R18 percentage table | Aevi |
| OI-23 | Reconcile the two backlash systems | CCode |
| OI-24 | Save migration | CCode |
| OI-25 | Generative-to-corpus pipeline | Aevi → CCode |
| C6 | Attraction eligibility gate — blocks R23 | Aevi |
| — | `rankUpAbility` has no UI caller | CCode |

---

## ⛔ OI-19 — WITHDRAWN AS A GAP; 5 crafts kept as enrichment (2026-09-01)

**Result:** `po/RESULT_oi19_tier1_pools.md` · verified at authenticated `api.github.com`

⛔ **The gap was real but not where the first count said.** Life appeared to have 5 tier-1 crafts;
two (`greenlore`, `beastfriend`) are `folkAccessible` and available to every origin, leaving only
**3 domain-specific**. R3 creation needs a forced sense pick + a danger-response + a curated pool
of 4–5, so ~6 minimum.

| domain | before | after | authored |
|---|---|---|---|
| Life | 5 (3 own) | **7** | `rootward` (ward), `green_passage` (move/sustain) |
| Spirit | 4 | **7** | `hallowed_ground` (ward), `bound_witness` (bind), `thin_step` (move) |
| Angelic | 5 | **7** | `administered_mercy` (heal), `ordered_advance` (move/empower) |
| Demonic | 5 | **7** | `fed_wound` (heal), `hungry_step` (move/reveal) |

✅ **All 14 domains now ≥6.** Authoring gate passed: every verb from the closed vocabulary, no id
collisions, T7 answered per craft, three-rank trees with a real cost at rank 3.

**Commits:** `a01fa122` (death_life) · `d71af3f7` (mechanical_spiritual) · `ee2a24f3` (demonic_angelic)

⬜ **Not done:** `folkAccessible` was NOT set on any new craft — held pending the flag's reader
landing (OI-9 built by CCode; confirm before authoring more).

---

## ⛔ OI-19 CORRECTION — the gap did not exist. Erik caught it.

⚠️ **Aevi invented the requirement.** The creation spec's *"curated pool of 4–5"* describes **what the
UI SHOWS**, not a content threshold. Erik: *"they get 2 skill points to purchase anything else
available to them from ANY of their domains."*

⛔ **Measured after the fact: every one of the 14 domains already had a tier-1 sense AND a tier-1
danger-response. Nothing was blocked.** The level-1 pool draws from **139 tier-1 crafts across the
character's domains**, not from one domain's handful.

➡️ **This is the same failure as the session's four absence-claims, inverted** — asserting a shortage
without checking the RULE, rather than without checking the DATA.

### Then Erik caught the second failure: *"quite the cavalier authoring"*

⛔ **All 9 crafts put a NEW COST at rank 3.** Not one lifted an earlier limitation. That is the exact
defect Erik named in August — *"why are there still skills that would suck to take to lvl 3?"* —
reproduced nine times.

⚠️ **`authoring_gate.py` passed 0/0 and hid it.** Its `SELFTAX` regex targets self-harm phrasings
(*"the wielder is spent"*); these were world-consequence costs. ➡️ **A gate that only catches the
wordings already in the corpus catches nothing new** — the gate's own §5 lesson, recurring.

### Disposition after reading each pole's full corpus

⛔ **DROPPED — duplicates of existing higher-tier work:**

| craft | superseded by |
|---|---|
| `green_passage` | `root_road` T2 — *"move through living terrain by moving with it"* |
| `fed_wound` | `consumed_wound` T2 — *"offer a wound or pain to the deep"* |
| `rootward` | `bark_and_briar` T2 — thorns ward a space |
| `ordered_advance` | thin; `empower` on a move craft is muddled |

✅ **KEPT — fill real holes, rank 3 reworked to LIFT a rank-1 limit:**

| craft | the hole | rank 3 now lifts |
|---|---|---|
| `hallowed_ground` | ⚠️ Numinous has **no ward at any tier** | the must-stay requirement |
| `bound_witness` | no T1 bind | the must-be-right accuracy bar |
| `thin_step` | no movement below T4 | the line-of-sight requirement |
| `administered_mercy` | ⚠️ Seraphic has **no T1 heal**; first mend is T3 | the time cost |
| `hungry_step` | Abyssal has no movement below T2 | being noticed on the road |

⚠️ **Numinous is the thinnest pole in the game — 13 crafts against 21–23 elsewhere.** Three of the
five keepers land there, which is the one place the thinness was real.

**Corpus: 414 → 423 → 419.** Gate re-run against origin: **0 fail, 0 warn.**
**Commits:** `a34c4f1e`, `956e955c` (drops) · `4a3743be`, `cadef0e9` (T5 rework)

---

## ⬜ STANDING ITEM — GEAR AUTHORING (open, revisit periodically)

**Erik 2026-09-04:** *"keep this subject open to return to occasionally to author new weapons, armor, and
items as we move along."*

⚑ **Corpus: 44 items** — 16 tool · 7 consumable · 7 weapon · 5 armor · 5 focus · 3 relic · 2 misc.

### ✅ The contract, settled 2026-09-04

| kind | carries |
|---|---|
| **armor** | ⚑ **`soakLayers: [{type, value}]` — TYPED.** One layer per type it genuinely answers. ⛔ **Never several layers of one value: three layers of 5 would be 15 soak** (CCODE-290) |
| **weapon** | ⚑ **`bonusTags` only.** ⛔ **THE CRAFT CARRIES THE DICE.** ⚠️ A damage value on an item is a second competing source of numbers |
| **any** | `worth` (42 carry it) · `goods` for the economy · `substrateCharge` where it carries a source |

⚠️ **VALUES STAY SMALL.** Soak is a FLAT subtraction against a median craft of **7 damage**, so `physical 3`
is already a third of an ordinary blow. ✅ `minHit` guarantees nothing is ever fully immune.

⛔ **AND NOT EVERY ARMOUR SLOT GETS SOAK.** `quiet_boots` has none on purpose — stealth and grip are its
whole value. ⚠️ **Giving every slot a number is how a kit becomes a spreadsheet.**

### ⬜ Owed / wanted

| | |
|---|---|
| **Silas's kit** | ⚠️ `the_unfinished_spear` is authored and growing; ⬜ **what else does he actually carry?** |
| **Veth's kit** | ⛔ **nothing authored.** A warden of eleven years has gear — ⬜ and the BONES are an item |
| ⬜ **`meaningCharge` items** | ⚠️ **`SPEC_meaning_density.md` §3** — heirlooms, holy books, a founder's tool, a name-keeping. ⛔ **Meaning is INTRINSIC: a stolen holy book is exactly as holy** (Erik's correction) |
| ⬜ **`warden_ash`** | ⚠️ carries `substrateCharge` and is *literally the ash of something that died* — **Erik: a Warden carries it as a MOBILE power source.** Likely wants `meaningCharge` instead |
| **companion gear** | ⚠️ companions carry `substrateAura`; ⬜ **do they carry items?** |
| **hold-made goods** | ⬜ **`SPEC_hold_store.md`** — what a thriving forge or mine actually produces as an item |

---

## ⛔ SPIRIT MAY NOT SURVIVE AS A DOMAIN — measure before authoring in it again

**Erik 2026-09-04:** *"we had also discussed the fact that Spirit might be absorbed into the other
domains… remember?"* ⚠️ **Aevi did not, and authored two new Spirit crafts the same day.**

### The two open rows, both `HOW_IT_WORKS` log, 2026-08-30

> ⬜ **SPIRIT MAY BE THE SUBSTRATE UNDER ALL FOUR POWER SYSTEMS.** Erik: *"perhaps the precursor war is
> ABOUT and POWERED BY spirit — the thing the nanotechnology and lattice and veil and metaphysical are all
> **EXPRESSING**."* ⚠️ **It would make Parakletos literal: if spirit is what the substrate IS, *"what
> answers every craft in the world"* stops being a metaphor — and THE VEIL BECOMES A HOLE IN THE FIELD
> RATHER THAN A WALL.**

> ⬜ **SPIRIT AS A PERMEATING FIELD.** Erik: *"I could see some spirit skills in Death, Light, Dark… it's
> kind of a **PERMEATING FIELD**, tied to the precursor/veil entity powers."*
> ⛔ **And the cosmology already says so: `the_three.md` — PARAKLETOS DISTRIBUTED ITSELF INTO THE
> SUBSTRATE.** ⚠️ **A distributed entity is not a tradition. It is a field.**

### ⛔ THE OWED ACTION, and Aevi's own note already stated it

> ⚠️ *"**MEASURE BEFORE AUTHORING**: `uttered_name` is already a `veil`-powered UMBRAL craft. This may be a
> RECLASSIFICATION that fixes Spirit's 10-vs-32 imbalance **WITH NO NEW CONTENT**."*

⬜ **THE MEASUREMENT: how many crafts OUTSIDE Spirit are already doing spirit-work?** `uttered_name` is one.
➡️ **If that number is large, Spirit dissolves into a field and its 15 crafts redistribute** — ⚠️ **cheaper
and probably better than authoring Spirit up to parity.**

### ⚠️ WHAT THIS MEANS FOR THE TWO CRAFTS AUTHORED 2026-09-04

✅ **`plain_seeming` and `answering` are good and correctly authored** (lint-clean after two fixes).
⛔ **WHETHER THEY STAY IN `numinous` IS UNDECIDED.**

- **`answering`** is named for Parakletos appearing *as answering*. ⚠️ **Under the field reading it is not a
  Numinous specialty — it is THE FIELD BEING REACHED, and belongs wherever someone attends.**
- **`plain_seeming`** takes meaning off a place. ⬜ **Field manipulation; sits equally well in Dark or Death.**

⛔ **DO NOT AUTHOR FURTHER SPIRIT CONTENT UNTIL THE MEASUREMENT IS RUN.**

---

## ⬜ OWED BY AEVI — from CCode's 2026-09-04 landing

| # | item | why |
|---|---|---|
| **1** | ⛔ **Q15 — the lethal-rung sweep** | ⚠️ **53 crafts carry `lethal` or atrocity, 22 of them TIER 1, and only `the_cut_thread` has a `killCost`.** ➡️ **Under R35 a rank-1 sling now offers the same insta-kill on a landed hit.** ⛔ **This is a consequence of Aevi's own ruling and hers to sweep** |
| **2** | `notForClasses` for the death save | which targets cannot be stopped at all — ⚠️ `the_cut_thread`'s `notFor` already says *"what has no thread: a machine, a figure, a Precursor working"* |
| **3** | `mechanic.meaning: "none"` on body crafts | ⚠️ **Aevi raised it herself: a shrine should not make someone punch harder.** `ki_wield` is metaphysical and is a body craft |
| **4** | ⚠️ **the Finish-it overlap** | ⛔ **`lethal` now offers BOTH a death save and the ⚡ Finish it button — two ends on one rung.** ⬜ Design call |

---

## ⚠️ CCODE CORRECTION TO ACCEPT

⛔ **`resolve.js`'s `opposed` is a DIFFICULTY TERM, not a contest.** Aevi's `RULING_pressure_and_death_save.md`
cited it as *"a contest mechanism to build on rather than invent"* — **it is not one.**
✅ **The death save was built correctly as two rolled margins compared, the way every contest here is
built.** ⚑ **Her strength-or-presence instinct was right; her reading of the existing machinery was not.**

---

## ⛔ NEWS PANEL — two defects, from Erik's play 2026-09-05

> Erik: *"My news is still popping up old stuff… and it **cuts off instead of becoming a scrollable**."*

**Screenshot: Whistling Woman Post, Day 16, world count 1624.** ⚠️ **ONE genuinely new line** (*"Calvar has
been asking after you"*) **and SEVEN "Word has spread beyond its own valley"** — the kiss at the forge bench,
naming Memory, the badger's ending, Edvar Crane's commission. ⛔ **All old deeds.**

### ⛔ DEFECT 1 — `rate: 1` MAKES EVERY DEED HOP EVERY PASS

⚑ **`spreadDeeds` IS CORRECT.** It tracks `d.spread`, caps reach by weight (`{1:2, 2:5, 3:12}` communities),
and skips a deed at its cap. ✅ **The bookkeeping exists and works.**

⛔ **THE CALLER IS WRONG.** `worldtick.js:562`:
```js
const hops = spreadDeeds({ deeds: ready }, { …, rng, rate: 1 });
```
⚠️ **Every other caller uses the default `0.35`.** This one passes **1**, so `if (rng() >= rate) continue`
**NEVER FIRES** — ➡️ ⛔ **EVERY ELIGIBLE DEED TAKES A GUARANTEED HOP ON EVERY TICK, and each hop prints a
news line.**

⚠️ **A weight-3 deed keeps going until it has reached TWELVE communities — twelve news lines, one per pass.**

⛔ **AND THE COMMENT TWO LINES ABOVE STATES THE INTENT IT BREAKS:** *"`spreadDeeds` now owns it for the
player exactly as it does for figures: **ONE HOP PER PASS**."* ➡️ ⚠️ **`rate: 1` turns that into ONE HOP PER
DEED PER PASS.**

⬜ **Fix: drop `rate: 1`** (take the 0.35 default), **or cap total hops per pass at one.** ⚠️ **The comment
says the latter was the intent.**

### ⛔ DEFECT 2 — THE PANEL CUTS OFF INSTEAD OF SCROLLING

**The "while you were away" block is a fixed height and the content is clipped mid-list.** ⚠️ With seven
spread lines it overflows on the first screen.

⬜ **Fix: scrollable region with a max height.** ⛔ **Both halves matter — fixing defect 1 alone still
overflows on a busy return, and fixing 2 alone hides a real bug behind a scrollbar.**

### ⚠️ AND A THIRD, SMALLER
**Every spread line opens with the same 11 words** — *"Word has spread beyond its own valley, as far as X:"*
⛔ **Seven identical openings is why it reads as repetition even where the deeds differ.** ⬜ The section is
already headed **WORD FROM ELSEWHERE**, so the prefix is redundant — *"As far as kestrel's roost: …"* would
do.
