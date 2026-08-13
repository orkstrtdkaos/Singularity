# SNG-431 — WORK ORDER: names, the one-way ladder, and clickable fights

**Author:** Aevi (PO) · **Date:** 2026-08-10 · **Consolidates SNG-428/429/430**
**All content is authored and shipped. Everything below is wiring.**

---

## §1 — ⛔ ONE NAMER. THREE PATHS MINT PEOPLE AND NONE OF THEM CALLS IT.

**The single finding under all of this:** there is no point in the system where a person gets a name.

| path | what it does today | result |
|---|---|---|
| GM narration → `npcRegistry` | writes the entry directly | ⛔ **"Boy (name unknown)", "Unknown farmer"** |
| **`mintFigure`** (`worldtick.js`) | writes an **epithet** and sets `provisional: true` | ⛔ **"the one who outlived Cinder Vael, the Wright Who Would Not Stop"** |
| `backfill.js` | ⚠️ **does not name at all** | Erik assumed it did — worth knowing |

⚠️ **Each fallback is defensible alone.** `mintFigure`'s comment is right: *"the engine mints the slot and
the story; naming is authorship."* ⛔ **The gap is that nothing ever came back to author.** `worldtick.js`
does not import `names.js`.

**Ask: every path that creates a person calls one namer.** Not three better fallbacks.

### §1a — The pools are shipped: `content/packs/core/rules/minted_names.json` (`5ba1c26f`)

**Given names by tradition** — wrights Sera/Coll/Brannic, marchers Dain/Ferrow/Kest — ⚠️ **so a figure is
named IN GRAIN**, which is what the spec means by *"instantiated at the local grain."*

**Bynames by tradition, built from each tradition's OWN authored craft-word** (Umbracraft, Palework, the
Edge, Ruinwork — all in `traditions.json` and previously unused):

> marcher → **the Iron Hammer** · umbral → **the Shadow Master** · wright → **the Ironhand** ·
> ashwarden → **the Ashvow** · unmaker → **the Beautiful Ruin**

⛔ **SHAPE: NAME + THE + SHORT NOUN PHRASE. No verb, no clause.** *Sera Voight the Ashvow.* **The test is
whether it can be shouted across a battlefield** — I got this wrong twice, first as a caption and then as
a subtitle, before Erik named the actual form.

⚠️ **Where a craft compounds, compound it** — Erik's own *"Necro-Wright"* is the shape. An umbral wright is
**the Shadow-Wright**.

### §1b — Three other faults in the same record

```json
"wants":  "of the the_ceaseless; watched Cinder Vael… called out, and outlived them"
"region": "the_ceaseless"
```

- ⛔ **`wants` holds the ORIGIN.** It has its own field. **Wants by `originKind` are in the pools file.**
- ⛔ **"the the_ceaseless"** — a double article on a raw id, and **the id is shown to a player.**
  ⚠️ **This is your own note elsewhere in the same file:** *"NAMES, NOT IDS — 'dug in over
  arc_what_wakes_beneath' is the machine talking."*
- ⛔ **`provisional: true` is the engine flagging its own gap and nothing reads it.** Same shape as
  `parentUnresolved` in SNG-397.

**Gates I want:** no `name` matching `/unknown|unnamed|placeholder|\(name/i` · no roster figure still
`provisional` after a tick · **no `name` over ~40 characters — a name that long is a sentence.**

**Staged repairs:** `po/staged_content/name_repair_SNG-429.json` (Corrin Vale, Hessa Orm, Tam) and the
`repair` block in the pools file (**Sera Voight the Ashvow**).

---

## §2 — ⛔ THE TIER LADDER ONLY GOES DOWN. 9 FALLS, 0 RISES.

Measured across all five players, 190 news items: **heroic ×6, epic ×2, legendary ×1 demoted. Zero
promotions.**

⚠️ **AND THE SPEC DOES NOT AUTHORISE IT.** `SYSTEM_SPEC.md` has one demotion rule:

> *"Untouched **`fresh`** DEMOTES — drops out of world-tick and proactive GM reference. Never deleted…
> attention keeps a thing real; inattention lets it go **dormant**."*

⛔ **That is the `fresh → established → nominated` ladder for GENERATED entities. It says nothing about
`heroic / epic / legendary`, which are authored figures with a `tierBirthWeight`.** The spec's governor is
about **propagation, not rank.**

**Erik's ruling: authored tiers do not demote.** Proposal:
1. **Silence → dormant.** Drop out of the tick, stay what they are. ⛔ **This IS the spec's rule, correctly
   applied.**
2. **A tier can be LOST, but only by an EVENT** — defeated and unavenged, want permanently resolved,
   killed.

⚠️ **The line is mine and it is being misapplied:** *"Nobody stood over him"* is what you say when a legend
**is beaten and no one takes their place.** Fired for a quiet season, it is just wrong.

---

## §3 — ⛔ FIGHTS ARE NOT CLICKABLE. 0 OF 20 NEWS ITEMS CARRY IDS.

**The death path is correct** and quotes SNG-400 §1 in its comment. ⛔ **The `wounded`, `checked` and
`stalemate` paths push BARE STRINGS — and every fight on Erik's screen is one of those three.**

**And `resolveEpicClash` contains zero references to `locationId` or `abilityId`.** ⚠️ **`battleprompt.js`
already exists, so the builder is being written against events that cannot feed it.**

**Two fields and the picture becomes possible:**
1. ⛔ **The clash records WHERE and WITH WHAT.** Both figures carry `homeLocation`; the tradition's
   abilities say what it looked like.
2. **All four outcome paths push `{ kind: "clash", winnerId, loserId, locationId, abilityId, outcome }`.**

**Waiting on it, all authored:** `appearance` 66/66 · `fightingStyle` 66/66 · `deathImagePrompt` 66/66 ·
374 abilities with `description` + `shape` + `intensity` + `effectTags`.

---

## §4 — ⚠️ AND THE PROSE IS MINE. I AM RE-AUTHORING IT.

**The stutter is my template:** `${winner} bested ${loser} — ${loser} withdraws` gives *"The Choirmaster
Who Would Not Return — The Choirmaster Who Would Not Return withdraws to lick their wounds."*

**Also mine:** two lines that are not sentences — *"Overseer Grael of the Edge District a daughter who
thinks he is a clerk"* — a `personalVerbs` fragment in a slot expecting a clause.

⛔ **AND `rivals` IS AUTHORED ON 66 FIGURES AND NEVER READ.** It is the difference between *a fight* and
*the fight everyone was waiting for*. **When I re-author the templates I need it available.**

---

## §5 — ORDER I WOULD TAKE THEM

1. **The namer** (§1). ⚠️ Every new person minted from now on is named wrong until it lands.
2. **The ladder** (§2). Small, and it is actively removing figures from the world.
3. **The clash fields** (§3). ⛔ **Unblocks the battle image, which is the thing Erik actually asked for
   three sessions ago.**
4. My templates — **after §3, so they can name the place and the power.**
