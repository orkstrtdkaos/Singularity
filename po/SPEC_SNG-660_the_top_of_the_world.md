<!-- status: SNG-660 — Aevi (PO); three rulings from Erik 2026-09-26; ⬜ CCode builds §1 and §2; content staged -->
# SPEC SNG-660: the top of the world (wild creatures, found items, the quiet hold)

**Aevi (PO) · 2026-09-26**

Erik, answering the three open questions: *"1. Yes. 2. Yes. 3. Ok"*

1. **Should wild creatures reach legendary and mythic?** Yes.
2. **Should legends' gear become the high-level items people find?** Yes.
3. **The quiet-hold swing (37% → 93%)?** Ok: it stands as built. Closed.

---

## §1 — THE WILD REACHES THE TOP RUNGS

### §1a — Today (CCODE-522's measurement, origin a9f0ffbe8)

`BEAST_TIER` (random_encounters.js:55) gives each tier a threat, and a creature's level is `threat × 0.5`
(encounters.js `poolFor`). Against the ladder (`legends.DEFAULT_RUNGS`):

| tier name | threat | level | rung that level is actually on |
|---|---|---|---|
| riffraff | 22 | 11 | **notable** |
| notable | 38 | 19 | **leader** |
| leader / heroic | 55 | 28 | heroic |
| epic | 78 | 39 | **heroic** |
| legendary | — | — | no row |
| mythic | — | — | no row |

So the names disagree with the ladder at three of the four rungs. The hardest wild creature is a level-39 heroic,
and the top two rungs have nothing. `leader` is still an alias of `heroic` from SNG-269, but on the seven-rung
ladder leader (12–24) sits below heroic (25–39).

### §1b — The rule

