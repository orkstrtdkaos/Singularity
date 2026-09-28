// ⛔ BUG_aevi_20260928_party_dead_doors §3 — "This is the 'fourth door' your wiring audit exists for (`holdBack` was
// written and never read). ⬜ Run it over the CCODE-548 UI (holdings, party, bands, legion): every `data-*` button
// whose handler writes a field, and whether that field has a reader. Erik said 'some buttons', so these two may not
// be all of them."
//
// ⛑ HOW IT ASKS. For every `document.querySelectorAll("[data-…]")` / `app.querySelectorAll("[data-…]")` handler in
// app.js, it takes the handler's body and finds the fields it WRITES (`x.field = …`, `x.field ??= …`, `x["field"] = …`).
// Then it asks whether that field name is READ anywhere — app.js or engine/ — outside the write itself.
//
// ⚠️ IT IS A HEURISTIC AND IT SAYS SO. A field read through a computed key, or under a different spelling, will show
// as unread; a field whose only "reader" is another write will not. Every row is a question to check by hand, which is
// exactly how `holdBack` was found. Nothing is written.
import { readFileSync, readdirSync } from "node:fs";

const ROOT = new URL("../../", import.meta.url);
const read = (p) => readFileSync(new URL(p, ROOT), "utf8").replace(/\r\n/g, "\n");
const NL = String.fromCharCode(10);

const app = read("app.js");
const engineSrc = readdirSync(new URL("engine", ROOT)).filter(f => f.endsWith(".js") || f.endsWith(".mjs"))
  .map(f => ({ f, src: read(`engine/${f}`) }));

/** the handlers: every `[data-…]` selector, and the block that follows it up to the next one */
const HANDLER = /querySelectorAll\("\[(data-[a-z-]+)\]"\)/g;
const hits = [...app.matchAll(HANDLER)].map(m => ({ attr: m[1], at: m.index }));
// the body runs to the next handler, or 2500 chars — whichever is nearer. A long handler is read to its end by hand.
const bodies = hits.map((h, i) => ({ ...h, body: app.slice(h.at, Math.min(hits[i + 1]?.at ?? app.length, h.at + 2500)) }));

const WRITE = /(?:^|[^.\w])([a-zA-Z_$][\w$]*)\.([a-zA-Z_$][\w$]*)\s*(?:\?\?)?=(?!=)/g;
// fields whose meaning is the DOM's, not the game's — never save state, never a reader's business
const DOM = new Set(["value", "innerHTML", "textContent", "onclick", "onchange", "oninput", "onkeydown", "disabled",
  "checked", "className", "style", "title", "display", "id", "hidden", "selected", "scrollTop", "src", "href",
  "placeholder", "onsubmit", "onkeyup", "onblur", "onfocus", "autocomplete", "type", "length", "width", "height",
  "position", "opacity", "transform", "background", "color", "border", "padding", "margin", "textAlign",
  // ⚠️ AND THE CANVAS AND ANCHOR PROPERTIES THE FIRST RUN FLAGGED. `ctx.fillStyle`, `ctx.font` and `a.download` are
  // the browser's, not the game's — three false positives out of four rows, and the fourth was real.
  "fillStyle", "strokeStyle", "lineWidth", "font", "globalAlpha", "download", "rel", "target", "lang", "dir"]);
// locals a handler builds for itself — a write to one of these is not save state
const LOCALISH = /^(e|ev|el|b|btn|row|d|opt|pop|card|box|wrap|node|s|sp|div|span|inp|input|frag|it)$/;

const rows = [];
for (const h of bodies) {
  const seen = new Set();
  for (const w of h.body.matchAll(WRITE)) {
    const [obj, field] = [w[1], w[2]];
    if (DOM.has(field) || LOCALISH.test(obj)) continue;
    if (seen.has(field)) continue;
    seen.add(field);
    // the readers: every mention of the field that is not an assignment to it
    const pat = new RegExp(`\\.${field}\\b(?!\\s*(?:\\?\\?)?=(?!=))|\\[["']${field}["']\\]`, "g");
    const inApp = (app.match(pat) || []).length;
    const inEngine = engineSrc.reduce((n, e) => n + (e.src.match(pat) || []).length, 0);
    const engineFiles = engineSrc.filter(e => pat.test(e.src)).map(e => e.f);
    if (inApp + inEngine === 0) rows.push({ attr: h.attr, obj, field, inApp, inEngine, engineFiles });
  }
}

console.log(`\n══ ${bodies.length} \`data-*\` handlers in app.js · fields written with no reader anywhere ══\n`);
if (!rows.length) console.log(`   ⛑ none. Every field a button writes is read somewhere in app.js or engine/.`);
for (const r of rows) {
  console.log(`   ⛔ [${r.attr}]`.padEnd(34) + `writes \`${r.obj}.${r.field}\` — 0 readers in app.js, 0 in engine/`);
}
console.log(`\n   ⚠️ A HEURISTIC, AND EVERY ROW IS A QUESTION. A field read through a computed key, or spelled`);
console.log(`      differently where it is read, shows here and is fine; a field whose only "reader" is another`);
console.log(`      write does not show here and is not. This is how \`holdBack\` was found — by reading the rows.`);
console.log(`\n   ⛑ AND THE ONE IT WAS WRITTEN FOR: \`allyOrders[id].holdBack\` had exactly one hit in the whole tree`);
console.log(`      and it was the write. It is read now, in \`alliesOf\`, by the one function both the card and the`);
console.log(`      fight ask — so \`present === false\` follows the order, which is what the button always claimed.`);
const hb = (app.match(/holdBack/g) || []).length;
const hbEngine = engineSrc.reduce((n, e) => n + (e.src.match(/holdBack/g) || []).length, 0);
console.log(`      \`holdBack\` today: ${hb} in app.js, ${hbEngine} in engine/ (${hbEngine > 0 ? "READ" : "⛔ STILL NO READER"}).`);
