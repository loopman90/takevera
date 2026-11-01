import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const validRoles = new Set(['owner', 'editor', 'commenter', 'reader']);
export const validProjectId = value => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(value);
export const tokenDigest = token => createHash('sha256').update(token).digest('hex');
export const tokenMatches = (token, digest) => {
  if (typeof token !== 'string' || typeof digest !== 'string') return false;
  const actual = Buffer.from(tokenDigest(token), 'hex');
  const expected = Buffer.from(digest, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
};

export function getDataDirectory() {
  return path.resolve(process.env.SCRIPTSTUDIO_COLLAB_DIR || './scriptstudio-collaboration-data');
}

export async function readAccessFile(directory = getDataDirectory()) {
  const file = path.join(directory, 'access.json');
  let access;
  try { access = JSON.parse(await readFile(file, 'utf8')); }
  catch (error) {
    if (error.code === 'ENOENT') throw new Error(`No access file found at ${file}. Run: npm run collab:admin -- init ${directory}`);
    throw new Error(`Could not read collaboration access file: ${error.message}`);
  }
  if (access?.version !== 1 || !Array.isArray(access.invites)) throw new Error('Invalid collaboration access file');
  if (access.auditRetentionDays !== undefined && (!Number.isInteger(access.auditRetentionDays) || access.auditRetentionDays < 1 || access.auditRetentionDays > 3650)) throw new Error('Invalid audit retention setting; expected 1 to 3650 days');
  return access;
}

export async function writeAccessFile(directory, access) {
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const file = path.join(directory, 'access.json');
  const temporary = `${file}.${process.pid}.${randomBytes(4).toString('hex')}.tmp`;
  await writeFile(temporary, `${JSON.stringify(access, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
  await rename(temporary, file);
}
