const { app, BrowserWindow } = require('electron');
const fs = require('node:fs');
const os = require('node:os');
const http = require('node:http');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'takevera-security-'));
for (const name of ['Documents', 'UserData']) fs.mkdirSync(path.join(temporaryRoot, name));
app.setPath('documents', path.join(temporaryRoot, 'Documents'));
app.setPath('userData', path.join(temporaryRoot, 'UserData'));
app.disableHardwareAcceleration();
process.on('exit', () => { try { fs.rmSync(temporaryRoot, { recursive: true, force: true }); } catch {} });

app.once('browser-window-created', (_event, win) => {
  win.hide();
  win.webContents.once('did-finish-load', async () => {
    try {
      const trusted = await win.webContents.executeJavaScript('window.studio.listProjects()');
      if (!Array.isArray(trusted)) throw new Error('Trusted window could not list projects');
      const attacker = new BrowserWindow({ show: false, webPreferences: { preload: path.join(__dirname, '../src/preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true } });
      await attacker.loadURL('data:text/html,<html><body>Untrusted</body></html>');
      const rejected = await attacker.webContents.executeJavaScript('(async()=>{try{await window.studio.listProjects();return false}catch{return true}})()');
      if (!rejected) throw new Error('Untrusted window could invoke IPC');
      attacker.destroy();
      let redirectRequests = 0;
      const server = http.createServer((request, response) => {
        if (request.url === '/direct/chat/completions') {
          response.writeHead(200, { 'Content-Type': 'application/json' });
          response.end(JSON.stringify({ choices: [{ message: { content: 'local test response' } }] }));
        } else if (request.url === '/redirect/chat/completions') {
          response.writeHead(307, { Location: '/redirect-target' });
          response.end();
        } else {
          redirectRequests++;
          response.writeHead(200, { 'Content-Type': 'application/json' });
          response.end('{}');
        }
      });
      await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
      try {
        const base = `http://127.0.0.1:${server.address().port}`;
        await win.webContents.executeJavaScript(`window.studio.saveAISettings(${JSON.stringify({endpoint: base + '/direct', model: 'test'})})`);
        const answer = await win.webContents.executeJavaScript("window.studio.aiComplete('fictional test prompt')");
        if (answer !== 'local test response') throw new Error('Direct local AI request failed');
        await win.webContents.executeJavaScript(`window.studio.saveAISettings(${JSON.stringify({endpoint: base + '/redirect', model: 'test'})})`);
        const redirectRejected = await win.webContents.executeJavaScript("(async()=>{try{await window.studio.aiComplete('fictional test prompt');return false}catch{return true}})()");
        if (!redirectRejected || redirectRequests) throw new Error('AI redirect was followed');
      } finally { await new Promise(resolve => server.close(resolve)); }
      const popupBlocked = await win.webContents.executeJavaScript("window.open('about:blank') === null");
      if (!popupBlocked) throw new Error('Unexpected window was opened');
      const originalUrl = win.webContents.getURL();
      const destination = path.join(temporaryRoot, 'destination.html');
      fs.writeFileSync(destination, '<html><body>Navigation target</body></html>');
      let navigationAttempted = false;
      win.webContents.once('will-frame-navigate', () => { navigationAttempted = true; });
      await win.webContents.executeJavaScript(`window.location.href=${JSON.stringify(pathToFileURL(destination).href)}`);
      await new Promise(resolve => setTimeout(resolve, 250));
      if (!navigationAttempted || win.webContents.getURL() !== originalUrl) throw new Error('Renderer navigation was not blocked');
      console.log('Trusted IPC and direct AI work; untrusted IPC, popups, navigation and AI redirects are blocked.');
      app.exit(0);
    } catch (error) { console.error(error); app.exit(1); }
  });
});
require('../src/main.cjs');
