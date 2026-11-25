import { defineBank, type AnswerOfId, type AnswersFor, type QuestionIdOf } from "../schema";
import { culture } from "./culture";
import { food } from "./food";
import { geography } from "./geography";
import { language } from "./language";

export const provinceBank = defineBank(language, food, culture, geography);

type BankFacts = typeof provinceBank.facts;
export type QuestionId = QuestionIdOf<BankFacts>;
/** The answer keys one question accepts, such as AnswerOf<"rice"> = "sticky" | "steamed" | "both" | "unsure". */
export type AnswerOf<Id extends QuestionId> = AnswerOfId<BankFacts, Id>;
export type BankAnswers = AnswersFor<BankFacts>;
