import { globToRegExp, isGlob, path } from "./deps.ts";
import { isJunk } from "./junk.ts";

export type MatchFunction = (source: string) => boolean;
export type Match = string | MatchFunction | RegExp;
export type MatchPattern = Match | Match[];

/**
 * Props for creating the matcher function which takes a pathname and returns
 * true when the value matches and false when it doesn't match.
 */
export interface CreateMatcherProps {
  /**
   * When a glob begins with `!` and the glob matches the source, the match will
   * be negated. Set this to `true` to disable the behavior.
   *
   * @default false
   */
  disableNegation?: boolean;

  /**
   * Set to true to prevent expanding a glob pattern when it ends with `/`. An
   * expanded glob pattern transforms `abc/` to `abc/**`.
   *
   * @default false
   */
  disableGlobExpansion?: boolean;

  /**
   * Set to true to make globs case insensitive.
   *
   * @default false
   */
  caseInsensitive?: boolean;

  /**
   * When true will match dot files and folders.
   *
   * @default false
   */
  dot?: boolean;

  /**
   * When true will match junk files
   *
   * @default false
   */
  junk?: boolean;

  /**
   * The extensions that can be matched. Setting this to anything other than an
   * empty array / or null will prevent matches on directories. Unless the
   * directory has an extension.
   *
   * @default undefined
   *
   * ### Examples
   *
   * Extensions can be defined with the `.` prefix or not. Both will work.
   *
   * ```ts
   * const options = { extensions: [".ts", ".js"] };
   * const optionsWithoutPrefix = { extensions: ["ts", "js"] };
   * ```
   */
  extensions?: string[] | null | undefined;

  /**
   * Extended globbing as described by the [bash man
   * page](https://www.linuxjournal.com/content/bash-extended-globbing) as the
   * following.
   *
   * ```bash
   * ?(pattern-list)   Matches zero or one occurrence of the given patterns
   * *(pattern-list)   Matches zero or more occurrences of the given patterns
   * +(pattern-list)   Matches one or more occurrences of the given patterns
   * @(pattern-list)   Matches one of the given patterns
   * !(pattern-list)   Matches anything except one of the given patterns
   * ```
   *
   * Here a pattern-list is a list of items separated by a vertical bar "|" (aka
   * the pipe symbol). If you look at these you can see why the leading
   * character was chosen as it matches what is used in regular expression
   * syntax.
   *
   * ```markup
   * Bash              Regular Expression
   * ?(pattern-list)   (...|...)?
   * *(pattern-list)   (...|...)*
   * +(pattern-list)   (...|...)+
   * @(pattern-list)   (...|...)    [@ not a RE syntax]
   * !(pattern-list)   "!" used as for negative assertions in RE syntax
   * ```
   *
   * You can disable this type of globbing by setting this to `false`.
   *
   * @default false
   */
  disableExtendedGlobbing?: boolean | undefined;
}

/**
 * Transform a pattern into a matching function.
 *
 * ### Examples
 *
 * ```ts
 */
export function createMatcher(
  pattern: MatchPattern,
  options: CreateMatcherProps = {},
): MatchFunction {
  const {
    disableNegation = false,
    disableGlobExpansion = false,
    disableExtendedGlobbing = false,
  } = options;
  const matchers = Array.isArray(pattern) ? pattern : [pattern].filter(Boolean);

  return (source) => {
    if (
      // Exit early if no matchers are provided.
      matchers.length === 0 ||
      // Exit early if the source is a dot file / folder.
      (
        !options.dot &&
        source.split(path.sep).some((part) => part.startsWith("."))
      ) ||
      // Exit early if the source is a junk file / folder.
      (
        !options.junk && (isJunk(source) || isJunk(path.basename(source)))
      ) ||
      // Exit early if not a valid extension.
      (
        options.extensions &&
        !options.extensions.some((extension) => source.endsWith(extension))
      )
    ) {
      return false;
    }

    let anyMatch = false;

    for (const matcher of matchers) {
      let match = false;
      // True when this is a string glob starting with `!`.
      let negated = false;

      if (typeof matcher === "function") {
        match = matcher(source) || match;
      } else {
        let regex: RegExp;

        if (typeof matcher === "string") {
          negated = disableNegation || matcher[0] === "!";
          const glob = `${negated ? matcher.slice(1) : matcher}${
            matcher.endsWith("/") ? (disableGlobExpansion ? "" : "**/*") : ""
          }`;
          regex = globToRegExp(glob, {
            caseInsensitive: options.caseInsensitive,
            extended: !disableExtendedGlobbing,
          });
        } else {
          regex = matcher;
        }

        match = regex.test(source) || match;
      }

      if (match && disableNegation) {
        // exit early when a match is found and if negated return false.
        return true;
      }

      if (match && negated) {
        return false;
      }
      anyMatch = match || anyMatch;
    }

    return anyMatch;
  };
}
