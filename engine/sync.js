// sync.js — GitHub transport for the SHARED world. Swappable by design: nothing
// outside this file knows the world lives on GitHub. v0.1 ships character +
// profile backup and ledger append; shared scenes arrive in v0.5 on the same
// primitives.
//
// Concurrency law (learned the hard way in Tether): a client only ever writes
// (a) files it exclusively owns — its character, its profile — and
// (b) APPEND-ONLY ledger files, retried on SHA conflict with a fresh read.
// Region state is written by the world-tick only. Nobody edits shared files in place.

const API = "https://api.github.com";
const GH_TIMEOUT_MS = 12000; // SNG-115: per-request deadline — a stalled GitHub write must never hang the caller forever

/** Race a promise against a deadline; on timeout, reject with `label` (and run onTimeout, e.g. an abort).
 *  Pure + testable: a never-resolving promise rejects within `ms`. Every ghGet/ghPut goes through this,
 *  so every sync caller (feedback, character save, ledger) inherits a bounded wait — no per-caller fix. */
export function raceTimeout(promise, ms, label = "TIMEOUT", onTimeout = null) {
  let timer;
  const deadline = new Promise((_, reject) => { timer = setTimeout(() => { try { onTimeout?.(); } catch { /* abort best-effort */ } reject(new Error(label)); }, ms); });
  return Promise.race([promise, deadline]).finally(() => clearTimeout(timer));
}

/** fetch with an AbortController deadline: on timeout the request is CANCELLED and the await rejects
 *  (GH_TIMEOUT) so the caller's catch runs — routing feedback to its "never lose it" queue. */
function ghFetch(url, opts) {
  const ctrl = new AbortController();
  const call = fetch(url, { ...opts, signal: ctrl.signal }).catch(e => { throw (e?.name === "AbortError" ? new Error("GH_TIMEOUT") : e); });
  return raceTimeout(call, GH_TIMEOUT_MS, "GH_TIMEOUT", () => ctrl.abort());
}

export function getSyncConfig() {
  return {
    owner: localStorage.getItem("singularity.gh.owner") || "orkstrtdkaos",
    repo: localStorage.getItem("singularity.gh.repo") || "Singularity",
    pat: localStorage.getItem("singularity.gh.pat") || ""
  };
}
export function setSyncConfig({ owner, repo, pat }) {
  if (owner !== undefined) localStorage.setItem("singularity.gh.owner", owner.trim());
  if (repo !== undefined) localStorage.setItem("singularity.gh.repo", repo.trim());
  if (pat !== undefined) localStorage.setItem("singularity.gh.pat", pat.trim());
}
export function syncEnabled() {
  const c = getSyncConfig();
  return !!(c.owner && c.repo && c.pat);
}

