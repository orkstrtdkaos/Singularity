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
  strike: "strike", break: "shatter at", hinder: "hamper", shield: "guard", ward: "ward", resist: "brace",
  reveal: "read", foresee: "foresee", track: "track", conceal: "slip aside", deceive: "feint",
  command: "command", bind: "bind", move: "reposition", travel: "reposition", open: "open a way",
  heal: "steady", mend: "mend", restore: "restore", empower: "empower", make: "conjure",
  transform: "reshape", summon: "call", sustain: "hold"
};

/** Functions that READ as defensive — they shape the interaction clause, not the mechanics. */
export const SB_DEFENSIVE = new Set(["shield", "ward", "resist", "conceal", "deceive"]);

/** How decisively the meter moved this round. THE function the live bug corrupted.
 *
 *  `before` and `after` must be the momentum on either side of THIS round. The 0.5 deadband is what makes
 *  "even" meaningful: a hair of drift is not an exchange anyone won. Returns
 *  { swing, verdict: "player" | "opponent" | "even" }. Pure. */
export function roundVerdict(before, after) {
  const b = Number(before) || 0, a = Number.isFinite(Number(after)) ? Number(after) : b;
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
export const SB_CLAUSES = {
  fight: { youHold: "you turn it aside", theyHold: "your blow is turned aside",
    bothPress: "the blows meet and both scatter", bothWait: "you both circle, testing" },
  // ⚠️ NOBODY HAS DRAWN. A standoff is won by bending them, so nothing here may break, land or turn a blade.
  standoff: { youHold: "you give no ground", theyHold: "they do not budge",
    bothPress: "you press past each other, and neither bends", bothWait: "you both wait, and the silence works" },
  chase: { youHold: "you slip it", theyHold: "they close the line you wanted",
    bothPress: "you both surge, and the gap holds", bothWait: "you both feint for the opening" },
};

/** The interaction clause — how the two declared moves READ against each other. Pure.
 *  `kind` selects the vocabulary; `clauses` lets content override a kind's set outright. */
export function interactionClause(playerVerb, opponentVerb, { kind = "fight", clauses = null } = {}) {
  const oPhrase = SB_VERB[opponentVerb] || opponentVerb;
  const pDef = SB_DEFENSIVE.has(playerVerb), oDef = SB_DEFENSIVE.has(opponentVerb);
  // ⛑ AN UNKNOWN KIND FALLS TO THE FIGHT SET, never to nothing — a missing clause would print "undefined"
  // into a player's receipt, which is worse than the wrong metaphor.
  const set = { ...SB_CLAUSES.fight, ...(SB_CLAUSES[kind] || {}), ...(clauses || {}) };
  return pDef && !oDef ? `they ${oPhrase} — ${set.youHold}`
    : !pDef && oDef ? `they ${oPhrase} — ${set.theyHold}`
    : !pDef && !oDef ? `they ${oPhrase} — ${set.bothPress}`
    : `they ${oPhrase} — ${set.bothWait}`;
}

/** Build the whole receipt line. Everything the app knows is INJECTED (`meterWord`, `meterMax`), so this
 *  function is total over its inputs and a simulation can drive it a hundred thousand times.
 *
 *  `rr` is the round result; `playerDecl` the declared move; `beforeMom` the momentum BEFORE this round —
 *  the argument whose corruption caused the bug, and which the sim now samples directly. */
export function receiptLine({ rr, playerDecl, beforeMom, scouting = false, meterWord = "momentum", meterMax = 16,
  kind = "fight", clauses = null, icon = null }) {
  const after = rr?.state?.momentum ?? beforeMom;
  const { verdict } = roundVerdict(beforeMom, after);
  const oVerb = rr?.oppDecl?.function || "press in", pVerb = playerDecl?.function;
  const oPhrase = SB_VERB[oVerb] || oVerb;
  const enBit = rr?.deltas?.energy ? ` · you ${rr.deltas.energy}e` : "";
  const hpBit = (rr?.deltas?.health || 0) < 0 ? ` · you −${Math.abs(rr.deltas.health)} hp` : "";
  const prox = after >= meterMax * 0.7 ? " · they're nearly done" : after <= -meterMax * 0.7 ? " · you're nearly overcome" : "";
  // CCODE-35: name what STUCK. An effect that lands silently is the same failure as a round that resolves
  // silently — the player has to see the thing their move left standing.
  const fxBit = (rr?.landed || []).map(f => ` · ${f.from === "player" ? "you gain" : "they gain"} ${f.label} ${f.value >= 0 ? "+" : ""}${f.value} for ${f.roundsLeft} round${f.roundsLeft === 1 ? "" : "s"}`).join("");
  const meter = ` ${meterWord} ${Math.round(beforeMom)}→${Math.round(after)}`;
  if (scouting) return `👁 You read them — they ${oPhrase}. You give nothing away.${meter}${enBit}${prox}${fxBit}`;
  // CCODE-37: a woven round says so — you did two things in one turn, and it cost you for both.
  const wov = playerDecl?.woven ? ` ⋈ woven with ${playerDecl.woven.name}` : "";
  // ⛔ SNG-588 — AND THE ICON WAS A BLADE ON A STANDOFF TOO. `frameKinds` authors one per kind (🗣 for a
  // standoff) and this printed ⚔ over a confrontation where nobody has drawn — the same half-adapted sentence
  // as the clause beside it, in a single character.
  return `${icon || "⚔"} You ${SB_VERB[pVerb] || pVerb} with ${playerDecl?.name}${wov} · ${interactionClause(pVerb, oVerb, { kind, clauses })} · ${gainPhrase(verdict)} ·${meter}${enBit}${hpBit}${prox}${fxBit}`;
}
