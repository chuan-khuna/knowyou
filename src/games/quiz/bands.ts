export interface ScoreBand {
  /** Inclusive. */
  readonly min: number;
  /** Inclusive. */
  readonly max: number;
  readonly title: string;
  readonly line: string;
}

/** The one band that holds `score`. Throws when no band does. */
export function bandFor(bands: readonly ScoreBand[], score: number): ScoreBand {
  const band = bands.find((b) => score >= b.min && score <= b.max);
  if (!band) throw new Error(`no band for score ${score}`);
  return band;
}
