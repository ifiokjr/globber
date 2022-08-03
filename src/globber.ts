import {
  createMatcher,
  CreateMatcherProps,
  Match,
  MatchFunction,
} from "./create_matcher.ts";
import { path } from "./deps.ts";
import { GlobError } from "./errors.ts";
import { getPath } from "./get_path.ts";
import { normalize, normalizeDirectory, removeUndefined } from "./utils.ts";

export interface GlobberProps extends CreateMatcherProps, BaseGlobberProps {
  /**
   * The search will be resolved from this directory and relative paths in the
   * GlobEntry are relative to this path.
   *
   * @default process.cwd()
   */
  cwd?: string | URL | undefined;

  /**
   * Provide matchers to match by the file / directory name relative to the
   * `cwd`.
   *
   * If left undefined, all files and directories will be matched. This is the
   * equivalent of setting
   *
   * ```ts
   * matches: ['**']
   * ```
   *
   * In order to ignore files lead the glob with a `!`.
   *
   * ```ts
   * matches: ['!node_modules/**', '**']
   * ```
   *
   * The above will ignore all files and directories in the `node_modules`
   * directory.
   *
   * @default ['**']
   */
  include?: Match | Match[] | undefined;

  /**
   * Any matching patterns will be excluded from the results.
   *
   * @default []
   */
  exclude?: Match | Match[] | undefined;
}

/**
 * This produces an async iterable for searching through the provided patterns
 * relative to the `cwd`. If `cwd` is left blank then it defaults to `Deno.cwd()`.
 *
 * ```ts
 * import { globber } from 'https://deno.land/x/globber/mod.ts';
 *
 * for await (const entry of globber({ extensions: ['.jsonc', '.json'] })) {
 *   const contents = await Deno.readTextFile(entry.absolute);
 *   const json = JSON.parse(contents);
 *
 *   if (json.name === "amazing") {
 *     // do something
 *     break;
 *   }
 * }
 * ```
 */
export async function* globber(
  options: GlobberProps,
): AsyncGenerator<GlobEntry, void, unknown> {
  Deno.readTextFile;
  const props = { ...DEFAULT_OPTIONS, ...removeUndefined(options) };
  const cwd = getPath(props.cwd);
  const includer = createMatcher(props.include, props);
  const excluder = createMatcher(props.exclude, props);
  const extra = { cwd, includer, excluder };
  const directory = normalizeDirectory(cwd);

  if (props.excludeDirectories && props.excludeFiles) {
    throw new GlobError(cwd, "Cannot exclude both directories and files");
  }

  yield* walkDirectory(directory, props.maxDepth, { ...props, ...extra });
}

const DEFAULT_OPTIONS: Required<GlobberProps> = {
  include: ["**/*"],
  exclude: [],
  extensions: null,
  cwd: Deno.cwd(),
  maxDepth: Number.POSITIVE_INFINITY,
  excludeFiles: false,
  excludeDirectories: false,
  followSymlinks: true,
  dot: false,
  junk: false,
  disableGlobExpansion: false,
  disableNegation: false,
  emptyDirectories: false,
  trailingSlash: true,
  caseInsensitive: false,
  disableExtendedGlobbing: false,
};

/**
 * Create WalkEntry for the `path` asynchronously
 */
async function createGlobEntry(
  absolute: string,
  cwd: string,
  trailingSlash?: boolean | undefined,
): Promise<GlobEntry> {
  absolute = normalize(absolute);
  const { isDirectory, isFile, isSymlink } = await Deno.stat(absolute);
  absolute = isDirectory
    ? normalizeDirectory(absolute, trailingSlash)
    : absolute;
  const name = isDirectory
    ? normalizeDirectory(path.basename(absolute), trailingSlash)
    : path.basename(absolute);
  const relative = isDirectory
    ? normalizeDirectory(path.relative(cwd, absolute), trailingSlash)
    : path.relative(cwd, absolute);

  return { absolute, relative, name, isFile, isDirectory, isSymlink };
}

