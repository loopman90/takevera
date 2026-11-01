/* Build a local, ad-hoc signed macOS package. No upload or release is performed. */
const { execFileSync } = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

async function main() {
  if (process.platform !== 'darwin') throw new Error('The macOS builder requires macOS');
  const project = path.resolve(__dirname, '..');
  const info = require(path.join(project, 'package.json'));
  const electronRoot = path.dirname(require.resolve('electron/package.json', { paths: [project] }));
  const electron = require(path.join(electronRoot, 'package.json'));
  const checksums = require(path.join(electronRoot, 'checksums.json'));
  const get = require(require.resolve('@electron/get', { paths: [electronRoot] }));
  const architecture = process.argv[2] || process.arch;
  if (!['arm64', 'x64'].includes(architecture)) throw new Error('macOS builds support arm64 and x64');
  const npmCli = process.env.npm_execpath;
  if (!npmCli || !fs.existsSync(npmCli)) throw new Error('Run this builder through npm');
  if (!fs.existsSync(path.join(project, 'src', 'collaboration.bundle.js'))) throw new Error('Build the renderer first');
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'takevera-mac-build-'));
  fs.mkdirSync(path.join(project, 'dist'), { recursive: true });
  const output = fs.mkdtempSync(path.join(project, 'dist', `macos-${architecture}-`));
  const call = (binary, args, options = {}) => execFileSync(binary, args, { stdio: 'inherit', ...options });
  const copy = (source, destination) => fs.cpSync(source, destination, { recursive: true, dereference: false, verbatimSymlinks: true });
  try {
    const zipName = `electron-v${electron.version}-darwin-${architecture}.zip`;
    const expectedHash = checksums[zipName];
    if (!expectedHash) throw new Error('Electron checksum is unavailable for this target');
    const zip = await get.downloadArtifact({ version: electron.version, artifactName: 'electron', platform: 'darwin', arch: architecture });
    const hash = crypto.createHash('sha256');
    const fd = fs.openSync(zip, 'r');
    try { const block = Buffer.allocUnsafe(1024 * 1024); let n; while ((n = fs.readSync(fd, block, 0, block.length, null)) > 0) hash.update(block.subarray(0, n)); }
    finally { fs.closeSync(fd); }
    if (hash.digest('hex') !== expectedHash) throw new Error('Electron archive checksum mismatch');
    const extracted = path.join(temporary, 'electron');
    fs.mkdirSync(extracted);
    call('/usr/bin/ditto', ['-x', '-k', zip, extracted]);
    const production = path.join(temporary, 'production');
    fs.mkdirSync(production);
    for (const name of ['package.json', 'package-lock.json']) fs.copyFileSync(path.join(project, name), path.join(production, name));
    call(process.execPath, [npmCli, 'ci', '--omit=dev', '--ignore-scripts', '--no-fund', '--os=darwin', `--cpu=${architecture}`], { cwd: production });
    const staging = path.join(temporary, 'image');
    fs.mkdirSync(staging);
    const bundle = path.join(staging, 'Takevera.app');
    call('/usr/bin/ditto', [path.join(extracted, 'Electron.app'), bundle]);
    const macos = path.join(bundle, 'Contents', 'MacOS');
    fs.renameSync(path.join(macos, 'Electron'), path.join(macos, 'Takevera'));
    const architectures = execFileSync('/usr/bin/lipo', ['-archs', path.join(macos, 'Takevera')], { encoding: 'utf8' }).trim().split(/\s+/);
    const expectedArchitecture = architecture === 'x64' ? 'x86_64' : architecture;
    if (!architectures.includes(expectedArchitecture)) throw new Error('Electron executable architecture does not match target');
    const plist = path.join(bundle, 'Contents', 'Info.plist');
    const setPlist = (key, value) => {
      try { execFileSync('/usr/libexec/PlistBuddy', ['-c', `Set :${key} ${value}`, plist], { stdio: 'ignore' }); }
      catch { call('/usr/libexec/PlistBuddy', ['-c', `Add :${key} string ${value}`, plist]); }
    };
    for (const [key, value] of Object.entries({ CFBundleExecutable:'Takevera', CFBundleName:'Takevera', CFBundleDisplayName:'Takevera', CFBundleIdentifier:'studio.scriptstudio.app', CFBundleIconFile:'takevera.icns', CFBundleShortVersionString:info.version, CFBundleVersion:info.version, LSMinimumSystemVersion:'13.0' })) setPlist(key, value);
    const resources = path.join(bundle, 'Contents', 'Resources');
    fs.copyFileSync(path.join(project, 'assets', 'takevera.icns'), path.join(resources, 'takevera.icns'));
    const app = path.join(resources, 'app');
    fs.mkdirSync(app);
    for (const name of ['src', 'collaboration', 'locales']) copy(path.join(project, name), path.join(app, name));
    fs.mkdirSync(path.join(app, 'docs'));
    for (const name of ['USER_GUIDE_NL.md', 'USER_GUIDE_EN.md']) fs.copyFileSync(path.join(project, 'docs', name), path.join(app, 'docs', name));
    copy(path.join(production, 'node_modules'), path.join(app, 'node_modules'));
    fs.writeFileSync(path.join(app, 'package.json'), JSON.stringify({ name:info.name, productName:'Takevera', version:info.version, main:info.main, license:info.license, dependencies:info.dependencies }, null, 2) + '\n');
    for (const name of ['LICENSE', 'THIRD_PARTY_NOTICES.md']) fs.copyFileSync(path.join(project, name), path.join(app, name));
    const unpacked = path.join(resources, 'app.asar.unpacked', 'src');
    fs.mkdirSync(unpacked, { recursive: true });
    fs.copyFileSync(path.join(project, 'src', 'ocr-pdf.swift'), path.join(unpacked, 'ocr-pdf.swift'));
    for (const name of ['LICENSE', 'LICENSES.chromium.html']) fs.copyFileSync(path.join(extracted, name), path.join(resources, `Electron-${name}`));
    call('/usr/bin/codesign', ['--force', '--deep', '--sign', '-', bundle]);
    call('/usr/bin/codesign', ['--verify', '--deep', '--strict', bundle]);
    const archive = path.join(output, `Takevera-${info.version}-${architecture}-mac.zip`);
    call('/usr/bin/ditto', ['-c', '-k', '--sequesterRsrc', '--keepParent', bundle, archive]);
    fs.symlinkSync('/Applications', path.join(staging, 'Applications'));
    const image = path.join(output, `Takevera-${info.version}-${architecture}.dmg`);
    call('/usr/bin/hdiutil', ['create', '-quiet', '-fs', 'HFS+', '-format', 'UDZO', '-srcfolder', staging, image]);
    call('/usr/bin/hdiutil', ['verify', image]);
    console.log(`Local macOS ${architecture} packages: ${output}`);
    console.log('Ad-hoc signature only; not notarized. Packages are not automatically published.');
  } finally { fs.rmSync(temporary, { recursive:true, force:true }); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
