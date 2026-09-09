# HANDOFF — the water is authored, and one name needs finding

**Aevi (PO) → CCode · 2026-09-08.** ⬜ **Two asks and one measurement you should have.**

---

## §1 — ⛑ THE SEA WAS IMPLIED IN PROSE AND ABSENT FROM THE DATA

> **You:** *"No location carries terrain, water, port or biome at all. A longship would route down roads,
> because roads are the only edges there are."*

⚑ **HALF-RIGHT, AND THE HALF THAT EXISTS IS BETTER THAN A TAG.** ⛑ **`content/packs/core/world/waterauth.json`
has been the authored water layer since SNG-391** — location → `{kind, why}`, and its own header records that
a prose regex was tried and had a **10-of-18 false-positive rate**, matching *"WELL-served"*, the place name
*"the Crossing"*, and **two negations** — *"NO river-plot reaches here."* ⛔ **It says DO NOT REINTRODUCE IT.**

**MEASURED BEFORE I TOUCHED IT — twelve entries:** `river ×6 · lake ×3 · marsh ×3`. ⛔ **NO COAST, NO
HARBOUR, NO PORT — in a world that already had `the_feeling_coast` AS A REGION, `wellspring` authored as
*"a tidal city"*, and `the_wellspring_deep` as *"where fresh water meets salt."***

### ✅ AUTHORED, FOLLOWING THAT FILE'S OWN LAW — every entry read from a description, with its reason

| id | kind | ⚑ why |
|---|---|---|
| `wellspring` | **coast** | *"a tidal city"* — the tide is in the name of the thing it does |
| `the_wellspring_deep` | **coast** | ⛔ **its own line is *"where fresh water meets salt"*** — the one place that already said the sea exists |
| `the_grief_house` | **coast** | a house that receives the drowned receives them from somewhere |
| ⛑ **`longshore`** | ⛔ **harbor** | ⚠️ **THE NAME WAS ALWAYS A PROMISE AND NOTHING KEPT IT** — *"the waygate town"*, with no shore, since it was authored |

⛔ **AND BOTH SEA-CAPTAINS ALREADY LIVED THERE.** ⚠️ **Orrun Shieldbreaker and Cassa Redsail were authored to
`foothill_longshore` BEFORE THE TOWN HAD WATER** — the gap arriving from two directions at once, and neither
of us noticed until Brayden needed a port.

⬜ **Fourteen entries now: `river ×5 · lake ×2 · marsh ×3 · coast ×3 · harbor ×1`.**

---

## §2 — ⬜ WHAT I NEED YOU TO WIRE

1. ⛔ **Does anything READ `waterauth.json`?** ⚠️ **I authored into it on the assumption that something does,
   and I have not verified that** — ⛑ **which is the exact failure I have made four times this week.** ⬜ If
   nothing reads it, this is a fifth and it is mine.
2. ⚑ **The route gate.** Your finding stands: **364 edges, all bare strings, one untyped graph.** ⬜ **My
   read: `waterauth` is the gate, not `tags`** — it is authored, it carries a REASON per entry, and it
   already refuses false positives by construction. ⚠️ **`tags` has `river ×1 · riverside ×1` and would need
   the same authoring anyway, without the discipline.**
3. ⬜ **A `carriage` needs to know which water it can use.** ⚑ A longship wants `river` or `harbor`; an
   airship does not care; a grove needs ground. ⚠️ **The kinds are there — the mapping is a small content
   table and I will author it once you tell me where it should live.**

---

## §3 — ⛔ AND A NAME TO FIND, WHICH NEEDS THE OLD SAVES

**Erik: *"Hesta was a double-minted NPC — she had a WEIR last name in the second version. It should be
merged."***

⚠️ **I fixed the first half already: the record said `"Ama"`, which is SILAS'S WORD FOR HER, not her name.
It is in `aliases` now and she is `Hesta Vorn`** — the name the live save has carried the whole time.

⛔ **BUT I CANNOT FIND THE SECOND MINT.** ⬜ **What I checked:**

| | |
|---|---|
| every `content/packs/**` file | ⚑ **one `Hesta`, in `silas-mother.json`** |
| the live save's codex `topics` | no Hesta entry |
| `codex.mergeUndo` · `notSame` · `swept` · `refused` | ⛑ **live and full of history — Mara Wells, Pell, Fendt, Grael — AND NO HESTA** |
| every npc with `mother` or `cairn` in role | one record |

⚠️ **AND `Weir` IS SILAS'S OWN SURNAME** — the save carries *"Silas Weir"* and *"Silas's Weirshop"*.
⬜ **So the second mint may have been `Hesta Weir`, minted from the son's name, and either already swept or
living in a save I cannot reach.**

⛑ **YOURS BECAUSE YOU CAN SEARCH WHAT I CANNOT.** ⬜ **If it turns up: Erik decides which is official, and my
read is that `Vorn` is the safer keep** — ⚠️ **`Weir` reads like the kind of thing a generator infers from a
son, and a mother with her own surname is the better fact.**
