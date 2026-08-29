# HOW IT WORKS

⛔ **THIS DOCUMENT IS EXECUTABLE. `tests/how_it_works.mjs` asserts every claim below against the live
engine — BUILT claims must hold, PROPOSED claims must still be unbuilt, and known gaps must still be open.**
⚠️ **A gap that closes turns its check RED, so a fixed gap forces this file to be edited. The doc cannot
silently rot.**

⛔ **COMPANION: [`FIELD_REFERENCE.md`](FIELD_REFERENCE.md)** — this file says what the game DOES; that one
says **what each field IS, who reads it, and what happens when it is absent.** ⚠️ **107 authored fields,
measured: 84 read, 19 dark, 3 CI-only, 1 name-collision.** It carries the axis-family untangling, the two
rank-ladder shapes, which `cfg` object each consumer expects, the engine contracts that cost a false
finding, and the defect taxonomy. **Its atlas table is generated and its numbers are gated.**

⛔ **REQUIRED FOR SINGULARITY (Erik, 2026-08-28): every spec, every authoring, every wiring, every update is
logged with its INTENT, HOW IT IS EXECUTED AND TESTED, and WHAT IT IMPACTS AND WHAT IMPACTS IT.** ⚠️ **Aevi
and CCode maintain this jointly and work toward complete agreement on all content.** The `po/` files are
working papers; **this is the answer.**

---

## 0 · THE LOG

| date | change | intent | tested by | impacts / impacted by |
|---|---|---|---|---|
| 08-28 | doc created | Erik: *"tell me how it works and what it does and I verify that's what I want"* | — | replaces reconstructing the model from spec archaeology |
| 08-28 | doc made executable | a spec nobody runs is a spec that drifts | `tests/how_it_works.mjs`, 97 assertions | ⛔ every section below; a fixed gap goes RED |
| 08-28 | `reachOf` clamped on the base path | §6 says the sealed rung is reachable by NOTHING at any rank; it was clamped on surge only | `how_it_works.mjs` §6 | ⚠️ latent — no rank-4 craft exists yet |
| 08-28 | §3 healing inversion → **PROPOSED** | it read BUILT; `absorb` machinery exists but **no sheet authors `decay: absorb`** | measured: 3 files mention absorb, none is a bestiary entry | §48 undeath, which is also PROPOSED |
| 08-28 | §5 degrade path named | CCode could not find it and asked rather than guess | `resolveImposition` verified live | `impositionOf`, every `imposes` block |
| 08-28 | §8 blind/taunt → **RULED** | Erik: *"you can taunt from the darkness"*; the engine was right | `how_it_works.mjs` §8 — doc corrected, assertion should now pass | `targeting.js` unchanged |
| 08-28 | §8 **a hazard is not a foe** | Erik: *"a rockfall isn't a foe, it's an obstacle or a hazard"* | — | ⚠️ targeting policy applies to things that CHOOSE; hazards need no policy |
| 08-28 | ⛔ **`blind` policy misnamed — OPEN** | Erik: *"blind is CAN'T SEE"*; the policy is a random picker | ⚠️ needs a rename, not a behaviour change | `targeting.js` `POLICY_NEEDS`, `set_hand_labour` and any foe authored `blind` |
| 08-28 | §9 corrected — two "derived" values are **AUTHORED** | §9 is an instruction to DELETE; a value wrongly listed there is a deletion order against correct content | `how_it_works.mjs` §9, both directions | ⛔ `power_sources.byTradition` (24 rows) and `damageTypeByTradition` (13) are now protected, not condemned |
| 08-28 | §5 degrade asserted | Aevi named `resolveImposition`; a named path with no test is still untested | `how_it_works.mjs` §5 — resisted `unconscious` lands as `action_loss` | closed vocabulary: a `degradesTo` outside IMPOSABLE now refuses |
| 08-28 | §11 testing contract added | two rules learned the expensive way in one afternoon | `how_it_works.mjs` §11 asserts every defect-reporting tool has a floor | binds both authors; `safe_delete.mjs` and this harness |
| 08-28 | §0b log made mechanical | a requirement nobody checks lapses in a week | `how_it_works.mjs` §0b — five columns, non-empty, names its change | ⚠️ Erik's 08-28 logging rule now has teeth |
| 08-28 | §8 body corrected to match the ruling | the log said "doc corrected" and the sentence was still there — exactly the drift this file is meant to catch | `how_it_works.mjs` §8, now green | ⚠️ a logged change that was never made |
| 08-28 | ⚠️ **`minHit` FLAGGED, kept** | Erik: *"not certain about the minHit concept… keep it for now, but flag it"* | ⛔ **no test — it is a design question, not a defect** | §4 warding · the ward ladder's IMMUNITY rung · Erik's soak ruling puts the floor on the player's side too |
| 08-28 | ⛔ `blind` policy → **`mindless`** | Erik: *"blind is CAN’T SEE"*; the word named this policy AND the can’t-see receipt, in one function | `how_it_works.mjs` §8 × 5, plus smoke CCODE-255 | `targeting.js`, `sunk_assay_intake.json` migrated, `POLICY_ALIASES` keeps old saves working |
| 08-28 | ⛔ **`FIELD_REFERENCE.md` created** | Erik: *"we are DONE with forgetting what things are meant to do and how they actually work or not"* | `how_it_works.mjs` FR × 14 — atlas freshness, bucket counts, axis counts, ladder count | ⛔ every authored field; `field_atlas.mjs` generates its table |
| 08-28 | `field_atlas.mjs` + `atlas_inject.mjs` | a hand-maintained "which fields are read" list is wrong within a week | its table is re-derived and diffed by the FR gate | ⚠️ `NOT_CONSUMERS` — a question file is not a consumer |
| 08-28 | ⛔ **`schemas/ability.schema.json`** | eleven schemas existed and NONE covered crafts — the type where all 19 dark fields live | `content_ci` CCODE-288 × 3, incl. a proof the closed set can go RED | ⛔ every craft; a new field must be DECLARED before it can be authored |
| 08-28 | `genschema.js` learns `additionalProperties:false` + `patternProperties` | it IGNORED the closed-set flag, so the schema above would have been decorative | the RED-proof probe in CCODE-288 | ⚠️ purely additive — no existing schema used the boolean form |
| 08-28 | CI on push (`.github/workflows/ci.yml`) | 873 commits in 14 days and nothing ran the suite | it IS the runner | ⛔ every push; catches the three things I forgot this week |
| 08-28 | advisory typecheck workflow + `jsconfig.json` | 5 of 8 false findings this week were contract errors a checker catches at edit time | ⚠️ **non-blocking until seen green** — no `tsc` on the authoring machine | `targeting.js` is the first module opted in |
| 08-28 | pre-push hook + `scripts/hooks/install.sh` | CI catches a bad push in a minute; the hook catches it in seconds | it runs `run_tests.mjs` | ⚠️ git does not version hooks — hence the installer |
| 08-28 | ⛔ **`tests/save_fixtures.mjs`** | 16 real saves, 1,788 turns, and NOTHING tested that a rename does not drop an ability | reconciles a COPY of every save; asserts nothing shrank | ⛔ every vocabulary change; guards the one artefact that cannot be regenerated |

