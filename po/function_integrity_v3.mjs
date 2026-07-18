// SNG-147c — function-integrity detector v3.
// Cue vocabulary is DERIVED from content/packs/core/rules/function_vocabulary.json (each verb's
// definition + notTheSameAs), never hand-invented. v1 over-reported (71 false), v2 used my own
// wordlist. The lesson from the a.ranks bug: an instrument nobody read the internals of reports
// plausible numbers that mean nothing. Read this one.
import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";
const root = process.cwd();
const canon = JSON.parse(readFileSync(join(root,"content/packs/core/rules/function_vocabulary.json"),"utf8"));
const STOP = new Set(("a an the that this is are was be for of to and or not but with without "
 +"same as it its which who what when where than then so if any all one two some more most other "
 +"you your they their them there here into onto from about").split(" "));
// NOTE (Aevi, 2026-07-18): v3's first cut stopworded "harm", "living", "thing", "directly" — i.e.
// the entire definition of `strike` — leaving the verb's own name as its only cue. It reported 151,
// which was measuring almost nothing. The definition's CONTENT words are the payload; only true
// function words belong in STOP. Same class of error as the a.ranks bug: a plausible number from an
// instrument nobody opened.
// derive per-verb cue stems from the canon prose describing that verb
const cues = {};
for (const [fam, verbs] of Object.entries(canon.families)) {
  for (const v of verbs) {
    const words = `${v.verb} ${v.definition} ${v.example||""}`.toLowerCase().match(/[a-z]+/g) || [];
    const stems = [...new Set(words.filter(w => w.length>3 && !STOP.has(w)))].map(w => w.replace(/(ies|es|ing|ed|s|e)$/,"")).filter(w=>w.length>2);
    cues[v.verb] = { fam, stems, def: v.definition };
  }
}
function walk(d,o=[]){for(const n of readdirSync(d)){const p=join(d,n);statSync(p).isDirectory()?walk(p,o):(extname(p)===".json"&&/abilities/.test(p)&&o.push(p));}return o;}
const A=[];for(const f of walk(join(root,"content","packs"))){for(const a of (JSON.parse(readFileSync(f,"utf8")).abilities||[])) A.push({...a,_f:f.split("/").pop()});}
const taught = (a, verb) => {
  const c = cues[verb]; if (!c) return true;
  const txt = ((a.tree||[]).map(r=>`${r.grants||""} ${r.cannot||""}`).join(" ")+" "+(a.description||"")).toLowerCase();
  return c.stems.some(s => txt.includes(s));
};
const rows=[];
for (const a of A) for (const v of (a.functions||[])) if (!taught(a,v)) rows.push({id:a.id,verb:v,fam:cues[v]?.fam,file:a._f});
const byVerb={},byFam={};
for(const r of rows){byVerb[r.verb]=(byVerb[r.verb]||0)+1;byFam[r.fam]=(byFam[r.fam]||0)+1;}
console.log(`v3 — declared verbs with NO canon-derived cue anywhere in the ability's prose: ${rows.length} of ${A.reduce((n,a)=>n+(a.functions||[]).length,0)} declarations\n`);
console.log("by family:", byFam);
console.log("by verb:", Object.entries(byVerb).sort((a,b)=>b[1]-a[1]).slice(0,12).map(([k,n])=>`${k}:${n}`).join("  "));
console.log("\nHARM-family cases (these are the ones the intent gate depends on):");
rows.filter(r=>r.fam==="HARM").forEach(r=>console.log(`   ${r.id} [${r.verb}] (${r.file})`));
