// engine/undeath.js — SYSTEM_SPEC §48: UNDEATH, the model Erik ratified 2026-08-24.
//
// ⛔ IT IS NOT A TRADITION. IT IS A POPULATION — what exists after four hundred years of raising practised
// at industrial scale in the Palelands. §48's own preamble says *"almost none of it needed new machinery"*,
// and that is true: the retrieval ladder, `absorb`, the `decay` damage type and typed healing were all
// already built. ⚠️ WHAT WAS MISSING IS THE THING THAT TELLS THEM THEY ARE LOOKING AT AN UNDEAD.
//
// ⛑ MEASURED BEFORE BUILT, and the measurement moved the work. §48.10 lists three items owed to me; two of
// the three were still open and the third had been closed by a route the table did not predict:
//
//   | §48.10 owed                          | the table said | measured 2026-10-04                        |
//   | `heal` → `decay` on undead           | not built      | ✅ BUILT — typed healing (CCODE-316)        |
//   | the lash-out attack shape            | not built      | ⛔ not built — the word `lash` is absent     |
//   | divergent raise/retrieve curves      | ladder only    | ⛔ not built — no `priorRaisings` anywhere   |
//
// ⚠️ AND THE FIRST ROW IS THE INTERESTING ONE, because "built" was not the same as "reaches anything".
// `affinityOf` reads `sheet.affinity[type]`. The word `affinity` appears in `npcsheet.js` ZERO TIMES, so
// every body a player raises through `set_hand` or `given_errand` is minted ALIVE to the arithmetic: a
// mending mends it, Wither does not rot it, cold bites it. ⛔ THE READER WAS LIVE AND THE WRITER WROTE
// NOTHING — the four-doors failure, in the one subsystem whose whole point is an inverted body.
//
// ⛔ AND HALF THE AUTHORED UNDEAD WERE NOT UNDEAD EITHER. Four creatures carry `class: narrowed_dead`;
// `the_narrowed` and `the_gathering` author the §48.4 traits, and `the_standing_legion` and `barrow_wight`
// author NONE of them — same declared class, and a cleric's mending healed two of them. ⚠️ So the class
// floor below is not a new rule, it is the class's own declaration finally being read.
//
// ⛑ WHAT THIS MODULE REFUSES TO DO. §48.3: *"WHAT DECIDES WHICH IS NOT RULED"* — narrowing versus a stable
// Afterling — and §48.10 marks it ⛔ **ERIK — unruled, and it is the load-bearing one**. `narrowingSignals`
// reports the four candidate signals the spec names and DECIDES NOTHING. A derivation here would become the
// ruling by default, which is how an unruled 50% carried Erik's name on every road for three weeks.

/** §48.2 — the body is a cocoon, not a corpse, and wearing-down is GESTATION. */
export const COCOON_PHASES = ["set", "breaching", "emerged"];

/** §6 / §48.3 — three kinds, and they are NOT degrees of one thing. */
export const UNDEATH_KINDS = ["mindless", "spirit", "afterling"];

// ⛔ EVERY NUMBER HERE IS A DIAL IN `rules.death.undeath`, beside `rules.death.retrieval`, which is where
// death.js has kept its dials since SNG-209. ⚠️ Aevi and Erik turn them; none of them is a ruling.
const DEFAULTS = {
  // §48.2's phases in days since the raising. ⛑ THE SPANS ARE DEATH'S OWN, NOT NEW ONES: `rules.death`
  // already grades a death at 30 and 120 days (`nearDarkDays`, `sealAfterDays`), and a cocoon that breaches
  // as a death reaches the near dark and empties as one seals keeps the subsystem on one clock.
  breachAfterDays: 30,
  emergeAfterDays: 120,
  // §48.7 — THE TWO CURVES, in the percentage points `retrievalOdds` already speaks.
  // ⛔ THE SHAPE IS RULED AND THE NUMBERS ARE NOT, so they are picked to make Erik's CONSEQUENCE true rather
  // than to feel right: *"to LIVING: rises steeply → eventually impossible. To UNDEATH: gently → still
  // available."* At 18 a point per prior raising, a fourth raising puts even a threshold retrieval (base 70)
  // past zero; at 4 a point, raising stays open past twenty. ⚠️ The gate asserts THE ORDERING, never these.
  retrievePerPriorRaising: 18,
  raisePerPriorRaising: 4,
  raiseBase: 85,
  // §48.5 — the floor the declared class carries. ⛔ `decay` IS ABSENT FROM IT ON PURPOSE: Erik 2026-08-24,
  // *"not all undead would absorb Wither — just the ones who would be STRONGER WITHOUT THE COCOON"*, and
  // §48.5 says in capitals that `decay: absorb` MUST NOT be authored as an undead trait. It is a PHASE
  // outcome, below.
  classFloor: { vitality: "vulnerable", cold: "immune" },
  // §48.5's table, by phase: rotting an intact shell destroys the thing in it; rotting a spent one frees it.
  decayByPhase: { set: "vulnerable", breaching: "vulnerable", emerged: "absorb" },
  // §6 / §48.3 — "untouched by anything aimed at a self". ⚠️ THE MINDLESS ONLY: an Afterling IS a self, and
  // a whole personality that shrugged off grief and a true name would be the horror set §48.3 refuses.
  mindlessSelfProof: { psychic: "resist" },
  // §48.2 — "LASH OUT FROM THE BODY" is a distinct attack shape and should be built as one.
  lashPhases: ["breaching"],
  // ⛔ UNRULED AND LEFT THAT WAY (§48.3, §48.10). "report" names the signals and decides nothing. Any other
  // value is Erik's ruling arriving, and `narrowingSignals` will honour it the day he writes one.
  narrowingRule: "report",
};

