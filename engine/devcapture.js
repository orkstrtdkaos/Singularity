// devcapture.js — SNG-186 §2f, "see the machine." A dev-only ring buffer of model exchanges:
// the assembled prompt (system tiers + user turn), the raw model response, the parsed result, and
// which ops fired. This is the by-hand SNG-179 diagnosis — read the prompt, read the raw output, see
// what parsed and what the engine did with it — made a standing instrument instead of a devtools dig.
//
// ⛔ INERT UNLESS ARMED. `armed` starts false and only `armDevCapture(true)` (called under isDevMode()
// at boot) flips it. Every entry point early-returns when disarmed, so in normal play this module
// holds nothing and costs nothing — the callClaude observer it feeds is literally null (SNG-186 §3.4:
// no dev path the normal turn can reach). It is pure: no DOM, no fetch, no storage.
//
// The capture holds the FULL assembled prompt on purpose — that is the whole point of §2f. No secret
// leaks: the API key rides an HTTP header, never the prompt body, so it is never in `system`/`messages`.

const RING = [];
const MAX = 24;          // last two-dozen model calls — a full scene's worth of turns and sub-calls
let armed = false;
let seq = 0;             // monotonic; ids stay stable after the ring shifts old entries out

export function armDevCapture(on) { armed = !!on; }

/** Record one model call as it returns from the transport. Returns a stable id (or null when
 *  disarmed) so a caller can later annotate this exact exchange with its parsed result + ops. */
export function recordCall(entry) {
  if (!armed) return null;
  const id = String(++seq);
  RING.push({
    id,
    at: entry?.at || null,
    task: entry?.task || "?",
    model: entry?.model || "?",
    system: entry?.system || [],       // the assembled 4-tier prefix (array of {type,text})
    messages: entry?.messages || [],   // the user turn(s) after the last cache breakpoint
    raw: typeof entry?.raw === "string" ? entry.raw : "",
    stop_reason: entry?.stop_reason || null,
    usage: entry?.usage || null,
    ms: Number.isFinite(entry?.ms) ? entry.ms : null,
    parsed: undefined,                 // filled by annotateLatest once the caller has parsed it
    opsFired: undefined,               // the op keys present in the parsed turn this call produced
    opLedger: undefined               // cumulative applied/rejected per op-class at annotate time
  });
  while (RING.length > MAX) RING.shift();
  return id;
}

/** Attach the parsed result + ops to the most recent capture of a given task (default the last
 *  call of any task). GM turns fan out into several calls — intent-parse, narrate, a retry, the prose
 *  pass — so the parsed turn belongs to the newest `gm-narrate`, not merely the newest call. */
export function annotateLatest(task, patch) {
  if (!armed || !patch) return;
  for (let i = RING.length - 1; i >= 0; i--) {
    if (!task || RING[i].task === task) { Object.assign(RING[i], patch); return; }
  }
}

/** Newest-first snapshot for the dev screen. A shallow copy so a render can't mutate the ring. */
export function devCaptures() { return RING.slice().reverse(); }
export function clearCaptures() { RING.length = 0; }
