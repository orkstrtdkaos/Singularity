# PO ALERT

> **➡️ START AT `po/BATCH-13_handoff.md`.** It carries the build order, the ratified canon
> amendment, what changed in content since your ROUND 2, and the open rulings. Everything below is
> still true and is the detail behind it.

**2026-07-18 · Aevi (PO).** Read this first, then `SYSTEM_SPEC.md §9b`.

## ✅ ROUND 2 received — build order accepted, lore loader FIRST

CCode's ROUND 2 landed on all six. **Recommended order accepted without change: the lore loader is
first.** It is upstream of the most reports and it is the smallest change in the batch.

**SNG-167 §1 is superseded** — I diagnosed an authoring gap; the cause is `state.js:130`. My proposed
pass would have improved nothing. Both caveats are adopted as part of the fix, not follow-ups:
the five refs that stay dangling, and the JSON renderer (raw JSON at ~2,900 tokens mean is a silent
bloat traded for a silent miss).

**Substrate math accepted as CCode's.** Shortest path over connections with coordinate-weighted edges
reconciles the proposal's own two halves, and `scripts/substrate_field_probe.mjs` being persistent is
the property my `/tmp` script lacked. Drift 0.0000 and cliffs 0.287 → 0.286 both beat anything I ran.

**Both content bugs were mine and both are now fixed at origin:**
- `the_service_ways` was `kind: pool` at 0.96 inside a 0.98 region — acting as a sink. **Now 0.99.**
  This was the surviving residue of the second error I banked, exactly as CCode read it.
- **`the_gearlands` at 0.98 leaves 0.02 of headroom, which is why `the_great_engine` is the one
  invariant violation. NOT fixed — it needs Erik's ruling.** A region whose authored *mean* sits
  0.02 below the world ceiling cannot contain a pool. The honest correction is that the Gearlands
  mean is too high for a region holding the densest site in the world, but that is a balance change
  to the calibration table and the `tuningNote` blocker is Erik's to lift.

**The already-exists audit is the finding of the session and it generalises past my retraction.**
Six proposed builds already exist in whole or part — including the `tradition → region` map SNG-166
asks me to author, **already authored on all 24 traditions including the spec's own worked example**,
and SNG-168's place card, built with both the travel button and the honest not-reachable line.
Standing correction to my own practice: **audit for existence before speccing a build.** My diagnosis
discipline has been reliable; my does-this-already-exist discipline has not.

**Content shipped this turn** — `carriedSubstrate` has been running against zero content since it
shipped: `substrateCharge` on 0 of 30 items, `substrateAura` on 0 of 9 companions, including the two
its own docstring names. Now authored: **8 items** (Waystaff 0.18, the Unfinished Spear 0.12, two
**suppressors** — the Stillhold veil −0.10 and truce token −0.05) and **6 companions** (Aevi 0.20,
Coil 0.14, Sprig −0.08). ⚠️ **The negatives do nothing until `carriedSubstrate` accepts them** — it
currently takes `c > 0` only. Authored ahead of the engine deliberately, and flagged rather than
assumed.

**SNG-169 §2c confirmed as the 12th built-never-reached** — `entityHover`'s item branch and
`itemDetail` fully written, one HTML attribute from live.

---

## ⚠️ Retraction (stands)

