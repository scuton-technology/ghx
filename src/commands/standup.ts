import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import dayjs from 'dayjs';
import { getClient, getAuthenticatedUser } from '../lib/github.js';
import { handleError } from '../utils/helpers.js';

export const standupCommand = new Command('standup')
  .description('What did you do since yesterday? Commits, PRs, reviews, issues')
  .option('-u, --user <username>', 'GitHub username (default: authenticated user)')
  .option('-d, --days <number>', 'Look back N days', '1')
  .option('-r, --repo <owner/repo>', 'Specific repo (default: all repos)')
  .action(async (options) => {
    const spinner = ora('Fetching your activity...').start();

    try {
      const client = getClient();
      const days = parseInt(options.days);
      const since = dayjs().subtract(days, 'day').startOf('day').toISOString();

      let username = options.user;
      if (!username) {
        const user = await getAuthenticatedUser();
        username = user.login;
      }

      const { data: events } = await client.rest.activity.listEventsForAuthenticatedUser({
        username,
        per_page: 100,
      });

      let recentEvents = events.filter(e =>
        dayjs(e.created_at).isAfter(since)
      );

      if (options.repo) {
        recentEvents = recentEvents.filter(e => e.repo.name === options.repo);
      }

      const pushEvents = recentEvents.filter(e => e.type === 'PushEvent');
      const prEvents = recentEvents.filter(e => e.type === 'PullRequestEvent');
      const reviewEvents = recentEvents.filter(e => e.type === 'PullRequestReviewEvent');
      const issueEvents = recentEvents.filter(e => e.type === 'IssuesEvent');

      spinner.stop();

      console.log('');
      console.log(chalk.bold(`  Standup for @${username}`));
      console.log(chalk.gray(`  Since ${dayjs(since).format('MMM D, YYYY h:mm A')}`));
      console.log('');

      if (pushEvents.length > 0) {
        console.log(chalk.cyan.bold('  Commits'));
        const commits: { repo: string; message: string; sha: string }[] = [];
        for (const event of pushEvents) {
          const payload = event.payload as any;
          const repo = event.repo.name;
          for (const commit of (payload.commits || [])) {
            commits.push({ repo, message: commit.message.split('\n')[0], sha: commit.sha.slice(0, 7) });
          }
        }
        for (const c of commits.slice(0, 20)) {
          console.log(chalk.gray(`    ${c.sha}`) + ` ${c.message}` + chalk.gray(` (${c.repo})`));
        }
        if (commits.length > 20) {
          console.log(chalk.gray(`    ... and ${commits.length - 20} more`));
        }
        console.log('');
      }

      if (prEvents.length > 0) {
        console.log(chalk.green.bold('  Pull Requests'));
        for (const event of prEvents) {
          const payload = event.payload as any;
          const action = payload.action;
          const title = payload.pull_request?.title;
          const number = payload.pull_request?.number;
          const icon = action === 'opened' ? '+' : action === 'closed' ? 'x' : '~';
          console.log(`    ${icon} #${number} ${title}` + chalk.gray(` (${event.repo.name})`));
        }
        console.log('');
      }

      if (reviewEvents.length > 0) {
        console.log(chalk.magenta.bold('  Reviews'));
        for (const event of reviewEvents) {
          const payload = event.payload as any;
          const title = payload.pull_request?.title;
          const number = payload.pull_request?.number;
          console.log(`    > #${number} ${title}` + chalk.gray(` (${event.repo.name})`));
        }
        console.log('');
      }

      if (issueEvents.length > 0) {
        console.log(chalk.yellow.bold('  Issues'));
        for (const event of issueEvents) {
          const payload = event.payload as any;
          const action = payload.action;
          const title = payload.issue?.title;
          const number = payload.issue?.number;
          const icon = action === 'opened' ? '+' : 'x';
          console.log(`    ${icon} #${number} ${title}` + chalk.gray(` (${event.repo.name})`));
        }
        console.log('');
      }

      if (recentEvents.length === 0) {
        console.log(chalk.gray('  No activity found. Enjoy your day off!'));
      }

      const totalCommits = pushEvents.reduce((sum, e) => sum + ((e.payload as any).commits?.length || 0), 0);
      console.log(chalk.gray('  ' + '-'.repeat(40)));
      console.log(chalk.bold('  Summary: ') + `${totalCommits} commits, ${prEvents.length} PRs, ${reviewEvents.length} reviews, ${issueEvents.length} issues`);
      console.log('');

    } catch (error: unknown) {
      spinner.fail('Failed to fetch activity');
      handleError(error);
    }
  });
