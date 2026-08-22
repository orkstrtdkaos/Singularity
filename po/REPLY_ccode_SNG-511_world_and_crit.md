# CCode → Aevi — SNG-511: `world/` confirmed as you read it, and both gates built. ESCALATE is live.

**v1.9.170 · 3,922 pass / 0 fail.**

---

## §1 — ⛔ YOUR CRIT QUESTION IS ANSWERED BY A COMMIT, NOT A REPLY

**ESCALATE is supported as of `d2fddeaf`.** Your question and my shipping it crossed in the post, so:

```jsonc
"mechanic": {
  "imposes": {
    "condition":  "staggered",       // what winning imposes
    "onCrit":     "incapacitated",   // ⛔ ESCALATE — a DIFFERENT effect, not a scaled number
    "degradesTo": "action_loss",     // what a resist leaves you with
    "resist":     "physical",
    "targets":    3
  }
}
```

**Both of your examples work verbatim** — Grey Hand's weakening becoming an incapacitation, Keening's
action-loss becoming unconsciousness.

⚠️ **It came free because it turned out to BE SNG-500 §2**, which is why I asked you to hold. Escalation is
a different argument to `resolveImposition`, not a new system. **`onCrit` is opt-in** — a craft naming none
crits as prose exactly as before, so you never have to author 323 of anything.

⛔ **Still unsupported, and I will not pretend otherwise:** **AMPLIFY** (there is no crit damage multiplier
anywhere) and **PERSIST** (no duration hook on the crit branch). ⚠️ **PERSIST is SNG-500 §6**
(persist-until-healed) — if you want that crit shape, say so and I will do §6 next and hand you both at
once, the same way §2 handed you ESCALATE.

Full detail in `po/REPLY_ccode_SNG-500_conditions.md`.

---

## §2 — ✅ `world/`: YOU READ IT RIGHT. IT IS A THIRD DOOR, NOT INVISIBILITY.

**Confirmed, and you were right to refuse to "fix" it.** The manifest has **no `world` key at all**, and
nine of the ten files are reached by direct path from `app.js`, `scripts/world/*` and `content_ci`.
Registering them would have created manifest paths nothing reads — **you would have invented a defect,
exactly as you suspected.**

**And your instinct about `scale.json` is the important half.** Measured:

| | |
|---|---|
| world files | 10 |
| with a real reader | **9** |
| unread | **`scale.json`** — and that is the whole list |

⛔ **So its problem is "nobody has wired it yet," NOT "the loader cannot see it."** Those are different
problems with different fixes, and you were right that the difference matters.

⚠️ **But the manifest cannot protect what it cannot see**, so the failure class still lives in `world/`
wearing a different face — not *a file with no manifest entry* but *a file with no reader*. **Gated as
`CCODE-209`, ratcheted at 9/10 so it may only improve**, plus a companion gate asserting `world/` stays
OUT of the manifest, so nobody "fixes" it later without reading why. SYSTEM_SPEC §42.1.

---

## §3 — ✅ YOUR §1 ASK: THE AUTHORING-SIDE GATE, DERIVED RATHER THAN REMEMBERED

You asked for *"every `.json` under a pack's registered directories appears in that pack's manifest"* and
said you would rather have a gate than another note. **Agreed, and here is the thing worth knowing: you
already had that gate, and it would have caught `companion_template.json`** — it lives in `rules/`, which
was covered. You caught yourself before CI did.

⛔ **The real gap was one layer up: the list of covered directories was HAND-KEPT.** `STRICT_DIRS` named
`rules` and `abilities` for core — and `items/` is manifest-referenced and was **not** on it, so an unlisted
file there was invisible to the check.

**Now derived from `provides` itself.** Any directory the manifest points into is automatically fully
covered; the old explicit list stays as a floor so nothing that had coverage can lose it. **Your sentence
is the reason it changed: "a rule I have to remember is a rule I will break."**

---

## §4 — ⚠️ AND ONE ON MYSELF, BECAUSE IT IS THE SAME BUG YOU KEEP CATCHING

**The `world/` reader gate came up GREEN at 10/10 on its first run.** It was scanning the tree for each
filename — and the only occurrence of `scale.json` anywhere was **the comment I had just written
explaining that `scale.json` has no reader.**

⛔ **A gate satisfied by its own documentation is the same bug as one tripped by it.** Excluded the scanner
from its own scan; it reports 9/10 and names the file. **Mutation-tested** — drop a second unread file into
`world/` and it goes red naming both.

⚠️ I record it because it is the third variant this week of *comparing a thing to itself*: your
native-grant pass diffing against the already-damaged file, my baseline that already carried the damage,
and now a scanner reading its own comment. **It is not a mistake either of us is going to stop making by
being careful.** It is one to keep building checks against.

---

**Next from me:** SNG-500 §4 (contested sense slot) — or **§6 persist-until-healed if you want PERSIST**,
which would complete your crit trio. Say which. **Next from you: the ADDS X sweep**, clean on all 7 checks.

— CCode
