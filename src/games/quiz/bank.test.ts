import { describe, expect, test } from "bun:test";
import { MIN_QUESTIONS_PER_TIER, parseGlossary, parseQuestions, quizIssues, type QuestionBank, type QuizContent } from ".";
import { FIXTURE_BANDS, fixtureContent } from "./testing/fixture-bank";

describe("reading the JSON files", () => {
  const question = { id: "a-b", tier: "easy", prompt: "p?", answer: "a", decoys: ["b", "c", "d"], source: "https://example.org" };

  test("keys the bank by id and drops the id from the question", () => {
    expect(parseQuestions([question])).toEqual({ "a-b": { tier: "easy", prompt: "p?", answer: "a", decoys: ["b", "c", "d"], source: "https://example.org" } });
  });

  test.each([
    ["a repeated id", [question, question], "a-b: duplicate id"],
    ["an id that isn't kebab-case", [{ ...question, id: "A_b" }], "A_b: id must be lowercase kebab-case"],
    ["an unknown tier", [{ ...question, tier: "expert" }], "a-b: tier must be one of"],
    ["two decoys", [{ ...question, decoys: ["b", "c"] }], "a-b: decoys must be 3 texts"],
    ["a missing answer", [{ ...question, answer: undefined }], "a-b: answer must be text"],
    ["a note that isn't text", [{ ...question, note: 1 }], "a-b: note must be text"],
  ])("rejects %s", (_, raw, issue) => {
    expect(() => parseQuestions(raw)).toThrow(issue);
  });

  test("rejects a glossary entry without all three names", () => {
    expect(() => parseGlossary({ "ท่า": { romaji: "Waza", kanji: "技" } })).toThrow("ท่า: needs romaji, kanji and english");
  });
});

describe("quizIssues rejects what the types can't check", () => {
  const good = fixtureContent(MIN_QUESTIONS_PER_TIER);
  const withQuestion = (changes: Partial<QuestionBank[string]>): QuizContent => ({
    ...good,
    bank: { ...good.bank, "easy-0": { ...good.bank["easy-0"]!, ...changes } },
  });
  const gloss = { romaji: "Waza", kanji: "技", english: "Technique" };

  test("a good title has no issues", () => {
    expect(quizIssues(good)).toEqual([]);
    expect(quizIssues({ ...good, glosses: { "wrong easy-3 1": gloss } })).toEqual([]);
  });

  test.each([
    ["a tier short of questions", fixtureContent(MIN_QUESTIONS_PER_TIER - 1), "tier easy: 14 questions, needs 15"],
    ["an empty prompt", withQuestion({ prompt: "  " }), "easy-0: empty prompt"],
    ["an empty option", withQuestion({ decoys: ["", "x", "y"] }), "easy-0: empty option"],
    ["a decoy equal to the answer after trimming", withQuestion({ decoys: [" right easy-0 ", "x", "y"] }), "easy-0: options are not distinct"],
    ["two equal decoys", withQuestion({ decoys: ["x", "x", "y"] }), "easy-0: options are not distinct"],
    ["an empty note", withQuestion({ note: " " }), "easy-0: empty note"],
    ["an http source", withQuestion({ source: "http://example.org" }), "easy-0: source is not an https URL"],
    ["a source that isn't a URL", withQuestion({ source: "wiki" }), "easy-0: source is not an https URL"],
    ["a gloss no option uses", { ...good, glosses: { "ท่า": gloss } }, "gloss ท่า: names no option"],
    ["a score no band holds", { ...good, bands: FIXTURE_BANDS.slice(0, 4) }, "score 17: in 0 bands, needs 1"],
    ["a score two bands hold", { ...good, bands: [...FIXTURE_BANDS, { min: 20, max: 20, title: "t", line: "l" }] }, "score 20: in 2 bands, needs 1"],
    ["a band without a title", { ...good, bands: FIXTURE_BANDS.map((b) => (b.min === 0 ? { ...b, title: " " } : b)) }, "band 0-4: empty title"],
    ["a band without a line", { ...good, bands: FIXTURE_BANDS.map((b) => (b.min === 5 ? { ...b, line: "" } : b)) }, "band 5-8: empty line"],
  ])("%s", (_, bad, issue) => {
    expect(quizIssues(bad)).toContain(issue);
  });
});
