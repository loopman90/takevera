# Changelog

Changes follow the spirit of [Keep a Changelog](https://keepachangelog.com/) and [Semantic Versioning](https://semver.org/). Dates and release entries are added only when an actual release is approved.

## Unreleased

- Dedicated settings for Claude, Gemini and Grok and version 0.1.1 packages are in preparation; they are not yet published.

## 0.1.0-beta.1 — 2026-11-01

### Added

- Local-first desktop workspace for scripts, project details and production planning.
- Shot, equipment, light and sound plans; visual references and print/PDF output.
- English and Dutch interface and in-app guidance.
- Optional configurable AI and self-hosted collaboration.
- Public GitHub Pages website and an initial beta release with macOS, Windows x64 and Linux x64 test downloads.

### Changed

- New installations start without built-in example projects; existing user projects are preserved.

- The macOS build no longer uses the earlier build tool; Windows and Linux packages are portable test builds.

- Document the planned open-source macOS distribution without paid Apple signing and explain the related macOS warning.

### Fixed

- Preserve existing project images when importing a project folder fails.

- PDF imports now close the PDF loading task correctly after extracting text or performing OCR.

### Security

- Restrict desktop IPC to the application window and block unexpected navigation and pop-up windows.
- Reject AI endpoint redirects to avoid forwarding project text to an unexpected address.

### Known limitations

- The beta is a test release. Windows and Linux packages have automated startup checks but need further interactive validation.
- macOS development packages are not notarized; Windows development packages are unsigned.
- Some file conversions omit formatting and metadata; see the user guide.

Source package version: **0.1.0** for the published beta; **0.1.1** is in preparation.
