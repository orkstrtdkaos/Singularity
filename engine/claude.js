// claude.js — Anthropic API transport. Same conventions as Tether's github.js:
// MODEL_MAP is the single source of truth for task -> model routing; every call
// site passes a task id; token budget + stop_reason logged per call.
// API key lives in localStorage ONLY (settings screen) — never in committed files.

const MODEL_MAP = {
  "gm-narrate": "claude-sonnet-4-6",
  "gm-meta": "claude-sonnet-4-6",
  "bio-gen": "claude-sonnet-4-6",
  "world-tick": "claude-sonnet-4-6",
  "generate": "claude-sonnet-4-6",
  "intent-parse": "claude-haiku-4-5-20251001",
  "codex-adjudicate": "claude-sonnet-4-6",   // SNG-153: identity judgement — worth Sonnet, one batched call
  "chronicle-compress": "claude-haiku-4-5-20251001",
  "chronicle": "claude-sonnet-4-6",
  _default: "claude-sonnet-4-6"
};

const BUDGETS = { "gm-narrate": 8000, "codex-adjudicate": 900, "gm-meta": 1024, "bio-gen": 1024, "world-tick": 1024, "generate": 1500, "intent-parse": 1024, "chronicle-compress": 1024, "chronicle": 768, _default: 2048 };

// Minimum cacheable prefix, per model (Anthropic silently skips caching below this,
// with no write premium). A breakpoint on a sub-min block is wasted — we fold small
// tiers forward so a breakpoint only lands where it can actually cache.
const MIN_CACHE_TOKENS = { "claude-sonnet-4-6": 2048, "claude-haiku-4-5-20251001": 4096, _default: 2048 };
const CHARS_PER_TOKEN = 4; // rough estimate for the fold heuristic

/** Assemble the `system` array from stable→volatile tier blocks. Folds any tier below
 *  the model's cache minimum into the next tier (so we never spend one of the 4
 *  breakpoints on a block too small to cache), and puts a 1h-TTL cache_control on each
 *  resulting block — the four-tier cached prefix IS the runtime prompt cache. */
function buildSystemArray(systemBlocks, model) {
  const min = MIN_CACHE_TOKENS[model] || MIN_CACHE_TOKENS._default;
  const texts = systemBlocks.map(b => b.text).filter(t => t && t.trim());
  const folded = [];
  let buf = "";
  for (let i = 0; i < texts.length; i++) {
    buf = buf ? buf + "\n\n" + texts[i] : texts[i];
    const bigEnough = Math.ceil(buf.length / CHARS_PER_TOKEN) >= min;
    if (bigEnough || i === texts.length - 1) { folded.push(buf); buf = ""; }
  }
  return folded.slice(0, 4).map(text => ({ type: "text", text, cache_control: { type: "ephemeral", ttl: "1h" } }));
}

export function getApiKey() { return localStorage.getItem("singularity.anthropicKey") || ""; }
export function setApiKey(k) { localStorage.setItem("singularity.anthropicKey", k.trim()); }

/** Call Claude. messages: [{role, content}]. opts: { task, system, maxTokens }. Returns text. */
export async function callClaude(messages, opts = {}) {
  const task = opts.task || "_default";
  const model = MODEL_MAP[task] || MODEL_MAP._default;
  const max_tokens = opts.maxTokens || BUDGETS[task] || BUDGETS._default;
  const key = getApiKey();
  if (!key) throw new Error("NO_API_KEY");

  // Prompt caching (GA — no beta header). Caching is a PREFIX match: identical bytes
  // before a cache_control breakpoint are written once, then read on every subsequent
  // call within the TTL. Two modes:
  //  • opts.systemBlocks — the runtime 4-tier prefix (GM system+rules / world / scene /
  //    rolling state), each a 1h-cached block; the volatile player turn is the (uncached)
  //    user message after the last breakpoint. See engine/gm.js gmTurn.
  //  • opts.system (string) — a single cached system prompt (meta / one-off calls).
  // NOTE: Anthropic caches by prefix hash + org — there is NO client-supplied cache key
  // (prompt_cache_key is an OpenAI parameter; sending it here would 400). opts.cacheKey
  // is accepted for call-site intent but not sent on the wire.
  const body = { model, max_tokens, messages };
  if (opts.systemBlocks?.length) body.system = buildSystemArray(opts.systemBlocks, model);
  else if (opts.system) body.system = [{ type: "text", text: opts.system, cache_control: { type: "ephemeral", ttl: "1h" } }];

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`API_${res.status}: ${errText.slice(0, 300)}`);
  }
  const data = await res.json();
  const u = data.usage || {};
  console.log(`[callClaude] task=${task} model=${model} stop=${data.stop_reason} out=${u.output_tokens} in=${u.input_tokens} cacheWrite=${u.cache_creation_input_tokens ?? 0} cacheRead=${u.cache_read_input_tokens ?? 0}`);
  return data.content?.map(b => b.text || "").join("") || "";
}

/** Call expecting a JSON object back. Strips code fences; throws on unparseable.
 *  Callers must wrap in try/catch with a graceful fallback (project law: a hiccup
 *  never blocks play). */
export function parseLooseJSON(raw) {
  const cleaned = String(raw).trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("NO_JSON_FOUND");
  return JSON.parse(cleaned.slice(start, end + 1));
}

export async function callClaudeJSON(messages, opts = {}) {
  const raw = await callClaude(messages, opts);
  return parseLooseJSON(raw);
}
