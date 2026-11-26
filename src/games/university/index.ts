/**
 * University: the module's only entry point. Code outside src/games/university
 * imports from here; boundaries.test.ts fails on any deeper import.
 */

import { universityBank } from "./bank";
import { createUniversityEngine, type FinishedUniversityPlay, type UniversityEngine } from "./engine";
import type { UniversityId } from "./ids";
import { simulatePlay as simulateWith } from "./testing/simulated-player";

export {
  PICK_PROMPT,
  UNIVERSITY_RULES,
  createUniversityEngine,
  guessLabel,
  type AnswerRows,
  type Candidate,
  type FinishedUniversityPlay,
  type UniversityEngine,
  type UniversityExtras,
  type UniversityPlay,
} from "./engine";
export { universityBank, type AnswerOf, type BankAnswers, type QuestionId } from "./bank";
export { UNIVERSITY_COUNT, UNIVERSITY_IDS, isUniversityId, type UniversityId } from "./ids";
export { UNIVERSITIES } from "./universities";
export { AREA_NAMES, type Area, type UniversityFacts } from "./schema";

/** The engine over the shipped bank, compiled once at module load. */
export const university = createUniversityEngine(universityBank.list);

/** Test support: one whole play as a simulated student of `home`, answers drawn from the engine's own rows. */
export const simulatePlay = (home: UniversityId, seed: number, engine: UniversityEngine = university): FinishedUniversityPlay =>
  simulateWith(engine, home, seed);
