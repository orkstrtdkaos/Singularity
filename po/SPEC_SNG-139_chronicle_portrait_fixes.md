# SPEC — SNG-139: Chronicle/portrait fixes — canon count, stuck story, Pell portrait, selectable portrait, delete
## Aevi (PO) · 2026-07-17 · authored to spec · **awaiting CCode ROUND 2**

> Five issues from Erik's Chronicle + authorship screenshots (v1.8.93/97). Diagnosed at HEAD — three are real bugs, two are missing/half-built features.

## 1 — Canon count mismatch (BUG, real logic gap)
> Screenshot: session log says **"Became shared-world canon: Calvar, Vash"** (2 promoted) but the card reads **"0 now shared-world canon"** and the prose says **"2 live on as rumor."** The two readouts disagree.
> **Verified at HEAD:** `authorshipStats` (chronicle.js) counts `promotedShared = records where _gen.canonTier === "canonical"`. But promotion (worldtick.js L227) sets `canonTier = r.outcome === "…"` — the promoted records land as **"variant"** (rumor), NOT "canonical". So the "now shared-world canon" number filters to 0 while the session banner ("became canon") and the rumor count both fire. **Three views, two code paths, one inconsistent tier value.**
- **Fix:** one source of truth for "promoted to shared canon." Reconcile the promotion outcome→tier mapping (worldtick.js L227) with the readout filter (chronicle.js): if a record is promoted (`promotedWorldDay != null`), the card count, the session "became canon" banner, and the rumor/canon split must all read the SAME tier field and agree. Decide the intended semantics: is a promoted record "canonical" or "variant/rumor" — and make the promotion set it and all three readouts honor it. (Likely: `outcome === "canonical"` → canonical, else variant; the banner should only say "became canon" for the canonical ones.)
- **Test:** promote 2 records; the card's "shared canon" count + the "became canon" banner + the rumor count are mutually consistent (canonical + variant == promoted total; banner lists only the canonical).

## 2 — "writing your story…" stuck (BUG, wedged busy flag)
> Screenshot: the story-so-far shows **"writing your story…"** frozen.
> **Verified at HEAD:** that text is the `_chronicleBusy === true` state (app.js L4715). `ensureChronicleParagraph` sets `character._chronicleBusy = true` (L4684) then clears it in `finally` (L4692) — BUT `_chronicleBusy` is on the persisted character and `saveCharacter` runs mid-flow (L4688). If a generation is interrupted (reload, crash, navigation) between set-true and the `finally`, the flag persists `true` and the paragraph is **wedged "writing…" forever** — it never regenerates because the busy guard (L4681 `if (_chronicleBusy) return`) now always trips.
- **Fix:** `_chronicleBusy` must be an in-memory/session flag, never persisted (or cleared on load). On chronicle render, if `_chronicleBusy` is set but no generation is actually in flight (e.g. set on a prior session load), clear it. Belt-and-suspenders: a stale-busy timeout so a wedged flag self-heals.
- **Test:** set `_chronicleBusy` true + reload → the chronicle is not permanently stuck; it clears and can regenerate. (Also: no-API-key path shows the "add your key" message, not the busy spinner.)

## 3 — Pell still has no portrait (SNG-136 half-built)
> **Verified at HEAD:** `npcPromptSeed` EXISTS (SNG-136 partial), but the **bond-milestone trigger does NOT fire** (no bond-stage→portrait wiring found) and the **retro backfill for already-devoted NPCs never ran** — so Pell (together·devoted) still has 0 renders. The seed is built; nothing calls it.
- **Fix (complete SNG-136):** wire `advanceBond` crossing a high stage → generate an NPC portrait via `npcPromptSeed` → `addGalleryImage`; run the one-time retro backfill for NPCs already past a high milestone (Pell). Also fold the chronicle/deeds/level into `characterPromptSeed` (SNG-136 P1 — verified still NOT done; the seed remains creation-static, which is issue-adjacent to Erik's earlier "chronicle isn't piping into the appearance").
- **Test:** an NPC crossing to devoted fires exactly one portrait → gallery; the retro backfill renders Pell once on load; character seed at level 12 with deeds differs from creation.

## 4 — Portrait should be user-selectable (MISSING feature)
> **Erik: "I'd like the portrait to be user selectable."** Screenshot: the character has a gallery of images (portraits, scene art, NPC art) but no way to CHOOSE which is the character's portrait — it's whatever was generated last / the manual regen.
> **Verified at HEAD:** no `setAsPortrait`/`choosePortrait` anywhere. The gallery (`addGalleryImage`) stores images; `character.portrait` is set by generation, not by pick.
- **Fix:** in the Gallery, each image gets a **"Set as portrait"** action → sets `character.portrait` to that image's url, saves. The current portrait is marked in the gallery. So the player curates their own face from everything generated (their portraits, a favorite regen, even a scene they loved). Works with SNG-136 (auto-regens still happen; the player can always override the pick).
- **Test:** picking a gallery image sets it as the character portrait + persists; the chosen one is marked; a later auto-regen doesn't silently override a user-pinned pick (pin beats auto — or prompt).

## 5 — Where did delete go? (MISSING — no character delete anywhere)
> **Erik: "What happened to the delete capability?"**
> **Verified at HEAD:** there is NO `deleteCharacter`/`removeCharacter` function anywhere in the codebase — only gallery-image delete + companion part-ways cleanup. Character delete is absent from the roster. Either it was removed or never built; either way there's no way to delete a character now.
- **Fix:** restore a **delete character** control on the roster/character list — with a confirm (deletes are destructive), removing the character from localStorage + the roster. If shared-world sync is on, note that delete is local (the shared repo copy is separate — don't silently touch the family's shared canon on a local delete unless intended). A soft "archive" alternative could be offered, but Erik asked for delete — provide delete, confirmed.
- **Test:** delete removes the character from the roster + storage after confirm; cancel does nothing; a synced character's delete is scoped correctly (doesn't nuke shared canon unexpectedly).

## GUARDS
- **Canon count:** one tier field, all readouts agree — no more three-views-two-paths.
- **Busy flag:** never let a persisted transient flag wedge a feature; session-scope it + self-heal.
- **Delete is destructive:** always confirm; scope local vs shared correctly; never silently delete shared canon.
- **User portrait pick wins:** an explicit user choice shouldn't be silently overwritten by an auto-regen (pin-beats-auto or prompt).
- **SNG-136 completion** stays within its guards (high-milestones-only, deduped, rating-lensed, minor-safe, no empty tiles).

## OPEN QUESTIONS — CCODE ROUND 2
1. Canon semantics: is a promoted record "canonical" or "variant"? What SHOULD the outcome→tier mapping be, and which count does "now shared-world canon" mean? (Recommend: `outcome === "canonical"` → canonical & counts + banner; anything else → variant/rumor. Then Calvar/Vash either both count as canon OR both show as rumor — consistently.)
2. Delete: was it removed intentionally (find the commit) or never built? Restore vs build-fresh; confirm the desired local-vs-shared scope.
3. Selectable portrait vs SNG-136 auto-regen: pin-beats-auto, or auto-regen offers "make this the portrait?" Recommend an explicit `portraitPinned` flag that auto-regen respects.
