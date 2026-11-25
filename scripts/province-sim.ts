/**
 * Simulated players over the shipped Province bank, with per-province detail:
 * `bun scripts/province-sim.ts [playsPerProvince]`.
 */

import { PROVINCES, PROVINCE_IDS, simulatePlay, type ProvinceId } from "@/games/province";

const plays = Number(process.argv[2] ?? 20);
const rows = PROVINCE_IDS.map((home: ProvinceId) => {
  const results = Array.from({ length: plays }, (_, s) => simulatePlay(home, PROVINCE_IDS.indexOf(home) * 1000 + s));
  const exact = results.filter((p) => p.guess.value === home).length / plays;
  const top3 = results.filter((p) => p.extras.top.some((c) => c.id === home)).length / plays;
  const region = results.filter((p) => PROVINCES[p.guess.value].region === PROVINCES[home].region).length / plays;
  const asked = results.reduce((s, p) => s + p.questionsAsked, 0) / plays;
  const confidence = results.reduce((s, p) => s + p.confidence, 0) / plays;
  return { home, exact, top3, region, asked, confidence };
});
const mean = (f: (r: (typeof rows)[number]) => number) => rows.reduce((s, r) => s + f(r), 0) / rows.length;
for (const r of [...rows].sort((a, b) => a.exact - b.exact).slice(0, 12)) {
  console.log(`${r.home.padEnd(22)} exact ${r.exact.toFixed(2)} top3 ${r.top3.toFixed(2)} region ${r.region.toFixed(2)} asked ${r.asked.toFixed(1)} conf ${r.confidence.toFixed(2)}`);
}
console.log(
  `${rows.length * plays} plays: exact ${mean((r) => r.exact).toFixed(3)}, top-3 ${mean((r) => r.top3).toFixed(3)}, ` +
    `region ${mean((r) => r.region).toFixed(3)}, mean questions ${mean((r) => r.asked).toFixed(1)}, mean confidence ${mean((r) => r.confidence).toFixed(3)}`,
);