function cfgOf(rules) { return { ...DEFAULTS, ...((rules?.death || {}).undeath || {}) }; }
const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);

/* ═════════════════════════════════════════════════════════════════════════════════════════════════════
 * THE RECORD — §48.1: undeath is a POWER PUT INTO A VESSEL, and personhood and embodiment are separate
 * questions. So the record says WHAT WENT IN and WHAT IT WENT INTO, and never conflates them.
 * ═════════════════════════════════════════════════════════════════════════════════════════════════════ */

/** The undeath record, or null. ⚠️ A plain reader, so every function below agrees what "is undead" means. */
export function undeathOf(entity) {
  const u = entity?.undeath;
  return u && typeof u === "object" ? u : null;
}

export function isUndead(entity) { return !!undeathOf(entity); }

/** How many times this entity has been raised OR retrieved before — §48.7's axis. ⛑ Counted on the record
 *  so a body raised, destroyed and raised again carries its own history, and reads 0 for anything living. */
export function priorRaisingsOf(entity) {
  const u = undeathOf(entity);
  if (u) return Math.max(0, num(u.priorRaisings, 0));
  return Math.max(0, num(entity?.priorRaisings, 0));
}

/** ⛔ THE WRITE DOOR. A raising puts power into a vessel; this records it.
 *
 *  ⚠️ IT PRESERVES WHAT IS THERE, exactly as `enterDeathState` does — a thing raised twice keeps its first
 *  raising's day and its count climbs, because §48.7's whole mechanism is that history accumulates.
 *
 *  `kind` is §6's three; `body: false` is §48.1's left column with no vessel — a spirit raised directly,
 *  *"without a body, but with intent"*. `purposeGiven` / `attended` / `nameKept` are §48.3's candidate
 *  signals, RECORDED SO ERIK CAN RULE ON THEM LATER and read by nothing that decides anything today. */
export function enterUndeath(entity, { kind = "mindless", day = null, by = null, body = true, purposeGiven = null, attended = null, nameKept = null, shellWear = null } = {}) {
  if (!entity) return entity;
  const prev = undeathOf(entity) || {};
  const k = UNDEATH_KINDS.includes(String(kind)) ? String(kind) : "mindless";
  entity.undeath = {
    kind: prev.kind || k,
    raisedDay: prev.raisedDay ?? day,
    raisedBy: prev.raisedBy ?? by,
    body: prev.body === undefined ? !!body : prev.body,
    // ⛔ THE COUNT CLIMBS ON EVERY RAISING, INCLUDING THIS ONE. A first raising is 0 prior ones.
    priorRaisings: Math.max(0, num(prev.priorRaisings, -1) + 1),
    purposeGiven: purposeGiven ?? prev.purposeGiven ?? null,
    attended: attended ?? prev.attended ?? null,
    nameKept: nameKept ?? prev.nameKept ?? null,
    shellWear: shellWear ?? prev.shellWear ?? null,
    released: prev.released ?? false,
  };
  // ⚠️ A RAISED BODY IS NOT IN THE DEATH STATE ANY MORE and it is not alive either. The retrieval ladder
  // grades a road BACK; an undead has left that road. Leaving `status: "dead"` on one would put it back in
  // `reachableDeadForGM`, where a warden would be offered a retrieval of a thing already standing up.
  if (entity.status === "dead") { entity.status = "undead"; entity.wasDead = true; }
  return entity;
}

/* ═════════════════════════════════════════════════════════════════════════════════════════════════════
 * §48.2 — THE COCOON PHASES. ⛔ WEARING-DOWN IS GESTATION, NOT DECAY. Erik inverted my first model of this:
 * I had it as "how much person is left" and the body is the SHELL THE THING INSIDE IS OUTGROWING.
 * ═════════════════════════════════════════════════════════════════════════════════════════════════════ */

/** Which phase the shell is in: `set` intact · `breaching` wearing and it can strike from inside ·
 *  `emerged` spent or shed. Pure over the record + the world-day + rules.
 *
 *  ⚠️ `shellWear` (0..1) OVERRIDES THE CLOCK, because the clock is not the only thing that wears a shell —
 *  §48.8 is a craft that destroys one outright, and a GM who says "this one is nearly out" must be able to.
 *  ⛑ A record with no `raisedDay` reads `set`: that is the honest answer for a thing whose age nobody
 *  wrote down, and it is the phase at which Wither DESTROYS, so the unknown case is the safe one. */
