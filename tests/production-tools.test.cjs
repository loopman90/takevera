const test = require('node:test');
const assert = require('node:assert/strict');
const { equipmentForDay, equipmentWarnings, presetValues } = require('../src/production-tools.js');

const project = {
  shootDays: [{ scenes: [0] }, { scenes: [1] }],
  shots: [{ day: 0 }, { day: 1 }],
  equipment: [
    { name: 'Camera', quantity: 1, status: 'needed', scenes: [0], shots: [] },
    { name: ' camera ', quantity: 0, status: 'packed', scenes: [], shots: [0] },
    { name: 'Camera', quantity: 1, status: 'present', scenes: [1], shots: [] },
    { name: 'Recorder', quantity: 1, status: 'checked', scenes: [], shots: [] },
    { name: '', quantity: 0, status: 'needed', scenes: [], shots: [] }
  ]
};

test('equipment day filter follows assigned scenes, shots and general items', () => {
  assert.deepEqual(project.equipment.map(item => equipmentForDay(item, 0, project)), [true, true, false, true, true]);
  assert.deepEqual(project.equipment.map(item => equipmentForDay(item, 1, project)), [false, false, true, true, true]);
  assert.equal(equipmentForDay(project.equipment[0], 7, project), false);
  assert.equal(equipmentForDay({ scenes: [''], shots: [] }, 0, project), true);
});

test('equipment warnings use the selected day and describe possible duplicate rows', () => {
  assert.deepEqual(equipmentWarnings(project, 0), {
    pending: 1, zeroQuantity: 1, duplicates: [{ name: 'Camera', count: 2 }], bookingIssues: []
  });
  assert.deepEqual(equipmentWarnings(project, 1), { pending: 0, zeroQuantity: 0, duplicates: [], bookingIssues: [] });
  assert.deepEqual(equipmentWarnings({ equipment: [] }), { pending: 0, zeroQuantity: 0, duplicates: [], bookingIssues: [] });
});

test('presets retain reusable fields but do not copy project links, images or status', () => {
  const shot = presetValues('shot', { description: 'Close', framing: 'Close-up', day: 3, scene: 5, image: { src: 'file:///private' }, notes: 'Slow' });
  assert.deepEqual(shot, { description: 'Close', framing: 'Close-up', notes: 'Slow' });
  assert.deepEqual(presetValues('equipment', { name: 'Camera', quantity: 2, owner: 'Sam', scenes: [1], shots: [2], status: 'checked' }), { name: 'Camera', quantity: 2, owner: 'Sam' });
  assert.deepEqual(presetValues('lighting', { source: 'LED', position: 'left', power: '80 W', extra: 'ignored' }), { source: 'LED', position: 'left', power: '80 W' });
  assert.equal(presetValues('unknown', {}), null);
  assert.equal(presetValues('shot', null), null);
});

test('preset values survive a project JSON round trip', () => {
  const preset = { id: 'p1', kind: 'shot', name: 'Interview', values: presetValues('shot', { framing: 'Medium', duration: 0 }) };
  const restored = JSON.parse(JSON.stringify({ productionPresets: [preset] }));
  assert.deepEqual(restored.productionPresets[0], preset);
});


test('equipment booking warnings catch overlaps, incomplete entries and shared serials', () => {
  const warnings = equipmentWarnings({ equipment: [
    { name: 'Camera', units: [{ serial: 'A-1', bookings: [{ start: '2026-01-01T09:00', end: '2026-01-01T11:00' }, { start: '2026-01-01T11:00', end: '2026-01-01T12:00' }, { start: '', end: '' }] }] },
    { name: 'Camera B', units: [{ serial: 'a-1', bookings: [{ start: '2026-01-01T10:00', end: '2026-01-01T10:30' }] }] }
  ] });
  assert.equal(warnings.bookingIssues.filter(issue => issue.type === 'overlap').length, 1);
  assert.equal(warnings.bookingIssues.filter(issue => issue.type === 'incomplete').length, 1);
});

