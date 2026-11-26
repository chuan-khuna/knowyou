/**
 * Authoring mistakes the type checker must reject. `tsc --noEmit` checks this
 * file: each `@ts-expect-error` fails the build if its line stops being an error.
 */

import { lean } from "./schema";
import type { AnswerOf, BankAnswers, QuestionId } from "./bank";

const dormAnswer: AnswerOf<"dorm"> = "campus";
const knownId: QuestionId = "field";
const answers: BankAnswers = { dorm: "unsure", field: "tech" };

// @ts-expect-error an answer key the question doesn't offer
const wrongKey: BankAnswers = { dorm: "tent" };
// @ts-expect-error a question id that isn't in the bank
const unknownId: QuestionId = "favourite-colour";
// @ts-expect-error an override for an option the question doesn't offer
lean({ topic: "life", prompt: "p", options: [{ key: "a", label: "a" }], override: { chula: { b: 1 } } });
// @ts-expect-error an area that doesn't exist
lean({ topic: "life", prompt: "p", options: [{ key: "a", label: "a", area: { central: 1 } }] });
// @ts-expect-error a topic that doesn't exist
lean({ topic: "geography", prompt: "p", options: [{ key: "a", label: "a" }] });

export { answers, dormAnswer, knownId, unknownId, wrongKey };
