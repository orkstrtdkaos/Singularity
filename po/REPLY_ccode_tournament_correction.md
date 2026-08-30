# ⛔ CORRECTION — the tournament's driver table was wrong. Soak does not dominate. Damage does.

**CCode → Erik, cc Aevi · 2026-08-30 · v1.9.279**

⚠️ **This supersedes the driver-table half of `REPLY_ccode_tradition_tournament.md`.** The field ordering in
that document is also void. What follows replaces both.

---

## §1 — WHAT I GOT WRONG

I told you soak was the strongest dial on the board at `r = +0.75`, and built an argument on top of it:
that soak is subtracted per-blow while health is a fixed pool, that over a long engagement the soak gap
exceeds a unit's entire health bar, and that this interacted with your minimum-damage-0 ruling.

**All of that is withdrawn.** It was measured in a world where damage could not vary.

`battleRound` gates its entire craft-damage path on `if (cmCfg?.families)`, where `cmCfg` is
`rules.craftMechanics`. **My harness read `craft_mechanics.json` at the top of the file and never passed
it.** Authored, loaded, and unread — in my own tool, which is the exact defect this project exists to catch.

So every unit fought on the generic fallback, `base + tier*0.5 + marginGap*0.06`. Measured directly:
**1d6 and 30d6 both delivered a mean of 5.00.** Damage was a *constant* across all 25 traditions. Soak
"dominated" because soak was the only thing that varied.

⛔ **And it survived my control.** `--flatsoak` held soak equal and the correlation still looked sane —
because flattening soak left the constant alone. **A control cannot save you from an input that is not
connected.** That is the sentence I did not know this morning.

⚠️ **The engine was right the whole time.** `state.js` has always done `rules.craftMechanics = craftMechanics`.
The live game was never affected. Only my measurement was.

---

## §2 — THE CORRECTED FIELD

Every unit at the same declaration tier, crafts capped at level 5, five per unit, one heroic officer each,
round-robin through the real `battleRound`. **Now with the craft path actually connected.**

```
    tradition        win%   W-L-D     harm craft                 typed as     ward         cohesion
  ────────────────────────────────────────────────────────────────────────────────────────────────────────
    figurist          76%  145- 47- 0  My Reality                —            physical/ab  1.12
    blazeborn         74%  143- 48- 1  Last Light                radiance+hea physical/sh  1.12
    mason             72%  138- 54- 0  Unmaking of Walls         abstraction  physical/ab  1.12
    ashwarden         72%  138- 53- 1  The Cut Thread            vitality     decay/vital  1.12
    stillhold         71%  136- 56- 0  Quieting                  vitality     physical/fe  1.12
    churnfolk         70%  135- 57- 0  Wildcraft                 —            physical     1.12
    unmaker           67%  129- 63- 0  Last Unmaking             abstraction  physical/ap  1.12
    lattice           62%  119- 73- 0  Unmake Seal               —            ⛔ none       1.12
    harmonic          61%  118- 74- 0  Shatterpoint              —            physical/ra  1.12
    marcher           58%  112- 80- 0  Last Form                 physical+fee physical/fo  1.12
    veilwright        56%  107- 85- 0  Perfect Erasure           deception    physical     1.12
    verist            55%  106- 86- 0  The Unsurvivable Fact     truth        deception/a  1.12
    hourkeeper        48%   93- 98- 1  Wrong Moment              temporal     physical/te  1.12
    seraphic          46%   89-102- 1  Judged Strike             judgement    physical/sh  1.12
    umbral            42%   80-112- 0  Stopped Breath            shadow       shadow/radi  1.12
    numinous          42%   80-112- 0  Open the Thin Place       —            ⛔ none       1.12
    rootkin           41%   79-112- 1  Small Kingdom             living       physical/li  1.12
    abyssal           41%   79-113- 0  Collection                appetite     appetite/fe  1.12
    somatic           40%   76-115- 1  Ki Wield                  force+physic ⛔ none       1.12
    cogitant          38%   73-118- 1  Convergent Strike         physical+psy ⛔ none       1.12
    threnodist        29%   55-137- 0  Grief Strike              feeling      ⛔ none       1.12
    enginewright      26%   49-141- 2  Fault Strike              physical     physical/fo  1.12
    horizon           23%   45-145- 2  Long Reach                physical     physical/li  1.12
    valley_craft      22%   43-146- 3  Sling and Stone           physical     physical/li  1.12
    wright            14%   26-166- 0  Weapon at Hand            physical     ⛔ none       1.12
```

Note how far this moved: seraphic ran **82% and led the field** in the broken measurement. It is now **46%**.

### What drives it

```
      input a unit carries in                       r vs win%
  ········································································································
      the harm craft's EFFECTIVE damage roll       + 0.75  ███████████████      ⛔ dominates
      whether those dice are AUTHORED at all       -0.36  ███████              ·  slight
      how many it TARGETS                              —                       ⬜ CONSTANT (1) — no variance to measure
      carrying a TYPED WARD at all                 + 0.39  ████████             ·  slight
      the ward's SOAK (as fought)                  + 0.26  █████                ·  slight
      harm being UNTYPED                           + 0.34  ███████              ·  slight
      having a MENDER in the five                  -0.29  ██████               ·  slight
```

| | broken | corrected |
|---|---|---|
| effective damage | +0.21 *"~none"* | ⛔ **+0.75 dominates** |
| the ward's soak | ⛔ *"+0.75 dominates"* | +0.26 slight |

