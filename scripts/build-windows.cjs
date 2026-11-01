/* Windows x64 test package. This does not sign, install, or publish an app. */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');

if (process.platform !== 'win32' || process.arch !== 'x64') throw new Error('This builder requires Windows x64 and Node x64');
const root = path.resolve(__dirname, '..');
const info = require(path.join(root, 'package.json'));
const electronDist = path.join(root, 'node_modules', 'electron', 'dist');
const npmCli = process.env.npm_execpath;
if (!npmCli || !fs.existsSync(npmCli)) throw new Error('Run using npm run build:windows:test');
if (!fs.existsSync(path.join(electronDist, 'electron.exe'))) throw new Error('Windows Electron is missing; run npm ci on Windows first');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'takevera-win-build-'));
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
const output = fs.mkdtempSync(path.join(root, 'dist', 'windows-test-'));
const run = (binary, args, options = {}) => execFileSync(binary, args, { stdio: 'inherit', ...options });
const copy = (source, destination) => fs.cpSync(source, destination, { recursive: true, dereference: false });
try {
  const production = path.join(temporary, 'production');
  fs.mkdirSync(production);
  for (const name of ['package.json', 'package-lock.json']) fs.copyFileSync(path.join(root, name), path.join(production, name));
  run(process.execPath, [npmCli, 'ci', '--omit=dev', '--ignore-scripts', '--no-fund'], { cwd: production });
  const bundle = path.join(temporary, 'Takevera-windows-x64');
  copy(electronDist, bundle);
  fs.renameSync(path.join(bundle, 'electron.exe'), path.join(bundle, 'Takevera.exe'));
  if (fs.existsSync(path.join(bundle, 'electron_wer.dll'))) fs.renameSync(path.join(bundle, 'electron_wer.dll'), path.join(bundle, 'Takevera_wer.dll'));
  const app = path.join(bundle, 'resources', 'app');
  fs.mkdirSync(app, { recursive: true });
  for (const name of ['src', 'collaboration', 'locales']) copy(path.join(root, name), path.join(app, name));
  fs.mkdirSync(path.join(app, 'docs'));
  for (const name of ['USER_GUIDE_NL.md', 'USER_GUIDE_EN.md']) fs.copyFileSync(path.join(root, 'docs', name), path.join(app, 'docs', name));
  copy(path.join(production, 'node_modules'), path.join(app, 'node_modules'));
  fs.rmSync(path.join(app, 'node_modules', '.bin'), { recursive: true, force: true });
  fs.writeFileSync(path.join(app, 'package.json'), JSON.stringify({ name: info.name, productName: info.build.productName, version: info.version, main: info.main, license: info.license, dependencies: info.dependencies }, null, 2) + '\n');
  for (const name of ['LICENSE', 'THIRD_PARTY_NOTICES.md']) fs.copyFileSync(path.join(root, name), path.join(app, name));
  fs.copyFileSync(path.join(root, 'assets', 'takevera.ico'), path.join(bundle, 'takevera.ico'));
  fs.copyFileSync(path.join(root, 'docs', 'WINDOWS_TEST_NL.txt'), path.join(bundle, 'LEESMIJ-WINDOWS.txt'));
  const archive = path.join(output, `Takevera-${info.version}-windows-x64-test.zip`);
  // Values are passed as arguments, not interpolated into PowerShell code.
  run('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', '& { param($source,$destination) Compress-Archive -LiteralPath $source -DestinationPath $destination -CompressionLevel Optimal }', bundle, archive]);
  const hash = crypto.createHash('sha256').update(fs.readFileSync(archive)).digest('hex');
  fs.writeFileSync(archive + '.sha256', `${hash}  ${path.basename(archive)}\n`);
  console.log(`Windows test archive: ${archive}\nSHA-256: ${hash}\nUnsigned; no installer or release approval.`);
} finally { fs.rmSync(temporary, { recursive: true, force: true }); }