export function cocoonPhase(entity, currentDay = null, rules = {}) {
  const u = undeathOf(entity);
  if (!u) return { phase: null, idx: -1, days: null, why: "not undead" };
  const cfg = cfgOf(rules);
  const wear = u.shellWear;
  // ⛔ `wear == null` IS TESTED FIRST AND THAT IS NOT DEFENSIVE PADDING — IT IS THE BUG THIS LINE HAD.
  // `enterUndeath` stores `shellWear: null` for every record that does not set one, and `Number(null)` is
  // **0, which is finite** — so the override branch claimed every undead in the world was 0% worn and the
  // cocoon NEVER LEFT `set`. ⚠️ Day 400 read `set`; Wither destroyed everything and freed nothing; the lash
  // could never fire; §6's one ruled derivation could never reach `emerged`. Three features dead from one
  // coerced null, and `node --check` and all 32 suites were green over it — `po/drive_undeath.mjs` found it
  // in its first run, which is the whole reason a new module gets driven before anything depends on it.
  if (wear != null && Number.isFinite(Number(wear))) {
    const w = Math.max(0, Math.min(1, Number(wear)));
    const idx = w >= 1 ? 2 : w >= 0.5 ? 1 : 0;
    return { phase: COCOON_PHASES[idx], idx, days: null, wear: w, why: `the shell is ${Math.round(w * 100)}% worn` };
  }
  if (u.raisedDay == null || currentDay == null) {
    return { phase: "set", idx: 0, days: null, why: "nobody wrote down when it was raised — the shell reads intact" };
  }
  const days = Math.max(0, num(currentDay) - num(u.raisedDay));
  const idx = days >= cfg.emergeAfterDays ? 2 : days >= cfg.breachAfterDays ? 1 : 0;
  return { phase: COCOON_PHASES[idx], idx, days,
    why: idx === 2 ? `${days} days — the shell is spent` : idx === 1 ? `${days} days — the shell is wearing and the thing inside is growing` : `${days} days — the shell is intact` };
}

/** §6 — which of the three this is.
 *
 *  ⛔ ONE DERIVATION, AND IT IS THE ONE §6 ACTUALLY RULES: *"A SPIRIT is what a mindless one becomes if it
 *  is left to proceed through the cocoon phases and is then released."* Both conditions, both recorded.
 *  ⚠️ AN AFTERLING IS NOT DERIVED FROM ANYTHING. §48.3's "how" column reads ⚠️ **not ruled**, and inventing
 *  the condition here is exactly the move §48.10 reserves for Erik. It is read from the record or not at all. */
export function undeathKind(entity, currentDay = null, rules = {}) {
  const u = undeathOf(entity);
  if (!u) return null;
  const recorded = UNDEATH_KINDS.includes(String(u.kind)) ? String(u.kind) : "mindless";
  if (recorded === "mindless" && u.released === true && cocoonPhase(entity, currentDay, rules).idx >= 2) {
    return "spirit";
  }
  return recorded;
}

/** §48.3's four candidate signals, REPORTED AND NOT WEIGHED.
 *
 *  ⛔ THIS FUNCTION DELIBERATELY RETURNS NO ANSWER. The spec names four candidates for what decides
 *  narrowing versus a stable Afterling — the depth raised from · whether they were GIVEN a purpose or merely
 *  set · whether anyone attended them · whether a name was kept — and marks the question ⛔ ERIK's.
 *  ⚠️ So the engine's job is to have the evidence ready on the day he rules, and to say plainly that it is
 *  not ruled. A GM reading `ruled: false` knows the call is theirs; a derivation here would have made it
 *  mine and nobody would have noticed for a month. */
export function narrowingSignals(entity, { depthRaisedFrom = null, currentDay = null, rules = {} } = {}) {
  const u = undeathOf(entity);
  if (!u) return null;
  const cfg = cfgOf(rules);
  const signals = {
    depthRaisedFrom: depthRaisedFrom ?? u.depthRaisedFrom ?? null,
    purposeGiven: u.purposeGiven ?? null,
    attended: u.attended ?? null,
    nameKept: u.nameKept ?? null,
  };
  const known = Object.entries(signals).filter(([, v]) => v !== null && v !== undefined).map(([k]) => k);
  return {
    signals, known,
    ruled: cfg.narrowingRule !== "report",
    rule: cfg.narrowingRule,
    kind: undeathKind(entity, currentDay, rules),
    // ⛑ §262: THE CITATION STAYS HERE AND LEAVES THE STRING. SYSTEM_SPEC §48.3 is for whoever reads this
    // code; a player who meets this text through `_deathNotes` or a narrated beat should meet the RULE, not
    // its ticket number — which is the whole point of that ratchet and it caught six of these in one run.
    why: "⛔ What decides whether an undead narrows to unminded purpose or stays a whole person is not settled. These are the four things that might decide it, reported so it can be ruled at the table.",
  };
}

/* ═════════════════════════════════════════════════════════════════════════════════════════════════════
 * §48.4 / §48.5 — THE ARITHMETIC. ⚠️ No new vocabulary: `immune · resist · vulnerable · absorb` have been
 * in `skill_battle_system.json` since the affinity system shipped, and `affinityOf` has read them all along.
 * ═════════════════════════════════════════════════════════════════════════════════════════════════════ */

