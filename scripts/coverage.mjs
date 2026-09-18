#!/usr/bin/env node
/** ⛔ SNG-618 — WHICH FIELDS ARE FILLED IN, ACROSS A WHOLE TYPE. Erik 2026-09-17: "is there anything that checks to
 *  make sure all of a type have all of their content data filled in?" ⚠️ THERE WAS NOT. The suite validates that a
 *  record is well-formed and that specific named fields exist, but nothing reports COVERAGE — so every hole this
 *  week (five missing appearances, one missing tier, seventy missing gear) was found by hand, one field at a time.
 *      node scripts/coverage.mjs            — every type
 *      node scripts/coverage.mjs npcs       — one type, and name the records that are missing something
 *  ⛑ A REPORT, NOT A GATE. Not every field should be on every record — a Precursor has no purse, a place has no
 *  gear — so this says what is missing and leaves the judgement where it belongs. */
const only = (process.argv[2] || "").toLowerCase();
const { loadContentHeadless } = await import("../tests/headless_content.mjs");
const C = await loadContentHeadless();

const TYPES = [
  ["npcs",      C.npcs,      ["name","role","tier","appearance","physicality","voiceHints","personality","wants","fears",
                              "knowledge","reactsToReputation","questSeeds","gear","purse","assistTags","domains","homeLocation","vocation"]],
  ["locations", C.locations, ["name","tier","regionId","descriptionSeed","appearance","encounterFlavor","connections",
                              "questSeeds","worldPos","map","poleIntensity","tags","loreRefs","truth"]],
  ["abilities", C.abilities, ["name","description","notFor","plainly","tradition","attribute","subAttribute",
                              "levelReq","energyCost","functions","tree","mechanic","operativeAxis"]],
  ["items",     C.items,     ["name","kind","description","worth","bonusTags"]],
  ["quests",    C.quests,    ["name","premise","stakes","giver","region","tier","routes","stages","outcomes"]],
];
const bar = (p) => "█".repeat(Math.round(p * 20)).padEnd(20, "·");
for (const [type, bag, fields] of TYPES) {
  if (!bag) continue;
  if (only && type !== only) continue;
  const rows = (Array.isArray(bag) ? bag : Object.values(bag)).filter(r => r && typeof r === "object" && r.id);
  if (!rows.length) continue;
  console.log(`\n══ ${type} — ${rows.length} records`);
  for (const f of fields) {
    const have = rows.filter(r => {
      const v = r[f];
      return Array.isArray(v) ? v.length > 0 : (v != null && v !== "" && !(typeof v === "object" && !Object.keys(v).length));
    });
    const p = have.length / rows.length;
    const flag = p === 1 ? "✅" : p >= 0.9 ? "  " : p >= 0.5 ? "⚠️ " : "⛔";
    console.log(`  ${flag} ${f.padEnd(20)} ${String(have.length).padStart(4)}/${rows.length}  ${bar(p)} ${(100*p).toFixed(0).padStart(3)}%`);
    if (only && p < 1 && p >= 0.5) {
      const missing = rows.filter(r => !have.includes(r)).map(r => r.id);
      console.log(`       missing: ${missing.slice(0, 12).join(", ")}${missing.length > 12 ? ` … +${missing.length-12}` : ""}`);
    }
  }
}
console.log("\n⛑ A field at 100% is closed. Below that, judge it — not every field belongs on every record.");
