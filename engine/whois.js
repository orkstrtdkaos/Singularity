import { isDescriptiveNotName } from "./state.js";

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
export function knownIndex({ roster = [], arcs = [], codexTopics = {}, titles = {}, npcs = [] } = {}) {
  const entries = [];
  // ⚠️ DEDUPED BY NAME, FIRST SOURCE WINS. The same person legitimately appears in more than one
  // source — a roster figure who also has a codex page, a met NPC who earned one — and two entries with
  // one name made the linker's earliest-then-longest tie-break arbitrary. The order of the pushes below is
  // therefore the PRECEDENCE: the richest answer first.
  const taken = new Set();
  const push = (name, id, kind) => {
    if (!name || typeof name !== "string" || name.length < 3) return;
    if (taken.has(name)) return;
    taken.add(name);
    entries.push({ name, id, kind });
  };
  for (const f of roster) { push(f.name, f.id, "figure"); }
  for (const a of arcs) push(a.name, a.id, "arc");
  for (const t of Object.values(codexTopics)) push(t.label, t.entityId || t.id, "codex");
  // A TITLE is a thing you can ask about too — "Whom The Cogitants Named" is not self-explanatory.
  for (const [figureId, t] of Object.entries(titles)) if (t?.title) push(t.title, figureId, "title");
  // ⛔ SNG-369 — THE PEOPLE YOU HAVE ACTUALLY MET WERE THE ONE SOURCE THIS DID NOT READ. Erik, in
  // play: Sorel underlined and Teva not, in the same sentence. Sorel is linked because she happened to earn
  // a CODEX TOPIC — not because she is in the registry, which this index never consulted. Measured across
  // the live saves: 51 of 110 people the players have met cannot be clicked, 27 of Silas's 34 alone.
  //
  // ⚠️ AND THE CARD WAS ALREADY BUILT FOR THEM. `showWhoIs` has handled `kind === "npc"` for the
  // portrait since SNG-367 — the door existed, the corridor to it did not. Registration is not arrival.
  //
  // ⚠️ A DESCRIPTIVE PLACEHOLDER IS NOT A NAME. The registry holds "Boy (name unknown)", "Road Traveler",
  // "Shepherd" — SNG-347's own class, arrived at from the other side. The hazard is NARROW and worth
  // stating exactly, because I nearly built a classifier for it and a classifier would have been wrong in
  // both directions: Silas knows a placeholder called "Shepherd" AND a real person called Gweth Callow
  // whose role is "Shepherd of the South March".
  //
  // ⛔ THE ONLY LINK THAT CAN LAND ON ORDINARY PROSE IS A SINGLE COMMON WORD. A multi-word label —
  // "Cookhouse Woman", "Archive Guardian" — matches only when the narration writes that exact phrase, and
  // when it does, it MEANS that person. So the guard is deliberately two narrow rules rather than a
  // judgement about what reads like a name:
  //   · a parenthetical is an explicit statement that the name is unknown ("Boy (name unknown)")
  //   · a ONE-WORD name that also appears inside its own role or description is what they DO, not who they
  //     are — "Shepherd" against "Smallholder shepherd, trade track south" — while "Sorel", "Leth" and
  //     "Fendt" appear nowhere in their own roles and are kept.
  // ⚠️ RESIDUAL RISK, NAMED: a one-word placeholder whose role does not repeat it will still be linked.
  // That is a wrong button on a word, not a wrong fact, and it is the failure I would rather have than
  // silently dropping a real person because a heuristic disliked their name.
  for (const n of npcs) {
    const nm = n?.name;
    if (!nm || isDescriptiveNotName(nm)) continue;
    // ⚠️ AND THE PARENTHETICAL RULE HAD TO NARROW TOO, because my first cut dropped "Veth (Stillwater)
    // Ondra" — a real person with an aka — alongside "Boy (name unknown)". Only a parenthetical that SAYS
    // the name is unknown is a placeholder. (An aka-form label will rarely match prose verbatim, so the
    // link mostly will not fire; that costs nothing, whereas dropping a real person costs a face.)
    if (/\((?:[^)]*\b(?:unknown|no name|unnamed)\b[^)]*)\)/i.test(nm)) continue;
    if (!/\s/.test(nm)) {
      if (nm.length < 4) continue;                   // a bare short word matches too much ordinary prose
      const self = `${n.role || ""} ${n.description || ""}`.toLowerCase();
      if (self.includes(nm.toLowerCase())) continue; // they are named for what they do — that is not a name
    }
    push(nm, n.id, "npc");
  }
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
    // ⛔ SNG-383 — A RAW SLUG IS NOT A SENTENCE. Erik's card read "Of the
    // precursor_nanite_cold_noesis." — an id printed as prose. All 66 AUTHORED figures carry a real
    // tradition id, so this only bites GENERATED ones, whose `tradition` is free text the model wrote.
    // ⚠️ LOOK IT UP FIRST, HUMANISE ONLY AS A FALLBACK. A real tradition has an authored NAME
    // ("The Umbrals") and that is what a player should read; a generated composite gets its underscores
    // opened out rather than being dropped, because it still says something true about the figure.
    if (fig.tradition) {
      const known = (content.traditions?.traditions || []).find(t => t.traditionId === fig.tradition)
        || (content.traditions?.folkTraditions || []).find(t => (t.traditionId || t.id) === fig.tradition);
      // ⚠️ THE AUTHORED NAMES ALREADY CARRY THE ARTICLE — "The Umbrals" — so the sentence supplied a
      // second one and read "Of the The Umbrals." Strip it here rather than re-authoring 26 names, because
      // the article belongs to the name in every other place it is printed.
      const raw = known?.name || String(fig.tradition).replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
      const label = raw.replace(/^the\s+/i, "");
      if (label) lines.push(`Of the ${label}.`);
    }
    if (fig.role) lines.push(String(fig.role));
    if (fig.signature) lines.push(String(fig.signature));
    else if (fig.wants) lines.push(`Wants: ${fig.wants}`);
    // What they are spending themselves on RIGHT NOW — the thing that changes, and the reason to look again.
    const cares = ws.figureCares?.[id];
    if (Array.isArray(cares) && cares.length) {
      const names = cares.map(c => (content.greaterArcs || []).find(a => a.id === c.arcId)?.name || c.arcId);
      lines.push(`Currently caught up in: ${names.join(", ")}.`);
    }
    // ⛔ SNG-383 — THE RETURN GETS ITS FIRST READER. `resolveRetrieval` has written
    // `returnedFromDeath = { day, changed }` since SNG-209 §4 and NOTHING has ever read it — not this
    // card, not the GM block, not a single line of app.js. The most dramatic thing that can happen to a
    // figure, someone going into the dark after them and bringing them back CHANGED, was recorded once and
    // never spoken again. Erik met it as one news line: "a cool thing... someone came back to life."
    //
    // ⚠️ IT LEADS THE STATUS LINES, because it is the most important currently-true fact about them
    // and `status` alone is back to "active" — indistinguishable from someone who never died.
    const epic = ws.epicStatus?.[id] || {};
    const st = epic.status;
    if (epic.returnedFromDeath) {
      const r = epic.returnedFromDeath;
      lines.push(`Died, and was brought back${r.day != null ? ` on day ${r.day}` : ""}${r.changed ? ` — ${r.changed}` : " — changed, but back"}.`);
    }
    if (st === "dead") lines.push("Dead — though the roads back are not all closed.");
    else if (st === "wounded") lines.push("Wounded, and out of it for now.");
    // A person you have MET has a codex page; a name you have only heard may not.
    const codexId = character?.codex?.topics?.[id] ? id : null;
    // SNG-364: the ID rides along so a portrait can be seeded on the FIGURE rather than on their current
    // name — these people acquire titles in play ("Valen Sunwrack, Who Left No Shadow Standing"), and a face
    // keyed to the label would change the moment the world renamed them.
    // ⛔ SNG-367b — A PORTRAIT NEEDS A BODY AND A PEOPLE, NOT A TIER LINE. `showWhoIs` was seeding the
    // image from `lines[0]`, which is the TIER meaning ("heroic — a name in their own country"): a
    // statement about renown with nothing in it about a face. So every figure was drawn from a sentence
    // describing FAME, which is why they all came back as the same person however famous they were.
    // The tradition rides along too, so the SNG-367 people layer can reach this card — it reached the
    // NPC portrait path and not this one, which is two doors again.
    return lines.length ? { label: fig.name, kind: "figure", id, lines, codexId,
      // ⛔ SNG-367c — ALL 70 AUTHORED FIGURES CARRY AN `imagePrompt`, WRITTEN FOR EXACTLY THIS, and the
      // card was ignoring every one of them. "A rootkin standing exactly on the treeline where thick green
      // meets open ground, looking neither way. Dappled light, a carved staff, a decision refused for
      // years." That is a portrait; the tier line I was using is a sentence about fame. Third instance
      // today of authored content with no reader.
      tradition: fig.tradition || null, role: fig.role || null,
      appearance: fig.imagePrompt || fig.appearance || fig.form || null,
      // ⚠️ GENDER RIDES WHEN IT IS AUTHORED. `npcPromptSeed` already states it explicitly so the
      // generator cannot default (SNG-143, the Pell-rendered-male fix) — it was simply never given one
      // here. ZERO of the 70 carry the field today, which is a content gap and reported as one; the wiring
      // is here so the moment any figure is given a gender, their portrait stops being a coin toss.
      gender: fig.gender || fig.pronouns || null,
      // ⛔ SNG-399b — THE DEATH HAS ITS OWN AUTHORED PICTURE AND NOTHING WAS READING IT. All 66 figures
      // carry a `deathImagePrompt`; `grep deathImagePrompt app.js` returned nothing. The death machinery
      // was complete — status, deathRoad, SNG-209's retrievable-death depth — and reached for a state and
      // never for an image. ⚠️ It rides as a SEPARATE field rather than replacing `appearance`, so the
      // card can show the life or the end without one overwriting the other's cached mint.
      dead: st === "dead",
      deathAppearance: fig.deathImagePrompt || null } : null;
  }

  const topic = character?.codex?.topics?.[id];
  if (topic) {
    const facts = (topic.facts || []).slice(-2).map(f => String(f).replace(/^\[[^\]]*\]\s*/, ""));
    return facts.length ? { label: topic.label || id, kind: topic.kind || "codex", lines: facts, codexId: id } : null;
  }

  // ⛔ SNG-369 — AND THE ANSWER FOR SOMEONE YOU HAVE MET. Checked AFTER the codex branch on purpose:
  // a person with a codex page has a richer, player-earned answer, and the registry is the floor beneath it.
  const met = character?.npcRegistry?.[id];
  if (met && met.name) {
    const lines = [];
    if (met.role) lines.push(String(met.role));
    if (met.description) lines.push(String(met.description));
    if (met.statusNote) lines.push(String(met.statusNote));
    if (met.lastSeenDay != null) lines.push(`Last seen on day ${met.lastSeenDay}.`);
    // ⚠️ NEVER "the world knows nothing" FOR SOMEONE STANDING IN THE ROOM. A registered person with
    // no authored detail still gets an honest line — the card exists to say you know them.
    if (!lines.length) lines.push("Someone you have met. Nothing more is recorded yet.");
    return { label: met.name, kind: "npc", id, lines, codexId: character?.codex?.topics?.[id] ? id : null,
      role: met.role || null, appearance: met.appearance || met.imagePrompt || met.form || null,
      gender: met.gender || met.pronouns || null, tradition: met.tradition || null };
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
