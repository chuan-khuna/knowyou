import { expect, test } from "bun:test";
import { quizIssues } from "@/games/quiz";
import { kurokoNoBasketQuiz } from "@/games/kuroko-no-basket";

test("the shipped questions, glosses and bands pass every rule", () => {
  expect(quizIssues(kurokoNoBasketQuiz)).toEqual([]);
});
