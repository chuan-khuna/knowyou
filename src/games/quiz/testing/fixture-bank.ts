import type { ScoreBand } from "../bands";
import type { QuestionBank, QuizQuestion, Tier } from "../question";
import { TIERS } from "../question";
import type { QuizContent } from "../quiz";

/** A bank with `perTier` made-up questions in each tier. Ids are `<tier>-<n>`, answers are `right <id>`. */
export function fixtureBank(perTier: number): QuestionBank {
  const bank: Record<string, QuizQuestion> = {};
  for (const tier of TIERS) {
    for (let n = 0; n < perTier; n++) {
      const id = `${tier}-${n}`;
      bank[id] = question(tier, id);
    }
  }
  return bank;
}

/** Five bands, 0–4 to 17–20, titled `band <min>-<max>`. */
export const FIXTURE_BANDS: readonly ScoreBand[] = [0, 5, 9, 13, 17].map((min, i, mins) => {
  const max = (mins[i + 1] ?? 21) - 1;
  return { min, max, title: `band ${min}-${max}`, line: `line ${min}-${max}` };
});

/** A made-up title over `fixtureBank(perTier)`, with no glosses and `FIXTURE_BANDS`. */
export function fixtureContent(perTier: number, changes: Partial<QuizContent> = {}): QuizContent {
  return { id: "fixture", bank: fixtureBank(perTier), glosses: {}, bands: FIXTURE_BANDS, ...changes };
}

function question(tier: Tier, id: string): QuizQuestion {
  return {
    tier,
    prompt: `prompt ${id}`,
    answer: `right ${id}`,
    decoys: [`wrong ${id} 1`, `wrong ${id} 2`, `wrong ${id} 3`],
    source: `https://example.org/${id}`,
  };
}