/** ⛔ THE AFFINITY FLOOR AN UNDEAD CARRIES — a FLOOR, never a replacement.
 *
 *  ⚠️ AUTHORED ALWAYS WINS, which is the whole shape of this function: `the_narrowed` authors `decay:
 *  absorb` and keeps it at every phase, because §48.5's third row is *"an authored aura — a specific
 *  creature's own trait, authored per sheet"*. The floor only ever fills what the sheet is SILENT about,
 *  so Aevi's escape hatch from any of it is to author the opposite, and she needs no flag from me.
 *
 *  ⛔ `decay` COMES FROM THE PHASE, NOT FROM BEING UNDEAD. §48.5: *"MOST UNDEAD ARE HURT BY WITHER. THE ONES
 *  CLOSE TO COMING OUT ARE HELPED BY IT"* — and a warden cannot tell which by looking, which is §48.8's
 *  whole tension. A blanket `decay: absorb` would have deleted that tension and the spec forbids it in
 *  capitals.
 *
 *  Returns `{ affinity, added, authored, phase }` — `added` is what the floor supplied, so a caller can
 *  show the GM which half of a creature's arithmetic is its own and which is the class's. */
export function undeadAffinity(entity, { currentDay = null, rules = {}, kind = null } = {}) {
  const u = undeathOf(entity);
  const cls = String(entity?.class || "");
  const declared = !!u || cls === "narrowed_dead";
  if (!declared) return { affinity: entity?.affinity || null, added: {}, authored: entity?.affinity || null, phase: null, undead: false };
  const cfg = cfgOf(rules);
  const authored = { ...(entity?.affinity || entity?.affinities || {}) };
  const ph = u ? cocoonPhase(entity, currentDay, rules) : { phase: null, idx: -1, why: "declared by class, with no raising recorded" };
  const k = kind || (u ? undeathKind(entity, currentDay, rules) : "mindless");
  const floor = { ...cfg.classFloor };
  // §48.5's phase table. ⛑ A creature declared by CLASS with no raising recorded gets no `decay` default at
  // all: its phase is unknown, and guessing `vulnerable` would quietly make every barrow wight rottable
  // while guessing `absorb` would quietly make them all un-rottable. Silence is the honest answer.
  if (ph.phase && cfg.decayByPhase?.[ph.phase]) floor.decay = cfg.decayByPhase[ph.phase];
  // §6 — the mindless are untouched by anything aimed at a self. An Afterling is a self.
  if (k === "mindless") Object.assign(floor, cfg.mindlessSelfProof || {});
  const added = {};
  for (const [type, val] of Object.entries(floor)) {
    if (authored[type] == null) { authored[type] = val; added[type] = val; }
  }
  return { affinity: authored, added, authored: entity?.affinity || entity?.affinities || null,
    phase: ph.phase, kind: k, undead: true,
    why: Object.keys(added).length
      ? `the declared class supplied ${Object.keys(added).join(", ")}; the rest is the sheet's own`
      : "the sheet authors its whole arithmetic — the floor added nothing" };
}

/** §48.8 — WITHER DESTROYS THE COCOON, AND MAY FREE WHAT IS IN IT.
 *
 *  ⛔ THREE OUTCOMES FROM ONE ACT AND THE WARDEN DOES NOT CHOOSE WHICH — it follows the phase:
 *  set → DESTROYED (what a warden usually intends) · breaching → VULNERABLE, out early and exposed, a
 *  window to finish it or save it · emerged → ⛔ FREED, because the cocoon was the last thing holding it in.
 *
 *  ⚠️ SO THE CRAFT MEANT TO UN-MAKE UNDEAD IS HOW AN AFTERLING IS BORN. `chosen: false` is in the return
 *  because a surface that let a player pick this would be telling them a lie the spec spends a paragraph on. */
export function witherOutcome(entity, { currentDay = null, rules = {} } = {}) {
  const u = undeathOf(entity);
  const cls = String(entity?.class || "");
  if (!u && cls !== "narrowed_dead") return { ok: false, why: "not undead — Wither is rotting material, and that is all it is doing here" };
  const ph = cocoonPhase(entity, currentDay, rules);
  const phase = ph.phase || "set";
  const outcome = phase === "emerged" ? "freed" : phase === "breaching" ? "vulnerable" : "destroyed";
  return {
    ok: true, phase, outcome, chosen: false,
    freed: outcome === "freed",
    why: outcome === "destroyed" ? "nothing was far enough along — this is what a warden usually intends"
      : outcome === "vulnerable" ? "something is there, out early and exposed — a window to finish it, or to save it"
      : "⛔ the cocoon was the last thing holding it in",
    warning: outcome === "freed" ? "⛔ the craft meant to un-make an undead has just made an Afterling, and the warden had no way to know" : null,
  };
}

/* ═════════════════════════════════════════════════════════════════════════════════════════════════════
 * §48.6 / §6 — DEATHSENSE IS THE UNDEAD DETECTOR, AND IT IS A DIAGNOSTIC BEFORE IT IS ANYTHING ELSE.
 * ═════════════════════════════════════════════════════════════════════════════════════════════════════ */

