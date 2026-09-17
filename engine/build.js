// build.js — ⛔ CCODE-394: A TAB RUNNING AN OLD BUILD DOES NOT WRITE TO THE WORLD.
//
// Erik, 2026-09-17: "instead of requiring a manual reload before some of these updates take effect… is there any way to make it so that
// any browser running the game would have an auto reload on next action? would that minimize the risk of having an old version written?"
//
// ⚑ IT IS NOT A CONVENIENCE, IT IS THE HAZARD THIS PROJECT HAS ALREADY BEEN BITTEN BY, twice:
//   · the shared world — "⚠️ Every device must reload (now v2.0.31). A tab still running the old code overwrites the region file on its
//     next tick and would drop the answer until a new client pushes it back" (PLAN 2026-09-16 §1);
//   · a player's own save — SNG-549's day undoing three pushes that carried LOWER revs than the copy they landed on, written by a tab
//     that had been open since before the change.
// A player cannot be asked to know which of their devices is current. The build can ask, and refuse.
//
// ⛑ HOW: `scripts/bump_version.mjs` writes `version.json` beside the code it stamps, so the deployed build is one cheap request away.
// A running tab compares it with its own `APP_VERSION`:
//   · BEFORE ANY WRITE THROUGH `sync.js` — the only moment a stale tab can do damage — a stale build refuses the write and asks the app
//     to reload. The write then happens on the player's next action, with the new code.
//   · on a quiet cadence while the tab is open, so a tab left open all day comes back current rather than waiting for a write.
// ⚠️ A ROLLBACK IS NOT A STALE TAB. Only a STRICTLY NEWER deployed version counts, or a rolled-back deploy would put every open tab in
// a reload loop. ⚠️ AND AN UNREACHABLE `version.json` IS NOT A VERDICT: offline, on a file:// page, or on a host that does not serve it,
// this answers "not stale" and the game plays exactly as it did.

import { APP_VERSION } from "./version.js";

export const BUILD_PATH = "version.json";
/** How long a fetched answer stands before it is asked for again — a burst of writes makes one request. */
export const BUILD_CHECK_MS = 20000;

// ⚠️ NO RESET DOOR. The one this started with was reachable from nothing but a test, which `wiring_audit` refuses on the project's own
// rule — an export a test alone can call passes CI and cannot fire in play. A caller that must not be answered from memory passes
// `force`, and a test that wants the memory to say something puts it there the same way the game does: by asking.
let _last = { at: 0, deployed: null };
const _listeners = new Set();

/** The build this tab is running. Pure. */
export function runningBuild() { return APP_VERSION; }

/** ⛔ IS `a` A NEWER BUILD THAN `b` — dotted numbers, compared as numbers, so 2.0.10 is newer than 2.0.9 (a string compare says
 *  otherwise, which is how a version check quietly stops firing). Anything unparseable is NOT newer. Pure. */
export function isNewerBuild(a, b) {
  const parts = (v) => String(v ?? "").trim().split(".").map(x => (/^\d+$/.test(x) ? Number(x) : NaN));
  const A = parts(a), B = parts(b);
  if (!A.length || !B.length || A.some(Number.isNaN) || B.some(Number.isNaN)) return false;
  for (let i = 0; i < Math.max(A.length, B.length); i++) {
    const x = A[i] ?? 0, y = B[i] ?? 0;
    if (x !== y) return x > y;
  }
  return false;
}

/** The deployed build, or null when it cannot be asked. ⚠️ Cache-proof by construction — a stamped query and `no-store`, because the
 *  whole point is to read past the cache that is serving the old code. Never throws. */
export async function deployedBuild({ fetchImpl = null, now = Date.now, path = BUILD_PATH, cacheMs = BUILD_CHECK_MS, force = false } = {}) {
  const t = now();
  if (!force && _last.deployed && t - _last.at < cacheMs) return _last.deployed;
  const f = fetchImpl || (typeof globalThis !== "undefined" ? globalThis.fetch : null);
  if (typeof f !== "function") return null;
  // ⚠️ A FORCED ASK THAT FAILS FORGETS WHAT IT KNEW. A caller that insists on a fresh answer must not be left acting on an old one —
  // and it is the only way anything clears this memory, which is why there is no reset door for a test to reach.
  const forget = () => { if (force) _last = { at: 0, deployed: null }; };
  try {
    const res = await f(`${path}?t=${t}`, { cache: "no-store" });
    if (!res?.ok) { forget(); return null; }
    const body = await res.json();
    const v = body && typeof body.version === "string" ? body.version.trim() : null;
    if (!v) { forget(); return null; }
    _last = { at: t, deployed: v };
    return v;
  } catch { forget(); return null; }   // offline, file://, a host that does not serve it: the game plays on
}

/** ⛔ IS THIS TAB BEHIND THE DEPLOYED BUILD? `{ stale, running, deployed }`. Never throws. */
export async function staleBuild(opts = {}) {
  const running = runningBuild();
  const deployed = await deployedBuild(opts);
  const stale = !!deployed && isNewerBuild(deployed, running);
  if (stale) for (const cb of _listeners) { try { cb({ running, deployed }); } catch { /* a listener never blocks the refusal */ } }
  return { stale, running, deployed };
}

/** The app asks to be told, so the reload lives where the screen does. Returns an unsubscribe. */
export function onStaleBuild(cb) {
  if (typeof cb === "function") _listeners.add(cb);
  return () => _listeners.delete(cb);
}
