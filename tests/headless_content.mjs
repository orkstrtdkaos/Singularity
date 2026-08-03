// headless_content.mjs — CCODE-96: run the app's REAL content assembly from node.
//
// Every engine test in this repo hand-rolls a partial CONTENT bag, and each one discovers a different missing
// key the hard way — the dev world stalled on `content.region`, the damage tests needed `craftMechanics`,
// the world-drive audit could not tick at all. That is the same work done badly N times, and worse, each
// hand-rolled bag is a GUESS about what the app actually loads.
//
// The fix is not a second loader. `loadContent()` in engine/state.js has exactly ONE browser dependency: the
// global `fetch`, called on paths relative to the repo root. So this shims `fetch` to read from disk and then
// calls THE REAL `loadContent()` — the same manifest walk, the same whitelist, the same assembly, in the same
// order. A reimplementation would drift from the app the day it was written; a shim cannot.
//
// Use: const CONTENT = await loadContentHeadless();

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Install a disk-backed `fetch` for repo-relative paths, leaving any real fetch intact for everything else. */
export function installDiskFetch() {
  const real = globalThis.fetch;
  globalThis.fetch = async (path, ...rest) => {
    const p = String(path);
    // Anything that looks like a URL is somebody else's business — pass it through untouched, so installing
    // this never silently intercepts a network call a test meant to make.
    if (/^[a-z]+:\/\//i.test(p)) return real ? real(path, ...rest) : Promise.reject(new Error("no network fetch available"));
    try {
      const body = readFileSync(join(root, p), "utf8");
      return { ok: true, status: 200, json: async () => JSON.parse(body), text: async () => body };
    } catch (e) {
      // Mirror fetch's contract rather than throwing: loadContent branches on `res.ok`, and a thrown error
      // here would take a MISSING-file path and turn it into a crash, which is a different bug than the one
      // the caller is testing for.
      return { ok: false, status: 404, json: async () => { throw e; }, text: async () => { throw e; } };
    }
  };
  return () => { globalThis.fetch = real; };   // restore
}

/** The app's real CONTENT bag, assembled from disk. */
export async function loadContentHeadless() {
  const restore = installDiskFetch();
  try {
    const { loadContent } = await import("../engine/state.js");
    return await loadContent();
  } finally { restore(); }
}
