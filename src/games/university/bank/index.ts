import { defineBank, type AnswerOfId, type AnswersFor, type QuestionIdOf } from "../schema";
import { life } from "./life";
import { place } from "./place";
import { study } from "./study";

export const universityBank = defineBank(life, study, place);

type BankFacts = typeof universityBank.facts;
export type QuestionId = QuestionIdOf<BankFacts>;
/** The answer keys one question accepts, such as AnswerOf<"dorm"> = "campus" | "outside" | "home" | "unsure". */
export type AnswerOf<Id extends QuestionId> = AnswerOfId<BankFacts, Id>;
export type BankAnswers = AnswersFor<BankFacts>;
