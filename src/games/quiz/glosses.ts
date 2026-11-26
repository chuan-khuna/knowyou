/**
 * The original names shown under an option whose label is a Japanese technique
 * name, or a Thai translation of one. Keyed by the exact option label, so one
 * entry covers that label wherever it appears, as an answer or a decoy.
 */
export interface Gloss {
  /** Hepburn romanisation. */
  readonly romaji: string;
  readonly kanji: string;
  readonly english: string;
}

/** Reads a title's glossary.json. Throws on an entry without all three names, listing every one. */
export function parseGlossary(raw: unknown): Readonly<Record<string, Gloss>> {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) throw new Error("glossary.json: expected an object keyed by option label");
  const issues = Object.entries(raw)
    .filter(([, g]) => !["romaji", "kanji", "english"].every((field) => typeof (g as Record<string, unknown>)?.[field] === "string"))
    .map(([label]) => `${label}: needs romaji, kanji and english`);
  if (issues.length > 0) throw new Error(`glossary.json:\n  ${issues.join("\n  ")}`);
  return raw as Readonly<Record<string, Gloss>>;
}
