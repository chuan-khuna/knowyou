import { expect, test } from "bun:test";
import { quizIssues } from "@/games/quiz";
import { haikyuQuiz } from "@/games/haikyu";

test("the shipped questions, glosses and bands pass every rule", () => {
  expect(quizIssues(haikyuQuiz)).toEqual([]);
});