/** What Deathsense reads: ⛔ *"positive in the living, FALLING in the dying, INVERTED in the undead."*
 *
 *  ⛔ AND THE SILENCE IS THE POINT. §6: *"A mindless crew arrives UNFELT — there is no self in one to give
 *  it away. A spirit or an Afterling reads fine: they want something, and wanting is weather. So silence
 *  means a tool, and anything you can feel is either further along the cocoon or a person — ⛔ AND TELLING
 *  THOSE TWO APART IS THE WARDEN'S ACTUAL PROBLEM."*
 *
 *  ⚠️ SO THIS FUNCTION MUST NOT RETURN THE KIND, and that is the one thing it would have been easiest to do.
 *  `tells` is false whenever the read is felt, and `ambiguous` names the two things it could be. A warden
 *  who got `kind: "afterling"` out of a sense craft would have been handed the warden's actual problem,
 *  solved, by the engine — which is the problem being deleted rather than built. */
export function deathsenseRead(entity, { currentDay = null, rules = {}, dying = false } = {}) {
  const u = undeathOf(entity);
  const cls = String(entity?.class || "");
  if (!u && cls !== "narrowed_dead") {
    if (entity?.status === "dead") return { felt: false, reads: "nothing", tells: true, why: "a corpse has nothing left to sense" };
    if (dying) return { felt: true, reads: "falling", tells: true, why: "life, and it is going" };
    return { felt: true, reads: "positive", tells: true, why: "life, where it should be" };
  }
  const k = undeathKind(entity, currentDay, rules) || "mindless";
  const ph = cocoonPhase(entity, currentDay, rules);
  // ⛔ UNFELT: a mindless one with the shell still intact. There is no self in it to give it away.
  const unfelt = k === "mindless" && (ph.idx <= 0);
  if (unfelt) {
    return { felt: false, reads: "unfelt", tells: true, undead: true, phase: ph.phase,
      why: "⛔ nothing wants anything in there — and silence means a tool" };
  }
  return {
    felt: true, reads: "inverted", undead: true, phase: ph.phase,
    // ⛔ THE LIMIT IS REPORTED, NOT PAPERED OVER.
    tells: false,
    ambiguous: ["further along the cocoon", "a person"],
    why: "⛔ the opposite of nothing — it wants something, and wanting is weather. ⚠️ What it IS, this does not say.",
    social: k === "afterling" || k === "spirit"
      ? "⚠️ against a stable one this is a SOCIAL problem, not a tactical one — you know, loudly, and without being subtle"
      : null,
  };
}

/* ═════════════════════════════════════════════════════════════════════════════════════════════════════
 * §48.7 — RAISING GETS HARDER EACH TIME, AND THAT IS WHY THE OLD HEROES ARE UNDEAD.
 *
 * ⛔ "CANNOT BE RAISED TWICE" WAS WITHDRAWN — a wall where a curve belongs. ⚠️ Erik: *"there should be a
 * DIFFICULTY THAT INCREASES PER TIME… which is probably a good reason why after a long time SOME HEROES
 * BECOME UNDEAD: it's too hard to raise them back to living, but they CAN CONTINUE IN UNDEATH."*
 * ═════════════════════════════════════════════════════════════════════════════════════════════════════ */

/** The penalty prior raisings put on a road back, in the percentage points `retrievalOdds` speaks.
 *
 *  ⛔ TWO CURVES OFF ONE COUNT, and the asymmetry IS the ruling: to LIVING it rises steeply and eventually
 *  closes; to UNDEATH it rises gently and stays open. ⚠️ THE GATE ASSERTS THAT ORDERING, NOT THESE NUMBERS —
 *  a balance dial gated at its value reddens the day Erik improves it. */
export function raisingPenalty(entity, { to = "living", rules = {} } = {}) {
  const cfg = cfgOf(rules);
  const n = priorRaisingsOf(entity);
  const per = to === "undeath" ? num(cfg.raisePerPriorRaising, 4) : num(cfg.retrievePerPriorRaising, 18);
  return { priorRaisings: n, per, penalty: n * per, to,
    why: n === 0 ? "never raised — no toll yet"
      : to === "undeath" ? `${n} prior raising(s), gently — a thing that has continued before continues again`
      : `⛔ ${n} prior raising(s), steeply — each return costs more than the last` };
}

/** ⛔ THE OTHER ROAD, which the ladder never had: how hard it is to make someone CONTINUE rather than return.
 *
 *  ⚠️ IT IS NOT A SECOND COPY OF `retrievalOdds`. That function grades a road back through a wall that
 *  thickens with depth and time; this one grades a road that §48.7 says depth and time barely touch. The
 *  consequence Erik ruled is the whole point: *"a hero four centuries dead CANNOT be made alive and CAN be
 *  made to continue."* ⛑ `depth` is accepted and deliberately costs almost nothing, so a caller that passes
 *  it does not accidentally rebuild the retrieval curve here. */
