// ⛔ SNG-648 — EVERY CHARACTER GETS A NEMESIS, AND THE ENGINE AND THE GM BOTH KNOW WHO.
//
// Erik: *"Who's Silas's most likely nemesis?"* … *"I want you to make sure the game engine and GM know to do this."*
// Aevi's §1, measured before she wrote it: the personal arc's `legend` is bound to nobody, no record or GM block
// names an opponent, and `pacing.js` says *"the antagonist acts on their own clock"* while nothing tells it who the
// antagonist is.
//
// ⛔ SIX SIGNALS, ALL AUTHORED WEIGHTS, AND EVERY ONE SAYS WHETHER IT COULD BE READ AT ALL. That last part is the
// whole design. Measured on this corpus before building:
//   · `mirror` needs `figure.tradition` — on 27 of 56 eligible figures — and `alignment: "villain"`, which is on 10.
//   · `wantsTheirGround` and `throughTheirPeople` have real data: 47 figures carry `rivals`/`opposedBy`, and Silas
//     has five holdings with five stewards.
//   · `seatStakes` HAS NO SOURCE YET. Six greater arcs are loaded and none carries a claimant or a seat; SNG-642
//     and SNG-644 are still staged. The signal cannot fire, and it must SAY SO rather than score zero.
//   · `kinThreatened` IS WORSE THAN AEVI'S GUESS ("I haven't found a kin tag"). There IS a `kin` field — on ONE of
//     Silas's 39 known people — and it holds `"sworn"`, a bond rather than a kinship, on somebody with no recorded
//     location. `silas-mother`, the one person this signal exists for, carries no kin field at all: her kinship is
//     in her `role` PROSE, "Mother — lives at the cairn-line house". So the signal would fire on the wrong person
//     and never on the right one — and it may not read prose to find a mother, because it would one day find
//     somebody else's.
// ⚑ A SIGNAL THAT SCORES ZERO BECAUSE THE DATA IS ABSENT LOOKS EXACTLY LIKE ONE THAT SCORED ZERO BECAUSE IT LOOKED
// AND FOUND NOTHING. So `unreadable[]` comes back beside `hits[]`, the report says which, and the weight that could
// not be earned is named. Two of six is a third of the ceiling, and Aevi should see that rather than a total.
//
// ⚠️ PURE except where it is documented to write: `scoreNemesis`, `nemesisCandidates`, `buildNemesisPrompt`,
// `nemesisForGM` and `protectsOffscreen` touch nothing. `applyNemesisChoice` and `inheritNemesis` write
// `character.nemesis`, which is the whole of this feature's state.
// ⛔ AND THE NEMESIS IS NEVER NAMED TO THE PLAYER BEFORE THE FICTION NAMES THEM (Aevi §3.1) — the same rule the
// powers learned by reputation follow. `nemesisForGM` marks an unmet nemesis for the GM; no surface reads
// `character.nemesis.figureId` to print a name.

import { walkingDays } from "./worldmap.js";
import { powersFrom } from "./powers.js";
// ⛑ PROSE IS CLAMPED ON A WORD BOUNDARY, never sliced mid-word: `rawProseCaps` ratchets a fixed-length cap on
// model prose DOWN, and it refused nine of mine in this file on the first run.
import { smartClamp } from "./namematch.js";

const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
const lower = (v) => String(v || "").toLowerCase();
const listOf = (v) => (Array.isArray(v) ? v : []);

/** The dials, or nothing. ⛑ A rule this module cannot find is a rule that does not run — never a default of mine. */
const dials = (content) => content?.rules?.nemesis || null;

/** ⛔ WHO COULD BE ONE — `eligibleTiers`, `excludeAlignments`, and not the dead. ⚠️ THE DEAD ARE ON THE SAVE, NOT ON
 *  THE RECORD: `status` is authored on 2 of 56 figures, and what a world actually knows is
 *  `worldState.epicStatus[id].status`, which is the field `presence.js` already reads for the same purpose.
 *  ⛑ `dormantOk` is Aevi's: a dormant figure is a nemesis biding their time, which is the best kind. PURE. */
