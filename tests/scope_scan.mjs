// scope_scan.mjs — ⛔ CCODE-425. EVERY NAME A FILE READS IS A NAME IN SCOPE, OR A GLOBAL THE RUNTIME REALLY HAS.
//
// ⛔ THIS EXISTS BECAUSE `node --check` ACCEPTS AN UNDECLARED NAME, AND THE PLAYER FINDS IT. CCODE-415 moved "is this novel?" into
// `noveltyOf` and deleted the line that declared `disc`; the line reading it stayed, and every rolled action threw "disc is not defined"
// between the intent parse and the GM call (CCODE-424 — Erik: "The game seems to be having trouble with the GM"). It is the fifth of its
// kind to reach play: `formerCompany` (SNG-353b), `pinFact`, `companyPlaces`, `opts`, `disc`. import_integrity.mjs closed the imported
// half of the class; a name deleted from its own function was still invisible. ⚠️ A file-wide list of names would not have caught it —
// `disc` IS declared in app.js, as the parameter of `queueDiscoveryMoment`. Only scope sees it: the name has to be declared in a scope
// that ENCLOSES the read.
//
// ⛑ A REAL PARSER, AND NOTHING DOWNLOADED. Node ships acorn for its own REPL; `--expose-internals` reaches it. The project vendors
// nothing and CI installs nothing, so this borrows the one parser already on every machine that runs the suite.
//
// Run as: node --expose-internals tests/scope_scan.mjs <file…>   → JSON { file: [{ name, line, col }] } of reads that resolve to nothing
// (the caller decides which of those are runtime globals — see BROWSER_GLOBALS in import_integrity.mjs).
import { readFileSync } from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const acorn = require("internal/deps/acorn/acorn/dist/acorn");

/** The names a binding pattern introduces. */
function patternNames(p, out = []) {
  if (!p) return out;
  switch (p.type) {
    case "Identifier": out.push(p.name); break;
    case "ObjectPattern": for (const pr of p.properties) patternNames(pr.type === "RestElement" ? pr.argument : pr.value, out); break;
    case "ArrayPattern": for (const el of p.elements) patternNames(el, out); break;
    case "AssignmentPattern": patternNames(p.left, out); break;
    case "RestElement": patternNames(p.argument, out); break;
  }
  return out;
}

class Scope {
  constructor(parent, isFunction) { this.parent = parent; this.isFunction = isFunction; this.names = new Set(); }
  has(name) { for (let s = this; s; s = s.parent) if (s.names.has(name)) return true; return false; }
  fn() { let s = this; while (s && !s.isFunction) s = s.parent; return s; }
}

/** `var` and function-scoped declarations anywhere inside a function body — not inside nested functions. */
function hoistVars(node, scope) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) { for (const n of node) hoistVars(n, scope); return; }
  if (!node.type) return;
  if (/Function/.test(node.type) || node.type === "ClassBody") return;   // their own scope (class members are functions or initialisers)
  if (node.type === "VariableDeclaration" && node.kind === "var") for (const d of node.declarations) patternNames(d.id).forEach(n => scope.names.add(n));
  for (const k in node) if (k !== "type" && k !== "loc" && node[k] && typeof node[k] === "object") hoistVars(node[k], scope);
}

/** The block-scoped declarations directly in a list of statements (let · const · class · function — modules are strict). */
function hoistBlock(stmts, scope) {
  for (let s of stmts || []) {
    if (!s) continue;
    if ((s.type === "ExportNamedDeclaration" || s.type === "ExportDefaultDeclaration") && s.declaration) s = s.declaration;
    if (s.type === "VariableDeclaration" && s.kind !== "var") for (const d of s.declarations) patternNames(d.id).forEach(n => scope.names.add(n));
    else if ((s.type === "FunctionDeclaration" || s.type === "ClassDeclaration") && s.id) scope.names.add(s.id.name);
    else if (s.type === "ImportDeclaration") for (const sp of s.specifiers) scope.names.add(sp.local.name);
  }
}