export function raiseOdds(entity, { rank = 1, rules = {}, depth = null, currentDay = null } = {}) {
  const cfg = cfgOf(rules);
  const pen = raisingPenalty(entity, { to: "undeath", rules });
  const perDepth = 3;   // gently — §48.7's right-hand column, and three points is the gentlest thing that is not zero
  const d = depth == null ? 0 : Math.max(0, Math.min(3, num(depth, 0)));
  const raw = num(cfg.raiseBase, 85) + (Math.max(1, num(rank, 1)) - 1) * 4 - pen.penalty - d * perDepth;
  const pct = Math.max(0, Math.min(99, Math.round(raw)));
  return { pct, base: num(cfg.raiseBase, 85), rank, depth: d, penalty: pen.penalty, priorRaisings: pen.priorRaisings,
    open: pct > 0,
    terms: [`base ${cfg.raiseBase}`, rank > 1 ? `+${(rank - 1) * 4} rank` : null, pen.penalty ? `−${pen.penalty} prior raisings` : null, d ? `−${d * perDepth} depth` : null].filter(Boolean),
    why: "the curve to undeath rises gently, and it stays available after the road back has closed" };
}

/* ═════════════════════════════════════════════════════════════════════════════════════════════════════
 * §48.2 — "LASH OUT FROM THE BODY" IS A DISTINCT ATTACK SHAPE AND SHOULD BE BUILT AS ONE.
 * ⛔ "It comes not from reach or limbs but FROM INSIDE THE SHELL — past armour, past position, from a thing
 * you have not met. The corpse is the delivery system and it is not the threat."
 * ═════════════════════════════════════════════════════════════════════════════════════════════════════ */

/** Whether the thing inside can strike from in there, and what that blow IGNORES.
 *
 *  ⛔ IT IS AVAILABLE AT `breaching` AND NOWHERE ELSE, which is §48.2's table read literally: at `set` the
 *  occupant is *"dormant, or nothing yet"* and at `emerged` it is out and fighting you with its own limbs.
 *  The lash is the MIDDLE — a thing that is neither dormant nor met.
 *
 *  ⚠️ `piercesSoak` AND `ignoresPosition` ARE WHAT THE SPEC SAYS, IN THE TERMS THE RESOLVER ALREADY USES:
 *  "past armour" is soak, "past position" is reach and stance. ⛔ THE DAMAGE TYPE IS NOT AUTHORED ANYWHERE
 *  and this does not invent one — an untyped blow is invisible to affinities, which is a real hole, so the
 *  return SAYS SO rather than filling it with a guess. Reported to Aevi; one word on the creature closes it. */
export function lashOut(entity, { currentDay = null, rules = {} } = {}) {
  const u = undeathOf(entity);
  if (!u) return { ok: false, why: "nothing is in there" };
  const cfg = cfgOf(rules);
  const ph = cocoonPhase(entity, currentDay, rules);
  const phases = Array.isArray(cfg.lashPhases) ? cfg.lashPhases : ["breaching"];
  if (!phases.includes(ph.phase)) {
    return { ok: false, phase: ph.phase,
      why: ph.idx <= 0 ? "the occupant is dormant, or there is nothing in there yet" : "it is out — it does not need to strike from inside a shell it has shed" };
  }
  const type = entity.lashType || u.lashType || null;
  return {
    ok: true, phase: ph.phase, from: "inside the shell",
    piercesSoak: true, ignoresPosition: true,
    damageType: type, typeUnauthored: !type,
    why: "⛔ not from reach or limbs — from inside, past armour and past position, from a thing you have not met",
    narration: "The body does not swing. Something in it does.",
  };
}

/* ═════════════════════════════════════════════════════════════════════════════════════════════════════
 * THE SHEET SIDE — what a raised body carries into a fight.
 * ═════════════════════════════════════════════════════════════════════════════════════════════════════ */

/** ⛔ THE FLOOR AS A PLAIN MAP, for the two minters that need it before any entity exists.
 *
 *  ⚠️ `summonSheetFor` mints a body from an ABILITY, not from a record, so it has no `undeath` to read and
 *  no day to date it. This is that case: the floor at the phase a freshly raised thing is actually in, which
 *  is `set` — intact shell, dormant occupant, and `decay: vulnerable` because rotting an intact shell
 *  destroys what is in it. ⛑ A crew raised this morning is the MOST rottable undead in the world, and
 *  nothing about that is a special case. */
export function freshRaisedAffinity({ kind = "mindless", rules = {} } = {}) {
  const cfg = cfgOf(rules);
  const out = { ...cfg.classFloor };
  if (cfg.decayByPhase?.set) out.decay = cfg.decayByPhase.set;
  if (kind === "mindless") Object.assign(out, cfg.mindlessSelfProof || {});
  return out;
}

/** §48.9 — MAINTENANCE, NOT MEDICINE. ⚠️ Erik: *"we need a way to heal undead — by MAINTENANCE for the body,
 *  or OTHER POWERS for the spirit."* ⛔ AND THE GAP IS DELIBERATE: the BODY has an answer in the game already
 *  (`kept_vigil` is `ordered_nanite` and already holds a failing thing at its state), and the SPIRIT has
 *  none — *"a cocoon whose SHELL is sound and whose OCCUPANT is damaged is a problem no Ashwarden craft
 *  addresses."* This reports which half is which so a GM is not left guessing why a mending did nothing. */
