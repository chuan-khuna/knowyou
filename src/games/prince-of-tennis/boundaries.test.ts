import { expect, test } from "bun:test";
import { Glob } from "bun";
import { join, relative } from "node:path";

const root = join(import.meta.dir, "../../..");
const moduleDir = "src/games/prince-of-tennis/";

test("nothing outside the prince-of-tennis module imports its internals", async () => {
  const offenders: string[] = [];
  for (const pattern of ["src/**/*.{ts,tsx}", "scripts/**/*.ts"]) {
    for await (const file of new Glob(pattern).scan({ cwd: root })) {
      const path = relative(root, join(root, file)).replaceAll("\\", "/");
      if (path.startsWith(moduleDir)) continue;
      const source = await Bun.file(join(root, file)).text();
      for (const [, spec] of source.matchAll(/from\s+["']([^"']+)["']/g)) {
        if (/games\/prince-of-tennis\/./.test(spec!) || /^\.\.?\/.*prince-of-tennis\/./.test(spec!)) offenders.push(`${path} -> ${spec}`);
      }
    }
  }
  expect(offenders).toEqual([]);
});
