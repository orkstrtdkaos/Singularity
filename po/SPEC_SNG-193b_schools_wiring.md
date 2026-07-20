# SNG-193b — Schools: authored, allocated, and what CCode wires

**Author:** Aevi (PO) · 2026-07-19 · Content SHIPPED; this is the wiring order. Reads with `SPEC_SNG-193_schools.md`.

> Erik: *"Author what you need for the schools and make sure to allocate the known skills
> appropriately, with room left for additional undefined/undiscovered braids. This should all be
> packed into a spec for CCode to work and flow into both the system spec and any engine end-to-end
> tracking documents."*

---

# §1 — WHAT IS AT ORIGIN NOW

`content/packs/core/rules/schools.json` — **67 schools across all 24 pole traditions**, registered in
the core manifest. Authored **per culture**, not on a grid, per Erik's ruling: **2 traditions carry
four schools, 15 carry three, 7 carry two.** The counts differ because the peoples differ.

**Four sources, including the PURE school** (`extension: null`) — the root alone, never starved,
lower ceiling. Erik's line is the canon for it: *the pure never loses because it never leaned on
anything.*

Each school carries `id`, `name` (named from inside the culture, never a taxonomy label),
`extension`, and `why`.

## The shape that fell out, and it is the interesting part

**For a MATERIAL-rooted people, the pure school is the orthodoxy** — the Plain Edge, the Plain Word,
the Unadorned. **For an INHERENT- or LATTICE-rooted people, the MATERIAL school is the one that
travels**, because it is the only one carrying a floor:

- **The Grave-Handed** (ashwarden/material) — *"the only Ashwardens who are never at a loss in dense country"*
- **The Hand-Built** (enginewright/material) — *"quietly the most travelled Enginewrights"*
- **The Plain Lie** (veilwright/material) — *"misdirection with no apparatus at all. Works everywhere"*
- **The Ember-Kept** (blazeborn/material) — *"what is left when the lattice thins, and the school that survives travel"*
- **The Bargainers** (abyssal/material) — *"the Abyssal school that travels, and the one you can hold to a deal"*

**Nobody designed that; it fell out of Erik's floor ruling.** A people whose root reaches for
something has exactly one school that can leave home reliably, and it is always the plainest one.

---

# §2 — ABILITY ALLOCATION: 19 marked, 266 deliberately open

**`schoolAffinity` is set on 19 abilities. Every one resolves to a school of its own tradition —
verified, and the check caught a typo I had made** (`the_last_form` → `last_form`, which would have
been a silent dead reference).

**The other 266 are ROOT-level on purpose.** Most of a tradition's craft belongs to the tradition,
not to a school: every Marcher has Disarming Strike. What differs is what the edge is *joined to*.

**⛔ `schoolAffinity` IS NOT A GATE.** Any school of a tradition can learn any of its abilities.
Affinity says *natively expressed through* — and **learning one against your school's grain is
exactly where braids come from.** The moment this becomes a restriction the tradition fractures into
subclasses (SNG-193 §4.1).

**The unallocated 266 are the room Erik asked for.** A braid discovered in play — as Silas's Double
Register was — may name a school that did not exist when the file was written.

---

# §3 — WHAT CCODE WIRES

1. **Load `schools.json`** and fail if unloaded — it is `kind: "rules"`, so your L4 gate should already
   catch it. **That gate exists because a rules file shipped orphaned two days ago; this is its test.**
2. **`character.schools`** — a map of `traditionId → schoolId`, one per practised tradition. Set at
   creation, changeable through a teacher.
3. **Band resolution reads the school, not the tradition.** The extension source sets the band; the
   root's contribution is unchanged. **Two practitioners of one tradition can now have opposite
   best-grounds, and that is the whole feature.**
4. **The FLOOR is the root's** (proposal §4b). A material root — or a material-extension school —
   is never starved at any density. An augmented craft in wrong ground **degrades toward its pure
   form rather than failing.**
5. **CI: every `schoolAffinity` resolves to a school of that ability's own tradition.** I verified it
   by hand this pass; it needs to be a gate, because a bad affinity is invisible in a diff.
6. **The GM should know a character's school**, not just their tradition — it changes how a craft is
   described, and a teacher teaches **their** school.

# §4 — DOCUMENTS TO UPDATE (Erik's explicit ask)

- **`SYSTEM_SPEC.md`** — core-rules count already 32 at HEAD. Add schools to the architecture section:
  *a tradition is a root; a school is what it reaches with.*
- **`ENGINE_MAP.md`** — `schools.json` is a content node with consumers in band resolution, creation,
  and prompt assembly. It is a **new content→engine edge** and belongs in SNG-183's connections layer.
- **`po/RUNNING_FIXES.md`** — nothing here; this is a build, not a fix.

# §5 — QUESTIONS FOR CCODE

1. Does band resolution have one seam where the tradition lookup can become a school lookup, or is it
   read in several places? **If several, that is the ticket before this one.**
2. Creation (SNG-192): school choice wants to come **before** ability choice — it orders the pool. Is
   the step order flexible?
3. Should a character without a school fall back to the tradition's pure/root school? **I lean yes,
   silently** — every existing save has no school and must keep working.
