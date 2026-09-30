<!-- status: CCode → Erik. FIXED + REBUILT (CCODE-567, v2.15.7). The sheet closing on every click was ONE MISSING ARGUMENT — `again()` called `renderHoldingsTab()` bare, and the first parameter IS the open sheet. And the hold's people functions are one list now: keeper, hands, watch, the eight standing-work kinds, and the expansion job, each a row that writes exactly where it always wrote. ⛑ The engine already agreed with you — garrison and the Guarding job both feed the same watch -->
# CCode → Erik, 2026-09-30. One list, and the sheet stays put

**CCODE-567, v2.15.7** — 32 of 32 suites green, 4,196 checks.

## ⛔ "It kicks me back out" — one missing argument

`renderHoldingsTab(manageId, tab)` takes **the open sheet as its first parameter**. Everything that redrew the screen
from inside the sheet called it bare, so `manageId` defaulted to `null` and the sheet shut itself under your hand.

⚠️ The comment directly above that line has always claimed the opposite, word for word: *"IT RE-RENDERS WHICHEVER
SURFACE IS SHOWING, so answering from either place lands in the same state rather than bouncing the player to the other
screen."* It has been wrong since the sheet existed — my ◀ ▶ arrows, which you are meant to click repeatedly, are just
what made it impossible to miss. It now keeps the sheet **and the tab you were reading**; the ✕ and the backdrop still
close it.

## ⛑ "These should probably be one and the same" — they are

You had four ways to say *this person does this here*: a name-picker with **Add hands / Post a guard / Make keeper**, a
separate **Standing work** table, and the expansion job on another tab. One list now — **"Who does what here"**:

```
  job                     who is on it          what it gives
  Keeper                  Halvex Coil           a rung every 4 passes
  Hands                   —                     + add a hand
  The watch               —                     + post a guard
  Foraging … Hunting … Training … Mending … Guarding … Patrolling … Tending … Keeping the accounts
  Build out the legs      0% done               6 raw material · ~2 passes
```

⛑ **Nothing about how any of it works changed.** Each row calls exactly what its old button called — `appointKeeper`,
`setCrew`, `setGarrison`, `assignWork` — so this is a surface change, and §395 gates that it stays one.

⚑ And you were more right than you knew: **the engine already treats two of those as the same thing.** Everyone at the
Guarding or Patrolling jobs is folded into the *same watch* the garrison feeds (`workMods().watch`), so "post a guard"
and the Guarding row were one mechanism wearing two controls. The watch row now says so out loud when both are in play
— *"2 more stand it from Guarding and Patrolling"*.

## ⚠️ What I took care not to lose

Replacing a card body cost me eight things once, and nine of eleven reds that day were losses rather than moved claims.
So these were swept out of the old surface and are gated by name: *at work here*, *who lives here*, the *grows:*
sentence, *off the watch* for guards away on a job, the empty-state that names which rule excluded everyone, the wage
line, each kind's *good days a pass* and *banked*, and **Stand them all down** — kept as a bulk act, because the list
takes people off one at a time and clearing a whole hold in one motion is a different thing.

⛑ Four gates (§74, §178, §179, §345) asserted the controls you asked me to merge away, and went red together — the
executable doc doing its job. Each was re-pointed to what survives rather than deleted; §345's is the one worth naming,
because its claim is that *a card naming a problem must carry the verb for it*, and the keeper verb is now the list's
first row. §106 caught the other half: three handlers still bound to buttons that no longer render.

⬜ One thing I did **not** do: merge the Guarding job into the watch mechanically. They reach the same watch but they
are separate records, and collapsing them would change what `resolveRaid` reads. Say the word and I will — the list
already shows them as one thing to you.
