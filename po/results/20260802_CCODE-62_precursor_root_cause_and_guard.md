# CCODE-62 — the precursor root cause, fixed; and Aevi's reachability guard

Full `npm test` green.

## The root cause is not Loki's origin. It's that nothing ever read backgrounds.

CCODE-61 reported that `unlockPrecursor` had never fired and that Loki's origin (`enginewright`) carries
no `innatePrecursor`. That was true but it was not the cause. The cause:

- **`backgrounds.json` carries `precursor_marked → ["address_sense"]`** — authored, valid, correct.
- **Loki's background IS `precursor_marked`.** He has been correctly authored the entire time.
- **`seedInnateSubstrate` was only ever called with an ORIGIN record.** Both call sites passed
  `originRecord(...)`. No seeder, anywhere, ever read a background.

So the content was right and the wiring never looked. Aevi's own audit reached the same place from the
other side ("precursor was the ONLY system with a background-based marking, which is why it alone fell
through origin-keyed seeding: unique, not systemic"). Confirmed from the code: exactly right.

**Fixed.** `seedInnateSubstrate` now takes a `backgroundRecord` and seeds from both; both call sites pass
it. Verified:

```
Loki seeded: [ 'address_sense' ] | precursorAccess: [ 'address_sense' ]
```

Because the reconcile path is idempotent and runs on load, **Loki's existing save picks this up on his next
load** — no migration needed.

**One player-facing correction that came with it.** The reconcile note said *"The substrate answers you by
right of your people"*. That is true of an origin seeding and false of a background one: a precursor marking
is something that happened **to** you. Telling a marked character it is their birthright would be the engine
lying about their own history. The note now names the right source — *"by right of what was done to you"*.

## Aevi's guard, built and proven

Her ask, verbatim: *"(a) baseline that every innate-access id exists with matching powerSystem,
(b) REACHABILITY — a record carrying an innate-access key must be reachable by a seeder call for that record
type; (b) would have caught precursor the day it was authored."*

Both are in `content_ci.mjs`:

- **(a)** every `innatePrecursor` / `innateLivingCurrent` / `wildCurrent` id in any rules file resolves in
  the catalog with the matching `powerSystem` — a typo can never mint a false access.
- **(b)** every record *type* carrying an innate-access key must be passed to a `seedInnateSubstrate` call.
  A new record type carrying one has to be registered AND wired; that pairing is the guard.
- **A self-test** asserts the guard can fail, so it can never quietly stop working.

**Proven against the real bug.** Reverting the fix — putting the repo back in the state the bug shipped in:

```
FAIL  SNG-261 B(b): every record type carrying an innate-access key is REACHABLE by a seeder call
      — backgrounds.json carries innate access that NO seedInnateSubstrate call can read
```

It names the file, the class, and the reason. Aevi's claim that (b) would have caught this the day it was
authored is correct, and it now does.

## Why this class keeps happening, and what now covers it

Three guards now cover three layers of the same failure — *authored, valid, and unreachable*:

| layer | guard | added |
|---|---|---|
| a manifest key no loader reads | `provides.*` HANDLED set | SNG-040/064 |
| a rules constant no module reads | `unreadRuleConstants` ratchet | CCODE-60 |
| a record type no seeder reads | innate-access reachability | here |

The common shape: **content that exists, is correct, and has no consumer.** Nothing errors, nothing is
missing, and the feature simply never happens. It is the hardest class to see by reading code, and the
cheapest to catch with a guard that asks "who reads this?"
