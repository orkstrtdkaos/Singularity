// quests.js — quests are typed state the GM drives through clamped ops, same law
// as every other delta: the model proposes {op, questId, ...}, the engine applies
// within bounds. Quests are what keep the game MOVING — the GM is instructed to
// weave a location's questSeeds into play whenever the scene idles.
//
// SNG-BATCH-7 Phase 3: RESOLVE before mint/drop. A progress/complete op on a drifted
// title used to `find` by exact id/title and SILENTLY DROP on mismatch (quest progress
// lost). Now the SNG-019 name-resolution primitive matches id → title/alias fuzzy, an
// unresolvable op SURFACES a note instead of vanishing, and a "start" that resolves to an
// existing quest doesn't fork a duplicate. Giver/location tie to codex entityIds.

import { namesMatch, resolveByName, smartClamp } from "./namematch.js";
import { recordQuestOutcome, resolveEvent, actorOf, priorBoardFor, questKey } from "./worldevents.js";   // CCODE-354: a world-tier ending is a world fact
import { traditionOf } from "./traditions.js";
import { createWake } from "./wake.js"; // SNG-204: a significant outcome leaves a wake the world continues from
import { addHolding } from "./holdings.js";              // ⛔ SNG-579: an ending that says "you own a ship" has to hand one over
import { carriageOf, CARRIAGE_KINDS } from "./carriage.js"; // …and a hold that moves is validated, never taken on trust
import { recordDeed } from "./reputation.js";   // SNG-282: a resolved quest is a deed, and deeds travel
import { renderNamesDeep } from "./names.js";   // SNG-552 §6: an effect that becomes a permanent world fact resolves its tokens first

/** SNG-217: models often "type" \n / \t as the literal two-character escape inside their JSON strings.
 *  Valid JSON parses that as backslash-n (two chars), which then renders verbatim — literal `\n` on screen
 *  (Erik's Second Thread bug). Normalize a prose field on WRITE so every consumer — render, GM context,
 *  search, export — sees real line breaks. Targets the formatting escapes ONLY: a real newline is never
 *  matched, and a legitimately backslashed literal in prose is rare (and safe to leave). Markdown (`**bold**`)
 *  is intentionally LEFT for the render layer, not stripped here — the intent is preserved, rendered on display. */
export function normalizeProse(s) {
  if (typeof s !== "string" || s.indexOf("\\") === -1) return s; // fast path: no backslash → nothing to normalize
  return s.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").replace(/\\t/g, "\t");
}

/** Resolve an incoming quest op to an existing quest: exact id → slugified-title id →
 *  title/alias fuzzy. Returns the quest or null. */
export function resolveQuest(character, u) {
  const quests = character.quests || [];
  const id = u.questId ? slugify(u.questId) : null;
  if (id) { const byId = quests.find(q => q.id === id); if (byId) return byId; }
  const title = u.title || "";
  if (title) {
    const st = slugify(title);
    const byTitleId = quests.find(q => q.id === st);
    if (byTitleId) return byTitleId;
    const byName = resolveByName(title, quests, { getLabel: q => q.title, getAliases: q => q.aliases || [] });
    if (byName) return byName;
  }
  return null;
}

function recordQuestAlias(q, title) {
  if (!title || namesMatch(q.title, title) && title.toLowerCase() === q.title.toLowerCase()) return;
  if (title.toLowerCase() === q.title.toLowerCase()) return;
  q.aliases = q.aliases || [];
  if (!q.aliases.some(a => a.toLowerCase() === title.toLowerCase())) q.aliases = [...q.aliases, String(title).slice(0, 80)].slice(-6);
}

/** Resolve a giver/location name to a codex entity id (ctx.entities: {people, places}). */
function entityIdFor(name, pool) {
  if (!name || !pool) return null;
  for (const [id, label] of Object.entries(pool)) {
    if (namesMatch(name, label) || namesMatch(name, id.replace(/-/g, " "))) return slugify(id);
  }
  return null;
}

export function applyQuestUpdates(character, updates = [], ctx = {}) {
  character.quests = character.quests || [];
  const notes = [];
  const clampNote = n => smartClamp(normalizeProse(n), 600); // SNG-076: model note — bound generously, on a word boundary; SNG-217: literal \n → real break
  // SNG-162 §3: PARTITION BEFORE CAPPING. `updates.slice(0, 4)` dropped by ARRAY ORDER, so a busy
  // turn emitting three `progress` ops and one `complete` could lose the complete — arbitrarily,
  // depending on where the model happened to put it. That is a second, independent cause of "the
  // quest didn't close". Terminal ops go first and are never dropped; start/progress fill the rest.
  // Same total work per turn.
  const terminal = updates.filter(u => u?.op === "complete" || u?.op === "fail");
  const rest = updates.filter(u => u?.op !== "complete" && u?.op !== "fail");
  const budgeted = [...terminal, ...rest].slice(0, Math.max(4, terminal.length));
  for (const u of budgeted) {
    const op = u.op;
    const existing = resolveQuest(character, u);
    if (op === "start") {
      if (existing) { // resolves to a quest we already have — progress it, never fork a dupe
        recordQuestAlias(existing, u.title);
        if (u.note && existing.status === "active") existing.progress = [...(existing.progress || []), clampNote(u.note)].slice(-8);
        continue;
      }
      if (character.quests.filter(q => q.status === "active").length >= 5) continue; // focus, not a checklist
      const id = u.questId ? slugify(u.questId) : slugify(u.title || "quest");
      character.quests.push({
        id,
        title: String(u.title || "A new undertaking").slice(0, 80),
        summary: smartClamp(normalizeProse(u.summary || u.note || ""), 600), // SNG-076: model quest summary — word-boundary clamp; SNG-217: literal \n → real break
        giver: u.giver ? String(u.giver).slice(0, 60) : null,
        giverEntityId: entityIdFor(u.giver, ctx.entities?.people),
        locationId: u.locationId || null,
        locationEntityId: u.locationId ? slugify(u.locationId) : entityIdFor(u.giver, ctx.entities?.places),
        status: "active",
        progress: u.note ? [clampNote(u.note)] : [],
        aliases: [],
        startedAt: new Date().toISOString()
      });
      notes.push(`New quest: ${u.title}`);
    } else {
      if (!existing) { notes.push(`(couldn't match a quest for "${u.title || u.questId || "?"}" — not applied)`); continue; } // NEVER silently drop
      if (existing.status !== "active") continue; // resolved quests don't re-open
      recordQuestAlias(existing, u.title);
      if (op === "progress") {
        if (u.note) existing.progress = [...(existing.progress || []), clampNote(u.note)].slice(-8);
        notes.push(`Quest updated: ${existing.title}`);
      } else if ((op === "complete" || op === "fail") && existing.structured) {
        // ⛔ CCODE-459 — AND THE SAME IS NOW TRUE OF `fail`, WHICH WAS LEFT OPEN WHEN `complete` WAS CLOSED.
        // A flat `fail` set status "failed" right here and paid NOTHING: no effects, no deed, no chronicle,
        // no wake. That was survivable only while failure was impossible to author — `quest_structure.json`
        // said "NOT success/fail — WHICH success", so nothing was ever lost by a failure that did nothing.
        // ⚑ Erik overturned that ("the quest must be able to lead to failure... death of the patient"), so a
        // failure now has consequences to pay, and a path that skips them is a patient who dies and leaves
        // the world unchanged. ⛑ A structured quest ends ONE way: through an outcome.
        // ⚠️ The endings the player is offered may by then be only the bad ones — a decision can foreclose
        // the rest. The world narrows the doors; the player still walks through one.

        // SNG-204/235 bug (Silas's waygate): a STRUCTURED quest resolves ONLY via its OUTCOME decision
        // (resolveStructuredQuest — the sole path that fires effects/wakes/waygates + records the ending). A
        // flat GM `complete` op used to set status "completed" here, silently BYPASSING that — so the wake
        // never fired and the create_waygate effect never minted. Redirect: surface the DECISION (the player
        // chooses the ending, the engine pays out), never flat-complete a structured quest.
        existing.awaitingResolution = true;
        if (u.note) existing.progress = [...(existing.progress || []), clampNote(u.note)].slice(-8);
        notes.push(op === "fail"
          ? `${existing.title} has gone wrong — how it ends is still yours to face (that's what fires its consequences).`
          : `Quest ready to resolve: ${existing.title} — its ending is yours to choose (that's what fires its effects).`);
      } else if (op === "complete" || op === "fail") {
        existing.status = op === "complete" ? "completed" : "failed";
      // ⚠️ ONLY A COMPLETION CREDITS. A quest that failed is not work the giver is the better for.
      if (existing.status === "completed") creditQuestGiver(character, existing);
        existing.resolvedAt = new Date().toISOString();
        if (u.note) existing.progress = [...(existing.progress || []), clampNote(u.note)].slice(-8);
        if (op === "complete") {
          const xp = Math.max(0, Math.min(50, u.xpReward | 0 || 25));
          character.xp = (character.xp || 0) + xp;
          notes.push(`Quest complete: ${existing.title} (+${xp} xp)`);
        } else {
          notes.push(`Quest failed: ${existing.title}`);
        }
      }
    }
  }
  return notes;
}

/** SNG-BATCH-7 Phase 3 reconcile: collapse duplicate quests a pre-resolver save minted
 *  (same slug-title, or fuzzy title/alias match). Keeps the most-progressed/most-resolved
 *  as primary; unions progress (deduped) + aliases. Idempotent. Returns [{into,absorbed}]. */
export function dedupeQuests(character) {
  const quests = character.quests || [];
  const merged = [];
  const statusRank = { active: 0, completed: 2, failed: 1 };
  let changed = true;
  while (changed) {
    changed = false;
    outer:
    for (let i = 0; i < quests.length; i++) {
      for (let j = i + 1; j < quests.length; j++) {
        const a = quests[i], b = quests[j];
        const match = a.id === b.id || namesMatch(a.title, b.title) ||
          (a.aliases || []).some(x => namesMatch(x, b.title)) || (b.aliases || []).some(x => namesMatch(x, a.title));
        if (!match) continue;
        // primary: resolved beats active, then more progress, then earlier start
        const pri = q => (statusRank[q.status] ?? 0) * 100 + (q.progress?.length || 0);
        const [p, s] = pri(a) >= pri(b) ? [a, b] : [b, a];
        for (const pr of s.progress || []) if (!(p.progress || []).includes(pr)) p.progress = [...(p.progress || []), pr].slice(-8);
        recordQuestAlias(p, s.title);
        for (const al of s.aliases || []) recordQuestAlias(p, al);
        p.giverEntityId = p.giverEntityId || s.giverEntityId;
        p.locationEntityId = p.locationEntityId || s.locationEntityId;
        if (s.status !== "active" && p.status === "active") { p.status = s.status; p.resolvedAt = s.resolvedAt; }
        // SNG-162 §6.4: dedupe merges NAMED fields only, so a flag added later is silently lost in
        // a merge. awaitingResolution is the gate on the outcome buttons — drop it and a quest that
        // reached its decision point quietly stops offering one.
        if (s.awaitingResolution) p.awaitingResolution = true;
        p.stageIndex = Math.max(p.stageIndex || 0, s.stageIndex || 0);
        for (const cs of s.completedStages || []) if (!(p.completedStages || []).includes(cs)) p.completedStages = [...(p.completedStages || []), cs];
        quests.splice(quests.indexOf(s), 1);
        merged.push({ into: p.title, absorbed: s.title });
        changed = true;
        break outer;
      }
    }
  }
  return merged;
}

/** ⛔ THE SAVE AND THE CONTENT DISAGREE ABOUT ID SHAPE, and every lookup between them has to know it. A
 *  record carries `the-mercy-that-wont-ask`; the def is `the_mercy_that_wont_ask`. ⚠️ MEASURED: matching
 *  raw finds NOTHING for any of the ten quests on Erik's save. */
const normQuestId = (id) => String(id || "").toLowerCase().replace(/[^a-z0-9]+/g, "_");

/** PURE. Index a quest-def collection by normalised id. Accepts the array `content.quests` really is, or a
 *  map, because both shapes exist in this codebase and guessing wrong is how a lookup silently finds none. */
export function questDefIndex(defs) {
  const list = Array.isArray(defs) ? defs : Object.values(defs || {});
  const out = {};
  for (const d of list) if (d && d.id) out[normQuestId(d.id)] = d;
  return out;
}

/** ⛔ A STARTED QUEST CARRIES PROGRESS, NOT A COPY OF THE CONTENT — SPEC_quest_snapshot §4a, and the rule
 *  this project has now ruled four times: *a stored copy of a derived value is the failure that produced
 *  this ticket.* `ringDistance`'s 552 rows, `meaningDensity`, the shared health pool, and now this.
 *
 *  ⚠️ THE SNAPSHOT WAS A WHITELIST, so `title` and `imagePrompt` were dropped on every copy and the stage-art
 *  feature read a field the record never had; and it was FROZEN, so a content fix never reached a save that
 *  had already started. ⛔ AND WHEN THE MAPPER MET A STAGE IT COULD NOT READ IT PRODUCED `{id: undefined,
 *  objective: undefined, …}` — which JSON drops to `{}`. Three live quests on Erik's save are blank that way.
 *
 *  ⚑ SO THE DEF IS THE SOURCE AT READ TIME, and the record wins only where it carries something the def
 *  cannot know: progress, and anything play changed. ⬜ WHERE THE DEF IS GONE — content retired under a live
 *  save — the snapshot IS the answer, which is the argument for keeping one thin rather than none at all.
 *
 *  ⚠️ Stages are matched by ID where the record has one and by INDEX where it does not (a blank stage has
 *  neither), and a record with MORE stages than its def keeps the extras: `the-mercy-that-wont-ask` carries
 *  four against a def of three, and dropping one would be losing progress to fix prose. PURE. */
