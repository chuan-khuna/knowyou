import type { BankAnswers } from "../bank";
import type { FinishedUniversityPlay } from "../engine";
import type { UniversityId } from "../ids";

/** A real person's recorded answers and university: the ground truth for the question bank. */
export interface Persona {
  /** A handle, never a real name. */
  readonly name: string;
  /** Where they did their bachelor's. */
  readonly university: UniversityId;
  /** yyyy-mm-dd. */
  readonly recorded: string;
  /** Marks an author-written stand-in that real answers must replace. */
  readonly placeholder?: true;
  /** Each answer is checked by the type checker against its own question's answer keys. Pick questions are not recorded. */
  readonly answers: BankAnswers;
}

export const definePersona = (persona: Persona): Persona => persona;

/** A finished play as the source of a persona file, for the dev build's recorder. Pick answers are left out. */
export function toPersonaSource(play: FinishedUniversityPlay, university: UniversityId, recorded: string): string {
  const lines = play.answers
    .filter((a) => !a.questionId.startsWith("pick:"))
    .map((a) => `    ${JSON.stringify(a.questionId)}: ${JSON.stringify(a.answerKey)},`);
  return [
    `import { definePersona } from "./persona";`,
    ``,
    `export const persona = definePersona({`,
    `  name: "CHANGE-ME",`,
    `  university: ${JSON.stringify(university)},`,
    `  recorded: ${JSON.stringify(recorded)},`,
    `  answers: {`,
    ...lines,
    `  },`,
    `});`,
    ``,
  ].join("\n");
}
