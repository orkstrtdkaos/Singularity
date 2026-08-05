// tests/verification_ledger.mjs — SNG-272: WHAT WE BUILT, AND WHAT PROVES IT.
//
// Erik: "can we verify the system spec intents are met 100%? … can we put a clear statement with references
// into the spec that details exactly how that works?" and then: "how about adding which test/audit verified
// each and what the latest result was, on what date and version of the test."
//
// This is that, for the world-simulation chain and the fixes that landed with it. Each row ties one of ERIK'S
// OWN ASKS to the mechanism that answers it and the GATE that proves the mechanism is still there.
//
// ⚠️ THE POINT IS THE FAILURE MODE, not the table. A hand-written "verified ✓" column is a rumour: it is
// written once, believed forever, and cannot tell the difference between a passing test and a deleted one.
// So every gate here is a REAL CHECK NAME, matched against a live run of the suite, and this file FAILS if:
//
//   · a gate name matches NOTHING          → a requirement claiming a verification that does not exist
//   · a gate name matches a FAILING check   → a requirement whose verification is red
//   · a gate name matches MORE THAN ONE     → an ambiguous claim; two checks answering to one name means the
//                                             row cannot say which one it is standing on
//
// That third one matters more than it looks: `2b:` is used by BOTH the generated-entity promotion block and
// the world-minting block (Aevi flagged the collision), so a loose substring silently binds to the wrong
// check and the row reads green off a test about something else entirely.
//
// MEASUREMENTS are a different KIND of claim and are marked as such. A gate is machine-proved at HEAD; a
// measurement is an OBSERVATION stamped with the command that produced it and the date it was taken. It goes
// stale the moment tuning changes, and saying otherwise would be the overclaim this file exists to prevent.
//
// Usage:  node tests/verification_ledger.mjs          → verify + print
//         node tests/verification_ledger.mjs --write  → verify + rewrite SYSTEM_SPEC.md §4c in place

import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
export const LEDGER_VERSION = "1.0.0";

// The date these measurements were taken. Bumped by hand WITH the numbers beside it — a stamp that updates
// itself would certify nothing.
const MEASURED_ON = "2026-08-04";

