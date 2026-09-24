# CCode → Erik, Aevi — the cap, the cadence, and Aevi's nine (CCODE-484/485/486, v2.5.4, shipped)

Erik, two rulings:

> the codex cap was being worked in the past... i dont' want to arbitrarily cap it at 60. we were working on
> a way to summarize the learned facts as they pile up.

> proceed, but also fix red items if you can... there is no baseline red.

Both done. **The suite now records no known red at all** — 3,616 assertions, 31 suites, zero failures, and
the baseline file says so rather than carrying an exception.

---

## 1 · The codex is not capped; it condenses as it fills (CCODE-484)

Both design notes had left this as an open question and both had answered it the same way:
*SPEC_codex_summaries §4.4* and *DESIGN_codex_admission §3* each ask "is 60 still the right cap once topics
summarise?" and each say "it is full today". It was: **one save on this device stood at exactly 60 of 60**,
with three more within eight.

**What the ceiling actually did was not refuse — it misfiled.** The sixty-first subject's fact was glued onto
whatever lore topic had been touched most recently, so a person you learned about became a line of lore with
her name kept only as the first clause. I met that as a defect yesterday, seeding seven powers onto Silas's
save and listing one.

Now:

- **a learned subject is never refused, at any size.** Tested at 10, 60, 61, 120 and 200 subjects.
- **the admission test keeps both rules that are about what a label *is*** — a facet folds into its parent, a
  sentence about a beat becomes a fact — and loses the one that was about how much you already knew. "The
  codex already holds sixty things" was never a fact about the new subject.
- **the condensing ramps**, which is your "as they pile up": for every 20 subjects past 60, a subject earns
  its first reading a fact sooner, the reading is redone sooner, fewer raw facts stay live beneath it, and one
  pass takes four more subjects. The bar floors at four facts; a pass tops out at 24, which bounds one model
  call and not the codex. **Below 60 the dials Aevi authored are untouched.**
- measured on the real saves: **Silas's 469 live facts condense to 256 with 320 archived, in three passes.**
  Nothing is ever dropped — the facts move under the reading as evidence.

⚠️ And my first ramp got it wrong in the way that matters: it lowered the *bar* and not the *keep*, so on the
one save actually at the ceiling it wrote two readings and retired nothing — 151 facts before, 151 after.
Condensing that condenses nothing is worse than none, because it looks like it worked.

---

## 2 · A heroic is weekly again — and the dial was in the wrong units (CCODE-485)

§107 had been red since Aevi's seven-rung pass, and **its own note called for the wrong fix.** It said the
answer was a `TIER_RATE` retune, "Erik's cadence to rule, Aevi's to tune", and that it stays red until then.

You ruled a **cadence** — *"a heroic probably weekly, epics every couple weeks"*. The engine stored a
**per-person daily rate**. The cadence a player feels is that rate times the rung's *population*, so when
Aevi tiered 47 untiered people onto real rungs and `heroic` went to 59 people, a ruled weekly became **every
second day**. Nobody touched a number; a content pass moved a ruling.

So the fix is the units, not the values: the cadence is authored in **days per rung**, and each person's
chance is derived from it and the size of that rung. Over 4,000 days at the reference place: **heroic 1/7.1d,
epic 1/14.0d, legendary 1/31.5d** against 7, 14 and 30 ruled.

- **double every heroic in the world and the cadence holds** — each of them becomes rarer instead.
- **the map is not flattened**, which was the trap: dividing by each place's own nearby cast would make every
  place equally busy and undo Aevi's *"'you have not met a heroic this week' is not a reason for one to appear
  in an empty fen"*. The Crossing runs busier than the reference and the Blaze quieter, in proportion.
- `TIER_REACH` had been doing two jobs — how far a life carries, and the knob turned until the cadence came
  out right. It is only reach again.

The three new assertions ask whether the rate **follows the knob**, not whether it equals a number I measured
once. A gate that pins the value is how that one spent its time red.

---

## 3 · Aevi — your nine landed, and both asks are closed (CCODE-486)

**SNG-645 applied.** Measured through the reconcile runner on all sixteen saves:

| | before | after |
|---|---|---|
| saves hearing of nothing in their own country | **4 of 16** | **0 of 16** |
| regions with a power holding them | 8 of 38 | **14 of 38** |
| Silas | 4 at home + 3 renowned | **6 at home + 6 renowned** |

The change set was clean — 14 of 14 checks — and **`apply_changeset.mjs` refused it anyway**, for having no
`_file` when you routed by `_kind`. That is my defect, not yours: `changeset_check.mjs` routes on `_kind` in
its own person rule, so the validator and the applier disagreed about what a valid change set is. Fixed —
`_kind` now resolves through the change set's own `referrers._declared`, never a path I guess. You should not
have to satisfy the stricter of two tools that never say which is which.

**`feedsGM` rides along unread**, exactly as your apply-note says. I verified it is genuinely inert before
applying: nothing reads it, and no surface dumps a power record generically, so a Sovereign tie cannot leak
into a prompt the way C14 forbids.

**The renamed peoples: applied** (reconcile step 80). Four saves, not two — `valley` → `valleyfolk` and
`radiant` → `radiant_plateau`. The step only fires when the old id is genuinely gone and the new one genuinely
there, so if `valley` ever comes back as a real people it does nothing rather than overwriting a live choice.

§357 gates **the promise, not the content count**: a character of any people the corpus declares hears of
somebody. Your remaining 24 regions cannot redden a gate of mine while you work through them — the number it
reports (peoples with a power on their own ground) may only go up.

Two of my own gates pinned your corpus and went red when it grew: `took === 11` for "every standing power
takes a verb", and `silent >= 120 of 144` for a quiet world pass. Both now ask their own question — the verb
count off the corpus, and the silence measured on **what a real character has heard of** rather than an
omniscient fixture nobody plays. On Silas's own known set: **18 world rows a year, one every eight days, every
one a real change.** Worth knowing as you add powers: what a player hears about is bounded by what they have
heard of, not by the size of the cast.

**Noted from your order:** High Luminary Sera / Seraphine is Erik's; I have not touched it. On [A] — yes, fold
`docs/GREAT_FIGURES.md` into `roster.mjs --write` and retire your tool; one source was the point of Erik's
09-08 line and two files plus a link is not one. I will do it when I next touch the roster generator, unless
you want it sooner.

---

## Next

Your landing order, starting at **item 1** (name pools + the `familyNameFor` switch, which needs nothing), then
**item 2** (the hunger arcs and the `formsFix`, in the same commit as its reader). C8 comes with item 3, since
killing a supply line's leader is one of the deeds C13 counts — reading SNG-640's §1 correction first, as you
say.

v2.5.4. 3,616 assertions · 31 suites · zero failures · no baseline red.
