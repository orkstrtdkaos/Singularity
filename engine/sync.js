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

export function getSyncConfig() {
  return {
    owner: localStorage.getItem("singularity.gh.owner") || "",
    repo: localStorage.getItem("singularity.gh.repo") || "",
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
  const res = await fetch(`${API}/repos/${owner}/${repo}/contents/${path}`, {
    headers: { authorization: `Bearer ${pat}`, accept: "application/vnd.github+json" }
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GH_GET_${res.status}`);
  return res.json();
}

async function ghPut(path, contentStr, message, sha = null) {
  const { owner, repo, pat } = getSyncConfig();
  const body = { message, content: btoa(unescape(encodeURIComponent(contentStr))) };
  if (sha) body.sha = sha;
  const res = await fetch(`${API}/repos/${owner}/${repo}/contents/${path}`, {
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

/** Read a JSON file from the shared repo. Returns parsed object or null. */
export async function fetchRepoJSON(path) {
  const meta = await ghGet(path);
  if (!meta) return null;
  try {
    return JSON.parse(decodeURIComponent(escape(atob(meta.content.replace(/\n/g, "")))));
  } catch { return null; }
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
export function resolveSaveConflict(local, remote) {
  if (!remote) return { winner: local, loser: null, conflict: false, reason: "no-remote" };
  if (!local) return { winner: remote, loser: null, conflict: false, reason: "no-local" };
  const lu = local.updatedAt || 0, ru = remote.updatedAt || 0;
  const synced = local.syncedAt || 0;
  const conflict = synced > 0 && lu > synced && ru > synced && lu !== ru; // both moved since last common sync
  const remoteWins = ru > lu || (ru === lu && (remote.rev || 0) > (local.rev || 0));
  const winner = remoteWins ? remote : local;
  const loser = remoteWins ? local : remote;
  return { winner, loser: conflict ? loser : null, conflict, reason: remoteWins ? "remote-newer" : "local-newer" };
}

/** PUSH GUARD: never let a stale local overwrite a fresher remote. Re-reads remote and
 *  refuses the write if remote is newer than what we're about to push. Returns
 *  { ok, reason, remote? }. */
export async function pushCharacterGuarded(character) {
  if (!syncEnabled()) return { ok: false, reason: "sync-off" };
  const path = charPath(character.playerKey, character.id);
  const remote = await fetchRepoJSON(path);
  if (remote && (remote.updatedAt || 0) > (character.updatedAt || 0)) {
    return { ok: false, reason: "remote-newer", remote }; // guard fires: don't clobber a fresher remote
  }
  await pushOwnedFile(path, character, `save: ${character.name}`);
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
