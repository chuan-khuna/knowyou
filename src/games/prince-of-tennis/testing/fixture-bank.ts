import type { QuestionBank, QuizQuestion, Tier } from "../question";
import { TIERS } from "../question";

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

function question(tier: Tier, id: string): QuizQuestion {
  return {
    tier,
    prompt: `prompt ${id}`,
    answer: `right ${id}`,
    decoys: [`wrong ${id} 1`, `wrong ${id} 2`, `wrong ${id} 3`],
    source: `https://example.org/${id}`,
  };
}
