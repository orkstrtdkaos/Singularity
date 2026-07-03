// app.js — Singularity v0.1 shell: character creation, the play loop, settings.
// Engine does the math (resolve/sense/reputation/profile); GM model does the words.

import { loadContent, loreForLocation, eventsForGM, getPlayerKey, setPlayerKey, listCharacters, saveCharacter, loadCharacter, saveProfile, loadProfile, exportSave, importSave } from "./engine/state.js";
import { resolveAction, successChance, applyEnergyCost } from "./engine/resolve.js";
import { senseAction } from "./engine/sense.js";
import { recordDeed, standingWith, reputationSummary } from "./engine/reputation.js";
import { newProfile, updateProfile, aptitudeMods, profileInsight } from "./engine/playerprofile.js";
import { gmTurn, parseIntent } from "./engine/gm.js";
import { getApiKey, setApiKey } from "./engine/claude.js";
import { syncEnabled, getSyncConfig, setSyncConfig, backupSaves, appendLedger } from "./engine/sync.js";

const APP_VERSION = "0.1.0";
const app = document.getElementById("app");

let CONTENT = null;      // packs: rules, spectrums, abilities, locations, npcs, events, lore, region
let character = null;    // active character
let profile = null;      // the player's profile (the human)
let sceneTurns = [];     // recent turn texts for scene continuity
let busy = false;

// ---------- boot ----------

(async function boot() {
  try {
    CONTENT = await loadContent();
  } catch (err) {
    app.innerHTML = `<div class="boot">Failed to load content packs: ${esc(err.message)}<br>Serve this folder over HTTP (packs load via fetch).</div>`;
    return;
  }
  profile = loadProfile(getPlayerKey()) || newProfile(getPlayerKey());
  if (!getApiKey()) renderSettings("Welcome. Add your Anthropic API key to begin.");
  else renderRoster();
})();

// ---------- shared chrome ----------

function chrome(inner) {
  app.innerHTML = `
    <div class="topbar">
      <div><h1>SINGULARITY</h1><span class="sub">The Valley of Echoes — v${APP_VERSION}</span></div>
      <div class="actions">
        <button id="nav-roster">Characters</button>
        <button id="nav-settings">Settings</button>
      </div>
    </div>
    ${inner}`;
  document.getElementById("nav-roster").onclick = () => renderRoster();
  document.getElementById("nav-settings").onclick = () => renderSettings();
}

// ---------- settings ----------

function renderSettings(note = "") {
  const sc = getSyncConfig();
  chrome(`<div class="screen">
    <h2>Settings</h2>
    ${note ? `<p class="hint" style="margin-bottom:12px">${esc(note)}</p>` : ""}
    <div class="field"><label>Your name (player, not character)</label>
      <input id="set-player" value="${esc(profile.displayName || "")}" placeholder="e.g. Erik"></div>
    <div class="field"><label>Anthropic API key</label>
      <input id="set-key" type="password" value="${esc(getApiKey())}" placeholder="sk-ant-...">
      <div class="hint">Stored in this browser's localStorage only. Never written to any file or repo.</div></div>
    <div class="field"><label>Shared world sync (optional — GitHub)</label>
      <input id="set-owner" value="${esc(sc.owner)}" placeholder="GitHub owner (e.g. orkstrtdkaos)" style="margin-bottom:6px">
      <input id="set-repo" value="${esc(sc.repo)}" placeholder="Repo (e.g. Singularity)" style="margin-bottom:6px">
      <input id="set-pat" type="password" value="${esc(sc.pat)}" placeholder="GitHub PAT with contents:write">
      <div class="hint">When set, your character, player profile, and world events back up to the shared repo. Leave empty for local-only play.</div></div>
    <button class="btn" id="set-save">Save</button>
    <div class="footer-note">Save data is in this browser. Use Export on the Characters screen to move it.</div>
  </div>`);
  document.getElementById("set-save").onclick = () => {
    profile.displayName = document.getElementById("set-player").value.trim();
    saveProfile(profile);
    setApiKey(document.getElementById("set-key").value);
    setSyncConfig({
      owner: document.getElementById("set-owner").value,
      repo: document.getElementById("set-repo").value,
      pat: document.getElementById("set-pat").value
    });
    renderRoster();
  };
}

// ---------- roster ----------

