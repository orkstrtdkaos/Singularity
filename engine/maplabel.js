// engine/maplabel.js — M2 + D1 (SNG-675): one label table, one draw path, one collision space.
//
// ✅ AEVI: *"One plain font for everything. The mocks use three styles. Make it one table that every label
// goes through."* And D1/M7: the pile-up, plus a label drawn twice.
//
// ⛔ MEASURED BEFORE BUILT, AND THE COUNT IS THE ARGUMENT. The region map had **six** label passes, every one
// setting `ctx.font` by hand and every one `system-ui, sans-serif`:
//
//   | pass             | font                     | halo        | collision                     |
//   | place names      | `600 10px`               | none        | ✅ `placeLabels`, two-pass     |
//   | power names      | `700 12–13px` + `600 9px`| 3px dark    | ⚠️ its own local `taken` list  |
//   | named ground     | `italic 600 11px`        | ⛔ none      | ⛔ none                        |
//   | field sources    | `700 10px`               | white       | ⛔ none                        |
//   | road exits       | `600 9px`                | ⛔ none      | ⛔ none                        |
//   | city landmarks   | `700 9px` / `600 10px`   | mixed       | ⛔ none                        |
//
// ⚠️ SO FOUR OF SIX COULD NOT SEE EACH OTHER AT ALL, and the two that avoided collisions kept SEPARATE sets —
// which is the pile-up exactly. It is not that one pass is buggy; it is that there was no such thing as "the
// labels of this map", only six passes that happened to draw on the same canvas.
//
// ⛑ AND M7's "DRAWN TWICE" HAS A SIMPLER CAUSE THAN A SECOND PASS. Aevi reported *"The Disputed Zone — Fr
// +3"*. The location is named **"The Disputed Zone — Fringe"** — 26 characters — and the place pass truncates
// with `.slice(0, 22)`, which cuts it to exactly `"The Disputed Zone — Fr"`. ⛔ A HARD SLICE MID-WORD, which
// `smartClamp` has existed to prevent since SNG-152 and which 29 other sites in app.js already use.

/** ⛔ THE TABLE. Aevi's three styles, in her words, plus the two the map already drew and had no row for.
 *
 *  ⚠️ SIZES ARE CSS PIXELS. The canvases carry a device-pixel transform (M1), so a number here means the same
 *  thing on a phone and on a desktop — which is the whole reason that transform exists.
 *  ⛑ `letterSpacing` IS A CANVAS PROPERTY, not a font-string token, and it is not universally supported;
 *  `applyStyle` sets it only where it exists and leaves the text alone otherwise, so a browser without it
 *  gets unspaced capitals rather than no label. */
export const LABEL_STYLES = {
  // ✅ "place | serif, bold, 12–13px, 3px dark halo"
  place: {
    font: (o) => `700 ${o?.here ? 13 : 12}px ui-serif, Georgia, "Times New Roman", serif`,
    fill: (o) => (o?.here ? "#f6d8bf" : "rgba(238,235,226,0.94)"),
    halo: "rgba(10,12,18,0.86)", haloWidth: 3, rank: 2,
  },
  // ✅ "power | spaced capitals in the power's own hue, size scaled to its ground (15–22px)"
  power: {
    font: (o) => `700 ${Math.round(Math.max(15, Math.min(22, o?.size ?? 15)))}px ui-serif, Georgia, serif`,
    fill: (o) => o?.colour || "rgba(238,235,226,0.94)",
    halo: "rgba(10,12,18,0.86)", haloWidth: 3, letterSpacing: "0.14em",
    transform: (t) => String(t).toUpperCase(), rank: 0,
  },
  // ✅ "with an italic line under"
  powerUnder: {
    font: () => `italic 600 10px ui-serif, Georgia, serif`,
    fill: () => "rgba(232,228,218,0.82)",
    halo: "rgba(10,12,18,0.78)", haloWidth: 2.4, rank: 0,
  },
  // ✅ "district / quarter | spaced capitals, faint"  ⚠️ NO POPULATION YET — the names are M13, and Aevi's.
  district: {
    font: () => `600 10px ui-serif, Georgia, serif`,
    fill: () => "rgba(228,222,206,0.52)",
    halo: "rgba(10,12,18,0.55)", haloWidth: 2, letterSpacing: "0.22em",
    transform: (t) => String(t).toUpperCase(), rank: 4,
  },
  // the two the map already drew and had no row for
  ground: {
    font: (o) => `italic 600 11px ui-serif, Georgia, serif`,
    fill: (o) => (o?.below ? "rgba(190,180,225,0.92)" : "rgba(236,226,196,0.92)"),
    halo: "rgba(10,12,18,0.72)", haloWidth: 2.6, rank: 3,
  },
  exit: {
    font: () => `600 10px ui-serif, Georgia, serif`,
    fill: () => "rgba(226,214,180,0.92)",
    halo: "rgba(10,12,18,0.78)", haloWidth: 2.4, rank: 5,
  },
};