/** The stage keys that are AUTHORED PROSE rather than play state. The def owns these; the record owns the rest. */
const STAGE_WORDS = ["title", "objective", "condition", "change", "imagePrompt", "unlockHint", "reveals", "truth"];

/** ⛔ GM-EYES, AND THE PLAYER FUNCTION NEVER RETURNS IT. `truth` is what the author knows and the player is
 *  there to work out — the diagnosis under the symptom, who the patient really is, which of two parties at
 *  the gate means him harm.
 *
 *  ⚠️ AEVI'S FINDING, WHICH IS A SCHEMA FINDING AND NOT AN AUTHORING ONE: "EVERY FIELD A QUEST HAS IS TOLD."
 *  `premise` and `stakes` render in full, and `objective`, `condition` and `change` are the GM's brief, which
 *  the GM pays out. So an author holding a secret had nowhere to put it except somewhere it gets said — and
 *  one quest's `stakes` duly gave away two later stages. ⛑ "This is not an author being careless. It is a
 *  schema with no drawer."
 *
 *  ⛑ THE EXCLUSION IS BY DELETION, NOT BY EVERY RENDERER REMEMBERING — the same shape as `worldArcsPublic`
 *  in worldtick.js, and for the same reason: spoiler discipline is INHERITED, not re-decided at each of the
 *  nine surfaces that draw a quest. `questsFor` is the call a player consumer makes and it comes back
 *  already stripped, so a new quest screen cannot leak a secret by forgetting a filter nobody told it about.
 *  ⚠️ Arcs also proved the positive half — `publicFace`, the line that IS for the player. Six quest defs
 *  already carry one and nothing has ever read it; that half is still open. PURE. */
export function questPublic(q) {
  if (!q || typeof q !== "object") return q;
  const { truth, ...rest } = q;
  if (Array.isArray(rest.stages)) rest.stages = rest.stages.map(s => { if (!s || typeof s !== "object") return s; const { truth: _t, ...r } = s; return r; });
  if (Array.isArray(rest.outcomes)) rest.outcomes = rest.outcomes.map(o => { if (!o || typeof o !== "object") return o; const { truth: _t, ...r } = o; return r; });
  return rest;
}

export function hydrateQuest(record, defs) {
  if (!record) return record;
  const def = questDefIndex(defs)[normQuestId(record.id || record.questId)];
  if (!def) return record;                                   // retired content — the snapshot is all there is
  const defStages = Array.isArray(def.stages) ? def.stages : [];
  const byId = {};
  for (const d of defStages) if (d && d.id) byId[d.id] = d;
  const stages = (record.stages || []).map((s, i) => {
    const d = (s && s.id && byId[s.id]) || defStages[i] || null;
    if (!d) return s;                                        // an extra stage the def does not have — keep it
    // ⛔ THE DEF WINS ON THE WORDS, one level down from premise and stakes — and it did NOT, which is why
    // "a content fix must reach a started quest" was only half true. ⚠️ MEASURED on Courtney's live save
    // (CCODE-458): editing `stakes` reached her; editing a stage's `objective`, `condition` or `change` did
    // NOT, because `structuredQuestRecord` copies those words into the record and the record was spread
    // LAST. So an author fixing a stage that gives away its own answer fixed it for nobody already playing.
    // ⛑ Nothing in the engine writes onto a stage object — grepped, zero assignments — so every non-word
    // key here is play state and still wins.
    const kept = Object.fromEntries(Object.entries(s || {}).filter(([k, v]) => v != null && v !== "" && !STAGE_WORDS.includes(k)));
    return { ...d, ...kept };
  });
  // ⚠️ A TRAILING EMPTY EXTRA IS DROPPED, and only a trailing empty one. `the-mercy-that-wont-ask` carries
  // FOUR stages against a def of three, and the fourth is `{}` — it preserves nothing and renders as nothing.
  // ⛔ But only from the END, and never below `stageIndex`: a stage the player has already passed is progress
  // even when its words are gone, and re-indexing under a live quest would move where they are standing.
  const floor = Math.max(defStages.length, Number(record.stageIndex) || 0, (record.completedStages || []).length);
  while (stages.length > floor && !Object.keys(stages[stages.length - 1] || {}).length) stages.pop();
  // a def with MORE stages than the record: the content grew under a started quest, so the new ones appear.
  for (let i = stages.length; i < defStages.length; i++) stages.push({ ...defStages[i] });
  // ⛔ AND THE "CUT SHORT" WARNING MUST NOT SURVIVE THE REPAIR. SNG-343 marks a stage `_severed` when a
  // store-time cap cut its objective mid-word, and the GM is told to restate it rather than quote it. Now
  // that the DEF supplies the words, the sentence is whole again — so leaving the marker on would have the
  // GM refusing to quote a perfectly good objective, which is a message describing a mechanism that no
  // longer exists. ⚠️ `routes` was ALREADY def-wins before this change, so `_severedRoutes` has been stale
  // that whole time for every quest whose def still carries routes.
  for (const s of stages) if (s && s._severed && byId[s.id]?.objective) delete s._severed;
  const severedRoutes = def.routes ? [] : (record._severedRoutes || []);
  // ⚠️ THE DEF CALLS IT `name` AND THE RECORD CALLS IT `title` — the same family of mismatch as the id
  // shape, and it left the GM reading the literal word `undefined` as a quest's name.
  //
  // ⛔ AND THE LIST BELOW IS NO LONGER THE WHOLE CONTRACT, BECAUSE THE LIST WAS THE DEFECT. It dropped a
  // field three times: `title` and `imagePrompt` on every stage (SNG-542), then `truth` the hour the GM-eyes
  // drawer was built (CCODE-458), then `deadlineDays` the hour a quest could first run out of time
  // (CCODE-459b) — each caught only because something downstream was being measured at that moment, and each
  // "fixed" by adding one more name to a list that had just been proven unable to hold one.
  // ⛑ SO THE DEF IS THE BASE AND THE RECORD IS LAID OVER IT: every key the record carries wins, which is
  // every scrap of play state, and every key only the def has arrives instead of being silently dropped. An
  // authored field added tomorrow reaches a started quest without anybody remembering this function exists.
  // ⚠️ The explicit lines below still stand, and they are the OPPOSITE direction — the handful of fields
  // where the DEF must beat a record that also has them, because they are words rather than state.
  const fromDef = (recKey, defKey = recKey) => (record[recKey] != null && record[recKey] !== "" ? record[recKey] : def[defKey]);
  return {
    ...def,
    ...record,
    title: record.title || def.name || def.title || null,
    axis: fromDef("axis"),
    region: fromDef("region"), tier: fromDef("tier"), giver: fromDef("giver"),
    traditions: record.traditions?.length ? record.traditions : (def.traditions || []),
    // ⛑ THE DEF WINS on the prose: that is the whole point — a content fix must reach a started quest.
    premise: def.premise ?? record.premise,
    stakes: def.stakes ?? record.stakes,
    // ⛔ AND THE GM-EYES TRUTH COMES FROM THE DEF, FULL STOP — the record never carries it (CCODE-458), so if
    // this line is missing the secret does not exist as far as the GM is concerned. ⚠️ Which is exactly the
    // whitelist failure the comment above warns about, caught by §335 on the first run: the drawer was built,
    // the stage half worked, and the quest half was dropped by the one list that had to name it.
    truth: def.truth ?? record.truth,
    routes: def.routes ?? record.routes,
    _severedRoutes: severedRoutes.length ? severedRoutes : undefined,
    outcomes: def.outcomes ?? record.outcomes,
    stages,
  };
}

/** PURE. Every quest on a character, read through the def, WITH THE GM-EYES TRUTH REMOVED. The one call a
 *  PLAYER-FACING consumer should make — and the reason a player surface cannot leak `truth` by omission. */
export function questsFor(character, defs) {
  return (character?.quests || []).map(q => questPublic(hydrateQuest(q, defs)));
}

/** PURE. The same read, for the GM only — `truth` intact. ⚠️ Nothing that renders to a screen may call this. */
export function questsForGMView(character, defs) {
  return (character?.quests || []).map(q => hydrateQuest(q, defs));
}

/** ⛔ THE RECORD TO WRITE AND THE WORDS TO READ ARE DIFFERENT OBJECTS, and every write path below needs both.
 *  ⚠️ MEASURED (CCODE-458): `resolveStructuredQuest` looked its outcome up on the FROZEN record, so an ending
 *  ADDED to content after a quest started rendered a button — the screen reads the hydrated quest — and then
 *  answered "unknown outcome" when the player pressed it. A dead button on every save in flight, and exactly
 *  the path a new FAILURE ending would have taken. ⛑ So: read through the def, write to the record. */
function questPair(character, questId, ctx = {}) {
  const record = (character?.quests || []).find(x => x.id === slugify(questId) && x.structured) || null;
  if (!record) return { record: null, view: null };
  return { record, view: ctx.defs ? hydrateQuest(record, ctx.defs) : record };
}
/** Active-quest block for the GM prompt. */
export function questsForGM(character, defs = null) {
  // the same rule as `structuredQuestsForGM`: progress from the record, words from the def.
  if (defs) character = { ...character, quests: questsFor(character, defs) };
  const active = (character.quests || []).filter(q => q.status === "active");
  if (!active.length) return null;
  return active.map(q =>
    `- [${q.id}] ${q.title}: ${q.summary}${q.giver ? ` (from ${q.giver})` : ""}${q.progress?.length ? ` | latest: ${q.progress[q.progress.length - 1]}` : ""}`
  ).join("\n");
}

export function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40) || "quest";
}

// ---------- SNG-BATCH-10 Phase 3 / SNG-065: STRUCTURED quests ----------
// Authored quests (content/packs/valley/quests.json) carry stakes, engine-testable stages,
// multiple routes across the great circle, branched outcomes, and a consequences block the
// engine APPLIES on resolution. They coexist with the freeform GM-driven quests above; a
// structured quest record carries structured:true + stages/routes/outcomes/stageIndex.
// The schema's rule: IF YOU CANNOT NAME THE COST OF IGNORING IT, IT IS NOT A QUEST.

/** The schema's real-quest test: stakes named + at least one stage + at least one outcome — AND EVERY STAGE SAYING SOMETHING.
 *
 *  ⛔ SNG-542, ANSWERING AEVI'S ONE OPEN QUESTION: *"whether the blank `def.stages` those records were written from came from the GM
 *  emitting a structured quest with arity but no prose. If so the write path has the same hole as the read path."* ⚠️ IT WAS NOT THE
 *  GM. `the-stag-that-wont-die` carries `startedWorldDay: 26` and `startedAt: 2026-07-26` — it was written from the AUTHORED def,
 *  before that def had stage prose, and `structuredQuestRecord` copies `{id, objective, condition, change}` per stage, all four of
 *  which were `undefined` and which `JSON.stringify` then drops. ⛔ THAT IS HOW A SAVE COMES TO HOLD `[{}, {}, {}]`: not a bad
 *  writer, a def with arity and nothing in it.
 *
 *  ⛑ SO THE HOLE IS CLOSED WHERE IT OPENS. A stage carrying neither an id nor an objective cannot be played, cannot be rendered,
 *  and must not be startable — and `hydrateQuest` hiding it is fine today and worthless the day that content is retired, when (her
 *  words) *"the snapshot IS the answer"* and the answer is `{}`. ⚠️ MEASURED BEFORE TIGHTENING: 0 of 54 authored stages are hollow
 *  and both personal-arc builders always write an id and an objective, so this refuses nothing that exists. */
export function isRealQuest(def) {
  const stages = Array.isArray(def?.stages) ? def.stages : [];
  const everyStageSaysSomething = stages.length > 0 && stages.every(s => !!(s && (s.id || s.objective)));
  return !!(def && def.stakes && everyStageSaysSomething && Array.isArray(def.outcomes) && def.outcomes.length);
}

/** Normalize an authored quest into a not-yet-started character-quest record. Outcomes carry both
 *  `narration` (authored prose, the chronicle voice) and `effects[]` (machine-readable deltas the
 *  engine applies). Legacy outcomes with only `consequences[]` are still honored (prose fallback). */
const titleizeId = s => String(s || "").replace(/[-_]+/g, " ").replace(/\b\w/g, c => c.toUpperCase()).trim();

/** SNG-232 seam (CCODE-21): a structured quest's `routes` MUST be a { traditionId: "text" } map. A producer
 *  that hands an ARRAY (or object values that aren't strings) put non-route data here, and rendering it as
 *  routes prints the literal "[object Object]" (Erik's Second Thread). Keep only string values; drop the rest
 *  so the section renders empty rather than garbage. */
export function normalizeQuestRoutes(r) {
  if (!r || typeof r !== "object" || Array.isArray(r)) return {};
  const out = {};
  for (const [k, v] of Object.entries(r)) if (typeof v === "string" && v.trim()) out[k] = v;
  return out;
}

