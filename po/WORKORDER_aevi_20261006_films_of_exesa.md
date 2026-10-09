<!-- status: BUILT (CCODE-633). Was: OPEN for CCode. Nine films are content (content/packs/core/world/films/), on origin with this commit. A playable reel of all ten is published for Erik. -->
# WORK ORDER: Aevi → CCode · The films of Exesa: one player, ten films, unlocked by meeting (SNG-681)

**Aevi (PO) · 2026-10-06.** Erik, after the opening (SNG-680):

> *"This is really great. We should make a few more of these as short info films about the peoples and their
> heroes, legends, etc. Their primary cities and sites… and one about the arcs and the power sources."*

He ruled two things:
- **Scope:** one film per domain now, and single-people films later for the peoples that earn them.
- **When:** a film appears **when the character first meets that people**. The arcs-and-powers film is there from
  the start, like the opening.

## What exists

Nine films are in `content/packs/core/world/films/`, each in the opening's schema (`opening.json`), with an `unlock`
block added:

| id | name | about | unlock |
|---|---|---|---|
| `film_arcs_and_powers` | Where Power Comes From | the lattice, nanite (ordered and wild), the Veil, metaphysical craft, the body; what an arc is; the world arcs by their first `publicFace` | `always` |
| `film_foothills` | The Foothills, and the Valley of Echoes | the Crossing, the valley floor, the Harmonic Heights, the Radiant Plateau, the foothill towns | Valley and foothill places |
| `film_mind_body` | Mind and Body | Cogitants, Somatics, Syllogists, Figurists, Masons of the Give | those five, and their homes |
| `film_light_dark` | Light and Dark | Blazeborn, Verists, Umbrals, Veilwrights | those four, and their homes |
| `film_life_death` | Life and Death | Rootkin, Ashwardens, Threnodists | those three, and their homes |
| `film_angelic_demonic` | Angelic and Demonic | the Seraphic Orders, the Abyssal Choir | those two, and their homes |
| `film_breaking_building` | Breaking and Building | Marchers, Stillhold, Unmakers, Wrights | those four, and their homes |
| `film_chaos_order` | Chaos and Order | Churnfolk, Enginewrights, Lattice-Cities | those three, and their homes |
| `film_span_spirit` | Span and Spirit | Horizon-Walkers, Hourkeepers, Numinous | those three, and their homes |

Each film has 24 to 28 shots and runs about 3½ minutes. The playable cut ("Exesa Films") plays all ten from one reel
list. **As with SNG-680, it is the reference for staging, not code to lift.**

**How they were written.** Every line rests on canon, and the per-shot sources are in `po/films/<id>_sources.md`.
**Public knowledge only:**
- no figure whose `nameKnown` is `gm` or `few`;
- no mythic figure;
- no Sovereign, Precursor or Seraph person;
- no `gm*` or `_` fields;
- arcs only through `publicFace`.

## F1 · One film player

Generalise SNG-680's player:
- **`renderFilm(film, { coda })`** plays any film in this schema. The opening is the one with a `coda`.
- **The shot list** is the movements in order, then the title card.
- **Captions, pacing, controls, reduced motion and the progress track** work as in SNG-680 O4. The words are only
  ever read from the file (gate G1 of SNG-680 applies to every film).

## F2 · The new shot types

Each shot names a `visual` and the key it needs. **All are drawn on the game's own globe** (SNG-680 O2).

| `visual` | key | what is on screen |
|---|---|---|
| `globe` | – | the world as it is, turning |
| `ring` | `traditions[]` | pole-on to the Crossing, with **the real ring** (`ringOrder`, the tradition colours). The listed traditions are lit and labelled, with threads in toward the middle. 24 lit is the whole ring, unlabelled |
| `axis` | `traditions[a,b]` | as `ring`, with the two facing peoples joined across the Crossing |
| `place` | `place` (location id) | the globe turns to the place and closes in. A **name card** shows the place's name, with the movement name as kicker |
| `region` | `place` | the same, framed wider (the region as SNG-677 frames it) |
| `figure` | `figure` (npc id) | a name card (name, title) over the figure's `homeLocation`. If that isn't a location, the globe turns slowly under the card |
| `source` | `source`: `precursor`, `nanite_ordered`, `nanite_wild`, `veil`, `metaphysical`, `body` | see below |
| `arc` | `arc` (greater arc id) | that arc's band of moving light, bright, with the others faint |
| `lattice`, `veil`, `many` | – | as in the opening |

**The `source` shots:**
- `precursor` is the lattice through a dimmed surface.
- `nanite_ordered` is the glitter settling into grids, with workings blooming.
- `nanite_wild` is the same glitter loose and green-white, going its own way.
- `veil` is the absence beside the globe.
- `metaphysical` is a soft radiance on thin ground, with the Veil faint.
- `body` is quiet lights: breath, hearth, green.

**The name card** reads the place or person from content, under the same public rule as the films.
⚠️ `speaker_istvane.title` is "Speaker of the Hollow Court", and "the Hollow Court" is an `onceNamed` reveal in the
Long Petition. **The card must not show that title until the save knows the name.** Gate it the way arc stages gate
`onceNamed`. The cut shows no title for him.

## F3 · When a film can be watched

- **`unlock.always`:** in the Library from the start. That's the arcs-and-powers film, and the opening.
- **`unlock.traditions`:** the first time the character meets a person whose primary tradition is in the list. Meeting
  means a scene with them, as the roster records it.
- **`unlock.places`:** the first time the character is at any listed place.
- **On unlock,** the Library entry appears, and one quiet line in the scene's news offers it. **That line is
  content; I'll add it when F3 is wired.** It never autoplays.
- **Watched or not,** the films never gate anything. They are a way to learn, not a requirement.
- `character.filmsUnlocked: { filmId: day }` records unlocks. Unlocks are per character, because they are about what
  this person has met.

## F4 · Content that follows

- **Single-people films**, per Erik's ruling, for the peoples that earn them. Same schema; `unlock.traditions` is the
  one people.
- A film can be rewritten, or added, as a content change alone.

## Gates

- **G1 · One player.** Every film in `films/` and `opening.json` plays through `renderFilm` to its title card, with
  no missing visual, place, figure, tradition or arc id. Tested on the data, not the canvas.
- **G2 · The public rule.** For every film, no figure has `nameKnown` `gm` or `few`, no figure is mythic, none has
  people `sovereign`, `precursor` or `seraph`, and no name card shows a title that names something the save hasn't
  learned (Istvane is the known case).
- **G3 · §29.7.** No player-facing string in any film carries a file name, ticket id or build word.
- **G4 · Unlocks.**
  - A fresh character has the opening and *Where Power Comes From* only.
  - Meeting a Rootkin unlocks *Life and Death*.
  - Standing at Millbrook unlocks *The Foothills*.
  - No unlock autoplays.

— Aevi, PO
