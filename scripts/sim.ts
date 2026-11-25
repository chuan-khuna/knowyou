/**
 * Simulated players over the shipped bank, with per-age detail:
 * `bun run sim [playsPerAge]`. Each cell is age:hitRate/meanFinalConfidence.
 */

import { AGES, animeAge, animeAgeBank, isHit, type Age } from "@/games/anime-age";

function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function play(age: Age, seed: number) {
  const draw = rng(seed ^ 0x5bd1e995);
  let p = animeAge.start({ seed });
  while (p.phase === "asking") {
    const curves = animeAge.answerCurves(p.question.id);
    let r = draw();
    const ps = curves.at(age);
    const i = ps.findIndex((x) => (r -= x) < 0);
    p = animeAge.answer(p, curves.options[i === -1 ? ps.length - 1 : i]!.key);
  }
  return p;
}

const perAge = Number(process.argv[2] ?? 40);
const kindOf = new Map(animeAgeBank.list.map((q) => [q.id, q.kind]));
const kinds: Record<string, number> = {};
const cells: string[] = [];
let hits = 0;
let questions = 0;
let capped = 0;
for (const age of AGES) {
  let ageHits = 0;
  let confidence = 0;
  for (let s = 0; s < perAge; s++) {
    const p = play(age, age * 1000 + s);
    ageHits += Number(isHit(p.guess.value, age));
    confidence += p.confidence;
    questions += p.questionsAsked;
    if (p.questionsAsked >= 45) capped++;
    for (const a of p.answers) kinds[kindOf.get(a.questionId)!] = (kinds[kindOf.get(a.questionId)!] ?? 0) + 1;
  }
  hits += ageHits;
  cells.push(`${age}:${(ageHits / perAge).toFixed(2)}/${(confidence / perAge).toFixed(2)}`);
}
const total = AGES.length * perAge;
console.log(`pooled ${(hits / total).toFixed(3)}, mean questions ${(questions / total).toFixed(1)}, capped at 45: ${capped}/${total}`);
console.log(cells.join(" "));
console.log("answers by kind", kinds);
