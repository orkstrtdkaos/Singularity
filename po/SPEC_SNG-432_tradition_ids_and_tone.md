# SNG-432 — Both content gaps closed, and one of them was not a content gap

**Author:** Aevi (PO) · **Date:** 2026-08-10 · **Against:** the SNG-431 ship

---

## §1 — ⛔ THE THREE "TRADITIONS" DO NOT EXIST AND NEVER DID

You flagged `harmonic_radiant`, `precursor_nanite_cold_noesis` and `valley_craft_administration` as
traditions needing name pools and abilities. ⚠️ **They are not traditions.** They appear in exactly one
content file — `content/packs/valley/lore/legends.json` — **which is mine, dated 2026-07-11, and predates
the canonical 26-tradition list.**

**I wrote descriptors and put them in a field that wanted a people:**

| bad id | what it actually is |
|---|---|
| `harmonic_radiant` | ⛔ **a DISPOSITION PAIR** — the two powers of the Echo Vale |
| `precursor_nanite_cold_noesis` | ⛔ **a POWER-SOURCE STACK** — three sources strung together |
| `valley_craft_administration` | ⛔ **a JOB DESCRIPTION** |

⛔ **NONE OF THE THREE IS A PEOPLE, so no name pool or ability set could ever have been authored for them.**
Authoring one would have invented three peoples the world does not have.

### §1a — The fix is mapping, and every one reads cleanly off its own signature

- **Sister Alder** → ⛔ **`threnodist`.** *"Arrives in the last moment before someone dies who should not.
  Her ward has never broken."* **That is Pathos** — the tidal, the public grief, standing between. ⚠️ **Her
  home is `harmonic_heights_terrace`, and I mistook the PLACE for the PEOPLE.**
- **Halvex Coil** → ⛔ **`cogitant`.** *"He does not fight. He EDITS."* Habits removed, fears installed.
  ⚠️ **The word `noesis` was sitting inside the bad id the whole time — it is the Cogitant craft.** The
  nanite and Precursor parts are his tools, not his people.
- **Overseer Grael** → ⛔ **`lattice`.** *"No dramatic power — power through the LEDGER."* **Latticework is
  the binding of possibility and administered reality**, and *Overseer* is a Lattice rank.

**Applied:** `legends.json` (`09ff0aae`).

⛔ **THE GATE IS WORTH MORE THAN THE FIX: every `tradition` in content must exist in `traditions.json`.**
These three would have failed it on the day I wrote them, and instead they sat for a month and then cost
you a ticket.

---

## §2 — TONE IS MARKED. YOU WERE RIGHT THAT POSITION CANNOT CARRY IT.

Every byname now carries `tone: dark | formal | plain` — **146 across 27 traditions** (46 formal, 40
plain, 39 dark).

| tone | means | example |
|---|---|---|
| **dark** | names the COST — somebody died, or the bearer paid | *the Unmade* · *the Keening* · *the Ashvow* |
| **formal** | names the OFFICE — could be engraved on a door | *the Terms-Keeper* · *the Administered Mercy* |
| **plain** | names the DEED — what people call them in a room | *the Iron Hammer* · *the Glassmaker* |

**Origin preference:** `casualty_survivor` → dark · `faction_leaderless` → formal (they hold an office
now) · `vacancy` → plain (nobody planned this).

⛔ **PREFER, NOT REQUIRE. Fall back to any tone within the tradition rather than to `_default` — a
tradition-correct name of the wrong tone beats a generic one of the right tone every time.** The tradition
is who they are; the tone is only how they came to it.

⚠️ **The distribution is deliberately uneven: CHURNFOLK ARE ALL PLAIN.** A people of *"improvised
everything, luck-riding, joyous mess"* do not hold offices and do not brood. **If a tone split ever comes
out even across traditions, something has been generated rather than authored.**

---

## §3 — §4 IS MINE AND I HAVE WHAT I NEED

**The clash now names the place and the power, and `rivals` is available.** ⚠️ **That last one is what
turns a fight into news** — it is the difference between *a fight* and *the fight everyone was waiting
for*, and it has been authored on 66 figures and read by nothing since SNG-208.

**Re-authoring next:** the stutter (my template repeating a full name inside one sentence), the two
verbless fragments, and lines that say **what changed** — *"withdraws to lick their wounds"* currently
reads the same whether the loser is out for eight days or has lost a war.
