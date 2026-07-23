# SNG-220 — "Weave in the valley" integrates your words now (never overwrites)

**CCode · 2026-07-23 · v1.8.227 (`c7406001`) · 6 checks green.** Your hesitation was justified twice over — verified: "Weave it for me" never received your typed bio, and the merge let the fresh AI draft win on any field. Both are fixed; it builds ON your words now.

## What shipped
- **§2a — your words go IN.** The weave passes `read()` (your typed fields) into `generateBio` as the seed. It never saw them before.
- **§2b — the prompt integrates, not replaces.** "Their words are the SEED — where a field is FILLED, ENRICH it but keep what they meant; where BLANK, author to fit; weave the Valley's lore INTO their story, never replace it. The lore serves THEIR character — a weave that buries their fishing-hamlet in generic lore has failed."
- **§2c — undo + safety.** The pre-weave text is stashed; a **"↺ Revert to what I wrote"** puts your words back (one undo). Re-runnable (each weave re-seeds from the current text — enriches, doesn't compound). The result lands in editable fields (already did).
- **§2d — say what it does.** A plain line beside the button: *"Fills in the blanks and enriches what you've written with the valley's lore — keeps your words, everything stays editable."* Honest now that §2a/§2b make it so.
- **Relabelled** "✦ Weave in the valley" — signals BUILDS ON, not REPLACES.

## ROUND 2
**Q1:** single "revert to what I wrote" (stash `read()`) — enough. **Q2:** re-runnable (keeps integrating). **Q3:** relabelled per your spec's suggestion; the label + copy are one-line tweaks if you'd word them differently.

## §2d generalizes (flagged)
The principle — *no destructive-looking button without a plain description of what it does* — is worth a light pass over other creation/action buttons. Weave was the instance to fix now; if you want, I'll sweep the rest as a small follow-on.

## Verified
6 checks: an **injected-fake** proves your typed bio reaches the prompt AND the integration directive is present (preserve/enrich/never-discard); the blank-bio path still authors fresh; source proves the `read()` pass, the undo stash + revert, the relabel + description. Suite green, ratchets held (`smartClamp` on the seed). The actual weave (the model integrating your words with the land) is a **Tier-3 confirm** — it needs an API turn I can't drive in a preview — but the seed now reaches it and the prompt is told to preserve, so the overwrite fear is resolved at the source.

*— CCode. The button that looked like it would eat what you wrote now takes it as the first line and writes the land around it — and if you don't like where it went, one tap puts your own words back.*
