# Deployment

- [Overview](#overview)
- [Deployment Model](#deployment-model)
- [CI Pipelines](#ci-pipelines)
    - [CI (`ci.yml`)](#ci-ciyml)
    - [Mirror (`mirror.yml`)](#mirror-mirroryml)
    - [Prepare Release (`prepare-release.yml`)](#prepare-release-prepare-releaseyml)
    - [Publish Release (`publish-release.yml`)](#publish-release-publish-releaseyml)
- [Build Artifacts](#build-artifacts)
- [Release Process](#release-process)
- [Distribution](#distribution)
    - [GitHub Release (Public Mirror)](#github-release-public-mirror)
    - [iOS Shortcuts (iCloud)](#ios-shortcuts-icloud)
    - [iCloud Shared Link Regeneration](#icloud-shared-link-regeneration)
- [External Integrations](#external-integrations)
- [Infrastructure Dependencies](#infrastructure-dependencies)
- [Environment Variables](#environment-variables)
- [Error Reporting](#error-reporting)
- [Logging](#logging)

## Overview

Block YouTube Ads Shortcut is a client-side JavaScript userscript distributed to
end users via iOS Shortcuts — there is no server, database, or cache to deploy.
"Deployment" for this project means: building the four self-contained artifacts,
mirroring the repository to the public mirror
(`AdguardTeam/BlockYouTubeAdsShortcut`), publishing a GitHub Release with the
built artifacts, and distributing iCloud shortcut links that point to the
released code.

This document covers the CI/CD pipelines, release process, distribution
channels, external integrations, and the iCloud shared link regeneration
procedure. See `AGENTS.md` for build commands and development setup, and
`README.md` for end-user installation instructions.

## Deployment Model

There is no runtime server. The code is built once per release and served as
static files from GitHub Releases. End-user devices fetch the latest `index.js`
at runtime (remote variant) or run a snapshot bundled into the shortcut
(standard variant).

```text
Source repo (private)
    │
    ├── ci.yml ──────── Lint + build on PR / push to master
    │
    ├── mirror.yml ───── Push source → AdguardTeam/BlockYouTubeAdsShortcut
    │                    (on every push to master)
    │
    ├── prepare-release.yml ── Open release-bump PR (manual trigger)
    │
    └── publish-release.yml ── Tag → build → mirror → GitHub Release
                               on public mirror + Slack notification
                                     │
                                     ├── index.js ── served as release asset
                                     │              (fetched by remote.js at runtime)
                                     │
                                     └── iCloud shortcuts (agrd.io short links)
                                          point users to the shortcut installer
```

## CI Pipelines

All pipelines run on the self-hosted `team-extensions` runner
(Kubernetes-based). See `AGENTS.md` for the Docker base image and build tooling.

### CI (`ci.yml`)

- **Trigger**: pull request, push to `master`.
- **Runner**: `team-extensions`.
- **Steps**: checkout → Docker build targeting `test-output` → verify all four
  artifacts exist → upload each as a workflow artifact.
- **Purpose**: gate merges — lint, build, and artifact presence must pass.

### Mirror (`mirror.yml`)

- **Trigger**: push to `master`.
- **Runner**: reusable workflow
  `AdGuardSoftwareLimited/actions/.github/workflows/mirror.yml@master`.
- **Target**: `git@github.com:AdguardTeam/BlockYouTubeAdsShortcut.git`.
- **Permissions**: `contents: read`, `actions: write` (disable mirror
  workflows), `id-token: write` (Octopass token).
- **Purpose**: keep the public mirror in sync with the private source repo on
  every merge to `master`.

### Prepare Release (`prepare-release.yml`)

- **Trigger**: `workflow_dispatch` with a `tag` input.
- **Runner**: reusable workflow
  `AdGuardSoftwareLimited/actions/.github/workflows/create-release-pr.yml@master`.
- **Input**: `tag` — release tag with `v` prefix. A `-beta` suffix
  (e.g., `v1.2.0-beta.1`) creates a prerelease; no suffix (e.g., `v1.2.0`)
  creates a stable release.
- **Permissions**: `contents: write`, `id-token: write`.
- **Purpose**: open a release-bump PR that finalizes `CHANGELOG.md`. When
  merged, `publish-release.yml` takes over.
- **Run name**: a manual run shows the requested tag in the Actions run
  list, for example, `Prepare release v1.2.0`.

### Publish Release (`publish-release.yml`)

- **Trigger**: pull request closed on `master`, or `workflow_dispatch`.
- **Jobs**:
    1. **tag** — `tag-from-changelog.yml` reusable workflow; parses the version
       and changelog from `CHANGELOG.md` and creates the git tag.
    2. **build** — injects the release version into `package.json`, runs
       `test-output` (lint + build) and `build-output` (release artifacts),
       uploads them as the `release-files` artifact.
    3. **mirror-and-release** — `mirror-and-release.yml` reusable workflow;
       mirrors the repo (including the tag) to the public mirror and creates a
       GitHub Release with the built artifacts. Prerelease flag is set for
       `-beta` tags.
    4. **notify-success / notify-failure** — Slack notification to
       `#adguard-extension-vcs`.
- **Permissions**: `contents: write`, `actions: write`, `id-token: write`.

## Build Artifacts

The Docker build (`Dockerfile`) produces four self-contained files in `dist/`:

| File | Purpose |
| --- | --- |
| `block-youtube-ads.user.js` | Userscript with metadata header (for userscript managers) |
| `extension.js` | Browser-extension variant (`ExtensionJavaScriptClass`) |
| `index.js` | iOS Shortcut variant; served as a GitHub Release asset |
| `remote.js` | Remote loader; fetches `index.js` at runtime and `eval()`s it |

The CI pipeline uses the `test-output` target (lint + build); the release
pipeline additionally uses the `build-output` target for the release artifacts.

## Release Process

1. **Prepare** — trigger `prepare-release.yml` with the target tag
   (e.g., `v1.2.0`). This opens a PR finalizing `CHANGELOG.md`.
2. **Review and merge** — the release-bump PR is reviewed and merged to
   `master`.
3. **Publish** — `publish-release.yml` fires on PR close:
    - Tags the release commit (version parsed from `CHANGELOG.md`).
    - Builds and uploads the four artifacts.
    - Mirrors to the public mirror and creates a GitHub Release.
    - Posts a Slack notification to `#adguard-extension-vcs`.
4. **Verify** — confirm the GitHub Release on
   `AdguardTeam/BlockYouTubeAdsShortcut` includes all four artifacts and that
   `https://github.com/AdguardTeam/BlockYouTubeAdsShortcut/releases/latest/download/index.js`
   serves the new `index.js`.

## Distribution

### GitHub Release (Public Mirror)

The public mirror `AdguardTeam/BlockYouTubeAdsShortcut` hosts GitHub Releases
with the four built artifacts. The `remote.js` loader fetches the latest
`index.js` from:

```text
https://github.com/AdguardTeam/BlockYouTubeAdsShortcut/releases/latest/download/index.js
```

This URL always resolves to the most recent stable (non-prerelease) release.
Users running the remote shortcut variant receive updates automatically on
each launch — no reinstall required.

### iOS Shortcuts (iCloud)

End users install the shortcut via iCloud shared links distributed through
`agrd.io` short links:

- **Standard version**: `https://agrd.io/ios_youtube_shortcut` — bundles a
  snapshot of `index.js` at install time. Users must reinstall to receive
  updates.
- **Remote version**: `https://agrd.io/ios_youtube_shortcut_remote` — bundles
  `remote.js`, which fetches the latest `index.js` from GitHub Releases on
  every launch. Users receive updates automatically.

The `agrd.io` short links redirect to iCloud shared shortcut links managed by
the Mobile/Extensions team. These links are external to this repository.

### iCloud Shared Link Regeneration

> When the `remote.js` fetch URL is changed (e.g., from
> `raw.githubusercontent.com/.../master/dist/index.js` to
> `releases/latest/download/index.js`), the iCloud shortcut's shared link
> (currently `https://agrd.io/ios_youtube_shortcut_remote`) **must be
> regenerated** and re-shared. iOS Shortcuts embed the fetch URL at creation
> time — existing installations fetch the old URL until users re-install the
> shortcut. Coordinate the iCloud link re-share and the `agrd.io` redirect
> update with the Mobile/Extensions team before merging URL changes.

**General rule**: Any change to the URL in `src/remote.js` requires
regenerating the iCloud shared link for the remote shortcut and updating the
corresponding `agrd.io` redirect. Without regeneration, existing installations
continue fetching from the old URL indefinitely.

## External Integrations

| Integration | Purpose |
| --- | --- |
| `AdGuardSoftwareLimited/actions` reusable workflows | `mirror.yml`, `mirror-and-release.yml`, `create-release-pr.yml`, `tag-from-changelog.yml` |
| Octopass (OIDC token) | Authenticate pushes to the public mirror repo `AdguardTeam/BlockYouTubeAdsShortcut` |
| Slack (`#adguard-extension-vcs`) | Release success/failure notifications via `actions/slack@master` |
| iCloud shortcuts (via `agrd.io`) | End-user distribution of the standard and remote shortcut variants |
| GitHub Releases | Hosting the four built artifacts; `remote.js` fetches `index.js` from the latest release |

No API keys or secrets are stored in this repository. The Octopass OIDC token
and any other credentials are provided at runtime via GitHub Actions secrets
(`secrets: inherit`) and are managed by the Infra team.

## Infrastructure Dependencies

None. This project has no database, cache, message queue, or object storage.
The only runtime dependency is the end-user's device fetching `index.js` from
GitHub Releases (remote variant).

## Environment Variables

None. There are no environment variables in the application code. The release
version is injected into `package.json` at build time by the
`publish-release.yml` workflow (sourced from `CHANGELOG.md` via the tag job),
not from an environment variable.

## Error Reporting

None. There is no Sentry, Bugsnag, or other error reporting integration. Entry
points catch exceptions and route them to the Shortcuts `completion()` API;
outside the Shortcuts runtime, `completion` is polyfilled to `console.log`.

## Logging

Minimal. The script uses `console.log` for diagnostics within the sandboxed
Shortcuts runtime. Logs are not persisted or shipped to an external service —
they appear only in the iOS Shortcuts debug console (if enabled). No logging
framework or log-level configuration exists.
