import { describe, expect, test } from "bun:test";
import { Glob } from "bun";
import { basename } from "node:path";
import { PERSONAS, replayPersona } from "./personas";

describe("personas", () => {
  test.each(PERSONAS.map((p) => [p.name, p] as const))("%s gets a hit", (_, persona) => {
    const play = replayPersona(persona);
    expect({ guess: play.guess.value, top: play.extras.top.map((c) => c.id) }).toEqual({
      guess: persona.university,
      top: expect.arrayContaining([persona.university]),
    });
  });

  test("every persona file is listed", async () => {
    const files: string[] = [];
    for await (const f of new Glob("*.ts").scan({ cwd: `${import.meta.dir}/personas` })) {
      if (!["index.ts", "persona.ts"].includes(basename(f))) files.push(f);
    }
    expect(PERSONAS.length).toBe(files.length);
  });

  test("placeholders are still standing in for real players", () => {
    const placeholders = PERSONAS.filter((p) => p.placeholder).map((p) => p.name);
    if (placeholders.length > 0) console.warn(`placeholder personas to replace with real recordings: ${placeholders.join(", ")}`);
    expect(PERSONAS.length).toBeGreaterThan(0);
  });
});
