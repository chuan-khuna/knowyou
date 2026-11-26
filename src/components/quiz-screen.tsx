"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  MIN_QUESTIONS_PER_PLAY,
  QUESTIONS_PER_PLAY,
  encodeQuizRecord,
  quizRecordKey,
  restoreQuiz,
  type AnsweredQuizQuestion,
  type FinishedQuizPlay,
  type Gloss,
  type Quiz,
  type QuizCard,
  type QuizOption,
  type QuizPlay,
  type Tier,
} from "@/games/quiz";
import { setRevealOn, useRevealOn } from "@/lib/quiz-reveal";
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

/**
 * `seen` counts the answers the player has moved past. While the reveal
 * switch is on and `seen` trails the play's answer log, the last answer is on
 * show with its right or wrong.
 */
type Screen =
  | { readonly kind: "checking" }
  | { readonly kind: "intro" }
  | { readonly kind: "playing"; readonly play: QuizPlay; readonly seen: number };

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
 * The screen every quiz title shares: intro with the count and the reveal
 * switch, one question at a time, then the score, the fan title and every
 * answer. With the reveal switch on, each answer shows its right or wrong
 * before the next question; with it off, nothing says until the result. A
 * play with at least one answer is kept in localStorage under the title's key
 * until the player starts again, so a refresh doesn't lose it.
 */