interface ShouldExcludeProps {
  path: string;
  includer?: MatchFunction | undefined;
  excluder?: MatchFunction | undefined;
}

/**
 * Determine whether an entry should be excluded from the results.
 */
function shouldInclude(props: ShouldExcludeProps): boolean {
  if (props.excluder?.(props.path) === true) {
    return false;
  }

  return props.includer?.(props.path) !== false;
}

export interface GlobEntry extends Deno.DirEntry {
  /**
   * The basename of the entry.
   */
  name: string;

  /**
   * The absolute path to the entry.
   */
  absolute: string;

  /**
   * The path relative to the provided `cwd` or default `Deno.cwd()`.
   */
  relative: string;
}

interface WalkDirectoryOptions extends Required<BaseGlobberProps> {
  includer: MatchFunction;
  excluder: MatchFunction;
  cwd: string;
}

async function* walkDirectory(
  root: string,
  depth: number,
  options: WalkDirectoryOptions,
): AsyncGenerator<GlobEntry, void> {
  if (depth < 0) {
    return;
  }

  const relativeDirectory = path.relative(options.cwd, root);

  const includeProps = {
    excluder: options.excluder,
    includer: options.includer,
  };

  if (
    !options.excludeDirectories &&
    shouldInclude({ path: relativeDirectory, ...includeProps })
  ) {
    yield await createGlobEntry(root, options.cwd, options.trailingSlash);
  }

  if (
    depth < 1 ||
    !shouldInclude({ path: root, excluder: options.excluder })
  ) {
    return;
  }

  try {
    for await (const entry of Deno.readDir(root)) {
      let resolvedRoot = path.resolve(root, entry.name);
      let relativeRoot = path.relative(options.cwd, resolvedRoot);
      let { isSymlink, isDirectory } = entry;

      if (isSymlink) {
        if (!options.followSymlinks) {
          continue;
        }

        resolvedRoot = await Deno.realPath(resolvedRoot);
        relativeRoot = path.relative(options.cwd, resolvedRoot);
        ({ isSymlink, isDirectory } = await Deno.lstat(resolvedRoot));
      }

      if (isSymlink || isDirectory) {
        yield* walkDirectory(resolvedRoot, depth - 1, options);
      } else if (
        !options.excludeFiles &&
        shouldInclude({ path: relativeRoot, ...includeProps })
      ) {
        yield {
          name: path.basename(resolvedRoot),
          absolute: resolvedRoot,
          relative: relativeRoot,
          isDirectory: false,
          isSymlink: false,
          isFile: true,
        };
      }
    }
  } catch (error) {
    throw GlobError.wrap(error, root);
  }
}

interface BaseGlobberProps {
  /**
   * Use this to limit the maximum depth `globber` will crawl to before
   * stopping.
   *
   * > By default, `globber` crawls recursively until the last directory.
   *
   * @default Infinity
   */
  maxDepth?: number | undefined;

  /**
   * Use this to resolve and recurse over all symlinks.
   *
   * > NOTE: This will affect crawling performance so use only if required.
   *
   * @default false
   */
  followSymlinks?: boolean | undefined;

  /**
   * Use this to exclude directories from the output. Useful if you only want to
   * display files. Using both `excludeFiles` and `excludeDirectories` will
   * result in an error.
   *
   * @default false
   */
  excludeDirectories?: boolean | undefined;

  /**
   * Whether to exclude files from the output. Useful if you only want to find
   * the directories. Using both `excludeFiles` and `excludeDirectories` will
   * result in an error.
   *
   * @default false
   */
  excludeFiles?: boolean | undefined;

  /**
   * Mark directories with a trailing slash.
   *
   * @default true
   */
  trailingSlash?: boolean | undefined;

  /**
   * Match empty directories. This is not active when `onlyFiles` is `true`.
   */
  emptyDirectories?: boolean | undefined;
}
