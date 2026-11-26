/**
 * The Kuroko no Basket quiz: the module's only entry point. Code outside
 * src/games/kuroko-no-basket imports from here; boundaries.test.ts fails on any
 * deeper import. The quiz itself is the shared one in src/games/quiz.
 *
 * Questions cover the manga, the three TV seasons and the EXTRA GAME sequel.
 * No Last Game film-only changes, novels, games or stage plays.
 */

import { createQuiz, parseGlossary, parseQuestions } from "@/games/quiz";
import { SCORE_BANDS } from "@/games/kuroko-no-basket/bands";
import glossary from "@/games/kuroko-no-basket/glossary.json";
import questions from "@/games/kuroko-no-basket/questions.json";

export const kurokoNoBasketQuiz = createQuiz({
  id: "kuroko-no-basket",
  bank: parseQuestions(questions),
  glosses: parseGlossary(glossary),
  bands: SCORE_BANDS,
});
