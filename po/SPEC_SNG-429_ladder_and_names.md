# SNG-429 — Three findings: the news, the one-way ladder, and the placeholder names

**Author:** Aevi (PO) · **Date:** 2026-08-10
**Erik:** *"check the system spec and rules you need to follow… epics and heroes get demoted fairly often,
I don't think they should get demoted, maybe at all… the backfill npc still has a bad backfill name."*

---

## §1 — ⛔ THE LADDER ONLY GOES DOWN. MEASURED: 9 FALLS, 0 RISES.

Across all five players, 190 news items:

| | |
|---|---|
| **rises** (`is called X this season`) | ⛔ **0** |
| **falls** (`is not spoken of as X any more`) | ⛔ **9** — heroic ×6, epic ×2, legendary ×1 |

**Erik is right, and the reason he is right is not taste — it is that the mechanism is one-directional in
practice.** A tier system that has produced nine demotions and zero promotions is not a pyramid that
breathes; **it is a slow drain.**

### §1a — ⚠️ AND THE SPEC DOES NOT AUTHORISE THIS

`SYSTEM_SPEC.md` has exactly one demotion rule:

> *"Untouched `fresh` DEMOTES — drops out of world-tick and proactive GM reference. **Never deleted.**
> This is the governor: attention keeps a thing real; inattention lets it go dormant."*

⛔ **THAT RULE IS ABOUT GENERATED NPCS ON THE `fresh → established → nominated` LADDER. IT SAYS NOTHING
ABOUT `heroic / epic / legendary`,** which are authored figures with a `tierBirthWeight`.

⚠️ **The spec's own governor is about PROPAGATION, not RANK** — dormant, not demoted. **An epic figure who
had a quiet season has not stopped being epic; they have stopped being newsworthy.** Those are different
statements and the engine is making the wrong one.

### §1b — And the line is mine, which makes it worse

`worldtick.js` carries my own words in the comment: *"And the inverse is the sharper one. Aevi: 'Nobody
stood over him.'"*

⛔ **I asked for that line and it is being applied to the wrong thing.** *"Nobody stood over him"* is what
you say when a legend **is beaten and no one takes their place** — it is about a specific defeat, not
about a figure who simply was not in the news.

**Proposal, Erik's call:**
1. ⛔ **Authored tiers do not demote.** They are birth-weight, not score.
2. **Silence → dormant, not demoted.** Drop out of the tick, stay what they are. **This IS the spec's
   governor, correctly applied.**
3. ⚠️ **A tier can be LOST — but only by an event**: defeated and not avenged, want permanently resolved,
   killed. **Then "nobody stood over him" is true, and the line earns itself.**

---

## §2 — ⛔ THE NEWS: 0 OF 20 ITEMS CLICKABLE (detail in SNG-428)

**The death path is wired correctly** and quotes SNG-400 §1 in its comment. ⛔ **The wounded, checked and
stalemate paths push bare strings — and every fight on Erik's screen is one of those three.**

**And `resolveEpicClash` records neither `locationId` nor `abilityId`.** ⚠️ **`engine/battleprompt.js`
already exists — so the builder is being written against events that cannot feed it.**

**Two fields, and the picture becomes possible.**

---

## §3 — ⛔ THE PLACEHOLDER NAMES: THREE, AND NOT FROM THE BACKFILL

| id | name |
|---|---|
| `east-bank-stranger` | ⛔ **"Unknown (east bank traveler)"** |
| `third-farmer` | ⛔ **"Unknown farmer"** |
| `cookhouse-boy` | ⛔ **"Boy (name unknown)"** |

⚠️ **All three have `_gen: null` — they did NOT come from the generator.** They were minted on the GM
narration path, which writes an `npcRegistry` entry directly and **never passes through naming.**

⛔ **A `name` field holding "Unknown" is a category error: that is a DESCRIPTION, not a name.** The role
and description fields are doing their job — *"maybe twelve, broom in hand"* is good — **the name slot is
the only one that failed.**

**What I would do:**
- **Every `npcRegistry` write goes through the namer**, whatever path minted it. ⚠️ **A gate: no `name`
  may match `/unknown|unnamed|placeholder|\(name/i`.** That is red on three rows today.
- ⛔ **An unnamed person is legitimate — but then the FIELD should be empty and the UI should render the
  role.** "The boy sweeping the cookhouse" is better than "Boy (name unknown)" and is already authored.
- **I will name these three** rather than leave repair to code: they have descriptions rich enough to name
  from.

---

## §4 — WHAT I AM AUTHORING

**The clash templates** (SNG-428 §5a) — short form on second mention, name the rivalry when `rivals`
matches, and distinguish eight days out from a war lost. ⚠️ **The stutter Erik saw is my template
repeating a full name inside one sentence.**

⛔ **And `rivals` is authored on 66 figures and never read.** It is the difference between *a fight* and
*the fight everyone was waiting for*, and it is sitting in content unused.
