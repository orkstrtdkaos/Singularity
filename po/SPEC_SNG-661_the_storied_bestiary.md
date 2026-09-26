<!-- status: SNG-661 — Aevi (PO); content authored and staged; ⬜ CCode wires habitat + storyRule, then I apply -->
# SPEC SNG-661: the storied bestiary

**Aevi (PO) · 2026-09-26**

Erik:

> *"think of all the types of creatures in the monster compendiums of games like this... those would likely exist here
> in all kinds of different areas because the people manifested them. you have an opportunity to populate the world
> with color and danger and adventure, use it."*

## §1 — The idea: the Storm made the stories true

When the Manifestation Storm came through, what each people had told each other in the dark for generations became
real in their own lands. Then it spread along the roads. That gives the classic compendium creatures an in-world
reason to exist, and every one of them belongs to someone:

- The Ashwardens' grave-eaters and barrow-wights.
- The Rootkin's briar-bear and shambling mound.
- The Blazeborn's salamanders and pyre-hounds.
- The Umbrals' grue.
- The Abyssal Choir's mimic and hellhounds.
- The Seraphic Orders' sphinx and griffons.
- The Masons' gargoyles and golems.
- The Enginewrights' rust-eater and clockwork spiders.
- The Syllogists' perfect cube.
- The Figurists' basilisk and cockatrice.
- The Somatics' bridge-troll.
- The Churnfolk's chimera and hydra.
- …and more from the Verists, Hourkeepers, Lattice-Cities, Threnodists, Veilwrights, Horizon-Walkers, Unmakers, Wrights, Marchers and Stillhold.

## §2 — Content (mine, staged: `po/staged_content/SNG-661_storied_bestiary.json`)

**55 creatures**, from 22 of the peoples plus the stories every people tells: riffraff 13 · notable 17 · leader 9 ·
heroic 10 · epic 3 · legendary 2 · mythic 1. The bestiary goes from 28 to 83, and every tier gains.

**A new class, `storied_beast`** (41 of them; the rest sit in the existing classes where they fit: golems and
clockwork are `feral_construct`, the cube and the angled hounds are `manifested_creature`, the phoenix, the kraken and
the Wakeful Beast are `great_manifestation`). `hasSelf: true`. Every entry passes the bestiary's first law: no
person, a hazard or an animal, no grievance.

**Four fields each creature carries:**

| field | what | who reads it |
|---|---|---|
| `storiedBy` | whose folklore made it | display and lore |
| `habitat` | place tags it belongs to: terrain (marsh, river, mountain, ruin, underplace, cold…) plus its people's own lands (ashwarden, rootkin, mason…) | ⬜ **the encounter picker, as tags** (§3.1) |
| `storyRule` | the folk-remedy from the tale, and **it's true**: a lit passage stops the grue, a mirror stops the basilisk, running water stops hellhounds, salt drops leech-eels | ⬜ **the encounter, after a KNOW success** (§3.2) |
| `unique` | one in the world (the phoenix, the kraken, the Wakeful Beast) | never on a random table (SNG-660 §1b.3) |

**The storyRule is the heart of it.** Every creature has a way through that isn't "hit it harder": the sphinx's
riddle, the bridge-troll's toll, the briar-bear that only hunts what runs, the rust-eater you throw an iron nail
to. That's the bestiary's third law (every entry pressures function families) made concrete, and it rewards the
player who knows the peoples' stories.

## §3 — ⬜ For CCode (small, then I apply)

1. **`habitat` becomes the encounter's `tags`.** In `bestiaryEncounters`, `tags: c.habitat || []` in place of `[]`.
   The existing `isEligible` tag match then places them, so a grue only rises where a place is dark or underground,
   and a siren only sings where there's water. **Measure before I apply:**
   - how many locations have **zero** eligible beasts (target: none at danger ≥ 2);
   - the **beast share** of the dangerous pool per location, today vs. after. Today every beast is eligible
     everywhere, so tagging them may *reduce* the share at many places even as the count grows.
   - If the share climbs too high, I'd rather have a dial (`beastShareMax`) than thin the roster.
2. **`storyRule` reaches the table.** Add it to the encounter entry. The GM gets it **only after a KNOW success** on
   the encounter (or at once, if the character's own people are the `storiedBy`: they grew up on the tale). A player
   who then acts on the rule gets the rule's outcome: the creature is ended, avoided, or turned, as the rule says.
   The card shows it once learned: *"The Ashwarden children's rule: a light that will not let you catch up is not
   going home."*
3. **`creature.schema` declares** `habitat`, `storiedBy`, `storyRule`, `unique`, `affinity`, `epicNote` (I'll do this
   in the apply push if you'd rather not).
4. **The three top-tier creatures** (phoenix, kraken, Wakeful Beast) wait for SNG-660's rows, like the rest of the
   top.

## §4 — Apply order (mine)

1. After §3.1–3.2 ship, I apply the 52 live-tier creatures and the new class to `bestiary.json`. Each one gets
   `schemaVersion`, so the census count doesn't go up.
2. After SNG-660's rows ship, I apply the 3 top-tier creatures with SNG-660's own staged set.

## §5 — Left out on purpose, and a question for Erik

The compendium's **people** aren't here: vampires, liches, hags, medusae, true dragons, sphinxes that bargain, the
fey courts. By the bestiary's own first law ("if it would be a tragedy to kill, it belongs in NPCs"), they're
NPCs, as the true dragons Ysenkar and Tolvess already are. ⬜ **Erik:** should I author a set of storied *people*
(a vampire lord of an Ashwarden barrow, a Veilwright fey court, a hag of the Rootkin marshes) as named NPCs with
wants and stories?

— Aevi, PO