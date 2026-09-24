// po/tools/great_figures.cjs — writes docs/GREAT_FIGURES.md and docs/GREAT_FIGURES.csv. READ-ONLY on content.
// Usage: node po/tools/great_figures.cjs            (from the repo root)
// Every heroic-and-above figure across tradition_epics.json, lore/legends.json and npcs/: what they are called, their
// whole name (or a being's true name), who may know it, their place in the Sovereign story, and the twelve vectors.
// Names come from the records once C17 merges them; until then from the staged SNG-643 file (or its applied/ copy).
const fs=require("fs");const path=require("path");const root=path.resolve(__dirname,"..","..");const outDir=path.join(root,"docs");
const stagedP=["po/staged_content/SNG-643_names_and_the_unmet.json","po/staged_content/changesets/applied/SNG-643_names_and_the_unmet.json"].map(p=>path.join(root,p)).find(p=>fs.existsSync(p));
const J=p=>JSON.parse(fs.readFileSync(`${root}/${p}`,"utf8"));const ST=stagedP?JSON.parse(fs.readFileSync(stagedP,"utf8")):{names:[],unmet:null};
const S=J("content/packs/core/spectrums.json");const AX=(S.spectrums||S);const TO={mythic:0,legendary:1,epic:2,heroic:3};const people=new Map();
const put=(r,src)=>{if(!r?.id||!(r.tier in TO))return;const prev=people.get(r.id);people.set(r.id,{...(prev||{}),...r})};
for(const e of J("content/packs/valley/tradition_epics.json").epics)put(e);
{const L=J("content/packs/valley/lore/legends.json");for(const f of(Array.isArray(L.figures)?L.figures:Object.values(L.figures||{})))put(f)}
for(const f of fs.readdirSync(`${root}/content/packs/valley/npcs`))try{put(J(`content/packs/valley/npcs/${f}`))}catch{}
if(ST.unmet)put(ST.unmet.record);
const NM=new Map(ST.names.map(n=>[n.id,n]));
const SOV={lucifer:"Sovereign — Light (refused Dark) · a Precursor being · masked as Eosphor",the_hollow_king:"Sovereign — Demonic (refused Angelic)",the_ninefold_ascendant:"Sovereign — Mind (refused Body) · the Unbodied",the_unmet:"Sovereign — Span (refused nearness) · THIN"};
const ANTI=["maren_ossitide","the_last_choirmistress","sister_alder","the_deep_warden","iselde_the_wanderer"];
const AGENT={the_unbodied_choir_master:"Agent — the Unbodied's (the vessel trade)",sunwrack_valen:"Supply line — Lucifer's"};
const CLAIM={the_scouring_hand:"Challenger — Breaking (held by the Last Mercy)",cinder_vael:"Challenger — Building (held by the Last Mercy)",thornmother_sealed:"Challenger — Life (held by Neth)",morvane_the_harvest:"Challenger — Death (held by Neth)",the_still_lattice:"Claimant — Order (the open seat, unopposed)",the_starless:"Claimant on the refused half — Dark · wants the Void, hates Lucifer",the_appetite:"Claimant on the refused half — Body",the_burning_certainty:"Claimant on the refused half — Angelic",the_gate_that_gapes:"Claimant on the refused half — nearness (Span's other side)"};
const HOLD={neth_the_stayed:"Savior — HOLDS Life / Death; challengers must beat her",the_last_mercy:"Savior — HOLDS Breaking / Building; challengers must beat her"};
const PRE=new Set(["akinetos","kenosis","parakletos"]);const counter=new Map();
const rivalsOf=p=>p.id==="the_unmet"&&ST.unmet?ST.unmet.record.rivals:(p.rivals||[]);
for(const p of people.values())if(p.alignment==="villain")for(const r of rivalsOf(p)){const q=people.get(r);if(q&&q.alignment!=="villain")counter.set(r,[...(counter.get(r)||[]),p.name||p.id])}
const role=p=>{const c=counter.has(p.id)?` · counterweight to ${counter.get(p.id).join(", ")}`:"";
 if(SOV[p.id])return SOV[p.id];if(HOLD[p.id])return HOLD[p.id]+c;if(PRE.has(p.id))return "Precursor — above the map";if(ANTI.includes(p.id))return "Savior — anti-Sovereign: knows, and hunts (R41c)"+c;
 if(AGENT[p.id])return AGENT[p.id];if(CLAIM[p.id])return CLAIM[p.id];if(counter.has(p.id))return `Savior — counterweight to ${counter.get(p.id).join(", ")}`;
 if(p.id==="the_one_called_zeus")return "Not a Sovereign — First Among the God-Named";if(p.alignment==="villain")return "Villain";return ""};
