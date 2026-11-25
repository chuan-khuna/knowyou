"use client";

import { useCallback, useEffect, useState } from "react";
import { BigButton, PlayAgainBar, Shell } from "@/components/play-screen";
import {
  QUESTIONS_PER_PLAY,
  QUIZ_RECORD_KEY,
  encodeQuizRecord,
  princeOfTennisQuiz as quiz,
  restoreQuiz,
  type AnsweredQuizQuestion,
  type FinishedQuizPlay,
  type QuizCard,
  type QuizPlay,
  type Tier,
} from "@/games/prince-of-tennis";
import { sound } from "@/lib/sound";

const TITLE = "คุณรู้จัก Prince of Tennis ดีแค่ไหน";

const TIER_LABELS: Record<Tier, string> = {
  easy: "ง่าย",
  medium: "ปานกลาง",
  hard: "ยาก",
  "very-hard": "ยากมาก",
};

/**
 * `seen` counts the answers the player has moved past. While it trails the
 * play's answer log, the last answer is on show with its right or wrong.
 */
type Screen =
  | { readonly kind: "checking" }
  | { readonly kind: "intro" }
  | { readonly kind: "playing"; readonly play: QuizPlay; readonly seen: number };

const randomSeed = () => crypto.getRandomValues(new Uint32Array(1))[0]!;

function readStored(): string | null {
  try {
    return localStorage.getItem(QUIZ_RECORD_KEY);
  } catch {
    return null;
  }
}

function writeStored(value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(QUIZ_RECORD_KEY);
    else localStorage.setItem(QUIZ_RECORD_KEY, value);
  } catch {
    // Storage can be full or blocked; the play still works, it just won't survive a refresh.
  }
}

export function PrinceOfTennisQuiz() {
  const [screen, setScreen] = useState<Screen>({ kind: "checking" });

  useEffect(() => {
    const play = restoreQuiz(quiz, readStored());
    if (play === null) writeStored(null);
    setScreen(play === null ? { kind: "intro" } : { kind: "playing", play, seen: play.answered.length });
  }, []);

  useEffect(() => {
    if (screen.kind === "checking") return;
    const keep = screen.kind === "playing" && screen.play.answerKeys.length > 0;
    writeStored(keep ? encodeQuizRecord(screen.play) : null);
  }, [screen]);

  const start = useCallback(() => {
    sound.start();
    writeStored(null);
    setScreen({ kind: "playing", play: quiz.start(randomSeed()), seen: 0 });
  }, []);

  const play = screen.kind === "playing" ? screen.play : null;
  const revealing = screen.kind === "playing" && screen.seen < screen.play.answered.length;

  const choose = useCallback(
    (key: string) => {
      if (play?.phase !== "asking" || revealing) return;
      const next = quiz.answer(play, key);
      if (next.answered.at(-1)!.correct) sound.right();
      else sound.wrong();
      setScreen({ kind: "playing", play: next, seen: play.answered.length });
    },
    [play, revealing],
  );

  const advance = useCallback(() => {
    if (!play || !revealing) return;
    if (play.phase === "finished") sound.guess();
    setScreen({ kind: "playing", play, seen: play.answered.length });
  }, [play, revealing]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === "Enter" && (screen.kind === "intro" || revealing)) {
        event.preventDefault();
        return screen.kind === "intro" ? start() : advance();
      }
      if (play?.phase !== "asking" || revealing) return;
      const option = play.question.options[Number(event.key) - 1];
      if (option) choose(option.key);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen.kind, play, revealing, start, choose, advance]);

  if (screen.kind === "checking") return <Shell>{null}</Shell>;

  if (screen.kind === "intro") {
    return (
      <Shell>
        <h1 className="mt-10 text-3xl sm:text-[2.75rem]">{TITLE}</h1>
        <div className="mt-5 space-y-3 text-lg">
          <p>
            ตอบคำถาม {QUESTIONS_PER_PLAY} ข้อ เรื่องราวตั้งแต่ต้นเรื่องจนจบการแข่งขันระดับประเทศ เริ่มจากข้อง่าย ๆ แล้วค่อย ๆ
            ยากขึ้น
          </p>
          <p>ตอบแต่ละข้อแล้วจะรู้ทันทีว่าถูกหรือผิด จบแล้วดูคะแนนและฉายาแฟนของคุณ ไม่มีจับเวลา คิดได้เต็มที่</p>
        </div>
        <BigButton onClick={start}>เริ่มเลย</BigButton>
      </Shell>
    );
  }

  const current = screen.play;

  if (revealing) {
    const last = current.answered.at(-1)!;
    return (
      <Shell status={<Progress number={last.question.number} score={current.score} />}>
        <QuestionHeading card={last.question} />
        <Reveal answer={last} />
        <BigButton onClick={advance} autoFocus>
          {current.phase === "finished" ? "ดูคะแนน" : "ข้อต่อไป"}
        </BigButton>
        <p className="mt-4 hidden text-center text-sm text-muted sm:block">กด Enter เพื่อไปต่อ</p>
      </Shell>
    );
  }

  if (current.phase === "finished") {
    return (
      <Shell>
        <Result play={current} playAgain={start} />
      </Shell>
    );
  }

  return (
    <Shell status={<Progress number={current.question.number} score={current.score} />}>
      <QuestionHeading card={current.question} />
      <ol className="mt-8 grid gap-4">
        {current.question.options.map((option, i) => (
          <li key={option.key}>
            <button type="button" onClick={() => choose(option.key)} className="stock option">
              <kbd className="option-key">{i + 1}</kbd>
              <span className="text-lg">{option.label}</span>
            </button>
          </li>
        ))}
      </ol>
      <p className="mt-8 hidden text-center text-sm text-muted sm:block">กดปุ่มตัวเลขบนคีย์บอร์ดเพื่อตอบได้</p>
    </Shell>
  );
}

