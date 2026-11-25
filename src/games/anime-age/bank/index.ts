import { defineBank, type AnswerOfId, type AnswersFor, type QuestionIdOf } from "../schema";
import { freeTvEra } from "./free-tv-era";
import { picks } from "./picks";
import { streamingEra } from "./streaming-era";
import { webEra } from "./web-era";

export const animeAgeBank = defineBank(freeTvEra, webEra, streamingEra, picks);

type BankFacts = typeof animeAgeBank.facts;
export type QuestionId = QuestionIdOf<BankFacts>;
/** The answer keys one question accepts, such as AnswerOf<"doraemon"> = "lot" | "seen" | "name" | "none". */
export type AnswerOf<Id extends QuestionId> = AnswerOfId<BankFacts, Id>;
export type BankAnswers = AnswersFor<BankFacts>;
