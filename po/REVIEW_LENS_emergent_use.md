# Review lens — the emergent use, not the authored one

**Raised by Erik, 2026-07-18, during the SNG-147c per-rank pass. Applies to the reverse pass.**

## The defect

Through the first ~230 abilities I assigned `functions` and `harmRung` by reading what each
ability's prose says it is FOR. That is the authored use. Players do not play the authored use —
they play the effective one, and they find it fast.

`thin_place` is the case that exposed it. Authored as contemplative: perceive where the world is
thin, hold a threshold open, open one where there was none. Tagged `harmRung: none`.

But the danger was already canon in two places. `thin_place` r2 holds a way open "long enough to
pass a thing through". `numen_sense` r2 feels where "something is pressing BACK". So: open the
way, point the thing that answers at a person, and it does what it does.

That is a scary, violent, effective use of a peaceful-sounding ability — and with `harmRung: none`
it would have sailed straight past the SNG-145 intent gate. **An ability's rung must cover what a
player will actually do with it, not what the author had in mind.**

## The lens — ask on every ability in the reverse pass

1. **What is the obvious violent use?** Not the clever one — the first one a player thinks of.
   If it exists and the rung doesn't cover it, the rung is wrong.
2. **What does this ability let through, open, or set in motion that then acts on its own?**
   Anything with `summon`, `open`, `make`, or `transform` can produce a harm the wielder never
   directly performs. The gate still needs to ask.
3. **Does the cost make the dangerous use expensive, or merely undocumented?** An unpriced
   dangerous use is a balance hole; a priced one is a good decision the player gets to make.
4. **Is the danger appropriate?** Usually yes. Dangerous abilities are good. The rule is not
   "remove it" — it is "declare it, price it, and let the gate ask."

## Applied to thin_place

`harmRung` now `none → damaging → lethal`, and `strike` added at r3. Rank 2 states that holding a
way open where something presses back "is an invitation it will take, and it arrives on its own
terms rather than yours". Rank 3 states the whole of it, including that you cannot choose what
answers, cannot call it off, and it does not leave:

> "it is here now, in a place that had no reason to be thin, and it knows exactly who opened the
> way. The Numinous Reach does not forbid this. It simply keeps a list of everyone who has done it."

## Sweep candidates for the reverse pass

Abilities carrying `summon` / `open` / `make` / `transform` at `harmRung: none` — each needs the
lens applied: `the_called_form`, `the_walking_figure`, `the_raised_form`, `waygate`,
`the_false_door`, `the_shadow_work`, `the_made_truth`, `the_open_material`, `the_edge_of_the_map`,
`the_built_way`, `the_descent_path`, `glass_work`, `the_made_elegy`.

Also: every ability whose rung I set from prose alone before this lens existed — which is all of
them through Mechanical/Spiritual.

---

## QUALIFICATION — when notFor names a sibling, it is a boundary, not over-constraint

**Added 2026-07-18 after Erik caught `wither` and `the_grey_hand` collapsing into each other.**

Both lenses push the same direction: widen the prose, cover the emergent use, do not be timid.
Applied without limit they will dissolve exactly the distinctions the corpus was built on.

The case: `wither` and `the_grey_hand` are the Palework pair. Wither ages and rots THINGS; the Grey
Hand takes vigour out of PEOPLE. Wither's r1 says "anything living or once-living", which I read as
including a person — so I added `strike` and wrote it a living-body harm.

I was wrong, and the file said so twice before I touched it:

> description: "The Grey Hand handles people; Wither handles everything else."
> notFor: "Weakening living people — that is The Grey Hand."

A `notFor` that **names another ability** is not overly-constrained text awaiting a loosening. It is
a deliberate division of labour, and honouring it is what keeps two abilities from becoming one.

### The discriminator

- `notFor` describes a **limit in the world** ("cannot work in darkness", "not against the unarmoured")
  → over-constraint is possible; the emergent-use lens applies; widen if a tag points past it.
- `notFor` **names a sibling ability or assigns the case elsewhere** ("that is The Grey Hand",
  "that's Latticework's job", "that is Noesis")
  → distinctness boundary. Do NOT widen across it. If the tag genuinely wants that ground, the right
  move is to ask which of the two abilities should own it — not to give it to both.

### Fix applied

`wither` reverted to `[break, hinder]`, rungs `none → damaging → damaging`, and both abilities now
state the boundary from their own side so the next reader cannot miss it. Wither's cost line keeps
the honest edge without crossing: starving a valley "is a harm done to people without the craft ever
touching one."

