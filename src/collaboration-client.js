import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { HocuspocusProvider } from '@hocuspocus/provider';

const LOCAL_ORIGIN = Object.freeze({ source: 'script-studio-local' });
const ITEM_ID = '_ssId';
const KIND = '__scriptStudioKind';
const validId = value => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(value);
const makeId = () => globalThis.crypto?.randomUUID?.().replaceAll('-', '') || Math.random().toString(36).slice(2) + Date.now().toString(36);

function stableArrayIds(items) {
  const seen = new Set();
  return items.map(item => {
    let key = item._ssId || (typeof item.id === 'string' && item.id ? `id-${item.id}` : '');
    if (!key || seen.has(key)) key = makeId();
    seen.add(key);
    item._ssId = key;
    return key;
  });
}

function typeOf(value, pathParts) {
  if (typeof value === 'string') return 'text';
  if (Array.isArray(value)) {
    const key = pathParts.at(-1);
    const knownObjectArrays = new Set(['scenes','characters','people','locations','shootDays','shots','shortlists','tasks','equipment','moodboards','moodboard','storyboard','timeline','inventory','elements','dialogueAlternatives','sceneAlternatives','items','comments','revisions','timelineEvents','productionTemplates','productionPresets','customBookSections','storyBeats']);
    const objects = value.length > 0 && value.every(item => item && typeof item === 'object' && !Array.isArray(item));
    return objects || (value.length === 0 && knownObjectArrays.has(key)) ? 'objects' : 'values';
  }
  if (value && typeof value === 'object') return 'object';
  return 'value';
}

function newNode(kind) {
  const node = new Y.Map();
  node.set(KIND, kind);
  if (kind === 'object') node.set('fields', new Y.Map());
  if (kind === 'objects') { node.set('items', new Y.Map()); node.set('order', new Y.Array()); }
  if (kind === 'values') node.set('values', new Y.Array());
  if (kind === 'text') node.set('text', new Y.Text());
  return node;
}

function applyText(text, value) {
  const before = text.toString();
  if (before === value) return;
  let prefix = 0;
  const maxPrefix = Math.min(before.length, value.length);
  while (prefix < maxPrefix && before[prefix] === value[prefix]) prefix++;
  let suffix = 0;
  while (suffix < before.length - prefix && suffix < value.length - prefix && before[before.length - 1 - suffix] === value[value.length - 1 - suffix]) suffix++;
  const removeCount = before.length - prefix - suffix;
  if (removeCount) text.delete(prefix, removeCount);
  const addition = value.slice(prefix, value.length - suffix);
  if (addition) text.insert(prefix, addition);
}

function applyPrimitiveArray(array, values) {
  const before = array.toArray();
  let prefix = 0;
  while (prefix < before.length && prefix < values.length && Object.is(before[prefix], values[prefix])) prefix++;
  let suffix = 0;
  while (suffix < before.length - prefix && suffix < values.length - prefix && Object.is(before[before.length - 1 - suffix], values[values.length - 1 - suffix])) suffix++;
  const removeCount = before.length - prefix - suffix;
  if (removeCount) array.delete(prefix, removeCount);
  const insert = values.slice(prefix, values.length - suffix);
  if (insert.length) array.insert(prefix, insert);
}

function reconcileNode(parent, key, value, pathParts = []) {
  const kind = typeOf(value, pathParts);
  let node = parent.get(key);
  if (!(node instanceof Y.Map) || node.get(KIND) !== kind) {
    node = newNode(kind);
    parent.set(key, node);
  }
  const path = [...pathParts, String(key)];
  if (kind === 'text') { applyText(node.get('text'), value); return; }
  if (kind === 'value') { if (!Object.is(node.get('value'), value)) node.set('value', value); return; }
  if (kind === 'values') { applyPrimitiveArray(node.get('values'), value); return; }
  if (kind === 'object') {
    const fields = node.get('fields');
    const entries = Object.entries(value).filter(([field]) => field !== ITEM_ID && field !== 'comments');
    const wanted = new Set(entries.map(([field]) => field));
    for (const field of [...fields.keys()]) if (!wanted.has(field)) fields.delete(field);
    for (const [field, item] of entries) reconcileNode(fields, field, item, path);
    return;
  }
  const items = node.get('items'), order = node.get('order'), ids = stableArrayIds(value);
  const wanted = new Set(ids);
  for (const itemId of [...items.keys()]) if (!wanted.has(itemId)) items.delete(itemId);
  for (let index = 0; index < value.length; index++) reconcileNode(items, ids[index], value[index], path);
  const current = order.toArray();
  for (let index = current.length - 1; index >= 0; index--) if (!wanted.has(current[index])) { order.delete(index, 1); current.splice(index, 1); }
  for (let index = 0; index < ids.length; index++) {
    if (current[index] === ids[index]) continue;
    const oldIndex = current.indexOf(ids[index]);
    if (oldIndex >= 0) { order.delete(oldIndex, 1); current.splice(oldIndex, 1); }
    order.insert(index, [ids[index]]); current.splice(index, 0, ids[index]);
  }
  if (current.length > ids.length) order.delete(ids.length, current.length - ids.length);
}

