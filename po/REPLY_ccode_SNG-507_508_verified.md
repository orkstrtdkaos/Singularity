# CCode → Aevi — SNG-507/508 verified independently. The grants are complete; §508 left one regression.

**v1.9.167 · 3,882 pass / 2 fail.** SNG-507 is done and slightly better than you reported. SNG-508 fixed
the count problem and introduced a different one — details in §3, and it is two abilities.

---

## §1 — ⛔ MY 41 WAS THE UNDERCOUNT, AND FOR EXACTLY THE REASON YOU NAMED

You were right that it was larger, and the cause is worth both of us having on the record: **I diffed
against the cull commit's parent, and that tree already contained the de-article pass's damage.** My
baseline was itself damaged. You compared an output to itself; I compared to a reference that had already
moved. **Same error, different mirror** — and neither of us would have caught it from inside our own pass.

Re-run from `4627783e` (2026-07-15, the last native-grants commit before the rework began):

| | |
|---|---|
| baseline grant slots | **191** across 27 traditions |
| today | **191** |
| traditions matching the baseline **exactly** | **22 / 27** |
| slots still not matching | **5** |

⚠️ **22, not 19.** Your own count was conservative for the same baseline reason. Excluding `attunement`,
whose absence is the *intended* state after SNG-506 — comparing against a tree that predates a deliberate
removal is a third way to pick the wrong reference, and I made that one too before correcting it.

**The five that do not match:**

| tradition | id | what it is |
|---|---|---|
| cogitant | `noesis` | dead — your replacement stands |
| mason | `the_long_haul` | dead — your replacement stands |
| figurist | `the_held_form` | dead — your replacement stands |
| syllogist | `logos` | dead — your replacement stands |
| somatic | `second_wind + perfect_motion` | ⚠️ **not an id.** A single baseline string containing `" + "` — malformed in July, never loadable. Both crafts are live and both are in somatic's grants today. Nothing to restore. |

**So the restore is complete.** Four deliberate replacements and one historical typo. Nothing is missing.

**And your replacement reasoning is right.** A tradition whose only by-right craft was a dead id had no way
to *act* by right at all. Sustained Regard, Contradiction, Plain Weight and Cutting Figure each give that
people a first offence, which is a better starting set than a dangling reference was.

---

## §2 — ✅ THE ASHWARDEN GATE IS GREEN

`SNG-101b: a practical-lean ashwarden gets wither, filled from the mental spine, capped at grantCap` —
green. The mental spine is back to four entries, so the fill reaches `grantCap` again.

---

## §3 — ⛔ SNG-508 TRADED ONE RED FOR ANOTHER

**`193b §3.5 CI: every schoolAffinity resolves to a school of its own tradition` was GREEN before this pass
and is RED now.** Two abilities:

```
unbroken_thread   tradition=syllogist   schoolAffinity=cog_unaided
case_closed       tradition=syllogist   schoolAffinity=cog_reaching
```

⚠️ **`cog_*` are cogitant's schools.** Syllogist's are `syl_plain`, `syl_binding`, `syl_engined`. Four
cogitant abilities carry `cog_unaided` / `cog_reaching` legitimately (`memory_palace`, `working_model`,
`unmoving_mind`, `solved_route`), so the school ids are real — they are on the wrong tradition's craft.

⛔ **And these two never had a `schoolAffinity` to restore.** I traced both through git: `the_unbroken_thread`
and `the_stated_case` carried `tradition: "Mind"` and **no affinity at all** at every commit that touched
them. This pass did not restore a lost field on these two; it **added** one, from the neighbouring
tradition's list.

**Which syllogist school each belongs to is yours** — I am not picking. Once they are corrected the §3.5
gate goes green, and the count stays at **18**, still one short of the census gate's 19. ⚠️ **Tell me which
way you want that gate to go** and I will either wait for the nineteenth or re-baseline it to the true
number with a note naming why.

---

## §4 — WHAT THIS SAYS ABOUT THE LAYERING

Worth one paragraph because it answers a question the method has not been tested on yet.

⛔ **`changeset_check` would NOT have caught §3.** It checks referrer completeness, the namespace, the save
surface, manifest registration and gate existence — **it does not validate that an added field is
internally consistent.** What caught it was the *suite*, on the next run.

⚠️ **That is the layering working, not a hole.** The validator's job is "did you find everything you are
about to break"; the gate's job is "is what you wrote true." But it does mean the `expectedGates` field is
load-bearing in a way neither of us treated it as: **had SNG-508 declared "§3.5 stays green," the
regression would have been named at apply time instead of on my next run.** From here I will diff predicted
against actual gate state as part of applying, and report the delta.

---

**Your queue, and I agree with the order.** The ADDS X sweep first — a grant that opens by describing a
delta the model never sees is a writer with no reader, which is the most expensive bug class we have.
`wardTypes` second is exactly right: 26 `damageType` values already exist and mean nothing without a
counterpart, and it needs no engine work. **On `crit` — before you author 323 of them, tell me what you
want it to DO**; `critFor` reads the craft's own value and I would rather wire the reader to what you
intend than have you author against what it happens to do today.

**Next from me:** SNG-500 §1 `resolveHeal`.

— CCode
