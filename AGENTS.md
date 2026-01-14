# AGENTS.md

Guidance for agentic coding in this repository.
Follow the commands and conventions below when editing the workflow-extractor MVP.

## Build, Lint, Test Commands

Install dependencies:
- `pnpm install`

Monorepo commands:
- Dev (extension watch + demo server): `pnpm dev`
- Build all packages: `pnpm build`
- Lint all packages: `pnpm lint`
- Format all packages: `pnpm format`
- Test all packages: `pnpm -r test`

Package-specific commands:
- Extension build: `pnpm --filter @workflow-extractor/extension build`
- Extension watch: `pnpm --filter @workflow-extractor/extension dev`
- Extension tests: `pnpm --filter @workflow-extractor/extension test`
- Compiler build: `pnpm --filter @workflow-extractor/compiler build`
- Compiler dev server: `pnpm --filter @workflow-extractor/compiler dev`
- Compiler CLI watch: `pnpm --filter @workflow-extractor/compiler dev:cli`
- Compiler tests: `pnpm --filter @workflow-extractor/compiler test`

Single test examples:
- `pnpm --filter @workflow-extractor/compiler test -- tests/segmenter.test.ts`
- `pnpm --filter @workflow-extractor/extension test -- tests/evidence.test.ts`

## Repo Layout

- `packages/extension`: Chrome MV3 recorder extension (content script, popup, background)
- `packages/compiler`: Node CLI compiler + demo server
- `packages/compiler/demo`: Static demo EMR pages
- `examples`: Sample `events.json`, `flow.json`, and `run.ts`

## Code Style Guidelines

These guidelines apply to new code until the project defines stricter rules.
Follow existing patterns once source files exist.
Prefer minimal, consistent changes per task.

### Formatting

Use the repository formatter when available:
- `prettier` with 2-space indentation
- 100-character max line length
- trailing commas where supported
- newline at end of file
- UTF-8 encoding

### Imports

Group imports in this order:
1. Standard library
2. Third-party dependencies
3. Internal modules
4. Relative imports

Within each group:
- Alphabetize by module path
- Keep one import per line where possible
- Avoid unused imports

### Types

Use the strongest type system available for the language.
Prefer explicit return types for public APIs.
Avoid `any`/dynamic types unless required for interop.
Keep types close to usage and avoid excessive indirection.

### Naming

Use clear, descriptive names.
Prefer nouns for data, verbs for functions.
Avoid one-letter names except in short loops.
Match TypeScript conventions (camelCase, PascalCase).

### Error Handling

Fail fast on invalid inputs.
Return actionable error messages.
Avoid swallowing errors; log or propagate them.
Preserve stack traces where possible.

### APIs and Boundaries

Keep public APIs minimal and stable.
Do not introduce breaking changes without alignment.
Prefer pure functions where practical.
Avoid side effects in shared utilities.

### State and Mutability

Prefer immutability for shared data.
Document intentional mutations.
Keep state localized to the smallest scope.

### Logging

Use a consistent logging interface when available.
Include context in error logs (inputs, ids, state).
Avoid noisy logs in hot paths.

### Tests

Add tests for new behavior when a test framework exists.
Use clear test names describing behavior.
Keep tests deterministic and isolated.

### Documentation

Document public functions, modules, and CLI usage.
Update README or docs when behavior changes.
Avoid duplicating docs that can drift.

## PR and Commit Hygiene

Write concise commit messages describing intent.
Group related changes into a single commit.
Avoid unrelated refactors in feature changes.

## Security and Safety

Do not commit secrets or credentials.
Prefer environment variables for configuration.
Validate and sanitize external inputs.

## Performance

Avoid premature optimization.
Measure before optimizing hot paths.
Use streaming for large datasets where possible.

## Tooling Conventions

Prefer repository scripts over ad-hoc commands.
Keep new tools documented in this file.
Do not introduce heavy dependencies without need.

## File Creation Guidance

Keep file additions minimal and scoped.
Follow existing directory structure.
Add new top-level folders only when justified.

## Cursor/Copilot Rules

No `.cursor/rules/`, `.cursorrules`, or `.github/copilot-instructions.md` were found.
When added, include their guidance here.

## Future Updates Checklist

When code or tooling changes, update this file with:
- Build, lint, format, and test commands
- Single-test invocation patterns
- Repo layout and package boundaries
- Language-specific conventions
- Error handling and logging standards
- Any new Cursor or Copilot rules

End of AGENTS.md.
