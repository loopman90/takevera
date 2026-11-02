const { contextBridge } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
let savedProject = null, failNextSave = false;

contextBridge.exposeInMainWorld('studioLocale', {
  get: async language => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'locales', `${language}.json`), 'utf8'))
});
contextBridge.exposeInMainWorld('studio', {
  listProjects: async () => [],
  listRecoverable: async () => [],
  projectFolder: async () => '/isolated-smoke-projects',
  getAISettings: async () => ({}),
  getSyncSettings: async () => ({ connected: false }),
  getCollaborationSettings: async () => ({}),
  getCollaborationAdminSettings: async () => ({}),
  onImageDrop: () => {},
  setImageDropProject: () => {},
  setInterfaceLanguage: async () => {},
  setSpellcheckerLanguage: async () => {},
  checkLinkedImages: async () => [],
  addImage: async () => ({ src: 'data:image/png;base64,iVBORw0KGgo=', storageMode: 'copied' }),
  failNextSave: async () => { failNextSave = true; },
  saveProject: async project => { if (failNextSave) { failNextSave = false; throw new Error('Simulated storage failure'); } savedProject = JSON.parse(JSON.stringify(project)); return Date.now(); },
  getSavedProject: async () => savedProject
});