async function ghGet(path) {
  const { owner, repo, pat } = getSyncConfig();
  const res = await ghFetch(`${API}/repos/${owner}/${repo}/contents/${path}`, {
    headers: { authorization: `Bearer ${pat}`, accept: "application/vnd.github+json" }
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GH_GET_${res.status}`);
  return res.json();
}

/** ⛔ SNG-549 — THE READ THAT WENT BLIND AT ONE MEGABYTE, AND TOOK BOTH SYNC GUARANTEES WITH IT.
 *
 *  The contents API stops returning inline `content` above 1,000,000 bytes: it answers 200 with an EMPTY content field and
 *  `encoding: "none"`. Silas's save crossed that line and stands at 1,403,541 bytes. So `atob("")` gave "", `JSON.parse("")`
 *  threw, the catch returned NULL — and every caller reads null as "there is no remote".
 *
 *  ⚠️ TWO GUARANTEES DIED ON THE SAME LINE, in silence, and Erik hit both inside one minute:
 *   · THE PULL kept the stale local copy ("nothing to adopt"), so his phone loaded a four-day-old Silas at level 31.
 *   · THE PUSH GUARD waved that copy through ("nothing to clobber"), and it overwrote a save 267 revs ahead of it — level 33
 *     down to 31, 61 established facts down to 48, 51 deeds down to 37.
 *  ⛔ A GUARD THAT PASSES WHEN IT CANNOT SEE IS NOT A GUARD, and this one had been blind since the file crossed the line.
 *
 *  ⛑ THE RAW MEDIA TYPE HAS NO SUCH LIMIT (100MB), so the read asks for the body itself instead of a base64 envelope, with
 *  `download_url` as the fallback for a host that ignores the accept header. ⚠️ AND IT THROWS RATHER THAN RETURNING NULL:
 *  "I could not read it" and "it is not there" must never again be the same answer. */
async function ghGetRaw(path) {
  const { owner, repo, pat } = getSyncConfig();
  const url = `${API}/repos/${owner}/${repo}/contents/${path}`;
  const res = await ghFetch(url, { headers: { authorization: `Bearer ${pat}`, accept: "application/vnd.github.raw" } });
  if (res.status === 404) return null;                       // genuinely absent — the ONE null this is allowed to return
  if (!res.ok) throw new Error(`GH_GET_${res.status}`);
  const text = await res.text();
  if (text && text.trim()) return text;
  // the host answered in the metadata shape anyway: take the body from `download_url`, which is never truncated
  const meta = await ghGet(path);
  if (!meta) return null;
  if (meta.content && meta.content.trim()) return decodeURIComponent(escape(atob(meta.content.replace(/\n/g, ""))));
  if (!meta.download_url) throw new Error("GH_GET_NO_BODY");
  const dl = await ghFetch(meta.download_url, { headers: { authorization: `Bearer ${pat}` } });
  if (!dl.ok) throw new Error(`GH_GET_DL_${dl.status}`);
  return dl.text();
}

async function ghPut(path, contentStr, message, sha = null) {
  const { owner, repo, pat } = getSyncConfig();
  const body = { message, content: btoa(unescape(encodeURIComponent(contentStr))) };
  if (sha) body.sha = sha;
  const res = await ghFetch(`${API}/repos/${owner}/${repo}/contents/${path}`, {
    method: "PUT",
    headers: { authorization: `Bearer ${pat}`, accept: "application/vnd.github+json", "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`GH_PUT_${res.status}`);
  return res.json();
}

/** List file names in a repo directory. Returns [] if missing. */
export async function ghList(path) {
  const meta = await ghGet(path);
  return Array.isArray(meta) ? meta.map(f => f.name) : [];
}

/** Read a JSON file from the shared repo. ⛔ SNG-549: null now means ONE thing — the file is not there (404). Anything else
 *  THROWS, because the old `catch { return null }` turned "the API would not give me the body" into "there is no remote", and
 *  both of this module's protections are built on that distinction: the pull adopts a newer remote, and the push refuses to
 *  clobber one. Neither can be right about a remote it silently failed to read. */
export async function fetchRepoJSON(path) {
  const body = await ghGetRaw(path);
  if (body == null) return null;                             // 404 — genuinely absent
  try {
    return JSON.parse(body);
  } catch (err) {
    throw new Error(`GH_GET_UNPARSEABLE_${path}: ${err?.message || "bad JSON"}`);
  }
}

/** Read this month's (and optionally last month's) shared ledger events. */
export async function fetchLedger(monthsBack = 0) {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsBack);
  const month = d.toISOString().slice(0, 7);
  return (await fetchRepoJSON(`world/ledger/${month}.json`)) || [];
}

/** Write a file the caller EXCLUSIVELY OWNS (character/profile). Retries once on
 *  SHA conflict with a cold re-read — same 409/422 discipline as Tether. */
export async function pushOwnedFile(path, obj, message) {
  const existing = await ghGet(path);
  try {
    return await ghPut(path, JSON.stringify(obj, null, 2), message, existing?.sha);
  } catch (err) {
    if (/409|422/.test(err.message)) {
      const fresh = await ghGet(path);
      return ghPut(path, JSON.stringify(obj, null, 2), message, fresh?.sha);
    }
    throw err;
  }
}

/** Read-MERGE-write a SHARED file safely (region state, shared canon). Unlike pushOwnedFile
 *  (single-writer files), this re-runs mergeFn against the FRESHLY-read remote on every attempt,
 *  so two clients writing concurrently never clobber each other — the loser's write re-merges
 *  onto the winner's. mergeFn(remoteParsedOrNull) → the object to write. Returns the PUT result,
 *  or null if mergeFn yields null (nothing to write). Up to 3 attempts on SHA conflict. */
export async function pushMergedFile(path, mergeFn, message) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const existing = await ghGet(path);
    let remote = null;
    if (existing) {
      try { remote = JSON.parse(decodeURIComponent(escape(atob(existing.content.replace(/\n/g, ""))))); } catch { remote = null; }
    }
    const merged = mergeFn(remote);
    if (merged == null) return null;
    try {
      return await ghPut(path, JSON.stringify(merged, null, 2), message, existing?.sha);
    } catch (err) {
      if (!/409|422/.test(err.message) || attempt === 2) throw err;
    }
  }
}

/** Append events to this month's ledger file. Read-modify-write with retry —
 *  append-only means a retry can never destroy someone else's entry. */
export async function appendLedger(events, characterId) {
  if (!events?.length) return null;
  const month = new Date().toISOString().slice(0, 7);
  const path = `world/ledger/${month}.json`;
  for (let attempt = 0; attempt < 3; attempt++) {
    const existing = await ghGet(path);
    let arr = [];
    if (existing) {
      try { arr = JSON.parse(decodeURIComponent(escape(atob(existing.content.replace(/\n/g, ""))))); } catch { arr = []; }
    }
    arr.push(...events);
    try {
      return await ghPut(path, JSON.stringify(arr, null, 2), `ledger: ${events.length} event(s) from ${characterId}`, existing?.sha);
    } catch (err) {
      if (!/409|422/.test(err.message) || attempt === 2) throw err;
    }
  }
}

// ---------- SNG-BATCH-7 Phase 2: cross-device load-latest with a stale-overwrite guard ----------

function charPath(playerKey, id) { return `characters/${playerKey}/${id}.json`; }

/** Fetch a character's authoritative remote state (or null). */
export async function fetchRemoteCharacter(playerKey, characterId) {
  return fetchRepoJSON(charPath(playerKey, characterId));
}

/** PURE. Decide which of two versions of the same character wins, and whether it's a
 *  genuine both-advanced conflict. NEWER WINS (updatedAt primary, rev tiebreak). A
 *  conflict is only flagged when BOTH sides advanced past a known common sync point
 *  (syncedAt) — then the loser must be preserved, never silently dropped.
 *  Returns { winner, loser, conflict, reason }. loser is non-null ONLY on conflict. */
/** ⚠️ HOW FAR AHEAD IS EVIDENCE RATHER THAN NOISE. Below this, two copies are simply two devices saving at
 *  different rhythms and the clock decides; above it, one copy demonstrably has writes the other never saw. */
export const REV_LEAD = 8;

export function resolveSaveConflict(local, remote) {
  if (!remote) return { winner: local, loser: null, conflict: false, reason: "no-remote" };
  if (!local) return { winner: remote, loser: null, conflict: false, reason: "no-local" };
  const lu = local.updatedAt || 0, ru = remote.updatedAt || 0;
  const synced = local.syncedAt || 0;
  const conflict = synced > 0 && lu > synced && ru > synced && lu !== ru; // both moved since last common sync
  // ⛔ A DECISIVE REV LEAD BEATS THE CLOCK, because `rev` is the stronger evidence and was never consulted.
  // `saveCharacter` increments it on every write — "a monotonic rev so cross-device load-latest can tell
  // which copy is fresher" — and this function only ever read it to break an `updatedAt` TIE, which two real
  // writes essentially never produce. ⚠️ Measured on a real save: the good copy was rev 1834 and the stale tab
  // that overwrote it twice was rev 1790 then 1797 — the counter went BACKWARDS by 44 while the clock went
  // forwards by an hour, and the clock won both times.
  // ⚑ A COUNTER CANNOT GO BACKWARDS ON A GENUINE DESCENDANT. A clock can: skew, or a tab that resumes from
  // stale state and stamps `now` over history it never had.
  // ⛑ THE MARGIN IS WHAT KEEPS THIS HONEST. Two devices that genuinely diverge both increment, and a small
  // difference means only that one autosaved more often — that is not evidence, so it falls through to the
  // clock exactly as before.
  const lr = local.rev || 0, rr = remote.rev || 0;
  // ⛔ SNG-549 — AND THE GAME'S OWN STATE IS THE STRONGEST EVIDENCE OF ALL, stronger than either counter. Experience, level and
  // the world's day only ever go FORWARD in play. A copy behind on all three is a copy that has not seen what the other has seen,
  // whatever its clock says and whatever its save counter says. ⚠️ Measured on the overwrite this was written for: the stale phone
  // copy was level 31 / 3032xp / day 16 against level 33 / 3200xp / day 18 — behind on every one, and it still won.
  // ⛑ ALL THREE, AND STRICTLY. Any one of them alone is a bad witness (a repair may lower a level, a day may be re-stamped), and
  // requiring unanimity means a genuinely divergent pair of saves — where each has something the other lacks — falls straight
  // through to the counter and the clock, exactly as before.
  // ⚠️ `num` IS DEFINED HERE because this module has no helpers of its own — `node --check` passes an undefined identifier
  // happily and it would have thrown at the first sync, on the one path a player cannot see failing.
  const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
  const behind = (a, b) => num(a?.xp) < num(b?.xp) && num(a?.level) < num(b?.level) && num(a?.clock?.day) < num(b?.clock?.day);
  const localBehind = behind(local, remote), remoteBehind = behind(remote, local);
  const remoteWins = (localBehind && !remoteBehind) ? true
    : (remoteBehind && !localBehind) ? false
    : (rr > lr + REV_LEAD) ? true
    : (lr > rr + REV_LEAD) ? false
    : (ru > lu || (ru === lu && rr > lr));
  const winner = remoteWins ? remote : local;
  const loser = remoteWins ? local : remote;
  return {
    winner, loser: conflict ? loser : null, conflict,
    reason: remoteWins ? "remote-newer" : "local-newer",
    // ⚠️ WHY IT DECIDED, because "the other copy won" is not a thing a player or a log can act on.
    why: (localBehind && !remoteBehind) ? "local is behind on xp, level and world day"
      : (remoteBehind && !localBehind) ? "remote is behind on xp, level and world day"
      : (rr > lr + REV_LEAD || lr > rr + REV_LEAD) ? "a decisive rev lead" : "the clock",
  };
}

/** PUSH GUARD: never let a stale local overwrite a fresher remote. Re-reads remote and
 *  refuses the write if remote is newer than what we're about to push. Returns
 *  { ok, reason, remote? }. */
export async function pushCharacterGuarded(character, { fetch = fetchRepoJSON, push = pushOwnedFile, enabled = syncEnabled } = {}) { // registry:internal
  if (!enabled()) return { ok: false, reason: "sync-off" };
  const path = charPath(character.playerKey, character.id);
  // ⛔ SNG-549 — FAIL CLOSED. This read used to answer `null` for BOTH "the file is not there" and "I could not read it", and a
  // save over 1MB always took the second road: the API stops sending inline content, the parse threw, and the catch said null.
  // ⚠️ SO THE GUARD BELOW WAS SKIPPED ENTIRELY — `if (remote && …)` — and a four-day-old phone copy overwrote a save 267 revs
  // ahead of it. A guard that passes when it cannot see is not a guard. `fetchRepoJSON` throws now; this refuses on the throw,
  // because the one thing we must never do on an unreadable remote is write over it.
  let remote;
  try { remote = await fetch(path); }
  catch (err) { return { ok: false, reason: "remote-unreadable", why: err?.message || "could not read the remote copy" }; }
  // ⛔ THE SAME RESOLVER AS THE LOAD, OR THE LOAD'S RULE MEANS NOTHING. This guard judged "fresher" by the
  // clock alone, and a tab being played always has the newer clock — so a stale copy with a LOWER rev pushed
  // over a higher-rev remote three times on 2026-09-06 (1853 over 2500, then 1858, then 1794 over 1858).
  // A decisive rev lead now refuses here exactly as it adopts there; inside the margin, the clock decides as before.
  if (remote && resolveSaveConflict(character, remote).reason === "remote-newer") {
    return { ok: false, reason: "remote-newer", remote }; // guard fires: don't clobber a fresher remote
  }
  await push(path, character, `save: ${character.name}`);
  return { ok: true, reason: "pushed" };
}

/** Best-effort character + profile backup. Character push goes through the stale-overwrite
 *  guard; a refusal (a fresher remote appeared mid-session) logs and never blocks play —
 *  the next open reconciles it. Failures log, never block play. */
export async function backupSaves(character, profile) {
  if (!syncEnabled()) return { ok: false, reason: "sync-off" };
  try {
    const r = await pushCharacterGuarded(character);
    if (!r.ok && r.reason === "remote-newer") console.warn("[sync] a fresher remote exists — skipped push to avoid clobber; reopen to reconcile.");
    if (profile) await pushOwnedFile(`players/${profile.playerKey}/profile.json`, profile, `profile: ${profile.playerKey}`);
    return r;
  } catch (err) {
    console.warn("[sync] backup failed (play continues):", err.message);
    return { ok: false, reason: err.message };
  }
}
