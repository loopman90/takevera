const $ = selector => document.querySelector(selector);
let token = '';
let language = 'en';
let locale = {};

function text(key) { return locale[`admin${key}`] || key; }
function translate() {
  document.documentElement.lang = language;
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.dataset.i18n.replace(/^admin/, '');
    if (locale[element.dataset.i18n]) element.textContent = locale[element.dataset.i18n];
  });
}
async function api(url, options = {}) {
  const headers = { Authorization: `Bearer ${token}`, ...(options.headers || {}) };
  if (options.body) headers['Content-Type'] = 'application/json';
  const response = await fetch(url, { ...options, headers, cache: 'no-store' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}
function cell(row, value, className = '') {
  const element = document.createElement('td');
  element.textContent = value || '—';
  if (className) element.className = className;
  row.append(element);
  return element;
}
function date(value) {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleString(language === 'nl' ? 'nl-NL' : 'en-GB');
}
function feedback(element, message, error = false) {
  element.textContent = message || '';
  element.classList.toggle('error', error);
}
async function loadLocale() {
  const response = await fetch(`/api/locale?language=${language}`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Language load failed (${response.status})`);
  locale = await response.json();
  translate();
}
async function refreshDashboard() {
  const [status, invites] = await Promise.all([api('/api/status'), loadInvites()]);
  $('#active-count').textContent = status.activeInvites;
  $('#revoked-count').textContent = status.revokedInvites;
  $('#document-count').textContent = status.documents;
  $('#latest-audit').textContent = date(status.latestAuditAt);
  $('#retention-days').value = status.retentionDays;
  renderInvites(invites);
  await refreshAudit();
}
async function loadInvites() {
  const projectId = $('#project-filter').value.trim();
  const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
  return api(`/api/invites${query}`);
}
function renderInvites(invites) {
  const tbody = $('#invite-rows');
  tbody.replaceChildren();
  for (const invite of invites) {
    const row = document.createElement('tr');
    cell(row, invite.name);
    cell(row, invite.projectId, 'mono');
    cell(row, text(invite.role[0].toUpperCase() + invite.role.slice(1)));
    cell(row, date(invite.createdAt));
    const status = cell(row, invite.revokedAt ? text('Revoked') : text('Active'));
    status.classList.add(invite.revokedAt ? 'status-revoked' : 'status-active');
    const actions = document.createElement('td');
    if (!invite.revokedAt) {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'btn danger'; button.textContent = text('Revoke');
      button.addEventListener('click', async () => {
        if (!window.confirm(text('ConfirmRevoke').replace('{name}', invite.name))) return;
        button.disabled = true;
        try { await api(`/api/invites/${encodeURIComponent(invite.id)}/revoke`, { method: 'POST' }); await refreshDashboard(); }
        catch (error) { button.disabled = false; feedback($('#page-feedback'), error.message, true); }
      });
      actions.append(button);
    }
    row.append(actions);
    tbody.append(row);
  }
  $('#invite-empty').hidden = invites.length > 0;
}
async function refreshAudit() {
  const projectId = $('#project-filter').value.trim();
  const query = new URLSearchParams({ limit: '100' });
  if (projectId) query.set('projectId', projectId);
  const events = await api(`/api/audit?${query}`);
  const tbody = $('#audit-rows'); tbody.replaceChildren();
  for (const event of events) {
    const row = document.createElement('tr');
    cell(row, date(event.at)); cell(row, event.action); cell(row, event.projectId, 'mono');
    cell(row, event.documentType); cell(row, event.name); cell(row, event.role); cell(row, event.result);
    tbody.append(row);
  }
  $('#audit-empty').hidden = events.length > 0;
}

$('#language').addEventListener('change', async event => {
  language = event.target.value;
  try { await loadLocale(); } catch (error) { feedback($('#page-feedback'), error.message, true); }
});
$('#login-form').addEventListener('submit', async event => {
  event.preventDefault();
  token = $('#token').value.trim();
  feedback($('#login-feedback'), '');
  try {
    await loadLocale();
    await api('/api/status');
    $('#login-card').hidden = true; $('#dashboard').hidden = false; $('#logout').hidden = false;
    await refreshDashboard();
  } catch (error) {
    token = ''; $('#token').value = '';
    feedback($('#login-feedback'), error.message, true);
  }
});
$('#logout').addEventListener('click', () => {
  token = ''; locale = {}; $('#token').value = '';
  $('#login-card').hidden = false; $('#dashboard').hidden = true; $('#logout').hidden = true;
  feedback($('#page-feedback'), ''); translate();
});
$('#invite-form').addEventListener('submit', async event => {
  event.preventDefault();
  feedback($('#invite-feedback'), ''); $('#token-result').hidden = true;
  const form = new FormData(event.currentTarget);
  try {
    const result = await api('/api/invites', { method: 'POST', body: JSON.stringify({ projectId: form.get('projectId'), name: form.get('name'), role: form.get('role') }) });
    $('#created-token').textContent = result.token; $('#token-result').hidden = false; event.currentTarget.reset();
    await refreshDashboard();
  } catch (error) { feedback($('#invite-feedback'), error.message, true); }
});
$('#copy-token').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('#created-token').textContent); feedback($('#invite-feedback'), text('TokenCopied')); }
  catch { feedback($('#invite-feedback'), text('CopyFailed'), true); }
});
$('#retention-form').addEventListener('submit', async event => {
  event.preventDefault();
  try {
    const result = await api('/api/retention', { method: 'POST', body: JSON.stringify({ days: Number($('#retention-days').value) }) });
    feedback($('#retention-feedback'), text('RetentionSaved').replace('{days}', result.retentionDays)); await refreshDashboard();
  } catch (error) { feedback($('#retention-feedback'), error.message, true); }
});
$('#refresh').addEventListener('click', async () => { try { await refreshDashboard(); feedback($('#page-feedback'), text('Refreshed')); } catch (error) { feedback($('#page-feedback'), error.message, true); } });
$('#filter-invites').addEventListener('click', async () => { try { renderInvites(await loadInvites()); await refreshAudit(); } catch (error) { feedback($('#page-feedback'), error.message, true); } });
$('#refresh-audit').addEventListener('click', async () => { try { await refreshAudit(); } catch (error) { feedback($('#page-feedback'), error.message, true); } });
translate();

loadLocale().catch(error => feedback($('#login-feedback'), error.message, true));
