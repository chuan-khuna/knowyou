/**
 * The Reborn quiz: the module's only entry point. Code outside src/games/reborn
 * imports from here; boundaries.test.ts fails on any deeper import. The quiz
 * itself is the shared one in src/games/quiz.
 *
 * Questions cover Katekyo Hitman Reborn!: the whole manga, to the end of the Curse of the Rainbow, and the TV
 * anime where it follows the manga. No anime-only arcs, OVAs, light novels or games.
 */

import { createQuiz, parseGlossary, parseQuestions } from "../quiz";
import { SCORE_BANDS } from "./bands";
import glossary from "./glossary.json";
import questions from "./questions.json";

export const rebornQuiz = createQuiz({
  id: "reborn",
  bank: parseQuestions(questions),
  glosses: parseGlossary(glossary),
  bands: SCORE_BANDS,
});
