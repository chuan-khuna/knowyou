/**
 * Anime Age: the module's only entry point. Code outside src/games/anime-age
 * imports from here; boundaries.test.ts fails on any deeper import.
 */

import { animeAgeBank } from "./bank";
import { createAnimeAgeEngine } from "./engine";

export {
  ANIME_AGE_RULES,
  ERA_BANDS,
  createAnimeAgeEngine,
  isHit,
  type AgeGuessValue,
  type AnimeAgeEngine,
  type AnimeAgeExtras,
  type AnimeAgePlay,
  type AnswerCurves,
  type EraBand,
  type FinishedAnimeAgePlay,
  type Stratum,
} from "./engine";
export { definePersona, toPersonaSource, type Persona } from "./personas";
export { animeAgeBank, type AnswerOf, type BankAnswers, type QuestionId } from "./bank";
export {
  AGES,
  BankError,
  defineBank,
  film,
  pickFrom,
  series,
  type Age,
  type BankPart,
  type Question,
} from "./schema";

/** The engine over the shipped bank, compiled once at module load. */
export const animeAge = createAnimeAgeEngine(animeAgeBank.list);