**Last verified: 2026-08-28 · v1.9.249 · 378 crafts.**

---

## 1 · WHAT A CRAFT IS

**A craft is a thing a character can do, with three RANKS.** You learn it at rank 1 and grow into 2 and 3.

⛔ **RANKS ARE ADDITIVE.** Rank 3 can do everything ranks 1 and 2 could, plus the new thing. You never lose
a lower rank's use. *(You do not use Kindle to light fires, learn to burn a goblin whole, and lose the
ability to light fires.)*

**A player choosing what to do sees three things per rank: what it DOES, what it CANNOT do, and what it
COSTS.** Everything else on a craft is for the engine or for us.

### What it costs

**ENERGY, and energy only.** A craft's price is its `energyCost`, set by level band, plus **+3 per rank of
reach** above rank 1 — so a rank-1 use of an e4 craft costs 4 and a rank-3 use costs 10.

⛔ **There are no other costs.** Not vows, not exhaustion, not narrative debts. **The single exception is an
extreme capstone** — `the_cut_thread` and `last_lament` take your whole remaining pool and leave you at zero
until a full night's rest, and they say so.

⚠️ **A `cannot` is a SCOPE LIMIT, not a bill.** It says what the craft will not produce.

---

## 2 · HOW A RANK RESOLVES

**Order:**

```
1. the rank's own authored number          ← always wins
2. a value DERIVED from the rank's gainAxes    ← PROPOSED
3. the craft's mechanic block
4. the shape's family defaults
5. nothing — the craft does not use that dimension
```

