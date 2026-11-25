/** Prints the compiled P(answer | age) for one question: `bun run curve <id>`. */

import { AGES, animeAge, animeAgeBank } from "@/games/anime-age";

const id = process.argv[2];
if (!id) {
  console.error(`usage: bun run curve <id>\nids: ${animeAgeBank.list.map((q) => q.id).join(" ")}`);
  process.exit(1);
}

const curves = animeAge.answerCurves(id);
const width = 6;
const bar = (p: number) => "█".repeat(Math.round(p * 20)).padEnd(20, "·");
console.log(`${id}\n`);
console.log(["age", ...curves.options.map((o) => o.key.padStart(width))].join(" "));
for (const age of AGES) {
  const ps = curves.at(age);
  console.log([String(age).padStart(3), ...ps.map((p) => p.toFixed(3).padStart(width)), " ", bar(ps[0]!)].join(" "));
}
console.log(`\nbar: ${curves.options[0]!.key} (${curves.options[0]!.label})`);
