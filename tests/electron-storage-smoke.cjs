const { app, dialog } = require('electron');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');

const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'takevera-storage-'));
const documents = path.join(temporaryRoot, 'Documents');
const userData = path.join(temporaryRoot, 'UserData');
fs.mkdirSync(documents);
fs.mkdirSync(userData);
const imagePath = path.join(temporaryRoot, 'reference.png');
const exportPath = path.join(temporaryRoot, 'export.json');
fs.writeFileSync(imagePath, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lxoAAAAASUVORK5CYII=', 'base64'));
let jsonOpenPath = exportPath;
let folderOpenPath = temporaryRoot;
dialog.showOpenDialog = async (...args) => { const options=args.at(-1); return { canceled:false, filePaths:[options.properties?.includes('openDirectory') ? folderOpenPath : options.filters?.[0]?.extensions?.includes('png') ? imagePath : jsonOpenPath] }; };
dialog.showSaveDialog = async () => ({ canceled: false, filePath: exportPath });
dialog.showMessageBox = async () => ({ response: 0, checkboxChecked: false });
app.setPath('documents', documents);
app.setPath('userData', userData);
app.setName('Takevera Storage Smoke');
app.disableHardwareAcceleration();
process.on('exit', () => { try { fs.rmSync(temporaryRoot, { recursive: true, force: true }); } catch {} });

app.once('browser-window-created', (_event, win) => {
  win.hide();
  win.webContents.once('did-finish-load', async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 350));
      const initial = await win.webContents.executeJavaScript(`(async()=>({projects:await window.studio.listProjects(),sampleButton:!!document.querySelector('#sample'),sampleFunction:typeof sample}))()`);
      if (initial.projects.length || initial.sampleButton || initial.sampleFunction !== 'undefined') throw new Error('A fresh install must start without built-in example projects');
      await win.webContents.executeJavaScript(fs.readFileSync(path.join(__dirname, 'fixtures', 'sample-project.js'), 'utf8'));
      const created = await win.webContents.executeJavaScript(`(async () => {
        const check=(value,message)=>{if(!value)throw new Error(message)};
        project=sample('film');project.id='smoketest';project.title='Original';
        project.productionPresets=[{id:'preset1',kind:'shot',name:'Interview',values:{framing:'Close-up'}}];
        section='production';prodTab='light';render();
        const imageButton=document.querySelector('[data-add-production-image="light"]');check(imageButton,'Lighting image control missing');imageButton.click();
        await new Promise(resolve=>setTimeout(resolve,100));
        const refs=[...(project.productionReferences?.light||[]),...project.scenes.flatMap(scene=>scene.productionReferences?.light||[]),...project.shots.flatMap(shot=>shot.productionReferences?.light||[])];
        check(refs.length===1&&refs[0].storageMode==='copied','Lighting image was not copied into the project');
        await flushPendingSave(true);
        const listed=await window.studio.listProjects();check(listed.some(item=>item.id==='smoketest'&&item.productionPresets?.length===1),'Saved project or preset was not listed');
        const exported=await window.studio.exportProject(project);check(!exported.canceled,'Project export failed');
        const imported=await window.studio.importProject();check(imported.project.productionPresets?.length===1&&imported.assets?.length===1,'Project export/import lost the preset or image');
        const restoredAssets=await window.studio.importAssets('importtest',imported.assets);check(Object.keys(restoredAssets).length===1,'Bundled image could not be imported');
        const backup=await window.studio.createRecoveryBackup('smoketest');check(backup,'Recovery backup was not created');
        check((await window.studio.listBackups('smoketest')).some(item=>item.name===backup),'Recovery backup was not listed');
        check((await window.studio.readBackup('smoketest',backup)).title==='Original','Recovery backup could not be read');
        project.title='Changed';await window.studio.saveProject(project);
        return {backup};
      })()`);
      // A failed folder import must never remove images already belonging to the target project.
      const existingAssets = path.join(documents, 'Takevera', 'assets', 'smoketest');
      const beforeAssets = fs.readdirSync(existingAssets).sort();
      if (!beforeAssets.length) throw new Error('Existing image fixture is missing');
      const beforeContents = beforeAssets.map(name => fs.readFileSync(path.join(existingAssets, name)).toString('hex'));
      const packageDirectory = path.join(temporaryRoot, 'broken.takevera');
      fs.mkdirSync(path.join(packageDirectory, 'assets'), { recursive: true });
      const bytes = fs.readFileSync(imagePath);
      fs.writeFileSync(path.join(packageDirectory, 'assets', 'asset-1.png'), bytes);
      fs.writeFileSync(path.join(packageDirectory, 'takevera-project.json'), JSON.stringify({
        format:'takevera-project-folder', formatVersion:1, project:{id:'incoming',title:'Incoming',scenes:[]},
        assets:[{id:'asset-1',mimeType:'image/png',path:'assets/asset-1.png',size:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')},{id:'invalid'}]
      }));
      folderOpenPath = packageDirectory;
      await win.webContents.executeJavaScript(`(async()=>{let rejected=false;try{await window.studio.importProjectFolder('smoketest')}catch{rejected=true}if(!rejected)throw new Error('Invalid folder import was accepted')})()`);
      const afterAssets = fs.readdirSync(existingAssets).sort();
      if (JSON.stringify(beforeAssets)!==JSON.stringify(afterAssets) || beforeContents.some((content,i)=>content!==fs.readFileSync(path.join(existingAssets,afterAssets[i])).toString('hex'))) throw new Error('Failed import changed existing project images');
      await win.webContents.executeJavaScript("prodTab='call';render();document.body.dataset.printMode='call-sheet'");
      const pdf = await win.webContents.printToPDF({ printBackground: true });
      if (pdf.subarray(0, 5).toString() !== '%PDF-' || pdf.length < 1000) throw new Error('Call-sheet PDF output was invalid');
      const invalidPath = path.join(temporaryRoot, 'invalid.json');
      fs.writeFileSync(invalidPath, JSON.stringify({ id: 'bad', title: 'Bad', scenes: [], productionPresets: {} }));
      jsonOpenPath = invalidPath;
      await win.webContents.executeJavaScript(`(async()=>{let rejected=false;try{await window.studio.importProject()}catch{rejected=true}if(!rejected)throw new Error('Malformed presets were accepted on import')})()`);
      const projectDir = path.join(documents, 'Takevera');
      // Simulate a damaged project file and check the real recovery flow.
      fs.writeFileSync(path.join(projectDir, 'smoketest.json'), '{broken');
      const recovered = await win.webContents.executeJavaScript(`(async () => {
        const check=(value,message)=>{if(!value)throw new Error(message)};
        const candidates=await window.studio.listRecoverable();
        check(candidates.some(item=>item.id==='smoketest'&&item.name===${JSON.stringify(created.backup)}),'Recovery candidate was not detected');
        const restored=await window.studio.restoreBackup('smoketest',${JSON.stringify(created.backup)});
        check(restored.title==='Original'&&restored.productionPresets?.length===1,'Recovery did not restore the saved project');
        check((await window.studio.listProjects()).some(item=>item.id==='smoketest'&&item.title==='Original'),'Restored project was not listed');
        await window.studio.deleteBackup('smoketest',${JSON.stringify(created.backup)});
        check(!(await window.studio.listBackups('smoketest')).some(item=>item.name===${JSON.stringify(created.backup)}),'Backup was not deleted');
        return await window.studio.createRecoveryBackup('smoketest');
      })()`);
      const legacy = 'smoketest.recovery-123456.bak';
      fs.copyFileSync(path.join(projectDir, recovered), path.join(projectDir, legacy));
      await win.webContents.executeJavaScript(`(async () => {
        const items=await window.studio.listBackups('smoketest');
        if(!items.some(item=>item.name===${JSON.stringify(legacy)}))throw new Error('Legacy recovery backup was not listed');
        await window.studio.readBackup('smoketest',${JSON.stringify(legacy)});
        await window.studio.deleteProject('smoketest');
      })()`);
      if (fs.readdirSync(projectDir).some(name => name.startsWith('smoketest.'))) throw new Error('Project deletion left a backup behind');
      console.log('Real image copy, project export/import, PDF generation, save, backup, corruption recovery, legacy backup, and deletion passed in temporary storage.');
      app.exit(0);
    } catch (error) { console.error(error); app.exit(1); }
  });
});
require('../src/main.cjs');
