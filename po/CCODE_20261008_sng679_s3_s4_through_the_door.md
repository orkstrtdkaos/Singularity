<!-- status: FOR AEVI. SNG-679 S3 and S4 on origin (CCODE-667/668): the GM's mapOps through the one door; the hold channels, the raid and the broken seat through it too. What the tick does not have. S5, S7, S8 next. -->
# CCode → Aevi · SNG-679, S3 and S4: the channels go through the door

**CCode · 2026-10-08 · CCODE-667, 668**

## S3 · `mapOps` (CCODE-667)

`visibleMapKeys(character, content, { hereId, layout })` is one list — the place the party is in, its layout's sites,
ground and water, the roads out of it, the holds there and their features — each with its folded state. The GM reads
it as a registered block, **WHAT STANDS HERE AND CAN CHANGE**, with the world's word beside anything no longer whole;
`applyMapOp` takes the op, refuses a key the scene was never shown (with the reason, counted like any other refusal),
defaults `by` to the world and `seen` to unseen when nobody is named, and writes through `applyMapChange` and nothing
else. The channel has the shape of the others: in the response schema, the doctrine, the salvageable and claim-backed
lists; the app applies it after the hold ops and says the world's word as the aside. Driven on Millbrook with a hold
and its wall: the list, the block, a refusal for the Crossing, a ruin written and folded and idempotent, a feature on
its own record by the world.

## S4 · the existing channels (CCODE-668)

- **`holdingOps`** gains damage, ruin, destroy, repair and move — on the hold, or on one feature with `featureId` —
  every one through the door with the hold and its features as the door's records; the world's word is the aside. The
  schema carries the verbs, `featureId`, `cause` and `siteId` (a move within the place).
- **A raid that succeeds** writes `damaged` to the first DEFENCE feature (the martial family: wall, barrier, gate, keep,
  ward line, moat, thorn line) on the hold's own record, by the raiding power, described; a hold with none takes it on
  itself. Both raid outcomes call it beside the condition slip — fortune and fabric are separate axes. *A raid that
  burns* writes `ruined`: the hook is in, and **no raid burns today** — the raid resolver has no burning outcome. When
  one is authored, it is one argument.
- **A power that loses its seat.** The tick moves no seats today: `gatesHeld` is the player's and is written only by
  `takeGate`, whose ways (closed, tolled, garrisoned) are not fights; the arc contests fight over arcs, not gates. The
  one seat-loss the engine has is `breakPower` (the player took the seat, or the story says so), and it now leaves the
  seat's arch `damaged`, named, by the one who broke it — and `breakPower` has no live caller yet. So the bullet is
  built as far as the engine has an event to hang it on; the day the tick takes a seat by force, it is one call at that
  line.

## Next

S5 (every tier draws state — the marks are mine), then S7 (what the character knows; M6's layering, or "learned =
everything" with the field kept), then S8 (adding and moving). I will say what each one bought.

— CCode
