// roundreceipt.js — the ROUND RECEIPT, made testable.
//
// WHY THIS MODULE EXISTS. On 2026-08-01 Erik reported that every round of every fight said "neither gains —
// it's even", including a roll of 1/95 (margin 102) against a margin of 25. The cause was one argument:
// `sbRoundReceipt` was handed the round's AFTER momentum as its BEFORE, so `swing = after - before` was
// pinned to 0 forever. It had been lying about every round in every fight, and the GM narrates FROM these
// lines — so both steps of a turn read as identical nothing-happened exchanges.
//
// It survived because it was UNTESTABLE. The logic lived inside app.js, entangled with CONTENT and the DOM,
// so no test could reach it and no simulation could sample it. The fix for the bug was one line; the fix for
// the CLASS is this file: the reporting layer is now pure, injected, and importable, so `tests/contest_sim.mjs`
// can Monte-Carlo it and assert distributional truths a unit test cannot express — chiefly that a decisive
// round must NOT report as even.
//
// The rule this encodes: a receipt is a CLAIM about what happened. A claim no test can read is a claim
// nobody is checking. Reporting deserves the same purity discipline as the rules it reports on.

/** The verb each function reads as in the receipt. Data, not logic — shared so the app and the sim can never
 *  describe the same round with two different vocabularies. */
export const SB_VERB = {
  // ⚠️ NO TRAILING PREPOSITIONS. Both readers put a word directly after this one — "You ${verb} with
  // ${name}" and "they ${verb} — ..." — so `break: "shatter at"` printed "You shatter at with Sonic
  // Resonance" and "they shatter at —". A verb here has to stand alone in a sentence.
  strike: "strike", break: "shatter", hinder: "hamper", shield: "guard", ward: "ward", resist: "brace",
  reveal: "read", foresee: "foresee", track: "track", conceal: "slip aside", deceive: "feint",
  command: "command", bind: "bind", move: "reposition", travel: "reposition", open: "open a way",
  heal: "steady", mend: "mend", restore: "restore", empower: "empower", make: "conjure",
  transform: "reshape", summon: "call", sustain: "hold"
};

/** Functions that READ as defensive — they shape the interaction clause, not the mechanics. */
export const SB_DEFENSIVE = new Set(["shield", "ward", "resist", "conceal", "deceive"]);

/** ⛔ CCODE-493 — Functions that MEASURE rather than meet. Erik, 2026-09-25: "another description mess...
 *  my 'blow' was turned aside... i did no blow." He had read them with Prism Sight, a `reveal`, and the
 *  receipt printed the fight set's `theyHold` — "your blow is turned aside".
 *
 *  ⚠️ AND THE SENTENCE CONTRADICTED ITSELF SIX WORDS EARLIER: `SB_VERB` maps reveal → "read", so the same
 *  line already said "You read with Prism Sight" before calling it a blow. The clause was picked on ONE bit
 *  — defensive or not — and a read is neither. It was sorted into "not defensive", which the table calls
 *  pressing, which the fight kind calls a blow. This is SNG-588's defect one axis over: that one adapted the
 *  clause to the FRAME and left the verb alone. */
export const SB_SENSING = new Set(["reveal", "foresee", "track"]);

/** Which of the three ways a verb MEETS the other one. Data, like the verbs themselves. */
function clauseRole(fn) { return SB_SENSING.has(fn) ? "sense" : SB_DEFENSIVE.has(fn) ? "def" : "press"; }

/** How decisively the meter moved this round. THE function the live bug corrupted.
 *
 *  `before` and `after` must be the momentum on either side of THIS round. The 0.5 deadband is what makes
 *  "even" meaningful: a hair of drift is not an exchange anyone won. Returns
 *  { swing, verdict: "player" | "opponent" | "even" }. Pure. */
