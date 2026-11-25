"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { Cue, Engine, FinishedPlay, Play } from "@/games/engine";

interface PlayScreenProps<V, X> {
  readonly engine: Engine<V, X>;
  readonly title: string;
  readonly intro: ReactNode;
  readonly result: (play: FinishedPlay<V, X>, playAgain: () => void) => ReactNode;
}

const randomSeed = () => crypto.getRandomValues(new Uint32Array(1))[0]!;

/**
 * The play screen every game shares: intro, one question at a time with a
 * live confidence meter, then the game's own result screen. It knows a game
 * only through the engine contract.
 */
export function PlayScreen<V, X>({ engine, title, intro, result }: PlayScreenProps<V, X>) {
  const [play, setPlay] = useState<Play<V, X> | null>(null);

  const start = useCallback(() => setPlay(engine.start({ seed: randomSeed() })), [engine]);
  const choose = useCallback(
    (key: string) => setPlay((current) => (current?.phase === "asking" ? engine.answer(current, key) : current)),
    [engine],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (play === null && event.key === "Enter") return start();
      if (play?.phase !== "asking") return;
      const option = play.question.options[Number(event.key) - 1];
      if (option) choose(option.key);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [play, start, choose]);

  if (play === null) {
    return (
      <Shell>
        <h1 className="mt-10 text-3xl sm:text-[2.75rem]">{title}</h1>
        <div className="mt-5 space-y-3 text-lg">{intro}</div>
        <BigButton onClick={start}>เริ่มเลย</BigButton>
      </Shell>
    );
  }

  if (play.phase === "finished") return <Shell>{result(play, start)}</Shell>;

  const confidence = Math.round(play.confidence * 100);
  return (
    <Shell status={<span className="num">ข้อ {play.questionNumber}</span>}>
      <div className="mt-4 flex items-center gap-3">
        <div className="meter flex-1" role="meter" aria-label="ความมั่นใจ" aria-valuemin={0} aria-valuemax={100} aria-valuenow={confidence}>
          <div className="meter-fill" style={{ transform: `scaleX(${play.confidence})` }} />
        </div>
        <span className="num w-24 text-right text-sm text-muted">มั่นใจ {confidence}%</span>
      </div>

      <h2 key={play.question.id} className="mt-10 max-w-none text-2xl">
        {play.question.prompt}
      </h2>
      {play.question.subtitle ? <p className="mt-2 text-muted">{play.question.subtitle}</p> : null}
      {play.question.cue ? <CueText cue={play.question.cue} /> : null}

      <ol className="mt-8 grid gap-4">
        {play.question.options.map((option, i) => (
          <li key={option.key}>
            <button type="button" onClick={() => choose(option.key)} className="stock option">
              <kbd className="option-key">{i + 1}</kbd>
              <span>
                <span className="block text-lg">{option.label}</span>
                {option.hint ? <span className="block text-sm text-muted">{option.hint}</span> : null}
              </span>
            </button>
          </li>
        ))}
      </ol>
      <p className="mt-8 hidden text-center text-sm text-muted sm:block">กดปุ่มตัวเลขบนคีย์บอร์ดเพื่อตอบได้</p>
    </Shell>
  );
}

function CueText({ cue }: { cue: Cue }) {
  return cue.quoted ? (
    <blockquote className="cue mt-6">“{cue.text}”</blockquote>
  ) : (
    <p className="cue mt-6">{cue.text}</p>
  );
}

function Shell({ status, children }: { status?: ReactNode; children: ReactNode }) {
  return (
    <main className="shell">
      <header className="topbar">
        <Link href="/" className="wordmark">
          Pinpoint
        </Link>
        {status}
      </header>
      {children}
    </main>
  );
}

export function BigButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="stock stock--primary mt-10 text-lg">
      {children}
    </button>
  );
}