export function repairPathFor(entity, { currentDay = null, rules = {} } = {}) {
  if (!isUndead(entity)) return null;
  const ph = cocoonPhase(entity, currentDay, rules);
  return {
    body: { works: true, how: "maintenance", craft: "kept_vigil",
      why: "⛑ structured nanite holds a failing thing at its state — the closest craft in the game to undead repair, and it was not written for it" },
    spirit: { works: false, how: null,
      why: "⛔ not Death's work — a sound shell with a damaged occupant is a problem no Ashwarden craft addresses, and the craft that would is Spirit's." },
    phase: ph.phase,
    // ⚠️ AND THE OBVIOUS THING A PLAYER WILL TRY FIRST IS THE ONE THAT HURTS.
    healing: { works: false, why: "⛔ a mending burns it — the same vitality that closes a living wound is the thing it has been emptied of" },
  };
}

/* ══════════════════════════════════════════════════════════════════════════════════════════════
 * ⛔ WEARING THE UNDEAD'S ADVANTAGES — `wornBenefits`, WHICH WAS AUTHORED AND HAD NO READER.
 *
 * ✅ ERIK 2026-08-24: *"beyond just the fear, INCREASED RANKS SHOULD GIVE YOU SOME OF THE BENEFITS OF THE
 * UNDEAD — necrotic absorb, immunity to cold, unnatural strength."* ⚠️ Aevi authored it on `dread`, Erik
 * ruled it was too much on one craft, and it was split out whole into `deathless` — whose own note says in
 * its own words that *"`wornBenefits` needs a READER but invents no vocabulary"*. ⛔ NOBODY BUILT THE READER.
 * Three ranks of an authored capstone (`cold: immune` · `decay: resist` → `absorb` · `strengthBonus: 2`) did
 * nothing at all, in the one subsystem where a wrong affinity is the difference between a mending and a burn.
 *
 * ✅ AND IT IS AN ADVANTAGE WITH NO BILL. Erik: *"STOP THE NEGATIVE ASPECTS OF HEROIC SKILLS!!"* — I had
 * authored "healing harms you" onto the wearer and he struck it. ⛑ SO THIS READS WHAT IS AUTHORED AND
 * NOTHING ELSE: the wearer does not become undead, she borrows the two affinities the craft grants. The
 * `vitality: vulnerable` that would burn her is NOT in the authored block, and must not be added here. */

/** The affinities a worn craft grants at a rank. ⚠️ Keyed by rank as a STRING, which is how it is authored
 *  (`{"1": {...}, "2": {...}}`), and read down to the highest authored rank at or below the one in play — a
 *  craft authored at 1–3 and cast at rank 5 grants its rank-3 block rather than nothing. */
export function wornAffinityFor(ability, rank = 1) {
  // ⛑ `mechanic.wornBenefits` AND NOWHERE ELSE. My first cut added `|| ability.wornBenefits` as a
  // belt-and-braces fallback and §182 refused it in the same run: no authored craft carries it at the top
  // level, so that branch could only ever read nothing — and it made the engine read a craft field the
  // schema does not admit. ⚠️ §182's own next check exists to retire exactly these (`effect`, `ranks`,
  // `function`, top-level `crit`, `tierGap`), and I had just written the sixth.
  const worn = ability?.mechanic?.wornBenefits || null;
  if (!worn || typeof worn !== "object") return null;
  const want = Math.max(1, num(rank, 1));
  let best = null;
  for (let r = want; r >= 1; r--) { if (worn[String(r)]) { best = worn[String(r)]; break; } }
  if (!best || typeof best !== "object") return null;
  const legal = new Set(["immune", "resist", "vulnerable", "absorb"]);
  const affinity = {}; const extras = {};
  for (const [k, v] of Object.entries(best)) {
    if (legal.has(String(v))) affinity[k] = String(v);
    else extras[k] = v;        // ⛑ `strengthBonus: 2` is not an affinity and is handed back separately
  }
  return { affinity, extras, rank: want, why: "the mantle is worn, so it works on the wearer" };
}

/** ⛔ FOLD EVERY ACTIVE WORN GRANT INTO THE SHEET THE DAMAGE PATH ALREADY READS.
 *
 *  ⛑ THIS IS WHY IT NEEDS NO CHANGE TO `affinityOf`. That function reads `sheet.affinity[type]`; a worn
 *  craft's whole job is to change what that says for a few rounds. So the fold happens once, on the sheet,
 *  and every blow, ward and mending in the round reads the same answer — rather than six call sites each
 *  remembering to ask about worn effects, which is how five of them end up not asking.
 *
 *  ⚠️ THE WORN VALUE WINS over the sheet's own, and that is the ruling, not a convenience: a warden whose
 *  own sheet says `cold: vulnerable` is wearing a craft that says `cold: immune`, and the craft is the
 *  reason she cast it. Authored-wins is the rule for a creature's PERMANENT arithmetic (`undeadAffinity`);
 *  a temporary grant is the other direction by definition. */
export function withWornAffinity(sheet, effects = [], side = "player") {
  if (!sheet) return sheet;
  const mine = (Array.isArray(effects) ? effects : []).filter((fx) => fx && fx.side === side && fx.affinity && typeof fx.affinity === "object");
  if (!mine.length) return sheet;
  const affinity = { ...(sheet.affinity || sheet.affinities || {}) };
  const worn = [];
  for (const fx of mine) { Object.assign(affinity, fx.affinity); worn.push(fx.label || fx.kind); }
  return { ...sheet, affinity, wornAffinity: { from: worn, granted: mine.reduce((a, fx) => ({ ...a, ...fx.affinity }), {}) } };
}