// ── THE LEDGER ────────────────────────────────────────────────────────────────────────────────────────────
// `ask`   — Erik's own words, so the row is answerable to the request and not to my paraphrase of it.
// `how`   — where the answer lives. module:function, so it is findable.
// `gates` — check names from the suite. Must match EXACTLY ONE passing check each.
// `note`  — the measurement, if there is one, or the thing worth knowing about the row.
const LEDGER = [
  {
    id: "SNG-268", ask: "the world should live without the player",
    how: "worldtick.js:advanceGeneratedOffscreen — a rotating batch with a reserved legend seat",
    gates: ["272/268: the offscreen batch ROTATES so no one waits forever",
            "272/268: a legend always gets a seat in the batch"],
    note: "was `population.slice(0,4)` with the legend at index 36 on Erik's real save — the machinery and the content were both complete.",
  },
  {
    id: "SNG-268b", ask: "i don't want to lose the tick content on the npcs who aren't in the current update pass",
    how: "worldtick.js:offscreenBacklog — unpicked figures stack their beats and cash them in when their window comes",
    gates: ["272/268: a figure outside the batch STACKS its beats instead of losing them"],
  },
  {
    id: "CCODE-106", ask: "if it's heard that something is moving forward, other NPCs become more motivated to stop or help it",
    how: "worldtick.js — urgency scales with how far the arc has run AGAINST them",
    gates: ["272/106: a figure pushes HARDER on an arc that has run against them"],
  },
  {
    id: "CCODE-111", ask: "legends and epics have limited attention… every time is a decision about where they spend it",
    how: "worldtick.js:spendAttention — cares they leave are reported as vacancies, not silently dropped",
    gates: ["272/111: a figure with more cares than budget LEAVES one, and the seat it left is named"],
  },
  {
    id: "CCODE-112", ask: "a Legend can push a couple fronts… average is 2, an epic's average is 1, heroic .5",
    how: "worldtick.js:budgetFor — tiered budgets; fractional means whole fronts first, then a partial share",
    gates: ["272/112: budget is TIERED — a legend holds more fronts than a heroic",
            "272/112: a fractional budget buys whole fronts first, then a share of one",
            "272/112: four heroics outweigh one legend — ganging up is arithmetic, not a rule"],
  },
  {
    id: "CCODE-113", ask: "some sort of simulated battle that uses the game mechanics with rolls so the outcomes are not predetermined",
    how: "worldtick.js:contestArc — the same battleRound the player rolls against",
    gates: ["272/113: an arc contest rolls REAL battleRounds, not a weight comparison",
            "272/113: the same weights can produce EITHER winner — the outcome is not predetermined"],
  },
  {
    id: "CCODE-115", ask: "only the leading figure fights??? seems like all should fight somehow",
    how: "worldtick.js — engaged/working split; the engaged fight weight-matched melees, everyone else pushes",
    gates: ["272/115: most figures WORK at an arc; a minority FIGHT over it",
            "272/115: working is the safe small option — a fight moves an arc more, or less than nothing",
            "272/115: a heavier figure draws in allies until the sides are comparable"],
  },
  {
    id: "CCODE-117", ask: "what if more get killed or injured? what knob would we turn to do that?",
    how: "worldtick.js — a decisive arc-fight resolves through the same clash model as the narrated path; `casualtyRate` is the knob",
    gates: ["272/117: an arc fight can COST something — one injury model, not two"],
  },
  {
    id: "CCODE-118", ask: "a legend might be able to kill 3-4 heros and 1-2 epics per battle",
    how: "worldtick.js — the tier GAP sets how many the victor reaches and how badly each suffers",
    gates: ["272/118: the tier GAP decides how many a victor cuts down"],
  },
  {
    id: "SNG-269a", ask: "i would expect more lower power ones to die than legends",
    how: "worldtick.js:resolveEpicClash — lethality scales with rank gap and collapses when a lesser figure prevails",
    gates: ["272/269: what losing COSTS depends on the rank gap, not a flat roll"],
    note: "BY COUNT the design holds (5.4 lower-tier deaths per world vs 1.8 legends). BY RATE it inverts — heroic 6.5% · epic 9.3% · legendary 10.6% — because a legend holds 2 fronts and is in ~4× the fights. Different questions; the knob for the rate is `attentionByTier`, not lethality.",
  },
  {
    id: "SNG-270a", ask: "Strikes/Assassinations, crusades, and guards",
    how: "worldtick.js — a strike targets the other side's best WORKER; a guard on that side intercepts",
    gates: ["272/270: a strike reaches the population combat structurally cannot",
            "272/270: a guard can INTERCEPT a strike, and standing still is its own cost"],
  },
  {
    id: "SNG-270b", ask: "death isn't permanent necessarily… there are levels of death written in the lore. we need to use them",
    how: "worldtick.js:attemptRetrievals + death.js:resolveRetrieval — someone who shared a care goes after them and pays a front to do it",
    gates: ["270: somebody who shared a care goes after their dead — and at the threshold, gets them back",
            "270: the retriever OWES A FRONT — attention spent in the dark is not spent on an arc",
            "270: reaching and failing SINKS them — trying is the risk that makes leaving them a real choice",
            "270: a stranger does not go into the dark for you"],
    note: "`resolveRetrieval` had existed since SNG-209 and ONLY author mode ever called it. 12 world-years: 33.7 attempts · 17.8 returns · 10.2 sealed. Rates are content dials (`retrievalRate`, `retrievalOddsByDepth`) — the numbers are Erik's call, the mechanism is the deliverable.",
  },
  {
    id: "SNG-270c", ask: "we should have quests to retrieve for NPCs",
    how: "worldtick.js records the asker; death.js:reachableDeadForGM carries it; gm.js frames them as a quest-giver",
    gates: ["270: the ASKER is recorded even when no NPC reaches this pass — that is what makes it a quest",
            "270: the GM is told WHO WANTS THEM BACK, not merely that someone is dead",
            "270: the GM block frames the asker as a quest-giver, not atmosphere"],
    note: "the dead were already listed for the GM — as atmosphere. Nothing said anyone wanted them back, so there was nobody to do the asking.",
  },
  {
    id: "SNG-269b", ask: "what about new NPCs growing into legends/epics?",
    how: "worldtick.js:mintFigure — entry at riffraff/notable from deaths, the rungs left empty as the inflow",
    gates: ["2b: the roster reads authored AND minted figures through ONE helper",
            "2b: a minted figure is BORN WHOLE — id, tier, weight, and the reason they exist",
            "2b: minting is driven by DEATHS, not by abandonment (which grows with the roster and self-amplifies)",
            "2b: minted figures ENTER THE POPULATION (born into the roster but never acting is not being alive)",
            "2b: a minted figure's care is one `affinitiesOf` actually ACCEPTS (shape AND key)",
            "2b: the roster cannot grow without bound",
            "2b: a minted figure who dies is still mournable — the death path reads the LIVING roster"],
    note: "the roster had never grown: no `figures.push` anywhere, so attrition was one-way and a long-simulated world emptied out. 12.2 minted per world over 12 world-years.",
  },
  {
    id: "SNG-269c", ask: "the ones that stay the longest are the true legends",
    how: "worldtick.js:advanceStandings — tier becomes an EARNED position held in world state, read everywhere through tierOf()",
    gates: ["2c: an earned rung is an OVERRIDE in world state — content is read-only and shared",
            "2c: rising takes TIME AT RUNG — a figure seen once does not promote",
            "2c: the upper rungs also require WINS, not just survival",
            "2c: a new rung RESTARTS the clock AND the deed score (you do not carry either upward)",
            "2c: demotion exists — without a way DOWN, promotion alone makes everyone mythic",
            "2c: the mechanics read the EARNED rung, not the authored one (budget and rank both)",
            "2c: contest wins are recorded for EVERY participant, not only the leader"],
    note: "3.8–7.5 NEW legendaries per world over 12 world-years, and different ones in every run.",
  },
  {
    id: "SNG-266a", ask: "P1a — every encounter awards ZERO XP (Aevi's work order)",
    how: "content/packs/core/rules/encounters.json, registered + merged over the inline table; the read falls back to `default`",
    gates: ["272/266: an unknown encounter type falls back to `default` rather than paying zero"],
    note: "the order's premise was half right: duel/challenge/puzzle DID pay from an inline block in resolution.json. Everything else — fled, walked away, incapacitated, any later type — hit an undefined entry and paid nothing.",
  },
  {
    id: "SNG-266b", ask: "P1d — a scene runs forever while forgetting its own beginning",
    how: "gm_registry.js:scenePacingDetail reads a true beat count; app.js closes the scene at the hard rung",
    gates: ["266/1d: the pacing signal counts BEATS, not trimmed storage (a 200-beat scene says 200, not 40)",
            "266/1d: the ENGINE closes the scene itself at the hard cap — and never mid-encounter",
            "266/1d: the hard rung WARNS that the engine will close it (the soft rung only asks)",
            "266/1d: the true beat count rides the scene record, so ending a scene resets it for free",
            "266/1d: a reload does not restart the scene clock"],
    note: "the signal read `sceneTurns.length`, which is `slice(-40)` bounded STORAGE — so pressure to close plateaued exactly when it should have become irresistible.",
  },
  {
    id: "SNG-271", ask: "Erik's own fight log — a downed player still took their bonus action",
    how: "app.js — incapacitation is checked on its own, not off the encounter's `ended` flag",
    gates: ["272/271: a downed player does not take a bonus action",
            "271: a margin says WHICH WAY it went — `missed by 33` beats `(margin -33)` beside a roll of 98",
            "271: the round log takes its receipt as a PARAMETER, not from a shared display variable",
            "271: a READ logs its OWN prose — not whatever the last strike left standing",
            "271: the log tells DELTAS from TOTALS (a -12 delta beside totals reads as negative health)",
            "271: and a negative health TOTAL is structurally unreachable — every write clamps at zero"],
  },
  {
    id: "SNG-275a", ask: "the Arcs don't necessarily consume all the attention for the NPCs — they probably spend a fair amount of time just living their lives",
    how: "worldtick.js:spendAttention — a personal claim is held back before the arcs are served; a crisis can borrow it, and the borrowing is recorded",
    gates: ["272/275: a share of every figure is NOT the arcs' to spend",
            "272/275: at personalShare 0 the old behaviour is bit-identical (the dial degrades safely)",
            "272/275: a CRISIS borrows the personal claim — and the borrowing is RECORDED, not free",
            "272/275: an ordinary pass is NOT a crisis (or neglect would mean nothing)",
            "272/275: personal time reads AUTHORED content and invents nothing",
            "272/275: the CONTENT GAP is measured, not papered over"],
    note: "MECHANISM live, CONTENT open. A probe world-year: 47 figures kept their own time, 0 of them have a life AUTHORED, 20 spent it on a crisis instead. ⛔ The engine will not invent a family — that is authorship, and an invented relative becomes canon the moment a narrator says it. `personalVerbs` / `interests` / `kin` are the fields; `ws.personalCoverage` counts the gap so it is a number rather than a silence.",
  },
  {
    id: "SNG-275b", ask: "(implicit) — the tuning dials Erik and Aevi own must actually be turnable",
    how: "content/packs/core/rules/arc_response.json — registered, loaded, merged; 21 dials + the promotion ladder",
    gates: ["272/275: the world-sim dials are AUTHORED, not just read (21 of them ran on fallbacks)",
            "272/275: the tier table carries BOTH names for the same rung (one name drops 28 figures)"],
    note: "⚠️ `rules.arcResponse` and `rules.tierLadder` DID NOT EXIST. The engine read them for weeks, so every dial ran on a hardcoded fallback and none could be turned without editing engine source — while I kept saying 'that is the dial, the number is Erik's call'. A reader with no writer: the fourth door. Authored at exactly the old fallbacks, so behaviour is unchanged and only reachability moved.",
  },
  {
    id: "SNG-272bg", ask: "MECHANICS: No fixed challenge affinity. (Erik's screenshot — the sheet lying about a background that works)",
    how: "app.js:backgroundById — one reader, normalising legacy ids and shouting on a true miss",
    gates: ["272/bg: every authored background id is snake_case (the whole defect was one hyphen)",
            "272/bg: every background still carries the mechanics the sheet promises",
            "272/bg: a legacy hyphenated id is REPAIRED on read, so existing saves heal",
            "272/bg: a total miss is LOUD, not a plausible sentence",
            "272/bg: the tooltip goes through the ONE reader, not a second private lookup"],
    note: "Aevi's find: all 40 backgrounds carry real mechanics; the CHARACTER carried `community-organizer` and every authored id is snake_case. `|| {}` then failed four ways at once — tooltip lied, the SOCIAL edge never applied, `banner` was never granted, and seedInnateSubstrate read the same empty record. ⚠️ OPEN FOR AEVI: whether an existing character is BACKFILLED the aptitude they were owed is a call on a live player's sheet, not mine to make silently.",
  },
  {
    id: "SNG-276", ask: "they have the arcs on their chronicle, but not who's doing what to them",
    how: "worldtick.js:arcPeopleView + worldPeopleFooter — pure readers; app.js:renderWorldTab — THE WORLD tab",
    gates: ["272/276: the arcs carry WHO is pushing them, by name and by side",
            "272/276: a name you have MET is marked apart from one you have only heard",
            "272/276: the stage reads by NAME, never as a raw number (show the state, not the machine)",
            "272/276: the phrase beside a name reads authored CARE, not the saturated push",
            "272/276: …and it DISCRIMINATES — different care weights read differently",
            "272/276: the tab RENDERS — executed against real state, not pattern-matched against its source",
            "272/276: casualties, strikes and retrievals all resolve to NAMES",
            "272/276: the seats that emptied and the fights that happened are both surfaced",
            "272/276: the tab inherits spoiler discipline — the arc's sealed truth is never on it",
            "272/276: who is NOT going home, and who is being reached for, are world-level facts",
            "272/276: the tab exists, is wired, and is styled",
            "272/276: an empty world says so rather than rendering a blank page",
            "276: EVERY character render wires the tab bar (a tab dead on one screen is the bug this prevents)"],
    note: "Aevi: 'the sim already knows the story. Nothing surfaces it.' `arcContests`, `arcCasualties` and `arcVacancies` had all been written and never read — collected-then-discarded, the seventh door, across five systems at once. Building it caught a live instance of its own bug class: only 2 of 3 character renders wired the tab bar, so the new tab was DEAD on the Traits screen.",
  },
  {
    id: "SNG-279", ask: "promotion on DEEDS, on a scale players can SEE — today no player ever sees a single promotion",
    how: "worldtick.js:creditDeed + advanceStandings — time becomes a floor, deeds become the gate; rises are news with attribution",
    gates: ["272/279: no moral weighting — strike and guard score IDENTICALLY (DIRECTIVE SNG-280)",
            "272/279: …and the authored weights agree with the engine (a content edit cannot smuggle a value in)",
            "272/279: a deed is CREDITED and remembered with what it was",
            "272/279: promotion needs BOTH the floor and the deeds",
            "272/279: a deed credited BEFORE standings does not reset the tenure it counts toward",
            "272/279: a rise says WHAT they did, and names the player when they caused it",
            "272/279: the news carries the attribution and the player credit",
            "272/279: falling reads an OUT-OF-ACTION streak, not “owns no cares” (which is never true)",
            "272/279: the ladder is SWEPT, and the sweep exists to re-derive it"],
    note: "Aevi measured the thing that mattered: the years-only ladder needed 15.5 world-years riffraff-to-mythic — ~2,200 player-hours — so the earned-tier system I built was, in play, INVISIBLE. Ladder 4/10/22/70/170 SWEPT (tests/deed_ladder_sweep.mjs): 4.5 rises in a 40-hour run and a mythic in 1 world of 6 at 180 hours, the only shape passing both of her tests. ⚠️ `spreadPerHop` cannot fire — reputation.js carries `spread` and its own header says nothing populates it yet; her table lists it as ‘already exists’.",
  },
  {
    id: "SNG-281", ask: "(Aevi's deed table listed “a deed that SPREAD” as already existing — it did not)",
    how: "reputation.js:spreadDeeds — one hop per pass, reach capped by the deed's weight; the world tick is the writer",
    gates: ["272/281: a deed now SPREADS — the field had a reader and no writer since it was introduced",
            "272/281: reach is set by MAGNITUDE — a small deed stays local, a large one crosses regions",
            "272/281: an atrocity travels exactly as far as a rescue of the same size (SNG-280)",
            "272/281: a deed is never heard twice in the same place",
            "272/281: the world tick is the writer, and a hop scores toward promotion"],
    note: "`recordDeed` initialised `spread: []` and NOTHING in the repo ever appended to it, so every reputation query answered from the single community where a deed happened. The comment beside it said spread was ‘the world-tick’s job (v0.3)’ and that job never landed. Found from the far end: it was one of six promotion sources, dark. ⛔ Reach is magnitude, never merit — DIRECTIVE SNG-280 applies to how far news carries, not just to what scores.",
  },
  {
    id: "SNG-282", ask: "the player's deeds and quest resolutions spread just like NPCs",
    how: "worldtick spreads the character as a bearer; quests.js:resolveStructuredQuest records the resolution as a deed",
    gates: ["272/282: a resolved quest RECORDS A DEED (it used to be written on the quest and nowhere else)",
            "272/282: a resolution’s weight is its MAGNITUDE — a bigger outcome travels further, not a nicer one",
            "272/282: the description is WHAT HAPPENED (the outcome’s own name), not a judgement of it",
            "272/282: a quest still resolves even if the deed cannot be written",
            "272/282: the resolve call site passes WHERE, or the deed has nowhere to travel from",
            "272/282: there is exactly ONE spread model, and it is the graded one",
            "272/282: …and spreadDeeds genuinely does not care what kind of bearer it is handed"],
    note: "⚠️ CORRECTED AFTER READING THE REAL SAVES. The player was ALREADY spread — `runWorldTick` has done it since v0.5.0 and three tests gate it. I missed it (looked in reputation.js, which only READS `spread`; grepped for `recordDeed`, not `deed.spread`), reported in CCODE-134 that the field had never had a writer, and shipped a SECOND model that ran on the player 14 lines apart in app.js. Erik (SNG-289) then ruled the graded model wins for both: the v0.5.0 block sent a deed to EVERY community at once, which is why Silas is known in 91 of 90 and why the field could not carry information. One model now, weight-graded, player and figures alike. And a resolved quest was recorded ON THE QUEST and nowhere else, so the thing a player is most likely to be known for left no trace in the record the world reads. Recorded inside the resolver rather than at a call site: several doors resolve a quest, and a deed that depends on which one was used is a deed that goes missing.",
  },
  {
    id: "SNG-273", ask: "stage 2 of the Bleed is in effect, so what?",
    how: "engine/arceffects.js — a stage's effects reach the cost path, the roads, the encounter pool and the GM's NPC block",
    gates: ["272/273: every authored stage effect is REACHABLE by the reader",
            "272/273: a stage changes what a CRAFT costs, and says which arc did it",
            "272/273: a craft the world is NOT touching is unchanged (no blanket tax)",
            "272/273: some stages make things EASIER (an arc advancing is not always bad news)",
            "272/273: the cost is explained AT THE POINT OF USE, not on a tab",
            "272/273: …and on the World tab in plain words",
            "272/273: the encounter POOL leans with the world, at every draw site",
            "272/273: the roads and the mood are wired too",
            "272/273: an effect kind with NO consumer is declared, not left looking live"],
    note: "THE 2.0.0 BLOCKER. A stage carried publicFace and pressureOnAdvance, both narration, so 66 figures of attention, contests and casualties resolved into a number that changed a SENTENCE. Aevi authored 54 effects across 18 stages; 4 of her 5 kinds had a real consumer, and the testOnlyExports ratchet caught me shipping `encounterBias` unwired before it reached HEAD. ⚠️ `priceShift` has NONE — no module in this engine computes a price — so its 11 effects are inert, declared in `EFFECT_CONSUMERS` rather than left looking live.",
  },
  {
    id: "SNG-288", ask: "losses isn’t the right metric — mythical for a variety of reasons is the right thrust",
    how: "worldtick.js:career + mythicPathFor — seven roads, any one qualifies, and which one fired is recorded",
    gates: ["272/288: all seven roads are authored and reachable by the engine",
            "272/288: the paths read a CAREER that survives promotion",
            "272/288: THE SURVIVOR requires a BAD record — a careful figure cannot walk it",
            "272/288: a death disqualifies THE SURVIVOR (never once killed is the point)",
            "272/288: THE FEARED is reachable, so the top rung does not select for virtue",
            "272/288: …and THE KEPT sits at the same order of difficulty (neither is the real one)",
            "272/288: WHICH ROAD was walked is recorded, not just that they arrived"],
    note: "⚠️ THE DISTRIBUTION IS THE RESULT, and it is lopsided: over 4 worlds × 12 world-years, THE TURNER fired 20 times and THE RETURNED once. The other five roads never fired at all. Cause: `stageMoved` credits EVERY figure leaning on an arc when its stage moves, so ‘two stages moved’ is a presence test that dozens clear at once, while the deed-count roads (120–320 career deeds) are priced beyond what the sim reaches. Also required a CAREER record — tenure deeds/losses reset on promotion, so THE SURVIVOR would have been unreachable by exactly the figures it describes.",
  },
  {
    id: "SNG-287", ask: "the name comes from the MATERIAL, not from a menu (the Tether pattern)",
    how: "engine/titles.js — pattern + slots, every slot filled from a real record or the pattern is not used",
    gates: ["272/287: a title is built from the RECORD — an arc actually turned becomes a name",
            "272/287: nothing recorded means NO title (a world where everyone has an epithet has none)",
            "272/287: no arc moved means no {ARC} title — the pattern is skipped, not guessed at",
            "272/287: the same pattern names a hard record and a soft one, and the Maw gets a name too",
            "272/287: a MIXED record resolves to neither noun (not known for one thing → not told you are)",
            "272/287: a slot with no source is declared, not left looking live",
            "272/287: a title is spoken when the world finds one, and remembered"],
    note: "⚠️ There was no `titles.json` — the spec describes replacing a fixed list that had never been built, so both the engine and the patterns are new. THREE of the seven authored patterns CANNOT be chosen: {ROAD}, {CRAFT} and {FOE} have no source (nothing records which road a figure guarded, deeds carry tags rather than craft ids, and casualties are per-pass with no per-figure history). Declared in `UNFILLABLE_SLOTS` and kept in content so wiring a source later needs no re-authoring.",
  },
  {
    id: "SNG-295", ask: "who actually turned an arc (Erik answered all four questions)",
    how: "worldtick.js — credit goes to winners on the side it moved toward, plus strikers who emptied the front; never to the other side",
    gates: ["272/295: only the side it moved TOWARD is credited — nobody who leaned against it",
            "272/295: and only those who WON — presence is not turning (the bug this fixes)",
            "272/295: REVERSING counts as turning (the title says you moved it, not which way)",
            "272/295: emptying the front counts — a strike that removed a defender turned it too",
            "272/295: those who leaned WITH it and won nothing still get the smaller credit"],
    note: "The presence-test bug: credit went to EVERY figure leaning either way, so a turning banked ~30 stage-moves and THE TURNER was 20 of 21 mythics. After the fix, 11; after raising its bar to three stage moves (Aevi's pre-authorised remedy — raise the bar, never narrow the credit Erik ruled on), FOUR roads fire: turner 11 · unbeaten 1 · returned 1 · survivor 1. Erik's own case is live.",
  },
  {
    id: "SNG-294", ask: "the three unfillable title slots — build, rename, or drop",
    how: "titles.js — {FOE} recorded at the clash, {CRAFT} re-sourced to {TAG}, {ROAD} shipped as Warden of {PLACE}",
    gates: ["272/294: {FOE} is BUILT — the hardest thing they put down, by rung not recency",
            "272/294: {CRAFT} was RE-SOURCED to {TAG}, not built — a tag is what the WORLD noticed",
            "272/294: an UNMAPPED tag yields no title rather than a coined one",
            "272/294: {ROAD} ships as Warden of {PLACE} — the world has locations, not named routes",
            "272/294: every authored pattern is now fillable",
            "272/294: order-sensitivity is REPORTED, and the flagged patterns still demonstrably fire"],
    note: "Aevi's call on {CRAFT} is the sharp one: a tag is what the WORLD noticed and a craft id is what the ENGINE resolved, so threading ids into reputation would make a deed an engine artifact rather than a social record. ⚠️ Order can starve a fillable pattern — reported rather than reordered, since order is authorship. My first two starvation detectors both measured something adjacent to the question before the third measured reachability.",
  },
  {
    id: "SNG-296", ask: "get back to playability, and I'd really like the generation engines to fire up",
    how: "generate.js — `item` joins npc/location/arc/creature; schemas/item.schema.json; hydrated into CONTENT.items on enterPlay",
    gates: ["272/296: `item` is a generation type",
            "272/296: SHIELD is a kind of its own — the catalog had none and guard crafts are 19 of the defensive logics",
            "272/296: the schema REQUIRES the mechanical hook, not just a description",
            "272/296: a generated item is hydrated into the item catalog",
            "272/296: a generated shield actually changes a guard roll (the consumer Aevi thought was missing)"],
    note: "⚠️ Aevi ordered this BEHIND a Track B that turned out to be already built. Her premise was that bonusTags are ‘SET and EVOLVED and NEVER MATCHED’ — but `equipmentBonus` matches them into resolve.js's named `equipment` term, `wieldBonusFor` feeds the skill-battle contestMods as CCODE-43's ‘wielded gear’ line, and 27 of 30 authored items already carry them. The consumer exists twice. What her measurement DID find is real and is content: ZERO shields, which is now a kind of its own in the schema. Erik's original order was right.",
  },
  {
    id: "SNG-297", ask: "make sure all of these new fields get swept against all the generators so any newly minted things get full content",
    how: "worldtick.js:mintFigure — two cares, a want, and a life, all derived from the minting event; pools in arc_response.json",
    gates: ["272/297: a minted figure has MORE THAN ONE care — it can hold two fronts and abandon one",
            "272/297: the second care is DERIVED from circumstance and OPPOSES the first (they inherit the argument)",
            "272/297: it has a wantArcId — something to be for when nothing is on fire",
            "272/297: it has a LIFE off-arc, drawn from its own origin event",
            "272/297: with no pools authored it gets NO fabricated life (silence over invention)",
            "272/297: every MINTED figure is born whole, and the count of thin ones may only go down"],
    note: "Aevi's audit: a minted figure had ONE care, no want and no life — while being fully promotable to mythic, since `worldRoster` concats them and `advanceStandings` walks that roster. The 66 authored figures die at ~2.4/world-year and were being replaced by figures who could not hold two fronts or abandon one, so THE WORLD THINNED AS IT AGED. ⛔ The pools are keyed on the origin EVENT, never on a person — a verb drawn from ‘survived a casualty’ is honest; a brother is not. The second care is the loudest local argument, from `arcContests`, so a successor inherits the fight rather than picking one.",
  },
  {
    id: "SNG-298", ask: "i want npcs to be able to grow and evolve too… their cares and wants might shift or they might gain new ones",
    how: "worldtick.js:evolveCares + currentCares — hardening, acquisition and erosion, from strikes and from the player",
    gates: ["272/298: an attempt on their life over an arc they hold makes them DIG IN",
            "272/298: …and over an arc they had no opinion on, they GAIN one",
            "272/298: a DISLIKED player recruits the opposite side just as reliably",
            "272/298: knowing the player does NOT flip someone already leaning the other way",
            "272/298: a care left untended fades — without erosion everyone ends up caring about everything",
            "272/298: …but erosion NEVER empties them (a figure with no cares drops out of the world)",
            "272/298: a figure cannot end up caring about everything",
            "272/298: the pass spends attention on the cares as they are NOW, not as authored",
            "272/298: the change is told in the arc’s NAME, not its id"],
    note: "Cares were fixed at authoring and never moved — a figure’s rung, record, title and survival could all change, but not what they WANTED. Over 500 world-days 49 figures now change their minds. ⛔ No approval anywhere: a strike makes its target INVESTED rather than virtuous, and a disliked player recruits opposition exactly as reliably as a liked one recruits allies, so allies cannot be farmed by being agreeable. EROSION is what keeps it honest — without it cares only accumulate and every figure ends up the same person, but it narrows a figure and never empties one.",
  },
  {
    id: "SNG-299", ask: "all of these new titles and terms and npcs need clickable popups describing who and what they are, with a link to the codex page",
    how: "engine/whois.js answers from the record; app.js linkifies known names by walking text nodes after every render",
    gates: ["272/299: a figure answers with their rung, their title and what they are caught up in NOW",
            "272/299: an arc gives its publicFace and NEVER its sealed truth",
            "272/299: a term explains itself",
            "272/299: an unknown name returns null rather than a composed description",
            "272/299: the codex button appears only where a codex page EXISTS",
            "272/299: the index prefers the LONGEST name, so a full name beats the surname inside it",
            "272/299: names are linked by walking TEXT NODES, never by rewriting rendered HTML",
            "272/299: EVERY name in a sentence is linked, not just the first",
            "272/299: the pass runs for every screen, from chrome(), and can never take one down"],
    note: "A fortnight of work put names in the player’s face — figures who rose, titles the world found, arcs that turned — and every one was a bare string. ⛔ The lookup answers ONLY from the record and returns null when nothing is known, so the name stays plain: a popup reading ‘a figure of the valley’ promises a lookup and delivers a shrug. Linkifying walks TEXT NODES rather than rewriting HTML, which cannot corrupt markup and cannot link inside an existing control — verified against a real DOM, where the first version also revealed it was linking only the FIRST name in a sentence.",
  },
  {
    id: "SNG-267", ask: "the player is just one of many — so we need the world to live without the player",
    how: "tests/player_impact.mjs — the same worlds run with and without parties",
    gates: [],
    note: "MEASURED, not gated — AND THIS NUMBER MOVED. It used to read 'without players the arcs never leave stage 1'; after minting, promotion, retrieval and the affinity fix, party-0 worlds now reach stage 4 on their own. What still separates them is CONTEST: 0 contested arc-instances at party 0, against 9 at party 1 and 8 at party 3 across 6 worlds. The world has its own history now; the player is what makes it an argument.",
  },
];

