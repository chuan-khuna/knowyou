# How to create a quiz

How a new quiz title goes from an idea to a shipped route, and above all how its data is collected. Terms follow `GLOSSARY.md`; a quiz is a **Quiz**, not a **Game**. How the quiz module runs, and the exact file shapes, are in [quiz.md](quiz.md). The research brief for question writers is [prince-of-tennis-quiz-format.md](prince-of-tennis-quiz-format.md). The newest worked example is `.scratch/kuroko-quiz/spec.md` with `src/games/kuroko-no-basket/`.

## How the data is collected

A quiz title is data: `questions.json`, `glossary.json` and score bands. No quiz data comes from memory alone. Every question must cite a page that confirms the answer, and quote it.

- `source` is an `https:` URL of the page. The tests check that it parses.
- `evidence` is a short quote from that page, in the page's own language. The quiz never shows it. It stays in the bank so a reviewer can check the answer.
- A question that no page confirms is left out. There is no "unsure" marker.

The shipped titles came in three ways:

| Title | How the data was collected |
| --- | --- |
| Prince of Tennis | A session wrote 120 questions and checked each answer against the series wiki. Research agents then wrote 207 more from the format brief, and a maintainer imported them. |
| Naruto, Dragon Ball, Reborn | The user researched each bank outside the repo, with a topic sheet, hand-over notes and Thai-name sources. The banks were imported as they are. Only the JSON is in the repo. |
| Kuroko no Basket | The series wiki was saved as plain text in `tmp/kuroko/`. Three parallel passes drafted questions from that text. The drafts were merged, and every `evidence` quote was checked against its downloaded page. |

Prefer the Kuroko way for a new title. The agent that writes a question reads only the saved source text, so each answer can be traced to a page, and a quote that is not in the text is caught at once.

`tmp/` is in `.gitignore`. The downloaded text stays on your machine and never enters the repo.

## Steps

1. **Pick the title and write the spec.** Follow the requirements gate in `CLAUDE.md`: grill lightly, then write `.scratch/<slug>/spec.md`. Settle these in the spec:
   - Scope: which manga, seasons and films count, and the cut-off point. Name what is out, such as films, novels, games and filler.
   - Topics: the quizzes ask about named moves, groups, places, roles, nicknames and story events. They do not ask about birthdays, heights, scores, numbers or personal trivia.
   - Source: one main wiki for the series, with Wikipedia as the second choice.
   - Thai spellings: the edition fans use for names (the Kuroko spec uses the Siam Inter Comics edition).
   - Route slug in kebab-case, the Thai title `คุณรู้จัก <ชื่อเรื่อง> ดีแค่ไหน`, and five score bands.
2. **Save the source pages as plain text.** Create `tmp/<slug>/` and save one text file per wiki page: main characters, teams or schools, techniques, arcs and episodes. Keep the page URL with each file, because `source` needs it. The repo does not record the download method used for Kuroko, so any method that gives clean text per page works. A fandom wiki runs MediaWiki, so its `api.php` is one option; this is untested here.
3. **Draft the questions in parallel passes.** Split the source by topic, such as characters, techniques, teams and story arcs, and give each pass to one agent. Brief each agent with the question fields and rules in [prince-of-tennis-quiz-format.md](prince-of-tennis-quiz-format.md), the saved text only, and the scope from the spec. Each agent returns one JSON file with `questions` and `glossary`. An agent must not write a question the text cannot confirm.
4. **Merge the passes.** Check the whole set, not each file:
   - Every `id` is new, kebab-case and stable. A saved play names its questions by id, so never rename or reuse one.
   - No two questions ask the same fact in other words.
   - No prompt, note or decoy gives away the answer to another question.
   - Every decoy is the same kind of thing as its answer and is false by the source.
5. **Check every quote.** Open each `source` and confirm that `evidence` is on the page. For a saved text file, search it for the quote. Fix the question or drop it when the quote is missing. Kuroko shipped only after this check.
6. **Balance the tiers.** The module needs at least 15 questions in each tier, and `createQuiz` needs at least 5 in each. The shipped banks have 150 to 169 questions, with a spread like Kuroko's: 33 easy, 46 medium, 47 hard, 43 very hard.

   | Tier | Who can answer |
   | --- | --- |
   | `easy` | Anyone who watched the first season |
   | `medium` | A fan who finished the anime |
   | `hard` | A fan who remembers match or episode details |
   | `very-hard` | A close reader of the manga |

7. **Write the glossary.** Add one entry for each Japanese name, or Thai translation of one, that an option or a prompt uses. The key is the exact Thai label. Each entry has `romaji`, `kanji` and `english`. Add an `aka` only with a page that shows the name in use. Plain English names and character names need no entry.
8. **Mark what you could not verify.** The Kuroko spec lists Thai move names and some kanji that came from memory, not from a Thai edition or a page. Write such gaps under `## Assumptions` in the spec so the user can correct them.
9. **Build the module.** Follow "How to add a title" in [quiz.md](quiz.md). In short: `src/games/<slug>/` with `questions.json`, `glossary.json`, `bands.ts`, `index.ts`, `bank.test.ts` and `boundaries.test.ts`; a route in `src/app/<slug>/` with `page.tsx` and a client component; one line in `QUIZZES` in `src/app/page.tsx`. Copy the Kuroko files and change the names.
10. **Test and run.**
    - `bun test src/games/<slug>` checks the shapes, ids, glosses, tier counts and bands. `quizIssues` must return nothing.
    - `bun run typecheck` and `bun run build` check the route.
    - Start `bun run dev`, open `/<slug>` and play one round.
11. **Close the work.** Update the table and the score bands in [quiz.md](quiz.md), add the title's scope under "How to add a question" there, and fix the counts in its spec. Set the spec to `Status: done` with a `## Comments` line for the commit. Keep `tmp/<slug>/` out of the commit.

## Limits

- The repo has no script that downloads source text or checks quotes. Both steps are manual or agent work.
- For Naruto, Dragon Ball and Reborn, the source notes live outside the repo. Ask the user for them before you extend those banks.
- Thai move names are the weakest data. A name with no Thai edition behind it is a guess; flag it.
