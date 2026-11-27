/**
 * The Haikyu!! quiz: the module's only entry point. Code outside
 * src/games/haikyu imports from here; boundaries.test.ts fails on any deeper
 * import. The quiz itself is the shared one in src/games/quiz.
 *
 * Questions cover the whole manga, chapters 1 to 402, and the anime where it
 * adapts them. No OVAs, recap films, novels, spin-offs, games or stage plays.
 */

import { createQuiz, parseGlossary, parseQuestions } from "@/games/quiz";
import { SCORE_BANDS } from "@/games/haikyu/bands";
import glossary from "@/games/haikyu/glossary.json";
import questions from "@/games/haikyu/questions.json";

export const haikyuQuiz = createQuiz({
  id: "haikyu",
  bank: parseQuestions(questions),
  glosses: parseGlossary(glossary),
  bands: SCORE_BANDS,
});
