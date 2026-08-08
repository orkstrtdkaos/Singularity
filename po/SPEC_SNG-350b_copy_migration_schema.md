# SNG-350 step 3 — the copy migration: schema, protocol, and why the file does not exist yet

**Author:** Aevi (PO) · **Date:** 2026-08-07 · **Origin:** CCode's inventory — **54 strings**
**Status:** spec_ready · **Blocked on nothing; sequenced deliberately (see §4)**

---

## §0 — CCODE'S METHODOLOGY NOTE IS THE MORE VALUABLE HALF OF THAT REPORT

> *"The first pass read 69, and its single highest-confidence finding was one of my own SNG-154 notes. An
> inventory that counts the notes explaining a defect as instances of it is worse than none, because the
> number looks authoritative."*

⚠️ **That is the same failure I committed today with the 83% bond figure, arriving from the opposite
direction.** He had a tool producing a number that looked measured and was inflated; I had an inference
I wrote in the register of measurement. **Both produce an authoritative-looking number that nothing
supports, and in both cases the other party would reasonably have built on it.** His three corrections
before publishing is the right discipline and I want it recorded next to my failure, not instead of it.

⚠️ **I attempted my own count and got 14.** His tooling survived three corrections; mine is a first pass
of the kind his first pass was. **His 54 is the authority. I am not re-deriving it.**

---

## §1 — HIS GROUPING IS THE SCHEMA. He did the design and did not call it that.

> *"Grouped by the rules file whose change would falsify each string, since that's the migration order:
> energy 14, emergence 13, sub_attribute_ladder 8, standing 5, leveling 5, skill_capacity 5, companions 4,
> resolution 3, martial_paths 1."*

⛔ **`falsifiedBy` is the field that makes this gateable, and it is the entire point of the exercise.** My
§1c coupling test asked *"could this string become false if a rules file changed, untouched?"* — that
question has an ANSWER per string, and he just computed all 54 of them. Store the answer.

```json
{
  "id": "energy.rest_restores",
  "surface": "the rest panel",
  "text": "Rest restores — breather +{breather} ({hours}h) · meal +{meal} · sleep …",
  "falsifiedBy": ["energy"],
  "reads": ["energy.breather", "energy.meal", "energy.sleep"]
}
```

⚠️ **`reads` is the sharper version of `falsifiedBy`** — naming the specific keys, not just the file, so a
change to `energy.meal` flags 3 strings rather than all 14. **Author `falsifiedBy` for all 54; add `reads`
where the string names a specific value.** Coarse and shipped beats precise and pending.

**The gate this enables:** when a rules file changes, every string claiming it is flagged for re-review.
⛔ **The gate cannot verify the copy is TRUE — no gate can.** It can only guarantee that a rule change
never lands without a human looking at the sentences that describe it. **That is the whole of what went
wrong with the five "points deepen crafts" strings: the rule changed and nobody was told to look.**

---

## §2 — ⛔ THE FILE DOES NOT EXIST YET, AND THAT IS DELIBERATE

I am **not** shipping `rule_copy.json` in this ticket.

Authoring a content file before its consumer exists is the exact defect I filed SNG-353 about, warned
about in SNG-359 §3 (*"do not add `backlash` to the contract before §2a lands"*), and then committed
anyway in SNG-362 by authoring four braids into a file nothing reads. **Three warnings and one relapse in
one day. The file arrives when `app.js` reads it, not before.**

---

## §3 — THE HANDOFF, and it plays to each side's tooling

**CCode emits the inventory as data** — `po/staged_content/rule_copy_inventory.json`, one row per string:

```json
{ "line": 423, "text": "<verbatim>", "falsifiedBy": ["energy"], "surface": "<enclosing function or panel>" }
```

⚠️ **`surface` matters more than `line`** — line numbers rot on the next edit; "the rest panel" survives.

**Then I author from it.** ⚠️ **This is not a mechanical port and should not be batched as one.** These
strings were written to fit a line of code and they read like it. Half of them will be rewritten as they
move, and a few will turn out to be wrong on the way — **`the_broken_quiet`'s "at capacity" line was
correct-looking prose describing a rule that had been dead for weeks, and it took reading it slowly to
see.** Expect the migration to produce defect findings, not just relocations.

**Then CCode wires the reader and deletes the inlines** — in the same change, so there is never a window
where both exist and they can silently disagree.

---

## §4 — SEQUENCE, and I am putting this behind the live work

**Energy (14) first** — largest group, most player-facing, and `energy.json` is stable, so the strings can
be trusted to stay true while the pattern is proven on them.

⚠️ **`sub_attribute_ladder` (8) LAST, and Erik should know why:** that file changed twice today (the
rank-1-2 baseline fix, and the roll column still gated on the harness). **Migrating copy that describes a
rule still in motion means writing it twice.** The ladder's strings stay inline and stale until the roll
column is ratified.

**Emergence (13) — ⛔ ERIK RULED 2026-08-07: KEEP THEM VAGUE, and use the migration to PROTECT that.**
Copy that explains discovery mechanics tells the player what to fish for, which converts discovery into a
checklist. **Move them into the pack like the rest — but carry `deliberatelyVague: true` on each.** The
drift-gate still flags them when the underlying rule changes, and a future editor is told plainly not to
sharpen them. ⚠️ **The migration becomes the thing that DEFENDS the vagueness rather than the thing that
erodes it** — which is the opposite of what a copy-cleanup pass normally does, and is the point.

---

## §5 — OUT OF SCOPE

- The 54 strings themselves — CCode's list, my authoring, per §3.
- Any gate on copy TRUTH. Only re-review-on-change is mechanisable.
