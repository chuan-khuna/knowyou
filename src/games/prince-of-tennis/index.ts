/**
 * The Prince of Tennis quiz: the module's only entry point. Code outside
 * src/games/prince-of-tennis imports from here; boundaries.test.ts fails on
 * any deeper import.
 */

import { bank } from "./bank";
import { createQuiz } from "./quiz";

export { bank } from "./bank";
export { SCORE_BANDS, bandFor, type ScoreBand } from "./bands";
export { MIN_QUESTIONS_PER_TIER, bankIssues } from "./check";
export { TIERS, type QuestionBank, type QuizQuestion, type Tier } from "./question";
export {
  QUESTIONS_PER_PLAY,
  QUESTIONS_PER_TIER,
  QUIZ_MODES,
  createQuiz,
  type AnsweredQuizQuestion,
  type AskingQuizPlay,
  type FinishedQuizPlay,
  type Quiz,
  type QuizCard,
  type QuizMode,
  type QuizOption,
  type QuizPlay,
} from "./quiz";
export { QUIZ_RECORD_KEY, encodeQuizRecord, restoreQuiz } from "./record";

/** The quiz over the shipped bank. */
export const princeOfTennisQuiz = createQuiz(bank);