export function eligibleNemeses(character, { content = null } = {}) {
  const d = dials(content);
  if (!d) return [];
  const tiers = new Set(listOf(d.eligibleTiers).map(lower));
  const barred = new Set(listOf(d.excludeAlignments).map(lower));
  const fate = character?.worldState?.epicStatus || {};
  return Object.entries(content?.npcs || {})
    .filter(([id, n]) => n && tiers.has(lower(n.tier))
      && !barred.has(lower(n.alignment))
      && !(d.notDead && (fate[id]?.status === "dead" || n.status === "dead"))
      && id !== character?.id)
    .map(([id, n]) => ({ id, ...n }));
}

/** ⛔ ONE SIGNAL, AND WHETHER IT COULD BE READ. Returns `{ hit, why }` when it fired, `{ unreadable, why }` when the
 *  data it needs is not in the corpus, or null when it looked and found nothing. The three are different answers and
 *  this module never collapses them into a score. */
function signalMirror(character, figure) {
  if (!figure.tradition) return { unreadable: true, why: "no `tradition` on this figure (27 of 56 carry one)" };
  if (!figure.alignment) return { unreadable: true, why: "no `alignment` on this figure (30 of 56 carry one)" };
  if (lower(figure.alignment) !== "villain") return null;
  const mine = [lower(character?.origin), lower(character?.domains?.primary), lower(character?.nativeTradition)].filter(Boolean);
  if (!mine.length) return { unreadable: true, why: "this character records no people or primary domain" };
  if (!mine.includes(lower(figure.tradition))) return null;
  return { hit: true, why: `your own people carried to its pole — ${figure.tradition}, and a villain` };
}

function signalWantsGround(character, figure, { content, within }) {
  const holdings = listOf(character?.holdings).filter(h => h?.locationId);
  if (!holdings.length) return null;                     // nothing to want: looked, found nothing
  const locs = content?.locations || {};
  const theirs = powersFrom(content).filter(p => p.leader === figure.id);
  if (!theirs.length) return null;
  const HUNGRY = new Set(["expand", "raid", "extort", "tribute"]);
  for (const p of theirs) {
    if (!listOf(p.verbs).some(v => HUNGRY.has(lower(v)))) continue;
    for (const ground of [p.seat, ...listOf(p.reach)].filter(Boolean)) {
      for (const h of holdings) {
        const a = locs[ground], b = locs[h.locationId];
        const days = (a && b) ? walkingDays(a, b) : null;
        if (days != null && days <= within) {
          return { hit: true, why: `${p.name || p.id} would build over your ground — ${locs[ground]?.name || ground} is ${days < 1 ? "at" : `${Math.round(days)} days from`} ${h.name || h.locationId}` };
        }
      }
    }
  }
  return null;
}

function signalThroughPeople(character, figure) {
  const mine = new Set([
    ...listOf(character?.company).map(m => m?.npcId),
    ...listOf(character?.holdings).map(h => h?.steward),
  ].filter(Boolean));
  if (!mine.size) return null;
  const against = new Set([...listOf(figure.rivals), ...listOf(figure.opposedBy), ...listOf(figure.huntedBy)].filter(Boolean));
  if (!against.size) return null;
  const who = [...mine].find(id => against.has(id));
  return who ? { hit: true, why: `they come for you through ${who}, who stands against them` } : null;
}

/** ⛔ THE TWO SIGNALS WITH NO SOURCE. Each returns `unreadable` with the reason, every time, so the weight that
 *  cannot be earned is visible in every report rather than silently missing from a total. */
function signalSeatStakes(character, figure, { content }) {
  const arcs = content?.greaterArcs;
  const list = Array.isArray(arcs) ? arcs : Object.values(arcs || {});
  const withSeats = list.filter(a => /claimant|seat/i.test(JSON.stringify(a || {}))).length;
  if (!withSeats) {
    return { unreadable: true, why: `no loaded arc carries a claimant or a seat (${list.length} greater arc(s); the seat content is still staged)` };
  }
  const claims = list.filter(a => JSON.stringify(a?.claimants || a?.seat || "").includes(figure.id));
  return claims.length ? { hit: true, why: `a claimant on a seat — ${claims.map(a => a.id || a.name).join(", ")}` } : null;
}

