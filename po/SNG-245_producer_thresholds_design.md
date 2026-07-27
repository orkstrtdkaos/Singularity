# SNG-245 — Producer thresholds: the design of "DRIVEN" (Aevi's design read for Erik to tune)
## Aevi (PO) · 2026-07-27 · the WHEN behind the pressure queue (voice is authored separately in pressure_hook_voice.json)

CCode shipped reasonable engineering DEFAULTS; this is the DESIGN intent behind them, so Erik tunes from
meaning, not magic numbers. Verified CCode's current values against this.

## Producer A — NPC unmet want ("the want comes knocking")
CCode default: `wantStalenessThreshold = max(3, round(11 / pacingMult))` days; fires when a BONDED NPC
(bondType≠platonic, or band devoted/ally) with an authored want has been absent ≥ threshold; urgency scales with
how many thresholds overdue + a devoted bonus.
### Design intent
- **WHO qualifies (right):** only BONDED NPCs with an AUTHORED want. This is correct — a driven knock from a
  stranger is noise; it must be someone who MATTERS and whose want we actually wrote (the SNG-233 interiority
  NPCs are the core set). Guard: never fire this for an NPC with no real authored want (a generic "misses you"
  is exactly the genericness we're avoiding).
- **HOW LONG is "long unseen":** ~11 days at normal pacing feels right as a DEFAULT — long enough that the
  absence is real, short enough that a bonded NPC doesn't vanish for a season. At Eventful (pacingMult up) it
  drops toward the 3-day floor (the world drives harder); at Calm it stretches (the world waits longer). The
  3-day FLOOR is important — a knock every 3 days is the most aggressive it should ever get, or the intimate
  NPCs become nags.
- **URGENCY feel:** a first knock (just past threshold) is urgency 1-2 — a visit, a question, warmth-with-an-edge.
  A long-overdue devoted want (several thresholds) climbs to 3-4 — Pell doesn't just visit, she confronts;
  Veth's judgment has hardened. Urgency should read as "how much has the unmet want CURDLED," which the scaling
  captures. Good.
- **The tuning Erik owns:** the base threshold (11) and whether devoted gets the +1 urgency (it should — the
  people closest to you act soonest and hardest).

## Producer B — threat-attack ("the beast comes to you")
CCode default: `chance = min(0.85, 0.10 × danger × pacingMult)` per producer run; picks a REAL creature from
THIS place's eligible pool (never invented); urgency `2 + floor(danger/2)`; becomes a defend-encounter.
### Design intent
- **DANGER-GATED (right):** chance scales with the location's danger. A peaceful holding almost never gets a
  sudden attack; a perilous frontier often does. This is correct and it respects the existing danger system —
  the beast that comes to you is one that BELONGS here (from the eligible pool), never a random spawn.
- **The 0.85 CAP matters:** even at max danger + Eventful, it's not EVERY beat — an 85% ceiling leaves room for
  a breath. Keep the cap; a guaranteed-attack-every-turn frontier is exhausting, not exciting.
- **ALWAYS becomes a defend-encounter (teeth):** correct and load-bearing — a threat push that's only flavor is
  the theater we banned (SNG-236). It uses the SNG-236 hard-frame so the defend-encounter actually presents.
- **Flee preserved:** the voice bank keeps the flee/decline path (SNG-230 round-1 flee). A sudden attack is
  ARRIVED-and-hunting, but never an un-escapable ambush — initiative for the world, agency for the player.
- **The tuning Erik owns:** the 0.10 danger coefficient (how attack-prone a given danger level is) and whether
  low-danger places should EVER attack (currently they rarely do — probably right; the frontier is where beasts
  hunt).

## The aggression dial (Erik's "Activity!" knob)
Both producers scale by `pacingMult` — so the EXISTING pacing/frequency preference (Calm ↔ Eventful) IS the
aggression dial, exactly as hoped. Calm = the world drives gently (wants wait longer, beasts attack rarely);
Eventful = the world drives hard (knocks come fast, the frontier bites often). ONE dial the player already
understands, now governing initiative too. Recommend: keep it unified — don't add a separate "aggression"
setting; the pacing pref is the right home.

## Guards (design)
- **Only MATTERING subjects** — a want-knock needs a real bond + authored want; a threat needs a real eligible
  creature. No generic pushes. (A push from a nobody is worse than no push.)
- **The floor holds** — the queue feeds the EXISTING trigger, which honors the quiet/intimate-scene rule. Driven
  never overrides "don't break a tender moment." Both producers inherit this.
- **De-dupe is right** — CCode de-dupes by (kind, subjectId): the same NPC/beast isn't queued twice. Good — Pell
  knocks once, not five times; the stag attacks once, not on a loop.
- **Teeth, always** — threat→defend-encounter, want→a real scene with the NPC present. Never a flavor line that
  goes nowhere.

## What's next (the other 3 producers)
villain-move, arc-stir, treasure-rumor — voice notes are stubbed in pressure_hook_voice.json. Design when wired:
villain-move fires when a villain's scheme reaches a step in the player's orbit (needs villain agendas to carry a
step-clock); arc-stir when a greater arc advances a stage near the player (the pressureOnAdvance field is the
seed); treasure-rumor when a real undiscovered site/reward is within rumor-range. Each same discipline: real
subject, real teeth, voiced hook.
