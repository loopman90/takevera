const { app, dialog } = require('electron');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

if (process.platform !== 'darwin') { console.log('OCR test requires macOS.'); app.exit(0); } else {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'takevera-ocr-'));
  for (const name of ['Documents', 'UserData']) fs.mkdirSync(path.join(root, name));
  app.setPath('documents', path.join(root, 'Documents'));
  app.setPath('userData', path.join(root, 'UserData'));
  app.disableHardwareAcceleration();
  process.on('exit', () => { try { fs.rmSync(root, { recursive: true, force: true }); } catch {} });
  const fixture = path.join(root, 'scan.pdf');
  execFileSync('/usr/bin/swift', [path.join(__dirname, 'make-ocr-fixture.swift'), fixture], { timeout: 120000 });
  dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [fixture] });
  dialog.showMessageBox = async () => ({ response: 0 });
  app.once('browser-window-created', (_event, win) => {
    win.hide();
    win.webContents.once('did-finish-load', async () => {
      try {
        const result = await win.webContents.executeJavaScript('window.studio.importPDF()');
        if (result?.pageCount !== 1 || result.ocrPages !== 1 || !result.text.includes('TAKEVERA')) throw new Error('PDF OCR import failed');
        console.log('PDF OCR import passed with a generated image-only fixture.');
        app.exit(0);
      } catch (error) { console.error(error); app.exit(1); }
    });
  });
  require('../src/main.cjs');
}
