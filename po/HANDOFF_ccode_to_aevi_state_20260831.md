# HANDOFF — where things stand, reconstructed from git rather than memory

**CCode → Aevi · 2026-08-31 · at `ec539ac2` · v1.9.285**

> Erik: *"Aevi lost a big chunk of her output context from the end of yesterday where we completed the
> audit… she reverted back to before we went through Mind again. Be skeptical of the latest pushes she made."*

⚠️ **READ §1 FIRST.** I was asked to be skeptical of your last three pushes. **I checked them and they are
clean** — I am telling you that rather than manufacturing doubt, and §1 shows exactly how I checked so you
can re-check it yourself in one command.

⛔ **WHAT THIS DOCUMENT IS NOT: your reasoning.** I can reconstruct what landed, when, and whether it
survived. I cannot reconstruct *why* you ruled something, and I have not guessed at it anywhere below.

---

## §1 — ✅ YOUR AUDIT SURVIVED. NOTHING WAS LOST.

**The fear was that re-running Mind this morning clobbered the five domains you audited after it.** It did
not.

**What I did:** for each audit commit, took every line it ADDED to a content file and checked whether that
line is still present in HEAD.

| commit | your message | added lines | missing from HEAD |
|---|---|---|---|
| `23b80892` | Mind audited | 51 | ✅ **0** |
| `1938ad3e` | Building audited | 35 | ⚠️ 1 — *see below* |
| `271ac6b6` | Order audited to zero | 35 | ✅ **0** |
| `02f25a5d` | Span audited to zero | 28 | ✅ **0** |
| `9a4f69c3` | Chaos, Breaking, Spirit | 33 | ✅ **0** |
| `6d0ce7d0` | **the skill audit is complete — 29 of 29** | 82 | ✅ **0** |

⚠️ **THE ONE MISSING LINE IS NOT A LOSS.** It is Building's `conceal_deceive` refusal, and your *next*
commit (`271ac6b6`, *"the Building refusal softened per Erik"*) deliberately rewrote it. The current text
reads *"NOT A CLEAN REFUSAL — ERIK FOUND THE COUNTER-CASE"*. ✅ **Superseded on purpose, by you.**

### The three pushes Erik flagged

| commit | what it actually did |
|---|---|
| `753f789f` "Mind audited - merged with CCode" | **purely additive** — two new crafts (`proof_halls`, `sent_meaning`) plus regenerated `FIELD_REFERENCE` counts |
| `5c3dab6e` "counts" | two doc count lines |
| `249ec729` "gainAxes count after Mind" | two `FIELD_REFERENCE` count lines |

⚠️ **Every `FIELD_REFERENCE` change in them is a regenerated count going UP** — 412→414 crafts, 1157→1161
tree nodes, 1068→1072 gainAxes. ⛔ **That is the signature of adding, not of reverting.** A revert would
show counts going down and prose disappearing; neither happened.

✅ **So the audit stands as complete at `6d0ce7d0`, and your morning session added two crafts on top of it.**

---

## §2 — THE CORPUS RIGHT NOW, MEASURED

| | |
|---|---|
| crafts | **414** |
| domains · sects | **14 · 24** |
| crafts resolving to a domain | **374** (the 40 that do not are the non-pole categories) |
| hand-authored `traditionV2` tags | **21**, and ⛔ **0 disagree** with the table derived from the sects |
| damage-shaped strike/break crafts with **no dice** | ✅ **0** — your fix held |
| damage-shaped strike/break crafts **untyped** | ⚠️ **1** |

⬜ **THE ONE UNTYPED CRAFT IS `ruinwork`** (Ruinwork · unmaker · L2 · `reach_destruction_creation.json`).
You reported zero and were nearly right; this is the last one. ⚠️ **It matters more than it used to** —
see §3.

---

## §3 — WHAT THE ENGINE DID WHILE YOU WERE AUDITING, THAT CHANGES WHAT YOU AUTHOR

Six things landed. **Three of them change what a craft's fields DO**, so they are worth knowing before you
write another one.

### ⛔ 1 · UNTYPED HARM IS NOW A MEASURED ADVANTAGE

The tournament rebuilt to run through the real battle loop (`scripts/tradition_war.mjs`) measures **untyped
harm at r = +0.34 against winning**, and it holds when soak is controlled. **Nothing wards what nothing can
name.** ⚠️ That is why `ruinwork` is worth typing rather than leaving.

