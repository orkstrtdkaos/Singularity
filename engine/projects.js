// engine/projects.js — SNG-522 §1 / CCODE-215: A PROJECT IS A THING YOU COME BACK TO.
//
// ⛔ THE ONLY ITEM ON EITHER LIST THAT BLOCKED SOMETHING THAT OTHERWISE EXISTS. Aevi: *"Sunk Assay Level 4
// cannot be started. And I deliberately did not stub it — a project level that resolves in a scene is not
// the feature, it is the feature's opposite. The dungeon currently ships as three levels and a sealed
// floor."*
//
// ⛔ IT COMPLETES ON A THRESHOLD, NEVER ON A DATE. A date says "come back on the ninth"; a threshold says
// "this needs eleven days of work and you have banked four." The second one can be interrupted, hurried by
// more hands, set back by sabotage, and handed to someone else — and all four of those are things Level 4
// is built on. A date can only be waited out.
//
// ⚠️ NOTHING HERE TOUCHES THE CLOCK. `worldtime.advanceClock` owns hours; this converts elapsed hours into
// banked work and says whether the work is done. Two clocks in the same unit invite arithmetic — Aevi's
// own words about tempo, and they apply here.
//
// The record, on the character: `character.projects = [ … ]`
//   { id, abilityId, name, opener, owner, banked, threshold, openedDay, lastTickDay,
//     interrupted?, done?, doneDay?, history[] }

const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);

/** ⛔ HOW MUCH WORK THIS CRAFT'S PROJECT TAKES. Authored wins; otherwise DERIVED from the craft's own
 *  `magnitude`, which is the field that already means "how much this does" — the same rule `ongoingHarmOf`
 *  follows, and for the same reason: asking content to author a second number that an existing field
 *  already states is how two fields drift apart.
 *
 *  ⚠️ `built_system` carries `duration: 8760` — a year in hours — which reads like an intended scale and is
 *  NOT what this uses. If a project's real length is meant to come from `duration` rather than `magnitude`,
 *  that is a content decision and this is where it would change. Reported rather than guessed. */
export function projectThreshold(ability, cfg = {}) {
  const authored = ability?.projectThreshold ?? ability?.mechanic?.projectThreshold;
  if (Number.isFinite(Number(authored))) return Math.max(1, num(authored, 1));
  const mag = num(ability?.mechanic?.magnitude, 0);
  const per = num(cfg.ticksPerMagnitude, 2);
  return Math.max(1, Math.round((mag || 1) * per));
}

/** Is this craft one you can open a project with? Both flags, because `downtime` alone means "not in a
 *  scene" and plenty of crafts are that without being projects. */
export function isProjectCraft(ability, ownedRank = null) {
  const t = ability?.projectTicks;
  if (t === undefined || t === false || t === null) return false;
  // ⛔ CCODE-268 — `projectTicks: "r3"` IS RANK-FIRST AUTHORING AND THIS READER DID `=== true`.
  // `working_model` authors exactly that: it becomes a project AT RANK 3, not before. The old strict test
  // returned false for it, so a craft its author had marked as a project could never open one — §45.1 again,
  // the defect this project keeps finding: authored at the rank, read at the ability.
  // ⚠️ AND WITH NO RANK SUPPLIED IT ANSWERS "CAN THIS EVER BE ONE", which is the honest answer to a question
  // that did not name a rank — a menu asking "what can I start projects with" wants the craft listed.
  if (typeof t === "string") {
    const m = /^r(\d+)$/i.exec(t.trim());
    if (!m) return false;
    if (ownedRank == null) return true;
    if (num(ownedRank, 0) < Number(m[1])) return false;
  } else if (t !== true) return false;
  // ⚠️ `downtime` IS NOT REQUIRED WHEN `projectTicks` IS EXPLICIT. The original demanded both because
  // "downtime alone means not-in-a-scene and plenty of crafts are that without being projects" — true, and
  // it argues for projectTicks being load-bearing, NOT for a second flag. `working_model` authors the
  // project marker and no `downtime`, and refusing it on that basis was the reader inventing a requirement
  // its own comment did not justify.
  return true;
}

/** Open one. Returns the project, or a refusal with a reason a player can read. */
export function openProject(character, ability, { day = 0, name = null, opener = null, ownedRank = null, cfg = {} } = {}) {
  // ⚠️ CCODE-268: the RANK is part of the question. A craft authored `projectTicks: "r3"` is a project at
  // three and a scene-length working below it, and opening it at r1 would honour a flag its author qualified.
  if (!isProjectCraft(ability, ownedRank)) {
    return { ok: false, why: isProjectCraft(ability)
      ? `${ability?.name || "this craft"} only becomes a project at a higher rank`
      : "this is not a craft you can open a project with" };
  }
  const list = character.projects || (character.projects = []);
  // ⚠️ ONE PROJECT PER CRAFT PER CHARACTER. Two open projects of the same working is not "twice the work",
  // it is a bookkeeping bug wearing ambition's clothes.
  if (list.some(p => p.abilityId === ability.id && !p.done)) {
    return { ok: false, why: `you already have ${ability.name || ability.id} underway` };
  }
  const p = {
    id: `${ability.id}@${day}`, abilityId: ability.id, name: name || ability.name || ability.id,
    opener: opener || character.name || null, owner: opener || character.name || null,
    banked: 0, threshold: projectThreshold(ability, cfg),
    openedDay: day, lastTickDay: day, history: [{ day, what: "opened" }]
  };
  list.push(p);
  return { ok: true, project: p };
}

