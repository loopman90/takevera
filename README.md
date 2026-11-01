# Takevera

A local-first desktop workspace for writing scripts and preparing production books. Takevera brings scenes, shot lists, equipment, lighting and call sheets together for independent creators and small teams.

![Takevera script editor with a fictional example project](website/assets/screenshots/script.png)

**Status:** version 0.1.0 is a development build. No official GitHub release or project website has been published. The owner selected the MIT licence and confirmed the copyright notice.

## Start here

1. Build or install an appropriate development package for your system; see [platforms and installation](#platforms-and-installation).
2. Open Takevera, choose **New project**, or open a sample project to practise.
3. Open **Script** and add a scene. Changes are saved locally.
4. Open **Production** for shoot days, shot lists, equipment, lighting and call sheets.
5. Select **? Help me** in the app to search instructions, learn about the current screen or open the full guide offline.

Read the [English beginner’s guide](docs/USER_GUIDE_EN.md) or [Nederlandse beginnershandleiding](docs/USER_GUIDE_NL.md).

## Features

- **Writing:** structured scenes, script blocks, character and location suggestions, scene cards, revisions and print/PDF output.
- **Production:** shoot days, call sheets, shot lists, equipment, tasks, budgets, and configurable production-book exports.
- **Visual planning:** moodboards, storyboards, lighting and sound references, plus fixture markers on a reference image.
- **Local-first:** local project files, automatic saves, backups and an independent full-project export.
- **Optional integrations:** an OpenAI-compatible endpoint or separately installed local model server, and manually configured shared-folder or self-hosted realtime collaboration. Selected AI context is sent only after review and confirmation.
- **Guidance:** English and Dutch UI, example projects, a glossary and offline help.

These features are implemented in the development app; not every workflow has been independently validated on every platform. [Coverage and known limits](docs/SPEC_COVERAGE.md) and [technical reference](docs/TECHNICAL_REFERENCE.md) describe details and format restrictions.

## Platforms and installation

There are **no published releases yet**. Existing local development packages must not be treated as verified official downloads.

| Platform | Current state |
| --- | --- |
| macOS 13+ | Apple Silicon and Intel packages can be built. Local builds are ad-hoc signed, without Apple Developer ID signing or notarization. Intel hardware testing remains outstanding. |
| Windows x64 | Development is deferred; the experimental portable archive is not a tested release. |
| Linux x64 | Development is deferred; the experimental portable archive is not a tested release. |

macOS development build: open the DMG and drag Takevera to Applications. Keep an independent backup before replacing an existing installation. There is no automatic update service.

### Opening a macOS build

The planned open-source macOS build does not require a paid Apple Developer account. An ad-hoc signature does not establish the developer’s identity, and the build is not notarized by Apple. macOS may block it on first launch. There is no official release yet; do not treat experimental builds as approved downloads.

If a future release is obtained from the official project source and you have independently checked that it is the expected, unmodified file, first try to open the app. If macOS blocks it, **System Settings → Privacy & Security** may offer **Open Anyway** for that app. Follow [Apple’s instructions and security guidance](https://support.apple.com/en-us/102445). Do not override a warning that identifies malware or a damaged or modified app. Availability and wording vary by macOS version and device management.

## Configuration and privacy

Projects are stored under the user's Documents/Takevera directory by default; an existing legacy ScriptStudio folder may continue to be used. Use **Settings** to change the folder, interface language, appearance and optional services. Do not commit project data or API keys. The app supports PNG, JPEG and WebP references; linked originals need to remain available.

AI setup requires a compatible chat-completions API base URL and model name, plus a key if the provider requires one. An external provider receives the reviewed project context after confirmation and may charge for usage. A local server must be installed separately. Linux credential storage needs a supported secure secret store. See the [guides](docs/USER_GUIDE_EN.md) for steps and limitations.

## Development and builds

Use Node.js 22.13+ or 24+, npm, and the lockfile:

```sh
npm ci
npm start
npm test
npm run build:renderer
```

On macOS, `npm run test:smoke` and `npm run test:storage` run isolated Electron checks. Build a local macOS package with `npm run dist:mac` for the current architecture or `npm run dist:mac:x64` for Intel. Windows and Linux release builds are deferred; the existing experimental scripts are not release builders. A build succeeding on one machine does not verify runtime behaviour on another platform. macOS release signing and notarization require developer credentials and separate approval; never commit them. See the [technical reference](docs/TECHNICAL_REFERENCE.md).

## Website and screenshots

A static, English-first GitHub Pages site is prepared locally under [website/](website/). It uses genuine app screenshots from a fictional isolated demo. No remote repository, release URL or Pages deployment is configured.

```sh
node website/build.mjs
node website/check.mjs
python3 -m http.server 4173 --directory website/dist
```

Open `http://127.0.0.1:4173/` locally. Review screenshot privacy and rights before publishing. The site has a manual-only deployment workflow; repository and Pages publication require separate approval. See [website/README.md](website/README.md).

## Contributing and project direction

See [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), [ROADMAP.md](ROADMAP.md) and [CHANGELOG.md](CHANGELOG.md). The latest full dependency audit reported no vulnerabilities; recheck before release. See [dependency security](docs/DEPENDENCY_SECURITY.md) for build details and limitations.

## Licensing

The owner selected the [MIT licence](LICENSE) and identified Astrid Roel as copyright holder. The owner confirmed 2026, the public contact details and rights to the provided logo and sample content. Third-party licence obligations still require review. Bundled font licences are in [src/fonts/](src/fonts/); see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for dependency notices and outstanding review.
