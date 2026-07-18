// verify_scene_merge.mjs — BATCH-11 146a live acceptance test (Law 7).
//
// The spec's acceptance criterion, verbatim: "two clients push a beat inside the
// same window; both beats survive. This is the acceptance test, not a code read."
//
// This script IS that test, against the real GitHub transport:
//   1. seeds a scratch scene at world/scenes/_merge_verify--<stamp>.json
//   2. fires TWO pushSceneWithMerge calls CONCURRENTLY, each adding a different beat
//   3. re-reads the remote and asserts BOTH beats survived
//   4. deletes the scratch file (best-effort cleanup; git history keeps it regardless)
//
// Run:  SINGULARITY_PAT=<pat> node scripts/verify_scene_merge.mjs
//   or: SINGULARITY_PAT=<pat> SINGULARITY_OWNER=<o> SINGULARITY_REPO=<r> node ...
//
// NOT part of npm test — it writes to the live repo and needs a PAT. It exists so
// any future change to the scene write path can be re-proven in one command.
// (Pre-146a, this test FAILS: pushOwnedFile re-read a fresh sha for stale content,
// the second PUT succeeded with no conflict, and one beat vanished.)

const OWNER = process.env.SINGULARITY_OWNER || "orkstrtdkaos";
const REPO = process.env.SINGULARITY_REPO || "Singularity";
const PAT = process.env.SINGULARITY_PAT || "";
if (!PAT) { console.error("SINGULARITY_PAT not set — aborting (no write attempted)."); process.exit(2); }

// party.js/sync.js are browser modules — give them the localStorage they expect.
globalThis.localStorage = {
  _m: new Map([["singularity.gh.owner", OWNER], ["singularity.gh.repo", REPO], ["singularity.gh.pat", PAT]]),
  getItem(k) { return this._m.get(k) ?? null; },
  setItem(k, v) { this._m.set(k, String(v)); },
  removeItem(k) { this._m.delete(k); }
};

const { newSharedScene, mergeBeat, removeMember, pushSceneWithMerge, scenePath, fetchScene, lastSceneError, OPEN_INDEX_PATH } = await import("../engine/party.js");
const { fetchRepoJSON } = await import("../engine/sync.js");

const API = "https://api.github.com";
const HEADERS = { authorization: `Bearer ${PAT}`, accept: "application/vnd.github+json", "content-type": "application/json" };

async function deleteFile(path, message) {
  const meta = await fetch(`${API}/repos/${OWNER}/${REPO}/contents/${path}`, { headers: HEADERS }).then(r => r.ok ? r.json() : null);
  if (!meta?.sha) return false;
  const res = await fetch(`${API}/repos/${OWNER}/${REPO}/contents/${path}`, {
    method: "DELETE", headers: HEADERS, body: JSON.stringify({ message, sha: meta.sha })
  });
  return res.ok;
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const sceneId = `_merge_verify--${stamp}`;
const charA = { id: "verify-a", name: "Verify A", playerKey: "verify" };
const charB = { id: "verify-b", name: "Verify B", playerKey: "verify" };
const seed = newSharedScene("_merge_verify", charA, stamp);

let failures = 0;
const check = (label, ok) => { console.log(`${ok ? "PASS" : "FAIL"}  ${label}`); if (!ok) failures++; };

try {
  // 1. seed the scene
  const seeded = await pushSceneWithMerge(sceneId, s => s, seed);
  check("scratch scene seeded", !!seeded);

  // 2. two clients, same window: both compute their beat, both push concurrently.
  const beatA = { by: "verify-a", name: "Verify A", label: "beat from client A", summary: "A acted", at: new Date(Date.now()).toISOString() };
  const beatB = { by: "verify-b", name: "Verify B", label: "beat from client B", summary: "B acted", at: new Date(Date.now() + 1).toISOString() };
  const [ra, rb] = await Promise.all([
    pushSceneWithMerge(sceneId, s => mergeBeat(s, beatA)),
    pushSceneWithMerge(sceneId, s => mergeBeat(s, beatB))
  ]);
  check("client A's push reported success", !!ra);
  check("client B's push reported success", !!rb, lastSceneError());

  // 3. the criterion: BOTH beats on the remote.
  const remote = await fetchScene(sceneId);
  const byIds = (remote?.beats || []).map(b => b.by);
  check("remote scene readable after concurrent pushes", !!remote);
  check("BOTH beats survived the same-window concurrent write (Law 7)", byIds.includes("verify-a") && byIds.includes("verify-b"));
  if (failures) console.error("remote beats:", JSON.stringify(remote?.beats ?? null, null, 2));

  // 146b/c live: an open scene is indexed; the last member leaving closes it and clears the entry.
  await new Promise(r => setTimeout(r, 1500)); // let the fire-and-forget index write land
  const idxOpen = await fetchRepoJSON(OPEN_INDEX_PATH);
  check("146c: open scene has an index entry", !!idxOpen?.scenes?.[sceneId]);
  const closed = await pushSceneWithMerge(sceneId, s => removeMember(s, "verify-a"));
  check("146b: last member leaving stamps closedAt", !!closed?.closedAt && closed.party.length === 0);
  await new Promise(r => setTimeout(r, 1500));
  const idxClosed = await fetchRepoJSON(OPEN_INDEX_PATH);
  check("146c: closed scene's index entry is removed", !idxClosed?.scenes?.[sceneId]);
} finally {
  // 4. cleanup — scratch artifact only; git history retains it either way.
  const cleaned = await deleteFile(scenePath(sceneId), `cleanup: 146a merge verification scratch scene`).catch(() => false);
  console.log(cleaned ? "cleanup: scratch scene deleted" : "cleanup: scratch scene left in place (delete failed — harmless)");
}

console.log(failures === 0 ? "\n146a ACCEPTANCE: both beats survive. GREEN." : `\n${failures} FAILURE(S) — the write path is losing beats.`);
process.exit(failures === 0 ? 0 : 1);
