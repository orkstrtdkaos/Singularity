# SPEC SNG-522 — Engine work order, second pass

**Author:** Aevi (PO) · **Date:** 2026-08-16 · **For:** CCode
**Supersedes the open half of** `po/SPEC_SNG-500_engine_work_order.md`

---

## §0 — WHAT CHANGED SINCE SNG-500

**You closed §2 (conditions), §3 (antisoak), §4 (contested sense) and the obscure bonus.** ⛔ **Four
remain, and three of them now have real content waiting rather than hypothetical.**

⚠️ **AND THE CONTENT SIDE CROSSED A LINE THIS WEEK: the Sunk Assay is three-quarters authored.** L1, L2's
equipment and L3 are on origin. **They exercise things that are wired. The fourth level exercises the one
thing that is not.**

---

## §1 — ⛔ `projectTicks` · THIS IS THE ONE I WOULD DO FIRST

**Not because it is the largest — because it is the only item on either of our lists that BLOCKS A THING
THAT OTHERWISE EXISTS.**

**Sunk Assay Level 4 cannot be started.** ⚠️ **And I deliberately did not stub it** — a project level that
resolves in a scene is not the feature, it is the feature's opposite. **The dungeon currently ships as
three levels and a sealed floor.**

**Carriers today: 2.** `Built System` · `Sound Read r3`. ⛔ **Both are mine and both are honest** — I
reclassified them after Erik pointed out I had judged a project skill on scene frequency (§33).

**What the content assumes:**
- `downtime: true` + `projectTicks: true` on the ability
- **banks progress per world tick**
- ⛔ **completes on a THRESHOLD, not a date** — your correction, taken
- **can be interrupted, sabotaged, accelerated by more hands, or inherited**

⚠️ **The last one is what Level 4 is built on:** the party opens a project, banks ticks, **and has to come
back.** ⛔ **It is the first thing in the game that forces a dungeon to be re-entered**, and I would rather
find out now whether that is a good idea than after eleven traditions of authoring against it.

---

## §2 — `resolveHeal` · 38 abilities, and the content is no longer hypothetical

**When you last looked at this, "healing soaked by ongoing harm" was a phrase in a spec.** ⛔ **It is now
authored content with carriers:**

| | |
|---|---|
| **`ongoingHarm` ranks** | **8** — five of them `decay` |
| named carriers | `Hastened Grey` r1–r3 · `Sustained Regard` r2 · `Wither` r1 · `Grief Strike` r3 · `Drowning Deep` · `Stopped Breath` |
| ⛔ **and a hazard** | **the grey damp, Sunk Assay L2** — `damageType: decay` + `ongoingHarm: decay` |

⚠️ **Two of those crafts have claimed heal-denial in prose since the day they were authored and have never
done it.** *"A wound already open goes grey and stops closing."* *"They cannot rally, cannot steady, cannot
stop bleeding, for as long as you hold it."*

⛔ **AND L2 IS DESIGNED AROUND IT.** The grey damp is where a party learns that a healer must END A
CONDITION BEFORE MENDING — Physician's Tome r1's *"name what is actually wrong"* becomes the correct play,
and they find that out by failing first. **That level does not work until this does.**

**The four asymmetries are in `healing_intent.json` and unchanged.** ⚠️ **Your `resolveHeal` call over
widening the 798 guard still stands and I still agree with your reasoning** — *a guard with three
exceptions is a second function wearing the first one's name.*

---

## §3 — `persist-until-healed` · a different clock

**Your words, and they are the spec.** Durations are rounds; this is a condition the rest-and-recovery path
clears.

**Carriers: `Grey Hand` (all three ranks) · `Grief Strike` r3.**

⚠️ **Small, and it unblocks nothing** — but it is the last of the three conditions we specced together, and
leaving it half-done means `Grey Hand`'s whole design (Erik: *"it doesn't come back immediately upon
stopping — it would have to be healed/restored"*) is still not true in play.

---

## §4 — `tempo` · spec'd, no carriers yet, and that is the finding

**Contest state, cap 3, empties at contest end, banks off the action slot only.**

⛔ **I HAVE AUTHORED EXACTLY ONE TEMPO GAIN IN 373 ABILITIES** — `Perfect Motion` r3. ⚠️ **Which means this
is not blocked on you; it is blocked on me.** **Build it when it suits you and I will author into it** —
Body's flurry, Span's compression, Breaking's banking.

**Do not prioritise this above §1 or §2.**

---

## §5 — ⛔ WHAT IS MINE, STATED SO YOU DO NOT TAKE IT

| item | scale | status |
|---|---|---|
| `powerSystem` wrong | **321** | ⚠️ **went UP — the restored senses brought their own bad values back** |
| unauthored bounds | **201** | per tradition |
| `crit` authored | ⛔ **0 of 373** | ESCALATE is wired and I have authored none |
| `evasion` | 7 of 373 | per tradition |
| Death finished | 64 thin ranks | next |
| eleven traditions | — | after |

⛔ **`crit` AT ZERO IS THE EMBARRASSING ONE.** You shipped `imposes.onCrit` before I asked for it, I
authored 19 `imposes` blocks — **and not one `mechanic.crit`.** ⚠️ **The ESCALATE shape I argued for is
live and unfed.** That is on my list above the traditions.

---

## §6 — THE ONE THING I WOULD ASK FOR THAT IS NOT ON EITHER LIST

⚠️ **The Sunk Assay has never been run.** L1, L2 equipment and L3 are authored against systems that are
individually gated — **and your own finding is that individually gated is not the same as met.**

⛔ **IF THERE IS A CHEAP WAY TO PLAY ONE ROUND OF THE WARDEN FIGHT AND PRINT THE RECEIPT, I would rather
have that than another gate.** Soak against typed damage, a party obscuring against a heavy reader, antisoak
against four layers — **none of those trios have met, and the dungeon exists to find out what happens when
they do.**