export function structuredQuestRecord(def) {
 // registry:internal
  return {
    id: slugify(def.id), title: def.name || def.id, structured: true, status: "available",
    premise: normalizeProse(def.premise || ""), stakes: normalizeProse(def.stakes || ""), axis: def.axis || null, // SNG-217: literal \n → real break on write
    traditions: def.traditions || [], giver: def.giver || null, legend: def.legend || null,
    region: def.region || null, tier: def.tier || null,
    arcId: def.arcId || null, locationId: def.locationId || null,   // SNG-112: shared-arc key + own place (parallel player quests)
    // CCODE-22: carry the BOUND-ARC identity — structuredQuestsForGM gates the legend directive (SNG-132/133:
    // "a distant force turning toward you, the ending is yours") on (legend||legendNpc) && (boundToCharacter||
    // boundToPlayer). This whitelist-record dropped all three, so the mechanic was dead for every started
    // bound/personal arc (the def has them; the record didn't).
    boundToCharacter: def.boundToCharacter || null, boundToPlayer: def.boundToPlayer || null, legendNpc: def.legendNpc || null,
    // ⛔ SNG-542 (Aevi's unchecked half) — "WHETHER THE WRITE PATH HAS THE SAME HOLE AS THE READ PATH."
    // ⛑ IT DOES, AND IT IS A WHITELIST THAT KEPT FOUR FIELDS OF EIGHT.
    //
    // ⚑ MEASURED ACROSS THE AUTHORED CORPUS — 79 stages: `id` 79, `title` 79, `objective` 79, `condition` 79,
    // `change` 57, `imagePrompt` 64, `unlockHint` 16, `reveals` 10. ⛔ THIS KEPT FOUR AND DROPPED `title` FROM
    // ALL 79, which is the line a player reads FIRST.
    //
    // ⚠️ AND WHEN THE DEF'S SHAPE DIFFERS FROM THE WHITELIST THE RESULT IS NOT A PARTIAL RECORD, IT IS AN
    // EMPTY ONE: `{id: undefined, objective: undefined, …}` serialises to `{}`. Silas's save carries
    // `stages: [{}, {}, {}]` on three started quests whose authored stages are complete — the arity survived
    // and every word of it did not.
    //
    // ⛑ `hydrateQuest` HIDES THIS ON READ, which is why the player can read those quests today — and Aevi's
    // warning is the reason it still has to be fixed: "fine until content is retired under a live save, at
    // which point THE SNAPSHOT IS THE ANSWER and the answer is {}."
    //
    // ⚠️ SO THE RECORD CARRIES WHAT THE STAGE HAD, minus nothing, with prose normalised where prose lives. An
    // authored field added tomorrow rides along instead of being silently dropped — and §228 fails if the
    // corpus grows a stage field this does not keep.
    // ⛔ ONE FIELD IS DELIBERATELY NOT CARRIED, AND IT IS THE ONLY ONE: `truth`. A GM-eyes secret written into
    // the save is a secret in a file, duplicated away from the content that owns it, and a stale copy of it
    // would outlive the author's own correction. ⛑ SAFE BY DEFAULT: `hydrateQuest` fetches it from the def for
    // the GM, so if anything goes wrong — retired content, a def that cannot be found — the secret is ABSENT
    // rather than exposed, which is the direction a spoiler field should fail in. §228 names this exception.
    stages: (def.stages || []).map(s => {
      if (!s || typeof s !== "object") return s;
      const { truth: _gmEyes, ...out } = s;
      for (const k of ["objective", "condition", "change", "title", "unlockHint"]) {
        if (typeof out[k] === "string") out[k] = normalizeProse(out[k]);
      }
      return out;
    }),
    routes: normalizeQuestRoutes(def.routes), // CCODE-21: never an array — that renders as [object Object]
    outcomes: (def.outcomes || []).map(o => {
      const narr = o.narration || o.consequences || [];
      // SNG-238 §5b: the decision-button HINT (o.summary) is a consumer-read field — never leave it blank. A
      // marquee outcome carries `text` (the ending prose), not `summary`; fall back to it (clamped) so the
      // Resolve button reads and the content-shape audit passes. Same never-blank pattern as the name fallback.
      const summaryText = o.summary || o.text || (Array.isArray(narr) ? narr[0] : narr) || "";
      return {
        id: o.id, name: o.name || titleizeId(o.id), summary: smartClamp(normalizeProse(summaryText), 200), // CCODE-21: name fallback → the Resolve button is never blank; SNG-238: summary fallback → its hint is never blank
        narration: Array.isArray(narr) ? narr.map(normalizeProse) : normalizeProse(narr),   // prose for the chronicle (legacy: consequences)
        effects: o.effects || null                          // machine-readable deltas (null → legacy prose parse)
      };
    }),
    stageIndex: 0, completedStages: [], progress: [], aliases: []
  };
}

/** Start a structured quest (idempotent — never forks a duplicate). */
export function startStructuredQuest(character, def, ctx = {}) {
  if (!def || !def.id) return { ok: false, why: "unknown quest" }; // 146f: a missing def refuses cleanly, never throws
  character.quests = character.quests || [];
  const id = slugify(def.id);
  const existing = character.quests.find(q => q.id === id);
  if (existing) return { ok: false, why: "already in your log", quest: existing };
  if (!isRealQuest(def)) return { ok: false, why: "not a structured quest" };
  const rec = structuredQuestRecord(def);
  rec.status = "active"; rec.startedAt = ctx.nowISO || null; rec.startedWorldDay = ctx.worldDay ?? null;
  character.quests.push(rec);
  return { ok: true, quest: rec };
}

/** Mark a stage complete (its engine-testable condition met), applying the stage `change`
 *  as a findable progress note and advancing the stage pointer. */
/** SNG-162. THE TRIGGER, not a second adjudicator.
 *
 *  The engine half was already correct — `completeQuestStage` and `resolveStructuredQuest` do the
 *  right thing and are untouched. What did not exist was a way for the FICTION to reach them: their
 *  only callers were two button handlers, so a player could spend three scenes satisfying a stage's
 *  condition and the quest would not move until they left the narrative and clicked. "When the
 *  player acts" had been implemented as "when the player clicks", which is why two players
 *  independently adopted `unstickQuest` — a REPAIR op — as the normal way to finish a quest.
 *
 *  The model OBSERVES; the engine ADJUDICATES (same shape as SNG-153's gating). The GM reports that
 *  something happened and names the stage; every check here is free and structural, and the model
 *  never selects an outcome, picks a branch, or sets XP.
 *
 *  Deliberately NOT matching `evidence` against the stage's authored `condition` prose (PO ruling,
 *  §6.3): prose-matching prose is the judgement the model is already making, and re-checking it in
 *  the engine buys precision we cannot verify. Check 2 is what actually protects the player.
 *
 *  Returns { ok, why?, change?, stage?, awaitingResolution? }. A rejection is RECORDED, never silent. */
/** SNG-341 — A STAGE HAS A REQUIREMENT NOW. Erik, from play: *"it progressed basically 1 stage per beat…
 *  if you can learn, obtain, and deliver the required objectives in 3 beats it's not really a quest."*
 *
 *  ⚠️ THE CAUSE: a stage's `condition` is PROSE and nothing has ever parsed it. Stages closed through the
 *  "Mark this stage met" path — **a stage was complete when someone said it was** — so one narrative beat that
 *  gestured at the objective closed it, because there was nothing on the other side to disagree. Three beats
 *  finished a three-stage quest because the structure was never load-bearing.
 *
 *  `condition` STAYS as the player-facing sentence. `requires[]` is the gate, and every kind reads state the
 *  game already tracks — nothing new is recorded to make this work.
 *
 *  ⛔ `beats` IS NOT THE DEFAULT AND MUST NOT BECOME ONE. Erik: "don't make beats a standard go-to, only on
 *  quests that make sense." A minimum-beats floor applied everywhere is A TIMER, and a timer does not make a
 *  quest denser — it makes a fast quest slow. An urgent errand that SHOULD resolve in two beats becomes worse.
 *  Use it only where waiting IS the content: a vigil, a convalescence, a reply that has to travel.
 *  ⚠️ A thin stage is fixed by giving it a real requirement, never by making the player wait for it.
 *
 *  Pure. Returns { met, missing[], checked[] } — `missing` names what is not yet true, so a refusal can say
 *  WHY rather than just no.
 */
export function stageRequirementsMet(character, stage, ctx = {}) {
  const reqs = Array.isArray(stage?.requires) ? stage.requires : [];
  // ⛔ NO REQUIREMENTS = MET. Every quest authored before this shipped has none, and refusing them all would
  // break every live quest in every save to enforce a rule their content never agreed to.
  if (!reqs.length) return { met: true, missing: [], checked: [], unrequired: true };

  const norm = (v) => String(v || "").toLowerCase().trim();
  const has = (list, want) => (list || []).some(x => norm(typeof x === "string" ? x : (x?.id || x?.name)) === norm(want)
    || norm(typeof x === "string" ? x : (x?.name || x?.id)) === norm(want));

  const codexHas = (want) => {
    const topics = character?.codex?.topics || {};
    if (topics[want]) return true;
    return Object.values(topics).some(t => norm(t?.title || t?.name) === norm(want));
  };

  const checked = [], missing = [];
  for (const r of reqs) {
    const kind = norm(r?.kind), what = r?.what ?? r?.id ?? r?.name;
    let ok = false;
    switch (kind) {
      case "learn":   ok = codexHas(what); break;
      case "obtain":  ok = has(character?.inventory, what); break;
      case "reach":   ok = (character?.knownPlaces || []).some(p => norm(p) === norm(what)); break;
      case "speak":   ok = !!(character?.npcRegistry || {})[what]
                        || Object.values(character?.npcRegistry || {}).some(n => norm(n?.name) === norm(what)); break;
      // DELIVER is two facts at once: you had it, and they have it now. The engine can only see the second
      // half honestly — the item is GONE from inventory and the person is met — so that is what it checks.
      case "deliver": ok = !has(character?.inventory, r?.item ?? what)
                        && (!!(character?.npcRegistry || {})[r?.to] 
                            || Object.values(character?.npcRegistry || {}).some(n => norm(n?.name) === norm(r?.to))); break;
      case "resolve": ok = (character?.encounterLog || []).some(e => norm(e?.id || e?.defId) === norm(what) && e?.won); break;
      // ⛔ SITUATIONAL ONLY — see the note above. Counted from when the stage BECAME current, not from the
      // quest start, or a late stage inherits a debt it never incurred.
      case "beats": {
        const since = Number(ctx?.beatsOnStage);
        ok = Number.isFinite(since) && since >= (Number(what) || 0);
        break;
      }
      default: ok = true;   // an unknown kind cannot block a quest on an engine that does not understand it
    }
    checked.push({ kind, what, ok });
    if (!ok) missing.push(r?.hint || `${kind}: ${what}`);
  }
  return { met: !missing.length, missing, checked };
}

export function advanceStructuredQuest(character, op = {}, ctx = {}) {
  const qid = op.questId ? slugify(op.questId) : null;
  const { record: q, view } = questPair(character, qid, ctx);
  if (!q || q.status !== "active") return { ok: false, why: "no-such-quest", questId: qid };
  const stages = (view || q).stages || [];   // the WORDS and the requirements come off the def; the writes go to q
  const current = stages[q.stageIndex || 0];
  // ALREADY-DONE IS CHECKED FIRST, ahead of the stage-order gate. Once a stage completes the index
  // has moved past it, so a re-report would otherwise come back "not-current-stage" — true, but the
  // wrong diagnosis: it reads as the model misbehaving when it is simply repeating itself on a
  // retry. Both still refuse; only the recorded reason differs, and these reasons are surfaced.
  if ((q.completedStages || []).includes(op.stageId)) return { ok: false, why: "already-done", questId: qid };
  // THE LOAD-BEARING CHECK: the named stage must be the CURRENT one. A model naming a later stage
  // may not skip ahead, whatever it claims happened — stage order is un-jumpable structurally.
  if (!current || op.stageId !== current.id) {
    return { ok: false, why: "not-current-stage", questId: qid, named: op.stageId || null, expected: current?.id || null };
  }
  const evidence = smartClamp(String(op.evidence || "").trim(), 200);
  if (!evidence) return { ok: false, why: "no-evidence", questId: qid };

  // SNG-341 — ⛔ AND THE STAGE'S REQUIREMENTS MUST ACTUALLY BE TRUE. Until now `evidence` was the whole gate:
  // a sentence asserting the stage happened. That is the model marking its own homework, and it is why a
  // three-stage quest closed in three beats — nothing on the other side could disagree.
  //
  // ⚠️ EVIDENCE IS STILL REQUIRED. This does not replace it: the requirement says the world CHANGED, the
  // evidence says HOW, and the player is owed both. A stage that is mechanically satisfied but narratively
  // unexplained is the same silence in the other direction.
  const beatsOnStage = Math.max(0, (Number(character?.actionCount) || 0) - (Number(q.stageStartedAt) || 0));
  const req = stageRequirementsMet(character, current, { ...ctx, beatsOnStage });
  if (!req.met) {
    // The refusal NAMES what is missing, so the GM can turn it into a scene rather than a wall — "the clerk
    // still has not seen the filing" is playable; "cannot advance" is not.
    return { ok: false, why: "requirements-unmet", questId: qid, stageId: op.stageId, missing: req.missing };
  }

  const r = completeQuestStage(character, q.id, op.stageId, ctx);   // the EXISTING applier, now def-aware
  if (!r.ok) return { ok: false, why: r.why, questId: qid };
  // The reason the stage advanced is visible to the player, beside the authored change note.
  q.progress = [...(q.progress || []), `↳ ${evidence}`].slice(-12);

  // THE FINAL STAGE NEVER AUTO-RESOLVES. Progress is automatic; RESOLUTION is always the player's
  // explicit choice — "how I want to resolve it until it's time".
  const done = (q.completedStages || []).length >= stages.length || (q.stageIndex || 0) >= stages.length;
  if (done && !q.awaitingResolution) q.awaitingResolution = true;
  return { ok: true, questId: q.id, title: q.title, change: r.change, stage: r.stage, nextStage: r.nextStage, awaitingResolution: !!q.awaitingResolution };
}

