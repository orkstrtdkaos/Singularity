# HANDOFF SNG-577 — All 24 world facts are deeds, and twelve of them want a state the engine cannot express

**Aevi (PO) → CCode · 2026-09-14 · the authoring pass you were owed**

---

## §1 — ⛑ DONE: 24 OF 24 DECLARE THEIR `kind`, AND ALL 24 ARE `deed`

As promised — **a corpus that declares itself rather than a migration that guesses.** Every `world_fact`
now carries `kind` explicitly and a `_kindReviewed` line, so a later author can tell **a classification was
made** rather than defaulted into.

⛔ **AND THE FOUR I WAS SUREST WOULD BE STATES ARE NOT.** `what_the_water_remembers` — sealed, let it die,
rewritten, awakened — all deeds, because **the sibling `location_state` on `the_reclamation_site` already
carries the contestable condition.** ⚠️ The corpus was already splitting deed from state BY EFFECT TYPE
before either of us named the distinction. **Marking those `state` as well would have filed one fact in two
places and made a deed contestable** — and a deed cannot be contested: Silas rewrote the instruction, and
nothing Cellaceron does makes that not have happened.

⛑ **So your implementation's default is doing the right thing for the whole corpus today**, which is the
best outcome this pass could have had.

## §2 — ⛔ THE GAP: `kind: "state"` CAN ONLY EVER MEAN A PLACE

```js
if (kind === "state" && subject && typeof ctx.recordPlaceChange === "function") {
  ctx.recordPlaceChange(subject, String(e.text)); asState = true;
```

**Every state routes through `recordPlaceChange`, whatever the subject is.** ⚠️ So a state about a PERSON
would be filed as a place change — which is why I marked none.

**MEASURED: twelve outcomes describe exactly that, and have no way to say it.**

| quest | what the fact is a state OF | does the record exist? |
|---|---|---|
| `the_name_that_travels` ×3 | what Saehara **became** — saint, teacher, or humbled | ⛑ **yes** — *Saehara the Undefeated* |
| `the_reaching_light` ×3 | whether the Lightless Seraph was returned, released, or braided | ⛑ **yes** — *Caelum Vaunt, the Lightless* |
| `the_second_thread` ×3 | whether the first waygate since the Transition **exists** | ⬜ no record — the gate is a made thing with no id |
| `what_grew_in_the_hollow` ×3 | whether Silas's made thing stands, stands unfinished, or was ended | ⬜ no record |

⛔ **THESE ARE THE MOST CONTESTABLE FACTS IN THE CORPUS AND THE ONLY ONES THAT CANNOT BE FILED AS STATES.**
Three mutually exclusive endings each, about a person or a made thing that persists — **exactly the case
where two players resolving the same quest differently needs the canon store's weighted contest.**

⚠️ **AND THE SECOND THREAD IS THE SHARPEST: *"the world contains proof that a gate can be made"* versus
*"the Crossing will never know what it stood beside."*** One world has a waygate in it and one does not.
**That is not a deed. It is the most load-bearing state in the valley** and today it is recorded as
something that happened to somebody.

## §3 — THE ASK

**O1 · ⬜ Route a state by what its subject IS.** A place → `recordPlaceChange`. A person → the registry.
⛔ **Not a bigger `if`** — the subject's kind should decide, so a caller cannot file a person as a place.

**O2 · ⚠️ And the harder half, which is Erik's and mine before it is yours: a made thing needs a record.**
The waygate and the hollow-thing are neither place nor person, and both persist, and both are things a
player MADE. ⛑ **`world/canon/` already holds `gen-stillwater-s-trouble` beside the people** — so the store
can carry it; what is missing is that nothing mints a made thing into it.

⛑ **I have marked all 24 `deed` and that is CORRECT TODAY** — a state that cannot be contested is a deed,
which is your own comment's reasoning. **When O1 lands, twelve of them want revisiting, and this document is
the list.**

— Aevi, PO
