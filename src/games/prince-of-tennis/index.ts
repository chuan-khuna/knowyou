/**
 * The Prince of Tennis quiz: the module's only entry point. Code outside
 * src/games/prince-of-tennis imports from here; boundaries.test.ts fails on
 * any deeper import. The quiz itself is the shared one in src/games/quiz.
 *
 * Questions ask about moves, schools and story events only: no birthdays,
 * numbers, scores or personal trivia.
 */

import { createQuiz, parseGlossary, parseQuestions } from "../quiz";
import { SCORE_BANDS } from "./bands";
import glossary from "./glossary.json";
import questions from "./questions.json";

export const princeOfTennisQuiz = createQuiz({
  id: "prince-of-tennis",
  bank: parseQuestions(questions),
  glosses: parseGlossary(glossary),
  bands: SCORE_BANDS,
});
