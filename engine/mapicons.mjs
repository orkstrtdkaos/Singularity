// engine/mapicons.mjs — SNG-409 §4. WHAT A PLACE LOOKS LIKE FROM OUTSIDE.
//
// Erik: "I don't want plain shape icons — I want cool magic gate shaped icon for the gates, Town icons
// for the towns, a small castle for a stronghold, a city, a bridge, a tower, a cave, etc."
// Aevi: "`tier` is SIZE, `role` is FUNCTION, `kind` is SHAPE… a waygate and a village are both
// `tier: settlement`; they should never share an icon."
//
// ⛔ HER TWELVE POLES ARE THE REASON THIS IS NOT COSMETIC. "They are pure extremities like the Blaze,
// the Scouring, the Numen. THEY ARE NOT TOWNS and an icon that says 'settlement' would lie about the
// most dangerous places in the world."
//
// ⚠️ SHE OFFERED TO COLLAPSE THE 34-KIND VOCABULARY IF IT WAS TOO FINE TO DRAW. IT SHOULD NOT BE
// COLLAPSED. The vocabulary is good content and it feeds narration as well as the map; what was
// actually needed was a MAPPING — 34 authored kinds onto 16 drawable glyphs, written down here where it
// can be argued with. Collapsing the source would have thrown away distinctions the prose still wants
// (an eyrie and a skyhold are both drawn as a tower, and are still different places to be told about).
//
// ⚠️ DRAWN, NOT FETCHED. Every glyph is canvas path work: this app has zero external runtime
// dependencies and an icon font or an SVG sprite sheet would break that for pictures of huts.

/** authored kind → glyph. ⛔ EXHAUSTIVE BY GATE: an unmapped kind fails the build rather than drawing
 *  as a default dot, because a silent default is how a pole ends up looking like a village. */
export const KIND_GLYPH = {
  // travel — the network, and the thing a player most needs to find
  waygate: "waygate", gate: "gate", bridge: "bridge", road: "road", street: "road",
  // settlement, by size
  city: "city", town: "town", village: "village", fen_town: "stilts", harbour: "harbour",
  // defended
  hold: "castle", march: "castle",
  // tall
  tower: "tower", towers: "tower", eyrie: "tower", skyhold: "tower",
  // roofed institutions
  hall: "hall", archive: "hall", arena: "arena", inn: "hall", shop: "market", market: "market",
  cathedral: "spire", temple: "spire", shrine: "spire", hermitage: "spire",
  // worked ground
  works: "works", terrace: "terrace", grove: "grove",
  // below
  underplace: "cave",
  // broken or wrong
  ruin: "ruin", waste: "waste", strange: "strange",
  // the extremities — their own mark, never a settlement's
  pole: "pole",
  // the map's own furniture
  region: "region",
};

/* ═════ SNG-678 · THE FIFTEEN SITE-SCALE KINDS ═════
 * ✅ AEVI (2026-10-06): *"A site's kind is either a location kind from `_vocabulary`, which already has
 * glyphs, or one of 15 site-scale kinds defined beside it in `_siteVocabulary`. Those fifteen need glyphs.
 * Each has a one-line meaning in the file. The vocabulary is closed."*
 * ⛔ A SEPARATE MAP, BECAUSE IT IS A SEPARATE VOCABULARY. She declared these in `_siteVocabulary`, not in
 * `_vocabulary`, and the two answer different questions: one is what a PLACE looks like from outside, the
 * other what a thing INSIDE a place looks like from above. Merging them into `KIND_GLYPH` would also have
 * quietly broken the reduction gate, which counts location kinds against drawable glyphs — and a gate
 * reddening because of a bookkeeping merge teaches nothing.
 * ⛑ DRAWN FROM HER DEFINITIONS, not from the words. `yard` is "an open working ground WITH A PURPOSE", so
 * it is an enclosure with a way in rather than a plain square; `circle` is "a figure laid on the ground that
 * HOLDS SOMETHING IN", so it is a ring of marks rather than a ring. Each case below cites its line.
 * ⚠️ These sit at SITE scale, inside a place's own frame, so they are lighter than a town's silhouette:
 * one or two strokes each. A site drawn as heavily as the town containing it reads as a second town. */
/* ═════ SNG-679 H3 · THE THREE MARKS A HOLD TAKES ═════
 * ✅ AEVI: *"A new `markerKind` for holds, with one shape for fixed holds and one for moving ones. The rung
 * or frame sets the size. Your own holds and other players' holds are told apart by COLOUR, NOT SHAPE."*
 * ⛔ SHAPE SAYS WHAT, COLOUR SAYS WHOSE, and keeping those on separate channels is what lets a glance answer
 * both at once. It is the rule `markerKind` already follows for places, where a waygate and a village never
 * share a shape — and the reason `holdMarker` returns `own` as its own field rather than a fourth shape.
 * ⛑ A HOLD IS NOT A PLACE AND MUST NOT READ AS ONE. These three are deliberately unlike the place alphabet:
 * a hold is a thing the player BUILT, sitting beside a place rather than being one, so it carries a filled
 * body where a place glyph is drawn in line only. The size comes from the rung, so a keep reads bigger than
 * a shed without needing a different silhouette. */
export const HOLD_GLYPH = { holdFixed: "holdFixed", holdMoving: "holdMoving", caravan: "caravanMark" };
export const ALL_HOLD_GLYPHS = [...new Set(Object.values(HOLD_GLYPH))];

