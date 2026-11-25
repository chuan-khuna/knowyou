# Spec: Anime Age v1

Status: done

v1 is merged on `main`. The scope has grown since: see **Changes since v1** below. Those changes are implemented on the unmerged branches `anime-cues` and `hallmark-redesign` (stacked `main` → `anime-cues` → `hallmark-redesign` → `province`), or are still in progress. Follow-up work is in `issues/`.

Terms follow `GLOSSARY.md`. Decisions come from `docs/records/2026-11-25-foundation-and-stack.md`.

## Problem Statement

Thai players have no game that guesses something personal about them from what they remember, in the way the Japanese game nenrei guesses age from past fads. The anime Thai people grew up with is tied closely to when they grew up: Saturday-morning slots on Ch.9, Ch.3 and Ch.7, the iTV era, cable, and later streaming. Your anime memory therefore says a lot about your age. A player wants to answer some quick questions about anime they remember, watch the game get more confident, and be surprised when it names their age.

## Solution

A browser game in Thai at `/anime-age`. It asks about anime only (no era or life questions, see Changes since v1) one question at a time, and shows a live confidence meter. When it is confident, or runs out of useful questions, it makes exactly one guess ("คุณอายุ 27 ปี"). The player says whether it is right. If not, they can enter their real age. The result screen shows the memory strata: how much the player knew of each era's anime, with sample titles. `/` is a game picker that lists Anime Age as playable and Province and University as coming later.

## User Stories

