import { globber } from "../mod.ts";
import { describe, it } from "./deps.ts";
import { snapshot } from "./helpers.ts";

const cwd = new URL("fixtures/glob/", import.meta.url).pathname;

describe("globber", () => {
  it("should return all entries by default", async (t) => {
    const gathered: string[] = [];

    for await (const entry of globber({ cwd })) {
      gathered.push(entry.relative);
    }

    await snapshot(t, gathered);
  });

  it("should accept a function as a matcher", async (t) => {
    const gathered: string[] = [];

    for await (
      const entry of globber({
        include: (p) => !p.startsWith("first"),
        cwd,
        excludeDirectories: true,
      })
    ) {
      gathered.push(entry.relative);
    }

    await snapshot(t, gathered);
  });

  it("should return no entries with empty array", async (t) => {
    const gathered: string[] = [];

    for await (const entry of globber({ include: [], cwd })) {
      gathered.push(entry.relative);
    }

    await snapshot(t, gathered);
  });

  it("returns the filtered entries when `include` option provided", async (t) => {
    const gathered: string[] = [];
    const include = ["**/*/*.md"];

    for await (
      const entry of globber({ include, cwd, excludeDirectories: true })
    ) {
      gathered.push(entry.relative);
    }

    await snapshot(t, gathered);
  });

  it("should support returning `onlyDirectories`", async (t) => {
    const gathered: string[] = [];

    for await (const entry of globber({ excludeFiles: true, cwd })) {
      gathered.push(entry.relative);
    }

    await snapshot(t, gathered);
  });
});
