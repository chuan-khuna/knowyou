/** Test support: a simulated player from a chosen province, driven through the public interface only. */

import type { FinishedProvincePlay, ProvinceEngine } from "../engine";
import type { ProvinceId } from "../ids";

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
 * One whole play as a person from `home`, each answer drawn from the engine's
 * own P(answer | province). The seed drives both the engine's choices and the
 * answers, so a failure names a reproducible (province, seed) pair.
 */
export function simulatePlay(engine: ProvinceEngine, home: ProvinceId, seed: number): FinishedProvincePlay {
  const rng = seededRandom(seed ^ 0x5bd1e995);
  let play = engine.start({ seed });
  while (play.phase === "asking") {
    const rows = engine.answerRows(play.question.id);
    const ps = rows.at(home);
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
