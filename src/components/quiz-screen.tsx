"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  encodeQuizRecord,
  quizRecordKey,
  restoreQuiz,
  type AnsweredQuizQuestion,
  type FinishedQuizPlay,
  type Gloss,
  type Quiz,
  type QuizCard,
  type QuizMode,
  type QuizOption,
  type QuizPlay,
  type Tier,
} from "@/games/quiz";
import { sound } from "@/lib/sound";
import { BigButton, PlayAgainBar, Shell } from "./play-screen";

interface QuizScreenProps {
  readonly quiz: Quiz;
  readonly title: string;
  /** The lines under the title on the intro screen. */
  readonly intro: ReactNode;
}

const TIER_LABELS: Record<Tier, string> = {
  easy: "ง่าย",
  medium: "ปานกลาง",
  hard: "ยาก",
  "very-hard": "ยากมาก",
};

type Screen =
  | { readonly kind: "checking" }
  | { readonly kind: "intro" }
  | { readonly kind: "playing"; readonly play: QuizPlay };

const randomSeed = () => crypto.getRandomValues(new Uint32Array(1))[0]!;

function readStored(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStored(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Storage can be full or blocked; the play still works, it just won't survive a refresh.
  }
}

/**
 * The screen every quiz title shares: intro, one question at a time, then the
 * score, the fan title and every answer. Nothing says whether an answer was
 * right until the result, so the result is the reveal. A play with at least one
 * answer is kept in localStorage under the title's key until the player
 * starts again, so a refresh doesn't lose it.
 */
export function QuizScreen({ quiz, title, intro }: QuizScreenProps) {
  const [screen, setScreen] = useState<Screen>({ kind: "checking" });
  const storageKey = quizRecordKey(quiz);

  useEffect(() => {
    const play = restoreQuiz(quiz, readStored(storageKey));
    if (play === null) writeStored(storageKey, null);
    setScreen(play === null ? { kind: "intro" } : { kind: "playing", play });
  }, [quiz, storageKey]);

  useEffect(() => {
    if (screen.kind === "checking") return;
    const keep = screen.kind === "playing" && screen.play.answerKeys.length > 0;
    writeStored(storageKey, keep ? encodeQuizRecord(screen.play) : null);
  }, [screen, storageKey]);

  const startIn = useCallback(
    (mode: QuizMode) => {
      sound.start();
      writeStored(storageKey, null);
      setScreen({ kind: "playing", play: quiz.start(randomSeed(), mode) });
    },
    [quiz, storageKey],
  );
  const start = useCallback(() => startIn("standard"), [startIn]);
  const startAll = useCallback(() => startIn("all"), [startIn]);
  const playAgain = useCallback(() => startIn(screen.kind === "playing" ? screen.play.mode : "standard"), [startIn, screen]);

  const play = screen.kind === "playing" ? screen.play : null;

  const choose = useCallback(
    (key: string) => {
      if (play?.phase !== "asking") return;
      const next = quiz.answer(play, key);
      if (next.phase === "finished") sound.guess();
      else sound.answer();
      setScreen({ kind: "playing", play: next });
    },
    [quiz, play],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === "Enter" && screen.kind === "intro") {
        event.preventDefault();
        return start();
      }
      if (play?.phase !== "asking") return;
      const option = play.question.options[Number(event.key) - 1];
      if (option) choose(option.key);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen.kind, play, start, choose]);

  if (screen.kind === "checking") return <Shell>{null}</Shell>;

  if (screen.kind === "intro") {
    return (
      <Shell>
        <h1 className="mt-10 text-3xl sm:text-[2.75rem]">{title}</h1>
        <div className="mt-5 space-y-3 text-lg">{intro}</div>
        <BigButton onClick={start}>เริ่มเลย</BigButton>
        <button type="button" onClick={startAll} className="stock mt-4 text-lg">
          ตอบทุกข้อ ({Object.keys(quiz.bank).length} ข้อ)
        </button>
        <p className="mt-2 text-center text-sm text-muted">โหมดตอบทุกข้อ ถามทุกคำถามในคลัง เรียงจากง่ายไปยาก ไม่มีฉายาแฟน</p>
      </Shell>
    );
  }

  const current = screen.play;

  if (current.phase === "finished") {
    return (
      <Shell>
        <Result play={current} playAgain={playAgain} />
      </Shell>
    );
  }

  return (
    <Shell status={<Progress number={current.question.number} total={current.total} />} onReset={playAgain}>
      <QuestionHeading card={current.question} />
      <ol className="mt-8 grid gap-4">
        {current.question.options.map((option, i) => (
          <li key={option.key}>
            <button type="button" onClick={() => choose(option.key)} className="stock option">
              <kbd className="option-key">{i + 1}</kbd>
              <OptionLabel option={option} />
            </button>
          </li>
        ))}
      </ol>
      <p className="mt-8 hidden text-center text-sm text-muted sm:block">กดปุ่มตัวเลขบนคีย์บอร์ดเพื่อตอบได้</p>
    </Shell>
  );
}

