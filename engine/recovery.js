// recovery.js — MERGE A RECOVERY SNAPSHOT BACK INTO A SAVE, LOSING NOTHING FROM EITHER.
//
// ⛔ THE SYNC KEPT THE LOSING COPY OF EVERY CONFLICT AND OFFERED NO WAY TO IT. `preserveRecovery` writes
// `singularity.recovery.<id>.<stamp>` when both copies advanced; nothing listed it, nothing read it back. A
// player who lost a branch — an item picked up, a person met, a hook opened — had it saved and unreachable.
//
// ⚑ MERGE, NOT RESTORE. Restoring the snapshot throws away what was played since; adopting the current copy
// threw away what the snapshot had. This takes what the snapshot HAS that the current copy LACKS, adds it,
// removes nothing, and never regresses level or xp. ⚠️ Keyed on identity, never on position: an item by id
// then name, a person by id, a topic by id, a fact by its text, a deed by its `at`, a chronicle entry by its
// text. Idempotent — merging twice changes nothing. PURE.

const bare = (f) => String(f).replace(/^\[d\d+\]\s*/, "").trim();

/** Merge `snap` into `cur`. Returns a receipt of what was added; mutates `cur`. */
export function mergeRecovery(cur, snap) {
  const r = { items: [], people: [], topics: [], facts: 0, quests: [], chronicle: 0, deeds: 0, holdings: [], bands: [], level: null, xp: null };
  if (!cur || !snap || typeof snap !== "object") return r;
  if (snap.id && cur.id && snap.id !== cur.id) return r;      // never merge a different character

  // floors — a branch that got further keeps its progress, one that did not loses none
  if (Number(snap.level) > Number(cur.level || 0)) { r.level = [cur.level, snap.level]; cur.level = snap.level; }
  if (Number(snap.xp) > Number(cur.xp || 0)) { r.xp = [cur.xp, snap.xp]; cur.xp = snap.xp; }

  // inventory — by id, then by name, so a picked-up slate with no id still counts once
  cur.inventory = Array.isArray(cur.inventory) ? cur.inventory : [];
  const haveItem = (it) => cur.inventory.some(x => x && ((it.id && x.id === it.id) || (it.name && x.name === it.name)));
  for (const it of (snap.inventory || [])) if (it && !haveItem(it)) { cur.inventory.push(it); r.items.push(it.name || it.id); }

  // people — a person the snapshot met that the current copy never did
  cur.npcRegistry = cur.npcRegistry || {};
  for (const [id, n] of Object.entries(snap.npcRegistry || {})) if (n && !cur.npcRegistry[id]) { cur.npcRegistry[id] = n; r.people.push(id); }

  // codex — absent topics are added whole; present ones gain the facts they lack, deduped on text
  const ct = cur.codex?.topics || (cur.codex = { ...(cur.codex || {}), topics: {} }).topics;
  for (const [id, t] of Object.entries(snap.codex?.topics || {})) {
    if (!t) continue;
    if (!ct[id]) { ct[id] = t; r.topics.push(id); continue; }
    const have = new Set((ct[id].facts || []).map(bare));
    for (const f of (t.facts || [])) if (!have.has(bare(f))) { ct[id].facts = [...(ct[id].facts || []), f]; have.add(bare(f)); r.facts++; }
    for (const a of (t.aliases || [])) if (!(ct[id].aliases || []).includes(a)) ct[id].aliases = [...(ct[id].aliases || []), a];
  }

  // quests, holdings, bands — by id
  const byId = (key, into) => {
    cur[key] = Array.isArray(cur[key]) ? cur[key] : [];
    for (const q of (snap[key] || [])) if (q && q.id && !cur[key].some(x => x && x.id === q.id)) { cur[key].push(q); into.push(q.id); }
  };
  byId("quests", r.quests); byId("holdings", r.holdings); byId("bands", r.bands);

  // chronicle — by text; deeds — by `at`
  cur.chronicle = Array.isArray(cur.chronicle) ? cur.chronicle : [];
  const haveC = new Set(cur.chronicle.map(String));
  for (const e of (snap.chronicle || [])) if (e && !haveC.has(String(e))) { cur.chronicle.push(e); haveC.add(String(e)); r.chronicle++; }
  cur.deeds = Array.isArray(cur.deeds) ? cur.deeds : [];
  const haveD = new Set(cur.deeds.map(d => d && d.at).filter(Boolean));
  for (const d of (snap.deeds || [])) if (d && d.at && !haveD.has(d.at)) { cur.deeds.push(d); haveD.add(d.at); r.deeds++; }

  return r;
}

/** One line for the player: what came back. Null when nothing did. */
export function mergeReceiptLine(r) {
  if (!r) return null;
  const parts = [];
  if (r.items.length) parts.push(`${r.items.length} item${r.items.length === 1 ? "" : "s"} (${r.items.slice(0, 3).join(", ")}${r.items.length > 3 ? "…" : ""})`);
  if (r.people.length) parts.push(`${r.people.length} ${r.people.length === 1 ? "person" : "people"}`);
  if (r.topics.length || r.facts) parts.push(`${r.topics.length} codex topic${r.topics.length === 1 ? "" : "s"} and ${r.facts} fact${r.facts === 1 ? "" : "s"}`);
  if (r.quests.length) parts.push(`${r.quests.length} quest${r.quests.length === 1 ? "" : "s"}`);
  if (r.chronicle) parts.push(`${r.chronicle} chronicle entr${r.chronicle === 1 ? "y" : "ies"}`);
  if (r.deeds) parts.push(`${r.deeds} deed${r.deeds === 1 ? "" : "s"}`);
  if (r.holdings.length) parts.push(`${r.holdings.length} holding${r.holdings.length === 1 ? "" : "s"}`);
  if (r.level) parts.push(`level ${r.level[0]} → ${r.level[1]}`);
  return parts.length ? `Recovered: ${parts.join(" · ")}.` : null;
}
