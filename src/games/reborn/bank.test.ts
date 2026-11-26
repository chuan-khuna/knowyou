import { expect, test } from "bun:test";
import { quizIssues } from "../quiz";
import { rebornQuiz } from ".";

test("the shipped questions, glosses and bands pass every rule", () => {
  expect(quizIssues(rebornQuiz)).toEqual([]);
});