test('moving a scene changes assignments and optionally moves only matching source-day shots', () => {
  const { moveScene } = require('../src/production-tools.js');
  const draft = { scenes: [{ heading: 'A' }, { heading: 'B' }], shootDays: [{ scenes: [0, 1] }, { scenes: [1] }], shots: [{ scene: 0, day: 0 }, { scene: 0, day: 1 }, { scene: 1, day: 0 }], equipment: [{ scenes: [0] }] };
  assert.equal(moveScene(draft, 0, 0, 1, true), true);
  assert.deepEqual(draft.shootDays.map(day => day.scenes), [[1], [1, 0]]);
  assert.deepEqual(draft.shots.map(shot => shot.day), [1, 1, 0]);
  assert.deepEqual(draft.equipment[0].scenes, [0]);
  assert.equal(moveScene(draft, 0, 0, 1), false);
});

test('moving scenes respects locked days and preserves default all-scene assignments', () => {
  const { moveScene } = require('../src/production-tools.js');
  const draft = { scenes: [{}, {}], shootDays: [{ scenes: [0] }, { locked: true }] };
  assert.equal(moveScene(draft, 0, 0, 1), false);
  assert.deepEqual(draft.shootDays[0].scenes, [0]);
  draft.shootDays[1].locked = false;
  assert.equal(moveScene(draft, 0, 0, 1), true);
  assert.deepEqual(draft.shootDays[1].scenes, [0, 1]);
});

test('availability windows identify overruns and handle overnight work', () => {
  const { windowConflict } = require('../src/production-tools.js');
  const window = { start: '21:00', end: '02:00' };
  assert.equal(windowConflict(window, { time: '23:00', duration: 120 }, '20:00'), false);
  assert.equal(windowConflict(window, { time: '01:30', duration: 60 }, '20:00'), true);
  assert.equal(windowConflict(window, { time: '20:30', duration: 45 }, '20:00'), true);
  assert.equal(windowConflict({ start: '09:00', end: '' }, { time: '10:00', duration: 60 }, '08:00'), null);
  assert.equal(windowConflict({ start: '09:00', end: '09:00' }, { time: '10:00', duration: 60 }, '08:00'), null);
});

test('availability may begin before the call time', () => {
  const { windowConflict } = require('../src/production-tools.js');
  assert.equal(windowConflict({ start: '07:00', end: '18:00' }, { time: '08:30', duration: 60 }, '08:00'), false);
  assert.equal(windowConflict({ start: '07:00', end: '18:00' }, { time: '17:30', duration: 60 }, '08:00'), true);
});

test('production CSV combines scenes, days and breakdown and neutralizes spreadsheet formulas', () => {
  const { productionCsv } = require('../src/production-tools.js');
  const csv = productionCsv({ scenes: [{ sceneNumber: '2A', heading: '=Formula', location: 'Kitchen', character: 'Ada', elements: [{ type: 'character', text: 'Bob' }, { type: 'dualDialogue', leftCharacter: 'Ada', rightCharacter: 'Eve' }], inventory: [{ category: 'props', name: 'A "cup"', owner: '@crew' }] }, { heading: 'Empty' }], shootDays: [{ date: '2026-01-01', scenes: [0] }, { date: '2026-01-02', scenes: [1] }] });
  assert.match(csv, /"2A","'=Formula","Kitchen","Ada; Bob; Eve","2026-01-01","props","A ""cup""","'@crew"/);
  assert.match(csv, /"2","Empty","","","2026-01-02","","","",""/);
  assert.ok(csv.startsWith('\ufeff'));
});