// ── VERIFY ────────────────────────────────────────────────────────────────────────────────────────────────
function runSuite() {
  // smoke.mjs calls process.exit(1) on failure, so a non-zero exit is expected data, not an error.
  try {
    return execFileSync(process.execPath, [join(root, "tests/smoke.mjs")], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  } catch (e) {
    return String(e.stdout || "");
  }
}

const out = runSuite();
const lines = out.split(/\r?\n/);
const results = new Map();   // check name → "PASS" | "FAIL"
for (const l of lines) {
  const m = /^(PASS|FAIL)\s{2}(.+)$/.exec(l);
  if (m) results.set(m[2].trim(), m[1]);
}

let failures = 0;
const problems = [];
const fail = (msg) => { failures++; problems.push(msg); };

if (results.size === 0) fail("the suite produced no PASS/FAIL lines — the ledger has nothing to stand on");

for (const row of LEDGER) {
  for (const gate of row.gates) {
    const hits = [...results.keys()].filter(k => k.includes(gate));
    if (hits.length === 0) fail(`${row.id}: gate not found in the suite — "${gate}"`);
    else if (hits.length > 1) fail(`${row.id}: AMBIGUOUS gate "${gate}" matches ${hits.length} checks — a row cannot say which one it stands on`);
    else if (results.get(hits[0]) !== "PASS") fail(`${row.id}: gate is RED — "${hits[0]}"`);
  }
}

const gated = LEDGER.filter(r => r.gates.length);
const ungated = LEDGER.filter(r => !r.gates.length);
const gateCount = LEDGER.reduce((n, r) => n + r.gates.length, 0);

// ── EMIT ──────────────────────────────────────────────────────────────────────────────────────────────────
const esc = (s) => String(s).replace(/\|/g, "\\|");
const table = [
  "| # | Erik asked for | How it works | Proved by | Latest result |",
  "|---|---|---|---|---|",
  ...LEDGER.map(r => `| \`${r.id}\` | *"${esc(r.ask)}"* | ${esc(r.how)} | ${r.gates.length ? `**${r.gates.length} gate${r.gates.length === 1 ? "" : "s"}** in \`tests/smoke.mjs\`` : "—"} | ${esc(r.note || "gated only — no standing measurement")} |`),
].join("\n");

const block = `<!-- BEGIN verification-ledger — GENERATED by tests/verification_ledger.mjs; edit the ledger there, not here -->
<!-- verified by tests/verification_ledger.mjs v${LEDGER_VERSION} on ${MEASURED_ON} — ${gateCount} gates across ${LEDGER.length} requirements, all green at HEAD -->

${table}

**${gated.length} of ${LEDGER.length} requirements carry a machine-proved gate** (${gateCount} checks total).
${ungated.length ? `${ungated.length} is measurement-only and is marked as such — ${ungated.map(r => "`" + r.id + "`").join(", ")}.` : ""}

⚠️ **A GATE AND A MEASUREMENT ARE DIFFERENT CLAIMS.** A gate is re-proved on every run of the suite and this
document fails to build if one is missing, ambiguous, or red. A **measurement** is an observation stamped with
the date it was taken (${MEASURED_ON}) and goes stale the moment anyone turns a dial — the sim commands are named
in §4d so any number here can be re-derived rather than trusted.
<!-- END verification-ledger -->`;

if (process.argv.includes("--write")) {
  const specPath = join(root, "SYSTEM_SPEC.md");
  const spec = readFileSync(specPath, "utf8");
  const nl = spec.includes("\r\n") ? "\r\n" : "\n";
  const body = block.replace(/\n/g, nl);
  const begin = spec.indexOf("<!-- BEGIN verification-ledger");
  if (begin === -1) {
    console.log("no ledger block in SYSTEM_SPEC.md — add the §4c heading + markers first");
    process.exit(1);
  }
  const end = spec.indexOf("<!-- END verification-ledger -->", begin);
  const next = spec.slice(0, begin) + body + spec.slice(end + "<!-- END verification-ledger -->".length);
  writeFileSync(specPath, next, "utf8");
  console.log(`SYSTEM_SPEC.md §4c rewritten — ${LEDGER.length} requirements, ${gateCount} gates.`);
} else {
  console.log(block);
}

console.log("");
if (failures) {
  console.log(`LEDGER: ${failures} PROBLEM(S) — a requirement is claiming a verification that is missing, ambiguous, or red:`);
  for (const p of problems) console.log("  · " + p);
} else {
  console.log(`LEDGER: ok — ${LEDGER.length} requirements, ${gateCount} gates, every one found and green.`);
}
process.exit(failures ? 1 : 0);
