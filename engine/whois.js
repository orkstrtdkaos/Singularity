// engine/whois.js — SNG-299: who or what is that, and where do I read more?
//
// Erik: *"all of these new titles and terms and npcs need to have clickable popups describing who and what
// they are, with a link to the codex page for details."*
//
// A fortnight of work put names into the player's face — figures who rose, titles the world found, arcs that
// turned, tiers that mean something now — and every one of them is a bare string. "The Unravelled Mind, Whom
// The Cogitants Named, is called epic this season" contains three things a player cannot look up.
//
// ⛔ THE RULE, AND IT IS THE SAME ONE AS THE TITLES: this answers ONLY from what the world actually recorded.
// A figure's rung comes from `tierOf`, their cares from `currentCares`, their title from `figureTitles`, their
// fate from `epicStatus`. Nothing is composed, inferred or prettied up. **If nothing is known, this returns
// null and the name is not made clickable** — a popup that says "a figure of the valley" is worse than no
// popup, because it promises a lookup and delivers a shrug.
//
// Pure. Reads content + world state + the character's own codex; writes nothing, touches no DOM.

import { tierRank } from "./legends.js";

const TIER_MEANING = {
  mythic: "mythic — the world has a story about them, and only a handful ever get one",
  legendary: "legendary — they have lasted, and been counted",
  epic: "epic — known well beyond where they started",
  heroic: "heroic — a name in their own country",
  regional: "heroic — a name in their own country",
  notable: "notable — someone is beginning to say their name",
  riffraff: "riffraff — not yet anybody, which is where everybody starts",
};

/** Build the lookup index once per render: every name the world can answer for → its id and kind.
 *  Longest names first, so "Neth, Who Has Buried More Than She Has Known" wins over "Neth". */
export function knownIndex({ roster = [], arcs = [], codexTopics = {}, titles = {} } = {}) {
  const entries = [];
  const push = (name, id, kind) => {
    if (!name || typeof name !== "string" || name.length < 3) return;
    entries.push({ name, id, kind });
  };
  for (const f of roster) { push(f.name, f.id, "figure"); }
  for (const a of arcs) push(a.name, a.id, "arc");
  for (const t of Object.values(codexTopics)) push(t.label, t.entityId || t.id, "codex");
  // A TITLE is a thing you can ask about too — "Whom The Cogitants Named" is not self-explanatory.
  for (const [figureId, t] of Object.entries(titles)) if (t?.title) push(t.title, figureId, "title");
  for (const rung of Object.keys(TIER_MEANING)) push(rung, rung, "tier");
  entries.sort((a, b) => b.name.length - a.name.length);
  return entries;
}

/** Answer for one id. Returns { label, kind, lines[], codexId } or NULL when the world knows nothing. */
export function whoIs(id, kind, { ws = {}, content = {}, character = {}, roster = [] } = {}) {
  if (kind === "tier") {
    const meaning = TIER_MEANING[id];
    return meaning ? { label: id, kind: "tier", lines: [meaning], codexId: null } : null;
  }

  if (kind === "arc") {
    const arc = (content.greaterArcs || []).find(a => a.id === id);
    if (!arc) return null;
    const stage = ws.arcStageSeen?.[arc.id];
    const def = (arc.stages || []).find(s => s.stage === stage);
    const lines = [];
    if (def?.name) lines.push(`${def.name} — stage ${stage} of ${(arc.stages || []).length}`);
    // ⛔ publicFace only. The arc's `truth` is sealed and is not the player's to read from a popup.
    if (def?.publicFace) lines.push(def.publicFace);
    else if (arc.tendency) lines.push(arc.tendency);
    return lines.length ? { label: arc.name, kind: "arc", lines, codexId: null } : null;
  }

  const fig = roster.find(f => f.id === id);
  if (fig) {
    const lines = [];
    const rung = ws.figureTier?.[id] || fig.tier || fig.legend?.tier || null;
    const title = ws.figureTitles?.[id]?.title || null;
    if (title) lines.push(`Called ${title}.`);
    if (rung) lines.push(TIER_MEANING[rung] || rung);
    if (fig.tradition) lines.push(`Of the ${fig.tradition}.`);
    if (fig.role) lines.push(String(fig.role));
    if (fig.signature) lines.push(String(fig.signature));
    else if (fig.wants) lines.push(`Wants: ${fig.wants}`);
    // What they are spending themselves on RIGHT NOW — the thing that changes, and the reason to look again.
    const cares = ws.figureCares?.[id];
    if (Array.isArray(cares) && cares.length) {
      const names = cares.map(c => (content.greaterArcs || []).find(a => a.id === c.arcId)?.name || c.arcId);
      lines.push(`Currently caught up in: ${names.join(", ")}.`);
    }
    const st = ws.epicStatus?.[id]?.status;
    if (st === "dead") lines.push("Dead — though the roads back are not all closed.");
    else if (st === "wounded") lines.push("Wounded, and out of it for now.");
    // A person you have MET has a codex page; a name you have only heard may not.
    const codexId = character?.codex?.topics?.[id] ? id : null;
    return lines.length ? { label: fig.name, kind: "figure", lines, codexId } : null;
  }

  const topic = character?.codex?.topics?.[id];
  if (topic) {
    const facts = (topic.facts || []).slice(-2).map(f => String(f).replace(/^\[[^\]]*\]\s*/, ""));
    return facts.length ? { label: topic.label || id, kind: topic.kind || "codex", lines: facts, codexId: id } : null;
  }

  const t = Object.entries(ws.figureTitles || {}).find(([fid]) => fid === id);
  if (t) {
    const who = roster.find(f => f.id === id);
    return { label: t[1].title, kind: "title", codexId: null,
      lines: [`A name the world found for ${who?.name || "someone"}.`,
              `It comes from what they did, not from a list — ${describeSlots(t[1].slots)}.`] };
  }
  return null;
}

const describeSlots = (slots = {}) => {
  const parts = Object.entries(slots).map(([k, v]) => `${k.toLowerCase()}: ${v}`);
  return parts.length ? parts.join(", ") : "their own record";
};

export { TIER_MEANING };
