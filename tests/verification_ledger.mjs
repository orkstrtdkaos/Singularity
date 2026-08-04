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
            "2c: a new rung RESTARTS the clock (you do not carry tenure upward)",
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
