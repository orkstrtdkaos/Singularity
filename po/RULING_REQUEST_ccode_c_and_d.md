# RULING REQUEST — the two questions blocking C and D

**CCode → Erik, cc Aevi · 2026-08-31 · v1.9.281**

> Erik: *"what rulings do you need for c and d?"*

Short answer: **two, and only one of them is really a question.**

---

## §1 — FIRST, YOUR BRAID RULING IS ALREADY THE ENGINE

> *"for braids… I want to be able to braid anything — not only antipode and different domains."*

✅ **`mintableBraidsFor` restricts on exactly three things** — pairwise, you own both, not already braided.
⛔ **It has NEVER had a tradition, antipode or domain restriction.** The wall lived in the design prose and
in the gate I shipped an hour ago.

⚠️ **And distance is already the price**, measured just now:

| pair | steps | braid cost |
|---|---|---|
| umbral × veilwright | 1 | **10** |
| umbral × marcher | 6 | **13** |
| umbral × blazeborn | 12 (antipodal) | **16** |
| **horizon × hourkeeper** | 12, **same domain** | **16** |

⛔ **So Span needs nothing.** Its two sects braid at the full antipodal price, in one domain, today.

**§31F now asserts what replaces the wall** — any pair braids, and adjacent < far < antipodal strictly.
⚠️ **Proved red by flattening the bands**, which made it read `10 < 10 < 10`.

---

## §2 — ⬜ RULING 1 (C): what a record OUTSIDE the wheel is

Five records have no ring position and no domain: **god_named · bargainers · harmonic · radiant_folk ·
valley_craft.** Two foothills, three folk kits. They fall out of `domainOf` as `null` today.

⚠️ **`null` is very likely the right answer** — they are not poles, so they are not in a domain. **I am not
asking you to invent a domain for them.** The question is narrower:

⬜ **Is "no domain" a STATED answer or an accident?**

Because those two look identical in the data, and the difference decides one thing: whether a gate should
**assert they have no domain** (so a future mis-tagging is caught) or **tolerate whatever they have** (so
they can be given one later without breaking).

⚠️ **A one-word answer unblocks it.** *"Stated"* → I gate it. *"Open"* → I leave it and note why.

⛔ **One thing worth knowing before you answer:** `valley_craft` now has **zero abilities** — Aevi retired it
into its parents — while `foothills.json` still carries a record for it claiming 18. That record is either a
retirement that has not finished, or an access point that outlives its crafts. **That one is a real
decision, not bookkeeping.**

---

## §3 — ⬜ RULING 2 (D): where a player meets a domain

This is the one that actually needs you. The domain layer is loaded and readable as of today, and it
currently appears **nowhere on screen**.

⬜ **What I need is not a design — it is which of these is true:**

**(a) A domain is a LABEL.** It groups things in the skill graph and the learn screen; a player reads
"Cogitant — of the Mind domain" and nothing else changes. ⚠️ *Cheapest, and honest to Reading B, which says
the pole remains the identity.*

**(b) A domain is a NAVIGATION LAYER.** The learn screen groups by domain first, poles second — you pick
Mind, then Noesis. ⚠️ *Changes how the catalogue is browsed; more work, and it makes the 14 the primary
thing a player sees.*

**(c) A domain is a THING YOU HAVE.** It shows on the sheet, it accrues, it is part of how you describe
yourself. ⛔ *That is a mechanic, and it wants its own ruling — I would want it separated from C and D.*

⚠️ **My read, offered and not defended:** **(a) now, (b) later if the browse gets crowded.** Reading B says
the pole is the identity and the domain is the layer above it; a label matches that exactly, and it is
reversible. **(c) is a different conversation.**

⬜ **Aevi should own the words either way** — what a domain is CALLED where a player sees it is authoring,
not engine.

---

## §4 — WHAT I AM DOING WHILE YOU DECIDE

**B — the 36 `app.js` reads that bypass the resolver.** Unblocked, unaffected by either ruling, and now a
prerequisite rather than tidying: the resolver answers two questions (`traditionOf` and `domainOf`) and 36
sites that go around it will answer neither consistently.

⬜ **Also queued and NOT started:** the learnable-not-castable bit from `RULING_antipode_access_rework`. It
is one bit on an owned craft and I have deliberately not built the ladder above it — *"we can figure out the
stairs later"* was explicit, and building stairs against stub text is how a stub becomes load-bearing.
