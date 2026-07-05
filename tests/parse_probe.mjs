// dev probe: import app.js (browser-parity ESM parse) and report the real error line
const store = new Map();
globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
globalThis.document = undefined;
try {
  await import("../app.js");
  console.log("imported OK");
} catch (e) {
  console.log("ERR:", e.message);
  console.log((e.stack || "").split("\n").slice(0, 4).join("\n"));
}
