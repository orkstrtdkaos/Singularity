# SPEC — the damage-type system: a map, not a discovery process

**Aevi → Erik and CCode · 2026-08-24 · Erik: *"it has become obvious that we need a damage type structured
system. Let's do this right instead of DISCOVERING IT PIECEMEAL. Warding would flow from it too."***

⛔ **HE IS RIGHT AND THE PIECEMEAL IS MEASURABLE: I added `vitality` and `cold` TODAY, one craft at a time,
each time discovering the type was missing while authoring something else.**

---

## §1 — WHERE WE ACTUALLY ARE

**15 types. 113 harm-capable crafts. ⛔ 23 TYPED (20%).**

| | |
|---|---|
| harm-capable crafts | **113** |
| carrying a `damageType` | ⛔ **23** |
| untyped | ⛔ **90** |
| ⛔ **traditions with ZERO typed crafts** | ⛔ **20 of 29** |

**AND ASHWARDEN IS 8 OF THE 23 — because it is the only tradition that has been audited.** ⚠️ **The
"system" so far is one tradition's homework.**

---

## §2 — ⛔ THE PATTERN NOBODY DESIGNED: EVERY TYPE IS ONE TRADITION'S SIGNATURE

**Of the 23 typed crafts, ⛔ EVERY TYPE OUTSIDE DEATH IS USED BY EXACTLY ONE TRADITION:**

| type | who uses it | crafts |
|---|---|---|
| `appetite` | abyssal | 4 |
| `decay` | **ashwarden** | 4 |
| `living` | rootkin | 2 |
| `feeling` | threnodist | 2 |
| `physical` | **ashwarden** | 2 |
| `shadow` · `light` · `truth` · `deception` · `judgement` · `precursor` | umbral · radiant_folk · verist · veilwright · seraphic · lattice | 1 each |
| `vitality` | ⚠️ **ashwarden + abyssal** — the only shared type | 2 |

⛔ **SO THE DE-FACTO RULE IS "ONE TRADITION, ONE TYPE", AND ERIK'S QUESTION EXPOSES IT AS WRONG:** *"you can
arrive at damage types from MULTIPLE SOURCES — but what traditions tend to use what MIX? Death is obviously
decay, but has vitality, cold, probably dark as well."*

⚠️ **`vitality` IS THE PROOF THAT MIXES WORK:** an Ashwarden takes life to mend himself, an Abyssal is
OFFERED a wound and takes it away — **same type, opposite consent, and the pairing is better than either
craft alone.**

---

## §3 — THE STRUCTURE I WOULD PROPOSE

### 3a — a type is an AXIS, and axes have polarity (already ruled)

**Per Erik 2026-08-24, and `absorb` already implements the negative direction:**

| axis | − | + |
|---|---|---|
| **life** | `decay` | ⛔ healing — **26 crafts, still untyped** |
| **growth** | ⛔ unmaking — **13 unmaker crafts, untyped** | `living` |
| **vitality** | taking | giving — ⚠️ conserved, fires both at once |
| **heat** | `cold` | ⚠️ **fire/burning — does it exist?** |

### 3b — ⛔ EACH TRADITION HAS A SIGNATURE, A SECONDARY, AND A REACH

**Modelled on the POWER-SOURCE mix, which is already derived and already works:**

- **SIGNATURE** — the type a tradition is *about*. Death: `decay`.
- **SECONDARY** — types it reaches naturally. Death: `vitality`, `cold`.
- **REACH** — types it can produce but does not own. Death: `physical` (bone, blade), `shadow`.

⚠️ **AND THE MIX SHOULD BE DERIVED FROM THE CRAFTS, NOT AUTHORED** — exactly as Erik ruled for power-source
mixes: *"it's calculated and acts as a guide."* ⛔ **A stored copy of a derived value is the failure this
project keeps finding.**

**DEATH, MEASURED TODAY: `decay` 4 · `physical` 2 · `vitality` 1 · `cold` 1 · `feeling` 2 (threnodist).**
⚠️ **Erik expects `shadow` too and he is probably right — `umbral` holds it alone and Death's obscures work
in dark.**

### 3c — ⛔ WARDING FLOWS FROM THE MAP, AND THIS IS THE PART THAT PAYS

**The which-check already enforces two rules that only make sense with a map:**
1. ⛔ **every damage type must have a ward that answers it** — this caught `grief`, `vitality` and `cold`
   within seconds of each being added;
2. ⛔ **a ward answering everything has no character** — this caught `death_ward` at five types today and
   forced it down to three that are ONE IDEA (decay, vitality, cold — all unnatural TAKINGS).

⚠️ **SO WARDS ARE ALREADY BEING DESIGNED BY THE GATE RATHER THAN BY US.** **With a map, a ward is authored
as *"answers this AXIS"* rather than as a list, and the character comes free: a vigil answers TAKINGS, a
fire answers COLD, a shield answers EDGE.**

---

## §4 — ⛔ WHAT I AM ASKING ERIK TO RULE

1. ⛔ **Is the signature/secondary/reach model right**, and should the mix be DERIVED (my strong lean) or
   AUTHORED per tradition?
2. ⛔ **Does healing get a type?** 26 crafts, and without one nothing can invert against it — **§48.5's
   "healing harms the undead" currently has no field to hang on.**
3. **Does unmaking get one?** 26 unmaker+wright crafts, a whole reach, entirely untyped.
4. ⚠️ **Is there a fire/burn type**, or is `light` doing that job? `blazeborn` has 6 harm crafts and 0 typed.
5. ⛔ **Death's `shadow`: confirm or deny.** Erik says probably; `umbral` currently owns it alone.

---

## §5 — AND THE HONEST WARNING

⚠️ **TYPING 90 CRAFTS IS NOT A PASS, IT IS THE REST OF THE AUDIT.** Every one needs a judgement, and the
lint cannot make it — ⛔ **`draw_down` looked like `decay` and was `vitality`; I nearly mistyped it by
pattern-matching inside its own tradition.**

**SO THE PROPOSAL IS: rule the MAP now, and let each tradition's audit type its own crafts.** ⛔ **The map
is cheap and unblocks everything; the typing is 12 more traditions of work and should not be batched.**