test('breakdown report groups items by category and includes each assigned shoot day', () => {
  const { breakdownByCategory } = require('../src/production-tools.js');
  const report = breakdownByCategory({ scenes: [{ heading: 'A', inventory: [{ category: 'props', name: 'Cup', owner: 'Sam' }] }, { heading: 'B', props: ['Plate'] }], shootDays: [{ date: '2026-02-03', scenes: [0] }, { date: '2026-02-04', scenes: [0, 1] }] });
  assert.equal(report.length, 1);
  assert.equal(report[0].category, 'props');
  assert.deepEqual(report[0].rows.map(row => row.name), ['Cup', 'Plate']);
  assert.deepEqual(report[0].rows[0].shootDays, [{ index: 0, date: '2026-02-03' }, { index: 1, date: '2026-02-04' }]);
  assert.deepEqual(report[0].rows[1].shootDays, [{ index: 1, date: '2026-02-04' }]);
});

test('linked breakdown items share identity but retain scene-specific status and source', () => {
  const { linkInventoryItem, updateInventoryIdentity } = require('../src/production-tools.js');
  const draft = { scenes: [{ inventory: [{ category: 'props', name: 'Cup', owner: 'A', status: 'packed', sourceAnchor: { quote: 'cup' } }] }, { inventory: [] }] };
  assert.equal(linkInventoryItem(draft, 0, 0, 1, 'shared-1'), true);
  assert.equal(linkInventoryItem(draft, 0, 0, 1, 'shared-2'), false);
  assert.equal(updateInventoryIdentity(draft, 1, 0, 'name', 'Mug'), true);
  assert.equal(updateInventoryIdentity(draft, 0, 0, 'category', 'costumes'), true);
  assert.deepEqual(draft.scenes.map(scene => scene.inventory[0].name), ['Mug', 'Mug']);
  assert.deepEqual(draft.scenes.map(scene => scene.inventory[0].category), ['costumes', 'costumes']);
  assert.equal(draft.scenes[0].inventory[0].owner, 'A');
  assert.equal(draft.scenes[1].inventory[0].owner, '');
  assert.equal(draft.scenes[1].inventory[0].sourceAnchor, undefined);
  draft.scenes[1].locked = true;
  assert.equal(updateInventoryIdentity(draft, 0, 0, 'name', 'Glass'), false);
  assert.deepEqual(draft.scenes.map(scene => scene.inventory[0].name), ['Mug', 'Mug']);
});

test('cast scene report uses explicit character mappings and scene assignments', () => {
  const { castSceneReport } = require('../src/production-tools.js');
  const report = castSceneReport({ people: [{ kind: 'cast', name: 'Sam', characterName: 'Ada' }, { kind: 'cast', name: 'Jo' }, { kind: 'crew', name: 'Crew', characterName: 'Ada' }], scenes: [{ character: 'ADA' }, { elements: [{ type: 'dualDialogue', leftCharacter: 'Ada', rightCharacter: 'Bob' }] }, { character: 'Adaline' }], shootDays: [{ date: '2026-01-01', scenes: [1] }] });
  assert.equal(report.length, 2);
  assert.deepEqual(report[0].appearances.map(item => item.sceneIndex), [0, 1]);
  assert.deepEqual(report[0].appearances[0].days, []);
  assert.deepEqual(report[0].appearances[1].days, [{ index: 0, date: '2026-01-01' }]);
  assert.deepEqual(report[1].appearances, []);
});

test('multi-scene restore requires every current scene to match its recorded after state', () => {
  const { validateScriptRestore } = require('../src/production-tools.js');
  const snapshot = { version: 2, scenes: [{ sceneId: 'a', before: { text: 'old A' }, after: { text: 'A' } }, { sceneId: 'b', before: { text: 'old B' }, after: { text: 'B' } }] };
  const scenes = [{ editHistoryId: 'b', text: 'B' }, { editHistoryId: 'a', text: 'A' }];
  const projectScene = scene => ({ text: scene.text });
  assert.deepEqual(validateScriptRestore(snapshot, scenes, projectScene).indices, [1, 0]);
  scenes[0].text = 'newer B';
  assert.equal(validateScriptRestore(snapshot, scenes, projectScene).reason, 'changed');
  scenes[0].text = 'B'; scenes[0].locked = true;
  assert.equal(validateScriptRestore(snapshot, scenes, projectScene).reason, 'unavailable');
  scenes[0].locked = false; scenes.push({ editHistoryId: 'a', text: 'A' });
  assert.equal(validateScriptRestore(snapshot, scenes, projectScene).reason, 'unavailable');
});

