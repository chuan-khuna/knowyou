/**
 * Authoring mistakes the type checker must reject. `tsc --noEmit` checks this
 * file: each `@ts-expect-error` fails the build if its line stops being an error.
 */

import { animeAge, film, pickFrom, series, type AnswerOf, type BankAnswers, type BankPart, type QuestionId } from ".";

const ok = { audience: "kids", reach: "hit" } as const;
const run = { on: "ch9", from: 1990, to: 1991 } as const;

const seriesAnswer: AnswerOf<"doraemon"> = "lot";
const filmAnswer: AnswerOf<"your-name"> = "cinema";
const knownId: QuestionId = "stand-by-me-doraemon";
const pickAnswers: BankAnswers = { "pick-primary-battle": "pokemon", "pick-class-sport": "neither", "pick-first-ikkyu": "unsure" };

const titles = { a: series({ ...ok, title: "a", runs: [run] }), b: series({ ...ok, title: "b", runs: [run] }), c: series({ ...ok, title: "c", runs: [run] }) };
const pick = pickFrom({ ...titles, q: pickFrom(titles)({ prompt: "p", stage: "primary", titles: ["a", "b", "c"] }) });
pick({ prompt: "p", stage: "primary", titles: ["a", "b", "c"], override: { neither: { 10: 0.2 } } });

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
// @ts-expect-error a pick naming a title id that isn't in the bank
pick({ prompt: "p", stage: "primary", titles: ["a", "b", "zz"] });
// @ts-expect-error a pick naming another pick instead of a title
pick({ prompt: "p", stage: "primary", titles: ["a", "b", "q"] });
// @ts-expect-error a pick with two titles
pick({ prompt: "p", stage: "primary", titles: ["a", "b"] });
// @ts-expect-error a pick override for an answer the pick doesn't offer
pick({ prompt: "p", stage: "primary", titles: ["a", "b", "c"], override: { lot: { 10: 0.2 } } });

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
// @ts-expect-error a pick answer naming a title the pick doesn't offer
const pickPersona: BankAnswers = { "pick-primary-battle": "naruto" };

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

void [seriesAnswer, filmAnswer, knownId, duplicate, wrongKind, typo, persona, pickAnswers, pickPersona];