**`gainAxes` names what a rank buys, from nine: `range` · `duration` · `damage` · `scope` · `targets` ·
`quality` · `autonomy` · `conditions` · `tempo`.**

⚠️ **BUILT TODAY: `gainAxes` decides which ranks appear in the player's capability menu** — a rank that
declares one is a distinct choice; a rank that declares nothing collapses out of the list. **It is read for
PRESENCE, not for content.**

⛔ **PROPOSED: derivation.** 746 ranks declare an axis and author no number, so today rank 3 resolves
identically to rank 1. The proposal is a default curve — **+50% at r2, +33% at r3** — that fills those in,
**with any authored number overriding it.** Fifteen authored values in five ladders survive untouched.

⛔ **PROPOSED: derivation is gated on the field's KIND.**
- **MAGNITUDE** — scales by the curve (`damage`, `duration`, `resistDrop`)
- **ORDINAL** — steps by 1 (`targets`, `stage`) — *there is no such thing as 1.5 people*
- **INDEX** — steps by 1 and is never multiplied (`reachesDepth`) — *its base is 0*

⛔ **`tempo` never derives.** It grants extra action and no engine should hand that out unasked.

---

## 3 · WHAT LANDS: DAMAGE

**A craft deals a MIX of damage types, not one type.** A psionic blast is half `physical` and half
`psychic`; a Seraphic smite is `radiance`, `judgement` and `force`. **The word people use for an effect is
the mix.**

**Types belong to four FAMILIES:**

| family | what it is | types |
|---|---|---|
| **physics** | the fabric of the world — matter, space, time, and the two kinds of matter you see by | `physical` `force` `spatial` `temporal` `radiance` `shadow` |
| **elemental** | the energies moving through it | `heat` `cold` `lightning` `corrosive` |
| **vital** | life ended, grown, or moved | `decay` `living` `vitality` |
| **intrinsic** | ⛔ harm that requires a WILL to make it — *a rockfall cannot do this* | `feeling` `appetite` `judgement` · `psychic` `abstraction` `truth` `deception` |

⚠️ **Elemental types are SIBLINGS, not opposites.** A ward against fire is not a ward against ice.

**HEALING IS NOT A TYPE.** It is an effect, and the source type decides who it mends.

⛔ **PROPOSED — the inversion is NOT BUILT.** The intent is that `decay` mends the undead, `living` and
`vitality` mend the living, and **healing an undead harms it.** ⚠️ **The machinery for half of it exists** —
`absorb` returns negative damage, so a sheet authored `decay: absorb` would already be mended by rot. ⛔ **But
NO SHEET AUTHORS IT**, and the other half — a `heal` that lands as `decay` on an undead — has no
implementation at all.

---

## 4 · WHAT STOPS IT: WARDS

**A ward answers a FAMILY, or one TYPE inside a family.** *An elemental ward* stops heat and cold and
lightning; *a cold ward* stops only cold and is cheaper and sharper.

**Wards have DEPTH as well as breadth: `resist` → `soak` → `immunity`.** Three different kinds of answer,
not three sizes of one — resist moves the roll, soak moves the damage, immunity means that type does not
touch you.

⛔ **PARTIAL WARDING IS THE POINT.** A shield answers the physical half of a psionic blast and **the psychic
half goes through untouched.** ⚠️ **Nothing is ever fully immune and nothing is ever fully blocked** — a blow whose every component is
warded still lands its floor (`minHit`).

⛔ **FLAGGED, NOT SETTLED — Erik 2026-08-28: *"I'm not certain about the minHit concept. We'll keep it for
now, but flag it."*** ⚠️ **The tension runs both ways: without the floor, a fully-soaked blow returns 0 and
reads as a miss rather than a graze — which is how `antisoakLanded` got reported as broken. ⛔ WITH it,
armour can never fully answer anything and the ward ladder's top rung, IMMUNITY, cannot actually mean
immune.** ⚠️ **And Erik's ruling that a guard ABSORBS puts the same floor on the player's side, where
*"you always take at least 1"* feels different from *"the boss always takes at least 1."***

⚠️ **A ward that answers everything has no character.** The interesting thing about a ward is the list of
what it does *not* stop.

