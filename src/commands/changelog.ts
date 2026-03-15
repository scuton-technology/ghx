import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { writeFileSync } from 'fs';
import dayjs from 'dayjs';
import { getClient, resolveRepo } from '../lib/github.js';
import { handleError } from '../utils/helpers.js';

interface ChangeEntry {
  type: string;
  scope?: string;
  message: string;
  sha: string;
  author: string;
}

function categorize(message: string): ChangeEntry {
  const sha = '';
  const author = '';
  const conventionalMatch = message.match(/^(\w+)(?:\(([^)]+)\))?(!)?:\s*(.+)/);
  if (conventionalMatch) {
    return {
      type: conventionalMatch[1],
      scope: conventionalMatch[2],
      message: conventionalMatch[4],
      sha,
      author,
    };
  }
  // Fallback: try to guess from keywords
  const lower = message.toLowerCase();
  if (lower.startsWith('fix') || lower.includes('bugfix')) return { type: 'fix', message, sha, author };
  if (lower.startsWith('add') || lower.includes('feature')) return { type: 'feat', message, sha, author };
  if (lower.startsWith('doc') || lower.includes('readme')) return { type: 'docs', message, sha, author };
  return { type: 'other', message, sha, author };
}

const TYPE_LABELS: Record<string, string> = {
  feat: 'Features',
  fix: 'Bug Fixes',
  docs: 'Documentation',
  refactor: 'Refactoring',
  perf: 'Performance',
  test: 'Tests',
  ci: 'CI/CD',
  chore: 'Chores',
  style: 'Style',
  build: 'Build',
  other: 'Other Changes',
};

export const changelogCommand = new Command('changelog')
  .description('Generate changelog from commits between tags')
  .argument('[repo]', 'owner/repo (default: current directory)')
  .option('-f, --from <tag>', 'From tag (default: previous tag)')
  .option('-t, --to <tag>', 'To tag (default: HEAD)')
  .option('-o, --output <file>', 'Write to file (e.g. CHANGELOG.md)')
  .action(async (repoArg: string | undefined, options) => {
    const spinner = ora('Generating changelog...').start();

    try {
      const client = getClient();
      const { owner, repo } = await resolveRepo(repoArg);

      // Get tags
      const { data: tags } = await client.rest.repos.listTags({ owner, repo, per_page: 10 });

      if (tags.length === 0) {
        spinner.stop();
        console.log(chalk.yellow('\n  No tags found. Showing last 30 commits instead.\n'));
      }

      let base: string | undefined;
      let head: string | undefined;

      if (options.from) {
        base = options.from;
      } else if (tags.length >= 2) {
        base = tags[1].name;
      }

      if (options.to) {
        head = options.to;
      } else if (tags.length >= 1) {
        head = tags[0].name;
      }

      let commits;
      if (base && head) {
        const { data: comparison } = await client.rest.repos.compareCommits({
          owner,
          repo,
          base,
          head,
        });
        commits = comparison.commits;
      } else {
        const { data } = await client.rest.repos.listCommits({ owner, repo, per_page: 30 });
        commits = data;
        head = head || 'HEAD';
        base = base || 'initial';
      }

      spinner.stop();

      // Categorize commits
      const entries: ChangeEntry[] = commits.map(c => {
        const msg = c.commit.message.split('\n')[0];
        const entry = categorize(msg);
        entry.sha = c.sha.slice(0, 7);
        entry.author = c.author?.login || c.commit.author?.name || 'unknown';
        return entry;
      });

      // Group by type
      const groups: Record<string, ChangeEntry[]> = {};
      for (const entry of entries) {
        if (!groups[entry.type]) groups[entry.type] = [];
        groups[entry.type].push(entry);
      }

      // Build output
      const lines: string[] = [];
      const title = `## ${head || 'Unreleased'}${base ? ` (since ${base})` : ''} — ${dayjs().format('YYYY-MM-DD')}`;
      lines.push(title);
      lines.push('');

      const typeOrder = ['feat', 'fix', 'perf', 'refactor', 'docs', 'test', 'ci', 'build', 'chore', 'style', 'other'];
      for (const type of typeOrder) {
        const items = groups[type];
        if (!items) continue;
        lines.push(`### ${TYPE_LABELS[type] || type}`);
        for (const item of items) {
          const scope = item.scope ? `**${item.scope}:** ` : '';
          lines.push(`- ${scope}${item.message} (\`${item.sha}\` by @${item.author})`);
        }
        lines.push('');
      }

      const output = lines.join('\n');

      // Print to terminal
      console.log('');
      for (const line of lines) {
        if (line.startsWith('## ')) {
          console.log(chalk.bold(`  ${line}`));
        } else if (line.startsWith('### ')) {
          console.log(chalk.cyan(`  ${line}`));
        } else if (line.startsWith('- ')) {
          console.log(`  ${line}`);
        } else {
          console.log(line);
        }
      }

      // Write to file if requested
      if (options.output) {
        writeFileSync(options.output, output);
        console.log(chalk.green(`  Written to ${options.output}`));
        console.log('');
      }

    } catch (error: unknown) {
      spinner.fail('Failed to generate changelog');
      handleError(error);
    }
  });