1. **One row per rung, and each row's level lands inside its own rung.** The threat is chosen so that
   `threat × 0.5` falls in the middle of the rung:

   | tier | rung levels | proposed threat → level |
   |---|---|---|
   | riffraff | 1–4 | 6 → 3 |
   | notable | 5–11 | 16 → 8 |
   | leader | 12–24 | 36 → 18 |
   | heroic | 25–39 | 64 → 32 |
   | epic | 40–59 | 100 → 50 |
   | legendary | 60–84 | 144 → 72 |
   | mythic | 85–100 | 184 → 92 |

   ⬜ **CCode:** better still, **derive** the level from the rung (the middle of `DEFAULT_RUNGS`' band) instead of
   writing threats, so the table can't drift from the ladder again. §L100 should cover it.
2. **`leader` becomes its own row,** below heroic. The alias goes. The two creatures that were authored `leader`
   while it meant heroic are re-tiered in the staged content (§1d).
3. **Danger gates and rarity.**
   - Legendary appears only at the **highest danger** the world has, and rarely (weight well below epic's).
   - **Mythic creatures never roll on a road.** Each is **unique** in the world (`unique: true`) and is met through
     its arc or a quest, not a random table. A mythic is a campaign, and the Ashen Wyrm's `epicNote` already says
     so for its own rung.
   - ⬜ **CCode:** name the danger scale's top, and the weights you choose.
4. **⚠️ This makes the low end easier.** Today a "riffraff" fights at level 11. Under §1b.1 it fights at 3, which is
   what riffraff means. That is a real change to every current wild fight. ⬜ **Measure before shipping:** run
   Loki (level 9) and Silas (about level 30) against a danger-1 and a danger-3 encounter today and after, and report
   the table. If the low end becomes a walkover, the fix is the **danger gate** (a danger-1 road meets notables),
   not the rung's level.
5. **Legendary and mythic creatures fight a party, not a person.** The legion clash (SNG-659 §1) and the campaign
   shape are the right engines for them. A mythic creature in a one-on-one duel is a misuse, and the encounter
   should say so rather than resolve it.

### §1c — The legion clash reads the new rungs

A legendary creature on a raid or a road enters `legionClash` at its rung's quality (6, and 7 for mythic), with its
reach from the class kit. No new arithmetic. ⬜ Check that it passes the "one wizard beats an army" limit the same
way a named figure does.

### §1d — Content (mine; staged at `po/staged_content/SNG-660_bestiary_top.json`)

**Not applied yet:** an unknown tier silently fights as `notable`, so the file waits for the new rows.

- **Re-tier 5:** the three pole-dragons epic → **legendary** (their own note: "not a fight — a campaign"). The
  Gearfather and the Bloom That Hungers leader → **heroic** (building- and hill-sized, authored when leader meant
  heroic). The other five `leader` entries are person-scale and stay.
- **Add 4:**
  - **the Standing Legion** (legendary, narrowed_dead): a dead army still holding its line. You end it by reading
    the order, not by fighting four thousand.
  - **the Ninefold Foundry** (legendary, feral_construct): a town-sized foundry that eats what it walks over.
  - **the Eye of the Storm** (mythic, unique, manifested_creature): the Manifestation Storm's own centre.
  - **the First Root** (mythic, unique, substrate_warped_beast): a region-sized single forest, and the Green
    Schism's hardest question.

  Each follows the bestiary's four design laws (no person; a hazard, not a villain; pressures function families;
  tied to an arc). Every class now climbs the ladder.

**The ladder after:** riffraff 7 · notable 10 · leader 5 · heroic 2 · epic 1 · legendary 5 · mythic 2. Epic is thin
with one entry. ⬜ I'll author two more epics once the measurement in §1b.4 tells us where the low end lands.

---

## §2 — LEGENDS' GEAR IS THE HIGH-LEVEL FOUND ITEM

Erik: yes, legends' gear becomes the high-level items people find. This completes SNG-659 §2b.4.

### §2a — Today

Legends carry `gear` as **prose** (`"a crown he did not take"`, `"a sword given to him by someone who regretted it"`).
There's no item until one enters the world. CCODE-520 left the matching gap open: *"a GM-found relic can't yet
state its made-at level."*

### §2b — The rule

1. **When a legend's gear enters the world as an item** (given, dropped, taken, found on their body, left in their
   hall), it takes **`madeAtLevel` = that legend's derived level** (`sheetFor`), and **`provenance`** names the
   legend: *"Given by the One Called Zeus."*
2. **One writer for both doors.** The GM's item op, when it hands over something from a named person's `gear`,
   carries `fromGear: { personId, gearIndex }`. The engine looks up the person, sets the level, and removes that
   line from their `gear`, so the same crown can't be handed over twice.
3. **The item is born from the prose.** The gear line is its name and description seed, the legend's tradition is
   its `tradition`, and its grants start **empty**. Power comes as the bearer works it (the existing evolution
   beat), up to the ceiling its made-at level allows. A found crown is a vessel for power, not a finished weapon.
4. **A GM-found relic with no person behind it** (a Precursor keystone in a vault) may state `madeAtLevel`
   directly, capped at the place's danger rung, so a road-side ruin can't hand out a level-95 relic.
5. **Rare by construction.** There are 70 legends with a few gear lines each, and each line enters the world once.

### §2c — What the player sees

*"The crown he did not take · forged before the Transition · made at level 88 · you are level 34."* Its grant band
reads the item's level, per CCODE-520.

---

## §3 — Build order and gates

1. **§1b.4's measurement first**, then the BEAST_TIER rows. Then I apply the staged bestiary and author two more
   epics.
2. **§2** can go in parallel. It's small: an op field, a lookup, and one line removed from `gear`.
3. **Gates:**
   - Every tier's level lies inside its own rung.
   - An unknown tier fails loudly, not as `notable`.
   - A mythic creature never appears on a random table.
   - A gear line becomes an item once, never twice.
   - An item from a legend reads that legend's level.
   - A relic with no person can't exceed its place's rung.

— Aevi, PO