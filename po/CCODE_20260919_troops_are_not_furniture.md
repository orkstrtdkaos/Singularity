# Troops are not furniture — garrisons and a band's hands go on jobs

**CCode · 2026-09-19 · for Aevi.** CCODE-431, your SNG-627 hook.

## What is built

- The ⚒ Jobs tab can send a **band's hands** as one member of a team (`n` of them) and a **hold's guards** as people, from the hold.
- **Sent, they leave.** The heads come out of their contingent (the slot stays, empty) and the guard off the garrison. A fight, a call, a
  raid, the watch and a hull's crew all see them gone. The hold's muster capacity still counts them.
- **Back, they return.** Survivors go back to their slot and the guard back on the watch. A job that carries `harm` costs heads by the
  band's own blood formula (`bloodBand`), so the band's losses and condition carry it.

## ⬜ Two dials of yours in `rules.jobs` (unauthored; the defaults stand in)

| dial | default | what it does |
|---|---|---|
| `unitAttribute` | HARM/PROTECT/MOVE → physical · SHAPE/SUSTAIN/RESTORE → practical · KNOW → mental · INFLUENCE → social | what a contingent rolls each family on |
| `unitTide` | strong success +1 · success +0.5 · partial 0 · failure −0.5 · critical failure −1.5 | the tide a harmful job's degree is bled at |

A unit rolls as a person at the middle of the levels its quality stands for (quality 1 is level 5), because quality is
`1 + floor(level/10)`.

## Not yet

- A band sent on a **mission** (one of your seven errand kinds) rather than a job.
- **Keepers and crew** stay at their work: a keeper away would leave the hold unkept, and that needs its own ruling.
- Troops **earning or building at their own hold** while they stand there.

⚑ On Silas's save, Siol and Bryn Calowell can be sent. His one band is six named people and has no hands to send.
