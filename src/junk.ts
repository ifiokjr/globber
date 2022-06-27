// Adapted from https://github.com/sindresorhus/junk
const ignoreList = [
  // # All
  "^pnpm-debug\\.log$", // Error log for pnpm
  "^yarn-debug\\.log$", // Error log for yarn
  "^npm-debug\\.log$", // Error log for npm
  "^\\..*\\.swp$", // Swap file for vim state

  // # macOS
  "^\\.DS_Store$", // Stores custom folder attributes
  "^\\.AppleDouble$", // Stores additional file resources
  "^\\.LSOverride$", // Contains the absolute path to the app to be used
  "^Icon\\r$", // Custom Finder icon: http://superuser.com/questions/298785/icon-file-on-os-x-desktop
  "^\\._.*", // Thumbnail
  "^\\.Spotlight-V100(?:$|\\/)", // Directory that might appear on external disk
  "\\.Trashes", // File that might appear on external disk
  "^__MACOSX$", // Resource fork

  // # Linux
  "~$", // Backup file

  // # Windows
  "^Thumbs\\.db$", // Image file cache
  "^ehthumbs\\.db$", // Folder config file
  "^Desktop\\.ini$", // Stores custom folder attributes
  "@eaDir$", // Synology Diskstation "hidden" folder where the server stores thumbnails
];

export const junkRegex = new RegExp(ignoreList.join("|"));

/**
 * Returns `true` if `filename` matches a junk file.
 *
 * Taken from https://github.com/sindresorhus/junk
 *
 * ### Examples
 *
 * This be used to find all junk files in a directory.
 *
 * ```ts
 * import { isJunk } from 'https://deno.land/x/globber@0.0.0/mod.ts';
 *
 * const files: string[] = []
 * const junk: string[] = [];
 *
 * for await (const file of Deno.readDir('some/path')) {
 *   files.push(file.name);
 *
 *   if (isJunk(file.name)) {
 *     junk.push(file.name);
 *   }
 * }
 *
 * console.log(junk);
 * //=> ['.DS_Store']
 *
 * console.log(files);
 * //=> ['test.jpg', '.DS_Store']
 * ```
 */
export function isJunk(filename: string) {
  return junkRegex.test(filename);
}

Deno.readDir;
/**
 * Returns `true` if `filename` does not match a junk file.
 *
 * Taken from https://github.com/sindresorhus/junk
 *
 * ### Examples
 *
 * This be used to find all junk files in a directory.
 *
 * ```ts
 * import { isNotJunk } from 'https://deno.land/x/globber@0.0.0/mod.ts';
 *
 * const files: string[] = []
 * const notJunk: string[] = [];
 *
 * for await (const file of Deno.readDir('some/path')) {
 *   files.push(file.name);
 *
 *   if (isNotJunk(file.name)) {
 *     notJunk.push(file.name);
 *   }
 * }
 *
 * console.log(notJunk);
 * //=> ['test.jpg']
 *
 * console.log(files);
 * //=> ['test.jpg', '.DS_Store']
 * ```
 */
export function isNotJunk(filename: string) {
  return !isJunk(filename);
}