/** ⛑ ONE PLACE THE CANVAS STATE IS SET, so a pass cannot forget the halo and inherit whatever the layer
 *  before it left behind. That has already happened once here: the region map's source labels drew "in
 *  whatever colour the field layer had left behind, which is the kind of thing that looks like a style choice
 *  until somebody asks why one map's labels are green." */
export function applyStyle(ctx, kind, opts = {}) {
  const s = LABEL_STYLES[kind] || LABEL_STYLES.place;
  ctx.font = typeof s.font === "function" ? s.font(opts) : s.font;
  ctx.lineJoin = "round";
  ctx.lineWidth = s.haloWidth;
  ctx.strokeStyle = s.halo;
  ctx.fillStyle = typeof s.fill === "function" ? s.fill(opts) : s.fill;
  // ⚠️ FEATURE-DETECTED, AND RESET EVERY TIME. Leaving 0.14em set would space the next pass's prose too.
  if ("letterSpacing" in ctx) ctx.letterSpacing = s.letterSpacing || "0px";
  return s;
}

/** The text as it will actually be DRAWN — which is what a box must be measured at.
 *  ⛔ `smartClamp`-SHAPED, NOT `.slice`. A hard cut produced "The Disputed Zone — Fr" out of
 *  "The Disputed Zone — Fringe" and Aevi reported it as a different defect entirely. */
export function labelText(text, kind, max = 0) {
  const s = LABEL_STYLES[kind] || LABEL_STYLES.place;
  let t = String(text ?? "");
  if (max > 0 && t.length > max) {
    const cut = t.slice(0, Math.max(1, max - 1));
    const sp = cut.lastIndexOf(" ");
    // ⚠️ only break on a word boundary that leaves something worth reading — otherwise the hard cut is honest
    t = (sp > max * 0.55 ? cut.slice(0, sp) : cut).replace(/[\s—–-]+$/, "") + "…";
  }
  return s.transform ? s.transform(t) : t;
}

/** ⛔ ONE COLLISION SPACE FOR THE WHOLE MAP (D1). Each pass reserves before it draws; a pass that cannot get
 *  its box does not draw, and says so to its caller.
 *
 *  ✅ AEVI'S RULE, WHICH THE PLACE PASS ALREADY FOLLOWED AND THE OTHER FIVE DID NOT: *"greedy placement,
 *  highest tier first, with four candidate positions per label. If none fits, the label is DROPPED and the
 *  glyph stays. Never shrink text to make it fit."*
 *  ⛑ RANK IS THE TABLE'S, so the order is a property of the style and not of which pass happens to run first
 *  — the thing that made six passes' precedence an accident of code order. */
export function labelSpace() {
  const taken = [];
  const hits = (b) => taken.find((o) => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0);
  return {
    boxes: taken,
    /** Try each candidate offset in turn; returns the placed box, or null if every one collides. */
    place(x, y, w, h, { kind = "place", offsets = null, clampTo = null } = {}) {
      const half = w / 2 + 2;
      const cand = offsets || [[0, 0], [0, -(h + 6)], [0, h + 6], [-half - 8, 0], [half + 8, 0]];
      for (const [dx, dy] of cand) {
        let cx = x + dx, cy = y + dy;
        if (clampTo) {
          cx = Math.max(half + 2, Math.min(clampTo.w - half - 2, cx));
          cy = Math.max(h + 2, Math.min(clampTo.h - 4, cy));
        }
        const b = { x0: cx - half, x1: cx + half, y0: cy - h, y1: cy + 4, x: cx, y: cy, kind };
        if (!hits(b)) { taken.push(b); return b; }
      }
      return null;
    },
    /** Reserve an exact box without trying alternatives — for a label that must sit where it sits. */
    claim(b) { if (hits(b)) return null; taken.push(b); return b; },
  };
}

/** Draw one label: halo first, then ink, through the table. Returns the box it occupied. */
export function drawLabel(ctx, text, x, y, kind = "place", opts = {}) {
  applyStyle(ctx, kind, opts);
  if (opts.align) ctx.textAlign = opts.align;
  const t = opts.raw ? String(text) : labelText(text, kind, opts.max || 0);
  if (!t) return null;
  ctx.strokeText(t, x, y);
  ctx.fillText(t, x, y);
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
  return { text: t, x, y, w: ctx.measureText(t).width };
}

/** ⛑ HOW BIG A POWER'S NAME IS, from how much ground it holds — Aevi's "size scaled to its ground (15–22px)".
 *  `area` is the power's cell count; `total` the frame's. Pure, so the gate can drive it. */
export function powerSize(area, total) {
  const f = total > 0 ? Math.max(0, Math.min(1, Number(area) / Number(total))) : 0;
  // √ rather than linear: a power with four times the ground reads twice as loud, not four times
  return 15 + (22 - 15) * Math.sqrt(Math.min(1, f * 4));
}
