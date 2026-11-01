import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDataDirectory, readAccessFile, tokenDigest, tokenMatches, validProjectId, validRoles, writeAccessFile } from './access.mjs';
import { pruneAuditLog, readAuditLog, recordAudit, validateRetentionDays } from './audit.mjs';

const port = Number(process.env.SCRIPTSTUDIO_ADMIN_PORT || 1235);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('SCRIPTSTUDIO_ADMIN_PORT must be from 1024 to 65535');
const host = '127.0.0.1';
const origin = `http://${host}:${port}`;
const directory = getDataDirectory();
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const localesDirectory = path.join(currentDirectory, '..', 'locales');
const adminToken = randomBytes(32).toString('base64url');
const assetFiles = {
  '/': ['admin-ui.html', 'text/html; charset=utf-8'],
  '/admin.js': ['admin-ui.js', 'text/javascript; charset=utf-8'],
  '/admin.css': ['admin-ui.css', 'text/css; charset=utf-8'],
};
let accessQueue = Promise.resolve();

function send(response, status, body, type = 'application/json; charset=utf-8') {
  response.writeHead(status, {
    'Content-Type': type,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
  });
  response.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

function authorized(request) {
  const value = request.headers.authorization || '';
  const match = /^Bearer ([A-Za-z0-9_-]{32,128})$/.exec(value);
  return !!match && tokenMatches(match[1], tokenDigest(adminToken));
}

function sameOrigin(request) {
  return !request.headers.origin || request.headers.origin === origin;
}

async function readBody(request) {
  let size = 0; const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 64 * 1024) throw new Error('Request is too large');
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks).toString('utf8');
  try { return JSON.parse(body || '{}'); }
  catch { throw new Error('Invalid JSON request'); }
}

function serializeAccess(change) {
  const operation = accessQueue.then(async () => {
    const access = await readAccessFile(directory);
    const result = await change(access);
    await writeAccessFile(directory, access);
    return result;
  });
  accessQueue = operation.catch(() => {});
  return operation;
}

