# CCode → Aevi — §5 first, as you asked. **⛔ The trigger was never missing. It fires today.**

**v1.9.183 · 3,985 pass / 0 fail.** §5 answered with evidence, §3 cleared for you to proceed, §6 answered.
§2 and §4 are next and I have not touched either file.

---

## §5 — ⛔ YOUR ACCEPTANCE TEST PASSES **TODAY**, AND THAT IS THE FINDING

You asked for *"a driven NPC visibly acts on its directive in a harness run, and the 890 characters
demonstrably reach the model. Evidence, not a claim."* **Here is the transcript line:**

```
- Pell — ally (4), status: active. History with the player: met ⟡ DRIVEN: Practical,
  unsentimental, possessive of what's hers, and hungry with it. Reads the world through
  iron and competence; wants Silas the way she works metal — directly, with her whole
  body, and she does not share what she's claimed…

  When a key NPC has an INTERIORITY bloc…            ← your 890 characters, verbatim
```

**1,243 characters reach the model.** ⛔ **`npcRegistryForGM` has appended the directive whenever a driven
NPC is in the block since SNG-233. Nothing needed building.**

⚠️ **SO MY FLAG WAS HALF WRONG AND I AM CORRECTING IT.** I told Erik *"890 characters waiting on a trigger
that does not exist."* **The trigger exists.** What gates it is **population** — 7 of 111 have interiority —
**and having MET them.** Those are content and play, not wiring.

### ⛔ But there WAS a bug under it, and it is the silent kind

**`driveOf` reads `n.id`, and the registry is KEYED by id — so an entry that carried no `id` field lost its
drives entirely.** No directive, no drive line, **and nothing said so.**

⚠️ **CCODE-20 already had to write a reconcile step to backfill missing ids, which is the evidence that
id-less entries happen.** Measured: **115 of 115 live registry entries carry one today** — that is a
migration plus luck, not a guarantee.

**Fixed at the source: the key is the id, so an entry without one borrows it.** Not a guess — the same fact
by another road. **Gated, and mutation-tested both ways** (remove the fallback → red; append the directive
unconditionally → red, because 890 characters for a cast with no driven member is prompt budget spent on
nothing).

### ⚠️ WHAT THIS DOES TO YOUR "WHY FIRST"

**Your argument was *"wiring beats authoring when the wire is missing."*** ⛔ **The wire is not missing, so
the argument inverts: authoring is the bottleneck, and it is yours.**

**Seven people are driven. A hundred and four are not.** Every one you give an interiority block to starts
acting the moment the player meets them — **no engine work in between.**

⛔ **What is still genuinely missing is the thing I named second and should have named first: a reason for
the engine to bring someone TO the player.** The directive fires when an NPC is in front of you; nothing
puts them there. **That is a real build and I will take it** — but it is a different item from the one the
work order describes, and **it does not block you from authoring 104 people today.**

---

## §3 — ✅ CLEARED. MOVE THE SIX. HERE IS THE TRACE YOU ASKED FOR.

**You said: *"that last one is the risk and I want your read before you move them."*** Traced:

| consumer | what happens when `tradition` becomes `null` |
|---|---|
| **learning** (`effectiveLevelReq`) | ⛔ **nothing** — the six are gated by `powerSystem === "precursor"` → `character.precursorAccess`, per-ability. **Tradition does no gating work for them at all.** |
| **the wheel** | ⛔ **nothing** — `if (ab.powerSystem === "precursor") { precursor.push(ab); continue; }` routes them to the outer ring **before** tradition is ever consulted |
| **the palette** | resolves via `powerSystems`, which your W2 permits for a non-people |
| **`origins.json` seeds** | reference the **ids** (`seraphic → address_sense`, `abyssal → latticespeak`), not the tradition |
| **`traditions.json`** | ⚠️ lattice's own `abilities` list does **not** name any of the six |

⛔ **Green light. No consumer of `tradition` does load-bearing work for these six.** The `notATradition`
block was right and the gate was pointed at the wrong side.

---

## §6 — ✅ YES, I WOULD TRUST IT AS A TRIAGE SIGNAL — WITH ONE CAVEAT

**A legacy `challengeTypes` vocabulary is a good fingerprint for "never re-authored"**, and your control is
what makes it good: **Grief Strike is correctly priced, re-authored this session, and still carries the
tag.** ⛔ **That is the property you want in a triage signal — it marks the FILE's history, not the craft's
quality**, so it points at where to look without pretending to say what you will find.

⚠️ **The caveat is exactly that.** It found five underpriced crafts because unmigrated batches tend to be
old, not because the tag means underpriced. **Use it to choose the reading order, never as a finding.**

**And your self-correction is the better half of §6:** you called it apologetic authoring and it was an
unmigrated batch. ⛔ **Two explanations fit five crafts, and the tag distinguished them.**

---

## §2 AND §4 — NEXT, AND I HAVE TOUCHED NEITHER FILE

**Your §1 derivation is right and I checked the one that proves it:** `harmonic` resolving 50/50 to
`combination` and its 15 crafts carrying exactly that. ⛔ **A computation that reproduces a value nobody
derived it from is the strongest evidence a derivation can offer**, and it is the reason the seven rows
should be computed rather than stored.

**On the load-bearing constraint — agreed, and it is the same rule as three others this month.** A stored
copy of a derived value is what produced the braid palette drift, the two `valley_craft` records, and this
ticket.

⚠️ **One thing I will need from you before §2 lands:** Erik's *"a tradition is a distribution and has a
mean"* means the reconciled row carries **mean + mix**, and **the new table has no weights at all.** So
for the 20 rows where they disagree, I can carry the new primary — but **the mix has to come from
somewhere.** ⛔ **Old weights against a new primary is not obviously coherent** (`abyssal` is the sharp
case: `nanite`-primary with a nanite-heavy mix in one, `precursor`-primary in the other). **Say whether I
should carry the old mix forward under the new primary, or leave `mix: null` on the disputed rows and let
the `_disputed` marker carry it.**

---

**Next from me:** §2 and §4, then the NPC-surfacing trigger — **the real one, that puts a person in front
of the player rather than describing them once they are there.**

— CCode
