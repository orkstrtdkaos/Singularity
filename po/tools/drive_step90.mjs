// ⛑ DRIVE STEP 90 THROUGH THE RUNNER, NOT BY CALLING THE STEP. Proving a reconcile step against anything but the runner
// is a failure I have now made three distinct ways — a step numbered below the runner's ceiling, a step proved by
// `apply` on a copy, and this one: a step whose method I named `run` while the runner calls `apply`, so `step.apply` was
// undefined, the call threw into a silent catch, and `reconcileVersion` was held BELOW it forever. ⚠️ My first driver
// hid it too, calling `reconcile(clone, {})` — `{}` landed where `kind` goes, the registry resolved to an EMPTY list,
// zero steps ran, and I read "no notes" as "the step found nothing".
// Nothing here writes to characters/.
import { readFileSync, readdirSync } from "node:fs";
const R = await import("../../engine/reconcile.js");

const step = (R.CHARACTER_STEPS || []).find(s => s.id === "the-name-the-scene-taught-itself");
const versions = (R.CHARACTER_STEPS || []).map(s => s.version);
console.log(`step: version ${step?.version}, id ${step?.id}, playerFacing ${step?.playerFacing}`);
console.log(`the method the runner calls: apply → ${typeof step?.apply}${typeof step?.apply === "function" ? "" : "  ⛔ THE RUNNER CANNOT CALL IT"}`);
console.log(`registry tops out at ${Math.max(...versions)}; duplicate versions: ${versions.length !== new Set(versions).size ? "⛔ YES" : "none"}`);

let ran = 0, quiet = 0;
for (const d of readdirSync("characters")) {
  let fs2; try { fs2 = readdirSync(`characters/${d}`); } catch { continue; }
  for (const f of fs2) {
    if (!f.endsWith(".json")) continue;
    let ch; try { ch = JSON.parse(readFileSync(`characters/${d}/${f}`, "utf8")); } catch { continue; }
    const clone = JSON.parse(JSON.stringify(ch));
    const before = JSON.stringify(clone);
    const wasAt = clone.reconcileVersion;
    // ⛑ the real door, with its real signature
    const res = R.reconcile(clone, "character", {});
    if (res.warnings.length) console.log(`   ⛔ ${ch.name} warnings: ${res.warnings.join(" | ")}`);
    const mine = res.notes.filter(n => /taught itself a misspelling/.test(n));
    if (!mine.length) { quiet++; continue; }
    ran++;
    console.log(`\n── ${ch.name} (${d}/${f})`);
    console.log(`   reconcileVersion ${wasAt} → ${clone.reconcileVersion}${clone.reconcileVersion > (wasAt || 0) ? "" : "  ⛔ DID NOT MOVE"}`);
    for (const n of mine) console.log(`   ${n}`);
    // ⛔ exactly what moved, and nothing else
    const a = JSON.parse(before), b = clone;
    const diff = [];
    const walk = (x, y, path) => {
      if (typeof x === "string" || typeof y === "string") { if (x !== y) diff.push(path); return; }
      if (!x || !y || typeof x !== "object") return;
      for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) walk(x[k], y[k], `${path}.${k}`);
    };
    walk(a, b, "save");
    console.log(`   strings changed: ${diff.filter(p => !/reconcileVersion/.test(p)).length}`);
    for (const p of diff) console.log(`     · ${p}`);
    const again = R.reconcile(clone, "character", {});
    console.log(`   run again: ${again.notes.filter(n => /taught itself/.test(n)).length ? "⛔ CHANGED AGAIN — not idempotent" : "nothing left to do"}`);
  }
}
console.log(`\n${ran} save(s) changed by this step, ${quiet} left alone.`);