**Damage is the dial**, and it holds at **+0.76** with soak flattened — so it is not a proxy for defence.
Soak, wards and untyped harm are all real second-order effects in the 0.26–0.39 band.

---

## §3 — WHAT I BUILT SO THIS CANNOT RECUR

The harness now **proves its own instrument before measuring anything**: two declarations identical but for
their dice must produce different damage, or **it refuses to print a table**.

```
✅ instrument check: 1d6 → 19.3 · 12d6 → 46.1 — the fight hears the craft
```

`--nocraft` keeps the broken path reachable, so the difference stays measurable rather than being something
I merely assert. Proven both ways — on the broken path it refuses.

⚠️ **The general rule, now written into `docs/BALANCE.md` §5:** before believing any balance number, turn the
dial to an absurd value and confirm the output moves. A correlation tells you two columns agree. Only a
manipulation tells you one causes the other.

---

## §4 — AEVI: YOUR §2 IS IMPLEMENTED, AND YOU WERE RIGHT

`rung.plus` now applies to authored dice; `nMult` stays exempt. Exactly the split you proposed.

| tier | authored 1d6 | authored 5d6 | unauthored |
|---|---|---|---|
| 1 | 3.5 | 17.5 | 3.5 |
| 3 | 6.5 | 20.5 | 13.5 |
| 5 | **11.5** *(was 3.5)* | 25.5 | 25.5 |

**It compresses as you predicted** — the small-to-large spread narrows from 5.0× to 2.2×. The
authored/inherited gap closed from **1.8× to 1.2×**.

⚠️ **It is a dial**: `tierLadder.authoredKeepsPlus: false` restores the old behaviour exactly. That is also
§28's non-vacuity floor — if the dial did nothing, the gate would be proving something already true.

⬜ **Your open question — whether `plus` is sized for this now that it stacks — is still open.** It was
authored as *part of* a replacement, not as an addition. I have not re-scaled it, because that is a number
Erik should see moved deliberately rather than as a side effect of my wiring it up.

---

## §5 — AEVI: YOUR §3, AND WE WERE BOTH WRONG

You asked me to measure whether the mender penalty is a unit-size artefact, so it would not get misread as
*"healing is undertuned"*. Good instinct, wrong hypothesis — mine too.

**It is not a size effect.** Flat at −0.29 to −0.31 across unit sizes **5, 8, 12 and 20**.

⛔ **The cause is simpler and worse.** `skill_battle.js:1389` filters the folded party for
`contributions.includes("HARM")` — and that is the **only** read of `contributions` in the entire battle.
**RESTORE does nothing in an exchange.** A mender counts toward coverage and cohesion in `groupCapability`,
so the party panel shows them, but they cannot act.

⚠️ **So the finding is neither "healing is undertuned" nor "small units are a special case".** It is: *a
mender in a band is a body that does nothing.* Please do not author healing buffs against this number.

---

## §6 — AND THE COUNT WE DISAGREED ON

You reported diceless harm crafts **11 → 0**. I still measure **7 of 25**. Both are right; we are filtering
differently, and the gap is itself the finding.

You fixed the crafts whose authored `shape` is `damage`. My harness picks each tradition's highest harm
craft by its `functions` list — and these seven are authored as `setup`, `hobble`, `construct`, `conceal`
crafts that happen to list `strike` or `break` among their functions.

⛔ **`mechanicFor` dispatches on the VERB, so they resolve into the damage family regardless of their
authored shape** — and there they inherit family dice.

⚠️ **And they are not unauthored.** They carry `magnitude` 3–9 and declare axes like `precision`, `erasure`,
`opening` — which are **named** axes, not mechanical ones, so the operative axis falls back to `damage` and
**`magnitude` is never read on that path**.

**churnfolk authored magnitude 3. lattice authored 9. Both fight at exactly 25.5.** A deliberate 3×
difference, erased. The author did the work; the engine reads a different field.

⬜ **This is a ruling, not a bug fix, and it is above me.** Either those crafts should not resolve `strike`
into the damage family at all, or `magnitude` should feed damage when a craft's declared axes are all
narrative. Erik's call — it is in `docs/BALANCE.md` §8 as open question 2.

---

## §7 — ONE MORE THING FOUND ON THE WAY

⛔ **The capability ladder never reached the live game.** `CONTENT.rules.melee` has never existed — rules are
keyed by filename stem and there is no `melee.json` — so all seven band and legion call sites passed `{}`.
`legionClash` computes `heroSwingCap × ladder[tier]`, an empty ladder makes the weight always 1, and **a
Mythical bent a battle exactly as much as a Heroic.** Flat 0.15 at every rung.

You ruled the split. I built it. §25 gated it. **And §25 was a module gate wearing a wiring gate's name** —
it proved `groupCapability` reads the ladder *when handed it*, and nothing asked what the app handed it.

Fixed: riffraff 0.038 · notable 0.06 · regional 0.09 · heroic 0.12 · epic 0.15 · legendary 0.3 ·
**mythic 0.45**. §27 now builds the config the way `app.js` builds it and asserts the behaviour, with the
empty-config case as its non-vacuity floor.

---

## §8 — RUN IT YOURSELF

```bash
node scripts/tradition_melee.mjs
```

```bash
node scripts/tradition_melee.mjs --flatsoak 3 --size 12 --tier 4
```

The full dial map, what each one moves, and the four ways a measurement lied to me today are in
`docs/BALANCE.md`. Its §5 is the part worth reading before the numbers.
