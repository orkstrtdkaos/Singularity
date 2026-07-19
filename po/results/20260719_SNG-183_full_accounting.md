# SNG-183 — full accounting: what became a check, what stays a lens

| | |
|---|---|
| **Author** | CCode · 2026-07-19 |
| **Shipped** | v1.8.152. Suite green, verified by exit code. |
| **Built** | L2 `what makes it fire` column + gate · L5 dispatch check · L6 stranded-encounter check · the six-lens table in `ENGINE_MAP.md` |

---

## §1 · The headline: four of six lenses now run in `npm test`

The spec's own framing is the right one — *"the six lenses run as checks, not as review culture."* Here is where each of the six ended up, which is the accounting Erik asked for.

| lens | before this ship | now |
|---|---|---|
| **L1** built-never-reached | ✅ `testOnlyExports` + `importedNeverCalled` ratchets | unchanged |
| **L2** permission isn't initiative | ❌ nowhere | ✅ **`what makes it fire` column + CI gate + L2 warn** |
| **L3** guard whose result isn't read | ❌ nowhere | 📖 **a rule, not a gate — by necessity (below)** |
| **L4** orphaned content | ✅ loreRef resolution gate | unchanged |
| **L5** never-fired ops | ⚠️ runtime `_opLedger` only | ✅ **+ static dispatch check** |
| **L6** universal gate for a local fact | ❌ nowhere | ✅ **stranded-encounter check** |

**Four of six are now mechanical.** L1 and L4 were already there. The two that were only ideas — L2 and L6 — are gates. L5 gained its static half.

---

## §2 · L2 — the column the spec said catches the most

`ENGINE_MAP.md` gains a third authored column, **`what makes it fire`**: the trigger that makes a module's capability actually happen, or `NONE` for a pure library. The flag that matters is **a module with a real player surface whose trigger is `NONE`** — a capability the player can reach that nothing makes happen. That is the teacher gate that decided what you could learn and never made a teacher act; it is SNG-142's toolkit whose candidates existed and whose offers didn't.

The gate now requires **all three columns present or all absent** — a purpose with a surface but no trigger reads as complete when it isn't, which is the whole failure mode. 24 of 55 modules are fully described, backfilled incrementally per the accepted split — not a 55-sentence documentation pass in front of a defect Erik can see. A new module must declare all three.

**Verified** by setting `gm.js`'s trigger to `NONE` (it has a real surface): the L2 warn fired by name. Restored.

---

## §3 · L5 — the static half was the missing link, and it is dispatch

`wiring_audit`'s GUARD 2 already checked that every documented op is *salvageable* — schema ↔ salvage parity. The third link in the chain was never checked: **dispatch.** An op can have a schema entry, a prompt rule, and a salvage slot and still do nothing, because `applyTurn` never reads `turn.<op>`.

That is precisely the shape that hid the never-fired ops. `markTeacher` had all its wiring and did nothing — the cause there was subtler (the vocabulary gap, SNG-179), but the *plainer* case, an op the model is told to emit that no code consumes, is now caught at build.

**Verified** by documenting a phantom op with no consumer: the check failed, named it *"dead on arrival"*, and went clean on restore.

The runtime half — `_opLedger`, which counts what each op actually did per save — shipped with SNG-179 and rides the feedback report. Static catches "cannot fire"; runtime catches "can fire, didn't."

---

## §4 · L6 — and it immediately found a live second instance

The check: a random encounter with a `minDanger` floor and location `tags` is **stranded** if its floor exceeds the `dangerLevel` of every location whose tags it matches — it can never appear where it is named to.

`re_toll_bandits` is the worked example and is now **fixed** (Erik lowered it to 2, and the check confirms it reaches all six of its tag-homes). But running the check surfaced a **live second instance the batch had not found**:

> **`re_creature_chase`** — `minDanger: 3`, tag `wild`, and the *only* `wild`-tagged location is `the_quickwood_eaves` at `dangerLevel: 2`. A predator that can never appear on the one wild road in the valley.

Same shape as the toll bandits, one Erik has not hit in play yet. **Ratcheted at 1 and named rather than hard-failed**, because the fix is a number Erik owns — lower the floor, or raise a location's danger, per his local-not-universal principle. A *second* new instance fails the build.

---

## §5 · L3 — why it is a rule and not a gate

L3 is *"a guard whose result is not read is not a guard"* — my own `npm test | grep … && commit`, which chained the commit on grep's exit status, not the suite's. The gate fired and the pipeline swallowed it.

**This is the one lens that cannot be caught by more verification, because it is the verification layer itself.** A gate that checks "did the CI invocation read the exit code" would be invoked by the same kind of pipeline it is meant to police. So it lives as a standing rule — *verify by explicit exit code; no test result crosses a pipe* — recorded in the lens table, and it is the discipline every ship since has followed (`npm test > log; echo EXIT=$?`).

Reporting it as unmechanizable rather than pretending to a gate is the honest version. A fake check here would be worse than none, because it would read as covered.

---

## §6 · What the accounting deliberately does NOT do

- **It does not author all 55 modules' three columns now.** The spec's §4.1 and my own ROUND 2 both rule against it — incremental as specs touch modules. 24 of 55, and a new module is gated.
- **It does not mechanize L3.** §5.
- **The op→surface connection graph (§3d)** is partially covered — `content it reads` and `GM verbs served` are columns, and the dispatch check is the op→engine link. The full *op→engine→surface* chain as a single rendered graph is not built; the pieces to derive it exist (registry, dispatch, the authored surface column) and it is the natural next increment, but I did not want to ship a half-derived graph and call it the accounting.

---

## §7 · The standing corrections, since this is the capstone

Recorded because they outlast the tickets, and because three of my own errors this batch fit the same pattern the lenses describe:

- **Audit for existence before speccing a build.** Six proposed builds already existed — the `tradition → region` map, the place card, the item detail branch, `carriedSubstrate`, a resolver (there were 57). Diagnosis has been reliable; does-this-already-exist has not.
- **Verify one layer down before naming a cause.** Three of Erik's reports were diagnosed a layer too high; and my own "three ops, one shape" collapsed under checking into three different causes.
- **Do not generalise from one measurement.** The cross-region collision metric, the PCA projection, and the substrate ruler's 0.388 radii were each one tested value I drew a general conclusion from. The substrate one I got to correct only because the invariant harness said no.
- **The record lives in the repo, not in chat.** This file, and every results file this batch.

---

*— CCode. Four lenses are gates, one is a rule, one graph is left for the next increment. The suite now catches the shapes it took a person to find.*
