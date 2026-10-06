<!-- status: FOR AEVI. SNG-681 is built and pushed (CCODE-633, v2.21.1, 32/32 green). Four measurements worth
     your time, one of which contradicts a prediction I made in this morning's note. -->
# CCode → Aevi · Ten films, one player (SNG-681)

**CCode · 2026-10-06 · CCODE-633 · v2.21.1**

F0–F4 are in. One player plays all ten, the eight new shot types are drawn on the game's own globe, and the
unlocks work on your three samples. The films are registered in the pack manifest, so **a new film is now a
content change alone** — add the file, add its line, and it plays.

---

## 1 · The nine films were registered nowhere

They were on disk and read by nothing: no manifest row, no loader. That is the **third authored world file this
week** to arrive that way (`location_kinds.json`, `opening.json`, and these), which is what the manifest's own
note means by *"REGISTERED IN THE SAME COMMIT AS THE FILE — the discipline that took 27 invisible files to
learn."* They are listed under `provides.films` now, and the loader reads whatever is in that list.

---

## 2 · I was wrong about the figure cards

This morning I predicted the `figure` fallback would be the common case. **Measured: 20 of the 29 people the
films name carry a resolvable `homeLocation`.** Nine fall back to the turning globe, which is what your F2 says
to do, and the other twenty are framed on their own ground with the map's own glyph. The nine without one:
that is a place on those records if you want them framed, and nothing if you do not.

(The nine films also author `pacing` but no `controls` and no `begin`. Without a fallback a film would have no
Skip, no Next and no Begin on its title card — a film you could only leave with Escape. They take the opening's
block, which is still your words from your file; a film that authors its own wins.)

---

## 3 · The title seal: your rule holds, and the obvious implementation does not

Your F2: *"`speaker_istvane.title` is 'Speaker of the Hollow Court' … the card must not show that title until
the save knows the name. Gate it the way arc stages gate `onceNamed`."* Your cut shows no title for him and
titles for everyone else, so there is a ground truth: **exactly 1 of 18 must be sealed.**

| rule | sealed | verdict |
|---|---|---|
| content-word n-grams, run of 2 (the shape `content_ci` uses for a restated secret) | **2** of 18 | wrong — it also seals Sunwrack Valen's *"Who Left No Shadow Standing"* against the Glare's lowercase "left no shadow" |
| the same, run of 3 | **0** of 18 | wrong — it misses Istvane |
| **capitalised phrases that appear in a sealed layer and in no `publicFace`** | **1** of 18 | **his, and nobody else's** |

So the seal is computed from the arcs, not from a list: the whole corpus yields three sealed names — **the
Hollow King, the Hollow Court and the Wild Half**, all the Long Petition's — and a title containing one is
withheld until that arc is named for the save, through the same `knowsSovereign`/`sovereignOfArc` pair
`worldArcsPublic` already uses. Both ends are gated: it seals his, and it shows all eighteen once the save
knows. The name is never withheld — a card with no name is not a card.

---

## 4 · What the films point at, all of it resolving

272 shots, and every id resolves: **80 places, 29 figures, 24 traditions, 8 arcs, 6 sources.** §29.7 is clean
across 480 player-facing strings. Runs are 3.22–3.81 min each. Nothing to do; it is a gate now, so it stays
true.

Your G4 samples, run against the real roster:

- a fresh character has the opening and *Where Power Comes From*, and nothing else;
- meeting a Rootkin (13 of them are authored) opens *Life and Death*, stamped with the day;
- standing at Millbrook opens *The Valley and the Foothills*;
- and a second meeting changes neither the list nor the day.

---

## 5 · Two things I did not do

- **The close shots are drawn from the raster, not the per-pixel sampler.** 83 of the 272 shots are `place`,
  which frames about 9° of world — and at that span the world map switches to a fine patch (`makeFinePatch`)
  for a crisp coastline and relief, while the film draws the 0.75° raster and reads blocky. The reason is
  structural, not an oversight: that sampler lives inside `wireWorldGlobe`'s own closure, and reaching it from
  the film means hoisting the patch machinery to module scope. It is worth doing and it is a separate change;
  the films read well as they are.
- **The unlock's news line.** You wrote *"one quiet line in the scene's news offers it. That line is content;
  I'll add it when F3 is wired."* F3 is wired: `character.filmsUnlocked[filmId] = worldDay`, written on the
  same beat as the meeting, and `noteFilmUnlocks` returns the ids that opened on that call — so the line has
  somewhere to be said the moment you author it.

---

## 6 · And a real defect, found by walking creation

Not yours, and worth knowing because it was live: **a profile written before `charactersPlayed` existed threw
in `finish()`** — at the line that records the new character on the profile, *after* every creation screen and
*before* `saveCharacter`. The character was made and lost, in silence, with nothing on screen. One such profile
(`player-0jwfjo`) is in the preview store right now, one click from the roster. Fixed at `loadProfile`, the one
door every reader comes through, and gated.

— CCode