export function completeQuestStage(character, questId, stageId, ctx = {}) {
  const { record: q, view } = questPair(character, questId, ctx);
  if (!q || q.status !== "active") return { ok: false, why: "no active structured quest" };
  const words = (view || q).stages || [];
  const si = (q.stages || []).findIndex(s => s.id === stageId);
  if (si < 0) return { ok: false, why: "unknown stage" };
  q.completedStages = q.completedStages || [];
  if (!q.completedStages.includes(stageId)) q.completedStages.push(stageId);
  q.stageIndex = Math.max(q.stageIndex || 0, Math.min(si + 1, q.stages.length));
  // SNG-341 — ⚠️ STAMP WHEN THE NEW STAGE BECAME CURRENT, so a `beats` requirement counts from THERE.
  // Counting from the quest's start would make a late stage inherit a debt it never incurred: stage 3 of a
  // long quest would open already satisfied, which is the opposite of what the requirement is for.
  q.stageStartedAt = Number(character?.actionCount) || 0;
  // ⛔ THE REVEAL PAID OUT IS THE AUTHORED ONE, NOT THE FROZEN ONE. Re-cutting a stage's `change` — from a
  // conclusion to the observations that earn it — is precisely the fix Aevi's finding asks for, and it used
  // to reach nobody already playing.
  const change = (words[si] || q.stages[si] || {}).change;
  if (change && !(q.progress || []).includes(change)) q.progress = [...(q.progress || []), change].slice(-12);
  // CCODE-16: the invariant "every stage behind you → the decision opens" lives HERE, in the one applier
  // BOTH write paths go through (the GM-op path via advanceStructuredQuest, and the manual "Mark this stage
  // met" button in the UI). The button path used to skip it, so a hand-completed quest could reach the final
  // stage yet never surface its endings — it read "This isn't finished yet" with nothing left to do. This is
  // NOT auto-resolve: awaitingResolution only unlocks the outcome menu; choosing the ending stays the player's.
  const done = (q.completedStages.length >= q.stages.length) || (q.stageIndex >= q.stages.length);
  if (done && !q.awaitingResolution) q.awaitingResolution = true;
  return { ok: true, change, stage: words[si] || q.stages[si], nextStage: words[q.stageIndex] || q.stages[q.stageIndex] || null };
}

/** SNG-BATCH-10 BOUNDARY-1 CLOSE: apply an outcome's MACHINE-READABLE effects[] deterministically.
 *  Every effect type from quest_structure.json is handled and lands somewhere durable + findable.
 *  ctx.recordEvent is an optional sink (dated propagating events) so the engine stays decoupled
 *  from sync; ctx.recordFact pins a findable fact. Returns the list of applied changes + total xp. */
