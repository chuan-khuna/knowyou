/**
 * Authoring mistakes the type checker must reject. `tsc --noEmit` checks this
 * file: each `@ts-expect-error` fails the build if its line stops being an error.
 */

import { geo, lean } from "./schema";
import type { AnswerOf, BankAnswers, QuestionId } from "./bank";

const riceAnswer: AnswerOf<"rice"> = "sticky";
const knownId: QuestionId = "neighbour";
const answers: BankAnswers = { rice: "unsure", neighbour: "LA" };

// @ts-expect-error an answer key the question doesn't offer
const wrongKey: BankAnswers = { rice: "noodles" };
// @ts-expect-error a question id that isn't in the bank
const unknownId: QuestionId = "favourite-colour";
// @ts-expect-error a geography question missing a label for one of its measure's options
geo({ measure: "cold", prompt: "p", labels: { cold: "a", cool: "b" } });
// @ts-expect-error a measure that doesn't exist
geo({ measure: "rainfall", prompt: "p", labels: {} });
// @ts-expect-error an override for an option the question doesn't offer
lean({ topic: "food", prompt: "p", options: [{ key: "a", label: "a" }], override: { bangkok: { b: 1 } } });
// @ts-expect-error a dialect that doesn't exist
lean({ topic: "food", prompt: "p", options: [{ key: "a", label: "a", dialect: { lanna: 1 } }] });

export { answers, knownId, riceAnswer, unknownId, wrongKey };
