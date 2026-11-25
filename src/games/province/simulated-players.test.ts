import { beforeAll, describe, expect, test } from "bun:test";
import { PROVINCES, PROVINCE_IDS, PROVINCE_RULES, createProvinceEngine, province, provinceBank, simulatePlay, type FinishedProvincePlay, type ProvinceId } from ".";

const PLAYS_PER_PROVINCE = 20;

/**
 * Thresholds, set on 2026-11-25 from the baseline this suite measured before
 * any tuning (1540 plays, seeds fixed): exact 0.800, top-3 0.940, right
 * region 0.974, worst province 0.45 (roi-et), mean questions 13.0.
 *
 * Each is the baseline less about three standard errors of a binomial rate at
 * this sample size (exact: √(0.8·0.2/1540) ≈ 0.010; one province: √(0.45·0.55/20)
 * ≈ 0.11), so a bank edit that changes which seeds hit doesn't fail the suite
 * by chance, while a real regression does. Never loosen them to make a change pass.
 */
const THRESHOLDS = { exact: 0.77, top3: 0.91, region: 0.94, worstProvince: 0.2, meanQuestionsAtMost: 16 } as const;

describe("simulated players over the full bank", () => {
  let results: { home: ProvinceId; play: FinishedProvincePlay }[] = [];
  const rate = (f: (r: (typeof results)[number]) => boolean, of = results) => of.filter(f).length / of.length;

  beforeAll(() => {
    results = PROVINCE_IDS.flatMap((home, h) =>
      Array.from({ length: PLAYS_PER_PROVINCE }, (_, s) => ({ home, play: simulatePlay(home, h * 1000 + s) })),
    );
    const perProvince = PROVINCE_IDS.map((home) => ({ home, rate: rate((r) => r.play.guess.value === home, results.filter((r) => r.home === home)) }));
    const worst = perProvince.reduce((a, b) => (b.rate < a.rate ? b : a));
    const asked = results.reduce((s, r) => s + r.play.questionsAsked, 0) / results.length;
    console.log(
      `simulated: ${results.length} plays, exact ${rate((r) => r.play.guess.value === r.home).toFixed(3)}, ` +
        `top-3 ${rate((r) => r.play.extras.top.some((c) => c.id === r.home)).toFixed(3)}, ` +
        `region ${rate((r) => PROVINCES[r.play.guess.value].region === PROVINCES[r.home].region).toFixed(3)}, ` +
        `worst ${worst.home} at ${worst.rate.toFixed(2)}, mean questions ${asked.toFixed(1)}`,
    );
  }, 120_000);

  test(`guesses the exact province in at least ${THRESHOLDS.exact * 100}% of plays`, () => {
    expect(rate((r) => r.play.guess.value === r.home)).toBeGreaterThanOrEqual(THRESHOLDS.exact);
  });

  test(`has the true province in its top 3 in at least ${THRESHOLDS.top3 * 100}% of plays`, () => {
    expect(rate((r) => r.play.extras.top.some((c) => c.id === r.home))).toBeGreaterThanOrEqual(THRESHOLDS.top3);
  });

  test(`guesses the right region in at least ${THRESHOLDS.region * 100}% of plays`, () => {
    expect(rate((r) => PROVINCES[r.play.guess.value].region === PROVINCES[r.home].region)).toBeGreaterThanOrEqual(THRESHOLDS.region);
  });

  test("no province is a blind spot", () => {
    for (const home of PROVINCE_IDS) {
      const mine = results.filter((r) => r.home === home);
      expect({ home, ok: rate((r) => r.play.guess.value === home, mine) >= THRESHOLDS.worstProvince }).toEqual({ home, ok: true });
    }
  });

  test("asks between the minimum and maximum, with a short mean", () => {
    for (const { play } of results) {
      expect(play.questionsAsked).toBeGreaterThanOrEqual(PROVINCE_RULES.minQuestions);
      expect(play.questionsAsked).toBeLessThanOrEqual(PROVINCE_RULES.maxQuestions);
    }
    expect(results.reduce((s, r) => s + r.play.questionsAsked, 0) / results.length).toBeLessThanOrEqual(THRESHOLDS.meanQuestionsAtMost);
  });

  test("asks at most four pick questions, never two in a row, each with 3–4 signatures", () => {
    for (const { play } of results) {
      const picks = play.answers.map((a) => a.questionId.startsWith("pick:"));
      expect(picks.filter(Boolean).length).toBeLessThanOrEqual(PROVINCE_RULES.picksPerPlay);
      picks.forEach((isPick, i) => expect(isPick && picks[i - 1]).toBeFalsy());
    }
    const pickIds = results.flatMap((r) => r.play.answers.filter((a) => a.questionId.startsWith("pick:")).map((a) => a.questionId));
    expect(pickIds.length).toBeGreaterThan(0);
    for (const id of pickIds.slice(0, 200)) {
      const options = province.answerRows(id).options;
      expect(options.length - 2).toBeGreaterThanOrEqual(3);
      expect(options.length - 2).toBeLessThanOrEqual(4);
      expect(options.slice(-2).map((o) => o.label)).toEqual(["ไม่มีอันไหนเลย", "ไม่แน่ใจ"]);
    }
  });

  test("the result lists the top candidates and the answers that pointed at the guess", () => {
    for (const { play } of results.slice(0, 300)) {
      expect(play.extras.top[0]?.id).toBe(play.guess.value);
      expect(play.extras.top).toHaveLength(PROVINCE_RULES.topCandidates);
      expect(play.extras.pointers.length).toBeLessThanOrEqual(PROVINCE_RULES.pointers);
      for (const i of play.extras.pointers) expect(play.answers[i]).toBeDefined();
      expect(play.extras.belief.reduce((s, p) => s + p, 0)).toBeCloseTo(1, 9);
    }
  });
});

