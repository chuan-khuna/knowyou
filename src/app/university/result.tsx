"use client";

import { useState } from "react";
import { PlayAgainBar, type ResultControls } from "@/components/play-screen";
import {
  AREA_NAMES,
  UNIVERSITIES,
  UNIVERSITY_COUNT,
  UNIVERSITY_IDS,
  isUniversityId,
  toPersonaSource,
  type Area,
  type FinishedUniversityPlay,
  type UniversityId,
} from "@/games/university";
import type { RevealParser } from "@/lib/play-record";
import { sound } from "@/lib/sound";

const UNLISTED = "unlisted";

/** What the player said about the guess. Wrong without `real` means they haven't picked yet; "unlisted" means their university isn't in the game. */
export type UniversityReveal =
  | { readonly kind: "right" }
  | { readonly kind: "wrong"; readonly real?: UniversityId | typeof UNLISTED };

export const parseUniversityReveal: RevealParser<UniversityReveal> = (value) => {
  if (typeof value !== "object" || value === null) return null;
  const { kind, real } = value as { kind?: unknown; real?: unknown };
  if (kind === "right") return { kind: "right" };
  if (kind === "wrong" && real === undefined) return { kind: "wrong" };
  if (kind === "wrong" && (real === UNLISTED || isUniversityId(real))) return { kind: "wrong", real };
  return null;
};

const percent = (p: number) => (p < 0.005 ? "ไม่ถึง 1%" : `${Math.round(p * 100)}%`);

const sortName = (id: UniversityId) => UNIVERSITIES[id].name.replace(/^(มหาวิทยาลัย|สถาบัน)/, "");

const BY_AREA = (Object.keys(AREA_NAMES) as Area[]).map((area) => ({
  area,
  ids: UNIVERSITY_IDS.filter((id) => UNIVERSITIES[id].area === area).sort((a, b) => sortName(a).localeCompare(sortName(b), "th")),
}));

