/**
 * The Dragon Ball quiz: the module's only entry point. Code outside src/games/dragon-ball
 * imports from here; boundaries.test.ts fails on any deeper import. The quiz
 * itself is the shared one in src/games/quiz.
 *
 * Questions cover Dragon Ball and Dragon Ball Z, manga and TV anime canon, from the start to the end of the
 * Majin Buu arc. No filler, films, GT, Super or Daima.
 */

import { createQuiz, parseGlossary, parseQuestions } from "../quiz";
import { SCORE_BANDS } from "./bands";
import glossary from "./glossary.json";
import questions from "./questions.json";

export const dragonBallQuiz = createQuiz({
  id: "dragon-ball",
  bank: parseQuestions(questions),
  glosses: parseGlossary(glossary),
  bands: SCORE_BANDS,
});