function renderRoster() {
  const chars = listCharacters();
  chrome(`<div class="screen">
    <h2>Your Characters</h2>
    ${chars.length === 0 ? `<p class="hint" style="margin-bottom:14px">No characters yet. The valley is waiting.</p>` : ""}
    <div id="roster">${chars.map(c => `
      <div class="roster-item">
        <div><strong>${esc(c.name)}</strong> <span class="hint">${esc(c.origin)} · level ${c.level}</span></div>
        <div><button class="btn" data-play="${esc(c.id)}">Play</button></div>
      </div>`).join("")}</div>
    <div style="margin-top:16px; display:flex; gap:8px;">
      <button class="btn" id="new-char">New Character</button>
      <button class="btn secondary" id="export-save">Export saves</button>
      <button class="btn secondary" id="import-save">Import</button>
    </div>
    <div class="field" style="margin-top:14px">
      <div class="insight">${esc(profileInsight(profile, CONTENT.rules.playerAptitudes))}</div>
    </div>
  </div>`);
  document.getElementById("new-char").onclick = () => renderCreate();
  document.getElementById("export-save").onclick = () => {
    const chars2 = listCharacters();
    const blob = new Blob([exportSave(chars2[0]?.id, profile.playerKey)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "singularity-save.json"; a.click();
  };
  document.getElementById("import-save").onclick = () => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = ".json";
    input.onchange = async () => {
      const text = await input.files[0].text();
      try { importSave(text); renderRoster(); } catch (e) { alert("Import failed: " + e.message); }
    };
    input.click();
  };
  for (const btn of app.querySelectorAll("[data-play]")) {
    btn.onclick = () => { character = loadCharacter(btn.dataset.play); enterPlay(); };
  }
}

// ---------- character creation ----------

const BACKGROUNDS = [
  ["former-professional", "Former Professional", "Pre-Transition career skills and connections"],
  ["community-organizer", "Community Organizer", "Conflict resolution, trust networks"],
  ["craftsman", "Craftsman / Artisan", "Making, mending, material sense"],
  ["survivalist", "Survivalist", "Trails, weather, staying alive outdoors"],
  ["medic", "Medical Practitioner", "Healing arts, herbal and practical"]
];

function renderCreate() {
  const state = { name: "", origin: "valley", background: "craftsman", attrs: { physical: 3, mental: 3, social: 3, practical: 3 }, abilities: [] };
  const POOL = 12;

  function abilityChoices() {
    const all = Object.values(CONTENT.abilities).filter(a => a.levelReq <= 1);
    if (state.origin === "harmonic") return all.filter(a => a.powerSystem === "harmonic");
    if (state.origin === "radiant") return all.filter(a => a.powerSystem === "radiant");
    return all; // valley: unaligned may pick from either, but only one
  }
  function maxAbilities() { return state.origin === "valley" ? 1 : 2; }

  function draw() {
    const spent = Object.values(state.attrs).reduce((a, b) => a + b, 0);
    const left = POOL - spent;
    const okAb = abilityChoices();
    state.abilities = state.abilities.filter(id => okAb.some(a => a.id === id)).slice(0, maxAbilities());
    const valid = state.name.trim().length > 0 && left === 0 && state.abilities.length === maxAbilities();

    chrome(`<div class="screen">
      <h2>New Character</h2>
      <div class="field"><label>Name</label><input id="c-name" value="${esc(state.name)}"></div>
      <div class="field"><label>Origin</label>
        <div class="opt-row">
          ${[["harmonic", "Harmonic Heights (sonic)"], ["radiant", "Radiant Plateau (light)"], ["valley", "Valley floor (unaligned)"]]
            .map(([v, l]) => `<button class="opt ${state.origin === v ? "selected" : ""}" data-origin="${v}">${l}</button>`).join("")}
        </div>
        <div class="hint">${state.origin === "valley" ? "Unaligned: start with 1 ability from either system; more options open later through play." : "Start with 2 abilities of your civilization's system."}</div></div>
      <div class="field"><label>Background</label>
        <div class="opt-row">${BACKGROUNDS.map(([v, l]) => `<button class="opt ${state.background === v ? "selected" : ""}" data-bg="${v}">${l}</button>`).join("")}</div>
        <div class="hint">${esc(BACKGROUNDS.find(b => b[0] === state.background)[2])}</div></div>
      <div class="field"><label>Attributes — points left: <strong>${left}</strong> (each 1–4)</label>
        ${Object.entries(state.attrs).map(([k, v]) => `
          <div class="point-row">
            <button data-dec="${k}">−</button><span class="pips">${"●".repeat(v)}${"○".repeat(4 - v)}</span><button data-inc="${k}">+</button>
            <span style="text-transform:capitalize">${k}</span>
          </div>`).join("")}</div>
      <div class="field"><label>Abilities — choose ${maxAbilities()}</label>
        <div class="opt-row">${okAb.map(a => `<button class="opt ${state.abilities.includes(a.id) ? "selected" : ""}" data-ab="${a.id}" title="${esc(a.description)}">${esc(a.name)}</button>`).join("")}</div>
        <div class="hint">${state.abilities.map(id => esc(CONTENT.abilities[id].description)).join(" · ") || "Hover for descriptions."}</div></div>
      <button class="btn" id="c-done" ${valid ? "" : "disabled"}>Begin in Millbrook</button>
    </div>`);

    document.getElementById("c-name").oninput = e => { state.name = e.target.value; document.getElementById("c-done").disabled = !(state.name.trim() && left === 0 && state.abilities.length === maxAbilities()); };
    for (const b of app.querySelectorAll("[data-origin]")) b.onclick = () => { state.origin = b.dataset.origin; state.abilities = []; draw(); };
    for (const b of app.querySelectorAll("[data-bg]")) b.onclick = () => { state.background = b.dataset.bg; draw(); };
    for (const b of app.querySelectorAll("[data-inc]")) b.onclick = () => { const k = b.dataset.inc; if (state.attrs[k] < 4 && left > 0) state.attrs[k]++; draw(); };
    for (const b of app.querySelectorAll("[data-dec]")) b.onclick = () => { const k = b.dataset.dec; if (state.attrs[k] > 1) state.attrs[k]--; draw(); };
    for (const b of app.querySelectorAll("[data-ab]")) b.onclick = () => {
      const id = b.dataset.ab;
      if (state.abilities.includes(id)) state.abilities = state.abilities.filter(x => x !== id);
      else if (state.abilities.length < maxAbilities()) state.abilities.push(id);
      draw();
    };
    document.getElementById("c-done").onclick = finish;
  }

  function finish() {
    const rules = CONTENT.rules;
    character = {
      schemaVersion: 1,
      id: "char-" + Date.now().toString(36),
      playerKey: profile.playerKey,
      name: state.name.trim(),
      origin: state.origin,
      background: state.background,
      level: 1, xp: 0,
      attributes: { ...state.attrs },
      skills: {},
      abilities: state.abilities.map(id => ({ abilityId: id, level: 1 })),
      alignment: {},
      attunement: 1,
      maxHealth: 15 + state.attrs.physical * 5, health: 15 + state.attrs.physical * 5,
      maxEnergy: rules.energy.max, energy: rules.energy.max,
      inventory: ["traveler's pack", "waterskin"],
      deeds: [], relationships: {}, chronicle: [],
      currentLocationId: CONTENT.startingLocation,
      activeScene: null
    };
    if (!profile.charactersPlayed.includes(character.id)) profile.charactersPlayed.push(character.id);
    saveCharacter(character); saveProfile(profile);
    enterPlay();
  }

  draw();
}

// ---------- play ----------

function enterPlay() {
  sceneTurns = [];
  if (character.activeScene?.turns?.length) {
    sceneTurns = character.activeScene.turns;
    renderPlay(character.activeScene.lastTurn, { resumed: true });
  } else {
    startScene();
  }
}

async function startScene(prompt = "(Scene opening — set the scene where the character currently is and present the situation.)") {
  renderPlay(null, { thinking: "The valley takes shape…" });
  const result = await runGM({ resolution: null, playerInput: prompt });
  if (result) renderPlay(result.turn, { degraded: result.degraded });
}

async function runGM({ resolution, playerInput }) {
  busy = true;
  const location = CONTENT.locations[character.currentLocationId];
  const region = { ...CONTENT.region, activeEvents: eventsForGM(CONTENT.region, CONTENT.events) };
  const result = await gmTurn({
    character, location, region,
    lore: loreForLocation(location, CONTENT.lore),
    rules: CONTENT.rules,
    resolution, playerInput,
    recentTurns: sceneTurns.slice(-6)
  });
  busy = false;
  if (!result.ok) { renderPlay(null, { error: result.error }); return null; }
  applyTurn(result.turn, resolution);
  return result;
}

function applyTurn(turn, resolution) {
  const location = CONTENT.locations[character.currentLocationId];
  const mods = aptitudeMods(profile, CONTENT.rules.playerAptitudes);

  // deltas from the GM (bounded trust: clamp everything)
  const d = turn.characterDeltas || {};
  if (d.health) character.health = Math.max(0, Math.min(character.maxHealth, character.health + clampInt(d.health, -20, 10)));
  if (d.energy) character.energy = Math.max(0, Math.min(character.maxEnergy, character.energy + clampInt(d.energy, -20, 10)));
  if (d.xp) character.xp += Math.max(0, Math.min(25, d.xp | 0));
  for (const item of d.inventoryAdd || []) if (character.inventory.length < 30) character.inventory.push(String(item).slice(0, 60));
  for (const item of d.inventoryRemove || []) character.inventory = character.inventory.filter(i => i !== item);

  // deeds → reputation
  for (const deed of turn.deeds || []) {
    recordDeed(character, { ...deed, locationId: location.id, communityId: deed.communityId ?? location.communityId }, mods);
  }
  // relationships
  for (const r of turn.relationshipDeltas || []) {
    const rel = character.relationships[r.npcId] || { score: 0, notes: [] };
    rel.score += clampInt(r.delta, -3, 3);
    if (r.note) rel.notes = [...(rel.notes || []), r.note].slice(-5);
    character.relationships[r.npcId] = rel;
  }
  // spectrum fingerprint drifts toward the axes of what you actually did (EWMA)
  if (resolution?.action?.axes) {
    for (const [ax, v] of Object.entries(resolution.action.axes)) {
      const cur = character.alignment[ax] || 0;
      character.alignment[ax] = Math.max(-1, Math.min(1, cur * 0.95 + v * 0.05));
    }
  }
  // the HUMAN's profile learns from the intent tags of the chosen action
  if (resolution?.action?.intentTags?.length) {
    updateProfile(profile, resolution.action.intentTags, CONTENT.rules.playerAptitudes);
  }
  // level up: simple threshold — attunement and reserves grow
  const threshold = character.level * 100;
  if (character.xp >= threshold) {
    character.level++; character.attunement++;
    character.maxHealth += 5; character.maxEnergy += 5;
    character.health = character.maxHealth; character.energy = character.maxEnergy;
    turn.narration += `\n\n*You feel it settle into you — a new steadiness. (Level ${character.level}: attunement and reserves grow.)*`;
  }
  // chronicle + scene persistence
  if (turn.sceneSummary) {
    sceneTurns.push(turn.sceneSummary);
    if (turn.sceneEnded) { character.chronicle.push(turn.sceneSummary); sceneTurns = []; }
  }
  character.activeScene = turn.sceneEnded ? null : { locationId: character.currentLocationId, turns: sceneTurns, lastTurn: turn };
  saveCharacter(character); saveProfile(profile);

  // shared-world consequences (best-effort, never blocks play)
  if (syncEnabled()) {
    const events = (turn.ledgerEvents || []).map(e => ({
      schemaVersion: 1, at: new Date().toISOString(), who: character.id, playerKey: profile.playerKey,
      where: location.id, what: String(e.what || "").slice(0, 200), tags: e.tags || [],
      spectrumDeltas: e.spectrumDeltas || {}, visibility: e.visibility || "witnessed"
    }));
    if (events.length) appendLedger(events, character.id).catch(err => console.warn("[ledger]", err.message));
    backupSaves(character, profile);
  }
}

async function onChoice(choice) {
  if (busy) return;
  const location = CONTENT.locations[character.currentLocationId];
  const mods = aptitudeMods(profile, CONTENT.rules.playerAptitudes);

  // ability gating + energy
  let abilityLevel = 0, energyCost = choice.energyCost;
  if (choice.abilityId) {
    const owned = character.abilities.find(a => a.abilityId === choice.abilityId);
    if (!owned) { choice.abilityId = null; }
    else {
      abilityLevel = owned.level;
      energyCost = energyCost ?? CONTENT.abilities[choice.abilityId]?.energyCost;
      if (character.energy < (energyCost || 0)) { alert("Not enough energy — rest first."); return; }
    }
  }
  const action = { label: choice.label, attribute: choice.attribute || "practical", axes: choice.axes || {}, difficulty: choice.difficulty || 0, intentTags: choice.intentTags || [], abilityLevel, tags: choice.intentTags || [], planned: (choice.intentTags || []).some(t => ["plan", "prepare", "scout"].includes(t)) };
  const resolution = resolveAction({ character, action, location, rules: CONTENT.rules, aptitudeMods: mods });
  character.energy = applyEnergyCost(character, choice.abilityId ? energyCost : undefined, CONTENT.rules);

  renderPlay(null, { thinking: "…", playerBeat: { label: choice.label, resolution } });
  const result = await runGM({ resolution, playerInput: null });
  if (result) renderPlay(result.turn, { playerBeat: { label: choice.label, resolution }, degraded: result.degraded });
}

async function onFreeform(text) {
  if (busy || !text.trim()) return;
  renderPlay(null, { thinking: "Reading your intent…", playerBeat: { label: text } });
  const location = CONTENT.locations[character.currentLocationId];
  const intent = await parseIntent(text, character, location);
  if (intent.feasible === false) {
    renderPlay(character.activeScene?.lastTurn || null, { aside: intent.infeasibleReason || "That isn't possible here." });
    return;
  }
  await onChoice({ label: intent.label || text, attribute: intent.attribute, axes: intent.axes, difficulty: intent.difficulty, intentTags: intent.intentTags, abilityId: intent.abilityId, energyCost: null });
}

function travelTo(locId) {
  if (busy) return;
  character.currentLocationId = locId;
  character.activeScene = null;
  sceneTurns = [];
  saveCharacter(character);
  startScene(`(The character has just arrived here, traveling from elsewhere in the valley. Open the scene with the arrival.)`);
}

function rest() {
  if (busy) return;
  character.energy = Math.min(character.maxEnergy, character.energy + CONTENT.rules.energy.regenPerRest);
  character.health = Math.min(character.maxHealth, character.health + 3);
  saveCharacter(character);
  startScene(`(The character takes a real rest here — camp, inn, or quiet corner. Narrate the rest briefly, restore them, then present what's happening when they get up. Time has passed.)`);
}

// ---------- play rendering ----------

function renderPlay(turn, opts = {}) {
  const location = CONTENT.locations[character.currentLocationId];
  const rules = CONTENT.rules;
  const mods = aptitudeMods(profile, rules.playerAptitudes);
  const rep = location.communityId ? standingWith(character, location.communityId, rules) : null;

  const sheet = `<div class="sheet">
    <h2>${esc(character.name)}</h2>
    <div class="meta">${esc(character.origin)} · ${esc(character.background)} · level ${character.level} (${character.xp} xp)</div>
    Health <div class="bar health"><div style="width:${pct(character.health, character.maxHealth)}%"></div></div>
    Energy <div class="bar energy"><div style="width:${pct(character.energy, character.maxEnergy)}%"></div></div>
    <section><h3>Attributes</h3><div class="attr-grid">
      ${Object.entries(character.attributes).map(([k, v]) => `<div style="text-transform:capitalize">${k}</div><div>${"●".repeat(v)}${"○".repeat(Math.max(0, 4 - v))}</div>`).join("")}
    </div></section>
    <section><h3>Abilities</h3>
      ${character.abilities.map(a => { const ab = CONTENT.abilities[a.abilityId]; return `<div class="ability"><span class="name">${esc(ab?.name || a.abilityId)}</span> lv${a.level} <span class="cost">(${ab?.energyCost ?? "?"} energy)</span></div>`; }).join("") || "<div class='insight'>none yet</div>"}
    </section>
    <section><h3>Standing here</h3>
      ${rep ? `<span class="rep-band ${rep.band}">${rep.band} (${rep.score})</span>` : `<span class="insight">no community claims this place</span>`}
    </section>
    <section><h3>You, the player</h3><div class="insight">${esc(profileInsight(profile, rules.playerAptitudes))}</div></section>
    <section><h3>Travel</h3>
      ${(location.connections || []).map(id => `<button class="opt" data-travel="${id}" style="margin:2px 0; display:block; width:100%">${esc(CONTENT.locations[id]?.name || id)}</button>`).join("")}
      <button class="opt" id="do-rest" style="margin-top:8px; display:block; width:100%">Rest (+${rules.energy.regenPerRest} energy)</button>
    </section>
  </div>`;

  let main = `<div class="play"><div class="location-tag">${esc(location.name)}</div><div class="transcript">`;
  if (opts.playerBeat) {
    main += `<div class="beat player-action">▸ ${esc(opts.playerBeat.label)}</div>`;
    if (opts.playerBeat.resolution) {
      const r = opts.playerBeat.resolution;
      main += `<div class="roll-receipt">d100: ${r.roll} vs ${r.chance} — <span class="${r.degree}">${r.degree.replace("_", " ")}</span></div>`;
    }
  }
  if (opts.thinking) main += `<div class="thinking">${esc(opts.thinking)}</div>`;
  if (opts.aside) main += `<div class="beat"><em>${esc(opts.aside)}</em></div>`;
  if (opts.error) main += `<div class="error-card">The GM stumbled: ${esc(opts.error)}<br><button class="btn" id="retry" style="margin-top:8px">Try again</button></div>`;

  if (turn) {
    main += `<div class="beat">${turn.narration.split(/\n\n+/).map(p => `<p>${esc(p)}</p>`).join("")}</div>`;
    if (opts.degraded) main += `<div class="degraded-note">(The GM's structured reply failed — plain narration mode this turn.)</div>`;
    main += `<div class="choices">${(turn.choices || []).map((c, i) => {
      let senseHtml = "", abilityHtml = "";
      const action = { label: c.label, attribute: c.attribute || "practical", axes: c.axes || {}, difficulty: c.difficulty || 0, tags: c.intentTags || [], abilityLevel: 0, planned: (c.intentTags || []).some(t => ["plan", "prepare", "scout"].includes(t)) };
      if (c.abilityId && character.abilities.some(a => a.abilityId === c.abilityId)) {
        action.abilityLevel = character.abilities.find(a => a.abilityId === c.abilityId).level;
        abilityHtml = `<span class="ability-tag"> ✦ ${esc(CONTENT.abilities[c.abilityId]?.name || c.abilityId)}</span>`;
      }
      const chance = successChance({ character, action, location, rules, aptitudeMods: mods });
      const sense = senseAction({ character, action, location, rules, aptitudeMods: mods }, chance);
      if (sense.text) senseHtml = `<span class="sense">${esc(sense.text)}</span>`;
      return `<button class="choice" data-choice="${i}">${esc(c.label)}${abilityHtml}${senseHtml}</button>`;
    }).join("")}</div>`;
  }
  main += `</div>`;
  if (turn || opts.error) {
    main += `<div class="freeform"><input id="freeform-input" placeholder="Or do something else — describe it…" ${busy ? "disabled" : ""}><button id="freeform-go" ${busy ? "disabled" : ""}>Act</button></div>`;
  }
  main += `</div>`;

  chrome(`<div class="layout">${sheet}${main}</div>`);

  if (turn) {
    for (const btn of app.querySelectorAll("[data-choice]")) {
      btn.onclick = () => onChoice(turn.choices[parseInt(btn.dataset.choice)]);
    }
  }
  for (const btn of app.querySelectorAll("[data-travel]")) btn.onclick = () => travelTo(btn.dataset.travel);
  const restBtn = document.getElementById("do-rest"); if (restBtn) restBtn.onclick = rest;
  const ff = document.getElementById("freeform-input");
  const go = document.getElementById("freeform-go");
  if (ff && go) {
    go.onclick = () => onFreeform(ff.value);
    ff.onkeydown = e => { if (e.key === "Enter") onFreeform(ff.value); };
  }
  const retry = document.getElementById("retry");
  if (retry) retry.onclick = () => startScene("(Retry the previous beat — pick up smoothly from where the story last stood.)");
}

// ---------- utils ----------

function esc(s) { return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function pct(v, max) { return Math.round((v / Math.max(1, max)) * 100); }
function clampInt(v, min, max) { return Math.max(min, Math.min(max, v | 0)); }