export function scanSource(src) {
  const ast = acorn.parse(src, { ecmaVersion: "latest", sourceType: "module", locations: true, allowHashBang: true });
  const free = [];
  const ref = (id, scope) => { if (!scope.has(id.name)) free.push({ name: id.name, line: id.loc.start.line, col: id.loc.start.column }); };

  // A pattern that DECLARES: its identifiers are bindings; its defaults and computed keys are reads.
  function visitBindingPattern(p, scope) {
    if (!p) return;
    switch (p.type) {
      case "Identifier": return;
      case "ObjectPattern": for (const pr of p.properties) { if (pr.type === "RestElement") visitBindingPattern(pr.argument, scope); else { if (pr.computed) visit(pr.key, scope); visitBindingPattern(pr.value, scope); } } return;
      case "ArrayPattern": for (const el of p.elements) visitBindingPattern(el, scope); return;
      case "AssignmentPattern": visitBindingPattern(p.left, scope); visit(p.right, scope); return;
      case "RestElement": visitBindingPattern(p.argument, scope); return;
      default: visit(p, scope);   // a member expression target in an assignment pattern
    }
  }
  // A pattern that ASSIGNS (`[a, b] = …`, `({ x } = o)`, `for (x of …)`): its identifiers are reads of names that must exist.
  function visitAssignPattern(p, scope) {
    if (!p) return;
    switch (p.type) {
      case "Identifier": ref(p, scope); return;
      case "ObjectPattern": for (const pr of p.properties) { if (pr.type === "RestElement") visitAssignPattern(pr.argument, scope); else { if (pr.computed) visit(pr.key, scope); visitAssignPattern(pr.value, scope); } } return;
      case "ArrayPattern": for (const el of p.elements) visitAssignPattern(el, scope); return;
      case "AssignmentPattern": visitAssignPattern(p.left, scope); visit(p.right, scope); return;
      case "RestElement": visitAssignPattern(p.argument, scope); return;
      default: visit(p, scope);
    }
  }
  function visitFunction(fn, scope) {
    const s = new Scope(scope, true);
    if (fn.type !== "ArrowFunctionExpression") s.names.add("arguments");
    if (fn.type === "FunctionExpression" && fn.id) s.names.add(fn.id.name);
    for (const p of fn.params) patternNames(p).forEach(n => s.names.add(n));
    hoistVars(fn.body, s);
    if (fn.body.type === "BlockStatement") hoistBlock(fn.body.body, s);
    for (const p of fn.params) visitBindingPattern(p, s);
    if (fn.body.type === "BlockStatement") for (const st of fn.body.body) visit(st, s);
    else visit(fn.body, s);
  }
  function visitClass(cls, scope) {
    if (cls.superClass) visit(cls.superClass, scope);
    const s = new Scope(scope, false);
    if (cls.id) s.names.add(cls.id.name);
    for (const m of cls.body.body) {
      if (m.type === "StaticBlock") { const b = new Scope(s, true); hoistVars(m.body, b); hoistBlock(m.body, b); m.body.forEach(st => visit(st, b)); continue; }
      if (m.computed) visit(m.key, s);
      if (m.value) { if (/Function/.test(m.value.type)) visitFunction(m.value, s); else { const f = new Scope(s, true); visit(m.value, f); } }
    }
  }
  function visit(node, scope) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) { for (const n of node) visit(n, scope); return; }
    switch (node.type) {
      case "Identifier": ref(node, scope); return;
      case "FunctionDeclaration": case "FunctionExpression": case "ArrowFunctionExpression": visitFunction(node, scope); return;
      case "ClassDeclaration": case "ClassExpression": visitClass(node, scope); return;
      case "BlockStatement": case "StaticBlock": { const s = new Scope(scope, false); hoistBlock(node.body, s); node.body.forEach(st => visit(st, s)); return; }
      case "ForStatement": { const s = new Scope(scope, false); if (node.init?.type === "VariableDeclaration" && node.init.kind !== "var") node.init.declarations.forEach(d => patternNames(d.id).forEach(n => s.names.add(n)));
        visit(node.init, s); visit(node.test, s); visit(node.update, s); visit(node.body, s); return; }
      case "ForInStatement": case "ForOfStatement": { const s = new Scope(scope, false);
        if (node.left.type === "VariableDeclaration") { if (node.left.kind !== "var") node.left.declarations.forEach(d => patternNames(d.id).forEach(n => s.names.add(n))); node.left.declarations.forEach(d => visitBindingPattern(d.id, s)); }
        else visitAssignPattern(node.left, s);
        visit(node.right, s); visit(node.body, s); return; }
      case "SwitchStatement": { visit(node.discriminant, scope); const s = new Scope(scope, false); for (const c of node.cases) hoistBlock(c.consequent, s);
        for (const c of node.cases) { visit(c.test, s); c.consequent.forEach(st => visit(st, s)); } return; }
      case "CatchClause": { const s = new Scope(scope, false); if (node.param) { patternNames(node.param).forEach(n => s.names.add(n)); visitBindingPattern(node.param, s); }
        hoistBlock(node.body.body, s); node.body.body.forEach(st => visit(st, s)); return; }
      case "VariableDeclaration": for (const d of node.declarations) { visitBindingPattern(d.id, scope); visit(d.init, scope); } return;
      case "AssignmentExpression": if (node.left.type === "ObjectPattern" || node.left.type === "ArrayPattern") visitAssignPattern(node.left, scope); else visit(node.left, scope); visit(node.right, scope); return;
      case "MemberExpression": visit(node.object, scope); if (node.computed) visit(node.property, scope); return;
      case "Property": if (node.computed) visit(node.key, scope); visit(node.value, scope); return;
      case "PropertyDefinition": case "MethodDefinition": if (node.computed) visit(node.key, scope); visit(node.value, scope); return;
      case "LabeledStatement": visit(node.body, scope); return;
      case "BreakStatement": case "ContinueStatement": case "MetaProperty": case "ImportDeclaration": case "ExportAllDeclaration": case "PrivateIdentifier": return;
      case "ExportNamedDeclaration": if (node.declaration) visit(node.declaration, scope); else if (!node.source) node.specifiers.forEach(sp => visit(sp.local, scope)); return;
      case "ExportDefaultDeclaration": visit(node.declaration, scope); return;
      case "UnaryExpression": if (node.operator === "typeof" && node.argument.type === "Identifier") return; visit(node.argument, scope); return;   // `typeof x` never throws
      default:
        for (const k in node) if (k !== "type" && k !== "loc" && k !== "start" && k !== "end" && node[k] && typeof node[k] === "object") visit(node[k], scope);
    }
  }
  const mod = new Scope(null, true);
  hoistVars(ast.body, mod);
  hoistBlock(ast.body, mod);
  ast.body.forEach(st => visit(st, mod));
  return free;
}