export function UniversityResult({
  play,
  controls: { reveal, setReveal, playAgain },
}: {
  play: FinishedUniversityPlay;
  controls: ResultControls<UniversityReveal>;
}) {
  const guess = play.guess.value;
  const picked = reveal?.kind === "wrong" ? reveal.real : undefined;
  const real = reveal?.kind === "right" ? guess : picked !== UNLISTED ? picked : undefined;
  const rankOf = (id: UniversityId) => {
    const p = play.extras.belief[UNIVERSITY_IDS.indexOf(id)]!;
    return play.extras.belief.filter((q) => q > p).length + 1;
  };

  return (
    <div>
      <section className="sheet--gold mt-8 rounded-card p-6 sm:p-8">
        <h1 className="guess guess--words max-w-none">{play.guess.label}</h1>
        <p className="num mt-6 flex flex-wrap gap-x-4 font-semibold">
          <span>ถาม {play.questionsAsked} ข้อ</span>
          <span>มั่นใจ {Math.round(play.confidence * 100)}%</span>
        </p>
      </section>

      <section className="sheet mt-6 p-6">
        {reveal === undefined ? (
          <>
            <p className="text-lg font-semibold">ทายถูกไหม?</p>
            <p className="text-sm text-muted">ตอบตามมหาวิทยาลัยที่คุณเรียนปริญญาตรี</p>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  sound.right();
                  setReveal({ kind: "right" });
                }}
                className="stock stock--primary text-lg"
              >
                ถูก
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.wrong();
                  setReveal({ kind: "wrong" });
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
          <div>
            <label htmlFor="real-university" className="block text-lg font-semibold">
              จริง ๆ แล้วคุณเรียนที่ไหน?
            </label>
            <select
              id="real-university"
              className="select mt-4"
              value={reveal.real ?? ""}
              onChange={(event) => {
                const value = event.target.value;
                if (value !== UNLISTED && !isUniversityId(value)) return;
                sound.pickUniversity();
                setReveal({ kind: "wrong", real: value });
              }}
            >
              <option value="" disabled>
                เลือกมหาวิทยาลัย
              </option>
              {BY_AREA.map(({ area, ids }) => (
                <optgroup key={area} label={AREA_NAMES[area]}>
                  {ids.map((id) => (
                    <option key={id} value={id}>
                      {UNIVERSITIES[id].name}
                    </option>
                  ))}
                </optgroup>
              ))}
              <option value={UNLISTED}>ไม่มีในรายการ</option>
            </select>
            {reveal.real === UNLISTED ? (
              <p className="mt-4 text-muted" aria-live="polite">
                เกมนี้ยังไม่มีมหาวิทยาลัยของคุณ จึงทายได้แค่มหาวิทยาลัยที่ใกล้เคียงที่สุด
              </p>
            ) : reveal.real ? (
              <p className="mt-4 text-muted" aria-live="polite">
                {UNIVERSITIES[reveal.real].area === UNIVERSITIES[guess].area ? "ภาคเดียวกัน แต่คนละมหาวิทยาลัย" : "คนละภาคเลย"} เกมให้
                {UNIVERSITIES[reveal.real].short}เป็นอันดับ {rankOf(reveal.real)} จาก {UNIVERSITY_COUNT}
              </p>
            ) : null}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-2xl">เกมคิดอะไรอยู่</h2>
        <p className="mt-1 text-sm text-muted">มหาวิทยาลัยที่เกมคิดว่าน่าจะใช่ที่สุด 3 อันดับ</p>
        <ol className="mt-6 space-y-4">
          {play.extras.top.map((candidate, i) => (
            <li key={candidate.id}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-semibold">
                  {i + 1}. {candidate.name}
                  {candidate.id === real && candidate.id !== guess ? <span className="ml-2 text-sm text-mint-deep">ที่คุณเรียน</span> : null}
                </span>
                <span className="num text-sm text-muted">{percent(candidate.p)}</span>
              </div>
              <div className="meter mt-2">
                <div className="meter-fill" style={{ transform: `scaleX(${candidate.p})` }} />
              </div>
            </li>
          ))}
        </ol>
      </section>

      {play.extras.pointers.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-2xl">คำตอบที่ชี้มาที่{UNIVERSITIES[guess].short}</h2>
          <ul className="mt-4 space-y-3">
            {play.extras.pointers.map((i) => (
              <li key={i} className="sheet p-5">
                <span className="block">{play.answers[i]!.prompt}</span>
                <span className="mt-1 block font-semibold">{play.answers[i]!.answerLabel}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className="text-2xl">คำตอบของคุณ</h2>
        <ol className="sheet mt-4 divide-y divide-rule overflow-hidden">
          {play.answers.map((answer, i) => (
            <li key={answer.questionId} className={`px-5 py-3 ${play.extras.pointers.includes(i) ? "bg-paper-2" : ""}`}>
              <span className="block text-sm text-muted">
                {i + 1}. {answer.prompt}
              </span>
              <span className="block font-semibold">{answer.answerLabel}</span>
            </li>
          ))}
        </ol>
      </section>

      {process.env.NODE_ENV === "development" ? <PersonaRecorder play={play} real={real} /> : null}

      <PlayAgainBar onClick={playAgain} />
    </div>
  );
}

function PersonaRecorder({ play, real }: { play: FinishedUniversityPlay; real: UniversityId | undefined }) {
  const [copied, setCopied] = useState(false);
  if (real === undefined) return null;
  const copy = async () => {
    await navigator.clipboard.writeText(toPersonaSource(play, real, new Date().toISOString().slice(0, 10)));
    setCopied(true);
  };
  return (
    <button type="button" onClick={copy} className="stock mt-10 text-sm text-muted">
      {copied ? "คัดลอกแล้ว" : `คัดลอกเป็นไฟล์ persona (${UNIVERSITIES[real].short}), dev`}
    </button>
  );
}