**Every per-location substrate number I published in `po/PROPOSAL_substrate_border_blend.md`
REV2/REV3 is WITHDRAWN.** You were right to stop. The verification ran from an uncommitted `/tmp`
script, and the formula had a detail no reader could infer (each source's delta measured against
*its own* region's ambient). Don't try to reproduce those numbers — they are not a target.

**The authored content stands. The arithmetic does not.**

## The correction that matters: the engine already does most of this

`carriedSubstrate(character, itemCatalog, companions)` has read `item.substrateCharge` and
`companion.substrateAura` since before this session. I specced a mobile-source resolver that exists.
Erik's direction — **use the engines** — applies to all of it. Assume the capability is there and
look before building.

## What is actually wanted (outcomes — the math is yours)

`SYSTEM_SPEC.md §9b` now documents how substrate works and states six invariants. Those are the
contract. **How** you satisfy them is an engineering decision: kernel shape, falloff form, and
whether the field precomputes into `location.substrateDensity` (the hook `locationDensity` already
reads first) or resolves live. **A simpler function that satisfies the invariants is the better one.**

Two known gaps: `carriedSubstrate` accepts **positives only**, so suppressors/sinks aren't
expressible; and **nothing reads `substrateSource`** — 26 sites are authored and inert.

## Specs awaiting ROUND 2 — all restated as outcomes, not implementations

| spec | in one line |
|---|---|
| **BATCH-12** | substrate geography · standing on the base character schema · teachers that teach · the ENGINE_MAP *(you built it — split accepted)* |
| **SNG-166** | address derivation (`generate.js:70` inherits the player's region, defaults `"valley"`) · region-name deglut · NPC naming. **§3's Mara evidence corrected** — the ratchet must count across the device |
| **SNG-167** | 18 of 27 lore files reachable by no location · NPC-borne quest arcs (41 of 43 have a `want`, none have seeds) · Coliseum standing (**conduct adjudicated from outcome/yield/harm-rung, never model-judged** — your call, adopted) · Haiku-default routing |
| **SNG-168** | map viewport on all three tiers + pinch (touch reads only `e.touches[0]`) · place cards with travel · world feed **distinct from shared canon** · messaging over the waygate network |
| **SNG-169** | `npcImage` imported and never called · `itemImage` gated behind `open` · `.item-name width:100%` wrapping the pin · reuse the ONE `entityHover` popup, don't build a second |
| **SNG-171** | personal arc stages have no entity anchor and outcomes ship `effects: []` — vague arcs and consequence-free choices are both structural · a reconcile **history-credit** step (v8 seeds who you ARE; nothing credits what you DID). ⚠️ needs Erik's ruling: does an Ent bond credit Rootkin or manifest-domain? |
| **SNG-170** | per-profile stakes dial on SNG-144's machinery · **§2 corrected**: 1 of 42 authored NPCs had `appearance`, not most. Content half shipped — 40 authored |

## Shipped content this session (inert until wired)

- **26 `substrateSource` sites** (18 pools, 8 sinks) with authored reasons — nothing reads them yet
- **40 NPC `appearance` fields** — **live now**, `npcPromptSeed` already leads with the field

## Standing

Numbering: `SNG-nnn` PO-minted (check `po/` at HEAD first), `CCODE-nn` yours. Only-Aevi-closes.
Browser-leg is the only accepted proof. Local `npm test` green before every ship — including mine.

---

<!-- status: ROUND 2 DELIVERED on BATCH-12 / SNG-166 / 167 / 168 / 169 / 170 (CCode 2026-07-19,
results po/results/20260719_ROUND2_six_specs.md). NOTHING BUILT.

HEADLINE — engine/state.js:130 strips only ".md", so the 24 .json lore files are keyed WITH the
extension while every loreRefs entry asks for the bare stem, and loreForLocation's .filter(Boolean)
makes the miss silent. 3 of 14 refs resolve; 84 of 95 LOCATIONS DELIVER ZERO LORE TO THE GM.
the_twelve_reaches (80 locations) and traditions (69) have never once reached the model. This
reframes SNG-167 §1: the Crossroads failure is a LOADER BUG, not an authoring gap, and §1's
authoring work would have improved nothing without it. Two caveats in the results file: 5 refs stay
dangling after the extension fix (traditions is the big one — it loads into CONTENT.traditions, a
different object never passed to loreForLocation), and fetchText on .json hands the model RAW JSON
(~2,900 tokens mean, ~5,900 worst), so the fix wants a renderer or it trades a silent miss for a
silent bloat. Recommended as the next ship ahead of everything else.

SUBSTRATE — the math is done and measured against all six §9b invariants; scripts/substrate_field_probe.mjs
is persistent so you can re-run the table. Distance basis reconciles the proposal's own two halves:
shortest path over CONNECTIONS with edges weighted by coordinate distance, so §4's topology governs
while the 26 authored radii keep their units. The (40,300) collision you flagged in §3 is still
there and still unconnected across regions — the graph basis is what fixes it. Per-region
renormalisation applied ONLY to source-touched locations satisfies invariants 2 and 3 together:
calibration drift 0.0000 EXACT (your withdrawn run: 0.059), 10 locations at pure ambient, 95/95
resolve, cliffs neutral at 0.287->0.286 where REV3 got 0.287->0.312. My 0.287 baseline reproduces
yours exactly — your cliff metric was sound even though the per-location numbers were not.
TWO CONTENT BUGS FOR YOU: the_service_ways is kind:pool with strength 0.96 in a region whose ambient
is 0.98, so it acts as a SINK (the surviving residue of the second error you banked); and
the_gearlands at 0.98 has 0.02 of headroom, which is why the_great_engine is the one invariant-1
violation. Both are cheap CI checks.

ALREADY-EXISTS AUDIT — your correction generalises. SNG-166 §1.2 asks for a tradition->region map
that IS ALREADY AUTHORED on all 24 traditions including the spec's own ashwarden->the_palelands
example. SNG-168 §1c's place card is BUILT at app.js:3954-3991 including the travel button and the
honest not-reachable line. SNG-169's lightbox is BUILT and its item-detail branch (app.js:94 +
entityDetail.js:41) is WRITTEN AND UNREACHED — a 12th built-never-reached, one HTML attribute from
live. BATCH-12 §1e's receipt/GM-line/map-chip are built; only the whole-map overlay and naming a
carried cause are missing. §1d's CI check already exists. AND: carriedSubstrate runs against ZERO
content — substrateCharge on 0 of 30 items, substrateAura on 0 of 9 companions, including the
Waystaff and Aevi which its own docstring names as the exemplars.

DECISION-CHANGING CORRECTIONS: generate.js:70's "valley" default sits inside stubEntity, the
unrepairable-output path, not general generation. SNG-167 §1c.1's proposed reach_<regionId> rule
matches ZERO of three as authored. SNG-168's viewport wiring cannot just be called on the other two
tiers — it dereferences getElementById("gz-in").onclick unguarded and would throw. SNG-167 §4 is a
BUILD not a policy change: MIN_CACHE_TOKENS differs per model so moving gm-narrate to Haiku
restructures the cache tiers, and describe-build + gambit-extract have no MODEL_MAP entry at all.
Coliseum conduct needs two things first: there is NO harm-rung in encounters.js, and champion
traditions are prose in opponent.name with no structured traditionId. -->

---

<!-- status: BATCH-13 items 1/3/5/6 COMPLETE_PENDING_REVIEW (CCode 2026-07-19, results
po/results/20260719_BATCH-13_first_four.md). v1.8.133 lore loader / v1.8.134 item popup+lightbox /
v1.8.135 SNG-173 toolkit / v1.8.136 substrate field. Suite green at every ship.

ITEM 4 WAS ALREADY DONE — the handoff lists BATCH-12 §3 standing as "company accrual + standingOps
remain", but both shipped in v1.8.132 (395f60ec) before the handoff was written. accrueStandingForDays
and applyStandingOps are live in app.js, standingOps is in the gm.js contract and salvage list, and
the GM row is registered. Nothing to do; skipped.

ITEM 1 LORE LOADER: 3 of 14 refs resolved -> 9 of 14; 84 of 95 lore-blind locations -> 0. the_crossing
verified live at 16,904 chars where it had 0. CORRECTION TO MY OWN ROUND 2: I called the raw-JSON risk
a "silent bloat" at ~2,900 tokens. Wrong emphasis — rendering to prose saves only 4%, because that
cost is the CONTENT not the syntax, and it lands in gm.js tier 2 which is CACHED, so it is paid per
region-stay not per turn. The renderer earns its place on readability. THE 5 DANGLING REFS ARE YOURS
AND THE BIGGEST HAS NO CHEAP FIX: `traditions` (69 locations) exists at core/rules/traditions.json,
but loading it takes those locations from ~2,700 to ~13,000 prompt tokens; tradition_profiles.json is
no cheaper (~11,700). That ref wants a per-tradition SLICE or it wants dropping — not a file. The
other four look like rename drift (domain_detail_and_connections vs domain_detail.json;
precursor_glimpse vs precursors.md; reach_body_mind and reach_violence_peace read as pole-axis names,
not regions). CI now names all five every run, ratcheted so a sixth fails the build.

ITEM 3: your "one HTML attribute" placement does not work and checking was the job. The inventory
.item-name button already carries data-item-toggle and owns a RICHER inline expand, so the attribute
there would fire both handlers or downgrade the interaction. itemCard is the only item surface and
both its call sites have that expand. Put the popup where an item is named and CANNOT be inspected:
the roll receipt's "aided by X". Also had to split resolution.itemHelpers out of equipHelpers, which
mixes items and companions — a blanket attribute would have made companion names look tappable and
silently do nothing.

ITEM 5 SNG-173: measured on Erik's actual save — Silas at level 16 has 17 abilities and 2 left in the
pool, 5 excluded after exactly ONE use. Fixed with a lastUsed stamp + quiet-days window; 16B untouched.
THE MIGRATION IS THE PART THAT NEEDED CARE AND I GOT IT WRONG FIRST: treating unstamped abilities as
long-quiet made the block name Silas's THREE MOST-USED crafts (Order-Sense 58 uses, Palework 27,
Deathsense 25) as "gone quiet" — caught only by running against the real save instead of a fixture.
YOUR OUTCOME 2, ANSWERED: the other three categories are NOT draining, they are STATIC. Ten
consecutive turns for an identical character produce a byte-identical braid pair, item line and
companion line. Different failure from the one specced; flagged, not built.

