import { TIERS } from "./question";
import { QUESTIONS_PER_PLAY, type QuizContent } from "./quiz";

export const MIN_QUESTIONS_PER_TIER = 15;

/** The rules the types can't express, over a title's bank, glosses and bands. Empty when the title is fit to ship. */
export function quizIssues({ bank, glosses, bands }: QuizContent): string[] {
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

  const labels = new Set(Object.values(bank).flatMap((q) => [q.answer, ...q.decoys]));
  for (const label of Object.keys(glosses)) {
    if (!labels.has(label)) issues.push(`gloss ${label}: names no option`);
  }

  for (let score = 0; score <= QUESTIONS_PER_PLAY; score++) {
    const count = bands.filter((b) => score >= b.min && score <= b.max).length;
    if (count !== 1) issues.push(`score ${score}: in ${count} bands, needs 1`);
  }
  for (const band of bands) {
    if (band.title.trim() === "") issues.push(`band ${band.min}-${band.max}: empty title`);
    if (band.line.trim() === "") issues.push(`band ${band.min}-${band.max}: empty line`);
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
