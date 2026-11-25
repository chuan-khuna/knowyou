/**
 * The contract between the shared play screen and each game's engine.
 *
 * A play is an immutable value: its seed plus its answer log, with every other
 * field derived from those two. `answer` returns a new play. The phase is part
 * of the type, so a guess exists only on a finished play and only an asking
 * play accepts an answer.
 *
 * One optional extension lets a game show more than the shared screen knows,
 * without the screen importing the game: `AskingPlay.live`, data the game's
 * own live view reads while asking (typed per game, `never` by default).
 */

export interface AnswerOption {
  /** Stable across releases, so recorded personas survive reordering. */
  readonly key: string;
  readonly label: string;
  /** A short line under the label that makes its meaning unambiguous. */
  readonly hint?: string;
}

/** What a cue question shows under its prompt. A song line or a quote is set as a quotation. */
export interface Cue {
  readonly text: string;
  readonly quoted: boolean;
}

export interface QuestionCard {
  readonly id: string;
  readonly prompt: string;
  readonly subtitle?: string;
  readonly cue?: Cue;
  readonly options: readonly AnswerOption[];
}

export interface AnsweredQuestion {
  readonly questionId: string;
  readonly prompt: string;
  /** The cue's text, so the answer reads on its own in the answer list. */
  readonly cue?: string;
  readonly answerKey: string;
  readonly answerLabel: string;
}

export interface Guess<TValue> {
  readonly value: TValue;
  /** The Thai sentence for the reveal, such as "คุณอายุ 27 ปี". */
  readonly label: string;
}

interface PlayBase {
  readonly seed: number;
  readonly answers: readonly AnsweredQuestion[];
  /** 0 to 1. The chance the current best guess is a hit. */
  readonly confidence: number;
}

export interface AskingPlay<TLive = never> extends PlayBase {
  readonly phase: "asking";
  /** 1-based. */
  readonly questionNumber: number;
  readonly question: QuestionCard;
  /** Data only the game's own live view reads while asking, such as Province's belief map. */
  readonly live?: TLive;
}

export interface FinishedPlay<TValue, TExtras> extends PlayBase {
  readonly phase: "finished";
  readonly guess: Guess<TValue>;
  readonly questionsAsked: number;
  /** Index into `answers` of the answer that moved belief most toward the guess. */
  readonly decidingAnswer: number | null;
  /** Data only the game's own result screen reads. */
  readonly extras: TExtras;
}

export type Play<TValue, TExtras, TLive = never> = AskingPlay<TLive> | FinishedPlay<TValue, TExtras>;

export interface Engine<TValue, TExtras, TLive = never> {
  start(options: { readonly seed: number }): Play<TValue, TExtras, TLive>;
  /** Throws if `answerKey` is not one of the current question's options. */
  answer(play: AskingPlay<TLive>, answerKey: string): Play<TValue, TExtras, TLive>;
}
