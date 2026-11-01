# Third-party notices and licence inventory

This is a preliminary inventory, not a completed legal review. Verify each dependency's complete copyright and licence notices before redistributing source or binaries. The list is derived from production entries in the lockfile; optional platform packages are included even when not installed locally. Development tools and their transitive dependencies also require review when distributed.

## Fonts

- Courier Prime: SIL Open Font License 1.1; see [licence text](src/fonts/courier-prime/OFL.txt).
- Bebas Neue: SIL Open Font License 1.1; see [licence text](src/fonts/bebas-neue/OFL.txt).
- Avenir Next is a system font with fallbacks and is not bundled.

## Runtime and bundled components

Electron distributes Chromium and other third-party components. The current macOS builder includes `Electron-LICENSE` and `Electron-LICENSES.chromium.html` in the app resources; each final release still needs its notices verified. The separate Linux experiment uses Electron’s original `LICENSE` and `LICENSES.chromium.html` filenames. PDF.js is Apache-2.0 and has its own licence and bundled assets. Installed runtime packages have their upstream licence files checked during CI; platform-specific `@napi-rs/canvas-*` binaries use the parent canvas package’s MIT licence. Preserve all upstream copyright and licence files when redistributing. The automated check is not a legal compatibility opinion.

| Package | Locked version | SPDX licence metadata |
| --- | --- | --- |
| @hocuspocus/common | 4.8.0 | MIT |
| @hocuspocus/provider | 4.8.0 | MIT |
| @hocuspocus/server | 4.8.0 | MIT |
| @lifeomic/attempt | 3.1.0 | MIT |
| @napi-rs/canvas | 1.1.0 | MIT |
| @napi-rs/canvas-android-arm64 | 1.1.0 | MIT |
| @napi-rs/canvas-darwin-arm64 | 1.1.0 | MIT |
| @napi-rs/canvas-darwin-x64 | 1.1.0 | MIT |
| @napi-rs/canvas-linux-arm-gnueabihf | 1.1.0 | MIT |
| @napi-rs/canvas-linux-arm64-gnu | 1.1.0 | MIT |
| @napi-rs/canvas-linux-arm64-musl | 1.1.0 | MIT |
| @napi-rs/canvas-linux-riscv64-gnu | 1.1.0 | MIT |
| @napi-rs/canvas-linux-x64-gnu | 1.1.0 | MIT |
| @napi-rs/canvas-linux-x64-musl | 1.1.0 | MIT |
| @napi-rs/canvas-win32-arm64-msvc | 1.1.0 | MIT |
| @napi-rs/canvas-win32-x64-msvc | 1.1.0 | MIT |
| async-mutex | 0.5.0 | MIT |
| crossws | 0.4.17 | MIT |
| isomorphic.js | 0.2.5 | MIT |
| kleur | 4.1.5 | MIT |
| lib0 | 0.2.119 | MIT |
| pdfjs-dist | 6.4.299 | Apache-2.0 |
| tslib | 2.9.1 | 0BSD |
| y-indexeddb | 9.0.12 | MIT |
| y-protocols | 1.0.7 | MIT |
| yjs | 13.6.33 | MIT |

## User-provided logo and screenshots

The owner has confirmed permission to publish the supplied logo and fictional sample content. Screenshots show the actual application with that fictional sample data. Separate approval is still required before public repository or website publication.
