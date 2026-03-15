import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getClient, getAuthenticatedUser } from '../lib/github.js';
import { handleError, truncate } from '../utils/helpers.js';
import { timeAgo, separator } from '../lib/format.js';

export const reviewCommand = new Command('review')
  .description('List pending pull requests — assigned, review requested, and yours')
  .option('-r, --repo <owner/repo>', 'Specific repo (default: all)')
  .action(async (options) => {
    const spinner = ora('Fetching pull requests...').start();

    try {
      const client = getClient();
      const user = await getAuthenticatedUser();
      const username = user.login;

      // Fetch PRs where review is requested
      const reviewRequested = await client.rest.search.issuesAndPullRequests({
        q: `is:pr is:open review-requested:${username}${options.repo ? ` repo:${options.repo}` : ''}`,
        per_page: 20,
        sort: 'updated',
        order: 'desc',
      });

      // Fetch PRs assigned to me
      const assigned = await client.rest.search.issuesAndPullRequests({
        q: `is:pr is:open assignee:${username}${options.repo ? ` repo:${options.repo}` : ''}`,
        per_page: 20,
        sort: 'updated',
        order: 'desc',
      });

      // Fetch my PRs
      const myPrs = await client.rest.search.issuesAndPullRequests({
        q: `is:pr is:open author:${username}${options.repo ? ` repo:${options.repo}` : ''}`,
        per_page: 20,
        sort: 'updated',
        order: 'desc',
      });

      spinner.stop();

      console.log('');
      console.log(chalk.bold(`  PR Dashboard for @${username}`));
      console.log('');

      const formatPr = (item: any) => {
        const repo = item.repository_url?.split('/').slice(-2).join('/') || '';
        const title = truncate(item.title, 55);
        const age = timeAgo(item.created_at);
        const updated = timeAgo(item.updated_at);
        const draft = item.draft ? chalk.gray(' [draft]') : '';
        return `    #${item.number} ${title}${draft}` +
               chalk.gray(` (${repo}) ${age} | updated ${updated}`);
      };

      if (reviewRequested.data.total_count > 0) {
        console.log(chalk.magenta.bold(`  Review Requested (${reviewRequested.data.total_count})`));
        for (const item of reviewRequested.data.items) {
          console.log(formatPr(item));
        }
        console.log('');
      }

      if (assigned.data.total_count > 0) {
        console.log(chalk.blue.bold(`  Assigned to You (${assigned.data.total_count})`));
        for (const item of assigned.data.items) {
          console.log(formatPr(item));
        }
        console.log('');
      }

      if (myPrs.data.total_count > 0) {
        console.log(chalk.green.bold(`  Your PRs (${myPrs.data.total_count})`));
        for (const item of myPrs.data.items) {
          console.log(formatPr(item));
        }
        console.log('');
      }

      const total = reviewRequested.data.total_count + assigned.data.total_count + myPrs.data.total_count;
      if (total === 0) {
        console.log(chalk.gray('  No pending pull requests. You\'re all caught up!'));
        console.log('');
      }

      console.log(separator());
      console.log(chalk.bold(`  ${reviewRequested.data.total_count} to review | ${assigned.data.total_count} assigned | ${myPrs.data.total_count} yours`));
      console.log('');

    } catch (error: unknown) {
      spinner.fail('Failed to fetch PRs');
      handleError(error);
    }
  });