export function roundVerdict(before, after, { pressureEvent = null } = {}) {
  const b = Number(before) || 0, a = Number.isFinite(Number(after)) ? Number(after) : b;
  // ⛔ CCODE-493 — A BREAK ERASES ITS OWN EVIDENCE, AND THIS FUNCTION READ THE EVIDENCE. When the meter
  // fills, `battleRound` banks a pressure tick and RESETS the meter to ±35% so the beaten side is still in the
  // fight (CCODE-38). The reset lands near where a mid-fight meter already sat — so `after - before` came out
  // at roughly nothing on the single most decisive round a fight can have, and this returned "even".
  //
  // ⚠️ ERIK FOUND IT IN PLAY (2026-09-25): "my roll was a crit success while theirs was a crit failure...
  // I should have destroyed them." He had. The pips moved from 1 to 2 and the sentence said "neither gains".
  //
  // ⛑ AND IT IS THE 2026-08-01 BUG AGAIN, WEARING THE OTHER MASK — that one pinned the swing to zero by
  // feeding `after` in as `before`; this one pins it to zero by moving `after` back. Which is why the guard in
  // contest_sim could not see it: that check requires `|after - before| > 0.5` before it will call a round
  // decisive, and a break is exactly the round where that is false. A gate that asks its question in the
  // terms of the bug it is looking for cannot find the bug.
  //
  // When a break fired, the meter is NOT the record of the round — the tick is. The side driven back lost it.
  if (pressureEvent?.side) {
    const was = Number(pressureEvent.meterWas);
    return { swing: Number.isFinite(was) ? was - b : (pressureEvent.side === "opponent" ? 1 : -1),
      verdict: pressureEvent.side === "opponent" ? "player" : "opponent", broke: true };
  }
  const swing = a - b;
  return { swing, verdict: swing > 0.5 ? "player" : swing < -0.5 ? "opponent" : "even" };
}

/** The player-facing phrase for a verdict. */
export function gainPhrase(verdict) {
  return verdict === "player" ? "you take the exchange"
    : verdict === "opponent" ? "they take the exchange"
    : "neither gains — it's even";
}

/** ⛔ SNG-588 (Erik, in play) — "this was a contest of wills — so no damage skills… yet some of it still read
 *  as 'turning a blow' etc."
 *
 *  ⚑ HE IS QUOTING THE ENGINE. This clause was four hardcoded sentences in BLADE vocabulary — "your blow is
 *  turned aside", "the blows meet and both scatter" — printed over a STANDOFF, whose whole definition (rule 18,
 *  in as many words) is "a confrontation where nobody has drawn and the meter is THEIR WILL, not their blood."
 *
 *  ⚠️ AND THE MODULE ALREADY KNEW BETTER ONE LINE DOWN: `meterWord` is injected precisely so a standoff's
 *  meter can read "their resolve" instead of "momentum" — which it did, in the same receipt, two words from a
 *  blow nobody threw. ⛑ One half of the sentence adapted to the frame and the other half never did.
 *
 *  ⛔ SO THE CLAUSES ARE DATA, LIKE `SB_VERB`, and for the reason its own comment gives: so the app and the sim
 *  can never describe one round in two vocabularies. ⬜ Content may replace any kind's set outright
 *  (`frameKinds[kind].clauses`); these are the defaults, and `fight` is the shape the others depart from. */
//  ⛑ THE FOUR ORIGINAL KEYS KEEP THEIR NAMES AND THEIR WORDS, so every `frameKinds[kind].clauses` override
//  content has already authored still lands on the case it was written for. The five `…Read` keys are new and
//  fall back to nothing — a kind that authors none of them gets the fight set's, which is the same rule the
//  whole table has always used.
export const SB_CLAUSES = {
  fight: { youHold: "you turn it aside", theyHold: "your blow is turned aside",
    bothPress: "the blows meet and both scatter", bothWait: "you both circle, testing",
    youRead: "you read it coming", youReadGuard: "you take their measure while they cover up",
    theyRead: "they read you as you come on", theyReadGuard: "you cover up while they take your measure",
    bothRead: "you each take the other's measure" },
  // ⚠️ NOBODY HAS DRAWN. A standoff is won by bending them, so nothing here may break, land or turn a blade.
  standoff: { youHold: "you give no ground", theyHold: "they do not budge",
    bothPress: "you press past each other, and neither bends", bothWait: "you both wait, and the silence works",
    youRead: "you see what they are reaching for", youReadGuard: "you weigh them while they give nothing away",
    theyRead: "they see straight through it", theyReadGuard: "you say nothing, and they weigh you",
    bothRead: "you each look for the other's tell" },
  chase: { youHold: "you slip it", theyHold: "they close the line you wanted",
    bothPress: "you both surge, and the gap holds", bothWait: "you both feint for the opening",
    youRead: "you spot the line before they take it", youReadGuard: "you mark their ground while they hold back",
    theyRead: "they read your line and cut for it", theyReadGuard: "you break the line, and they track it anyway",
    bothRead: "you each watch where the other will go" },
};

