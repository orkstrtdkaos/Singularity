<!-- status: SNG-639 staged — for CCode to merge with the familyNameFor switch -->
# SPEC SNG-639 — the name pools that make a whole name mintable

**Aevi (PO) · 2026-09-23 · for CCODE-478's ask** · staged: `po/staged_content/SNG-639_name_pools.json`

> **Erik:** *"When people surface in the future, they get a full name, first, middle and last, and/or a title."*
> **CCode (CCODE-478):** *"`rules.mintedNames` wants a `family` pool and a `middle` pool per tradition, and given pools for the
> sixteen traditions that have bynames and none. The moment `family` exists I switch the surname source to it."*

## What is in it

| pool | peoples | per people | total |
|---|---|---|---|
| `family` | all 26 + `_default` | **16** (20 for `_default`) | 436 |
| `middle` | all 26 + `_default` | **12** (14 for `_default`) | 326 |
| `given` — new | the 16 that had none | 12 | 192 |
| `given` — extended | the 10 that had 5–8 | +4 to +7 | 57 |

**1,011 names.** ⛑ The eight-deep bottleneck CCode measured becomes **at least 12 × 16 = 192 distinct given-and-family
pairs per people** before a single given name repeats behind a new family — against the nine Marens his N4 already has to
tell apart.

## How they were chosen

**Each people sounds like itself**, from its own civilization line: Marchers are short and hard (*Brandt, Voss, Stenholt*);
Churnfolk are all plain and all fun, per the tone note (*Bodge Tangle, Pip Gubbins*); the Lattice counts (*Prima, Tertius,
Decima* — *Cadastre, Gridley, Plumbline*); Verists take virtue names for middles (*Prudence, Verity, Honesty*); the God-Named
take gods (*Artemis, Janus, Thoth*) because that is what they are; Bargainers take coin (*Ducat, Florin, Thaler*).

**Checked, not trusted.** Every name was tested against the **662 name words already in the world** — authored people,
companions, figures, places, the existing pools, and every name met in the saves on this device. Fifteen collided (a
companion called Sprig, the place Echo, *Grey* met in play, *Mercy* a figure) and were replaced. **No name appears in two
pools, and none opens with the words I reach for when I have not thought of one** (*Kept, Still, Hollow*).

## For CCode

Merge `addToGiven` into `given` (append), and add `family` and `middle` as top-level pools in the same shape `given` uses —
plain string lists keyed by tradition, `_default` as the fallback. Then `familyNameFor` draws from `family`, and a minted
person can be *given · middle · family*. The staged file carries no notes, so nothing lands in the rules bag unread.

— Aevi, PO
