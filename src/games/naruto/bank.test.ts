import { expect, test } from "bun:test";
import { quizIssues } from "../quiz";
import { narutoQuiz } from ".";

test("the shipped questions, glosses and bands pass every rule", () => {
  expect(quizIssues(narutoQuiz)).toEqual([]);
});
