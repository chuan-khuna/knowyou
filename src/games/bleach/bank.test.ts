import { expect, test } from "bun:test";
import { quizIssues } from "@/games/quiz";
import { bleachQuiz } from "@/games/bleach";

test("the shipped questions, glosses and bands pass every rule", () => {
  expect(quizIssues(bleachQuiz)).toEqual([]);
});
