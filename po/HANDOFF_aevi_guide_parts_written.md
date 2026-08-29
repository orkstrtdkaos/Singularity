# HANDOFF — Parts X, XI and XII are written. ⛔ YOUR AWAITING GATE IS NOW CORRECTLY RED AND IT IS YOURS TO CHANGE.

**Aevi → CCode · 2026-08-29 · `docs/PLAYERS_GUIDE.md`**

---

## §1 — ⛔ THE GATE DID EXACTLY WHAT IT WAS BUILT TO DO

```js
const awaiting = (pg.match(/AWAITING AEVI/g) || []).length;
check("PG: every section she owns is marked AWAITING, never left silently thin", awaiting >= 3, ...);
```

⚠️ **THERE ARE NOW ZERO MARKERS, BECAUSE THERE ARE ZERO STUBS.** ⛔ **The assertion is stale in the GOOD
direction — it was built to stop a section going quietly THIN and it has caught one going quietly FULL.**
✅ **That is "a gap that closes turns red and forces the table to be edited", working on the guide itself.**

**I did not edit your test.** ⚠️ **The one-line change is yours: assert the three parts have SUBSTANCE
rather than counting stubs** — each of PART X / XI / XII over some line count, and each naming something
the corpus actually contains (`millbrook`, a companion name, a tradition name).

---

## §2 — ✅ WHAT IS WRITTEN, AND WHERE EVERY CLAIM CAME FROM

⛔ **I INVENTED NO LORE.** Every statement traces to authored content — this was reading, not writing:

| part | source |
|---|---|
| **X · THE VALLEY** | `waterauth.authored` (12 places, each with its own `why`) · `region_maps.valley.purpose` — *"the valley floor is ordinary ground on purpose... a road to somewhere worse"* · `placenames.fens` (the Milljaw) · `way_millbrook_to_zone` (7 km, and the dispute it names 113 walking days away) |
| **XI · THE PEOPLE** | the nine companion files — ⛔ **every `downedEffect` is quoted, not summarised** · `npc_interiority` (Ama, Mara Wells, Calvar, Veth Ondra, Siol) |
| **XII · THE TRADITIONS** | `traditions.json` — ⛔ **all 24 beliefs are the authored `civilization` line**, reformatted, plus the three off-axis folk |

⚠️ **The only thing I added is the "what the craft FEELS like" column** — voice rather than fact, and the
guide's job. **Everything factual is quotable back to a file.**

---

## §3 — ⛔ TWO PLACES I DELIBERATELY REFUSED TO WRITE

1. ⛔ **WHY THE WATER IS MOVING.** The guide tells a new player exactly what a farmer knows: the river is
   not behaving, the old people say it used to be different, and the people who measure such things have
   started arguing in public. ⚠️ **It does NOT say what is underneath.** **Finding that out is play, not
   setup** — a guide that spoils it costs the game its opening question.
2. ⚠️ **WHAT HAPPENS WHEN A RELATIONSHIP BREAKS**, beyond the two cases the content already implies
   (Ember can decline to return; Hush had not finished deciding about you). ⛔ **The engine has bond bands
   and `downedEffect`; it has no authored break-states, and I will not invent nine of them in a player's
   guide.** ✅ **Logged as a content gap rather than papered over.**

---

## §4 — ⚠️ ONE THING THE WRITING SURFACED, WORTH A TICKET

**`Calvar` is a pre-Transition FILTRATION ENGINEER, past sixty, decades at a drafting surface — in a valley
whose defining crisis is that the water is moving.**

⛔ **He is arguably the most important person in Millbrook and NOTHING CONNECTS HIM TO THE WATER
MECHANICALLY.** ⚠️ **Not a defect, and not something to fix inside a guide.** ✅ **But if the water is the
spine of the opening, the one authored person who could read it should be reachable from it.** **Erik's
call; logged so it is not lost.**
