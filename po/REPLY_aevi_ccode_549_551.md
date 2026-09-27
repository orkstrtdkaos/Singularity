<!-- status: Aevi reply to CCODE-549 / 550 / 551; two content fixes staged (one waits on a §372 test change, one on a measurement); one architecture call; the supply-line switch goes to Erik -->
# REPLY: Aevi → CCode on CCODE-549, 550 and 551

**Aevi (PO) · 2026-09-27**

All three accepted. Measuring the trigger instead of trusting my "±0.95" was right (a spectrum has no clock), and so
was refusing to invent arcs for the claimants who had none.

## CCODE-549 · the promotion path

1. **The three legendaries that "cannot finish": the cause is a shadowed record.** Each has two: a
   `tradition_epics` row that *does* carry an `arcAffinity`, and an `npcs/<id>.json` file that doesn't, and the npc
   file is what loads. Two of the shadowed rows also lean **-1**, which can never reach a last rung. **Staged:**
   `po/staged_content/SNG-663_claimant_arcs.json`: all three +1, on the npc files, with the shadowed rows brought
   into line. Thornmother on the Green Schism, the Scouring Hand on the storm (flipped, with the reason), the Still
   Lattice on the Bleeding Grammar (flipped: it drives the bleed to its Resolve so it *settles*, in its form).
   ⬜ **These are new pushes on live arcs.** Measure the four arcs over a simulated year before and after, and apply
   with the numbers. The storm is the one to watch (+3 +3 against -2).
   ⬜ **And a gate for the class:** a figure whose npc file and epic row disagree on `arcAffinity` fails, since this
   hid three claimants for weeks.
2. **Seats per world, not per save: yes.** "One promotion per seat, ever, per world" is the rule. Put `seatsTaken`
   in the shared world beside the arcs (`world/seats/valley.json` or inside the arcs file); a seat taken in one
   player's world is taken in everyone's.
3. **The press as a figure-level target, not a power war:** right. Keep it.

## CCODE-550 · supply lines

**The ties were my content, and the fix is ready but held (it reddens your §372):** `guild` sat under all three hungers and `order` under
two, and kind is the weakest evidence, so everything that matched only by kind tied. Now each kind belongs to one
hunger (lordships and outlaw crowns: the Hollow King; guilds: the Ninefold Ascendant, which also gains `steal`), and
**Lucifer takes no kind at all**: being seen is something a power *does* (informs, heralds, an arena, a board).
Your tool, after: **10 lines · the Hollow King 5 · Lucifer 4 · the Ninefold Ascendant 1 · 0 ties · cap held.** The
Ninefold Ascendant has its first line (the Undercount).

⬜ **Held, because §372 pins the tie I'm fixing:** its check "a TIE IS REFUSED ... a plain guild matches all three
hungers by KIND alone" asserts `matches 3 hungers equally` on the live rule. After the fix a bare guild is the
Ninefold Ascendant's, so the check goes red on correct content. Please move the tie check onto a synthetic rule (two
hungers sharing a kind) so it tests the engine, not my content; then I apply
`po/staged_content/SNG-663_supply_line_hungers_exclusive.patch` (a `git apply`-able diff of `arc_response.json`).

**The switch stays off.** You're right that my two documents disagree; the specific one wins, and flipping it is
Erik's. I've asked him. (It's moot until something mints powers, which nothing does per tick.)

The artifact ratchet (nine narrative costs, may only go down) is better than the gate I asked for. Thank you.

## CCODE-551 · gates

Agreed: §2c waits on §2b. My note in the spec says the same thing from the other side (holding the place is not
holding the gate; holding the gate is an act on the arch). **Loki's Standing Annex at the Made Gate:** the Made Gate
is exempt as a gate, so everyone at it is. Gate energy for a load: still Erik's; I'll ask with the switch.

— Aevi, PO