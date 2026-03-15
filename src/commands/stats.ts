import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import dayjs from 'dayjs';
import { getClient, resolveRepo } from '../lib/github.js';
import { bar, handleError, pluralize } from '../utils/helpers.js';
import { separator } from '../lib/format.js';

export const statsCommand = new Command('stats')
  .description('Repository statistics — commits, contributors, languages, top authors')
  .argument('[repo]', 'owner/repo (default: current directory)')
  .action(async (repoArg: string | undefined) => {
    const spinner = ora('Fetching repository stats...').start();

    try {
      const client = getClient();
      const { owner, repo } = await resolveRepo(repoArg);

      const [repoData, contributorsData, languagesData, commitsPage] = await Promise.all([
        client.rest.repos.get({ owner, repo }),
        client.rest.repos.listContributors({ owner, repo, per_page: 10 }).catch(() => ({ data: [] })),
        client.rest.repos.listLanguages({ owner, repo }),
        client.rest.repos.listCommits({ owner, repo, per_page: 5 }),
      ]);

      const r = repoData.data;
      const contributors = contributorsData.data;
      const languages = languagesData.data;
      const recentCommits = commitsPage.data;

      // Participation stats (weekly commits for last year)
      let weeklyAvg = 0;
      try {
        const { data: participation } = await client.rest.repos.getParticipationStats({ owner, repo });
        const allWeeks = participation.all || [];
        const nonZero = allWeeks.filter(w => w > 0);
        weeklyAvg = nonZero.length > 0 ? Math.round(nonZero.reduce((a, b) => a + b, 0) / nonZero.length) : 0;
      } catch {
        // Stats may not be ready
      }

      spinner.stop();

      const age = dayjs().diff(dayjs(r.created_at), 'month');
      const ageStr = age >= 12 ? `${Math.floor(age / 12)}y ${age % 12}m` : `${age}m`;

      console.log('');
      console.log(chalk.bold(`  ${owner}/${repo}`));
      if (r.description) console.log(chalk.gray(`  ${r.description}`));
      console.log('');

      console.log(chalk.cyan.bold('  Overview'));
      console.log(`    Stars: ${chalk.yellow(String(r.stargazers_count))}  Forks: ${chalk.blue(String(r.forks_count))}  Watchers: ${r.subscribers_count}`);
      console.log(`    Age: ${ageStr}  Size: ${(r.size / 1024).toFixed(1)} MB  Default branch: ${r.default_branch}`);
      console.log(`    Open issues: ${r.open_issues_count}  License: ${r.license?.spdx_id || 'None'}`);
      if (weeklyAvg > 0) console.log(`    Avg weekly commits: ${weeklyAvg}`);
      console.log('');

      // Languages
      if (Object.keys(languages).length > 0) {
        console.log(chalk.cyan.bold('  Languages'));
        const total = Object.values(languages).reduce((a, b) => a + b, 0);
        const sorted = Object.entries(languages).sort((a, b) => b[1] - a[1]);
        for (const [lang, bytes] of sorted.slice(0, 8)) {
          const pct = ((bytes / total) * 100).toFixed(1);
          console.log(`    ${bar(bytes, total, 15)} ${pct}% ${lang}`);
        }
        console.log('');
      }

      // Top contributors
      if (Array.isArray(contributors) && contributors.length > 0) {
        console.log(chalk.cyan.bold('  Top Contributors'));
        const maxContribs = contributors[0]?.contributions || 1;
        for (const c of contributors.slice(0, 5)) {
          console.log(`    ${bar(c.contributions!, maxContribs, 10)} ${c.contributions} ${c.login}`);
        }
        console.log('');
      }

      // Recent commits
      if (recentCommits.length > 0) {
        console.log(chalk.cyan.bold('  Recent Commits'));
        for (const c of recentCommits) {
          const sha = c.sha.slice(0, 7);
          const msg = c.commit.message.split('\n')[0].slice(0, 60);
          const author = c.author?.login || c.commit.author?.name || 'unknown';
          const date = dayjs(c.commit.author?.date).format('MMM D');
          console.log(chalk.gray(`    ${sha}`) + ` ${msg}` + chalk.gray(` — ${author}, ${date}`));
        }
        console.log('');
      }

      console.log(separator());
      console.log(chalk.bold(`  ${pluralize(r.stargazers_count, 'star')} | ${pluralize(r.forks_count, 'fork')} | ${pluralize(Array.isArray(contributors) ? contributors.length : 0, 'contributor')}`));
      console.log('');

    } catch (error: unknown) {
      spinner.fail('Failed to fetch stats');
      handleError(error);
    }
  });