/** ⛔ CCODE-427 — WHICH MODULE-LEVEL `let`S CAN A FUNCTION WRITE, directly or through the top-level functions it calls, to `depth`
 *  calls deep. A write is an assignment, an update, or a mutating call (`.push`, `.splice`, `.set`…) on the variable or anything under it.
 *  ⚠️ Renderers are not followed (`skip`): a turn's path reaches the screen, and from the screen everything — the whole file is not the
 *  population a turn writes. → { reachable, written: { name: [functions] } }. */
export function writesFrom(src, root, depth = 3, { skip = /^(render|chrome|show|open|wire|draw|paint)/ } = {}) {
  const ast = acorn.parse(src, { ecmaVersion: "latest", sourceType: "module", locations: true, allowHashBang: true });
  const lets = new Set(), fns = new Map();
  for (const s of ast.body) {
    const d = s.type === "ExportNamedDeclaration" ? s.declaration : s;
    if (d?.type === "VariableDeclaration" && d.kind === "let") for (const x of d.declarations) if (x.id.type === "Identifier") lets.add(x.id.name);
    if (d?.type === "FunctionDeclaration" && d.id) fns.set(d.id.name, d);
  }
  const base = (t) => { while (t && t.type === "MemberExpression") t = t.object; return t?.type === "Identifier" ? t.name : null; };
  const info = new Map();
  for (const [name, fn] of fns) {
    const writes = new Set(), calls = new Set();
    const walk = (n) => {
      if (!n || typeof n !== "object") return;
      if (Array.isArray(n)) { n.forEach(walk); return; }
      if (n.type === "AssignmentExpression") {
        if (n.left.type === "ObjectPattern" || n.left.type === "ArrayPattern") patternNames(n.left).forEach(x => lets.has(x) && writes.add(x));
        else { const b = base(n.left); if (b && lets.has(b)) writes.add(b); }
      } else if (n.type === "UpdateExpression") { const b = base(n.argument); if (b && lets.has(b)) writes.add(b); }
      else if (n.type === "CallExpression") {
        if (n.callee.type === "Identifier" && fns.has(n.callee.name)) calls.add(n.callee.name);
        if (n.callee.type === "MemberExpression" && !n.callee.computed && /^(push|splice|unshift|shift|pop|add|delete|clear|set|sort|reverse|fill)$/.test(n.callee.property.name)) {
          const b = base(n.callee.object); if (b && lets.has(b)) writes.add(b);
        }
        for (const a of n.arguments) if (a.type === "Identifier" && fns.has(a.name)) calls.add(a.name);
      }
      for (const k in n) if (k !== "loc" && n[k] && typeof n[k] === "object") walk(n[k]);
    };
    walk(fn.body);
    info.set(name, { writes, calls });
  }
  const seen = new Map([[root, 0]]), queue = [root];
  while (queue.length) {
    const f = queue.shift();
    if (seen.get(f) >= depth) continue;
    for (const c of info.get(f)?.calls || []) if (!seen.has(c) && !skip.test(c)) { seen.set(c, seen.get(f) + 1); queue.push(c); }
  }
  const written = {};
  for (const f of seen.keys()) for (const w of info.get(f)?.writes || []) (written[w] = written[w] || []).push(f);
  return { reachable: seen.size, written };
}

// CLI: node --expose-internals tests/scope_scan.mjs <file…>   ·   --writes <function> <depth> <file>
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/").split("/").pop())) {
  const out = {};
  if (process.argv[2] === "--writes") {
    process.stdout.write(JSON.stringify(writesFrom(readFileSync(process.argv[5], "utf8"), process.argv[3], Number(process.argv[4]) || 3)));
    process.exit(0);
  }
  for (const f of process.argv.slice(2)) {
    try { out[f] = scanSource(readFileSync(f === "-" ? 0 : f, "utf8")); }   // "-" reads the source from stdin (the gate's fixture)
    catch (err) { out[f] = { parseError: String(err?.message || err) }; }
  }
  process.stdout.write(JSON.stringify(out));
}
