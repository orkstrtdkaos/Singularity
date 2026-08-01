# SNG-252 — the unified encounter ribbon + Moves worked back in
## CCode · 2026-08-01 · complete_pending_review

Erik, from the Hard Ground screenshot: *"the hazard border doesn't seem to have the full border… I want
the ribbon to EXPAND and contain ALL the encounter content when engaged — not be split into two
sections… I really like the MOVES concept — work it back in and make it more robust."*

Built §2a (as a premise correction), §2b, §2c. Full `npm test` green; **verified live in the browser on
a never-used port across all five kinds.**

---

## §2a — the specced fix is a NO-OP, and that matters

The diagnosis was that hazard's `enc-frame-hazard` stone hue was *"missing or incomplete in style.css"*.
It is neither, and I checked every link in the chain before touching anything:

- the hue is defined — `style.css:123`, `--enc-hue: #6f7b8c`
- `.enc-frame` reads it for the border — `border: 1px solid var(--enc-hue, …)`
- `encounterKind` returns `"hazard"` for every `type: "challenge"`
- `frameModel` returns a full hazard frame (ran it headless against a real rockslide def)
- the render emits `enc-frame-${fm.kind}`, so the class lands

Nothing was added. A smoke check now asserts the hue exists, so this can't be "fixed" later by someone
re-reading the spec and adding a duplicate rule.

**The border was never partial — most of a hazard's content sat OUTSIDE it.** And hazard reads worst
precisely because it is the fast path: its frame is the slimmest, so the share of the encounter living
outside the box is the largest. §2b is the real fix for what Erik saw.

## §2b — one container

The moves panel was a sibling appended far down the play surface beside the input row, so an engaged
encounter was three fragments the player assembled by eye. Everything now renders inside one
`enc-frame`: header → subtitle → win → meter → receipt → exits → moves → freeform.

**The skill-battle panel goes in too — and finding that is why live verification earned its keep.** I
first left it outside, reasoning it was "the fight's own richer panel, not a shortcut list". Then I drove
a standoff in the browser and the ribbon rendered with **no actions in it at all**, every control in a
separate box below. Fight, chase, standoff and puzzle — the kinds Erik actually meets — would have
shipped exactly as split as before, on a ticket whose whole point was to unsplit them. It is nested, not
rebuilt.

Two consequences worth naming:
- **The ⚙ deliberately does not appear for a skill battle.** That panel is the fight's only action set,
  and a collapse control that hid it would leave the player standing in a fight with no visible way to
  act. "Collapse for space" must never read as "remove the controls".
- **The receipt persists** on encounter state so the ribbon shows where you stand; the floating copy now
  renders only once the encounter has ENDED, so the same readout is never both inside and outside the box.

## §2c — moves, enriched (extended, not rebuilt)

Kind-aware family ORDER from Aevi's emphasis lists (a hazard leads with KNOW, a fight with HARM), with
un-emphasised families kept rather than dropped — a kind-aware order that dropped families would hide
crafts the player owns. Consequence hints in the kind's own currency. Off-currency families marked but
still **clickable** (moves are shortcuts, never a cage). Warded moves disabled-with-reason instead of
offered-then-refused. Shown by default; picking a move no longer collapses the encounter you are still in.

**The ways out are RELABELLED from the frame, never rebuilt from it.** Hazard now reads "Turn back"
instead of the generic "Abandon". Rebuilding the buttons from `fm.exits` was the obvious move and the
wrong one: the frame's `defeat` exit is the PRIMARY move (Commit / Strike / Press / Work it), and its
`strike` action has no dispatcher case — so it would have filed "Push on" under *ways out* and wired a
dead button. Only the label is taken; the action stays the known-good `[data-encact]` value.

## Content note for Aevi

Your freeform line **replaces** the frame's own cue rather than wrapping it. Interpolating both produced
a doubled sentence ending *"…against the stage. — or pick a move above; …against the stage."* And the old
constant (`FRAME_FREEFORM_CUE`, encounterFrame.js:41) says the moves are **"below"**, which stopped being
true the moment they moved inside the ribbon. `{freeform}` is now filled only from a cue a kind actually
customised; today none do, so your line stands alone — and the leading capital is repairing my
placeholder removal, not editing your voice. If you'd rather `{freeform}` carry something, it needs a
short per-kind phrase; the old constant is not it.

## Verified live

Never-used port 8411 (per the cross-port cache lesson), all five kinds fired through the dev buttons:

| kind | frame class | panels outside ribbon | subtitle | actions |
|---|---|---|---|---|
| fight | `enc-frame-takeover enc-frame-fight` | 0 | yes | inside |
| chase | `enc-frame-takeover enc-frame-chase` | 0 | yes | inside |
| standoff | `enc-frame-standoff` | 0 | yes | inside |
| puzzle | `enc-frame-puzzle` | 0 | yes | inside |
| hazard | `enc-frame-hazard` | 0 | yes | inside |

Skill-battle controls confirmed still wired (live `onclick` handlers) after re-parenting.

## Open

1. **(Erik, OQ1)** Mobile height — the ribbon is now tall when engaged. Collapse moves under a count, or
   scroll within the ribbon? A see-it-built call, and it is now built.
2. **(Erik)** The input-row **⚙ Moves** gear is now redundant with the in-ribbon ⚙ — both toggle the same
   state. Removing one is a layout call, so I left both wired rather than choose.
3. **(§4, parked)** SNG-253 — the kind-native ACTION vocabulary. As Aevi predicted, 252's UI isolates it:
   with the ribbon and hints landed, the remaining fight-flavour is exactly `skill_battle.js:48`'s
   hardcoded opponent verbs ("a hard strike" / "a raised guard") on every kind. Ready to scope.
