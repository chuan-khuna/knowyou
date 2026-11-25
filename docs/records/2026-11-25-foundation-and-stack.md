# Foundation and stack

Date: 2026-11-25. A grilling session (10 questions) to settle the foundation of the app before any code. Terms used here are defined in `GLOSSARY.md`.

## Decided

1. **Runtime**: browser only. No backend and no data collection, so there is no challenger counter, no global hit rate, and no learning from reveals.
2. **Stack**: Next.js with `output: 'export'`, hosted on Vercel. Tailwind CSS, colours in `oklch()`, shadcn/ui only where it helps. Bun as the package manager.
3. **Sharing**: no share or export feature in v1.
4. **Answer probabilities**: hybrid. Each question records question facts about the world, and the game derives P(answer | hidden value) from them. A question may carry an override when the derived probabilities are wrong.
5. **Question bank format**: typed TypeScript modules, one bank per game.
6. **Checking guesses**: two `bun test` suites. Simulated players guard each engine (accuracy, questions asked, stopping). Personas, real people's recorded answers with their true hidden value, guard the question bank. They replace the missing learning loop.
7. **Language**: Thai only, written directly in the code, with no i18n layer.
8. **Engines**: one engine per game, each tuned to the shape of its hidden value (ordered age, structured provinces, flat universities). This is the user's choice over a shared generic engine.
9. **App layout**: one Next.js app. `/` picks a game, and each game has its own route (`/anime-age`, `/province`, `/university`). The play screen is shared: question card, answer buttons with number keys, question counter, confidence meter, the guess, and the reveal. Each game supplies its engine, its question bank and its result screen.
10. **v1 scope**: Anime Age only. Province comes after Anime Age's personas pass, then University.
11. **Anime Age range**: ages 10–50, with a prior that bumps gently over roughly 15–35 (the likely player base). Edge guesses read "ไม่เกิน 10 ปี" or "50 ปีขึ้นไป".

## Open questions

- The engine interface the play screen calls (for example `nextQuestion`, `answer`, `confidence`, `guess`) is not designed yet.
- How each engine defines confidence and its stop rule (for example, the mass within ±1 year for age).
- The Anime Age question facts schema, and the size of the v1 question bank.
- Whether a play in progress survives a page refresh.
- Fonts for Thai text.
