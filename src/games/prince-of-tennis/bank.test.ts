import { describe, expect, test } from "bun:test";
import { GLOSSES, MIN_QUESTIONS_PER_TIER, TIERS, bank, bankIssues, createQuiz, type QuestionBank, type QuizPlay } from ".";
import { fixtureBank } from "./testing/fixture-bank";

describe("the question bank", () => {
  test("passes every bank rule", () => {
    expect(bankIssues(bank)).toEqual([]);
  });

  test(`has at least ${MIN_QUESTIONS_PER_TIER} questions in every tier`, () => {
    for (const tier of TIERS) {
      expect(Object.values(bank).filter((q) => q.tier === tier).length).toBeGreaterThanOrEqual(MIN_QUESTIONS_PER_TIER);
    }
  });
});

describe("English glosses", () => {
  test("every gloss names an option in the bank", () => {
    const labels = new Set<string>(Object.values(bank).flatMap((q) => [q.answer, ...q.decoys]));
    expect(Object.keys(GLOSSES).filter((label) => !labels.has(label))).toEqual([]);
  });

  test("an option with a gloss carries it on the card", () => {
    const quiz = createQuiz(bank);
    for (let seed = 0; seed < 50; seed++) {
      let play: QuizPlay = quiz.start(seed, "all");
      while (play.phase === "asking") {
        for (const option of play.question.options) expect(option.gloss).toEqual(GLOSSES[option.label]);
        play = quiz.answer(play, play.question.options[0]!.key);
      }
    }
  });
});

describe("bankIssues rejects what the types can't check", () => {
  const good = fixtureBank(MIN_QUESTIONS_PER_TIER);
  const withQuestion = (changes: Partial<QuestionBank[string]>): QuestionBank => ({
    ...good,
    "easy-0": { ...good["easy-0"]!, ...changes },
  });

  test("a good bank has no issues", () => {
    expect(bankIssues(good)).toEqual([]);
  });

  test.each([
    ["a tier short of questions", fixtureBank(MIN_QUESTIONS_PER_TIER - 1), "tier easy: 14 questions, needs 15"],
    ["an empty prompt", withQuestion({ prompt: "  " }), "easy-0: empty prompt"],
    ["an empty option", withQuestion({ decoys: ["", "x", "y"] }), "easy-0: empty option"],
    ["a decoy equal to the answer after trimming", withQuestion({ decoys: [" right easy-0 ", "x", "y"] }), "easy-0: options are not distinct"],
    ["two equal decoys", withQuestion({ decoys: ["x", "x", "y"] }), "easy-0: options are not distinct"],
    ["an empty note", withQuestion({ note: " " }), "easy-0: empty note"],
    ["an http source", withQuestion({ source: "http://example.org" }), "easy-0: source is not an https URL"],
    ["a source that isn't a URL", withQuestion({ source: "wiki" }), "easy-0: source is not an https URL"],
  ])("%s", (_, bad, issue) => {
    expect(bankIssues(bad)).toContain(issue);
  });
});