async function api(request, response, url) {
  if (!sameOrigin(request)) return send(response, 403, { error: 'Cross-origin request denied' });
  const method = request.method || 'GET';
  if (method === 'GET' && url.pathname === '/api/locale') {
    const language = url.searchParams.get('language') === 'nl' ? 'nl' : 'en';
    const locale = JSON.parse(await readFile(path.join(localesDirectory, `${language}.json`), 'utf8'));
    return send(response, 200, Object.fromEntries(Object.entries(locale).filter(([key]) => key.startsWith('admin'))));
  }
  if (!authorized(request)) return send(response, 401, { error: 'Enter the temporary admin token printed when this service started.' });
  if (method === 'GET' && url.pathname === '/api/status') {
    const access = await readAccessFile(directory);
    let documents = [];
    try { documents = await readdir(path.join(directory, 'documents')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    const latest = await readAuditLog({ limit: 1 });
    return send(response, 200, {
      activeInvites: access.invites.filter(item => !item.revokedAt).length,
      revokedInvites: access.invites.filter(item => item.revokedAt).length,
      documents: documents.filter(file => file.endsWith('.yjs')).length,
      retentionDays: access.auditRetentionDays ?? 90,
      latestAuditAt: latest[0]?.at || null,
    });
  }
  if (method === 'GET' && url.pathname === '/api/invites') {
    const access = await readAccessFile(directory);
    const projectId = url.searchParams.get('projectId') || '';
    if (projectId && !validProjectId(projectId)) return send(response, 400, { error: 'Invalid project ID' });
    const invites = access.invites.filter(item => !projectId || item.projectId === projectId)
      .map(({ id, projectId: idOfProject, role, name, createdAt, revokedAt }) => ({ id, projectId: idOfProject, role, name, createdAt, revokedAt }));
    return send(response, 200, invites);
  }
  if (method === 'GET' && url.pathname === '/api/audit') {
    const projectId = url.searchParams.get('projectId') || undefined;
    const limit = Number(url.searchParams.get('limit') || 100);
    if (projectId && !validProjectId(projectId)) return send(response, 400, { error: 'Invalid project ID' });
    if (!Number.isInteger(limit) || limit < 1 || limit > 1000) return send(response, 400, { error: 'Limit must be from 1 to 1000' });
    const access = await readAccessFile(directory);
    await pruneAuditLog(access.auditRetentionDays ?? 90);
    return send(response, 200, await readAuditLog({ projectId, limit }));
  }
  if (method === 'POST' && url.pathname === '/api/invites') {
    const body = await readBody(request);
    const projectId = String(body.projectId || '').trim();
    const role = String(body.role || '');
    const name = String(body.name || '').trim();
    if (!validProjectId(projectId) || !validRoles.has(role) || !name || name.length > 100) return send(response, 400, { error: 'Enter a valid project ID, role, and display name (1–100 characters).' });
    const token = randomBytes(32).toString('base64url');
    const invite = { id: randomBytes(9).toString('base64url'), projectId, role, name, tokenHash: tokenDigest(token), createdAt: new Date().toISOString(), revokedAt: null };
    await serializeAccess(access => { access.invites.push(invite); });
    await recordAudit({ action: 'invite_created', projectId, inviteId: invite.id, name, role });
    return send(response, 201, { invite: { id: invite.id, projectId, role, name, createdAt: invite.createdAt, revokedAt: null }, token });
  }
  const revokeMatch = /^\/api\/invites\/([A-Za-z0-9_-]{1,80})\/revoke$/.exec(url.pathname);
  if (method === 'POST' && revokeMatch) {
    let revoked;
    try {
      revoked = await serializeAccess(access => {
        const invite = access.invites.find(item => item.id === revokeMatch[1] && !item.revokedAt);
        if (!invite) throw new Error('Active invitation not found');
        invite.revokedAt = new Date().toISOString();
        return { projectId: invite.projectId, inviteId: invite.id, name: invite.name, role: invite.role };
      });
    } catch (error) { return send(response, 404, { error: error.message }); }
    await recordAudit({ action: 'invite_revoked', ...revoked });
    return send(response, 200, { revoked: true });
  }
  if (method === 'POST' && url.pathname === '/api/retention') {
    const body = await readBody(request);
    let days;
    try { days = validateRetentionDays(Number(body.days)); }
    catch (error) { return send(response, 400, { error: error.message }); }
    await serializeAccess(access => { access.auditRetentionDays = days; });
    await pruneAuditLog(days);
    await recordAudit({ action: 'retention_changed', result: `${days} days` });
    return send(response, 200, { retentionDays: days });
  }
  return send(response, 404, { error: 'Not found' });
}

const server = createServer(async (request, response) => {
  try {
    const hostHeader = String(request.headers.host || '').toLowerCase();
    if (hostHeader !== `${host}:${port}`) return send(response, 403, { error: 'Host not allowed' });
    const url = new URL(request.url || '/', origin);
    if (url.pathname.startsWith('/api/')) return await api(request, response, url);
    if (request.method !== 'GET' || !assetFiles[url.pathname]) return send(response, 404, 'Not found', 'text/plain; charset=utf-8');
    const [file, type] = assetFiles[url.pathname];
    return send(response, 200, await readFile(path.join(currentDirectory, file)), type);
  } catch (error) {
    console.error(`Admin request failed: ${error.message}`);
    if (!response.headersSent) send(response, 500, { error: 'The admin request could not be completed.' });
    else response.destroy();
  }
});

server.listen(port, host, () => {
  console.log(`Script Studio local admin UI: ${origin}`);
  console.log(`Temporary admin token (shown once; do not share): ${adminToken}`);
  console.log('The admin UI binds to 127.0.0.1 only. Use a secure SSH tunnel for remote access.');
});
process.once('SIGINT', () => server.close(() => process.exit(0)));
process.once('SIGTERM', () => server.close(() => process.exit(0)));