/** ⛔ BANK THE WORK. `hands` is how many people worked it — more hands is the acceleration Aevi named, and
 *  it is DELIBERATELY SUBLINEAR: a second pair of hands helps, a tenth pair mostly gets in the way, and a
 *  party that recruits a village should not finish a year's assay in an afternoon. */
export function tickProject(project, { days = 1, hands = 1, cfg = {} } = {}) {
  if (!project || project.done) return { ok: false, why: "that work is finished" };
  if (project.interrupted) return { ok: false, why: `${project.name} is interrupted — it banks nothing until it is resumed` };
  const d = Math.max(0, num(days, 0));
  if (d <= 0) return { ok: true, gained: 0, project };
  const h = Math.max(1, num(hands, 1));
  const extra = num(cfg.perExtraHand, 0.5);
  const rate = 1 + (h - 1) * extra / Math.sqrt(h);      // sublinear in hands
  const gained = Math.max(0, Math.round(d * rate));
  project.banked = num(project.banked, 0) + gained;
  project.lastTickDay = num(project.lastTickDay, 0) + d;
  if (gained) project.history.push({ day: project.lastTickDay, what: `banked ${gained}${h > 1 ? ` (${h} hands)` : ""}` });
  if (project.banked >= project.threshold) {
    project.done = true; project.doneDay = project.lastTickDay;
    project.history.push({ day: project.doneDay, what: "finished" });
  }
  return { ok: true, gained, done: !!project.done, project };
}

/** Interrupted work KEEPS what it banked. ⛔ This is the difference between an interruption and a
 *  sabotage, and conflating them would make walking away from a project the same as having it wrecked. */
export function interruptProject(project, why = "interrupted") {
  if (!project || project.done) return { ok: false, why: "that work is finished" };
  project.interrupted = why;
  project.history.push({ day: project.lastTickDay, what: `interrupted: ${why}` });
  return { ok: true, project };
}

export function resumeProject(project) {
  if (!project || !project.interrupted) return { ok: false, why: "that work was not interrupted" };
  delete project.interrupted;
  project.history.push({ day: project.lastTickDay, what: "resumed" });
  return { ok: true, project };
}

/** ⛔ SABOTAGE TAKES BANKED WORK AWAY, AND NEVER BELOW ZERO. A project cannot go into debt — being set back
 *  past the beginning is indistinguishable from starting again, and the second one is a thing a player can
 *  understand. */
export function sabotageProject(project, amount = 1, by = null) {
  if (!project || project.done) return { ok: false, why: "that work is finished" };
  const lost = Math.min(num(project.banked, 0), Math.max(0, num(amount, 0)));
  project.banked = num(project.banked, 0) - lost;
  project.history.push({ day: project.lastTickDay, what: `set back ${lost}${by ? ` by ${by}` : ""}` });
  return { ok: true, lost, project };
}

/** ⚠️ A PROJECT OUTLIVES THE PERSON WHO OPENED IT. `opener` never changes — it is history — and `owner`
 *  does. That distinction is why a Level 4 assay can be inherited rather than restarted. */
export function inheritProject(project, newOwner) {
  if (!project) return { ok: false, why: "no such work" };
  if (!newOwner) return { ok: false, why: "someone has to take it up" };
  const from = project.owner;
  project.owner = newOwner;
  project.history.push({ day: project.lastTickDay, what: `taken up by ${newOwner}${from ? ` (was ${from})` : ""}` });
  return { ok: true, from, project };
}

/** What to show. `remaining` is in the same unit as `banked` — days of work, not a date. */
export function projectProgress(project) {
  if (!project) return null;
  const banked = num(project.banked, 0), threshold = Math.max(1, num(project.threshold, 1));
  return {
    name: project.name, owner: project.owner, banked, threshold,
    remaining: Math.max(0, threshold - banked),
    fraction: Math.min(1, banked / threshold),
    done: !!project.done, interrupted: project.interrupted || null
  };
}

/** Every open project on a character, ticked together — the shape a downtime pass wants. */
export function tickAllProjects(character, { days = 1, hands = 1, cfg = {} } = {}) {
  const out = [];
  for (const p of (character?.projects || [])) {
    if (p.done || p.interrupted) continue;
    const r = tickProject(p, { days, hands, cfg });
    if (r.ok) out.push({ id: p.id, gained: r.gained, done: !!r.done });
  }
  return out;
}
