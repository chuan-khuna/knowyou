/**
 * The Bleach quiz: the module's only entry point. Code outside src/games/bleach
 * imports from here; boundaries.test.ts fails on any deeper import. The quiz
 * itself is the shared one in src/games/quiz.
 *
 * Questions cover the manga, the 366-episode TV anime and the Thousand-Year
 * Blood War anime; where TYBW differs, the manga wins. No anime filler, films,
 * novels, games or musicals.
 */

import { createQuiz, parseGlossary, parseQuestions } from "@/games/quiz";
import { SCORE_BANDS } from "@/games/bleach/bands";
import glossary from "@/games/bleach/glossary.json";
import questions from "@/games/bleach/questions.json";

export const bleachQuiz = createQuiz({
  id: "bleach",
  bank: parseQuestions(questions),
  glosses: parseGlossary(glossary),
  bands: SCORE_BANDS,
});
