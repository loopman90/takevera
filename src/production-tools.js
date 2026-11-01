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

  return { equipmentForDay, equipmentWarnings, presetValues };
});
