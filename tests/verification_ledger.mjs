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
    how: "worldtick.js:planStrike — a strike targets the other side's best WORKER; a guard on that side intercepts",
    gates: ["272/270: the striker comes from the WORKING pool — a side that is all melee sends nobody",
            "272/270: a strike reaches the population combat structurally cannot",
            "272/270: a guard can INTERCEPT a strike, and standing still is its own cost"],
    note: "⚠️ THESE TWO GATES WERE REGEXES AGAINST worldtick.js, AND THAT IS HOW THE BUG SURVIVED: both matched for the mechanic's entire life while the striker was drawn from `engaged` instead of `working`. A source pattern proves a line was typed, not that the decision is right. `planStrike` is extracted so the decision can be CALLED, and all three now call it.",
  },
  {
    id: "SNG-322", ask: "CCODE-52: the threat ladder — and the band should decide the lethal flag rather than it being hand-set per def",
    how: "encounters.js:threatBandOf + isLethalEncounter — Aevi's 5-band ladder decides the warning, at scale",
    gates: ["322: the authored threat ladder REACHES the engine",
            "322: the band reader reads the BAND, never the difficulty number",
            "322: a WARNED band makes an encounter lethal-for-offer with no hand-set flag",
            "322: …and an unwarned band does not — but an explicit def.lethal still wins",
            "322: a banded encounter is marked, made non-trivial, and a Decline is forced into the list",
            "322: the label names the BAND — the warning is about odds, not a promise about death",
            "322: the difficulty reader takes only a real number, never a band string"],
    note: "Aevi authored the ladder and mapped `threat` onto 62 encounters from the already-authored `minDanger` rather than re-judging by hand — so the bands AGREE with the danger figures the table always carried instead of quietly disagreeing. ⚠️ AND NOTHING IN THE ENGINE READ `rules.threat`: `def.lethal` was still hand-set on exactly 2 of 19 defs, so the derivation that makes CCODE-52 real was authored and unwired — the sixth writer/reader miss of the week. ⚠️ A NAME COLLISION SITS UNDER IT: `def.threat` is a BAND ID (string) while `def.opponent.threat` is a 10–70 difficulty NUMBER, and random_encounters.js fell through to the former — Number('trivial') is NaN, which `|| 0` silently turns into zero. Nothing broke (none of those 62 carried a numeric threat before, so the fallback was already 0), but a numeric reader aimed at a string field is a trap waiting for whoever changes either side; it now takes only a real number. ⛔ AEVI'S GUARD KEPT IN THE LABEL: the warning is about ODDS, not about death — you can die in any band, and saying 'lethal stakes' on `grave` while `fair` says nothing would imply an even match cannot kill you.",
  },
  {
    id: "SNG-327", ask: "(Aevi) `interests` and `kin` authored — a smattering, per Erik",
    how: "worldtick.js:personalPursuitOf — the alternate pools it has always read, now with content in them",
    gates: ["327: every authored `kin` entry is READABLE by personalPursuitOf — none silently dropped",
            "327: every authored `interests` entry is readable too",
            "327: a kin line actually comes out of the consumer, not merely past the filter",
            "327: …and a kin entry in an unreadable shape WOULD be caught"],
    note: "Coverage 2026-08-05: `interests` 31/66, `kin` 26/66 — and 26/26 + 31/31 of the authored entries REACH the reader. ⚠️ THE SHAPE CONTRACT IS THE RISK, NOT THE COUNT: `personalPursuitOf` takes kin as `typeof k === 'string' ? k : k?.line`, so an entry written as `{name, relation}` would be dropped with no error — the fifth door of the PromisedButUnread family, and at its most dangerous inside a POOL, because a partially-readable list still looks like it works. Aevi authored `{line: '…'}` without being told, so nothing was lost; the gate exists for the next one. It asserts REACHABILITY rather than presence, checks a line actually comes out of the consumer rather than merely past the filter, and is falsified by an unreadable shape. ⛔ THESE REMAIN ALTERNATES: `personalVerbs` at 66/66 already satisfied this reader on its own, so `personalCoverage` is unchanged at 48/48 on the page — the content adds VARIETY to what a figure is doing with their own time, not reach. Saying it closed a gap would be an overclaim; it deepened a pool that was already full.",
  },
  {
    id: "SNG-333", ask: "use Dunbar's number — 150 known relationships. Insertion order as a default, but if you interface with the NPCs it should count those interactions and keep the ones you meet more than once from dropping off",
    how: "npcs.js:evictionCandidate — least-met first, oldest breaks the tie, kin never evicted",
    gates: ["333: the circle is Dunbar's number, not an array bound",
            "333: the least-met goes first, and the oldest breaks the tie",
            "333: someone you met twice outlives everyone you met once",
            "333: kin are never evicted, and a registry of only kin refuses rather than drops one",
            "333: with kin present, the evictable stranger goes instead",
            "333: an empty circle has nobody to evict"],
    note: "The cap was 40, which is not a social circle — it is the number of people you meet in a long afternoon. ⛔ AND IT REFUSED RATHER THAN EVICTED: once you knew 40 people you could never meet anyone again, while the comment claimed it would 'keep the people who matter' and the actual rule was insertion order. Now it evicts by Erik's rule — least-met first, oldest among equals — so everyone met once is spent before anyone met twice, and a person you keep running into is effectively permanent. ⚠️ ONE NEW FIELD ONLY (`met`), written at the one place every interaction already passed through; Aevi's own rule for the ties system is that nothing new should need tracking, and this nearly held to it.",
  },
  {
    id: "SNG-334", ask: "the ability to reach any TRUE thing, but what gets sent each turn needs a reasonable cap — and ones that tie to people should be saved as facts, like my player's mother, or Pell's father",
    how: "facts.js — the store is unbounded, factsForGM is budgeted, and a family/sworn bond pins a fact",
    gates: ["334: the fact STORE never forgets — reaching any true thing is the point",
            "334: …but the VIEW is budgeted, and says how much it left unsaid",
            "334: a PINNED fact is always sent, however old and however full the ledger",
            "334: pinning the same fact twice does not duplicate it",
            "334: a FAMILY bond marks the person as kin — the field the circle already protects",
            "334: …and it yields a fact worth pinning, naming what the fiction actually said",
            "334: it never invents HOW they are kin — that would be the engine writing canon",
            "334: a `sworn` bond is kin too — a bond you both chose"],
    note: "The store used to `slice(-40)`, silently dropping the OLDEST CANON THE GM EVER ESTABLISHED — so a long game could contradict itself about its own early events with nothing to report it. Third instance of the same shape this session, after `knownPlaces` and the gallery: a cap on a LOG is housekeeping, a cap on WHAT IS TRUE is amnesia. The cost was real (facts are rendered every turn) but belonged to the VIEW. ⚠️ THE VIEW NAMES WHAT IT LEFT OUT — a silently-windowed view reads exactly like a complete one, which is how a GM comes to believe the ledger is short. ⛔ KIN NEVER AGE OUT, and nothing new is tracked to achieve it: `bondType` already carried `family`, so the tie was recorded all along and simply meant nothing to anything. It now marks the person unevictable from the Dunbar circle AND pins a fact — and it NEVER invents how they are kin, because naming someone's mother when the fiction only said 'family' would be the engine writing canon.",
  },
  {
    id: "SNG-358", ask: "(Erik) he has 2 warden stations and a pregnant wife and a smithy… you have fortresses, party members, businesses at mid to late game",
    how: "engine/holdings.js — one base record, kind-discriminated, a condition that moves both ways, riding the world-time pass",
    gates: ["358: a holding's condition moves BOTH ways — it recovers, it does not complete",
            "358: …and it never acquires a terminal state",
            "358: an UNKEPT holding slides one rung per pass, never two",
            "358: …and cannot climb past 'holding' while it has no keeper",
            "358: `household` is not a holding kind, and cannot be added as one",
            "358: a holding whose keeper has left is reported as unkept",
            "358: the GM is told what you hold, who keeps it, and how it fares",
            "358: a holding advances with NO delegated work due and the character clock unmoved",
            "358: …and only a CHANGE of condition is news — a holding that goes on holding is not an event"],
    note: "⛔ A CONDITION THAT MOVES BOTH WAYS, NOT A COUNTER TO A TERMINUS — the answer from my Round 2 review that Aevi accepted, and the whole reason a holding could not simply be an assignment: `advanceAssignment` is monotonic with a terminal `done`, so it would have RETIRED a post at the moment its steward succeeded. Her own words back: \"a progress counter would have been the wrong shape and I did not see it.\" ⚠️ ONE BASE RECORD DISCRIMINATED BY `kind`, on Erik's evidence rather than my principle: his live charge reads \"the Raven's Home POST — laboratory, workshop, Watch, FORGE, keeper's hut\" — a post that CONTAINS an enterprise, which separate top-level records would have split into two pointing at each other. ⛔ `household` IS NOT A KIND AND CANNOT BE ADDED AS ONE — gated, not merely omitted. Aevi: stake and obligation, never a stat line; and she noted her own first placement, beside the smithy, was the first step toward it acquiring `condition: thriving`, which is the sentence about a family the game must never say. ⚠️ AN UNKEPT HOLDING SLIDES AND CANNOT THRIVE, which is what makes it a claim on attention rather than scenery — and what finally gives a steward's departure a cost, expressible only because SNG-355 made departure a status rather than a deletion. ⚠️ TWO OF MY OWN ERRORS, BOTH CAUGHT BEFORE SHIPPING AND BOTH THE SAME SHAPE AS SOMETHING ELSE TODAY: (1) my first cut put the holdings pass INSIDE advanceDelegatedWork, behind its `!due.length` early return — so a holding only moved if an ASSIGNMENT was due at the same moment, which is SNG-366's exact bug reintroduced one function over; (2) the decline formula double-stepped, taking an unkept holding from `holding` past `strained` to `failing` in a single tick — a decline the player cannot see coming is a rug-pull, and the point of four rungs is that it slides.",
  },
  {
    id: "SNG-367", ask: "(Aevi) 33 of 34 NPCs draw from the literal string 'a person' — that's why every figure renders as the same woman",
    how: "npcPromptSeed takes ctx.aesthetic; authored form > people layer > what they do; formOf's never-falsy default removed from the chain",
    gates: ["367: an NPC with only a role no longer leads with 'a person'",
            "367: …the people layer leads when nothing about the body is authored",
            "367: an AUTHORED form wins over the people layer — this is what stops an Ent rendering human",
            "367: …and the people layer survives as REGISTER rather than being dropped",
            "367: a person with no people does not borrow one's face",
            "367: assembleImagePrompt carries ctx through to the npc seed, as the ability path already did",
            "367: …and the npc image call supplies the tradition aesthetic"],
    note: "⛔ THE CAUSE IS A FALLBACK THAT NEVER RETURNS FALSY. `formOf()` returns the literal \"a person\" when form/lineage/appearance are absent, and it sat THIRD in `appearance || form || formOf(npc) || description || role || name` — so everything after it was UNREACHABLE for anyone without an authored form, which is almost everyone. Every figure was drawn from the same two words, so every figure came back the same face. MEASURED AFTER: 33 → 0. ⚠️ AND MY FIRST MEASUREMENT SAID 3 OF 34, CONTRADICTING HER, BECAUSE I REIMPLEMENTED THE FALLBACK CHAIN IN THE PROBE INSTEAD OF CALLING `npcPromptSeed`. Measuring against a paraphrase of the code is not measuring the code; her 33 was exact. The standing rule cuts both ways — if a number does not reproduce, check the instrument before the claim. ⛔ THE ORDER IS THE RULE, NOT A PREFERENCE (Aevi): an AUTHORED form wins over the tradition layer, \"that is what stops an Ent rendering human\". And when a form IS authored the people layer does not vanish — it stops being the SUBJECT and becomes the REGISTER, so an Ent of the ashwardens is still an Ent, rendered grey and unhurried. ⚠️ THE RESOLVER READS `people`, WHICH IS THE FIELD AFFILIATION ACTUALLY WRITES (affiliationOf → {people, peopleSource}); reading only `traditionId` would have produced a resolver that looked correct and returned nothing — the same shape as the bug being fixed. ⚠️ HONEST LIMIT, REPORTED: the whole 33→0 comes from removing the never-falsy default. The people layer fires for GENERATED npcs, which arrive affiliated (SNG-177); Silas's 34 are npcUpdates REGISTRY entries and carry no affiliation at all, so they now lead with what they DO rather than their people's look. Widening registry entries to inherit their community's people is a separate piece.",
  },
  {
    id: "SNG-366", ask: "(Erik, ratified) delegated work moves on WORLD days — character days are player-advanced and therefore gameable",
    how: "advanceDelegatedWork lifted above the character-day early return, gated per-assignment on lastMovedWorldCount",
    gates: ["366: delegated work advances even when the CHARACTER clock has not moved",
            "366: …and a charge delegated moments ago does NOT advance — the gate is per-assignment",
            "366: a catch-up of several charges reports as ONE digest, not a wall of notices",
            "366: …while a single charge still gets its own full line",
            "366: only the world-time passes were lifted above the early return — the rest keeps character cadence",
            "366: the tick reports what MOVED, never inferring it from whether there was news"],
    note: "⛔ THE CLOCK WAS GAMEABLE, WHICH IS WHY IT WAS THE WRONG ONE. Erik: spam rest to fast-forward your steward, or refuse to rest to freeze the world. ⚠️ AND THE FIX WAS TINY BECAUSE THE STAMP WAS ALWAYS THERE — Aevi's find: `advanceAssignment()` has written `lastMovedWorldCount = worldCount()` since it was authored, and THE GATE NEVER READ IT. It gated on `elapsed >= 3` character days, sitting under an `elapsed <= 0` early return that Silas had been parked on for 915 actions (clock day 14, lastTickDay 14) — three charges, zero advances, ever. Verified before building: all three had `lastMovedWorldCount === stampedAtWorldCount`. ⚠️ GATED PER-ASSIGNMENT, not per-tick, so a charge delegated an hour ago does not ride along with one delegated last week. ⚠️ AND ONLY THIS BLOCK WAS LIFTED, per her instruction — events, drift and deed-spread keep their character-day cadence, because repointing the whole tick would change all of them at once on no evidence, which is the opposite of sim-before-tweak. ⛔ A MISSING STAMP MEANS \"WE DO NOT KNOW\", NOT \"NEVER MOVE AGAIN\": my first cut defaulted to `count`, which made an unstamped charge permanently un-due — a silent freeze, the exact shape this ticket exists to remove. It falls back to the creation stamp, then to 0. ⚠️ CATCH-UP GETS A DIGEST, her call and a good one: a month away is ~10 intervals, and ten separate notices would feel worse than the silence they replace — a wall of small news is how a player learns to skip the news. ⚠️ AND IT REPORTS WHAT MOVED RATHER THAN WHAT WAS WORTH SAYING: my first version inferred `ticked` from news length, which reads a quiet `progress` — which prints no line by design — as nothing having happened.",
  },
  {
    id: "SNG-365", ask: "(Erik) did you put in the 'Attainable' filter for what you can buy with how many skill points you have? and we need to get more room in for the skill wheel",
    how: "an Attainable chip on the wheel reading nd.reachable; the legend collapses; the canvas is bounded by the room left",
    gates: ["365: one reader serves every rate sub, so four sites cannot drift about what a rank is worth",
            "365: agility raises DEFENCE, and only on a defending action",
            "365: wits raises the CRIT-SUCCESS dial",
            "365: insight SUMS with earned attunement (ratified), it does not replace it",
            "365: presence raises social BEARING — its first consumer",
            "365: …but NOT when presence is the rolled sub — one rank is never paid twice",
            "365: presence widens RENOWN — its second consumer",
            "365: …unsigned — a high-presence villain becomes notorious faster, not slower",
            "365: the wheel has an Attainable filter",
            "365: …and it reads the ONE gate (nd.reachable), never its own arithmetic",
            "365: …and it STACKS with the function and Suggested filters rather than replacing them",
            "365: …and clear resets it too — a filter you cannot turn off is a trap",
            "365: the legend collapses behind a summary instead of standing above the wheel",
            "365: the canvas is bounded by the room actually left, not by the viewport alone"],
    note: "⛔ THE HONEST ANSWER WAS NO. SNG-348 built the buyable filter on the LEVEL-UP learn list, and the WHEEL is the browse surface — SNG-218 §3 says so in as many words. I built it where the list was rather than where the browsing happens, which is the same misplacement as binding the companion panel to the sidebar and not the character screen. ⚠️ IT COST NOTHING TO COMPUTE, WHICH IS THE INTERESTING PART: `nd.reachable` IS `canLearnAbility`, and SNG-218 §1 already made that the ONE gate — level, domain, attribute, the capstone standing bar, capacity AND affordability. The node already knew. A filter that recomputed affordability would have been a second opinion on one question (the SNG-348 lesson), and here the correct implementation was to ask what was already answered. ⚠️ AND THE ROOM PROBLEM WAS TWO THINGS, ONE OF THEM A MEASUREMENT ERROR. The legend was THREE STANDING LINES of prose above the feature itself — read once, in the way forever — now behind a summary. And `.graph-wrap` was `height: 82vh`, measured against the VIEWPORT rather than against what the chrome above actually leaves: every header row added since pushed the wheel further below the fold, so the PAGE scrolled instead of the canvas. Bounded by both now — 82vh when there is room, shrinking to fit when there is not. The skill-point line also folds into the filter row, where it belongs: it is the number the Attainable filter is measured against. ⛔ AND THE RATE SUBS ARE NOW CONSUMED, which is the other half of this id. SNG-356 wired only the four POOL subs and left the four RATE subs deliberately untouched — a rate is READ where it applies, and banking one into a stored field is the writer-with-no-reader bug inverted. Four sites, ONE reader (`rateValue`), so they cannot drift about what a rank is worth. ⚠️ ERIK RATIFIED THREE THINGS AND EACH CHANGES THE ANSWER: insight SUMS with earned attunement rather than taking a max — attunement is what practice gave you, insight is what you are, and a max() makes the smaller of the two free; presence has TWO consumers, not one (social bearing AND renown); and the anti-double-dip stands — the bearing term fires EXCEPT when `presence` is the sub actually rolled, because there the ladder is already paying through the roll column. ⛔ AND AEVI WAS EXPLICIT ABOUT WHAT NOT TO COPY: do not inherit a `d.weight > 0` guard onto renown, because RENOWN IS NOT MERIT-SIGNED — a high-presence villain becomes notorious FASTER. Verified in both directions: reach grows in magnitude for a +3 deed and for a −3 atrocity alike, which is SNG-281's magnitude-not-merit rule read through the person rather than the deed. ⚠️ LEFT UNBUILT AND SAID SO: the three MILESTONE effects (harm-rung drops, novel-penalty removal) are not addends and do not belong in a sum — they need their own hooks at the sites they change, which is a separate piece rather than a line in this one.",
  },
  {
    id: "SNG-364", ask: "(Erik) all of these NPCs need portraits, and the portrait needs to pop up from the new tabs… just like when they fight or get killed",
    how: "showWhoIs renders a portrait through the same ensureImage path an NPC uses, seeded on the figure's id",
    gates: ["364: the who-is card renders a portrait for a FIGURE",
            "364: …seeded on the stable id so the same figure keeps the same face",
            "364: …and whoIs returns that id, so the seed survives a rename",
            "364: …and the card scrolls, with the portrait and the text in the same scroll region",
            "364: a portrait failure never breaks the card"],
    note: "⚠️ THE FIGURES A PLAYER MEETS ONLY IN A WORLD-TICK DIGEST ARE THE ONES WHO MOST NEED A FACE, precisely because they are never in a scene — Valen Sunwrack, the Thornmother, the Clockmother. The tick writes about them constantly and they were a name and a sentence. The portrait machinery already existed (SNG-299 made the names tappable; ensureImage draws NPCs); it was simply never pointed at them, which is the SNG-353 shape again — authored capability with no surface. ⛔ SEEDED ON THE ID, NOT THE LABEL. These people ACQUIRE TITLES IN PLAY — \"Valen Sunwrack, Who Left No Shadow Standing\" — and a face keyed to the displayed name would change the moment the world renamed them, which quietly tells the player this is a different person. `whoIs` now returns the figure id for exactly that reason. ⚠️ And the card scrolls, with the portrait and the text in ONE scroll region — the same lesson as the companion panel an hour earlier, where the content was right and unreachable below the fold.",
  },
  {
    id: "SNG-350", ask: "(Aevi) fix the two live strings, then INVENTORY ONLY — count every app.js string that fails the coupling test. Count it, author nothing.",
    how: "both wheel screens corrected; tests/copy_coupling.mjs counts rule-coupled copy, grouped by the rules file that would falsify it",
    gates: ["350: no screen still offers to DEEPEN a craft by tapping — depth is earned by use",
            "350: …and both replacements say where depth actually comes from",
            "350: the coupling inventory exists and applies AEVI'S test, not a tone judgement",
            "350: …and states plainly that it authors nothing"],
    note: "⛔ THE GAME WAS LYING ON TWO SCREENS. Both skill-wheel views said \"Tap a node to learn or deepen it here\" while the function directly beneath them documents the deepen affordance as removed (SNG-349). Fixed to say where depth actually comes from. ⚠️ THE INVENTORY IS A REPORT AND THAT IS AEVI'S RULING, NOT A CONVENIENCE: \"Count it, author nothing. The copy half is mine.\" A gate would make ME the arbiter of what counts as content, which is the half she reserved — so what is gated is that the tool exists, applies HER test (\"could this string become FALSE if a rules value changed, untouched?\") rather than a judgement about tone, and says out loud that it authors nothing. ⚠️ THE NUMBER SHE ASKED FOR IS 54, against her expectation of \"larger than seven\" — and getting there took three corrections to my own tool, each of which INFLATED the count with commentary about the problem rather than instances of it: line-leading comments, then inline `${/* … */}` blocks inside template literals, then trailing end-of-line comments. First pass read 69 and its single highest-confidence finding was one of my own SNG-154 notes. An inventory that counts the notes explaining a defect as instances of the defect is worse than no inventory, because the number looks authoritative. ⛔ GROUPED BY THE RULES FILE WHOSE CHANGE WOULD FALSIFY EACH STRING, because that is the migration order — energy 14, emergence 13, sub_attribute_ladder 8, standing 5, leveling 5, skill_capacity 5, companions 4, resolution 3, martial_paths 1 — rather than alphabetical or by screen. And it is a SCOPE, not a work order: the heuristic cannot read intent, so borderline cases stay hers to settle.",
  },
  {
    id: "SNG-363", ask: "(Erik) Why is Silas hearing about something Splarf did? It's not huge news and they're far apart",
    how: "worldtick.newsReach + ledgerWeight — distance and significance, reusing SNG-281's region model; collapseLedgerEvents for the double-log",
    gates: ["363: the news gate CALLS spreadDeeds rather than reimplementing the spread",
            "363: …and no invented distance thresholds survive",
            "363: magnitude is banded 1/2/3, the scale spreadDeeds already caps on",
            "363: …and a mythic actor's doings travel further than a nobody's (tier widens reach)",
            "363: impactsLocal bypasses the spread entirely — it never waits for word of mouth",
            "363: an UNPLACEABLE event is judged on magnitude, not dropped",
            "363: whose ears word has reached is per-character state, not written onto the shared ledger",
            "363: two tellings of one beat, minutes apart, collapse to one",
            "363: …the survivor keeps the FULLER telling",
            "363: …and a genuinely distinct earlier event at the same place SURVIVES",
            "363: a real escalation hours apart is NEVER collapsed — collapse, never drop",
            "363: a bandless entry still gets a usable band, since the spectral signal is usually absent"],
    note: "⛔ THE FILTER WAS: not you · newer than last read · not hidden. No distance, no significance. `e.where` was read ONLY TO PRINT \"(near X)\" — it never decided whether you HEARD it — and `slice(-5)` capped by RECENCY, so a burst of small local events from one character could crowd out a genuinely large distant one. Erik was describing the system working exactly as written. ⚠️ AND THE RIGHT MODEL SAT TWENTY LINES ABOVE IT: SNG-281's deed-spread already does this properly, one hop per pass, reach capped by weight, carrying the standing directive \"MAGNITUDE, NEVER MERIT — an atrocity travels exactly as far as a rescue of the same size.\" Aevi: the same bug, in the same file, already fixed once for deeds and never applied here. Same region map, reused rather than rebuilt. ⛔ `impactsLocal` BYPASSES DISTANCE — that flag exists precisely for an event crossing into another player's area, is escrow-confirmed by the acting player (SNG-145), and gating it by distance would break a deliberate mechanism. Distance gates AMBIENT news, never a directed consequence. ⚠️ HER PROPOSED WEIGHT SIGNAL IS EMPTY IN PRACTICE, AND THAT IS THE FINDING SHE ASKED FOR. She proposed Σ|spectrumDeltas| and said to try it before adding a field — \"if it proves too coarse, that finding justifies the field\". Measured on the live ledger: ONE of eight entries carries any spectrumDeltas at all; Σ is 0.00 for the other seven. Not too coarse — ABSENT, because the op contract lists it as `{}` and the GM almost never fills it. So Σ is used where it exists and two further DERIVED signals carry the rest (visibility, tag breadth); still no new field for a future GM call to forget, but no pretence that an empty signal is doing the work. ⛔ §3, THE DOUBLE-LOGGED VEIL: measured, the true duplicate is FOUR MINUTES apart and shares 0.31 of its words, while the genuinely distinct pair at the same place is a different world-day and eighteen hours. Word overlap alone could not separate them without a threshold low enough to start eating real escalations — the exact loss Aevi ruled out — so THE CLOCK is the discriminator and prose only confirms. Collapse, never drop: the survivor keeps the LONGER telling, tags and impactsLocal union. ⚠️ §4 NEEDED NO TRACE: the three `where: \"gen-object-object\"` entries are dated 2026-08-01 and the SNG-329 coerced-object guard landed 2026-08-06 — pre-fix residue, not a live bug. The mint door is closed; what mattered was that the new gate not DELETE them for being unplaceable. ⛔ AMENDED AFTER SHIPPING, AND THE CORRECTION IS THE INTERESTING PART: my first version INVENTED its own distance thresholds (0.2 / 0.6) and REIMPLEMENTED the spread. Aevi amended §2 to say it plainly — \"call `spreadDeeds`, do not reimplement it\" — and she was right twice over. Inventing the numbers is the failure the standing rule exists to stop; but the deeper error was the MODEL. A distance band asks \"is this audible from there\", so a far event is heard instantly or never. The spread asks how far word has TRAVELLED — one hop per pass, capped by magnitude (1→2 communities, 2→5, 3→12) — so a distant event takes TIME to arrive, which is what makes a world feel large and \"word reaches you\" a true sentence rather than a decoration. Rebuilt on spreadDeeds, with the actor's TIER widening reach (her pointer that whois TIER_MEANING is already a distance ladder), and the spread state kept PER-CHARACTER — whose ears a rumour has reached is not a property of the event, and the ledger is one file many players write.",
  },
  {
    id: "SNG-360", ask: "(Erik) the user can't make all these calls and WHY are there so many to begin with!! these need an allocation upstream i think",
    how: "codexForGM emits [id] alongside the label; the op contract tells the GM to REUSE an existing topic",
    gates: ["360: the GM is shown each topic's ID, not just its label — it cannot reuse what it never sees",
            "360: …and is told a topic is a SUBJECT that accumulates facts, not a per-beat headline",
            "360: …with the real failure named concretely, so the instruction teaches by example",
            "360: the judge's contract still says only an UNSURE pair reaches the player"],
    note: "⛔ THE GM WAS ASKED FOR AN ID IT WAS NEVER SHOWN. The op contract says `topic (stable kebab id)` and `codexForGM` emitted the LABEL ONLY — so the model could not reuse an existing topic even in principle, and did the only thing available to it: invent a fresh headline every beat. Erik's codex grew \"The Veil's Tiring Hold\", \"The Veil's Breaking Choice\" and \"Veil as Boundary-Agent\" — THREE TOPICS, ONE VEIL — and then handed him six merge decisions to reconcile by hand. ⚠️ HIS DIAGNOSIS WAS THE RIGHT ONE AND IT WAS NOT THE QUEUE: \"these need an allocation upstream.\" The merge queue is a symptom, and no amount of judging pairs downstream repairs a writer that mints a new subject per sentence — the same shape as resolve-before-mint in generate.js, missing at the codex door. The fix is two lines of plumbing (show the id) and an instruction that a topic label names a THING (\"The Veil\") rather than describing a beat about it. ⚠️ A SECOND, SMALLER FINDING LEFT REPORTED RATHER THAN CHANGED: the render calls `suggestMerges` directly and paints the RAW scorer output, while `maybeAdjudicateMerges` runs asynchronously afterwards and only when an API key exists — so the list Erik saw was PRE-JUDGE, even though the judge's own docstring promises \"unsure → the ONLY thing that reaches the player.\" Fixing the ordering is a real change to a live surface and belongs with Aevi's read on what the player should see while the judge is still thinking.",
  },
  {
    id: "SNG-353", ask: "(Erik, in play) I searched codex but can't find what they do or the growing bond meaning… they don't have a popup info either",
    how: "showCompanionPanel — twelve authored fields reach a surface; bond reads as progress; the gift is named and sealed",
    gates: ["353: the panel function exists at all",
            "353: `persona` reaches a surface (it was authored and rendered NOWHERE)",
            "353: `knowledge` reaches a surface (it was authored and rendered NOWHERE)",
            "353: `boundaries` reaches a surface (it was authored and rendered NOWHERE)",
            "353: `appearance` reaches a surface (it was authored and rendered NOWHERE)",
            "353: `stages` reaches a surface (it was authored and rendered NOWHERE)",
            "353: boundaries render VERBATIM — never summarised",
            "353: the panel opens from BOTH the company row and the codex — the codex is where Erik looked",
            "353: …and it is keyboard-reachable, not hover-only",
            "353: the engine already knew the next threshold — it just never said it",
            "353: the badge reads bond x/max and names the next threshold",
            "353: the bond gift is NAMED as a goal, with its threshold",
            "353: …and SEALED — no grants text, no functions, no ranks leak into the panel",
            "353: …and its ARRIVAL is the braid/mint celebration, not a status line",
            "353: no companion needed new content — every field already existed"],
    note: "⛔ HE DID NOT MISS IT; IT WAS NOT THERE. Twelve authored fields per companion and the player could reach two and a half — `persona`, `knowledge`, `boundaries`, `stages`, `substrateAura` rendered NOWHERE, and `role`/`appearance` only as `title=` tooltips, which do not exist on touch. On a phone a companion was a name and an unscaled number. NO NEW CONTENT WAS NEEDED: every word was already written. ⚠️ THIS IS THE INVERSE OF THE BUG WE KEPT CATCHING — SNG-339 found readers with no writers, SNG-342 found registered files nothing loads; this is a WRITER WITH NO READER. Aevi's structural point is the sharp one and it stands unfixed: the consumer contract asserts that content supplies what CONSUMERS READ, and never that an authored field HAS a consumer at all, so a field nothing reads passes every gate we own. ⛔ ERIK'S RULING ON THE GIFT — NAME IT, SEAL THE REST. `bondGrants` was read at exactly ONE site, the moment it fired, so the answer to \"what does the growing bond mean\" was authored per companion and structurally unreachable until the question stopped mattering: a reward the player cannot see is not an incentive, it is a surprise. The panel now names the craft and its threshold and NOTHING else — gated explicitly on the absence of grants text, functions and ranks — and the arrival reuses the braid/mint ceremony rather than a status line. Aevi's own read: it makes the bond a destination without spending the gift. ⚠️ AND THE BOND NUMBER WAS A SCORE WITH NO SCALE. `companionStageThresholds()` already returned the exact unlock values and `bondOf()` the stage — the engine knew the next threshold and never said it. `bond 4/10 · stage 2 of 3 · next at 7` is entirely numbers that were already computed.",
  },
  {
    id: "SNG-355", ask: "(Erik) the story had let some of them depart while still remaining in my party — we need more structure for party entry and exit",
    how: "partyOps GM op (join proposes, depart applies); departure becomes a status; activeCompany is the one accessor; teacher fallback to npcRegistry",
    gates: ["355: a departure KEEPS the record — history, not absence",
            "355: …and joinedDay survives it, so 'travelled with you, days 18–34' is answerable",
            "355: a departed member is not in the active company",
            "355: …and their benefits stop the day they leave",
            "355: rejoining restores the PERSON, not a stranger with their name",
            "355: a GM DEPART applies immediately — the story's to decide",
            "355: a GM JOIN only PROPOSES — the player assents to a commitment",
            "355: only someone ACTUALLY with you can depart — no invented history",
            "355: a GENERATED npc keeps its teacher role at recruit (the authored catalog has no entry)",
            "355: an EXISTING save gets the lost teacher role back on login",
            "355: partyOps exists in the contract, the vocab, AND the apply path"],
    note: "⛔ THE NARRATOR HAD NO WAY TO SAY IT. `recruit()` and `partCompany()` both worked and were called from exactly TWO places, both `btn.onclick` behind a `confirm()` — so the entity that narrates \"Calvar clasps your arm and turns back toward the March\" had no mechanism to record that it happened. This ticket adds no story capability; it lets the state HEAR one already being spoken. ⚠️ ENTRY NEEDS CONSENT, EXIT DOES NOT, and the asymmetry is the design: joining is a commitment the player assents to, so a GM join only PROPOSES; leaving is the story's, because — Aevi — \"a departure that requires the player's permission is not a departure.\" ⛔ AND DEPARTURE STOPPED BEING DELETION. It was `filter(m => m.npcId !== npcId)`: twenty days of travelling together were ERASED rather than remembered. Both halves of Erik's bug are the same missing idea — that leaving is an EVENT. Now it is a status with `leftDay`/`departedWhy`, which makes \"the road may cross again\" (already in the copy) a statement the system can act on: rejoining reads the old record and keeps `joinedDay`, so the person who walks back in is the one you knew. ⚠️ THE REGRESSION RISK AEVI NAMED WAS REAL AND HAD FIVE HEADS: the roster, the trainer set, the liaison map, the teacher block and standing's drip all read `character.company` directly, and filtering at each is five chances to forget — a sixth reader later would be a certainty. One accessor, `activeCompany`, and a former member cannot leak into a present-tense answer by omission. ⛔ §1c: THE TEACHER ROLE WAS LOST AT THE MOMENT OF JOINING for every generated NPC — `recruit()` read `teaches` from the AUTHORED catalog, which returns {} for a generated person, so `curriculumFor`, `teachersForGM` and `teacherOfferReady` were real machinery reading a field nothing ever populated for the people who actually travel with you. Erik calls Veth-Ondra his teacher and his save said `teaches: null`. The fallback lives INSIDE recruit rather than at the call site, because there are now two callers and a fallback written at one is a fallback the other lacks; reconcile 30 restores what was already lost.",
  },
  {
    id: "SNG-356", ask: "(Erik) specify what each point up to 20 gets you so we can better control the impact and the player can see it exactly — and: ship the roll column first",
    how: "loadRule(sub_attribute_ladder) → rules.subAttributeLadder; resolve.js pays rollCumulative; engine/ladder.js pays pool grants from both doors",
    gates: ["356: the ladder REACHES the rules — registered is not loaded",
            "356: …and arrives whole — 20 roll ranks and 8 subs",
            "356: the resolver pays the AUTHORED roll column, not the soft-cap formula",
            "356: early ranks pay a FLAT rate — the bend is not at rank 4 any more",
            "356: …and the ladder bends later, once, downward",
            "356: rank 1 is unchanged from the old formula — early game was deliberately not touched",
            "356: an unpaid character is owed its ladder grants",
            "356: …and the amounts are exactly what the AUTHORED ladder says they are",
            "356: the CURRENT pool rises with the max — a bigger bar already half-empty reads as a loss",
            "356: a second application grants NOTHING — idempotent by high-water mark",
            "356: buying a rank pays IN PLAY, not only on next login",
            "356: an EXISTING save is paid retroactively, through the ctx the app really passes",
            "356: only POOL subs are paid — a rate is read at its site, never banked",
            "356: the roll column has ONE reader — resolver and readout cannot disagree about a rank's worth"],
    note: "⛔ THIS LINE MOVES EVERY SUCCESS CHANCE IN THE GAME, and it shipped on EVIDENCE rather than on anyone's say-so. Aevi gated the roll column on the SNG-357 harness in her own file — \"a flat +10 on success chance from mid-game onward is a large change and I do not know that it is right\" — and named the failure condition IN ADVANCE: if the +10 pushes mid-game characters toward the 95% ceiling, lower the per-rank values rather than abandon the bend. Measured against Silas's real spread (4,5,7,7,9,7,9,6) at level 29, ZERO of 8 subs reach the ceiling on normal work. The stated failure mode does not occur; Erik then called it. ⚠️ THE BEND MOVED FROM RANK 4 TO RANK 6, which is the whole point (SNG-354: rank 4 is the TOP of early game — the wrong phase for diminishing returns) — and rank 4 itself is bit-identical to the old formula, so early game is untouched by design. Gated as SHAPE, never as value: the bend EXISTS and sits later than 4, because the per-rank numbers are Erik's dial and a gate pinned to them goes red the moment he turns it. ⛔ GRANTS ARE PAID AGAINST A HIGH-WATER MARK. `cumulative[rank]` is the TOTAL owed for standing at that rank, so a naive application re-adds the whole amount every pass and inflates a pool without limit; `ladderPaid[sub]` makes it a difference, which makes the RETROACTIVE case (Erik's ruling) the ordinary case with a starting mark of zero. Both doors pay — spendSubPoint in play AND reconcile 29 on login — because a grant that only ever arrives through a migration is one the player never sees land: they would spend a point, watch nothing change, and read the ladder as a lie. ⚠️ ONLY POOLS. Four subs are `kind: \"rate\"` (agility→defenseBonus, insight→senseTier, presence→reputationGain, wits→critChance) — a rate is READ where it applies, and banking one into a stored field is the writer-with-no-reader shape inverted. They are deliberately untouched and REPORTED as the remaining half. ⚠️ AND AN OLD GATE WAS QUIETLY TESTING THE FALLBACK: `sub-attribute drives the roll (with soft cap)` uses a fixture that reads resolution.json off disk with no ladder in it, so it stayed green through a change to every roll in the game while its name described the retired rule. Renamed to say which path it covers, with a companion check that the fixture really is on the fallback — because a default that looks like an answer is exactly how the SNG-342 emergence regression hid.",
  },
  {
    id: "SNG-352a", ask: "(Aevi) narrow claimsCombat to the authored harm vocabulary; derive the verb list from function_vocabulary.json rather than fixing it a third time",
    how: "wiring_audit reads families.HARM + the verbs inside its own definitions; challengeTypes no longer imply offence",
    gates: ["352a: the HARM family is READ from the vocabulary, not retyped in the audit",
            "352a: …and claimsCombat keys on the harm FUNCTIONS, never on a challengeType",
            "352a: a NEW harm verb in the canon is picked up with no second place to edit",
            "352a: a ward tagged DEFEND/FIGHT does NOT claim combat — challengeTypes say WHERE, functions say WHAT",
            "352a: …while a strike-function ability still does"],
    note: "⛔ THE GATE WAS ASSERTING SOMETHING FALSE ABOUT WHAT A DEFENSIVE ABILITY IS. `claimsCombat` fired on a FIGHT|DUEL|DEFEND challengeType, so a WARD tagged DEFEND \"claimed combat\" and was then failed for teaching no offence. MEASURED before touching anything: 23 of the 42 offenders were flagged by challengeType ALONE — prism_sight, darksight, resonant_anchor, perfect_motion — reveals, shields and wards, correctly tagged as USABLE in a fight. challengeTypes answer WHERE a craft can be used; functions answer WHAT IT DOES, and only the second is a claim about harm. ⚠️ I DID NOT NARROW IT TO GO GREEN. The ratchet regressed 37→42 on Aevi's batch and the tempting move — weakening the gate that caught it — is the one that must never be made on my own judgement, so it was reported with the measurement and Aevi ruled (c): narrow the gate AND she reviews the 19 that remain. She also rejected (b) outright: \"that would have you fix a bad test by corrupting content.\" ⛔ DERIVED, BECAUSE THIS WAS THE SECOND REPAIR OF THE SAME DRIFT. The audit's own comment records the first (SNG-147d, Aevi: the verb list omitted `hinder`'s canon words and so contradicted the canon it enforced). The vocabulary already GROUPS these — `families.HARM` is strike/break/hinder — so both the function set and the core verb list now come from the file, and a fourth harm verb is picked up with no second place to remember. ⚠️ AN HONESTLY-LABELLED SUPPLEMENT REMAINS: a rank's `grants` is PROSE, and prose reaches for \"disarm\", \"stagger\", \"drive back\" — offensive by any reading, present in no definition. Pretending the vocabulary could supply them would be the wrong kind of purity; what matters is that the half which CAN drift no longer does. ⚠️ AND THE LIVENESS IS GATED, NOT ASSUMED — \"I derived it\" is a claim like any other, and a derivation that quietly stops tracking its source is indistinguishable from a hardcoded list, which is how the hand-list survived two repairs. Ratchet locked at 19 so it cannot drift back to 37 while Aevi works the remainder.",
  },
  {
    id: "SNG-349", ask: "(Erik) but skill points aren't used to deepen a craft anymore",
    how: "five player-facing strings corrected; the dead paid-rank arithmetic removed; the claim gated",
    gates: ["349: no player-facing string claims skill points DEEPEN a craft — depth is earned by use",
            "349: …and the at-capacity message says what IS true — the points BANK until the next level",
            "349: the level-up screen no longer PRICES a rank it cannot sell",
            "349: skill points still have exactly the sinks we think they have (learn, and the untriggered rank path)",
            "349: …and LEARNING is the only one the app can reach — nothing in app.js calls rankUpAbility"],
    note: "⛔ HE WAS CORRECTING ONE LINE I HAD JUST WRITTEN AND FOUND FIVE. Depth is EARNED under ability-arch v2 — rank 2 lands automatically once a craft has been used enough, rank 3 is a defining moment the GM marks — and neither costs a point. Five separate strings still told the player otherwise, plus a stale docstring on the Level-Up window itself reading \"one place to spend skill points. DEEPEN a craft you know (rank up)\". ⚠️ THE WORST OF THEM FIRED EXACTLY WHEN THE QUESTION IS ASKED: at capacity the screen said \"new points now deepen what you know\" — and at capacity you cannot LEARN (that is what capacity means) and cannot BUY depth (it is earned), so the one moment the message matters it named the only thing points cannot do. MEASURED: `learnAbility` is the ONLY sink the app can reach; nothing in app.js calls `rankUpAbility` at all. What is actually true is that the points BANK, because the breadth cap rises +1 per level (2 at L1 → 13 at L12) — so they are deferred, not wasted, and that is now what it says. ⛔ THE DEAD PRICE WENT WITH IT: `rankRows` still computed a `rankCost` and a `canRank` reading `sp >= rankCost`, describing a purchase that has not existed since ability-arch v2 and is rendered nowhere. A calculation that describes a rule is not evidence the rule exists — the `martial_paths` lesson pointed at code instead of content — and dead pricing arithmetic is a standing invitation to re-wire the thing it prices. ⚠️ GATED ON THE CLAIM, NOT THE WORDING: \"deepen\" is a fine word (crafts DO deepen), so the pattern matches POINTS-near-DEEPEN, and it requires the true statement to be PRESENT — otherwise \"no lie\" is satisfied by saying nothing at all. It is also comment-aware, because my own comment explaining the removal named the dead expression and tripped the first version: a gate that cannot tell code from commentary about code punishes whoever documented the fix. ⚠️ LEFT STANDING AND REPORTED: `rankUpAbility` still charges skill points and is still exercised by the suite, while being unreachable from the app — a green gate over a path no player can walk.",
  },
  {
    id: "SNG-348", ask: "(Erik) costs have risen — even my primary/tertiary mostly cost 2 … can we add a filter for buyable so I can see what I can get",
    how: "skilltree node model carries cost/affordable/buyable from learnPointCost; a buyable-only chip on the learn list",
    gates: ["348: at ZERO domain distance a Tier-I costs 1 — the floor is not the complaint",
            "348: …and a Tier-II costs 2 IN YOUR OWN DOMAIN — tier is the price, not cross-class distance",
            "348: the node model carries the SAME cost the purchase charges — never a second opinion",
            "348: a craft can be OPEN and still not BUYABLE — the two are different questions",
            "348: buyable ⊆ affordable, always",
            "348: …and buyable never includes a LOCKED craft",
            "348: more points ⇒ strictly more buyable — affordability tracks the purse",
            "348: the filter and the row ask ONE function, so they cannot disagree",
            "348: the chip shows the count BEFORE you toggle it — 'N of M' answers the question without a click",
            "348: …and says something useful when the answer is ZERO, rather than showing an empty list"],
    note: "⚠️ THE COST IS NOT A BUG AND THE ANSWER IS NOW GATED so the question stays answered: cost = tierPrice × distance, and tierPrice is the ability's OWN levelReq (SNG-260 §D, Erik's dial — \"a Tier-II costs 2, a Tier-III costs 3. Power costs more.\"). So a Tier-II costs 2 IN YOUR PRIMARY DOMAIN, at zero distance, with the cross-class multiplier never involved. MEASURED: only 72 of 311 crafts (23%) cost 1 point even at zero domain distance, and Tier-II is the MODAL tier at 119 — so \"most cost 2\" is the catalog's shape meeting the tier ladder, exactly as designed. ⛔ THE REAL DEFECT WAS THAT THE MODEL KNEW WHETHER A NODE WAS OPEN AND NOT WHETHER IT WAS BUYABLE, and those are different questions. `AVAILABLE` meant gates-met and under-capacity and said NOTHING about price, so the surface showed Erik a field of open crafts he could not afford — which is why the list felt broken when the pricing was working. Cost and affordability now ride on the node. ⚠️ AND THE FILTER READS THE SAME FUNCTION THE PURCHASE CHARGES (`learnPointCost`), never its own arithmetic — a filter with a second opinion on price drifts from the button the first time either moves, which is precisely the shape that put SIX copies of this calculation in the codebase before learnPointCost collapsed them into one site. The level-up list likewise hoists ONE `learnState(ab)` that both the filter and the row consult. ⚠️ THE COUNT SHOWS BEFORE THE TOGGLE IS PRESSED (\"3 of 47\"), because the number IS usually the answer — including when it is zero, where the chip says what to do instead rather than opening an empty list.",
  },
  {
    id: "SNG-347", ask: "(Erik, from play) check out this newly minted NPC…",
    how: "state.isDescriptiveNotName — the mint refuses a description as a name; unnamed is MARKED and named in play",
    gates: ["347: a description in the name slot is REFUSED",
            "347: …and a real name is not — including an epithet-name like 'The Ashen Warden'",
            "347: the cosmetic prettifier LAUNDERS this input — which is why a validator is needed",
            "347: the stub marks an unnamed person UNNAMED rather than naming them from the hint",
            "347: …and keeps the hint as a DESCRIPTION, so nothing is lost",
            "347: …and never cuts it mid-word (the SNG-181/343 raw slice)",
            "347: a stub given a real name is NOT marked provisional",
            "347: the GM is told the person is NOT YET NAMED, and told to name them in play",
            "347: an ALREADY-MINTED description is marked unnamed on login",
            "347: …and is NOT renamed — inventing a name would write canon the player never heard",
            "347: the world-grows ribbon renders a provisional name as PROSE, never bolded as an identity"],
    note: "⛔ THE HINT WAS BEING USED AS THE NAME. `stubEntity` read `context.hint` — the generateRequest's description of WHAT TO MAKE, whose own contract example is \"a tollhand at the lower gate\" — and used it verbatim as the identity, cut at exactly 60 characters (the SNG-181/343 raw slice again). Erik's NPC was minted \"someone tending the waystation fire—shelter-keeper, traveler\" and the ribbon announced it IN BOLD, as a name. ⚠️ SNG-199 ALREADY FIXED THIS CLASS — on the REGISTRY path, where prettifyNpcName carries the words \"a descriptive CLAUSE is not a name\". The GENERATE mint never got the guard, so the identical defect walked in the other door. Counting the doors is not finding them. ⛔ AND THE EXISTING FUNCTION WOULD HAVE MADE THIS ONE WORSE, which is why it is a new validator rather than a reuse: prettifyNpcName's \"already human-shaped\" test requires a CAPITAL LETTER, so an all-lowercase description falls past it into the SLUG-PRETTIFIER and is title-cased into \"Someone Tending The Waystation\" — which LOOKS like a name, passes every downstream check, and is nonsense. A cosmetic pass standing where a validator belongs does not merely fail to fix bad input; IT LAUNDERS IT, which is strictly worse than leaving it visibly broken. That is now its own gate. ⚠️ THE REPAIR IS THE INTERESTING HALF, AND IT IS SNG-343'S PRECEDENT AGAIN. Three options: invent a name, delete the NPC, or mark them unnamed. Inventing writes canon the player never heard; deleting removes someone the fiction already met. So the description stays a DESCRIPTION, the person is marked `nameProvisional`, the ribbon renders them as prose rather than bolding a phrase into an identity, and the GM is told NOT YET NAMED with instructions to name them the moment the player would learn it — the only route to a REAL name that exists. The stub's own contract already said it: \"never fabricates specifics it wasn't given\", and a name is precisely such a specific. ⚠️ The detector is deliberately conservative (indefinite/anonymous opener · lowercase initial · a clause break · over five words) so it never rejects a legitimate epithet-name like \"The Ashen Warden\", which is gated explicitly.",
  },
  {
    id: "SNG-346", ask: "(Erik) a level 1 should succeed 2/3 of the time at easy things, and fail 2/3 of the time at hard things",
    how: "rules/resolution.json difficultyBands + resolve.normalizeDifficulty, one normalizer across all four doors",
    gates: ["346: the band table REACHES the rules",
            "346: the ladder is STRICTLY MONOTONIC — very easy > easy > normal > hard > very hard",
            "346: easy is a BONUS, not the absence of a penalty — it beats normal",
            "346: …and the spread is EVEN, so the ladder is learnable in one look",
            "346: legacy 0/15/30 map onto the new ladder with NO change of meaning",
            "346: an OPPOSED threat stays a number — a raider's 35 is not a band, and is never rounded onto the ladder",
            "346: the intent sanitizer PRESERVES a band — it used to coerce it to NaN then 0",
            "346: …and still refuses malformed input (a stray string can never reach the dice)",
            "346: gambit steps use the SAME normalizer — a plan cannot price a task differently from an action",
            "346: the GM's vocabulary names ALL FIVE bands — it could only say three",
            "346: …and carries the calibration rule that stops the one-way drift to 'normal'",
            "346: …and teaches by example, including the call that misfired on Erik"],
    note: "⛔ ERIK'S DESIGN NEEDS NO BASE, WHICH IS WHY EVERY BASE I PRICED FAILED. Aevi named it exactly: \"EASY BECOMES A BONUS rather than the absence of a penalty — a base lifts every band equally, so easy and hard stay 15 apart no matter how high you push it.\" He widened the SPREAD instead of raising the floor. Very easy +30 · easy +15 · normal 0 · hard −15 · very hard −30, every band 15 apart so a player can hold the whole ladder in their head. ⚠️ THE MIGRATION IS FREE AND THAT IS NOT A COINCIDENCE: the old vocabulary (0 routine / 15 hard / 30 very hard) IS the negative half of the new scale, so no in-flight turn and no save changes meaning — the design adds the positive half nobody could express rather than moving anything that existed. ⛔ THE HALF THAT WAS NOT OPTIONAL WAS THE PROMPT. gm.js said \"difficulty: 0 routine, 15 hard, 30 very hard\" — no easy, no very easy — so left alone this ships a five-band scale the narrator can address three bands of, and EVERY TASK THAT SHOULD HAVE BEEN +15 GETS TAGGED 0. That is what happened to Erik: a trained scout on open ground looking for ordinary supplies was tagged `hard`, a 30-POINT ERROR ON ONE CALL, and the reason his character read as a walking disaster. The vocabulary now teaches by example and carries Aevi's calibration rule — if nothing opposes the character it is not normal, it is easy — because the drift is ONE-DIRECTIONAL. ⚠️ AND THREE OF THE FOUR DOORS WOULD HAVE EATEN IT SILENTLY. sanitizeIntent read `Number(raw.difficulty)`, so a band became NaN and fell to 0 = normal: the feature would have shipped working in the resolver and flattened everywhere else, reproducing the exact drift the spec exists to fix. gambit.js validated `[0,15,30].includes(...)`, so a multi-step plan could never be easy. One normalizer now owns the field. Counting the doors is not finding them. ⚠️ RATIFYING THE MODEL FOUND A REAL DISCREPANCY, reported to Erik and Aevi rather than silently corrected: her L1 row reproduces EXACTLY (80/65/50/35/20, target 65/35 delivered), but her attr-5 and attr-6 rows are 5 and 15 points high because the model assumed attribute×10 stays linear — `attributeSoftCap` is 4, and every point past it pays +5, not +10. A master reads 75% on normal work, not the 90% claimed. Still far past today's 65% ceiling; the claim just needs restating. ⛔ GATED ON STRUCTURE, NEVER ON TUNING — monotonic ordering, even spacing, all four doors agreeing, legacy meaning preserved. `easy === 15` is Erik's dial and a gate asserting it goes red the moment he turns it, which this suite has already done twice.",
  },
  {
    id: "SNG-345", ask: "(Erik, from play) Splarf is failing hard on lvl 1… ugh — and: every character can defend itself, no build required",
    how: "engine/martial.js — martial_paths finally READ: baseline kit + form kits granted at creation and on login, outside caps",
    gates: ["345: martial_paths REACHES the rules — the file is loaded, not merely registered",
            "345: …and arrives non-empty — 4 baseline abilities and at least one form kit",
            "345: every baseline ability RESOLVES IN THE CATALOG — granted is not the same as usable",
            "345: …and each is BORN WHOLE — name, description, notFor, zero cost, level 1 (SNG-250 §3)",
            "345: a character with nothing is granted the whole floor",
            "345: …and a second pass grants NOTHING — reconcile runs on every login",
            "345: the free kit does NOT consume build capacity",
            "345: …so a level-1 character holding the whole floor can still learn",
            "345: a baseline ability is recognised as baseline, and an authored one is not",
            "345: an explicit character.formKit wins over prose",
            "345: form prose matches on WORD BOUNDARIES, never substrings",
            "345: …and a real Ent still matches",
            "345: an Ent is granted the floor AND its form kit — Erik's branch-club",
            "345: an EXISTING save gains the floor on login, through the ctx app.js really passes",
            "345: …and the granted records are flagged baseline, so they never eat build capacity"],
    note: "⛔ THE CONTENT WAS COMPLETE ON 2026-07-07 AND NOTHING READ IT FOR A MONTH. martial_paths carried an `engineNote` naming its own implementation — \"4 free zero-cost abilities at creation, powerSystem baseline, excluded from skill-point costs and caps\" — and it surfaced only in the SNG-342 sweep, as one of two files that were REAL GAPS rather than reference docs. A field that describes behaviour is not evidence the behaviour exists. ⚠️ I MADE THREE MISTAKES BUILDING IT AND EACH IS A KNOWN SHAPE. (1) The alias matcher used `prose.includes(\"ent\")`, which matches gentle/present/different/patient — handing a bark-and-timber combat kit to any politely-described human. That is SNG-331's `ties` → `location_affinities` bug reintroduced ONE FILE OVER, within the hour of fixing it; word boundaries now. (2) The reconcile step read `ctx.rules.martialPaths` and app.js passes `{content, profile}` with no `rules` — so it would have run every login, found undefined, returned silently, and GATED GREEN. PromisedButUnread, inside the commit closing PromisedButUnread; the gate now runs the step through the caller's real ctx shape, because testing the function alone would never have caught it. (3) `breadthUsed` excludes `native` but I nearly left `baseline` out — the floor is 4 abilities and the level-1 breadth cap is 2, so EVERY NEW CHARACTER WOULD HAVE BEEN BORN AT DOUBLE CAPACITY, able to learn nothing until level 5, which is the exact failure `native` already caused once. A floor that consumes the build it underwrites is worse than no floor. ⚠️ AND THE FLOOR IS NOT ERIK'S WHOLE COMPLAINT, WHICH I AM NOT PRETENDING IT IS: his screenshot was a PRESENCE roll at 10%, and a defense kit does not touch it. tests/success_curve.mjs reports the real curve — successChance starts at `let chance = 0`, so there is NO base constant and \"base 40\" was only ever what attribute×10 pays a 4. Rested, trained AND equipped, an attribute-4 character reads 55%; a maxed 6 reads 65%. Nobody is ever reliably good at anything. Whether to add a base, steepen the multiplier, or soften exhaustion at low totals is a REPORT for Erik and Aevi — three shapes priced, none applied, because SNG-280 forbids me choosing the number.",
  },
  {
    id: "SNG-344", ask: "(Aevi) neither is canon, and that's the actual answer — they're not duplicates. THE PAIR IS CANON",
    how: "canonPairing stamped in BOTH files; kind promoted to a closed vocabulary in rules_classification.json",
    gates: ["`kind` is a CLOSED vocabulary — a new value fails rather than silently exempting (SNG-344)",
            "344d: every crosswalk pointer RESOLVES — neither file names a record the other lacks",
            "344d: a braid displays its mechanical recipe's CURRENT name (forward link agrees)",
            "344d: …and the recipe's braidName matches the braid — THE REVERSE LINK IS CHECKED TOO",
            "344d: a pointer links records for the SAME PARTS, not merely the same name",
            "344d: alsoKnownAs is an ARRAY wherever present — never a comma-joined string",
            "344d: no name is listed as an alias of itself",
            "344d: no two braids share a display name",
            "344d: duplicate mechanical names do not GROW past the pair awaiting Erik's call"],
    note: "⛔ \"WHICH IS CANON\" HAD NO ANSWER AS ASKED. Zero ids in common and they key differently (parts:[a,b] vs braidKey \"a+b\"), so neither was a stale copy: braid_recipes (7, LOADED) is a NAMING table with no mechanics; combination_recipes (56, DARK) is a MECHANICAL table with effect/cannot/functions/domains. One names, the other resolves — so the live game can tell a player their braid is called Shatterlight and CANNOT TELL THEM WHAT IT DOES. Both stamped canonPairing so nobody asks again. ⚠️ RATIFYING IT SURFACED WHAT THE ID COMPARISON COULD NOT: ids were disjoint, but THREE OF THE SEVEN PAIRINGS ALREADY EXIST IN BOTH under different names — Undying Ledger = the_double_register, Shatterlight = the_sounding, The Hollowing Sight = the_counted_end. Comparing ids proves nothing about a table keyed on PARTS; the crosswalk is 3 naming collisions to resolve plus 4 blanks, not 7 blanks. ⛔ AND THE LESSON, WHICH IS THE DURABLE HALF: the old gate skipped any file whose `kind` wasn't \"rules\", and Aevi had authored `emergence`, `world_structure`, `social_mechanic_spec` — choosing descriptive words because they read better. Her words: \"a field I treated as a label was load-bearing for a gate, and MY ACCURACY IN NAMING A THING IS EXACTLY WHAT REMOVED IT FROM THE CHECK. That is oneWay from the other side: there I trusted authored text to DESCRIBE engine behaviour; here I authored text that CHANGED engine behaviour without knowing it did. IN A CONTENT-DRIVEN ENGINE THERE IS NO SUCH THING AS A PURELY DESCRIPTIVE FIELD.\" The vocabulary is now CLOSED — an invented word FAILS the build instead of silently exempting a file, verified by declaring kind=\"cosmological_note\" and watching it go red. ⚠️ THE CROSSWALK LANDED AND DRIFTED TWICE INSIDE AN HOUR, BOTH TIMES BY ITS OWN AUTHOR. Aevi renamed two recipes without updating the braid pointers, caught it, and added a write-time assertion — then her enforcement rule (\"a braid displays its mechanical recipe's name\") silently overwrote her own judgement call that Shatterlight beats \"The Sounding\", which she named as its own shape: an invariant enforced blindly will undo a decision it knows nothing about. ⛔ AND A THIRD INSTANCE SHE DID NOT SEE, because HER ASSERTION HAD A DIRECTION: she built pointers BOTH ways and checked one, so the reverse links kept the pre-rename names — `the_counted_end.braidName` still read \"The Counted End\" while the braid displayed \"Pale Reckoning\". A bidirectional crosswalk needs a bidirectional check. Also repaired: `alsoKnownAs` was a COMMA-JOINED STRING on three braids and absent on four, so `.map()` throws, `.length` counts characters, and the de-duplication her own fix depends on is undefined — now an array everywhere. ⚠️ ALL OF IT NOW GATES IN THE SUITE RATHER THAN THE AUTHORING TOOL: a write-time assertion protects the author who runs it, and cannot re-run when the OTHER file changes, which is exactly how a cross-file pointer goes stale. The two duplicate mechanical names (\"The Harbored Flame\", \"The Meaning-Engine\") are RATCHETED, not gated — which one keeps its name is Erik's content call, and a gate would force me to answer a question that is not mine.",
  },
  {
    id: "SNG-342", ask: "(Aevi) a ratchet: every file in provides.rules must have a loadRule call, or sit on a declared list with a one-line reason",
    how: "content/packs/core/rules_classification.json — the declaration; content_ci.mjs enforces it; smoke.mjs gates ARRIVAL",
    gates: ["every registered rules file is fetched, or DECLARED with a reason (SNG-342)",
            "…and each declaration carries a REASON, not just a name (SNG-342)",
            "342: a rule that loads must ARRIVE NON-EMPTY — a fallback is not a load"],
    note: "⚠️ THE OLD GATE REPORTED ONE ORPHAN WHILE TEN FILES WENT UNFETCHED. It skipped any file whose own `kind` wasn't \"rules\" — and `kind` is free text the author typed, so nine files opted out by declaring `emergence`, `world_structure`, `social_mechanic_spec`. Aevi: \"reference doc and forgotten wiring are indistinguishable from outside.\" They were indistinguishable from INSIDE too: the escape hatch was a string with no vocabulary behind it, and a COUNT (KNOWN_ORPHAN_RULES = 1) cannot tell you WHICH. ⛔ CLASSIFIED, NOT WIRED — Aevi's own constraint: \"a file wired without a consumer that wants it is the same failure with more steps.\" Four are permanent design canon, two are specs for unbuilt features, three already have consumers by another door. TWO ARE REAL GAPS and stay LOUD every run: martial_paths (baselineDefense is a mechanic no code honours) and combination_recipes (56 recipes parallel to the LOADED world/braid_recipes.json — which set is canon is a content decision, not mine). ⚠️ AND THE ARRIVAL GATE IS MY OWN REGRESSION, CAUGHT LATE: my SNG-331 resolver fix (exact filename, so `ties` stops matching `location_affiniTIES`) silently emptied emergence — there is no rules/emergence.json, the content lives in emergence_recipes.json, which only the substring matcher found. 21 recipes fell to a `{recipes: []}` fallback and every gate stayed green for ten versions, because every gate asked whether the file was declared, registered, and well-formed. NONE ASKED WHETHER THE CONTENT ARRIVED. A fallback is not a load; reachable is not arrived.",
  },
  {
    id: "SNG-343", ask: "(found in play by Erik) there are also slices cutting off text",
    how: "personalArc.js — both store-time caps removed; reconcile 26 flags what was already severed",
    gates: ["343: the fixture is long enough to have been cut by the old cap",
            "343: a long stage objective survives storage WHOLE — no cut, no ellipsis",
            "343: …and so does a long route",
            "343: nothing in the stored arc is exactly 200 characters ending mid-word",
            "343: the repair flags a severed string and leaves a legitimately-200 one alone",
            "343: the GM is told the text was cut and to restate it whole, rather than quote the fragment"],
    note: "⚠️ BOTH SLICES RAN AT STORE TIME, so the rest was never written down and no re-render brings it back — six severed strings in Splarf's live save, ending mid-word: 'it will be slow, inglorious, and m'. ⚠️ AND IT IS SNG-152 §5e's OWN BUG IN A FILE THAT SWEEP NEVER COVERED: same cut, same 200, same discovery route — a player read it on screen. Aevi's tell is the sharp part: every legitimate cap in this codebase carries a `// prose-cap-ok` marker for genuinely internal strings, and these two never did, because they are not internal — they are the quest the player reads. If length ever needs limiting it belongs at RENDER time, where it is reversible. ⛔ THE REPAIR CHOICE IS THE INTERESTING HALF. Three options existed: regenerate the quest, mark the fields incomplete, or leave them silent. REGENERATING WOULD REWRITE CANON THE PLAYER HAS ALREADY READ AND MAY HAVE ACTED ON — the quest they are halfway through would quietly become a different quest, which is a worse harm than a broken sentence. Silence was the worst. So it is flagged — and flagged TO THE GM, not to the player: a visible '[truncated]' says the game is broken and leaves the sentence just as broken, while a GM that knows the text is severed can finish the thought in play, which is the only route back to a whole quest that exists. ⚠️ GATED BEHAVIOURALLY, on the round trip through `sanitizePersonalArc`, not on a source pattern — a regex would prove a line was deleted, never that the text survives.",
  },
  {
    id: "SNG-341", ask: "it progressed basically 1 stage per beat… if you can learn, obtain, and deliver the required objectives in 3 beats it's not really a quest",
    how: "quests.js:stageRequirementsMet — requires[] is the gate; condition stays the player-facing sentence",
    gates: ["341: a stage with no requires[] is still satisfiable — old quests are not broken by a new rule",
            "341: obtain reads inventory · reach reads knownPlaces · speak reads the registry · learn reads the codex",
            "341: …and each REFUSES when the thing is not true",
            "341: deliver requires the item to be GONE and the recipient known",
            "341: a refusal NAMES what is missing rather than just saying no",
            "341: beats counts from when the stage became current, not from the quest's start",
            "341: an unknown requirement kind never blocks — forward-compatible with content we have not built",
            "341: a stage cannot be talked closed — evidence without the requirement is refused",
            "341: …and passes once the world actually agrees",
            "341: the GM prompt names what is STILL NEEDED, so a refusal becomes playable",
            "341: …and says nothing once the requirement is met — no noise on a stage that can close",
            "341b: quest_structure REACHES rules — registered was only one of four legs",
            "341b: the STAGE CHAIN law lands in the GM prompt — stage N+1 must need what stage N produced",
            "341b: the ROUTE REVEAL rule lands too, with the right/wrong examples that make it actionable",
            "341b: …and the quest LAW itself — if you cannot name the cost of ignoring it, it is not a quest",
            "341b: a missing quest_structure is silent, never a crash"],
    note: "⚠️ A STAGE HAD NO REQUIREMENT AT ALL. `condition` is prose and nothing ever parsed it, so a stage was complete when someone SAID it was — one narrative beat that gestured at the objective closed it, because there was nothing on the other side to disagree. Three beats finished a three-stage quest because the structure was never load-bearing. ⚠️ AND THE SCHEMA HAD PROMISED OTHERWISE: `condition`'s own description read 'ENGINE-TESTABLE: place reached / person spoken to / thing obtained' — a contract written and never implemented, the same shape as `oneWay` one ticket earlier. Corrected in place rather than left to mislead the next author. ⛔ `beats` IS SITUATIONAL AND MUST NOT BECOME THE DEFAULT (Erik: \"don't make beats a standard go-to\") — a floor applied everywhere is a TIMER, which makes a fast quest slow rather than making any quest denser; a thin stage is fixed by giving it a real requirement, never by making the player wait. It counts from when the STAGE became current, or a late stage inherits a debt it never incurred and opens already satisfied. ⛔ NO requires[] MEANS MET: every quest authored before this has none, and refusing them would break every live quest in every save to enforce a rule their content never agreed to. ⚠️ AND THE REFUSAL NAMES THE GAP, in the GM prompt as well as the return — a stage the engine silently keeps refusing is indistinguishable from a stuck quest, while 'the clerk still has not seen the filing' is a scene. ⛔ SNG-341b — AND THE PROMPT HALF IS WHAT MAKES THIS REAL: `requires[]` made stage dependency POSSIBLE, only the generated-quest prompt makes it HAPPEN, since three independent stages read as three errands even with a requirement on each. Aevi authored and registered `rules/quest_structure.json` — carrying the stageChain law ('each stage must need something the stage before it produced') and the routeReveal rule ('a route's LABEL may be visible; its REASONING may not') — and it reached nothing. The other three legs are now in: loaded, destructured in the SAME array, merged, and surfaced in gm.js where quests are made. Gated on the PROMPT CONTENT rather than on the merge, because a rule that reaches `rules` and not the model is the same bug one layer up.",
  },
  {
    id: "SNG-340", ask: "character creation backgrounds are MEANT to provide permanent aptitudes… remember repeatedly earned attributes stick around longer too",
    how: "playerprofile.js — provenance, reinforcement and one-way as three separate questions",
    gates: ["340: a BACKGROUND aptitude never fades, whatever the tendencies do",
            "340: …and it is never shown as FADING — a warning about something that will not happen",
            "340: an EARNED aptitude still fades on drift — that behaviour was right and is kept",
            "340: re-earning widens the keep-margin — the same drift loses it once, keeps it twice",
            "340: four earnings is permanence you EARNED, not inherited",
            "340: a one-way aptitude the world took is UNREACHABLE, even by a later grant",
            "340: the readout says WHY it is sticking — provenance, reinforcement, or gone for good"],
    note: "Aevi's model, and the framing is the whole value: durability is not one property but THREE questions `fadingAptitudes` had collapsed into one. ⛔ PROVENANCE — a background aptitude says where you came from, not who you currently are; you do not drift out of having been an orphan. ⚠️ REINFORCEMENT is Erik's addition and it is what makes this a model rather than an exception: provenance hands you permanence at creation, reinforcement is how you EARN it afterwards, so a thing you have come back to four times is who you are and the system agrees. ⛔ ONE-WAY IS NARROWER THAN IT READS — not 'never fades' but 'once faded, NEVER RE-EARNED', so it is enforced at the RE-EARNING gate and never at the fading one. ⚠️ THE PROVENANCE FIELD ALREADY EXISTED: `grantedAptitudes` has been written since SNG-113, labelled 'lineage provenance for the UI', and both decay functions ignored it — so this reuses what every save already carries instead of the new `aptitudeSource` map the spec asked for, and no migration is owed. ⚠️ AND THIS TICKET EXISTS BECAUSE OF A MIRRORED ERROR WORTH KEEPING: Aevi read the authored `oneWay` field and reported the behaviour it DESCRIBES as fact, in a spec, when nothing read it — the inverse of the reader-with-no-writer bug she had been catching all week, pointed the other way. Her own correction also stands: shadow (+6/−3) and naive (+5/−3) are both NET POSITIVE, zero of 40 backgrounds have a net-negative pair, and the training tables were the real gap.",
  },
  {
    id: "SNG-339", ask: "(Aevi, from Erik's play) a walking disaster — a -15 on a base 40 success is rough. A competent character attempting a routine task should usually succeed",
    how: "inventory.js:skillBonus/startingSkills/practiceSkill — training on the action-tag vocabulary the gear already uses",
    gates: ["339: training keys on the ACTION TAGS the game already has — not a ninth vocabulary",
            "339: an untrained character gets nothing, and says so without throwing",
            "339: the BEST training counts, never the sum of everything that touches the action",
            "339: …and it is capped, so no rank ladder outruns the curve",
            "339: it names what helped, so the receipt can say why",
            "339 §4: an untrained, unequipped character SEES both zero terms rather than two silent omissions",
            "339 §1: background and tradition both grant, and ranks add across them",
            "339 §1: …but the grant is CAPPED — creation makes you good, never finished",
            "339 §1: an unlisted background grants NOTHING rather than a guess",
            "339 §1: authoring notes in the table are not mistaken for skills",
            "339 §3: training is gainable in play — 25 uses is rank 1",
            "339 §3: …and it stops at maxRank, so practice never outruns the curve",
            "339b: an existing character is granted the training they came with, on next load",
            "339b: …and it never lowers a rank that play has already earned"],
    note: "Erik stopped Aevi proposing a flat +25 base — 'you are inventing a new system that we already have numbers and bonuses for' — and he was right. ⚠️ VERIFIED AND WORSE THAN THE SPEC: `character.skills` has no writer, and `action.skillId` has NO WRITER EITHER and no vocabulary was ever defined for it, so the skill term was not dormant but STRUCTURALLY UNREACHABLE — up to 10 points a rank that no character could ever hold, including Silas Weir at level 29. ⛔ ONE CORRECTION TO THE SPEC: `equipmentBonus` reads `character.INVENTORY`, not `equipped` — there is no equip step and the field she cites has no reader either. It DOES fire (measured: 5 points via Traveler's Pack on Silas). The real equipment gap is different and sharper: of 50 items minted in play across every save, ONE carries bonusTags (2%), against 21 of 33 authored (64%) — items born in the fiction are mechanically inert. ⛔ TRAINING KEYS ON THE ACTION TAGS THE GAME ALREADY HAS (53 of them authored across the item catalogue) rather than a ninth vocabulary, so a background's training and a trade's tools answer the same question in the same words. Best-skill-only, never the sum, or a broad character is strictly better than a deep one at everything. ⚠️ IT COUNTS USES, NOT SUCCESSES: rewarding only success makes the already-good better and leaves the struggling character exactly where this ticket found them. §4 IS THE ANTI-RECURRENCE: `add()` drops a zero-valued term, so a character with no training and no gear saw NO LINES for either — silence that reads as 'does not apply to me'. Both terms are now always shown. ⚠️ AND THE GRANT ONLY FIRED AT CREATION, WHICH REACHES NOBODY WHO ALREADY EXISTS — Erik asked for Splarf to stop failing and Splarf was made before the tables. Reconcile step 25 grants an existing character what creation would have given them, never lowering a rank play has already earned. Measured on Splarf (orphan + numinous): stealth/survival/focus/ritual at rank 1, and a stealth action goes 40% → 50%.",
  },
  {
    id: "SNG-335", ask: "add an option to save an image locally — that would preserve it even if the url vanishes",
    how: "art.js:imageFileName/imageExtFor + a Save control on the lightbox that writes to disk",
    gates: ["335: the file is named from the caption the player already read",
            "335: …and falls back to the KIND rather than to nothing",
            "335: a caption of pure punctuation still yields a usable name",
            "335: the extension follows the content-type, then the url, then png",
            "335: the download writes to disk and never inlines the image into the character"],
    note: "⛔ THIS IS THE ONLY THING THAT ACTUALLY PROTECTS THE PICTURE. Removing the gallery cap (SNG-332) keeps the ENTRY forever, but an entry is a URL — if the host expires it, the record survives and the image does not. A file on the player's own disk is outside anything this app can lose. ⛔ AND THE BYTES NEVER REACH THE SAVE: base64 in `character.gallery` would be ~1.3× the image per picture against a ~5MB localStorage budget that the save ALSO syncs to GitHub, so a handful of kept images would break SAVING — a far worse failure than a dead link. ⚠️ The filename is the whole value of a saved file (`image_47.png` in a downloads folder is junk), so it is built from the caption the player already read under the picture.",
  },
  {
    id: "SNG-332", ask: "remove the cap on images too — that's local storage and I don't want good ones dropping into thin air",
    how: "art.js — GALLERY_CAP is Infinity; capGallery keeps the smart-eviction rule for an explicit cap",
    gates: ["332: adding 600 images drops none — a record is not a log",
            "332: …and the smart eviction still works when a cap is asked for explicitly"],
    note: "⚠️ SAFE FOR A REASON WORTH MEASURING RATHER THAN ASSUMING: the gallery stores REMOTE URLS, not image bytes — across every save on disk, 125 entries, ZERO data-URIs, zero inline bytes. An entry is a few hundred bytes of metadata, so the cap of 240 was protecting ~100KB and costing a player their older art. ⛔ AND IT HAD ALREADY BEEN WRONG ONCE: 48 dropped art (Erik: 'I don't see the ones from before') and was raised to 240 — the same bug with a bigger number, waiting for a longer game. A limit that keeps having to be raised is a limit that should not exist; same shape as `knownPlaces`, a cap on a RECORD rather than on a log. ⛔ THE QuotaExceededError SEEN IN TEST OUTPUT IS NOT THIS: it comes from `preserveRecovery`, which is already guarded (prune first, write inside a try, evict harder and retry once, fail quietly) precisely because a safety net must never be the thing that breaks the app. The gallery was never the pressure.",
  },
  {
    id: "SNG-331", ask: "(found while wiring Erik's ties-as-facts request) rules.ties held the location-affinities table",
    how: "state.js:rulePath — match the FILENAME, never a substring of the path",
    gates: ["331: every merged rules key holds the CONTENT OF ITS OWN FILE, not a substring match",
            "331: `ties` resolves to ties.json — not to location_affinities.json, which contains it",
            "331: known substring collisions are declared, and none of them changes what loads"],
    note: "⛔ THE NASTIEST DOOR IN THE PromisedButUnread FAMILY SO FAR, and it is not an unread field — it is a READ PAST one. `rulePath` was `.find(r => r.includes(name))`, and `\"rules/location_affinities.json\".includes(\"ties\")` is TRUE — affini-TIES. location_affinities is registered earlier, so `loadRule(\"ties\")` returned it: registered ✓ loaded ✓ destructured into the right name ✓ merged ✓ — and it was THE WRONG FILE. Aevi reported `rules.ties` as authored-with-zero-consumers; the truth was worse, since the consumer would have read the wrong table. ⚠️ EVERY CHECK WE BUILT FOR THIS FAMILY ASKS WHETHER THE WIRING REACHES SOMETHING; NONE ASKED WHETHER IT REACHED THE RIGHT SOMETHING — `wiring_shape` counts names against entries and passed, and the name/entry pairing was in fact correct. The resolver is fixed rather than the filename, because any short name inside a longer one is the same trap waiting (`charges`/`surcharges`, `set`/`offset`). Found only because Erik asked for NPC kin to be saved as facts, which sent me to read a file I had never had reason to open.",
  },
  {
    id: "SNG-330", ask: "(found in PLAY by Erik) I was connected to the place I wanted to go, but no Travel button",
    how: "state.js:canTravelBetween — reachability is symmetric; placeEdges persists the player's own roads; reconcile 24 restores the lost ones",
    gates: ["330: an edge in EITHER direction is a road — the destination listing here is enough",
            "330: an unconnected place is still unreachable — symmetry is not permissiveness",
            "330: a player-made edge in `placeEdges` counts, in either direction",
            "330: the repair puts back the return road from what the save already asserts",
            "330: …and running it twice changes nothing",
            "330: the repair INVENTS no road — a save with no generated places gains no edges",
            "330b: knownPlaces has NO cap — knowledge a player earned is never evicted"],
    note: "Aevi's trace: the map read ONE array (here's own `connections`) and never asked whether the DESTINATION lists here. Harmless for authored content — all 118 authored locations are reciprocal — and fatal for minted ones, because `mintTransitLocation` writes both edges but only one can persist: `new → here` lives on `generated.location`, while `here → new` mutates AUTHORED content, which is shared and never saved. After a reload the place was on the map, in knownPlaces, remembered by the fiction, and missing from the one array the button reads. ⛔ THE SYMMETRIC READ IS THE REAL FIX AND `placeEdges` IS THE BELT: making the READ symmetric renders the whole class of one-directional edge harmless including ones nobody has thought of, and persisting the player's own roads repairs what was already lost. ⚠️ TWO READ SITES, NOT ONE — the defect named app.js:6645 and there was a second at 6620 doing the same thing. ⚠️ AND A SECOND BUG FOUND ALONGSIDE IT, worse than reported: the `knownPlaces` cap was 80 against an atlas Aevi had just grown to 118, so a well-travelled character SILENTLY FORGOT the oldest place they knew — and `isKnown` gates naming, description and map labelling, so somewhere from their first hour became 'an unknown place' again. Forgetting where you started is the worst possible eviction order.",
  },
  {
    id: "SNG-329", ask: "(found in PLAY by Erik, first real play-leg) the current location renders [object Object]",
    how: "state.js:locationRefToString + a mint that refuses, and reconcile step 23 for the saves already carrying it",
    gates: ["329: a nested `{location:{id}}` yields the id, not the text of an object",
            "329: an unnameable reference returns NULL — never the string '[object Object]'",
            "329: the artefact is caught in BOTH spellings — title-cased on disk, lowercase in fresh JS",
            "329: the repair check is narrower than the mint check — a nameless record is NOT deleted",
            "329: the repair drops the artefact, keeps real places, and leaves a nameless one alone",
            "329: …and it does not strand the player inside the place it just removed",
            "329: running the repair twice changes nothing",
            "329b: the ONLY write to generated.location lives inside the guard, not merely exists once",
            "329b: the guard does not recurse into itself",
            "329: no shipped save carries a place minted from a coerced object"],
    note: "⚠️ THE FIRST DEFECT FOUND IN REAL PLAY, and it had been landing corrupt records for longer than the session that found it. `moveTo.location` may itself be an OBJECT; `String(ref)` made it the literal text '[object Object]', slugged it to `gen-object-object`, TITLE-CASED it to '[Object Object]', and MINTED IT INTO THE SAVE — persisting, reloading, and feeding its own descriptionSeed back to the GM as context. THREE saves carried it (Splarf, Silas Weir, Cellaceron — two older than the play session), and Splarf was STANDING IN IT: `currentLocationId: 'gen-object-object'`, which is the header Erik was looking at. ⛔ THE TITLE-CASING IS WHY NO GATE CAUGHT IT: '[Object Object]' is a well-formed string with capitals and spaces, so every 'does it have a name' check passed it and it reads like a place — my own first detector scanned for the lowercase form and reported ZERO corrupt records across all three. ⛔ AEVI'S FRAMING IS THE FIX: a mint is a WRITE TO THE SAVE, so it must be the strictest gate in a deliberately permissive path, not the loosest. ⚠️ AND THE SUITE NARROWED THE REPAIR FOR ME: my first migration used the mint's wide check (which also catches a MISSING name) and deleted a legitimate SNG-216 fixture. Reconcile's own law is 'never removes or downgrades', so a migration that deletes must be scoped to exactly the damage — the artefact was never a real place and has nothing to restore; a nameless record is a different defect with a non-destructive fix.",
  },
  {
    id: "SNG-311", ask: "if you get marked for a strike, you can also be chosen as warranting a guardian, or several… plus it gives a lot of use of the various hiding and warding skills",
    how: "worldtick.js:guardiansFor — the retrieval rule pointed at the living, surfaced to the GM",
    gates: ["311: an unmarked player draws no guardian at all",
            "311: a guardian is someone who SHARES the fight the strike is about — never a stranger",
            "311: the highest rung comes first — a legend standing still for you is the expensive version",
            "311: the cost is NAMED — a guardian is a front somebody is not pushing",
            "311: marked with nobody who shares it reports the ABSENCE, not null",
            "311: the dead do not guard — effectiveEpicStatus is the same gate the rest of the world uses"],
    note: "⛔ THE SYMMETRY WAS ALREADY IN THE MODEL AND THE PLAYER WAS THE ONE EXCEPTION: a marked FIGURE has drawn a guard since SNG-270 (`guardIntercept`, weight 3, 'standing still is its own cost'), and the player was the only marked party nobody could stand over. Closed with the rule the valley already runs on rather than a new one — `attemptRetrievals` picks who goes into the dark for you by 'someone who stood on the same side of something', highest rung first, and a guardian is that same sentence pointed at the living. That is what stops a guardian ever being a stranger the engine invented. ⚠️ 'VERY VIP' IS ARITHMETIC, NOT FLAVOUR: highest rung first means a legend standing still for you costs what a legend standing still always costs — they hold two fronts and one of them is now you. ⛔ AND IT IS NOT SAFETY. The cost line is load-bearing and the GM block says so twice: a player who accepts a guardian is SPENDING SOMEONE. An absence is reported as a situation rather than a blank, so the GM plays the emptiness instead of quietly manufacturing a rescuer — which is where Erik's hiding and warding skills come in, in a scene the player plays rather than a roll the world makes. ⛔ LIKE SNG-310 IT RESOLVES NOTHING: it says who put themselves in the way, never whether they were in time.",
  },
  {
    id: "SNG-310", ask: "yes the player can be struck, but that event is a GM narrated encounter. The fact that someone is out to get you triggers it though",
    how: "worldtick.js:threatToPlayer — the world engine MARKS; gm.js narrates",
    gates: ["310: a strike aimed at the PLAYER is recorded, never resolved — the engine marks, the GM narrates",
            "310: an unmarked player has no threat at all — silence, not an empty object",
            "310: a CRUSADE against the player names its sender — being told is what a crusade IS",
            "310: a QUIET strike is counted but names nobody — they learn it when it arrives",
            "310: the seed is an ASSASSIN — finishing you was the errand, and the ladder knows what that costs",
            "310: …and the seed is WARNED — a band that forces a label and a Decline into the offer",
            "310: a resolved threat clears — nobody is hunted forever by a closed errand"],
    note: "Aevi's open question from the third-action spec, closed by Erik: the back line this system models includes a party's own healer. ⛔ THE LOAD-BEARING RULE IS THAT THE ENGINE MARKS AND NEVER RESOLVES — every other strike settles offscreen through resolveEpicClash because both parties are offscreen; one aimed at the PLAYER cannot, because resolving it would decide a fight the player was never in. That is Design Law 1, and it is the difference between 'the world can reach you' and 'the world plays you'. The player joins the defending side's WORKING pool for mark selection ONLY — never `living`, never `leaning` — so standing on a front makes them reachable without the offscreen world deciding anything else about them. ⚠️ THE TWO KINDS DIVERGE HERE AND IT FALLS OUT OF THE MODEL RATHER THAN BEING WRITTEN FOR THE PLAYER: a crusade is DECLARED so its sender may be named; a quiet strike is not, so the GM knows and the player does not. Everything that makes it cost something already existed — `aggressorKind: assassin` is the highest slain weight in the incapacitation table, the `grave` band forces a warning and a Decline into the offer, and the death ladder catches them after. ⚠️ THE RATCHET CAUGHT IT MID-BUILD: `threatToPlayer` was exported with no consumer, which would have left the sharpest consequence in the game as a field nobody reads. It lands in the GM prompt now, and the registry's own gate proves it.",
  },
  {
    id: "SNG-309", ask: "there is a way to die… make sure all the encounters could get you killed. We need an incapacitation system — you wake up and the aggressor is gone with your gear, your companion revives you, you were slain by an assassin, but your party was able to bring you back to life after 27 days",
    how: "engine/incapacitation.js — health<=0 is an INCAPACITATION with an outcome; a slain player enters the same death.js ladder as any figure",
    gates: ["309: every kind of aggressor can kill you — no zero in the slain column",
            "309: an assassin kills far more often than someone who came to win a duel",
            "309: a declared-lethal encounter is deadlier than the same fight undeclared",
            "309: with nobody there, `revived` is impossible — not merely unlikely",
            "309: a companion who can reach you is what makes waking up likely",
            "309: …and the revival names WHO, so the narration is about a person",
            "309: waking where you fell costs you gear; being revived does not",
            "309: a slain player enters the SAME death state as any figure — a depth, not a boolean",
            "309: an assassin who hid the body starts you deeper than falling in front of your own party",
            "309: your party can still reach you 27 days later",
            "309: and the CLOCK is what closes that road — days alone never do, the deepening pass does",
            "309: a retrievable death does NOT end the story; a sealed one does",
            "309: …and the roster line says WHERE they are, not just that they fell"],
    note: "⚠️ ERIK WAS RIGHT AND I HAD REPORTED THE OPPOSITE. I said 'the engine never kills a player', quoting encounters.js line 6 — which describes the DEFAULT, not the rule: app.js has always set `character.dead = true` on a `lethal` def. What was true is that death was almost UNREACHABLE — 2 of 19 encounter defs lethal, 0 of 96 random encounters, 0 of 7 bestiary — so a player could be killed by a wild boar or a greatcat and by nothing else in the game. The mechanism existed; the coverage was two animals. AND IT WAS A TERMINUS: `character.dead` makes the roster say 'their story is over' and refuse to load, contradicting death.js's own model (death is a STATE at a DEPTH with a road back) whose header names 'player-death UX' as the deferred ROUND 2 piece. ⛔ SNG-280: weights key on INTENT, never morality — a heroic and an abyssal duelist behave identically because a duel is a duel. ⚠️ TWO REAL BUGS FOUND BY GATES THAT ASSERTED A POSITIVE: (1) the player's death was stamped with `character.clock.day` while `deepenDeaths` runs on `absoluteWorldDay` — two different clocks subtracted from each other, the same units trap as stepping a harness by hours; (2) the deepening pass walked the roster and the NPC registry and stopped, so a dead player would never sink and never seal — permanently retrievable, and 'your party can still come' would have raced nothing.",
  },
  {
    id: "SNG-306", ask: "striking isn't just about the back line — between arc pushes there are ever present assassination risks, duel to the death challenges etc. we can use these to keep the Mythicals under control",
    how: "worldtick.js:planChallenge — standing high draws challengers, resolved through the one injury model",
    gates: ["306: a rung with rate 0 is never called out — the ceiling is a dial, not a constant",
            "306: the challenger comes from BELOW — someone with something to gain",
            "306: …but not from FAR below — a riffraff does not call out a mythic",
            "306: prominence draws the challenge, not merit — a saint and a horror at the same rung are equal"],
    note: "THE LADDER HAD A FLOOR AND NO CEILING: deeds only accumulated, and the only way down was to stop caring entirely, so mythics went 1.0 → 1.8 → 13.5 → 20.3 across 1/2/4/8 world-years. Erik's shape beats a decay term because it is a STORY — standing high is what draws people who want what you have. ⛔ SNG-280: the rate is keyed to the RUNG and nothing else; a mythic of the Maw and a mythic who has mended the same wall for forty years are called out identically, and the gate proves it by rate-testing a saint against a horror. TUNED TO ERIK'S TARGET ('1/4 the traditions should have a mythic in play'): at the authored rates, 7.3 of 27 traditions hold a living mythic against a target of 6.8 — see `node tests/world_presets.mjs target`.",
  },
  {
    id: "SNG-306b", ask: "the successors have home lands — it's just that the MOMENT mints them in the game",
    how: "worldtick.js — both death-mints survive, and both carry where the figure is FROM",
    gates: ["306b: a bloody world still mints — the probe reaches the code under test",
            "306b: the moment mints them — BOTH the survivor and the successor are born into the story",
            "306b: every figure the world mints from a death has a homeland — nobody comes from nowhere",
            "306b: …and the origin line SAYS where, so a narrator can tell it without inventing one",
            "306b: a survivor's origin names WHAT they survived — never the ambiguous 'walked away from it'"],
    note: "⚠️ I GATED THE WRONG THING FIRST AND ERIK CAUGHT IT. Reading 'they don't come from the field they died in' as 'delete the battlefield mint', I cut `casualty_survivor` and wrote a gate asserting it was gone — the opposite of the requirement, and a green gate that would have locked the mistake in. His correction: 'I didn't mean that no one is minted in the battle — they should be. I meant the successors have home lands; it's just that the MOMENT mints them.' MINTING IS WHEN SOMEBODY ENTERS THE STORY, NOT WHEN THEY COME INTO EXISTENCE. Both mints restored, both now carry a homeland. ⚠️ AND TWO REAL BUGS FELL OUT OF ASSERTING A POSITIVE: `casualties[].loser` is an ID, not a name — my `c.loserId` read a field that does not exist, so every battlefield death resolved to no origin (caught by the homeland gate, which an absence-check could never have caught), and the same slip had been printing raw ids into epithets ('the one who outlived sister_alder') since the mint was written. ⛔ TRADITION IS STANDING IN FOR HOME AND THAT IS A STOPGAP: `homeLocation` is the right key, authored on 5 of 66 with 1 of 6 values resolving to a real location. ⛔ POPULATION SIZE IS A SEPARATE QUESTION WITH ITS OWN DIAL (`mintRate`) — conflating 'where are they from' with 'how many are there' is what produced the over-correction.",
  },
  {
    id: "SNG-304", ask: "a streak of holding could give an edge… something that builds to a point. It would get dropped down if interrupted",
    how: "worldtick.js — careHeld streaks, holdEdge on push, and the heldTheLine deed",
    gates: ["304: a hold builds an edge, and it BUILDS TO A POINT",
            "304: the cap and the per-pass edge are content dials, not constants",
            "304: being DRIVEN OFF halves the hold — it does not wipe it",
            "304: halving an unknown figure is a no-op, not a crash",
            "304: a wound halves the loser's hold; a stalemate drove nobody anywhere and does not",
            "304: holding pays a DEED at all — the ledger had six combat sources and one for sacrifice",
            "304: a hold pays ONCE by default — Aevi's spec, not the stronger reading of it",
            "304: …and `deedRepeats` turns the repeating version back on",
            "304: a zero or negative streak never pays"],
    note: "Aevi's diagnosis: the deed ledger had seven sources, six combat-shaped, and the only non-combat one paid for SACRIFICE (holding on a pass that cost you your own time), never for work — 'the ledger rewarded the amplifier and ignored the engine'. This is SNG-300's open finding closed by content, and it CLOSES THE GAP: measured 2026-08-05 over 4 worlds × 4 world-years, mean rise rate is 58% for traditions that seek fights and 56% for those that rarely do, against SNG-300's marcher 50% / stillhold 8%. Stillhold specifically went 8% → 58%. ⛔ SNG-280 CHECK PASSED: every tradition earns it — the top earners span threnodist (0.6) to abyssal (1.5) — because it rewards CONSTANCY, which is available to everyone and characteristic of nobody. ⚠️ I BUILT THE STRONGER READING FIRST and measured it rather than shipping it: paying every 5 passes instead of once made heldTheLine 41% of all deed credits against arcContestWon's 11% and pushed every tradition to a 78% rise rate, because a 185-pass hold pays 37 times. The default is Aevi's spec as written; `deedRepeats` is the dial. ⛔ REACHABILITY IS REPORT-VERIFIED, NOT GATED — `node tests/holding_effect.mjs` is what proves the streak actually reaches its threshold in a live world; the gates prove the arithmetic and the dial.",
  },
  {
    id: "SNG-303b", ask: "the third action — reconcile what was built against the staged spec",
    how: "worldtick.js:planStrike + currentCares — the two kinds, their two prices, and the disposition that decides who does which",
    gates: ["303b: a tradition with strikes disposition 0 sends nobody",
            "303b: a crusade fires ONLY on the arc the crusader most wants (offence is distance from what you want)",
            "303b: an unauthored tradition is QUIET — the shipped behaviour, not an invented crusade",
            "303c: the AUTHORED strike kinds reach the engine — both shape and path",
            "303c: kind→[traditions] and tradition→kind both normalize to the same answer",
            "303c: authoring notes (_note, _reasoning) are not mistaken for traditions",
            "303c: an `either` tradition DECLARES over the arc it most wants and goes quiet elsewhere",
            "303c: the coverage report AGREES with the reader — no crusader claim while crusades fire",
            "303b: a DECLARED crusade is easier to intercept than a knife nobody knew about",
            "303b: an EXPOSED figure is preferred as a mark — a failed quiet strike identifies you",
            "303b: a crusader's cares collapse to the one arc — every other front becomes a vacated seat",
            "303b: a malformed crusade record does NOT silently replace a figure's real cares"],
    note: "⚠️ THE RECONCILE FOUND FOUR DIVERGENCES AND THE FIRST INVERTED THE MECHANIC'S PURPOSE. The striker was drawn from the ENGAGED pool, so a figure fought a duel AND sent a knife in the same pass — the 'MUST NOT BE FREE' the spec warns about — and a side had to HAVE someone in the melee to strike at all, which locked umbral/veilwright/stillhold (engage 0.4/0.4/0.15) out of the mechanic built to give them a role, while the marchers who already dominated the fighting got it as a free extra action. Also: `strikes` disposition existed only in the spec, only one of the two kinds was built, and neither cost existed. ⛔ SNG-280: 'the most hated worker' is built as POSITION, not merit — a crusade fires only on the crusader's own `wantArcId`, so offence is distance from what you want and every tradition can feel it. ⚠️ SNG-303c — AEVI AUTHORED BOTH TABLES AND THE ENGINE STILL COULD NOT READ THE KINDS: she wrote `{quiet:[...], crusade:[...], either:[...]}` at `arcResponse.kindByTradition` while this module read `{tradition: 'quiet'}` at `arcResponse.strikes.kindByTradition` — a miss on BOTH path and shape, and the fifth writer/reader failure of the week. THE READER MOVED, because her shape is the better one: a list-per-kind is how a person writes this, and it expresses `either` (a tradition that does both), which a tradition→kind map cannot say at all. `either` resolves by circumstance rather than a coin — they DECLARE over the arc they most want and go quiet elsewhere. Live: 8 quiet · 8 crusade · 11 either. ⛔ SUPERSEDED NOTE: `byTradition` and `kindByTradition` were both empty, so every tradition strikes alike and every strike is quiet — `strikeCoverage()` reports it and the crusade path is unreachable until Aevi authors the lists.",
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
            "272/273: an effect kind with NO consumer is declared, not left looking live",
            "272/273: the inert flag reads the consumer register rather than naming a kind",
            "272/302: priceShift now HAS a consumer, and the register says so"],
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
    id: "SNG-300", ask: "we probably need to tweak who fights and how",
    how: "worldtick.js:engageOf — the engaged/working split is a per-figure roll against a tradition-keyed disposition",
    gates: ["272/300: engagement is a property of the FIGURE, not a quota on the side",
            "272/300: it is keyed on tradition, and the table is authored",
            "272/300: engagement is DIFFERENTIATED — the table is not flat",
            "272/300: nobody is guaranteed to never fight, and nobody fights every pass",
            "272/300: an unlisted tradition is unchanged, not penalised"],
    note: "⚠️ AND THE GATE ITSELF HAD TO CHANGE, WHICH IS THE LESSON: it asserted `marcher > stillhold * 5` — a TUNING VALUE, with two traditions named by hand — so when Erik overturned the design (stillhold 0.15 → 1.1) a gate went RED FOR THE RIGHT CHANGE. A gate that defends yesterday's numbers against today's decision creates pressure to weaken the check rather than to think. It now asserts the INVARIANT it was really guarding — the table is DIFFERENTIATED, not flat — which survives any retuning and names no tradition. ⛔ Aevi proposed `hi >= lo * 1.35`, right and kept, but a ratio alone PASSES on 27 traditions at 1.0 with one outlier at 1.4; the distinct-value count is what actually measures differentiation. The same class was in one of mine (`DEED_WEIGHTS.heldTheLine === 3`), now asserted as the RELATIONSHIP it stands for: holding pays what a contest won pays. ⚠️ MEASURED AGAINST DIRECTIVE SNG-280’S OWN TEST, and it found something: over 4 worlds × 12 world-years, marcher (1.8) figures rose 50% of the time and stillhold (0.15) 8%. The engagement numbers describe METHOD rather than merit, as ratified — but the DEED TABLE is contest-weighted (five of seven sources need a fight, and `stageMoved` now requires WINNING one), so a peaceful tradition earns more slowly on the ladder. Not a clean lockout (veilwright at 0.4 rose 38%, above blazeborn at 1.3), and reported rather than tuned: the fix would be a deed source a peaceful figure can actually earn, which is content.",
  },
  {
    id: "SNG-302", ask: "I want the value and money economy implemented",
    how: "engine/economy.js — price = worthBand × need × scarcity, with priceShift moving the local need",
    gates: ["272/302: the economy is registered, loaded AND destructured from the right Promise.all",
            "272/302: `need: none` is a HARD ZERO however scarce the thing is",
            "272/302: scarcity MODULATES an existing need, it never creates one",
            "272/302: an irreplaceable item is REFUSED a price rather than given a big one",
            "272/302: a priceShift from an arc stage MOVES the local need",
            "272/302: …and it cannot push need below none or above high",
            "272/302: a shift for OTHER goods does not touch this item",
            "272/302: the unreachable second axis is REPORTED rather than passing as a working price",
            "302b: the REAL loadContent() completes without throwing",
            "302b: …and returns a world with content in it (a silent empty load is also a failure)"],
    note: "Closes the last 2.0.0 row: `priceShift` had no consumer because no module could compute a price. ⚠️ Aevi registered AND loaded the economy and it STILL did not reach `rules` — `economyRule` was destructured from the first Promise.all while `loadRule(‘economy’)` sat in the second, thirty lines down, so the name resolved to undefined. A third distinct way for this same wiring to be half-done, and the one positional destructuring makes silent. ⚠️ SECOND AXIS NOT LIVE: 30/30 items carry a worth band, 0/30 carry a goods category, so no region table can be reached and price collapses to the band. Declared in `economyCoverage` and reported by `npm run coverage` rather than passing as a working local price.",
  },
  {
    id: "SNG-303", ask: "seems like the ways to wire code correctly needs to be documented and followed",
    how: "SYSTEM_SPEC §4e writes the procedure down; tests/wiring_shape.mjs makes the one step prose cannot enforce checkable",
    gates: ["303: every Promise.all destructure pairs 1:1 with its awaited entries",
            "303: the checker goes RED on a planted extra entry (a gate that cannot fail is not a gate)",
            "303: a preceding for-of destructure does not fool it into a false alarm"],
    note: "⚠️ THE SAME SIX LINES OF CONTENT WIRING HAVE FAILED THREE DISTINCT WAYS: not registered (encounters.json existed for weeks and every encounter paid ZERO XP), registered but never loaded (Aevi's economy — which the existing check caught in under a minute), and destructured from the WRONG Promise.all. Only the first two are catchable by reading, because positional destructuring HAS NO NAMES IN IT: the array and the name list are paired by counting, and nothing in the source records the intended pairing. So the procedure is written down for the steps a person can follow, and the counting step is a gate. ⛔ DELIBERATELY NOT CHECKED: whether each name is bound to the RIGHT entry — the source does not record that intent, so any such check would be guessing. The count is the knowable part and it is the part that caught the real bug.",
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
  // ⚠️ SNG-342: this used to run smoke.mjs ALONE, so no requirement could cite a content_ci gate — and
  // content_ci is where the CONTENT-INTEGRITY gates live (orphaned files, dead keys, unread manifests).
  // A requirement whose verification lived there had to either move its gate or go unclaimed. Both files
  // now feed the ledger; both exit non-zero on failure, so a non-zero exit is expected data, not an error.
  const parts = [];
  for (const f of ["tests/smoke.mjs", "tests/content_ci.mjs"]) {
    try { parts.push(execFileSync(process.execPath, [join(root, f)], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 })); }
    catch (e) { parts.push(String(e.stdout || "")); }
  }
  return parts.join("\n");
}

const out = runSuite();
const lines = out.split(/\r?\n/);
const results = new Map();   // check name → "PASS" | "FAIL"
for (const l of lines) {
  // ⚠️ TWO DIALECTS. smoke.mjs prints "PASS"/"FAIL"; content_ci.mjs prints "ok"/"FAIL" — reading only the
  // first is how a content_ci gate reads as MISSING rather than green, which is a false alarm in the exact
  // shape of a real one. Normalize at the door so a requirement can cite a gate in either file.
  const m = /^(PASS|FAIL|ok)\s{2}(.+)$/.exec(l);
  if (m) results.set(m[2].trim(), m[1] === "ok" ? "PASS" : m[1]);
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
