# poc-social-isw

A server-rendered social-network demo: a feed from a public fake-data API, current weather for the visitor's IP-derived location, and a global real-time chat over WebSockets. Everything live is held in memory (no database). It is a university assignment built on Bun, Elysia, `@elysiajs/html` and ofetch instead of the brief's Express/EJS/Axios.

---

## Where to look

| If you need... | Read |
|---|---|
| The contract of a capability before changing its behavior | `deltas/` — list the folder and open the spec that matches (and its design file for UI work) |
| What the system is, its scope and vocabulary | `.claude/docs/overview.md` |
| Behavior that spans components or isn't evident from one | `.claude/docs/modules.md` |
| The stack and why, topology, cross-cutting patterns, open decisions | `.claude/docs/structure.md` |
| How a non-trivial mechanism works | `.claude/docs/expertise.md` |
| Scope, risks and done criteria | `.claude/docs/approach.md` |
| How the knowledge base itself is worked | `.claude/docs/operandi.md` |
| A convention for the files you're editing | Nothing to do: `.claude/rules/` loads by itself when a matching file is read |

## Commands

`package.json` defines `start`, `dev` and `build` scripts but no `test` script yet; don't assume `test` exists. `bunfig.toml` forces `bun` for `run`. Tests are vitest, configured to resolve the tsconfig path aliases.

## Non-obvious structure

- Application code lives under `source/` in the three layers `@app`, `@core` and `@infra` (aliases in `tsconfig.json`); `source/env.ts` holds the config schema and `source/boot.ts` the server entry point.
- Views (the HTML components) live inside the infrastructure layer. Client static assets go in a `public/` folder at the repo root, beside `source/`, not inside it; its contents are build output.
- Progress by step is tracked in `ROADMAP.md`; it records work done, not contracts.

## Conventions

- 100% TypeScript, including client scripts, and no database: both come from the brief.
- Code must stay explainable line by line: the author is graded zero if they can't explain it or tweak it live.
- Commits follow `.claude/rules/commit-conventions.md`; code identifiers and messages in English.

---

## Non-goals

- Don't add persistence, accounts or private messaging; the brief excludes them.