function Progress({ number, score }: { number: number; score: number }) {
  return (
    <span className="num flex gap-3">
      <span>
        ข้อ {number}/{QUESTIONS_PER_PLAY}
      </span>
      <span>ได้ {score} คะแนน</span>
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

function Reveal({ answer }: { answer: AnsweredQuizQuestion }) {
  const rightLabel = answer.question.options.find((o) => o.key === answer.rightKey)!.label;
  return (
    <>
      <p className={`verdict mt-6 ${answer.correct ? "verdict--right" : "verdict--wrong"}`} role="status">
        <Mark correct={answer.correct} />
        {answer.correct ? "ถูกต้อง!" : `ยังไม่ถูก คำตอบคือ ${rightLabel}`}
      </p>
      <ol className="mt-6 grid gap-4">
        {answer.question.options.map((option, i) => {
          const right = option.key === answer.rightKey;
          const chosen = option.key === answer.chosenKey;
          const tone = right ? "option--right" : chosen ? "option--wrong" : "option--faded";
          return (
            <li key={option.key}>
              <div className={`stock option option--locked ${tone}`}>
                <kbd className="option-key">{i + 1}</kbd>
                <span className="flex-1 text-lg">{option.label}</span>
                {right ? (
                  <span className="option-tag">
                    <Mark correct />
                    คำตอบที่ถูก
                  </span>
                ) : chosen ? (
                  <span className="option-tag">
                    <Mark correct={false} />
                    คุณเลือก
                  </span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
      {answer.note ? <p className="cue mt-6 text-lg">{answer.note}</p> : null}
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
          {play.score}/{QUESTIONS_PER_PLAY}
        </p>
        <h1 className="mt-4 max-w-none text-3xl">{play.band.title}</h1>
        <p className="mt-2 text-lg">{play.band.line}</p>
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
  const label = (key: string) => answer.question.options.find((o) => o.key === key)!.label;
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
        <span className="block font-semibold">{label(answer.rightKey)}</span>
        {answer.correct ? null : <span className="block text-sm">คุณตอบ: {label(answer.chosenKey)}</span>}
      </span>
    </li>
  );
}
