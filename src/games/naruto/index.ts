/**
 * The Naruto quiz: the module's only entry point. Code outside src/games/naruto
 * imports from here; boundaries.test.ts fails on any deeper import. The quiz
 * itself is the shared one in src/games/quiz.
 *
 * Questions cover Naruto and Naruto Shippuden, up to the end of the Fourth
 * Shinobi World War.
 */

import { createQuiz, parseGlossary, parseQuestions } from "../quiz";
import { SCORE_BANDS } from "./bands";
import glossary from "./glossary.json";
import questions from "./questions.json";

export const narutoQuiz = createQuiz({
  id: "naruto",
  bank: parseQuestions(questions),
  glosses: parseGlossary(glossary),
  bands: SCORE_BANDS,
});
