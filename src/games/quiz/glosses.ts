/**
 * The original names shown under an option whose label is a foreign name, or a
 * Thai translation of one. Keyed by the exact option label, so one entry covers
 * that label wherever it appears, as an answer or a decoy. A gloss is Japanese
 * or Korean, told apart by which pair of names it has.
 */
interface GlossNames {
  /**
   * Other Thai names fans know the same thing by, such as a TV dub's name
   * where the label follows the manga. Shown in brackets after the label.
   */
  readonly aka?: readonly string[];
  readonly english: string;
}

export interface JapaneseGloss extends GlossNames {
  /** Hepburn romanisation. */
  readonly romaji: string;
  readonly kanji: string;
}

export interface KoreanGloss extends GlossNames {
  /** Revised Romanization of Korean. */
  readonly romanization: string;
  readonly hangul: string;
}

export type Gloss = JapaneseGloss | KoreanGloss;

const PAIRS = [
  ["romaji", "kanji"],
  ["romanization", "hangul"],
] as const;

/**
 * Reads a title's glossary.json. An entry needs `english` and exactly one complete pair:
 * `romaji` and `kanji`, or `romanization` and `hangul`. Throws on any other entry, or on
 * an aka that isn't a list of strings, listing every one.
 */
export function parseGlossary(raw: unknown): Readonly<Record<string, Gloss>> {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) throw new Error("glossary.json: expected an object keyed by option label");
  const issues = Object.entries(raw).flatMap(([label, g]) => {
    const entry = (g ?? {}) as Record<string, unknown>;
    const found: string[] = [];
    if (typeof entry.english !== "string") found.push(`${label}: needs english`);
    const pairs = PAIRS.filter((pair) => pair.some((field) => entry[field] !== undefined));
    if (pairs.length === 0) found.push(`${label}: needs romaji and kanji, or romanization and hangul`);
    else if (pairs.length > 1) found.push(`${label}: has both romaji/kanji and romanization/hangul; keep one pair`);
    else if (!pairs[0]!.every((field) => typeof entry[field] === "string")) found.push(`${label}: needs both ${pairs[0]!.join(" and ")}`);
    const aka = entry.aka;
    if (aka !== undefined && !(Array.isArray(aka) && aka.every((name) => typeof name === "string"))) found.push(`${label}: aka must be a list of names`);
    return found;
  });
  if (issues.length > 0) throw new Error(`glossary.json:\n  ${issues.join("\n  ")}`);
  return raw as Readonly<Record<string, Gloss>>;
}

/** A glossary term named inside a prompt, with its gloss. */
export interface PromptTerm {
  readonly label: string;
  readonly gloss: Gloss;
}

const thaiWords = new Intl.Segmenter("th", { granularity: "word" });

/**
 * The glossary terms a prompt names, in the order they appear, each once.
 * Thai has no spaces, so a term counts only where it starts and ends on a
 * word boundary: นภา is found in แหวนแห่งนภา but not inside ในภาคอนาคต. Where
 * terms overlap the longest wins, so ลูกถล่มปฐพีสองมือ is not also ลูกถล่มปฐพี.
 */
export function termsIn(text: string, glosses: Readonly<Record<string, Gloss>>): readonly PromptTerm[] {
  const bounds = new Set([text.length, ...Array.from(thaiWords.segment(text), (s) => s.index)]);
  const taken: { start: number; end: number; label: string }[] = [];
  for (const label of Object.keys(glosses).sort((a, b) => b.length - a.length)) {
    for (let start = text.indexOf(label); start !== -1; start = text.indexOf(label, start + 1)) {
      const end = start + label.length;
      if (!bounds.has(start) || !bounds.has(end)) continue;
      if (taken.some((t) => t.start < end && start < t.end)) continue;
      taken.push({ start, end, label });
    }
  }
  const labels = [...new Set(taken.sort((a, b) => a.start - b.start).map((t) => t.label))];
  return labels.map((label) => ({ label, gloss: glosses[label]! }));
}
