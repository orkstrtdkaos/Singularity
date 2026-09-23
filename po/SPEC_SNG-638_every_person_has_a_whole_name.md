<!-- status: SNG-638 spec_ready — content half applied in SNG-634/637; engine half asked of CCode -->
# SPEC SNG-638 — Every person has a whole name, so no two are the same person by accident

**Aevi (PO) · 2026-09-23 · v2.4.10**

> **Erik:** *"For the tuning warden Maren — make sure that when people surface in the future, they get a full name, first,
> middle and last, and/or a title — so they can be distinct."*

## §1 — ⛔ MEASURED: WHY THERE ARE FOUR MARENS

| where | what it does | why Maren slipped through |
|---|---|---|
| `gm.js:73` — the `meet` entry's `name` | asks for *"THEIR NAME, and a role is not one"* | **a single given name satisfies it.** "Maren", "Aldric", "Renn" are all legal |
| `names.js personName` | keeps the GM's name if it is not a placeholder | **it never completes a one-word name**; the mint builds given + family + byname only when the GM gives *nothing* |
| `namematch.js namesToAvoid` | shows the GM up to 24 given names already met on the device | a list to avoid is advice; **"Maren" is met by 4 characters on this device anyway** |
| `namematch.js usedGivenNames` | counts given names for that list | ⛔ **it takes the FIRST WORD.** "Elder Senna" counts as *elder*, "Councilor Dresh" as *councilor* — **every titled person is invisible to the reuse guard.** `givenNameAlias` already steps over honorifics; `givenName` does not |

## §2 — THE RULE

Every person record carries three things:

- **`name`** — what people say: given and family (*Maren Vasse*), or title and name (*Councilor Dresh*).
- **`fullName`** — given, middle and family (*Maren Oriel Vasse*). Always three parts.
- **`title`** — the office or epithet, when they hold one (*Tuning-Warden of the Lower Terrace*, *the Ditch-Mother*).

⛔ **No two records share a spoken `name`.** A given name may repeat in the world only behind a distinct family name, and
the narration uses the whole spoken name when the given name alone is ambiguous.

## §3 — ✅ THE CONTENT HALF, APPLIED TODAY

Every person I have authored in SNG-634 and SNG-637 now carries `fullName` and `title`, and `fullName` in `aliases` so a
narrator's full-name mention resolves: **Maren Oriel Vasse**, Tuning-Warden of the Lower Terrace · **Wenna Maud Dresh**,
Councilor of Millbrook · **Senna Rhoswen Aske**, Elder of Millbrook · **Dara Linnet Holt**, the Ditch-Mother · **Farren Aldous
Quire** · **Sorel Anwen Halloran** · **Dessa Maerin Wyck** · **Harl Osric Maddock**, King of the Gralloch · **Tamsin Rhee Galt** ·
**Agathe Morrow Hesk**, Mother of the Undercount · **Ines Aurelie Harrowgate**, Holder of the Slip · **Oswin Calder Tarrant**,
Baron at Firstsight · **Tomas Evander Brannoch**, Castellan of the Echo Bridge. Every new name part was checked with
`exists.mjs` and against the given names met on this device.

⚠️ **And one defect of my own it surfaced: my council people had ids that did not match your saves.** The saves know
`councilor-dresh`, `elder-senna`, `tuning-warden-lower-terrace`; I had written `councilor_dresh`, `elder_senna`,
`warden_maren`. **A content record links to a save's person by id** (`mara-wells`, `cassiel-ord`), so as written they would
have been strangers wearing your people's names. Now they match, with `_idWas` kept.

## §4 — ⬜ THE ENGINE HALF, FOR CCODE

| # | where | the change |
|---|---|---|
| **N1** | `gm.js:73`, the `meet` `name` field | ask for a whole name — given, middle, family — and a title when the person holds an office; say that one word is not a whole name |
| **N2** | `names.js personName` | a bare given name from the GM is **completed from the mint's pools** (a middle and a family name, by tradition) rather than kept as one word; `fullName` stored; what the player hears stays `asSpoken` |
| **N3** | `namematch.js usedGivenNames` | read the given name **past the honorific**, the way `givenNameAlias` does — and add `councilor`, `castellan`, `baron`, `mother`, `king`, `queen`, `councillor`, `tuning-warden` to the honorifics — so titled people count against reuse |
| **N4** | `meet` handling | if the given name is already met on the device, the entry must carry a family name the device has not paired with it, and first mention in narration uses the whole spoken name |
| **N5** | registry + people card + the GM's known-people block | `fullName` and `title` are read: the card shows both, the GM block uses `title` so an office is never re-invented |

⛑ **N3 is one line and the biggest single win** — today the guard cannot see anyone with a title, which is most of the
people who matter.

— Aevi, PO
