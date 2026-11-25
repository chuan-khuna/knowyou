import { expect, test } from "bun:test";
import { PROVINCE_IDS, PROVINCE_ISO } from "./ids";
import { NEIGHBOUR_SHAPES, PROVINCE_SHAPES } from "./map/shapes";

test("every province has exactly one map shape, and every shape is a province", () => {
  const isoCodes = PROVINCE_IDS.map((id) => PROVINCE_ISO[id]);
  expect(new Set(isoCodes).size).toBe(77);
  expect(Object.keys(PROVINCE_SHAPES).sort()).toEqual([...isoCodes].sort());
  for (const shape of Object.values(PROVINCE_SHAPES)) expect(shape.d).toMatch(/^M\d+ \d+l.*z$/);
});

test("each neighbour has a shape and a label point", () => {
  expect(Object.keys(NEIGHBOUR_SHAPES).sort()).toEqual(["KH", "LA", "MM", "MY"]);
  for (const shape of Object.values(NEIGHBOUR_SHAPES)) expect(shape.d.length).toBeGreaterThan(100);
});

test("the map ships at most 200 KB of path data", () => {
  const bytes = [...Object.values(PROVINCE_SHAPES), ...Object.values(NEIGHBOUR_SHAPES)].reduce((s, x) => s + x.d.length, 0);
  expect(bytes).toBeLessThanOrEqual(200 * 1024);
});
