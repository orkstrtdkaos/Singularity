// claude.js — Anthropic API transport. Same conventions as Tether's github.js:
// MODEL_MAP is the single source of truth for task -> model routing; every call
// site passes a task id; token budget + stop_reason logged per call.
// API key lives in localStorage ONLY (settings screen) — never in committed files.

const MODEL_MAP = {
  "gm-narrate": "claude-sonnet-4-6",
  "gm-meta": "claude-sonnet-4-6",
  "bio-gen": "claude-sonnet-4-6",
  "world-tick": "claude-sonnet-4-6",
  "intent-parse": "claude-haiku-4-5-20251001",
  "chronicle-compress": "claude-haiku-4-5-20251001",
  _default: "claude-sonnet-4-6"
};

const BUDGETS = { "gm-narrate": 8000, "gm-meta": 1024, "bio-gen": 1024, "world-tick": 1024, "intent-parse": 1024, "chronicle-compress": 1024, _default: 2048 };

export function getApiKey() { return localStorage.getItem("singularity.anthropicKey") || ""; }
export function setApiKey(k) { localStorage.setItem("singularity.anthropicKey", k.trim()); }

/** Call Claude. messages: [{role, content}]. opts: { task, system, maxTokens }. Returns text. */
export async function callClaude(messages, opts = {}) {
  const task = opts.task || "_default";
  const model = MODEL_MAP[task] || MODEL_MAP._default;
  const max_tokens = opts.maxTokens || BUDGETS[task] || BUDGETS._default;
  const key = getApiKey();
  if (!key) throw new Error("NO_API_KEY");

  // Prompt caching (GA — no beta header). Caching is a PREFIX match, and the only
  // reliably-stable prefix across our per-turn calls is the system prompt (GM_SYSTEM
  // et al. are constants). Cache it as a content block so it's written once and read
  // on every subsequent call within the 5-min TTL. The previous top-level cache_control
  // auto-placed the breakpoint on the LAST block — the volatile per-turn context — so
  // every request wrote a fresh entry and nothing was ever read (0% hit rate). The big
  // per-turn context stays uncached (it changes every turn); the system prompt is the win.
  // Sub-2048-token system prompts (e.g. haiku glossary/translate) silently skip caching
  // with no write premium, so marking every call is safe.
  const body = { model, max_tokens, messages };
  if (opts.system) body.system = [{ type: "text", text: opts.system, cache_control: { type: "ephemeral" } }];

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
