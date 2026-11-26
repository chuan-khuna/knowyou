import { describe, expect, test } from "bun:test";
import { universityBank } from "./bank";
import { PICK_WEIGHTS, pickRows, rowsFor } from "./derive";
import { UNIVERSITY_COUNT, UNIVERSITY_IDS, type UniversityId } from "./ids";
import { UNIVERSITIES } from "./universities";
import { BankError, FIELDS, SETTINGS, answerOptions, defineBank, lean, type Area, type Tag } from "./schema";

describe("university facts", () => {
  test("36 universities with unique ids, names and short names, in the spec's five areas", () => {
    expect(UNIVERSITY_COUNT).toBe(36);
    expect(new Set(UNIVERSITY_IDS).size).toBe(36);
    expect(Object.keys(UNIVERSITIES).sort()).toEqual([...UNIVERSITY_IDS].sort());
    expect(new Set(UNIVERSITY_IDS.map((id) => UNIVERSITIES[id].name)).size).toBe(36);
    expect(new Set(UNIVERSITY_IDS.map((id) => UNIVERSITIES[id].short)).size).toBe(36);
    const counts: Partial<Record<Area, number>> = {};
    for (const id of UNIVERSITY_IDS) counts[UNIVERSITIES[id].area] = (counts[UNIVERSITIES[id].area] ?? 0) + 1;
    expect(counts).toEqual({ bangkok: 22, north: 6, northeast: 4, south: 3, east: 1 });
  });

  test("every field mix and setting mix sums to 1", () => {
    for (const id of UNIVERSITY_IDS) {
      const { fields, setting } = UNIVERSITIES[id];
      expect({ id, sum: FIELDS.reduce((s, f) => s + (fields[f] ?? 0), 0) }).toEqual({ id, sum: expect.closeTo(1, 9) });
      expect({ id, sum: SETTINGS.reduce((s, x) => s + (setting[x] ?? 0), 0) }).toEqual({ id, sum: expect.closeTo(1, 9) });
    }
  });

  test("every university has at least two signatures, no two share one, and none names its own university", () => {
    const labels = UNIVERSITY_IDS.flatMap((id) => UNIVERSITIES[id].signatures.map((s) => s.label));
    expect(new Set(labels).size).toBe(labels.length);
    for (const id of UNIVERSITY_IDS) {
      const { name, short, signatures } = UNIVERSITIES[id];
      expect(signatures.length).toBeGreaterThanOrEqual(2);
      for (const { label } of signatures) expect({ id, label, named: label.includes(name) || label.includes(short) }).toEqual({ id, label, named: false });
    }
  });

  test("every tag a university carries is read by some question", () => {
    const read = new Set<Tag>();
    for (const q of universityBank.list) for (const o of q.options) for (const t of Object.keys(o.tags ?? {})) read.add(t as Tag);
    for (const id of UNIVERSITY_IDS) for (const tag of UNIVERSITIES[id].tags ?? []) expect({ tag, read: read.has(tag) }).toEqual({ tag, read: true });
  });
});

