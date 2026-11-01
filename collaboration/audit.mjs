import { appendFile, chmod, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { getDataDirectory } from './access.mjs';

const auditFile = path.join(getDataDirectory(), 'audit.jsonl');
const maximumAuditBytes = 32 * 1024 * 1024;
let writeQueue = Promise.resolve();

export function validateRetentionDays(value) {
  if (!Number.isInteger(value) || value < 1 || value > 3650) throw new Error('Audit retention must be an integer from 1 to 3650 days');
  return value;
}

function normalizedEvent(event) {
  const clean = {};
  for (const key of ['action', 'projectId', 'documentType', 'inviteId', 'name', 'role', 'result']) {
    if (typeof event[key] === 'string' && event[key].length) clean[key] = event[key].slice(0, 120);
  }
  clean.at = new Date().toISOString();
  return clean;
}

export async function recordAudit(event) {
  const operation = writeQueue.then(async () => {
    await mkdir(path.dirname(auditFile), { recursive: true, mode: 0o700 });
    await appendFile(auditFile, `${JSON.stringify(normalizedEvent(event))}\n`, { encoding: 'utf8', mode: 0o600 });
    await chmod(auditFile, 0o600);
  });
  writeQueue = operation.catch(error => console.error(`Could not write collaboration audit log: ${error.message}`));
  return writeQueue;
}

export async function pruneAuditLog(retentionDays) {
  const keepDays = validateRetentionDays(retentionDays);
  const operation = writeQueue.then(async () => {
    let content;
    try { content = await readFile(auditFile, 'utf8'); }
    catch (error) { if (error.code === 'ENOENT') return; throw error; }
    const cutoff = Date.now() - keepDays * 86400000;
    const rows = content.split('\n').filter(line => {
      if (!line) return false;
      try { const row = JSON.parse(line); const time = Date.parse(row.at); return Number.isFinite(time) && time >= cutoff; }
      catch { return false; }
    });
    let kept = rows.join('\n') + (rows.length ? '\n' : '');
    if (Buffer.byteLength(kept) > maximumAuditBytes) {
      const lines = kept.split('\n');
      let bytes = 0, retained = [];
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i]; if (!line) continue;
        const size = Buffer.byteLength(line) + 1;
        if (bytes + size > maximumAuditBytes) break;
        retained.push(line); bytes += size;
      }
      kept = retained.reverse().join('\n') + (retained.length ? '\n' : '');
    }
    const temporary = `${auditFile}.${process.pid}.${randomBytes(4).toString('hex')}.tmp`;
    await writeFile(temporary, kept, { encoding: 'utf8', mode: 0o600 });
    await rename(temporary, auditFile);
    await chmod(auditFile, 0o600);
  });
  writeQueue = operation.catch(error => console.error(`Could not prune collaboration audit log: ${error.message}`));
  await operation;
}

export async function readAuditLog({ limit = 100, projectId } = {}) {
  const count = Math.max(1, Math.min(1000, Number.isInteger(limit) ? limit : 100));
  await writeQueue;
  let rows;
  try { rows = (await readFile(auditFile, 'utf8')).split('\n').filter(Boolean); }
  catch (error) { if (error.code === 'ENOENT') return []; throw error; }
  const events = [];
  for (let i = rows.length - 1; i >= 0 && events.length < count; i--) {
    try { const event = JSON.parse(rows[i]); if (!projectId || event.projectId === projectId) events.push(event); }
    catch { /* Ignore malformed historical records. */ }
  }
  return events;
}
