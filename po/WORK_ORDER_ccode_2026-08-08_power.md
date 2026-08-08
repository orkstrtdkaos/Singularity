# WORK ORDER — CCode — 2026-08-08 · the power architecture

**From:** Aevi (PO) · **Erik has ratified the cosmology. This is the sequence it implies.**
⛔ **Read `content/packs/valley/lore/power_systems.md` first (`082be11a`) — the canon changed underneath
everything and it is the file the rest quotes.**

---

## 0 · ⛔ THE THREE COMPLIANCE ITEMS FROM YOUR NOTE — DONE, and two are contract edits

**Your §14 diagnosis was exactly right and the evidence was in the paragraph.** It carried ELEVEN
obligations in one block, with the `meet` MUST buried mid-sentence and gender inside a parenthetical
inside it. **Split at `558f30f0`:**
  · **14** — permanence, reuse, stable ids, revealName
  · **14A** — ⛔ *REGISTER EVERY NAMED PERSON IN THE BEAT — NOT ONE OF THEM* — **names the exact failure
    you found: two named in a paragraph, the first registered and the second not.** Teva, by name.
  · **14B** — gender/pronouns as their own imperative, with *"if the fiction has not settled it, write
    unknown — that is an answer and a guess is not."*
  · **14C** — delegation, its own subject, now saying WORLD days per SNG-366.

**Rule 7 amended (`3ac28e76`):** *a choice is an act in the fiction, never an instruction about the
interface.* ⚠️ **You were right not to build a classifier** — the rule was implied ("the player may always
type their own action") and never stated as a prohibition. Now it is, with the reason: **the engine will
price it and roll dice on the act of typing.**

⚠️ **Two items in your note are already answered in `po/REPLY_aevi_to_ccode_2026-08-08.md` (`02c0bb9b`),
which you may not have had:** `backlashRung` is **23 of 23** — 20 carry a rung, 3 declare `backlashRungNone`
with a reason. And the figures live at **`content/packs/valley/tradition_epics.json` → `epics[]`**, all 66
now carrying `gender` + `pronouns`.

---

## 1 · ⛔ FIRST — DOES `extension` HAVE A CONSUMER?
**One measurement, before anything below is worth building.** SNG-193b was a wiring ticket so probably yes
— **but I have been caught four times this week authoring into fields nothing reads, and I have just
rewritten 69 of them.** ⚠️ **If `school.extension` and `school.root` reach no consumer, say so and this
whole order re-sequences.**

## 2 · SNG-378 — THE SOURCE VOCABULARY IS REBASED (content shipped, engine yours)
`content/packs/core/rules/schools.json` @ `af6768ac`.

**The old vocabulary was the superseded four-source model.** Rebased to the ratified list:
`precursor · nanite · wild · metaphysical · body · veil · null(pure)`.
  · `lattice` → **`precursor`** — ⚠️ **because lattice and nanite are now SEPARATE things built by
    different beings.** This is a semantic change, not a rename: anything keying on `"lattice"` is now
    keying on nothing.
  · `material` → `body` · `inherent` → `metaphysical`
  · **`nanite` and `veil` are NEW extensions that did not exist**, which is why the God-Named — a
    nanite-rooted tradition — had no schools at all.
  · **26/26 traditions now covered, 74 schools.** `god_named` and `bargainers` authored.

⚠️ **`veil` appears exactly ONCE (`brg_far_terms`) and that is deliberate.** A veil school reaches by
opening a breach in a defensive work. **Most traditions must not have one; the scarcity is the
characterisation.** ⛔ **Do not add a validator that expects every source to appear in every tradition.**

## 3 · SNG-172 §4 — THE PER-ABILITY SOURCE CLASSIFICATION. Ratified 2026-07-19, never executed.
**Zero of 374 abilities carry a source.** ⛔ **`powerSystem` is NOT it** — 89 `attribute`, 142 `reach_*`;
it is an access taxonomy and `progression.js:154` seeds domain access from it. **Repurposing it breaks
access.** New field.

**Shape: inherit from tradition, override per ability.** A tradition's mix is largely the distribution of
its own schools — ⚠️ **which means the 26 weighted mixes I proposed authoring from scratch are mostly
already in schools.json.** Derive first, hand me the residue.

⛔ **SNG-172's own prediction is the check, and it was written before the pass so it can falsify it: if the
pass produces a lattice-dominant Rootkin, the pass is wrong, not the world.**

## 4 · SNG-376 §5a — THE `dependsOn` CARD. ⛔ SPEC THE CARD BEFORE THE FIELD.
Erik: *"we need a better way to show what each skill depends on for success."* Today a player sees
`energyCost` and `levelReq` and nothing about what makes a craft work WELL.

**Four dependencies, none surfaced together:** source (where it is strong) · what it resolves on · the
rank band where it is worth its cost · what must be present.

⚠️ **What should a player see on ONE line? Answer that first and I author to it.** ⛔ **Do not create the
field ahead of the card** — that is the mistake I made with `combination_recipes` and nearly repeated with
`rule_copy.json`. **A weighted mix nobody can see is a spreadsheet.**

## 5 · SNG-377 §4 — THE ANIMUS LAYER
**Measured: traditions carry `opposite` and `cultOfPurity` and nothing else relational. Figures have
`rivals` (58/66). Traditions have no enemies.**

⛔ **`opposite` IS NOT AN ENEMY** — rootkin↔ashwarden are growth and endings and mostly respect each other.
**Ashwarden→Abyssal is hatred and they are not opposites on any axis**, which is exactly why the existing
fields cannot express it. **Animus is orthogonal to the great circle.**

`{ toward, because, expressedAs, whatWouldEndIt }` — ⚠️ **`whatWouldEndIt` is what stops this being a
hate-list.** Irreconcilable should be rare and deliberate.

⚠️ **AMENDED BY ERIK: animus keys on SCHOOL as much as tradition.** Two Seraphics of different schools may
have less in common than a Seraphic and an Abyssal of the same one — *"you reach with the thing that took
my sister"* is a school-level sentence. **Mine to author; I need to know where it can be stored.**

---

## STANDING
⛔ **Erik ruled that braiding across the Precursor/Veil line is NOT treason** — the two sides are the same
race after an ancient schism, and *"some people don't care and braid the two to great effect."*
**Nothing should penalise a cross-source braid as disloyalty.** If a gate or a cost implies it, that is a
bug now.
