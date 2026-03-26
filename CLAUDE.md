# CLAUDE.md — AI Assistant Guide for LAY:D WEB

## Project Overview

**LAY:D WEB** is the web application for the LAY:D project. This repository is in early initialization — no source code, dependencies, or configuration files exist yet. This file will be updated as the project develops.

---

## Repository State

| Item | Status |
|---|---|
| Source code | Not yet added |
| Package manager | Not yet configured |
| Framework | Not yet determined |
| Database | Not yet configured |
| CI/CD | Not yet configured |

---

## Branch Conventions

- **`main`** — stable/production branch; do not push directly
- **Feature branches** — use descriptive names, e.g. `feature/<description>` or `fix/<description>`
- AI-generated branches follow the pattern: `claude/<task-slug>`

When assigned to a task, always develop on the designated branch and push when done. Never push to `main` without explicit permission.

---

## Commit Message Conventions

Use concise, imperative-mood commit messages:

```
Add user authentication flow
Fix null pointer in session handler
Update README with setup instructions
```

- Lead with a capital verb (Add, Fix, Update, Refactor, Remove, etc.)
- Keep the subject line under 72 characters
- Add body text only when the "why" needs explanation

---

## Development Workflow

Since no tooling is configured yet, these are the expected steps once setup occurs:

1. **Install dependencies** — run the project's install command (e.g., `npm install`, `pnpm install`, `yarn`)
2. **Run dev server** — use the dev/start script from `package.json`
3. **Run tests** before committing
4. **Lint/format** code before pushing

This section should be updated with exact commands once the stack is chosen.

---

## Code Conventions (Defaults Until Overridden)

- **Language**: TypeScript preferred for web projects
- **Formatting**: Prettier with defaults (2-space indent, single quotes, trailing commas)
- **Linting**: ESLint with TypeScript rules
- **Testing**: Vitest or Jest for unit tests; Playwright or Cypress for E2E
- **CSS**: TailwindCSS or CSS Modules preferred over inline styles
- **Imports**: Absolute paths preferred over deep relative paths

These are defaults — update this file once the actual stack and conventions are established.

---

## AI Assistant Instructions

### General Rules

- Read existing files before modifying them
- Do not add features beyond what is requested
- Do not add comments or docstrings to code you didn't write
- Do not create new files unless strictly necessary
- Prefer editing existing files over creating new ones
- Do not introduce security vulnerabilities (XSS, SQL injection, command injection, etc.)

### Git Operations

- Always develop on the designated feature branch
- Use `git push -u origin <branch-name>` when pushing
- If push fails due to network errors, retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s)
- Do NOT create a pull request unless explicitly asked by the user

### When This Project Has Code

Once source code exists, update this file with:
- Exact install/build/test commands
- Directory structure overview
- Key modules and their responsibilities
- Environment variable requirements
- Database migration steps
- Any deployment procedures

---

## Updating This File

This CLAUDE.md should be kept current. When making significant structural changes to the project (adding a framework, setting up the database, configuring CI), update the relevant sections here.
