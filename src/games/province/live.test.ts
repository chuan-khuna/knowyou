import { expect, test } from "bun:test";
import { PROVINCE_COUNT, createProvinceEngine, province, provinceBank } from ".";

test("an asking play carries the current belief for the live map", () => {
  let play = province.start({ seed: 9 });
  for (let i = 0; i < 3 && play.phase === "asking"; i++) {
    expect(play.live?.belief).toHaveLength(PROVINCE_COUNT);
    expect(play.live!.belief.reduce((s, p) => s + p, 0)).toBeCloseTo(1, 9);
    expect(Math.max(...play.live!.belief)).toBeCloseTo(play.confidence, 12);
    play = province.answer(play, play.question.options[0]!.key);
  }
});

test("the neighbours question names its figure; others name none", () => {
  const engine = createProvinceEngine(provinceBank.list.filter((q) => q.kind === "geo"), { picks: false });
  const figures = new Map<string, string | undefined>();
  let play = engine.start({ seed: 1 });
  while (play.phase === "asking") {
    figures.set(play.question.id, play.question.figure);
    play = engine.answer(play, play.question.options[0]!.key);
  }
  expect(figures.get("neighbour")).toBe("neighbours");
  expect([...figures].filter(([id, f]) => id !== "neighbour" && f !== undefined)).toEqual([]);
});
