const { app, dialog } = require('electron');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'takevera-pdf-'));
for (const name of ['Documents', 'UserData']) fs.mkdirSync(path.join(root, name));
app.setPath('documents', path.join(root, 'Documents'));
app.setPath('userData', path.join(root, 'UserData'));
app.disableHardwareAcceleration();
process.on('exit', () => { try { fs.rmSync(root, { recursive: true, force: true }); } catch {} });

// Create a minimal PDF with a real text layer and correctly calculated offsets.
const stream = 'BT /F1 18 Tf 72 720 Td (TAKEVERA PDF IMPORT REGRESSION TEST) Tj ET';
const objects = [
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`
];
let pdf = '%PDF-1.4\n';
const offsets = [0];
for (let i = 0; i < objects.length; i++) { offsets.push(Buffer.byteLength(pdf)); pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`; }
const xref = Buffer.byteLength(pdf);
pdf += `xref\n0 ${offsets.length}\n0000000000 65535 f \n`;
for (const offset of offsets.slice(1)) pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
pdf += `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
const pdfPath = path.join(root, 'fixture.pdf');
fs.writeFileSync(pdfPath, pdf);
dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [pdfPath] });

app.once('browser-window-created', (_event, win) => {
  win.hide();
  win.webContents.once('did-finish-load', async () => {
    try {
      const result = await win.webContents.executeJavaScript('window.studio.importPDF()');
      if (result?.pageCount !== 1 || result.ocrPages !== 0 || !result.text.includes('TAKEVERA PDF IMPORT REGRESSION TEST')) throw new Error('PDF text import failed');
      console.log('PDF text import and cleanup passed with temporary data.');
      app.exit(0);
    } catch (error) { console.error(error); app.exit(1); }
  });
});
require('../src/main.cjs');