export const SITE_GLYPH = {
  well: "well", green: "green", square: "square", quarter: "quarter", field: "field",
  mill: "mill", dock: "dock", ford: "ford", yard: "yard", burial: "burial",
  camp: "camp", cistern: "cistern", wall: "wall", circle: "circle", outcrop: "outcrop",
};

/** ⚠️ ORDER MATTERS AND IT IS NOT ALPHABETICAL: what you DO at a place outranks what it is made of. A
 *  waygate cut into a city is still drawn as a waygate, because the fast-travel network is the fact that
 *  changes a player's route. Pole outranks everything — Aevi's warning is explicit. */
export function glyphFor(meta) {
  if (!meta) return "town";
  const kind = meta.k || meta.kind || null;
  if (kind === "pole") return "pole";
  if (meta.wg || meta.role === "gate") return "waygate";
  // ⛑ A SITE KIND IS LOOKED UP SECOND, so a value that exists in both vocabularies keeps its PLACE
  // meaning — `field`, `grove` and `road` appear in each, and at region scale the place is what matters.
  return KIND_GLYPH[kind] || SITE_GLYPH[kind] || (meta.t === "region" ? "region" : null);
}

/** Draw a glyph centred at (x, y) on a 2D context. `s` is the nominal half-size in pixels.
 *  ⚠️ Every glyph is built from strokes on the SAME baseline so a row of them reads as one alphabet
 *  rather than a ransom note — the eye compares silhouettes, and inconsistent weight breaks that. */
/** ✅ SNG-679 S5 (CCODE-672): a state, drawn over (or, for a trace, instead of) a glyph. `crack` — a dark jagged line across it;
 *  `ruin` — broken walls: a gapped ring and a fallen slash; `trace` — a faint dot in a dashed ring where it stood. `s` is the
 *  glyph's half-size, so the mark scales with whatever it marks. */
