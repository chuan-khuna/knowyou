import type { BankAnswers } from "../bank";
import type { FinishedAnimeAgePlay } from "../engine";

/** A real person's recorded answers and true age: the ground truth for the question bank. */
export interface Persona {
  /** A handle, never a real name. */
  readonly name: string;
  /** May fall outside 10–50; edge guesses cover it. */
  readonly age: number;
  /** yyyy-mm-dd. Ages are as of this date. */
  readonly recorded: string;
  /** Marks an author-written stand-in that real answers must replace. */
  readonly placeholder?: true;
  /** Each answer is checked by the type checker against its own question's answer keys. */
  readonly answers: BankAnswers;
}

export const definePersona = (persona: Persona): Persona => persona;

/** A finished play as the source of a persona file, for the dev build's recorder. */
export function toPersonaSource(play: FinishedAnimeAgePlay, age: number, recorded: string): string {
  const lines = play.answers.map((a) => `    ${JSON.stringify(a.questionId)}: ${JSON.stringify(a.answerKey)},`);
  return [
    `import { definePersona } from "./persona";`,
    ``,
    `export const persona = definePersona({`,
    `  name: "CHANGE-ME",`,
    `  age: ${age},`,
    `  recorded: ${JSON.stringify(recorded)},`,
    `  answers: {`,
    ...lines,
    `  },`,
    `});`,
    ``,
  ].join("\n");
}