function applyQuestEffects(character, quest, effects, ctx = {}) {
  // ⛔ SNG-552 §6 — THE EFFECT PATH NEVER RESOLVED A TOKEN, so an author had no way to say "whoever is deciding".
  // Prompt assembly has resolved `{{kind:id}}` since SNG-182; effects — the things that become PERMANENT WORLD
  // FACTS — went through untouched. ⚠️ That is the wrong way round: a prompt is read once and a world fact is read
  // forever. Resolved here, at the one door every effect passes through, so no effect type has to remember.
  // ⛑ A no-op on the overwhelming majority: `renderNames` returns the string untouched unless it contains "{{".
  if (ctx.content) effects = renderNamesDeep(effects, ctx.content, { character });
  const applied = [];
  character.peopleDisposition = character.peopleDisposition || {};
  character.worldEvents = character.worldEvents || [];
  character.npcRegistry = character.npcRegistry || {};
  character.locationState = character.locationState || {};
  let xp = 0;
  const pinFact = (text, secret) => { if (typeof ctx.recordFact === "function") { try { ctx.recordFact({ text, secret: !!secret }); } catch { /* sink optional */ } } };
  for (const e of effects || []) {
    if (!e || !e.type) continue;
    switch (e.type) {
      // NPC + people keys are authored content ids (underscores intact) — never slugify them.
      case "npc_state": {
        if (e.npc) { const k = e.npc; character.npcRegistry[k] = { id: character.npcRegistry[k]?.id || k, ...(character.npcRegistry[k] || {}), name: character.npcRegistry[k]?.name || e.npc, questState: e.state, questNote: e.note || null }; } // CCODE-20: STAMP id — an id-less giver stub throws in findExistingNpc and poisons every meet
        applied.push({ type: "npc_state", npc: e.npc, state: e.state });
        break;
      }
      case "disposition": {
        // SNG-126: a company LIAISON for this people speeds reputation while they travel with you
        // (ctx.liaisonMult is { [people]: multiplier }, supplied by the app from liaisonFactions).
        if (e.people && Number.isFinite(e.delta)) { const gain = Math.round(e.delta * (ctx.liaisonMult?.[e.people] || 1)); character.peopleDisposition[e.people] = (character.peopleDisposition[e.people] || 0) + gain; applied.push({ type: "disposition", people: e.people, delta: gain }); }
        break;
      }
      // SNG-235: a MEANINGFUL ending changes the world — the marquee-quest outcome vocab. Each maps the authored
      // effect onto the SAME engine store the GM path uses, so an ending DOES what its prose SAYS.
      // ⛔ SNG-552 §4 — AEVI'S RULING: "A PERMANENT WORLD FACT IS TWO FACTS AND THE EFFECT CONFLATES THEM."
      //
      //   · THE DEED — what was done, and by whom → the LEDGER: dated, attributed, append-only, never contested.
      //   · THE STATE — what is true NOW → CANON: weighted, contestable, overtakeable.
      //
      // ⛑ HER TEST SETTLES IT: Silas rewrote the instruction; Cellaceron seals it. THE DEED MUST SURVIVE —
      // nothing Cellaceron does makes it not have happened, and a store that lets it be overwritten is lying
      // about the past. THE STATE MUST BE OVERTAKEN — the facility is sealed; it is not ALSO cleansing.
      // ⚠️ Ledger alone gives two contradictory entries, both true, and no answer to "what is it doing now".
      // Canon alone lets a second player overwrite the first and the world forgets who did it — which is
      // `contributionsBy`'s whole point, undone.
      //
      // ⛔ AND THE DEFAULT IS `deed`, DOWN AND NEVER UP (her O2, the tier-ladder guard again): a state wrongly
      // filed as a deed costs nothing; a deed wrongly promoted to canon CAN OVERWRITE ANOTHER PLAYER'S WORLD.
      // ⚑ And most facts ARE deeds — "Silas named the spear Memory" was never contestable.
      case "world_fact": {
        if (!e.text) break;
        pinFact(e.text, e.secret);
        // ⛑ THE DEED IS EMITTED ALWAYS, INCLUDING FOR A STATE. A state is still something somebody did.
        if (typeof ctx.recordLedger === "function") {
          try { ctx.recordLedger({ what: String(e.text), tags: ["quest", quest.id].filter(Boolean), visibility: e.secret ? "private" : "witnessed" }); }
          catch (err) { if (typeof console !== "undefined") console.warn("[quest effects] world_fact ledger failed:", err?.message); }
        }
        // ⚠️ AND A STATE RIDES ITS SUBJECT. Her own examples are all facts ABOUT something that already exists
        // — "the facility, a holding, a river, whether a presence sleeps" — so the state belongs ON that record,
        // where the promotion path already carries it into canon and a contradicting state contests THE SAME
        // record. ⛔ A separate "fact" entity type would have been a second store for facts the canon store
        // already knows how to hold.
        // ⛔ SNG-584 (Aevi's queue §2: "a state can only ever be a place") — AND IT WAS WORSE THAN FILING IT
        // WRONG. This called `ctx.recordPlaceChange(subject, …)` for ANY subject, and app.js wires that to
        // `applyPlaceUpdates`, which CREATES the record it is handed: `placeMemory[id] || (placeMemory[id] = …)`.
        // ⚑ So a state about a PERSON did not merely land in the wrong store — it MINTED A PHANTOM PLACE named
        // after them, in the save, which the place surfaces then read back as somewhere the character had been.
        //
        // ⚠️ ALL 24 WORLD FACTS ARE `deed` TODAY, so nothing has fired it yet. Aevi's count is that TWELVE want
        // a state — what Saehara became, what happened to the Lightless Seraph, whether Silas's made thing
        // stands — and most of those subjects are not places. The bug was waiting for the content.
        //
        // ⛑ THE HOOK IS NAMED FOR THE QUESTION NOW, not for one of its answers. `recordStateOn` resolves the
        // subject to the record that can HOLD a state — a place, or a person — and RETURNS WHICH, so this can
        // tell "filed" from "nothing took it". ⛔ `recordPlaceChange` stays, and still means a place: the
        // `location_state` effect below is genuinely about one.
        const kind = String(e.kind || "deed").toLowerCase();
        const subject = e.subject || e.entityId || e.locationId || null;
        let asState = false;
        if (kind === "state") {
          // ⛔ DEFAULT DOWN, LOUDLY, AND SAY WHICH WAY IT FAILED. A state nobody can contest is not a state
          // however it is labelled — it becomes what it actually is, and the author is told. ⚠️ Three different
          // failures used to share one message ("needs a subject"), so an author who HAD given a subject was
          // told they had not.
          const warn = (why) => { if (typeof console !== "undefined") console.warn(`[quest effects] world_fact kind:"state" ${why} — filed as a deed: "${String(e.text).slice(0, 60)}"`); };
          if (!subject) warn("needs a subject to be contestable");
          else if (typeof ctx.recordStateOn !== "function") warn("has no recordStateOn to hold it");
          else {
            try {
              const filedAs = ctx.recordStateOn(subject, String(e.text));
              asState = !!filedAs;
              if (!filedAs) warn(`subject "${subject}" is neither a place nor anyone met`);
            } catch (err) { warn(`failed: ${err?.message}`); }
          }
        }
        applied.push({ type: "world_fact", text: e.text, kind: asState ? "state" : "deed", permanent: e.permanent !== false });
        break;
      }
      case "codex_fact": {  // → the CODEX (codexUpdates). Aevi authors {topic,kind,fact,entityId?}; legacy is {text}.
        const factText = e.fact || e.text;
        if (factText) {
          if (typeof ctx.recordCodex === "function") {
            try { ctx.recordCodex({ entityId: e.entityId || e.topic || slugify(String(factText).slice(0, 40)), label: e.label || titleizeId(e.topic || ""), kind: e.kind === "person" ? "person" : "lore", fact: factText }); }
            catch { pinFact(factText, e.secret); }
          } else pinFact(factText, e.secret);
          applied.push({ type: "codex_fact", topic: e.topic || null, kind: e.kind || "lore" });
        }
        break;
      }
      case "world_event": {
        if (e.text) {
          const day = (ctx.worldDay ?? null); const at = day == null ? null : day + (Number.isFinite(e.delayDays) ? e.delayDays : 0);
          const ev = { kind: "quest_consequence", questId: quest.id, questTitle: quest.title, text: smartClamp(e.text, 800), worldDay: at, propagates: e.propagates !== false }; // SNG-076: authored effect text — render whole (generous safety bound only)
          character.worldEvents.push(ev);
          if (typeof ctx.recordEvent === "function") { try { ctx.recordEvent(ev); } catch { /* sink optional */ } }
          applied.push({ type: "world_event", text: ev.text, worldDay: at });
        }
        break;
      }
      // ⛔ CCODE-354: A WORLD EVENT ANSWERED — for everyone, on the shared record, with who and when. Until this there was no
      // effect in the vocabulary that could end a crisis, so every authored ending that "fixes the river" fixed nothing.
      case "event_resolve": {
        if (e.eventId && character.worldState) {
          resolveEvent(character.worldState, e.eventId, { outcome: quest.outcomeId || null, outcomeName: quest.outcomeName || null,
            questId: quest.id, by: actorOf(character), worldDay: ctx.worldDay ?? null });
          applied.push({ type: "event_resolve", eventId: e.eventId });
        }
        break;
      }
      case "location_state": {
        // CCODE-25: a durable place-change → placeMemory (READ on return + fed to the GM via placeMemoryForGM),
        // not the write-only character.locationState store (nothing ever read it, so "a place changes" endings
        // silently did nothing). Falls back to the old store only if the hook is absent.
        if (e.location && e.change) {
          if (typeof ctx.recordPlaceChange === "function") { try { ctx.recordPlaceChange(e.location, e.change); } catch { character.locationState[e.location] = { ...(character.locationState[e.location] || {}), change: e.change, questId: quest.id }; } }
          else { character.locationState[e.location] = { ...(character.locationState[e.location] || {}), change: e.change, questId: quest.id }; }
          applied.push({ type: "location_state", location: e.location, change: e.change });
        }
        break;
      }
      // SNG-203 §3 / Phase 2B: a world_arc_quest is a signed PUSH on a greater arc — not a forward-only
      // ratchet. Direction comes from `to − from` (advance +, retreat −, hold 0) or an explicit `push`;
      // `weight` (1–3) scales it, so a legend/epic-driven action moves the world harder. The push accumulates
      // into this actor's contribution; the arc's canonical stage is the NET of every actor's pushes (Erik's
      // "structural directionality as net resultant of vector fields"), so an arc can be pushed BACKWARD when
      // one player counters another. Any non-zero push broadcasts as a propagating world_event; the arc's
      // hidden direction (pressureOnAdvance/tendency) never rides along — only the authored public `note`.
      case "arc_stage": {
        if (e.arcId && (Number.isFinite(e.to) || Number.isFinite(e.push))) {
          character.worldState = character.worldState || {};
          character.worldState.arcStages = character.worldState.arcStages || {};
          const prev = character.worldState.arcStages[e.arcId] || {};
          const weight = Math.max(1, Math.min(3, Math.round(Math.abs(e.weight)) || 1));
          const dir = Number.isFinite(e.push) ? Math.sign(e.push)
            : (Number.isFinite(e.from) && Number.isFinite(e.to)) ? Math.sign(e.to - e.from) : 0;
          const delta = dir * weight;
          const push = (Number.isFinite(prev.push) ? prev.push : 0) + delta;
          character.worldState.arcStages[e.arcId] = { ...prev, push, sinceDay: ctx.worldDay ?? null, byQuest: quest.id };
          if (delta !== 0) {
            const moved = delta > 0 ? "advanced" : "receded";
            const ev = { kind: "arc_stage", arcId: e.arcId, questId: quest.id, questTitle: quest.title, dir: Math.sign(delta), weight,
              text: smartClamp(e.note || `A greater arc of the valley ${moved} — and everyone can see it.`, 800),
              worldDay: ctx.worldDay ?? null, propagates: e.propagates !== false };
            character.worldEvents.push(ev);
            if (typeof ctx.recordEvent === "function") { try { ctx.recordEvent(ev); } catch { /* sink optional */ } }
          }
          applied.push({ type: "arc_stage", arcId: e.arcId, push, delta });
        }
        break;
      }
      case "quest_seed": {
        if (e.text) { pinFact(`A thread opens: ${e.text}`, false); applied.push({ type: "quest_seed", text: e.text }); }
        break;
      }
      // ⛔ SNG-579 (Erik, twice: "we need moving holds/enterprises as well") — AN ENDING THAT SAYS YOU OWN A SHIP
      // HAS TO HAND ONE OVER.
      //
      // ⚑ MEASURED: `the_first_season` — Aevi's "third rung", the top of the Commander ladder — ends with
      // "⛑ THE LONGSHIP IS AN ENTERPRISE — a holding that moves" and, on the other branch, "You own a ship."
      // ⚠️ BOTH OUTCOMES CARRY EXACTLY ONE EFFECT AND IT IS A `world_fact`: a sentence. The prose promises a
      // holding and a carriage; the machinery grants a line of text.
      //
      // ⛔ AND NOTHING WAS RED, WHICH IS THE POINT. The seam auditor gates that every effect type USED is
      // HANDLED — `world_fact` is handled, so the quest passed every gate it has while promising a ship it could
      // not give. ⚠️ A vocabulary with no word for the thing the story just did is a quieter failure than a typo.
      //
      // ⛑ SO THE WORD EXISTS NOW. One type does both jobs, because they are the same sentence: a holding you are
      // given, and a holding that can move. Naming an EXISTING holding just gives that one a carriage
      // ("the Fell Pell gets wheels"); naming a new one mints it through `addHolding`, the same door the player's
      // own claim goes through — never a second constructor beside it.
      case "holding": {
        const want = String(e.id || e.holdingId || e.name || "").trim();
        if (!want) break;
        character.holdings = character.holdings || [];
        const key = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
        let h = character.holdings.find(x => x && (key(x.id) === key(want) || namesMatch(x.name, e.name || want)));
        let minted = false;
        if (!h) {
          // ⚠️ THROUGH `addHolding`, not a literal push: it stamps the id, the day, the ledger and the history
          // that every other holding carries, and a quest-granted enterprise that skipped them would be a holding
          // the rest of the machinery half-recognises.
          // ⚠️ AN ID IS REQUIRED OR `addHolding` REFUSES AND RETURNS NULL — silently, which for an authored
          // ending would mean the prose hands you a longship and the save records nothing at all. So a name-only
          // grant is slugified here rather than dropped there.
          const hid = e.id || slugify(String(e.name || want).slice(0, 40)) || null;
          h = addHolding(character, { id: hid, kind: e.kind || "enterprise", name: e.name || want,
            locationId: e.at || e.locationId || null, steward: e.steward || null, day: ctx.worldDay ?? null });
          minted = !!h;
          // ⛔ AND A REFUSAL IS SAID OUT LOUD. `addHolding` declines a household ("a family is not a holding" —
          // Aevi, SNG-358) and anything id-less; an ending that hit one of those would otherwise do nothing while
          // reading as though it had.
          if (!h) { if (typeof console !== "undefined") console.warn(`[quest effects] holding "${e.name || want}" was refused by addHolding — the ending granted nothing.`); break; }
        }
        if (!h) break;
        if (e.at && !h.locationId) h.locationId = e.at;
        let gave = null;
        if (e.carriage && typeof e.carriage === "object") {
          // ⛔ VALIDATED THROUGH `carriageOf`, WHICH IS THE ONLY READER THAT MATTERS. §209 found that a carriage
          // naming a kind the engine does not have is silently no carriage at all — I had written "hauled" into the
          // GM contract an hour before and nothing would have told me. An authored typo here would produce a
          // holding that reads as movable in the prose and refuses to move for the rest of the save.
          const proposed = { ...(h.carriage || {}), ...e.carriage };
          if (carriageOf({ ...h, carriage: proposed })) { h.carriage = proposed; gave = proposed.moves; }
          else if (typeof console !== "undefined") {
            console.warn(`[quest effects] holding "${h.name || h.id}": carriage kind "${e.carriage.moves}" is not one of ${CARRIAGE_KINDS.join("/")} — the holding stands, but it does not move.`);
          }
        }
        applied.push({ type: "holding", id: h.id, minted, carriage: gave });
        if (minted) pinFact(`${h.name || h.id} is yours${gave ? " — and she moves" : ""}.`, false);
        break;
      }
      // ⛔ SNG-579 · THE SECOND MISSING WORD, FOUND BY THE SAME MEASUREMENT. `the_tenth_season :: taught` ends
      // "⛑ He teaches you. `break_the_line`, `who_falls_first`, `small_company` — THE CLOSEST THING THE GAME HAS
      // TO COMMAND, and he gives it to you because you brought his people home."
      //
      // ⚑ ALL THREE CRAFTS ARE AUTHORED AND LOADED. Only the word was missing: fifteen effect types and not one
      // of them could teach. ⚠️ So the top of the Commander ladder named three real crafts by id and handed over
      // a sentence — the same shape as the longship, one file over.
      //
      // ⛑ THROUGH `ctx.teachAbility` so this module stays transport-free, the same injection as `createWaygate`:
      // the catalog a craft is learned from is assembled by the app (authored + the player's own minted ones) and
      // has never been reachable from here.
      case "teach": {
        const want = Array.isArray(e.abilities) ? e.abilities : [e.ability || e.abilityId].filter(Boolean);
        if (!want.length) break;
        if (typeof ctx.teachAbility !== "function") {
          // ⚠️ NEVER SILENTLY. A teaching scene the player has just read, dropped without a word, is the exact
          // failure this case exists to end.
          if (typeof console !== "undefined") console.warn(`[quest effects] teach: no ctx.teachAbility — ${want.join(", ")} was NOT taught.`);
          break;
        }
        for (const id of want) {
          try {
            const got = ctx.teachAbility(String(id), { free: true, why: e.why || quest.title || quest.id });
            // ⛔ AND A REFUSAL IS REPORTED AS A REFUSAL. `learnAbility` declines on a gate the player has not met,
            // and a teacher whose gift does not arrive is a promise broken on screen; the GM can then play the
            // lesson that does not land, which is a scene, where silence is a bug.
            if (got && got.ok !== false) applied.push({ type: "teach", ability: String(id) });
            else {
              applied.push({ type: "teach", ability: String(id), refused: got?.why || "not learnable yet" });
              if (typeof console !== "undefined") console.warn(`[quest effects] teach "${id}": ${got?.why || "refused"}`);
            }
          } catch (err) {
            if (typeof console !== "undefined") console.warn(`[quest effects] teach "${id}" failed:`, err?.message);
          }
        }
        break;
      }
      case "ally": {
        if (e.npc) { const k = e.npc; character.npcRegistry[k] = { id: character.npcRegistry[k]?.id || k, ...(character.npcRegistry[k] || {}), name: character.npcRegistry[k]?.name || e.npc, ally: true, allyNote: e.note || null }; applied.push({ type: "ally", npc: e.npc }); } // CCODE-20: STAMP id (see npc_state)
        break;
      }
      case "xp": {
        xp += Math.max(0, Math.min(60, e.amount | 0)); applied.push({ type: "xp", amount: e.amount | 0 });
        break;
      }
      // SNG-235 §3: resolve a personal/greater arc's FATE when the quest that carries it ends.
      case "arc": {
        if (e.arcId) {
          character.worldState = character.worldState || {};
          character.worldState.arcStages = character.worldState.arcStages || {};
          const prev = character.worldState.arcStages[e.arcId] || {};
          character.worldState.arcStages[e.arcId] = { ...prev, fate: e.fate || "resolved", resolvedByQuest: quest.id, note: e.note ? smartClamp(e.note, 400) : (prev.note || null), sinceDay: ctx.worldDay ?? null };
          applied.push({ type: "arc", arcId: e.arcId, fate: e.fate || "resolved" });
        }
        break;
      }
      // SNG-235 §3: a quest-ending standing shift → the SAME store (peopleDisposition) the GM's standingOps writes.
      case "standing": {
        if (e.people && Number.isFinite(e.delta)) {
          if (typeof ctx.recordStanding === "function") { try { ctx.recordStanding([{ people: e.people, delta: e.delta, why: e.why }]); } catch { character.peopleDisposition[e.people] = (character.peopleDisposition[e.people] || 0) + e.delta; } }
          else character.peopleDisposition[e.people] = (character.peopleDisposition[e.people] || 0) + e.delta;
          applied.push({ type: "standing", people: e.people, delta: e.delta });
        }
        break;
      }
      // SNG-235 §3: a quest ending NUDGES a greater arc (+1 push) — ties SNG-203/204 net-vector advancement.
      case "world_arc": {
        if (e.arc) {
          character.worldState = character.worldState || {};
          character.worldState.arcStages = character.worldState.arcStages || {};
          const prev = character.worldState.arcStages[e.arc] || {};
          const push = (Number.isFinite(prev.push) ? prev.push : 0) + 1;
          character.worldState.arcStages[e.arc] = { ...prev, push, sinceDay: ctx.worldDay ?? null, byQuest: quest.id };
          const ev = { kind: "arc_stage", arcId: e.arc, questId: quest.id, questTitle: quest.title, dir: 1, weight: 1, text: smartClamp(e.note || "A greater arc of the valley shifted.", 800), worldDay: ctx.worldDay ?? null, propagates: true };
          character.worldEvents.push(ev);
          if (typeof ctx.recordEvent === "function") { try { ctx.recordEvent(ev); } catch { /* sink */ } }
          applied.push({ type: "world_arc", arc: e.arc, push });
        }
        break;
      }
      // SNG-235: an ending that MAKES a waygate mints a REAL, travelable one (via the app's location machinery,
      // injected as ctx.createWaygate so this module stays transport-free — same pattern as recordFact/Codex).
      case "create_waygate": {
        if (typeof ctx.createWaygate === "function") {
          try { const gid = ctx.createWaygate({ id: e.id, name: e.name, description: e.description, connectsTo: e.connectsTo, waygateTier: e.waygateTier }); if (gid) applied.push({ type: "create_waygate", id: gid, name: e.name || null }); }
          catch (err) { if (typeof console !== "undefined") console.warn("[quest effects] create_waygate failed:", err?.message); }
        }
        break;
      }
      // SNG-243 §3: the network-shaped waygate effect — the gate becomes a REAL travel node with default/intent
      // connections (connects[]: each {to, kind, default, requires}) and, if networkCapable, joins the gate
      // network (§4). Same ctx.createWaygate injection as create_waygate (this module stays transport-free); the
      // app resolves each connection target to a real location id + AUGMENTS the minted node with the richer data.
      case "waygate": {
        if (typeof ctx.createWaygate === "function") {
          try { const gid = ctx.createWaygate({ gateId: e.gateId, name: e.name, at: e.at, connects: e.connects, networkCapable: e.networkCapable }); if (gid) applied.push({ type: "waygate", id: gid, networkCapable: !!e.networkCapable }); }
          catch (err) { if (typeof console !== "undefined") console.warn("[quest effects] waygate failed:", err?.message); }
        }
        break;
      }
      // SNG-235 seam: an unhandled effect type is content↔engine drift (an ending that does nothing). Make it
      // LOUD (was a silent "unknown") so the next drift is caught, not swallowed. The seam auditor also gates
      // it (tests/seams.json → quest-effect-types-handled).
      default: {
        if (typeof console !== "undefined") console.warn(`[quest effects] UNHANDLED effect type "${e.type}" — dropped. Add a case in applyQuestEffects or the ending does nothing.`);
        applied.push({ type: "unknown", raw: e.type });
      }
    }
  }
  return { applied, xp };
}

