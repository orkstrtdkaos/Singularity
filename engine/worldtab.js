// engine/worldtab.js — SNG-276: THE WORLD tab, as a pure function of world state.
//
// Erik: "they have the arcs on their chronicle, but not who's doing what to them."
//
// ⚠️ WHY THIS IS A MODULE AND NOT A TEMPLATE INSIDE `app.js`. A render buried in the app can only be tested
// by pattern-matching its SOURCE — which proves the words are present and proves nothing about whether the
// thing runs. I wrote ten gates that all passed while the template had never once executed. A pure function
// of (arcs, footer) → html can be run headlessly against real simulated world state, so "it renders" becomes
// a fact instead of a hope. Same reasoning as `roundreceipt.js`.
//
// PRINCIPLE (Aevi): SHOW THE STATE, NOT THE MACHINE. A stage reads "Drift · stage 1/4", never 2.351351; a
// push reads "leaning hard", never 4.7. The engine keeps the floats; the sheet speaks the language.
//
// `esc` is INJECTED rather than imported — the app owns its own escaping, and a second copy of it here is a
// second thing to get wrong.
export function worldTabHtml({ arcs = [], foot = {}, effects = [], name = "", tabBar = () => "", esc = (s) => String(s ?? "") } = {}) {
  const dirMark = a => a.contested ? `<span class="wt-contested">⚔ contested</span>`
    : a.direction === "advanced" ? `<span class="wt-adv">⤴ advancing</span>`
    : a.direction === "receded" ? `<span class="wt-rec">⤵ pushed back</span>`
    : `<span class="hint">holding</span>`;
  // A person you have MET is a hook; a name you have merely heard is a fact. The sheet should not pretend
  // those are the same thing — it is the difference between "go find her" and "someone is out there".
  const person = m => `<span class="wt-who${m.known ? " wt-known" : ""}"${m.known ? ' title="you have met them"' : ''}>${esc(m.name)}</span>`;
  const side = (list, label) => list.length
    ? `<div class="wt-side"><span class="wt-side-label">${label}</span> ${list.slice(0, 3).map(m => `${person(m)} <span class="hint">· ${esc(m.lean)}</span>`).join(", ")}${list.length > 3 ? ` <span class="hint">and ${list.length - 3} others</span>` : ""}</div>`
    : "";

  const arcCards = arcs.map(a => `<div class="wt-arc">
    <div class="wt-arc-head"><strong>${esc(a.name)}</strong> — ${esc(a.stageName)} <span class="hint">stage ${a.stageNum}/${a.total}</span> ${dirMark(a)}</div>
    ${a.publicFace ? `<div class="wt-face">${esc(a.publicFace)}</div>` : ""}
    ${(effects.filter(x => x.arcName === a.name)).map(x => `<div class="wt-effect${x.inert ? " wt-inert" : ""}">▸ ${esc(x.text)}${x.inert ? ` <span class="hint">(authored, not yet felt)</span>` : ""}${x.why ? ` <span class="hint">— ${esc(x.why)}</span>` : ""}</div>`).join("")}
    ${side(a.forIt, "pushing it on")}
    ${side(a.againstIt, "holding it back")}
    ${!a.movers.length ? `<div class="hint">nobody is spending themselves on this one right now.</div>` : ""}
    ${a.contest?.duels ? `<div class="wt-line">${a.contest.duels} came to blows over it · ${a.contest.worked || 0} quietly got on with it</div>` : ""}
    ${a.casualties.map(c => `<div class="wt-cost">${c.kind === "killed" ? "☠" : "✦"} ${person(c.loser)} ${c.kind === "killed" ? "was killed by" : c.kind === "wounded" ? "was wounded by" : "was checked by"} ${person(c.winner)}</div>`).join("")}
    ${a.strikes.map(s => `<div class="wt-cost">† ${s.outcome === "guarded" ? `a strike at ${person(s.target)} was turned aside${s.guard ? ` by ${person(s.guard)}` : ""}` : `${person(s.target)} was struck at by ${person(s.sender)}’s people`}</div>`).join("")}
    ${a.retrievals.map(r => `<div class="wt-cost">${r.outcome === "return" ? `↺ ${person(r.by)} went into the dark and brought ${person(r.dead)} back` : r.sealed ? `✖ ${person(r.by)} reached too deep for ${person(r.dead)} — that road is closed now` : `… ${person(r.by)} reached for ${person(r.dead)} and did not reach far enough`}</div>`).join("")}
    ${a.births.map(b => `<div class="wt-line">someone new is spoken of here — they ${esc(b.origin || "stepped into it")}</div>`).join("")}
    ${a.vacancy ? `<div class="hint">${a.vacancy} who care about this went elsewhere instead.</div>` : ""}
  </div>`).join("");

  // ⚠️ A WORLD THAT HAS NOT TICKED YET HAS NONE OF THESE. The executing gate caught this immediately: a
  // fresh character has no `retrievalWanted`, no `neglectedLives`, and reading `.length` off undefined threw
  // and blanked the whole tab. Every source-pattern test I wrote passed the entire time.
  const wanted = foot.wanted || [], neglected = foot.neglected || [], living = foot.living || [];
  // ⚠️ DEFAULTED LIKE ITS NEIGHBOURS. The comment four lines up records that reading `.length` off an
  // absent list blanked this whole tab for a fresh character; a new list gets the same treatment.
  const returned = foot.returned || [];
  const cameBack = returned.length ? `<div class="cs-block"><h3 class="codex-title">↺ Back from the dark</h3>
    ${returned.slice(0, 6).map(r => `<div class="wt-line">${esc(r.name)} was brought back${r.day != null ? ` on day ${r.day}` : ""}${r.changed ? ` — ${esc(r.changed)}` : " — changed, but back"}</div>`).join("")}
    <div class="hint">The roads back are not all closed. Someone walked one.</div></div>` : "";
  const wantedBack = wanted.length ? `<div class="cs-block"><h3 class="codex-title">↺ Wanted back from the dark</h3>
    ${wanted.slice(0, 6).map(w => `<div class="wt-line">${esc(w.by)} is trying to reach ${esc(w.dead)}${w.waiting ? " — and has already failed once" : ""}</div>`).join("")}
    <div class="hint">Someone is doing the asking. That makes it a thing you could help with.</div></div>` : "";

  const home = (neglected.length || living.length) ? `<div class="cs-block"><h3 class="codex-title">☉ Lives, away from all this</h3>
    ${living.slice(0, 6).map(l => `<div class="wt-line">${esc(l.name)} ${esc(l.pursuit)}</div>`).join("")}
    ${neglected.length ? `<div class="wt-line">${neglected.slice(0, 6).map(n => esc(n.name)).join(", ")} ${neglected.length === 1 ? "has" : "have"} not been seen at home in a long while.</div>` : ""}
    ${foot.coverage && foot.coverage.lived && !foot.coverage.onThePage ? `<div class="hint">The valley’s people keep time for themselves; what they do with it is still being written.</div>` : ""}
  </div>` : "";

  return `<div class="screen" style="max-width:680px">
    <h2>${esc(name)}</h2>
    ${tabBar("world")}
    <p class="hint">What the valley is arguing about, and who is spending themselves on it. Names you have met are <span class="wt-who wt-known">marked</span>.</p>
    ${arcs.length ? arcCards : `<div class="insight">The world has not moved yet — come back after some time has passed.</div>`}
    ${cameBack}
    ${wantedBack}
    ${home}
  </div>`;
}
