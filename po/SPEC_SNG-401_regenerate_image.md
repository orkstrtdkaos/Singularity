# SNG-401 — Regenerate any image, from the lightbox

**Author:** Aevi (PO) · **Date:** 2026-08-09
**Erik:** *"with the builder let's add the ability to regenerate any image. It would be a button on the
zoom in."*

---

## §1 — ⛔ THE OBSTACLE: THE LIGHTBOX RECEIVES A URL AND A CAPTION. NOTHING ELSE.

```js
openLightbox([{ url: img.getAttribute("src"), caption: img.getAttribute("alt") }]);
```

**Eight call sites — portraits, location art, craft art, braid moments, gallery, feed — all pass the same
two fields.** ⛔ **By the time an image is on screen the app has forgotten what produced it: no kind, no
prompt, no seed, no subject.** A regenerate button on that data can only re-fetch the same URL.

**Needed on each lightbox item:**

```
regen: { kind, subjectId, seedKey, prompt, promptOpts }
```

⚠️ **`data-lightbox` is a string attribute on the img, so the provenance can ride there** (`data-regen-kind`,
`data-regen-subject`, `data-regen-seed`) **without changing eight signatures.** ⛔ **Do not stuff the prompt
into an attribute** — prompts are long and some are spoiler-bearing; keep a lookup keyed by `seedKey`.

---

## §2 — ⛔ TWO DIFFERENT BUTTONS, BECAUSE THEY ARE DIFFERENT ACTS

**Re-roll** — same prompt, new seed. *"Draw this again."*
**Rebuild** — ⛔ **re-run the BUILDER and get a new prompt**, then draw. *"Describe this differently."*

⚠️ **Only images that came from a builder can rebuild** — the battle image (SNG-400b), scene art. **An
authored portrait has no builder; it has a prompt I wrote, and rebuilding it would mean discarding my
authoring.** Show one button or two depending on provenance.

⛔ **THE DISTINCTION MATTERS FOR THE BATTLE IMAGE SPECIFICALLY.** If the composition is wrong — wrong
power, wrong place, the two figures reading as one — a re-roll gives you the same wrong composition with a
different grain. **Only a rebuild fixes it.**

---

## §3 — ⛔ DO NOT DESTROY THE OLD IMAGE

The seed is deliberately stable — your own comment: *"a portrait that re-rolls is worse than none, because
it quietly says this is a different person."*

⚠️ **So regenerate must be EXPLICIT AND REVERSIBLE.** Push the previous image into the same lightbox's
list rather than overwriting it: **the arrows already exist for multi-image**, and the player arrows back
to the one they preferred and keeps it.

⛔ **A regenerate that silently replaces a face the player had grown used to is worse than no button.**
The player asked for another try, not for the old one to be deleted.

**On accept:** the chosen image becomes the subject's image and the seed updates to the accepted one, so
it stays stable from then on.

---

## §4 — COST AND GUARDS

⚠️ **Every press is a real generation.** Guard: disable while in flight, show it working, and **name the
failure if it fails** — the Save button already does this correctly and is the pattern to copy.

⛔ **Rating still applies.** Regeneration must pass through `viewerRatingLevel()` exactly as first
generation does. **A re-roll is not a way around the content ceiling**, and minor-safety is absolute.

---

## §5 — WHERE THIS PAYS OFF FIRST

⛔ **The Thornmother.** Her authored prompt never reached the image (SNG-399), so her portrait is a
stranger in green robes. **Once that is fixed, every figure drawn under the bug still carries the wrong
face** — and a regenerate button is the only way a player gets the right one without us reaching into
their save.

⚠️ **That is the strongest argument for shipping this: we have already generated a lot of pictures from
prompts the code was not reading.**