/** Legacy fallback: parse tagged-prose consequences when an outcome has no effects[] (old saves /
 *  pre-effects content). Best-effort; the chronicle write is still the findable floor. */
function applyQuestProse(character, quest, prose, ctx = {}) {
  const applied = [];
  character.peopleDisposition = character.peopleDisposition || {};
  character.worldEvents = character.worldEvents || [];
  for (const raw of prose || []) {
    const c = String(raw);
    if (/world[-\s]?event/i.test(c)) {
      const text = c.replace(/^[^:]*world[-\s]?event[^:]*:\s*/i, "").trim() || c;
      const ev = { kind: "quest_consequence", questId: quest.id, questTitle: quest.title, text: smartClamp(text, 800), worldDay: ctx.worldDay ?? null, propagates: true }; // SNG-076: authored/derived consequence — word-boundary
      character.worldEvents.push(ev);
      if (typeof ctx.recordEvent === "function") { try { ctx.recordEvent(ev); } catch { /* sink optional */ } }
      applied.push({ type: "world_event", text: ev.text });
    }
    const dm = c.match(/([A-Za-z][\w'-]*(?:\s+[A-Za-z][\w'-]*)?)\s+disposition[^.]*?\b(strongly\s+raised|raised|lowered|wary\s+respect)/i);
    if (dm) {
      const who = slugify(dm[1].trim()); const word = dm[2].toLowerCase();
      const base = /lower/.test(word) ? -1 : /strong/.test(word) ? 2 : 1;
      const delta = base < 0 ? base : Math.round(base * (ctx.liaisonMult?.[who] || 1)); // SNG-126: a liaison speeds gains, not penalties
      character.peopleDisposition[who] = (character.peopleDisposition[who] || 0) + delta;
      applied.push({ type: "disposition", people: who, delta });
    }
  }
  return applied;
}

/** Resolve a structured quest at a chosen outcome — APPLIES its consequences. Prefers the authored
 *  machine-readable effects[]; falls back to prose parsing for legacy outcomes. The floor either way:
 *  a findable chronicle entry so the player can always go back and SEE what they did. */
/** SNG-282: how big was this outcome? Read off the xp the outcome carries — the one number already stated
 *  about its scale. Not a judgement of the outcome, just its size. */
function xpHint(outcome, ctx = {}) {
  const eff = (outcome?.effects || []).find(e => e?.kind === "xp" || e?.xp != null);
  return eff?.xp ?? eff?.amount ?? ctx.xpReward ?? 30;
}
/** ⛔ R37a'S MISSING SIBLING, AND ERIK FOUND IT BY READING A ROSTER: "I ran a quest for Aldric so he should be leveled out."
 *
 *  A completed ASSIGNMENT credits the person a level — `worldtick` stamps `completions`, `derivedLevel` reads it, and that is
 *  R37a as ruled on 2026-09-04. ⚠️ A QUEST THEY GAVE YOU AND YOU FINISHED CREDITED THEM NOTHING. Aldric's provisioning deal has
 *  sat `completed` on Silas's save since day 5 and Aldric read as a level-1 nobody, which is the opposite of what the fiction did.
 *
 *  ⛑ THE GIVER IS A NAME, NOT AN ID, and it is written six different ways on one save: "Aldric (smokehouse man)", "Sorel (via
 *  Mara Wells)", "fendt", "Edvar Crane", "water_keeper", null. So the parenthetical gloss is stripped before matching — and a
 *  "(via X)" names the MESSENGER, never the giver, so it must not credit X. Then id, slug and the alias-aware namer in that order.
 *
 *  ⛔ IDEMPOTENT BY RECORD, not by caller: the quest ids already credited live on the person, so the live path and the one-shot
 *  backfill cannot double-count each other, and a re-run of either is free. A FAILED quest credits nobody. Returns the id credited
 *  or null. */
export function creditQuestGiver(character, quest) {
  const reg = character?.npcRegistry || {};
  const qid = quest?.id ? slugify(quest.id) : null;
  const raw = String(quest?.giver || "").trim();
  if (!qid || !raw) return null;
  const bare = raw.replace(/\s*\((?:via|through|from)\b[^)]*\)/gi, " ").replace(/\s*\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
  if (!bare) return null;
  const hit = reg[raw] || reg[bare] || reg[slugify(bare)] || resolveByName(bare, Object.values(reg));
  if (!hit || !hit.id) return null;
  const credited = Array.isArray(hit.creditedQuests) ? hit.creditedQuests : [];
  if (credited.includes(qid)) return null;
  hit.creditedQuests = [...credited, qid];
  hit.completions = (Number(hit.completions) || 0) + 1;
  return hit.id;
}

/** ⛔ A DECISION INSIDE A STAGE, WITH CONSEQUENCES THAT OUTLIVE IT. Erik: *"I want the quest to have decisions
 *  she needs to make — give the patient x or y or z medicine... with specific effects that help or hinder
 *  progress."*
 *
 *  ⚠️ EVERY CHOICE A QUEST OFFERED UNTIL NOW WAS THE LAST ONE. `outcomes[]` is 2–4 branched endings chosen at
 *  the decision point, and between the first beat and that point a quest asked the player for NOTHING it
 *  remembered — routes are display text with no selection behind them, and a stage's only verb is "advance".
 *  So a quest about which of two lookalike plants you carry down the hill could not be told which one you
 *  carried. ⛑ The shape is the one the endings already use — `{id, name, summary, effects[]}` — because a
 *  decision mid-quest and a decision at the end are the same act at different times.
 *
 *  ⛑ AND A CHOICE STEERS THE ENDINGS, which is what "helps or hinders progress" has to MEAN mechanically:
 *  an option may `forecloses` endings (that door is shut now) and may `opens` one (an ending nobody can reach
 *  without having chosen it). ⚠️ `opens` is read from the OPTIONS, never authored a second time on the
 *  outcome — an availability rule written in two places is a rule that disagrees with itself. PURE. */
export function stageChoice(quest, stageId) {
  const st = (quest?.stages || []).find(s => s && s.id === stageId);
  const ch = st?.choices;
  if (!ch || !Array.isArray(ch.options) || !ch.options.length) return null;
  const taken = quest?.decisions?.[stageId]?.option || null;
  return { stageId, prompt: ch.prompt || "", options: ch.options, taken, pending: !taken };
}

/** Every stage of this quest that is asking for a decision and has not had one. PURE. */
export function pendingChoices(quest) {
  const out = [];
  for (const s of quest?.stages || []) { const c = stageChoice(quest, s?.id); if (c?.pending) out.push(c); }
  return out;
}

/** ⛔ WHICH ENDINGS ARE STILL REACHABLE, AND WHY THE OTHERS ARE NOT — derived from the decisions actually
 *  taken, so the reason is always nameable rather than a door that is silently missing. PURE. */
export function outcomeAvailability(quest) {
  const outcomes = quest?.outcomes || [];
  const decisions = quest?.decisions || {};
  const closed = new Map();      // outcomeId → why
  // ⛔ ONLY A DECISION ACTUALLY TAKEN SHUTS ANYTHING. The first cut of this shut an ending because no choice
  // had yet OPENED it — so a player who reached the decision point without ever pressing the stage's button
  // was offered the failure and nothing else. ⚠️ A stage's choice is not guaranteed to be taken: the GM can
  // close a stage from play, and a quest that punishes a button nobody was told to press is a trap, not a
  // dilemma. ⛑ So the foreclosure comes from HAVING CHOSEN OTHERWISE, never from not having chosen.
  for (const s of quest?.stages || []) {
    const took = decisions[s?.id]?.option;
    if (!took) continue;                                     // undecided stages forbid nothing
    const opts = s?.choices?.options || [];
    const mine = opts.find(o => o.id === took);
    if (!mine) continue;
    for (const id of mine.forecloses || []) closed.set(id, `you chose ${mine.name || mine.id}`);
    // an ending only ANOTHER option of this same stage would have opened is shut by having chosen this one
    for (const o of opts) {
      if (o.id === took) continue;
      for (const id of o.opens || []) {
        if ((mine.opens || []).includes(id)) continue;
        if (!closed.has(id)) closed.set(id, `you chose ${mine.name || mine.id} instead`);
      }
    }
  }
  return {
    open: outcomes.filter(o => !closed.has(o.id)),
    closed: outcomes.filter(o => closed.has(o.id)).map(o => ({ ...o, why: closed.get(o.id) })),
  };
}

/** ⛔ TAKE THE DECISION. Its effects are paid THROUGH THE SAME APPLIER the endings use, so a choice mid-quest
 *  is as durable and as findable as an ending — design law 3: "if the player cannot go back and SEE what they
 *  did, it did not happen." ⚠️ ONE DECISION PER STAGE, and it does not unmake itself: re-choosing is refused
 *  rather than silently re-applied, because an effect paid twice is a world that drifted. */
export function chooseAtStage(character, questId, stageId, optionId, ctx = {}) {
  const { record: q, view } = questPair(character, questId, ctx);
  if (!q || q.status !== "active") return { ok: false, why: "not an active structured quest" };
  const ch = stageChoice(view || q, stageId);
  if (!ch) return { ok: false, why: "this stage asks for no decision" };
  if (ch.taken) return { ok: false, why: "already decided", taken: ch.taken };
  const opt = ch.options.find(o => o.id === optionId);
  if (!opt) return { ok: false, why: "unknown option" };
  q.decisions = q.decisions || {};
  q.decisions[stageId] = { option: opt.id, name: opt.name || opt.id, at: ctx.nowISO || null, worldDay: ctx.worldDay ?? null };
  let applied = [], xp = 0;
  if (Array.isArray(opt.effects) && opt.effects.length) ({ applied, xp } = applyQuestEffects(character, q, opt.effects, ctx));
  if (xp) character.xp = (character.xp || 0) + xp;
  // the decision is visible beside the stage's own note — the player must be able to see what they chose
  const line = `↳ ${opt.name || opt.id}${opt.summary ? ` — ${opt.summary}` : ""}`;
  if (!(q.progress || []).includes(line)) q.progress = [...(q.progress || []), line].slice(-12);
  return { ok: true, questId: q.id, stageId, option: opt.id, name: opt.name || opt.id, applied, xp, availability: outcomeAvailability(view ? { ...view, decisions: q.decisions } : q) };
}

/** ⛔ NO DEADLINE AT ALL. The sentinel a crisis stage already uses for "never again" (`days: 999`), kept so a
 *  quest can say out loud that it does not run out rather than saying nothing and being guessed at. */
export const NO_DEADLINE = 900;

/** ⛔ WHEN THIS QUEST RUNS OUT, IN ABSOLUTE WORLD DAYS — or null, which means it never does.
 *
 *  ⚠️ DERIVED, NOT STAMPED. `startedWorldDay` has been written on every structured quest since the day the
 *  record was designed and read by NOTHING; it is the stamp this was waiting for. Deriving from it rather
 *  than writing a second field means a deadline AUTHORED LATER reaches a quest already in play — the same
 *  rule as every other word the def owns — and there is no backfill to forget.
 *  ⛑ AND IT FAILS ABSENT: a save with no `startedWorldDay` has no deadline, so the worst an old save can do
 *  is not run out. A clock that starts itself at "now" would kill a patient somebody treated a month ago.
 *  ⚠️ ABSOLUTE WORLD DAYS, NEVER CHARACTER DAYS. Character days are player-advanced and therefore gameable —
 *  worldtick.js says so in its own comment — and a dying man you can keep alive by refusing to sleep is not
 *  a deadline, it is an exploit. PURE. */
export function questDeadline(quest) {
  const days = Number(quest?.deadlineDays);
  if (!Number.isFinite(days) || days <= 0 || days >= NO_DEADLINE) return null;
  // ⛔ `Number(null)` IS 0, AND 0 IS FINITE. A quest whose `startedWorldDay` is null — which is every quest
  // begun before the stamp had a reader, and any quest a GM minted — would have computed a deadline of
  // world-day 0 + days and been ALREADY OVERDUE on the next beat. ⚠️ Measured before it shipped: a save with
  // no stamp came back "LAPSED, overdue by 995 days", which is every old quest in the world dying at once
  // the first time this ran. Absence must stay absence; it must never be converted into an answer.
  const raw = quest?.startedWorldDay;
  if (raw == null || raw === "") return null;
  const from = Number(raw);
  if (!Number.isFinite(from)) return null;
  return { day: from + days, days, outcomeId: quest.deadlineOutcome || null, warnWithin: Math.max(1, Number(quest.deadlineWarnDays) || 2) };
}

