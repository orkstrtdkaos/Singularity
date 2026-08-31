# SCOPE — the merger after Reading B

**CCode → Erik, cc Aevi · 2026-08-31 · v1.9.280 · answers `po/REPLY_aevi_reading_b_ruled.md` §4**

> Aevi: *"⬜ AND THE SCOPING PASS IS YOURS NOW — Erik's ask. With the geometry settled, what remains is
> re-tagging and presentation, which was your own estimate of the cheap half."*

✅ **She is right, and I verified it rather than took it.** Everything below is measured against HEAD.

---

## §1 — HER CLAIMS, CHECKED

| claim | measured |
|---|---|
| 14 domains | ✅ **14** |
| the 24 poles map into them | ✅ **24 sects, 24 distinct poles, zero duplicates** |
| every sect id is a real tradition | ✅ **zero unknown ids** |
| the merge is additive — nothing a file names stops existing | ✅ every sect id still resolves in `traditions.json` |
| the ring is untouched | ✅ **552 stored distance entries, all 552 reproduce `min(\|i−j\|, 24−\|i−j\|)`, zero mismatches** |
| antipodes unchanged | ✅ every domain antipode is mutual; every pole keeps its own `opposite` |
| **no braid breaks** | ✅ **all three verified antipodal (distance 12) and cross-domain** |

⛔ **AND THE CROSS-CHECK I MOST WANTED PASSES.** The 21 hand-authored `traditionV2` tags versus the table
derived from `traditions_v2.json` sects: **21 agree, 0 disagree.** The tagging and the table say the same
thing, which is the single best evidence that the mapping is sound.

**Ability coverage:** 372 of 412 resolve to a domain. The 40 that do not are the non-pole categories —
harmonic (16), radiant_folk (15), cross_pole_braid (3), god_named (3), bargainers (3).

---

## §2 — ⛔ THE ONE THING THE RULING DID NOT COVER

**`Span` is the only domain that holds BOTH poles of one axis.**

```
Span  ·  anti: Spirit
   Spanwork  → horizon    (space_time · space · ring 9)
   Hourcraft → hourkeeper (space_time · time  · ring 21)
```

`horizon.opposite = "hourkeeper"`. Ring distance **12** — they are antipodes. And `domainAccessModel` says,
word for word: *"opposedToPrimaryOrSecondary: **CLOSED**. You cannot learn the opposite pole of what you are."*

⛔ **SO A SPANWORK PRACTITIONER IS PERMANENTLY BARRED FROM HOURCRAFT — INSIDE THEIR OWN DOMAIN.** Span is
the one domain nobody can ever hold whole, and the only road between its two sects is a cross-pole braid
that has not been authored.

⚠️ **This is exactly the "internal tension inside one tradition" shape Reading B was chosen to avoid.**
Reading B avoids it in **13 of 14** domains. Span is the exception, and it is a content decision rather than
a bug: 12 of 12 other axes are split across two domains, and this one is not.

⬜ **Erik / Aevi — three ways out, and I have no preference I would defend:**
1. **Leave it.** Span is the domain of the unbridgeable, and that is a feature. ⚠️ Then it wants saying out
   loud somewhere a player can read, or it reads as a bug.
2. **Split it** the way the other eleven axes are, into two domains.
3. **Author the missing braid** — a space↔time braid would make Span the one domain whose wholeness must be
   earned, which is arguably the most interesting of the three.

⚠️ **Five other pole-pairs also have non-antipodal domains** (Order/Spirit, Death/Mind and their mirrors).
Those are harmless: two *different* domains, so nothing about access changes. Span is the only pair that
lands inside one.

---

## §3 — THE FOUR DOORS ON `traditions_v2.json`

| door | state |
|---|---|
| **authored** | ✅ 14 domains, 24 sects |
| **registered** | ✅ in `manifest.provides.rules` |
| **loaded** | ⛔ **no** — `state.js` never calls `loadRule("traditions_v2")` |
| **read** | ⛔ **zero readers** in engine, app, tests or scripts |

⚠️ **AND I CHECKED THE COLLISION TRAP, BECAUSE THIS FILE IS EXACTLY ITS SHAPE.** SNG-331's lesson is that
`"rules/location_affinities.json".includes("ties")` is true — and `"rules/traditions_v2.json"` contains
`"traditions"`. ✅ **The resolver is safe:** exact filename wins, so `loadRule("traditions")` still returns
`traditions.json`, and the ambiguous-substring path refuses rather than guesses. Proven by running the real
resolver against the real manifest, not by reading it.

---

## §4 — THE WORK, SIZED

### A · The reader — **small, unblocked, safe under everything** ✅

`buildTraditionIndex` loads `traditions_v2.json`; `domainOf(ability, index)` joins through the sect table.
`traditionOf` is **untouched** — under Reading B the pole is still the answer to *"what tradition is this"*,
and the domain is a second, additive question.

⚠️ **Aevi's sharpest point in her reply:** the resolver now has **two** questions, and 36 call sites that
bypass it will answer neither consistently. That reframes B from tidying to prerequisite.

⛔ **Gates:** every ability resolves to at most one domain · the 24 sects cover 24 distinct poles · **the
authored `traditionV2` tags agree with the derived table** (this is the one that would have caught a bad
mapping, and it passes today — it should stay passing) · a non-vacuity floor on the count.

### B · The 36 bypasses in `app.js` — **medium** ⚠️

13 direct `.tradition` + 23 `.powerSystem` reads that never reach the resolver, in a file with 47 render
functions. Each needs to go through `traditionOf`/`domainOf`, plus a regression gate the way §27 guards the
melee config.

### C · The 5 unmapped records — **small work, needs a ruling** ⬜

god_named · bargainers · harmonic · radiant_folk · valley_craft. ⚠️ **These are the same five that have no
ring position** — already outside the geometry, now also outside the domain map. They need a defined answer
rather than one inherited by omission: *no domain* is a perfectly good answer, it simply has to be stated so
a reader can tell it from an oversight.

### D · Presentation — **medium, and the point of the exercise** ⬜

The domain has to appear somewhere or the merger is invisible to a player. ⬜ **Aevi's call on where:** the
learn screen, the skill graph, the character sheet, ability cards. I will not guess at what a player should
see.

### E · Derive `distances` — **small, and provably safe** ✅

552 stored entries; the ring derivation reproduces **all 552 exactly, zero mismatches**. So this is pure
debt reduction with a proof attached: the change cannot alter behaviour, because the derived value is
already the stored value everywhere. ⚠️ Aevi agreed it stands on its own merits, and this is why —
it is 552 copies of something the ring already says.

### F · The braid gate she asked for anyway — **small** ✅

*Every authored braid whose prose claims tension must still measure as far or antipodal.* All three pass
today (distance 12, cross-domain). ⚠️ **She is right that it is worth having even though nothing is broken**
— it is cheap, and it is the gate that would have caught the thing we were worried about.

---

## §5 — WHAT I PROPOSE TO DO NEXT

**A, E and F now** — all three are unblocked, safe under every open question, and E carries a proof that it
changes nothing. Then **B**, which Aevi correctly upgraded from tidying to prerequisite.

**C and D wait on a ruling**, and I would rather they waited than that I guessed.

⬜ **§2 (Span) is the one thing I would like answered before A lands**, because if Span splits, the sect
table changes shape and the reader should be built against the final one.
