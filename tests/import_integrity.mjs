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
  if (!app.includes(`./engine/${mod}.js`)) continue;    // app.js does not reference this module at all
  for (const sym of exported) {
    if (allImported.has(sym) || declaredLocally.has(sym)) continue;
    // Called as a bare function, not as `something.sym(` — a property access is a different symbol.
    const called = new RegExp("(^|[^.\\w$])" + escapeRe(sym) + "\\s*\\(", "m");
    if (called.test(app)) problems.push(`${mod}.js :: ${sym}`);
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
