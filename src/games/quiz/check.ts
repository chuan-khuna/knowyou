import { termsIn } from "./glosses";
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
    // An option's other names must not name another option, or the brackets would make two options the same.
    const names = options.flatMap((o) => [o, ...(glosses[o]?.aka ?? []).map((a) => a.trim())]);
    if (new Set(names).size !== names.length) issues.push(`${id}: an aka names another option`);
    if (q.note !== undefined && q.note.trim() === "") issues.push(`${id}: empty note`);
    if (!isHttpsUrl(q.source)) issues.push(`${id}: source is not an https URL`);
  }

  const named = new Set(
    Object.values(bank).flatMap((q) => [q.answer, ...q.decoys, ...termsIn(q.prompt, glosses).map((t) => t.label)]),
  );
  for (const label of Object.keys(glosses)) {
    if (!named.has(label)) issues.push(`gloss ${label}: names no option or prompt term`);
  }
  for (const [label, gloss] of Object.entries(glosses)) {
    const aka = (gloss.aka ?? []).map((a) => a.trim());
    if (aka.some((a) => a === "")) issues.push(`gloss ${label}: empty aka`);
    if (aka.includes(label.trim())) issues.push(`gloss ${label}: aka repeats the label`);
    if (new Set(aka).size !== aka.length) issues.push(`gloss ${label}: aka names are not distinct`);
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