export function drawStateMark(ctx, mark, x, y, s) {
  if (!mark) return;
  ctx.save();
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  if (mark === "crack") {
    ctx.strokeStyle = "rgba(255,240,220,0.9)"; ctx.lineWidth = Math.max(2, s * 0.32);
    const crack = () => { ctx.beginPath(); ctx.moveTo(x - s * 0.55, y - s * 0.95); ctx.lineTo(x - s * 0.05, y - s * 0.25); ctx.lineTo(x - s * 0.4, y + s * 0.15); ctx.lineTo(x + s * 0.35, y + s * 0.95); };
    crack(); ctx.stroke();
    ctx.strokeStyle = "rgba(122,28,18,0.95)"; ctx.lineWidth = Math.max(1, s * 0.16); crack(); ctx.stroke();
  } else if (mark === "ruin") {
    ctx.strokeStyle = "rgba(150,138,124,0.95)"; ctx.lineWidth = Math.max(1, s * 0.18);
    for (let k = 0; k < 5; k++) { const a0 = (k / 5) * Math.PI * 2 + 0.2, a1 = a0 + (Math.PI * 2) / 5 * 0.55; ctx.beginPath(); ctx.arc(x, y, s * 1.35, a0, a1); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(x - s * 0.9, y + s * 0.9); ctx.lineTo(x + s * 0.9, y - s * 0.9); ctx.stroke();
  } else if (mark === "mending") {
    // ✅ Part R · R2: under repair — a scaffold standing against it, two poles, a ledger and a brace, upper right of the mark
    ctx.strokeStyle = "rgba(150,108,56,0.95)"; ctx.lineWidth = Math.max(1, s * 0.14);
    const ox = x + s * 0.55, oy = y - s * 0.2;
    ctx.beginPath();
    ctx.moveTo(ox, oy - s * 0.9); ctx.lineTo(ox, oy + s * 0.9); ctx.moveTo(ox + s * 0.7, oy - s * 0.9); ctx.lineTo(ox + s * 0.7, oy + s * 0.9);
    ctx.moveTo(ox - s * 0.1, oy - s * 0.35); ctx.lineTo(ox + s * 0.8, oy - s * 0.35); ctx.moveTo(ox - s * 0.1, oy + s * 0.35); ctx.lineTo(ox + s * 0.8, oy + s * 0.35);
    ctx.moveTo(ox, oy + s * 0.35); ctx.lineTo(ox + s * 0.7, oy - s * 0.35);
    ctx.stroke();
  } else if (mark === "trace") {
    ctx.fillStyle = "rgba(214,202,180,0.5)"; ctx.beginPath(); ctx.arc(x, y, Math.max(1.5, s * 0.32), 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(214,202,180,0.45)"; ctx.lineWidth = 1; ctx.setLineDash([2, 2.5]);
    ctx.beginPath(); ctx.arc(x, y, s * 0.95, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
  }
  ctx.restore();
}

export function drawGlyph(ctx, glyph, x, y, s, style) {
  const ink = (style && style.ink) || "rgba(240,238,228,0.92)";
  const accent = (style && style.accent) || "#8fd0e8";
  const fill = (style && style.fill) || "rgba(20,22,28,0.55)";
  ctx.save();
  ctx.lineWidth = Math.max(1, s * 0.16);
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  ctx.strokeStyle = ink; ctx.fillStyle = fill;
  const P = (pts, close) => {
    ctx.beginPath(); ctx.moveTo(x + pts[0][0] * s, y + pts[0][1] * s);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(x + pts[i][0] * s, y + pts[i][1] * s);
    if (close) ctx.closePath();
  };

  switch (glyph) {
    case "unknown": {
      // ✅ ERIK (2026-10-07, via Aevi): a place the character has not heard of *"shows a '?' mark at the true spot, in
      // place of the glyph. The mark still takes a tap."* A disc in the fill with the question in the ink.
      ctx.beginPath(); ctx.arc(x, y, s * 0.95, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = ink; ctx.font = `bold ${Math.round(s * 1.5)}px serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("?", x, y + s * 0.05);
      break;
    }
    case "waygate": {
      // ⛔ A MADE ARCH THAT OPENS ELSEWHERE — the world's only fast travel, so it gets the accent colour
      // and a lit interior. Two uprights, a round head, and something shining in the gap.
      ctx.strokeStyle = accent;
      ctx.beginPath();
      ctx.moveTo(x - s * 0.7, y + s);
      ctx.lineTo(x - s * 0.7, y - s * 0.1);
      ctx.arc(x, y - s * 0.1, s * 0.7, Math.PI, 0);
      ctx.lineTo(x + s * 0.7, y + s);
      ctx.stroke();
      ctx.globalAlpha = 0.55; ctx.fillStyle = accent;
      ctx.beginPath(); ctx.ellipse(x, y + s * 0.15, s * 0.34, s * 0.62, 0, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case "gate":
      // a threshold in a wall — walked, not stepped through: posts and a lintel, no arch, no glow
      P([[-0.85, 1], [-0.85, -0.55], [0.85, -0.55], [0.85, 1]]); ctx.stroke();
      P([[-1.05, -0.55], [1.05, -0.55]]); ctx.stroke();
      break;
    case "bridge":
      // ⚠️ Erik asked for a bridge by name. An arch with its banks — the span is the point, so the
      // banks are drawn short and the curve carries the weight.
      ctx.beginPath(); ctx.arc(x, y + s * 0.45, s * 0.8, Math.PI, 0); ctx.stroke();
      P([[-1.05, 0.45], [-0.8, 0.45]]); ctx.stroke();
      P([[0.8, 0.45], [1.05, 0.45]]); ctx.stroke();
      P([[-0.45, 0.45], [-0.45, 0.95]]); ctx.stroke();
      P([[0.45, 0.45], [0.45, 0.95]]); ctx.stroke();
      break;
    case "road":
      // two rails converging — a way THROUGH, not a place to stop
      P([[-0.8, 1], [-0.25, -1]]); ctx.stroke();
      P([[0.8, 1], [0.25, -1]]); ctx.stroke();
      break;
    case "city":
      // walls and many roofs: three gables of different heights on one wall line
      P([[-1, 1], [-1, 0.1], [-0.55, -0.5], [-0.1, 0.1], [-0.1, 1]], true); ctx.fill(); ctx.stroke();
      P([[-0.1, 1], [-0.1, -0.25], [0.35, -0.85], [0.8, -0.25], [0.8, 1]], true); ctx.fill(); ctx.stroke();
      P([[-1.15, 1], [1.15, 1]]); ctx.stroke();
      break;
    case "town":
      // a working settlement: one gable and a road line
      P([[-0.75, 1], [-0.75, 0], [0, -0.7], [0.75, 0], [0.75, 1]], true); ctx.fill(); ctx.stroke();
      P([[-1, 1], [1, 1]]); ctx.stroke();
      break;
    case "village":
      // smaller than a town; fields visible from the last house — one small roof, no wall
      P([[-0.55, 1], [-0.55, 0.15], [0, -0.4], [0.55, 0.15], [0.55, 1]], true); ctx.fill(); ctx.stroke();
      break;
    case "stilts":
      // built on water — a roof standing on legs, over a waterline
      P([[-0.6, 0.25], [0, -0.5], [0.6, 0.25]]); ctx.stroke();
      P([[-0.42, 0.25], [-0.42, 0.8]]); ctx.stroke();
      P([[0.42, 0.25], [0.42, 0.8]]); ctx.stroke();
      ctx.strokeStyle = accent; P([[-1, 0.95], [1, 0.95]]); ctx.stroke();
      break;
    case "harbour":
      // a quay and the water it holds
      P([[-1, 0.5], [0.3, 0.5], [0.3, -0.6]]); ctx.stroke();
      ctx.strokeStyle = accent;
      ctx.beginPath(); ctx.arc(x + s * 0.3, y + s * 0.95, s * 0.55, Math.PI, 0); ctx.stroke();
      break;
    case "castle":
      // ⚠️ Erik: "a small castle for a stronghold." Crenellations are the whole silhouette — a block
      // with teeth reads as defended at eight pixels, which a tower does not.
      P([[-0.9, 1], [-0.9, -0.2], [-0.55, -0.2], [-0.55, -0.6], [-0.2, -0.6], [-0.2, -0.2],
         [0.2, -0.2], [0.2, -0.6], [0.55, -0.6], [0.55, -0.2], [0.9, -0.2], [0.9, 1]], true);
      ctx.fill(); ctx.stroke();
      break;
    case "tower":
      // one tall thing
      P([[-0.42, 1], [-0.42, -0.35], [0, -0.95], [0.42, -0.35], [0.42, 1]], true); ctx.fill(); ctx.stroke();
      break;
    case "hall":
      // a wide roof over a long room — institutions, archives, inns
      P([[-0.95, 1], [-0.95, 0.05], [0, -0.6], [0.95, 0.05], [0.95, 1]], true); ctx.fill(); ctx.stroke();
      P([[-0.95, 0.35], [0.95, 0.35]]); ctx.stroke();
      break;
    case "spire":
      // a raised place — temple, shrine, hermitage: a needle on a base
      P([[-0.6, 1], [0.6, 1]]); ctx.stroke();
      P([[-0.45, 1], [0, -0.95], [0.45, 1]], true); ctx.fill(); ctx.stroke();
      break;
    case "arena":
      // a ring you are watched in
      ctx.beginPath(); ctx.ellipse(x, y + s * 0.15, s * 0.95, s * 0.6, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(x, y + s * 0.15, s * 0.42, s * 0.24, 0, 0, Math.PI * 2); ctx.stroke();
      break;
    case "market":
      // an awning over a counter
      P([[-1, 0.1], [-0.6, -0.6], [0.6, -0.6], [1, 0.1]], true); ctx.fill(); ctx.stroke();
      P([[-1, 0.1], [1, 0.1]]); ctx.stroke();
      P([[-0.55, 0.1], [-0.55, 1]]); ctx.stroke();
      P([[0.55, 0.1], [0.55, 1]]); ctx.stroke();
      break;
    case "works":
      // worked ground — a stack with its plume, the one silhouette that reads as industry
      P([[-0.7, 1], [-0.7, -0.1], [-0.15, -0.1], [-0.15, 1]], true); ctx.fill(); ctx.stroke();
      P([[0.2, 1], [0.2, -0.65], [0.7, -0.65], [0.7, 1]], true); ctx.fill(); ctx.stroke();
      ctx.globalAlpha = 0.6;
      ctx.beginPath(); ctx.arc(x + s * 0.45, y - s * 0.95, s * 0.3, 0, Math.PI * 2); ctx.stroke();
      break;
    case "terrace":
      // steps cut into a slope
      P([[-1, 1], [-1, 0.4], [-0.3, 0.4], [-0.3, -0.15], [0.35, -0.15], [0.35, -0.7], [1, -0.7]]);
      ctx.stroke();
      break;
    case "grove":
      // a tree: trunk and canopy
      P([[0, 1], [0, 0.2]]); ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y - s * 0.35, s * 0.62, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      break;
    case "cave": {
      // ⚠️ Erik asked for a cave, and seventeen `underplace` locations need it — the mouth in a hillside,
      // with the dark actually dark so it reads as somewhere you go INTO.
      ctx.beginPath(); ctx.moveTo(x - s, y + s);
      ctx.quadraticCurveTo(x - s * 0.95, y - s * 0.85, x, y - s * 0.85);
      ctx.quadraticCurveTo(x + s * 0.95, y - s * 0.85, x + s, y + s);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "rgba(8,8,12,0.92)";
      ctx.beginPath(); ctx.moveTo(x - s * 0.5, y + s);
      ctx.quadraticCurveTo(x - s * 0.5, y - s * 0.25, x, y - s * 0.25);
      ctx.quadraticCurveTo(x + s * 0.5, y - s * 0.25, x + s * 0.5, y + s);
      ctx.closePath(); ctx.fill();
      break;
    }
    case "ruin":
      // what is left standing — broken stubs, deliberately uneven
      P([[-0.8, 1], [-0.8, -0.3], [-0.45, -0.3], [-0.45, 1]], true); ctx.fill(); ctx.stroke();
      P([[-0.05, 1], [-0.05, 0.15], [0.3, 0.15], [0.3, 1]], true); ctx.fill(); ctx.stroke();
      P([[0.62, 1], [0.62, -0.55], [0.92, -0.2], [0.92, 1]], true); ctx.fill(); ctx.stroke();
      break;
    case "waste":
      // nothing stands — a broken ground line and no structure at all
      P([[-1, 0.5], [-0.5, 0.75], [0, 0.4], [0.5, 0.8], [1, 0.5]]); ctx.stroke();
      ctx.globalAlpha = 0.7;
      P([[-0.6, 0.1], [-0.45, 0.1]]); ctx.stroke();
      P([[0.15, -0.1], [0.35, -0.1]]); ctx.stroke();
      break;
    case "strange":
      // a place that does not resolve — a spiral, drawn open so it never closes into a shape
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 3.2; a += 0.22) {
        const r = s * (0.12 + a * 0.155);
        const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r * 0.85;
        if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
      break;
    case "pole": {
      // ⛔ AEVI'S TWELVE. "Pure extremities — an icon that says 'settlement' would LIE about the most
      // dangerous places in the world." So: no roof, no ground line, nothing built. A radiant with a
      // hollow centre — it reads as a force rather than a place, which is what it is.
      ctx.strokeStyle = (style && style.poleInk) || "#e0a0b8";
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        P([[Math.cos(a) * 0.42, Math.sin(a) * 0.42], [Math.cos(a) * 1.05, Math.sin(a) * 1.05]]);
        ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(x, y, s * 0.3, 0, Math.PI * 2); ctx.stroke();
      break;
    }
    /* ═════ SNG-679 H3 · THE HOLD MARKS ═════ */
    case "holdFixed":
      /* a hold that stands: a filled body on its own ground line, so it reads as BUILT rather than as ground.
       * ⚠️ REDRAWN ONCE. A house-shaped pentagon measured 46% the same as the `gate` glyph — and the
       * rasteriser the similarity gate uses traces OUTLINES and ignores `fill()`, so the one thing that
       * actually separated them was invisible to the measurement. Rather than argue with the instrument, the
       * silhouette differs too: a diamond body on a base, where `gate` is an upright rectangle with a lintel. */
      ctx.fillStyle = ink;
      P([[0, -0.9], [0.75, -0.1], [0, 0.7], [-0.75, -0.1]], true);
      ctx.fill(); ctx.stroke();
      P([[-0.95, 0.9], [0.95, 0.9]]); ctx.stroke();
      break;
    case "holdMoving":
      // a hold under way: the same weight, on water — a hull, with its line beneath it
      ctx.fillStyle = ink;
      ctx.beginPath();
      ctx.moveTo(x - s * 0.9, y - s * 0.2);
      ctx.lineTo(x + s * 0.9, y - s * 0.2);
      ctx.lineTo(x + s * 0.45, y + s * 0.6);
      ctx.lineTo(x - s * 0.45, y + s * 0.6);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      P([[0, -0.2], [0, -0.95]]); ctx.stroke();
      break;
    case "caravanMark":
      // smaller, and plainly in motion: a body leaning forward with its load behind
      ctx.fillStyle = ink;
      P([[-0.85, 0.55], [-0.2, 0.55], [0.1, -0.1], [-0.55, -0.1]], true); ctx.fill(); ctx.stroke();
      P([[0.2, 0.55], [0.85, 0.55]]); ctx.stroke();
      break;
    /* ═════ SNG-678 · THE SITE-SCALE FIFTEEN ═════
     * Each cites the line it was drawn from. They are lighter than the place glyphs above on purpose: a
     * site sits INSIDE a place's frame, and one drawn as heavily as its town reads as a second town. */
    case "well":
      // "a well or spring people draw water from" — the shaft, and the windlass over it
      ctx.beginPath(); ctx.arc(x, y + s * 0.2, s * 0.5, 0, Math.PI * 2); ctx.stroke();
      P([[-0.7, -0.5], [0.7, -0.5]]); ctx.stroke();
      P([[0, -0.5], [0, -0.3]]); ctx.stroke();
      break;
    case "green":
      /* "open common ground inside or beside a settlement" — open, with the grass showing.
       * ⛑ The ring is BROKEN and the grass stands above it, because a closed oval measured 46% the same as
       * `arena`, which is the nearest place glyph it could be mistaken for. Common ground has no edge. */
      ctx.beginPath(); ctx.ellipse(x, y + s * 0.25, s * 0.9, s * 0.5, 0, Math.PI * 0.08, Math.PI * 0.92); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(x, y + s * 0.25, s * 0.9, s * 0.5, 0, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
      for (const dx of [-0.45, -0.15, 0.15, 0.45]) { P([[dx, 0.3], [dx + 0.08, -0.55]]); ctx.stroke(); }
      break;
    case "square":
      /* "the open middle of a place, where people gather".
       * ⚠️ MEASURED AND REDRAWN TWICE. A plain rectangle outline overlapped the existing `gate` glyph 50%
       * and `yard` 73% at the gate's raster size (half-size 7, where strokes merge). ⛑ FOUR CORNERS AND AN
       * EMPTY MIDDLE: the silhouette is the corners, which no other glyph in either alphabet has, and the
       * emptiness is the content — it is the OPEN middle. */
      for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        P([[sx * 0.8, sy * 0.75], [sx * 0.8, sy * 0.3]]); ctx.stroke();
        P([[sx * 0.8, sy * 0.75], [sx * 0.32, sy * 0.75]]); ctx.stroke();
      }
      break;
    case "quarter":
      // "a part of a town with its own character" — a block of roofs, one of them its own
      P([[-0.95, 0.8], [-0.95, -0.1], [-0.35, -0.6], [0.25, -0.1], [0.25, 0.8]]); ctx.stroke();
      P([[0.25, 0.8], [0.25, 0.1], [0.65, -0.25], [1.0, 0.1], [1.0, 0.8]]); ctx.stroke();
      break;
    case "field":
      // "worked ground: crops, hay, grazing" — furrows, which is what makes it worked rather than open
      P([[-0.95, 0.75], [-0.6, -0.6], [0.95, -0.6], [0.6, 0.75]], true); ctx.stroke();
      for (const k of [-0.3, 0.1, 0.5]) { P([[k - 0.25, 0.75], [k, -0.6]]); ctx.stroke(); }
      break;
    case "mill":
      // "a wheel or works driven by water or wind" — the wheel is the whole of it
      ctx.beginPath(); ctx.arc(x, y, s * 0.72, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI;
        P([[Math.cos(a) * 0.72, Math.sin(a) * 0.72], [-Math.cos(a) * 0.72, -Math.sin(a) * 0.72]]); ctx.stroke(); }
      break;
    case "dock":
      // "a landing for boats" — a jetty standing out over water, so the water is drawn under it
      P([[-0.2, -0.6], [-0.2, 0.3], [0.95, 0.3]]); ctx.stroke();
      ctx.globalAlpha = 0.7;
      P([[-0.95, 0.65], [0.95, 0.65]]); ctx.stroke();
      P([[-0.95, 0.9], [0.95, 0.9]]); ctx.stroke();
      break;
    case "ford":
      // "a shallow place to cross water on foot" — the water, broken by the stones you cross on
      ctx.globalAlpha = 0.7;
      P([[-0.95, -0.25], [0.95, -0.25]]); ctx.stroke();
      P([[-0.95, 0.55], [0.95, 0.55]]); ctx.stroke();
      ctx.globalAlpha = 1;
      for (const dx of [-0.45, 0, 0.45]) { P([[dx, -0.45], [dx, 0.75]]); ctx.stroke(); }
      break;
    case "yard":
      /* "an open working ground WITH A PURPOSE".
       * ⚠️ MEASURED AND REDRAWN. My first cut was a rectangle with a gap in one side, and at half-size 7
       * the gap closes: it measured 73% the same as both `square` and the existing `gate`. ⛑ The PURPOSE is
       * now what carries the mark — an enclosure open at the top, crossed by the work being done in it. The
       * diagonal is the stroke no rectangle has, and `gate` opens downward where this opens up. */
      P([[-0.85, -0.7], [-0.85, 0.8], [0.85, 0.8], [0.85, -0.7]]); ctx.stroke();
      P([[-0.85, -0.7], [0.85, 0.8]]); ctx.stroke();
      break;
    case "burial":
      /* "where the dead are laid" — a low mound and one upright.
       * ⚠️ MEASURED AND REDRAWN. The mound was `arc(y + 0.75s, r = 0.85s)`, which reaches y + 1.6s: most of
       * it fell outside the glyph's own box and was clipped away, leaving 15 ink cells where its neighbours
       * put down 42 to 102. It read as a faint scratch rather than a mark. The mound sits on the baseline
       * now and the upright is the tallest thing in it, which is what a burial ground looks like from above
       * anyway: a rise with a stone standing out of it. */
      ctx.beginPath(); ctx.arc(x, y + s * 0.8, s * 0.95, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
      P([[-0.95, 0.8], [0.95, 0.8]]); ctx.stroke();
      P([[0, 0.3], [0, -0.85]]); ctx.stroke();
      P([[-0.34, -0.55], [0.34, -0.55]]); ctx.stroke();
      break;
    case "camp":
      // "people staying, under canvas or in billets, NOT LIVING HERE" — canvas, which is why it is open
      // at the foot: a tent is struck, a house is not
      P([[-0.85, 0.8], [0, -0.75], [0.85, 0.8]]); ctx.stroke();
      P([[-0.4, 0.8], [0, 0.1], [0.4, 0.8]]); ctx.stroke();
      break;
    case "cistern":
      // "stored water" — a vessel, with the water line inside it
      P([[-0.7, -0.6], [-0.55, 0.8], [0.55, 0.8], [0.7, -0.6]]); ctx.stroke();
      ctx.globalAlpha = 0.75;
      P([[-0.62, 0.05], [0.62, 0.05]]); ctx.stroke();
      break;
    case "wall":
      // "a wall that DEFINES a place" — so it is crenellated and it runs past the frame
      P([[-1.05, 0.7], [1.05, 0.7]]); ctx.stroke();
      P([[-1.05, 0.7], [-1.05, -0.1], [-0.6, -0.1], [-0.6, -0.5], [-0.15, -0.5], [-0.15, -0.1],
         [0.3, -0.1], [0.3, -0.5], [0.75, -0.5], [0.75, -0.1], [1.05, -0.1], [1.05, 0.7]]); ctx.stroke();
      break;
    case "circle":
      // "a figure laid on the ground that HOLDS SOMETHING IN" — a ring of marks, not a ring: the gaps
      // are where it is entered, and the inner mark is what it holds
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2;
        ctx.beginPath(); ctx.arc(x + Math.cos(a) * s * 0.85, y + Math.sin(a) * s * 0.85, Math.max(0.6, s * 0.13), 0, Math.PI * 2); ctx.stroke(); }
      ctx.globalAlpha = 0.6;
      ctx.beginPath(); ctx.arc(x, y, s * 0.3, 0, Math.PI * 2); ctx.stroke();
      break;
    case "outcrop":
      // "bare rock standing out of the land" — angular, and it breaks the ground line
      P([[-1.0, 0.8], [-0.5, 0.8], [-0.15, -0.3], [0.3, 0.35], [0.6, -0.65], [1.0, 0.8]]); ctx.stroke();
      ctx.globalAlpha = 0.65;
      P([[-0.15, -0.3], [0.1, 0.8]]); ctx.stroke();
      break;
    /* ═════ THE GROUND ALPHABET (CCODE-675) ═════
     * ✅ AEVI (the local ground, G4): *"New marks needed: farmstead, shed, machinery, crane, stacks, cairn, cairn row, post,
     * lens, scales, stair, fire, shelter, footings, figure, aperture, stone field, leviathan, solid, sun disc, column. …
     * Plain shapes are enough: a cog for machinery, a stack of bars for stacks, a gantry for crane."* ⛑ Drawn smaller than a
     * site and never labelled — they are the ground, not places to go. A cairn row is cairns; moored boats are `boat`. */
    case "farmstead":
      // the farmhouse, its barn at a right angle, and the yard between them fenced
      ctx.beginPath(); ctx.rect(x - s * 0.95, y - s * 0.1, s * 0.85, s * 0.55); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.rect(x + s * 0.15, y - s * 0.9, s * 0.75, s * 1.3); ctx.fill(); ctx.stroke();
      P([[-0.95, 0.45], [-0.95, 0.95], [0.9, 0.95], [0.9, 0.4]]); ctx.stroke();
      break;
    case "shed":
      // an open-sided shed: a roof on posts and no walls — the eaves, the ridge, the posts at the corners
      ctx.beginPath(); ctx.rect(x - s, y - s * 0.55, s * 2, s * 1.1); ctx.stroke();
      P([[-1, 0], [1, 0]]); ctx.stroke();
      for (const [px, py] of [[-1, -0.55], [1, -0.55], [-1, 0.55], [1, 0.55]]) { ctx.beginPath(); ctx.arc(x + px * s, y + py * s, s * 0.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
      break;
    case "machinery": {
      // a cog: the wheel, eight teeth, the hub
      ctx.beginPath(); ctx.arc(x, y, s * 0.55, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath();
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; ctx.moveTo(x + Math.cos(a) * s * 0.55, y + Math.sin(a) * s * 0.55); ctx.lineTo(x + Math.cos(a) * s * 0.95, y + Math.sin(a) * s * 0.95); }
      ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, s * 0.18, 0, Math.PI * 2); ctx.stroke();
      break;
    }
    case "crane":
      // a gantry: two legs, the beam across them, the hook hanging from it
      P([[-0.8, 1], [-0.8, -0.8]]); ctx.stroke(); P([[0.8, 1], [0.8, -0.8]]); ctx.stroke();
      P([[-1.05, -0.8], [1.05, -0.8]]); ctx.stroke();
      P([[0.25, -0.8], [0.25, 0.15]]); ctx.stroke();
      ctx.beginPath(); ctx.arc(x + s * 0.1, y + s * 0.15, s * 0.15, 0, Math.PI); ctx.stroke();
      break;
    case "stacks":
      // sorted material in rows: three bars stacked, each a little shorter
      for (const [y0, w0] of [[0.35, 1.9], [-0.15, 1.5], [-0.65, 1.1]]) { ctx.beginPath(); ctx.rect(x - (s * w0) / 2, y + s * y0, s * w0, s * 0.42); ctx.fill(); ctx.stroke(); }
      break;
    case "cairn":
      // a heap of stones: three, two, one
      for (const [cx0, cy0] of [[-0.58, 0.6], [0, 0.6], [0.58, 0.6], [-0.29, 0.08], [0.29, 0.08], [0, -0.44]]) { ctx.beginPath(); ctx.arc(x + cx0 * s, y + cy0 * s, s * 0.27, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
      break;
    case "post":
      // a post, a pillar, a lamp-pole: one upright on its foot, a mark at its head
      P([[0, 1], [0, -0.5]]); ctx.stroke(); P([[-0.4, 1], [0.4, 1]]); ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y - s * 0.72, s * 0.26, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      break;
    case "lens":
      // a mounted lens: the glass edge-on, its stand, and the light it throws
      ctx.beginPath(); ctx.ellipse(x - s * 0.35, y - s * 0.25, s * 0.26, s * 0.62, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      P([[-0.35, 0.37], [-0.35, 1]]); ctx.stroke(); P([[-0.75, 1], [0.05, 1]]); ctx.stroke();
      ctx.save(); ctx.strokeStyle = accent; P([[0, -0.25], [1.05, -0.75]]); ctx.stroke(); P([[0, -0.25], [1.05, 0.25]]); ctx.stroke(); ctx.restore();
      break;
    case "scales":
      // great balance scales: the post, the beam, a pan hung from each end
      P([[0, 1], [0, -0.85]]); ctx.stroke(); P([[-0.45, 1], [0.45, 1]]); ctx.stroke();
      P([[-0.9, -0.6], [0.9, -0.6]]); ctx.stroke();
      P([[-0.9, -0.6], [-0.9, 0.05]]); ctx.stroke(); P([[0.9, -0.6], [0.9, 0.05]]); ctx.stroke();
      ctx.beginPath(); ctx.arc(x - s * 0.9, y + s * 0.05, s * 0.3, 0, Math.PI); ctx.stroke();
      ctx.beginPath(); ctx.arc(x + s * 0.9, y + s * 0.05, s * 0.3, 0, Math.PI); ctx.stroke();
      break;
    case "stair":
      // a great stair: the flight in profile
      P([[-0.95, 0.9], [-0.95, 0.45], [-0.5, 0.45], [-0.5, 0], [-0.05, 0], [-0.05, -0.45], [0.4, -0.45], [0.4, -0.9], [0.95, -0.9], [0.95, 0.9]], true); ctx.fill(); ctx.stroke();
      break;
    case "fire":
      // an open fire: the flame on its ring of stones
      ctx.save(); ctx.fillStyle = "rgba(214,120,48,0.9)";
      P([[0, -1], [0.45, -0.25], [0.42, 0.3], [0, 0.55], [-0.42, 0.3], [-0.45, -0.25]], true); ctx.fill(); ctx.stroke(); ctx.restore();
      ctx.beginPath(); ctx.ellipse(x, y + s * 0.72, s * 0.8, s * 0.24, 0, 0, Math.PI * 2); ctx.stroke();
      break;
    case "shelter":
      // a drystone shelter: a thick half-ring of wall, its door to the lee
      ctx.save(); ctx.lineWidth = Math.max(1.5, s * 0.3);
      ctx.beginPath(); ctx.arc(x, y + s * 0.4, s * 0.85, Math.PI, Math.PI * 2); ctx.stroke(); ctx.restore();
      P([[-0.85, 0.4], [-0.3, 0.4]]); ctx.stroke(); P([[0.3, 0.4], [0.85, 0.4]]); ctx.stroke();
      break;
    case "footings":
      // the footprint of what is gone: the corners of a building, and nothing between them
      for (const [cx0, cy0, dx, dy] of [[-1, -0.7, 1, 1], [1, -0.7, -1, 1], [1, 0.7, -1, -1], [-1, 0.7, 1, -1]]) { P([[cx0 + dx * 0.45, cy0], [cx0, cy0], [cx0, cy0 + dy * 0.4]]); ctx.stroke(); }
      ctx.beginPath(); ctx.arc(x, y, s * 0.12, 0, Math.PI * 2); ctx.stroke();
      break;
    case "figure":
      // a great carved symbol standing in the open: a cut lozenge with its eye, on a plinth
      P([[0, -1], [0.62, -0.1], [0, 0.72], [-0.62, -0.1]], true); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y - s * 0.12, s * 0.16, 0, Math.PI * 2); ctx.stroke();
      P([[-0.7, 1], [0.7, 1]]); ctx.stroke();
      break;
    case "aperture":
      // a round opening in a wall: the face of the wall, and the dark round hole cut through it
      ctx.beginPath(); ctx.rect(x - s * 0.72, y - s * 0.95, s * 1.44, s * 1.9); ctx.fill(); ctx.stroke();
      ctx.save(); ctx.fillStyle = ink; ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.arc(x, y - s * 0.1, s * 0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
      break;
    case "stone_field":
      // many small upright stones in loose rows
      for (let r = -1; r <= 1; r++) for (let c = -1; c <= 1; c++) { const ox = c * 0.62 + (r === 0 ? 0.25 : 0), oy = r * 0.62; P([[ox, oy - 0.24], [ox, oy + 0.24]]); ctx.stroke(); }
      break;
    case "leviathan":
      // a leviathan's back breaking the water, huts on it
      ctx.beginPath(); ctx.arc(x, y + s * 0.45, s * 0.95, Math.PI, Math.PI * 2); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.save(); ctx.strokeStyle = accent; P([[-1.1, 0.72], [-0.7, 0.56], [-0.3, 0.72], [0.1, 0.56], [0.5, 0.72], [0.9, 0.56], [1.1, 0.66]]); ctx.stroke(); ctx.restore();
      for (const hx of [-0.4, 0.15]) { ctx.beginPath(); ctx.rect(x + hx * s, y - s * 0.3, s * 0.28, s * 0.26); ctx.stroke(); }
      break;
    case "solid":
      // a geometric solid with no way in: a cube, its three faces
      P([[0, -1], [0.87, -0.5], [0.87, 0.5], [0, 1], [-0.87, 0.5], [-0.87, -0.5]], true); ctx.fill(); ctx.stroke();
      P([[-0.87, -0.5], [0, 0], [0.87, -0.5]]); ctx.stroke(); P([[0, 0], [0, 1]]); ctx.stroke();
      break;
    case "sun_disc":
      // a kept sun in a cavern roof, ringed with its machinery
      ctx.save(); ctx.fillStyle = "rgba(240,196,80,0.92)"; ctx.beginPath(); ctx.arc(x, y, s * 0.42, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
      ctx.beginPath(); ctx.arc(x, y, s * 0.8, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; ctx.beginPath(); ctx.rect(x + Math.cos(a) * s * 0.8 - s * 0.13, y + Math.sin(a) * s * 0.8 - s * 0.13, s * 0.26, s * 0.26); ctx.fill(); ctx.stroke(); }
      break;
    case "column":
      // a column on the move: people and a cart in file on the road they are walking
      for (const cx0 of [-1.05, -0.7, 0.1, 0.45]) { ctx.beginPath(); ctx.arc(x + cx0 * s, y + (cx0 < 0 ? 0.25 : -0.25) * s, s * 0.17, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
      ctx.beginPath(); ctx.rect(x - s * 0.45, y - s * 0.05, s * 0.5, s * 0.5); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.rect(x + s * 0.62, y - s * 0.55, s * 0.5, s * 0.5); ctx.fill(); ctx.stroke();
      break;
    case "boat":
      // a moored flat-bottomed boat: the hull, its thwart
      P([[-1, -0.32], [1, -0.32], [0.62, 0.36], [-0.62, 0.36]], true); ctx.fill(); ctx.stroke();
      P([[0, -0.32], [0, 0.36]]); ctx.stroke();
      break;
    case "region":
      // the map's own furniture — a seat, not a building
      ctx.strokeStyle = (style && style.regionInk) || "#e8d6a0";
      ctx.beginPath(); ctx.arc(x, y, s * 0.9, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 0.35;
      ctx.beginPath(); ctx.arc(x, y, s * 0.42, 0, Math.PI * 2); ctx.fill();
      break;
    default:
      ctx.beginPath(); ctx.arc(x, y, s * 0.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

/** The glyphs, for a legend and for a gate that wants to draw every one. */
export const ALL_GLYPHS = [...new Set(Object.values(KIND_GLYPH))];
// ⛑ KEPT APART from ALL_GLYPHS so the reduction gate keeps counting what it was written to count: how far
// the 34 LOCATION kinds fold onto drawable place glyphs. The site alphabet is its own claim.
export const ALL_SITE_GLYPHS = [...new Set(Object.values(SITE_GLYPH))];
/** ✅ AEVI (G4): the ground alphabet — what stands on a place's ground, unlabelled. Its own list for the same reason the
 *  site alphabet has one: each alphabet is judged against itself (content_ci, SNG-678's rasteriser). */
export const GROUND_GLYPHS = Object.freeze(["farmstead", "shed", "machinery", "crane", "stacks", "cairn", "post", "lens", "scales",
  "stair", "fire", "shelter", "footings", "figure", "aperture", "stone_field", "leviathan", "solid", "sun_disc", "column", "boat"]);
