# AGENTS.md

- [Project Overview](#project-overview)
- [Technical Context](#technical-context)
- [Project Structure](#project-structure)
- [Build And Test Commands](#build-and-test-commands)
- [Contribution Instructions](#contribution-instructions)
- [Code Guidelines](#code-guidelines)
    - [System Design](#system-design)
    - [Architecture](#architecture)
    - [Code Quality](#code-quality)
    - [Testing](#testing)
    - [Dependency Management](#dependency-management)
    - [Configuration & Documentation](#configuration--documentation)
    - [Markdown Formatting](#markdown-formatting)
    - [Other](#other)

## Project Overview

Block YouTube Ads Shortcut — a JavaScript userscript that blocks YouTube ads
in Safari on iPhone/iPad. Safari's Content Blocking capabilities are no longer
sufficient for YouTube ads, so this project ships a script distributed via iOS
Shortcuts as a last-resort solution.

A single codebase produces four self-contained build outputs via esbuild:

- `block-youtube-ads.user.js` — userscript with metadata header (for userscript
  managers).
- `extension.js` — browser-extension variant exposing
  `ExtensionJavaScriptClass` with `run`/`finalize`.
- `index.js` — iOS Shortcut variant; calls `runBlockYoutube` and returns the
  result through the Shortcuts `completion()` API.
- `remote.js` — remote loader; fetches the latest `index.js` from a GitHub
  Release and `eval()`s it, so users get updates without reinstalling.

The core logic (`src/run-block-youtube.js`) injects CSS to hide ad elements,
overrides `JSON.parse`/`Response.prototype.json` to strip ad metadata,
auto-skips video ads, and injects an AdGuard logo. See `README.md` for end-user
setup and basic development instructions.

## Technical Context

| Field | Value |
| --- | --- |
| **Language** | JavaScript, ES modules (`"type": "module"` in `package.json`) |
| **Node version** | ≥ 22.23.5 (CI Docker image `adguard/node-ssh:22.23--0`, Node.js 22.23.5) |
| **Package manager** | Yarn 1.x (Classic) |
| **Primary dependencies** | `esbuild` ^0.14.11 (bundler); `eslint` ^8.2.0 with `eslint-config-airbnb-base` 15.0.0 |
| **Storage** | None — no database. `remote.js` fetches `index.js` from GitHub Releases at runtime |
| **Testing** | No automated test suite; CI runs `yarn lint` + `yarn build` via Docker |
| **Target platform** | Safari on iOS/iPadOS via Shortcuts; also runs as a userscript and a browser extension |
| **Project type** | Single repository with a multi-output build |
| **Performance goals** | N/A |
| **Constraints** | All changes go through PR; CI builds inside Docker (`adguard/node-ssh:22.23--0`) |
| **Scale/Scope** | Public end-user tool, small codebase |
| **License** | GPL-3.0 |

## Project Structure

```text
├── .github/
│   └── workflows/             # CI/CD: ci, mirror, prepare-release, publish-release
├── src/
│   ├── run-block-youtube.js   # Core logic: CSS injection, JSON override, ad-skipping, localization
│   ├── userscript.js          # Entry point: .user.js userscript output
│   ├── extension.js           # Entry point: browser-extension output (ExtensionJavaScriptClass)
│   ├── index.js               # Entry point: iOS Shortcut output (calls completion())
│   ├── remote.js              # Entry point: remote loader (fetch + eval index.js)
│   └── locales/               # Per-locale messages.json for userscript metadata
├── tasks/
│   └── build/                 # esbuild build config, banner + metadata generation
├── Dockerfile                 # Multi-stage Docker build for CI plan/test/build outputs
├── .eslintrc.cjs              # ESLint config (airbnb-base, 4-space indent)
├── .eslintignore              # Excludes dist
├── package.json              # Scripts (build, lint), devDependencies
├── CHANGELOG.md              # Keep a Changelog format; parsed by release workflow
├── LICENSE                   # GPL-3.0
├── README.md                 # End-user setup + basic dev instructions
└── AGENTS.md                 # This file
```

## Build And Test Commands

| Command | Description |
| --- | --- |
| `yarn install` | Install dependencies (use `--frozen-lockfile` in CI) |
| `yarn build` | Bundle the four outputs to `dist/` via esbuild |
| `yarn lint` | Run ESLint with the `airbnb-base` config |
| `npx eslint . --fix` | Auto-fix lint issues (no `lint:fix` script is defined) |

There is no `test` script and no formatter configured. CI performs validation
through the Docker `test` stage (`yarn lint && yarn build`) and verifies the four
artifacts exist in `dist/`.

## Contribution Instructions

- You MUST verify it with the linter (there is no formatter or type checker).

  Use the following commands:
    - `yarn lint` to run the linter
    - `npx eslint . --fix` to fix linting issues automatically

- You MUST update the unit tests for changed code. (This project has no test
  suite; if tests are introduced, add them alongside the changed code and a
  `test` script to `package.json`.)

- You MUST run `yarn build` to verify that your changes do not break the build
  and that all four artifacts are produced in `dist/`.

- When making changes to the project structure, ensure the Project Structure
  section in `AGENTS.md` is updated and remains valid.

- If the prompt essentially asks you to refactor or improve existing code, check
  if you can phrase it as a code guideline. If it's possible, add it to the
  relevant Code Guidelines section in `AGENTS.md`.

- After completing the task you MUST verify that the code you've written follows
  the Code Guidelines in this file.

- Even when your task is to write or update a document (e.g., a plan, PRD, or
  any Markdown file) rather than code, you MUST still run `yarn lint` and, if
  Markdown files are present, verify they follow the Markdown Formatting rules.

## Code Guidelines

### System Design

This project is a userscript/iOS Shortcut that injects sandboxed code into web
pages — closest in runtime characteristics to a browser-extension content
script. Design accordingly:

- The script runs in a sandboxed environment with limited APIs — iOS Shortcuts
  execute JavaScript in their own `window` context, separate from the page. Do
  not assume direct access to the page's global scope.
- Inject page-affecting logic into the real page context by appending a
  `<script>` element whose content is the `pageScript` function body. The
  shortcut runtime cannot mutate the page DOM directly; only the injected page
  script can.
- Keep the bundle lightweight — every byte slows shortcut launch and page load.
  Avoid bundling large dependencies; each of the four outputs is a single
  self-contained file with no runtime imports.
- Separate the runtime adapter (entry point) from the core blocking logic
  (`runBlockYoutube`). Entry points must only wrap the result and adapt it to
  their context's completion API (`completion()`,
  `options.completionFunction`, etc.); put no blocking logic in entry points.
- React to page changes asynchronously via `MutationObserver`; never block the
  main thread of the page.
- Handle the `completion` global defensively — it exists only inside the
  Shortcuts runtime; polyfill it (e.g., `console.log`) when running outside
  Shortcuts so the code remains testable.
- For the remote variant, the loader fetches `index.js` from the latest GitHub
  Release and `eval()`s it. Treat the remote payload as trusted first-party
  code only — never extend this pattern to untrusted sources.
- Design for single-file distribution — each output is self-contained with no
  external runtime imports.

### Architecture

Universal design principles the codebase should follow:

- **Separation of Concerns** — entry points adapt the runtime; core logic is
  isolated in `runBlockYoutube`.
- **Single Responsibility Principle** — each entry point handles only one
  output context; every function in the core module has one job.
- **Dependency Direction** — entry points depend on core logic; core logic
  never imports entry points.
- **Explicit Boundaries** — the page script is injected as a self-contained
  string; it does not share scope with the shortcut runtime.
- **Data Flow Clarity** — `runBlockYoutube` returns a status object; entry
  points pass its `message` to their context's completion API.
- **Minimize Coupling, Maximize Cohesion** — all blocking logic is cohesive in
  one module; entry points are thin adapters.
- **Make Invalid States Impossible** — guard against re-execution (logo element
  check) and wrong domain before running the blocking logic.
- **Observability Built-in** — limited here (console.log only); diagnostics are
  minimal in this small runtime, which is acceptable.
- **Keep It Boring** — simple DOM/CSS injection and JSON override; no framework,
  no clever abstractions.

The easiest way to achieve these principles is **layered architecture**.
This project's layers, from top to bottom:

| Layer | Responsibility | Examples |
| --- | --- | --- |
| Entry points | Adapt `runBlockYoutube` result to the target runtime's completion API | `src/index.js`, `src/extension.js`, `src/userscript.js`, `src/remote.js` |
| Core logic | All ad-blocking: CSS injection, DOM mutation, JSON override, ad-skipping, localization | `src/run-block-youtube.js` |
| Build tooling | esbuild bundling, license banner, userscript metadata generation | `tasks/build/` |
| Localization | Per-locale `messages.json` used for userscript metadata | `src/locales/` |

An entry-point layer may call the core-logic layer. The core-logic layer never
imports from entry points.

```text
Entry points (index / extension / userscript / remote)
     ↓
Core logic (run-block-youtube.js → runBlockYoutube)
     ↓
Injected page script (DOM manipulation, JSON override, ad-skipping)
```

**Known exclusions** (to be fixed):

- `remote.js` downloads and `eval()`s remote code. This is intentional for the
  remote-update mechanism, but it bypasses static dependency flow. The payload
  is treated as trusted first-party code.
- Localization is split between inline locale objects in `run-block-youtube.js`
  (UI strings) and `src/locales/*/messages.json` (userscript metadata only).
  Consolidating them would improve maintainability.
- `devDependencies` in `package.json` use caret ranges (`^`) rather than exact
  pins (see Dependency Management).

### Code Quality

- A GPL-3.0 license header MUST be present at the top of every source file.
- JSDoc comments are used on exported functions and non-obvious helpers; keep
  this convention when adding new functions.
- ESLint with `airbnb-base` is the static-analysis gate; CI runs `yarn lint`.
  4-space indentation is enforced via the `indent` rule.
- `no-console` is off (console.log is used for diagnostics). `no-param-reassign`
  is off (required by `overrideObject`'s recursive override).
- `.eslintignore` excludes `dist/`; never lint generated output.
- Do not modify linter/formatter configs (`.eslintrc.cjs`, `.eslintignore`)
  without team discussion.
- Error handling: entry points wrap the core call in try/catch and route
  exceptions to the context's completion API; never let an exception silently
  abort the shortcut.
- Naming: `camelCase` for functions and variables; entry-point files use
  `kebab-case` (`run-block-youtube.js`); locale directories use BCP-47-style
  codes (`zh-cn`, `zh-tw`).
- Imports: entry points import `runBlockYoutube` from `./run-block-youtube`; ES
  modules throughout (`"type": "module"`).

### Testing

- No automated test suite exists. Validation is performed via `yarn lint` +
  `yarn build` during CI (the Docker `test` stage).
- The Dockerfile explicitly documents that `yarn test` is intentionally not run
  because the package contains no tests.
- Manual verification: after building, confirm the four artifacts exist in
  `dist/`: `block-youtube-ads.user.js`, `extension.js`, `index.js`, `remote.js`.
- If tests are added in the future, place them alongside the source, add a
  `test` script to `package.json`, and require all tests to pass before merge.

### Dependency Management

- **Pin all dependency versions explicitly** — do not use version ranges that
  allow automatic upgrades to untested versions.
- **Prefer vanilla solutions** — the core logic uses only browser/DOM APIs and
  standard JavaScript; no runtime dependencies are bundled. Keep it that way.
- **Reputable sources only** — `esbuild`, `eslint`, and
  `eslint-config-airbnb-base` are well-established and actively maintained.
- **Avoid unpopular libraries** — do not add niche or obscure packages.
- **Minimize dependency count** — this project has zero runtime dependencies;
  each new devDependency increases the supply-chain surface and must be
  justified.
- **Use the latest stable version** — when adding a dev dependency, check the
  package registry for the latest stable release and use it. Do not copy
  outdated version numbers from memory or other lock files.

**Rationale**: Fewer, well-vetted dependencies reduce security vulnerabilities,
supply-chain risks, and long-term maintenance costs.

**Known exclusions** (to be fixed):

- `devDependencies` use caret ranges (`esbuild` ^0.14.11, `eslint` ^8.2.0,
  `eslint-plugin-import` ^2.25.2) rather than exact pins.
- `esbuild` ^0.14.11 and `eslint` ^8.2.0 are outdated major versions.

### Configuration & Documentation

- Runtime configuration is minimal. The remote-loader URL is hardcoded in
  `src/remote.js`; update it only if the release-hosting location changes.
- Version is sourced from `package.json`
  (`process.env.npm_package_version`) and injected into the build banner and
  userscript metadata by `tasks/build/`.
- Keep `CHANGELOG.md` (Keep a Changelog format) up to date — the release
  workflow parses it for tags and release notes.
- When build entry points, outputs, or the project structure change, update the
  Project Structure and Build And Test Commands sections in `AGENTS.md`.
- There is no `.env` file or config file, and no secrets are stored in the
  repository.

### Markdown Formatting

All Markdown files MUST follow these formatting rules:

- **Line length**: Keep lines at most 80 characters, but don't overwrap the
  lines artificially short just to hit the limit, keep them close to 80
  characters where possible. This is not a hard lint gate, but SHOULD be
  followed for readability. Lines inside fenced code blocks are exempt from
  this limit.
- **Unordered lists**: Use dashes (`-`) for bullet points. Indent nested
  list items by 4 spaces.
- **Continuation lines**: When a list item wraps to the next line,
  align the continuation with the first character of the item text,
  not the list marker. This applies to all list types (ordered and
  unordered).
- **Emphasis**: Use asterisks (`*`) for emphasis (`*italic*`,
  `**bold**`). Do NOT use underscores.
- **Headings**: Duplicate heading names are allowed only among sibling
  headings (same parent level). Avoid duplicates across different levels.
- **Inline HTML**: Avoid raw HTML in Markdown. The only allowed elements
  are `<a>`, `<p>`, `<details>`, `<summary>`, and `<img>`.
- **Trailing spaces**: Do NOT leave trailing whitespace on any line. Do
  NOT use two-space line breaks — use a blank line instead.
- **Bare URLs**: Bare URLs are permitted and do not need to be wrapped
  in angle brackets.
- **Table formatting**: Align table columns with padding when the table fits
  within 80 characters. If the table exceeds 80 characters or triggers an MD060
  linter warning, switch to a compact format using single spaces only. This
  applies to the separator row as well—it should be written as `| --- |`,
  not `|--|`.

  Example of correct layout:

  ```markdown
  | Col1 | Col2 |
  | --- | --- |
  | Value1 | Value2 |
  ```

  Do NOT use extra padding or alignment characters beyond single spaces.

**Rationale**: Uniform Markdown formatting improves readability for both
humans and AI agents that consume project documentation.

### Other

- The build produces four self-contained files in `dist/`:
  `block-youtube-ads.user.js` (userscript + metadata),
  `extension.js` (browser extension `ExtensionJavaScriptClass`),
  `index.js` (iOS Shortcut), and `remote.js` (remote loader).
- `completion` is a Safari Shortcuts global; it only exists inside the
  Shortcuts runtime and is polyfilled elsewhere.
- CI runs on the `team-extensions` self-hosted runner and builds via Docker
  (`adguard/node-ssh:22.23--0`).
- Release flow: `prepare-release.yml` opens a release PR finalizing
  `CHANGELOG.md`; on merge, `publish-release.yml` tags, builds, mirrors to
  `AdguardTeam/BlockYouTubeAdsShortcut`, and creates a GitHub Release with the
  built artifacts. Beta tags (e.g., `v1.2.0-beta.1`) create a prerelease.
