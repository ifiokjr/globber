import { path } from "./deps.ts";
import { normalizePath } from "./normalize_path.ts";

/**
 * Normalize a path and remove any leading `./` current directory indicator.
 *
 * @param filePath The path to normalize
 * @param [stripTrailing=false] When set to true any trailing slashes will be
 * removed.
 *
 * @returns a normalized path with posix style separators
 */
export function normalize(filePath: string, stripTrailing?: boolean): string {
  return path.normalize(normalizePath(filePath, stripTrailing ?? false));
}

/**
 * Normalize a path as a directory with a trailing slash.
 *
 * @param directory The directory to normalize
 * @param [trailingSlash=true] When set to true a trailing slash will be added.
 */
export function normalizeDirectory(directory: string, trailingSlash = true) {
  return `${normalize(directory, true)}${trailingSlash ? "/" : ""}`;
}

/**
 * Removes all undefined values from an object.
 */
export function removeUndefined<Shape extends object>(
  data: Shape,
): Required<Shape> {
  const transformed = Object.create(null);

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) {
      continue;
    }

    transformed[key] = value;
  }

  return transformed;
}
