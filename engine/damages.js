// engine/damages.js — CCODE-737 · ONE SHARED RECORD PER HOLD DEBT: what the culprit's game owes for a blow at another player's hold,
// where the keeper's search for them stands, and the payment when it comes. The OWNER's ledger reads it.
//
// ✅ AEVI, Q1 (2026-10-16): *"Should the hold's panel list who owes for it? Yes. Show each open debt on the hold: who it is, or 'someone
// seen' / 'nobody seen'; how much, and what they did; where the keeper's search stands: asking, sent, found. A paid or forgiven debt
// leaves the panel and stays in the hold's history. It's the owner's ledger, and it's what a player looks at before sending a band."*
// ⛔ THE SEARCH IS THE CULPRIT'S GAME'S, and the owner's game holds none of it — so the culprit's game publishes the reckoning, by the
// road the payment already travels (`tradeOutbox` → `world/trades`). One id per reckoning, from its first blow, so the search, the
// payment and a forgiveness are one record moving on, never three.
// ⚑ A LEAF: no imports. `holdings.js` (the debt ops), `mending.js` (the passes) and `holdtrade.js` (the merge) all read it, and each of
// them imports another — a shared helper anywhere else would close a cycle.

/** What ends a reckoning for good. */
export const DAMAGES_TERMINAL = new Set(["settled", "forgiven"]);

/** The record's id: whose hold, who owes, which hold, which reckoning (its first blow's event id). */
export function damagesId({ ownerId, culpritId, key, ref }) {
  return `damages|${ownerId}|${culpritId}|${key}|${ref}`;
}

/** One record. `status` is the reckoning's: owed · asking · sent · found · refused · paid · forgiven (and `settled`, the owner's). */
export function damagesRecord({ owedTo = {}, culprit = {}, key, ref, status, rev = 0, amount = null, currency = null, regionId = null,
                                value = null, hitIds = [], seen = null, collectedBy = null, worldDay = null }) {
  return {
    id: damagesId({ ownerId: owedTo.playerId, culpritId: culprit.id, key, ref }), kind: "damages", status, rev: Number(rev) || 0,
    ownerId: owedTo.playerId || null, ownerName: owedTo.name || null, holdId: owedTo.holdId || null, holdName: owedTo.holdName || null,
    buyerId: culprit.id || null, buyerName: culprit.name || null, mapKey: key || null,
    amount, currency, regionId: regionId || null, value: Number.isFinite(Number(value)) ? Number(value) : null,
    hitIds: Array.isArray(hitIds) ? hitIds.slice(-40) : [], seen: seen || null, collectedBy: collectedBy || null, worldDay,
  };
}

/** Put a record in the character's outbox, replacing any older copy of the same one. */
export function queueDamages(character, rec) {
  if (!character || !rec?.id) return null;
  const box = (Array.isArray(character.tradeOutbox) ? character.tradeOutbox : []).filter((o) => o?.id !== rec.id);
  character.tradeOutbox = [...box, rec];
  return rec;
}

/** Of two copies of one record, the one that stands: an end (settled, forgiven) over everything; a payment over any search; else the
 *  later revision. ⚠️ Not the trades' forward-only stage: a culprit who flees sends the search back to `asking`, which is a later
 *  state of the reckoning and an earlier word. Pure. */
export function newerDamages(a, b) {
  if (!a) return b;
  if (!b) return a;
  const rank = (o) => (o.status === "settled" ? 3 : o.status === "forgiven" ? 3 : o.status === "paid" ? 2 : 1);
  if (rank(a) !== rank(b)) return rank(a) > rank(b) ? a : b;
  return (Number(b.rev) || 0) > (Number(a.rev) || 0) ? b : a;
}
