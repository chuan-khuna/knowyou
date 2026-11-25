import { TIERS, type QuestionBank } from "./question";

export const MIN_QUESTIONS_PER_TIER = 15;

/** The bank rules the types can't express. Empty when the bank is fit to ship. */
export function bankIssues(bank: QuestionBank): string[] {
  const issues: string[] = [];
  for (const tier of TIERS) {
    const count = Object.values(bank).filter((q) => q.tier === tier).length;
    if (count < MIN_QUESTIONS_PER_TIER) issues.push(`tier ${tier}: ${count} questions, needs ${MIN_QUESTIONS_PER_TIER}`);
  }
  for (const [id, q] of Object.entries(bank)) {
    if (q.prompt.trim() === "") issues.push(`${id}: empty prompt`);
    const options = [q.answer, ...q.decoys].map((o) => o.trim());
    if (options.some((o) => o === "")) issues.push(`${id}: empty option`);
    if (new Set(options).size !== options.length) issues.push(`${id}: options are not distinct`);
    if (q.note !== undefined && q.note.trim() === "") issues.push(`${id}: empty note`);
    if (!isHttpsUrl(q.source)) issues.push(`${id}: source is not an https URL`);
  }
  return issues;
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}
