import { describe, expect, test } from "bun:test";
import { provinceBank } from "./bank";
import { PICK_WEIGHTS, pickRows, rowsFor } from "./derive";
import { PROVINCE_COUNT, PROVINCE_IDS } from "./ids";
import { PROVINCES } from "./provinces";
import { BankError, DIALECTS, answerOptions, defineBank, geo, lean, type Region, type Tag } from "./schema";

describe("province facts", () => {
  test("77 provinces with unique ids in the official six-region split", () => {
    expect(PROVINCE_COUNT).toBe(77);
    expect(new Set(PROVINCE_IDS).size).toBe(77);
    expect(Object.keys(PROVINCES).sort()).toEqual([...PROVINCE_IDS].sort());
    const counts: Partial<Record<Region, number>> = {};
    for (const id of PROVINCE_IDS) counts[PROVINCES[id].region] = (counts[PROVINCES[id].region] ?? 0) + 1;
    expect(counts).toEqual({ north: 9, northeast: 20, central: 22, east: 7, west: 5, south: 14 });
  });

  test("every dialect mix sums to 1 and every Muslim share is a share", () => {
    for (const id of PROVINCE_IDS) {
      const mix = PROVINCES[id].dialect;
      expect({ id, sum: DIALECTS.reduce((s, d) => s + (mix[d] ?? 0), 0) }).toEqual({ id, sum: expect.closeTo(1, 9) });
      expect(PROVINCES[id].muslim).toBeGreaterThanOrEqual(0);
      expect(PROVINCES[id].muslim).toBeLessThanOrEqual(1);
    }
  });

  test("every province has at least two signatures, and no two provinces share one", () => {
    const labels = PROVINCE_IDS.flatMap((id) => PROVINCES[id].signatures.map((s) => s.label));
    for (const id of PROVINCE_IDS) expect(PROVINCES[id].signatures.length).toBeGreaterThanOrEqual(2);
    expect(new Set(labels).size).toBe(labels.length);
  });

  test("every tag a province carries is read by some question", () => {
    const read = new Set<Tag>();
    for (const q of provinceBank.list) {
      if (q.kind === "lean") for (const o of q.options) for (const t of Object.keys(o.tags ?? {})) read.add(t as Tag);
    }
    for (const id of PROVINCE_IDS) for (const tag of PROVINCES[id].tags ?? []) expect({ tag, read: read.has(tag) }).toEqual({ tag, read: true });
  });
});