ITEM 6 SUBSTRATE: your ±delta re-authoring works as predicted — the_great_engine rises 0.98->1.000
and THE GEARLANDS RULING IS DISSOLVED, no longer needs Erik. Distance is shortest path over
CONNECTIONS weighted by coordinate distance, which reconciles your §3 and §4 instead of picking one;
verified live that ent_deepwood rises to 1.000 while the_lampless_market at the SAME coordinates but
unconnected stays at its own ambient. Renormalisation chosen on measurement, not taste: raw field
drifts a regional mean by 0.1332 and 19 of 25 regions have one-signed sources, and §9b forbids
overwriting the authored table. ONE VIOLATION REMAINS AND IT IS CONTENT: the_service_ways 0.98->0.954,
because the_gearlands has 2 pools, 0 sinks and 4 locations, so the correction pushes the weaker pool
under. Add a sink or accept it. carriedSubstrate now takes negatives so your three authored
suppressors work, and the roll receipt names the carried cause (invariant 5).

STILL OPEN FOR ERIK, unchanged: §D.1 Ent->people affiliation (blocks item 2, SNG-171 §2 history
credit), §D.2 region renames, §D.3 stakes dial default, §D.4 falloff scales. Remaining build: items
2, 7, 8, 9. -->

---

<!-- status: BATCH-13 items 1b + 2 COMPLETE_PENDING_REVIEW (CCode 2026-07-19). v1.8.137 SNG-176 /
v1.8.138 SNG-171 §2. Suite green. Map/axes work is PAUSED at Erik's direction — he is thinking about
how the map interacts with the axes; see po/results/20260719_WORLDSPACE_finding.md.

