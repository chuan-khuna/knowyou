import { universityBank } from "../bank";
import { createUniversityEngine, type FinishedUniversityPlay } from "../engine";
import type { Persona } from "./persona";
import { placeholderAuthor } from "./placeholder-author";

export { definePersona, toPersonaSource, type Persona } from "./persona";

/** Every persona file. A new recording is added here. */
export const PERSONAS: readonly Persona[] = [placeholderAuthor];

/**
 * Replays a persona on an engine built from only the questions it answered,
 * with pick questions off, so every question the engine asks has a recorded answer.
 */
export function replayPersona(persona: Persona, seed = 1): FinishedUniversityPlay {
  const recorded: Readonly<Record<string, string | undefined>> = persona.answers;
  const engine = createUniversityEngine(universityBank.list.filter((q) => recorded[q.id] !== undefined), { picks: false });
  let play = engine.start({ seed });
  while (play.phase === "asking") play = engine.answer(play, recorded[play.question.id]!);
  return play;
}
