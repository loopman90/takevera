/* Cross-build experiment for macOS/Linux. Not an installer or release. */
const { execFileSync } = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

if (!['darwin', 'linux'].includes(process.platform)) throw new Error('This cross-build experiment requires macOS or Linux');
const project = path.resolve(__dirname, '..');
const info = require(path.join(project, 'package.json'));
const electronPackage = require(path.join(project, 'node_modules', 'electron', 'package.json'));
const checksums = require(path.join(project, 'node_modules', 'electron', 'checksums.json'));
const zipName = `electron-v${electronPackage.version}-win32-x64.zip`;
const expectedHash = checksums[zipName];
const sourceZip = process.env.TAKEVERA_ELECTRON_WINDOWS_ZIP;
const npmCli = process.env.npm_execpath;
if (!sourceZip || !fs.existsSync(sourceZip)) throw new Error('Set TAKEVERA_ELECTRON_WINDOWS_ZIP to the official Electron Windows x64 ZIP');
if (!expectedHash) throw new Error('No trusted checksum is available for this Electron ZIP');
if (!npmCli || !fs.existsSync(npmCli)) throw new Error('Run this script through npm run build:windows:experimental');
if (!fs.existsSync(path.join(project, 'src', 'collaboration.bundle.js'))) throw new Error('Build the renderer first');
const hash = crypto.createHash('sha256');
const fd = fs.openSync(sourceZip, 'r');
try { const block = Buffer.allocUnsafe(1024 * 1024); let n; while ((n = fs.readSync(fd, block, 0, block.length, null)) > 0) hash.update(block.subarray(0, n)); }
finally { fs.closeSync(fd); }
if (hash.digest('hex') !== expectedHash) throw new Error('Electron Windows ZIP checksum does not match the installed Electron package');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'takevera-windows-experiment-'));
fs.mkdirSync(path.join(project, 'dist'), { recursive: true });
const output = fs.mkdtempSync(path.join(project, 'dist', 'experimental-windows-'));
const call = (binary, args, options = {}) => execFileSync(binary, args, { stdio: 'inherit', ...options });
const copy = (source, destination) => fs.cpSync(source, destination, { recursive: true, dereference: false, verbatimSymlinks: true });
try {
  const production = path.join(temporary, 'production');
  fs.mkdirSync(production);
  for (const name of ['package.json', 'package-lock.json']) fs.copyFileSync(path.join(project, name), path.join(production, name));
  call(process.execPath, [npmCli, 'ci', '--omit=dev', '--ignore-scripts', '--no-fund', '--os=win32', '--cpu=x64'], { cwd: production });
  const dirname = 'Takevera-windows-x64';
  const bundle = path.join(temporary, dirname);
  fs.mkdirSync(bundle);
  call('unzip', ['-q', sourceZip, '-d', bundle]);
  fs.renameSync(path.join(bundle, 'electron.exe'), path.join(bundle, 'Takevera.exe'));
  const wer = path.join(bundle, 'electron_wer.dll');
  if (fs.existsSync(wer)) fs.renameSync(wer, path.join(bundle, 'Takevera_wer.dll'));
  const app = path.join(bundle, 'resources', 'app');
  fs.mkdirSync(app, { recursive: true });
  for (const name of ['src', 'collaboration', 'locales']) copy(path.join(project, name), path.join(app, name));
  fs.mkdirSync(path.join(app, 'docs'));
  for (const name of ['USER_GUIDE_NL.md', 'USER_GUIDE_EN.md']) fs.copyFileSync(path.join(project, 'docs', name), path.join(app, 'docs', name));
  copy(path.join(production, 'node_modules'), path.join(app, 'node_modules'));
  // Package executables are not needed at runtime; avoid platform-specific symlinks.
  fs.rmSync(path.join(app, 'node_modules', '.bin'), { recursive: true, force: true });
  fs.writeFileSync(path.join(app, 'package.json'), JSON.stringify({ name: info.name, productName: info.build.productName, version: info.version, main: info.main, license: info.license, dependencies: info.dependencies }, null, 2) + '\n');
  for (const name of ['LICENSE', 'THIRD_PARTY_NOTICES.md']) fs.copyFileSync(path.join(project, name), path.join(app, name));
  fs.copyFileSync(path.join(project, 'assets', 'takevera.ico'), path.join(bundle, 'takevera.ico'));
  const archive = path.join(output, `Takevera-${info.version}-windows-x64-experimental.zip`);
  call('zip', ['-qr', archive, dirname], { cwd: temporary });
  call('unzip', ['-tq', archive], { stdio: 'ignore' });
  console.log(`Experimental Windows archive created: ${archive}`);
  console.log('No Windows runtime test, installer, executable rebranding, signature, or release approval.');
} finally { fs.rmSync(temporary, { recursive: true, force: true }); }