/** ⛔ WHICH QUESTS HAVE RUN OUT, AND WHICH ARE ABOUT TO. Erik: "the quest must be able to lead to failure."
 *  A failure the player has to CHOOSE off a menu is not one — the patient's four days have to be able to
 *  simply pass.
 *
 *  ⛑ A DETECTOR, NOT A RESOLVER, and deliberately: a structured quest ends exactly one way, through
 *  `resolveStructuredQuest`, which is what pays the effects, the deed, the chronicle and the wake. Handing
 *  back what SHOULD end lets the caller end it through that one door with the full context it needs, instead
 *  of a second ending path that quietly pays less than the first.
 *  ⚠️ AND THE WARNING IS THE LAW'S THIRD GUARD — "the player must have been able to see it coming. A failure
 *  nobody could have avoided is a cutscene." It latches on the quest so it is said once, not every beat.
 *  PURE except for that one latch. */
export function questDeadlines(character, ctx = {}) {
  const worldDay = Number(ctx.worldDay);
  const out = { lapsing: [], lapsed: [] };
  if (!Number.isFinite(worldDay)) return out;                 // no clock, no verdict — never guess one
  const quests = ctx.defs ? questsForGMView(character, ctx.defs) : (character?.quests || []);
  for (const q of quests) {
    if (!q?.structured || q.status !== "active") continue;
    const dl = questDeadline(q);
    if (!dl) continue;
    const rec = (character.quests || []).find(x => x.id === q.id);
    if (worldDay >= dl.day) {
      // ⚠️ AN ENDING THAT DOES NOT EXIST IS NOT AN ENDING. A deadline naming an outcome the quest does not
      // carry must NOT quietly end it — it is reported so somebody fixes the content, and the quest lives.
      const outcome = (q.outcomes || []).find(o => o.id === dl.outcomeId);
      if (!outcome) { out.lapsing.push({ questId: q.id, title: q.title, daysLeft: 0, broken: `deadlineOutcome "${dl.outcomeId}" is not one of this quest's endings` }); continue; }
      out.lapsed.push({ questId: q.id, title: q.title, outcomeId: outcome.id, outcomeName: outcome.name || outcome.id, onDay: dl.day, overdueBy: worldDay - dl.day });
    } else if (worldDay >= dl.day - dl.warnWithin) {
      if (rec && rec.deadlineWarned) continue;
      if (rec) rec.deadlineWarned = true;
      out.lapsing.push({ questId: q.id, title: q.title, daysLeft: dl.day - worldDay });
    }
  }
  return out;
}

export function resolveStructuredQuest(character, questId, outcomeId, ctx = {}) {
  const { record: q, view } = questPair(character, questId, ctx);
  if (!q || q.status !== "active") return { ok: false, why: "not an active structured quest" };
  // ⛔ THE ENDINGS COME OFF THE DEF. The screen already drew them from the def; looking them up here on the
  // frozen record is what made a newly authored ending a button that refuses itself.
  const outcome = ((view || q).outcomes || []).find(o => o.id === outcomeId);
  if (!outcome) return { ok: false, why: "unknown outcome" };
  // ⛔ AN ENDING MAY BE A FAILURE, AND ERIK RULED IT SO (CCODE-459): "the quest must be able to lead to
  // failure... death of the patient, which aevi avoided at first." ⚠️ This overturns a line of the authoring
  // law — `quest_structure.json` said "NOT success/fail — WHICH success" — and the law is edited with it,
  // because an engine and a law that disagree are worse than either rule alone.
  // ⛑ A FAILURE IS A REAL ENDING, NOT AN ABSENCE OF ONE: it pays its effects, records its deed, writes its
  // chronicle line and leaves its wake exactly as any other does. The only thing that differs is the word
  // the log ends on — and that a failed quest, like a resolved one, does not re-open.
  q.status = outcome.failure ? "failed" : "resolved";
  q.failed = !!outcome.failure || undefined;
  // ⚠️ AND A DECISION THAT SHUT THIS DOOR SHUTS IT HERE TOO. The screen offers only what is open, but the
  // screen is not the gate — the SNG-244 decision strip and author mode reach this same function.
  {
    const avail = outcomeAvailability({ ...(view || q), decisions: q.decisions });
    const shut = avail.closed.find(o => o.id === outcome.id);
    if (shut) { q.status = "active"; q.failed = undefined; return { ok: false, why: "that ending is closed", because: shut.why }; }
  }
  // ⛔ R37a's sibling: the person who set you on it grew by it — AND ONLY ON A COMPLETION. The freeform path
  // has said so since it was written ("a quest that failed is not work the giver is the better for"), and
  // making failure a real ending here left this line firing for both. Caught by §191, which is a gate about
  // WHO GETS CREDIT and was right to go red.
  if (!outcome.failure) creditQuestGiver(character, q);
  q.outcomeId = outcome.id; q.outcomeName = outcome.name;
  q.resolvedAt = ctx.nowISO || null; q.resolvedWorldDay = ctx.worldDay ?? null;
  // ⛔ CCODE-354: A WORLD-TIER ENDING GOES ON THE SHARED RECORD. Silas ended What the Water Remembers on world-day 26 and it
  // was recorded on his quest and nowhere else — so the next traveler to reach Mara's store got the crisis from the top.
  // ⛑ Now the next one gets Aevi's board for the world as it now IS (`priorOutcomeBoards`), and knows who ended it.
  if (q.tier === "world" && character.worldState) {
    try { recordQuestOutcome(character.worldState, q.id, { outcome: outcome.id, outcomeName: outcome.name || null, by: actorOf(character), worldDay: ctx.worldDay ?? null }); }
    catch { /* the record is additive — a quest must resolve even if it cannot be written */ }
  }

  // SNG-282 (Erik) — "the player's deeds and quest resolutions spread just like NPCs."
  //
  // A resolved quest was recorded on the QUEST and nowhere else, so the one thing a player is most likely to
  // be known for left no trace in the record the world reads. Recorded HERE rather than at a call site
  // because there are several ways a quest resolves — the player finishing it, a GM op, author mode — and a
  // deed that depends on which door was used is a deed that goes missing.
  //
  // ⛔ WEIGHT IS MAGNITUDE, NOT MERIT (DIRECTIVE SNG-280). It comes off the size of the outcome, so an
  // outcome that ends a thing travels as far whether it ended it kindly or otherwise. The OUTCOME NAME is
  // the description, so what spreads is what actually happened rather than a judgement of it.
  try {
    const scale = Math.max(0, Math.min(60, Number(xpHint(outcome, ctx)) || 0));
    recordDeed(character, {
      description: `${q.title || q.name || "a matter"} — ${outcome.name || outcome.id}`,
      weight: scale >= 45 ? 3 : scale >= 20 ? 2 : 1,
      communityId: ctx.communityId ?? null,
      locationId: ctx.locationId ?? null,
      tags: ["quest", "resolution", outcome.id].filter(Boolean),
    }, ctx.aptitudeMods || {});
  } catch { /* a quest must resolve even if the record cannot be written */ }
  let applied, xp;
  if (Array.isArray(outcome.effects) && outcome.effects.length) {
    ({ applied, xp } = applyQuestEffects(character, q, outcome.effects, ctx));
    if (!xp) xp = Math.max(0, Math.min(60, ctx.xpReward | 0 || 30)); // effects[] with no xp effect → default award
  } else {
    applied = applyQuestProse(character, q, outcome.narration || [], ctx);
    xp = Math.max(0, Math.min(60, ctx.xpReward | 0 || 30));
  }
  character.chronicle = character.chronicle || [];
  character.chronicle.push({
    kind: "quest_resolved", questId: q.id, title: q.title, outcome: outcome.name,
    summary: outcome.summary, narration: outcome.narration || [],
    worldDay: ctx.worldDay ?? null, at: ctx.nowISO || null
  });
  character.xp = (character.xp || 0) + xp;
  // SNG-204: a significant outcome leaves a WAKE the world continues from — provenance + the applied change +
  // the arc's pressure-seed + a lean on the arcs it connects to. Never throws; a wake is additive to the resolve.
  let wake = null;
  try { wake = createWake(character, q, outcome, applied, ctx.content || {}, ctx); } catch { /* wake is additive — never block a resolve */ }
  return { ok: true, outcome, applied, xp, wake };
}

/** SNG-112: has the player already TOUCHED this quest's thread? True when they already KNOW one
 *  of its people (its giver or legend is in their npc registry, disposition, or codex), or another
 *  quest they hold references the same people. A continuation surfaces; a cold unrelated arc does not.
 *  Region is deliberately NOT a thread signal — a shared region is not a shared story. */
export function threadTouched(def, character) {
  const ids = [def.giver, def.legend, ...(def.entities || [])].filter(Boolean).map(x => slugify(x));
  if (!ids.length) return false;
  const known = new Set();
  for (const k of Object.keys(character.npcRegistry || {})) known.add(slugify(k));
  for (const k of Object.keys(character.peopleDisposition || {})) known.add(slugify(k));
  for (const t of Object.values(character.codex?.topics || {})) { if (t.entityId) known.add(slugify(t.entityId)); if (t.id) known.add(slugify(t.id)); }
  if (ids.some(id => known.has(id))) return true;
  // another quest already on the same thread's people (giver/legend by id or resolved entity id)
  for (const q of character.quests || []) {
    const qref = [q.giver, q.giverEntityId, q.legend].filter(Boolean).map(x => slugify(x));
    if (qref.some(r => ids.includes(r))) return true;
  }
  return false;
}

/** Which authored quests are STARTABLE for a character here. SNG-112: sharing a REGION is no longer
 *  enough — a region holds many places and threads, so a bare region match used to push an unrelated
 *  arc into the scene (Cellaceron's Fendt quest surfaced to off-thread, far-away Silas). A real
 *  connection must hold: the giver is present, the player is AT or ADJACENT to the quest's location
 *  (its own locationId, else the giver's home via ctx.npcHomes), or the player has already TOUCHED the
 *  quest's thread. Region is a soft signal ONLY on an explicit browse surface (ctx.board — a quest
 *  board the player chose to open), never an automatic interruption. Parallel arcs: a player already
 *  holding a quest on a shared def.arcId is not offered a second instance of the same arc. */
export function availableStructuredQuests(character, catalog = [], ctx = {}) {
  const have = new Set((character.quests || []).map(q => q.id));
  const heldArcs = new Set((character.quests || []).map(q => q.arcId).filter(Boolean));
  const sceneNames = (ctx.sceneNpcNames || []).map(n => String(n).toLowerCase());
  const near = new Set([ctx.locationId, ...(ctx.adjacentLocationIds || [])].filter(Boolean)); // at OR adjacent
  const npcHomes = ctx.npcHomes || {};
  const noContext = !ctx.region && !ctx.locationId && !ctx.sceneNpcNames && !ctx.board; // e.g. a bare board → offer all
  return (catalog || []).filter(isRealQuest).filter(def => {
    if (have.has(slugify(def.id))) return false;
    if (def.arcId && heldArcs.has(def.arcId)) return false;                 // one instance per shared arc
    // SNG-132: a BOUND legendary arc follows its CHARACTER, not a location — it ignores the proximity gate
    // and surfaces ONLY for the character/player it's bound to (never anyone else, even on a bare board).
    if (def.boundToCharacter || def.boundToPlayer) {
      return (def.boundToCharacter && character?.name && namesMatch(character.name, def.boundToCharacter))
        || (def.boundToPlayer && character?.playerKey && character.playerKey === def.boundToPlayer);
    }
    if (noContext) return true;
    if (def.giver && sceneNames.some(n => namesMatch(n, def.giver))) return true;   // (1) giver present
    const questLoc = def.locationId || (def.giver ? npcHomes[slugify(def.giver)] : null); // (2) proximity
    if (questLoc && near.has(questLoc)) return true;
    if (threadTouched(def, character)) return true;                          // (3) thread touched
    if (ctx.board && ctx.region && def.region && def.region === ctx.region) return true; // (4) explicit browse only
    return false;
  });
}

/** The routes a character's domains open through a structured quest — so the player sees how
 *  WHO THEY ARE changes the approach (spec: routes fan across the great circle). */
export function routesForCharacter(quest, character) {
  const domains = [character?.domains?.primary, character?.domains?.secondary, character?.domains?.tertiary].filter(Boolean);
  const routes = quest.routes || {};
  const open = [], other = [];
  // ⚠️ CCODE-357: a route already SAVED as "[object Object]" (the personal-arc writer's old String(v)) is not a route — it is
  // dropped here rather than handed to the GM or the player as three identical nonsense strings.
  for (const [trad, text] of Object.entries(routes)) {
    if (typeof text !== "string" || text.trim() === "[object Object]") continue;
    (domains.includes(trad) ? open : other).push({ trad, text, open: domains.includes(trad) });
  }
  return [...open, ...other];
}

/** GM block for structured quests: stakes + current stage + the routes the character's domains open.
 *  SNG-132: for a BOUND legendary arc, also surface its `legend` NPC as a distant, turning-toward-this-
 *  character presence — escalating ONLY as stages complete (pass `opts.npcs` to name the legend). */
