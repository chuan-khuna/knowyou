"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { Cue, Engine, FinishedPlay, Play } from "@/games/engine";
import { sound } from "@/lib/sound";
import { ResetButton } from "@/components/reset-button";
import { SoundToggle } from "@/components/sound-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { encodePlayRecord, playRecordKey, restorePlay, type GameId, type RevealParser } from "@/lib/play-record";

export interface ResultControls<R> {
  /** Undefined until the player says whether the guess was right. */
  readonly reveal: R | undefined;
  readonly setReveal: (reveal: R) => void;
  readonly playAgain: () => void;
}

interface PlayScreenProps<V, X, L, R> {
  readonly game: GameId;
  readonly engine: Engine<V, X, L>;
  readonly title: string;
  readonly intro: ReactNode;
  readonly parseReveal: RevealParser<R>;
  readonly result: (play: FinishedPlay<V, X>, controls: ResultControls<R>) => ReactNode;
  /** The game's live view beside each question, drawn from the asking play's `live` data. */
  readonly live?: (live: L) => ReactNode;
}

type Screen<V, X, L, R> =
  | { readonly kind: "checking" }
  | { readonly kind: "intro" }
  | { readonly kind: "playing"; readonly play: Play<V, X, L>; readonly reveal: R | undefined };

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
 * The play screen every game shares: intro, one question at a time with a
 * live confidence meter, then the game's own result screen. It knows a game
 * only through the engine contract. A play with at least one answer is kept
 * in localStorage until the player starts again, so a refresh doesn't lose it.
 */
export function PlayScreen<V, X, L, R>({ game, engine, title, intro, parseReveal, result, live }: PlayScreenProps<V, X, L, R>) {
  const storageKey = playRecordKey(game);
  const [screen, setScreen] = useState<Screen<V, X, L, R>>({ kind: "checking" });

  useEffect(() => {
    const restored = restorePlay(engine, readStored(storageKey), parseReveal);
    if (restored === null) writeStored(storageKey, null);
    setScreen(restored === null ? { kind: "intro" } : { kind: "playing", ...restored });
  }, [engine, storageKey, parseReveal]);

  useEffect(() => {
    if (screen.kind === "checking") return;
    const keep = screen.kind === "playing" && screen.play.answers.length > 0;
    writeStored(storageKey, keep ? encodePlayRecord(screen.play, screen.reveal) : null);
  }, [screen, storageKey]);

  const start = useCallback(() => {
    sound.start();
    writeStored(storageKey, null);
    setScreen({ kind: "playing", play: engine.start({ seed: randomSeed() }), reveal: undefined });
  }, [engine, storageKey]);

  const play = screen.kind === "playing" ? screen.play : null;

  const choose = useCallback(
    (key: string) => {
      if (play?.phase !== "asking") return;
      const next = engine.answer(play, key);
      if (next.phase === "finished") sound.guess();
      else sound.answer();
      setScreen({ kind: "playing", play: next, reveal: undefined });
    },
    [engine, play],
  );

  const setReveal = useCallback(
    (reveal: R) => setScreen((current) => (current.kind === "playing" ? { ...current, reveal } : current)),
    [],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (screen.kind === "intro" && event.key === "Enter") return start();
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
      </Shell>
    );
  }

  const current = screen.play;
  if (current.phase === "finished") {
    return <Shell>{result(current, { reveal: screen.reveal, setReveal, playAgain: start })}</Shell>;
  }

  const confidence = Math.round(current.confidence * 100);
  return (
    <Shell status={<span className="num">ข้อ {current.questionNumber}</span>} onReset={start}>
      <div className="mt-4 flex items-center gap-3">
        <div className="meter flex-1" role="meter" aria-label="ความมั่นใจ" aria-valuemin={0} aria-valuemax={100} aria-valuenow={confidence}>
          <div className="meter-fill" style={{ transform: `scaleX(${current.confidence})` }} />
        </div>
        <span className="num w-24 text-right text-sm text-muted">มั่นใจ {confidence}%</span>
      </div>

      <div className="question-head mt-10">
        <div>
          <h2 key={current.question.id} className="max-w-none text-2xl">
            {current.question.prompt}
          </h2>
          {current.question.subtitle ? <p className="mt-2 text-muted">{current.question.subtitle}</p> : null}
        </div>
        {live && current.live !== undefined ? <div className="question-live">{live(current.live)}</div> : null}
      </div>
      {current.question.cue ? <CueText cue={current.question.cue} /> : null}

      <ol className="mt-8 grid gap-4">
        {current.question.options.map((option, i) => (
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

/**
 * `onReset` is given only while a play is in progress; it shows the reset button.
 * `crowded` hides the theme button on a phone, for a status too wide to leave it room.
 */
export function Shell({ status, onReset, crowded = false, children }: { status?: ReactNode; onReset?: () => void; crowded?: boolean; children: ReactNode }) {
  return (
    <main className="shell">
      <header className="topbar">
        <Link href="/" className="wordmark">
          KnowYou
        </Link>
        <div className="topbar-end">
          {status}
          {onReset ? <ResetButton onReset={onReset} /> : null}
          <ThemeToggle className={crowded ? "hidden sm:inline-flex" : undefined} />
          <SoundToggle />
        </div>
      </header>
      {children}
    </main>
  );
}

/**
 * เล่นอีกครั้ง, pinned to the bottom of the viewport on a paper band while the
 * result scrolls under it. It is the result's last element, so it rests after
 * the content once the page is scrolled to the end, and comes last in focus order.
 * With `pin="top"` it sits where it is placed and sticks to the top of the
 * viewport once the page scrolls past it.
 */
export function PlayAgainBar({ onClick, pin = "bottom" }: { onClick: () => void; pin?: "top" | "bottom" }) {
  return (
    <div className={pin === "top" ? "play-again play-again--top" : "play-again"}>
      <button type="button" onClick={onClick} className="stock stock--primary text-lg">
        เล่นอีกครั้ง
      </button>
    </div>
  );
}

export function BigButton({
  children,
  onClick,
  autoFocus,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  autoFocus?: boolean;
  disabled?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} autoFocus={autoFocus} disabled={disabled} className="stock stock--primary mt-10 text-lg">
      {children}
    </button>
  );
}