**Also live:** `antisoak` makes a wound worse but **cannot create one** — a blow fully stopped by soak takes
the antisoak with it. `pierce` is an amount that lands regardless of armour, so it guarantees the antisoak
fires.

---

## 5 · WHAT STOPS *YOU*: CONDITIONS

**A craft that stops without wounding does not deal damage.** It imposes a CONDITION — `staggered`,
`action_loss`, `unconscious`, `incapacitated` — resisted with `mental` or `physical`.

⛔ **A failed resist DEGRADES rather than negating.** You do not shrug it off; you take the lesser version —
`resolveImposition` returns `{ condition: degradesTo, degradedTo: want, resisted: true }`, so an
`unconscious` that is resisted lands as `action_loss`.

**`harmRung` is a different axis from damage.** It says what happens when a craft puts someone DOWN —
`none` / `damaging` / `incapacitating` / `lethal` — and a character can reduce it without reducing damage.

---

## 6 · DYING

**Death is a ladder, not a switch.**

| depth | | reachable by |
|---|---|---|
| 0 | **the Threshold** — dead about a day | rank 1 |
| 1 | **the Near Dark** — about a month | rank 2 |
| 2 | **the Deep Dark** — months, the road nearly closed | rank 3 |
| 3 | ⛔ **SEALED** | nothing, at any rank |

**The ladder MOVES.** A failed retrieval **sinks them a rung**; a failed reach at the Deep Dark **seals
them permanently.** ⚠️ **Using the craft badly is how a person becomes unreachable.**

**Five traditions answer this ladder differently and share one set of verbs** — `retrieve` · `sink` ·
`seal` · `hold` · `slow`. Ashwardens drag, Numinous invite, Threnody delays, Rootkin pay a price.

⛔ **PROPOSED (§48): undeath.** A raised body is a COCOON — as it wears, the thing inside grows. Two end
states: **narrowing** into unminded purpose, or **stable** as an Afterling with a whole personality.
**Healing harms them, decay mends them**, and Deathsense reads them as inverted life.

---

## 7 · WHAT A COMPANION DOES IN A FIGHT

**Everything participates.** Healing is acting; distracting is acting. **`combatant` means "may swing",
not "may take part"** — four of nine companions do not swing and all nine contribute.

**Going down costs something specific and authored** — losing Marrow means nothing is attended; losing Coil
means Precursor mechanisms stop answering.

⚠️ **Roster values are DEFAULTS, not ceilings.** A swarm that cannot fight can fight when a player spends
eight bond bands building it a staff to inhabit.

---

## 8 · HOW A FOE CHOOSES A TARGET

**Default is `threat` — whoever is hurting it most.** ⛔ **Deliberately, because a foe that goes for what is
hurting it can be BAITED, and baiting is a decision.** A foe that always goes for the weakest can only be
tanked.

**`weakest`, `healer` and `mindless` are characterisation** — a thing that goes for the healer is saying
something about itself.

⛔ **A TAUNT REACHES ANYTHING THAT ACTS.** Erik, 2026-08-28: *"you can taunt from the darkness."* Making
yourself impossible to ignore outranks concealment **and** outranks the policy — you cannot demand
something's attention and also be hidden from it. ⚠️ **Even a `mindless` thing turns**: having no preference
is not the same as being unreachable.

⚠️ **AND A HAZARD IS NOT A FOE.** Erik: *"a rockfall isn't a foe, it's an obstacle or a hazard."* A targeting
policy is for things that CHOOSE; scenery needs no policy at all.

⛔ **`mindless` WAS CALLED `blind` UNTIL 2026-08-28**, and the rename is Erik's: *"blind is CAN'T SEE."* The
word was doing two jobs in one function — this policy, and the receipt for a foe that genuinely cannot find
you. **`blind` is now reserved for that second meaning**, and still resolves as an alias so the one authored
encounter and any old save keep working rather than silently falling back to `threat`.

**The downed are not targets** — and a taunt cannot make one a target either.

---

## 9 · WHAT IS AUTHORED VS WHAT IS DERIVED

⛔ **A stored copy of a derived value is the failure this project finds most often** — so this list is an
instruction to delete. ⚠️ **WHICH MEANS A VALUE WRONGLY LISTED HERE IS A DELETION ORDER AGAINST CORRECT
CONTENT, and two were.** Both halves are now stated, and both are asserted by `how_it_works.mjs` §9.

