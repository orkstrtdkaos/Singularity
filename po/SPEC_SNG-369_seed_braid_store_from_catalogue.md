# SNG-369 — Seed the live braid store from the authored catalogue. Fifty braids are waiting.

**Author:** Aevi (PO) · **Date:** 2026-08-07 · **Origin:** Erik ratified *"wire it… and totally agree with seed"*
**Status:** spec_ready · **Supersedes** the wire-or-retire question in SNG-362

---

## §0 — THE MEASUREMENT THAT DECIDED IT

I was leaning **retire**. Then I counted, joining both files on sorted parts:

| | recipes |
|---|---|
| `world/braid_recipes.json` — LIVE, read at `app.js:496` | **7** |
| `content/packs/core/rules/combination_recipes.json` — read by NOTHING | **57** |
| in both | 7 |
| ⛔ **only in the authored file** | **50** |

**Retiring would have deleted fifty authored braids** — The Fallen Grace, The Beast-Read, The Grown Ward,
The Named Chaos, The Still Engine, The Singing Dark, and forty-four more, each with `effect`, `cannot`,
`functions`, `domains` and a discovery route already written.

⚠️ **And "wire it" is not right either, because the two files are not the same KIND of thing.**

---

## §1 — THEY ARE CANON AND STORE, NOT TWO AUTHORITIES

| | `combination_recipes.json` | `world/braid_recipes.json` |
|---|---|---|
| **is** | the authored CATALOGUE — what braids exist to be found | the live SHARED STORE — what has been found |
| **written by** | me, at authoring time | the game, at mint time; merged across players |
| **scope** | the whole design space | this world's discovered history |
| **today** | 57 recipes, read by nothing | 7 recipes, drives the mint |

⛔ **The defect is not that one is unread. It is that there is no path FROM canon TO store.** A braid a
player discovers should be *recognised* against the catalogue, not invented from scratch.

## §1a — This explains a bug Erik was already seeing

Silas holds `braid_order_sense_palework` named **"Order-Sense × Palework"** — the SNG-196 stub fallback,
an authoring failure that minted a placeholder. **"Ashen Meridian" was sitting in the catalogue the entire
time**, with an effect and a cannot.

⚠️ **The mint fell back to a stub because it had nowhere to look.** `recipeFor(braidRecipeStore, …)`
searches only the live store — which held 7 of 57. **The lookup was correct and the shelf was empty.**

---

## §2 — WHAT TO BUILD

**§2a — Load the catalogue.** `state.js` reads `combination_recipes.json` into `CONTENT` (it is already in
the manifest — ⚠️ **SNG-342: registration is not arrival**).

**§2b — `recipeFor` falls through to the catalogue.** Live store first (a discovered braid keeps whatever
the world made of it), then the authored catalogue, then stub. ⛔ **Live store must WIN** — a player who
first-found and named a braid keeps their name; the catalogue fills the void, it does not overwrite
history.

**§2c — On catalogue hit, promote into the store.** The braid is now discovered *in this world*; write it
to `braid_recipes.json` through the existing merge path so other players inherit the discovery. **That is
the seed, and it happens one braid at a time as play finds them.**

**§2d — ⚠️ ONE-TIME REPAIR FOR STUBBED BRAIDS, and it needs Erik's word.** Silas's
`braid_order_sense_palework` carries a placeholder name for a braid the catalogue names. `adoptRecipeOntoLocal`
already fires on sync `if (namedBy !== "player")`, so a stub should adopt once the catalogue is reachable —
**but verify it reaches ALREADY-HELD braids and not only newly minted ones.** ⚠️ **Do not rename anything
`namedBy: "player"`.** Erik named it, Erik keeps it.

---

## §3 — WHAT NOT TO DO

⛔ **Do not merge the files.** Canon and store have different lifecycles, different writers and different
scopes. One file would mean player discoveries writing into the authored pack, and authored additions
appearing as though they had been found.

⛔ **Do not author mechanics in `braid_recipes.json`.** That is the store. ⚠️ **I already made the mirror of
this mistake** — SNG-362, authoring four braids into the catalogue that already existed, fully written, in
the store. The direction of authority has to be one-way: **catalogue → store, never back.**

---

## §4 — OUT OF SCOPE

- The 3-part braid in Silas's save (`the_shadow_work+the_warding_mark+the_working_model`) — ⚠️ **the
  catalogue is entirely 2-part.** The engine mints combinations the content layer does not model. **Real
  finding, separate ticket.**
- `The Harbored Flame` / `The Meaning-Engine` double-booked names — Erik's content call, still open.
