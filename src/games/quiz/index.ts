/**
 * The quiz, shared by every title: the module's only entry point. A title is
 * data (a bank, glosses and score bands) that `createQuiz` turns into a quiz.
 * Code outside src/games/quiz imports from here; boundaries.test.ts fails on
 * any deeper import.
 */

export { bandFor, type ScoreBand } from "./bands";
export { parseQuestions } from "./bank";
export { MIN_QUESTIONS_PER_TIER, quizIssues } from "./check";
export { parseGlossary, termsIn, type Gloss, type JapaneseGloss, type KoreanGloss, type PromptTerm } from "./glosses";
export { TIERS, type QuestionBank, type QuizQuestion, type Tier } from "./question";
export {
  MIN_QUESTIONS_PER_PLAY,
  QUESTIONS_PER_PLAY,
  createQuiz,
  type AnsweredQuizQuestion,
  type AskingQuizPlay,
  type FinishedQuizPlay,
  type Quiz,
  type QuizCard,
  type QuizContent,
  type QuizOption,
  type QuizPlay,
} from "./quiz";
export { encodeQuizRecord, quizRecordKey, restoreQuiz } from "./record";
export { SEED_CODE_LENGTH, randomSeed, readShareQuery, seedCode, seedFromCode, shareQuery } from "./seed";
