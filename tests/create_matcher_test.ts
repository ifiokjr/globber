import {
  createMatcher,
  CreateMatcherProps,
  MatchPattern,
} from "../src/create_matcher.ts";
import { assertEquals, describe, it } from "./deps.ts";

interface PatternTest {
  input: string;
  pattern: MatchPattern;
  options?: CreateMatcherProps;
  expected: boolean;
  method?: "only" | "ignore";
}

const patterns: Record<string, PatternTest> = {
  "function matcher": {
    input: "awesome.txt",
    pattern: (filename) => filename.endsWith(".txt"),
    expected: true,
  },
  "function matcher fails": {
    input: "hello/awesome.ts",
    pattern: (filepath) => filepath === "awesome.ts",
    expected: false,
  },
  glob: {
    input: "awesome.ts",
    pattern: "*.ts",
    expected: true,
  },
  "glob negation by default": {
    input: "hello/this/is/file.d.ts",
    pattern: ["**/*.ts", "!**/*.d.ts"],
    expected: false,
  },
  "glob negation can be disabled": {
    input: "hello/this/is/file.d.ts",
    pattern: ["**/*.ts", "!**/*.d.ts"],
    expected: true,
    options: { disableNegation: true },
  },

  "glob extension by default": {
    input: "bazbaz.txt",
    pattern: "?(ba[zr]|qux)baz.*",
    expected: true,
  },
  "glob extension can be disabled": {
    input: "bazbaz.txt",
    pattern: "?(ba[zr]|qux)baz.*",
    expected: false,
    options: { disableExtendedGlobbing: true },
  },
  "glob expansion by default": {
    input: "this/is/a/long/file/path.txt",
    pattern: "this/",
    expected: true,
  },
  "glob expansion can be disabled": {
    input: "this/is/a/long/file/path.txt",
    pattern: "this/",
    expected: false,
    options: { disableGlobExpansion: true },
  },
  regex: {
    input: "awesome.ts",
    pattern: /\.ts$/,
    expected: true,
  },
  combined: {
    input: "awesome.ts",
    pattern: ["*.ts", /\.ts$/, (file) => file.endsWith(".ts")],
    expected: true,
  },
};

describe("createMatcher", () => {
  for (const [name, props] of Object.entries(patterns)) {
    const test = props.method ? it[props.method] : it;
    test(name, () => {
      const matcher = createMatcher(props.pattern, props.options);
      assertEquals(matcher(props.input), props.expected);
    });
  }
});
