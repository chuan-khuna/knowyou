"use client";

import { useState } from "react";
import { AdsFigure, AdsNightMarket } from "@/components/ads";
import { PlayAgainBar, type ResultControls } from "@/components/play-screen";
import type { RevealParser } from "@/lib/play-record";
import { sound } from "@/lib/sound";
import { isHit, toPersonaSource, type AgeGuessValue, type FinishedAnimeAgePlay, type Stratum } from "@/games/anime-age";

/** What the player said about the guess. Before they answer there is no reveal. */
export type AnimeAgeReveal = { readonly kind: "right" } | { readonly kind: "wrong"; readonly realAge: number };

const REAL_AGE_MIN = 5;
const REAL_AGE_MAX = 90;

const clampAge = (age: number) => Math.min(REAL_AGE_MAX, Math.max(REAL_AGE_MIN, age));

export const parseAnimeAgeReveal: RevealParser<AnimeAgeReveal> = (value) => {
  if (typeof value !== "object" || value === null) return null;
  const { kind, realAge } = value as { kind?: unknown; realAge?: unknown };
  if (kind === "right") return { kind: "right" };
  if (kind === "wrong" && typeof realAge === "number" && Number.isInteger(realAge)) {
    return { kind: "wrong", realAge: clampAge(realAge) };
  }
  return null;
};

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

export function AnimeAgeResult({
  play,
  controls: { reveal, setReveal, playAgain },
}: {
  play: FinishedAnimeAgePlay;
  controls: ResultControls<AnimeAgeReveal>;
}) {
  const guess = play.guess.value;
  const deciding = play.decidingAnswer === null ? null : play.answers[play.decidingAnswer];

  return (
    <div>
      <section className="sheet--gold mt-8 rounded-card p-6 sm:p-8">
        <h1 className="guess max-w-none">{play.guess.label}</h1>
        <p className="num mt-6 flex flex-wrap gap-x-4 font-semibold">
          <span>ถาม {play.questionsAsked} ข้อ</span>
          <span>มั่นใจ {Math.round(play.confidence * 100)}%</span>
        </p>
      </section>

      <section className="sheet mt-6 p-6">
        {reveal === undefined ? (
          <>
            <p className="text-lg font-semibold">ทายถูกไหม?</p>
            <p className="text-sm text-muted">คลาดไม่เกิน 1 ปี นับว่าถูก</p>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <button type="button" onClick={() => {
                  sound.right();
                  setReveal({ kind: "right" });
                }} className="stock stock--primary text-lg">
                ถูก
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.wrong();
                  setReveal({ kind: "wrong", realAge: guess.age });
                }}
                className="stock text-lg"
              >
                ไม่ถูก
              </button>
            </div>
          </>
        ) : reveal.kind === "right" ? (
          <p className="font-display text-2xl font-semibold text-mint-deep">เย้! ทายถูก</p>
        ) : (
          <RealAgeStepper
            realAge={reveal.realAge}
            onStep={(delta) => {
              sound.step();
              setReveal({ kind: "wrong", realAge: clampAge(reveal.realAge + delta) });
            }}
            guess={guess}
          />
        )}
      </section>

      <AdsFigure />

      <MemoryStrata strata={play.extras.strata} />

      {deciding ? (
        <section className="mt-12">
          <h2 className="text-2xl">คำตอบที่ทำให้ทายได้</h2>
          <p className="sheet mt-4 p-5">
            <span className="block">{deciding.prompt}</span>
            {deciding.cue ? <span className="mt-1 block text-muted">“{deciding.cue}”</span> : null}
            <span className="mt-1 block font-semibold">{deciding.answerLabel}</span>
          </p>
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className="text-2xl">คำตอบของคุณ</h2>
        <ol className="sheet mt-4 divide-y divide-rule overflow-hidden">
          {play.answers.map((answer, i) => (
            <li key={answer.questionId} className={`px-5 py-3 ${i === play.decidingAnswer ? "bg-paper-2" : ""}`}>
              <span className="block text-sm text-muted">
                {i + 1}. {answer.prompt}
                {answer.cue ? <> “{answer.cue}”</> : null}
              </span>
              <span className="block font-semibold">{answer.answerLabel}</span>
            </li>
          ))}
        </ol>
      </section>

      {process.env.NODE_ENV === "development" ? <PersonaRecorder play={play} reveal={reveal} /> : null}

      <AdsNightMarket />

      <PlayAgainBar onClick={playAgain} />
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
      <p className="text-lg font-semibold">จริง ๆ แล้วคุณอายุเท่าไหร่?</p>
      <div className="mt-4 flex items-center justify-center gap-4">
        <StepButton label="ลดอายุ" onClick={() => onStep(-1)}>
          −
        </StepButton>
        <output className="num w-24 text-center font-display text-5xl font-semibold" aria-live="polite">
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
      className="stock size-14 rounded-full p-0 text-2xl"
    >
      {children}
    </button>
  );
}

function MemoryStrata({ strata }: { strata: readonly Stratum[] }) {
  return (
    <section className="mt-12">
      <h2 className="text-2xl">ชั้นความทรงจำการ์ตูน</h2>
      <p className="mt-1 text-sm text-muted">คุณรู้จักการ์ตูนแต่ละยุคมากแค่ไหน แถบจาง ๆ คือยุคที่ไม่ได้ถาม เกมเดาจากคำตอบอื่น</p>
      <ol className="mt-6 space-y-5">
        {[...strata].reverse().map((stratum) => (
          <li key={stratum.band.label}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-semibold">ค.ศ. {stratum.band.label}</span>
              <span className="text-sm text-muted">
                {stratum.basis === "empty" ? "ไม่มีข้อมูล" : `${Math.round(stratum.knowledge * 100)}%`}
              </span>
            </div>
            <div className="meter mt-2 h-4">
              <div className={stratum.basis === "answered" ? "meter-fill" : "meter-fill meter-fill--inferred"} style={{ transform: `scaleX(${stratum.knowledge})` }} />
            </div>
            {stratum.samples.length > 0 ? (
              <p className="mt-1 text-sm text-muted">{stratum.samples.map((title) => `“${title}”`).join(" ")}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

function PersonaRecorder({ play, reveal }: { play: FinishedAnimeAgePlay; reveal: AnimeAgeReveal | undefined }) {
  const [copied, setCopied] = useState(false);
  const realAge =
    reveal?.kind === "wrong" ? reveal.realAge : reveal?.kind === "right" && play.guess.value.kind === "exact" ? play.guess.value.age : null;
  if (realAge === null) return null;
  const copy = async () => {
    await navigator.clipboard.writeText(toPersonaSource(play, realAge, new Date().toISOString().slice(0, 10)));
    setCopied(true);
  };
  return (
    <button type="button" onClick={copy} className="stock mt-10 text-sm text-muted">
      {copied ? "คัดลอกแล้ว" : `คัดลอกเป็นไฟล์ persona (อายุจริง ${realAge}), dev`}
    </button>
  );
}
