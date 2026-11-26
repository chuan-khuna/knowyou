import { expect, test } from "bun:test";
import { quizIssues } from "../quiz";
import { princeOfTennisQuiz } from ".";

test("the shipped questions, glosses and bands pass every rule", () => {
  expect(quizIssues(princeOfTennisQuiz)).toEqual([]);
});
