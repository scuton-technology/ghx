import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import dayjs from 'dayjs';
import { getClient, resolveRepo } from '../lib/github.js';
import { handleError } from '../utils/helpers.js';
import { check, scoreColor, scoreGrade, separator } from '../lib/format.js';

export const healthCommand = new Command('health')
  .description('Repository health score — checks README, LICENSE, CI, activity, and more')
  .argument('[repo]', 'owner/repo (default: current directory)')
  .action(async (repoArg: string | undefined) => {
    const spinner = ora('Checking repository health...').start();

    try {
      const client = getClient();
      const { owner, repo } = await resolveRepo(repoArg);

      const [repoData, communityData] = await Promise.all([
        client.rest.repos.get({ owner, repo }),
        client.rest.repos.getCommunityProfileMetrics({ owner, repo }).catch(() => null),
      ]);

      const r = repoData.data;

      // Check individual files
      const fileChecks = await Promise.all([
        client.rest.repos.getContent({ owner, repo, path: 'README.md' }).then(() => true).catch(() => false),
        client.rest.repos.getContent({ owner, repo, path: 'LICENSE' }).then(() => true).catch(() =>
          client.rest.repos.getContent({ owner, repo, path: 'LICENSE.md' }).then(() => true).catch(() => false)
        ),
        client.rest.repos.getContent({ owner, repo, path: 'CONTRIBUTING.md' }).then(() => true).catch(() => false),
        client.rest.repos.getContent({ owner, repo, path: '.github/workflows' }).then(() => true).catch(() => false),
      ]);

      const [hasReadme, hasLicense, hasContributing, hasCi] = fileChecks;

      // Issues
      const { data: issues } = await client.rest.issues.listForRepo({
        owner,
        repo,
        state: 'open',
        per_page: 100,
      });

      const openIssues = issues.filter(i => !i.pull_request);
      const staleDate = dayjs().subtract(90, 'day');
      const staleIssues = openIssues.filter(i => dayjs(i.updated_at).isBefore(staleDate));

      const lastCommitDate = r.pushed_at;
      const daysSinceCommit = dayjs().diff(dayjs(lastCommitDate), 'day');
      const isActive = daysSinceCommit <= 30;

      const hasDescription = !!r.description && r.description.length > 0;
      const hasTopics = (r.topics || []).length > 0;

      spinner.stop();

      // Calculate score
      let score = 0;
      let maxScore = 0;

      const criteria = [
        { ok: hasReadme, weight: 15, label: 'README.md' },
        { ok: hasLicense, weight: 15, label: 'LICENSE' },
        { ok: hasContributing, weight: 10, label: 'CONTRIBUTING.md' },
        { ok: hasCi, weight: 15, label: 'CI/CD workflows' },
        { ok: isActive, weight: 15, label: `Active (last commit ${daysSinceCommit}d ago)` },
        { ok: staleIssues.length === 0, weight: 10, label: `No stale issues (${staleIssues.length} stale)` },
        { ok: hasDescription, weight: 10, label: 'Repository description' },
        { ok: hasTopics, weight: 10, label: 'Topics/tags' },
      ];

      for (const c of criteria) {
        maxScore += c.weight;
        if (c.ok) score += c.weight;
      }

      const pct = Math.round((score / maxScore) * 100);
      const grade = scoreGrade(pct);
      const color = scoreColor(pct);

      console.log('');
      console.log(chalk.bold(`  Health Report: ${owner}/${repo}`));
      console.log('');

      for (const c of criteria) {
        console.log(check(c.ok, c.label));
      }

      console.log('');
      console.log(separator());
      console.log('');
      console.log(color(`  Score: ${pct}/100 (${grade})`));
      console.log(`  Open issues: ${openIssues.length} (${staleIssues.length} stale)`);
      console.log(`  Stars: ${r.stargazers_count} | Forks: ${r.forks_count}`);
      console.log('');

      if (pct < 70) {
        console.log(chalk.yellow('  Suggestions:'));
        for (const c of criteria) {
          if (!c.ok) {
            console.log(chalk.gray(`    - Add ${c.label}`));
          }
        }
        console.log('');
      }

    } catch (error: unknown) {
      spinner.fail('Failed to check health');
      handleError(error);
    }
  });
