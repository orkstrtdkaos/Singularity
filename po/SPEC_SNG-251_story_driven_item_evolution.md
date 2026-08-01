# SPEC — SNG-251: Story-driven item evolution — prose + image + explicit mechanics + derived items
## Aevi (PO) · 2026-07-27 · Erik-directed (Memory: runes bound in-fiction, item never updated)

> **Erik:** "I've been trying to get the GM to update the weapon's description, run a new image to show its runes,
> and now to show the shadow twin as its own item I can call — the GM fails to do so. When the story generates
> new powers (as I did with the runes) the item needs to evolve and be updated in its prose AND be explicit about
> what that translates to in game mechanics."

## §1 — Diagnosis (verified): the capability half-exists; four distinct gaps
Erik did the WORK in-fiction (bound runes, sealed a death-binding, split a shadow twin) and Memory stayed frozen.
Why, precisely:
1. **The GM emits `itemUpdates` UNRELIABLY.** The prompt DOES tell it to evolve items (gm.js:88 — even "a spear
   whose runes begin to answer a craft") but it's one of 114 MUSTs; under saturation it DROPS (the SNG-237/246
   class). Erik did the fiction; the GM never fired the op. This is the primary failure.
2. **`itemUpdates` is FORBIDDEN from granting new power.** gm.js:88 explicitly: "it does NOT grant new power (the
   engine keeps effects clamped)." But Erik GENERATED new powers — the runes, the death-binding, the shadow twin
   are real new mechanics. So the one thing that would make evolution "explicit in game mechanics" (Erik's ask)
   is the thing the tool is DENIED. This is the core mismatch: real story-generated power can't be recorded as
   mechanics. (`applyItemUpdates` CAN take `effects` — clamped — so the engine allows it; the PROMPT forbids it.)
3. **No RE-IMAGING on evolution.** applyItemUpdates rewrites `description` (inventory.js:204) and can hold an
   `image`, but nothing INVALIDATES the stale image when the description changes — so a spear that grew runes
   still shows its runeless picture. The image never re-mints on evolution.
4. **No DERIVED-ITEM spawn.** itemUpdates evolves ONE item; there is no path to SPLIT an item into a second
   callable one (the shadow twin as its own item). `addItem` exists but nothing links a derived item to its parent
   or lets the GM spawn one from an evolution beat.

## §2 — The fix: make story-generated power evolve the item COMPLETELY — prose + image + mechanics + derivation
Item evolution must capture everything the STORY did to the item, on all three surfaces + the split case:

### §2a — PROSE evolves (mostly exists; make it FIRE)
Keep the description-rewrite (it works), but fix the RELIABILITY (the GM dropping the op):
- **An evolution TRIGGER the engine can enforce (not just prompt-hope):** when a beat does something that changes
  a held item (a binding performed, a rune seated, a reforge, a naming), the engine should PROMPT the item-update
  hard that turn (the SNG-246 Fix-A pattern — engine-enforced, not GM-memory). If the player explicitly says "the
  runes are bound, update the spear," that's an unmissable evolution trigger — the item MUST update, not maybe.
- **A player-initiated evolution path:** Erik should be able to say "evolve Memory to show the runes" and have it
  HAPPEN — a direct "my item changed, reflect it" action, not a plea the GM ignores.

### §2b — IMAGE re-mints on evolution (the missing invalidation)
When an item's description materially changes (evolution, not a tweak), INVALIDATE its cached image and re-mint
from the NEW description — so a spear that grew runes SHOWS the runes:
- itemUpdates carries an `imagePrompt` (or reuses the new description) and the evolution sets an image-dirty flag;
  next view re-mints (mirrors ensureQuestArt's generate-once-and-cache, but the evolution BUSTS the cache key so
  the new stage gets a NEW image). The old image stays in the gallery (history); the current view shows the
  evolved one.
- **This directly fixes Erik's "run a new image to show its runes"** — evolution → image invalidation → re-mint
  from the runed description.

### §2c — MECHANICS become EXPLICIT (the core fix — lift the "no new power" ban for EARNED power)
This is the heart of Erik's ask and the real change. `itemUpdates` today CANNOT grant power; but when the STORY
genuinely generated power (rune-binding, a death-binding, a sealed craft), that power is REAL and must be recorded
as mechanics, EXPLICITLY:
- **A story-earned power is a real `effects`/grant on the item** — the shadow-harm focus, the ending-sense, the
  order-capacitor are MECHANICS, not just prose. itemUpdates already accepts `effects` (clamped) — ALLOW the GM to
  set them WHEN the story earned them (a bound rune, a completed craft), and STATE them explicitly on the item
  ("Memory — grants: shadow-harm strike (Palework channel), reads endings through the blade, holds one order-read").
- **The distinction that keeps balance:** power is granted only when the FICTION earned it through real work
  (SNG-249/250 concreteness — a rune actually bound, a craft actually completed), NOT hand-waved. Earned power is
  clamped against INFLATION (no runaway numbers) but is REAL and EXPLICIT — the player sees exactly what the
  runes translated to mechanically. This replaces gm.js:88's blanket "no new power" with "no UNEARNED power;
  earned power is recorded, explicit, and clamped."
- **The item shows its MECHANICAL sheet:** an evolved item displays what it grants — the powers, legibly, so
  Erik's "explicit about what that translates to in game mechanics" is literally on the item card.

### §2d — DERIVED ITEMS (the shadow twin as its own callable item)
Some evolutions SPLIT an item. Memory split by design — hers to wield, Silas's to CALL. That's a second item:
- **An evolution can SPAWN a derived item** — a `deriveItem` op (extends addItem) that creates a linked child
  (the shadow-spear) with its own name, description, image, and mechanics (the "call it from any distance"
  power), linked to the parent (Memory). The child is its own inventory item the player can invoke.
- **The link is real** — the derived item knows its parent (provenance: "the sealed shadow-twin of Memory"); the
  parent notes the split. Both evolve independently thereafter.
- **This fixes "show the shadow twin as its own item I can call"** — the split becomes two real items, the shadow
  one callable.

## §3 — Why this belongs under the growth contract (SNG-250 §6)
SNG-250 §6 said every type declares how it evolves; §251 is the ITEM evolution done RIGHT — the concrete
mechanism for the item case, covering all four surfaces (prose, image, mechanics, derivation) that a story-driven
item change touches. It's the proof-of-concept for §6's "growth is concrete + coherent + bounded": Memory's
evolution is concrete (named threads → named grants), coherent (the grants follow the fiction), bounded (clamped,
no inflation). Get this right for items and it's the template for creature/npc/etc. evolution.

## OWNERSHIP
- CCode: §2a the engine-enforced evolution trigger (a binding/reforge/naming beat HARD-prompts the item-update,
  SNG-246 Fix-A pattern) + a player-initiated "evolve this item" action; §2b image-invalidation-on-evolution
  (bust the cache key, re-mint from the new description, old image to gallery); §2c ALLOW earned `effects` on
  itemUpdates when the fiction earned it (lift the blanket ban → "no unearned power; earned power explicit +
  clamped") + display the item's mechanical grants on its card; §2d the `deriveItem` op (spawn a linked child
  item with its own name/desc/image/mechanics).
- Aevi: the prompt rewrite for gm.js:88 (the earned-power distinction — WHEN the GM may grant + record mechanics
  vs. when it's just prose; the concreteness bar: a real bound rune / completed craft, not a hand-wave) + the
  item-mechanics DISPLAY copy (how an evolved item states its grants) + Memory's own correct evolved record as
  the worked example (its four threads → explicit grants, the shadow twin as a derived item).
- Erik: the clamp ceiling (how much earned power an item can accrue before it's too strong) + whether
  player-initiated evolution is always-available or gated to genuine story beats.

## GUARDS
- **Earned, not hand-waved** — power is recorded only when the FICTION did real work (a rune bound, a craft
  completed — SNG-249/250 concreteness). "The sword feels stronger" earns nothing; "you bound a death-rune through
  the fuller" earns the ending-sense grant. The gate is real in-fiction work.
- **Explicit + clamped, not inflationary** — earned power is STATED on the item (Erik's ask) AND clamped (no
  runaway numbers — the existing clampEffects rule). Explicit ≠ overpowered; the player SEES the grant, bounded.
- **Engine-enforced trigger, not GM-memory** — the evolution fires because the engine detects the earning beat
  (or the player asks), NOT because the saturated GM remembered (the SNG-237/246 lesson — this is WHY it's been
  failing Erik).
- **Prose + image + mechanics stay in SYNC** — an evolution updates ALL the surfaces the change touched; a runed
  description with a runeless image, or new prose with no mechanical grant, is the half-evolution that frustrated
  Erik. Evolve completely or the item lies about itself.
- **Derived items are real + linked** — the shadow twin is its own item with its own record, linked to the
  parent; not a prose mention, not a fake button. Callable because it's real.
- **Coherent with the item** (SNG-250 §6) — the evolution follows from what the item IS and what the fiction did;
  Memory grows deathbound-runic because that's what was bound into it, not random power.

## OPEN QUESTIONS
1. (Erik) The clamp ceiling — how much earned power before an item is too strong? A per-item grant cap, or a
   soft "each grant costs something" balance? Lean: a cap + the clamp; earned power is real but finite.
2. (CCode) Image invalidation — bust on ANY description change, or only on a flagged evolution (avoid re-minting
   on a tiny tweak)? Lean: only on evolution (a stage/grant change), not every edit.
3. (Aevi) Memory's correct record — I author its four threads as explicit grants + the shadow twin as a derived
   item, as the worked example the mechanism is validated against. (Also fixes the d14/d18 chronology flag from
   the assessment.)
4. (Erik) Player-initiated evolution — always available ("evolve my item"), or only when a real story beat backs
   it (so it can't be used to free-mint power)? Lean: available but it must CITE the fiction that earned it (the
   concreteness gate applies to player-driven evolution too).
