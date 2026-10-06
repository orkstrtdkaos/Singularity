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
  /* ⛔ THE PRECEDENCE IS AEVI'S, AND IT USED TO BE UPSIDE DOWN (SNG-677 §0, 2026-10-06).
   * She read the shipped map: *"'Millbrook +8' is not drawn at all. It is the town Silas is standing in, under
   * THE FELLOWSHIP OF THE FELL PELL. A map that names the realm and drops the town you are in has the order
   * backwards."* ⚠️ `power` was rank 0 and `place` rank 2, so a realm's name beat the town under it every time.
   * Her rule, and it is the right one — a map is read for where things ARE before it is read for whose they are:
   *   1. the place you are IN never drops  → rank -1, which nothing can evict
   *   2. places → 0, field sources → 1, named ground → 2
   *   3. powers → 3, LAST: a power has five candidate offsets and should spend them moving off the towns, and
   *      drop before it covers one. Its border still says whose ground it is.
   *   4. road exits are their own band and compete only with each other (the painter gives them their own space). */
  place: {
    font: (o) => `700 ${o?.here ? 13 : 12}px ui-serif, Georgia, "Times New Roman", serif`,
    fill: (o) => (o?.here ? "#f6d8bf" : "rgba(238,235,226,0.94)"),
    halo: "rgba(10,12,18,0.86)", haloWidth: 3, rank: 0,
    // ⛑ the one label on the map that may never be dropped: it answers "where am I".
    rankOf: (o) => (o?.here ? -1 : 0),
  },
  // ✅ "power | spaced capitals in the power's own hue, size scaled to its ground (15–22px)"
  power: {
    font: (o) => `700 ${Math.round(Math.max(15, Math.min(22, o?.size ?? 15)))}px ui-serif, Georgia, serif`,
    fill: (o) => o?.colour || "rgba(238,235,226,0.94)",
    halo: "rgba(10,12,18,0.86)", haloWidth: 3, letterSpacing: "0.14em",
    transform: (t) => String(t).toUpperCase(), rank: 3,
  },
  // ✅ "with an italic line under"
  powerUnder: {
    font: () => `italic 600 10px ui-serif, Georgia, serif`,
    fill: () => "rgba(232,228,218,0.82)",
    halo: "rgba(10,12,18,0.78)", haloWidth: 2.4, rank: 3,
  },
  // ✅ "district / quarter | spaced capitals, faint" — and the names LANDED (M13, `crossing_wards.json`).
  // ⛑ RANK 6, BELOW THE ROAD EXITS AT 5, because Aevi asked for exactly that ordering: *"below the gate
  // labels in weight … below the zoom where the gate labels thin, DROP THE WARDS FIRST."* A ward is the
  // city's own character and the gate label is how you leave; when the frame runs out, the way out wins.
  district: {
    font: () => `600 10px ui-serif, Georgia, serif`,
    fill: () => "rgba(60,52,40,0.62)",
    halo: "rgba(246,241,228,0.72)", haloWidth: 2, letterSpacing: "0.22em",
    transform: (t) => String(t).toUpperCase(), rank: 6,
  },
  // ⛔ M10 · A LANDMARK SITS ON THE CITY'S OWN PAPER, WHICH IS LIGHT. ✅ AEVI: *"the mock has DARK SERIF
  // WITH A LIGHT HALO."* ⚠️ The `place` style is cream ink in a dark halo, which is right over terrain and
  // muddy over cream paper — a dark halo on a light ground is a smudge round every letter. Same family, ink
  // and halo swapped, because the GROUND changed and not the kind of thing being named.
  landmark: {
    font: (o) => `700 ${o?.here ? 13 : 12}px ui-serif, Georgia, "Times New Roman", serif`,
    fill: () => "rgba(26,22,16,0.94)",
    halo: "rgba(248,244,232,0.88)", haloWidth: 3, rank: 0,
    rankOf: (o) => (o?.here ? -1 : 0),
  },
  // ⛑ …and the italic line under it. ⚠️ NO POPULATION: Aevi's mock lines ("a bench from every reach" for
  // the Coliseum) are HERS, written for the mock — nothing in content carries them. The reader is here and
  // reports zero, rather than deriving a caption from `descriptionSeed`, which is the regex-over-prose she
  // forbade in SNG-404.
  landmarkUnder: {
    font: () => `italic 600 10px ui-serif, Georgia, serif`,
    fill: () => "rgba(48,40,30,0.78)",
    halo: "rgba(248,244,232,0.80)", haloWidth: 2.4, rank: 1,
  },
  // the two the map already drew and had no row for
  ground: {
    font: (o) => `italic 600 11px ui-serif, Georgia, serif`,
    fill: (o) => (o?.below ? "rgba(190,180,225,0.92)" : "rgba(236,226,196,0.92)"),
    halo: "rgba(10,12,18,0.72)", haloWidth: 2.6, rank: 2,
  },
  // a field source names a CAUSE, not a place: a well or a sink and how strong. Rank 1 — above a town's name,
  // below a power's, because it explains something the map cannot otherwise say.
  source: {
    font: () => `700 10px ui-serif, Georgia, serif`,
    fill: (o) => (o?.well ? "#0b3f78" : "#8a1020"),
    halo: "rgba(248,250,255,0.88)", haloWidth: 2.6, rank: 1,
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
  // ⛔ RANK IS THE SPACE'S BUSINESS NOW, NOT THE PAINTER'S ORDER. ✅ AEVI, after reading the code: *"Places
  // are rank 2 in the table and powers rank 0, but in the paint the powers reserve first. The rank is the
  // table's on paper and still the CODE ORDER'S in practice."* She is exactly right, and it is the whole
  // reason a shared space did not fix the pile-up: one list does not help if whoever runs first simply wins.
  // ⛑ SO A BETTER-RANKED LABEL MAY EVICT WORSE-RANKED ONES and take their ground. The evicted are reported
  // rather than silently lost, because a caller that has already DRAWN one needs to know it was overruled —
  // which is why every pass must reserve before it draws.
  const evicted = [];
  const rankOf = (b) => (b && Number.isFinite(b.rank) ? b.rank : 9);
  return {
    boxes: taken,
    /** Try each candidate offset in turn; returns the placed box, or null if every one collides. */
    place(x, y, w, h, { kind = "place", offsets = null, clampTo = null, opts = {} } = {}) {
      const half = w / 2 + 2;
      // ⛑ A STYLE MAY RANK PER LABEL. The place you are standing in is the same STYLE as every other town and
      // a different CLAIM, so the style decides from the options rather than the caller picking a second kind.
      const st = LABEL_STYLES[kind] || {};
      const rank = typeof st.rankOf === "function" ? st.rankOf(opts) : (st.rank ?? 9);
      const cand = offsets || [[0, 0], [0, -(h + 6)], [0, h + 6], [-half - 8, 0], [half + 8, 0]];
      const made = (dx, dy) => {
        let cx = x + dx, cy = y + dy;
        if (clampTo) {
          cx = Math.max(half + 2, Math.min(clampTo.w - half - 2, cx));
          cy = Math.max(h + 2, Math.min(clampTo.h - 4, cy));
        }
        return { x0: cx - half, x1: cx + half, y0: cy - h, y1: cy + 4, x: cx, y: cy, kind, rank };
      };
      // ⛑ A FREE SPOT FIRST, ALWAYS. Eviction is the last resort, not the first move — a power that can sit
      // beside a town rather than through it should.
      for (const [dx, dy] of cand) { const b = made(dx, dy); if (!hits(b)) { taken.push(b); return b; } }
      // ⛔ THEN, AND ONLY THEN, RANK DECIDES. A box may take a spot it collides with when every box it
      // collides with is WORSE ranked; it may never push aside an equal or better one.
      for (const [dx, dy] of cand) {
        const b = made(dx, dy);
        const clash = taken.filter((o) => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0);
        if (!clash.length || !clash.every((o) => rankOf(o) > rank)) continue;
        for (const o of clash) { evicted.push(o); taken.splice(taken.indexOf(o), 1); }
        taken.push(b);
        return b;
      }
      return null;                                   // dropped, not shrunk — Aevi's A3 rule
    },
    /** What was overruled, so a pass that reserved earlier can skip drawing what it lost. */
    evicted,
    /** ⛔ IS THIS BOX STILL HELD? The question a deferred draw has to ask, because a box reserved early can be
     *  evicted by something better-ranked arriving later — and ink already on the canvas cannot be taken back. */
    holds: (b) => !!b && taken.includes(b),
    /** ⛔ THE CHECK A GATE CAN RUN: no two reserved boxes intersect. Aevi: *"that gate could not have passed
     *  this map."* It is the boxes that matter, and asserting the source text is how mine stayed green. */
    overlaps() {
      const bad = [];
      for (let i = 0; i < taken.length; i++) {
        for (let j = i + 1; j < taken.length; j++) {
          const a = taken[i], b = taken[j];
          if (a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1) bad.push([a, b]);
        }
      }
      return bad;
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
  // ⛔ MEASURE BEFORE RESETTING THE SPACING. ✅ AEVI found this in the browser: *"drawLabel sets
  // letterSpacing to 0px and THEN calls measureText, so the `w` it returns for `power` (0.14em) and
  // `powerUnder` (0.22em) is the UNSPACED width. The power pass sizes its box from that, so every power's
  // box is narrower than its ink."* ⚠️ A box narrower than its ink is worse than no box: the space thinks
  // it has reserved the label and the label overhangs it on both sides.
  const w = ctx.measureText(t).width;
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
  return { text: t, x, y, w };
}

/** ⛑ HOW BIG A POWER'S NAME IS, from how much ground it holds — Aevi's "size scaled to its ground (15–22px)".
 *  `area` is the power's cell count; `total` the frame's. Pure, so the gate can drive it. */
export function powerSize(area, total) {
  const f = total > 0 ? Math.max(0, Math.min(1, Number(area) / Number(total))) : 0;
  // √ rather than linear: a power with four times the ground reads twice as loud, not four times
  return 15 + (22 - 15) * Math.sqrt(Math.min(1, f * 4));
}
