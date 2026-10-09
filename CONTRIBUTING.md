# Contributing to LamaLama

Thanks for wanting to help! LamaLama is an open-source browser video editor, and contributions of every size are welcome: bug reports, ideas, docs, tests and code.

By taking part you agree to follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Ways to contribute

- **Report a bug** — [open a bug report](https://github.com/andrebuilds/lamalama/issues/new?template=bug_report.yml) with steps to reproduce.
- **Suggest a feature** — [open a feature request](https://github.com/andrebuilds/lamalama/issues/new?template=feature_request.yml) describing the problem it solves.
- **Improve the docs** — typos and clearer wording are always welcome.
- **Write code** — look for issues labelled `good first issue` or `help wanted`.

For anything bigger than a small fix, please **open an issue first** so we can agree on the approach before you spend time on it.

Security problems go through [SECURITY.md](SECURITY.md), never a public issue.

## Development setup

Follow [Getting started](README.md#getting-started) in the README. In short:

```bash
git clone https://github.com/<your-username>/lamalama.git
cd lamalama
npm install
cp .env.example .env   # fill it in
npm run db:deploy
npm run dev
```

You need Node.js 22+, a Postgres database and an S3-compatible bucket. The README explains both the Neon setup and a fully local one.

## Architecture in one minute

- Code is organised **by feature** (`src/features/<feature>`), not by layer.
- `src/app` holds **thin routes only**: read params, check auth, render feature components.
- Other code imports a feature **only through its `index.ts`** (or its browser-safe `client.ts`, or its UI-free `server.ts` from code the job worker loads). ESLint enforces this.
- `src/shared` is feature-agnostic and must never import from `src/features`.
- Business rules live in `service.ts`; server actions stay thin: validate → authorise → call the service → revalidate.
- Every server action and route that touches workspace data starts with `requireWorkspaceAccess("<permission>")` and scopes its queries by the returned workspace id. Pages read `actions` from `getCurrentWorkspace()` and hide what the user can't do with `can(actions, "<permission>")`. Permissions live in `src/features/workspaces/lib/permissions.ts`.
- Validate every input at the boundary with Zod.
- No secrets, limits or provider names hardcoded in feature code: limits live in `src/shared/config/limits.ts`, providers behind adapters in `src/shared`.

## Making a change

1. Fork the repo and create a branch from `main`:
   ```bash
   git checkout -b fix/short-description
   ```
2. Make your change, with tests. New behaviour needs a test; a bug fix needs a test that failed before the fix.
3. Database changes need a migration: `npm run db:migrate -- --name <name>`.
4. Run the checks locally (CI runs the same ones):
   ```bash
   npm run lint
   npm run typecheck
   npx prettier --check "src/**/*.{ts,tsx}"
   npm test
   npm run test:e2e   # for UI changes
   ```
5. Open a pull request against `main` and fill in the template.

## Commit messages

Write short, imperative commit subjects that say what changed, for example:

```
Fix playhead jump when a clip is reordered
Add 4:5 export preset
```

[Conventional Commits](https://www.conventionalcommits.org) prefixes (`fix:`, `feat:`, `docs:`…) are welcome but not required.

## Pull request guidelines

- Keep PRs focused: one fix or feature per PR.
- Explain **what** changed and **why**; link the issue it closes (`Closes #123`).
- Add screenshots or a short recording for UI changes.
- Make sure the UI stays accessible: keyboard usable, labelled controls, enough contrast. The e2e suite runs axe (WCAG 2.2 A/AA).
- Be patient and kind in review — everyone here is volunteering their time.

## Licence

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE) that covers the project.
