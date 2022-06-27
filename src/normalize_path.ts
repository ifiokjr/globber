/**
 * Normalize slashes in a file path to be posix/unix-like forward slashes. Also
 * condenses repeat slashes to a single slash and removes and trailing slashes,
 * unless disabled.
 *
 * Adapted from https://github.com/jonschlinkert/normalize-path
 */
export function normalizePath(path: string, stripTrailing = true) {
  if (path === "\\" || path === "/") {
    return "/";
  }

  if (path.length <= 1) {
    return path;
  }

  let prefix = "";

  // Check for and extended length path name e.g. "\\?\"
  if (path.length > 4 && UNC.has(path.slice(0, 4))) {
    path = path.slice(2);
    prefix = "//";
  }

  const segments = path.split(/[/\\]+/);

  if (stripTrailing !== false && segments.at(-1) === "") {
    segments.pop();
  }

  return prefix + segments.join("/");
}

const UNC = new Set(["\\\\?\\", "\\\\.\\"]);
