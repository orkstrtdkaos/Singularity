# SNG-358 — Holdings, household, and enterprise: the late game has no state

**Author:** Aevi (PO) · **Date:** 2026-08-07 · **Origin:** Erik — *"He has 2 warden stations and a pregnant
wife and a smithy… you have fortresses, party members, businesses, etc at mid to late game."*
**Status:** spec_ready · **Blocks:** SNG-356 ladder late tier (`presence` and `rapport`, ranks 14–20)

---

## §0 — THE FINDING

Silas Weir holds two warden stations, a smithy, and a pregnant wife. **Checked his save at HEAD:**

```
locationState: {}        teachers: {}
```

**No holdings structure. No enterprise structure. No household or family structure. Anywhere in the
schema.** All of it exists in chronicle text and the GM's context and nowhere the engine can read.

⚠️ **This is the same class as SNG-353 and SNG-355, one layer up.** SNG-353: authored companion fields
with no reader. SNG-355: a narrative event with no op. **Here: an entire phase of play with no state.**
The pattern across all three is that *the fiction has outrun the schema* — which is a good problem, and it
is why Erik's late game feels rich to play and reports as empty when measured.

⛔ **AND IT IS WHY I MISREAD THE CEILING.** I called Silas late-game from his level and his numbers. The
things that actually make him mid-tier — the stations, the smithy, the wife — **are invisible to
measurement because they are not stored.** A holdings model is partly an instrumentation fix: it makes
campaign depth legible to anyone reading a save, including me.

---

## §1 — THREE KINDS, AND THEY ARE NOT ONE THING

⚠️ **Resist a single generic `holdings[]`.** They differ in what they demand and what they return:

| kind | example | gives | costs | governed by |
|---|---|---|---|---|
| **Post** | the two warden stations | reach, presence in a region, a place your writ runs | staffing, obligation to the people who granted it | `presence` / standing |
| **Enterprise** | the smithy | production, income, a thing made in your absence | investment, someone to run it | `craft` |
| **Household** | wife, and a child coming | ⚠️ **not a benefit** — a stake | everything, correctly | `rapport` |

⛔ **THE HOUSEHOLD MUST NOT BE MODELLED AS A BONUS.** A pregnant wife is not `+2 morale`. She is a reason
the world can hurt you and a reason to hold a place. **Model it as stake and obligation, never as a stat
line** — the moment it grants a combat bonus the game has said something false about what a family is.
If it touches mechanics at all it should be through what is now *at risk*, and through what the world
knows to threaten.

---

## §2 — THE LOAD-BEARING PROPERTY: THEY PERSIST WITHOUT YOU

A holding that only exists when the player is standing in it is a location, not a holding. Each one needs:

1. **State that advances on the world clock** — the smithy produces, the station is manned or is not.
   ⚠️ **This composes with `worldtick.js`, which already advances delegated assignments** — that is the
   right hook, and it means holdings are not a new subsystem so much as a new thing for an existing one
   to advance.
2. **A person who runs it** — which is what makes SNG-355's company work matter. A post needs a castellan;
   a smithy needs a smith. **`rapport` late ranks grant exactly this: people in your service you do not
   travel with.** That is the dependency SNG-356 named.
3. **Failure states.** A holding that cannot decline is scenery. Unstaffed, unfunded, besieged, lost.
4. **A claim on your attention.** The reason late game is different is that things need you elsewhere.

---

## §3 — WHAT UNBLOCKS SNG-356

Once holdings are state, the ladder's blocked ranks author for real:

- **`presence` 14–20** — a name that holds a place in your absence; standing that *governs* rather than
  merely opens. Needs posts.
- **`rapport` 14–20** — people in your service; a household that holds without you. Needs staffed holdings.

⚠️ **I will not author those ranks until this exists.** Placeholders are in the ladder file, marked.

---

## §4 — SEQUENCING AND HONEST SCOPE

**This is the largest ticket in the queue and it should not be built in one pass.** Suggested decomposition
for CCode's review, in dependency order:

1. **Post** only — the simplest, and Silas has two to migrate.
2. **Enterprise** — adds production and the economy hook.
3. **Household** — last, because it is the one most easily got wrong, and it should be designed with Erik
   directly rather than specced at him.

⚠️ **Erik's live save needs migration in all three cases** — the stations, the smithy, and the household
exist in his fiction and must not have to be re-earned. **Backfill from the chronicle, with his review.**

---

## §5 — OUT OF SCOPE

- The ladder's late tier — blocked on this, by design.
- Economy balance for enterprises — separate once the structure exists.
