(function () {
  'use strict';

  const listEl = document.getElementById('diary-list');
  const filterArea = document.getElementById('filter-area');
  const filterQuery = document.getElementById('filter-query');
  const countEl = document.getElementById('entry-count');
  const emptyEl = document.getElementById('empty-state');

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatDate(iso) {
    if (!iso) return '—';
    const [y, m, d] = iso.split('-');
    if (!y || !m || !d) return escapeHtml(iso);
    return `${d}.${m}.${y}`;
  }

  function areaLabels(keys) {
    if (!keys || !keys.length) return '';
    return keys
      .map((k) => {
        const a = typeof DIARY_FOCUS_AREAS !== 'undefined' ? DIARY_FOCUS_AREAS[k] : null;
        return a ? a.label : k;
      })
      .map((label) => `<span class="tag">${escapeHtml(label)}</span>`)
      .join('');
  }

  function renderParagraphs(text) {
    if (!text) return '';
    return text
      .split(/\n\n+/)
      .map((p) => `<p>${escapeHtml(p.trim())}</p>`)
      .join('');
  }

  function renderSources(sources) {
    if (!sources || !sources.length) return '';
    const items = sources
      .map((s) => {
        const title = escapeHtml(s.title || s.url);
        const url = s.url ? escapeHtml(s.url) : '';
        return url
          ? `<li><a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a></li>`
          : `<li>${title}</li>`;
      })
      .join('');
    return `<div class="entry-block"><h4>Источники</h4><ul class="sources">${items}</ul></div>`;
  }

  function renderNextSteps(steps) {
    if (!steps || !steps.length) return '';
    const items = steps.map((s) => `<li>${escapeHtml(s)}</li>`).join('');
    return `<div class="entry-block"><h4>Дальше</h4><ul class="next-steps">${items}</ul></div>`;
  }

  function renderTools(tools) {
    if (!tools || !tools.length) return '';
    const tags = tools.map((t) => `<span class="tag tag-tool">${escapeHtml(t)}</span>`).join('');
    return `<div class="entry-block entry-tools">${tags}</div>`;
  }

  function matchesFilters(entry) {
    const area = filterArea.value;
    if (area && (!entry.areas || !entry.areas.includes(area))) return false;
    const q = (filterQuery.value || '').trim().toLowerCase();
    if (!q) return true;
    const hay = [
      entry.topic,
      entry.summary,
      entry.content,
      entry.insight,
      ...(entry.nextSteps || []),
      ...(entry.toolsMentioned || [])
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return hay.includes(q);
  }

  function render() {
    const entries = typeof DIARY_ENTRIES !== 'undefined' ? DIARY_ENTRIES : [];
    const filtered = entries.filter(matchesFilters);

    countEl.textContent = filtered.length;
    listEl.innerHTML = '';

    if (!filtered.length) {
      emptyEl.hidden = false;
      return;
    }
    emptyEl.hidden = true;

    filtered.forEach((entry) => {
      const article = document.createElement('article');
      article.className = 'entry';
      article.setAttribute('data-id', entry.id || '');

      const summaryBlock = entry.summary
        ? `<p class="entry-summary">${escapeHtml(entry.summary)}</p>`
        : '';
      const insightBlock = entry.insight
        ? `<blockquote class="insight">${escapeHtml(entry.insight)}</blockquote>`
        : '';

      article.innerHTML = `
        <header class="entry-header">
          <h2 class="entry-topic">${escapeHtml(entry.topic || 'Без темы')}</h2>
          <div class="entry-meta">
            <time datetime="${escapeHtml(entry.date || '')}" class="entry-date">${formatDate(entry.date)}</time>
            <div class="entry-tags">${areaLabels(entry.areas)}</div>
          </div>
        </header>
        ${summaryBlock}
        ${insightBlock}
        <div class="entry-body">${renderParagraphs(entry.content)}</div>
        ${renderTools(entry.toolsMentioned)}
        ${renderNextSteps(entry.nextSteps)}
        ${renderSources(entry.sources)}
      `;
      listEl.appendChild(article);
    });
  }

  function fillAreaFilter() {
    if (typeof DIARY_FOCUS_AREAS === 'undefined') return;
    const frag = document.createDocumentFragment();
    const all = document.createElement('option');
    all.value = '';
    all.textContent = 'Все области';
    frag.appendChild(all);
    Object.keys(DIARY_FOCUS_AREAS).forEach((key) => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = DIARY_FOCUS_AREAS[key].label;
      frag.appendChild(opt);
    });
    filterArea.appendChild(frag);
  }

  fillAreaFilter();
  filterArea.addEventListener('change', render);
  filterQuery.addEventListener('input', render);
  render();
})();