describe("question bank", () => {
  test("every derived row is a valid distribution with every entry above 0", () => {
    for (const q of provinceBank.list) {
      const rows = rowsFor(q);
      expect(rows.length).toBe(answerOptions(q).length);
      for (let p = 0; p < PROVINCE_COUNT; p++) {
        const column = rows.map((row) => row[p]!);
        for (const x of column) expect(x).toBeGreaterThan(0);
        expect({ q: q.id, p, sum: column.reduce((s, x) => s + x, 0) }).toEqual({ q: q.id, p, sum: expect.closeTo(1, 9) });
      }
    }
  });

  test("4–6 options per question, unique labels, ไม่แน่ใจ last", () => {
    for (const q of provinceBank.list) {
      const options = answerOptions(q);
      expect(options.length).toBeGreaterThanOrEqual(4);
      expect(options.length).toBeLessThanOrEqual(6);
      expect(new Set(options.map((o) => o.label)).size).toBe(options.length);
      expect(options.at(-1)).toEqual({ key: "unsure", label: "ไม่แน่ใจ" });
    }
  });

  test("ไม่แน่ใจ is equally likely everywhere, so it never moves belief", () => {
    for (const q of provinceBank.list) {
      const unsure = rowsFor(q).at(-1)!;
      expect(new Set(unsure).size).toBe(1);
    }
  });

  test("the mix leans on language, food and culture, with five geography questions at most", () => {
    const count = (topic: string) => provinceBank.list.filter((q) => q.topic === topic).length;
    expect(count("language")).toBeGreaterThanOrEqual(8);
    expect(count("food")).toBeGreaterThanOrEqual(8);
    expect(count("culture")).toBeGreaterThanOrEqual(6);
    expect(count("geography")).toBeLessThanOrEqual(5);
  });

  test("the bank asks which neighbouring country is nearest", () => {
    expect(provinceBank.list.some((q) => q.kind === "geo" && q.measure === "neighbour")).toBe(true);
  });

  test("an answer points where its facts say", () => {
    const p = (questionId: string, key: string, province: (typeof PROVINCE_IDS)[number]) => {
      const q = provinceBank.list.find((x) => x.id === questionId)!;
      return rowsFor(q)[answerOptions(q).findIndex((o) => o.key === key)]![PROVINCE_IDS.indexOf(province)]!;
    };
    expect(p("speak", "u", "chiang-mai")).toBeGreaterThan(0.6);
    expect(p("speak", "laeng", "chiang-mai")).toBeLessThan(0.05);
    expect(p("sausage", "no-pork", "pattani")).toBeGreaterThan(0.7);
    expect(p("sausage", "no-pork", "bangkok")).toBeLessThan(0.1);
    expect(p("accent", "suphan", "suphan-buri")).toBeGreaterThan(p("accent", "suphan", "bangkok") * 5);
    expect(p("neighbour", "MY", "songkhla")).toBeGreaterThan(0.5);
    expect(p("fruit", "mango", "phetchabun")).toBeGreaterThan(0.6);
  });

  test("a pick question favours each signature's own province, then its neighbours", () => {
    const owners = [PROVINCE_IDS.indexOf("chiang-mai"), PROVINCE_IDS.indexOf("songkhla")];
    const rows = pickRows(owners);
    const at = (o: number, id: (typeof PROVINCE_IDS)[number]) => rows[o]![PROVINCE_IDS.indexOf(id)]!;
    expect(rows.length).toBe(4);
    expect(at(0, "chiang-mai")).toBeGreaterThan(at(0, "lamphun"));
    expect(at(0, "lamphun")).toBeGreaterThan(at(0, "songkhla"));
    expect(at(2, "bangkok")).toBeGreaterThan(at(0, "bangkok"));
    expect(PICK_WEIGHTS.own).toBeGreaterThan(PICK_WEIGHTS.nearby);
  });
});

describe("defineBank rejects facts the types cannot check", () => {
  const option = (key: string, label: string) => ({ key, label, dialect: { klang: 1 } });
  const ok = lean({ topic: "food", prompt: "p", options: [option("a", "a"), option("b", "b"), option("c", "c")] });
  const issuesOf = (build: () => unknown): readonly string[] => {
    try {
      build();
    } catch (error) {
      if (error instanceof BankError) return error.issues;
      throw error;
    }
    return [];
  };

  test("a valid bank loads", () => expect(issuesOf(() => defineBank({ ok }))).toEqual([]));
  test("a duplicate id across parts", () => expect(issuesOf(() => defineBank({ ok }, { ok }))).toHaveLength(1));
  test("an id that looks like a pick", () => expect(issuesOf(() => defineBank({ "pick:x": ok }))).toHaveLength(1));
  test("too few or too many options", () => {
    const two = lean({ topic: "food", prompt: "p", options: [option("a", "a"), option("b", "b")] });
    const six = lean({ topic: "food", prompt: "p", options: ["a", "b", "c", "d", "e", "f"].map((k) => option(k, k)) });
    expect(issuesOf(() => defineBank({ two }))).toHaveLength(1);
    expect(issuesOf(() => defineBank({ six }))).toHaveLength(1);
  });
  test("two options with one label", () => {
    const same = lean({ topic: "food", prompt: "p", options: [option("a", "x"), option("b", "x"), option("c", "c")] });
    expect(issuesOf(() => defineBank({ same }))).toHaveLength(1);
  });
  test("a negative weight, or a tag boost below −1", () => {
    const negative = lean({ topic: "food", prompt: "p", options: [{ key: "a", label: "a", base: -1 }, option("b", "b"), option("c", "c")] });
    const boost = lean({ topic: "food", prompt: "p", options: [{ key: "a", label: "a", tags: { chinese: -2 } }, option("b", "b"), option("c", "c")] });
    expect(issuesOf(() => defineBank({ negative }))).toHaveLength(1);
    expect(issuesOf(() => defineBank({ boost }))).toHaveLength(1);
  });
  test("more than five geography questions", () => {
    const g = () => geo({ measure: "cold", prompt: "p", labels: { cold: "a", cool: "b", warm: "c" } });
    expect(issuesOf(() => defineBank({ a: g(), b: g(), c: g(), d: g(), e: g(), f: g() }))).toHaveLength(1);
  });
});
