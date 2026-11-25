# CLAUDE.md

## Agent skills

### Issue tracker

Issues and specs live as local markdown files under `.scratch/<feature-slug>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

The five default triage roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), plus `done` for shipped work, recorded as a `Status:` line in each issue file. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

### Workflow: pstack entry, Pocock requirements

Start every task with `/pstack:poteto-mode`. For a task that adds or changes behaviour
(Feature, Prototype, Multi-phase plan), run the requirements gate before you open the
playbook todolist:

1. Find the spec. Look for `.scratch/<feature-slug>/spec.md`. If it exists with
   `Status: ready-for-agent`, read it, skip to step 4, and treat it as the source of truth.
2. Grill lightly. Read `.agents/skills/grilling/SKILL.md` and
   `.agents/skills/domain-modeling/SKILL.md`, and follow them with these limits:
   - Ask only decisions that change scope, the data shape, or what the player sees.
     Answer facts yourself from the code and docs.
   - One question per round, overriding the skill's whole-frontier rounds: ask the frontier
     question that matters most, with your recommended answer. At most 5 rounds in total.
   - For anything else, take your recommendation and list it under `## Assumptions` in
     the spec. The user vetoes there, not in chat.
   - Stop and wait for answers. This is the one pause point in poteto-mode.
3. Write the spec. Read `.agents/skills/to-spec/SKILL.md` and follow it. Write to
   `.scratch/<feature-slug>/spec.md` per `docs/agents/issue-tracker.md`. Skip its seam
   check-in when the grill already settled the seams.
4. Run the playbook. Open the matched poteto-mode playbook with the spec as its goal and
   success criteria. For work that spans several PRs, follow
   `.agents/skills/to-tickets/SKILL.md` first and work the tickets blockers-first.
5. Close the spec. When the work merges, add a `## Comments` line with the PR or commit,
   and set `Status:` to `done`.

Bug fixes, refactors and investigations skip the gate.

## Project docs

### Documents

Documents about this project, including how it is implemented, live in
docs/documents/<slug>.md (or .html). docs/documents/INDEX.md is the entry point: it lists
every document as one bullet, `- Title — one-line summary`.

- Read the index before working on an area, and open the documents relevant to it.
- When you add, rename or remove a document, update INDEX.md in the same change.
- Keep documents in step with the code they describe: if a change makes a document wrong,
  fix the document in the same change.

### HTML documents

When you write a document in `docs/` as HTML, follow the page contract at the top of
`docs/shared/doc.js`. Linking `globals.css` and `doc.js` gives the page its themes, Shiki
highlighting, Pele diagrams, table of contents and glossary cards.

- Shared code: link `docs/shared/` files by relative path; add new shared CSS/JS there.
- Colour: write every colour in `oklch()`; derive with `color-mix(in oklch, …)`.
- Glossary: define each term once, in `<dl class="glossary">` or a table marked
  `data-glossary`, with id `term-<slug>`. Link its first use in each `h2` section with
  `<a class="term" href="#term-<slug>">`, only for terms that have an entry.
- Technical manuals (setup guides, runbooks, how-to, API guides): ASD-STE100 at about 60%.
  Numbered steps, one action each, starting with a verb; condition before action; active
  voice; 20 words or fewer; warnings before their step; the glossary term every time.
  Explanations may read naturally. Thai text follows the same principles.

### Records

Discussion records live at docs/records/yyyy-mm-dd-<slug>.md, dated the day the discussion
took place. Each record captures one discussion: what was discussed, what was decided, and
any open questions.

## Tools

### Python

Use `uv` for everything Python: `uv run <script>`, `uv add <pkg>`, `uv sync`. Run it
instead of calling `python`, `pip` or `venv` directly. Lint and format with ruff
(`uvx ruff check`, `uvx ruff format`), configured by `ruff.toml` at the project root.

### Node

Use `bun` as the package manager (`bun install`, `bun add`, `bun run`). Fall back to `npm`
only when bun can't do the job.

When you set up a Node project or add a package manager config, set a minimum release age
of 7 days for both tools, so freshly published (possibly compromised) versions are never
installed:

- `bunfig.toml`:
  ```toml
  [install]
  minimumReleaseAge = 604800 # 7 days, in seconds
  ```
- `.npmrc` (needs npm >= 11.10):
  ```ini
  min-release-age=7
  ```
