# PLACEMENT — `sectFlavour` goes in the ability block, resolved to the wielder's sect

**Aevi (PO) → CCode · 2026-09-02**
**Answers:** `REPLY_ccode_dark_fields_triage.md` §2 — *"I have not wired it, because where it belongs is a
narration call. Say where and it is small."*

---

## §1 — ⛔ IT IS NOT ONE FIELD. IT IS TWO THINGS SHARING A KEY.

I read all 12. **~30 sect entries, and three of them are not flavour at all:**

| craft | sect | entry |
|---|---|---|
| `ki_wield` | mason | *"⚠️ Not this craft. A mason picks up something heavy."* |
| `loose_limbed` | mason | *"⚠️ Not this craft. A mason goes THROUGH the wall; a somatic goes over it."* |
| `ignore_me` | umbral | *"⚠️ Not this craft. An Umbral carries darkness; this carries indifference."* |

⚠️ **Those are AUTHORING JUDGEMENTS — "this sect should not be reaching for this" — wearing the same field
as narration.** ➡️ **They must not reach the narrator as flavour.** A GM handed *"Not this craft"* as
descriptive text will read it as something to say out loud.

---

## §2 — ✅ THE PLACEMENT: the ability block, resolved, one line

**Show the wielder's OWN sect line in the ability block, where the GM reads the craft.** Not the whole
dict, not a separate section, not first-use-only.

**Why the ability block and not the people block:** ⚠️ **this is not lore about a sect — it is what is
happening WHEN THIS CHARACTER USES THIS CRAFT.** `known_price` in a Syllogist's hands is *"you reasoned
it"*; in a Cogitant's it is *"you modelled them — their pressures, their creditors, the thing they have not
budgeted for."* Same mechanic, different event. ⛔ **That belongs next to the mechanic, every time, not
once.**

**Why not first-use-only:** the GM narrates the craft on every use and the difference is the point. A
one-time reveal makes it a fact about the character rather than a texture of the action.

### ⚠️ AND THIS IS WHY IT MATTERS MORE NOW THAN WHEN IT WAS AUTHORED

**R3 rules that a player picks their sense from ANY sect in their primary domain**, and the 2 starting
skill points buy from any domain they hold. ⛔ **Cross-sect craft-holding is now the NORMAL case, not an
edge one.** `sectFlavour` is precisely what keeps a Figurist holding a Syllogist's craft from playing
identically to the Syllogist. **It went dark right before the ruling that makes it load-bearing.**

---

## §3 — ⬜ THE THREE WIRINGS

1. **Resolve to the wielder's sect.** `sectFlavour[character.tradition]` → the ability block. ⚠️ **If the
   wielder's sect has no entry, show nothing** — silence is correct, not a fallback to another sect's line.
2. ⛔ **Entries beginning `"⚠️ Not this craft"` NEVER render as flavour.** Match on that opening.
   ⬜ Surface them to the GM as a caution if you like — *"off-idiom for this sect"* — or suppress entirely.
   **Your call; either beats narrating them.**
3. ⬜ **Consider a lint rather than a render for the three denials.** They are asserting something the
   access model could enforce: *if a mason should not hold `ki_wield`, that is a `notFor` claim, not a
   flavour string.* ⚠️ **I am not moving them — that is a content decision I would want Erik on** — but
   they are mis-filed and worth naming.

---

## §4 — ✅ COVERAGE, so the wiring can be checked

12 crafts · **somatic, mason, cogitant, syllogist, figurist, veilwright, umbral** carry entries.

⚠️ **Concentrated in Mind (`known_price`, `unbroken_thread`, `solved_route`, `physicians_tome`,
`case_closed`, `deduced_strike`) and Body (`ki_wield`, `loose_limbed`, `second_wind`, `perfect_motion`,
`set_word`).** ⛔ **Those are the two domains audited FIRST** — which is very likely why the field exists
at all, and why it stopped being written. ⬜ **A worthwhile follow-on for the tradition pass: the other
twelve domains have the same cross-sect problem and no `sectFlavour` at all.**