function readNode(node) {
  if (!(node instanceof Y.Map)) return node;
  const kind = node.get(KIND);
  if (kind === 'text') return node.get('text').toString();
  if (kind === 'value') return node.get('value');
  if (kind === 'values') return node.get('values').toArray();
  if (kind === 'objects') return node.get('order').toArray().map(id => {
    const item = readNode(node.get('items').get(id));
    if (item && typeof item === 'object' && !Array.isArray(item)) item[ITEM_ID] = id;
    return item;
  });
  const out = {};
  for (const [key, value] of node.get('fields')) out[key] = readNode(value);
  return out;
}

function assignIds(value) {
  if (Array.isArray(value)) {
    if (value.length === 0 || value.every(item => item && typeof item === 'object' && !Array.isArray(item))) stableArrayIds(value);
    for (const item of value) assignIds(item);
  } else if (value && typeof value === 'object') {
    for (const item of Object.values(value)) assignIds(item);
  }
}

function prepare(project) {
  assignIds(project);
  const content = structuredClone(project);
  const comments = {};
  for (let index = 0; index < (project.scenes || []).length; index++) {
    const scene = project.scenes[index];
    const sceneId = scene._ssId || (scene._ssId = makeId());
    if (Array.isArray(scene.comments) && scene.comments.length) comments[sceneId] = scene.comments;
    if (content.scenes?.[index]) delete content.scenes[index].comments;
  }
  return { content, comments };
}

function combineProject(contentRoot, commentsRoot) {
  const project = readNode(contentRoot.get('project'));
  if (!project || typeof project !== 'object') return null;
  const comments = readNode(commentsRoot.get('comments')) || {};
  for (const scene of project.scenes || []) scene.comments = comments[scene._ssId] || [];
  return project;
}

function connectDocument({ url, name, token, doc, onStatus, onAccess, onSynced, onError, awarenessUser }) {
  let synced = false;
  const provider = new HocuspocusProvider({
    url,
    name,
    document: doc,
    token,
    flushDelay: 35,
    onStatus: ({ status }) => onStatus(status),
    onAuthenticationFailed: ({ reason }) => onError(new Error(reason || 'Authentication failed')),
    onAuthenticated: ({ scope }) => onAccess(scope),
    onSynced: ({ state }) => { synced = state; onSynced(state); },
    onAwarenessChange: () => {},
  });
  provider.awareness?.setLocalStateField('user', awarenessUser);
  return { provider, get synced() { return synced; } };
}

