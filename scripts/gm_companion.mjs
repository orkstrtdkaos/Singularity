// gm_companion.mjs — SNG: THE GM'S BOOK. Everything the Library filters OUT.
import fs from "fs"; import path from "path";
const ROOT = process.cwd();
const SECRET_KEYS = /^(gmHint|gmGuidance|gmMandate|hooks?|hiddenTruth|hidden_thing|_playHooks|authoringGuidance|whatHealingMustDo|gm_guidance_doc|segments|fragments)$/;
const walkJson = (dir) => { const out=[]; for (const e of fs.readdirSync(dir,{withFileTypes:true})) {
  const p=path.join(dir,e.name); if (e.isDirectory()) out.push(...walkJson(p)); else if (e.name.endsWith(".json")) out.push(p); } return out; };
const found = {};   // section -> [{where, who, key, value}]
const nameOf = (o, fallback) => o?.name || o?.title || o?.id || fallback;
function scan(node, file, who) {
  if (Array.isArray(node)) { for (const x of node) scan(x, file, who); return; }
  if (!node || typeof node !== "object") return;
  const me = nameOf(node, who);
  for (const [k, v] of Object.entries(node)) {
    if (SECRET_KEYS.test(k) && v != null && (typeof v === "string" ? v.trim() : true)) {
      const sec = file.includes("/npcs/") ? "People" : file.includes("/lore/") ? "Lore"
        : file.includes("/encounters/") ? "Encounters" : file.includes("/quests") ? "Quests"
        : file.includes("/locations/") ? "Places" : "Rules & Systems";
      (found[sec] ||= []).push({ file: path.basename(file), who: me, key: k, value: v });
    }
    scan(v, file, me);
  }
}
for (const f of walkJson(path.join(ROOT, "content/packs"))) {
  let d; try { d = JSON.parse(fs.readFileSync(f, "utf8")); } catch { continue; }
  scan(d, f.replace(ROOT + "/", ""), path.basename(f, ".json"));
}
const render = (v) => typeof v === "string" ? v : Array.isArray(v) ? v.map(x => typeof x === "string" ? `- ${x}` : `- ${JSON.stringify(x)}`).join("\n") : JSON.stringify(v, null, 1);
let md = `# THE GM'S BOOK — everything the Library does not show

**GENERATED from the live corpus. ⛔ This file is DERIVED — do not hand-edit, regenerate it.**

⚠️ **THE LIBRARY IS THE PLAYER'S BOOK AND IT FILTERS \`gm\`, \`secret\`, \`hidden\` and \`hook\` FIELDS FROM EVERY
RENDER.** ⛑ **That filter was correct and it meant the authored GM material had NO READER AT ALL** — measured
2026-09-08 at **${Object.values(found).flat().length} secret-shaped fields across the corpus**, none of them
reachable from inside the game or from any document.

⛔ **THIS IS THAT MATERIAL, GATHERED. It is spoilers, by construction.**

`;
const order = ["People", "Encounters", "Quests", "Places", "Lore", "Rules & Systems"];
for (const sec of order) {
  const rows = found[sec]; if (!rows?.length) continue;
  md += `\n---\n\n## ${sec} — ${rows.length} entries\n\n`;
  const byWho = {}; for (const r of rows) (byWho[r.who] ||= []).push(r);
  for (const [who, rs] of Object.entries(byWho)) {
    md += `### ${who}\n\n`;
    for (const r of rs) md += `**${r.key}** *(${r.file})*\n\n${render(r.value)}\n\n`;
  }
}
md += `\n---\n\n*${Object.values(found).flat().length} entries · ${Object.keys(found).length} sections · regenerate with \`node scripts/gm_companion.mjs --write\`*\n`;
if (process.argv.includes("--write")) { fs.writeFileSync(path.join(ROOT, "docs/GM_BOOK.md"), md); console.log(`✅ wrote docs/GM_BOOK.md — ${Object.values(found).flat().length} entries across ${Object.keys(found).length} sections`); }
else console.log(`${Object.values(found).flat().length} entries across ${Object.keys(found).length} sections:`, Object.fromEntries(Object.entries(found).map(([k,v])=>[k,v.length])));
