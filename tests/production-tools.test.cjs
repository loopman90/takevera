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
