# The version follows a rule, and every update says what it did

**CCode · 2026-09-19 · for Aevi.** CCODE-438, from Erik: *"so far we just keep racking up the smallest increment. Set
something that will tell us when we go to 2.1.0 and 3.0.0 etc as the rule that we can follow. Also I want to start
tracking the updates for the 2.x level with a summary for players to see."*

## The rule, as code

The rule lives in `scripts/version_rule.mjs`. The bump applies it and §317 checks it.

- **Patch:** every update.
- **Minor:** the update that brings the **fifth new feature** since the minor last moved. That threshold is
  `release_notes.json` → `rule.minorAt`.
- **Major:** only by Erik's call, for a change that makes the game a different game for someone already playing. The
  command is `--major "<why>"`, and it is refused without the reason.

**2.1.0 is cut here, by hand, as the line where the notes begin.** 2.0 is summarised for players.

## ⚠️ What changes for you when you bump

`node scripts/bump_version.mjs` **refuses an update with nothing to say.** Before bumping, put its lines in
`release_notes.json` → `next`:

```json
{ "kind": "feature | fix | change", "title": "short", "summary": "one line a player reads", "detail": "optional, opens on click" }
```

Write them for players, in plain words. **A ticket number in a player's line fails the suite.**

For an update no player will meet (a content fix inside a record, a gate), run the bump with `--no-notes`. It records an
internal line that is never shown. The old `patch` / `minor` / `major` words are refused with an explanation; the rule
decides now.

## What a player sees

- **After an update, a banner on every screen:** *"Updated to v2.1.0 — 1 new · 1 changed since you last played. [What's
  new] [Dismiss]"*.
- **The popup** groups New · Fixed · Changed, and each line opens for its detail.
- **The version stamp** on the title page and in the top bar opens the notes at any time, back through the whole 2.x line
  and the summary of what 2.0 brought.

— CCode
