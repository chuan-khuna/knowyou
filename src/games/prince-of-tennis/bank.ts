import questions from "./questions.json";
import { TIERS, type QuestionBank, type QuizQuestion, type Tier } from "./question";

/**
 * Reads the question list from questions.json into a bank keyed by id.
 * Throws on a question of the wrong shape or a repeated id, listing every one,
 * so a bad edit fails the tests and the build rather than a play.
 */
export function parseQuestions(raw: unknown): QuestionBank {
  if (!Array.isArray(raw)) throw new Error("questions.json: expected an array of questions");
  const bank: Record<string, QuizQuestion> = {};
  const issues: string[] = [];
  raw.forEach((entry: unknown, i) => {
    const q = (entry ?? {}) as Record<string, unknown>;
    const at = typeof q.id === "string" ? q.id : `question ${i}`;
    const text = (field: string) => typeof q[field] === "string";
    if (!text("id") || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(q.id as string)) issues.push(`${at}: id must be lowercase kebab-case`);
    if (!TIERS.includes(q.tier as Tier)) issues.push(`${at}: tier must be one of ${TIERS.join(", ")}`);
    for (const field of ["prompt", "answer", "source"]) if (!text(field)) issues.push(`${at}: ${field} must be text`);
    for (const field of ["note", "evidence"]) if (q[field] !== undefined && !text(field)) issues.push(`${at}: ${field} must be text`);
    if (!Array.isArray(q.decoys) || q.decoys.length !== 3 || !q.decoys.every((d) => typeof d === "string")) {
      issues.push(`${at}: decoys must be 3 texts`);
    }
    if (text("id") && bank[at]) issues.push(`${at}: duplicate id`);
    const { id: _id, ...question } = q;
    if (text("id")) bank[at] = question as unknown as QuizQuestion;
  });
  if (issues.length > 0) throw new Error(`questions.json:\n  ${issues.join("\n  ")}`);
  return bank;
}

/** The shipped bank. Questions ask about moves, schools and story events only: no birthdays, numbers, scores or personal trivia. */
export const bank: QuestionBank = parseQuestions(questions);
