# Contributing to git-pulse

Thanks for your interest in contributing! Here's how to get started.

## Setup

```bash
git clone https://github.com/scuton-technology/ghx.git
cd ghx
npm install
npm run dev
```

## Development

- `npm run dev` — watch mode
- `npm run build` — production build
- `npm test` — run tests
- `npm run lint` — lint source

## Pull Requests

1. Fork the repo and create your branch from `main`
2. Write tests for new functionality
3. Ensure all tests pass
4. Use conventional commit messages (`feat:`, `fix:`, `docs:`, etc.)
5. Submit a PR with a clear description

## Code Style

- TypeScript strict mode
- ESM modules
- Use existing patterns in `src/commands/` for new commands
