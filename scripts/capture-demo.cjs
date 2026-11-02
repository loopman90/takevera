// Capture the real app with isolated temporary userData and documents.
const {app, BrowserWindow} = require('electron');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {stripPngMetadata} = require('./strip-png-metadata.cjs');
const root = path.resolve(__dirname, '..');
const isolated = fs.mkdtempSync(path.join(os.tmpdir(), 'takevera-demo-'));
app.setPath('userData', path.join(isolated, 'user-data'));
app.setPath('documents', path.join(isolated, 'documents'));
fs.mkdirSync(app.getPath('documents'), {recursive:true});
app.disableHardwareAcceleration();
app.on('browser-window-created', (_, win) => win.hide());
process.on('exit', () => { try { fs.rmSync(isolated, {recursive:true, force:true}); } catch {} });
require(path.join(root, 'src/main.cjs'));
app.whenReady().then(async () => {
  try {
    const deadline = Date.now() + 15000;
    while (!BrowserWindow.getAllWindows().length && Date.now() < deadline) await new Promise(r => setTimeout(r, 100));
    const win = BrowserWindow.getAllWindows()[0];
    if (!win) throw new Error('Application window was not created');
    win.setContentSize(1360, 900);
    if (win.webContents.isLoading()) await new Promise(resolve => win.webContents.once('did-finish-load', resolve));
    await new Promise(r => setTimeout(r, 800));
    const run = code => win.webContents.executeJavaScript(code);
    await run(fs.readFileSync(path.join(root, 'tests', 'fixtures', 'sample-project.js'), 'utf8'));
    await run(`(async()=>{localStorage.setItem('scriptstudio-language','en');localStorage.setItem('scriptstudio-intro-seen','1');localStorage.setItem('scriptstudio-theme','light');lang='en';await loadRendererLocale();project=sample('film');await window.studio.saveProject(project);projects=await window.studio.listProjects();document.querySelector('#intro-modal')?.remove();section='home';render()})()`);
    const capture = async (name, code) => {
      await run(code);
      await run(`if(lang!=='en'||document.documentElement.lang!=='en')throw new Error('Website screenshots require the English interface')`);
      await new Promise(r => setTimeout(r, 300));
      const image = await win.webContents.capturePage();
      fs.writeFileSync(path.join(root, 'website/assets/screenshots', `${name}.png`), stripPngMetadata(image.resize({width:1360,height:900,quality:'best'}).toPNG()));
      console.log(`Captured ${name}`);
    };
    await capture('projects', `section='home';render()`);
    await capture('script', `section='script';render()`);
    await capture('shotlist', `section='production';prodTab='shotlist';render();document.querySelector('.production-phase-overview').open=false`);
    await capture('lighting', `section='production';prodTab='light';render();document.querySelector('.production-phase-overview').open=false`);
    await capture('script-dark', `localStorage.setItem('scriptstudio-theme','dark');section='script';render()`);
    await capture('help', `localStorage.setItem('scriptstudio-theme','light');section='script';render();showHelp()`);
    win.destroy(); app.exit(0);
  } catch (error) { console.error(error.message); app.exit(1); }
});
