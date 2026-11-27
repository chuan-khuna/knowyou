/**
 * The Solo Leveling quiz: the module's only entry point. Code outside
 * src/games/solo-leveling imports from here; boundaries.test.ts fails on any
 * deeper import. The quiz itself is the shared one in src/games/quiz.
 *
 * Questions cover the main story only: the webtoon chapters 1 to 179, and the
 * anime where it adapts them. No side stories, Ragnarok, games, film-only
 * scenes or web-novel-only details. Glosses are Korean.
 */

import { createQuiz, parseGlossary, parseQuestions } from "@/games/quiz";
import { SCORE_BANDS } from "@/games/solo-leveling/bands";
import glossary from "@/games/solo-leveling/glossary.json";
import questions from "@/games/solo-leveling/questions.json";

export const soloLevelingQuiz = createQuiz({
  id: "solo-leveling",
  bank: parseQuestions(questions),
  glosses: parseGlossary(glossary),
  bands: SCORE_BANDS,
});