test('legacy single-scene restore remains supported', () => {
  const { validateScriptRestore } = require('../src/production-tools.js');
  const snapshot = { version: 1, sceneId: 'a', before: { text: 'old' }, after: { text: 'new' } };
  assert.equal(validateScriptRestore(snapshot, [{ editHistoryId: 'a', text: 'new' }], scene => ({text:scene.text})).ok, true);
  assert.equal(validateScriptRestore({version:2,scenes:[]}, [], () => ({})).ok, false);
});

test('collaboration invitations reject malformed or unsafe endpoints', () => {
  const { parseCollaborationInvite } = require('../src/production-tools.js');
  const invite = {format:'takevera-invite',version:1,projectId:'project_1',endpoint:'wss://team.example/socket',token:'secret'};
  assert.deepEqual(parseCollaborationInvite(JSON.stringify(invite)), {projectId:'project_1',endpoint:'wss://team.example/socket',token:'secret'});
  assert.equal(parseCollaborationInvite(JSON.stringify({...invite,endpoint:'ws://team.example'})), null);
  assert.equal(parseCollaborationInvite(JSON.stringify({...invite,endpoint:'wss://user:pass@team.example'})), null);
  assert.equal(parseCollaborationInvite(JSON.stringify({...invite,projectId:'../other'})), null);
  assert.equal(parseCollaborationInvite(JSON.stringify({...invite,endpoint:'ws://127.0.0.1:1234'})).projectId, 'project_1');
  assert.equal(parseCollaborationInvite('not JSON'), null);
});

test('timeline scene references follow insertion, reorder, deletion and preserve unlinked rows', () => {
  const { remapTimelineScenes } = require('../src/production-tools.js');
  const project = {shootDays:[{timeline:[{sceneIndex:0,title:'A'},{sceneIndex:2,title:'C'},{title:'Break'}]}]};
  remapTimelineScenes(project, n => Number(n)>=1?Number(n)+1:Number(n));
  assert.deepEqual(project.shootDays[0].timeline.map(row=>row.sceneIndex), [0,3,undefined]);
  remapTimelineScenes(project, n => n===3?1:n===1||n===2?n+1:n);
  assert.deepEqual(project.shootDays[0].timeline.map(row=>row.sceneIndex), [0,1,undefined]);
  remapTimelineScenes(project, n => n===1?null:n>1?n-1:n);
  assert.equal(project.shootDays[0].timeline[1].sceneIndex, null);
  assert.equal(project.shootDays[0].timeline[1].sceneReferenceMissing, true);
  assert.equal(project.shootDays[0].timeline[1].title, 'C');
});

test('planning links explicit cast character cues and shots on the selected day', () => {
  const { scheduleSceneLinks } = require('../src/production-tools.js');
  const project = { scenes:[{character:'Ada',elements:[{type:'character',text:'Bob'},{type:'dualDialogue',leftCharacter:'Cara',rightCharacter:'Ada'}]}], people:[{kind:'cast',name:'Actor',characterName:'ADA',day:'1'},{kind:'cast',name:'Bob actor',characterName:'Bob',day:'all'},{kind:'crew',name:'Cara',characterName:'Cara'}], shots:[{scene:0,day:1},{scene:0,day:0},{scene:'',day:1}] };
  const links=scheduleSceneLinks(project,0,1);
  assert.deepEqual(links.cues,['Ada','Bob','Cara']);
  assert.deepEqual(links.people.map(person=>person.name),['Actor','Bob actor']);
  assert.deepEqual(links.missing,['Cara']);
  assert.equal(links.shots.length,1);
});