export function QuizScreen({ quiz, title, intro }: QuizScreenProps) {
  const [screen, setScreen] = useState<Screen>({ kind: "checking" });
  const [countText, setCountText] = useState(String(QUESTIONS_PER_PLAY));
  const revealOn = useRevealOn();
  const storageKey = quizRecordKey(quiz);

  const count = Number(countText);
  const countValid = countText !== "" && Number.isInteger(count) && count >= MIN_QUESTIONS_PER_PLAY && count <= quiz.size;

  useEffect(() => {
    const play = restoreQuiz(quiz, readStored(storageKey));
    if (play === null) writeStored(storageKey, null);
    setScreen(play === null ? { kind: "intro" } : { kind: "playing", play, seen: play.answered.length });
  }, [quiz, storageKey]);

  useEffect(() => {
    if (screen.kind === "checking") return;
    const keep = screen.kind === "playing" && screen.play.answerKeys.length > 0;
    writeStored(storageKey, keep ? encodeQuizRecord(screen.play) : null);
  }, [screen, storageKey]);

  // Switching the reveal off, here or in another tab, moves past an answer on show.
  useEffect(() => {
    if (!revealOn && screen.kind === "playing" && screen.seen < screen.play.answered.length) {
      if (screen.play.phase === "finished") sound.guess();
      setScreen({ ...screen, seen: screen.play.answered.length });
    }
  }, [revealOn, screen]);

  const startWith = useCallback(
    (n: number) => {
      sound.start();
      writeStored(storageKey, null);
      setScreen({ kind: "playing", play: quiz.start(randomSeed(), n), seen: 0 });
    },
    [quiz, storageKey],
  );
  const start = useCallback(() => {
    if (countValid) startWith(count);
  }, [countValid, count, startWith]);
  const playAgain = useCallback(
    () => startWith(screen.kind === "playing" ? screen.play.total : QUESTIONS_PER_PLAY),
    [startWith, screen],
  );

  const play = screen.kind === "playing" ? screen.play : null;
  const revealing = revealOn && screen.kind === "playing" && screen.seen < screen.play.answered.length;

  const choose = useCallback(
    (key: string) => {
      if (play?.phase !== "asking" || revealing) return;
      const next = quiz.answer(play, key);
      if (revealOn) {
        if (next.answered.at(-1)!.correct) sound.right();
        else sound.wrong();
        setScreen({ kind: "playing", play: next, seen: play.answered.length });
        return;
      }
      if (next.phase === "finished") sound.guess();
      else sound.answer();
      setScreen({ kind: "playing", play: next, seen: next.answered.length });
    },
    [quiz, play, revealing, revealOn],
  );

  const advance = useCallback(() => {
    if (!play || !revealing) return;
    if (play.phase === "finished") sound.guess();
    setScreen({ kind: "playing", play, seen: play.answered.length });
  }, [play, revealing]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      // A focused button takes Enter itself, so a count preset picks its count rather than starting.
      if (event.key === "Enter" && event.target instanceof HTMLButtonElement) return;
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
        <h1 className="mt-10 text-3xl sm:text-[2.75rem]">{title}</h1>
        <div className="mt-5 space-y-3 text-lg">{intro}</div>
        <CountPicker size={quiz.size} text={countText} valid={countValid} onChange={setCountText} />
        <label className="mt-6 flex cursor-pointer items-center gap-3 text-lg">
          <input type="checkbox" className="check" checked={revealOn} onChange={(event) => setRevealOn(event.target.checked)} />
          <span>
            เฉลยทุกข้อ
            <span className="block text-sm text-muted">ดูว่าถูกหรือผิดทันทีหลังตอบแต่ละข้อ เปิดปิดระหว่างเล่นได้</span>
          </span>
        </label>
        <BigButton onClick={start} disabled={!countValid}>
          เริ่มเลย
        </BigButton>
      </Shell>
    );
  }

  const current = screen.play;
  const status = (number: number) => (
    <>
      <Progress number={number} total={current.total} score={revealOn ? current.score : null} />
      <RevealToggle on={revealOn} />
    </>
  );

  if (revealing) {
    const last = current.answered.at(-1)!;
    return (
      <Shell status={status(last.question.number)} onReset={playAgain}>
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
        <Result play={current} playAgain={playAgain} />
      </Shell>
    );
  }

  return (
    <Shell status={status(current.question.number)} onReset={playAgain}>
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

/** The intro's count: presets for 20, 50 and the whole bank, and a field for any count in range. */
function CountPicker({ size, text, valid, onChange }: { size: number; text: string; valid: boolean; onChange: (text: string) => void }) {
  const presets = [
    { count: QUESTIONS_PER_PLAY, label: `${QUESTIONS_PER_PLAY} ข้อ` },
    ...(size > 50 ? [{ count: 50, label: "50 ข้อ" }] : []),
    { count: size, label: `ทั้งหมด (${size})` },
  ];
  return (
    <fieldset className="mt-8">
      <legend className="font-semibold">จำนวนข้อ</legend>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {presets.map((preset) => (
          <button
            key={preset.count}
            type="button"
            className="stock num"
            aria-pressed={text === String(preset.count)}
            onClick={() => onChange(String(preset.count))}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <label className="mt-4 flex items-center gap-3">
        <span>หรือกำหนดเอง</span>
        <input
          type="number"
          inputMode="numeric"
          min={MIN_QUESTIONS_PER_PLAY}
          max={size}
          step={1}
          value={text}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={!valid}
          aria-describedby="count-range"
          className="select num w-28"
        />
        <span>ข้อ</span>
      </label>
      <p id="count-range" className={`mt-2 text-sm ${valid ? "text-muted" : "verdict--wrong"}`}>
        ใส่ได้ {MIN_QUESTIONS_PER_PLAY} ถึง {size} ข้อ
      </p>
    </fieldset>
  );
}

/** The top strip's เฉลยทุกข้อ switch: an open eye when each answer is shown right away, a crossed eye when not. */
function RevealToggle({ on }: { on: boolean }) {
  return (
    <button
      type="button"
      className="icon-button"
      aria-label="เฉลยทุกข้อ"
      aria-pressed={on}
      title={on ? "เฉลยทุกข้อ: เปิด" : "เฉลยทุกข้อ: ปิด"}
      onClick={() => setRevealOn(!on)}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
        <circle cx="12" cy="12" r="3" />
        {on ? null : <line x1="3" x2="21" y1="3" y2="21" />}
      </svg>
    </button>
  );
}

function Progress({ number, total, score }: { number: number; total: number; score: number | null }) {
  return (
    <span className="num flex gap-3 whitespace-nowrap">
      <span>
        <span className="max-[24rem]:hidden">ข้อ </span>
        {number}/{total}
      </span>
      {/* A phone's strip has no room beside three buttons; the reveal itself says right or wrong. */}
      {score === null ? null : <span className="hidden sm:inline">ได้ {score} คะแนน</span>}
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
      {card.terms.length > 0 ? (
        <dl className="term-notes mt-3">
          {card.terms.map((term) => (
            <div key={term.label}>
              <dt>{term.label}</dt>
              <dd>
                <GlossLines gloss={term.gloss} />
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
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
                <OptionLabel option={option} className="flex-1" />
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
