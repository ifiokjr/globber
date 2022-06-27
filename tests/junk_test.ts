import { isJunk, isNotJunk } from "../mod.ts";
import { assert, describe, it } from "./deps.ts";

const junk = [
  ".DS_Store",
  ".AppleDouble",
  ".LSOverride",
  "Icon\r",
  "._test",
  ".Spotlight-V100",
  ".Spotlight-V100/Store-V2/C6DBF25D-81D4-4B57-907E-B4A555E72C90/0.directoryStoreFile",
  ".Trashes",
  "__MACOSX",
  "test~",
  "Thumbs.db",
  "ehthumbs.db",
  "Desktop.ini",
  "npm-debug.log",
  "pnpm-debug.log",
  "yarn-debug.log",
  ".test.swp",
  "@eaDir",
];

const notJunk = [
  "test",
  "Icon",
  "Icons.woff",
  ".Spotlight-V100-unicorn",
];

describe("isJunk", () => {
  for (const element of junk) {
    it(`matches ${element}`, () => {
      assert(isJunk(element));
    });
  }
});

describe("isNotJunk", () => {
  for (const element of notJunk) {
    it(`matches ${element}`, () => {
      assert(isNotJunk(element));
    });
  }
});