/* ══════════════════════════════════════════════════════════════════════════════════════════════
 * ⛔ THE DOOR INTO PLAY — AND THE WIRING AUDIT IS WHY THIS EXISTS.
 *
 * ⚠️ FIVE OF THIS MODULE'S EXPORTS WERE REACHABLE ONLY FROM A TEST: `deathsenseRead`, `witherOutcome`,
 * `lashOut`, `raiseOdds`, `repairPathFor`. The ratchet's words are *"it passes CI and CANNOT FIRE IN PLAY.
 * Wire it or delete it"* — and it was right. §48 would have shipped as a model with 24 green gates and no
 * way for a player to ever meet it.
 *
 * ⛑ ONE SURFACE, NOT FIVE CALL SITES, and it is the NARRATOR — which is deliberately the cheapest place in
 * the game to be wrong in public. `sheetsForGM` made the same choice for the same reason: if a line here is
 * wrong the GM says something odd about a body and NOTHING RESOLVES DIFFERENTLY. No damage, no roll, no state.
 *
 * ⚠️ AND IT SEPARATES WHAT THE GM KNOWS FROM WHAT THE CHARACTER CAN PERCEIVE. The GM is told the truth —
 * the kind, the phase, what Wither would do — AND, separately, what a Deathsense read would actually give the
 * player, which per §6 is deliberately less. A narrator handed only the truth would have the warden simply
 * know which standing figure is an Afterling, and §6 spends its last line saying that telling those two apart
 * is the warden's whole problem. */

/** ⛔ THE UNDEAD THE GM CAN NARRATE, and what the player's own senses would give them about each.
 *
 *  ⚠️ IT RETURNS NULL ON AN EMPTY WORLD, which is the honest answer and is TODAY'S answer: nothing writes
 *  an `undeath` record in play until a `deathOps` op `"raise"` lands, so this block is absent from the prompt
 *  rather than present and empty. ⛑ A SURFACE WITH NO POPULATION IS NOT A WORKING SURFACE, and saying so
 *  here is the difference between this shipping honestly and shipping as a claim. */
export function undeadForGM(character, content = {}, currentDay = null, rules = {}) {
  const out = [];
  const seen = new Set();
  const consider = (ent, who) => {
    if (!ent || seen.has(ent)) return;
    seen.add(ent);
    if (!isUndead(ent)) return;
    const ph = cocoonPhase(ent, currentDay, rules);
    const kind = undeathKind(ent, currentDay, rules);
    const wither = witherOutcome(ent, { currentDay, rules });
    const lash = lashOut(ent, { currentDay, rules });
    const repair = repairPathFor(ent, { currentDay, rules });
    const sense = deathsenseRead(ent, { currentDay, rules });
    out.push({
      id: ent.id || who || null, name: ent.name || who || "someone",
      // —— what is TRUE, for the GM ——
      kind, phase: ph.phase, shell: ph.why,
      witherWouldLeave: wither.outcome, witherWarning: wither.warning,
      canLashFromInside: lash.ok === true,
      mending: "⛔ a mending BURNS it — do not narrate a healer helping one",
      repair: repair.body.works ? `the body can be MAINTAINED (${repair.body.craft}), the spirit cannot` : null,
      // —— what the PLAYER would actually get, which is less ——
      deathsense: sense.felt
        ? `felt — ${sense.reads}. ⚠️ IT DOES NOT TELL THEM WHICH: ${sense.ambiguous?.join(" or ")}`
        : `⛔ UNFELT — nothing wants anything in there, and silence means a tool`,
      ...(sense.social ? { socially: sense.social } : {}),
      // §48.3 — reported, never decided
      narrowing: narrowingSignals(ent, { currentDay, rules }),
    });
  };
  consider(character, character?.name);
  for (const [id, ent] of Object.entries(character?.npcRegistry || {})) consider(ent, id);
  for (const ent of Object.values(content?.npcs || {})) consider(ent, ent?.id);

  // ⛔ §48.7's OTHER HALF, and it is the one a player will ask about: whose road back has CLOSED, and what
  // continuing would cost instead. ⚠️ A dead figure nobody can retrieve any more is not a dead end — that is
  // the entire reason the old heroes are undead, and without this line the GM never learns the door exists.
  const couldContinue = [];
  for (const [id, ent] of Object.entries(character?.npcRegistry || {})) {
    if (ent?.status !== "dead" || isUndead(ent)) continue;
    const n = priorRaisingsOf(ent);
    if (n <= 0) continue;                       // nobody has reached for them yet; the ordinary ladder applies
    const odds = raiseOdds(ent, { rank: 1, rules, currentDay });
    couldContinue.push({ id, name: ent.name || id, priorRaisings: n, raiseChance: odds.pct,
      why: "⛔ the road back is steep or closed, and continuing in undeath is not" });
  }
  if (!out.length && !couldContinue.length) return null;
  return { undead: out, couldContinue,
    note: "⛔ Healing harms the undead and decay mends them. ⚠️ What decides whether one narrows to unminded purpose or stays a whole person is NOT SETTLED — weigh the signals and rule it at the table; the engine will not." };
}
