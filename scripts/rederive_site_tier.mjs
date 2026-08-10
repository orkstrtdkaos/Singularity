// scripts/rederive_site_tier.mjs — SNG-398 §4.1: the tier re-derived WITH A DISTANCE CONSTRAINT,
// staged for Aevi's review. Never applied from here; her ratification applies it, as before.
//
// ⛔ WHY THE FIRST DERIVATION WAS WRONG (her own §2): connection topology finds things CONNECTED
// to a hub, not things INSIDE one — a hamlet at the end of a single road is topologically identical
// to a room off a courtyard. The one line that would have shown it: walkingDays(site, parent).
// Measured now, first: 0 of 65 within 3 days, median 17.4, worst 234 (the Blocklands).
//
// The re-derivation: a location keeps `tier: site` ONLY if it is within SITE_MAX_DAYS of its
// parent (her suggested cut: ~1 day). Everything else becomes `settlement` — the CONNECTION is
// kept (it is real; the tier was the lie). Her §3a degree signal rides along as review evidence:
// degree-1-into-parent is the room pattern, degree-2+ is the neighbour pattern.

import { readFileSync, readdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { walkingDays } from "../engine/worldmap.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
export const SITE_MAX_DAYS = 1;                                  // Aevi's suggested cut, hers to move

export function loadLocations() {
  const dir = join(root, "content/packs/valley/locations");
  const locs = {};
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".json"))) {
    const l = JSON.parse(readFileSync(join(dir, f), "utf8"));
    locs[l.id] = l;
  }
  return locs;
}

/** Every current site, measured against its parent. Pure; the staging file is just this, serialised. */
export function rederive(locs, maxDays = SITE_MAX_DAYS) {
  const rows = [];
  for (const l of Object.values(locs)) {
    if (l.tier !== "site") continue;
    const parent = l.parentId ? locs[l.parentId] : null;
    const days = parent ? walkingDays(l, parent) : null;
    const degree = Array.isArray(l.connections) ? l.connections.length : 0;
    const proposed = days != null && days <= maxDays ? "site" : "settlement";
    rows.push({
      id: l.id, name: l.name || l.id, parentId: l.parentId || null,
      daysToParent: days == null ? null : Math.round(days * 10) / 10,
      degree,
      current: "site", proposed,
      // her §3a signal, as evidence not verdict: degree-1 into a settlement is the ROOM pattern
      degreeSignal: degree <= 1 ? "room-like (degree ≤ 1)" : `neighbour-like (degree ${degree})`,
      note: proposed === "site" ? "within the cut — a real interior"
        : days == null ? "parent missing or unplaced — cannot be a room of nowhere"
        : `${Math.round(days)} days from its parent — a satellite settlement, connection kept`,
    });
  }
  rows.sort((a, b) => (b.daysToParent ?? 9e9) - (a.daysToParent ?? 9e9));
  const survivors = rows.filter((r) => r.proposed === "site");
  return {
    generatedBy: "scripts/rederive_site_tier.mjs — SNG-398 §4.1",
    rule: `tier stays "site" only if walkingDays(site, parent) <= ${maxDays}; else "settlement", connection kept`,
    summary: {
      sites: rows.length,
      survive: survivors.length,
      demoted: rows.length - survivors.length,
      medianDays: rows.length ? rows.map((r) => r.daysToParent).sort((a, b) => a - b)[Math.floor(rows.length / 2)] : null,
      worst: rows[0] ? `${rows[0].name} — ${rows[0].daysToParent} days from ${rows[0].parentId}` : null,
      // ⚠️ HER §4.1 CLAUSE, HONOURED IN THE ARTIFACT ITSELF:
      plainly: survivors.length === 0
        ? "ZERO sites survive the distance cut. The interior tier was never authored at this granularity — it has to be populated (SNG-396: from the saves), not discovered."
        : `${survivors.length} of ${rows.length} survive as true interiors.`,
    },
    rows,
  };
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/").split("/").pop())) {
  const out = rederive(loadLocations());
  const path = join(root, "po/staged_content/hierarchy_rederived_SNG-398.json");
  writeFileSync(path, JSON.stringify(out, null, 1) + String.fromCharCode(10));
  console.log(`staged ${out.rows.length} rows → po/staged_content/hierarchy_rederived_SNG-398.json`);
  console.log(out.summary.plainly);
}
