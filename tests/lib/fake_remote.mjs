// tests/lib/fake_remote.mjs — A FAKE GITHUB CONTENTS API, WITH REAL SHA SEMANTICS.
//
// ⛔ WHY THIS EXISTS. `engine/party.js` is the one system in the game with genuine concurrency, and its
// whole round-trip — create a scene, find it through the open index, JOIN it, write beats from two clients —
// had never been executed by anything. Aevi measured it and put it first: *"Two characters joining one scene
// has never happened, and it is the first thing three people at a table will do."*
//
// ⚑ AND IT NEEDED NO PRODUCTION CHANGE. Every GitHub call in `sync.js` funnels through one `ghFetch`, which
// calls the global `fetch`. Replacing the global exercises `ghGet`, `ghPut`, `fetchRepoJSON`, `ghList`,
// `pushMergedFile`, `pushSceneWithMerge`, `updateOpenIndex` and `listScenesAt` FOR REAL — no seam, no stub,
// no second implementation of the thing under test.
//
// ⚠️ THE SHA SEMANTICS ARE THE POINT. A PUT whose `sha` does not match the stored one returns 409, which is
// the only reason `pushMergedFile`'s re-read loop exists. A fake that accepted every PUT would make the
// concurrency tests pass while proving nothing.
//
// ⛔ AND IT CAN DROP A RESPONSE AFTER APPLYING THE WRITE — the case Aevi ruled on: a PUT that SUCCEEDS on the
// server while the reply dies. From the client a lost response and a failed write are indistinguishable, so
// the retry re-reads a remote that already has the change and applies it again. Only an idempotent merge
// survives that, and this is where we prove ours does.
//
// ⚠️ NO NETWORK CALL CAN ESCAPE and no real credential is ever used: `fetch` itself is replaced, and the
// config shim carries an obvious non-key.

const OWNER = "test-owner", REPO = "test-repo";

/** A fake remote. `transport` is a drop-in for `fetch` against the GitHub contents API. */
export function fakeRemote() {
  const files = new Map();            // path -> { content: string, sha: string }
  let n = 0;
  const state = { gets: 0, puts: 0, conflicts: 0, dropNextPutResponse: false, failNextPutWith: null };
  const shaOf = () => `sha${++n}`;
  const b64 = (s) => Buffer.from(s, "utf8").toString("base64");
  const unb64 = (s) => Buffer.from(s, "base64").toString("utf8");
  const ok = (body) => ({ ok: true, status: 200, json: async () => body });
  const err = (status) => ({ ok: false, status, json: async () => ({}) });
  const pathOf = (url) => decodeURIComponent(String(url).split(`/repos/${OWNER}/${REPO}/contents/`)[1] || "");

  const transport = async (url, opts = {}) => {
    const path = pathOf(url);
    if (!opts.method || opts.method === "GET") {
      state.gets++;
      const f = files.get(path);
      if (!f) return err(404);
      return ok({ content: b64(f.content), sha: f.sha, path });
    }
    if (opts.method === "PUT") {
      state.puts++;
      const body = JSON.parse(opts.body);
      if (state.failNextPutWith) { const s = state.failNextPutWith; state.failNextPutWith = null; return err(s); }
      const cur = files.get(path);
      // ⛔ REAL CAS. A stale sha against an existing file, or any sha against a file that does not exist yet.
      if (cur && body.sha !== cur.sha) { state.conflicts++; return err(409); }
      if (!cur && body.sha) { state.conflicts++; return err(422); }
      files.set(path, { content: unb64(body.content), sha: shaOf() });
      // ⚠️ APPLIED, THEN THE REPLY DIES. Deliberately after the write, because that is the dangerous order.
      if (state.dropNextPutResponse) { state.dropNextPutResponse = false; throw new Error("GH_TIMEOUT"); }
      return ok({ content: { path, sha: files.get(path).sha } });
    }
    return err(405);
  };

  return {
    transport, state, files,
    read: (p) => { const f = files.get(p); return f ? JSON.parse(f.content) : null; },
    has: (p) => files.has(p),
    /** Install this remote as the global transport. Returns a restore fn — ALWAYS call it in a finally. */
    install() {
      const store = new Map([
        ["singularity.gh.owner", OWNER], ["singularity.gh.repo", REPO],
        ["singularity.gh.pat", "not-a-real-token-and-no-request-leaves-this-process"],
      ]);
      const prev = { fetch: globalThis.fetch, localStorage: globalThis.localStorage };
      globalThis.localStorage = {
        getItem: (k) => (store.has(k) ? store.get(k) : null),
        setItem: (k, v) => store.set(k, v), removeItem: (k) => store.delete(k),
      };
      globalThis.fetch = transport;
      return () => { globalThis.fetch = prev.fetch; globalThis.localStorage = prev.localStorage; };
    },
  };
}

/** `updateOpenIndex` is fire-and-forget by design — a beat must never wait on the index — so a test that
 *  reads the index straight after a push is racing it. One macrotask is enough and this names why. */
export const settle = () => new Promise(r => setTimeout(r, 0));