const ALIAS={light_dark:["dark_light",1]};
const disp=p=>{if(typeof p.spectrum==="string")return `(data error: spectrum holds "${p.spectrum}")`;const out=[],raw=[];
 for(const[k0,v0]of Object.entries(p.spectrum||{})){const[k,s]=ALIAS[k0]||[k0,1];const ax=AX.find(a=>a.id===k);const n=Number(v0)*s;if(!ax){raw.push(`${k0} ${v0}`);continue}if(!Number.isFinite(n)||Math.abs(n)<0.3)continue;
  const pole=n>=0?ax.posPole:ax.negPole;out.push({s:`${Math.abs(n)>=0.7?"strongly ":""}${pole[0].toUpperCase()}${pole.slice(1)} ${n>=0?"+":"−"}${Math.abs(n).toFixed(1)}`,a:Math.abs(n)})}
 out.sort((a,b)=>b.a-a.a);if(raw.length&&!out.length)return `(old 0–10 scale: ${raw.join(", ")})`;return out.map(o=>o.s).join(", ")||"(balanced)"};
const whole=p=>{const n=NM.get(p.id)||{};const fn=n.fullName||p.fullName||"";const tn=n.trueName||"";return{fn,tn,title:n.title||p.title||"",known:n.nameKnown||(p.fullName?"world":"")}};
const rows=[...people.values()].sort((a,b)=>(TO[a.tier]-TO[b.tier])||String(a.name).localeCompare(String(b.name)));
const esc=s=>String(s??"").replace(/\|/g,"/").replace(/\n/g," ");const KN={world:"everyone",few:"a few",gm:"GM only"};
const md=["# THE GREAT FIGURES — whole names, their place in the Sovereign story, and the twelve vectors","","**GENERATED by `po/tools/great_figures.cjs`** — regenerate with `node po/tools/great_figures.cjs`; never hand-edit. ⛔ **GM-EYES: the *whole name* column holds names marked *GM only*.** Companion to `docs/ROSTER.md` (every authored person and their sheet); the Sovereign canon is `content/packs/valley/lore/the_satiated_sovereigns.md`.","",
`${rows.length} figures, heroic and above. **Called** is what people say. **Whole name** is given · middle · family for a person, or a being's **true name**. **Known by** is who can learn it: *everyone*, *a few*, or *GM only* — a GM-only name is still real, and crafts that use names can reach it. Staged names: \`po/staged_content/SNG-643_names_and_the_unmet.json\`. Vectors listed past ±0.3, *strongly* past ±0.7.`];
for(const t of["mythic","legendary","epic","heroic"]){const T=rows.filter(r=>r.tier===t);md.push("",`## ${t[0].toUpperCase()+t.slice(1)} (${T.length})`,"","| called | whole name | title | known by | people | Sovereign / Savior | vectors |","|---|---|---|---|---|---|---|");
 for(const p of T){const w=whole(p);md.push(`| **${esc(p.name)}** \`${p.id}\` | ${w.fn?esc(w.fn):w.tn?`*${esc(w.tn)}* (true name)`:""} | ${esc(w.title)} | ${KN[w.known]||""} | ${esc(p.tradition||p.people||"")} | ${esc(role(p))} | ${esc(disp(p))} |`)}}
fs.writeFileSync(path.join(outDir,"GREAT_FIGURES.md"),md.join("\n")+"\n");
const csv=[["id","called","whole_name","true_name","title","known_by","tier","people","alignment","sovereign_or_savior","vectors"].join(",")];
for(const p of rows){const w=whole(p);csv.push([p.id,p.name,w.fn,w.tn,w.title,w.known,p.tier,p.tradition||p.people||"",p.alignment||"",role(p),disp(p)].map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(","))}
fs.writeFileSync(path.join(outDir,"GREAT_FIGURES.csv"),csv.join("\n")+"\n");
console.log("figures",rows.length,"unnamed",rows.filter(p=>{const w=whole(p);return !w.fn&&!w.tn}).map(p=>p.id).join(","));
