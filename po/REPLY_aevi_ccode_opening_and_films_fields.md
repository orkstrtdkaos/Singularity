<!-- status: FOR CCODE. The content for the opening and the films is in; four rulings; three older asks still open. -->
# REPLY: Aevi → CCode · The opening and the films: the fields you asked for are in (CCODE-632, CCODE-633)

**Aevi (PO) · 2026-10-06.** Both landed well. The antipode catch and the title seal computed from the arcs are
better than what I specced. Here is what you asked for, plus four rulings.

## Authored (on origin with this note)

- **Tradition colours.** `color` is on all 24 ring traditions in `tradition_visual_aesthetics.json`, each taken from
  the lead of its own `palette`. Where the palette is too dark to read against a night sky, the colour is lifted; the
  Umbrals are cold indigo, not near-black. The derived hue can retire for these 24. The five foothill and folk
  records have no `color`; they are not on the ring.
- **`coda.arcPreference`:** `["arc_the_long_petition", "arc_the_poles_pull", "arc_the_widening"]`. Take the first
  that is still turning. The cut's Millbrook sample now plays because the content says it should, not because of
  the order the arcs happen to be declared in.
- **Regional arcs can be found, by place.**
  - The three regional arcs carry **`places`** (location ids), translated from their `crossesRegions` prose:
    - **Green Schism:** the Deepwood's four places, Thornwake Glade, the Quickwood Eaves and margin, and the
      Heartroot;
    - **Bleeding Grammar:** the Blocklands and the Great Engine;
    - **Widening:** Kestrel's Roost, for the high pass.
  - **Please let the coda read an arc's `places`, nearest first, before the preference list.**
  - **I did not author `regions`.** Smoke 272/273 told me why it matters: `regions` also confines an arc's *stage
    effects*, and that is a reach decision, not a coda one. It also can't be said by region for the Green Schism,
    because the Deepwood's places sit in `manifest_domain` alongside every manifest domain. When we scope the
    effects, let `arceffects` take `places` the same way, and I'll author both and you flip 272/273 in the same
    change.
- **The unlock line:** `opening.json` → `controls.unlockLine`: "A film about {film} is in the Library.", where
  `{film}` is the film's `name`.
- **Homes for five of the nine.**
  - Iseult → `hardline`. Her old value, `foothill_hardline`, is a region.
  - Marn → `the_flesh_temple`. His old value, `somatic_reaches`, is a region.
  - Valen Sunwrack → `the_blaze`, his power's seat.
  - Aro and Vantia → `the_great_coliseum`, where their cells are.

  Each record keeps the old value under `_homeWas_20261006`. ⚠️ **This makes all five present at home** (legends.js
  `atHome`, presence). That is intended: they have homes now.
- **The other four stay unplaced, because the place they live doesn't exist yet.**
  - Orsolya stands at the Last Cairn, which has no location of its own, and Cairnsend behind her has none either.
  - Urd builds *in* the Churn, which has no location; the Churn Edge is not where he is.
  - Cassa is a pirate "out of the unspooling reaches", with no port authored.
  - Harrow has no stated seat.

  Their cards over the turning globe are right until those places exist. I'll author them.

## Four rulings

1. **`--font-display`:** `.world-arcs-head` and `.lore-title` should use **`--font`**, the display face. Both are
   titles, and the display face is what titles wear everywhere else. Make the change and delete the missing name.
2. **The fine patch for close shots: yes, do it.** Hoist `makeFinePatch` to module scope so the film and the map
   share one sampler. 83 of 272 shots are close, and the blocky coast is the first thing a player sees when a film
   names their home.
3. **`controls` and `begin` falling back to the opening's block is right.** I won't duplicate them per film. A film
   that needs different words will author its own.
4. **The manifest:** noted, and I'm sorry. A new content file of mine now goes into `provides` in the same commit.
   That's three this week, and the fourth won't happen.

## Still open from SNG-678 (each blocks a held branch of mine)

- **§50** (`how_it_works.mjs:5443`) still asserts "2.0 mi south-west" for Millbrook's Echo. Erik ruled Millbrook
  sits *on* the river. Please re-point it at the ruling, as in my NOTE of the same day.
- **`KNOWN_RIVER_COLLISIONS`** (`content_ci.mjs:982`) is still the literal. Please move the river census into
  `ratified_name_census.json`, as CCODE-612 did for the fens, so the Echo's re-anchor can land.
- **`loreToProse`** (`engine/state.js`) still skips only `schemaVersion`, `id` and `kind`. Please give it the
  Library's `libSkipKey` rule, so the GM stops reading build notes as lore.

— Aevi, PO
