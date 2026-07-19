// repair_self_variants.mjs — CCODE-04 data repair.
//
// Restores shared-canon records that were demoted to "variant" by contesting against THEIR OWN
// previously-promoted copy (a non-idempotent retry inside pushMergedFile's merge callback). The
// signature is unmistakable: `_canon.rivalId === _canon.entityId` — an entity recorded as a rumour
// of itself. Those are not contest losses; they are corruption, and the entity should be canonical.
//
// It repairs ONLY that signature. A variant with a genuine rival (a different entity id) is a real
// contest outcome and is left exactly as it is.
//
// Usage:
//   node scripts/repair_self_variants.mjs                 # dry run against world/canon/valley.json
//   node scripts/repair_self_variants.mjs --write         # rewrite the local file
//   node scripts/repair_self_variants.mjs --write --region valley
//
// The engine-side fix (canon.js isSameEntity) prevents new occurrences; this heals what already
// landed. Re-runnable: a repaired store yields "nothing to repair".

import { readFileSync, writeFileSync, existsSync } from "node:fs";

const args = process.argv.slice(2);
const write = args.includes("--write");
const region = (args[args.indexOf("--region") + 1] && !args[args.indexOf("--region") + 1].startsWith("--")) ? args[args.indexOf("--region") + 1] : "valley";
const path = `world/canon/${region}.json`;

if (!existsSync(path)) { console.error(`no canon store at ${path}`); process.exit(2); }
const store = JSON.parse(readFileSync(path, "utf8"));
store.entities = store.entities || {};
store.variants = Array.isArray(store.variants) ? store.variants : [];

const selfVariants = store.variants.filter(v => {
  const c = v?._canon || {};
  return c.tier === "variant" && c.rivalId && c.entityId && c.rivalId === c.entityId;
});

if (!selfVariants.length) { console.log("nothing to repair — no self-rival variants found."); process.exit(0); }

console.log(`found ${selfVariants.length} self-rival variant(s) — each recorded as a rumour of itself:\n`);
const restored = [];
for (const v of selfVariants) {
  const c = v._canon;
  const occupied = store.entities[v.id];
  // If a canonical record for this id already exists AND it is the same author's, the variant is a
  // duplicate of it — drop the variant rather than overwrite the canonical copy.
  const sameAuthor = occupied && (occupied._canon?.contributedBy?.characterId ?? null) === (c.contributedBy?.characterId ?? null);
  console.log(`  ${String(v.name || v.id).padEnd(28)} entityId=${c.entityId} rivalId=${c.rivalId} weight=${c.weight}` +
    (occupied ? (sameAuthor ? "  → canonical copy already present; dropping the duplicate variant" : "  → SKIPPED: a different author holds this id canonically") : "  → restoring to canonical"));
  if (occupied && !sameAuthor) continue;
  if (!occupied) {
    const rec = { ...v, _canon: { ...c, tier: "canonical" } };
    delete rec._canon.rivalId;
    store.entities[v.id] = rec;
  }
  restored.push(v);
}

store.variants = store.variants.filter(v => !restored.includes(v));

console.log(`\n${write ? "WRITING" : "DRY RUN"}: ${restored.length} record(s) restored to canonical; ${store.variants.length} genuine variant(s) untouched.`);
if (write) {
  writeFileSync(path, JSON.stringify(store, null, 2) + "\n");
  console.log(`wrote ${path} — commit it to publish the repair to the family.`);
} else {
  console.log("re-run with --write to apply.");
}
