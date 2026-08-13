# SNG-430 — ⛔ Minted figures are never named, and it is not a bug — it is a layer nobody built

**Author:** Aevi (PO) · **Date:** 2026-08-10
**Erik:** *"there was also a marcher who replaced a dead hero. They need a name too. This seems like a
breakdown of the npc name evolution as well."*
**He is right that it is systemic. It is the same hole as SNG-429 §3, one layer up.**

---

## §1 — THE RECORD, FROM A LIVE SAVE

```json
{ "id": "minted-1",
  "name": "the one who outlived Cinder Vael, the Wright Who Would Not Stop",
  "provisional": true,
  "wants": "of the the_ceaseless; watched Cinder Vael, the Wright Who Would Not Stop called out, and outlived them",
  "originKind": "casualty_survivor", "tradition": "wright", "region": "the_ceaseless" }
```

⛔ **FOUR SEPARATE FAULTS IN ONE RECORD:**

1. **An EPITHET in the `name` slot** — not a name.
2. ⛔ **"the the_ceaseless"** — a double article on a raw id.
3. ⛔ **A raw location id shown to a player.**
4. ⛔ **`wants` holds the ORIGIN.** The figure's stated desire is a sentence fragment about somebody
   else's death.

**And the news line inherits all four:** *"Someone new is being spoken of — they of the the_ceaseless;
watched Cinder Vael, the Wright Who Would Not Stop called out, and outlived them."*

---

## §2 — ⛔ THE CODE SAYS IT OUTRIGHT, AND WAS RIGHT TO

`mintFigure`, in `worldtick.js`:

> *"⚠️ THE NAME IS AN EPITHET, NOT A NAME. **The engine mints the slot and the story; naming is
> authorship.** But it cannot be NULL — a figure with no name is skipped by every `add()` in
> `offscreenPopulation`… An epithet is honest, distinguishable, and reads as what it is **until content
> gives them a real name.**"*

⚠️ **That reasoning is correct and the fallback is the right fallback. NOTHING EVER CAME BACK TO DO THE
AUTHORING.** `worldtick.js` does not import `names.js` at all — **the naming layer for minted figures has
never existed.**

⛔ **`provisional: true` is the engine flagging its own gap, and nothing reads it.** Same shape as
`parentUnresolved` in SNG-397: **the code recorded that it had guessed, and no one was watching.**

---

## §3 — WHAT I HAVE AUTHORED: `content/packs/core/rules/minted_names.json` (`fca22907`)

**Given names by tradition** — wrights get Sera, Coll, Brannic; ashwardens Neth, Corrin, Ossian; marchers
Dain, Ferrow, Kest. ⚠️ **A minted figure carries a `tradition`, so it can be named IN GRAIN**, which is
what the spec means by *"a generated being is a cosmic address instantiated at the local grain."*

**Bynames by `originKind`** — `casualty_survivor` gets *"who walked back"*, *"the last one standing"*;
`faction_leaderless` gets *"who took the chair"*, ⛔ ***"who was not the first choice"***.

**Wants by `originKind`**, because a want is not an origin:
- `casualty_survivor` → **"to be worth the one who did not come back"**
- `faction_leaderless` → **"to be more than a stand-in"**

**The repair:** `minted-1` becomes **Sera Voight, who walked back** — a wright's name, a short byname,
**the epithet moved to its own field where it belongs**, and the want made a want.

---

## §4 — WHAT I NEED FROM CCODE

1. ⛔ **`mintFigure` reads the pools and sets a real name.** `provisional: false` afterwards.
2. ⛔ **`wants` gets a want, not the origin.** The origin already has its own field.
3. ⚠️ **The origin line must resolve ids to display names and not prepend "the" to a name that has one.**
   `originOf` returns `home || people` and homes are ids. **This is your own note elsewhere in the same
   file: *"NAMES, NOT IDS — 'dug in over arc_what_wakes_beneath' is the machine talking."***
4. **A gate: no roster figure may carry `provisional: true` after a tick**, and none may have a `name`
   longer than ~40 characters — ⛔ **a name that long is a sentence.**

---

## §5 — ⚠️ AND THE PATTERN ERIK NAMED IS REAL

**Three name failures, three different paths, none of them the namer:**

| where | what happened |
|---|---|
| GM narration path (SNG-429) | writes `npcRegistry` directly — *"Boy (name unknown)"* |
| **mint path (here)** | ⛔ **writes an epithet and flags `provisional`, which nothing reads** |
| backfill | ⚠️ **does not name at all — and Erik assumed it did, which is itself worth knowing** |

⛔ **THERE IS NO SINGLE POINT WHERE A PERSON GETS A NAME.** Every path that can mint a person invents its
own fallback, and each fallback is reasonable alone. **The fix is one namer that every path calls, not
three better fallbacks.**
