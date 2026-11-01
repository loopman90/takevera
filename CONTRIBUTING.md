# Contributing to Takevera

Thank you for considering a contribution. This project is being prepared for publication; the owner selected MIT; repository links and copyright details still need confirmation.

## Report an issue

Use the bug, feature or documentation template when the repository is available. Describe the goal, operating system and app version; give steps to reproduce and expected/actual results. Remove personal project data, API keys, file paths and identifying screenshots before submitting. Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md).

## Development

Use Node.js 22.13 or newer (or Node 24 or newer), npm and the lockfile:

```sh
npm ci
npm start
npm test
npm run build:renderer
```

On macOS, `npm run test:smoke` and `npm run test:storage` run Electron checks with isolated test data. Windows and Linux desktop workflows require testing on those operating systems. See [README.md](README.md) for build commands, known format limitations and platform status. Build the static site with `node website/build.mjs` and check it with `node website/check.mjs`.

## Changes and review

1. Discuss significant changes in an issue before investing in a large implementation.
2. Branch from `main`, for example `feature/short-name`, `fix/short-name` or `docs/short-name`.
3. Keep changes focused, retain project-file compatibility and add or update checks for behaviour changes. Never commit user data, credentials or private screenshots.
4. Use Conventional Commits, for example `feat: add call sheet filter`, `fix: preserve scene links` or `docs: clarify backup steps`.
5. Open a pull request that describes the change, validation and limitations. A maintainer should review it and required checks before merging. Do not merge unreviewed major dependency updates.

Releases use Semantic Versioning. A version in the source does not by itself mean a public release or a tested binary exists.