function Progress({ number, total }: { number: number; total: number }) {
  return (
    <span className="num">
      ข้อ {number}/{total}
    </span>
  );
}

function QuestionHeading({ card }: { card: QuizCard }) {
  return (
    <>
      <p className="mt-6 text-sm text-muted">ระดับ{TIER_LABELS[card.tier]}</p>
      <h2 key={card.id} className="mt-2 max-w-none text-2xl">
        {card.prompt}
      </h2>
    </>
  );
}

function OptionLabel({ option, className = "" }: { option: QuizOption; className?: string }) {
  return (
    <span className={`text-left ${className}`}>
      <span className="block text-lg">{option.label}</span>
      {option.gloss ? <GlossLines gloss={option.gloss} /> : null}
    </span>
  );
}

function GlossLines({ gloss }: { gloss: Gloss }) {
  return (
    <>
      <span lang="ja-Latn" className="block text-sm font-normal text-muted">
        {gloss.romaji}, <span lang="ja">{gloss.kanji}</span>
      </span>
      <span lang="en" className="block text-sm font-normal text-muted">
        {gloss.english}
      </span>
    </>
  );
}

function Mark({ correct }: { correct: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="mark" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {correct ? <path d="M4 10.5l4 4 8-9" /> : <path d="M5 5l10 10M15 5L5 15" />}
    </svg>
  );
}

function Result({ play, playAgain }: { play: FinishedQuizPlay; playAgain: () => void }) {
  return (
    <div>
      <section className="sheet--gold mt-8 rounded-card p-6 sm:p-8">
        <p className="font-semibold">คะแนนของคุณ</p>
        <p className="guess">
          {play.score}/{play.total}
        </p>
        {play.band ? (
          <>
            <h1 className="mt-4 max-w-none text-3xl">{play.band.title}</h1>
            <p className="mt-2 text-lg">{play.band.line}</p>
          </>
        ) : null}
      </section>

      <section className="mt-12">
        <h2 className="text-2xl">เฉลย</h2>
        <ol className="sheet mt-4 divide-y divide-rule overflow-hidden">
          {play.answered.map((answer) => (
            <ReviewItem key={answer.question.id} answer={answer} />
          ))}
        </ol>
      </section>

      <PlayAgainBar onClick={playAgain} />
    </div>
  );
}

function ReviewItem({ answer }: { answer: AnsweredQuizQuestion }) {
  const option = (key: string) => answer.question.options.find((o) => o.key === key)!;
  const right = option(answer.rightKey);
  return (
    <li className="flex gap-3 px-5 py-4">
      <span className={answer.correct ? "verdict--right" : "verdict--wrong"}>
        <Mark correct={answer.correct} />
        <span className="sr-only">{answer.correct ? "ถูก" : "ผิด"}</span>
      </span>
      <span className="min-w-0">
        <span className="block text-sm text-muted">
          {answer.question.number}. {answer.question.prompt}
        </span>
        <span className="block font-semibold">{right.label}</span>
        {right.gloss ? <GlossLines gloss={right.gloss} /> : null}
        {answer.correct ? null : <span className="block text-sm">คุณตอบ: {option(answer.chosenKey).label}</span>}
        {answer.note ? <span className="mt-1 block text-sm text-muted">{answer.note}</span> : null}
      </span>
    </li>
  );
}
