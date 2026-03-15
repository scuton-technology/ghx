import chalk from 'chalk';
import { TokenError } from '../lib/github.js';

export function handleError(error: unknown): never {
  if (error instanceof TokenError) {
    console.error('');
    console.error(chalk.red('  ✗ GitHub token not found'));
    console.error('');
    console.error(chalk.gray('  Set one of these environment variables:'));
    console.error(chalk.white('    export GITHUB_TOKEN=ghp_your_token_here'));
    console.error(chalk.white('    export GH_TOKEN=ghp_your_token_here'));
    console.error('');
    console.error(chalk.gray('  Create a token at: https://github.com/settings/tokens'));
    console.error('');
    process.exit(1);
  }

  if (error instanceof Error) {
    const msg = error.message;
    if (msg.includes('Not Found') || (error as any).status === 404) {
      console.error(chalk.red('\n  ✗ Repository not found. Check the owner/repo name.\n'));
    } else if ((error as any).status === 403) {
      console.error(chalk.red('\n  ✗ Rate limit exceeded or insufficient permissions.\n'));
    } else {
      console.error(chalk.red(`\n  ✗ ${msg}\n`));
    }
  } else {
    console.error(chalk.red('\n  ✗ An unexpected error occurred.\n'));
  }
  process.exit(1);
}

export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural || singular + 's'}`;
}

export function bar(value: number, max: number, width: number = 20): string {
  const filled = Math.round((value / max) * width);
  return chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(width - filled));
}
