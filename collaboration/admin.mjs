#!/usr/bin/env node
import { randomBytes } from 'node:crypto';
import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { getDataDirectory, readAccessFile, tokenDigest, validProjectId, validRoles, writeAccessFile } from './access.mjs';
import { pruneAuditLog, readAuditLog, recordAudit, validateRetentionDays } from './audit.mjs';

const [command, ...args] = process.argv.slice(2);
const directory = getDataDirectory();
const usage = `Script Studio collaboration admin\n\nCommands:\n  init [directory]\n  status\n  invite <project-id> <owner|editor|commenter|reader> <display-name>\n  revoke <invite-id>\n  list [project-id]\n  audit [--project <project-id>] [--limit <1..1000>]\n  retention [days]\n\nSet SCRIPTSTUDIO_COLLAB_DIR to select the server data directory.`;

async function main() {
  if (command === 'init') {
    const target = args[0] ? path.resolve(args[0]) : directory;
    await mkdir(target, { recursive: true, mode: 0o700 });
    try { await readAccessFile(target); console.log(`Access file already exists: ${target}/access.json`); return; }
    catch (error) { if (!error.message.startsWith('No access file found')) throw error; }
    await writeAccessFile(target, { version: 1, invites: [], auditRetentionDays: 90 });
    console.log(`Initialized collaboration data at ${target}`);
    console.log('Create the project owner invite with: npm run collab:admin -- invite <project-id> owner <display-name>');
    return;
  }
  if (command === 'invite') {
    const [projectId, role, ...nameParts] = args;
    const name = nameParts.join(' ').trim();
    if (!validProjectId(projectId) || !validRoles.has(role) || !name || name.length > 100) throw new Error(usage);
    const access = await readAccessFile(directory);
    const token = randomBytes(32).toString('base64url');
    const invite = { id: randomBytes(9).toString('base64url'), projectId, role, name, tokenHash: tokenDigest(token), createdAt: new Date().toISOString(), revokedAt: null };
    access.invites.push(invite);
    await writeAccessFile(directory, access);
    await recordAudit({ action: 'invite_created', projectId, inviteId: invite.id, name, role });
    console.log(`Invitation created for ${name} (${role}) in project ${projectId}.`);
    console.log(`Invitation ID: ${invite.id}`);
    console.log(`Access token (copy now; it is not stored in plaintext): ${token}`);
    return;
  }
  if (command === 'revoke') {
    const [inviteId] = args;
    if (!inviteId) throw new Error(usage);
    const access = await readAccessFile(directory);
    const invite = access.invites.find(item => item.id === inviteId && !item.revokedAt);
    if (!invite) throw new Error('Active invitation not found');
    invite.revokedAt = new Date().toISOString();
    await writeAccessFile(directory, access);
    await recordAudit({ action: 'invite_revoked', projectId: invite.projectId, inviteId: invite.id, name: invite.name, role: invite.role });
    console.log(`Revoked ${invite.name} (${invite.role}) for project ${invite.projectId}.`);
    return;
  }
  if (command === 'list') {
    const [projectId] = args;
    if (projectId && !validProjectId(projectId)) throw new Error('Invalid project ID');
    const access = await readAccessFile(directory);
    const invites = access.invites.filter(item => !projectId || item.projectId === projectId);
    if (!invites.length) { console.log('No invitations found.'); return; }
    for (const invite of invites) console.log(`${invite.id}\t${invite.projectId}\t${invite.role}\t${invite.name}\t${invite.revokedAt ? 'revoked' : 'active'}`);
    return;
  }
  if (command === 'retention') {
    const access = await readAccessFile(directory);
    if (!args[0]) { console.log(`Audit retention: ${access.auditRetentionDays ?? 90} days`); return; }
    const days = validateRetentionDays(Number(args[0]));
    access.auditRetentionDays = days;
    await writeAccessFile(directory, access);
    await pruneAuditLog(days);
    await recordAudit({ action: 'retention_changed', result: `${days} days` });
    console.log(`Audit retention set to ${days} days. A running server applies the setting during its next hourly cleanup.`);
    return;
  }
  if (command === 'audit') {
    let projectId, limit = 100;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--project' && args[i + 1]) projectId = args[++i];
      else if (args[i] === '--limit' && args[i + 1]) limit = Number(args[++i]);
      else throw new Error(usage);
    }
    if (projectId && !validProjectId(projectId)) throw new Error('Invalid project ID');
    if (!Number.isInteger(limit) || limit < 1 || limit > 1000) throw new Error('Audit limit must be from 1 to 1000');
    const access = await readAccessFile(directory);
    await pruneAuditLog(access.auditRetentionDays ?? 90);
    const events = await readAuditLog({ limit, projectId });
    if (!events.length) { console.log('No audit events found.'); return; }
    for (const event of events) console.log(`${event.at}\t${event.action}\t${event.projectId || '-'}\t${event.documentType || '-'}\t${event.name || '-'}\t${event.role || '-'}\t${event.result || '-'}`);
    return;
  }
  if (command === 'status') {
    const access = await readAccessFile(directory);
    let documents = [];
    try { documents = await readdir(path.join(directory, 'documents')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    const events = await readAuditLog({ limit: 1 });
    console.log(`Data directory: ${directory}`);
    console.log(`Active invitations: ${access.invites.filter(item => !item.revokedAt).length}`);
    console.log(`Revoked invitations: ${access.invites.filter(item => item.revokedAt).length}`);
    console.log(`Stored collaboration documents: ${documents.filter(file => file.endsWith('.yjs')).length}`);
    console.log(`Audit retention: ${access.auditRetentionDays ?? 90} days`);
    console.log(`Latest audit event: ${events[0]?.at || 'none'}`);
    return;
  }
  console.log(usage);
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
