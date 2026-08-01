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

/** The interaction clause — how the two declared moves READ against each other. Pure. */
export function interactionClause(playerVerb, opponentVerb) {
  const oPhrase = SB_VERB[opponentVerb] || opponentVerb;
  const pDef = SB_DEFENSIVE.has(playerVerb), oDef = SB_DEFENSIVE.has(opponentVerb);
  return pDef && !oDef ? `they ${oPhrase} — you turn it aside`
    : !pDef && oDef ? `they ${oPhrase} — your blow is turned aside`
    : !pDef && !oDef ? `they ${oPhrase} — the blows meet and both scatter`
    : `they ${oPhrase} — you both circle, testing`;
}

/** Build the whole receipt line. Everything the app knows is INJECTED (`meterWord`, `meterMax`), so this
 *  function is total over its inputs and a simulation can drive it a hundred thousand times.
 *
 *  `rr` is the round result; `playerDecl` the declared move; `beforeMom` the momentum BEFORE this round —
 *  the argument whose corruption caused the bug, and which the sim now samples directly. */
export function receiptLine({ rr, playerDecl, beforeMom, scouting = false, meterWord = "momentum", meterMax = 16 }) {
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
  return `⚔ You ${SB_VERB[pVerb] || pVerb} with ${playerDecl?.name}${wov} · ${interactionClause(pVerb, oVerb)} · ${gainPhrase(verdict)} ·${meter}${enBit}${hpBit}${prox}${fxBit}`;
}
