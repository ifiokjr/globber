# globber

> Include and excludes files and directories from a deep search of the provided root directory.

## Why?

`deno` already has a great `walk` function as part of it's std library. This module adds a few helpful features:

- Support arrays of globs

```ts
import { globber } from "https://deno.land/x/globber@0.1.0/mod.ts";

const iterator = globber({
  cwd: import.meta.url,
  include: ["**/*.ts", "**/*.js"],
  exclude: ["**/node_modules/**"],
});
```

- Support negatable globs using the `!` prefix

```ts
import { globber } from "https://deno.land/x/globber@0.1.0/mod.ts";

const iterator = globber({
  cwd: import.meta.url,
  include: ["!**/ignored.js", "**/*.js"],
  exclude: ["**/node_modules/**"],
});
```

- Support regex patterns and predicates which return true to indicate a match.

```ts
import { globber } from "https://deno.land/x/globber@0.1.0/mod.ts";

const iterator = globber({
  cwd: import.meta.url,
  include: [/\.js$/, (path) => path.endsWith(".ts")],
});
```

## Usage

This is a `deno` module which uses async iterators to lazily evaluate all matching files and directories.

```ts
import { globber } from "https://deno.land/x/globber@0.1.0/mod.ts";

const iterator = globber({
  cwd: import.meta.url,
  include: ["**/*.ts", "**/*.js"],
  exclude: ["**/node_modules/**"],
});

for await (const entry of iterator) {
  if (entry.isDirectory) {
    console.log("directory", entry.absolute);
  } else if (entry.isFile) {
    console.log("file", entry.absolute);
  }

  if (entry.isSymlink) {
    console.log("symlink", entry.absolute);
    break; // break early is supported
  }
}
```

More documentation is to come. I'm working on a tool that generates readable documentation from the source code. It's not ready yet, but it's coming soon.

## Contributing

To contribute first update your cache with

```bash
deno task lock
```

This both generates the lockfile and makes sure the same cache is used for all contributors.

To check that all you code is working as expected, run:

```bash
deno task check
```

This will test, lint and check that formatting is correct.

_created with [`scaffold`](https://github.com/ifiokjr/scaffold)_