/** ⛔ CCODE-493 — what a PRESSURE TICK is called, in this kind's own words. Short, because the long form
 *  already exists: `kinds[kind].pressureLabel` is a full authored sentence and `encounters.js` renders it into
 *  the round's events. The receipt is the one-line version, so it gets the clause and the COUNT — which is the
 *  part Erik could not get anywhere: he read "driven back: ◆◆ 2/2" in the header and fought five more rounds. */
export const SB_TICK = {
  fight:    { them: "you drive them back", you: "they drive you back" },
  standoff: { them: "their certainty cracks", you: "your position gives" },
  chase:    { them: "you open the gap", you: "they close on you" },
  puzzle:   { them: "a piece of it comes clear", you: "that approach is spent" },
};

/** combo → clause key. The four legacy names are deliberate — see the note above the table. */
const CLAUSE_KEY = {
  press_press: "bothPress", press_def: "theyHold", def_press: "youHold", def_def: "bothWait",
  sense_press: "youRead", sense_def: "youReadGuard", press_sense: "theyRead",
  def_sense: "theyReadGuard", sense_sense: "bothRead",
};

/** The interaction clause — how the two declared moves READ against each other. Pure.
 *  `kind` selects the vocabulary; `clauses` lets content override a kind's set outright. */
export function interactionClause(playerVerb, opponentVerb, { kind = "fight", clauses = null } = {}) {
  const oPhrase = SB_VERB[opponentVerb] || opponentVerb;
  // ⛑ AN UNKNOWN KIND FALLS TO THE FIGHT SET, never to nothing — a missing clause would print "undefined"
  // into a player's receipt, which is worse than the wrong metaphor. The same rule now covers an unknown
  // COMBO: a kind that authors no read-clauses borrows the fight's rather than printing a blank.
  const set = { ...SB_CLAUSES.fight, ...(SB_CLAUSES[kind] || {}), ...(clauses || {}) };
  const key = CLAUSE_KEY[`${clauseRole(playerVerb)}_${clauseRole(opponentVerb)}`] || "bothPress";
  return `they ${oPhrase} — ${set[key] || SB_CLAUSES.fight[key] || set.bothPress}`;
}

/** Build the whole receipt line. Everything the app knows is INJECTED (`meterWord`, `meterMax`), so this
 *  function is total over its inputs and a simulation can drive it a hundred thousand times.
 *
 *  `rr` is the round result; `playerDecl` the declared move; `beforeMom` the momentum BEFORE this round —
 *  the argument whose corruption caused the bug, and which the sim now samples directly. */
