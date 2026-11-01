/* Local development experiment. This portable archive is not a release or AppImage. */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

if (process.platform !== 'linux') throw new Error('This experimental builder requires Linux');
if (!['x64', 'arm64'].includes(process.arch)) throw new Error('Only x64 and arm64 are supported by this experiment');
const project = path.resolve(__dirname, '..');
const info = require(path.join(project, 'package.json'));
const electronExecutable = require(path.join(project, 'node_modules', 'electron'));
const electronDirectory = path.dirname(electronExecutable);
const npmCli = process.env.npm_execpath;
if (!npmCli || !fs.existsSync(npmCli)) throw new Error('Run this script through npm run build:linux:experimental');
if (!fs.existsSync(path.join(project, 'src', 'collaboration.bundle.js'))) throw new Error('Build the renderer first');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'takevera-linux-experiment-'));
fs.mkdirSync(path.join(project, 'dist'), { recursive: true });
const output = fs.mkdtempSync(path.join(project, 'dist', 'experimental-linux-'));
const call = (binary, args, options = {}) => execFileSync(binary, args, { stdio: 'inherit', ...options });
const copy = (source, destination) => fs.cpSync(source, destination, { recursive: true, dereference: false, verbatimSymlinks: true });
try {
  const production = path.join(temporary, 'production');
  fs.mkdirSync(production);
  for (const name of ['package.json', 'package-lock.json']) fs.copyFileSync(path.join(project, name), path.join(production, name));
  call(process.execPath, [npmCli, 'ci', '--omit=dev', '--ignore-scripts', '--no-fund'], { cwd: production });
  const dirname = `Takevera-linux-${process.arch}`;
  const bundle = path.join(temporary, dirname);
  copy(electronDirectory, bundle);
  fs.renameSync(path.join(bundle, 'electron'), path.join(bundle, 'takevera'));
  const app = path.join(bundle, 'resources', 'app');
  fs.mkdirSync(app, { recursive: true });
  for (const name of ['src', 'collaboration', 'locales']) copy(path.join(project, name), path.join(app, name));
  fs.mkdirSync(path.join(app, 'docs'));
  for (const name of ['USER_GUIDE_NL.md', 'USER_GUIDE_EN.md']) fs.copyFileSync(path.join(project, 'docs', name), path.join(app, 'docs', name));
  copy(path.join(production, 'node_modules'), path.join(app, 'node_modules'));
  fs.writeFileSync(path.join(app, 'package.json'), JSON.stringify({ name: info.name, productName: info.build.productName, version: info.version, main: info.main, license: info.license, dependencies: info.dependencies }, null, 2) + '\n');
  for (const name of ['LICENSE', 'THIRD_PARTY_NOTICES.md']) fs.copyFileSync(path.join(project, name), path.join(app, name));
  fs.copyFileSync(path.join(project, 'src', 'assets', 'takevera-logo.png'), path.join(bundle, 'takevera.png'));
  const archive = path.join(output, `Takevera-${info.version}-linux-${process.arch}-experimental.tar.gz`);
  call('tar', ['-czf', archive, '-C', temporary, dirname]);
  call('tar', ['-tzf', archive], { stdio: 'ignore' });
  console.log(`Experimental portable archive created: ${archive}`);
  console.log('Not an AppImage, installer, tested release or replacement for the full dependency audit.');
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