### ✅ DERIVED, NEVER STORED

- **foothill parentage** — computed from the parents' primaries in `craftSource`, and **no foothill has a
  row in `byTradition`**. A tie resolves to `combination` rather than a coin flip.
- **summoned creature sheets** — from the caster's level plus the craft's `tierGap`, **and the roll: a crit
  raises something stronger than the craft promises**

### ⛔ AUTHORED ON PURPOSE — DO NOT SWEEP THESE

- **tradition power-source mixes** — ⚠️ **24 authored rows in `power_sources.byTradition`, with Erik's
  reasons**, read by `craftSource`. `perAbilityOverrides` is empty **by design**: a tradition-level default
  plus explicit deviations is far less content than 285 authored fields, and a deviation is the interesting
  fact. ⛔ **An unauthored mix is FLAGGED `_mixUnauthored`, so `mix: null` means UNAUTHORED and never
  "the mean is pure"** — an absent value doing double duty is the trap.
- **tradition damage mixes** — ⚠️ **13 authored rows in `craft_mechanics.damageTypeByTradition`**, read by
  `skill_battle`. The kind a tradition's harm is **when the craft does not say for itself**.

⚠️ **The distinction is direction.** A tradition's mix is **authored and inherited downward** to its crafts;
a foothill's is **computed upward** from its parents, because a foothill is a place of access, not an
ancestry.

---

## 10 · KNOWN GAPS

| | |
|---|---|
| ⛔ **`persuade` and `bolster` are unmechanised verbs** | crafts describe what the engine cannot do |
| ⛔ **`mechanic.soak` is read by nothing** | 30 crafts author it; `soak 2` and `soak 20` resolve identically |
| ⛔ **12 rules files are registered and never loaded** | ~140 KB dark, including `damage_types` |
| ⛔ **`rankDeltas[].axis` (495) has no reader; `mechanic.axis` (0) has one** | a reader with no writer, and a writer with no reader |
| ⚠️ **the map layer** | 18 of 135 locations have authored layouts and the renderer draws circles instead |
| ⚠️ **method is not recorded anywhere** | *psionics*, *song*, *blade* — a real layer with no field |

**Each gap above is asserted OPEN by `how_it_works.mjs`.** ⛔ **Closing one turns its check RED, which is
the signal to edit this table.** A gap that quietly closes is a doc that quietly rots.

---

## 11 · THE TESTING CONTRACT

**How we are allowed to claim a defect.** ⚠️ **Both rules were learned in one afternoon and both cost real
time, so they are rules now rather than habits.**

### ⛔ RULE 1 — A TOOL THAT REPORTS DEFECTS HAS A SELF-TEST, AND IT RUNS FIRST

**Five of `how_it_works.mjs`'s first-draft failures were the harness's own, and every one read exactly like
an engine defect.** ⛔ **One was a breath from reporting *"the entire rank-reach cost mechanic is inert"* —
about a system that works and that Erik ruled on personally.** The cause was passing `craft_mechanics.json`
where the game passes `rules.energy`: **a harness that builds its own config tests its own config.**

**Aevi's craft-lint produced 1,198 findings of which 663 were hers, found by *running* it rather than
testing it.** ⚠️ **A checker with no floor cannot tell you whether a green run means clean or broken.**

### ⛔ RULE 2 — A REGEX ASKS WHETHER A WORD APPEARS; THE QUESTION IS WHETHER A NUMBER CHANGES ANYTHING

**Two gap probes reported still-open gaps as FIXED**, because `bolster` is a **shape** in `familyDefaults`
*and* an unmechanised **verb** — the word appearing proved nothing. ✅ **The behavioural form cannot make
that mistake: author `soak 2`, author `soak 20`, and see whether the outcome differs.**

⚠️ **The same trap in the other direction:** `operativeAxis` read as *live* on two hits that were
`cfg.operativeAxis` — a rules dial, not the craft field. **Same word, two owners.** ✅ **Capture the
receiver, not the name.**

### ⚠️ RULE 3 — "UNREAD" IS NOT "USELESS", AND NEITHER IS A VERDICT

`damage_families.json` measured as unread and was **a correct file with a reader pointed at the wrong
copy.** ⛔ **The signal is identical to cruft; only the diagnosis differs, and only a person can make it.**
`scripts/safe_delete.mjs` sorts candidates and **refuses to output "delete"** for that reason.
