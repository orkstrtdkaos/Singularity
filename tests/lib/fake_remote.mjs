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
  const state = { gets: 0, puts: 0, conflicts: 0, dropNextPutResponse: false, failNextPutWith: null,
    // ⛔ SNG-552: a contents-API PUT that refuses EVERY time, whatever sha it is given — the shape of the real
    // failure that stopped Erik's save for fifteen hours. A cold re-read cannot cure it, which is the point:
    // it is what forces the git-data fallback, and nothing else in this fake can prove that path runs.
    alwaysFailContentsPutWith: null, gitDataPuts: 0, advanceBranchAfterNextRefRead: false,
    // ⛔ SNG-554: above this many bytes the single-file contents GET answers with no content AND NO SHA, as the real one does.
    hideShaAboveBytes: 0 };
  // ⛑ SNG-552: THE GIT DATA SIDE OF THE SERVICE, because a fallback nothing can answer is a fallback nothing proves.
  // Modelled exactly as far as it must be: content-addressed blobs, trees that inherit from a base_tree, commits with a
  // parent, and a ref that only moves FAST-FORWARD unless forced — that last is the whole safety argument of the fallback.
  const blobs = new Map(), trees = new Map(), commits = new Map();
  const git = { branch: "main", head: null };
  /** Someone else lands a commit on the branch — Aevi's push, a ship, the other device. */
  const advance = () => { const t = `tree${++n}`; trees.set(t, new Map(trees.get(commits.get(git.head)?.tree) || [])); const c = `commit${++n}`; commits.set(c, { tree: t, parents: [git.head] }); git.head = c; return c; };
  { const t = `tree${++n}`; trees.set(t, new Map()); const c = `commit${++n}`; commits.set(c, { tree: t, parents: [] }); git.head = c; }
  const shaOf = () => `sha${++n}`;
  const b64 = (s) => Buffer.from(s, "utf8").toString("base64");
  const unb64 = (s) => Buffer.from(s, "base64").toString("utf8");
  // ⛔ SNG-549: THE FAKE MUST ANSWER THE RAW MEDIA TYPE, BECAUSE THE REAL ONE DOES. The contents API stops putting inline
  // `content` in the JSON above 1,000,000 bytes, so the reader now asks for `application/vnd.github.raw` and takes the BODY —
  // and this stand-in had no `text()` at all, which turned every read in the suite into a throw. ⚠️ A fake that cannot do what the
  // real service does is a fake that certifies the wrong thing; the shape it returns is now the shape the caller asked for.
  const ok = (body, raw = null) => ({ ok: true, status: 200, json: async () => body, text: async () => (raw != null ? raw : JSON.stringify(body)) });
  // ⚠️ SNG-552: a real GitHub error carries a REASON in the body (`{message, errors}`) and this fake returned an empty
  // object, so a reader that drops the reason and one that carries it looked identical here. It carries one now.
  const err = (status, message = null) => {
    const body = message ? { message } : {};
    return { ok: false, status, json: async () => body, text: async () => JSON.stringify(body) };
  };
  const pathOf = (url) => decodeURIComponent(String(url).split(`/repos/${OWNER}/${REPO}/contents/`)[1] || "");

  const transport = async (url, opts = {}) => {
    const u = String(url);
    // ⛔ SNG-552 — THE GIT DATA ENDPOINTS. Ordered before the contents branch because `pathOf` only understands /contents/.
    if (/\/git\//.test(u) || new RegExp(`/repos/${OWNER}/${REPO}$`).test(u)) {
      const body = opts.body ? JSON.parse(opts.body) : null;
      if (new RegExp(`/repos/${OWNER}/${REPO}$`).test(u)) return ok({ default_branch: git.branch });
      if (/\/git\/blobs$/.test(u) && opts.method === "POST") {
        const sha = `blob${++n}`; blobs.set(sha, unb64(body.content)); return ok({ sha });
      }
      if (/\/git\/ref\/heads\//.test(u)) {
        const seen = git.head;
        // ⛔ SNG-552: THE RACE, WHERE IT ACTUALLY LIVES. Advancing the branch BEFORE a write proves nothing — the writer simply
        // reads the new head. The dangerous window is between the head read and the ref update, so this moves it exactly there,
        // one time: the caller gets a head that is stale by the time it PATCHes. That is what makes the retry loop real.
        if (state.advanceBranchAfterNextRefRead) { state.advanceBranchAfterNextRefRead = false; advance(); }
        return ok({ object: { sha: seen } });
      }
      if (/\/git\/commits\/[^/]+$/.test(u) && (!opts.method || opts.method === "GET")) {
        const c = commits.get(u.split("/git/commits/")[1]);
        return c ? ok({ tree: { sha: c.tree } }) : err(404);
      }
      if (/\/git\/trees$/.test(u) && opts.method === "POST") {
        const sha = `tree${++n}`;
        const next = new Map(trees.get(body.base_tree) || []);           // base_tree inheritance is why one file can be written alone
        for (const e of body.tree || []) next.set(e.path, e.sha);
        trees.set(sha, next); return ok({ sha });
      }
      if (/\/git\/commits$/.test(u) && opts.method === "POST") {
        const sha = `commit${++n}`; commits.set(sha, { tree: body.tree, parents: body.parents || [] }); return ok({ sha });
      }
      if (/\/git\/refs\/heads\//.test(u) && opts.method === "PATCH") {
        const c = commits.get(body.sha);
        // ⛔ REAL FAST-FORWARD SEMANTICS. A commit whose parent is not the current head is a non-fast-forward and the real
        // service answers 422 — which is what makes the fallback's retry loop meaningful instead of decorative.
        if (!body.force && !(c?.parents || []).includes(git.head)) { state.conflicts++; return err(422); }
        git.head = body.sha;
        for (const [p, blobSha] of trees.get(c.tree) || []) files.set(p, { content: blobs.get(blobSha), sha: shaOf() });
        state.gitDataPuts++;
        return ok({ object: { sha: body.sha } });
      }
      return err(404);
    }
    const path = pathOf(url);
    if (!opts.method || opts.method === "GET") {
      state.gets++;
      // ⛑ SNG-554: A DIRECTORY READ ANSWERS FOR ANY SIZE, and that is the only reason the sha is recoverable at all. The real
      // contents API never carries content in a listing, so the megabyte limit does not apply — each entry keeps its sha.
      const asDir = [...files.entries()].filter(([p]) => path && p.startsWith(path + "/") && !p.slice(path.length + 1).includes("/"));
      if (!files.has(path) && asDir.length) {
        return ok(asDir.map(([p, f]) => ({ name: p.slice(path.length + 1), path: p, sha: f.sha, size: f.content.length, type: "file" })));
      }
      const f = files.get(path);
      if (!f) return err(404);
      // ⛔ SNG-554 — WHAT THE REAL API DOES OVER A MEGABYTE, which this fake did not do and so could not catch. The single-file
      // contents GET stops describing a large file: no content, and NO SHA. Every caller read that as an ordinary answer, so a
      // PUT went out with no sha, GitHub refused the implied CREATE over an existing file — `Invalid request. "sha" wasn't
      // supplied.` — and Silas's save stopped going up for sixteen hours. ⚠️ A fake that always returns a sha certifies a
      // reader that cannot survive the one case the reader exists to survive.
      if (state.hideShaAboveBytes && f.content.length > state.hideShaAboveBytes) return ok({ content: "", encoding: "none", path }, f.content);
      // ⚠️ THE ACCEPT HEADER DECIDES, as it does on the real API: `…github.raw` gets the file body, everything else the envelope.
      return ok({ content: b64(f.content), sha: f.sha, path }, f.content);
    }
    if (opts.method === "PUT") {
      state.puts++;
      const body = JSON.parse(opts.body);
      if (state.failNextPutWith) { const s = state.failNextPutWith; state.failNextPutWith = null; return err(s); }
      if (state.alwaysFailContentsPutWith) return err(state.alwaysFailContentsPutWith, "content is too large to write through this endpoint");
      const cur = files.get(path);
      // ⛔ SNG-554 — NO SHA AT ALL OVER AN EXISTING FILE IS A *CREATE*, AND THE REAL API REFUSES IT WITH 422 AND SAYS SO.
      // This fake answered 409 (a stale-sha conflict), which a caller cures with a cold re-read — so the one failure that a
      // re-read can NEVER cure was being modelled as the one it always can. That is why sixteen hours of retries got nowhere.
      if (cur && !body.sha) { state.conflicts++; return err(422, 'Invalid request. "sha" wasn\'t supplied.'); }
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
    transport, state, files, git,
    /** SNG-552: someone else lands a commit on the branch. Call it directly, or set
     *  `state.advanceBranchAfterNextRefRead` to have it happen inside the write's own race window. */
    advanceBranch: advance,
    /** The commit chain from the branch head back to the root — so a test can prove a commit SURVIVED a
     *  concurrent write rather than merely that the write succeeded. A forced ref update drops it here. */
    ancestry() { const out = []; let c = git.head; while (c) { out.push(c); c = (commits.get(c)?.parents || [])[0]; } return out; },
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