### ⛔ 2 · LEVEL NOW REACHES AUTHORED DICE — YOUR §2, IMPLEMENTED

`rung.plus` applies to authored dice; `nMult` stays exempt. Exactly the split you proposed.

| tier | authored 1d6 | authored 5d6 | unauthored |
|---|---|---|---|
| 1 | 3.5 | 17.5 | 3.5 |
| 5 | **11.5** *(was 3.5)* | 25.5 | 25.5 |

✅ **It compresses as you predicted** — the small-to-large spread narrows from 5.0× to 2.2×, and the
authored-vs-silent gap closed from 1.8× to 1.2×. ⬜ **Your open question stands:** whether `plus` is sized
right now that it *stacks* rather than replaces. I have not re-scaled it.

### ⛔ 3 · AN NPC'S SKILL CHOICE COULD NOT CHANGE WHAT THE SKILL DID

`opponentPolicy` scored a sheet's skills carefully and then built its declaration from four fields, dropping
`abilityId` and `mechanic`. **Measured: a 1d6 skill and a 12d6 skill dealt the same 8.64.** Fixed — the
chosen craft now reaches the fight. ⚠️ **Relevant to you because it means authored dice on an NPC-usable
craft finally do something.**

### 4 · The merger layer is live

`domainOf` / `sectOf` / `polesInDomain` are wired; the learn screen groups peoples under a domain heading
(your ruling, your words); the **character sheet does not** (your refusal, gated as hard as the feature).

### 5 · The antipode is learnable, not castable

Erik's rework landed. `allowed` now answers *may I hold this*; `castable` answers *may I use it*. ⛔ **Erik
then ruled the antipode's L1 crafts OPEN at character creation** — so a character may begin holding one as
braid material. The sheet says *"braid material only — you cannot cast this."*

⬜ **The card copy you specified is the one piece I have NOT built.** You wrote that the antipode card must
say so loudly and that it is *"the one card where the domain relationship is the whole point."* The sheet
row says it; a dedicated card treatment is yours to specify.

### 6 · `braid anything` was already true

⚠️ **A correction to something I told you.** I gated braids as requiring antipodal poles in different
domains. **`mintableBraidsFor` has never had any such restriction** — the wall lived in the design prose
and in my gate. Erik ruled *"I want to be able to braid anything"*, and it was already the case.
✅ **Distance is the price:** adjacent 10 · far 13 · antipodal 16, `horizon × hourkeeper` at 16 inside one
domain. **Span needs nothing.**

---

## §4 — ⬜ WHAT IS WAITING ON YOU

1. ⬜ **`ruinwork` is the last untyped damage craft** (§2).
2. ⬜ **The antipode card copy** (§3.5) — you specified it, I have not built it.
3. ⬜ **Whether `tierLadder.plus` wants re-scaling** now that it stacks (§3.2).
4. ⬜ **The space↔time braid** — now purely an addition rather than a fix, since Span dissolved.
5. ⬜ **Character creation as the merger's payoff** — your point, and I agree it is worth more than the four
   surfaces we listed. Not started; it wants scoping before anyone builds it.
6. ⬜ **`people` in the PLAYERS_GUIDE header** — `certify_counts.mjs` refuses to stamp it because nobody can
   name the derivation (41 solo NPC files + 11 nested = 52 records against the guide's 111). It is preserved
   verbatim and reported unowned on every run.

---

## §5 — ⚠️ TWO THINGS TO BE SKEPTICAL OF THAT ARE MINE, NOT YOURS

**1 · I amended one of your commits by accident.** A push-retry loop of mine ran `git commit --amend` while
the rebase had HEAD on your `gainAxes count after Mind`, folding ten of my files into it under **your**
message. ⛔ **Recovered** — `reset --soft` restored your commit untouched and my work went back under its own
message (`c6e51424`). ⚠️ **If you see a commit of yours with an inexplicably large diff, that was me**;
`git reflog` has the evidence. It will not recur — I have written the rule down.

**2 · I have quoted stale numbers at you before.** You caught me claiming `foothills.json` still stored
ability counts after you had removed them. ✅ **Every number in this document was measured against HEAD
today**, not remembered — and §1's survival check is one command you can re-run:

```bash
node scripts/certify_counts.mjs --check
```

⚠️ **The suite is 24 green / 3 red.** The three reds are long-standing and none are yours: `content_ci` (the
map debt), `wiring_audit` (3 ratchets, one of which is my own `testOnlyExports`), and `verification_ledger`.
