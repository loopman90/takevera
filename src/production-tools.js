/* Shared production helpers: usable by the renderer and by Node. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TakeveraProductionTools = api;
})(typeof window === 'object' ? window : null, function () {
  'use strict';

  const indexes = values => (Array.isArray(values) ? values : [])
    .filter(value => value !== '' && value !== null && value !== undefined)
    .map(Number).filter(value => Number.isInteger(value) && value >= 0);

  function equipmentForDay(item, dayIndex, project) {
    const day = project?.shootDays?.[dayIndex];
    if (!day || !item) return false;
    const scenes = indexes(item.scenes), shots = indexes(item.shots);
    if (!scenes.length && !shots.length) return true;
    const dayScenes = new Set(indexes(day.scenes));
    return scenes.some(index => dayScenes.has(index)) || shots.some(index => {
      const shot = project.shots?.[index];
      return shot && Number(shot.day ?? 0) === dayIndex;
    });
  }

  function equipmentWarnings(project, dayIndex = null) {
    const items = (project?.equipment || []).filter(item =>
      dayIndex === null || equipmentForDay(item, dayIndex, project));
    const namedItems = items.filter(item => String(item.name || '').trim());
    const pending = namedItems.filter(item => (item.status || 'needed') === 'needed').length;
    const zeroQuantity = namedItems.filter(item => Number(item.quantity ?? 1) <= 0).length;
    const names = new Map();
    for (const item of items) {
      const name = String(item.name || '').trim();
      if (!name) continue;
      const key = name.toLocaleLowerCase();
      const group = names.get(key) || { name, count: 0 };
      group.count++;
      names.set(key, group);
    }
    const bookingIssues = [];
    // A unit is one physical object. A repeated serial groups that same object across rows.
    const groups = new Map();
    for (const item of project?.equipment || []) for (const unit of Array.isArray(item.units) ? item.units : []) {
      const serial = String(unit.serial || '').trim().toLocaleLowerCase();
      const key = serial ? `serial:${serial}` : unit;
      const name = [item.name, unit.label || unit.serial].filter(Boolean).join(' · ') || '—';
      const bookings = groups.get(key) || [];
      for (const booking of Array.isArray(unit.bookings) ? unit.bookings : []) {
        const start = Date.parse(booking.start || ''), end = Date.parse(booking.end || '');
        if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) bookingIssues.push({type:'incomplete',name});
        else bookings.push({start,end,name});
      }
      groups.set(key,bookings);
    }
    for (const bookings of groups.values()) for (let i=0;i<bookings.length;i++) for (let j=i+1;j<bookings.length;j++)
      if (bookings[i].start < bookings[j].end && bookings[j].start < bookings[i].end) bookingIssues.push({type:'overlap',name:bookings[i].name,start:Math.max(bookings[i].start,bookings[j].start),end:Math.min(bookings[i].end,bookings[j].end)});
    return { pending, zeroQuantity, duplicates: [...names.values()].filter(group => group.count > 1), bookingIssues };
  }

  function sceneProductionContext(project, sceneIndex) {
    const scene=project?.scenes?.[sceneIndex]; if(!scene)return null;
    const days=(project.shootDays||[]).map((day,index)=>(!Array.isArray(day.scenes)||day.scenes.includes(sceneIndex))?index:-1).filter(index=>index>=0);
    const shots=(project.shots||[]).map((shot,index)=>shot.scene!==''&&shot.scene!=null&&Number(shot.scene)===sceneIndex?index:-1).filter(index=>index>=0);
    const shotSet=new Set(shots);
    const equipment=(project.equipment||[]).filter(item=>indexes(item.scenes).includes(sceneIndex)||indexes(item.shots).some(index=>shotSet.has(index))).map(item=>String(item.name||'')).filter(Boolean);
    return {days,shots,equipment,inventoryCount:(scene.inventory||[]).length,location:String(scene.location||'')};
  }

  function closeoutSummary(project) {
    const tasks=(project?.tasks||[]).filter(item=>!['done','gereed'].includes(String(item.status||'').trim().toLocaleLowerCase())).length;
    const equipment=(project?.equipment||[]).filter(item=>String(item.name||'').trim()).length;
    const budget=project?.budget?.items||[],estimate=budget.reduce((n,item)=>n+(Number(item.estimate)||0),0),actual=budget.reduce((n,item)=>n+(Number(item.actual)||0),0),missingActual=budget.filter(item=>item.actual==null||String(item.actual).trim()==='').length;
    return {tasks,equipment,budgetItems:budget.length,estimate,actual,missingActual};
  }

  function collaborationDisabled(baseDisabled, contentReadOnly, commentsReadOnly, commentAction) {
    return !!baseDisabled || (commentAction ? !!commentsReadOnly : !!contentReadOnly);
  }

  function remapTimelineScenes(project, remap) {
    for (const day of project?.shootDays || []) for (const row of day.timeline || []) {
      if (row.sceneIndex === '' || row.sceneIndex == null) continue;
      const next = remap(row.sceneIndex);
      if (next == null) { row.sceneIndex = null; row.sceneReferenceMissing = true; }
      else { if (Number(row.sceneIndex)!==Number(next)) row.sceneReferenceNeedsReview=true; row.sceneIndex = next; }
    }
  }

  function sceneCharacters(scene) {
    if (!scene) return [];
    const cues = [scene.character];
    for (const element of scene.elements || []) {
      if (element.type === 'character') cues.push(element.text);
      if (element.type === 'dualDialogue') cues.push(element.leftCharacter, element.rightCharacter);
    }
    return [...new Set(cues.map(value => String(value || '').trim()).filter(Boolean))];
  }
  function scheduleSceneLinks(project, sceneIndex, dayIndex) {
    const scene=project?.scenes?.[sceneIndex];
    const cues=sceneCharacters(scene), keys=new Set(cues.map(name=>name.toLocaleLowerCase()));
    const people=(project?.people||[]).filter(person=>person.kind==='cast' && String(person.characterName||'').trim() && keys.has(String(person.characterName).trim().toLocaleLowerCase()));
    const matched=new Set(people.map(person=>String(person.characterName).trim().toLocaleLowerCase()));
    const missing=cues.filter(name=>!matched.has(name.toLocaleLowerCase()));
    const shots=(project?.shots||[]).filter(shot=>shot.scene!==''&&shot.scene!=null&&Number(shot.scene)===sceneIndex&&Number(shot.day??0)===dayIndex);
    return {cues,people,missing,shots};
  }

  function cleanCallData(value){if(Array.isArray(value))return value.map(cleanCallData);if(value&&typeof value==='object'){const result={};for(const key of Object.keys(value).sort())if(!['_ssId','updatedAt','callDistribution','locked','lockedAt'].includes(key))result[key]=cleanCallData(value[key]);return result}return value};
  function callSheetSnapshot(project, dayIndex) {
    const day=project?.shootDays?.[dayIndex]; if(!day)return null;
    const sceneIds=Array.isArray(day.scenes)?indexes(day.scenes):(project.scenes||[]).map((_,index)=>index);
    const scenes=sceneIds.map(index=>{const scene=project.scenes?.[index];return {index,heading:scene?.heading,sceneNumber:scene?.sceneNumber,location:scene?.location,character:scene?.character,duration:scene?.duration,continuity:scene?.continuity}});
    const people=(project.people||[]).filter(person=>person.day==='all'||Number(person.day)===dayIndex);
    const shots=(project.shots||[]).filter(shot=>Number(shot.day??0)===dayIndex).map(shot=>({scene:shot.scene,sceneHeading:project.scenes?.[shot.scene]?.heading,description:shot.description,framing:shot.framing,movement:shot.movement,lens:shot.lens,sound:shot.sound,light:shot.light,duration:shot.duration,notes:shot.notes}));
    const equipment=(project.equipment||[]).filter(item=>equipmentForDay(item,dayIndex,project)).map(item=>({name:item.name,category:item.category,quantity:item.quantity,owner:item.owner,status:item.status,scenes:item.scenes,shots:item.shots}));
    const tasks=(project.tasks||[]).filter(task=>task.day==null||task.day===''||task.day==='all'||Number(task.day)===dayIndex);
    return cleanCallData({title:project.title,day,scenes,locations:project.locations,people,shots,equipment,tasks});
  }
  function callSheetIssueState(project,dayIndex){const distribution=project?.shootDays?.[dayIndex]?.callDistribution;if(!distribution?.issuedAt)return 'draft';const record=(distribution.issues||[]).find(issue=>issue.version===distribution.version),snapshot=record?.snapshot||distribution.issuedSnapshot;if(!snapshot)return 'unverified';return JSON.stringify(callSheetSnapshot(project,dayIndex))===JSON.stringify(cleanCallData(snapshot))?'issued':'changed';}

  function windowConflict(window, activity, callTime) {
    const parse = value => { const match = /^(\d{2}):(\d{2})$/.exec(value || ''); if (!match) return null; const h = Number(match[1]), m = Number(match[2]); return h < 24 && m < 60 ? h * 60 + m : null; };
    const start = parse(window?.start), end = parse(window?.end), time = parse(activity?.time), call = parse(callTime);
    const duration = Number(activity?.duration);
    if (start === null || end === null || start === end || time === null || !Number.isFinite(duration) || duration <= 0) return null;
    const activityStart = call !== null && time < call ? time + 1440 : time;
    const windowEnd = end <= start ? end + 1440 : end;
    return ![-1440, 0, 1440].some(offset => activityStart >= start + offset && activityStart + duration <= windowEnd + offset);
  }

  function linkInventoryItem(project, sourceSceneIndex, sourceItemIndex, targetSceneIndex, sharedId) {
    const sourceScene = project?.scenes?.[sourceSceneIndex], targetScene = project?.scenes?.[targetSceneIndex];
    const source = sourceScene?.inventory?.[sourceItemIndex];
    if (!sourceScene || !targetScene || sourceScene === targetScene || sourceScene.locked || targetScene.locked || !source || !String(source.name || '').trim()) return false;
    const group = source.sharedItemId || sharedId;
    if (typeof group !== 'string' || !group || (targetScene.inventory || []).some(item => item.sharedItemId === group)) return false;
    source.sharedItemId = group;
    (targetScene.inventory ||= []).push({ sharedItemId: group, category: source.category || 'props', name: source.name, owner: '', status: 'needed' });
    return true;
  }

  function updateInventoryIdentity(project, sceneIndex, itemIndex, key, value) {
    const scene = project?.scenes?.[sceneIndex], item = scene?.inventory?.[itemIndex];
    if (!scene || scene.locked || !item || !['name', 'category'].includes(key)) return false;
    const linked = item.sharedItemId ? (project.scenes || []).flatMap(current => (current.inventory || []).filter(candidate => candidate.sharedItemId === item.sharedItemId).map(candidate => ({scene:current,item:candidate}))) : [{scene,item}];
    if (linked.some(entry => entry.scene.locked)) return false;
    for (const entry of linked) entry.item[key] = value;
    return true;
  }

  function parseCollaborationInvite(text) {
    if (typeof text !== 'string' || text.length > 4096) return null;
    let invite; try { invite = JSON.parse(text); } catch { return null; }
    if (!invite || invite.format !== 'takevera-invite' || invite.version !== 1 || typeof invite.projectId !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(invite.projectId) || typeof invite.endpoint !== 'string' || invite.endpoint.length > 2048 || typeof invite.token !== 'string' || !invite.token.trim() || invite.token.length > 512) return null;
    try { const url = new URL(invite.endpoint); const local = ['localhost','127.0.0.1','::1','[::1]'].includes(url.hostname); if (!['ws:','wss:'].includes(url.protocol) || url.username || url.password || url.search || url.hash || url.protocol === 'ws:' && !local) return null; } catch { return null; }
    return {projectId:invite.projectId,endpoint:invite.endpoint,token:invite.token};
  }

  function validateScriptRestore(snapshot, scenes, projectScene) {
    const entries = snapshot?.version === 1 ? [snapshot] : snapshot?.version === 2 && Array.isArray(snapshot.scenes) ? snapshot.scenes : [];
    if (!entries.length || !Array.isArray(scenes) || typeof projectScene !== 'function') return { ok:false, reason:'invalid' };
    const indices = [], seen = new Set();
    for (const entry of entries) {
      if (!entry?.sceneId || !entry.before || !entry.after || seen.has(entry.sceneId)) return { ok:false, reason:'invalid' };
      seen.add(entry.sceneId);
      const matches = scenes.map((scene,index) => scene?.editHistoryId === entry.sceneId ? index : -1).filter(index => index >= 0);
      if (matches.length !== 1 || scenes[matches[0]].locked) return { ok:false, reason:'unavailable' };
      if (JSON.stringify(projectScene(scenes[matches[0]])) !== JSON.stringify(entry.after)) return { ok:false, reason:'changed' };
      indices.push(matches[0]);
    }
    return {ok:true, indices, entries};
  }

  function castSceneReport(project) {
    const scenes = Array.isArray(project?.scenes) ? project.scenes : [], days = Array.isArray(project?.shootDays) ? project.shootDays : [];
    const normalize = value => String(value || '').trim().toLocaleLowerCase();
    return (project?.people || []).filter(person => person.kind === 'cast').map(person => {
      const name = normalize(person.characterName);
      const appearances = name ? scenes.flatMap((scene, sceneIndex) => {
        const cues = [scene.character];
        for (const element of scene.elements || []) { if (element.type === 'character') cues.push(element.text); if (element.type === 'dualDialogue') cues.push(element.leftCharacter, element.rightCharacter); }
        if (!cues.some(cue => normalize(cue) === name)) return [];
        return [{sceneIndex, days:days.map((day,index) => !Array.isArray(day.scenes) || day.scenes.includes(sceneIndex) ? {index,date:day.date || ''} : null).filter(Boolean)}];
      }) : [];
      return { name: String(person.name || ''), characterName: String(person.characterName || ''), appearances };
    });
  }

  function breakdownByCategory(project) {
    const groups = new Map(), scenes = Array.isArray(project?.scenes) ? project.scenes : [], days = Array.isArray(project?.shootDays) ? project.shootDays : [];
    for (const [sceneIndex, scene] of scenes.entries()) {
      const inventory = Array.isArray(scene.inventory) ? scene.inventory : ['props','costumes','equipment','soundCues','makeup','effects','transport'].flatMap(category => (Array.isArray(scene[category]) ? scene[category] : []).map(name => ({category,name})));
      for (const item of inventory) {
        if (!String(item.name || '').trim()) continue;
        const category = String(item.category || '').trim(), key = category.toLocaleLowerCase();
        if (!groups.has(key)) groups.set(key, { category, rows: [] });
        const shootDays = days.map((day,index) => (!Array.isArray(day.scenes) || day.scenes.includes(sceneIndex)) ? {index,date:day.date || ''} : null).filter(Boolean);
        groups.get(key).rows.push({ sceneIndex, name: String(item.name), owner: String(item.owner || ''), status: String(item.status || ''), shootDays });
      }
    }
    return [...groups.values()];
  }

  function productionCsv(project) {
    const scenes = Array.isArray(project?.scenes) ? project.scenes : [], days = Array.isArray(project?.shootDays) ? project.shootDays : [];
    const rows = [['Scene', 'Heading', 'Location', 'Characters', 'Shoot days', 'Category', 'Item', 'Owner', 'Status']];
    scenes.forEach((scene, index) => {
      const characters = [scene.character];
      for (const el of scene.elements || []) { if (el.type === 'character') characters.push(el.text); if (el.type === 'dualDialogue') characters.push(el.leftCharacter, el.rightCharacter); }
      const names = [...new Set(characters.map(value => String(value || '').trim()).filter(Boolean))].join('; ');
      const assigned = days.map((day, dayIndex) => (!Array.isArray(day.scenes) || day.scenes.includes(index)) ? (day.date || String(dayIndex + 1)) : '').filter(Boolean).join('; ');
      const inventory = Array.isArray(scene.inventory) ? scene.inventory : ['props','costumes','equipment','soundCues','makeup','effects','transport'].flatMap(category => (Array.isArray(scene[category]) ? scene[category] : []).map(name => ({category,name})));
      const base = [scene.sceneNumber || index + 1, scene.heading || '', scene.location || '', names, assigned];
      if (!inventory.length) rows.push([...base, '', '', '', '']);
      else for (const item of inventory) rows.push([...base, item.category || '', item.name || '', item.owner || '', item.status || '']);
    });
    const cell = value => { let text = String(value ?? ''); if (/^[\s\u0000-\u001f]*[=+@-]/.test(text)) text = "'" + text; return '"' + text.replace(/"/g, '""') + '"'; };
    return '\uFEFF' + rows.map(row => row.map(cell).join(',')).join('\r\n') + '\r\n';
  }

  function moveScene(project, sceneIndex, fromIndex, toIndex, moveShots = false) {
    const days = project?.shootDays, scenes = project?.scenes;
    if (!Array.isArray(days) || !Array.isArray(scenes) || !Number.isInteger(sceneIndex) || !scenes[sceneIndex] || fromIndex === toIndex) return false;
    const from = days[fromIndex], to = days[toIndex];
    if (!from || !to || from.locked || to.locked || !Array.isArray(from.scenes) || !from.scenes.includes(sceneIndex)) return false;
    from.scenes = from.scenes.filter(index => index !== sceneIndex);
    if (!Array.isArray(to.scenes)) to.scenes = scenes.map((_, index) => index);
    if (!to.scenes.includes(sceneIndex)) to.scenes.push(sceneIndex);
    if (moveShots) for (const shot of project.shots || []) {
      if (shot.scene !== '' && shot.scene != null && Number(shot.scene) === sceneIndex && Number(shot.day ?? 0) === fromIndex) shot.day = toIndex;
    }
    return true;
  }

  const presetFields = {
    shot: ['description', 'framing', 'movement', 'lens', 'sound', 'light', 'duration', 'notes'],
    lighting: ['source', 'position', 'modifier', 'power', 'safety'],
    equipment: ['name', 'category', 'quantity', 'owner', 'notes']
  };
  function presetValues(kind, source) {
    if (!presetFields[kind] || !source || typeof source !== 'object') return null;
    const values = {};
    for (const field of presetFields[kind]) {
      const value = source[field];
      if (typeof value === 'string' || typeof value === 'number') values[field] = value;
    }
    return values;
  }

  return { equipmentForDay, equipmentWarnings, presetValues, moveScene, windowConflict, productionCsv, breakdownByCategory, linkInventoryItem, updateInventoryIdentity, castSceneReport, validateScriptRestore, parseCollaborationInvite, remapTimelineScenes, sceneCharacters, scheduleSceneLinks, callSheetSnapshot, callSheetIssueState, collaborationDisabled, sceneProductionContext, closeoutSummary };
});
