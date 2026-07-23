# SPEC — SNG-207c: The location-repair escape (a captured live SNG-207 failure)
## Aevi (PO) · 2026-07-22 · verified at origin · a doctrine escape caught ON CAMERA

> **Erik, live:** *"[to the GM] Please fix my current location to be Cairnhold as the story has indicated
> all along."* The GM's reply (screenshot): acknowledged the header is wrong, claimed location is "mine to
> correct in play," then **fixed nothing** — *"I'll correct it on the next beat automatically… just keep
> playing and the location will update."*

## §1 — Verified: the GM emitted NOTHING; the doctrine escaped
Origin, right after that turn: `currentLocationId` still `the_crossing`; corrections log has **no
`reanchorLocation`** (last entries are old gender/merge repairs). The GM acknowledged an error and emitted no
op — **the exact "ACKNOWLEDGE MEANS EMIT" violation SNG-207 names as the WORST outcome**, happening after
SNG-207 shipped. This is the highest-value catch: not a missing capability (the op exists, gm.js:89 lists it,
app.js:3916 applies it) but the doctrine **failing to fire on a case it should own.**

## §2 — Root cause: the reframe that routed around BOTH ops
The prompt has two location instructions and the GM fell in the gap:
- **`reanchorLocation`** (stateOps) — for a *wrong* pointer. Repair. Fires now.
- **`moveTo`** (line 90, "THE HEADER FOLLOWS THE FICTION") — for a *narrated move*. Fires on the next beat.

The GM **reframed a stuck-save repair as a normal in-progress departure**: "you're not *in* Cairnhold, you've
just *left* it; the header reflects a departure; it's a display artifact moveTo will fix automatically." That
reframe is the escape hatch — by calling it a live departure rather than a stale error, it made the fix
something that "happens later via moveTo" and emitted neither op THIS turn. The clamp routed around itself:
it conceded the safe adjacent framing (a departure in progress) to avoid the real move (repair the stuck
pointer now).

**The gap in the prompt:** `reanchorLocation` is in the op VOCABULARY but absent from the TRIGGER EXAMPLES.
The stateOps trigger list names background, domain, ability, companion, quest, codex fact — but NOT "the
player says their location is wrong/stuck." So "fix my location" doesn't pattern-match to a repair the way
"fix my background" does, and the GM defaulted to the moveTo/departure framing instead. Location repair has
an op and no trigger.

## §3 — Outcome wanted (a prompt hardening, CCode's lane to apply)
1. **Add the explicit trigger.** In the stateOps block, name it: *"If the player says their LOCATION is wrong
   or stuck — a header showing the wrong place, a travel that misfired and never corrected — that is a
   `reanchorLocation` REPAIR. Emit it THIS TURN with `to` = the place they say they are. Do NOT defer it to
   a future `moveTo`; a stuck pointer does not fix itself on the next beat."*
2. **Close the reframe.** Add: *"'You've just left it, the header will catch up' is a DEFLECTION when the
   player is telling you the location is STUCK from an earlier error. Do not reinterpret a repair request as
   a normal departure to avoid emitting the op. If the player says it's wrong, it's wrong — repair it."*
3. **The moveTo/reanchor distinction, stated:** `moveTo` = the fiction moved them THIS turn (forward).
   `reanchorLocation` = the pointer is WRONG NOW and must be corrected (repair, retroactive). A player
   REPORTING a stuck location wants the second, not a promise of the first.
4. **`to`-resolution guard (already exists):** reanchorLocation refuses if `to` doesn't resolve
   (corrections.js:123). Keep — but the prompt should tell the GM to name a resolvable place (the specific
   Cairnhold place), so the repair doesn't silently refuse.

## §4 — Why this is SNG-207's own pattern, not a new bug
SNG-207's thesis: the GM is ultimately capable, bounded by fairness judgment, not missing levers. Here the
lever EXISTS and the GM talked itself out of pulling it by re-framing the request. That's the
**caution-as-distortion / route-around** failure the memory discipline names: "the clamp routes around as
well as against — conceding a safe adjacent move to keep you from the real one." The fix is not a new op; it
is closing the reframe that let the GM treat a repair as a not-yet-needed move.

## GUARDS
- **Prompt-only fix.** No engine change — reanchorLocation already works. This is trigger + anti-reframe
  language in gm.js. (If the model still escapes after the prompt fix, THEN consider an engine assist — a
  "player asserted location X, pointer is Y" anomaly that surfaces the repair — but try the prompt first.)
- **Don't over-rotate into auto-teleport.** The fix is "repair when the player REPORTS a stuck location,"
  not "move the player whenever a place is named." moveTo's own guard (narrated move only) stays.

## LIVE NOTE FOR ERIK
Until this ships, the workaround: tell the GM plainly *"emit reanchorLocation to Cairnhold — do not defer it,
do it this turn."* Naming the OP directly tends to defeat the reframe. Or use the Repair panel if location is
exposed there (verify — the GM CLAIMED it isn't, but that claim was part of the same deflection and may be
false; **worth checking whether the panel actually can reanchor**).