describe("a play", () => {
  test("is reproducible from its seed and answers, pick questions included", () => {
    expect(simulatePlay("chiang-mai", 42)).toEqual(simulatePlay("chiang-mai", 42));
  });

  test("varies between seeds", () => {
    const firsts = new Set(
      Array.from({ length: 20 }, (_, seed) => {
        const play = province.start({ seed });
        return play.phase === "asking" ? play.question.id : null;
      }),
    );
    expect(firsts.size).toBeGreaterThan(1);
  });

  test("answering never changes the earlier play, and answering it twice gives the same result", () => {
    const start = province.start({ seed: 7 });
    if (start.phase !== "asking") throw new Error("a fresh play asks a question");
    const snapshot = structuredClone(start);
    const key = start.question.options[0]!.key;
    expect(province.answer(start, key)).toEqual(province.answer(start, key));
    expect(start).toEqual(snapshot);
  });

  test("numbers questions from 1 and reports confidence between 0 and 1", () => {
    let play = province.start({ seed: 3 });
    let expected = 1;
    while (play.phase === "asking") {
      expect(play.questionNumber).toBe(expected++);
      expect(play.confidence).toBeGreaterThan(0);
      expect(play.confidence).toBeLessThanOrEqual(1);
      play = province.answer(play, play.question.options[0]!.key);
    }
  });

  test("rejects an answer the question doesn't offer", () => {
    const play = province.start({ seed: 1 });
    if (play.phase !== "asking") throw new Error("a fresh play asks a question");
    expect(() => province.answer(play, "not-an-answer")).toThrow();
  });

  test("guesses once the bank is used up, even before the minimum", () => {
    const small = createProvinceEngine(provinceBank.list.slice(0, 3), { picks: false });
    let play = small.start({ seed: 1 });
    while (play.phase === "asking") play = small.answer(play, play.question.options[0]!.key);
    expect(play.questionsAsked).toBe(3);
  });

  test("names Bangkok without จังหวัด", () => {
    const play = simulatePlay("bangkok", 5);
    const label = play.guess.value === "bangkok" ? play.guess.label : null;
    if (label) expect(label).toBe("คุณมาจากกรุงเทพมหานคร");
    expect(simulatePlay("chiang-mai", 5).guess.label).toStartWith("คุณมาจากจังหวัด");
  });
});