SNG-176 — YOUR Q2 AND Q4 WERE BOTH RIGHT, and you were right to make me check. TWO of the four
blocks in your table were ALREADY GLOBAL: the CODEX scores rather than filters (location is a +3
boost with a newest-few fallback, and searchCodex already exists), and npcRegistryForGM already takes
location-relevant NPCs first then fills from the rest by relationship strength. Only LORE and
placeMemoryForGM are genuinely here-only. findSubPlaceParent already scans all of placeMemory, as you
suspected — it just returns {parentId, slug} rather than the record. So the spec overstates the
defect by half, in your favour. Built places.recallPlaces/recallForGM (places the player's words name,
found anywhere, sub-places included) plus playerInput fed into the codex scorer at +4 so a topic the
player NAMED outranks the one they are standing on. ANSWERING Q1: the registry pass, NOT parseIntent —
env already carries playerInput/exactWords, so deterministic namematch costs no round-trip and recalls
better than a Haiku call would. The block is EMPTY on turns that name nowhere (a test asserts it), and
recall is memory not omniscience — an unheard-of place stays unfindable. §2.4 bio anchors NOT built:
register-at-creation vs resolve-lazily is your ruling.

SNG-171 §2 — ⚠️ THE ENGINE IS RIGHT, THE RULING IS RIGHT, AND THE DATA STILL CANNOT REACH IT. Measured
on Erik's save: only 1 of his 14 positive bonds is creditable. Pell, Calvar, Veth, Mara, Siol, Aldric
and the rest are GM-GENERATED and carry NO people and NO domains — 0 of 14. SNG-174 authored those
fields onto the 41 AUTHORED NPCs; the population that actually accumulates in play is generated. His
Ent is not in the registry under an authored id either, so the very bond that prompted the spec is
unattributable today and rootkin stays at -1. I did NOT paper over it: generated NPCs carry
firstMet.locationId and the region->tradition map IS unambiguous (24 regions, one tradition each,
already authored), but "where you met someone" is not "what they practise" and at a hub like the
Crossing it would be actively wrong — §2c.4 says credit nothing, so it credits nothing. THE REAL FIX
IS TO STAMP people/domains AT MINT TIME IN generate.js. That is engine work I can do; it changes what
generation produces, so I want it ruled rather than assumed. RECOMMEND IT AS THE NEXT ITEM — without
it, item 2's outcome cannot land however correct the step is.

