// dev probe: import app.js with browser-parity ESM parsing. PASS = the module
// PARSES (a DOM TypeError at execution is expected and fine); FAIL = SyntaxError.
const store = new Map();
globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
globalThis.document = undefined;
try {
  await import("../app.js");
  console.log("PARSE OK (imported clean)");
} catch (e) {
  if (e instanceof SyntaxError) {
    console.log("PARSE FAIL:", e.message);
    console.log((e.stack || "").split("\n").slice(0, 4).join("\n"));
    process.exit(1);
  }
  console.log("PARSE OK (runtime DOM error as expected: " + e.message.slice(0, 60) + ")");
}
