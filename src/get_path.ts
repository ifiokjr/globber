import { normalize } from "./utils.ts";

/**
 * Get the normalized path of the provided `path | URL`.
 */
export function getPath(filepath: string | URL): string {
  return filepath instanceof URL
    ? filepath.pathname
    : filepath.startsWith("file:")
    ? new URL(filepath).pathname
    : normalize(filepath);
}
