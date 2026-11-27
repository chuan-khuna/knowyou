import { expect, test } from "bun:test";
import { quizIssues } from "@/games/quiz";
import { soloLevelingQuiz } from "@/games/solo-leveling";

test("the shipped questions, glosses and bands pass every rule", () => {
  expect(quizIssues(soloLevelingQuiz)).toEqual([]);
});
