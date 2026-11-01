import { Server } from '@hocuspocus/server';
import * as Y from 'yjs';
import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { getDataDirectory, readAccessFile, tokenMatches, validProjectId } from './access.mjs';
import { pruneAuditLog, recordAudit } from './audit.mjs';

const directory = getDataDirectory();
const documentsDirectory = path.join(directory, 'documents');
const documentNamePattern = /^([a-zA-Z0-9_-]{1,80}):(content|comments)$/;
const maximumDocumentBytes = 32 * 1024 * 1024;

function parseDocumentName(value) {
  const match = documentNamePattern.exec(value || '');
  if (!match || !validProjectId(match[1])) throw new Error('Invalid collaboration document name');
  return { projectId: match[1], documentType: match[2] };
}

function documentPath(documentName) {
  const { projectId, documentType } = parseDocumentName(documentName);
  return path.join(documentsDirectory, `${projectId}.${documentType}.yjs`);
}

async function resolveInvite(documentName, token) {
  const { projectId, documentType } = parseDocumentName(documentName);
  const access = await readAccessFile(directory);
  const invite = access.invites.find(item => item.projectId === projectId && !item.revokedAt && tokenMatches(token, item.tokenHash));
  if (!invite) throw new Error('This invitation is invalid or has been revoked');
  if (documentType === 'content' && ['reader', 'commenter'].includes(invite.role)) return { ...invite, readOnly: true };
  if (documentType === 'comments' && invite.role === 'reader') return { ...invite, readOnly: true };
  return { ...invite, readOnly: false };
}

async function loadDocument(documentName) {
  const file = documentPath(documentName);
  try {
    const info = await stat(file);
    if (info.size > maximumDocumentBytes) throw new Error('Collaboration document exceeds the 32 MB limit');
    const document = new Y.Doc();
    Y.applyUpdate(document, new Uint8Array(await readFile(file)));
    return document;
  } catch (error) {
    if (error.code === 'ENOENT') return new Y.Doc();
    throw error;
  }
}

async function storeDocument(documentName, document) {
  const file = documentPath(documentName);
  const update = Y.encodeStateAsUpdate(document);
  if (update.byteLength > maximumDocumentBytes) throw new Error('Collaboration document exceeds the 32 MB limit');
  await mkdir(documentsDirectory, { recursive: true, mode: 0o700 });
  const temporary = `${file}.${process.pid}.${randomBytes(4).toString('hex')}.tmp`;
  await writeFile(temporary, update, { mode: 0o600 });
  await rename(temporary, file);
}

await mkdir(directory, { recursive: true, mode: 0o700 });
const initialAccess = await readAccessFile(directory);
const auditRetentionDays = initialAccess.auditRetentionDays ?? 90;
await pruneAuditLog(auditRetentionDays);

const server = new Server({
  name: 'Script Studio collaboration server',
  address: process.env.SCRIPTSTUDIO_COLLAB_HOST || '127.0.0.1',
  port: Number(process.env.SCRIPTSTUDIO_COLLAB_PORT || 1234),
  debounce: 1500,
  maxDebounce: 10000,
  maxUnauthenticatedQueueSize: 1024 * 1024,
  maxUnauthenticatedQueueMessages: 100,
  maxPendingDocuments: 8,
  websocketOptions: { maxPayload: 10 * 1024 * 1024 },
  async onAuthenticate(data) {
    let invite;
    try { invite = await resolveInvite(data.documentName, data.token); }
    catch (error) {
      let identifiers = {};
      try { identifiers = parseDocumentName(data.documentName); } catch {}
      await recordAudit({ action: 'authentication_rejected', projectId: identifiers.projectId, documentType: identifiers.documentType, result: 'denied' });
      throw error;
    }
    data.connectionConfig.readOnly = invite.readOnly;
    await recordAudit({ action: 'authenticated', projectId: invite.projectId, documentType: parseDocumentName(data.documentName).documentType, inviteId: invite.id, name: invite.name, role: invite.role, result: 'allowed' });
    return { inviteId: invite.id, projectId: invite.projectId, role: invite.role, name: invite.name };
  },
  async beforeHandleMessage({ context, documentName }) {
    if (!context?.inviteId) { await recordAudit({ action: 'message_rejected', result: 'unauthenticated' }); throw new Error('Authentication required'); }
    const access = await readAccessFile(directory);
    const invite = access.invites.find(item => item.id === context.inviteId && item.projectId === context.projectId && !item.revokedAt);
    if (!invite) { await recordAudit({ action: 'message_rejected', projectId: context.projectId, inviteId: context.inviteId, name: context.name, role: context.role, result: 'revoked' }); throw new Error('This invitation has been revoked'); }
    parseDocumentName(documentName);
  },
  async onChange({ context, documentName }) {
    const { documentType } = parseDocumentName(documentName);
    await recordAudit({ action: 'document_changed', projectId: context?.projectId, documentType, inviteId: context?.inviteId, name: context?.name, role: context?.role });
  },
  async onDisconnect({ context, documentName }) {
    let documentType;
    try { documentType = parseDocumentName(documentName).documentType; } catch {}
    await recordAudit({ action: 'disconnected', projectId: context?.projectId, documentType, inviteId: context?.inviteId, name: context?.name, role: context?.role });
  },
  async onLoadDocument({ documentName }) { return loadDocument(documentName); },
  async onStoreDocument({ documentName, document }) { await storeDocument(documentName, document); },
  async onListen({ port }) { console.log(`Collaboration server listening on port ${port} (default bind: ${process.env.SCRIPTSTUDIO_COLLAB_HOST || '127.0.0.1'})`); },
});

server.listen();
const retentionRefresh = setInterval(async () => {
  try {
    const access = await readAccessFile(directory);
    await pruneAuditLog(access.auditRetentionDays ?? 90);
  } catch (error) { console.error(`Could not apply audit retention: ${error.message}`); }
}, 60 * 60 * 1000);
retentionRefresh.unref();

async function stop() {
  clearInterval(retentionRefresh);
  try { await server.destroy(); }
  finally { process.exit(0); }
}
process.once('SIGINT', stop);
process.once('SIGTERM', stop);
