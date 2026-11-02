# Changelog

Changes follow the spirit of [Keep a Changelog](https://keepachangelog.com/) and [Semantic Versioning](https://semver.org/). Dates and release entries are added only when an actual release is approved.

## Unreleased

## 0.1.4-beta.1 — 2026-11-02

### Added

- Project overview with suggested next steps, configurable navigation, scene preparation summaries, shoot-day overview, and production closeout checks.
- Story cards with structure templates, storyline and character filters, timeline and outline export.
- Availability windows, visual schedules, scene transfer with impact review, and explicit cast-to-character planning links.
- Call-sheet issue history and change detection, recipient labels and selectable sections; distribution status is recorded manually.
- Shared breakdown items, source links, production CSV and printable cast and category reports.
- Local collaboration invitation bundles, bounded multi-scene recovery, full-screen and workspace visibility controls, and expanded offline help.

### Changed

- Group navigation by production phase and simplify script tools and shot details without removing their controls.
- Preserve scene references in schedules when scenes are inserted, reordered or removed; flag missing or stale entries for review.
- Preserve existing scene and day locks when applying collaboration permissions.
- Refresh website screenshots using a fictional, isolated project.

### Known limitations

- macOS packages are ad-hoc signed and not notarized. Windows and Linux archives are unsigned portable test packages, not installers; native builds passed automated startup checks but still require interactive platform testing.
- Call-sheet issue data are recorded, but the issued PDF must be saved separately. Realtime collaboration still requires a self-hosted server.
- Previously incorrect schedule links cannot be identified automatically. Review older projects, and back up before updating.

## 0.1.3-beta.1 — 2026-11-02

- Add a scene-linked story board, alternative scene and primary-dialogue versions, selective restoration from revisions and local backups, an offline feedback round, scene read-aloud with local system voices, and script checks. These features do not lock production pages.

- Add stable scene numbering, writing shortcuts, source-linked breakdown tags, dual-dialogue editing and basic FDX exchange, script reports and print revision marks. Locked production pagination is not yet supported.

- Preview script-replacement impact and create a local full-project recovery point before replacing scenes; avoid guessing links for duplicate scene headings.
- Summarize scene assignment impact, guide day-bundle PDF sharing, and show project health and recovery practice.
- Add script exchange regression fixtures and update release and platform documentation.

- Version 0.1.2: reorganized navigation and export controls; improved day overview, call sheets, safety briefings, backup guidance, save feedback, accessibility and logo sizing.
- Added custom project pages.
- Windows and Linux packages remain portable test builds; macOS builds are ad-hoc signed and not notarized.

## 0.1.1-beta.1 — 2026-11-01

### Added

- Dedicated settings for Claude, Gemini and Grok and updated in-app and user guides.

### Security

- Require a new key or removal of the saved key when changing AI provider or endpoint.

### Known limitations

- Live requests to the new AI providers have not yet been tested with real API keys.
- Windows and Linux downloads are portable test packages; further interactive testing is needed. macOS packages are ad-hoc signed and not notarized.

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

Source package version: **0.1.2**; the latest published beta is 0.1.1.
