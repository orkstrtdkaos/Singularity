// import_integrity.mjs — SNG-353b. EVERY ENGINE SYMBOL app.js CALLS MUST BE IMPORTED.
//
// ⛔ THIS EXISTS BECAUSE I SHIPPED A REFERENCEERROR TO ERIK'S LIVE GAME. My SNG-355 §1d change used
// `formerCompany` in the company roster, and the edit that was supposed to add it to the import line
// silently matched nothing — the real line begins `import { ensureCompany, companyRoster, recruit, …`
// and I pattern-matched on `import { recruit, partCompany,`. The replace was a NO-OP, no error, and the
// suite stayed green because THE TEST HARNESSES IMPORT FROM engine/ DIRECTLY AND NEVER LOAD app.js.
//
// ⚠️ THE WHOLE SUITE IS BLIND TO THIS CLASS. 428 gates, three harnesses, every one exiting 0, and none of
// them evaluates app.js as a module — so any undefined reference in the largest file in the project
// reaches the player before it reaches a test. "Your characters aren't loading" is what that looks like
// from Erik's side.
//
// Cheap, exact, and it runs in milliseconds: for each `import { … } from "./engine/x.js"`, every symbol
// that module EXPORTS and app.js CALLS must appear in the import list.

import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const app = readFileSync(join(root, "app.js"), "utf8");

// ⛔ THE CALL TEST MUST READ CODE, NOT COMMENTARY. This file had no comment stripping at all, so a symbol
// merely NAMED in a comment — "`formOf()` never returns falsy" — was reported as an unimported call.
// The tool built to catch silent breakage was itself flagging the note that EXPLAINS a breakage, which is
// the copy-inventory mistake a second time. Line comments, trailing comments, and block comments all go.
const LF = String.fromCharCode(10);   // no escape in this file survives the tooling intact
const code = app.split(LF)
  .filter(l => { const t = l.trim(); return !(t.startsWith("//") || t.startsWith("*") || t.startsWith("/*")); })
  .map(l => { const i = l.search(/(^|[^:"'`])\/\//); return i === -1 ? l : l.slice(0, i); })
  .join(LF)
  .replace(/\/\*[\s\S]*?\*\//g, " ");

let failures = 0;
const check = (name, ok, detail = "") => {
  console.log(`${ok ? "ok  " : "FAIL"}  ${name}${ok || !detail ? "" : " — " + detail}`);
  if (!ok) failures++;
};

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ⚠️ THE QUESTION IS GLOBAL, NOT PER-MODULE, and my first version got this wrong in the direction that
// wastes someone's afternoon. It asked "is this symbol in THIS module's import line", which flags `tierOf`
// (imported from skilltree.js, also exported by worldtick.js) and any symbol brought in on a separate
// statement. Two false positives out of three findings — a checker that cries wolf gets muted, and then it
// is worth less than nothing. So: collect every name app.js imports from ANYWHERE, and every name it
// declares locally, then flag only what is called and comes from nowhere.
const allImported = new Set();
for (const m of app.matchAll(/import\s*\{([^}]*)\}\s*from\s*["'][^"']+["']/g)) {
  for (const part of m[1].split(",")) {
    const name = part.trim().split(/\s+as\s+/).pop().trim();
    if (name) allImported.add(name);
  }
}
for (const m of app.matchAll(/import\s+([A-Za-z_$][\w$]*)\s+from/g)) allImported.add(m[1]);   // default imports
const declaredLocally = new Set([
  ...[...app.matchAll(/(?:^|\s)(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g)].map(m => m[1]),
  ...[...app.matchAll(/(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/g)].map(m => m[1]),
]);

const problems = [];
for (const f of readdirSync(join(root, "engine")).filter(x => x.endsWith(".js"))) {
  const mod = f.replace(/\.js$/, "");
  const src = readFileSync(join(root, "engine", f), "utf8");
  const exported = [...src.matchAll(/export\s+(?:async\s+)?(?:function|const|class)\s+([A-Za-z_$][\w$]*)/g)].map(m => m[1]);
  // ⛔ SNG-390 — THIS SKIP WAS THE GUARD'S OWN BLIND SPOT, and it hid exactly the bug this file
  // exists to catch. It read "app.js does not reference this module at all, so nothing to check" — but
  // the FIRST symbol used from a NEW module is precisely the case with no import line yet, which is a
  // ReferenceError at runtime and invisible here. `companyPlaces` shipped exactly that way: called in
  // app.js, imported nowhere, and this checker reported all clear.
  // ⚠️ So an unreferenced module is still SCANNED. The cost is a wider net over symbol names that
  // might collide with a local; that is what `declaredLocally` and the global import set already handle.

  for (const sym of exported) {
    if (allImported.has(sym) || declaredLocally.has(sym)) continue;
    // Called as a bare function, not as `something.sym(` — a property access is a different symbol.
    const called = new RegExp("(^|[^.\\w$])" + escapeRe(sym) + "\\s*\\(", "m");
    // ⛔ SNG-390 — THE SECOND BLIND SPOT IN THIS GUARD, FOUND THE SAME WAY AS THE FIRST: by shipping
    // straight through it. It only ever looked for `sym(` — a CALL — so a symbol passed as a VALUE was
    // invisible. `bandFactor` went in as `{ bandFn: bandFactor }`, unimported, and this file reported all
    // clear; it would have been a ReferenceError the moment anyone opened the "whose ground" layer.
    // ⚠️ A REFERENCE IS AS BINDING AS A CALL, so both forms are checked: `sym(`, and a bare `sym` that is
    // not a property access and is followed by a comma, bracket or line end.
    const passed = new RegExp("(^|[^.\\w$])" + escapeRe(sym) + "\\s*(?=[,)\\]}]|$)", "m");
    // ⛔ TEST THE STRIPPED SOURCE, NOT THE RAW FILE. This built `code` with comments removed and then
    // tested `app` — so a symbol merely NAMED in a comment ("`formOf()` never returns falsy") was reported
    // as an unimported call. A checker that flags the note explaining a defect is the copy-inventory
    // mistake again, inside the tool built to catch this very class.
    if (called.test(code) || passed.test(code)) problems.push(`${mod}.js :: ${sym}`);
  }
}

for (const p of problems) console.log(`      called in app.js but NOT imported: ${p}`);
check(`353b: every engine symbol app.js CALLS is imported (${problems.length ? problems.length + " missing" : "none missing"})`,
  problems.length === 0, problems.join(" · "));

// ⚠️ AND THE BROADER GUARD: app.js must at least PARSE. A syntax error there is invisible to a suite that
// only ever imports from engine/, and it is total — nothing renders at all.
let parses = true, why = "";
try {
  // Strip module syntax so it can be parsed as a plain function body; this catches structural breakage
  // (unbalanced braces, a mangled template literal) without executing any browser-dependent code.
  new Function(app.replace(/^import .*$/gm, "").replace(/^export /gm, ""));
} catch (e) { parses = false; why = e.message; }
check("353b: app.js parses — a syntax error there renders NOTHING and no engine test would see it", parses, why);

console.log(failures ? `\nIMPORT INTEGRITY: ${failures} failure(s)` : "\nImport integrity: all checks passed.");
process.exit(failures ? 1 : 0);
