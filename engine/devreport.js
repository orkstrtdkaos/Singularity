// devreport.js — ⛔ THE PLAY/DEV INSTRUMENT: WHAT PLAY ALREADY KNOWS, COLLECTED AND SENT WHERE IT CAN BE READ.
//
// ⛑ ERIK, 2026-09-13: "make them a robust Play/Dev that generates the data you would need to find and fix anything that is
// misfiring or not wired along the way" — and then, decisively: "I don't want to have to copy and paste anything... so make
// it so the outputs go back to the repo for you to read as needed."
//
// ⛔ THE DESIGN COMES STRAIGHT FROM ONE DAY'S BUGS, AND THEY ALL HAVE THE SAME SHAPE: every one was a WIRING FACT THE
// RUNNING GAME ALREADY KNEW AND NOBODY COLLECTED.
//
//   `moveTo 20 ✓0`           an outcome badge wired on one branch, so its number could never rise
//   `companionOps`           an op the model invented; silently discarded, and the player told it worked
//   ops inside the narration a reply that parsed, with its ops trapped in a string
//   "Done." with no op       a claim nothing checked
//   `pendingCompanyOffers`   written every time, read by nothing — and company.js had SAID SO since SNG-390
//   `partyOps` 3/369         a real op with no prose block, so the model never reached for it
//   `age` 0/53, `sex` 6/54   gates whose answers nobody ever collected
//
// ⚠️ NOT ONE of those needed a new measurement to be DETECTABLE. They needed someone to look. This looks, every session,
// and writes the answer to a file in the repo — so the loop is: Erik plays, the file lands, I read it with git.
//
// ⛔ IT IS A SEPARATE FILE FROM THE SAVE, ON PURPOSE. The character record is 1.38MB and every write uploads all of it
// (SNG-550); telemetry is counts, not content, and it must never become another reason that file grows. It is also
// DEV-ONLY at the writer, so a player build produces nothing and sends nothing.

/** Every top-level turn key the engine actually dispatches. ⚠️ Passed IN rather than imported, so this module never
 *  becomes a second copy of the vocabulary — `SALVAGEABLE_OPS` plus the few non-salvageable ones remains the one list. */
export function unknownOpsIn(turn, vocabulary) {
  if (!turn || typeof turn !== "object") return [];
  const known = vocabulary instanceof Set ? vocabulary : new Set(vocabulary || []);
  const out = [];
  for (const [k, v] of Object.entries(turn)) {
    if (k.startsWith("_") || known.has(k)) continue;
    if (v == null) continue;
    if (Array.isArray(v) && !v.length) continue;
    if (typeof v === "object" && !Array.isArray(v) && !Object.keys(v).length) continue;
    out.push(k);
  }
  return out;
}

/** ⛔ HOW MANY RECORDS ACTUALLY CARRY EACH FIELD. This is the census that would have made "age 0 of 53" and
 *  "sex 6 of 54" visible the day those gates were written, instead of the day a minor reached a romance track.
 *  ⚠️ A gate whose answer nobody collects is not a gate, it is a wall — and this is how you see the wall. */
export function fieldCoverage(records, fields) {
  const rows = Object.values(records || {}).filter(r => r && typeof r === "object");
  const out = { n: rows.length, fields: {} };
  for (const f of fields) {
    out.fields[f] = rows.filter(r => {
      const v = r[f];
      if (v == null || v === "") return false;
      if (Array.isArray(v)) return v.length > 0;
      if (typeof v === "object") return Object.keys(v).length > 0;
      return true;
    }).length;
  }
  return out;
}

/** The whole report, derived from the save plus the small tallies play keeps. Pure — no I/O, no globals,
 *  so the suite can build one from a fixture and assert its shape without a browser or a network. */
