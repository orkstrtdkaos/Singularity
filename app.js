// app.js — Singularity v0.1 shell: character creation, the play loop, settings.
// Engine does the math (resolve/sense/reputation/profile); GM model does the words.

import { loadContent, loreForLocation, eventsForGM, getPlayerKey, setPlayerKey, listCharacters, saveCharacter, loadCharacter, saveProfile, loadProfile, exportSave, importSave } from "./engine/state.js";
import { resolveAction, successChance, applyEnergyCost } from "./engine/resolve.js";
import { senseAction } from "./engine/sense.js";
import { recordDeed, standingWith, reputationSummary } from "./engine/reputation.js";
import { newProfile, updateProfile, aptitudeMods, profileInsight } from "./engine/playerprofile.js";
import { gmTurn, parseIntent, gmAsk, generateBio, sanitizeScene } from "./engine/gm.js";
import { applyQuestUpdates, questsForGM } from "./engine/quests.js";
import { getApiKey, setApiKey } from "./engine/claude.js";
import { syncEnabled, getSyncConfig, setSyncConfig, backupSaves, appendLedger } from "./engine/sync.js";
import { normalizeInventory, fromCatalog, addItem, removeItem, consumeItem, equipmentBonus, inventoryForGM } from "./engine/inventory.js";
import { newClock, readClock, advanceClock, getTimeSettings, setTimeSettings, ADVANCE, TIME_MODES } from "./engine/worldtime.js";
import { locationImage, itemImage, getArtMode, setArtMode, ART_MODES } from "./engine/art.js";
import { companionBonus, companionsForGM, activeCompanions } from "./engine/companions.js";

const APP_VERSION = "0.3.1";
const app = document.getElementById("app");

