export const TIERS = ["easy", "medium", "hard", "very-hard"] as const;
export type Tier = (typeof TIERS)[number];

export interface QuizQuestion {
  readonly tier: Tier;
  readonly prompt: string;
  readonly answer: string;
  readonly decoys: readonly [string, string, string];
  readonly note?: string;
  /** An https page that confirms the answer. */
  readonly source: string;
  /** A short quote from `source` that confirms the answer, for review only. */
  readonly evidence?: string;
}

/** Keyed by id, so a duplicate id is a compile error. Ids stay stable so a saved play survives a reordered bank. */
export type QuestionBank = { readonly [id: string]: QuizQuestion };
