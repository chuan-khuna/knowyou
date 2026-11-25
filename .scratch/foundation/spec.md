# Spec: Foundation and stack

Status: ready-for-agent

The settled foundation for all KnowYou games, from the grilling session on 2026-11-25. Terms follow `GLOSSARY.md`. The discussion record is `docs/records/2026-11-25-foundation-and-stack.md`. The first game built on this foundation is specified in `.scratch/anime-age/spec.md`.

## Decisions

### Q1. Backend at launch

- **Options.** (A) Fully static. (B) Static frontend plus a tiny API for the counter, hit rate and learning data. (C) The server runs the game.
- **Recommended.** B.
- **Decided.** Browser only, with no data collection. There is no challenger counter, no global hit rate, and no learning from reveals. Every answer probability is written by hand.

### Q1a. Stack (given with the Q1 answer)

- **Decided.** Next.js, Tailwind CSS, colours in `oklch()`, shadcn/ui only where needed, hosted on Vercel. Bun as the package manager, per `CLAUDE.md`.

### Q2. Static export or Vercel functions for share cards

- **Options.** (A) Static export with a canvas share image. (B) Normal Next.js with `next/og` result cards.
- **Recommended.** B.
- **Decided.** No share or export feature. With nothing needing a server, the app builds with `output: 'export'`.

### Q3. Authoring P(answer | value)

- **Options.** (A) Explicit tables. (B) Parametric question facts. (C) Hybrid.
- **Recommended.** C.
- **Decided.** C. Each question records question facts about the world, and the game derives its answer probabilities from them. A question may carry an override where the derived probabilities are wrong.

### Q4. Question bank format

- **Options.** (A) Typed TypeScript modules. (B) JSON or YAML checked against a zod schema. (C) A spreadsheet synced into a build step.
- **Recommended.** A.
- **Decided.** A. Typed TypeScript modules, one question bank per game.

### Q5. Checking guesses without player data

- **Options.** (A) Simulated players only. (B) Personas only. (C) Both, as `bun test` suites.
- **Recommended.** C.
- **Decided.** C. Simulated players guard each engine (accuracy, questions asked, stopping). Personas, which are real people's recorded answers with their true hidden value, guard the question bank. Personas replace the learning loop that was dropped in Q1.

### Q6. Language

- **Options.** (A) Thai only. (B) Thai first, i18n-ready with `next-intl`. (C) Thai and English at launch.
- **Recommended.** A.
- **Decided.** A. Thai only, written directly in the code, with no i18n layer.

### Q7. One shared engine or one per game

- **Options.** (A) One generic engine with a per-game config for values, prior and similarity. (B) A separate engine for each game.
- **Recommended.** A.
- **Decided.** B. Each game has its own engine, tuned to the shape of its hidden value: ordered for age, categorical with regions and neighbours for province, mostly flat for university. The reason beyond tuning is not recorded yet. Record it as an ADR once it is stated.

### Q8. App layout and what the games share

- **Options.** (A) One app, one route per game, a shared play screen, and a result screen for each game. (B) One app where each game owns its whole UI. (C) A separate app or deploy for each game.
- **Recommended.** A.
- **Decided.** A. `/` picks a game. `/anime-age`, `/province` and `/university` are the games. The play screen is shared: question card, answer buttons with number keys, question counter, confidence meter, guess and reveal. Each game supplies its engine, question bank and result screen. The play screen talks to engines through one small interface.

### Q9. v1 scope and build order

- **Options.** (A) Anime Age only, then Province, then University. (B) Province first. (C) All three at once with smaller banks.
- **Recommended.** A.
- **Decided.** A. v1 is Anime Age only. Province starts once Anime Age's personas pass, and University comes after Province.

### Q10. Anime Age range

- **Options.** (A) 10–50. (B) 8–60. (C) 12–45.
- **Recommended.** A, with a prior that bumps gently over ages 15–35.
- **Decided.** A. Ages 10–50, with the prior bump over 15–35. Edge guesses read "ไม่เกิน 10 ปี" or "50 ปีขึ้นไป".

## Open questions

- The engine interface the play screen calls. The architect step for Anime Age is settling this now.
- How each engine defines confidence and its stop rule. For Anime Age, the spec proposes the posterior mass within ±1 year.
- The Anime Age question facts schema, and the size of the v1 question bank.
- Whether a play in progress survives a page refresh. Out of scope for v1.
- Fonts for Thai text.
- The reason behind one engine per game (Q7), to record as an ADR.