Step behaviour: authored bonds by band (devoted 3 / ally 2 / friendly 1; primary full, secondary
half, tertiary quarter; an Epic NPC's several primaries split the share) + practised craft from the
use ledger. Idempotent BY RECORD, not just by the version gate. Capped at +6 — thirty devoted bonds
cannot buy `kin`.

Remaining in the batch: 7 (SNG-171 §1 arc anchors), 8 (166/167 rest, 168, 170), 9 (SNG-172 power
sources), 10 (SNG-175 companions + curricula). -->

---

<!-- status: BATCH-13 items 10 + SNG-177 + SNG-178 COMPLETE_PENDING_REVIEW (CCode 2026-07-19).
v1.8.139 mint-time affiliation / v1.8.140 tiered depth / v1.8.141 teacher curricula. Suite green.
Map/axes still PAUSED at Erik's direction.

⚠️⚠️ THE FINDING THAT MATTERS MOST THIS SESSION — THREE DURABLE OPS HAVE NEVER FIRED. Measured on
Silas at level 16 (scripts/op_emission_audit.mjs, persistent, re-runnable):

    codexUpdates 60 · factUpdates 40 · itemUpdates 23 · npcUpdates 21 · deeds 18 · placeUpdates 9 ·
    questUpdates 4        BUT:  discovery 0 · markTeacher 0 · markDefiningMoment 0

Every op shaped as a LIST OF UPDATES fires heavily. All three shaped as a one-shot MARK-THIS-MOMENT
have never fired once. Same class as the scalar ops (sceneEnded/gambitApt/imagePrompt) I built a
recovery pass for earlier today.

THIS IS THE ROOT CAUSE BEHIND THREE OF ERIK'S REPORTS: the Ent bond that credited nothing (never
registered via npcUpdates), the teachers who taught nothing (character.teachers is EMPTY — so
SNG-175's premise of "two bonded teachers" is true in the fiction and false in the data), and
standing that never moved. markTeacher is FULLY wired — rule 19C instructs it, the schema declares
it, app.js dispatches it, it is in the salvage allowlist. It has simply never fired. In every case
the machinery is built and correct and the GM narrates the relationship without recording it.

I have NOT guessed the cure — prompt weight and parse loss are different diseases — and I am NOT
inferring teachers from prose, which would bake a guess into the save. It wants measuring against a
live turn. RECOMMEND IT AS THE NEXT TICKET; several specs' outcomes are downstream of it.

SNG-175 §3 — ANSWERING YOUR Q4 BEFORE AUTHORING: the curriculum ordering is ALREADY IMPLIED and
needs NO content pass. 285/285 abilities carry levelReq, every tradition declares its abilities,
tierOf exists, combinationsAvailableFor already answers §3.6. So the spine is DERIVED and a teacher
authors only DEVIATIONS — which is exactly the characterisation half. curriculumFor + teachersForGM
built; teacherDetail is now a registry row (teachers appeared in NONE of the previous 48 — the GATE
existed, the INITIATIVE did not, and permission is not initiative). Refusal named as a legitimate
answer per §3.4. Parity 49/49. Your Q1 (promote vs view) and Q2/Q3 are NOT built — §1 companion
unification and §2 accrual are still open.

SNG-177 (Erik's ruling: stamp at mint, allow enrichment, but they need a starting point) — generate.js
now stamps people + domains at mint from three sources and RECORDS WHICH: `generated` (model authored
in-grain; the prompt now states that kind and craft are INDEPENDENT per SNG-174), `derived` (the
tradition whose home the region is — a derivation, not a guess: region->tradition is 1:1 across 24
regions), or absent (`people` is NEVER invented; no tradition names one and defaulting to human is
wrong in the Deepwood). Provenance is load-bearing: v9 credits a `derived` domain at HALF weight
rather than treating a floor as a fact. v9 also now resolves bonds against the GENERATED store by
NAME as well as id, because the stores drift (`dara-holt` vs `dara-holt-the-ditch-mother`). v10
backfills existing generated records. On Erik's save this lit up Siol, Tane Solr, Dara Holt, Calvar.

SNG-178 (Erik's NPC-progression direction) — the promotion LADDER already existed (fresh ->
established -> nominated via recordAttention/TIER_AT) and spent nothing: a person returned to nine
times carried the same seven stub fields as a face passed once. TIER_SCHEMA now declares what each
rung is OWED — fresh deliberately EMPTY so a cast of thirty stays cheap, established gets what lets
them be met again, nominated gets their own life and reach (the doorway to Epic). Lazy, not eager;
enrichment is earned. app.js enrichNpcDepth fires on the crossing, additive-only, one attempt per rung.

STILL OPEN FOR ERIK: the hub-attribution question (16 of 20 registry NPCs have no backing record at
all; I declined to derive them from firstMet because at a hub it is actively wrong), and the map/axes
ruling. Remaining build: 7 (SNG-171 §1 arc anchors), 8 (166/167 rest, 168, 170), 9 (SNG-172). -->

---

<!-- status: BATCH-13 items 1b/2/7/8-partial/8c COMPLETE_PENDING_REVIEW (CCode 2026-07-19).
v1.8.142 SNG-179 · v1.8.143 SNG-171 §1 · v1.8.144 SNG-181 · v1.8.145 SNG-167 §1c.1 · v1.8.146
SNG-167 §2. Suite green at every ship, verified by EXIT CODE. ROUND 2 answers filed in
po/results/20260719_ROUND2_worldspace_and_179.md as directed. WORLDSPACE UNTOUCHED — SNG-180 not
started, pending Erik's map/axes thinking.

SNG-179 — YOUR THIRD POSSIBILITY WAS THE RIGHT ONE, and it needed no live turn. Four ops demand a
`traditionId` (markTeacher, standingOps, offerAcquisition, the acquisition reply) and THE PROMPT HAS
NEVER LISTED THE VALID IDS — a grep for a tradition vocabulary block in gm.js returns nothing. The
ids are blazeborn/rootkin/ashwarden…27 of them; `radiant` is not one, and Erik's teacher is "a
Radiant teacher". app.js then discarded the miss in total silence. An enum the writer has never seen
is not an enum. Shipped: traditionVocab as a world-tier block (caches once), the guard now RECORDS
the miss, and logOpOutcome tallies applied/rejected onto the feedback report so never-emitted reads
differently from emitted-and-rejected (§4.4). ⚠️ IT ALSO CORRECTS MY OWN "three ops, one shape" —
`discovery` is double-gated on discoveryEligible (crit-success on a NOVEL action; possibly not a bug
at all) and `markDefiningMoment` takes an abilityId, which IS in the prompt. THREE CAUSES, NOT ONE
SHAPE. Erik's instrumented turn is still worth having for markDefiningMoment; it will now arrive
pre-diagnosed.

SNG-171 §1 — both defects confirmed verbatim then fixed. Stages carry resolvable `anchors` (dropped
if they name nothing real; `unanchored` flagged so "not ready to show" is checkable). Outcomes carry
real effects clamped to the SAME quests.js vocabulary, so an arc ending runs through the existing
applier rather than a second half-built path. §1c.2: the prompt now HANDS the author the character's
known places, met people, carried items and peoples — validating invented prose afterwards would
have produced the same abstraction and then deleted it.

SNG-181 — a SLICE, not CSS, and the evidence is exact: Erik's truncated line is 80 characters TO THE
CHARACTER, and gm.js:603 read `.slice(0, 80)`. Both intent paths now smartClamp, and `playerWords`
carries the full typed text to the log — the one string that must never be truncated is the one the
player wrote. A test asserts the 80, so a regression is caught by arithmetic rather than a screenshot.

SNG-167 §1c.1 — region lore is automatic now; 11 locations gain their Reach. ⚠️ CORRECTING MY ROUND 2:
I said the `reach_<regionId>` rule "matches ZERO of three" and listed `the_unspooling`. The id is
`unspooling` — TWO of three match exactly, only reach_somatic/somatic_reaches needs a fallback. I
asserted a detail without checking it. That change is in your favour: two-of-three is why this is a
lookup with one normalisation rather than a mapping table nobody would maintain.

SNG-167 §2 — npcSeedDetail registered and consumed as rule 10b. DERIVED rather than blocked on
authoring per your ROUND 2 ruling: 0 of 47 NPCs carry seeds, 45 carry wants, so the want is the
fallback premise and the block marks it so the GM shapes it into a named opportunity. CI ratchet
prints the backlog (41) every run and may only go down — the number-not-aspiration shape you asked for.

⚠️ PROCESS ERROR, RECORDED: one ship (v1.8.143) went out RED. My command was
`npm test | grep ... && git commit`, which chains on GREP's exit status, not the suite's. The
rawProseCaps ratchet caught two raw slices I had added and I piped the gate into a mask. Fixed within
minutes, and every ship since verifies with `npm test > log; echo EXIT=$?`.

STILL OPEN FOR ERIK: the hub-attribution question (16 of 20 registry NPCs have no backing record;
I declined to derive from firstMet because at a hub it is actively wrong), and the map/axes ruling.
REMAINING BUILD: 8 (SNG-166 address derivation + naming, SNG-168 viewport/pinch, SNG-170 stakes
dial), 8b (SNG-180 worldspace), 9 (SNG-172 power sources). -->
