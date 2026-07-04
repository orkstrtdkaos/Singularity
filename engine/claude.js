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

  const body = { model, max_tokens, messages };
  if (opts.system) body.system = opts.system;

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
  console.log(`[callClaude] task=${task} model=${model} stop=${data.stop_reason} out=${data.usage?.output_tokens}`);
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
