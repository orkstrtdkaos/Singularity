import { loadContentHeadless } from "../tests/headless_content.mjs";
const C = await loadContentHeadless();
const ab = Object.values(C.abilities || {});
console.log("abilities:", ab.length);

// --- who among authored creatures is undead to the arithmetic? ---
const roster = C.bestiary?.roster || [];
const undeadish = roster.filter(r => r.affinity?.vitality === "vulnerable" || r.class === "narrowed_dead" || /undead|raised|afterling|narrow/i.test(String(r.class||"")+String(r.name||"")));
console.log("\nroster:", roster.length, "| undead-ish:", undeadish.length);
for (const r of undeadish) console.log("  ", r.id, "| class", r.class, "| aff", JSON.stringify(r.affinity||null));

// --- which crafts RAISE? a summon whose subject is a dead body ---
const raisers = ab.filter(a => a.summon && /raise|raised|corpse|finished body|body that|undead|dead/i.test(JSON.stringify(a).slice(0,6000)));
console.log("\nsummon crafts:", ab.filter(a=>a.summon).length, "| of those, raisings:", raisers.length);
for (const a of raisers) console.log("  ", a.id, "|", a.name, "| summon.role:", a.summon?.role || "-", "| affinity authored on summon?", !!(a.summon?.affinity));

// --- wornBenefits: authored where, and what does it claim? ---
const worn = ab.filter(a => JSON.stringify(a).includes("wornBenefits"));
console.log("\nwornBenefits authored on:", worn.length);
for (const a of worn) {
  for (const r of a.ranks || []) if (r.wornBenefits) console.log("  ", a.id, "r"+r.rank, JSON.stringify(r.wornBenefits));
  if (a.wornBenefits) console.log("  ", a.id, "(top)", JSON.stringify(a.wornBenefits));
}
