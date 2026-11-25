/**
 * Authoring mistakes the type checker must reject. `tsc --noEmit` checks this
 * file: each `@ts-expect-error` fails the build if its line stops being an error.
 */

import { animeAge, choice, film, series, type AnswerOf, type BankAnswers, type BankPart, type QuestionId } from ".";

const ok = { audience: "kids", reach: "hit" } as const;
const run = { on: "ch9", from: 1990, to: 1991 } as const;

const seriesAnswer: AnswerOf<"doraemon"> = "lot";
const choiceAnswer: AnswerOf<"primary-source"> = "free-tv";
const unsureAnswer: AnswerOf<"primary-source"> = "unsure";
const filmAnswer: AnswerOf<"your-name"> = "cinema";
const knownId: QuestionId = "stand-by-me-doraemon";

// @ts-expect-error a year outside 1960–2026
series({ ...ok, title: "x", runs: [{ on: "ch9", from: 2062, to: "now" }] });
// @ts-expect-error a title with no runs
series({ ...ok, title: "x", runs: [] });
// @ts-expect-error an outlet that does not exist
series({ ...ok, title: "x", runs: [{ on: "ch10", from: 1990, to: 1991 }] });
// @ts-expect-error a film answer in a series override
series({ ...ok, title: "x", runs: [run], override: { cinema: { 10: 0.1 } } });
// @ts-expect-error an override age outside 10–50
series({ ...ok, title: "x", runs: [run], override: { lot: { 9: 0.1 } } });
// @ts-expect-error a fact name that does not exist
series({ ...ok, title: "x", runs: [run], popularity: "hit" });
// @ts-expect-error a series-only fact listed as unsure on a film
film({ ...ok, title: "x", released: 2014, later: [], unsure: ["runs"] });
// @ts-expect-error an audience that does not exist
series({ title: "x", runs: [run], audience: "toddlers", reach: "hit" });
// @ts-expect-error an override for a choice the question doesn't have
choice({ prompt: "p", stage: "primary", choices: { a: { label: "a", years: [1990, 2000] } }, override: { b: { 10: 0.1 } } });
// @ts-expect-error writing the automatic unsure choice by hand
choice({ prompt: "p", stage: "primary", choices: { a: { label: "a", years: [1990, 2000] }, unsure: { label: "u", years: [1990, 2000] } } });

const duplicate = {
  a: series({ ...ok, title: "x", runs: [run] }),
  // @ts-expect-error a duplicate id inside one file
  a: series({ ...ok, title: "y", runs: [run] }),
} satisfies BankPart;

// @ts-expect-error a film answer for a series question
const wrongKind: AnswerOf<"doraemon"> = "cinema";
// @ts-expect-error a misspelled question id
const typo: QuestionId = "doraemn";
// @ts-expect-error a persona answer that is not one of the question's answers
const persona: BankAnswers = { doraemon: "lot", "your-name": "seen" };

export function playPhases() {
  const play = animeAge.start({ seed: 1 });
  // @ts-expect-error an asking play has no guess yet
  void play.guess;
  if (play.phase === "asking") {
    animeAge.answer(play, play.question.options[0]!.key);
  } else {
    void play.guess.label;
    // @ts-expect-error a finished play takes no more answers
    animeAge.answer(play, "lot");
  }
}

void [seriesAnswer, choiceAnswer, unsureAnswer, filmAnswer, knownId, duplicate, wrongKind, typo, persona];
