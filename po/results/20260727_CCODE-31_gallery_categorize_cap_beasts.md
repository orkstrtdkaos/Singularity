# CCODE-31 — Gallery: categorize, stop the drop-off, and DO beasts

**CCode · 2026-07-27 · v1.8.292 (`4226c833`) · npm test exit 0 (10 new checks, rawProseCaps 63, ENGINE_MAP ok, wiring audit all-pass).**

Erik, on the portrait gallery: *"the skill ones seem to be populating my portrait gallery... they should be
categorized then as skills, places, people, portraits, beasts (please do beasts!). Are they dropping off
somewhere? I don't see the ones from before."*

## The drop-off (the real bug — answered)
`addGalleryImage` capped the gallery at **48** with a flat `slice(0, 48)` — newest-first, so once skill/moment
art poured in, it **silently evicted the player's OLDER portraits**. That's why the ones from before were gone.
Fixed:
- **Cap raised to 240** (a legacy document shouldn't shed its history at 48).
- **Smart eviction (`capGallery`, pure):** never the current portrait; the OLDEST **transient** beats
  (moment/scene) go first; the meaningful record (portraits, people, places, skills, beasts) persists longest.
- **Honest note:** images already evicted under the old 48-cap are *gone* (the cap dropped them at the time —
  they were never stored). From now on they persist.

## Categorize (the ask)
- A pure **`galleryCategory(g)`** classifier maps each image's kind → a category: **skills** (crafts +
  discoveries), **places** (locations), **people** (grown NPCs + NPC portraits), **portraits** (your own face),
  **beasts** (creatures), **moments** (everything else worth a picture). A self-portrait vs an NPC's portrait is
  told apart by the `"Name — relationship"` caption NPC portraits carry.
- **Filter chips** on the gallery: *All / Portraits / People / Skills / Places / Beasts / Moments*, each with a
  live count; tap one to filter the grid. The active chip persists across re-renders; an emptied filter falls
  back to All.

## Beasts ("please do beasts!")
- A new **`beast` art kind** (`assembleImagePrompt` — the bestiary `look` IS the prompt, "a dangerous creature…
  dark fantasy creature art"; a 640×512 creature size).
- **`noteBeastImage(def)`** mints a creature study to the gallery (kind `beast`) when a bestiary beast is
  **offered** (`fireEncounter`) or **engaged** — the creature is recovered from the encounter def id
  (`re-beast_<id>`, since `synthesizeDuelDef` drops the raw creatureId) or by matching the opponent name to the
  roster, and rendered from its authored `look`. A **stable seed per creature** = one tile even on repeat
  encounters. A **person duel mints nothing** (it's not a beast). Both hooks are guarded so a beast portrait
  never blocks a fight.
- This dovetails with **SNG-245** — threat-attacks now bring real beasts to the player, so the Beasts category
  fills as you're attacked.

## Live verification (fresh port 8366, mixed-kind gallery)
- The chips rendered with correct counts: **Portraits 1 · People 1 · Skills 2 · Places 1 · Beasts 1 · Moments 1**
  — the self-portrait → Portraits, "Pell — devoted" → People, both crafts → Skills, the creature → Beasts.
- **Filtering works:** tapping **Skills** showed only the two crafts; **Beasts** showed only the creature.
- The classifier + smart-cap are unit-tested (10 checks: kind→category incl. the self-vs-NPC portrait split;
  transient-first eviction; the current portrait never evicted; under-cap returns untouched).

## Files
- `engine/art.js` — `beast` prompt kind + size; `galleryCategory`; `capGallery` (smart eviction); `GALLERY_CAP`
  48 → 240.
- `app.js` — the gallery filter chips + `galleryFilter` state; `noteBeastImage` + calls at the offer/engage points.
- `style.css` — `.gal-cats` / `.gal-cat` chip styling.
- `tests/smoke.mjs` — 10 checks.

## Notes
- CCode-direct fix (Erik's live gallery observation, no Aevi spec) → CCODE-31.
- The lost older images can't be recovered (the old cap didn't archive them). The fix prevents future loss.

*— CCode. The gallery is now organized by what a picture IS, keeps its history, and the beasts that come for you
get their portrait. status: complete_pending_review.*
