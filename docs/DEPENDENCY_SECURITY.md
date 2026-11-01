# Dependency and build security

## Current status

The macOS build no longer depends on `electron-builder`. A fresh installation and the full `npm audit --audit-level=moderate` reported zero findings on 2026-11-01. Audit results can change and do not establish that code is free of vulnerabilities. Re-run the full audit before any publication.

The old `electron-builder` development dependency previously caused 15 moderate dependency-chain entries for [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249). A forced `minimatch` major-version override broke a legacy consumer and was not adopted. Removing the old tool from the project resolved those reported entries without suppressing the audit or overriding its dependencies.

## macOS development packages

`npm run dist:mac` builds for the current machine architecture; `npm run dist:mac:x64` targets Intel. The builder checks the downloaded Electron archive against the installed Electron package's checksum, installs locked production dependencies in a temporary folder, includes the app, offline guides, fonts and notices, creates an ad-hoc-signed application, and produces a ZIP and DMG under a new `dist/macos-*` directory. It verifies the executable architecture, signature and DMG checksum. No upload occurs.

An ad-hoc signature does not establish a developer identity; these packages are not notarized. A paid Apple Developer account is not required for this open-source project. Consult the README and Apple guidance before opening an unsigned or unnotarized app. Do not treat any development package as a published or independently verified release.

Apple Silicon packages were built locally. Storage, IPC/navigation, PDF and image-only OCR tests passed against an instrumented copy of the packaged app using temporary data; secure credential storage was disabled for that test and remains to be verified separately. Intel packages were built; storage, IPC/security, text-PDF and image-only OCR checks also passed under Rosetta with credential storage disabled. Interactive validation on Intel hardware remains outstanding. The local output is not proof of reproducible builds or a completed independent security review.

Windows and Linux release builds are deferred. Separate experimental portable archive scripts remain for future work; they are not release builders or validated installers. Linux container tests using `--no-sandbox` did not validate the Chromium sandbox or desktop installation. A Windows experiment was checked structurally but not run on Windows.

## Before publication

Re-run clean installation, full audit, unit and Electron tests, packaged application tests, and privacy/secret scans on the exact files. Independently review security and third-party attributions; validate target-platform installation and secure credential storage. Review screenshots, build contents and approved Git author identity. The owner authorized a private repository but chose not to bypass mandatory failed checks. Public visibility and GitHub Pages require separate approval. No official release has been published.
