import { Octokit } from 'octokit';

let octokit: Octokit;

export function getClient(): Octokit {
  if (!octokit) {
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    if (!token) {
      throw new TokenError();
    }
    octokit = new Octokit({ auth: token });
  }
  return octokit;
}

export class TokenError extends Error {
  constructor() {
    super('GitHub token not found. Set GITHUB_TOKEN or GH_TOKEN environment variable.');
    this.name = 'TokenError';
  }
}

export async function getAuthenticatedUser() {
  const client = getClient();
  const { data } = await client.rest.users.getAuthenticated();
  return data;
}

export async function getRepoFromCwd(): Promise<{ owner: string; repo: string } | null> {
  try {
    const { execSync } = await import('child_process');
    const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf-8' }).trim();
    const match = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
    if (match) return { owner: match[1], repo: match[2] };
  } catch {
    // Not a git repo or no remote
  }
  return null;
}

export function parseRepoArg(repoArg?: string): { owner: string; repo: string } | null {
  if (!repoArg) return null;
  const parts = repoArg.split('/');
  if (parts.length === 2) return { owner: parts[0], repo: parts[1] };
  return null;
}

export async function resolveRepo(repoArg?: string): Promise<{ owner: string; repo: string }> {
  const parsed = parseRepoArg(repoArg);
  if (parsed) return parsed;
  const fromCwd = await getRepoFromCwd();
  if (fromCwd) return fromCwd;
  throw new Error('Could not determine repository. Use --repo owner/repo or run inside a git repo.');
}