function signalKinThreatened(character, figure, { content, within }) {
  // ⚠️ AEVI ASKED ME TO CHECK THE KIN SIGNAL AGAINST THE REGISTRY, AND THE ANSWER IS WORSE THAN "NO TAG".
  // There IS a `kin` field — on ONE of Silas's 39 known people — and it holds `"sworn"`, which is a bond and not
  // a kinship. `silas-mother`, the one person this signal exists for, carries no kin field at all: her kinship is
  // in her `role` PROSE, "Mother — lives at the cairn-line house on Cairnhold's center lane".
  // ⛑ SO THE SIGNAL WOULD FIRE ON THE WRONG PERSON AND NEVER ON THE RIGHT ONE, which is why it is not allowed to
  // read prose to find a mother: it would one day find somebody else's. It tests what a kin tag WOULD mean and
  // reports the population when the population cannot answer.
  const reg = character?.npcRegistry || {};
  const locs = content?.locations || {};
  const placed = (p) => locs[p?.lastSeen?.locationId] || locs[p?.lastSeen] || locs[p?.homeLocation] || locs[p?.locationId] || null;
  const tagged = Object.values(reg).filter(p => p?.kin || p?.relationshipKind || p?.kinship);
  const usable = tagged.filter(placed);
  if (!usable.length) {
    return { unreadable: true, why: `${tagged.length} of ${Object.keys(reg).length} known people carry a kin field and ${tagged.length ? "none is placed at a location" : "none exists"}`
      + `${tagged.length ? ` (the one that does records \`${lower(tagged[0].kin || tagged[0].relationshipKind || tagged[0].kinship)}\`, a bond rather than a kinship)` : " — kinship lives in `role` prose today"}` };
  }
  const theirs = powersFrom(content).filter(p => p.leader === figure.id);
  for (const p of theirs) {
    for (const ground of [p.seat, ...listOf(p.reach)].filter(Boolean)) {
      for (const k of usable) {
        const a = locs[ground], b = placed(k);
        const days = (a && b) ? walkingDays(a, b) : null;
        if (days != null && days <= within) {
          return { hit: true, why: `${k.name || k.id} is kin and lives ${days < 1 ? "at" : `${Math.round(days)} days from`} ${locs[ground]?.name || ground}, which ${p.name || p.id} holds` };
        }
      }
    }
  }
  return null;
}

/** ⛔ SCORE ONE FIGURE. Returns `{ id, name, score, ceiling, hits[], unreadable[] }`. `arcResonance` is NOT scored
 *  here: Aevi's rule is that it is "judged by the choosing call from the shortlist, never by keyword alone", so its
 *  weight is part of the ceiling and the model earns it. PURE. */
export function scoreNemesis(character, figure, { content = null } = {}) {
  const d = dials(content);
  if (!d || !figure) return null;
  const w = (name) => num(d.signals?.[name]?.weight);
  const within = num(d.groundWithinDays, 12);
  const tests = [
    ["mirror", () => signalMirror(character, figure)],
    ["wantsTheirGround", () => signalWantsGround(character, figure, { content, within })],
    ["throughTheirPeople", () => signalThroughPeople(character, figure)],
    ["seatStakes", () => signalSeatStakes(character, figure, { content })],
    ["kinThreatened", () => signalKinThreatened(character, figure, { content, within })],
  ];
  const hits = [], unreadable = [];
  let score = 0;
  for (const [name, run] of tests) {
    const r = run();
    if (!r) continue;
    if (r.unreadable) { unreadable.push({ signal: name, weight: w(name), why: r.why }); continue; }
    score += w(name);
    hits.push({ signal: name, weight: w(name), why: r.why });
  }
  const ceiling = Object.keys(d.signals || {}).reduce((n, k) => n + w(k), 0);
  return { id: figure.id, name: figure.name || figure.id, tier: figure.tier || null, score, ceiling,
    judged: w("arcResonance"), hits, unreadable };
}

/** ⛔ THE SHORTLIST — every eligible figure scored, the top `shortlist` kept with their reasons. This is what the
 *  choosing call sees, which is SNG-171's rule applied again: hand the model real candidates and let it judge the
 *  one thing a score cannot, rather than asking it to invent from nothing. PURE. */
export function nemesisCandidates(character, { content = null, max = null } = {}) {
  const d = dials(content);
  if (!d) return { candidates: [], unreadable: [], why: "rules.nemesis is not loaded" };
  const keep = num(max ?? d.shortlist, 3);
  const eligible = eligibleNemeses(character, { content });
  const all = eligible.map(f => scoreNemesis(character, f, { content })).filter(Boolean);
  const scored = all.filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score || String(a.id).localeCompare(String(b.id)));
  // ⛔ THE SIGNALS THAT COULD NOT BE READ, ACROSS EVERY ELIGIBLE FIGURE — not only the ones that scored.
  // ⚠️ MY FIRST VERSION COLLECTED THESE FROM THE SHORTLIST ONLY, which is the same under-reporting this whole
  // design exists to prevent: a signal unreadable for the thirty-seven figures that scored nothing is exactly the
  // signal whose absence is keeping them at nothing.
  const seen = new Map();
  for (const s of all) for (const u of s.unreadable) if (!seen.has(u.signal)) seen.set(u.signal, u);
  return { candidates: scored.slice(0, keep), considered: scored.length,
    eligible: eligible.length, unreadable: [...seen.values()] };
}

/** ⛔ THE CHOOSING CALL. It picks from the shortlist and BINDS THE ARC'S LEGEND with one of the authored relations.
 *  ⚠️ THE LEGEND IS NOT WHAT IT LOOKS LIKE: `personalArc.legend` is a slug (`the-finished-thing`) that resolves to
 *  nothing — not a legend record, not an npc — while `personalArc.legendNpc` beside it holds the real `{name, role}`.
 *  Aevi's §1 called it "free text bound to nothing"; it is worse than free text, because it looks like a reference.
 *  So the prompt is given the legendNpc's own words and told the slug is a label. Nothing here composes prose. */
export function buildNemesisPrompt(character, shortlist = [], { content = null } = {}) {
  const d = dials(content);
  const arc = character?.personalArc || {};
  const relations = listOf(d?.legendTie?.relations);
  const rows = shortlist.map((c, i) => {
    const f = content?.npcs?.[c.id] || {};
    return `${i + 1}. [${c.id}] ${c.name} — ${f.tier || "?"}${f.tradition ? `, of the ${f.tradition}` : ""}\n`
      + `   what they are: ${smartClamp(f.role || "", 200)}\n`
      + `   what they want: ${smartClamp(listOf(f.wants).slice(0, 3).join(" · "), 240) || "(not authored)"}\n`
      + `   why they scored ${c.score} of ${c.ceiling}: ${c.hits.map(h => `${h.signal} (+${h.weight}) ${h.why}`).join(" · ")}`;
  });
  return [
    `You are choosing one character's NEMESIS from a shortlist the engine scored, and binding their personal arc's legend to that nemesis.`,
    ``,
    `THE CHARACTER: ${character?.name || "they"}${character?.origin ? `, of the ${character.origin}` : ""}.`,
    `THEIR PERSONAL ARC: ${arc.name || arc.id || "(unnamed)"}`,
    `   premise: ${smartClamp(arc.premise || "(none)", 400)}`,
    `   stakes: ${smartClamp(arc.stakes || "(none)", 300)}`,
    arc.legendNpc ? `   the legend in it: ${arc.legendNpc.name} — ${smartClamp(arc.legendNpc.role || "", 240)}` : `   the legend in it: (none recorded)`,
    ``,
    `THE SHORTLIST, best-scored first:`,
    ...rows,
    ``,
    `⛔ THE ONE THING THE SCORE COULD NOT JUDGE, and the reason you are being asked: whether the figure and the arc`,
    `ANSWER EACH OTHER. A nemesis is not the strongest enemy; it is the one whose existence argues with what this`,
    `character's story is about. Weigh that above the score, and say plainly when a lower-scored candidate answers`,
    `the arc better.`,
    ``,
    `Then bind the legend, using EXACTLY one of these relations:`,
    ...relations.map(r => `   · ${r}`),
    ``,
    `Reply with JSON only: {"figureId": "...", "why": ["...", "..."], "legendTie": "<one of the relations above>", "legendTieWhy": "one sentence", "atStage": <1-based stage number or null>}`,
  ].join("\n");
}

/** ⛔ WRITE THE CHOICE. Refuses a figure that was not on the shortlist and a relation that is not authored — a
 *  choosing call that invents either has invented an opponent, and this is the one state this feature has. */
export function applyNemesisChoice(character, verdict = {}, { content = null, shortlist = [], day = null } = {}) {
  const d = dials(content);
  if (!character || !d) return null;
  const ids = new Set(shortlist.map(c => c.id));
  const figureId = String(verdict?.figureId || "");
  if (!ids.has(figureId)) return { refused: `\`${figureId || "(none)"}\` was not on the shortlist` };
  const relations = listOf(d.legendTie?.relations);
  const tie = String(verdict?.legendTie || "");
  if (relations.length && !relations.includes(tie)) return { refused: `\`${tie || "(none)"}\` is not one of the authored legend ties` };
  const chosen = shortlist.find(c => c.id === figureId);
  character.nemesis = {
    figureId,
    why: listOf(verdict.why).slice(0, 4).map(x => smartClamp(x, 240)),
    signals: chosen?.hits || [],
    legendTie: tie || null,
    legendTieWhy: verdict.legendTieWhy ? smartClamp(verdict.legendTieWhy, 300) : null,
    atStage: num(verdict.atStage, 0) || null,
    shortlist: shortlist.map(c => ({ id: c.id, score: c.score, why: c.hits.map(h => h.why) })),
    since: day ?? null,
    lastSurfacedDay: null,
  };
  return character.nemesis;
}

/** ⛔ OFFSCREEN PROTECTION (Aevi §3.2) — "the world tick may wound or stop a bound nemesis, but NEVER kill it. A
 *  nemesis dies only to the character, to their company, or in a scene the character is present for."
 *  ⚑ HER MEASUREMENT IS WHY: on Silas's save the Scouring Hand died on world day 76 at the Deep Lantern's hands,
 *  and he learned it from the news. A nemesis who dies in the news is a nemesis wasted.
 *  ⛑ ONE PREDICATE, TWO DOORS. Both places a figure can die offscreen call this: `applyEpicClashOutcome` for this
 *  world's own tick and `adoptFates` for another world's. A second copy of the rule would protect one door only.
 *  Returns a reason to refuse the death, or null to allow it. PURE. */
export function nemesisIdOf(character) { return character?.nemesis?.figureId || null; }

export function protectsOffscreen(nemesisId, figureId, { content = null, byCharacter = false, presentForIt = false } = {}) {
  // ⚠️ IT TAKES THE BOUND ID, NOT THE CHARACTER, because NEITHER DOOR THAT CAN KILL A FIGURE HAS ONE:
  // `applyEpicClashOutcome(ws, …)` is handed the worldState and `adoptFates(ws, …)` the same. Passing a character
  // into them would widen two signatures to reach one field; passing the id reaches it exactly. `nemesisIdOf` is
  // the one-liner each caller uses, so the field is named in one place.
  const d = dials(content);
  if (!d?.offscreenProtection) return null;
  if (!figureId || !nemesisId || nemesisId !== figureId) return null;
  if (byCharacter || presentForIt) return null;          // theirs to take, and the only way it is taken
  // ⛑ SNG-648 §3.2 — the ticket lives here and not in the string: §262 ratchets ticket tags in engine strings down,
  // because a tag that reaches a prompt or a log is a tag that can reach a player.
  return "a bound nemesis is not killed offscreen — wounded or stopped, never slain";
}

/** ⛔ INHERITANCE (Aevi §3.3) — the next name on the shortlist takes up the grudge, and the GM is told who and why.
 *  ⛑ The shortlist is re-scored rather than trusted: it was written when the world was in another state, and a
 *  candidate may since have died or lost the ground the score was about. Writes `character.nemesis`. */
export function inheritNemesis(character, { content = null, day = null } = {}) {
  const held = character?.nemesis;
  if (!held?.figureId) return null;
  const gone = listOf(held.shortlist).filter(c => c.id !== held.figureId);
  const fate = character?.worldState?.epicStatus || {};
  for (const next of gone) {
    if (fate[next.id]?.status === "dead") continue;
    const figure = content?.npcs?.[next.id];
    if (!figure) continue;
    const fresh = scoreNemesis(character, { id: next.id, ...figure }, { content });
    if (!fresh || fresh.score <= 0) continue;
    character.nemesis = { ...held, figureId: next.id, why: [`inherited the grudge when ${held.figureId} fell`],
      signals: fresh.hits, since: day ?? null, lastSurfacedDay: null, inheritedFrom: held.figureId };
    return character.nemesis;
  }
  return null;
}

/** ⛔ WHAT THE GM IS TOLD. Who, why in plain words, where they are and in what state, what they want, the legend
 *  tie, and the pacing line. ⚠️ AND WHETHER THE CHARACTER HAS MET THEM: the nemesis is never named to the player
 *  before the fiction names them, which is the same rule the powers learned by reputation follow. */
export function nemesisForGM(character, { content = null } = {}) {
  const n = character?.nemesis;
  if (!n?.figureId) return "";
  const f = content?.npcs?.[n.figureId];
  if (!f) return "";
  const d = dials(content);
  const fate = character?.worldState?.epicStatus?.[n.figureId] || null;
  const met = !!character?.npcRegistry?.[n.figureId];
  const where = content?.locations?.[f.homeLocation]?.name || f.homeLocation || null;
  const lines = [`## THE NEMESIS`, ``];
  lines.push(`**${f.name || n.figureId}**${met ? "" : ` ⚠️ (this character has NOT met them — do not use the name until the fiction gives it)`} — ${f.tier || "a figure"}${f.tradition ? `, of the ${f.tradition}` : ""}.`);
  lines.push(`What they are: ${smartClamp(f.role || "", 220)}`);
  if (listOf(f.wants).length) lines.push(`What they want: ${smartClamp(listOf(f.wants).slice(0, 2).join(" · "), 240)}`);
  if (where) lines.push(`Where: ${where}${fate?.status && fate.status !== "active" ? ` — **${fate.status}**${fate.atWorldDay != null ? ` since world-day ${fate.atWorldDay}` : ""}` : ""}`);
  if (n.why?.length) lines.push(`Why them: ${n.why.join(" · ")}`);
  else if (n.signals?.length) lines.push(`Why them: ${n.signals.map(s => s.why).join(" · ")}`);
  if (n.legendTie) lines.push(`The legend tie: **${n.legendTie}**${n.legendTieWhy ? ` — ${n.legendTieWhy}` : ""}${n.atStage ? ` (at stage ${n.atStage})` : ""}`);
  // ⛑ the pacing line, verbatim from `pacing.js`'s own words, which had no one to point at until now
  lines.push(``, `⛔ **THE NEMESIS ACTS ON ITS OWN CLOCK.** At least once every ${num(d?.surfaceEveryDays, 10)} world days, something of theirs should touch this character's world — a rumour, a power's approach, a road built over, a letter. Not an attack, and not a cameo: evidence that they are moving while the character was elsewhere.`);
  if (!met) lines.push(`⚠️ They are still unnamed to the player. Their work can be felt before their name is known.`);
  return lines.join("\n");
}

/** Whether the nemesis is overdue a touch, for the caller that schedules one. PURE. */
export function nemesisOverdue(character, { content = null, day = null } = {}) {
  const n = character?.nemesis;
  const every = num(dials(content)?.surfaceEveryDays, 10);
  if (!n?.figureId || day == null) return false;
  const last = n.lastSurfacedDay ?? n.since ?? null;
  return last == null ? true : (num(day) - num(last)) >= every;
}
