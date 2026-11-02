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
    const exchangeFixtures = Object.fromEntries(['interchange-example.fountain','interchange-example.fdx','interchange-example-docx.xml','third-party-fountain/sample.fountain'].map(name => [name, fs.readFileSync(path.join(__dirname, 'fixtures', name), 'utf8')]));
    await win.webContents.executeJavaScript(`window.exchangeFixtures = ${JSON.stringify(exchangeFixtures)}`);
      const result = await win.webContents.executeJavaScript(`(async () => {
      const check = (condition, message) => { if (!condition) throw new Error(message); };
      localStorage.setItem('scriptstudio-intro-seen','1');
      project=sample('film');
      project.shootDays=[{date:'2026-01-01',scenes:[0],timeline:[]},{date:'2026-01-02',scenes:[1],timeline:[]}];
      project.shots=[{day:0,scene:0,description:'Interview',framing:'Close-up',movement:'Static',lens:'50 mm',sound:'',light:'',duration:1,notes:''}];
      project.scenes[0].lightingSetup=[{source:'LED',position:'left',modifier:'diffusion',power:'30 W',safety:'secure'}];
      project.equipment=[{name:'Camera',category:'Camera',quantity:1,owner:'',status:'needed',scenes:[0],shots:[],notes:''},{name:'Microphone',category:'Sound',quantity:1,owner:'',status:'checked',scenes:[1],shots:[],notes:''},{name:'Cable',category:'Power',quantity:1,owner:'',status:'packed',scenes:[],shots:[],notes:''}];
      const fountain=parseFountain(window.exchangeFixtures['interchange-example.fountain']);
      check(fountain.scenes.length===2 && fountain.scenes[0].dialogue==='The train is late.','Fountain fixture import failed');
      check(parseFountain(buildFountain({title:'Round trip',scenes:fountain.scenes})).scenes[0].dialogue==='The train is late.','Fountain dialogue round trip failed');
      const thirdParty=parseFountain(window.exchangeFixtures['third-party-fountain/sample.fountain']);
      const thirdPartyAgain=parseFountain(buildFountain({title:'Example',scenes:thirdParty.scenes}));
      check(thirdParty.scenes.length===3 && thirdPartyAgain.scenes.map(scene=>scene.heading).join('|')===thirdParty.scenes.map(scene=>scene.heading).join('|'),'External Fountain sample scene headings changed');
      check(JSON.stringify(thirdPartyAgain.scenes).includes('Surprise me.'),'External Fountain sample dialogue was lost');
      const fdx=parseFDX(window.exchangeFixtures['interchange-example.fdx']);
      check(fdx.scenes.length===2 && fdx.revisions.length===1 && fdx.scenes[0].fdxRevisionIDByField.dialogue==='1','FDX fixture or revision failed');
      const fdxAgain=parseFDX(buildFDX({scenes:fdx.scenes,fdxRevisionSets:fdx.revisions}));
      check(fdxAgain.scenes.length===2 && fdxAgain.scenes[0].dialogue==='We should go.' && fdxAgain.scenes[0].fdxRevisionIDByField.dialogue==='1','FDX round trip failed');
      const dual={type:'dualDialogue',leftCharacter:'MARA',leftDialogue:'Watch out!',rightCharacter:'ELI',rightDialogue:'Get down!'};
      const dualScene={heading:'INT. STATION - DAY',elements:[dual]};const dualFdx=buildFDX({scenes:[dualScene]});
      const parsedDual=parseFDX(dualFdx).scenes[0].elements[0];check(parsedDual.type==='dualDialogue' && parsedDual.leftDialogue==='Watch out!' && parsedDual.rightDialogue==='Get down!','FDX dual dialogue round trip failed');
      check(parseFountain(buildFountain({scenes:[dualScene]})).scenes[0].dialogue==='Watch out!','Fountain dual dialogue fallback lost the first speaker');
      let incompleteRejected=false;try{buildFDX({scenes:[{heading:'INT. ROOM',elements:[{type:'dualDialogue',leftCharacter:'MARA'}]}]})}catch{incompleteRejected=true}check(incompleteRejected,'Incomplete dual FDX must not silently lose data');
      const docx=parseDOCX(window.exchangeFixtures['interchange-example-docx.xml']);
      check(docx.length===1 && docx[0].dialogue==='We should go.','DOCX fixture import failed');
      check(parseDOCX(buildDOCX({scenes:docx}))[0].dialogue==='We should go.','DOCX round trip failed');
      const embedded={format:'scriptstudio-fdx-project',version:1,project:{scenes:[{heading:'INT. ROOM - DAY',notes:'one'},{heading:'INT. ROOM - DAY',notes:'two'},{heading:'EXT. PARK - DAY',notes:'park'}],shootDays:[{scenes:[0,1,2]}],shots:[{scene:0},{scene:2}],timelineEvents:[{scene:1},{scene:2}],equipment:[],shortlists:[],storyboard:[]}};
      const restored=restoreEmbeddedProject(embedded,[{heading:'INT. ROOM - DAY'},{heading:'INT. ROOM - DAY'},{heading:'EXT. PARK - DAY'}]);
      check(restored.shootDays[0].scenes.length===1 && restored.shootDays[0].scenes[0]===2 && restored.shots[0].scene==='' && restored.shots[1].scene===2,'Duplicate scene headings must not be guessed');
      check(restored.timelineEvents[0].scene==='' && restored.timelineEvents[1].scene===2,'Embedded project timeline links were not safely remapped');
      const testProject=JSON.parse(JSON.stringify(project));testProject.timelineEvents=[{scene:0,title:'Event'}];testProject.storyboard=[{scene:0,shot:0}];project=testProject;
      check(scriptImportImpact(fountain.scenes).includes('1'),'Import impact summary missing');
      await window.studio.failRecoveryOnce();let recoveryRefused=false;try{await prepareScriptReplacement()}catch{recoveryRefused=true}check(recoveryRefused && project.scenes.length===testProject.scenes.length,'Replacement must stop when recovery creation fails');
      check(await prepareScriptReplacement(),'Import recovery point was not created');
      check(replaceImportedScenes(fountain.scenes,'fixture','fountainImportConfirm',true),'Script replacement failed');
      check(project.timelineEvents[0].scene==='' && project.storyboard[0].scene==='' && project.storyboard[0].shot==='' && project.shots[0].scene==='','Old production links must not point at unrelated scenes');
      project=sample('film');project.shootDays=[{date:'2026-01-01',scenes:[0],timeline:[]},{date:'2026-01-02',scenes:[1],timeline:[]}];project.shots=[{day:0,scene:0,description:'Interview',framing:'Close-up',movement:'Static',lens:'50 mm',sound:'',light:'',duration:1,notes:''}];project.scenes[0].lightingSetup=[{source:'LED',position:'left',modifier:'diffusion',power:'30 W',safety:'secure'}];project.equipment=[{name:'Camera',category:'Camera',quantity:1,owner:'',status:'needed',scenes:[0],shots:[],notes:''},{name:'Microphone',category:'Sound',quantity:1,owner:'',status:'checked',scenes:[1],shots:[],notes:''},{name:'Cable',category:'Power',quantity:1,owner:'',status:'packed',scenes:[],shots:[],notes:''}];
      section='script';render();
      check(document.querySelector('.action-menu #import-fountain'),'Import should be in the file menu');
      document.querySelector('#view-sidebar').click();check(document.body.dataset.sidebarHidden==='on' && document.querySelector('#view-sidebar'),'Sidebar hide/restore control missing');document.querySelector('#view-sidebar').click();check(document.body.dataset.sidebarHidden==='off','Sidebar did not restore');
      document.querySelector('#view-scene-list').click();check(document.body.dataset.sceneListHidden==='on' && document.querySelector('.script-input'),'Scene list hiding removed the editor');document.querySelector('#view-scene-list').click();
      document.querySelector('#view-quiet').click();check(document.body.dataset.quietView==='on' && document.querySelector('#print'),'Quiet toolbar removed printing');document.querySelector('#view-quiet').click();
      document.querySelector('#focus').click();check(document.body.classList.contains('focus-mode') && getComputedStyle(document.querySelector('#view-focus-exit')).display!=='none','Writing mode exit is not visible');document.querySelector('#view-focus-exit').click();check(!document.body.classList.contains('focus-mode'),'Writing mode did not close');
      document.querySelector('#view-fullscreen').click();await new Promise(resolve=>setTimeout(resolve,10));check(document.querySelector('#view-fullscreen').getAttribute('aria-pressed')==='true','Full screen status did not update');document.querySelector('#view-fullscreen').click();await new Promise(resolve=>setTimeout(resolve,10));

      const fileMenu=document.querySelector('#import-fountain').closest('.action-menu');fileMenu.open=true;fileMenu.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));check(!fileMenu.open,'Escape should close the action menu');
      const original=JSON.parse(JSON.stringify(project));project.sceneNumbersLocked=false;check(freezeSceneNumbers(),'Scene numbers could not be locked');check(project.scenes[0].sceneNumber==='1'&&project.scenes[1].sceneNumber==='2','Stable scene numbers were not assigned');
      reorderScenes(0,1);check(project.equipment[0].scenes[0]===1 && project.equipment[1].scenes[0]===0,'Equipment references must follow reordered scenes');check(project.scenes[1].sceneNumber==='1','Scene number changed after reorder');
      project=JSON.parse(JSON.stringify(original));section='script';sceneIndex=0;render();const action=document.querySelector('.script-input[data-key="action"]');action.value='A red case opens.';action.dispatchEvent(new Event('input',{bubbles:true}));action.focus();action.setSelectionRange(2,10);action.dispatchEvent(new Event('select',{bubbles:true}));document.querySelector('#tag-selection').click();check(project.scenes[0].inventory.some(item=>item.name==='red case'&&item.sourceAnchor),'Script selection was not added to breakdown');
      section='breakdown';render();check(document.querySelector('[data-inventory-jump]'),'Source navigation missing from breakdown');document.querySelector('[data-inventory-jump]').click();check(section==='script' && document.activeElement.dataset.key==='action','Breakdown source did not navigate to script');
      project.shots[0].scene=1;project.equipment[1].scenes=[1];project.shootDays[1].scenes=[1];const firstSceneId=project.scenes[0].commentTargetId;document.querySelector('#duplicate-scene').click();check(project.shots[0].scene===2 && project.equipment[1].scenes[0]===2 && project.shootDays[1].scenes[0]===2,'Duplicating a scene must shift existing references');check(project.scenes[1].commentTargetId!==firstSceneId && inventorySourceIsCurrent(project.scenes[1],project.scenes[1].inventory[0].sourceAnchor),'Copied breakdown anchor must refer to the copied scene');
      project=JSON.parse(JSON.stringify(original));section='script';sceneIndex=0;render();document.querySelector('.script-input[data-key="action"]').focus();document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',ctrlKey:true,bubbles:true,cancelable:true}));check(document.activeElement.dataset.key==='character','Writing shortcut did not move to next block');
      const flowToggle=document.querySelector('#script-flow-mode');flowToggle.checked=true;flowToggle.dispatchEvent(new Event('change',{bubbles:true}));const flowAction=document.querySelector('.script-input[data-key="action"]');flowAction.value='A line of action.'+String.fromCharCode(10);flowAction.dispatchEvent(new Event('input',{bubbles:true}));flowAction.focus();flowAction.setSelectionRange(flowAction.value.length,flowAction.value.length);flowAction.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));check(flowAction.value==='A line of action.' && document.activeElement.dataset.key==='character','Optional Enter flow did not save and advance');localStorage.setItem('takevera-script-flow','off');
      const current=project.scenes[0];current.revisionSceneId='stable-test';project.revisions=[{id:'revision-test',label:'Baseline',scenes:JSON.parse(JSON.stringify(project.scenes))}];revisionBaselineId='revision-test';render();check(!document.querySelector('.print-script .is-revised'),'Unchanged script should not have revised lines');current.action='A changed train arrives.';render();const revised=document.querySelector('.print-script .is-revised');check(revised&&revised.textContent.includes('A changed train arrives.'),'Changed script lines must be marked');check(document.querySelector('.print-script .script-page[data-revision-changed="true"]'),'Changed page marker missing');scriptViewMode='continuous';render();check(document.querySelector('.print-script'),'Reading mode must include print output');scriptViewMode='editor';revisionBaselineId='';render();
      project.scenes[0].sceneNumber='17A';const numbered=parseFDX(buildFDX({scenes:[project.scenes[0]]}));check(numbered.scenes[0].sceneNumber==='17A','FDX scene number did not round-trip');
      project.scenes[0].elements.push(dual);check(screenplayBlocks().some(block=>block.rows.some(row=>row.type==='dual-dialogue'&&row.left==='MARA'&&row.right==='ELI')),'Dual dialogue print columns missing');check(scriptReportMarkup('characterDialogue').includes('Get down!'),'Dual dialogue missing from character report');
      check(scriptReportMarkup('sceneLocations').includes(project.scenes[0].heading),'Location report missing scene');check(scriptReportMarkup('characterDialogue').includes(project.scenes[0].dialogue),'Dialogue report missing dialogue');
      project=JSON.parse(JSON.stringify(original));section='production';prodTab='equipment';render();

      check(document.querySelector('#production-section-select').value==='equipment','Current production section should be selected');
      check(document.querySelector('.production-export')&&!document.querySelector('.production-export').open,'Production export should start collapsed');
      const select = (query,value) => {const element=document.querySelector(query);check(element,'Missing '+query);element.value=value;element.dispatchEvent(new Event('change',{bubbles:true}));};
      const click = query => {const element=document.querySelector(query);check(element,'Missing '+query);element.click();};
      section='story';render();click('#open-help');check(document.querySelector('.help-context').textContent.includes(window.takeveraHelp[lang].sections.story),'Story help context missing');
      const helpSearch=document.querySelector('#help-search');helpSearch.value=lang==='nl'?'voorle':'read aloud';helpSearch.dispatchEvent(new Event('input',{bubbles:true}));check(!document.querySelector('#help-suggestions').hidden,'Help suggestions did not appear');helpSearch.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));check(helpSearch.getAttribute('aria-activedescendant')==='help-suggestion-0','Help suggestion keyboard focus missing');helpSearch.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));check(document.querySelector('#help-topics details[open]')&&document.querySelector('#help-suggestions').hidden,'Choosing a help suggestion did not open its guide');helpSearch.value='zzzznoresult';helpSearch.dispatchEvent(new Event('input',{bubbles:true}));check(!document.querySelector('#help-empty').hidden,'Help empty state missing');helpSearch.value='pdf';helpSearch.dispatchEvent(new Event('input',{bubbles:true}));document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));check(document.querySelector('#help-modal')&&document.querySelector('#help-suggestions').hidden,'Escape should first dismiss suggestions');document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));check(!document.querySelector('#help-modal'),'Escape should close help');
      lang='en';section='story';render();click('#open-help');const enHelp=document.querySelector('#help-search');enHelp.value='feedback';enHelp.dispatchEvent(new Event('input',{bubbles:true}));check(!document.querySelector('#help-suggestions').hidden,'English help suggestion missing');document.querySelector('[data-help-suggestion="0"]').click();check(document.querySelector('#help-topics details[open]'),'Clicking an English suggestion did not open the guide');click('#help-close');lang='nl';section='production';prodTab='equipment';render();
      window.confirm=()=>true;
      section='story';render();click('#story-add');select('[data-story-scene="0"]','0');const linkedStoryId=project.storyBeats[0].sceneId;click('#story-add');click('[data-beat-move="up"][data-index="1"]');check(project.storyBeats[1].sceneId===linkedStoryId,'Story cards failed to reorder');reorderScenes(0,1);check(project.scenes[1].storySceneId===linkedStoryId,'Story link did not follow scene reorder');click('[data-story-open="1"]');check(sceneIndex===1,'Story link opened the wrong scene');
      project=JSON.parse(JSON.stringify(original));section='script';sceneIndex=0;scriptViewMode='editor';project.scenes[0].dialogue='First version';render();click('#save-dialogue-alternative');project.scenes[0].dialogue='Second version';render();select('#dialogue-alternative-select','0');click('#apply-dialogue-alternative');check(project.scenes[0].dialogue==='First version','Dialogue alternative did not restore');
      project.scenes[0].action='Original scene text';render();click('#save-scene-alternative');project.scenes[0].action='New scene text';render();select('#scene-alternative-select','0');click('#apply-scene-alternative');check(project.scenes[0].action==='Original scene text'&&project.scenes[0].sceneAlternatives.some(item=>item.script.action==='New scene text'),'Scene alternative did not preserve and restore text');
      project.scenes[0].heading='';project.scenes[0].character='';project.scenes[0].dialogue='Unattributed';const qualityCodes=scriptQualityIssues().map(item=>item.code);check(qualityCodes.includes('qualityMissingHeading')&&qualityCodes.includes('qualityDialogueNoCue'),'Quality checks missed basic script issues');check(sceneReadSegments({heading:'A',elements:[{type:'dualDialogue',leftCharacter:'A',leftDialogue:'Hello',rightCharacter:'B',rightDialogue:'Hi'}]}).some(item=>item.speaker==='B'),'Read aloud omitted a dual-dialogue speaker');
      project=JSON.parse(JSON.stringify(original));section='script';sceneIndex=0;project.scenes[0].revisionSceneId='history-id';project.scenes[0].action='Current text';project.revisions=[{id:'hist',label:'Earlier',scenes:[{revisionSceneId:'history-id',action:'Earlier text'}]}];render();await showScriptHistory();click('[data-history-entry="0"]');await new Promise(resolve=>setTimeout(resolve,0));click('[data-history-restore-field="action"]');await new Promise(resolve=>setTimeout(resolve,30));check(project.scenes[0].action==='Earlier text','History did not restore selected field');
      project=JSON.parse(JSON.stringify(original));section='script';sceneIndex=0;render();const exportFeedbackTask=exportFeedbackRequest();click('#choice-modal [data-choice="export"]');await new Promise(resolve=>setTimeout(resolve,30));click('#choice-modal [data-choice="done"]');await exportFeedbackTask;const feedback=await window.studio.getFeedbackRequest();check(feedback.scenes.length===2,'Feedback request missing scenes');await window.studio.setFeedbackResponse({projectId:feedback.projectId,comments:[{sceneId:feedback.scenes[0].id,author:'Reader',text:'A useful note'}]});const importFeedbackTask=importFeedbackResponse();await new Promise(resolve=>setTimeout(resolve,10));click('#choice-modal [data-choice="apply"]');await importFeedbackTask;check(project.scenes[0].comments.some(item=>item.text==='A useful note'),'Feedback was not attached to its scene');
      project=JSON.parse(JSON.stringify(original));section='production';prodTab='equipment';render();
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
      prodTab='day';render();
      check(document.querySelector('.day-at-glance'),'Day summary missing');
      check(!document.querySelector('[data-day-panel="safety"]').open,'Safety panel should start collapsed');
      document.querySelector('[data-day-panel="safety"]').open=true;
      const exportPicker=document.querySelector('#production-export-kind');exportPicker.value='report';exportPicker.dispatchEvent(new Event('change',{bubbles:true}));
      check(document.querySelector('.book-export-controls').hidden && !document.querySelector('.report-export-controls').hidden,'Report selection should show only relevant options');
      await window.studio.failNextSave();scheduleSave();check(!(await flushPendingSave()),'Simulated save failure was not reported');
      check(!document.querySelector('#retry-save').hidden && document.querySelector('#save-state').textContent===tr('saveErrorAction'),'Save failure and retry should be visible');
      click('#retry-save');await new Promise(resolve=>setTimeout(resolve,30));check(document.querySelector('#retry-save').hidden && document.querySelector('#save-state').textContent===tr('save'),'Retry should save and clear error');
      await showBackupCenter();check(document.querySelector('#backup-center').textContent.includes(tr('healthImagesOk')),'Project health image status missing');check(document.querySelector('#backup-center-import').textContent===tr('healthPracticeRestore'),'Recovery practice entry missing');click('#backup-center-close');
      const assignedBox=document.querySelector('[data-day-scene="0"]');assignedBox.checked=false;assignedBox.dispatchEvent(new Event('change',{bubbles:true}));check(document.querySelector('#day-impact').textContent.includes(project.scenes[0].heading) && document.querySelector('#day-impact').textContent.includes('Camera'),'Scene assignment impact missing');assignedBox.checked=true;assignedBox.dispatchEvent(new Event('change',{bubbles:true}));
      const briefing=document.querySelector('[data-day="safetyResponsibilities"]');check(briefing,'Safety responsibilities field missing');briefing.value='Safety lead';briefing.dispatchEvent(new Event('input',{bubbles:true}));
      project.shootDays[0].nearestHospital='Hospital address';project.shootDays[0].emergencyContact='Private emergency number';project.shootDays[0].evacuationInstructions='Assembly point';
      check(await flushPendingSave(true),'Saving briefing failed');check((await window.studio.getSavedProject()).shootDays[0].safetyResponsibilities==='Safety lead','Briefing did not persist');
      prodTab='call';callSheetExportContacts=false;render();check(document.querySelector('[data-equipment]'),'Call sheet equipment status control missing');
      check(document.querySelector('.call-sheet').textContent.includes('Hospital address'),'Hospital must be visible without private contacts');
      check(!document.querySelector('.call-sheet').textContent.includes('Private emergency number'),'Emergency contact leaked without consent');
      check(document.querySelector('.call-sheet').textContent.includes('Assembly point'),'Evacuation instructions missing');
      check(document.querySelector('.call-readiness').textContent.includes(tr('safetyReviewed')),'Missing briefing review should be flagged');
      let printed=false;window.print=()=>{printed=true};click('#print-call-sheet');await new Promise(resolve=>setTimeout(resolve,0));check(document.querySelector('#choice-modal').textContent.includes(tr('bundleContactsExcluded')),'Day bundle did not explain excluded contacts');click('#choice-modal [data-choice="print"]');await new Promise(resolve=>setTimeout(resolve,0));check(printed && document.title.includes('2026-01-01'),'Bundle print or suggested filename missing');window.dispatchEvent(new Event('afterprint'));
      click('#call-sheet-contact-export');check(document.querySelector('.call-sheet').textContent.includes('Private emergency number'),'Contact choice did not include emergency contact');

      return 'Navigation, day overview, export choices, save failure and retry, production controls, and call sheet passed.';
    })()`);
    await win.webContents.executeJavaScript(`section='script';scriptViewMode='editor';revisionBaselineId='';project.scenes=[{heading:'INT. STATION - DAY',action:'',character:'',dialogue:'',elements:[{type:'dualDialogue',leftCharacter:'MARA',leftDialogue:'Watch out!',rightCharacter:'ELI',rightDialogue:'Get down!'}]}];sceneIndex=0;render();`);
    const {buildFeedbackHtml,validateResponse}=require('../src/feedback-export.cjs');
    const feedbackFile=path.join(temporaryData,'feedback.html'),responseFile=path.join(temporaryData,'feedback.json');
    fs.writeFileSync(feedbackFile,buildFeedbackHtml({projectId:'test-project',title:'Feedback',scenes:[{id:'scene-1',heading:'INT. TEST',text:'A test scene.'}]}));
    const feedbackWin=new BrowserWindow({show:false,webPreferences:{sandbox:true,contextIsolation:true,nodeIntegration:false}});
    try {await feedbackWin.loadFile(feedbackFile);const download=new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(new Error('Feedback download did not start')),8000);feedbackWin.webContents.session.once('will-download',(_event,item)=>{item.setSavePath(responseFile);item.once('done',(_event,state)=>{clearTimeout(timeout);state==='completed'?resolve():reject(new Error('Feedback download failed: '+state))})})});await feedbackWin.webContents.executeJavaScript(`document.querySelector('#author').value='Reader';document.querySelector('textarea').value='A useful note';document.querySelector('#download').click()`);await download;const response=validateResponse(JSON.parse(fs.readFileSync(responseFile,'utf8')));if(response.comments[0].text!=='A useful note'||response.comments[0].sceneId!=='scene-1')throw new Error('Feedback file did not preserve the response');} finally {feedbackWin.destroy()}
    const pdfBytes=await win.webContents.printToPDF({printBackground:true});
    const pdfjs=await import('pdfjs-dist/legacy/build/pdf.mjs');const pdfTask=pdfjs.getDocument({data:new Uint8Array(pdfBytes),isEvalSupported:false,useSystemFonts:true});const pdfDocument=await pdfTask.promise;let aligned=false;
    for(let pageNumber=1;pageNumber<=pdfDocument.numPages;pageNumber++){const page=await pdfDocument.getPage(pageNumber),items=(await page.getTextContent()).items, left=items.find(item=>item.str==='MARA'),right=items.find(item=>item.str==='ELI');if(left&&right&&right.transform[4]>left.transform[4]+30&&Math.abs(right.transform[5]-left.transform[5])<3)aligned=true}
    await pdfTask.destroy();if(!aligned)throw new Error('Dual dialogue PDF speakers are not on the same line in separate columns');
    if (process.env.TAKEVERA_SMOKE_SCREENSHOT) { await win.webContents.executeJavaScript("prodTab='day';render()"); win.setSize(800, 700); await new Promise(resolve => setTimeout(resolve, 100)); fs.writeFileSync(process.env.TAKEVERA_SMOKE_SCREENSHOT, (await win.webContents.capturePage()).toPNG()); }
    console.log(result);
    win.destroy();
    app.exit(0);
  } catch (error) {
    console.error(error);
    win.destroy();
    app.exit(1);
  }
}).catch(error => { console.error(error); app.exit(1); });
