// quests.js — quests are typed state the GM drives through clamped ops, same law
// as every other delta: the model proposes {op, questId, ...}, the engine applies
// within bounds. Quests are what keep the game MOVING — the GM is instructed to
// weave a location's questSeeds into play whenever the scene idles.

export function applyQuestUpdates(character, updates = []) {
  character.quests = character.quests || [];
  const notes = [];
  for (const u of updates.slice(0, 4)) {
    const op = u.op;
    if (op === "start") {
      const id = u.questId || slugify(u.title || "quest");
      if (character.quests.some(q => q.id === id)) continue;
      if (character.quests.filter(q => q.status === "active").length >= 5) continue; // focus, not a checklist
      character.quests.push({
        id,
        title: String(u.title || "A new undertaking").slice(0, 80),
        summary: String(u.summary || u.note || "").slice(0, 240),
        giver: u.giver ? String(u.giver).slice(0, 60) : null,
        locationId: u.locationId || null,
        status: "active",
        progress: u.note ? [String(u.note).slice(0, 200)] : [],
        startedAt: new Date().toISOString()
      });
      notes.push(`New quest: ${u.title}`);
    } else {
      const q = character.quests.find(q => q.id === u.questId || q.title === u.title);
      if (!q || q.status !== "active") continue;
      if (op === "progress") {
        if (u.note) q.progress = [...(q.progress || []), String(u.note).slice(0, 200)].slice(-8);
        notes.push(`Quest updated: ${q.title}`);
      } else if (op === "complete" || op === "fail") {
        q.status = op === "complete" ? "completed" : "failed";
        q.resolvedAt = new Date().toISOString();
        if (u.note) q.progress = [...(q.progress || []), String(u.note).slice(0, 200)].slice(-8);
        if (op === "complete") {
          const xp = Math.max(0, Math.min(50, u.xpReward | 0 || 25));
          character.xp = (character.xp || 0) + xp;
          notes.push(`Quest complete: ${q.title} (+${xp} xp)`);
        } else {
          notes.push(`Quest failed: ${q.title}`);
        }
      }
    }
  }
  return notes;
}

/** Active-quest block for the GM prompt. */
export function questsForGM(character) {
  const active = (character.quests || []).filter(q => q.status === "active");
  if (!active.length) return null;
  return active.map(q =>
    `- [${q.id}] ${q.title}: ${q.summary}${q.giver ? ` (from ${q.giver})` : ""}${q.progress?.length ? ` | latest: ${q.progress[q.progress.length - 1]}` : ""}`
  ).join("\n");
}

export function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40) || "quest";
}
