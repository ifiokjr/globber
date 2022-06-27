import { globber } from "../mod.ts";
import { path } from "../src/deps.ts";
import { semver } from "./deps.ts";
import { getVersion } from "./helpers.ts";

const cwd = new URL("../", import.meta.url).pathname;
const importMapPath = path.join(cwd, "tests/test_docs_import_map.json");

semver.inc;

const releaseTypes = [
  "pre",
  "major",
  "premajor",
  "minor",
  "preminor",
  "patch",
  "prepatch",
  "prerelease",
] as const;

try {
  const version = await getVersion();
  const imports: Record<string, string> = {
    "https://deno.land/x/globber@<%=it.version%>/": cwd,
    "https://deno.land/x/globber/": cwd,
    [`https://deno.land/x/globber@${version}/`]: cwd,
  };

  for (const type of releaseTypes) {
    imports[`https://deno.land/x/globber@${semver.inc(version, type)}/`] = cwd;
  }

  const importMap = { imports };
  const files = [];

  for await (
    const file of globber({
      cwd,
      extensions: [".ts", ".md"],
      exclude: ["**/fixtures/", "**/tests/", "**/scripts/"],
      excludeDirectories: true,
    })
  ) {
    files.push(file.relative);
  }

  await Deno.writeTextFile(importMapPath, JSON.stringify(importMap));

  await Deno
    .run({
      cmd: [
        "deno",
        "test",
        "--doc",
        "--check",
        `--allow-read=${cwd}`,
        `--import-map=${importMapPath}`,
        ...files,
      ],
      cwd,
    }).status();
} finally {
  await Deno.remove(importMapPath);
}