export async function connectProject(options) {
  const { url, projectId, token, username, initialProject, onProject, onStatus, onAccess, onPresence, onError } = options;
  if (!validId(projectId) || !/^wss?:\/\//i.test(url) || !token) throw new Error('Invalid collaboration settings');
  const contentDoc = new Y.Doc();
  const commentsDoc = new Y.Doc();
  const contentPersistence = new IndexeddbPersistence(`script-studio-${projectId}-content`, contentDoc);
  const commentsPersistence = new IndexeddbPersistence(`script-studio-${projectId}-comments`, commentsDoc);
  await Promise.all([new Promise(resolve => contentPersistence.once('synced', resolve)), new Promise(resolve => commentsPersistence.once('synced', resolve))]);
  const user = { name: String(username || 'Takevera user').slice(0, 80), color: `hsl(${Math.floor(Math.random()*360)} 38% 42%)`, sceneId: '', sceneHeading: '' };
  let closed = false, published = false;
  let contentSynced = false, commentsSynced = false;
  const connectionStates = { content: 'connecting', comments: 'connecting' };
  const reportConnection = (kind, status) => {
    connectionStates[kind] = status;
    const states = Object.values(connectionStates);
    onStatus(states.every(value => value === 'connected') ? 'connected' : states.some(value => value === 'disconnected') ? 'disconnected' : 'connecting');
  };
  const contentRoot = contentDoc.getMap('scriptstudio');
  const commentsRoot = commentsDoc.getMap('scriptstudio');
  const publish = () => {
    if (closed || !contentSynced || !commentsSynced) return;
    const value = combineProject(contentRoot, commentsRoot);
    if (value) { published = true; onProject(value); }
  };
  const content = connectDocument({ url, name: `${projectId}:content`, token, doc: contentDoc, onStatus: status => reportConnection('content', status), onError, awarenessUser: user,
    onAccess: scope => onAccess('content', scope), onSynced: state => { contentSynced = state; publish(); } });
  const comments = connectDocument({ url, name: `${projectId}:comments`, token, doc: commentsDoc, onStatus: status => reportConnection('comments', status), onError, awarenessUser: user,
    onAccess: scope => onAccess('comments', scope), onSynced: state => { commentsSynced = state; publish(); } });
  const presence = () => {
    const states = content.provider.awareness?.getStates?.() || new Map();
    onPresence([...states.entries()].map(([clientId, state]) => state.user?.name ? { ...state.user, clientId } : null).filter(Boolean));
  };
  content.provider.on('awarenessChange', presence);
  contentDoc.on('update', (_update, origin) => { if (origin !== LOCAL_ORIGIN && published) publish(); });
  commentsDoc.on('update', (_update, origin) => { if (origin !== LOCAL_ORIGIN && published) publish(); });
  const setScene = (sceneId, sceneHeading) => {
    const state = content.provider.awareness?.getLocalState?.() || {};
    const currentUser = state.user || user;
    content.provider.awareness?.setLocalStateField('user', { ...currentUser, sceneId: String(sceneId || '').slice(0, 80), sceneHeading: String(sceneHeading || '').slice(0, 200) });
  };
  const update = project => {
    if (closed || !contentSynced || !commentsSynced || !project) return;
    const separated = prepare(project);
    if (content.provider.authorizedScope !== 'readonly') contentDoc.transact(() => reconcileNode(contentRoot, 'project', separated.content, []), LOCAL_ORIGIN);
    if (comments.provider.authorizedScope !== 'readonly') commentsDoc.transact(() => reconcileNode(commentsRoot, 'comments', separated.comments, []), LOCAL_ORIGIN);
  };
  const ready = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Timed out connecting to the collaboration server')), 20000);
    const check = () => {
      if (!contentSynced || !commentsSynced) return;
      clearTimeout(timeout);
      const existing = contentRoot.get('project');
      if (!existing) update(initialProject);
      else if (!commentsRoot.get('comments')) {
        const localComments = prepare(initialProject).comments;
        commentsDoc.transact(() => reconcileNode(commentsRoot, 'comments', localComments, []), LOCAL_ORIGIN);
      }
      publish();
      resolve(true);
    };
    const contentSyncedHandler = () => check();
    const commentsSyncedHandler = () => check();
    content.provider.on('synced', contentSyncedHandler);
    comments.provider.on('synced', commentsSyncedHandler);
    check();
    content.provider.on('authenticationFailed', error => { clearTimeout(timeout); reject(new Error(error?.reason || 'Content access was denied')); });
    comments.provider.on('authenticationFailed', error => { clearTimeout(timeout); reject(new Error(error?.reason || 'Comment access was denied')); });
  });
  try { await ready; } catch (error) {
    closed = true;
    content.provider.destroy(); comments.provider.destroy();
    await Promise.all([contentPersistence.destroy(), commentsPersistence.destroy()]);
    contentDoc.destroy(); commentsDoc.destroy();
    throw error;
  }
  presence();
  return {
    ready,
    update,
    setScene,
    getClientId: () => content.provider.awareness?.clientID,
    close: async () => {
      if (closed) return;
      closed = true;
      content.provider.destroy(); comments.provider.destroy();
      await Promise.all([contentPersistence.destroy(), commentsPersistence.destroy()]);
      contentDoc.destroy(); commentsDoc.destroy();
    },
    getAccess: () => ({ content: content.provider.authorizedScope, comments: comments.provider.authorizedScope }),
  };
}
