# PO Backlog — Singularity

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
