# PO ALERT

> **➡️ NEXT TWO, in order:**
>
> **1. `po/SPEC_SNG-185_hub_attribution.md`** — the single upstream dependency behind both outcomes
> Erik reported. Two paths mint people and only one stamps domains: `generate.js:566–583` does it
> with provenance, `npcs.js :: applyNpcUpdates` — how the GM meets anyone in play — does nothing.
> Veth and the Crossing Ent both came through the second. Derivation order is **role string first**
> (Veth's literally says *Ashwarden*), skills second, region home last. ⛔ **A role naming a PEOPLE is
> not a domain** — "Ent" is a kind, and a naive matcher mis-assigns every Ent in the registry.
>
> **2. `po/SPEC_SNG-186_dev_mode.md`** — the workbench. Erik-requested and Erik-approved. Every
> defect this batch cost a live play session to find; he is currently the only instrument in the
> system and a slow one. **Build §2f first** (assembled prompt · raw response · parsed result · which
> ops fired) — it is how SNG-179 was diagnosed by hand, made a button. Load-bearing invariant §3.3:
> **dev writes go through the same functions play does.** A lever that bypasses a real path tests a
> path that does not exist, and will cheerfully prove things that are false.
>
> Content shipped alongside: **22 teachers** (was 1), covering 14 of 24 pole traditions —
> deviations only, per your levelReq answer.

> **➡️ BATCH-13 capstone: `po/SPEC_SNG-183_full_accounting.md`.** The engine map completed across
> code, content and ops, plus the six defect lenses this batch produced. Read with
> `po/BATCH-13_handoff.md` for the build order.
>
> **Substrate geography is CLOSED.** `threeGrounds` is canon: thin has three causes — *pooled*
> (never transitioned), *released* (completed; the lattice withdrew), and *unreached* (never
> arrived). The first two are authored sources; the third is ordinary country and needs none.
> 43 of 95 locations carry local variation and **Erik has ruled that correct** — the gaps are
> wild-nanite habitat and room to expand.

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
- ~~`the_gearlands` headroom~~ **✅ DISSOLVED, no ruling needed.** Pools/sinks are now ±deltas
  against the region background (Erik: *"they're basically big auras"*), so `the_great_engine` is
  `+0.22` above ambient wherever the regional mean sits. The metric that produced the violation
  no longer exists. A region whose authored *mean* sits
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

---

<!-- status: BATCH-13 item 8 SUBSTANTIALLY COMPLETE_PENDING_REVIEW (CCode 2026-07-19). v1.8.147
SNG-168 viewport · v1.8.148 SNG-166 §1 address derivation · v1.8.149 SNG-166 §3 naming. Suite green
at each, verified by EXIT CODE.

SNG-168 — FOUR defects and the first explains the rest. The world and location tiers rendered a BARE
<svg>, but the reason they were never simply wired is that wireSkillGraphViewport DEREFERENCED THREE
CONTROLS only the region tier renders (getElementById("gz-in").onclick, unguarded) — so calling it
anywhere else threw before reaching the listeners. The null-guard is what makes one wiring serve five
surfaces; the markup fix alone would have crashed. PINCH: touches[1] appeared ZERO times repo-wide,
so zoom was wheel-only and a phone has no wheel. THE LEAK IS REAL as your audit suspected — one
module-level graphView served map AND wheel AND graph, so zooming the map and opening the wheel
inherited the transform; state is now keyed per surface (world/location/map/wheel/graph). Verified
against the app the browser actually serves, zero console errors.

SNG-166 §1 — MEASURED ON THE LIVE SAVE: all 6 generated locations carried regionId=valley, including
`gen-center`, which IS the Crossing, and `gen-ashwarden-march-road`, which is the Palelands. My ROUND
2 noted the stubEntity default only fires on unrepairable output and MISSED the second cause: the
general path never asked the model for a region at all, and the prompt handed it "WHERE: <the
player's current place>" and nothing else. Same lesson as SNG-179 — the valid regionId list now ships
in the prompt and says the right answer is NOT necessarily the place above. resolveRegionFor orders
evidence authored -> named -> anchor -> unresolved, and THE ORDER IS THE FIX: the anchor is wherever
the player stands, so inheriting it IS the bug. Re-resolved: gen-center -> the_center,
gen-ashwarden-march-road -> the_palelands, the four genuinely-local ones correctly stay valley.
Unresolvable now yields NULL + regionSource:"unresolved" per ROUND 2. CI guard added from my own
ROUND 2 §6.1 — content_ci fails on a hardcoded region default, because "derive, else default" had
already come back once.

SNG-166 §3 — YOUR CORRECTION PROVING ITSELF, with the number. Across 10 characters on this device: 52
distinct given names, 5 recurring, and MARA MET BY FOUR CHARACTERS. Within any one save there is
exactly one Mara, so the per-character ratchet the spec first proposed would have read GREEN forever
while the thing Erik noticed kept happening. namematch now carries givenName / usedGivenNames /
namesToAvoid / nameRepetitionCount, counted across the device, avoid-list sorted worst-first so
truncation keeps the real offenders. THE ONOMASTICS HALF CAME FROM CONTENT THAT ALREADY EXISTED —
traditions.json carries an `aesthetic` line for all 24 peoples, so names can sound like the country
that made them with no phoneme table and no authoring pass.

REMAINING AND WAITING ON A RULING, NOT ON ME: SNG-166 §2 region renames (display-name migration —
cost measured at 52 occurrences across 18 files, ids provably unaffected), SNG-170 stakes dial
(default + whether the boar/greatcat flip to lethal), SNG-180 worldspace (Erik's map/axes thinking),
SNG-172 power sources (wants the substrate ruler settled). Also still open: the hub-attribution
question — 16 of 20 registry NPCs have no backing record, and I declined to derive them from
firstMet because at a hub it is actively wrong. -->

---

<!-- status: SNG-182 + SNG-180 COMPLETE_PENDING_REVIEW (CCode 2026-07-19). v1.8.150 SNG-182 ·
v1.8.151 SNG-180. Suite green, verified by exit code.

SNG-182 — ANSWERING YOUR Q1 BEFORE BUILDING: there is no resolver, there are FIFTY-SEVEN. 57 ad-hoc
"look the record up by id, take .name, fall back to the id" sites across app.js and engine/, 52 of
them for traditions alone, and the region lookup written out verbatim twice. Erik's generalisation is
exactly right. Q2: {{…}} is unreserved. Q4: ZERO tokens today, so this is the cheapest possible
moment for the gate — your guess, confirmed. Q3 — RESOLUTION BELONGS AT ASSEMBLY, NOT LOAD, and
SNG-111 decides it: progressive naming is PER-CHARACTER, so the same NPC id is "the dock-master" to
one character and "Sorel" to another; baking a name at load destroys that permanently. Wired at
assembleGMContext, the one choke point every view already passes through, so no builder has to
remember and the model can never see token syntax. §2.3 acceptance test PASSES — change the record,
every reference follows, one edit. §2.4 is the loreRefs lesson applied IN ADVANCE: unresolvable
tokens fail CI and degrade readably at runtime, never a blank and never raw {{…}} to a player.
Verified by planting a broken token — it failed, named the file and field, and resolved the good
token in the same file. Migration stays incremental per §2.7; nothing retrofitted.

SNG-180 — the sphere ships. Geodesic on your authored worldPos, and the geometry confirms itself:
the_great_engine <-> the_numen = 3.1277 radii (~π, 299 walking days), and routing that trip VIA THE
CROSSING costs 3.1314 — a difference of 0.0036. The hub sits exactly πR/2 from every Reach and the
antipode/neighbour ratio is 12, the same 12 as the axes. walkingDays is wired to the map place card
so the year-to-walk scale is immediately player-visible.

⚠️⚠️ THE SUBSTRATE RULER DOES NOT SHIP AND THIS IS THE PART TO READ. Erik is right that mechanics
should not measure with a drawing, so I switched the substrate field to geodesic — and the §9b
invariants BROKE: pools/sinks 25/26 -> 11/26, locations with local variation 73 -> 0. Not a constant
problem; I derived the conversion twice, first from median pairwise ratio (222) then properly from
median CONNECTED-EDGE length (309) since the radii were tuned against reach along the graph. Both
flat. CAUSE: intra-region geodesic distance has a median of 0.234 radii against a converted radius of
0.388, so a source sits at ~55% strength across its ENTIRE region — every location gets a near-uniform
delta and per-region renormalisation cancels it to nothing. YOUR worldPos IS NOT THE PROBLEM: it is
distinct for all 95 and 0% identical within any region. The issue is GRANULARITY — the sphere resolves
regions; the substrate field needs sub-region resolution. Either the 26 radii re-author much smaller
in world units, or substrate keeps the travel graph as its ruler. A design call with numbers attached,
not something to dial until it passes. I reverted rather than ship a flat field to satisfy an
architectural preference.

MY OWN GATES CAUGHT ME TWICE IN THIS SHIP: the revert left geodesic with no consumer (testOnlyExports
8 -> 10, "CANNOT FIRE IN PLAY"), which is what prompted the place-card wiring; then isAntipodal and
nameRepetitionCount were still test-only — speculative API I wrote because it seemed worth having.
Deleted rather than special-cased. Ratchet improved 8 -> 7.

REMAINING: SNG-172 power sources (ruling 2 unblocked the 285-ability classification; largest left),
SNG-166 §2 renames (now land THROUGH SNG-182), SNG-170 stakes dial (default still yours). -->

---

<!-- status: SNG-183 CAPSTONE COMPLETE_PENDING_REVIEW (CCode 2026-07-19). v1.8.152. Suite green,
verified by exit code. Results: po/results/20260719_SNG-183_full_accounting.md.

FOUR OF THE SIX LENSES NOW RUN IN npm test. L1 (testOnlyExports/importedNeverCalled) and L4 (loreRef
gate) already existed. The two that were only ideas are now gates:

  L2 permission-isn't-initiative — ENGINE_MAP gains a third authored column, `what makes it fire`.
  A module with a real player surface and NONE for a trigger is a capability nothing makes happen —
  the teacher gate that never fired. Gate requires all THREE columns present or all absent; warns on
  the L2 shape. 24/55 described (incremental per the accepted split). Verified by flipping gm.js to
  NONE and watching the warn fire.

  L5 static half — the missing link was DISPATCH. GUARD 2 already checked schema<->salvage parity;
  wiring_audit now also checks every documented op has a turn.<op> consumer in applyTurn. An op with
  full wiring that nothing reads is dead on arrival, caught at build. Proven with a phantom op. The
  runtime _opLedger (SNG-179) is the other half.

  L6 universal-gate-for-a-local-fact — content_ci finds a random encounter whose minDanger exceeds
  the dangerLevel of every location its tags match. re_toll_bandits is fixed (reaches all 6 tag-homes
  now). ⚠️ THE CHECK IMMEDIATELY SURFACED A LIVE SECOND INSTANCE THE BATCH HAD NOT FOUND:
  re_creature_chase, minDanger 3, whose only "wild"-tagged home is dl2 — a predator that can never
  appear on the one wild road. Ratcheted at 1 and NAMED, because the fix is a number Erik owns (lower
  the floor or raise a location's danger). A second new instance fails the build.

  L3 guard-in-a-pipe — the ONE lens that cannot be a gate, because it IS the verification layer.
  Lives as a rule (verify by exit code, no test result across a pipe) in the lens table, and it is
  the discipline every ship since has followed. Reported as unmechanizable rather than faked.

NOT DONE, DELIBERATELY: the full op->engine->surface connection GRAPH as a single rendered artifact
(§3d). The pieces exist (registry, dispatch check, authored surface column); I did not want to ship a
half-derived graph and call it the accounting. Natural next increment.

STILL OPEN AND YOURS: the substrate ruler (my handoff question — does your implementation renormalise
per region? mine forces drift to ~0 by construction and I believe that is what breaks invariant 1 at
your radiusWorld scale), SNG-172 power-source classification, the renames themselves (land through
SNG-182), the stakes-dial default, SNG-179's live instrumented turn for markDefiningMoment, and
re_creature_chase's danger number. -->

---

<!-- status: SUBSTRATE RULER SHIPPED (CCode 2026-07-19). v1.8.153. Suite green, browser-verified.
Results: po/results/20260719_CCODE_three_landings_verified.md.

Your no-renormalisation answer was the whole difference and I found it myself. Removed the
renormalisation block — pools-rise/sinks-fall is now STRUCTURAL. Your corrected §9b invariant-2
wording shipped into SYSTEM_SPEC (means stay NEAR as a consequence, drift-to-zero is a symptom). AND
my second error: the distance was DIRECT geodesic, not path-over-connections — path-over-connections
is right for walkingDays (roads) and wrong for the field (the lattice radiates through space).
Confirmed empirically: direct geodesic reproduces your drift 0.0515 TO THE DIGIT; the connection
graph does not. Verified through the LIVE browser modules: 26/26 invariant, drift 0.0515, the_blaze
1.00 / the_heartroot 0.02 / sunken_choir 0.66 — every number matches yours.

RENAMES verified through my resolver: 7 tokens across content, 0 unresolvable, the five renames
resolve live. content-CI token gate now reports 7-and-all-resolve on the real corpus.

⚠️ FOUND, NOT BUILT — power_sources.json IS AN L4 ORPHAN, caught by the lens I shipped hours ago.
state.js never loads it (no loadRule("power_sources")); nothing in engine/app/tests/scripts reads
it. And the ruling it encodes is NOT yet mechanically true: umbral — your worked example — has NO
substrateBand, so it is substrate-NEUTRAL today (full power everywhere), not benefiting from thin. I
did NOT wire it, for two reasons: (1) "natural benefits from thin" means an INVERTED band, which is
new curve shape under tuningNote — your content lane and Erik's balance call; (2) my L4 gate covers
lore and location addresses but NOT rules-file reachability, so a registered-but-unloaded rules file
sails through — a real gap in my own gate. ONE SMALL TICKET: either wire power_sources into
substrateVerdict (with balance_sim as the gate) or mark it a reference document, so the lens stops
seeing an ambiguous half-landed state. I can extend the L4 gate to rules files either way.

STILL OPEN AND YOURS: stakes-dial default, SNG-179's live turn, re_creature_chase's danger number,
and the power_sources wire-or-flag decision. -->

---

<!-- status: SNG-172 audit + L4 rules gate (v1.8.154) and SNG-179 fix (v1.8.155) COMPLETE_PENDING_REVIEW
(CCode 2026-07-19). Suite green, verified by exit code + regression-proven gates. Results:
20260719_SNG-179_FIX.md, and the audit/gate in the same commits.

SNG-172 — AUDIT, not wired, per Erik. content_ci now checks classification agrees with band centre
(natural low, lattice high). Verified the relationship before encoding: naturals 0.18-0.36, lattice
0.58-0.95, cleanly separable. threnodist + verist (natural, banded 0.50) are your two
flagged-not-changed disagreements — known-listed, reported, not failed. The umbral hole is closed
(0.58/0.28) and the check proves it fires by stripping a band. AND this reads power_sources.json, so
it is no longer the L4 orphan.

SNG-183 L4 FOR RULES FILES — closed the gap you named ("registered-but-unloaded should not pass").
A kind:"rules" file must have a consumer (loader or CI); design/reference kinds are exempt.
power_sources passes via the audit; quest_structure (kind:rules, authoring guidance) is ratcheted at
1, named not reclassified. A NEW unloaded operational rules file fails — proven with a probe.

SNG-179 — I CHECKED ALL THREE MAPPINGS AND ONLY ONE WAS SAFE TO BUILD, which is what "check each
pairing" is for. markTeacher: BUILT — derived from bondType:"mentor" + the mentor's own domain,
never invented, additive to explicit markTeacher. discovery: NOT derived — it is precondition-gated
(discoveryEligible, a crit-success on novel; Silas has 0), so deriving from codexUpdates would fire a
false reward. markDefiningMoment: NOT derived — Silas HAS ripe candidates so it IS substitution, but
a deed carries no abilityId and there is nothing clean to derive from. Both 19C and 19B rebalanced —
brake to the middle, qualifier last, NO emphasis added. 19B's engine confirm-and-refuse reframed from
a warning into the safety net that PERMITS firing.

⚠️ THE VERIFICATION IS ERIK'S and I did not pretend a unit test suffices — you said it wouldn't.
Re-run "Ask Veth to teach you," confirm character.teachers non-empty, confirm the capstone unlock
opens. TWO UPSTREAM DEPENDENCIES you will hit, both the SAME open gap: the captured Veth turn set
NEITHER bondType NOR a domain (she is sworn, registry-only, no backing record). The 19C rebalance
makes the model likelier to set the bond; the domain needs the SNG-177 backfill for REGISTRY-ONLY
NPCs — the same hub-attribution gap behind the Ent crediting nothing. Mechanism verified; Veth's
end-to-end waits on that gap. logOpOutcome now records "derived-from-bond" so the op-ledger shows it.

THE HUB-ATTRIBUTION GAP (registry-only NPCs with no domain) is now the single upstream dependency
behind BOTH the Ent-standing and the Veth-teacher outcomes. Recommend it as its own ticket — it is
the last thing between three shipped mechanisms and the outcomes Erik reported.

STILL OPEN AND YOURS: stakes-dial default, re_creature_chase's danger number, the reproduced-symptom
verification of SNG-179, and the registry-only-NPC affiliation gap. -->

---

<!-- status: SNG-185 hub-attribution COMPLETE_PENDING_REVIEW (CCode 2026-07-19). v1.8.156. Suite
green, verified by exit code. Results: po/results/20260719_SNG-185_hub_attribution.md. This CLOSES
the single upstream dependency the last three blocks kept naming.

YOUR ONE-LINE GAP WAS EXACT — two paths mint people, only generate.js stamped domains. §5.1 answered
by DOING it: generate.js:affiliationFor is no longer a second implementation, it delegates to a new
engine/affiliation.js that the GM meet-path (npcs.js applyNpcUpdates) and the reconcile v11 backfill
also call. One rule now. The shared version is a strict superset, so generation gains role +
skillsObserved reading with nothing regressed.

§5.2 — SAFE, and I did NOT add a third required-on-meet field. You warned the list (gender,
appearance) is getting long and the model drops fields under load; deriving from the ROLE the model
already writes sidesteps it entirely. Order per §3: role string FIRST, skillsObserved second, region
home LAST (marked derived, half-weight). §5.3 backfill uses that same order.

⛔ THE TRAP AVOIDED, STRUCTURALLY not carefully — readPeople and readDomains match SEPARATE
vocabularies and share no code path. The Crossing Ent resolves people:ent AND no domain invented from
being an Ent. Whole-word too, so `mason` never matches inside `stonemasonry`. Erik's SNG-174 ruling
made mechanical.

⚠️ AN HONEST NUMBER: the backfill affiliated 1 of 21 registry NPCs and that is CORRECT. 20 were met
in the VALLEY, home to no single tradition, and their roles name no craft — so region-fallback rightly
abstains (§4.4, never assign what the record cannot support) rather than manufacturing 20 domains.
I'd rather report 1/21 with the reason than tune the fallback to fire for the mixed basin.

VETH: the DOMAIN half — the blocker — is CLOSED. She carries ashwarden (source role) after backfill;
markTeacher would resolve it and open the capstone gate. The remaining half is the model setting
bondType:"mentor" on the live turn (the SNG-179 rebalance) — that stays your reproduced-symptom check.
THE ENT was never in Silas's registry at all (SNG-179 finding), so nothing to backfill; going forward
the meet-path stamps it people:ent at meet. 14 new tests, all acceptance points. affiliation.js earned
its SYSTEM_SPEC row + three ENGINE_MAP columns (my own ratchets caught the omission).

STILL OPEN AND YOURS: stakes-dial default, re_creature_chase's danger number, and the reproduced-
symptom verification of SNG-179 (now unblocked on the domain half). -->

---

<!-- status: SNG-186 §2f (see the machine) COMPLETE_PENDING_REVIEW (CCode 2026-07-19). v1.8.157.
Suite green by exit code; 🔬 Machine screen verified live in the browser. Results:
po/results/20260719_SNG-186_2f_see_the_machine.md. §2f ONLY — §2c/§2a/§2b are the next increments.

Stakes + re_creature_chase (minDanger 3→2) received at HEAD; the creature-chase number passes my L6
check clean (reachable on dl2 now), no re-baseline. Built §2f first per your §4 order.

YOUR §5, ANSWERED BY BUILDING IT. §5.1 (clean seam?) — ONE, and the cleanest possible: every model
call routes through callClaude, so a single optional observer there (setCallObserver) captures the GM
turn AND every sub-call (intent-parse/narrate/generate) for free. The transport stays dev-agnostic;
app.js registers the capture ONLY under isDevMode() at boot. No lever reached past a path. §5.2 (prompt
recoverable?) — was NOT retained (locals in gmTurn); is now, at that one seam, 24-entry ring, dev-only.
§5.4 — one screen with sections; §2f is the first.

§3.4 HELD AND TESTED — armed starts false; in a player view the observer is null and NOTHING is
captured. Disarmed recordCall returns null (asserted).

THE ZERO IS THE SIGNATURE. The firing-counts panel shows a count for EVERY documented op including the
never-fired — the SNG-183 §3c view (three ops read zero for sixteen levels) without a play session.
Verified live: NEVER FIRED (32) lists discovery/markTeacher/markDefiningMoment at 0. To avoid a THIRD
copy of the op list I made salvageOps' array the exported SALVAGEABLE_OPS — the ONE source the
salvager, the wiring audit GUARD 2, and this panel share; two source-regex consumers updated so the
rename can't drift them. Ops-fired from the parsed turn, applied/rejected from the real _opLedger
(reused) — fired / rejected-only / never read as three states.

§3.2 — feedback reports now carry ctx.devMode + a _devActions ledger (the mutating levers §2c/d/e will
append to). §2f is read-only so it appends nothing, but a dev session can no longer hide itself.

⚠️ THE ONE PATH NOT EXERCISED: an actual API capture (prompt→raw→parsed for a real turn) needs a key +
a played turn — it is Erik's browser-leg AND it DOUBLES as the SNG-179 verification. Play a turn with
dev on, open 🔬 Machine, and the Veth teach-me exchange is right there: raw npcUpdates, whether
bondType:"mentor" fired, whether markTeacher derived. The instrument and the thing it diagnoses arrive
together. 9 new smoke tests; devcapture.js earned its SYSTEM_SPEC row + ENGINE_MAP columns + count bump.

REMAINING IN SNG-186: §2c stage-an-encounter (seam confirmed clean — startEncounter takes a full def,
sanitizeNewEncounter clamps it), §2a go-anywhere, §2b know-nothing reset. Then SNG-187 cold-load
(received, briefed — Promise.all per manifest group; caution 3 the order-independence trap is noted).
STILL OPEN AND YOURS: SNG-179's reproduced-symptom verification (now also the §2f live check). -->

---

<!-- status: SNG-187 cold-load COMPLETE_PENDING_REVIEW (CCode 2026-07-19). v1.8.158. Suite green by
exit code; correctness proven byte-identical against the sequential load. Results:
po/results/20260719_SNG-187_cold_load.md. Erik chose this over §2c and SNG-188.

YOUR DIAGNOSIS WAS EXACT. loadContent awaited ~250 JSON files STRICTLY SEQUENTIALLY (Promise.all
appeared zero times) = ~15s of pure round-trip latency, not payload. Counted the fetches: 250.

THE FIX — three sequential stretches parallelised: the ~12 core rule-loads (one Promise.all), the 10
content groups (the 252 files, promises created before the first await so groups OVERLAP), the
~14-fetch tail. ~250 serial round-trips → a handful of waves.

BOTH CAUTIONS HELD. Failure tolerance — valley items + quests keep allSettled (skip a bad file);
every fatal-on-miss group stays Promise.all. Order-independence — Promise.all/allSettled preserve
INPUT order in their results, so every fold runs in manifest order; an id collision's winner is
unchanged (last-write-wins), quests concat in the same order. CAUTION 3 PROVEN NOT ASSUMED: a Node
harness (fetch shim over the real files) ran loadContent both ways and compared a fingerprint —
counts + a value-size hash per id-keyed map (catches a reordered collision winner, not just a drop) +
accord-tagged abilities + legends-in-npcs — IDENTICAL TO THE DIGIT. That run also proves loadContent
executes end-to-end without throwing.

THE WIN, QUANTIFIED (localhost can't show latency — your point): synthetic per-fetch delay, 250
fetches, PEAK CONCURRENCY 221 (was 1), parallel 258ms vs sequential-equivalent 6250ms at 25ms/fetch =
24x. Scaled to ~60ms CDN the sequential path is ~15s — reproducing your 15.30s and confirming the
diagnosis; parallel is a few waves, inside the <2s target.

⚠️ VERIFICATION IS YOURS, and localhost cannot substitute — I could not even see the change in the
in-app browser (its ES-module cache pinned the old state.js across a server restart + force reload;
the stale-tab trap), and localhost is a disk read with no latency regardless. LCP before/after on the
LIVE CDN is the real proof (§6). A [loadContent] count canary logs at boot so a silent group-drop on
the real server shows in the console. Prompt caching untouched (§4). §3.5 early-paint + §5 bundling
NOT done — likely moot now; measure the new LCP first.

QUEUE NOW: SNG-186 §2c/§2a/§2b (workbench remainder), SNG-188 moved-without-consent (new spec at HEAD).
STILL OPEN AND YOURS: SNG-179 reproduced-symptom check, SNG-187 CDN LCP. -->



