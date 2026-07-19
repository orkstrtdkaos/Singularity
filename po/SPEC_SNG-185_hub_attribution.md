# SNG-185 — Registry-only people have no domains

**Author:** Aevi (PO) · 2026-07-19 · CCode-identified from the SNG-179 build. Outcomes; engineering is CCode's.
**The single upstream dependency behind both outcomes Erik actually reported.**

> CCode: *"The captured Veth turn set neither `bondType` nor a domain — she's registry-only with no
> backing record… That gap is now the single upstream dependency behind both outcomes you actually
> reported."*

---

# §1 — TWO PATHS MINT PEOPLE AND ONLY ONE STAMPS DOMAINS

| path | who arrives | domains? |
|---|---|---|
| `generate.js:566–583` (SNG-177) | generated entities | ✅ `generated` from the model, else `derived` from region home, with **provenance recorded** |
| **`npcs.js :: applyNpcUpdates`** | **anyone the GM meets in play** (`npcUpdates op:"meet"`) | ❌ **nothing** |

Veth Ondra came through the second path. So did Erik's Ent at the Crossing.

**This is why both of his reports failed**, and it is one cause wearing two faces:
- the Ent bond credited nothing → **the Ent has no domains, so there was nothing to credit**
- the teacher taught nothing → `markTeacher` now derives from `bondType:"mentor"` (CCode, shipped),
  but **the tradition is the mentor's own domain, and Veth has none**

SNG-174 gave `people` + domains to the **41 authored NPCs**. It did not — could not — reach the people
who only ever existed in a save. **That is my gap, and I flagged the shape of it in SNG-174 §3.4
without following it to this path.**

---

# §2 — OUTCOMES

1. **Every person in the registry carries domains**, or an explicit reason they cannot. A person with
   no disposition cannot be credited, cannot teach, and cannot be read — they are a name.
2. **Provenance is recorded, exactly as SNG-177 does it.** `generated` when the model says so,
   `derived` when inferred, and **derived credits at half weight**. Do not let the two paths disagree
   about how confident they are.
3. **Backfill existing saves** through `reconcile` — Veth and the Crossing Ent exist *now* in Erik's
   save and must not need re-meeting.
4. **Never invent `people`.** SNG-177's rule holds: kind cannot be inferred from position, and it is
   the one field that must stay absent rather than guessed.

---

# §3 — THE DERIVATION BASIS, AND THE TRAP IN IT

A registry-only person carries `name`, `role`, `description`, `note`, `learned[]`,
`skillsObserved[]`, and where they were met. **The evidence is not equally good, and the order
matters:**

1. **The role string is the strongest signal and should be tried first.** Veth's is *"Former
   **Ashwarden** warden, traveling companion."* The tradition is written on her. This is far better
   evidence than geography — a person is met where the story put them, not where their craft lives.
2. **`skillsObserved` and `learned` are the second read** — what someone actually *did* is what they
   practise.
3. **Region home is the fallback**, matching `generate.js`'s existing behaviour, and it is the
   weakest of the three. Mark it `derived` and mean it.

## ⛔ The trap: a role that names a PEOPLE is not a domain

Erik's ruling — **kind is what you are, domains are what you practise** — breaks a naive text match.
*"Ent"* in a role string is a **kind**, not a tradition. The three authored Ents came out with three
different dispositions precisely because their people does not determine their craft.

**A matcher that treats people-words as traditions will confidently mis-assign every Ent, dwarf and
seraph in the registry** — and that is exactly the Crossing Ent, the case that started this. The
people vocabulary and the tradition vocabulary must be matched separately and never against each
other.

---

# §4 — ACCEPTANCE

1. Erik's Veth resolves an Ashwarden domain from her own role text, marked `derived`.
2. Erik's Crossing Ent resolves `people: ent` **and** domains that are *not* inferred from being an
   Ent.
3. Re-running "Ask Veth to teach you" leaves `character.teachers` non-empty and opens the gate.
4. No person is assigned a domain the record cannot support.
5. Re-running the backfill changes nothing.

# §5 — QUESTIONS FOR CCODE

1. Is `generate.js`'s stamping liftable into a shared helper both paths call, rather than a second
   implementation? Two mint paths that disagree is how we got here.
2. §3.1 — is matching against the tradition vocabulary in a role string safe enough given §3's trap,
   or does it want the model to state the domain on `meet` (a third required-on-meet field, after
   gender and appearance — and I flagged in SNG-174 §4.3 that this list is getting long)?
3. Does the reconcile backfill want to run over `skillsObserved` history, or only the role? History is
   richer and slower.
