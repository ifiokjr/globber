import { normalizePath } from "../mod.ts";
import { assertEquals, describe, it } from "./deps.ts";

describe("normalizePath", function () {
  it("should always return a single forward slash", function () {
    assertEquals(normalizePath("/"), "/");
    assertEquals(normalizePath("/", true), "/");

    assertEquals(normalizePath("\\"), "/");
    assertEquals(normalizePath("\\", true), "/");
  });
});

describe("`stripTrailing=true`", function () {
  const units = [
    ["../../foo/bar", "../../foo/bar"],
    ["..\\..\\foo/bar", "../../foo/bar"],
    ["..\\\\..\\\\foo/bar", "../../foo/bar"],
    ["//foo/bar\\baz", "/foo/bar/baz"],
    ["//foo\\bar\\baz", "/foo/bar/baz"],
    ["/user/docs/Letter.txt", "/user/docs/Letter.txt"],
    ["\\?\\C:\\user\\docs\\Letter.txt", "/?/C:/user/docs/Letter.txt"],
    [
      "\\?\\UNC\\Server01\\user\\docs\\Letter.txt",
      "/?/UNC/Server01/user/docs/Letter.txt",
    ],
    ["\\\\.\\CdRomX", "//./CdRomX"],
    ["\\\\.\\PhysicalDiskX", "//./PhysicalDiskX"],
    ["\\\\?\\C:\\user\\docs\\Letter.txt", "//?/C:/user/docs/Letter.txt"],
    [
      "\\\\?\\UNC\\Server01\\user\\docs\\Letter.txt",
      "//?/UNC/Server01/user/docs/Letter.txt",
    ],
    ["\\Server01\\user\\docs\\Letter.txt", "/Server01/user/docs/Letter.txt"],
    ["C:\\user\\docs\\Letter.txt", "C:/user/docs/Letter.txt"],
    [
      "C:\\user\\docs\\somefile.ext:alternate_stream_name",
      "C:/user/docs/somefile.ext:alternate_stream_name",
    ],
    ["C:Letter.txt", "C:Letter.txt"],
    ["E://foo//bar//baz", "E:/foo/bar/baz"],
    ["E://foo//bar//baz//", "E:/foo/bar/baz"],
    ["E://foo//bar//baz//////", "E:/foo/bar/baz"],
    ["E://foo/bar\\baz", "E:/foo/bar/baz"],
    ["E://foo\\bar\\baz", "E:/foo/bar/baz"],
    ["E:/foo/bar/baz/", "E:/foo/bar/baz"],
    ["E:/foo/bar/baz///", "E:/foo/bar/baz"],
    ["E:\\\\foo/bar\\baz", "E:/foo/bar/baz"],
    ["foo\\bar\\baz", "foo/bar/baz"],
    ["foo\\bar\\baz\\", "foo/bar/baz"],
    ["foo\\bar\\baz\\\\\\", "foo/bar/baz"],
  ] as const;

  for (const [input, expected] of units) {
    it(`should normalizePath ${input}`, function () {
      assertEquals(normalizePath(input), expected);
    });
  }
});

describe("`stripTrailing=false`", function () {
  const units = [
    ["\\", "/"],
    ["foo\\bar\\baz\\", "foo/bar/baz/"],
    ["foo\\\\bar\\\\baz\\\\", "foo/bar/baz/"],
    ["foo//bar//baz//", "foo/bar/baz/"],
    ["foo/bar/baz/", "foo/bar/baz/"],
    ["./foo/bar/baz/", "./foo/bar/baz/"],
  ] as const;

  for (const [input, expected] of units) {
    it(`should normalizePath ${input}`, function () {
      assertEquals(normalizePath(input, false), expected);
    });
  }
});
