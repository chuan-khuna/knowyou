/**
 * Simulated players over the shipped University bank, with per-university detail:
 * `bun scripts/university-sim.ts [playsPerUniversity]`.
 */

import { UNIVERSITIES, UNIVERSITY_IDS, simulatePlay, type UniversityId } from "@/games/university";

const plays = Number(process.argv[2] ?? 20);
const rows = UNIVERSITY_IDS.map((home: UniversityId) => {
  const results = Array.from({ length: plays }, (_, s) => simulatePlay(home, UNIVERSITY_IDS.indexOf(home) * 1000 + s));
  const exact = results.filter((p) => p.guess.value === home).length / plays;
  const top3 = results.filter((p) => p.extras.top.some((c) => c.id === home)).length / plays;
  const area = results.filter((p) => UNIVERSITIES[p.guess.value].area === UNIVERSITIES[home].area).length / plays;
  const asked = results.reduce((s, p) => s + p.questionsAsked, 0) / plays;
  const confidence = results.reduce((s, p) => s + p.confidence, 0) / plays;
  const picks = results.reduce((s, p) => s + p.answers.filter((a) => a.questionId.startsWith("pick:")).length, 0) / plays;
  return { home, exact, top3, area, asked, confidence, picks };
});
const mean = (f: (r: (typeof rows)[number]) => number) => rows.reduce((s, r) => s + f(r), 0) / rows.length;
for (const r of [...rows].sort((a, b) => a.exact - b.exact).slice(0, 12)) {
  console.log(
    `${r.home.padEnd(14)} exact ${r.exact.toFixed(2)} top3 ${r.top3.toFixed(2)} area ${r.area.toFixed(2)} asked ${r.asked.toFixed(1)} picks ${r.picks.toFixed(1)} conf ${r.confidence.toFixed(2)}`,
  );
}
console.log(
  `${rows.length * plays} plays: exact ${mean((r) => r.exact).toFixed(3)}, top-3 ${mean((r) => r.top3).toFixed(3)}, ` +
    `area ${mean((r) => r.area).toFixed(3)}, mean questions ${mean((r) => r.asked).toFixed(1)}, mean confidence ${mean((r) => r.confidence).toFixed(3)}`,
);
