"use client";

import { useState } from "react";
import { AdsRamen, AdsSketchbook } from "@/components/ads";
import { PlayAgainBar, type ResultControls } from "@/components/play-screen";
import { PROVINCES, PROVINCE_IDS, REGION_NAMES, isProvinceId, toPersonaSource, type FinishedProvincePlay, type ProvinceId, type Region } from "@/games/province";
import type { RevealParser } from "@/lib/play-record";
import { sound } from "@/lib/sound";
import { ResultMap } from "./maps";

/** What the player said about the guess. Wrong without `real` means they haven't picked yet. */
export type ProvinceReveal = { readonly kind: "right" } | { readonly kind: "wrong"; readonly real?: ProvinceId };

export const parseProvinceReveal: RevealParser<ProvinceReveal> = (value) => {
  if (typeof value !== "object" || value === null) return null;
  const { kind, real } = value as { kind?: unknown; real?: unknown };
  if (kind === "right") return { kind: "right" };
  if (kind === "wrong" && real === undefined) return { kind: "wrong" };
  if (kind === "wrong" && isProvinceId(real)) return { kind: "wrong", real };
  return null;
};

const percent = (p: number) => (p < 0.005 ? "ไม่ถึง 1%" : `${Math.round(p * 100)}%`);

const BY_REGION = (Object.keys(REGION_NAMES) as Region[]).map((region) => ({
  region,
  ids: PROVINCE_IDS.filter((id) => PROVINCES[id].region === region).sort((a, b) => PROVINCES[a].name.localeCompare(PROVINCES[b].name, "th")),
}));

export function ProvinceResult({
  play,
  controls: { reveal, setReveal, playAgain },
}: {
  play: FinishedProvincePlay;
  controls: ResultControls<ProvinceReveal>;
}) {
  const guess = play.guess.value;
  const real = reveal?.kind === "wrong" ? reveal.real : reveal?.kind === "right" ? guess : undefined;
  const rankOf = (id: ProvinceId) => {
    const p = play.extras.belief[PROVINCE_IDS.indexOf(id)]!;
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
            <p className="text-sm text-muted">ตอบตามจังหวัดที่คุณโตมา</p>
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
            <label htmlFor="real-province" className="block text-lg font-semibold">
              จริง ๆ แล้วคุณมาจากจังหวัดไหน?
            </label>
            <select
              id="real-province"
              className="select mt-4"
              value={reveal.real ?? ""}
              onChange={(event) => {
                if (!isProvinceId(event.target.value)) return;
                sound.pickProvince();
                setReveal({ kind: "wrong", real: event.target.value });
              }}
            >
              <option value="" disabled>
                เลือกจังหวัด
              </option>
              {BY_REGION.map(({ region, ids }) => (
                <optgroup key={region} label={REGION_NAMES[region]}>
                  {ids.map((id) => (
                    <option key={id} value={id}>
                      {PROVINCES[id].name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {reveal.real ? (
              <p className="mt-4 text-muted" aria-live="polite">
                {PROVINCES[reveal.real].region === PROVINCES[guess].region ? "ภาคเดียวกัน แต่คนละจังหวัด" : "คนละภาคเลย"} เกมให้
                {PROVINCES[reveal.real].name}เป็นอันดับ {rankOf(reveal.real)} จาก 77
              </p>
            ) : null}
          </div>
        )}
      </section>

      <AdsSketchbook />

      <section className="mt-12">
        <h2 className="text-2xl">เกมคิดอะไรอยู่</h2>
        <p className="mt-1 text-sm text-muted">สีเข้มคือจังหวัดที่เกมคิดว่าน่าจะใช่ จังหวัดสีจางคือจังหวัดที่ตัดออกไปแล้ว</p>
        <div className="result-map mt-6">
          <ResultMap belief={play.extras.belief} guess={guess} {...(real ? { real } : {})} />
          <ol className="space-y-4">
            {play.extras.top.map((candidate, i) => (
              <li key={candidate.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-semibold">
                    {i + 1}. {candidate.name}
                  </span>
                  <span className="num text-sm text-muted">{percent(candidate.p)}</span>
                </div>
                <div className="meter mt-2">
                  <div className="meter-fill" style={{ transform: `scaleX(${candidate.p})` }} />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {play.extras.pointers.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-2xl">คำตอบที่ชี้มาที่{PROVINCES[guess].name}</h2>
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

      <AdsRamen />

      <PlayAgainBar onClick={playAgain} />
    </div>
  );
}

function PersonaRecorder({ play, real }: { play: FinishedProvincePlay; real: ProvinceId | undefined }) {
  const [copied, setCopied] = useState(false);
  if (real === undefined) return null;
  const copy = async () => {
    await navigator.clipboard.writeText(toPersonaSource(play, real, new Date().toISOString().slice(0, 10)));
    setCopied(true);
  };
  return (
    <button type="button" onClick={copy} className="stock mt-10 text-sm text-muted">
      {copied ? "คัดลอกแล้ว" : `คัดลอกเป็นไฟล์ persona (${PROVINCES[real].name}), dev`}
    </button>
  );
}
