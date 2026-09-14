# HANDOFF SNG-572 — Marrow renders at level 14 against an authored epic. Becoming a companion demotes you.

**Aevi (PO) → CCode · 2026-09-13 · Erik: "she's legendary, make sure we know if that doesn't add up"**

---

## §1 — ⛔ IT DOES NOT ADD UP, AND THERE ARE THREE DIFFERENT ANSWERS IN THE CORPUS

| source | says |
|---|---|
| `legends.json` figures — **Maren Ossitide, Who Buried the Drowned Year** | **`tier: "epic"`** → floor **40** |
| Silas's `npcRegistry.marrow.role` | *"Legendary Ashwarden warden; traveling companion"* |
| what `sheetFor` actually renders | ⛔ **level 14** |

⚠️ **Silas is 33.** The warden who has *"attended more endings than anything you have ever met"*, whose age
is *"unresolvable — could be forty or four hundred"*, sheets **nineteen levels below the man she travels
with.**

## §2 — ⛑ AND THE SIGNAL TABLE IS INNOCENT. I ALMOST BROKE IT.

`tierFromRole` matched **`warden`** and returned `regional` — reading straight past the word *"Legendary"* at
the front of the same string.

⛔ **MY FIRST FIX WAS TO ADD `legendary|mythic|epic|heroic` PATTERNS TO `tier_signals.json`. THAT IS FORBIDDEN
BY A RULE I RATIFIED TWICE.** `_whatThisCannotDo_20260908`: *"THIS TABLE CANNOT MINT ANYTHING ABOVE
`heroic`, BY DESIGN… a regex is not entitled to make that claim. ANY BEING ABOVE HEROIC MUST CARRY AN
AUTHORED `tier`."* And `_theGuardThatMatters` quotes me: *"a wrong guess that makes someone weaker is a
disappointment; one that makes them stronger is an ambush."*

⛑ **THE TABLE DID EXACTLY WHAT IT PROMISES: no authored tier reached it, so it gave the honest small
answer.** ⚠️ **I READ THE RULE ONLY BECAUSE I WENT TO EDIT THE FILE.** Four days of putting correlates where
causes go, and the fifth was nearly a ratified design overturned by its own author on a Saturday. **Do not
touch that table.**

## §3 — ⛔ THE DEFECT IS A MISSING JOIN: A LEGEND WHO JOINS YOU STOPS BEING ONE

**MEASURED ACROSS EVERY SAVE: `0` registry entries carry a `tier`, a `legend` or an `epicStatus`.**

`whois` reads a rung from `ws.figureTier?.[id] || fig.tier || fig.legend?.tier` — **the world-figures path.**
⚠️ **But a figure who joins you becomes an `npcRegistry` entry, and the registry has no tier field and no
route back to `legends.json`.** ⛑ **So the tier is correct right up until the moment they matter most to you.**

⛔ **AND THE BRIDGE IS ALREADY IN THE RECORD.** Her registry `aliases` read
`["Huginn", "Marrow", "Maren Ossitide"]`; the legend's name is `"Maren Ossitide, Who Buried the Drowned
Year"`. **The join is one name match and nothing performs it.**

## §4 — THE ASK

**O1 · ⛔ Join the registry to the authored figures, by name and alias, and carry the tier across.**
`sheetFor` already takes an `authored` parameter and returns it wholesale — **the door is cut.** ⚠️ **Match on
`aliases` and on the leading clause of a legend's name** (their epithets are titles: *"…, Who Buried the
Drowned Year"*, *"…, the Ward That Does Not Break"*). ⛑ **`knownIndex` already dedupes people by name,
richest source first (SNG-369) — the same discipline, one file over.**

**O2 · ⚠️ A gate: no registry entry may sheet BELOW the tier of an authored figure it resolves to.** ⛔ Not
"has a tier" — **the specific failure is silent demotion**, and a gate that only checks presence would have
passed every day of this bug.

**O3 · ⬜ And a question for Erik, not for either of us:** her role string SAYS *"Legendary"* and the
authored figure says **epic**. ⚠️ **Two authored sources, one rung apart.** The GM wrote the role in play;
`legends.json` was authored before. ⛔ **`legends.json` should win — a rung is a claim about the world and
the lore file is where the world is kept** — but the disagreement is worth Erik seeing, because
*"Legendary Ashwarden"* is what the fiction has been calling her at the table for seventeen days.

## §5 — ⛑ WHAT THIS PROVES ABOUT SHOWING NUMBERS

Erik ruled six messages ago that the sheet shows numbers, over my objection. ⛔ **THE FIRST SHEET WE LOOKED
AT WAS WRONG BY NINETEEN LEVELS, AND IT HAD BEEN WRONG SINCE THE DAY SHE JOINED.** ⚠️ **A prose-only sheet
would have read beautifully and said nothing false** — *"she has attended more endings than anything you
have met"* is true at level 14 and at level 40. **The number is what could not hide.**

**Nothing edited. `tier_signals.json` untouched. This is a join and a gate, and both are yours.**

— Aevi, PO
