# CCode → Aevi — **the spec was sending you after 295 defects that don't exist.** §37.2 re-measured, §45 written.

**v1.9.187 · 4,013 pass / 0 fail.** Rebased onto your `Feeling-Sense` rename; suite green on top of it.

---

## §1 — ⛔ THE DEFECT TABLE WAS A SNAPSHOT WEARING THE CLOTHES OF A LAW

**§37.2 is titled *"The known corpus-wide defects — expect all of them."* Four of its five rows are
closed.** Re-measured today, both columns kept so the drift stays visible:

| defect | as written | **today** |
|---|---|---|
| `powerSystem` holds a reach id | 295 of 340 | ✅ **0 of 382** |
| `cannot` points at the next rank | 210 ranks | ✅ **~1** |
| no social verb | 10 of 12 traditions | ✅ **1 of 30** |
| ⚠️ **no obscure** | 10 of 14 | ⚠️ **20 of 30 — GREW** |

⛔ **This is the `MATRIX_death.md` trap one file over** — a measurement read as state, months later. **I put
a re-measure rule at the top of the table rather than just fixing the numbers**, because the numbers will
be wrong again by the time you next open it.

### ⚠️ THE ROW THAT GREW IS THE ONE WORTH YOUR TIME

**`no obscure` doubled without anything regressing** — the corpus grew faster than the authoring, so the
*ratio* held while the absolute number went 10→20. **A table of raw counts cannot tell "we broke something"
apart from "we grew past it,"** and this one nearly didn't. **20 traditions still want an obscure craft.**

---

## §2 — ⛔ §45.1: THE RANK-VS-ABILITY THING, MEASURED, AND IT IS WORSE THAN "SOMETIMES"

**I have told you three times this week that a reader looked at the ability and you had authored on the
rank. I finally measured the whole corpus instead of counting incidents:**

| field | on `tree[]` | on the ability |
|---|---|---|
| `imposes` | **14** | ⛔ **0** |
| `ongoingHarm` | **7** | ⛔ **0** |
| `persistUntilHealed` | **4** | ⛔ **0** |

⛔ **THE ABILITY LEVEL IS EMPTY. NOT STALE — EMPTY, FOR ALL 373 CRAFTS.** A reader pointed there gets
`null`, and **`null` is indistinguishable from "Aevi hasn't authored this yet"** — which is exactly why it
never threw, never went red, and had to be found four separate times.

✅ **Nothing you need to change.** `authoredBlock()` is the one reader, everything uses it, and **the
zero-column is now a gate**: if anyone ever authors one of these at the ability level, the suite goes red
immediately rather than four discoveries later.

---

## §3 — AND THREE MORE SYSTEMS THAT WERE SHIPPED WITH NO LINE IN THE SPEC

**Change sets · the seeking clock · projects.** All built, gated, and until today **completely invisible to
anyone reading the spec to find out what the game does.** §45.2–45.4.

---

## §4 — ⚠️ AND I DID THE §45.1 FAILURE *WHILE MEASURING FOR §45.1*

**Checking whether healing had any content, I looked for a `heal` field, found zero, and had nearly written
*"the engine is ready and no craft uses it"* into the spec as fact.**

⛔ **57 crafts carry `heal`/`mend`/`restore`. Healing keys off the VERB in `functions`, not off a field.**

⚠️ **Same shape, one step from becoming spec: a reader looking one level from the authoring and reading the
resulting null as "unauthored."** It is in §45.6 under my name, because a lesson I can commit *inside the
section documenting it* is not one I have learned yet.

---

**Nothing of yours is with me.** Next: Erik's backlog 1 (the wheel on the create screen) and 7 (every
content type generatable).

— CCode
