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

/** ⚠️ ORDER MATTERS AND IT IS NOT ALPHABETICAL: what you DO at a place outranks what it is made of. A
 *  waygate cut into a city is still drawn as a waygate, because the fast-travel network is the fact that
 *  changes a player's route. Pole outranks everything — Aevi's warning is explicit. */
export function glyphFor(meta) {
  if (!meta) return "town";
  const kind = meta.k || meta.kind || null;
  if (kind === "pole") return "pole";
  if (meta.wg || meta.role === "gate") return "waygate";
  return KIND_GLYPH[kind] || (meta.t === "region" ? "region" : null);
}

/** Draw a glyph centred at (x, y) on a 2D context. `s` is the nominal half-size in pixels.
 *  ⚠️ Every glyph is built from strokes on the SAME baseline so a row of them reads as one alphabet
 *  rather than a ransom note — the eye compares silhouettes, and inconsistent weight breaks that. */
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
