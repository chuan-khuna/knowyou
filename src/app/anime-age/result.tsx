"use client";

import { useState } from "react";
import { BigButton } from "@/components/play-screen";
import { isHit, toPersonaSource, type AgeGuessValue, type FinishedAnimeAgePlay, type Stratum } from "@/games/anime-age";

type Reveal = { readonly kind: "pending" } | { readonly kind: "right" } | { readonly kind: "wrong"; readonly realAge: number };

const REAL_AGE_MIN = 5;
const REAL_AGE_MAX = 90;

function yearsOff(guess: AgeGuessValue, realAge: number): number {
  switch (guess.kind) {
    case "exact":
      return Math.abs(realAge - guess.age);
    case "atMost":
      return Math.max(0, realAge - guess.age);
    case "atLeast":
      return Math.max(0, guess.age - realAge);
  }
}

export function AnimeAgeResult({ play, playAgain }: { play: FinishedAnimeAgePlay; playAgain: () => void }) {
  const [reveal, setReveal] = useState<Reveal>({ kind: "pending" });
  const guess = play.guess.value;
  const deciding = play.decidingAnswer === null ? null : play.answers[play.decidingAnswer];

  return (
    <div>
      <p className="text-muted">
        ถาม {play.questionsAsked} ข้อ · มั่นใจ {Math.round(play.confidence * 100)}%
      </p>
      <h1 className="mt-2 text-4xl font-bold">{play.guess.label}</h1>

      <section className="mt-6 rounded-2xl border border-line bg-card p-5">
        {reveal.kind === "pending" ? (
          <>
            <p className="text-lg font-medium">ทายถูกไหม?</p>
            <p className="text-sm text-muted">คลาดไม่เกิน 1 ปี นับว่าถูก</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setReveal({ kind: "right" })}
                className="min-h-14 rounded-xl bg-good text-lg font-bold text-bg"
              >
                ถูก
              </button>
              <button
                type="button"
                onClick={() => setReveal({ kind: "wrong", realAge: guess.age })}
                className="min-h-14 rounded-xl bg-bad text-lg font-bold text-bg"
              >
                ไม่ถูก
              </button>
            </div>
          </>
        ) : reveal.kind === "right" ? (
          <p className="text-lg font-medium text-good">เย้! ทายถูก</p>
        ) : (
          <RealAgeStepper
            realAge={reveal.realAge}
            onStep={(delta) =>
              setReveal((current) =>
                current.kind === "wrong"
                  ? { kind: "wrong", realAge: Math.min(REAL_AGE_MAX, Math.max(REAL_AGE_MIN, current.realAge + delta)) }
                  : current,
              )
            }
            guess={guess}
          />
        )}
      </section>

      <MemoryStrata strata={play.extras.strata} />

      {deciding ? (
        <section className="mt-8">
          <h2 className="text-xl font-bold">คำตอบที่ทำให้ทายได้</h2>
          <p className="mt-2 rounded-xl border border-accent bg-card p-4">
            <span className="block">{deciding.prompt}</span>
            <span className="mt-1 block font-bold">{deciding.answerLabel}</span>
          </p>
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="text-xl font-bold">คำตอบของคุณ</h2>
        <ol className="mt-3 divide-y divide-line rounded-xl border border-line bg-card">
          {play.answers.map((answer, i) => (
            <li key={answer.questionId} className={`px-4 py-3 ${i === play.decidingAnswer ? "bg-line/50" : ""}`}>
              <span className="block text-sm text-muted">
                {i + 1}. {answer.prompt}
              </span>
              <span className="block font-medium">{answer.answerLabel}</span>
            </li>
          ))}
        </ol>
      </section>

      {process.env.NODE_ENV === "development" ? <PersonaRecorder play={play} reveal={reveal} /> : null}

      <BigButton onClick={playAgain}>เล่นอีกครั้ง</BigButton>
    </div>
  );
}

function RealAgeStepper({
  realAge,
  onStep,
  guess,
}: {
  realAge: number;
  onStep: (delta: number) => void;
  guess: AgeGuessValue;
}) {
  const off = yearsOff(guess, realAge);
  return (
    <div>
      <p className="text-lg font-medium">จริง ๆ แล้วคุณอายุเท่าไหร่?</p>
      <div className="mt-4 flex items-center justify-center gap-4">
        <StepButton label="ลดอายุ" onClick={() => onStep(-1)}>
          −
        </StepButton>
        <output className="w-24 text-center text-4xl font-bold tabular-nums" aria-live="polite">
          {realAge}
        </output>
        <StepButton label="เพิ่มอายุ" onClick={() => onStep(1)}>
          +
        </StepButton>
      </div>
      <p className="mt-4 text-center text-muted">
        {isHit(guess, realAge) ? "ห่างไม่เกิน 1 ปี นับว่าเกมทายถูก" : `เกมทายคลาดไป ${off} ปี`}
      </p>
    </div>
  );
}

function StepButton({ label, onClick, children }: { label: string; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="size-14 rounded-full border border-line bg-bg text-2xl font-bold hover:border-accent"
    >
      {children}
    </button>
  );
}

function MemoryStrata({ strata }: { strata: readonly Stratum[] }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold">ชั้นความทรงจำการ์ตูน</h2>
      <p className="mt-1 text-sm text-muted">คุณรู้จักการ์ตูนแต่ละยุคมากแค่ไหน แถบจาง ๆ คือยุคที่ไม่ได้ถาม เกมเดาจากคำตอบอื่น</p>
      <ol className="mt-4 space-y-3">
        {[...strata].reverse().map((stratum) => (
          <li key={stratum.band.label} className={stratum.basis === "answered" ? "" : "opacity-50"}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-medium">พ.ศ. {stratum.band.label}</span>
              <span className="text-sm text-muted">
                {stratum.basis === "empty" ? "ไม่มีข้อมูล" : `${Math.round(stratum.knowledge * 100)}%`}
              </span>
            </div>
            <div className="mt-1 h-4 overflow-hidden rounded-md bg-line">
              <div
                className="h-full rounded-md bg-accent"
                style={{ width: `${stratum.knowledge * 100}%` }}
              />
            </div>
            {stratum.samples.length > 0 ? (
              <p className="mt-1 text-sm text-muted">{stratum.samples.join(" · ")}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

function PersonaRecorder({ play, reveal }: { play: FinishedAnimeAgePlay; reveal: Reveal }) {
  const [copied, setCopied] = useState(false);
  const realAge = reveal.kind === "wrong" ? reveal.realAge : reveal.kind === "right" && play.guess.value.kind === "exact" ? play.guess.value.age : null;
  if (realAge === null) return null;
  const copy = async () => {
    await navigator.clipboard.writeText(toPersonaSource(play, realAge, new Date().toISOString().slice(0, 10)));
    setCopied(true);
  };
  return (
    <button type="button" onClick={copy} className="mt-8 w-full rounded-xl border border-dashed border-line p-3 text-sm text-muted">
      {copied ? "คัดลอกแล้ว" : `คัดลอกเป็นไฟล์ persona (อายุจริง ${realAge}) · dev`}
    </button>
  );
}
