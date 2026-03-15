<p align="center">
  <pre align="center">
                          _
   __ _ _ __  _   _| |___  ___
  / _` | '_ \| | | | / __|/ _ \
 | (_| | |_) | |_| | \__ \  __/
  \__, | .__/ \__,_|_|___/\___|
   __/ | |
  |___/|_|   The Missing GitHub CLI Toolkit
  </pre>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/git-pulse"><img src="https://img.shields.io/npm/v/git-pulse.svg" alt="npm version"></a>
  <a href="https://github.com/scuton-technology/ghx/actions"><img src="https://github.com/scuton-technology/ghx/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://github.com/scuton-technology/ghx/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/git-pulse.svg" alt="license"></a>
</p>

---

**gpulse** gives you the GitHub insights you actually need — right in your terminal. Standup reports, repo stats, changelogs, health checks, PR reviews, and digests. No browser required.

## Install

```bash
npm install -g @sabahattinkalkan/gpulse
```

## Setup

Set your GitHub token (create one at [github.com/settings/tokens](https://github.com/settings/tokens)):

```bash
export GITHUB_TOKEN=ghp_your_token_here
```

## Commands

### `gpulse standup`

What did you do since yesterday? Shows commits, PRs, reviews, and issues.

```bash
gpulse standup              # last 24 hours
gpulse standup -d 3         # last 3 days
gpulse standup -u octocat   # specific user
```

### `gpulse stats <owner/repo>`

Repository statistics — stars, forks, languages, top contributors.

```bash
gpulse stats facebook/react
gpulse stats                # current repo
```

### `gpulse changelog`

Auto-generate changelog from commits between tags.

```bash
gpulse changelog                     # last 2 tags
gpulse changelog --from v1.0 --to v2.0
gpulse changelog -o CHANGELOG.md     # write to file
```

### `gpulse health [owner/repo]`

Repository health score (A-F). Checks README, LICENSE, CI, activity, and more.

```bash
gpulse health
gpulse health vercel/next.js
```

### `gpulse review`

Your PR dashboard — review requests, assigned PRs, and your open PRs.

```bash
gpulse review
gpulse review -r owner/repo   # specific repo
```

### `gpulse digest <owner/repo>`

Weekly/daily repository digest — commits, issues, PRs, releases.

```bash
gpulse digest                # current repo, last 7 days
gpulse digest -d 1           # daily digest
gpulse digest rust-lang/rust # specific repo
```

## Requirements

- Node.js >= 18
- GitHub personal access token (`GITHUB_TOKEN` or `GH_TOKEN`)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT - [Scuton Technology](https://scuton.com)