export function buildDevReport(character, { build = null, vocabulary = [], promptRows = null, contentCounts = null, field = null } = {}) {
  const c = character || {};
  // ⛔ SNG-547 O5: a dropped axis is a CONTRACT failure — the model answered the shape wrongly and the turn
  // read as clean. It belongs beside the op-emission counts, which is the other place this report says "the
  // machinery ran and something the machinery needed never arrived."
  const axesDropped = Array.isArray(c._axesDropped) ? c._axesDropped.slice(-20) : [];
  const handoverRefused = Array.isArray(c._handoverRefused) ? c._handoverRefused.slice(-20) : [];
  const emitted = c._opEmitted || {};
  const ledger = c._opLedger || {};
  const turns = c._opTurns || 0;
  const known = [...new Set(vocabulary)];

  // ⛔ NEVER EMITTED IN N TURNS is the signature that matters — a built op the model never reaches. It is only
  // meaningful against a denominator, so the denominator travels with it and a 0-turn character says nothing.
  const never = known.filter(op => !(emitted[op] > 0)).sort();

  // ⚠️ OUTCOMES ARE INSTRUMENTED FOR A HANDFUL OF OPS, and the report must not imply otherwise: an op with no
  // ledger row is UNMEASURED, which is a different fact from "applied zero times" (SNG-551's false zero).
  const outcomes = {};
  for (const [op, row] of Object.entries(ledger)) {
    if (op.startsWith("_")) continue;
    outcomes[op] = { applied: row.applied || 0, rejected: row.rejected || 0, lastWhy: row.lastWhy || null,
      // the two counters do not share a start (SNG-179 vs SNG-190), so say when they cannot be compared
      exceedsEmissions: ((row.applied || 0) + (row.rejected || 0)) > (emitted[op] || 0) };
  }

  return {
    schemaVersion: 1,
    id: "dev_report",
    at: new Date().toISOString(),
    build,
    // ⛔ CCODE-457 — WHAT THE GROUND UNDER THE PLAYER IS MADE OF, read off the one field evaluator. null when the
    // world's numbers are not loaded this session, which is a different fact from "the ground is empty here".
    field,
    character: { id: c.id || null, name: c.name || null, playerKey: c.playerKey || null, level: c.level ?? null,
      rev: c.rev ?? null, day: c.clock?.day ?? null, turns,
      // ⛔ SNG-560: WHEN THE COUNTING STARTED. Without it every zero in this report is ambiguous — "never happened" and
      // "never happened since we began looking" are different findings, and only one of them is a defect. A save older
      // than the counter says so here, and `countsCoverWholeLife` is the flag that makes a zero safe to act on.
      countingSince: c._opCountingSince || null,
      countsCoverWholeLife: !!c._opCountingSince && !!c.createdAt && c._opCountingSince <= c.createdAt },
    // ⛔ SNG-547 O5: the contract failures nobody heard. A dropped axis means the model answered the SHAPE
    // wrongly — `{"axes": {"spectrumId": "mechanical_spiritual"}}`, the placeholder returned literally — and
    // the turn still read as clean, because the guard that kept the dice safe said nothing on its way past.
    // ⛔ SNG-578: and the hand-overs that were ASKED FOR and refused. ⚠️ Without this, `carries: 0` reads as
    // "the GM never tries" when it may equally be "the GM tries and the engine says no" — and those two call
    // for opposite fixes: a sharper directive, or a repair.
    contract: { axesDropped, axesDroppedN: axesDropped.length,
      handoverRefused, handoverRefusedN: handoverRefused.length },
    ops: {
      emitted, outcomes, never,
      neverCount: never.length,
      knownCount: known.length,
      // ⛔ AN OP THE MODEL INVENTED. `companionOps` was discarded in silence while the player was told it worked;
      // a name here is either a missing op or a contract that cannot be found, and both are worth knowing.
      unknown: c._opUnknown || {},
      // ⚠️ OPS FILED IN THE PROSE — recovered now (SNG-557), and still a defect worth counting: it means the
      // contract's shape did not reach the model on that turn.
      inProse: c._opInProse || {},
      emptyClaims: (ledger._emptyClaim?.rejected) || 0,
    },
    // ⛑ THE GATES, AND WHETHER ANYONE HAS ANSWERED THEM.
    coverage: {
      // ⚡ SNG-562 — THE SUB-FIELD PATTERN, WHICH IS WHY THESE ARE THE FIELDS COUNTED. Measured across 41 people on a
      // level-33 save: plain strings 93%, string arrays 63-85%, enums 7-15%, and the two that take a NESTED OBJECT
      // (`deed`, `carries` -> `inventory`) EXACTLY ZERO, though both are wired end to end and read back into the prompt.
      // ⚠️ `inventory` is the R45c BEARER RECORD, the other end of `carries`; without it in this list the only evidence
      // for whether the contract change worked would be me asking again.
      npcRegistry: fieldCoverage(c.npcRegistry, ["age", "sex", "gender", "pronouns", "role", "description",
        "bondType", "relationship", "status", "knownFacts", "skillsObserved", "deeds", "domains", "inventory"]),
      inventory: fieldCoverage(Object.fromEntries((c.inventory || []).map((it, i) => [it?.id || i, it])), ["customName", "aliases", "kind", "description"]),
    },
    // ⛔ WHICH PROMPT ROWS EVER FIRE. A row that never produces content is a block the GM has never once been
    // told — the prompt-side twin of an op that never fires, and just as invisible without a count.
    // ⛑ SNG-560: what happened the last time the never-fired ops were given an occasion. A verdict of `no-op` is the
    // `pendingCompanyOffers` shape — an op that applies cleanly and writes nothing — and `threw` is a live defect.
    fireTests: c._fireTests || null,
    promptRows: promptRows || null,
    world: contentCounts || null,
  };
}
