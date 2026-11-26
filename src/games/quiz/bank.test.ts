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

  test("reads other names, and rejects an aka that isn't a list of names", () => {
    const entry = { romaji: "Chaozu", kanji: "餃子", english: "Chiaotzu" };
    expect(parseGlossary({ เกี๊ยวซ่า: { ...entry, aka: ["เจาซือ"] } })["เกี๊ยวซ่า"]!.aka).toEqual(["เจาซือ"]);
    expect(() => parseGlossary({ เกี๊ยวซ่า: { ...entry, aka: "เจาซือ" } })).toThrow("เกี๊ยวซ่า: aka must be a list of names");
    expect(() => parseGlossary({ เกี๊ยวซ่า: { ...entry, aka: [1] } })).toThrow("เกี๊ยวซ่า: aka must be a list of names");
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
    // A gloss may name a term that only a prompt mentions.
    expect(quizIssues({ ...withQuestion({ prompt: "ใครใช้ท่าไม้ตาย นี้?" }), glosses: { ท่าไม้ตาย: gloss } })).toEqual([]);
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
    ["a gloss no option or prompt uses", { ...good, glosses: { "ท่า": gloss } }, "gloss ท่า: names no option or prompt term"],
    ["an empty aka", { ...good, glosses: { "right easy-0": { ...gloss, aka: [" "] } } }, "gloss right easy-0: empty aka"],
    ["an aka equal to its label", { ...good, glosses: { "right easy-0": { ...gloss, aka: ["right easy-0"] } } }, "gloss right easy-0: aka repeats the label"],
    ["two equal aka", { ...good, glosses: { "right easy-0": { ...gloss, aka: ["x", "x "] } } }, "gloss right easy-0: aka names are not distinct"],
    ["an aka naming another option", { ...good, glosses: { "right easy-0": { ...gloss, aka: ["wrong easy-0 1"] } } }, "easy-0: an aka names another option"],
    ["a score no band holds", { ...good, bands: FIXTURE_BANDS.slice(0, 4) }, "score 17: in 0 bands, needs 1"],
    ["a score two bands hold", { ...good, bands: [...FIXTURE_BANDS, { min: 20, max: 20, title: "t", line: "l" }] }, "score 20: in 2 bands, needs 1"],
    ["a band without a title", { ...good, bands: FIXTURE_BANDS.map((b) => (b.min === 0 ? { ...b, title: " " } : b)) }, "band 0-4: empty title"],
    ["a band without a line", { ...good, bands: FIXTURE_BANDS.map((b) => (b.min === 5 ? { ...b, line: "" } : b)) }, "band 5-8: empty line"],
  ])("%s", (_, bad, issue) => {
    expect(quizIssues(bad)).toContain(issue);
  });
});
