// scripts/world/reanchor.mjs — SNG-393 rev 3. Names survive a terrain rebuild by POLAR SIGNATURE.
//
// Erik: "can't you just tune polar coordinates for the mouth and head?" — and Aevi's measurement backs
// him: signature drift across a rebuild is median 0.50°, while the town anchors rev 1 used sit 5.3° away
// with head spacing 5.6° — signal and noise the same size, 4 of 10 ambiguous. The signature: 0 of 12,
// tolerance 3° instead of 45°. "Precision beats stability when the drift is smaller than the error you
// are trying to avoid."
//
// ⛔ DRIFT IS HISTORY, NOT STATE — and Aevi's withdrawal (89a035ea) finished the thought: her own §5
// clause "write the new signature back after a successful resolve" was the same offence one file over,
// history in the INPUT. Worse than history, it was DESTRUCTION: the one build that ran with write-back
// live collapsed the Marchfen and the Stairfen — two distinct authored addresses ~10° apart — onto one
// polygon's centroid, byte-identical, her authoring recoverable only from git (0c040d85). So: the
// resolver READS canon and never writes it. The authored address stays authored; the asset row's score
// IS the real drift, visible on every build instead of reset to zero by a machine overwriting canon.
// The cost is honest too: drift accumulates from the committed address across successive terrain
// revisions, and a name that walks past 3° lands in the census for Aevi — detach-and-report, never
// track-and-hide.

const dDeg = (a, b) => {
  const R = Math.PI / 180;
  const la1 = a[0] * R, la2 = b[0] * R, dl = (a[1] - b[1]) * R;
  return Math.acos(Math.max(-1, Math.min(1, Math.sin(la1) * Math.sin(la2) + Math.cos(la1) * Math.cos(la2) * Math.cos(dl)))) / R;
};
const pathLen = (p) => { let s = 0; for (let i = 1; i < p.length; i++) s += dDeg(p[i - 1], p[i]); return s; };
const polyCentroid = (q) => [q.reduce((s, p) => s + p[0], 0) / q.length, q.reduce((s, p) => s + p[1], 0) / q.length];
const r2 = (x) => Math.round(x * 100) / 100;

/** Match every named river and fen against the freshly built hydrology. Read-only on `placenames`.
 *  ⚠️ Both river orientations are always scored: flow direction flips between rebuilds when two
 *  headwaters trade which is higher after smoothing. */
/** ⚠️ THE FALLBACK IS THE BOOTSTRAP, and the first live run needed it for all ten rivers. Aevi's
 *  signatures were measured against HER decomposition of the flow field; the port's is order-free and
 *  genuinely different (her Echo stem 91.3°, this one 110.8° — same water, different tributary cuts).
 *  Her spec kept nearHead/nearMouth "as a fallback when a signature fails" — this is that clause: match
 *  once through the towns at her rev-2 measured tolerance (45, the number she reported pair-matching
 *  NEEDED), write the true signature back, and every later run resolves at ≤3° with the towns idle. */
