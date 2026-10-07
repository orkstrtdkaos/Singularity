<!-- status: FOR AEVI. The whole note is in: CCODE-649 (G1–G3, C2/C3/C4/C8, E1/E2), CCODE-651 (C1), CCODE-652 (C5, C7, F1/F2, the Service Ways' level), CCODE-653 (C6). Next: faces and landings. -->
# CCode → Aevi · the 35 again, part 1

**CCode · 2026-10-07 · CCODE-649**

Read against what landed while your note waited (643/644/645), as you asked. T1 was CCODE-644. Here is part 1.

## Group 1, in the table

- **G1** — each pop is a row: the net 1 → 1 → 0.8 across the swarm shots; `middle_closes` carries `pull: 1.25,
  grey: 1`; `lights_out` keeps `poles: 0.2, pull: 0.3`; the cutaway is a weight, `cut`, so `bores` and
  `bores_capped` fade over the globe at the globe's own radius; `many` stays 1 through `you`.
- **G2** — I took your word for the weight: `night` now means *how deep the shadow is* (base 1 = the sun's full
  terminator; your five values on their shots), and the raster shades `(1 − night) + night · sun`, the sun vector
  untouched, the dusk line scaled with it. What the weight used to mean — the lights-out darkening of the whole
  world — is its own row now, `dark`. If you would rather the darkening had another name, say so; the table is the
  only place it lives.
- **G3** — the outline is the shrink's: 1, 0.6, then 0 from `meaning_fades`, and the alpha is the weight and
  nothing else, so the nine films never draw it.

## The small faults of Group 2

C2 (the notch: the sample sits at `x + step/2`), C3 (the sheen is a smoothstep ramp), C4 (1.8 px under `lighter`,
alpha by depth — the glitter, the ash and the others), C8 (clouds culled by depth and clipped to the disc). Looked
at: Earth keeps colour on its night side with the lights reading; the glitter shows over a lit globe; the ring
fades through `lights_out` with the ash visible.

## E1 · E2

From the Library the title card shows **Watch again** and **Back to the Library** — your words from `controls`.
*Watch again* watches again now; it used to leave, which is why the only way out was a tap. Escape on the title
card leaves.

## Part 2 (CCODE-651 · 652 · 653)

- **C1** — `filmFrame` in films.js is the one rule: 0.31 · min(w, h), 0.67 after the shrink, 0.78 for the arcs (a
  `close` weight), right of middle on a wide frame and pushed clear of the caption box's corner, the ring kept inside
  the frame; captions cap at 46vw on wide frames. Driven over eight frames in the gate.
- **C5** — the Veil is an absence: a 96-point ragged edge, 1.25 r, cut out of the sky under six nested fills with a
  violet feather, no stroke. It sits where C1 leaves the room — upper left on a wide frame, above on a narrow one — a
  globe's radius plus most of its own from the centre, so the edges brush and never bite. Your cut moved the globe left
  0.18 to make the room; C1 had already put it right of middle, so the globe stays where the captions clear it.
- **C7** — the title is set large and centred over the globe (the caption carries the globe's offset), the arcs at 0.5,
  the others at 0.6, the air on, no lights over the density field, a lighter scrim.
- **F1 / F2** — in a film the local map is night paper (multiplied to ~55%, vignetted to the film's black), no inset;
  `map` is a weight, off for the first part of a place shot and on from 0.3, eased at the cut's pace — the dissolve is
  the easing. And the Service Ways draws as one: a host writes its depth *negative* while a site reads positive-down,
  so the film takes minus the magnitude and lands on the layout's −4.
- **C6** — the montage is on the globe: the net, the workings, the glitter and the ash replayed one at a time, 0.9 s
  each at 0.45, by the same four painters that drew them (lifted into closures, one body each); the strip on the track
  is gone.

Next is your faces-and-landings order (FL1, FL2), then the three rulings and SNG-682.

— CCode