test('issued call sheets become changed after content edits but ignore distribution status', () => {
  const { callSheetSnapshot, callSheetIssueState } = require('../src/production-tools.js');
  const project={title:'Film',shootDays:[{date:'2026-01-01',call:'08:00',scenes:[0]}],scenes:[{heading:'A'}],people:[],locations:[],shots:[],equipment:[],tasks:[]};
  assert.equal(callSheetIssueState(project,0),'draft');
  project.shootDays[0].callDistribution={issuedAt:'2026-01-01',issuedSnapshot:callSheetSnapshot(project,0),recipients:[]};
  assert.equal(callSheetIssueState(project,0),'issued');
  project.shootDays[0].callDistribution.recipients.push({name:'Sam',status:'sent'});
  assert.equal(callSheetIssueState(project,0),'issued');
  project.scenes[0].heading='Changed';
  assert.equal(callSheetIssueState(project,0),'changed');
  delete project.shootDays[0].callDistribution.issuedSnapshot;
  assert.equal(callSheetIssueState(project,0),'unverified');
});

test('collaboration permissions preserve pre-existing disabled controls', () => {
  const { collaborationDisabled } = require('../src/production-tools.js');
  assert.equal(collaborationDisabled(true, false, false, false), true);
  assert.equal(collaborationDisabled(false, true, false, false), true);
  assert.equal(collaborationDisabled(false, true, false, true), false);
  assert.equal(collaborationDisabled(false, false, true, true), true);
  assert.equal(collaborationDisabled(false, false, false, false), false);
});

test('issue history is comparable after JSON round trip and collaboration metadata', () => {
  const { callSheetSnapshot, callSheetIssueState } = require('../src/production-tools.js');
  const p = {title:'Film',shootDays:[{date:'2026-01-01',scenes:[0]}],scenes:[{heading:'A'}],locations:[],people:[],shots:[],equipment:[],tasks:[]};
  p.shootDays[0].callDistribution={version:1,issuedAt:'2026-01-01',issues:[{version:1,snapshot:callSheetSnapshot(p,0)}]};
  const restored=JSON.parse(JSON.stringify(p));
  restored.shootDays[0].callDistribution.issues[0].snapshot.scenes[0]._ssId='collab-id';
  assert.equal(callSheetIssueState(restored,0),'issued');
  restored.shootDays[0].date='2026-01-02';
  assert.equal(callSheetIssueState(restored,0),'changed');
});

test('scene preparation finds assigned days, shots and equipment through scene and shot links', () => {
  const { sceneProductionContext } = require('../src/production-tools.js');
  const p={scenes:[{location:'Park',inventory:[{name:'Cup'}]},{heading:'B'}],shootDays:[{scenes:[0]},{scenes:[1]},{scenes:[0]}],shots:[{scene:0},{scene:1},{scene:'0'}],equipment:[{name:'Tripod',scenes:[0]},{name:'Lens',shots:[2]},{name:'Other',scenes:[1]}]};
  assert.deepEqual(sceneProductionContext(p,0),{days:[0,2],shots:[0,2],equipment:['Tripod','Lens'],inventoryCount:1,location:'Park'});
  assert.equal(sceneProductionContext(p,7),null);
});

test('closeout reports unrecorded budget separately and does not infer returns', () => {
  const { closeoutSummary } = require('../src/production-tools.js');
  const summary=closeoutSummary({tasks:[{status:'done'},{status:'todo'}],equipment:[{name:'Camera',status:'present'},{name:''}],budget:{items:[{estimate:'100',actual:'90'},{estimate:'50',actual:''}]}});
  assert.deepEqual(summary,{tasks:1,equipment:1,budgetItems:2,estimate:150,actual:90,missingActual:1});
});
