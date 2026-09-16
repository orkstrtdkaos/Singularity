// tests/lib/strings_of.mjs — the string literals in a JS source, never its comments.
//
// ⛔ Erik 2026-09-16: "the popup lists an SNG # in it... that shouldn't be player facing content. run a comprehensive sweep."
// A grep cannot tell a ticket number in a comment (where it belongs) from one inside a string a player reads. This walks the source
// once — line comments, block comments, quoted strings, template literals with `${}` nesting, and regex literals — and yields every
// string chunk with its line. Used by the sweep's gate (how_it_works §262) so the gate counts what the measurement counted.

export function stringsOf(src) {
  const out = [];
  let i = 0, line = 1;
  const stack = [];
  let braceDepth = 0;
  const push = (text, l) => { if (text) out.push({ text, line: l }); };
  while (i < src.length) {
    const c = src[i], n = src[i + 1];
    if (c === "\n") { line++; i++; continue; }
    if (c === "/" && n === "/") { while (i < src.length && src[i] !== "\n") i++; continue; }
    if (c === "/" && n === "*") { i += 2; while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) { if (src[i] === "\n") line++; i++; } i += 2; continue; }
    if (c === "'" || c === '"') {
      const q = c, l = line; let s = ""; i++;
      while (i < src.length && src[i] !== q) { if (src[i] === "\\") { s += src[i + 1] || ""; i += 2; continue; } if (src[i] === "\n") { line++; break; } s += src[i]; i++; }
      i++; push(s, l); continue;
    }
    if (c === "`" || (c === "}" && stack.length && braceDepth === stack[stack.length - 1])) {
      if (c === "}") stack.pop();
      const l = line; let s = ""; i++;
      while (i < src.length) {
        if (src[i] === "\\") { s += src[i + 1] || ""; i += 2; continue; }
        if (src[i] === "`") { i++; break; }
        if (src[i] === "$" && src[i + 1] === "{") { stack.push(braceDepth); i += 2; break; }
        if (src[i] === "\n") line++;
        s += src[i]; i++;
      }
      push(s, l); continue;
    }
    if (c === "{") braceDepth++;
    if (c === "}") braceDepth--;
    if (c === "/" && /[=(,:[!&|?;{}]\s*$|return\s*$/.test(src.slice(Math.max(0, i - 12), i))) {
      i++; let inClass = false;
      while (i < src.length && src[i] !== "\n") { if (src[i] === "\\") { i += 2; continue; } if (src[i] === "[") inClass = true; else if (src[i] === "]") inClass = false; else if (src[i] === "/" && !inClass) break; i++; }
      i++; continue;
    }
    i++;
  }
  return out;
}

/** A ticket reference as the people building the game write one — never something a player should read. */
export const TICKET_REF = /\b(?:SNG|CCODE|CODE)-\d+[a-z]?\b|§\s?\d+|\bR\d{2}[a-z]?\b(?=[\s:,.)—-])|\bB6[ab]\b|\bSPEC_[A-Za-z_]+|\bDESIGN_[A-Za-z_]+|\bHANDOFF_|\bpo\/[A-Za-z_]/;