1. As a player, I want to pick Anime Age from a landing page, so that I know which game I am starting.
2. As a player, I want to see the rule "ask until sure, guess only once" before I start, so that I know what to expect.
3. As a player, I want to be asked to answer "don't know" honestly, so that I don't spoil the guess by pretending.
4. As a player, I want one question on screen at a time, so that I can answer quickly.
5. As a player, I want to see the question number, so that I know how far into the play I am.
6. As a player, I want a live confidence meter, so that I can watch the game narrow down on me.
7. As a player, I want familiarity questions to offer four levels (watched it a lot / seen it / only know the name / don't know), so that I can answer honestly at my real level of memory.
8. As a player, I want the answer wording to fit the question type, for example a film asks whether I saw it in a cinema or on TV or streaming, so that the options make sense.
9. ~~As a player, I want some questions about what watching anime was like back then (which channel, what time slot, dubbed or subbed, VCD or streaming), so that the game isn't only about titles.~~ Removed after v1: the game asks about anime only.
10. As a player, I want "don't know" on every question, so that I am never forced to guess.
11. As a PC player, I want number keys to pick answers, so that I can play without the mouse.
12. As a mobile player, I want big tap targets, so that I can play one-handed.
13. As a player, I want the game to stop asking once it is confident, so that the play doesn't drag on.
14. As a player, I want the game to stop even if it can't get confident, so that a play always ends.
15. As a player, I want at least a minimum number of questions before a guess, so that a guess never feels like a fluke.
16. As a player, I want exactly one guess per play, so that the reveal feels like a real bet.
17. As a player, I want the guess shown as a single age, so that the verdict is clear.
18. As a player near the edges of the range, I want a guess such as "ไม่เกิน 10 ปี" or "50 ปีขึ้นไป", so that the game doesn't pretend to know an exact age it can't.
19. As a player, I want to say whether the guess was right (within ±1 year), so that I can react to the reveal.
20. As a player whose guess was wrong, I want to enter my real age with a stepper, so that I can see how far off it was.
21. As a player, I want a memory strata view with one band per era, so that I can see which eras of anime I know best.
22. As a player, I want sample titles in each strata band, so that the bands mean something to me.
23. As a player, I want to see the deciding answer, the one that narrowed the guess most, so that I understand why the game guessed what it did.
24. As a player, I want to see the list of my answers, so that I can review what I said.
25. As a player, I want to play again from the result screen, so that I can retry or let a friend play.
26. As a player, I want the questions to vary between plays, so that a second play isn't identical.
27. As a player, I want the game to work offline once loaded, with no account and no data sent anywhere, so that I can play freely and privately.
28. As a player, I want the page to load fast on a phone, so that I don't give up before the first question.
29. As a player, I want light and dark themes that follow my system, so that it is comfortable to read.
30. As a player, I want Thai text rendered in a proper Thai font, so that the game looks polished.
31. As a question author, I want to write a question as facts about the anime (Thai first-run years, channel or platform, audience, popularity), so that I don't hand-write probability tables.
32. As a question author, I want the type checker to reject a question with missing or wrong facts, so that mistakes are caught when I write them.
33. As a question author, I want to give a question an override when its derived probabilities are wrong, so that odd cases don't force a model change.
34. As a question author, I want to see the derived P(answer | age) curve for a question, so that I can check it looks right.
35. As a maintainer, I want a simulated-player suite that runs full plays for every age in the range, so that I know the engine narrows correctly and always stops.
36. As a maintainer, I want a persona suite that replays real people's recorded answers, so that I know the question bank matches real players.
37. As a maintainer, I want to add a persona by recording one dev-build play, so that the ground truth grows cheaply.
38. As a maintainer, I want the play screen to depend only on a small engine interface, so that Province and University can reuse it with their own engines later.
39. As a maintainer, I want Province and University to appear on the picker as "coming soon", so that the app's shape is visible from day one.

## Implementation Decisions

- **App.** One Next.js app (App Router) with `output: 'export'`, hosted on Vercel. Tailwind CSS. Every colour is written in `oklch()`. shadcn/ui only where a primitive saves real work. Bun is the package manager, with `minimumReleaseAge` set in `bunfig.toml`. Thai only. No i18n, no backend, no analytics, no data collection.
- **Routes.** `/` is the game picker. `/anime-age` is the playable game. Province and University are listed but not playable.
- **Engine per game.** Each game owns its engine. The play screen talks to an engine only through a small interface: start a play, get the next question (or learn that it is ready to guess), record an answer, read confidence, read the guess. Anime Age adds a memory strata read for its result screen. The exact interface comes out of the architect step.
- **Anime Age engine.** It keeps a posterior over the hidden value, ages 10–50, and updates it with Bayes on every answer. The prior bumps gently over roughly ages 15–35. Ages are ordered, so evidence for one age smooths onto its neighbours. Confidence is the posterior mass within ±1 year of the best age. Edge guesses collapse to "≤10" or "≥50". The next question is chosen by expected information gain. The stop rule is: confidence at or above a threshold (about 0.88) after a minimum number of questions (about 12), or a maximum number of questions (about 45), or no remaining question that is expected to move the posterior. Question choice has some randomness, so plays vary.
- **Question facts.** Each question stores facts, not tables. A familiarity question about a title records its first-run years in Thailand, its channel or platform, its audience (kids, teens, general, adult), and how popular it was in Thailand. A model derives P(answer | age) from these facts, including the effect of parents knowing kids' shows and the long tail of classics everyone has heard of. A question may carry an override table for one or more answers. The question bank is typed TypeScript modules.
- **Answer sets.** Familiarity questions use four levels plus the wording variants for films. Every question has 4–5 options, each with one clear meaning and an optional hint, and "don't know" is always last. ~~Era and life questions use 3–5 choices.~~ Era and life questions were removed after v1.
- **Memory strata.** Era bands (for example ≤1995, 1996–2002, 2003–2009, 2010–2016, 2017–2021, 2022+) are sized by how much the player knew of each band's titles, with sample titles. Bands are labelled in Common Era years (ค.ศ.), not พ.ศ.
- **Deciding answer.** The answer whose update moved the posterior most toward the final guess.

## Testing Decisions

- **One seam.** The Anime Age engine's public interface, as a pure TypeScript module with no React or DOM. Tests drive whole plays through it, exactly as the play screen does.
- **A good test** starts a play, answers through the interface, and asserts what a player could observe: the guess, the confidence, when the play stops, and how many questions were asked. It never asserts internal tables or helper calls.
- **Simulated-player suite.** For every age from 10 to 50, run many seeded plays whose answers are sampled from the bank's derived probabilities. Assert a hit rate of at least 80% within ±1 year (edges counted as hits), that every play stops within the maximum, and that no guess comes before the minimum.
- **Persona suite.** Each persona file holds a true age and recorded answers by question id. Replay each one through the interface, choosing only questions the persona answered, and assert a hit. v1 ships with the persona infrastructure and a placeholder persona written by the author, which must be replaced with real people's answers.
- **Bank validity.** The type checker covers fact shapes. A test asserts that question ids are unique and that every derived distribution is a valid probability distribution at every age.
- **Not tested in v1.** The play screen is checked by hand in a browser.
- **Runner.** `bun test`.
- **Prior art.** None, because the repo is greenfield.

## Out of Scope

- The Province and University games, beyond "coming soon" cards.
- Any backend, challenger counter, global hit rate, learning from reveals, analytics, or data collection.
- Share and export, share images, and per-result OG cards.
- English or any other language.
- A browser test of the play screen.
- ~~Restoring a play after a page refresh.~~ Now in scope, see Changes since v1.

## Changes since v1

Each change was asked for by the user after v1 merged.

| Change | State |
| --- | --- |
| **Pick questions** ("เรื่องไหน…"): choose a title from a list. | Merged in v1. |
| **Clear options.** Each option has one meaning and an optional hint; 4–5 options; don't-know last. | Merged in v1. |
| **Era and life `choice` questions removed** ("anime only, no ways/methods"). Story 9 is obsolete. | Done on `anime-cues`, not merged. |
| **Cue questions** (about 45): "this song line, quote or character is from which anime?", with 3 titles plus ไม่รู้ / นึกไม่ออก. | Done on `anime-cues`, not merged. |
| **Memory strata labelled in ค.ศ.** | Done, not merged. |
| **Visual redesign** with the Hallmark skill: Rosé Pine palette, Mali headings, Noto Sans Thai Looped body text, thin card-stock answers. Story 29 (light and dark themes) still holds. | Done on `hallmark-redesign`, not merged. |
| **Refresh restore.** A play survives a page refresh. Local storage keeps the seed, the answers and the reveal until the player presses start or play again. Shared with Province. | In progress. |
| **UI sounds** (CC0) with a mute toggle. Shared with Province. | In progress. |

Latest measured numbers on `anime-cues`: hit rate 0.845 pooled, worst age 45 at 0.675, mean 27.8 questions.

## Further Notes

- The question facts (Thai airing years and channels) are written from the author's or agent's knowledge, not from verified sources. Each fact with low confidence should be marked in the bank so that personas can expose it.
- The research on nenrei, and how its algorithm and flow inform this game, is in `intent.md`.
