import { describe, expect, test } from "bun:test";
import { AGES, BankError, animeAge, animeAgeBank, defineBank, pickFrom, series } from ".";

describe("question bank", () => {
  test("question ids are unique", () => {
    const ids = animeAgeBank.list.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("every question's answers form a valid distribution at every age", () => {
    for (const q of animeAgeBank.list) {
      const curves = animeAge.answerCurves(q.id);
      for (const age of AGES) {
        const ps = curves.at(age);
        expect(ps.length).toBe(curves.options.length);
        for (const p of ps) expect(p).toBeGreaterThan(0);
        expect(ps.reduce((s, p) => s + p, 0)).toBeCloseTo(1, 9);
      }
    }
  });

  test("an override pins its answer's probability", () => {
    const pokemon = animeAge.answerCurves("pokemon");
    const none = pokemon.options.findIndex((o) => o.key === "none");
    // 0.03 pinned at age 30, then mixed with the 4% uniform floor over 4 answers.
    expect(pokemon.at(30)[none]).toBeCloseTo(0.96 * 0.03 + 0.01, 9);
  });

  test("every question shows 4–5 options with unique labels and the don't-know answer last", () => {
    const dontKnow = { series: "none", film: "none", pick: "unsure" } as const;
    for (const q of animeAgeBank.list) {
      const options = animeAge.answerCurves(q.id).options;
      expect(options.length).toBeGreaterThanOrEqual(4);
      expect(options.length).toBeLessThanOrEqual(5);
      expect(new Set(options.map((o) => o.label)).size).toBe(options.length);
      expect(options.at(-1)?.key).toBe(dontKnow[q.kind]);
    }
  });

  test("the bank has every kind of question", () => {
    const kinds = new Set(animeAgeBank.list.map((q) => q.kind));
    expect([...kinds].sort()).toEqual(["film", "pick", "series"]);
  });
});

describe("defineBank rejects facts the types cannot check", () => {
  const ok = { runs: [{ on: "ch9", from: 1990, to: 1992 }], audience: "kids", reach: "hit" } as const;

  const issuesOf = (build: () => unknown): readonly string[] => {
    try {
      build();
    } catch (error) {
      if (error instanceof BankError) return error.issues;
      throw error;
    }
    return [];
  };

  test("a valid bank loads", () => {
    expect(issuesOf(() => defineBank({ a: series({ title: "a", ...ok }) }))).toEqual([]);
  });

  test("a duplicate id across files", () => {
    const issues = issuesOf(() => defineBank({ a: series({ title: "a", ...ok }) }, { a: series({ title: "b", ...ok }) }));
    expect(issues).toHaveLength(1);
  });

  test("a run that ends before it starts", () => {
    expect(issuesOf(() => defineBank({ a: series({ ...ok, title: "a", runs: [{ on: "ch9", from: 1995, to: 1990 }] }) }))).toHaveLength(1);
  });

  test("a run outside its outlet's operating years", () => {
    expect(issuesOf(() => defineBank({ a: series({ ...ok, title: "a", runs: [{ on: "itv", from: 2005, to: 2010 }] }) }))).toHaveLength(1);
  });

  test("two answers with one label", () => {
    const titles = { a: series({ ...ok, title: "x" }), b: series({ ...ok, title: "x" }), c: series({ ...ok, title: "c" }) };
    const same = pickFrom(titles)({ prompt: "p", stage: "primary", titles: ["a", "b", "c"] });
    expect(issuesOf(() => defineBank(titles, { same }))).toHaveLength(1);
  });

  test("a pick whose titles all share one franchise, or name one title twice", () => {
    const titles = {
      a: series({ ...ok, title: "a", franchise: "f" }),
      b: series({ ...ok, title: "b", franchise: "f" }),
      c: series({ ...ok, title: "c", franchise: "f" }),
      d: series({ ...ok, title: "d" }),
    };
    const pick = pickFrom(titles);
    const oneFranchise = pick({ prompt: "p", stage: "primary", titles: ["a", "b", "c"] });
    const twice = pick({ prompt: "p", stage: "primary", titles: ["a", "a", "d"] });
    const fine = pick({ prompt: "p", stage: "primary", titles: ["a", "b", "d"] });
    expect(issuesOf(() => defineBank(titles, { oneFranchise }))).toHaveLength(1);
    expect(issuesOf(() => defineBank(titles, { twice })).length).toBeGreaterThan(0);
    expect(issuesOf(() => defineBank(titles, { fine }))).toEqual([]);
  });

  test("an override summing above 1", () => {
    const bad = series({ ...ok, title: "a", override: { lot: { 10: 0.7 }, none: { 10: 0.5 } } });
    expect(issuesOf(() => defineBank({ bad })).length).toBeGreaterThan(0);
  });
});