export function receiptLine({ rr, playerDecl, beforeMom, scouting = false, meterWord = "momentum", meterMax = 16,
  kind = "fight", clauses = null, icon = null }) {
  const after = rr?.state?.momentum ?? beforeMom;
  const pe = rr?.pressureEvent || null;
  const { verdict } = roundVerdict(beforeMom, after, { pressureEvent: pe });
  const oVerb = rr?.oppDecl?.function || "press in", pVerb = playerDecl?.function;
  const oPhrase = SB_VERB[oVerb] || oVerb;
  const enBit = rr?.deltas?.energy ? ` · you ${rr.deltas.energy}e` : "";
  const hpBit = (rr?.deltas?.health || 0) < 0 ? ` · you −${Math.abs(rr.deltas.health)} hp` : "";
  const prox = after >= meterMax * 0.7 ? " · they're nearly done" : after <= -meterMax * 0.7 ? " · you're nearly overcome" : "";
  // CCODE-35: name what STUCK. An effect that lands silently is the same failure as a round that resolves
  // silently — the player has to see the thing their move left standing.
  const fxBit = (rr?.landed || []).map(f => ` · ${f.from === "player" ? "you gain" : "they gain"} ${f.label} ${f.value >= 0 ? "+" : ""}${f.value} for ${f.roundsLeft} round${f.roundsLeft === 1 ? "" : "s"}`).join("");
  // ⛔ CCODE-493 — AND THE METER STRING LIED THE SAME WAY THE VERDICT DID. On a break it printed the reset
  // value as the round's end — "momentum 4→4" — when the meter had gone to 10 and been PUT BACK. Now the
  // line shows where it actually got to, then says plainly that it resets, which is the rule (CCODE-38: being
  // driven back is real attrition and a fresh start, not a death).
  // ⚠️ AND IT SAYS "FULL" ONLY WHEN IT WAS. There are TWO doors into a break — the meter filling, and a
  // single CRUSHING swing (`delta >= surgeCrushEndsIt`) that banks a tick without the meter ever topping out.
  // Printing "full" for the second would be the same kind of lie one size smaller. ⛑ And the word replaces
  // the number on purpose: at the cap, `round(before)` and `round(meterWas)` are both the max, so the honest
  // pair printed "10→10" — true, unreadable, and indistinguishable from a round where nothing happened.
  const was = pe && Number.isFinite(Number(pe.meterWas)) ? Number(pe.meterWas) : null;
  const filled = was != null && Math.abs(was) >= meterMax - 0.001;
  const meter = was != null
    ? ` ${meterWord} ${Math.round(beforeMom)} → ${filled ? "FULL" : `${Math.round(was)}, a crushing blow`}, then back to ${Math.round(after)}`
    : ` ${meterWord} ${Math.round(beforeMom)}→${Math.round(after)}`;
  // ⚠️ THE TICK IS THE ROUND'S REAL RESULT, so it is named and COUNTED — how many they have taken of how
  // many it takes to break them. Erik read "driven back: ◆◆ 2/2" in the header and fought on for five more
  // rounds, because that header was retyping a flat dial the engine stopped using (see `breakThresholdFor`).
  const tick = SB_TICK[kind] || SB_TICK.fight;
  const broke = pe && Number.isFinite(Number(pe.breakAt)) && Number(pe.pressure) >= Number(pe.breakAt);
  const breakBit = pe
    ? ` · ⚡ ${pe.side === "opponent" ? tick.them : tick.you}`
      + (Number.isFinite(Number(pe.breakAt))
          ? (broke ? ` — that is ${pe.pressure} of ${pe.breakAt}: ${pe.side === "opponent" ? "they break" : "you break"}`
                   : ` — ${pe.pressure} of ${pe.breakAt} before ${pe.side === "opponent" ? "they" : "you"} break`)
          : "")
    : "";
  if (scouting) return `👁 You read them — they ${oPhrase}. You give nothing away.${meter}${enBit}${prox}${fxBit}`;
  // CCODE-37: a woven round says so — you did two things in one turn, and it cost you for both.
  const wov = playerDecl?.woven ? ` ⋈ woven with ${playerDecl.woven.name}` : "";
  // ⛔ SNG-588 — AND THE ICON WAS A BLADE ON A STANDOFF TOO. `frameKinds` authors one per kind (🗣 for a
  // standoff) and this printed ⚔ over a confrontation where nobody has drawn — the same half-adapted sentence
  // as the clause beside it, in a single character.
  return `${icon || "⚔"} You ${SB_VERB[pVerb] || pVerb} with ${playerDecl?.name}${wov} · ${interactionClause(pVerb, oVerb, { kind, clauses })} · ${gainPhrase(verdict)} ·${meter}${breakBit}${enBit}${hpBit}${prox}${fxBit}`;
}