let CONTENT = null;      // packs: rules, spectrums, abilities, locations, npcs, events, lore, region
let character = null;    // active character
let profile = null;      // the player's profile (the human)
let sceneTurns = [];     // recent beats: {summary, narration} for scene continuity
let sceneState = null;   // authoritative scene anchor: setting, npcsPresent, objects, threads
let busy = false;
let examinedItem = null; // name of the item expanded in the sidebar
let askMode = false;     // input bar mode: false = act in scene, true = ask the GM (OOC)

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
  const ts = getTimeSettings();
  const artMode = getArtMode();
  chrome(`<div class="screen">
    <h2>Settings</h2>
    ${note ? `<p class="hint" style="margin-bottom:12px">${esc(note)}</p>` : ""}
    <div class="field"><label>Your name (player, not character)</label>
      <input id="set-player" value="${esc(profile.displayName || "")}" placeholder="e.g. Erik"></div>
    <div class="field"><label>Anthropic API key</label>
      <input id="set-key" type="password" value="${esc(getApiKey())}" placeholder="sk-ant-...">
      <div class="hint">Stored in this browser's localStorage only. Never written to any file or repo.</div></div>
    <div class="field"><label>Scene &amp; item art</label>
      <select id="set-art">
        <option value="off" ${artMode === "off" ? "selected" : ""}>Off — text only</option>
        <option value="static" ${artMode === "static" ? "selected" : ""}>Static — bundled image files only</option>
        <option value="generate" ${artMode === "generate" ? "selected" : ""}>Generate — also create missing art (Pollinations, free)</option>
      </select>
      <div class="hint">Generated art builds from each location/item's own description with a fixed seed, so places look consistent between visits.</div></div>
    <div class="field"><label>Time passage</label>
      <select id="set-time-mode">
        <option value="story" ${ts.mode === "story" ? "selected" : ""}>Story time — the clock moves with play</option>
        <option value="real" ${ts.mode === "real" ? "selected" : ""}>Real time — the world's clock runs even while you're away</option>
      </select>
      <input id="set-time-ratio" type="number" min="1" max="168" value="${ts.ratio}" style="margin-top:6px; width:120px"> <span class="hint" style="display:inline">game-hours per real hour (24 = one game day per real hour)</span>
      <div class="hint">Story: +1h per beat, +3h travel, +8h rest. Real: in-game time keeps flowing between sessions — the world will feel like it moved without you.</div></div>
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
    setArtMode(document.getElementById("set-art").value);
    setTimeSettings({ mode: document.getElementById("set-time-mode").value, ratio: parseFloat(document.getElementById("set-time-ratio").value) });
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
    btn.onclick = () => { character = migrate(loadCharacter(btn.dataset.play)); saveCharacter(character); enterPlay(); };
  }
}

/** Additive-schema migration for pre-v0.2 saves: string inventories become item
 *  objects (re-linked to the catalog), and characters gain a clock. */
function migrate(c) {
  if (!c) return c;
  normalizeInventory(c, CONTENT.items);
  if (!c.clock) c.clock = newClock();
  if (!c.companions) c.companions = [];
  if (!c.quests) c.quests = [];
  return c;
}

// ---------- character creation ----------

const GEAR_BY_BACKGROUND = {
  "former-professional": ["prism_chip", "trade_tokens"],
  "community-organizer": ["trade_tokens", "dried_rations"],
  "craftsman": ["belt_knife", "hemp_rope"],
  "survivalist": ["hemp_rope", "dried_rations"],
  "medic": ["medics_satchel", "healing_draught"]
};

function startingGear(background) {
  const ids = ["travelers_pack", "waterskin", ...(GEAR_BY_BACKGROUND[background] || [])];
  return ids.map(id => CONTENT.items[id]).filter(Boolean).map(it => fromCatalog(it));
}

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
      <button class="btn" id="c-done" ${valid ? "" : "disabled"}>Next: your story</button>
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
    document.getElementById("c-done").onclick = () => renderBioStep();
  }

  function renderBioStep(bio = { hometown: "", residence: "", livelihood: "", hobbies: "", motivation: "", story: "" }) {
    const FIELDS = [
      ["hometown", "Where are they from?", "e.g. a fishing hamlet two days upriver"],
      ["residence", "Where do they live now?", "e.g. a rented loft over the Millbrook cooperage"],
      ["livelihood", "How do they make money?", "e.g. repairs water-wheels; takes carving commissions in winter"],
      ["hobbies", "What do they do for joy?", "e.g. night fishing, dice, collecting pre-Transition buttons"],
      ["motivation", "Why step out of ordinary life?", "What makes them someone things HAPPEN to — a debt, a loss, a question, an itch"]
    ];
    chrome(`<div class="screen">
      <h2>${esc(state.name)}'s Story</h2>
      <p class="hint" style="margin-bottom:14px">This is what makes them a character and not a bystander. The GM grounds every scene in it. Fill it in, or let the valley weave a draft you can edit.</p>
      ${FIELDS.map(([k, label, ph]) => `<div class="field"><label>${label}</label><input id="bio-${k}" value="${esc(bio[k])}" placeholder="${esc(ph)}"></div>`).join("")}
      <div class="field"><label>Their story so far</label><textarea id="bio-story" rows="4" style="width:100%" placeholder="A few sentences tying it together">${esc(bio.story)}</textarea></div>
      <div style="display:flex; gap:8px;">
        <button class="btn secondary" id="bio-weave">✦ Weave it for me</button>
        <button class="btn" id="bio-done">Begin in Millbrook</button>
      </div>
      <div class="hint" id="bio-status" style="margin-top:8px"></div>
    </div>`);
    const read = () => Object.fromEntries([...FIELDS.map(([k]) => [k, document.getElementById(`bio-${k}`).value.trim()]), ["story", document.getElementById("bio-story").value.trim()]]);
    document.getElementById("bio-weave").onclick = async () => {
      const status = document.getElementById("bio-status");
      status.textContent = "The valley considers who you might be…";
      try {
        const draft = await generateBio({ name: state.name, origin: state.origin, background: state.background, attributes: state.attrs });
        renderBioStep({ ...read(), ...Object.fromEntries(Object.entries(draft).filter(([, v]) => v)) });
      } catch (err) {
        status.textContent = "The weave slipped (" + err.message.slice(0, 60) + ") — write it by hand or try again.";
      }
    };
    document.getElementById("bio-done").onclick = () => finish(read());
  }

  function finish(bio = null) {
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
      inventory: startingGear(state.background),
      deeds: [], relationships: {}, chronicle: [],
      currentLocationId: CONTENT.startingLocation,
      activeScene: null,
      clock: newClock(),
      companions: [],
      quests: [],
      bio: bio && Object.values(bio).some(v => v) ? bio : null
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
  sceneState = null;
  if (character.activeScene?.turns?.length) {
    sceneTurns = character.activeScene.turns;
    sceneState = character.activeScene.sceneState || null;
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
  const time = readClock(character.clock);
  const result = await gmTurn({
    character, location, region,
    lore: loreForLocation(location, CONTENT.lore),
    rules: CONTENT.rules,
    resolution, playerInput,
    recentTurns: sceneTurns.slice(-6),
    timeLabel: time.label,
    inventoryDetail: inventoryForGM(character),
    companionsDetail: companionsForGM(activeCompanions(character, CONTENT.companions)),
    questsDetail: questsForGM(character),
    sceneState
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
  for (const item of d.inventoryAdd || []) addItem(character, item, CONTENT.items);
  for (const item of d.inventoryRemove || []) removeItem(character, typeof item === "string" ? item : item?.name);

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
  // quests: typed ops from the GM, applied within bounds
  applyQuestUpdates(character, turn.questUpdates || []);
  // time passes with the story (story mode; real mode advances itself)
  advanceClock(character.clock, turn.sceneEnded ? ADVANCE.sceneEnd : ADVANCE.beat);
  // scene anchor: the GM's updated scene state, clamped — or keep the previous one
  sceneState = sanitizeScene(turn.scene) || sceneState;
  // chronicle + scene persistence
  if (turn.sceneSummary) {
    sceneTurns.push({ summary: turn.sceneSummary, narration: turn.narration || "" });
    if (turn.sceneEnded) { character.chronicle.push(turn.sceneSummary); sceneTurns = []; sceneState = null; }
  }
  character.activeScene = turn.sceneEnded ? null : { locationId: character.currentLocationId, turns: sceneTurns, lastTurn: turn, sceneState };
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
  const equip = equipmentBonus(character, action.intentTags, CONTENT.rules);
  const comp = companionBonus(activeCompanions(character, CONTENT.companions), action.intentTags, CONTENT.rules);
  const resolution = resolveAction({ character, action, location, rules: CONTENT.rules, aptitudeMods: mods, equipmentBonus: equip.bonus + comp.bonus });
  if (equip.bonus + comp.bonus > 0) resolution.equipHelpers = [...equip.helpers, ...comp.helpers];
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
  sceneState = null;
  advanceClock(character.clock, ADVANCE.travel);
  saveCharacter(character);
  startScene(`(The character has just arrived here, traveling from elsewhere in the valley. Open the scene with the arrival.)`);
}

function rest() {
  if (busy) return;
  character.energy = Math.min(character.maxEnergy, character.energy + CONTENT.rules.energy.regenPerRest);
  character.health = Math.min(character.maxHealth, character.health + 3);
  sceneTurns = [];
  sceneState = null; // hours pass — the old scene has dissolved
  advanceClock(character.clock, ADVANCE.rest);
  saveCharacter(character);
  startScene(`(The character takes a real rest here — camp, inn, or quiet corner. Narrate the rest briefly, restore them, then present what's happening when they get up. Time has passed.)`);
}

async function onAsk(text) {
  if (busy || !text.trim()) return;
  busy = true;
  const lastTurn = character.activeScene?.lastTurn || null;
  renderPlay(lastTurn, { playerBeat: { label: "[to the GM] " + text }, thinking: "The GM leans back…" });
  const location = CONTENT.locations[character.currentLocationId];
  const time = readClock(character.clock);
  const result = await gmAsk({
    character, location, rules: CONTENT.rules,
    lore: loreForLocation(location, CONTENT.lore),
    region: { ...CONTENT.region, activeEvents: eventsForGM(CONTENT.region, CONTENT.events) },
    recentTurns: sceneTurns.slice(-6),
    timeLabel: time.label,
    inventoryDetail: inventoryForGM(character),
    companionsDetail: companionsForGM(activeCompanions(character, CONTENT.companions)),
    questsDetail: questsForGM(character),
    sceneState
  }, text);
  busy = false;
  renderPlay(lastTurn, { playerBeat: { label: "[to the GM] " + text }, gmAside: result.ok ? result.text : "The GM stumbled: " + result.error });
}

function useItem(name) {
  if (busy) return;
  const item = character.inventory.find(i => i.name === name);
  if (!item) return;
  if (item.consumable) {
    const fx = consumeItem(character, name);
    saveCharacter(character);
    const parts = [];
    if (fx?.health) parts.push(`${fx.health > 0 ? "+" : ""}${fx.health} health`);
    if (fx?.energy) parts.push(`${fx.energy > 0 ? "+" : ""}${fx.energy} energy`);
    renderPlay(character.activeScene?.lastTurn || null, { aside: `You use the ${name}${parts.length ? ` (${parts.join(", ")})` : ""}.` });
  } else {
    // non-consumable: using it IS a scene action — route through the normal loop
    onFreeform(`I use my ${name} here`);
  }
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
    <section><h3>Quests</h3>
      ${(character.quests || []).filter(q => q.status === "active").map(q => `
        <div class="quest"><span class="quest-title">${esc(q.title)}</span>
          <div class="quest-note">${esc(q.progress?.length ? q.progress[q.progress.length - 1] : q.summary)}</div>
        </div>`).join("") || "<div class='insight'>no undertakings yet — the valley will provide</div>"}
      ${(character.quests || []).some(q => q.status !== "active") ? `<div class="quest-done">${(character.quests || []).filter(q => q.status === "completed").length} completed · ${(character.quests || []).filter(q => q.status === "failed").length} failed</div>` : ""}
    </section>
    <section><h3>Companions</h3>
      ${(character.companions || []).map(id => {
        const c = CONTENT.companions[id];
        return c ? `<div class="companion"><span class="companion-name">${esc(c.name)}</span> <span class="cost">${esc(c.role)}</span>
          <button class="opt companion-part" data-part="${esc(id)}">Part ways</button></div>` : "";
      }).join("")}
      ${Object.values(CONTENT.companions).filter(c => !(character.companions || []).includes(c.id)).map(c =>
        `<button class="opt" data-join="${esc(c.id)}" style="margin:2px 0; display:block; width:100%" title="${esc(c.persona.slice(0, 140))}">Travel with ${esc(c.name)}</button>`
      ).join("")}
      ${!Object.keys(CONTENT.companions).length ? "<div class='insight'>you travel alone</div>" : ""}
    </section>
    <section><h3>Items</h3>
      ${(character.inventory || []).map(it => {
        const open = examinedItem === it.name;
        const img = open ? itemImage(it) : null;
        return `<div class="item ${open ? "open" : ""}">
          <button class="item-name" data-examine="${esc(it.name)}">${esc(it.name)}${it.qty > 1 ? ` ×${it.qty}` : ""}</button>
          ${open ? `<div class="item-detail">
            ${img ? `<img class="item-img" src="${esc(img)}" alt="${esc(it.name)}" loading="lazy">` : ""}
            <div class="item-desc">${esc(it.description || it.kind)}</div>
            ${it.bonusTags?.length ? `<div class="item-tags">helps with: ${it.bonusTags.map(esc).join(", ")}</div>` : ""}
            <div class="item-actions">
              <button class="opt" data-use="${esc(it.name)}">${it.consumable ? "Consume" : "Use in scene"}</button>
              <button class="opt" data-drop="${esc(it.name)}">Drop</button>
            </div></div>` : ""}
        </div>`;
      }).join("") || "<div class='insight'>empty-handed</div>"}
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

  const banner = locationImage(location);
  const time = readClock(character.clock);
  let main = `<div class="play">
    ${banner ? `<img class="scene-banner" src="${esc(banner)}" alt="${esc(location.name)}" onerror="this.style.display='none'">` : ""}
    <div class="location-tag" ${sceneState?.setting ? `title="${esc(sceneState.setting)}"` : ""}>${esc(location.name)}<span class="time-tag">${esc(time.label)}</span></div><div class="transcript">`;
  if (opts.playerBeat) {
    main += `<div class="beat player-action">▸ ${esc(opts.playerBeat.label)}</div>`;
    if (opts.playerBeat.resolution) {
      const r = opts.playerBeat.resolution;
      const helpers = r.equipHelpers?.length ? ` · aided by ${r.equipHelpers.map(esc).join(", ")}` : "";
      main += `<div class="roll-receipt">d100: ${r.roll} vs ${r.chance} — <span class="${r.degree}">${r.degree.replace("_", " ")}</span>${helpers}</div>`;
    }
  }
  if (opts.thinking) main += `<div class="thinking">${esc(opts.thinking)}</div>`;
  if (opts.aside) main += `<div class="beat"><em>${esc(opts.aside)}</em></div>`;
  if (opts.gmAside) main += `<div class="gm-aside">${opts.gmAside.split(/\n\n+/).map(p => `<p>${esc(p)}</p>`).join("")}</div>`;
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
      const equip = equipmentBonus(character, action.tags, rules);
      const comp = companionBonus(activeCompanions(character, CONTENT.companions), action.tags, rules);
      const chance = successChance({ character, action, location, rules, aptitudeMods: mods, equipmentBonus: equip.bonus + comp.bonus });
      const sense = senseAction({ character, action, location, rules, aptitudeMods: mods }, chance);
      if (sense.text) senseHtml = `<span class="sense">${esc(sense.text)}</span>`;
      return `<button class="choice" data-choice="${i}">${esc(c.label)}${abilityHtml}${senseHtml}</button>`;
    }).join("")}</div>`;
  }
  main += `</div>`;
  if (turn || opts.error || opts.gmAside) {
    main += `<div class="freeform">
      <button id="mode-toggle" class="mode-toggle ${askMode ? "asking" : ""}" title="Switch between acting in the scene and asking the GM out-of-character">${askMode ? "Ask" : "Act"}</button>
      <input id="freeform-input" placeholder="${askMode ? "Ask the GM anything — context, rules, what you'd know…" : "Or do something else — describe it…"}" ${busy ? "disabled" : ""}>
      <button id="freeform-go" ${busy ? "disabled" : ""}>${askMode ? "Ask" : "Act"}</button></div>`;
  }
  main += `</div>`;

  chrome(`<div class="layout">${sheet}${main}</div>`);

  if (turn) {
    for (const btn of app.querySelectorAll("[data-choice]")) {
      btn.onclick = () => onChoice(turn.choices[parseInt(btn.dataset.choice)]);
    }
  }
  for (const btn of app.querySelectorAll("[data-travel]")) btn.onclick = () => travelTo(btn.dataset.travel);
  for (const btn of app.querySelectorAll("[data-join]")) btn.onclick = async () => {
    if (busy) return;
    const c = CONTENT.companions[btn.dataset.join];
    character.companions = [...(character.companions || []), c.id];
    saveCharacter(character);
    renderPlay(null, { thinking: `${c.name} arrives…` });
    const result = await runGM({ resolution: null, playerInput: `(${c.name} has just joined the character as a traveling companion. Introduce them into the current scene naturally — their arrival, how they read the situation — then continue the scene.)` });
    if (result) renderPlay(result.turn, { degraded: result.degraded });
  };
  for (const btn of app.querySelectorAll("[data-part]")) btn.onclick = () => {
    const c = CONTENT.companions[btn.dataset.part];
    if (!confirm(`Part ways with ${c.name}?`)) return;
    character.companions = character.companions.filter(id => id !== c.id);
    saveCharacter(character);
    renderPlay(character.activeScene?.lastTurn || null, { aside: `${c.name} drifts on — for now.` });
  };
  for (const btn of app.querySelectorAll("[data-examine]")) btn.onclick = () => {
    examinedItem = examinedItem === btn.dataset.examine ? null : btn.dataset.examine;
    renderPlay(character.activeScene?.lastTurn || null, {});
  };
  for (const btn of app.querySelectorAll("[data-use]")) btn.onclick = () => useItem(btn.dataset.use);
  for (const btn of app.querySelectorAll("[data-drop]")) btn.onclick = () => {
    if (!confirm(`Drop ${btn.dataset.drop}?`)) return;
    removeItem(character, btn.dataset.drop, 999);
    examinedItem = null;
    saveCharacter(character);
    renderPlay(character.activeScene?.lastTurn || null, { aside: `You leave the ${btn.dataset.drop} behind.` });
  };
  const restBtn = document.getElementById("do-rest"); if (restBtn) restBtn.onclick = rest;
  const ff = document.getElementById("freeform-input");
  const go = document.getElementById("freeform-go");
  const modeBtn = document.getElementById("mode-toggle");
  if (modeBtn) modeBtn.onclick = () => {
    askMode = !askMode;
    const val = ff?.value || "";
    renderPlay(turn || character.activeScene?.lastTurn || null, { ...opts, thinking: null });
    const ff2 = document.getElementById("freeform-input");
    if (ff2) { ff2.value = val; ff2.focus(); }
  };
  if (ff && go) {
    const submit = () => askMode ? onAsk(ff.value) : onFreeform(ff.value);
    go.onclick = submit;
    ff.onkeydown = e => { if (e.key === "Enter") submit(); };
  }
  const retry = document.getElementById("retry");
  if (retry) retry.onclick = () => startScene("(Retry the previous beat — pick up smoothly from where the story last stood.)");
}

// ---------- utils ----------

function esc(s) { return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function pct(v, max) { return Math.round((v / Math.max(1, max)) * 100); }
function clampInt(v, min, max) { return Math.max(min, Math.min(max, v | 0)); }
