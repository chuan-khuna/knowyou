"use client";

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
        <h1 className="text-3xl font-bold">{title}</h1>
        <div className="mt-4 space-y-3 text-lg leading-relaxed text-muted">{intro}</div>
        <BigButton onClick={start}>เริ่มเลย</BigButton>
      </Shell>
    );
  }

  if (play.phase === "finished") return <Shell>{result(play, start)}</Shell>;

  return (
    <Shell>
      <div className="flex items-center justify-between text-sm text-muted">
        <span>ข้อ {play.questionNumber}</span>
        <span>มั่นใจ {Math.round(play.confidence * 100)}%</span>
      </div>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-line"
        role="meter"
        aria-label="ความมั่นใจ"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(play.confidence * 100)}
      >
        <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${play.confidence * 100}%` }} />
      </div>

      <h2 key={play.question.id} className="mt-8 text-2xl leading-snug font-bold">
        {play.question.prompt}
      </h2>
      {play.question.subtitle ? <p className="mt-2 text-muted">{play.question.subtitle}</p> : null}
      {play.question.cue ? <CueText cue={play.question.cue} /> : null}

      <ol className="mt-6 space-y-3">
        {play.question.options.map((option, i) => (
          <li key={option.key}>
            <button
              type="button"
              onClick={() => choose(option.key)}
              className="flex min-h-16 w-full items-center gap-4 rounded-2xl border border-line bg-card px-4 py-3 text-left transition-colors hover:border-accent focus-visible:border-accent focus-visible:outline-none active:bg-line"
            >
              <kbd className="hidden size-8 shrink-0 items-center justify-center rounded-lg border border-line text-sm text-muted sm:flex">
                {i + 1}
              </kbd>
              <span>
                <span className="block text-lg font-medium">{option.label}</span>
                {option.hint ? <span className="block text-sm text-muted">{option.hint}</span> : null}
              </span>
            </button>
          </li>
        ))}
      </ol>
      <p className="mt-6 hidden text-center text-sm text-muted sm:block">กดปุ่มตัวเลขบนคีย์บอร์ดเพื่อตอบได้</p>
    </Shell>
  );
}

function CueText({ cue }: { cue: Cue }) {
  return cue.quoted ? (
    <blockquote className="mt-5 border-l-4 border-accent py-1 pl-4 text-xl leading-relaxed font-medium">“{cue.text}”</blockquote>
  ) : (
    <p className="mt-5 rounded-lg bg-line/60 px-4 py-3 text-xl leading-relaxed font-medium">{cue.text}</p>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return <main className="mx-auto w-full max-w-xl px-4 py-8 sm:py-12">{children}</main>;
}

export function BigButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-8 min-h-14 w-full rounded-2xl bg-accent px-6 text-lg font-bold text-accent-fg transition-opacity hover:opacity-90 active:opacity-80"
    >
      {children}
    </button>
  );
}
