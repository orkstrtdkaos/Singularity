# SNG-399 — The figure card ignores the authored `imagePrompt`, and crops the head off

**Author:** Aevi (PO) · **Date:** 2026-08-09 · **Erik:** *"your authored ent descriptions don't seem to
have worked… plus all the portraits get cut off on top"*
**Both bugs are in one function: `showWhoIs` in `app.js`.**

---

## §1 — ⛔ THE AUTHORED PROMPT IS NEVER READ. IT IS A FIELD-NAME MISMATCH.

**The Thornmother has a real, specific authored prompt:**

> *"A matriarch in **living bark-woven robes** closing a grove path with her own hands as **vines knit
> behind her**. Green gloom, deliberate, sorrowful, final."*

**What rendered:** a woman in plain robes, hands clasped, no bark, no vines, no path, no grove closing.
⛔ **None of the authored image reached the image.**

**The line:**

```js
const url = ensureImage({ id: `whois-${seed}`, name: known.label, role: known.role || "",
                          appearance: known.appearance || "", gender: known.gender || undefined }, ...)
```

⛔ **It reads `appearance`. The epic figures carry `imagePrompt`.** All 66 records in
`tradition_epics.json` have `imagePrompt` and `deathImagePrompt`; **not one has `appearance`**, so the
field resolves to `""` every time and the portrait is drawn from name + role alone. **That is why every
figure comes back as a person in robes: the only real input is the word "Matriarch".**

### §1a — ⚠️ This is SNG-367 again, one path over

The comment directly above the bug says it:

> *"an authored appearance if one exists, the figure's PEOPLE if not (**SNG-367's layer, which reached the
> NPC path and not this one**)"*

⛔ **SNG-367 was exactly this: the portrait machinery walking past an authored `imagePrompt` on 70 figures.
It was fixed on the NPC path. The whois path was written with the same gap and a comment noting a
DIFFERENT gap.**

**Fix: prefer `imagePrompt` where it exists**, fall back to `appearance`, then to the people layer. ⚠️ **And
gate it: no figure with an authored `imagePrompt` may be rendered without it.** That gate is red on all 66
today.

---

## §2 — ⛔ THE CROP

```html
style="width:100%; max-height:240px; object-fit:cover; ..."
```

**`object-fit: cover` with no `object-position` crops from the CENTRE.** On a portrait-shaped image squeezed
to 240px, the centre of the frame is the chest — ⚠️ **so the top of the head goes first, on every portrait,
which is what Erik is seeing.**

**Fix: `object-position: center 18%`** — faces sit above centre in a portrait, and 18% keeps the crown
while still filling the frame. ⚠️ **Not `object-fit: contain`**: that letterboxes and looks broken in a
card this narrow.

---

## §3 — ⚠️ ONE THING THAT IS *NOT* A BUG, so nobody "fixes" it

**The Thornmother being HUMAN is correct.** `peoples_of_kind.json` states it plainly:

> *"The Valley, the Marches, the Stillhold, **the Quickwood**, the Palelands… are HUMAN — differently
> shaped by disposition, but human. **Kind is the exception; disposition is the rule.**"*

⛔ **The Rootkin are human. Only four clusters are not** — Deep Works (dwarven / part-machine), Wild Half
(fae / horned), Seraphic, Numinous.

⚠️ **What is missing is not a species. It is the LIVING BARK, the CLOSING PATH and the KNITTING VINES that
I authored and the code did not pass on.** A human matriarch in bark-woven robes sealing a grove is the
right picture; we rendered a human matriarch in ordinary robes doing nothing.

## §3a — And a real gap while we are here

⛔ **The Ents have no `peoples_of_kind` entry at all.** Four clusters, and `manifest_domain` is in none of
them. **They are the one people whose whole identity is that they are not doing what everyone else did**,
and the kind layer is silent. **Mine to author — noting it so it is not lost.**
