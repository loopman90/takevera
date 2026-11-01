# Changelog

Changes follow the spirit of [Keep a Changelog](https://keepachangelog.com/) and [Semantic Versioning](https://semver.org/). Dates and release entries are added only when an actual release is approved.

## Unreleased

### Added

- Local-first desktop workspace for scripts, project details and production planning.
- Shot, equipment, light and sound plans; visual references and print/PDF output.
- English and Dutch interface, sample projects and in-app guidance.
- Optional configurable AI and self-hosted collaboration.
- Local-only static project website and publication preparation.

### Changed

- Focus release preparation on macOS and replace the previous build tool; Windows and Linux release builds are deferred.

- Document the planned open-source macOS distribution without paid Apple signing and explain the related macOS warning.

### Fixed

- Preserve existing project images when importing a project folder fails.

- PDF imports now close the PDF loading task correctly after extracting text or performing OCR.

### Security

- Restrict desktop IPC to the application window and block unexpected navigation and pop-up windows.
- Reject AI endpoint redirects to avoid forwarding project text to an unexpected address.

### Known limitations

- No official public release has been published. Local Windows and Linux packages have not been interactively validated on their target platforms.
- macOS development packages are not notarized; Windows development packages are unsigned.
- Some file conversions omit formatting and metadata; see the user guide.

Source package version: **0.1.0** (development; not a published release).
