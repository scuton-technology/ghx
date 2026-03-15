import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import dayjs from 'dayjs';
import { getClient, resolveRepo } from '../lib/github.js';
import { handleError, pluralize } from '../utils/helpers.js';
import { separator } from '../lib/format.js';

export const digestCommand = new Command('digest')
  .description('Weekly/daily repository digest — commits, issues, PRs, releases')
  .argument('[repo]', 'owner/repo (default: current directory)')
  .option('-d, --days <number>', 'Look back N days', '7')
  .action(async (repoArg: string | undefined, options) => {
    const spinner = ora('Building digest...').start();

    try {
      const client = getClient();
      const { owner, repo } = await resolveRepo(repoArg);
      const days = parseInt(options.days);
      const since = dayjs().subtract(days, 'day').toISOString();

      const [repoData, commits, issuesOpened, issuesClosed, pulls, releases] = await Promise.all([
        client.rest.repos.get({ owner, repo }),
        client.rest.repos.listCommits({ owner, repo, since, per_page: 100 }),
        client.rest.issues.listForRepo({ owner, repo, state: 'open', since, per_page: 100 }),
        client.rest.issues.listForRepo({ owner, repo, state: 'closed', since, per_page: 100 }),
        client.rest.pulls.list({ owner, repo, state: 'all', sort: 'updated', direction: 'desc', per_page: 50 }),
        client.rest.repos.listReleases({ owner, repo, per_page: 5 }),
      ]);

      const recentPulls = pulls.data.filter(p => dayjs(p.updated_at).isAfter(since));
      const mergedPulls = recentPulls.filter(p => p.merged_at && dayjs(p.merged_at).isAfter(since));
      const openedPulls = recentPulls.filter(p => dayjs(p.created_at).isAfter(since));

      const newIssues = issuesOpened.data.filter(i => !i.pull_request && dayjs(i.created_at).isAfter(since));
      const closedIssues = issuesClosed.data.filter(i => !i.pull_request && dayjs(i.closed_at).isAfter(since));

      const recentReleases = releases.data.filter(r => dayjs(r.published_at).isAfter(since));

      // Unique contributors
      const contributors = new Set<string>();
      for (const c of commits.data) {
        const login = c.author?.login;
        if (login) contributors.add(login);
      }

      spinner.stop();

      const period = days === 1 ? 'Daily' : days === 7 ? 'Weekly' : `${days}-day`;

      console.log('');
      console.log(chalk.bold(`  ${period} Digest: ${owner}/${repo}`));
      console.log(chalk.gray(`  ${dayjs(since).format('MMM D')} - ${dayjs().format('MMM D, YYYY')}`));
      console.log('');

      // Commits
      console.log(chalk.cyan.bold('  Commits'));
      console.log(`    ${pluralize(commits.data.length, 'commit')} by ${pluralize(contributors.size, 'contributor')}`);
      if (commits.data.length > 0) {
        console.log('');
        for (const c of commits.data.slice(0, 10)) {
          const sha = c.sha.slice(0, 7);
          const msg = c.commit.message.split('\n')[0].slice(0, 60);
          const author = c.author?.login || 'unknown';
          console.log(chalk.gray(`    ${sha}`) + ` ${msg}` + chalk.gray(` — ${author}`));
        }
        if (commits.data.length > 10) {
          console.log(chalk.gray(`    ... and ${commits.data.length - 10} more`));
        }
      }
      console.log('');

      // Pull Requests
      console.log(chalk.green.bold('  Pull Requests'));
      console.log(`    ${pluralize(openedPulls.length, 'opened')}, ${pluralize(mergedPulls.length, 'merged')}`);
      if (mergedPulls.length > 0) {
        console.log('');
        for (const pr of mergedPulls.slice(0, 5)) {
          console.log(`    * #${pr.number} ${pr.title}` + chalk.gray(` by @${pr.user?.login}`));
        }
      }
      console.log('');

      // Issues
      console.log(chalk.yellow.bold('  Issues'));
      console.log(`    ${pluralize(newIssues.length, 'opened')}, ${pluralize(closedIssues.length, 'closed')}`);
      if (newIssues.length > 0) {
        console.log('');
        for (const issue of newIssues.slice(0, 5)) {
          console.log(`    + #${issue.number} ${issue.title}`);
        }
      }
      console.log('');

      // Releases
      if (recentReleases.length > 0) {
        console.log(chalk.magenta.bold('  Releases'));
        for (const rel of recentReleases) {
          console.log(`    ${rel.tag_name} ${rel.name || ''}` + chalk.gray(` — ${dayjs(rel.published_at).format('MMM D')}`));
        }
        console.log('');
      }

      // Contributors
      if (contributors.size > 0) {
        console.log(chalk.blue.bold('  Active Contributors'));
        console.log(`    ${[...contributors].join(', ')}`);
        console.log('');
      }

      console.log(separator());
      console.log(chalk.bold(`  ${commits.data.length} commits | ${mergedPulls.length} merged PRs | ${closedIssues.length} closed issues`));
      console.log('');

    } catch (error: unknown) {
      spinner.fail('Failed to build digest');
      handleError(error);
    }
  });
