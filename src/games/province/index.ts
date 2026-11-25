/**
 * Province: the module's only entry point. Code outside src/games/province
 * imports from here; boundaries.test.ts fails on any deeper import.
 */

import { provinceBank } from "./bank";
import { createProvinceEngine, type FinishedProvincePlay, type ProvinceEngine } from "./engine";
import type { ProvinceId } from "./ids";
import { simulatePlay as simulateWith } from "./testing/simulated-player";

export {
  PICK_PROMPT,
  PROVINCE_RULES,
  createProvinceEngine,
  guessLabel,
  type AnswerRows,
  type Candidate,
  type FinishedProvincePlay,
  type ProvinceEngine,
  type ProvinceExtras,
  type ProvinceLive,
  type ProvincePlay,
} from "./engine";
export { provinceBank, type AnswerOf, type BankAnswers, type QuestionId } from "./bank";
export { PROVINCE_COUNT, PROVINCE_IDS, PROVINCE_ISO, isProvinceId, type ProvinceId } from "./ids";
export { PROVINCES } from "./provinces";
export { NEIGHBOURS_VIEWBOX, NEIGHBOUR_SHAPES, PROVINCE_SHAPES, THAILAND_VIEWBOX, type NeighbourCode } from "./map/shapes";
export { REGION_NAMES, type Figure, type ProvinceFacts, type Region } from "./schema";

/** The engine over the shipped bank, compiled once at module load. */
export const province = createProvinceEngine(provinceBank.list);

/** Test support: one whole play as a simulated player from `home`, answers drawn from the engine's own rows. */
export const simulatePlay = (home: ProvinceId, seed: number, engine: ProvinceEngine = province): FinishedProvincePlay =>
  simulateWith(engine, home, seed);
