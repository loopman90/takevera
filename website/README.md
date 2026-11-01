# Takevera website

This is a static, English-first site prepared for GitHub Pages. It has no server-side runtime or paid hosting requirement. The site is local-only until separately approved for deployment. GitHub Pages may be public even when its repository is private.

## Local preview

```sh
node website/build.mjs
node website/check.mjs
python3 -m http.server 4173 --directory website/dist
```

Open `http://127.0.0.1:4173/`. The generated `website/dist/` directory is ignored by Git. Site links use relative paths and work under a repository base path. The build copies the English and Dutch user guides and only the explicitly selected website assets.

`site-config.json` deliberately has no repository or release URL until the owner approves them. Set the real approved GitHub URLs before deployment. `releasePublished` must remain false until a release actually exists. Keep its version synchronized with `package.json`.

## Screenshot plan and maintenance

The six images show the project overview, script editor, shot list, lighting plan, dark appearance and help. They are captured from the actual app using its fictional sample project and a temporary documents/user-data directory. No existing user projects, credentials or desktop are used.

On macOS with dependencies installed, run `./node_modules/.bin/electron scripts/capture-demo.cjs`. The script opens the real app with isolated temporary data and an English interface, checks the interface language before each capture, captures 1360 × 900 PNGs under `website/assets/screenshots/`, and removes EXIF, text and embedded colour-profile metadata. It does not publish anything. Review each image manually for accidental personal information, consistency, quality and redistribution rights before adding it to a public release; recapture rather than blur sensitive material. Optimized PNGs preserve legibility. Rebuild and check the website afterward.

## Publication boundaries

`.github/workflows/deploy-pages.yml` runs only by manual dispatch on `main` with explicit publication and screenshot-review inputs. Confirm the `github-pages` environment is protected and verify repository visibility before enabling it. Never dispatch it merely because a private repository has been created. GitHub Pages can be public independently of repository visibility. Release binaries and URLs must not be added until reviewed and explicitly approved.


## Patch notes and releases

When preparing each new release, update the repository `CHANGELOG.md`; the website builds its patch notes from that file automatically. Keep the current public release and unreleased work clearly separate. Update version and download links only when their corresponding release and assets are available, review platform and privacy limitations, then rebuild and publish the site using the approved Pages workflow. Update the notes for significant fixes as well as new features.
