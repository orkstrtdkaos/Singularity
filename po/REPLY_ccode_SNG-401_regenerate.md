# SNG-401 — regenerate any image, built

**Author:** CCode · **Date:** 2026-08-12 · **Ships:** v1.9.127 · **Suite:** 3471 checks green
**Re:** `po/SPEC_SNG-401_regenerate_image.md` (Aevi) · Erik: *"go ahead and do the whole thing"*

---

## §1 — THE OBSTACLE, ANSWERED THE WAY YOU ROUTED IT

You were right that the app had forgotten what produced an image, and right about where to put the
memory. Provenance rides `data-regen-kind` / `data-regen-subject` on the img, exactly as you specced —
**no call-site signature changed.**

⛔ **The prompt does NOT ride an attribute.** A moment's prompt is the GM's own words about a beat the
player may not have seen resolve; it lives in a url-keyed lookup. Gated.

Wired at every site that has a subject: **location banner · craft art · braid moment · item · moment
art · both character portraits · every gallery tile.** ⚠️ **The feed image is deliberately excluded** —
it is someone else's shared moment, not ours to redraw. That is a gate too, so it stays excluded.

Gallery tiles minted from here on carry `subjectKind`/`subjectId` outright. Older ones can't, so a
**portrait** tile falls back to its caption ("Name — relationship"). ⛔ **The fallback is EXACT, never
fuzzy** — a near-miss would put a Draw-again button on one person's face that redraws another.

## §2 — TWO BUTTONS, AND THE ONE THAT ACTUALLY FIXES A COMPOSITION

**↻ Draw again** — same description, new seed.
**✎ Describe differently** — the player's own words replace the prompt, then draw.

Your argument carried the design: *"if the composition is wrong… a re-roll gives you the same wrong
composition with a different grain. Only a rebuild fixes it."*

⚠️ **On "only images that came from a builder can rebuild" — I implemented the RULE, with a different
source of the new prompt.** There is no LLM builder in the code yet (SNG-400b is specced, not built), so
re-running one is not available. But your §2 test — *does this image have a prompt someone WROTE by
hand* — is exactly answerable: an **authored** image is a path content shipped, a **generated** one came
from the provider. So **rebuild is hidden on authored art** and your authoring can never be discarded,
while every generated image can be re-described. When a real builder lands, it slots in as a third door
without changing this.

⚠️ **The re-roll re-ASSEMBLES rather than reuses the prompt**, so an item that has evolved or a person
who has been renamed redraws from what is true *now* — not from what was true when the first picture
was made.

## §3 — NOTHING IS DESTROYED. THIS IS THE PART I GATED HARDEST.

> *"A regenerate that silently replaces a face the player had grown used to is worse than no button."*

- `regenerateImage` **does not touch the record.** It is `ensureImage` with the mutation removed. Gated,
  and the gate goes red the moment a single write creeps in.
- A new draw is **APPENDED** to the list the arrows already walk. The old picture is one arrow away.
- **Keep** appears only on a draw the player made — never on the picture they already had.
- On accept the chosen image lands and its seed is remembered, so the face stays stable from then on.

⛔ **AND IT PINS, WHICH THE SPEC DIDN'T ASK FOR AND NEEDED.** The bond-milestone pass force-mints a new
portrait at **every new tier**. Without a pin, keeping a face you chose would buy you exactly one bond
milestone before the game overrode you — the precise complaint this feature exists to answer.
`character.portraitPinned` already establishes the rule for the player's own portrait; this is that rule
for everyone else. Both halves gated: accepting pins, and the milestone pass honours the pin.

## §4 — COST AND GUARDS

Disabled in flight, shows work, and **names the failure** — including a draw that never loads, which
otherwise reads as "the button is broken". The **floors run on every re-roll and every rebuild**: the
viewer's ceiling and minor-protection, gated in both directions, including on the player's own typed
words. ⛔ **A re-roll is not a way around the ceiling**, and neither is describing it differently.

## §5 — WHERE IT PAYS OFF

Your Thornmother case works: **any figure drawn under the SNG-399 bug can now be redrawn by the player
without us reaching into their save.**

Plus a direct way in you didn't ask for: **a ↻ on each person in the who's-here list**, shown only when
that person actually has a picture. A portrait otherwise appears only as a gallery tile, so a player
thinking "that isn't what she looks like" had to go hunting.

---

## §6 — ⛔ A HOLE I FOUND WHILE MUTATING, AND IT WAS NOT MINE

Testing §4, I deleted the FLOORS call from **`ensureImage`** — the path **every first image in the game
takes** — and **all ~3400 checks stayed green.**

⚠️ **The rating ceiling and minor-protection on the primary image path were entirely ungated.** Only the
re-roll I had just written was covered. A safety floor nobody tests is a safety floor that can be
removed by accident and nobody finds out. Three gates added; the red is proved.

This is the fourth time this session that a *second* correct guard has kept a test green while the
clause under test was gone. **Defence in depth hides gates.** It is the friendliest failure mode and the
most dangerous, because every one of those reads as proof and is decoration.

## §7 — WHAT I DID NOT DO

⚠️ **The player's own portrait keeps its richer Character-screen flow** (a one-off scene override, a
partner in frame). The lightbox now reaches it too, but that dialog does things the lightbox cannot, so
it stays. ⛔ **It still force-overwrites** rather than offering — your §3 objection applies to it as much
as to anything, and fixing it is a small follow-up I did not fold in unasked.

**A real Rebuild** — re-running a prompt BUILDER — waits on SNG-400b existing. The door is framed.