describe("question bank", () => {
  test("every derived row is a valid distribution with every entry above 0", () => {
    for (const q of universityBank.list) {
      const rows = rowsFor(q);
      expect(rows.length).toBe(answerOptions(q).length);
      for (let u = 0; u < UNIVERSITY_COUNT; u++) {
        const column = rows.map((row) => row[u]!);
        for (const x of column) expect(x).toBeGreaterThan(0);
        expect({ q: q.id, u, sum: column.reduce((s, x) => s + x, 0) }).toEqual({ q: q.id, u, sum: expect.closeTo(1, 9) });
      }
    }
  });

  test("4–6 options per question, unique labels, ไม่แน่ใจ last", () => {
    for (const q of universityBank.list) {
      const options = answerOptions(q);
      expect(options.length).toBeGreaterThanOrEqual(4);
      expect(options.length).toBeLessThanOrEqual(6);
      expect(new Set(options.map((o) => o.label)).size).toBe(options.length);
      expect(options.at(-1)).toEqual({ key: "unsure", label: "ไม่แน่ใจ" });
    }
  });

  test("ไม่แน่ใจ is equally likely everywhere, so it never moves belief", () => {
    for (const q of universityBank.list) expect(new Set(rowsFor(q).at(-1)!).size).toBe(1);
  });

  test("the mix leans on campus life, with about four study questions and five place questions at most", () => {
    const count = (topic: string) => universityBank.list.filter((q) => q.topic === topic).length;
    expect(count("life")).toBeGreaterThanOrEqual(15);
    expect(count("study")).toBeGreaterThanOrEqual(4);
    expect(count("place")).toBeLessThanOrEqual(5);
  });

  test("an answer points where its facts say", () => {
    const p = (questionId: string, key: string, university: UniversityId) => {
      const q = universityBank.list.find((x) => x.id === questionId)!;
      return rowsFor(q)[answerOptions(q).findIndex((o) => o.key === key)]![UNIVERSITY_IDS.indexOf(university)]!;
    };
    expect(p("event", "football", "chula")).toBeGreaterThan(0.6);
    expect(p("event", "football", "cmu")).toBeLessThan(0.05);
    expect(p("welcome", "climb", "cmu")).toBeGreaterThan(p("welcome", "climb", "kku") * 5);
    expect(p("language", "japanese", "tni")).toBeGreaterThan(0.6);
    expect(p("admission", "open", "ramkhamhaeng")).toBeGreaterThan(0.6);
    expect(p("calendar", "work", "pim")).toBeGreaterThan(0.6);
    expect(p("mall", "future", "rangsit")).toBeGreaterThan(p("mall", "future", "kmitl") * 5);
    expect(p("mall", "siam", "chula")).toBeGreaterThan(0.6);
    expect(p("area", "north", "mfu")).toBeGreaterThan(0.8);
    expect(p("side", "west", "kmutt")).toBeGreaterThan(0.8);
    expect(p("side", "outside", "kku")).toBeGreaterThan(0.8);
    expect(p("doctor", "hospital", "psu")).toBeGreaterThan(p("doctor", "hospital", "utcc") * 5);
  });

  test("a pick question favours each signature's own university, then others in its area", () => {
    const owners = [UNIVERSITY_IDS.indexOf("cmu"), UNIVERSITY_IDS.indexOf("chula")];
    const rows = pickRows(owners);
    const at = (o: number, id: UniversityId) => rows[o]![UNIVERSITY_IDS.indexOf(id)]!;
    expect(rows.length).toBe(4);
    expect(at(0, "cmu")).toBeGreaterThan(at(0, "maejo"));
    expect(at(0, "maejo")).toBeGreaterThan(at(0, "thammasat"));
    expect(at(2, "kku")).toBeGreaterThan(at(0, "kku"));
    expect(PICK_WEIGHTS.own).toBeGreaterThan(PICK_WEIGHTS.sameArea);
  });
});

describe("defineBank rejects facts the types cannot check", () => {
  const option = (key: string, label: string) => ({ key, label, base: 1 });
  const ok = lean({ topic: "life", prompt: "p", options: [option("a", "a"), option("b", "b"), option("c", "c")] });
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
    const two = lean({ topic: "life", prompt: "p", options: [option("a", "a"), option("b", "b")] });
    const six = lean({ topic: "life", prompt: "p", options: ["a", "b", "c", "d", "e", "f"].map((k) => option(k, k)) });
    expect(issuesOf(() => defineBank({ two }))).toHaveLength(1);
    expect(issuesOf(() => defineBank({ six }))).toHaveLength(1);
  });
  test("two options with one label", () => {
    const same = lean({ topic: "life", prompt: "p", options: [option("a", "x"), option("b", "x"), option("c", "c")] });
    expect(issuesOf(() => defineBank({ same }))).toHaveLength(1);
  });
  test("a negative weight, or a tag boost below −1", () => {
    const negative = lean({ topic: "life", prompt: "p", options: [{ key: "a", label: "a", fields: { tech: -1 } }, option("b", "b"), option("c", "c")] });
    const boost = lean({ topic: "life", prompt: "p", options: [{ key: "a", label: "a", tags: { farm: -2 } }, option("b", "b"), option("c", "c")] });
    expect(issuesOf(() => defineBank({ negative }))).toHaveLength(1);
    expect(issuesOf(() => defineBank({ boost }))).toHaveLength(1);
  });
  test("more than five place questions", () => {
    const q = () => lean({ topic: "place", prompt: "p", options: [option("a", "a"), option("b", "b"), option("c", "c")] });
    expect(issuesOf(() => defineBank({ a: q(), b: q(), c: q(), d: q(), e: q(), f: q() }))).toHaveLength(1);
  });
});
