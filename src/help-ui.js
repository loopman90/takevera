function showHelp() {
  if (document.getElementById('help-modal')) return;
  const copy = window.takeveraHelp[lang] || window.takeveraHelp.en;
  const previousFocus = document.activeElement;
  const area = section === 'production' ? (copy.production[prodTab] || copy.sections.production) : (copy.sections[section] || (section.startsWith('custom-') ? copy.sections.custom : copy.sections.home));
  const overlay = document.createElement('div');
  overlay.className = 'modal-backdrop';
  overlay.id = 'help-modal';
  overlay.innerHTML = `<section class="modal help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title"><div class="help-heading"><div><div class="eyebrow">TAKEVERA</div><h2 id="help-title">${esc(copy.title)}</h2></div><button type="button" class="btn" id="help-close">${esc(tr('close'))}</button></div><div id="help-home"><p class="help-intro">${esc(copy.subtitle)}</p><div class="help-context"><strong>${esc(copy.context)}</strong><p>${esc(area)}</p></div><label class="help-search-label" for="help-search">${esc(copy.search)}</label><div class="help-search-wrap"><input id="help-search" type="search" autocomplete="off" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="help-suggestions" aria-describedby="help-search-hint"><div id="help-suggestions" class="help-suggestions" role="listbox" aria-label="${esc(copy.suggestions)}" hidden></div></div><small id="help-search-hint">${esc(copy.searchHint)}</small><h3>${esc(copy.topics)}</h3><div id="help-topics"></div><p id="help-empty" hidden>${esc(copy.empty)}</p><div class="help-actions"><button type="button" class="btn primary" id="help-guide">${esc(copy.guide)}</button><button type="button" class="btn" id="help-intro">${esc(copy.intro)}</button><button type="button" class="btn" id="help-glossary">${esc(copy.glossary)}</button></div></div><div id="help-guide-view" hidden><button type="button" class="btn" id="help-back">← ${esc(copy.guideBack)}</button><div id="help-guide-content" class="help-guide-content" aria-live="polite"></div></div></section>`;
  app.append(overlay);
  const find = selector => overlay.querySelector(selector);
  const topics = find('#help-topics');
  const input = find('#help-search'), suggestions = find('#help-suggestions');
  const normalise = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase(lang).trim();
  let suggested = [], active = -1;
  const hideSuggestions = () => { suggestions.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); active = -1; };
  const selectSuggestion = index => {
    const item = suggested[index]; if (!item) return;
    input.value = item.title; hideSuggestions(); draw(false);
    const detail = [...topics.querySelectorAll('details')].find(node => node.querySelector('summary')?.textContent === item.title); if (detail) detail.open = true;
    input.focus();
  };
  const updateActive = () => {
    suggestions.querySelectorAll('[role="option"]').forEach((option, index) => option.setAttribute('aria-selected', String(index === active)));
    if (active < 0) input.removeAttribute('aria-activedescendant');
    else { input.setAttribute('aria-activedescendant', `help-suggestion-${active}`); suggestions.children[active]?.scrollIntoView({block:'nearest'}); }
  };
  const draw = (showSuggestions = true) => {
    const words = normalise(input.value).split(/\s+/).filter(Boolean);
    const entries = copy.entries.filter(item => { const text = normalise(`${item.title} ${item.tags} ${item.steps.join(' ')}`); return words.every(word => text.includes(word)); });
    topics.innerHTML = entries.map(item => `<details class="help-topic"><summary>${esc(item.title)}</summary><ol>${item.steps.map(step => `<li>${esc(step)}</li>`).join('')}</ol></details>`).join('');
    find('#help-empty').hidden = entries.length > 0;
    suggested = words.length ? entries.map((item, index) => { const title = normalise(item.title), tags = normalise(item.tags); return {item, index, score: words.reduce((sum, word) => sum + (title.includes(word) ? 2 : tags.includes(word) ? 1 : 0), 0)}; }).sort((a, b) => b.score - a.score || a.index - b.index).slice(0, 7).map(result => result.item) : [];
    suggestions.innerHTML = suggested.map((item, index) => `<div role="option" id="help-suggestion-${index}" aria-selected="false" data-help-suggestion="${index}">${esc(item.title)}</div>`).join('');
    active = -1;
    suggestions.hidden = !showSuggestions || !suggested.length;
    input.setAttribute('aria-expanded', String(!suggestions.hidden));
    input.removeAttribute('aria-activedescendant');
  };
  suggestions.addEventListener('mousedown', event => event.preventDefault());
  suggestions.addEventListener('click', event => { const option = event.target.closest('[data-help-suggestion]'); if (option) selectSuggestion(Number(option.dataset.helpSuggestion)); });
  input.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!suggested.length) return;
      event.preventDefault(); suggestions.hidden = false; input.setAttribute('aria-expanded', 'true');
      active = event.key === 'ArrowDown' ? (active + 1) % suggested.length : (active <= 0 ? suggested.length - 1 : active - 1); updateActive();
    } else if (event.key === 'Enter' && !suggestions.hidden && suggested.length) {
      event.preventDefault(); selectSuggestion(active < 0 ? 0 : active);
    }
  });
  const close = () => { document.removeEventListener('keydown', onKey, true); overlay.remove(); if (previousFocus?.isConnected) previousFocus.focus(); };
  const onKey = event => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); if (!suggestions.hidden) hideSuggestions(); else close(); } };
  document.addEventListener('keydown', onKey, true);
  find('#help-close').onclick = close;
  input.addEventListener('input', () => draw());
  input.addEventListener('blur', () => hideSuggestions());
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
  draw(false);
  input.focus();
}
