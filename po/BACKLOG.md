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
