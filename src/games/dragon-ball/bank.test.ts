import { expect, test } from "bun:test";
import { quizIssues } from "../quiz";
import { dragonBallQuiz } from ".";

test("the shipped questions, glosses and bands pass every rule", () => {
  expect(quizIssues(dragonBallQuiz)).toEqual([]);
});
