import { gitUrlParse, readLines, semver } from "./deps.ts";

export async function getTagVersion(cwd = Deno.cwd()): Promise<string> {
  let version = "0.0.0";
  const stdout = Deno.run({ cmd: ["git", "tag"], cwd, stdout: "piped" }).stdout;

  try {
    for await (const line of readLines(stdout)) {
      const cleaned = semver.clean(line) ?? version;
      version = semver.gt(cleaned, version) ? cleaned : version;
    }
  } catch {
    // Do nothing
  }

  return version;
}

/**
 * Read the
 */
export async function getGitHubRemote(cwd = Deno.cwd()): Promise<string> {
  const stdout = await Deno.run({
    cmd: ["git", "remote", "get-url", "origin"],
    cwd,
    stdout: "piped",
  }).output();
  const remote = new TextDecoder().decode(stdout);
  const parsed = gitUrlParse(remote);

  return `https://${parsed.source}/${parsed.full_name}/`;
}

/**
 * Read the first commit in the commit history.
 */
export async function getFirstCommit(cwd = Deno.cwd()) {
  const stdout = await Deno.run({
    cmd: ["git", "rev-list", "--max-parents=0", "HEAD"],
    cwd,
    stdout: "piped",
  }).output();
  const ref = new TextDecoder().decode(stdout);

  return ref.slice(0, 7);
}

export function createTag(
  version: string,
  cwd = Deno.cwd(),
): Promise<Deno.ProcessStatus> {
  if (!semver.valid(version)) {
    throw new Error(`Invalid tag version provided: ${version}`);
  }

  // NOTE: it's important we use the -m flag to create annotated tag otherwise
  // 'git push --follow-tags' won't actually push the tags
  return Deno
    .run({ cmd: ["git", "tag", "version", "-m", version], cwd })
    .status();
}

export const cwd = new URL("..", import.meta.url);
