/** Test support: a simulated player from a chosen university, driven through the public interface only. */

import type { FinishedUniversityPlay, UniversityEngine } from "../engine";
import type { UniversityId } from "../ids";

/** mulberry32, kept separate from the engine's own generator. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * One whole play as a student of `university`, each answer drawn from the
 * engine's own P(answer | university). The seed drives both the engine's
 * choices and the answers, so a failure names a reproducible (university, seed) pair.
 */
export function simulatePlay(engine: UniversityEngine, university: UniversityId, seed: number): FinishedUniversityPlay {
  const rng = seededRandom(seed ^ 0x5bd1e995);
  let play = engine.start({ seed });
  while (play.phase === "asking") {
    const rows = engine.answerRows(play.question.id);
    const ps = rows.at(university);
    let r = rng();
    let pick = ps.length - 1;
    for (let i = 0; i < ps.length; i++) {
      r -= ps[i]!;
      if (r < 0) {
        pick = i;
        break;
      }
    }
    play = engine.answer(play, rows.options[pick]!.key);
  }
  return play;
}