export function structuredQuestsForGM(character, opts = {}) {
  // ⛔ READ THROUGH THE DEF. The record is progress; the words are content. Without this the GM was handed
  // three live quests whose every stage was `{}` and narrated around the hole.
  const active = (opts.defs ? questsForGMView(character, opts.defs) : (character.quests || []))
    .filter(q => q.structured && q.status === "active");
  if (!active.length) return null;
  const npcs = opts.npcs || {};
  return active.map(q => {
    const stage = q.stages[q.stageIndex] || q.stages[q.stages.length - 1];
    const open = routesForCharacter(q, character).filter(r => r.open).map(r => r.trad);
    let line = `- [${q.id}] ${q.title} (axis: ${q.axis || "?"}) — STAKES: ${q.stakes}\n  Now: ${stage?.objective || "resolve"}${stage?.condition ? ` (${stage.condition})` : ""}${open.length ? `\n  This character's domains open: ${open.join(", ")}` : ""}`;
    // SNG-343 — ⚠️ AND IF THIS STAGE'S TEXT WAS SEVERED, SAY SO. A store-time cap cut six of Splarf's
    // quest strings mid-word and the rest was never written down. It cannot be recovered — but a GM that
    // knows the sentence is incomplete can finish the thought in play, which is the only route back to a
    // whole quest. Told to the GM, never shown to the player as a defect marker: "[truncated]" on screen
    // says the game is broken and leaves the sentence exactly as broken.
    if (stage?._severed) line += `\n  ⚠ THIS OBJECTIVE WAS CUT SHORT BY A STORAGE FAULT and ends mid-sentence. Do NOT quote it as written — restate the objective whole and in your own words, consistent with the stakes.`;
    if ((q._severedRoutes || []).length) line += `
  ⚠ These routes were also cut short (${q._severedRoutes.join(", ")}) — treat their text as incomplete and re-describe them rather than reading them back.`;
    // SNG-341 — ⚠️ THE GM MUST SEE WHAT IS STILL MISSING, or it will keep trying to close a stage the
    // engine will keep refusing, and the refusal is invisible to the player as anything but a stuck quest.
    // Naming the gap turns it into the scene: "the clerk still has not seen the filing" is playable.
    {
      const beatsOnStage = Math.max(0, (Number(character?.actionCount) || 0) - (Number(q.stageStartedAt) || 0));
      const req = stage ? stageRequirementsMet(character, stage, { beatsOnStage }) : { met: true, missing: [] };
      if (!req.met) line += `
  STILL NEEDED before this stage can close (do NOT report it met until these are true): ${req.missing.join("; ")}.`;
    }
    // SNG-162 §1: the stage the model may report against, named explicitly. Without the id in the    // SNG-162 §1: the stage the model may report against, named explicitly. Without the id in the
    // prompt the GM cannot emit a stageOp that passes the current-stage gate.
    // ⛔ THE GM-EYES DRAWER, AND IT IS THE OPPOSITE DIRECTIVE TO `change`. A stage's `change` is an EARNED
    // truth the GM states PLAINLY once the stage closes; `truth` is what the player is there to WORK OUT, and
    // gm.js rule 4 governs it — "reveal it only in earned fragments, never plainly". ⚠️ The two must not be
    // confused, or the drawer becomes another place the answer gets said.
    for (const [what, text] of [["THIS QUEST", q.truth], ["THIS STAGE", stage?.truth]]) {
      // ⚠️ THE LABEL IS THE ENGINE'S, NOT THE AUTHOR'S. The house convention prefixes such a string
      // "GM-EYES-ONLY:" by hand (water_crisis, precursor_mechanism), and printing both reads as a stutter in
      // the one place the prompt has to be crisp about which kind of truth this is.
      if (text) line += `\n  GM-EYES-ONLY — ${what} (NEVER state this plainly; it is what the character is here to work out. Deliver OBSERVATIONS and withhold the INTERPRETATION): ${String(text).replace(/^\s*GM[- ]EYES[- ]ONLY\s*:?\s*/i, "")}`;
    }
    if (stage?.id && !q.awaitingResolution) {
      line += `\n  CURRENT STAGE ID: "${stage.id}" — if the character's actions THIS BEAT satisfy that condition, emit stageOps for it.`;
      // SNG-239: hand the GM the EARNED REVEAL this stage unlocks — the plain truth to STATE (not a secret to
      // withhold). When the stage is satisfied, name this in the prose, concretely, first-read clear; a vivid
      // image may accompany it but never replace it. This is the concrete payoff the quest exists to deliver.
      if (stage.change) line += `\n  WHEN SATISFIED, STATE PLAINLY (the earned reveal — SNG-239, an EARNED truth, not a GM-eyes secret): ${stage.change}`;
    }
    // ⛔ CCODE-459: A DECISION INSIDE THE STAGE, brought into the fiction for the same reason the ending is —
    // a choice that lives only in a panel is a choice half the players never learn they had.
    for (const c of pendingChoices(q)) {
      if (c.stageId !== stage?.id) continue;
      line += `\n  ⚑ THIS STAGE ASKS FOR A DECISION AND IT HAS NOT BEEN MADE: ${c.prompt || "the character must choose"} — options: ${c.options.map(o => o.name || o.id).join(" / ")}. Put the moment in front of the character THIS BEAT and let them choose. Do NOT choose for them, and do NOT narrate a consequence of any option until one is taken.`;
    }
    // ⛔ CCODE-459b: AND IF THE CLOCK IS RUNNING, SAY SO. The law's third guard is that a failure must have
    // been seeable coming; a GM that does not know the days are counting cannot make them felt.
    {
      const dl = questDeadline(q);
      if (dl && Number.isFinite(Number(opts.worldDay))) {
        const left = dl.day - Number(opts.worldDay);
        line += left <= 0
          ? `\n  ⛔ THIS QUEST'S TIME HAS RUN OUT. Play the consequence; do not offer more time.`
          : `\n  ⏳ ${left} day(s) left before this runs out, and it ends badly if it does. Let the pressure be FELT — in what the character can see, never as a number read aloud.`;
      }
    }
    const decided = Object.entries(q.decisions || {});
    if (decided.length) line += `\n  ALREADY DECIDED (play it as done, and let it cost what it costs): ${decided.map(([sid, d]) => `${sid} → ${d.name || d.option}`).join("; ")}`;
    // SNG-162 §2: at the decision point the GM brings the choice into the FICTION rather than
    // leaving it to a panel the player may never open.
    if (q.awaitingResolution) {
      line += `\n  ⚑ AT ITS DECISION POINT — every stage is done. Bring the choice into the fiction THIS BEAT: put the moment in front of the character and let them choose how it ends. Do NOT pick an outcome, do NOT narrate a resolution, and do NOT emit stageOps for it — the player resolves it themselves.`;
    }
    // ⛔ CCODE-354: ANOTHER TRAVELER ALREADY ENDED THIS — the board for the world as it now IS, authored in advance by Aevi
    // (SNG-552 O4, "retrieved rather than invented") and read by nothing until now.
    {
      const def354 = (opts.defs || []).find(d => d && questKey(d.id) === questKey(q.id)) || q;
      const pb = priorBoardFor(def354, character);
      if (pb) {
        const r = pb.record;
        line += `\n  ⛑ THE WORLD HAS MOVED ON: ${r.by?.name || "another traveler"} (another traveler) already ended this${r.worldDay != null ? ` on world-day ${r.worldDay}` : ""} — ${r.outcomeName || r.outcome}. Tell it as the world now IS, never as a replay.`;
        if (pb.board._theWorldNow) line += `\n  THE WORLD NOW: ${pb.board._theWorldNow}`;
        if (pb.board.premiseShift) line += `\n  WHAT THAT CHANGES: ${pb.board.premiseShift}`;
        if (q.awaitingResolution && pb.board.options) line += `\n  THE CHOICES, AS THEY NOW STAND: ${Object.entries(pb.board.options).map(([k, v]) => `${k}: ${v}`).join(" | ")}`;
      }
    }
    if ((q.legend || q.legendNpc) && (q.boundToCharacter || q.boundToPlayer)) {
      const leg = q.legendNpc || npcs[q.legend] || null; // SNG-133: a generated arc carries its legend inline
      const legName = leg?.name || q.legend || "a distant force";
      const si = (q.stageIndex || 0) + 1, n = q.stages.length;
      line += `\n  LEGEND — ${legName}: a distant, turning-toward-this-character presence (${leg?.role || "a legendary force"}). This arc FOLLOWS ${character.name || "them"}; make ${legName} felt as a slow gravity, escalating ONLY as stages complete (now stage ${si}/${n}) — never dump the whole arc. The ending is HERS to decide; never foreclose it.`;
    }
    return line;
  }).join("\n");
}

/** SNG-203 tier-2 (Tradition Arc): the traditions a character actually practices — the union of the
 *  teachers they've engaged and the traditions of the abilities they own. Foreclosed traditions drop out.
 *  This is the interest signal that decides which tradition arcs are worth surfacing at all. */
export function practicedTraditions(character, content = {}) {
  const set = new Set(Object.keys(character?.teachers || {}));
  const catalog = content.abilities || {};
  const index = content.traditionIndex;
  for (const o of (character?.abilities || [])) {
    const ab = catalog[o.abilityId];
    const t = ab ? traditionOf(ab, index) : (index?.abilityToTradition?.[o.abilityId] || null);
    if (t) set.add(t);
  }
  // ⛔ SNG-548 — AND THIS SILENTLY UNTAUGHT THE ANTIPODE. A tradition in `foreclosed` was struck from the set of
  // peoples the character counts as having practiced, so curricula and teacher offers could never reach it. Erik's
  // ruling makes the antipode learnable; a reader that deletes it from the practiced set enforces the opposite.
  return set;
}

/** SNG-203 §4: the tradition arc's CURRENT beat, chosen from the character's standing with its teacher.
 *  finding → they practice the craft but haven't found the deep teacher · proving → teacher met, not yet
 *  committed · ultimate → teacher willing, the capstone is learnable · complete → capstone owned. The
 *  gate mirrors the arc's own authored gate language (teachers[trad] = {met, willing}) exactly. */
export function traditionArcBeat(arc, character) {
  if (!arc || !Array.isArray(arc.beats)) return null;
  const beatBy = (name) => arc.beats.find(b => b.beat === name) || null;
  const owns = arc.capstoneAbility && (character?.abilities || []).some(a => a.abilityId === arc.capstoneAbility);
  if (owns) return { beat: "complete", def: null };
  const t = character?.teachers?.[arc.traditionId] || null;
  if (t && t.met && t.willing) return { beat: "ultimate", def: beatBy("ultimate") };
  if (t && t.met) return { beat: "proving", def: beatBy("proving") };
  return { beat: "finding", def: beatBy("finding") };
}

/** GM block for the character's live tradition arcs: for each tradition they practice that has an authored
 *  arc, name the teacher, the beat they're on, its gate, and the one quest that beat hands the player. The
 *  ultimate beat carries the SNG-197 doctrine — the capstone is learned in a SCENE, never a menu unlock. */
export function traditionArcForGM(character, content = {}, opts = {}) {
  const arcs = content.traditionArcs || {};
  if (!arcs || !Object.keys(arcs).length) return null;
  const practiced = opts.traditions || practicedTraditions(character, content);
  const lines = [];
  for (const trad of practiced) {
    const arc = arcs[trad];
    if (!arc) continue;
    const at = traditionArcBeat(arc, character);
    if (!at || at.beat === "complete") continue;
    const teacher = arc.teacher || {};
    const q = at.def?.quest || null;
    let line = `- TRADITION ARC [${trad}] — teacher: ${teacher.name || "unfound"}. This character is on the ${at.beat.toUpperCase()} beat`;
    if (at.def?.name) line += ` ("${at.def.name}")`;
    line += ".";
    if (at.def?.gate) line += `\n  GATE (how the beat opens): ${at.def.gate}`;
    if (q) line += `\n  THE QUEST it hands: [${q.id}] ${q.name || q.title || "?"} — ${q.premise || q.stakes || ""}`;
    if (at.beat === "ultimate") line += `\n  ⚑ CAPSTONE DOCTRINE: learning ${arc.capstoneAbility} is a SCENE the teacher gives, not a menu unlock (SNG-197). Bring the giving into the fiction; the weight is the point.`;
    lines.push(line);
  }
  return lines.length ? lines.join("\n") : null;
}

/** SNG-203 tier-6 (NPC Quest / errand): the offerable errands whose giver the character can actually reach —
 *  the giver is present in the scene or already known (in the codex/registry). Skips errands already taken
 *  or done. Deliberately light: an errand names a want and a task, not stakes — it is texture, not spine. */
export function npcQuestsForGM(character, content = {}, opts = {}) {
  const pool = content.npcQuests || [];
  if (!Array.isArray(pool) || !pool.length) return null;
  const known = opts.knownGivers instanceof Set ? opts.knownGivers : null;
  const present = new Set([opts.locationGiver, ...(opts.presentNpcIds || [])].filter(Boolean));
  const takenIds = new Set((character?.quests || []).map(q => q.id).filter(Boolean));
  const npcqState = character?.npcQuests || {}; // { [id]: "offered"|"active"|"done" }
  const lines = [];
  for (const nq of pool) {
    if (!nq || !nq.id || !nq.giver) continue;
    if (takenIds.has(nq.id) || npcqState[nq.id] === "done") continue;
    const reachable = present.has(nq.giver) || (known ? known.has(nq.giver) : true);
    if (!reachable) continue;
    lines.push(`- ERRAND [${nq.id}] from ${nq.giver}: ${nq.want}\n  TASK: ${nq.task}  →  REWARD: ${nq.reward}${nq.promotable ? "  (may grow into a real quest — promotable)" : ""}`);
  }
  return lines.length ? `NPC ERRANDS the GM may offer (light texture — not logged as real quests unless promoted):\n${lines.join("\n")}` : null;
}
