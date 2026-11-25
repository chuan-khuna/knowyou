import type { BankAnswers } from "../bank";
import type { FinishedProvincePlay } from "../engine";
import type { ProvinceId } from "../ids";

/** A real person's recorded answers and home province: the ground truth for the question bank. */
export interface Persona {
  /** A handle, never a real name. */
  readonly name: string;
  /** The province they grew up in. */
  readonly province: ProvinceId;
  /** yyyy-mm-dd. */
  readonly recorded: string;
  /** Marks an author-written stand-in that real answers must replace. */
  readonly placeholder?: true;
  /** Each answer is checked by the type checker against its own question's answer keys. Pick questions are not recorded. */
  readonly answers: BankAnswers;
}

export const definePersona = (persona: Persona): Persona => persona;

/** A finished play as the source of a persona file, for the dev build's recorder. Pick answers are left out. */
export function toPersonaSource(play: FinishedProvincePlay, province: ProvinceId, recorded: string): string {
  const lines = play.answers
    .filter((a) => !a.questionId.startsWith("pick:"))
    .map((a) => `    ${JSON.stringify(a.questionId)}: ${JSON.stringify(a.answerKey)},`);
  return [
    `import { definePersona } from "./persona";`,
    ``,
    `export const persona = definePersona({`,
    `  name: "CHANGE-ME",`,
    `  province: ${JSON.stringify(province)},`,
    `  recorded: ${JSON.stringify(recorded)},`,
    `  answers: {`,
    ...lines,
    `  },`,
    `});`,
    ``,
  ].join("\n");
}
