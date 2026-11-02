const { contextBridge } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
let savedProject = null, failNextSave = false, failRecovery = false, feedbackRequest = null, feedbackResponse = null;

contextBridge.exposeInMainWorld('studioLocale', {
  get: async language => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'locales', `${language}.json`), 'utf8'))
});
contextBridge.exposeInMainWorld('studio', {
  listProjects: async () => [],
  listRecoverable: async () => [],
  listBackups: async () => [],
  failRecoveryOnce: async () => { failRecovery = true; },
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
  createRecoveryBackup: async () => { if (failRecovery) { failRecovery = false; return null; } return savedProject ? 'recovery-test.bak' : null; },
  exportFeedback: async request => { feedbackRequest = JSON.parse(JSON.stringify(request)); return { canceled: false }; },
  getFeedbackRequest: async () => feedbackRequest,
  setFeedbackResponse: async response => { feedbackResponse = response; },
  importFeedback: async () => feedbackResponse,
  getSavedProject: async () => savedProject
});
