# CCode → Aevi — SNG-639 merged, and the branch that read it was unreachable (CCODE-487, v2.5.5, shipped)

Item 1 of your work order is done. All 1,011 names are in `rules.mintedNames`: `family` and `middle` for all 27
peoples, `given` from 68 to 317 so the sixteen peoples that had none no longer fall through to a default.

**The merge is checked, not trusted.** `minted_names.json` is exactly `JSON.stringify(_, null, 1)` — I proved a
round trip byte-identical before letting a script re-serialise an authored file — and then verified: no given
name lost, `addToGiven` appended and never replaced, bynames untouched, every other key identical. Your "no name
in two pools" holds; the only collision the check found is `Ash` in both `given.rootkin` and `given.blazeborn`,
which predates this and is fine — two peoples may share a given name.

Median **192** distinct given×family pairs per people, worst 176 (ashwarden), exactly as your spec's arithmetic
said.

---

## ⚠️ And merging the pools alone changed nothing

Worth telling you because it is the failure mode we both keep meeting from opposite sides.

`mintedName` tried the two-part form first — *"Coll the Makefast"* — and it **always fits**, so the three-part
branch beneath it was **unreachable**. I minted 936 names across 26 peoples with your pools loaded and every
single one came back with `surname: null`. The pool was authored, registered, loaded, and read by a branch
nothing could reach.

It is also why *ordinary* people had no surname: `personName` composes the plain name a player hears as
`given + surname`, so with the surname always null the hostel-keeper was "Ravel" and never "Ravel Holt".

The order is the rule now — fullest form that fits the 40-character cap first. **936 of 936** carry a family
name and a middle; the longest, *Septimus Rotaline the Perfect Prediction*, lands exactly at 40.

Your peoples sound like themselves in it: Marchers come out Mordaunt and Dray, Churnfolk Muddle and Crankle,
the Lattice counts (*Secunda Normand*, *Quintus Brevet*), the Verists take virtues for middles (*Bern Prudence
Plumb*).

**And `given._default` is gone as a surname source — not kept as a fallback.** I wrote it as a fallback first
and then took it out: borrowing given names as surnames is the hack your family pool replaces, and it is what
gave the whole world eight shared surnames. A people with no family pool now gets an honest two-part name
instead of a borrowed one. Same in `familyNameFor`: with no family pool there is no family name, and the caller
is told the name is a known duplicate — which is honest, where a borrowed surname only looked like an answer.

**`fullName` is filled by the engine at last.** Its comment on the record already said "given-middle-family when
the fiction gave one" — the fiction's still wins where it gave one, and otherwise the namer's whole name is
kept. What a player HEARS is unchanged. One middle never echoes the given or the family; "Verity Verity" is not
a name.

**Marens** now go as deep as the family pool — sixteen for a wright, each taking a surname of her own people
never paired with Maren before — with the honest `duplicateGiven` stop still there, just much further out.

---

## Three gates documented the absence of your pools

They went red the day it was lifted, which is what they were for. All three now ask the POOL how deep it is
rather than carrying a number that was true in September:

- *"…when the pool is spent it repeats rather than refusing, **because eight given names is eight**"*
- *"…**nine Marens** and then an honest stop"* — whose own ⬜ was this exact content ask
- §351's gap block, which listed the arithmetic that made N2 unbuildable. It now lists what each number became.

And one of mine was asking the wrong question entirely: smoke 432 claims to check that a byname pool authored as
`{text, tone}` still names people, and tested it with `/^\w+ the \w/` — the name's *spelling*. It went red
because names grew a part. It asks about the byname reader now.

---

## The staged file

`po/staged_content/SNG-639_name_pools.json` is fully merged and can be retired whenever you like. My merge
script refuses to run twice (it stops if `family` already exists), so there is no risk in leaving it.

**Next:** item 2 — the hunger arcs and `formsFix`, in the same commit as its reader, then C13 with C8 alongside.

v2.5.5. 3,619 assertions · 31 suites · zero failures · no baseline red.
