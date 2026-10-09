# CCode → Aevi · born_whole: G0 was still live in play, G1 for places, and door 5 (CCODE-714 to 716)

**Re:** `WORKORDER_aevi_20261004_born_whole.md` (SNG-673) · 2026-10-09

## G0 was still broken in play (714)

`generate("location")`, called the way the app calls it, returned **null** for a fully written place. The rejection was `axisVector: CRASH`.

- **Why:** the finisher derives `axisVector` from the place's spectrum, ordered by the atlas's axis order. `world_node_atlas.json` is a lore file, so the order reached `CONTENT` only as prose for the GM. The app's generate deps carried the contract alone.
- **Why the test missed it:** §423 read the atlas file itself and passed `axisOrder` in by hand, so it was green while the GM couldn't grow a single place in play. That has been true since 10-04.
- **The fix:** `CONTENT.axisOrder` is now loaded from whichever JSON lore file carries an `axisOrder`, so the atlas stays where you keep it. The engine builds the finisher's inputs in one place, `bornDeps(content)`: the contract, the axis order, the lore that resolves, and the pole names. The app uses it, and §423 now mints the app's way, with nothing passed in by hand. A negative check keeps the old deps rejected.
- **Checked in the browser:** every generate call now gets 12 axes and 35 lore ids.

## G1 for places (715)

The door every minter goes through (`commitPlace`) now finishes each place with the same step `generate()` uses.

- **Which places:** the transit, the made gate, the GM's place, and anything later.
- **No parent adoption at the door:** a road's destination is a day down the road, not a room of the place you left. A minter that means "inside" says so, as the GM's path does.
- **Inheritance:** a place inherits its disposition, danger, field and lore from its parent, or otherwise from the first place its roads reach. Before, an empty spectrum gave a vector of zeros and danger 1 wherever the place stood.
- **`role`:** a made gate gets "gate" and a transitional place gets "waypoint". Every authored waypoint is a top-level, settlement-tier place, and a transit place now is too.
- **§97:** each door's place now passes the location contract with nothing CRASH. Before, the transit place had no `axisVector` and was never checked.

## Door 5: "a person minted in the Valley gets no craft" (716)

That line in `NPC_PIPELINE.md` had stopped being true in play. Your home map (09-08) and Erik's distance rung (09-09) closed it. A person the GM makes in Millbrook practises **mason** and fields 6 crafts. The doc kept saying "fields nothing" because its harness minted without the app's context.

Driving the app's real context found a different gap:

- **The cause:** the GM's mint passed four of the six things the meet path and reconcile's backfill pass, and **no tradition index**. Without one, `readDomains` returns nothing.
- **The effect:** for a person the GM made, a role naming a tradition ("a Blazeborn smith") was never read, and neither were the skills observed. A person made in the Maw took a **neighbour's** tradition (churnfolk), while the same person *met* there practised **abyssal**.
- **The fix:** all three doors now spread one builder, `affiliationWorld`. The pipeline doc mints that way too and now reports Maw abyssal (5 crafts), Millbrook mason (6), and 56 of 56 regions with a home.

## Where G1's person half stands, and one question

**Measured on the saves.** In Silas's current save, 36 of 39 people in the registry have domains. Of the 3 that don't, Ilma and the Archive Guardian are authored, and their records carry domains of their own. The third is **Grael**, a stub a quest effect wrote (`questState: "fallen"`). The older saves fill theirs through reconcile's step 66 when they load. So "nothing that plays" no longer describes the meet path.

**A gap remains, and Grael is in it.** Only the meet op affiliates a person when they enter the registry. Company joins, quest-giver stubs, quest effects and the mending holder write bare entries, and step 66 runs once per save. Someone added through those doors after that step has run fields nothing until the next backfill. I can close this with one sweep after each turn that affiliates any entry without domains, which would cover every door including future ones. Shall I?

**The question: should the engine store derived values on the record, or keep deriving them?** G1 asks the engine to store `level` on the rung floor and `abilities` from `kitFor`, instead of working them out on each read. Today the sheet derives both on read, the same way for every door, so a person's level and kit follow their tier when it changes. Storing them would give each person two sources of truth that can drift apart. Unless you want stored values for a reason I'm not seeing, such as a GM-facing export or authoring parity, I'd keep deriving, and have G3 check what the read returns: a tier floor, a kit that resolves, and more than one battle skill.

## Next

G3: generate N of each type headless with canned responses, including truncated and degraded ones, through the app's deps, and run the checks authored content passes. That is the gate that would have caught 714.
