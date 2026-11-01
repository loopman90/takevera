function showHelp() {
  if (document.getElementById('help-modal')) return;
  const copy = window.takeveraHelp[lang] || window.takeveraHelp.en;
  const previousFocus = document.activeElement;
  const area = section === 'production' ? (copy.production[prodTab] || copy.sections.production) : (copy.sections[section] || copy.sections.home);
  const overlay = document.createElement('div');
  overlay.className = 'modal-backdrop';
  overlay.id = 'help-modal';
  overlay.innerHTML = `<section class="modal help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title"><div class="help-heading"><div><div class="eyebrow">TAKEVERA</div><h2 id="help-title">${esc(copy.title)}</h2></div><button type="button" class="btn" id="help-close">${esc(tr('close'))}</button></div><div id="help-home"><p class="help-intro">${esc(copy.subtitle)}</p><div class="help-context"><strong>${esc(copy.context)}</strong><p>${esc(area)}</p></div><label class="help-search-label" for="help-search">${esc(copy.search)}</label><input id="help-search" type="search" autocomplete="off"><h3>${esc(copy.topics)}</h3><div id="help-topics"></div><p id="help-empty" hidden>${esc(copy.empty)}</p><div class="help-actions"><button type="button" class="btn primary" id="help-guide">${esc(copy.guide)}</button><button type="button" class="btn" id="help-intro">${esc(copy.intro)}</button><button type="button" class="btn" id="help-glossary">${esc(copy.glossary)}</button></div></div><div id="help-guide-view" hidden><button type="button" class="btn" id="help-back">← ${esc(copy.guideBack)}</button><div id="help-guide-content" class="help-guide-content" aria-live="polite"></div></div></section>`;
  app.append(overlay);
  const find = selector => overlay.querySelector(selector);
  const topics = find('#help-topics');
  const draw = () => {
    const query = find('#help-search').value.trim().toLocaleLowerCase(lang);
    const entries = copy.entries.filter(item => `${item.title} ${item.tags} ${item.steps.join(' ')}`.toLocaleLowerCase(lang).includes(query));
    topics.innerHTML = entries.map(item => `<details class="help-topic"><summary>${esc(item.title)}</summary><ol>${item.steps.map(step => `<li>${esc(step)}</li>`).join('')}</ol></details>`).join('');
    find('#help-empty').hidden = entries.length > 0;
  };
  const close = () => { document.removeEventListener('keydown', onKey, true); overlay.remove(); if (previousFocus?.isConnected) previousFocus.focus(); };
  const onKey = event => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); } };
  document.addEventListener('keydown', onKey, true);
  find('#help-close').onclick = close;
  find('#help-search').oninput = draw;
  find('#help-intro').onclick = () => { close(); showIntro(); };
  find('#help-glossary').onclick = () => { close(); showGlossary(); };
  find('#help-back').onclick = () => { find('#help-guide-view').hidden = true; find('#help-home').hidden = false; find('#help-guide').focus(); };
  find('#help-guide').onclick = async () => {
    find('#help-home').hidden = true;
    find('#help-guide-view').hidden = false;
    find('#help-guide-content').textContent = copy.guideLoading;
    find('#help-back').focus();
    try {
      const guide = await window.studio.helpGuide(lang);
      if (!overlay.isConnected) return;
      const renderInline = text => esc(text).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>');
      find('#help-guide-content').innerHTML = guide.split(/\r?\n/).filter(line => line.trim()).map(line => {
        const heading = /^(#{1,3})\s+(.+)$/.exec(line);
        if (heading) { const level = Math.min(4, heading[1].length + 1); return `<h${level}>${renderInline(heading[2])}</h${level}>`; }
        return `<p>${renderInline(line.replace(/^[-*]\s+/, '• '))}</p>`;
      }).join('');
    } catch { if (overlay.isConnected) find('#help-guide-content').textContent = copy.guideError; }
  };
  draw();
  find('#help-search').focus();
}
