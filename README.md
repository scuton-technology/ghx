<div align="center">

```
                     _
   __ _ _ __  _   _| |___  ___
  / _` | '_ \| | | | / __|/ _ \
 | (_| | |_) | |_| | \__ \  __/
  \__, | .__/ \__,_|_|___/\___|
   __/ | |
  |___/|_|
```

### The Missing GitHub CLI Toolkit

[![npm version](https://img.shields.io/npm/v/@sabahattinkalkan/gpulse?color=%23cb3837&label=npm)](https://www.npmjs.com/package/@sabahattinkalkan/gpulse)
[![CI](https://github.com/scuton-technology/ghx/actions/workflows/ci.yml/badge.svg)](https://github.com/scuton-technology/ghx/actions)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg)](https://typescriptlang.org)

**Standup reports, repo stats, changelogs, health checks, PR reviews, and digests.**
**All from your terminal. No browser required.**

[Install](#install) · [Commands](#commands) · [Contributing](#contributing)

</div>

---

## Why gpulse?

GitHub's web UI is great, but switching context kills your flow. **gpulse** brings the insights you actually need into your terminal — perfect for standups, code reviews, and keeping tabs on your repos.

- **Zero config** — just set `GITHUB_TOKEN` and go
- **Works anywhere** — auto-detects the current repo, or specify any `owner/repo`
- **Fast** — parallel API calls, minimal output, no fluff
- **6 focused commands** — each does one thing well

## Install

```bash
npm install -g @sabahattinkalkan/gpulse
```

## Setup

Create a [GitHub personal access token](https://github.com/settings/tokens) and set it:

```bash
# Add to your shell profile (.bashrc, .zshrc, etc.)
export GITHUB_TOKEN=ghp_your_token_here
```

> **Tip:** `GH_TOKEN` also works if you already use the GitHub CLI.

## Commands

### `gpulse standup`

> What did you do since yesterday?

Shows your commits, PRs, reviews, and issues across all repos.

```bash
gpulse standup                # last 24 hours
gpulse standup -d 3           # last 3 days
gpulse standup -u octocat     # specific user
gpulse standup -r org/repo    # specific repo only
```

<details>
<summary>Example output</summary>

```
  Standup for @sabahattinkalkan
  Since Mar 14, 2026 12:00 AM

  Commits
    a1b2c3d feat: add user authentication (org/app)
    d4e5f6a fix: resolve memory leak in worker (org/api)

  Pull Requests
    + #42 Add OAuth2 support (org/app)
    x #38 Remove deprecated endpoints (org/api)

  Reviews
    > #41 Refactor database layer (org/api)

  ----------------------------------------
  Summary: 2 commits, 2 PRs, 1 reviews, 0 issues
```

</details>

---

### `gpulse stats [owner/repo]`

> Repository statistics at a glance.

Stars, forks, languages, top contributors, and recent commits.

```bash
gpulse stats                  # current repo
gpulse stats facebook/react   # any public repo
```

<details>
<summary>Example output</summary>

```
  facebook/react
  The library for web and native user interfaces

  Overview
    Stars: 232k  Forks: 47k  Watchers: 6.7k
    Age: 11y 2m  Size: 372.1 MB  Default branch: main
    Open issues: 1,204  License: MIT

  Languages
    ███████████████ 72.3% JavaScript
    ████░░░░░░░░░░░ 18.1% TypeScript
    █░░░░░░░░░░░░░░  5.2% HTML

  Top Contributors
    ██████████ 3,847 gaearon
    ████████░░ 2,912 acdlite
    ██████░░░░ 1,568 sebmarkbage
```

</details>

---

### `gpulse changelog [owner/repo]`

> Auto-generate changelog from tags.

Groups commits by type (feat, fix, docs, chore) using Conventional Commits format.

```bash
gpulse changelog                         # last 2 tags
gpulse changelog --from v1.0 --to v2.0   # specific range
gpulse changelog -o CHANGELOG.md         # write to file
```

---

### `gpulse health [owner/repo]`

> Repository health score (A–F).

Checks for README, LICENSE, CI, activity, stale issues, description, and topics.

```bash
gpulse health                  # current repo
gpulse health vercel/next.js   # any repo
```

<details>
<summary>Example output</summary>

```
  Health Report: vercel/next.js

  ✓ README.md
  ✓ LICENSE
  ✓ CONTRIBUTING.md
  ✓ CI/CD workflows
  ✓ Active (last commit 0d ago)
  ✗ No stale issues (23 stale)
  ✓ Repository description
  ✓ Topics/tags

  ──────────────────────────────────────────

  Score: 90/100 (A)
  Open issues: 3,412 (23 stale)
  Stars: 128,000 | Forks: 27,000
```

</details>

---

### `gpulse review`

> Your PR dashboard.

Shows PRs where your review is requested, PRs assigned to you, and your open PRs.

```bash
gpulse review                  # all repos
gpulse review -r owner/repo    # specific repo
```

<details>
<summary>Example output</summary>

```
  PR Dashboard for @sabahattinkalkan

  Review Requested (2)
    #87 Add rate limiting middleware (org/api) 2h ago | updated 1h ago
    #83 Update dependencies (org/app) 1d ago | updated 3h ago

  Your PRs (1)
    #85 Implement caching layer (org/api) 4h ago | updated 2h ago

  ──────────────────────────────────────────
  2 to review | 0 assigned | 1 yours
```

</details>

---

### `gpulse digest [owner/repo]`

> Weekly/daily repository digest.

Commits, issues opened/closed, merged PRs, releases, and active contributors.

```bash
gpulse digest                  # current repo, last 7 days
gpulse digest -d 1             # daily digest
gpulse digest rust-lang/rust   # specific repo
```

---

## All Options

| Command | Flag | Description |
|---------|------|-------------|
| `standup` | `-u, --user <name>` | GitHub username |
| `standup` | `-d, --days <n>` | Look back N days (default: 1) |
| `standup` | `-r, --repo <owner/repo>` | Filter to specific repo |
| `stats` | `[owner/repo]` | Target repo (or current dir) |
| `changelog` | `-f, --from <tag>` | Start tag |
| `changelog` | `-t, --to <tag>` | End tag |
| `changelog` | `-o, --output <file>` | Write to file |
| `health` | `[owner/repo]` | Target repo (or current dir) |
| `review` | `-r, --repo <owner/repo>` | Filter to specific repo |
| `digest` | `[owner/repo]` | Target repo (or current dir) |
| `digest` | `-d, --days <n>` | Look back N days (default: 7) |

## Requirements

- **Node.js** >= 18
- **GitHub Token** — `GITHUB_TOKEN` or `GH_TOKEN` env variable
  - Required scopes: `repo`, `read:user`

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

```bash
git clone https://github.com/scuton-technology/ghx.git
cd ghx && npm install
npm run dev     # watch mode
npm test        # run tests
```

## License

MIT &copy; [Scuton Technology](https://scuton.com)
