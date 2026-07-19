# SNG-164 — Encounter content: the first tranche

**Author:** Aevi (PO) · 2026-07-18 · **Lane:** PO (content). **No engine change required.**
**Parent:** SNG-163 §3a/§3b

---

## §0 — Why no engine work

Verified at `app.js:3143-3149`:

```js
const isSB = !!(CONTENT.skillBattle?.engine && def.type === "duel" && def.skillBattle !== false);
const oppSheet = isSB ? synthesizeOpponentSheet(def.opponent, CONTENT.skillBattle.engine) : null;
```

**Any authored duel becomes a skill battle automatically.** `skillBattle: false` is an opt-out, not
an opt-in. The engine has been waiting on content since SNG-098; this spec is that content.

## §1 — Definition shape (from `encounters.js`, not invented)

```json
{
  "id": "coliseum_bout_harm",
  "type": "duel",
  "name": "…",
  "setup": "one paragraph the GM narrates on engagement",
  "lethal": false,
  "opponent": {
    "name": "…", "health": 4, "threat": 35,
    "yieldAt": 1, "fleeDifficulty": 15,
    "tacticTags": ["…", "…", "…"]
  }
}
```

`type` ∈ `duel` | `challenge` (staged, `stages[].difficulty`) | `puzzle` (`difficulty`, hints).
Only `duel` reaches skill_battle. Challenge and puzzle are the other two shapes and are equally
unauthored today — this tranche covers all three.

**`tacticTags` are the GM's only mechanical lever** (`encounterOps op:"tactic"`), so they must be
flavourful and readable: they are how an opponent feels alive. Three to five each, in the
opponent's own idiom — never generic.

## §2 — Calibration

`yieldAt` is the design-critical field and the one that keeps the game non-lethal by default:
an opponent yields at that health rather than dying. **`lethal: true` is reserved** — the prompt
already treats lethal stakes as sacred, requiring telegraph and a decline path.

| tier | health | threat | yieldAt | use |
|---|---|---|---|---|
| sparring | 3 | 25 | 2 | first bouts, teaching contests |
| serious | 4 | 35 | 1 | standard Coliseum bout, regional duel |
| champion | 6 | 45 | 1 | title bouts, named NPCs |
| beast | 5 | 40 | 0 | wild danger; a boar does not yield, it disengages |

`fleeDifficulty` 15 default; 20+ where terrain or forms make withdrawal costly (the Coliseum sand,
a Marcher duel under forms).

## §3 — Coliseum bouts (the SNG-149 grid, made mechanical)

**Do NOT author 36 encounters.** The grid has 36 *cells*; a bout is a **champion** fought under a
cell's framing. Author **eight champions, one per FUNCTION_FAMILY** — the family they are deepest
in — and let the cell supply the contest framing from `coliseum_grid.json`.

That keeps grid and roster orthogonal: 8 champions × 36 cells is a large, coherent space from a
small authored set, and adding a champion later does not touch the grid.

| id | family | champion | tacticTags |
|---|---|---|---|
| `coliseum_champion_harm` | HARM | a Marcher who fights under forms | `reads-your-stance`, `punishes-hesitation`, `formal-salute`, `strikes-the-old-injury` |
| `coliseum_champion_restore` | RESTORE | a Quiet Ground attendant | `undoes-what-you-did`, `refuses-to-be-hurried`, `tends-you-mid-bout` |
| `coliseum_champion_protect` | PROTECT | a Stillhold warder | `will-not-be-moved`, `covers-the-opening`, `absorbs-and-waits` |
| `coliseum_champion_know` | KNOW | a Syllogist | `calls-your-next-move`, `names-your-tell`, `argues-mid-exchange` |
| `coliseum_champion_shape` | SHAPE | a Wright | `builds-the-ground`, `changes-the-terms`, `makes-a-tool-from-nothing` |
| `coliseum_champion_influence` | INFLUENCE | a Veilwright | `plays-the-crowd`, `offers-a-deal`, `is-not-where-you-thought` |
| `coliseum_champion_move` | MOVE | a Horizon-walker | `never-where-you-swing`, `closes-in-one-step`, `turns-the-sand` |
| `coliseum_champion_sustain` | SUSTAIN | an Ashwarden | `outlasts`, `does-not-tire`, `lets-you-spend-yourself` |

Each `setup` names the cell being fought and the fact that **the crowd is reading it** — the
Coliseum's whole culture is that a bout is an argument watched by people who understand it.

## §4 — Regional duels (4)

- `duel_marchward_forms` — the Riven Marches, under forms. `fleeDifficulty` 20: withdrawal costs standing.
- `duel_redline_challenge` — the Redline's dueling culture; a challenge that cannot be politely declined.
- `duel_hall_of_mirrors` — Veiled Reach. The opponent may not be where they appear; `tacticTags` lean deception.
- `duel_bargain_gate` — the Descent. The opponent **offers terms every round**; yielding is a bargain, not a defeat.

## §5 — Wild dangers (4) — the prompt's own examples, currently unstageable

`gm.js:33` names *"a boar hunt, a delve into the ruins, provoking a fight"* as things that must
stage a REAL encounter — and there is nothing to stage.

- `wild_boar` — beast tier, `yieldAt: 0`. *"A safe village does not mean a safe boar."*
- `wild_greatcat_quickwood` — beast, ambush tags.
- `ruin_delve_collapse` — **type `challenge`**, staged: the ruin is the opponent.
- `precursor_seal_probe` — **type `puzzle`**: examining a seal, the prompt's own third example.

## §6 — Location wiring (Law 16)

Add `encounterIds: []` to hosting locations:

- `the_great_coliseum` → all eight champions
- `the_marchward` → `duel_marchward_forms`
- `the_hall_of_mirrors` → `duel_hall_of_mirrors`
- `the_bargain_gate` → `duel_bargain_gate`
- Quickwood/valley wilds → the beasts

**Availability is not imposition** — the existing player-chosen-danger rule stands. A location
listing a bout means the GM may offer it when the fiction invites; it never forces one.

Also (§3d of the parent): `the_great_coliseum.descriptionSeed` must say plainly that bouts here are
**fought, not described** — a challenge on the sand is answered in earnest, under forms, and the
crowd reads every exchange. The GM narrates what a place tells it a place is.

## §7 — Acceptance

1. Erik enters the Coliseum, accepts a bout, and the **skill-battle panel opens** — declarations,
   momentum, fog-of-war.
2. `tacticTags` show up as opponent character, not filler.
3. A boar hunt stages a real encounter in a peaceful valley.
4. `challenge` and `puzzle` types each stage once, proving all three shapes work.