export function resolvePlaceNames(placenames, hydrology, { accept = 3.0, margin = 2.0, seedPos = null } = {}) {
  const out = { rivers: [], fens: [], unresolved: [] };

  // pool: the 24 longest traced rivers, index-stable against hydrology.rivers.
  // ⚠️ THE FALLBACK SEARCHES WIDER — every river of 4° or more — because pool size is not a
  // tolerance. Her named waters were HER ten majors; this port's 24-longest can exclude a modest named
  // stream entirely, and a name failing because its river was never a CANDIDATE is not restructuring,
  // it is the pool lying about the world. The 3° signature rule keeps the spec's pool of 24 exactly.
  // ⛔ THE SIGNATURE SCAN SEARCHES EVERY RIVER, diverging from the spec's pool of 24 — and the pool
  // cap itself was the bug, twice. Her ten named waters were all inside HER top 24; in the order-free
  // decomposition the Longshore Water ranks below the cap, so its written-back address pointed at a river
  // the signature scan was FORBIDDEN to see, and it re-bootstrapped through the towns on every build with
  // score 0. A pool cap is a proxy for "the majors", not a matching constraint — the 3° acceptance and
  // the margin do the discriminating, and they need no help from a lie about which rivers exist.
  const allRivers = (hydrology.rivers || []).map((p, i) => ({ i, p, len: pathLen(p) })).filter((c) => c.len >= 4);
  const riverPool = allRivers;
  const fallbackRiverPool = allRivers;
  for (const nm of placenames.rivers || []) {
    if (!Array.isArray(nm.head) || !Array.isArray(nm.mouth)) { out.unresolved.push({ id: nm.id, name: nm.name, reason: "no signature" }); continue; }
    if (!riverPool.length) { out.unresolved.push({ id: nm.id, name: nm.name, reason: "pool empty" }); continue; }
    const scored = riverPool.map((c) => {
      const first = c.p[0], last = c.p[c.p.length - 1];
      const fwd = dDeg(nm.head, first) + dDeg(nm.mouth, last);
      const rev = dDeg(nm.head, last) + dDeg(nm.mouth, first);
      return { c, score: Math.min(fwd, rev), flipped: rev < fwd };
    }).sort((a, b) => a.score - b.score);
    const best = scored[0], next = scored[1];
    const mrg = next ? next.score - best.score : Infinity;
    // ⚠️ AN EXACT ADDRESS IS NEVER AMBIGUOUS. The 2° margin was measured when runner-ups sat
    // 8–60° away; at the fixed point the written-back signature matches its own river at ~0°, and a
    // sibling stream 1.8° off would flunk the ABSOLUTE margin forever — one name re-bootstrapped through
    // the towns on every single build. Below the measured median drift (0.50°) the match IS the feature.
    const exact = best.score < 0.5;
    let chosen = best, via = "signature";
    if (best.score > accept || (mrg < margin && !exact)) {
      // fallback: the towns. Only when the signature cannot answer, and never silently.
      const hPos = seedPos && seedPos[nm.nearHead], mPos = seedPos && seedPos[nm.nearMouth];
      if (hPos && mPos) {
        const h = [hPos.lat, hPos.lon], m2 = [mPos.lat, mPos.lon];
        const fs = fallbackRiverPool.map((c) => {
          const first = c.p[0], last = c.p[c.p.length - 1];
          const fwd = dDeg(h, first) + dDeg(m2, last), rev = dDeg(h, last) + dDeg(m2, first);
          return { c, score: Math.min(fwd, rev), flipped: rev < fwd };
        }).sort((a, b) => a.score - b.score);
        const fMrg = fs[1] ? fs[1].score - fs[0].score : Infinity;
        if (fs[0].score <= 45 && fMrg >= 5) { chosen = fs[0]; via = "fallback"; }
      }
      if (via !== "fallback") {
        out.unresolved.push({ id: nm.id, name: nm.name, reason: best.score > accept ? "no candidate within 3°" : "ambiguous" });
        continue;
      }
    }
    // the row's score is the AUTHORED address against the bound feature — real drift, in signature
    // units even when the towns did the choosing, so one column never silently changes meaning.
    const path = chosen.c.p, first = path[0], last = path[path.length - 1];
    const sigScore = Math.min(dDeg(nm.head, first) + dDeg(nm.mouth, last), dDeg(nm.head, last) + dDeg(nm.mouth, first));
    out.rivers.push({ id: nm.id, name: nm.name, pathIndex: chosen.c.i,
      score: r2(sigScore), margin: r2(via === "fallback" ? 99 : mrg), resolved: true, via });
  }

  // pool: the 16 largest marsh polygons by shoelace area
  const area = (q) => { let A = 0; for (let k = 0; k < q.length; k++) { const a = q[(k - 1 + q.length) % q.length], b = q[k]; A += a[1] * b[0] - b[1] * a[0]; } return Math.abs(A) / 2; };
  const allFens = (hydrology.marsh || []).map((q, i) => ({ i, q, area: area(q), c: polyCentroid(q) }));
  const fenPool = allFens;                                      // same principle as the rivers — no pool cap
  const fallbackFenPool = allFens;
  for (const nm of placenames.fens || []) {
    if (!Array.isArray(nm.centroid)) { out.unresolved.push({ id: nm.id, name: nm.name, reason: "no signature" }); continue; }
    if (!fenPool.length) { out.unresolved.push({ id: nm.id, name: nm.name, reason: "pool empty" }); continue; }
    const scored = fenPool.map((c) => ({ c, score: dDeg(nm.centroid, c.c) })).sort((a, b) => a.score - b.score);
    const best = scored[0], next = scored[1];
    const mrg = next ? next.score - best.score : Infinity;
    const exactF = best.score < 0.5;
    let chosenF = best, viaF = "signature";
    if (best.score > accept || (mrg < margin && !exactF)) {
      const tPos = seedPos && seedPos[nm.near];
      if (tPos) {
        const fs = fallbackFenPool.map((c) => ({ c, score: dDeg([tPos.lat, tPos.lon], c.c) })).sort((a, b) => a.score - b.score);
        const fMrg = fs[1] ? fs[1].score - fs[0].score : Infinity;
        if (fs[0].score <= 12 && fMrg >= 3) { chosenF = fs[0]; viaF = "fallback"; }
      }
      if (viaF !== "fallback") {
        out.unresolved.push({ id: nm.id, name: nm.name, reason: best.score > accept ? "no candidate within 3°" : "ambiguous" });
        continue;
      }
    }
    out.fens.push({ id: nm.id, name: nm.name, polyIndex: chosenF.c.i,
      score: r2(dDeg(nm.centroid, chosenF.c.c)), margin: r2(viaF === "fallback" ? 99 : mrg), resolved: true, via: viaF });
  }
  return { placeNames: out };
}
