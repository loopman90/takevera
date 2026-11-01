const { app, BrowserWindow } = require('electron');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// Isolate Chromium storage and replace all native file operations with a mock preload.
const temporaryData = fs.mkdtempSync(path.join(os.tmpdir(), 'takevera-smoke-'));
process.on('exit', () => { try { fs.rmSync(temporaryData, { recursive: true, force: true }); } catch {} });
app.setPath('userData', temporaryData);
app.setName('Takevera Smoke');
app.disableHardwareAcceleration();

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, webPreferences: {
    preload: path.join(__dirname, 'smoke-preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: false
  } });
  try {
    await win.loadFile(path.join(__dirname, '..', 'src', 'index.html'));
    await new Promise(resolve => setTimeout(resolve, 300));
    await win.webContents.executeJavaScript(fs.readFileSync(path.join(__dirname, 'fixtures', 'sample-project.js'), 'utf8'));
      const result = await win.webContents.executeJavaScript(`(async () => {
      const check = (condition, message) => { if (!condition) throw new Error(message); };
      localStorage.setItem('scriptstudio-intro-seen','1');
      project=sample('film');
      project.shootDays=[{date:'2026-01-01',scenes:[0],timeline:[]},{date:'2026-01-02',scenes:[1],timeline:[]}];
      project.shots=[{day:0,scene:0,description:'Interview',framing:'Close-up',movement:'Static',lens:'50 mm',sound:'',light:'',duration:1,notes:''}];
      project.scenes[0].lightingSetup=[{source:'LED',position:'left',modifier:'diffusion',power:'30 W',safety:'secure'}];
      project.equipment=[{name:'Camera',category:'Camera',quantity:1,owner:'',status:'needed',scenes:[0],shots:[],notes:''},{name:'Microphone',category:'Sound',quantity:1,owner:'',status:'checked',scenes:[1],shots:[],notes:''},{name:'Cable',category:'Power',quantity:1,owner:'',status:'packed',scenes:[],shots:[],notes:''}];
      section='production';prodTab='equipment';render();
      const select = (query,value) => {const element=document.querySelector(query);check(element,'Missing '+query);element.value=value;element.dispatchEvent(new Event('change',{bubbles:true}));};
      const click = query => {const element=document.querySelector(query);check(element,'Missing '+query);element.click();};
      const savePreset = (query,name) => {click(query);check(document.querySelector('#preset-form'),'Preset dialog missing');document.querySelector('#preset-name').value=name;document.querySelector('#preset-form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));};
      select('#equipment-filter-day','0');check(document.querySelectorAll('.equipment-row').length===2,'Day filter should include assigned and general equipment');
      select('#equipment-filter-status','needed');check(document.querySelectorAll('.equipment-row').length===1,'Status filter should show the needed camera');
      select('#equipment-filter-status','checked');click('#add-equipment');check(document.querySelector('#equipment-filter-status').value==='all'&&document.querySelector('[data-equipment="3"]'),'New equipment must stay visible when a status filter was active');click('.remove-equipment[data-index="3"]');
      select('#equipment-filter-status','all');select('#equipment-filter-day','all');
      click('[data-save-preset="equipment"]');document.querySelector('#preset-modal').dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));check(!document.querySelector('#preset-modal'),'Escape should close the preset dialog');
      savePreset('[data-save-preset="equipment"]','Camera kit');select('#equipment-filter-status','checked');click('[data-apply-preset="equipment"]');check(document.querySelector('#equipment-filter-status').value==='all'&&document.querySelector('[data-equipment="3"]'),'Equipment made from a preset must stay visible');
      check(project.equipment.length===4 && project.equipment[3].status==='needed' && project.equipment[3].scenes.length===0,'Equipment preset must create an unassigned needed item');
      prodTab='shotlist';render();savePreset('[data-save-preset="shot"]','Interview shot');click('[data-apply-preset="shot"]');
      check(project.shots.length===2 && project.shots[1].scene==='' && project.shots[1].framing==='Close-up','Shot preset must create an unassigned shot');
      prodTab='light';render();savePreset('[data-save-preset="lighting"]','Soft LED');click('[data-apply-preset="lighting"]');
      check(project.scenes[0].lightingSetup.length===2 && project.scenes[0].lightingSetup[1].source==='LED','Lighting preset must add a fixture');
      const imageButton=document.querySelector('[data-add-production-image="light"]');check(imageButton,'Lighting image control missing');imageButton.click();await new Promise(resolve=>setTimeout(resolve,30));
      const hasImage=Boolean(project.productionReferences?.light?.length || project.scenes.some(scene=>scene.productionReferences?.light?.length) || project.shots.some(shot=>shot.productionReferences?.light?.length));
      check(hasImage,'Lighting reference was not added');
      check(await flushPendingSave(true),'Saving project failed');const saved=await window.studio.getSavedProject();
      check(saved.productionPresets.length===3 && saved.equipment.length===4 && saved.shots.length===2,'Saved project did not retain changes');
      project=JSON.parse(JSON.stringify(saved));prodTab='equipment';render();check(document.querySelector('[data-apply-preset="equipment"]'),'Preset missing after reopening saved data');
      prodTab='call';render();check(document.querySelector('[data-equipment]'),'Call sheet equipment status control missing');
      return 'Equipment filters, three preset types, lighting reference, save/reopen, and call-sheet controls passed.';
    })()`);
    console.log(result);
    win.destroy();
    app.exit(0);
  } catch (error) {
    console.error(error);
    win.destroy();
    app.exit(1);
  }
}).catch(error => { console.error(error); app.exit(1); });
