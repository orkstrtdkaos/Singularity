/* PO tooling, appended to app.js by serve.py only. Never shipped. */
;window.__aeviFilms = () => (CONTENT.films || []).map((f) => f.id);
;window.__aeviFilm = (id) => {
  const d = id === "opening" ? CONTENT.opening : (CONTENT.films || []).find((f) => f.id === id);
  if (!d) return "no such film";
  renderFilm(d, { mode: "library" });
  return d.id;
};
/* A frame of shot `idx` at `u`, eased in from the previous shot at rest the way renderFilm's frame loop does it
 * (dt = 1/30). `paintEvery: 1` paints every step as the player does: a landing's clock starts on the first frame its
 * station projects, so painting only the ends under-draws threads. Play a film once first so the ground raster is warm. */
;window.__aeviStill = (filmId, idx, u, opts = {}) => {
  const w = opts.w || 900, h = opts.h || 560;
  const doc = filmId === "opening" ? CONTENT.opening : (CONTENT.films || []).find((f) => f.id === filmId);
  const reel = filmReel(doc); const shots = reel.shots; const shot = shots[idx];
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h; const ctx = cv.getContext("2d");
  _filmLandSince.clear();
  const tgt = (j, uu) => filmTargets(shots[j]?.visual, { index: j, shrinkAt: -1, u: uu });
  let cur = idx > 0 ? tgt(idx - 1, 1) : null;
  const dur = shotSeconds(shot?.title || shot, reel.pacing);
  const fps = 30, steps = Math.max(1, Math.round(Math.min(1, u) * dur * fps));
  const every = opts.paintEvery || 0;
  for (let k = 0; k <= steps; k++) {
    const uk = Math.min(1, k / (dur * fps));
    const t = tgt(idx, uk); cur = cur ? filmEase(cur, t, 1 / fps, { reduced: false }) : t;
    if (k === 0 || k === steps || (every && k % every === 0)) {
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, w, h);
      paintFilmShot(ctx, shot, { reel, reduced: false, w, h, u: uk, index: idx, cur });
    }
  }
  let url = null; try { url = cv.toDataURL("image/jpeg", 0.88); } catch (e) { url = "tainted:" + e.message; }
  return { id: shot.id, visual: shot.visual, dur, url };
};
;window.__aeviShow = (urls, cols = 2) => {
  let o = document.getElementById("aevi-still");
  if (!o) { o = document.createElement("div"); o.id = "aevi-still"; document.body.appendChild(o); }
  o.style.cssText = "position:fixed;inset:0;z-index:2147483647;background:#000;display:grid;gap:4px;grid-template-columns:repeat(" + cols + ",1fr);align-content:start";
  o.innerHTML = urls.map((x) => `<div style="position:relative"><img src="${x.url}" style="width:100%;display:block"><span style="position:absolute;left:6px;top:4px;color:#ff0;font:12px monospace;background:#000a">${x.label || ""}</span></div>`).join("");
  return urls.length;
};
;window.__aeviHide = () => { document.getElementById("aevi-still")?.remove(); };
/* Module-scope probe: resolvers, kinds, landing clocks. */
;window.__aeviEval = (src) => eval(src);
